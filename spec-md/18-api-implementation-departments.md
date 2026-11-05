# 18 — Departments CRUD API Integration Specification

## 1. Purpose and Scope

Connect the existing **Departments** frontend to the existing backend for list, detail, create, update, and delete workflows. Preserve the approved Figma/UI design and use the existing authentication and centralized Axios client.

This is an implementation specification for Codex, Claude, OpenCode, or another coding agent. This document does not itself implement the feature.

| Item | Requirement |
| --- | --- |
| Application | Smart AI University Student Assistant — Admin Web |
| Module | Academic Management → Departments |
| Stack | React + Vite + Tailwind CSS + Axios + React Router |
| Existing source conventions | TSX components, TypeScript services/models, JSX page adapter |
| Directory route | `/admin/departments` |
| Existing Add Department state | `/admin/departments?add=1` |
| Design specification | `spec-md/11-departments.md` |
| Related integration references | `spec-md/16-api-implmentation-adminusers.md`, `spec-md/17-api-implementation-faculties.md` |
| Authentication reference | `spec-md/04-authentication.md` |
| Scope | Frontend API integration only |

Follow existing file languages and naming conventions. Do not convert working TSX files to JSX or introduce a new framework.

---

## 2. Non-Negotiable Rules

### 2.1 Preserve the existing design

Do not change:

- Page hierarchy, sidebar, top navigation, branding, or navigation destinations.
- Fonts, colors, spacing, borders, shadows, icons, and responsive breakpoints.
- Table column order, faculty badges, count cells, or status badges.
- Search and Faculty/Status filter placement or appearance.
- Drawer width, field order, header, footer, button styling, or radio controls.
- Shared modal styling, focus restoration, native dialog behavior, or scroll locking.

Add loading, validation, success, and error behavior within the current components and styling. Do not introduce a new table library, form framework, component kit, or notification system.

### 2.2 Preserve the approved Faculty input correction

The Add Department drawer must continue to have **one editable Faculty field**:

```text
Search or select a faculty…
```

- Users type directly into this field to filter options.
- The selected faculty name appears in this same field.
- Do not add a second search box inside the dropdown.
- Do not replace it with an ordinary non-searchable select.
- Preserve its keyboard navigation, active-option highlighting, top-layer popup, loading, retry, and empty-result behavior.
- The submitted value is the selected faculty's server ID, not the typed search text or display name.

### 2.3 Frontend only

Do not modify:

```text
Backend controllers, services, repositories, entities, DTOs, or mappers
API endpoints, backend validation, authorization, or authentication
Database schema, migrations, seed data, or database records directly
JWT/session handling, security configuration, Redis, or CORS
```

Read-only backend inspection is allowed to verify contracts. Do not alter the backend to make it match frontend assumptions.

Do not create a second Axios client or authentication system. Do not bypass authentication to render protected pages.

### 2.4 Honest production data

Connected screens must use server records. Do not silently fall back to demo records when a request fails, generate fake persisted IDs, or display successful creation before the backend succeeds.

Do not auto-create the sample department. All submitted values must come from the form.

---

## 3. Existing Frontend Inventory

Inspect these files before editing:

| File | Existing responsibility | Integration direction |
| --- | --- | --- |
| `src/pages/departments/DepartmentsPage.jsx` | Protected layout adapter and Add drawer URL state | Retain routing, shell, and drawer space reservation |
| `src/components/departments/DepartmentsContent.tsx` | Demo list, combined filters, footer counts, Add callback, action placeholder | Replace local data flow with API state |
| `src/components/departments/DepartmentTable.tsx` | Existing department table | Preserve columns/styles; map backend faculty names/counts |
| `src/components/departments/AddDepartmentDrawer.tsx` | Add form and dirty-close behavior | Await POST; reuse for edit when practical |
| `src/components/departments/SearchableFacultySelect.tsx` | Approved single-input searchable combobox | Replace demo option loader with API-backed options |
| `src/services/departmentService.ts` | Existing Axios GET service and department option/page interfaces | Extend, rather than create a competing service |
| `src/services/facultyService.ts` | Faculty API access and adapters | Reuse/extend compatibly for active faculty lookup |
| `src/services/departmentDemo.ts` | Local asynchronous faculty option/demo helpers | Remove from the connected Departments runtime path |
| `src/types/department.ts` | UI department/input/filter types | Add API models and adapt UI mapping as needed |
| `src/utils/departments.ts` | Demo filtering, validation, and local creation | Keep reusable pure helpers; remove demo mutation use |
| `src/data/departments.ts`, `src/data/faculties.ts` | Academic demo fixtures | Do not use as connected directory/lookup sources |
| `src/api/apiClient.js` | Shared Axios client and auth interceptors | Reuse unchanged |
| `src/routes/AppRoutes.jsx` | Protected route definitions | Preserve route protection |
| `src/components/ui/Modal.tsx` | Shared dialog styling and behavior | Reuse for details/actions and delete confirmation |

