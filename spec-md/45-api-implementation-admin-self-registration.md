# 45 - Admin self-registration: register form, email confirmation page and Google sign-in

Screens: `/register` (the design of 2026-11-13, now connected), `/verify-email` (new), `/login` (Google button added) and Admin Users (shows self-registered accounts, section 8).

Backend contract: `backend/seniorproject/spec-md/61-implement-admin-self-registration-google-email.md` (backend spec file 61). This spec does not change backend Java code.

## 1. Objective

A staff member with an `@rsu.ac.th` address can get an admin account without a Super Admin, in two ways:

1. **Form.** Fill in the register form, open the link in the email, then sign in with email and password.
2. **Google.** Press the Google button and choose the university Google account. The first time creates the account, every later time signs in.

Both ways accept only `@rsu.ac.th`. The backend decides; the admin web only shows the rule early and explains a refusal.

## 2. Routes and permissions

| Route | Page | Who |
|---|---|---|
| `/register` | `src/pages/auth/RegisterPage.jsx` | Public. A signed-in admin is sent to `/admin/dashboard`, like on `/login`. |
| `/verify-email?token=...` | `src/pages/auth/VerifyEmailPage.jsx` | Public. This is the address of the link in the email (`ADMIN_REGISTRATION_VERIFICATION_URL` of the backend). |
| `/login` | `src/pages/auth/LoginPage.jsx` | Public (unchanged), with the Google button under **Sign In**. |

None of the three needs a role. The four endpoints below are public and ignore an `Authorization` header.

## 3. Backend APIs

`apiClient` already points at `/api/v1/admin`; the service uses paths that start with `/auth/`.

| Use | Request | Success |
|---|---|---|
| Register | `POST /auth/register` `{ firstName, lastName, email, phoneNumber?, password, confirmPassword }` | `202 { email, message }`, the same for every `@rsu.ac.th` address |
| Confirm the email | `POST /auth/verify-email` `{ token }` | `200 { email, accountStatus: "ACTIVE", message }` |
| New link | `POST /auth/resend-verification` `{ email }` | `202 { email, message }`, always |
| Google | `POST /auth/google` `{ idToken }` | `200` with exactly the body of `/auth/login` |

- `/register` refuses unknown fields, so the terms checkbox is not sent. `phoneNumber` is left out when it is empty.
- The email is sent trimmed and in lower case.
- Error body: `timestamp`, `status`, `code`, `message`, `path`, `traceId`. The admin web reads `status` and `code` only.

## 4. Settings

Vite reads these at build time. None of them is a secret.

| Variable | Default | Meaning |
|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | empty | The OAuth 2.0 Web client ID, the same value as `GOOGLE_OAUTH_CLIENT_ID` of the backend. Empty: the Google button is the old design-only button and a click says that Google sign-in is not set up. |
| `VITE_ADMIN_EMAIL_DOMAIN` | `rsu.ac.th` | The domain named in the texts and checked in the form before sending. The same value as `ADMIN_REGISTRATION_EMAIL_DOMAIN`. |
| `VITE_GOOGLE_HOSTED_DOMAIN` | empty | The Google Workspace domain offered in Google's account list. Empty: the same as `VITE_ADMIN_EMAIL_DOMAIN`. The same value as `GOOGLE_OAUTH_HOSTED_DOMAIN`. |

- `npm run dev`: put them in the frontend `.env`.
- Docker Compose: the image is built by the `admin-web` service of the backend `compose.yaml`. It passes the three values from the backend `.env` as build arguments (`VITE_GOOGLE_CLIENT_ID: ${GOOGLE_OAUTH_CLIENT_ID:-}` and so on), and the frontend `Dockerfile` declares them as `ARG` / `ENV`. One client ID in the backend `.env` serves both sides. A changed value needs `docker compose up -d --build admin-web`.
- `src/utils/authConfig.js` is the only file that reads them. A domain that is not a plain host name falls back to the default.

## 5. Register page

