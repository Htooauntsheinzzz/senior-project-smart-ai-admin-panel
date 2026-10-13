# 17 — Faculties CRUD API Integration Specification

## 1. Purpose

Connect the existing **Faculties** frontend to the existing backend for create, read, update, and delete operations. Preserve the approved Figma design and reuse the current application architecture.

This document specifies implementation work for Codex, Claude, OpenCode, or another coding agent. Creating this document does not authorize changes to backend code or implementation of new backend endpoints.

| Item | Requirement |
| --- | --- |
| Application | Smart AI University Student Assistant — Admin Web |
| Module | Academic Management → Faculties |
| Stack | React + Vite + Tailwind CSS + Axios + React Router |
| Existing module language | TypeScript/TSX components, with a JSX page adapter |
| Existing screen | `/admin/faculties` |
| Existing Add Faculty state | `/admin/faculties?add=1` |
| Scope | Frontend API integration and CRUD behavior only |
| Design reference | `spec-md/10-faculties.md` and the existing implementation |
| Example integration specification | `spec-md/16-api-implmentation-adminusers.md` |

Follow existing file languages and conventions. Do not convert working TSX components to JSX just because the stack is described as React/JavaScript.

---

## 2. Non-Negotiable Rules

### 2.1 Preserve the existing Figma/UI design

Do not change:

- Page hierarchy, sidebar, navbar, branding, or navigation layout.
- Fonts, colors, spacing, borders, shadows, icons, and responsive breakpoints.
- Table column order, table layout, search appearance, or summary-card placement.
- Add Faculty drawer width, header/body/footer structure, field order, or button appearance.
- Active/Inactive radio styling or table status badges.
- Modal styling, keyboard access, focus restoration, or scroll behavior.

Add loading, validation, error, and success behavior within the existing components and styles. Do not introduce a new design system, notification library, form framework, or table library.

### 2.2 Frontend only

Do not modify:

```text
Backend controllers, services, repositories, entities, DTOs, or mappers
Backend APIs, routes, validation, authorization, or authentication
Database records directly, schema, Flyway migrations, or seed data
CORS, security configuration, JWT behavior, Redis, or session policies
```

Backend source may be inspected read-only to establish the actual contract. Do not change the backend to match an example in this document.

Do not bypass authentication to demonstrate a protected screen. Do not create a second API client or authentication system.

### 2.3 No fabricated production data

After a screen is connected, its records must come from the API. A failed request must not silently fall back to `initialFaculties`, fabricated IDs, invented totals, or local success behavior.

Do not hardcode the sample faculty or submit it automatically on page load.

---

## 3. Existing Frontend Inventory

Inspect these files before implementation:

| File | Current responsibility | Required integration work |
| --- | --- | --- |
| `src/pages/faculties/FacultiesPage.jsx` | Authenticated layout adapter and `?add=1` drawer state | Preserve layout and existing navigation behavior |
| `src/components/faculties/FacultiesContent.tsx` | Demo list, search, summary cards, creation callback, actions placeholder | Replace local data flow with API state and actual CRUD actions |
| `src/components/faculties/FacultyTable.tsx` | Faculty table and row-action trigger | Preserve columns/styles; accept loading/error/empty states as needed |
| `src/components/faculties/AddFacultyDrawer.tsx` | Required fields, status radio group, dirty-close confirmation | Await API submission; optionally reuse in edit mode |
| `src/types/faculty.ts` | UI faculty/input models | Add API types or adapt UI types without confusing UI names with request keys |
| `src/utils/faculties.ts` | Local filtering, totals, validation, demo creation | Separate validation/mapping from demo mutation logic |
| `src/data/faculties.ts` | Reference/demo fixtures | Remove from the connected module's runtime data source |
| `src/api/apiClient.js` | Central Axios client and interceptors | Reuse unchanged |
| `src/api/apiClient.d.ts` | API client type declaration | Reuse |
| `src/routes/AppRoutes.jsx` | Protected routes | Preserve existing Faculties route protection |
| `src/components/ui/Modal.tsx` | Shared dialog | Reuse for details/actions and deletion confirmation |
| `src/components/ui/Drawer.tsx` | Shared drawer utility | Reuse only if behavior and rendered design remain identical |