Current UI types:

```ts
type DepartmentInput = {
  code: string
  name: string
  facultyId: string
  status: 'active' | 'inactive'
}

type Department = DepartmentInput & {
  id: string
  programCount: number
  courseCount: number
  studentCount: number
}

type DepartmentFilters = {
  query: string
  facultyId: string
  status: string
}
```

The UI currently uses strings for selection values. The API requires numeric IDs. Handle conversion explicitly at the request boundary.

Inspect consumers before changing exported types/service signatures or removing fixtures. Other academic demo screens may still depend on these files. Avoid unrelated module migration during this task.

---

## 4. User-Supplied Request Contract

```json
{
  "departmentCode": "DIT",
  "departmentName": "Digital Innovation Technology",
  "facultyId": 2,
  "isActive": true
}
```

Send these exact property names:

```text
departmentCode
departmentName
facultyId
isActive
```

Do not send UI aliases such as `code`, `name`, or `status` as request properties.

Do not submit `facultyNameEn`, program/course/student counts, an invented department ID, or audit metadata.

The sample `facultyId: 2` is an example only. It is valid only if that faculty exists, is not deleted, and is active in the target backend. Never select an arbitrary fallback ID when lookup loading fails.

---

## 5. Verified Backend Contract and Reverification

The following contract was inspected read-only in the local backend source while preparing this specification. It is source-verified, **not proof of successful requests against the running deployment**.

Before implementing, recheck that the deployed API matches the current controller, DTOs, service, query parser, mapper, and exception handler. Record differences in `spec-md/00-changes-and-decisions.md`.

Source references under the backend package:

```text
feature/department/controller/DepartmentController.java
feature/department/dto/DepartmentCreateRequest.java
feature/department/dto/DepartmentUpdateRequest.java
feature/department/dto/DepartmentListQuery.java
feature/department/dto/DepartmentResponse.java
feature/department/dto/DepartmentListResponse.java
feature/department/dto/DepartmentPageResponse.java
feature/department/dto/DepartmentSummaryResponse.java
feature/department/service/impl/DepartmentServiceImpl.java
feature/department/mapper/DepartmentMapper.java
feature/department/exception/
exception/GlobalExceptionHandler.java
```

### 5.1 Endpoints

| Operation | Method and path | Success |
| --- | --- | --- |
| Create | `POST /api/v1/admin/departments` | `201`, department response |
| List | `GET /api/v1/admin/departments` | `200`, page response |
| Summary | `GET /api/v1/admin/departments/summary` | `200`, summary response |
| Detail | `GET /api/v1/admin/departments/{id}` | `200`, department response |
| Update | `PUT /api/v1/admin/departments/{id}` | `200`, department response |
| Delete | `DELETE /api/v1/admin/departments/{id}` | `204`, no response body |

The current update is a full four-field request, not a partial PATCH. Do not invent a status endpoint.

### 5.2 Permissions

The inspected service allows:

```text
SUPER_ADMIN
ADMIN
ACADEMIC_ADMIN
```

It also requires a full session; a session restricted by required password change can be rejected. Reuse central authentication and display safe permission feedback. Do not change permissions or force-password-change behavior.

### 5.3 IDs and deletion

- Backend IDs are positive Java `Long` values.
- Validate IDs before detail/update/delete and faculty selection requests.
- If using JavaScript numbers, require positive safe integers; do not silently round an out-of-range ID.
- The backend performs soft deletion.
- DELETE is blocked if non-deleted users or programs are assigned to the department.
- Do not implement frontend cascade deletion or substitute a local inactive status for DELETE.

---

## 6. Exact Validation and Business Rules

| Field | Current backend requirement |
| --- | --- |
| `departmentCode` | Required, trimmed, max 30 characters, `^[A-Z0-9-]+$` |
| `departmentName` | Required, trimmed, max 255 characters |
| `facultyId` | Required positive numeric ID; faculty must exist, not be deleted, and be active |
| `isActive` | Boolean; create defaults to true if omitted, but frontend must send an explicit value; update requires it |

Do not invent a `DEPT-` prefix requirement. `DIT` is valid under the inspected code pattern.

Do not silently uppercase user input. Preserve entered code and show the verified uppercase/number/hyphen rule when invalid.