Layout as before (`AuthLayout`, one white card, "Already have an account? Sign in" under it).

### 5.1 Form

| Field | Rule (checked in the browser, the backend checks again) |
|---|---|
| First name, Last name | Required, at most 100 characters. Side by side from the `sm` width, stacked on a phone. |
| Email address | Required, at most 255 characters, exactly one `@`, the part before it uses `a-z 0-9 . _ % + -` without a dot at the start or end and without two dots in a row, and the part after it is exactly `rsu.ac.th`. Capital letters are accepted and sent in lower case. |
| Phone number (optional) | At most 30 characters; digits, spaces and `+ ( ) -`; at least one digit. |
| Password | At least 15 characters, at most 72 UTF-8 bytes, no NUL. A line under the field says "At least 15 characters." |
| Confirm password | Equal to the password. |
| "I agree to the Terms of Use and Privacy Policy" | Must be ticked. Checked in the browser only. |

Field messages: "First name is required.", "Last name is required.", "Email is required.", "Please enter a valid email address.", "Use your @rsu.ac.th email address.", "Enter a valid phone number.", "Use at most N characters.", "Password is required.", "Use at least 15 characters.", "Use a shorter password (at most 72 bytes).", "Please confirm your password.", "Passwords do not match.", "Please accept the terms to continue."

### 5.2 Submit

1. Invalid form: the messages appear under the fields, nothing is sent, and the first wrong field gets the focus.
2. Valid form: **Create Account** shows a spinner and "Creating account..." and cannot be pressed again; a second submit is ignored, so exactly one `POST /auth/register` is sent.
3. `202`: the card changes to **Check your email** (5.3). The two passwords are cleared from memory.
4. Error: the form stays filled in and shows the message of 5.4.

### 5.3 Check your email

- Text: "If **<email>** can be registered, we have sent an email to it. Open the link in that email to finish your registration. Then you can sign in."
- The text is the same whether or not the address already has an account (the backend does not tell, and the page must not either).
- **Send the email again**: `POST /auth/resend-verification` with the same address. Then the note "We have sent the email again, if this address can be registered. Only the newest link works." A `429` shows "Too many emails for this address. Please wait a minute and try again."
- **Use a different email**: back to the form with the names, the email and the phone number still filled in. The two passwords are empty.
- A line says "No email after a few minutes? Look in the spam folder first."
- The way to `/login` is the link "Already have an account? Sign in" under the card, as on the form.
- The heading gets the keyboard focus, so a screen reader reads the new state.

### 5.4 Errors of `POST /auth/register`

| Case | Where | Text |
|---|---|---|
| No answer from the server | Red box | Unable to connect to the server. Please try again. |
| `400 EMAIL_DOMAIN_NOT_ALLOWED` | Email field | Only @rsu.ac.th email addresses can register. |
| `400 PASSWORD_POLICY_VIOLATION` | Password field | Use at least 15 characters and at most 72 bytes. |
| `400 PASSWORD_CONFIRMATION_MISMATCH` | Confirm field | Passwords do not match. |
| `400 VALIDATION_ERROR`, any other `400` | Red box | Please check the entered values. |
| `403 REGISTRATION_DISABLED` | Red box | Registration is closed. Please contact IT Support. |
| `429` | Red box | Too many attempts. Please wait a minute and try again. |
| `503 REGISTRATION_UNAVAILABLE`, any `5xx` | Red box | Registration is not available right now. Please try again later. |
| Anything else | Red box | Unable to register. Please try again. |

A server `message` is never shown as it is (project rule since specs 41 to 44).

## 6. Email confirmation page (`/verify-email`)

The page reads `token` from the address and sends it once.

| State | When | Shows |
|---|---|---|
| Loading | The request is running | Spinner, "Confirming your email address..." |
| Confirmed | `200` | "Your email is confirmed", "You can now sign in with **<email>** and your password." and the button **Go to sign in** |
| Link does not work | No `token`, a `token` longer than 128 characters, or any `400` | "This link does not work", the reason in one sentence (expired, replaced by a newer link, or already used), an email field with **Send a new link**, and **Go to sign in** |
| Try again | No answer, `429`, any `5xx` | "We could not confirm your email", "Your link is still good.", the button **Try again** (sends the same token again) |

