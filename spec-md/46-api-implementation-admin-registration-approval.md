# 46 - Admin self-registration: waiting for approval, Approve and Reject

Changes spec 45. Backend: spec file 62, decision D87.

## 1. Request

Hsu, 2026-11-17: staff and students share the `@rsu.ac.th` domain. Hsu chose the approval step: anyone at `@rsu.ac.th` can register (form or Google), but the account cannot sign in until the admin team approves it, and on approval the person gets an email. The admin web has to tell the person that the registration waits, and give the Super Admin a way to approve or reject it.

## 2. Backend contract used

| Call | Answer |
| --- | --- |
| `POST /auth/verify-email` | `200 { email, accountStatus: "PENDING_APPROVAL", message }` |
| `POST /auth/google`, first sign-in or still waiting | `403 { code: "ACCOUNT_PENDING_APPROVAL" }`, no tokens |
| `POST /auth/login`, waiting account, right password | `403 { code: "ACCOUNT_PENDING_APPROVAL" }` (wrong password: `401` as before) |
| `GET /users?accountStatus=PENDING_APPROVAL` | the waiting registrations (also `PENDING_VERIFICATION`) |
| `POST /users/{id}/approve` | `200` user detail (status `ACTIVE`); the backend mails "Your account is approved" |
| `POST /users/{id}/reject` | `204`; the account is deleted; the backend mails "Your registration was not approved" if the email was confirmed |
| approve / reject of an account that does not wait | `409 REGISTRATION_NOT_PENDING`; unknown or deleted: `404 USER_NOT_FOUND` |
| `PUT /users/{id}`, `PATCH /users/{id}/status` with another status than the pending one | `409 REGISTRATION_DECISION_REQUIRED` |

All mails are sent by the backend. The admin web sends none.

## 3. Public pages

### 3.1 Check your email (after the form, spec 45 section 5.3)

Text: "If **email** can be registered, we have sent an email to it. Open the link in that email to confirm your address. Then the admin team checks your registration, and we email you when you can sign in."

### 3.2 `/verify-email`, confirmed

- Heading "Your email is confirmed".
- Text: "Your registration is now waiting for approval by the admin team. We will email **email** when it is approved. Then you can sign in with your password."
- Button **Go to sign in** stays.
- "This link does not work": the sentence "If you already confirmed your email, you can sign in." becomes "If you already confirmed your email, wait for the email that your registration is approved."

### 3.3 Google on `/register`

`403 ACCOUNT_PENDING_APPROVAL` is not an error here: the registration worked. The card changes to **Registration received** (new component `RegistrationWaiting.jsx`): "Google has confirmed your university account. The admin team checks every registration. We will email you when it is approved. Then use "Sign in with Google" on the sign-in page." Button **Go to sign in**.

### 3.4 `/login`, password or Google

`403 ACCOUNT_PENDING_APPROVAL` shows a notice in the neutral (not red) style, `role="status"`: "Your registration is waiting for approval by the admin team. We will email you when it is approved." Every other answer stays as before.

## 4. Admin Users

### 4.1 Status names

| `accountStatus` | Shown as | Badge |
| --- | --- | --- |
| `PENDING_APPROVAL` | Waiting for approval (the table badge says "Waiting", with the full name as tooltip and for screen readers, so it stays on one line) | amber |
| `PENDING_VERIFICATION` | Unverified | grey (as before) |

The status filter offers the four settable statuses and then **Waiting for approval** and **Unverified**.

### 4.2 Waiting registrations

When registrations wait, a line above the filters says "**n** registration(s) waiting for approval" with a button **Show**, which sets the status filter to Waiting for approval. The number is `totalElements` of `GET /users?accountStatus=PENDING_APPROVAL&size=1`, loaded again whenever the list is loaded again. On an error, or when nothing waits, the line is not shown.

### 4.3 Details window

- `PENDING_APPROVAL`: a note "This person registered with an @rsu.ac.th address and confirmed it. Approve to let them sign in, or reject the registration." Buttons **Approve**, **Reject**, **Edit**, **Delete**.
- `PENDING_VERIFICATION`: a note "This person has not confirmed the email address yet." Buttons **Reject**, **Edit**, **Delete** (approve is not possible before the email is confirmed).
- **Approve** asks first: "Approve registration?" with name, email and role, and "They can sign in as **role** and get an email. To give another role, use Edit first." After `200`: the details show the new status, the list and the waiting count load again, message "**name** is approved and gets an email."
- **Reject** asks first: "Reject registration?" "The account of **name** (email) is deleted, and this email address cannot register again." plus "They get an email that the registration was not approved." (waiting) or "No email is sent, because the address was never confirmed." (unverified). After `204`: the window closes, the list and the count load again, message "The registration of **name** was rejected."
- Errors in the confirm window, fixed texts by code: `REGISTRATION_NOT_PENDING` "This registration was already approved or rejected." (the details are loaded again), `USER_NOT_FOUND` "User not found.", others as `apiErrorMessage`.

### 4.4 Edit form

For a `PENDING_*` account the Account Status select holds only the current status and is disabled, with the hint "Approve or reject this registration in the user details." The `PUT` sends that status unchanged, so the employee ID, name and role can be entered before approving. `validateAdminForm` accepts a pending status only when it is the loaded status of the account.

## 5. Files

| File | Change |
| --- | --- |
| `src/services/userService.js`, `.d.ts` | `approveUser(id)`, `rejectUser(id)` |
| `src/types/adminUser.ts` | label `PENDING_APPROVAL`, `accountStatusFilters`, `isRegistrationStatus` |
| `src/utils/addAdminUser.ts` | `accountStatusChoices`, `validateAdminForm(..., { currentStatus })` |
| `src/utils/apiError.ts` | `REGISTRATION_NOT_PENDING`, `REGISTRATION_DECISION_REQUIRED` |
| `src/utils/adminRegistration.js` | `isPendingApproval`, `PENDING_APPROVAL_NOTICE`; `googleSignInFailure` knows the code |
| `src/components/users/AdminUsersContent.tsx`, `AdminUsersTable.tsx`, `AddAdminUserContent.tsx` | sections 4.1 to 4.4 |
| `src/components/auth/LoginForm.jsx`, `RegisterForm.jsx`, `RegistrationSent.jsx`, `EmailVerification.jsx`, new `RegistrationWaiting.jsx` | section 3 |
| `tests/admin-registration-approval.test.cjs` (new), `tests/admin-registration.test.cjs` | section 6 |

## 6. Tests

- `isPendingApproval` only for `403 ACCOUNT_PENDING_APPROVAL`; the Google text for it.
- `approveUser` / `rejectUser` post to the right paths and refuse a bad ID without a request.
- Labels and filter options; `accountStatusChoices` locks a pending status; `validateAdminForm` accepts a pending status only as the loaded status.
- Error texts of the two new codes.
- A browser run against the backend: form registration, waiting notice on login, approve, sign-in; Google registration card; reject.

## 7. Choices not given by the request

| Topic | Choice | Why |
| --- | --- | --- |
| Where Approve and Reject are | In the details window, not in the table row | The table keeps its design; the details show who registered. |
| Confirm before approving | Yes, with the role | The approval sends a mail that cannot be taken back; the confirm shows the role the person gets. |
| Waiting count | On Admin Users only | The backend has no count endpoint; the list call with `size=1` gives it. No menu badge. |
| Google registration on `/register` | "Registration received" card, not a red error | The person did everything right. |