Current uniqueness rules:

- Department code is unique globally.
- Department name is unique within its selected faculty.
- The backend excludes the current department ID during update uniqueness checks.
- Soft-deleted identifiers remain reserved by backend uniqueness rules.

Do not assume that a code becomes reusable after deleting a department. Do not use incomplete client data to declare a value unique.

Client validation should prevent obviously invalid requests; the backend remains authoritative for existence, eligibility, uniqueness, concurrency, and dependencies.

---

## 7. Authentication and Central API Client

Reuse `src/api/apiClient.js`:

```text
baseURL = VITE_API_BASE_URL + /api/v1/admin
Existing JSON headers
Existing Bearer access-token request interceptor
Existing centralized 401 response handling
```

Service paths should therefore be relative:

```ts
apiClient.get('/departments', { params })
```

Do not repeat `/api/v1/admin` inside the relative URL or hardcode localhost/backend hosts inside components.

Do not read/store tokens in Department components, manually attach per-component authentication headers, or register an additional 401 handler.

Architecture:

```text
Existing Department UI
  → event/request state
  → departmentService
  → existing apiClient/auth interceptor
  → existing Department API
  → response adapter
  → existing UI
```

---

## 8. Service Implementation Structure

Extend `src/services/departmentService.ts`, preserving compatible exports used elsewhere.

Required operations:

```ts
getDepartments(params, options?)
getDepartmentById(id, options?)
createDepartment(payload)
updateDepartment(id, payload)
deleteDepartment(id)
getDepartmentSummary(options?)
```

Exact function signatures may follow project conventions. Avoid creating two services with conflicting ownership of `/departments`.

Separate:

1. UI form validation.
2. Payload construction.
3. HTTP calls.
4. Response shape validation/mapping.
5. Error-code-to-feedback mapping.

Use an optional Axios `AbortSignal` for reads where practical. A cancelled-effect/request-generation guard is also required to prevent stale results from overwriting a newer selection.

Keep mutation requests in explicit user event handlers, never in component mount effects.

Support `204 No Content` without attempting to parse a JSON body.

---

## 9. Payload Mapping

| UI field | API field | Conversion |
| --- | --- | --- |
| `code` | `departmentCode` | Trim outer whitespace |
| `name` | `departmentName` | Trim outer whitespace |
| `facultyId` | `facultyId` | Validate positive integer, then convert to number |
| `status` | `isActive` | `status === 'active'` |

Example after validation:

```ts
function buildDepartmentPayload(value: DepartmentInput) {
  return {
    departmentCode: value.code.trim(),
    departmentName: value.name.trim(),
    facultyId: Number(value.facultyId),
    isActive: value.status === 'active',
  }
}
```

Invalid faculty selections must be rejected before this mapping. `Number('')` produces zero and must never become an accidental request value.

Do not send:

```json
{ "facultyId": "2", "isActive": "false" }
```

Correct inactive request:

```json
{
  "departmentCode": "DIT",
  "departmentName": "Digital Innovation Technology",
  "facultyId": 2,
  "isActive": false
}
```

Never use `Boolean('false')` or `response.isActive || true`. Preserve explicit false.

Create and PUT currently accept the same four fields. Keep separate request types/builders if that helps prevent future contract drift; do not add read-only properties from the GET response.

---

## 10. Response Shapes and UI Mapping

The current list page response contains:

```text
content
page
size
totalElements
totalPages
first
last
sort
```

There is no additional `data` wrapper inside the controller body. Axios `response.data` is the page object; its `content` contains records.

Current list row properties:

```text
id
departmentCode
departmentName
facultyId
facultyCode
facultyNameEn
programCount
courseCount
studentCount
isActive
```

Detail/create/update responses also carry audit fields:

```text
createdBy
createdAt
updatedBy
updatedAt
```

Mapping:

| Response field | Existing UI field/use |
| --- | --- |
| `id` | Actual server record identity |
| `departmentCode` | `code` |
| `departmentName` | `name` |
| `facultyId` | Faculty selection value |
| `facultyCode`, `facultyNameEn` | Faculty badge/label supplied by API |
| `programCount`, `courseCount`, `studentCount` | Existing count cells |
| `isActive` | Active/Inactive status |

Extend the UI model to retain `facultyCode`/`facultyNameEn`; do not resolve production names through `initialFaculties` or infer a relation by name similarity.

Stringifying a verified numeric ID for a controlled input is acceptable. Convert back only after validation when sending requests.

Validate required response properties. A malformed response is an error, not an empty collection. Do not use absent status values as Active defaults.

### 10.1 Count limitations