Current UI model:

```ts
type FacultyStatus = 'active' | 'inactive'
type FacultyInput = {
  code: string
  nameEn: string
  nameTh: string
  status: FacultyStatus
}
type Faculty = FacultyInput & {
  id: string
  departmentCount: number
  studentCount: number
}
```

The existing local ID type and zero-valued demo counts are not evidence of backend ID types or response fields.

Do not delete shared fixtures or helpers merely because Faculties stops using them. Search their consumers first; Departments, Programs, Courses, or other local-demo screens may still depend on them.

---

## 4. Confirmed Request Payload

The user supplied this faculty request structure:

```json
{
  "facultyCode": "FAC-ENG",
  "facultyNameEn": "Faculty of Engineering",
  "facultyNameTh": "คณะวิศวกรรมศาสตร์",
  "isActive": true
}
```

Use these exact request keys:

```text
facultyCode
facultyNameEn
facultyNameTh
isActive
```

Do not send UI aliases such as `code`, `nameEn`, `nameTh`, or `status` as API keys.

Do not add UI-only fields, counts, an invented ID, timestamps, or audit properties to the request.

The sample confirms the submitted field names and sample value types. It does **not** establish endpoint paths, ID types, list response shape, update semantics, maximum lengths, uniqueness policy, or optional Thai-name serialization.

---

## 5. Mandatory API Contract Discovery

Before implementing requests, inspect the actual existing API documentation, OpenAPI schema, backend controller/DTO source read-only, or authenticated response examples.

At the time of the preceding Admin User integration, the inspected backend exposed authentication and admin-user controllers only. This is historical context, not proof that a Faculty API exists now. Recheck the current backend.

Record the following findings in `spec-md/00-changes-and-decisions.md`:

| Contract item | Evidence required |
| --- | --- |
| Create method/path | Existing endpoint and request DTO |
| List method/path | Existing endpoint, response wrapper, collection location |
| Detail method/path | Existing endpoint and authoritative ID type |
| Update method/path | PUT/PATCH semantics and supported request fields |
| Delete method/path | Existing endpoint, success status/body, rejection conditions |
| ID | Response property, numeric/string/UUID format |
| Request validation | Required fields, limits, code constraints, Thai-name blank/null rules |
| `isActive` | Boolean input/output, whether writable during edit |
| Search | Supported parameter, fields searched, pagination interaction |
| Pagination | Parameter names, zero/one-based pages, size limits, metadata |
| Sorting | Supported fields/directions, if any |
| Counts | Department/student counts, aggregate totals, or absence |
| Errors | Status codes, error-code vocabulary, field-error shape |
| Permissions | Existing requirements for read/create/update/delete |

### 5.1 Candidate endpoints — not a verified contract

If the existing backend actually uses conventional Faculty CRUD routes, the integration may be:

```http
POST   /api/v1/admin/faculties
GET    /api/v1/admin/faculties
GET    /api/v1/admin/faculties/{id}
PUT    /api/v1/admin/faculties/{id}
DELETE /api/v1/admin/faculties/{id}
```

These are examples only. Use existing endpoint names and methods even if they differ. Do not probe destructive methods against real records merely to discover a contract.

### 5.2 Missing or incompatible API

If an operation is missing:

1. Identify the exact unavailable operation and evidence.
2. Complete independently supported frontend work.
3. Keep unsupported actions honest: show an unavailable explanation using existing UI.
4. Do not invent an endpoint, run direct database mutations, or simulate persistent success.
5. Report the blocker and the contract information needed from the backend owner.

A blocked operation must not be marked as completed in the acceptance checklist.

---

## 6. Authentication and API Client

Reuse `src/api/apiClient.js` and the existing authentication architecture described in `spec-md/04-authentication.md`.

Current central client behavior:

```text
VITE_API_BASE_URL + /api/v1/admin
Content-Type: application/json
Existing request interceptor attaches Authorization: Bearer <access token>
Existing response interceptor handles 401 through the registered auth handler
```

Do not:

- Duplicate `/api/v1/admin` in a relative service URL.
- Create another Axios instance for Faculties.
- Read tokens in table/form components.
- Add manual Authorization headers in every service function.
- Change login, token storage, token refresh, or logout behavior.
- Install a Faculty-specific 401 redirect interceptor.

Request flow:

```text
Faculty component → facultyService → apiClient → existing auth interceptor
                 → existing Faculty API → response adapter → UI state
```

---

## 7. Service and Adapter Structure

Create or reuse one Faculty service, following project conventions:

```text
src/services/facultyService.ts
```

A JavaScript service with a `.d.ts` declaration is also acceptable if it follows the established service pattern. Do not create both competing implementations.

Required public operations, only when supported by the verified API:

```ts
createFaculty(payload)
getFaculties(params, options?)
getFacultyById(id, options?)
updateFaculty(id, payload)
deleteFaculty(id)
```

Use an optional Axios `signal` for read cancellation if consistent with the current client. An equivalent request-generation/cancelled-effect guard is acceptable for suppressing stale results.

Example structure after paths are confirmed:

```ts
import apiClient from '../api/apiClient'

export async function createFaculty(payload: CreateFacultyPayload) {
  const response = await apiClient.post('/faculties', payload)
  return response.data
}

export async function deleteFaculty(id: FacultyId) {
  const response = await apiClient.delete(`/faculties/${encodeFacultyId(id)}`)
  // A verified 204 response has no JSON body to parse.
  return response.data
}
```

`CreateFacultyPayload`, `FacultyId`, and `encodeFacultyId` must be defined from the verified contract. This example does not authorize guessing their behavior.

Keep HTTP calls out of presentational table rows and shared input components. Centralize payload mapping and response normalization rather than repeating them across create/edit/list screens.

---

## 8. Request Mapping and Boolean Handling

| Existing UI value | API request field | Mapping |
| --- | --- | --- |
| `code` | `facultyCode` | Trim outer whitespace |
| `nameEn` | `facultyNameEn` | Trim outer whitespace |
| `nameTh` | `facultyNameTh` | Preserve Thai text; blank handling follows contract |
| `status === 'active'` | `isActive` | Boolean `true` |
| `status === 'inactive'` | `isActive` | Boolean `false` |

Mapping example, **only if the API accepts an empty string for the optional Thai name**:

```ts
function buildCreateFacultyPayload(value: FacultyInput) {
  return {
    facultyCode: value.code.trim(),
    facultyNameEn: value.nameEn.trim(),
    facultyNameTh: value.nameTh.trim(),
    isActive: value.status === 'active',
  }
}
```

If the API instead requires `null` for an absent Thai name, use actual `null`. If Thai name is required, reject blank input. Do not infer nullability from the sample payload alone.

Never send:

```json
{ "isActive": "false" }
```

Do not use `Boolean("false")`; it evaluates to `true`.

Preserve explicit `false`. Avoid fallback expressions such as `response.isActive || true`.

Do not uppercase codes, strip Thai characters, collapse internal whitespace, or alter Unicode normalization unless required by the documented backend contract.

---

## 9. Response Mapping and Missing Data

Map the actual API response to the existing UI model in one adapter.

Potential mapping, subject to verified response names:

| API response | UI field |
| --- | --- |
| Actual server ID | `id` |
| `facultyCode` | `code` |
| `facultyNameEn` | `nameEn` |
| `facultyNameTh` | `nameTh` |
| `isActive === true` | `status: 'active'` |
| `isActive === false` | `status: 'inactive'` |
| Verified department count | `departmentCount` |
| Verified student count | `studentCount` |

Do not turn absent or malformed `isActive` into an Active account silently. Treat a required-field shape mismatch as a safe response-contract error.

Do not assume the list is always `response.data`, `response.data.data`, or `response.data.content`. Select the one verified shape. A malformed response is an error, not an empty collection.

### 9.1 Department and student counts

The existing UI displays counts. The supplied request has no count fields.