- **Send a new link** checks the email like the register form, sends `POST /auth/resend-verification` and then shows "If this address has a registration that is not finished, a new link is on its way. Only the newest link works." Errors: `400` "Please enter a valid email address." under the field, `429` "Too many emails for this address. Please wait a minute and try again.", anything else "Unable to send the email right now. Please try again."
- The token is sent once per page load, also in React StrictMode (which runs effects twice in development). Without that the second request would fail, because a link works one time, and the page would show "does not work" for a confirmation that went through.
- Opening a used link again shows "This link does not work". That is correct: the text says that a person who already confirmed can sign in.

## 7. Google sign-in button

Shown on `/login` ("Sign in with Google") and on `/register` ("Sign up with Google"), under an "Or" line inside the card.

- The button is Google's own button from Google Identity Services (`https://accounts.google.com/gsi/client`, `google.accounts.id.renderButton`): outline theme, large, pill shape, logo in the middle, English text, as wide as the card (at most 400 px, Google's limit).
- `google.accounts.id.initialize` is called one time per page load with `client_id`, a `callback`, `ux_mode: "popup"`, `auto_select: false` and `hd` (the hosted domain of section 4, so Google offers the university accounts). Google's reference says to call it only once; the login and the register page therefore share one call and the callback hands the answer to the button that is on the page.
- Flow: click, Google's window, choose the account, Google gives the browser an ID token (`response.credential`), the admin web posts it as `idToken` to `/auth/google`, stores the tokens exactly like after `/auth/login` and opens `/admin/dashboard`.
- While the token is checked, the button area shows a spinner and "Signing in with Google...", and the form is disabled.
- No client secret, no redirect page, no One Tap prompt.
- "Remember me" of the login page also applies to a Google sign-in from that page. The register page has no such box, so a Google sign-in from there ends when the browser is closed.
- States of the button area:

  | State | When | Shows |
  |---|---|---|
  | Loading | Google's script is on its way | Grey placeholder of the same height, "Loading Google sign-in..." |
  | Ready | Google has drawn its button | Google's button |
  | Busy | The ID token is being checked by the backend | Spinner, "Signing in with Google..." |
  | Not loaded | The script cannot be loaded (offline or blocked) | "Google sign-in could not be loaded. **Try again**" |
  | Not shown | Nothing with a height is in the button area 6 seconds after drawing (for example a content blocker hides it) | "Google sign-in is not available on this site address yet." The page keeps looking for 30 seconds and shows the button when it comes. |

- Google's script draws its button at once, before Google has checked the client ID and the address of the page. When Google does not accept one of them, the button is still there and a click opens **Google's own error window**. The admin web gets no answer in that case, so it shows no text of its own. Seen with a client ID that Google does not know: "Access blocked: Authorization Error. The OAuth client was not found. Error 401: invalid_client". An address that is missing under **Authorized JavaScript origins** is refused in the same window (Google names it `origin_mismatch`; not seen in the test, which has no real client ID).
- Google's button has a fixed width in pixels. It is drawn again when the card gets wider or narrower (for example a phone that is turned), at least 200 px and at most 400 px.

Errors of `POST /auth/google`, shown in the red box of the card:

| Case | Text |
|---|---|
| No answer from the server | Unable to connect to the server. Please try again. |
| `400`, `401 INVALID_GOOGLE_TOKEN`, an answer without tokens | Google sign-in failed. Please try again. |
| `403 GOOGLE_EMAIL_NOT_VERIFIED` | Google has not verified the email address of this account. |
| `403 EMAIL_DOMAIN_NOT_ALLOWED` | Only @rsu.ac.th Google accounts can sign in. Choose your university account. |
| `403 GOOGLE_ACCOUNT_NOT_IN_DOMAIN` | Use the Google account of your @rsu.ac.th university mailbox. A personal Google account cannot sign in. |
| `403 ACCOUNT_NOT_ACTIVE` | This account cannot sign in. Please contact IT Support. |
| `403 REGISTRATION_DISABLED` | Registration is closed. Please contact IT Support. |
| `409 GOOGLE_ACCOUNT_MISMATCH` | This account is linked to another Google account. Please contact IT Support. |
| `429` | Too many attempts. Please wait a minute and try again. |
| `503 GOOGLE_SIGN_IN_NOT_CONFIGURED` | Google sign-in is not set up on the server yet. |
| Any other `5xx` | Google sign-in is not available right now. Please try again later. |

**Sign up with Apple** stays a design-only button on the register page (the backend has no Apple sign-in). A click shows "Sign up with Apple is not available. Use the form or your university Google account."

### What Google needs