The inspected mapper uses actual program statistics but currently emits `courseCount: 0` and `studentCount: 0`.

- Display explicit values returned by the API.
- Document that those two backend values are currently placeholders, not independently verified aggregates.
- Do not substitute demo counts or modify the mapper/backend.
- If the deployed API omits a count, show `—` rather than inventing zero; adapt UI types accordingly.
- Do not add N+1 requests to rebuild these counts without a verified, suitable API contract.

---

## 11. Faculty Lookup Integration

Reuse the existing Faculty API/service and `SearchableFacultySelect`.

Current Faculty endpoints include:

```http
GET /api/v1/admin/faculties
GET /api/v1/admin/faculties/{id}
```

The verified faculty list supports `status=ACTIVE`, `search`, and pagination. Reverify this against the implementation at execution time.

### 11.1 Assignment options versus filter options

These have different purposes:

- **Form assignment options:** active, non-deleted faculties only, because create/update rejects inactive or deleted faculties.
- **Directory Faculty filter:** should include relevant existing faculties, including inactive faculties where appropriate for browsing assigned departments. Do not accidentally hide departments because the filter reuses an active-only assignment list.

Preserve current service consumers when extending `getFaculties` to accept status/options. A dedicated lookup helper using the same service/client is acceptable; a duplicate Axios instance is not.

### 11.2 One editable field

The component's visible control stays unchanged:

```text
Faculty *
[ Search or select a faculty… ]
```

Maintain two distinct concepts internally:

```text
Search text / visible input text
Committed faculty ID and selected label
```

Typing arbitrary text must never commit a faculty ID. When editing text after selection, either clear the committed selection until a real option is chosen, or restore the committed label on blur according to existing behavior. Do not allow visible text for one faculty to silently submit another faculty's ID.

### 11.3 Lookup loading and completeness

- Replace `loadDemoFacultyOptions` as the connected component's default/runtime loader.
- Preserve loading, retry, empty-list, and no-matching-result states.
- Do not auto-select the first faculty after a lookup failure.
- Do not claim all options are available when only one page was fetched.
- Either fetch the suitably bounded complete active option set, or implement verified server search with stale-response protection within the same input.
- Use stable loaders/callbacks so effect dependencies do not cause repeated request loops.
- Preserve arrow keys, Enter, Escape, outside-click behavior, active-descendant references, and the top-layer popup within the drawer's focus scope.

### 11.4 Editing an unavailable faculty assignment

Detail responses include the assigned faculty's ID and label. Preserve that identity while loading lookup data.

If the assignment is now inactive/deleted or absent from complete eligible options:

1. Do not clear it silently or replace it with the first option.
2. Display the existing label where available.
3. Explain that an active faculty must be selected before saving if the API no longer accepts the existing assignment.
4. Keep user changes if the backend rejects a faculty that became unavailable after selection.

Backend validation remains authoritative; the lookup is not a concurrency guarantee.

---

## 12. Routes and Drawer Reuse

Preserve:

```text
/admin/departments
/admin/departments?add=1
```

Keep the current protected route and the existing 460px adjacent desktop drawer/mobile modal behavior.

Reuse the Add Department drawer for edit mode where practical:

- Mode-specific title and submit label may change to Edit/Update Department.
- The fields, sizing, spacing, and controls remain the same.
- Reserve desktop drawer width when either create or edit is open.
- Do not allow two simultaneous create/edit drawers.
- Dirty-close confirmation must compare against loaded edit values, not empty create defaults.

Reuse row action triggers and existing modal/button patterns for View/Edit/Delete. Do not create a new full-page form or top-level navigation item.

If URL states for detail/edit are added, keep them protected, validate IDs, and preserve unrelated search parameters.

---

## 13. List and Filter Workflow

```text
Open Departments
  → load directory and Faculty filter options
  → loading state
  → map API page records
  → render existing table and footer
```

Verified list query parameters:

| Parameter | Current contract |
| --- | --- |
| `page` | Zero-based nonnegative integer; default 0 |
| `size` | 1–100; default 20 |
| `search` | Trimmed, optional, max 255 characters |
| `facultyId` | Optional positive numeric faculty ID |
| `status` | `ACTIVE` or `INACTIVE` |
| `sort` | `field,direction`; supported fields `id`, `departmentCode`, `departmentName`, `createdAt` |

Unknown query parameters are rejected. Do not send `isActive`, `query`, or lowercase status as list query keys/values.

Map UI filters:

```text
query → search
facultyId string → validated numeric facultyId
active → ACTIVE
inactive → INACTIVE
empty filter → omitted parameter
```