- Use verified count fields or a verified aggregate endpoint if available.
- Do not assign zero because a field is missing.
- Preserve actual zero when the backend returns zero.
- If unavailable, display `—` within the existing cell/card and document the missing API data.
- Adapt UI count types to `number | null` if necessary; do not use a misleading numeric default.
- Avoid one extra request per faculty merely to reconstruct counts unless an existing documented API explicitly supports this approach and its cost is acceptable.

### 9.2 Summary-card scope

Preserve the existing **Total Faculties**, **Active Faculties**, and **Total Departments** cards.

- A verified full-list response can supply totals by aggregation.
- A paginated response supplies only a page; do not label page-local counts as catalog-wide totals.
- Use verified server aggregate metadata/endpoints for full totals when provided.
- If a total is unavailable, keep its card and show `—` with concise explanatory feedback using existing styles.
- Define whether totals describe all records or filtered records. Prefer existing full-directory semantics when supported; document any API-imposed limitation.

---

## 10. Routes and Reuse of Existing UI

Keep `/admin/faculties` protected and preserve `?add=1` as the existing Add Faculty open state.

Do not replace the adjacent drawer workflow with a full-page create form.

For detail/edit/delete:

- Use the existing row-action trigger.
- Replace its unavailable placeholder with the supported actions, using existing button/menu/modal patterns.
- Reuse `Modal` for details and delete confirmation.
- Reuse `AddFacultyDrawer` for edit mode where possible; change operation-specific titles and button labels, not styling.
- Track the selected server ID and operation mode explicitly.
- When edit opens the same 460px drawer, preserve the page adapter's desktop space reservation as well as the mobile overlay behavior.
- Do not add new top-level pages or routes unless the existing routing pattern genuinely requires them.

If detail/edit URL states are added, keep them under the protected route and preserve unrelated query parameters. Validate URL IDs before requests.

---

## 11. Read/List Workflow

```text
Open /admin/faculties
  → loading state
  → getFaculties(verified parameters)
  → validate/extract response
  → map server records
  → render existing table and supported summary values
```

Required behavior:

1. Load records on initial mount.
2. Distinguish initial loading, successful empty results, read failure, and successful data.
3. Show a retry action for read failure using current button styles.
4. Keep query text intact after retry.
5. Ignore out-of-order responses after search/navigation changes.
6. Do not show stale rows as if they matched a newly selected query.
7. Do not show a successful empty state for 401, 403, 500, network failure, or malformed data.
8. Prevent state updates from a request whose screen has unmounted.

---

## 12. Search and Pagination

### 12.1 Search

Preserve the existing search field and placeholder.

If server search exists:

- Use its exact parameter name and documented search semantics.
- Debounce typing approximately 250–400 ms.
- Reset the server page when the query changes if pagination applies.
- Cancel or ignore older requests.

If server search is absent:

- Client filtering is acceptable only over a verified complete collection.
- Do not filter one server page and present the result as a complete directory search.
- Do not send invented search parameters to a strict backend.
- Report a search limitation if complete search cannot be supported without a backend change.

Keep English, Thai, and faculty-code search behavior where the supported data/API allows it. Do not claim the backend searches Thai names without verifying it.

### 12.2 Pagination without redesign

The current Faculties design shows a directory table and does not establish a pagination control.

If the API returns an unpaginated full collection, retain that workflow.

If the API is paginated:

- Confirm page origin, maximum size, ordering, and total metadata.
- Do not silently render only the first page as the entire directory.
- Preserve the design by loading the complete directory through documented pages only when the dataset is suitably bounded and this is operationally reasonable; handle partial-page failure as an error rather than complete success.
- If complete loading is unsuitable and a new pagination control is necessary, report the design/API mismatch and request direction before adding visible controls.
- Do not modify the backend's pagination or hardcode oversized page requests.

---

## 13. Create Faculty Workflow

```text
Add Faculty
  → existing drawer opens
  → user enters code, English name, optional/required Thai name, status
  → client validation
  → exact payload mapping
  → createFaculty(payload)
  → await successful backend response
  → close drawer
  → refresh list and supported totals
  → show success feedback
```

Implementation requirements:

- Initial status remains Active, matching the current design.
- Inputs start blank; the example faculty is not prefilled automatically.
- Make the existing `onAdd` callback asynchronous and **await it**. Its current `void` callback signature must not cause the drawer to close before the request finishes.
- Replace `createDemoFaculty` in this workflow with the API mutation.
- Lock submission immediately to prevent double clicks/Enter from issuing duplicate requests.
- Disable relevant controls while submitting; use `Adding…` or the existing loading label.
- Keep form values on validation, conflict, permission, and network failures.
- Do not clear form state or close the drawer until creation succeeds.
- On success, use the server ID and returned data or refetch. Never generate a UUID for a production faculty.
- Preserve the current successful-add search reset behavior, or document an explicitly approved alternative; do not accidentally hide the new record without feedback.

### 13.1 Mutation success followed by refresh failure

These are separate outcomes:

```text
POST succeeded, GET refresh failed
```

Show that creation succeeded and that the list could not refresh. Offer a read retry. Do not invite another create request or report that the successful creation failed.

---

## 14. Faculty Detail Workflow

```text
Row action → View → validate ID → GET detail → existing modal → server values
```

- Fetch detail from the existing endpoint rather than assuming a list row contains all current data.
- Show loading while fetching; do not display a previous faculty's details under a new selection.
- Display 404 as `Faculty not found.` using existing modal structure.
- Provide a read retry for recoverable failures.
- Ignore a response if the selected faculty changes before it completes.
- If no detail endpoint exists, document that limitation; do not claim list data came from GET-by-ID.

---

## 15. Edit Faculty Workflow

```text
Row action → Edit
  → validate ID
  → GET current faculty
  → populate reused drawer
  → edit supported fields
  → validate
  → build verified update payload
  → PUT/PATCH existing endpoint
  → close on success and refresh list/totals
```

Requirements:

- Do not open an editable blank form while detail is loading or after detail failed.
- Preserve `isActive: false` when populating the form.
- Initialize the dirty-state baseline from the fetched record, not from create-mode defaults.
- Editing a faculty without changing its code must not produce a duplicate against itself.
- Exclude the current record's ID from any local duplicate hint.
- Treat server uniqueness checks as authoritative, especially with filtered or paginated lists.
- Use the real update DTO. Do not assume it is identical to the create request.
- Send all required fields for full-replacement PUT; for PATCH follow documented partial-update rules.
- Never send counts, ID, audit metadata, or unsupported fields as update properties.
- Preserve entered changes if update fails.
- Disable duplicate saves while pending.
- Clear stale validation and loaded values when switching from edit to create or between IDs.
- Refetch after success; if refresh fails, distinguish it from failed update.

Changing Active/Inactive must use a verified supported update field or existing status endpoint. Do not invent a `/status` endpoint.

---

## 16. Delete Faculty Workflow

```text
Row action → Delete → existing styled confirmation modal
  → explicit confirmation → DELETE existing endpoint
  → success → close modal → refresh directory and totals
```

Requirements:

- Clicking the initial Delete action only opens confirmation.
- Identify the intended faculty by its server ID and displayed code/name.
- Cancel, Escape, and close before submission send no DELETE request.
- Lock deletion and disable repeated confirmation while pending.
- Do not remove the row optimistically.
- Support an empty `204 No Content` response if that is the contract.
- After rejection, keep the row visible and show a safe error in the confirmation context.
- Do not cascade delete departments, courses, students, or other relationships from the frontend.
- Do not retry DELETE automatically following an ambiguous network timeout.
- If the backend reports that the faculty has dependent records, display its safe documented conflict message.

The backend determines hard deletion, soft deletion, or deactivation. Do not replace DELETE with a local `isActive = false` mutation. Do not claim permanent deletion if backend behavior is unconfirmed.

---

## 17. Validation Rules

| Field | Client behavior |
| --- | --- |
| Faculty Code | Required according to existing UI; trim outer whitespace; enforce only verified API constraints |
| Faculty Name (English) | Required according to existing UI; reject whitespace-only input |
| Faculty Name (Thai) | Existing UI marks it optional; confirm backend required/null/blank rules |
| Status | Only existing Active/Inactive choices; map to actual boolean |
| Faculty ID | Validate according to backend ID type before detail/update/delete |