- The address of the admin web must be listed under **Authorized JavaScript origins** of the client ID. For local work Google asks for both `http://localhost` and `http://localhost:3000`.
- Google does not accept an IP address as an origin, so the button works on `localhost` and on a real domain, not on `http://<IP>:3000` from another device.
- No `Cross-Origin-Opener-Policy: same-origin` header on the pages (it breaks Google's window; `same-origin-allow-popups` is fine). `docker/admin-web.conf` and the Vite dev server set none.
- If a Content-Security-Policy is added later: `script-src https://accounts.google.com/gsi/client`, `frame-src` and `connect-src https://accounts.google.com/gsi/`, `style-src https://accounts.google.com/gsi/style`. There is none today.

## 8. Admin Users screen

A self-registered account has no employee ID, and a form registration waits with the status `PENDING_VERIFICATION` until the link is used.

- Employee ID `null` is shown as "—" in the table, in the details and in the CSV export (before, the export stopped with an error on such a row).
- `PENDING_VERIFICATION` is shown as "Unverified" (grey badge). It is not offered in the status filter or in the add form, because a Super Admin cannot set it.
- The edit form of an unverified account shows "Unverified" as its status (before, the box showed "Active" although nothing was chosen, and **Update Admin User** answered "Select a valid account status." with no way to choose "Active"). Saving needs one of Active, Inactive, Locked or Suspended, because the backend accepts only these in `PUT /users/{id}`. Choosing **Active** lets the person sign in without the email link; that is the Super Admin's decision.
- Editing a self-registered account asks for an employee ID, as for every account.

## 9. Files

| File | Change |
|---|---|
| `src/utils/authConfig.js` | New. The three settings of section 4. |
| `src/utils/adminRegistration.js` | New. Form check, request body, token check and all error texts of sections 5 to 7. No React. |
| `src/utils/googleIdentity.js` | New. Loads Google's script once, initializes once, draws the button. No React. |
| `src/services/authService.js` | `register`, `verifyEmail`, `resendVerification`, `googleSignIn`. |
| `src/context/AuthContext.jsx` | `loginWithGoogle({ idToken, rememberMe })`; it stores the session with the same code as `login`. |
| `src/components/auth/RegisterForm.jsx` | Connected form and the **Check your email** state. |
| `src/components/auth/RegistrationSent.jsx` | New. The **Check your email** card content. |
| `src/components/auth/GoogleSignInButton.jsx` | New. The Google button with its loading and error states. |
| `src/components/auth/EmailVerification.jsx` | New. The card of section 6 with its four states and the **Send a new link** form. |
| `src/components/auth/SocialAuthButtons.jsx` | Google's real button when a client ID is set, the design-only buttons otherwise; buttons under each other. |
| `src/components/auth/LoginForm.jsx` | The "Or" line and the Google button under **Sign In**. |
| `src/components/ui/Input.jsx` | Optional `hint` line under a field. |
| `src/pages/auth/RegisterPage.jsx` | Sends a signed-in admin to the dashboard; opens the dashboard after a Google sign-up. |
| `src/pages/auth/VerifyEmailPage.jsx` | New. Reads `token` from the address and shows the card of section 6. |
| `src/routes/AppRoutes.jsx` | Route `/verify-email`. |
| `src/types/adminUser.ts`, `src/services/userService.d.ts`, `src/components/users/AdminUsersContent.tsx` | Section 8: "—" for a missing employee ID, "Unverified". |
| `src/utils/addAdminUser.ts`, `src/components/users/AddAdminUserContent.tsx` | Section 8: the status box of the edit form (`accountStatusChoices`). |
| `Dockerfile`, `.env.example`, `README.md` | The settings of section 4. |
| `tests/admin-registration.test.cjs` | New tests. |
| Backend folder: `compose.yaml` | Three build arguments for `admin-web` (section 4). No Java code. |

## 10. Choices not given by the request

| Topic | Choice | Why |
|---|---|---|
| Name fields | First name and Last name instead of one Full name | The backend stores and asks for both. Splitting one field by a space would guess wrong for many names. |
| Phone number | Added as an optional field | The backend accepts it and Admin Users shows it. |
| Password length | 15 instead of 8 | The password rule of the backend. |
| Google button look | Google's own button, not the custom button of the design | Google's popup that returns an ID token starts only from the button Google draws. It cannot take the 2-column size of the design, so the buttons are under each other. |
| Google button on the login page | Added | An account made with Google has no password, so without it that person could never sign in again. |
| Apple button | Kept, design only, on the register page only | Not part of this request and the backend has no Apple sign-in. |
| Texts of refusals | Fixed texts by error code | Project rule; the texts say the same as the backend messages. Backend spec 61 section 15 said "show the message"; the meaning is shown, not the server string. |
| Check of the email domain in the browser | Yes | The rule is public and the person sees it before sending. The backend still decides. |
| Link in the address bar | The token stays in the address | Removing it would show "does not work" after a reload of a confirmed page as well, with one more step of code. |

## 11. Known limits

- Google sign-in cannot be tried without a real Google account of the university and the real client ID. The browser test replaces Google's script and uses test tokens that the backend checks with a test key. Google's real script was loaded once with a made-up client ID, to see that the button is drawn as described.
- The admin web cannot tell that Google refuses the client ID or the address of the page (section 7); the person sees Google's error window.
- A person who signs in with Google has no password and cannot set one (backend spec 61 section 9).
- No Thai texts.
- The **Check your email** card has no countdown; the backend allows 3 emails a minute for one address and the page explains a `429`.
- The status filter of Admin Users cannot list unverified registrations (the API can: `accountStatus=PENDING_VERIFICATION`).
- The terms are plain text, not links, as in the design.

## 12. Acceptance checks

1. `npm run lint`, `npx tsc --noEmit`, `node --test tests/*.test.cjs` and `npm run build` pass.
2. Register with an `@rsu.ac.th` address: the card shows **Check your email** and a mail with a link arrives.
3. Signing in before the link is used fails with "Invalid email or password."
4. The link opens `/verify-email`, shows "Your email is confirmed", and the sign-in works afterwards.
5. The same link a second time shows "This link does not work"; **Send a new link** answers with the neutral note.
6. An address of another domain is stopped in the form with "Use your @rsu.ac.th email address."; a password of 14 characters with "Use at least 15 characters."
7. The Google button with a university account opens the dashboard; the second time it signs in the same account.
8. A Google account that is not of the university shows the text of `EMAIL_DOMAIN_NOT_ALLOWED` or `GOOGLE_ACCOUNT_NOT_IN_DOMAIN` and nobody is signed in.
9. Without `VITE_GOOGLE_CLIENT_ID` the pages still work and the Google button says that it is not set up.
10. Admin Users lists a self-registered account with "—" as employee ID, shows "Unverified" for a registration that waits for its link, and the CSV export works. The edit form of such an account shows "Unverified" and saves after an employee ID and a status were chosen.
11. The login with email and password works as before.