Combined filters use the server's AND behavior. Debounce search approximately 250–400 ms. Ignore or abort old reads so they cannot overwrite new results.

Reset the internal server page when filters change. Keep input values on retry. Clear obsolete displayed rows while a new result is pending, or explicitly mark them stale; do not present them as matching the new query.

### 13.1 No-pagination design

The existing screen has a directory table and a count footer, not a demonstrated pagination control.

To preserve the design:

- Read all matching documented pages when the directory is suitably bounded.
- Use a stable sort such as `id,asc` and a valid page size.
- Bound the total work, for example 20 pages/2,000 records, and document the chosen frontend limit.
- Do not silently truncate when the limit is exceeded; show safe feedback to narrow filters or request a design decision for pagination.
- Reject partial loads and inconsistent totals/duplicate IDs; offer a read retry.
- Do not request an unsupported oversized `size` or change backend pagination.

If a complete directory read is operationally unsuitable, report the need for a pagination design rather than adding unrequested controls.

### 13.2 Footer semantics

Preserve the existing `Showing X of Y departments` presentation:

- `X`: complete filtered result count, not just one fetched page.
- `Y`: overall non-deleted department total from the existing summary endpoint.
- On initial/failed reads, show loading or unknown values instead of fabricated zero totals.
- When summary fails independently, keep valid directory results and explain the summary failure.

Current summary fields are `totalDepartments`, `activeDepartments`, and `inactiveDepartments`; verify names from the DTO before coding.

Do not add summary cards just because a summary API exists. Use the endpoint to support the existing footer.

---

## 14. Create Department Workflow

```text
Add Department
  → existing drawer
  → load active Faculty choices
  → complete code, name, faculty, status
  → validate
  → map exact four-field payload
  → POST /departments
  → successful response
  → close drawer and refresh list/total
  → existing success feedback
```

Requirements:

1. Start with blank identity/faculty fields and Active selected, matching current behavior.
2. Never prefill or submit the sample payload automatically.
3. Await the real mutation promise from the drawer callback; update callback types accordingly.
4. Lock submission immediately and disable duplicate submit/close while pending.
5. Keep form values on validation, faculty, conflict, permission, or network errors.
6. Close/reset only after confirmed mutation success.
7. Use the server ID; never call `crypto.randomUUID()` for a persisted department.
8. Preserve the current directory filters after creation.
9. If filters hide the created department, state this in the existing success message rather than changing filters silently.
10. Refetch affected directory/summary data; do not append a fake local record with zero counts.

---

## 15. Detail Workflow

```text
Row action → View → validate department ID → GET detail → existing modal
```

- Load current detail from the server.
- Show loading, error, retry, and not-found states using existing styles.
- Show department code/name, faculty label, status, and available counts.
- Do not show the previously selected department's information during another request.
- Ignore responses when the modal closes or the selected ID changes.
- Preserve API-provided faculty labels even if lookup loading fails.

---

## 16. Edit Department Workflow

```text
Row action → Edit → GET fresh detail
  → populate reused drawer and selected faculty label
  → user changes fields
  → validation and payload mapping
  → PUT /departments/{id}
  → success → close and refresh
```

Requirements:

- Do not enable an empty edit form while detail loading is incomplete or failed.
- Preserve inactive status; do not default a returned false value to true.
- Establish the dirty baseline from fetched data.
- Preserve the existing faculty assignment until the user explicitly changes it or resolves an eligibility error.
- Validate a newly selected faculty with the same active-option rules as create.
- Do not report the unchanged code/name as a duplicate against the same record.
- Name uniqueness is faculty-scoped; moving a department may conflict in the destination faculty even if the old assignment was valid.
- PUT includes all four required fields, not only changed fields.
- Do not send program/course/student counts, display labels, audit fields, or the record ID in the body.
- Keep edits on failure and prevent repeated saves while pending.
- Clear stale form/error state when switching between records or between create/edit.
- Refresh server data after success while preserving filters.

---

## 17. Delete Department Workflow

```text
Delete action → confirmation modal → explicit Confirm
  → DELETE /departments/{id}
  → 204 success → close modal → refetch list and total
```

Rules:

- The initial Delete click never issues DELETE.
- Identify the department by server ID and show its code/name in confirmation.
- Cancel/Escape/close before submission sends no request.
- Lock the operation while pending.
- Do not remove the row optimistically.
- Do not attempt to read JSON from a 204 response.
- On failure, preserve the record and confirmation context with safe feedback.
- Handle assigned-user/program conflicts without offering to delete dependencies automatically.
- Do not implement cascade deletion, direct database cleanup, or frontend-only soft deletion.
- Use language consistent with the backend's directory removal; do not claim permanent physical deletion.