Examples of safe field messages:

```text
Faculty code is required.
English faculty name is required.
Thai faculty name is required.           [only if backend requires it]
This faculty code is already in use.     [only when verified]
Select a valid status.
```

Do not invent a `FAC-` prefix requirement, English-only name rule, maximum length, or uppercase-only code rule from the sample alone.

If backend-required Thai input conflicts with the current optional marker, report the mismatch. Do not silently change the agreed form design or omit authoritative validation.

Local duplicate checks are usability hints only. They cannot prove uniqueness across an incomplete directory and must not substitute for backend 409 handling.

When validation fails:

1. Do not issue a mutation request.
2. Keep all entered values.
3. Render feedback near the existing control.
4. Set `aria-invalid` and connect messages using `aria-describedby`.
5. Focus the first invalid enabled control.

---

## 18. Error Handling

Inspect and map the Faculty API's actual error shape. Do not copy Admin User error-code mappings blindly; faculty errors have their own contract.

| Failure | Required frontend behavior |
| --- | --- |
| 400 | Show verified field errors when provided; otherwise a safe form-level validation message |
| 401 | Let the existing central authentication handler manage session expiry |
| 403 | Show access denied; do not retry with another identity or alter permissions |
| 404 detail/edit | Show `Faculty not found.`; prevent saving stale data |
| 404 delete | Explain that the record is unavailable; offer list refresh; do not misreport a completed delete |
| 409 | Show a verified duplicate/dependency/concurrency message; preserve form/row |
| 422 | Handle validation only if the existing backend uses this status |
| 429 | Respect existing retry guidance; avoid request loops |
| 500/503 | Show a generic retryable failure; do not expose internal exceptions |
| Network/timeout | Keep entered data and show a connection/retry message |
| Cancelled read | Ignore without presenting an error toast |
| Malformed success response | Show a contract error, not fake rows or an empty success state |

Safe fallback:

```text
Unable to complete the request. Please try again.
```

Never render raw SQL, Java stack traces, internal paths, request headers, or authentication tokens. Prefer documented error codes mapped to user-facing copy. Do not log full Axios error objects containing credentials/headers.

Do not automatically resubmit create/update/delete after a transport failure: the server might already have applied the mutation. Allow a read refresh to determine current state.

---

## 19. Loading, Cancellation, and Accessibility

Maintain distinct state for list loading, detail loading, create/update submission, and deletion. A failed list refresh must not reset an unrelated form.

Preserve:

- The 460px desktop adjacent drawer and modal behavior below the existing 1280px breakpoint.
- Mobile body-scroll locking and desktop layout space reservation.
- Native dialog Escape handling and focus restoration to the opener.
- Existing dirty-close/discard confirmation.
- Keyboard access to actions, form controls, and confirmation buttons.
- English/Thai font support and text rendering.

Use `role="status"`/polite announcements for loading and success, and existing alert areas for failures.

Disable close/cancel while a mutation is pending unless the application has a defined safe cancellation workflow. Cancelling an HTTP request does not guarantee that the server cancelled a write.

Do not introduce React effect loops, duplicate requests from unstable dependencies, or state updates from stale responses. Keep mutation requests in explicit user event handlers, not mount effects.

---

## 20. State Refresh and Demo Migration

After successful create/update/delete:

1. Record mutation success independently of subsequent reads.
2. Close the relevant form/confirmation according to existing UX.
3. Invalidate/refetch affected list and supported summary data.
4. Clear obsolete selected/detail state.
5. Show success feedback using the existing message area.

Remove connected-screen dependence on:

```text
useState(initialFaculties)
createDemoFaculty(...) as a successful production mutation
crypto.randomUUID() for server-owned faculty IDs
Fabricated zero department/student counts
Local-only persistence/success copy
```

Do not remove shared demo sources used by unrelated modules. Do not create a second mutable local faculty catalog competing with server state.

The API-connected directory must remain accurate after a full reload, subject to backend response and permissions.

---

## 21. Testing Plan

Use the existing project tooling. Add focused tests for service contracts, mapping, and meaningful state transitions. Keep test records separate from existing university records.

### 21.1 Payload and mapping tests

- Exact create keys match the four documented fields.
- Sample values originate from form state, not a constant POST body.
- Active sends boolean `true`; Inactive sends boolean `false`.
- English and Thai values survive request and response mapping.
- Outer whitespace is normalized as specified; internal Thai text remains intact.
- Blank Thai name follows verified empty-string/null/required semantics.
- Unknown/missing required response fields are handled explicitly.
- Missing counts render unknown, while actual zero remains zero.
- Create/update omit UI-only and read-only fields.
- Update includes precisely the fields required by its actual DTO.

### 21.2 Create tests

- Required-field failure prevents POST.
- Double click/Enter produces one request.
- Pending UI stays pending until the actual promise settles.
- 400/409 preserves inputs and displays safe errors.
- Success closes the drawer and refreshes data.
- A successful POST followed by failed GET does not invite duplicate creation.

### 21.3 List/search tests

- Protected list request uses the existing authentication interceptor.
- Response wrapper and pagination metadata are extracted correctly.
- Empty success is different from failure.
- Retry retains search input.
- Older search responses cannot overwrite newer results.
- Search does not falsely cover only one server page.
- Aggregate cards are not derived from a partial page as full totals.

### 21.4 Detail/edit tests

- Invalid ID prevents a request.
- Correct ID is fetched and fields are populated from the response.
- Inactive faculty opens with Inactive selected.
- Untouched code does not conflict with the same record.
- Switching records does not leak previous form data.
- 404/403 prevents stale editing.
- Failed update preserves edits; successful update refreshes server state.

### 21.5 Delete tests

- Initial Delete click and Cancel issue no DELETE request.
- Confirm issues exactly one request for the selected server ID.
- 204 succeeds without JSON parsing errors.
- 409 dependency failure keeps the row and shows safe feedback.
- Successful deletion refreshes supported totals.
- No frontend cascade or invented soft-delete behavior occurs.

### 21.6 Authentication/error tests

- Existing centralized 401 handling is invoked.
- 403 does not trigger an authentication bypass.
- Network and 500 responses do not expose server internals.
- No production fixture fallback occurs on API failure.

### 21.7 Visual and browser checks

- Compare before/after at the existing desktop and mobile breakpoints.
- Confirm the table, cards, typography, colors, spacing, and drawer dimensions are unchanged.
- Verify English and Thai input/rendering.
- Verify focus restoration, keyboard navigation, Escape, and dirty cancellation.
- Verify real persisted create/read/update/delete only in an authorized test environment with a disposable test record; never delete existing records just for testing.
- Sign in normally to test protected pages. Do not fake authentication in production routes.

Required commands, adapted only if tooling changes:

```sh
npm run lint
npx tsc --noEmit
npm run build
```

Run added service/mapping tests with their documented command. Report mocked contract tests separately from successful live API requests and rendered visual checks.

---

## 22. Agent Implementation Instructions

Copyable implementation prompt:

```text
Implement Faculties CRUD API integration in this frontend using
spec-md/17-api-implementation-faculties.md.

Read applicable AGENTS.md/AGENT.md instructions if present, then inspect:
- spec-md/10-faculties.md
- spec-md/04-authentication.md
- src/components/faculties/
- src/pages/faculties/FacultiesPage.jsx
- src/types/faculty.ts
- src/utils/faculties.ts
- src/api/apiClient.js

STRICT RULES:
1. Frontend only. Never modify backend source, API contracts, database,
   migrations, authentication, authorization, or CORS.
2. Keep existing Figma/UI design, responsive behavior, and page hierarchy.
3. Reuse existing components and central Axios client/interceptors.
4. Verify actual Faculty endpoints, IDs, DTOs, responses, pagination,
   validation, aggregate fields, and errors before wiring requests.
5. Treat candidate paths in the specification as unconfirmed examples.
6. Use exact request keys: facultyCode, facultyNameEn, facultyNameTh, isActive.
7. Preserve actual boolean false; do not serialize booleans as strings.
8. Do not fabricate records, counts, lookup data, endpoints, or success.
9. If APIs are missing or incompatible, report the precise blocker and
   complete independent supported work without changing the backend.

IMPLEMENTATION:
- Create/reuse one facultyService and request/response adapters.
- Replace Faculties runtime demo records with GET results.
- Connect search only according to verified API/full-list capability.
- Await POST from the existing Add Faculty drawer.
- Fetch detail and reuse existing UI for View/Edit.
- Build the actual update DTO and call its existing PUT/PATCH endpoint.
- Use existing modal styles for explicit delete confirmation.
- Call DELETE only after confirmation, then refetch.
- Add required validation, safe error feedback, loading, retry,
  duplicate-submit protection, and stale-response handling.
- Preserve current drawer sizing, focus behavior, and dirty confirmation.
- Preserve shared demo fixtures needed by unrelated screens.
- Keep counts unknown when no authoritative aggregate is supplied.
- Add focused tests, run lint/TypeScript/build, and document results.
- Update spec-md/00-changes-and-decisions.md with actual contracts,
  limitations, verification, and any uncompleted acceptance criteria.

FINAL REPORT:
Summarize frontend files changed, verified endpoints, completed workflows,
test results, live-verification status, and unresolved API/design gaps.
Confirm backend code and authentication were not modified.
```

---

## 23. Acceptance Criteria

### Design and scope

- [ ] Existing Figma layout, styling, table columns, cards, drawer, and responsive behavior are preserved.
- [ ] Existing components and API client are reused.
- [ ] No unrelated frontend module is changed unnecessarily.
- [ ] Backend source, APIs, database, and authentication remain untouched.

### Contract and data

- [ ] Actual Faculty API contracts are verified and documented.
- [ ] Connected list/detail screens render backend data, not fixtures.
- [ ] IDs use the real backend format and are validated before requests.
- [ ] Response wrapper and page semantics are correct.
- [ ] Request keys match `facultyCode`, `facultyNameEn`, `facultyNameTh`, and `isActive`.
- [ ] `isActive` is boolean, including explicit `false`.
- [ ] Thai-name nullability and validation follow the actual API.
- [ ] Counts/summary values are authoritative or explicitly unknown, never fabricated.
- [ ] Search and totals do not misrepresent a partial page as a full directory.

### CRUD

- [ ] Create awaits POST, shows success only after success, and refreshes data.
- [ ] Detail fetches the selected server record and handles unavailable records.
- [ ] Edit loads fresh data and sends the verified update request.
- [ ] Delete requires confirmation and calls the verified deletion endpoint.
- [ ] Failed mutations preserve input/rows and allow appropriate retry.
- [ ] Mutation success is distinguished from refresh failure.
- [ ] Double submissions and stale response overwrites are prevented.

### Errors and accessibility

- [ ] Validation appears near existing fields with first-error focus.
- [ ] 401 follows existing centralized authentication behavior.
- [ ] Permission, not-found, conflict, server, and network failures are handled safely.
- [ ] No raw server internals or tokens are exposed.
- [ ] Loading, empty, and error states are distinct.
- [ ] Keyboard, Escape, focus restoration, and dirty-close confirmation work.

### Verification and handoff

- [ ] Focused service/mapping/workflow tests pass.
- [ ] Lint, TypeScript, and production build pass.
- [ ] Authenticated live API checks are recorded separately from mocked tests.
- [ ] Visual/responsive checks confirm design preservation, or their pending status is stated.
- [ ] Changes, verified contracts, and limitations are recorded in the decisions log.
- [ ] Missing endpoints or unresolved contract mismatches are reported as blockers, not marked complete.

---

## 24. Final Architecture

```text
Protected Faculties route
        ↓
Existing page + table + drawer + modal
        ↓
User events and request state
        ↓
Faculty validation / request mapper
        ↓
facultyService
        ↓
Existing apiClient + authentication interceptor
        ↓
Existing Faculty API
        ↓
Verified response adapter
        ↓
Existing UI state, feedback, and data refresh
```

**Core rule: connect the existing frontend to the existing API; preserve the design; do not modify the backend or authentication.**