---

## 18. Validation Feedback

Examples:

```text
Department code is required.
Use at most 30 uppercase letters, numbers, or hyphens.
Department name is required.
Use at most 255 characters.
Select an active faculty.
This department code is already in use.
This department name is already in use in the selected faculty.
```

Client validation must reject:

- Blank/whitespace-only required text.
- Overlength or unsupported code characters.
- Missing faculty selection, arbitrary search text, zero/negative/fractional/unsafe IDs.
- Invalid status values.

Keep all entered values after rejection. Do not replace fields with example defaults.

Use existing error styles, `aria-invalid`, and `aria-describedby`. Focus the first invalid enabled control. Faculty errors belong to the single editable combobox, not to a new search control.

Backend uniqueness and eligibility remain authoritative. Local checks over a filtered page cannot prove validity.

---

## 19. Error Handling and Verified Codes

Use known error codes and safe copy. Do not render arbitrary backend exception messages.

| Status/code | Required behavior |
| --- | --- |
| 400 `VALIDATION_ERROR` | Safe form-level validation message unless verified field errors are supplied |
| 400 `INVALID_FACULTY` | Faculty field error: selected faculty is inactive; preserve input and allow reselection |
| 404 `FACULTY_NOT_FOUND` | Faculty field error for a mutation; do not mislabel it as Department not found |
| 404 `DEPARTMENT_NOT_FOUND` | Department not found; prevent stale edit/delete |
| 409 `DEPARTMENT_CODE_ALREADY_EXISTS` | Map to code field |
| 409 `DEPARTMENT_NAME_ALREADY_EXISTS` | Map to name field; explain faculty-scoped conflict |
| 409 `DEPARTMENT_IN_USE` | Cannot delete because users are assigned; keep row |
| 409 `DEPARTMENT_HAS_PROGRAMS` | Cannot delete because programs are assigned; keep row |
| 401 | Existing central auth handling only |
| 403 | Access denied/password-change restriction according to existing architecture |
| Other 409 | Safe conflict/reload message; preserve edits |
| 500/503 | Generic retryable error; no SQL/Java/internal details |
| Network/timeout | Connection feedback; preserve entered values |
| Cancelled read | Ignore without an error toast |
| Malformed success body | Contract error, not fake/empty success |

Differentiate faculty-related 404 from department-related 404 using the documented code. Do not reuse a generic Admin User error helper that labels every 404 as User not found.

Safe fallback:

```text
Unable to complete the request. Please try again.
```

No automatic retries for writes following an ambiguous timeout. The server may have applied the mutation. Offer a read refresh to inspect current state before another write.

Do not log access tokens, complete authorization headers, or raw Axios error/request objects.

---

## 20. Mutation Success versus Refresh Failure

Treat these as separate outcomes:

```text
POST/PUT/DELETE succeeded
GET refresh failed
```

Show that the write succeeded and that the directory could not refresh. Offer a GET retry. Do not report the write as failed or leave a successful create form inviting duplicate submission.

Maintain independent state for:

```text
Directory loading/error
Summary loading/error
Faculty lookup loading/error
Detail loading/error
Create/update pending/error
Delete pending/error
Success feedback
```

An unrelated lookup or list failure must not erase form values or replace a successful mutation message.

---

## 21. Accessibility, Concurrency, and State Cleanup

Preserve:

- Existing 460px desktop drawer and modal behavior below 1280px.
- Desktop content-space reservation for edit as well as create.
- Focus restoration to the initiating action.
- Dialog Escape handling, scroll locking, and dirty cancellation.
- Combobox keyboard behavior and popup positioning.
- English/Thai faculty-name rendering.

Use polite status announcements for loading/success and alerts for failures. Avoid simultaneous competing dialogs or drawers.

Do not allow pending mutations to be dismissed in a way that encourages resubmission. Cancelling a fetch does not guarantee cancellation of a server-side write.

Abort or ignore obsolete reads on unmount, filter changes, lookup changes, and selected-record changes. Use stable dependencies to avoid effect/request loops.

---

## 22. Demo-to-API Migration

Remove from the connected Departments runtime path:

```text
useState(initialDepartments) as the directory source
initialFaculties as authoritative production lookup data
loadDemoFacultyOptions as the form option loader
createDemoDepartment as successful creation
Generated local record IDs
Fabricated zero counts
Local-only success/persistence messages
```

Do not delete shared fixtures/helpers until their consumers have been inspected. Other local-demo modules remain outside this task.

Audit `DepartmentTable` and the drawer for hidden fixture-based faculty-name resolution; replacing only the outer list state is insufficient.

Refresh related visible Department data after mutations. Do not migrate unrelated Admin User, Program, Course, or Student screens under this task.

---

## 23. Testing Plan

Use existing project tooling and focused tests. Keep mocked contract tests distinct from live authenticated verification.

### 23.1 Request and response tests

- Exact four create/update property names.
- Faculty ID is numeric, including the sample value 2 when selected from verified data.
- Boolean false remains false.
- Whitespace normalization and field limits follow DTO behavior.
- List/detail faculty labels map from API data, not fixtures.
- Returned zero counts remain zero; missing counts are not fabricated.
- Unexpected response wrappers/types are handled safely.
- Invalid department and faculty IDs are rejected before HTTP requests.

### 23.2 Faculty combobox tests

- Exactly one editable input with `Search or select a faculty…`.
- Typing filters options in place; selection displays its name in the same field.
- Arbitrary typed text cannot submit a faculty ID.
- Form assignment options exclude inactive/deleted faculties.
- Directory filter behavior does not accidentally use only assignment-eligible options.
- Loading, retry, no-options, and no-matches states are distinct.
- All pages or server search are handled without silently incomplete choices.
- Existing edit assignment survives lookup loading and failure.
- Ineligible existing assignment prompts explicit reselection rather than silent replacement.
- Keyboard navigation, Enter, Escape, and focus work in the drawer.

### 23.3 Create/update tests

- Required/invalid fields prevent API calls.
- Double-click/Enter sends one mutation.
- Drawer waits for the real API promise.
- 400/409 keeps values and maps errors to correct fields.
- Name conflicts are interpreted within the selected faculty.
- Editing the same record does not conflict with itself locally.
- Inactive status loads and submits correctly.
- Successful mutation refreshes list/footer and preserves filters.
- Hidden new/updated records produce explanatory feedback.
- Refresh failure after write success is not reported as write failure.

### 23.4 List/search tests

- Supported query parameter names and uppercase status values are sent.
- Search, faculty, and status combine correctly.
- Blank filters are omitted.
- Old responses cannot replace newer results.
- Empty success differs from error/loading.
- Complete-directory loading handles page boundaries, bounds, partial failures, and duplicate IDs.
- Footer filtered/global counts use correct scopes.
- Server failures never activate demo fallback.

### 23.5 Detail/delete tests

- Correct record is fetched; stale detail is not displayed.
- Department not found differs from faculty not found.
- Initial Delete and Cancel send no DELETE.
- Confirmation sends exactly one DELETE for the selected ID.
- 204 requires no JSON body.
- Assigned-user/program conflicts keep the record visible.
- No cascade/local deactivation occurs.

### 23.6 Authentication and safety tests

- Requests reuse existing auth interception.
- 401 delegates to the central handler.
- 403 is shown without bypass attempts.
- 500/network failures expose no internal exceptions or tokens.
- No backend code/database/auth changes are included in the diff.

### 23.7 Browser/visual tests

- Sign in normally and verify the protected route.
- Compare table, filters, drawer, controls, typography, colors, and spacing with the approved UI.
- Verify existing desktop/mobile breakpoints and horizontal table scrolling.
- Verify faculty text selection/search and dirty cancellation.
- Exercise live persistence only with an authorized disposable test department under an eligible test faculty.
- Do not delete existing university records to demonstrate the flow.
- Record live-verification blockers honestly if credentials or deployment are unavailable.

Required checks:

```sh
npm run lint
npx tsc --noEmit
npm run build
```

Run and document any new test command. Build success alone does not establish live API or visual correctness.

---

## 24. Agent Implementation Instructions

Copyable prompt:

```text
Implement Departments CRUD API integration according to
spec-md/18-api-implementation-departments.md.

Read applicable AGENTS.md/AGENT.md instructions if present, then inspect:
- spec-md/11-departments.md
- spec-md/04-authentication.md
- src/components/departments/
- src/pages/departments/DepartmentsPage.jsx
- src/services/departmentService.ts
- src/services/facultyService.ts
- src/api/apiClient.js
- src/types/department.ts
- src/utils/departments.ts

STRICT RULES:
1. Frontend only. Do not modify backend source, APIs, database, migrations,
   authentication, authorization, or CORS.
2. Preserve existing Figma/UI design and responsive layout.
3. Preserve ONE editable Faculty search/select input with placeholder
   “Search or select a faculty…”. No second search box.
4. Reuse existing components, services, and central Axios/auth client.
5. Reverify source-documented contracts against the current backend.
6. Send exact request keys: departmentCode, departmentName, facultyId, isActive.
7. Send facultyId as a validated number and isActive as a real boolean.
8. Use API faculty records, never fixture IDs or display names as IDs.
9. Do not invent endpoints, counts, records, or persistent success.
10. Report contract mismatches instead of changing the backend.

IMPLEMENT:
- Extend the existing departmentService for list/detail/create/update/delete
  and summary without breaking consumers.
- Replace connected directory fixtures with server records.
- Wire server search/faculty/status filters and accurate footer counts.
- Handle paginated APIs without falsely treating one page as the full list.
- Reuse the Faculty API for eligible assignment lookup and filter labels.
- Preserve combobox query/selection separation, keyboard and retry behavior.
- Await POST from the existing Add Department drawer.
- Load GET detail and reuse existing UI for View/Edit.
- PUT the verified four-field request after validation.
- Confirm before DELETE and handle assigned-user/program conflicts.
- Add request locking, safe errors, read retries, stale-response protection,
  and separate mutation-success/refresh-failure feedback.
- Keep filters after successful mutations; explain hidden results.
- Preserve shared fixtures needed by unrelated modules.
- Add focused tests and run lint, TypeScript, and production build.
- Record contracts, limitations, and verification in
  spec-md/00-changes-and-decisions.md.

FINAL REPORT:
List frontend changes, completed workflows, verified endpoints, test results,
live/visual verification status, and unresolved API limitations.
Confirm backend code and authentication were not modified.
```

---

## 25. Acceptance Criteria

### Design and scope

- [ ] Existing page, table, filters, badges, fonts, colors, spacing, and drawer design remain unchanged.
- [ ] Faculty selection remains one editable search/select field with the approved placeholder.
- [ ] Existing route protection, authentication, and API client are reused.
- [ ] Backend source, APIs, database, and authentication are untouched.
- [ ] Unrelated frontend modules and their required fixtures are preserved.

### Contracts and data

- [ ] Current endpoints, DTOs, page metadata, errors, and permissions are verified.
- [ ] Connected screens and Faculty lookup use backend data.
- [ ] Payload contains the exact four fields and no UI/read-only extras.
- [ ] `facultyId` is a validated positive numeric ID.
- [ ] `isActive` preserves both boolean true and false.
- [ ] Backend faculty names/counts are mapped accurately.
- [ ] Placeholder count limitations are documented, not silently “fixed.”
- [ ] Search/filter parameters use verified names and values.
- [ ] Full-directory/footer semantics do not misrepresent one page as all data.

### Workflows

- [ ] List loads with separate loading/error/empty states and retry.
- [ ] Detail loads the selected server record with no stale display.
- [ ] Create awaits POST and refreshes directory/summary on success.
- [ ] Edit loads fresh data and sends a valid full PUT payload.
- [ ] Delete requires confirmation and handles 204 and dependency conflicts.
- [ ] Failed writes retain form values/rows.
- [ ] Filters persist after writes and hidden results are explained.
- [ ] Mutation success is distinguished from subsequent refresh failure.
- [ ] Double submissions and stale-response overwrites are prevented.

### Faculty selection and validation

- [ ] Only eligible active faculties can be newly assigned.
- [ ] Existing ineligible assignments are handled explicitly, not silently replaced.
- [ ] Arbitrary search text cannot become a submitted faculty ID.
- [ ] Global code and faculty-scoped name conflicts map to correct fields.
- [ ] Code/name limits and required values follow the actual DTOs.
- [ ] Validation provides accessible messages and first-error focus.

### Verification

- [ ] Service/mapping/workflow tests pass.
- [ ] Lint, TypeScript, and production build pass.
- [ ] Keyboard, focus, dirty cancellation, and responsive behavior are verified.
- [ ] Live authenticated results are reported separately from mock/build checks.
- [ ] Decisions and remaining limitations are documented.
- [ ] Blocked operations are reported as pending, never falsely marked complete.

---

## 26. Completion and Handoff

The final implementation report must include:

1. Changed frontend files and workflows.
2. Actual endpoints and request/response contracts used.
3. Faculty lookup eligibility and current-assignment handling.
4. Pagination strategy and footer-count scope.
5. Validation/error behavior and backend count limitations.
6. Automated, browser, and visual verification results, clearly separated.
7. Any missing deployment/contract/permission information that blocks completion.
8. Confirmation that backend code, database, and authentication were not modified.

**Core rule: connect the existing Departments UI to the existing APIs, preserve the approved design and single-field Faculty selector, and make no backend changes.**
