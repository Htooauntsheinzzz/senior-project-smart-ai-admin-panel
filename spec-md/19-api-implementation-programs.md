# 19 — Programs CRUD API Integration Specification

## 1. Purpose and Scope

Connect the existing **Programs & Majors** frontend to the existing backend for list, detail, create, update, and delete workflows. Preserve the approved Figma/UI design and use the existing authentication and centralized Axios client.

This is an implementation specification for Codex, Claude, OpenCode, or another coding agent. This document does not itself implement the feature.

| Item | Requirement |
| --- | --- |
| Application | Smart AI University Student Assistant — Admin Web |
| Module | Academic Management → Programs & Majors |
| Stack | React + Vite + Tailwind CSS + Axios + React Router |
| Existing source conventions | TSX components, TypeScript services/models, JSX page adapter |
| Directory route | `/admin/programs` |
| Existing Add Program state | `/admin/programs?add=1` |
| Design specification | `spec-md/12-programs.md` |
| Related integration references | `spec-md/18-api-implementation-departments.md`, `spec-md/17-api-implementation-faculties.md` |
| Authentication reference | `spec-md/04-authentication.md` |
| Scope | Frontend API integration only |

Follow existing file languages and naming conventions. Do not convert working TSX files to JSX or introduce a new framework.

---

## 2. Non-Negotiable Rules

### 2.1 Preserve the existing design

Do not change:

- Page hierarchy, sidebar, top navigation, branding, or navigation destinations.
- Fonts, colors, spacing, borders, shadows, icons, and responsive breakpoints.
- Table column order, code badges, degree badges, duration/credit cells, or status badges.
- Search and Faculty/Department/Degree/Status filter placement or appearance.
- Drawer width (480px), field order, header, footer, button styling, or radio controls.
- Faculty → Department cascading select behavior and empty-department messaging.
- Shared modal styling, focus restoration, native dialog behavior, or scroll locking.

Add loading, validation, success, and error behavior within the current components and styling. Do not introduce a new table library, form framework, component kit, or notification system.

### 2.2 Preserve Faculty → Department cascading behavior

The Add/Edit Program drawer must continue to have cascading Faculty and Department selects:

- Selecting a Faculty clears the Department if the current Department does not belong to the new Faculty.
- Department options are filtered to the selected Faculty.
- The Department select is disabled when no Faculty is selected.
- Empty-department messaging: "No departments are available for this faculty." (or similar existing copy).
- Preserve the existing `changeProgramFaculty` behavior for dirty-close detection.

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

Do not auto-create the sample program. All submitted values must come from the form.

---

## 3. Existing Frontend Inventory

Inspect these files before editing:

| File | Existing responsibility | Integration direction |
| --- | --- | --- |
| `src/pages/programs/ProgramsPage.jsx` | Protected layout adapter and Add drawer URL state | Retain routing, shell, and drawer space reservation; add edit space |
| `src/components/programs/ProgramsContent.tsx` | Demo list, combined filters, footer counts, Add callback, action placeholder | Replace local data flow with API state |
| `src/components/programs/ProgramsTable.tsx` | Existing program table | Preserve columns/styles; map backend faculty/department/degree labels |
| `src/components/programs/AddProgramDrawer.tsx` | Add form, cascading faculty/department, dirty-close | Await POST/PUT; reuse for edit when practical |
| `src/services/departmentService.ts` | Department API access | Reuse/extend for department lookup |
| `src/services/facultyService.ts` | Faculty API access | Reuse/extend for faculty lookup |
| `src/types/program.ts` | UI program/draft/filter types | Add API models and adapt mapping |
| `src/utils/programs.ts` | Demo filtering, validation, local creation, faculty change helper | Keep reusable pure helpers; remove demo mutation use |
| `src/data/programs.ts` | Demo programs, degrees, durations | Do not use as connected directory/lookup sources |
| `src/data/departments.ts`, `src/data/faculties.ts` | Academic demo fixtures | Do not use as production lookup sources |
| `src/api/apiClient.js` | Shared Axios client and auth interceptors | Reuse unchanged |
| `src/routes/AppRoutes.jsx` | Protected route definitions | Preserve route protection |
| `src/components/ui/Modal.tsx` | Shared dialog styling and behavior | Reuse for details/actions and delete confirmation |

Current UI types:

```ts
type ProgramStatus = 'active' | 'inactive'

interface Program {
  id: string
  code: string
  name: string
  facultyId: string
  departmentId: string
  degreeId: string
  durationYears: number
  totalCredits: number | null
  status: ProgramStatus
}

type ProgramDraft = Omit<Program, 'id' | 'durationYears' | 'totalCredits'> & {
  durationYears: string
  totalCredits: string
}

type ProgramFilters = {
  query: string
  facultyId: string
  departmentId: string
  degreeId: string
  status: string
}

type Degree = { id: string; name: string; background: string; color: string }
```

The UI currently uses `degreeId` to reference a hardcoded `degrees` array with display colors. The backend API uses `degreeLevel` as a free-text string (max 100 chars). The connected implementation must send the degree name string, not an ID. Degree badge colors may be mapped from known names or use a safe default for unknown degree strings.

The UI currently uses strings for selection values. The API requires numeric IDs for `facultyId` and `departmentId`. Handle conversion explicitly at the request boundary.

Inspect consumers before changing exported types/service signatures or removing fixtures. Other academic demo screens may still depend on these files. Avoid unrelated module migration during this task.

---

## 4. User-Supplied Request Contract

```json
{
  "programCode": "CSC",
  "programName": "Computer Science",
  "degreeLevel": "Bachelor of Computer Science",
  "facultyId": 2,
  "departmentId": 2,
  "durationYears": 4,
  "totalCredits": 120,
  "isActive": true
}
```

Send these exact property names:

```text
programCode
programName
degreeLevel
facultyId
departmentId
durationYears
totalCredits
isActive
```

Do not send UI aliases such as `code`, `name`, `degreeId`, or `status` as request properties.

Do not submit `facultyCode`, `facultyNameEn`, `departmentCode`, `departmentName`, an invented program ID, or audit metadata.

The sample `facultyId: 2` and `departmentId: 2` are examples only. They are valid only if that faculty and department exist, are not deleted, and are active in the target backend. Never select arbitrary fallback IDs when lookup loading fails.

---

## 5. Verified Backend Contract and Reverification

The following contract was inspected read-only in the local backend source while preparing this specification. It is source-verified, **not proof of successful requests against the running deployment**.

Before implementing, recheck that the deployed API matches the current controller, DTOs, service, query parser, mapper, and exception handler. Record differences in `spec-md/00-changes-and-decisions.md`.

Source references under the backend package:

```text
feature/program/controller/ProgramController.java
feature/program/dto/ProgramCreateRequest.java
feature/program/dto/ProgramUpdateRequest.java
feature/program/dto/ProgramListQuery.java
feature/program/dto/ProgramResponse.java
feature/program/dto/ProgramListResponse.java
feature/program/dto/ProgramPageResponse.java
feature/program/dto/ProgramSummaryResponse.java
feature/program/service/impl/ProgramServiceImpl.java
feature/program/mapper/ProgramMapper.java
feature/program/exception/
exception/GlobalExceptionHandler.java
```

### 5.1 Endpoints

| Operation | Method and path | Success |
| --- | --- | --- |
| Create | `POST /api/v1/admin/programs` | `201`, program response |
| List | `GET /api/v1/admin/programs` | `200`, page response |
| Summary | `GET /api/v1/admin/programs/summary` | `200`, summary response |
| Detail | `GET /api/v1/admin/programs/{id}` | `200`, program response |
| Update | `PUT /api/v1/admin/programs/{id}` | `200`, program response |
| Delete | `DELETE /api/v1/admin/programs/{id}` | `204`, no response body |

The current update is a full request, not a partial PATCH. Do not invent a status endpoint.

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
- Validate IDs before detail/update/delete and faculty/department selection requests.
- If using JavaScript numbers, require positive safe integers; do not silently round an out-of-range ID.
- The backend performs soft deletion.
- Do not implement frontend cascade deletion or substitute a local inactive status for DELETE.

---

## 6. Exact Validation and Business Rules

| Field | Current backend requirement |
| --- | --- |
| `programCode` | Required, trimmed, max 50 characters, `^[A-Z0-9-]+$` |
| `programName` | Required, trimmed, max 255 characters |
| `degreeLevel` | Required, trimmed, max 100 characters |
| `facultyId` | Required positive numeric ID; faculty must exist, not be deleted, and be active |
| `departmentId` | Required positive numeric ID; department must exist, not be deleted, be active, and belong to the selected faculty |
| `durationYears` | Optional positive integer |
| `totalCredits` | Optional positive integer |
| `isActive` | Boolean; create defaults to true if omitted, but frontend must send an explicit value; update requires it |

Do not invent a `PRG-` prefix requirement. `CSC` is valid under the inspected code pattern.

Do not silently uppercase user input. Preserve entered code and show the verified uppercase/number/hyphen rule when invalid.

Current uniqueness rules:

- Program code is unique globally.
- Program name + degree level combination is unique within a department.
- The backend excludes the current program ID during update uniqueness checks.
- Soft-deleted identifiers remain reserved by backend uniqueness rules.

Do not assume that a code becomes reusable after deleting a program. Do not use incomplete client data to declare a value unique.

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
apiClient.get('/programs', { params })
```

Do not repeat `/api/v1/admin` inside the relative URL or hardcode localhost/backend hosts inside components.

Do not read/store tokens in Program components, manually attach per-component authentication headers, or register an additional 401 handler.

Architecture:

```text
Existing Program UI
  → event/request state
  → programService
  → existing apiClient/auth interceptor
  → existing Program API
  → response adapter
  → existing UI
```

---

## 8. Service Implementation Structure

Create or extend `src/services/programService.ts`, preserving compatible exports used elsewhere.

Required operations:

```ts
getPrograms(params, options?)
getProgramById(id, options?)
createProgram(payload)
updateProgram(id, payload)
deleteProgram(id)
getProgramSummary(options?)
```

Exact function signatures may follow project conventions. Avoid creating two services with conflicting ownership of `/programs`.

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
| `code` | `programCode` | Trim outer whitespace |
| `name` | `programName` | Trim outer whitespace |
| `degreeId` → degree name | `degreeLevel` | Map to the degree name string; if using a free-text input, trim and send directly |
| `facultyId` | `facultyId` | Validate positive integer, then convert to number |
| `departmentId` | `departmentId` | Validate positive integer, then convert to number |
| `durationYears` | `durationYears` | Parse positive integer, or omit/null if blank |
| `totalCredits` | `totalCredits` | Parse positive integer, or omit/null if blank |
| `status` | `isActive` | `status === 'active'` |

Example after validation:

```ts
function buildProgramPayload(value: ProgramDraft) {
  const payload: Record<string, unknown> = {
    programCode: value.code.trim(),
    programName: value.name.trim(),
    degreeLevel: degreeNameFromId(value.degreeId).trim(), // or value.degreeLevel if using text input
    facultyId: Number(value.facultyId),
    departmentId: Number(value.departmentId),
    isActive: value.status === 'active',
  }
  const duration = value.durationYears.trim() ? Number(value.durationYears) : null
  if (duration != null && duration > 0) payload.durationYears = duration
  const credits = value.totalCredits.trim() ? Number(value.totalCredits) : null
  if (credits != null && credits > 0) payload.totalCredits = credits
  return payload
}
```

Invalid faculty/department selections must be rejected before this mapping. `Number('')` produces zero and must never become an accidental request value.

Do not send:

```json
{ "facultyId": "2", "isActive": "false", "degreeLevel": "bsc" }
```

Correct inactive request:

```json
{
  "programCode": "CSC",
  "programName": "Computer Science",
  "degreeLevel": "Bachelor of Computer Science",
  "facultyId": 2,
  "departmentId": 2,
  "durationYears": 4,
  "totalCredits": 120,
  "isActive": false
}
```

Never use `Boolean('false')` or `response.isActive || true`. Preserve explicit false.

Create and PUT currently accept the same fields. Keep separate request types/builders if that helps prevent future contract drift; do not add read-only properties from the GET response.

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
programCode
programName
degreeLevel
facultyId
facultyCode
facultyNameEn
departmentId
departmentCode
departmentName
durationYears
totalCredits
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
| `programCode` | `code` |
| `programName` | `name` |
| `degreeLevel` | Degree badge label; map to known color or default |
| `facultyId` | Faculty selection value |
| `facultyCode`, `facultyNameEn` | Faculty label supplied by API |
| `departmentId` | Department selection value |
| `departmentCode`, `departmentName` | Department label supplied by API |
| `durationYears` | Duration cell |
| `totalCredits` | Credits cell (may be null) |
| `isActive` | Active/Inactive status |

Extend the UI model to retain `facultyNameEn`, `departmentName`, and `degreeLevel`; do not resolve production names through `initialFaculties`, `initialDepartments`, or infer a relation by name similarity.

Stringifying a verified numeric ID for a controlled input is acceptable. Convert back only after validation when sending requests.

Validate required response properties. A malformed response is an error, not an empty collection. Do not use absent status values as Active defaults.

### 10.1 Degree badge colors

The existing UI uses a hardcoded `degrees` array to map `degreeId` to badge `background` and `color`. When switching to API-driven `degreeLevel` strings:

- Maintain a lookup of known degree names to colors for visual consistency.
- For unknown degree strings, use a safe default badge style (e.g., neutral gray background).
- Do not require the backend to send color codes.
- Do not fabricate degree IDs from free-text strings.

---

## 11. Faculty and Department Lookup Integration

Reuse the existing Faculty and Department APIs/services.

Current endpoints include:

```http
GET /api/v1/admin/faculties
GET /api/v1/admin/faculties/{id}
GET /api/v1/admin/departments
GET /api/v1/admin/departments/{id}
```

### 11.1 Assignment options versus filter options

These have different purposes:

- **Form assignment options:** active, non-deleted faculties and departments only, because create/update rejects inactive or deleted entities.
- **Directory Faculty/Department filters:** should include relevant existing entities, including inactive ones where appropriate for browsing. Do not accidentally hide programs because a filter reuses an active-only assignment list.

Preserve current service consumers when extending lookup services. Dedicated lookup helpers using the same service/client are acceptable; duplicate Axios instances are not.

### 11.2 Faculty → Department cascading

Preserve the existing cascading behavior:

```text
Faculty *
[ Select a faculty… ]

Department *
[ Select a department… ] (disabled until faculty selected)
```

- When Faculty changes, clear Department if the current Department does not belong to the new Faculty.
- Department options are filtered to the selected Faculty.
- Department select is disabled when no Faculty is selected.
- When no departments exist for the selected faculty, show the existing empty message.
- Do not auto-select the first department when faculty changes.

### 11.3 Lookup loading and completeness

- Replace fixture-based options with API-backed options.
- Preserve loading, retry, empty-list, and no-matching-result states.
- Do not auto-select the first option after a lookup failure.
- Do not claim all options are available when only one page was fetched.
- Either fetch the suitably bounded complete active option set, or implement verified server search.
- Use stable loaders/callbacks so effect dependencies do not cause repeated request loops.

### 11.4 Editing an unavailable faculty/department assignment

Detail responses include the assigned faculty and department IDs and labels. Preserve that identity while loading lookup data.

If the assignment is now inactive/deleted or absent from complete eligible options:

1. Do not clear it silently or replace it with the first option.
2. Display the existing label where available.
3. Explain that an active entity must be selected before saving if the API no longer accepts the existing assignment.
4. Keep user changes if the backend rejects an entity that became unavailable after selection.

Backend validation remains authoritative; the lookup is not a concurrency guarantee.

---

## 12. Routes and Drawer Reuse

Preserve:

```text
/admin/programs
/admin/programs?add=1
```

Keep the current protected route and the existing 480px adjacent desktop drawer/mobile modal behavior.

Reuse the Add Program drawer for edit mode where practical:

- Mode-specific title and submit label may change to Edit/Update Program.
- The fields, sizing, spacing, and controls remain the same.
- Reserve desktop drawer width when either create or edit is open.
- Do not allow two simultaneous create/edit drawers.
- Dirty-close confirmation must compare against loaded edit values, not empty create defaults.

Reuse row action triggers and existing modal/button patterns for View/Edit/Delete. Do not create a new full-page form or top-level navigation item.

If URL states for detail/edit are added, keep them protected, validate IDs, and preserve unrelated search parameters.

---

## 13. List and Filter Workflow

```text
Open Programs & Majors
  → load directory and filter options
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
| `departmentId` | Optional positive numeric department ID |
| `degreeLevel` | Optional trimmed degree string, max 100 characters |
| `status` | `ACTIVE` or `INACTIVE` |
| `sort` | `field,direction`; supported fields `id`, `programCode`, `programName`, `degreeLevel`, `durationYears`, `totalCredits`, `createdAt` |

Unknown query parameters are rejected. Do not send `isActive`, `query`, `degreeId`, or lowercase status as list query keys/values.

Map UI filters:

```text
query → search
facultyId string → validated numeric facultyId
departmentId string → validated numeric departmentId
degreeId → degree name string → degreeLevel
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

Preserve the existing `Showing X of Y programs` presentation:

- `X`: complete filtered result count, not just one fetched page.
- `Y`: overall non-deleted program total from the existing summary endpoint.
- On initial/failed reads, show loading or unknown values instead of fabricated zero totals.
- When summary fails independently, keep valid directory results and explain the summary failure.

Current summary fields are `totalPrograms`, `activePrograms`, and `inactivePrograms`; verify names from the DTO before coding.

Do not add summary cards just because a summary API exists. Use the endpoint to support the existing footer.

---

## 14. Create Program Workflow

```text
Add Program
  → existing drawer
  → load active Faculty/Department choices
  → complete code, name, degree, faculty, department, duration, credits, status
  → validate
  → map exact payload
  → POST /programs
  → successful response
  → close drawer and refresh list/total
  → existing success feedback
```

Requirements:

1. Start with blank identity/faculty/department fields and Active selected, matching current behavior.
2. Never prefill or submit the sample payload automatically.
3. Await the real mutation promise from the drawer callback; update callback types accordingly.
4. Lock submission immediately and disable duplicate submit/close while pending.
5. Keep form values on validation, lookup, conflict, permission, or network errors.
6. Close/reset only after confirmed mutation success.
7. Use the server ID; never call `crypto.randomUUID()` for a persisted program.
8. Preserve the current directory filters after creation.
9. If filters hide the created program, state this in the existing success message rather than changing filters silently.
10. Refetch affected directory/summary data; do not append a fake local record.

---

## 15. Detail Workflow

```text
Row action → View → validate program ID → GET detail → existing modal
```

- Load current detail from the server.
- Show loading, error, retry, and not-found states using existing styles.
- Show program code/name, faculty label, department label, degree badge, duration, credits, and status.
- Do not show the previously selected program's information during another request.
- Ignore responses when the modal closes or the selected ID changes.
- Preserve API-provided labels even if lookup loading fails.

---

## 16. Edit Program Workflow

```text
Row action → Edit → GET fresh detail
  → populate reused drawer and selected labels
  → user changes fields
  → validation and payload mapping
  → PUT /programs/{id}
  → success → close and refresh
```

Requirements:

- Do not enable an empty edit form while detail loading is incomplete or failed.
- Preserve inactive status; do not default a returned false value to true.
- Establish the dirty baseline from fetched data.
- Preserve the existing faculty/department assignment until the user explicitly changes it or resolves an eligibility error.
- Validate newly selected faculty/department with the same active-option rules as create.
- Faculty → Department cascading must still work correctly in edit mode.
- Do not report the unchanged code/name/degree as a duplicate against the same record.
- Name+degree uniqueness is department-scoped; moving a program may conflict in the destination department.
- PUT includes all required fields, not only changed fields.
- Do not send display labels, audit fields, or the record ID in the body.
- Keep edits on failure and prevent repeated saves while pending.
- Clear stale form/error state when switching between records or between create/edit.
- Refresh server data after success while preserving filters.

---

## 17. Delete Program Workflow

```text
Delete action → confirmation modal → explicit Confirm
  → DELETE /programs/{id}
  → 204 success → close modal → refetch list and total
```

Rules:

- The initial Delete click never issues DELETE.
- Identify the program by server ID and show its code/name in confirmation.
- Cancel/Escape/close before submission sends no request.
- Lock the operation while pending.
- Do not remove the row optimistically.
- Do not attempt to read JSON from a 204 response.
- On failure, preserve the record and confirmation context with safe feedback.
- Do not implement cascade deletion, direct database cleanup, or frontend-only soft deletion.
- Use language consistent with the backend's directory removal; do not claim permanent physical deletion.

---

## 18. Validation Feedback

Examples:

```text
Program code is required.
Use at most 50 uppercase letters, numbers, or hyphens.
Program name is required.
Use at most 255 characters.
Degree level is required.
Use at most 100 characters.
Select a faculty.
Select a department within the chosen faculty.
Duration must be a positive whole number.
Total credits must be a positive whole number.
This program code is already in use.
This program already exists in this department with the same name and degree level.
```

Client validation must reject:

- Blank/whitespace-only required text.
- Overlength or unsupported code characters.
- Missing faculty/department selection, arbitrary search text, zero/negative/fractional/unsafe IDs.
- Invalid status values.
- Non-numeric or non-positive duration/credits when provided.

Keep all entered values after rejection. Do not replace fields with example defaults.

Use existing error styles, `aria-invalid`, and `aria-describedby`. Focus the first invalid enabled control.

Backend uniqueness and eligibility remain authoritative. Local checks over a filtered page cannot prove validity.

---

## 19. Error Handling and Verified Codes

Use known error codes and safe copy. Do not render arbitrary backend exception messages.

| Status/code | Required behavior |
| --- | --- |
| 400 `VALIDATION_ERROR` | Safe form-level validation message unless verified field errors are supplied |
| 400 `INVALID_PROGRAM_DEPARTMENT` | Department field error: inactive or does not belong to faculty |
| 404 `FACULTY_NOT_FOUND` | Faculty field error for a mutation |
| 404 `DEPARTMENT_NOT_FOUND` | Department field error for a mutation |
| 404 `PROGRAM_NOT_FOUND` | Program not found; prevent stale edit/delete |
| 409 `PROGRAM_CODE_ALREADY_EXISTS` | Map to code field |
| 409 `PROGRAM_ALREADY_EXISTS` | Map to name/degree fields; explain department-scoped conflict |
| 401 | Existing central auth handling only |
| 403 | Access denied/password-change restriction according to existing architecture |
| Other 409 | Safe conflict/reload message; preserve edits |
| 500/503 | Generic retryable error; no SQL/Java/internal details |
| Network/timeout | Connection feedback; preserve entered values |
| Cancelled read | Ignore without an error toast |
| Malformed success body | Contract error, not fake/empty success |

Differentiate faculty/department/program 404s using the documented code. Do not reuse a generic error helper that labels every 404 as the same entity.

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
Department lookup loading/error
Detail loading/error
Create/update pending/error
Delete pending/error
Success feedback
```

An unrelated lookup or list failure must not erase form values or replace a successful mutation message.

---

## 21. Accessibility, Concurrency, and State Cleanup

Preserve:

- Existing 480px desktop drawer and modal behavior below 1280px.
- Desktop content-space reservation for edit as well as create.
- Focus restoration to the initiating action.
- Dialog Escape handling, scroll locking, and dirty cancellation.
- Faculty → Department cascading select behavior.
- English/Thai name rendering where applicable.

Use polite status announcements for loading/success and alerts for failures. Avoid simultaneous competing dialogs or drawers.

Do not allow pending mutations to be dismissed in a way that encourages resubmission. Cancelling a fetch does not guarantee cancellation of a server-side write.

Abort or ignore obsolete reads on unmount, filter changes, lookup changes, and selected-record changes. Use stable dependencies to avoid effect/request loops.

---

## 22. Demo-to-API Migration

Remove from the connected Programs runtime path:

```text
useState(initialPrograms) as the directory source
initialFaculties as authoritative production lookup data
initialDepartments as authoritative production lookup data
degrees as the source of degree levels for API requests
createDemoProgram as successful creation
Generated local record IDs
Local-only success/persistence messages
```

Do not delete shared fixtures/helpers until their consumers have been inspected. Other local-demo modules remain outside this task.

Audit `ProgramsTable` and the drawer for hidden fixture-based name resolution; replacing only the outer list state is insufficient.

Refresh related visible Program data after mutations. Do not migrate unrelated Admin User, Faculty, Department, Course, or Student screens under this task.

---

## 23. Testing Plan

Use existing project tooling and focused tests. Keep mocked contract tests distinct from live authenticated verification.

### 23.1 Request and response tests

- Exact create/update property names including `programCode`, `programName`, `degreeLevel`.
- Faculty and department IDs are numeric, including sample values when selected from verified data.
- Boolean false remains false.
- Optional `durationYears` and `totalCredits` omitted when blank; included as positive integers when provided.
- Whitespace normalization and field limits follow DTO behavior.
- List/detail faculty/department/degree labels map from API data, not fixtures.
- Unexpected response wrappers/types are handled safely.
- Invalid program, faculty, and department IDs are rejected before HTTP requests.

### 23.2 Faculty/department cascading tests

- Faculty change clears incompatible department.
- Department options filter to selected faculty.
- Department select disabled when no faculty selected.
- Empty-department state shown when faculty has no departments.
- Form assignment options exclude inactive/deleted entities.
- Directory filter behavior does not accidentally use only assignment-eligible options.
- Existing edit assignment survives lookup loading and failure.
- Ineligible existing assignment prompts explicit reselection.

### 23.3 Create/update tests

- Required/invalid fields prevent API calls.
- Double-click/Enter sends one mutation.
- Drawer waits for the real API promise.
- 400/409 keeps values and maps errors to correct fields.
- Name+degree conflicts are interpreted within the selected department.
- Editing the same record does not conflict with itself locally.
- Inactive status loads and submits correctly.
- Successful mutation refreshes list/footer and preserves filters.
- Hidden new/updated records produce explanatory feedback.
- Refresh failure after write success is not reported as write failure.

### 23.4 List/search tests

- Supported query parameter names and uppercase status values are sent.
- Search, faculty, department, degree, and status combine correctly.
- Blank filters are omitted.
- Old responses cannot replace newer results.
- Empty success differs from error/loading.
- Complete-directory loading handles page boundaries, bounds, partial failures, and duplicate IDs.
- Footer filtered/global counts use correct scopes.
- Server failures never activate demo fallback.

### 23.5 Detail/delete tests

- Correct record is fetched; stale detail is not displayed.
- Program not found differs from faculty/department not found.
- Initial Delete and Cancel send no DELETE.
- Confirmation sends exactly one DELETE for the selected ID.
- 204 requires no JSON body.
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
- Verify faculty/department cascading and dirty cancellation.
- Exercise live persistence only with an authorized disposable test program under an eligible test faculty/department.
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
Implement Programs CRUD API integration according to
spec-md/19-api-implementation-programs.md.

Read applicable AGENTS.md/AGENT.md instructions if present, then inspect:
- spec-md/12-programs.md
- spec-md/04-authentication.md
- src/components/programs/
- src/pages/programs/ProgramsPage.jsx
- src/services/facultyService.ts
- src/services/departmentService.ts
- src/api/apiClient.js
- src/types/program.ts
- src/utils/programs.ts
- src/data/programs.ts

STRICT RULES:
1. Frontend only. Do not modify backend source, APIs, database, migrations,
   authentication, authorization, or CORS.
2. Preserve existing Figma/UI design and responsive layout.
3. Preserve Faculty → Department cascading select behavior.
4. Reuse existing components, services, and central Axios/auth client.
5. Reverify source-documented contracts against the current backend.
6. Send exact request keys: programCode, programName, degreeLevel, facultyId,
   departmentId, durationYears, totalCredits, isActive.
7. Send facultyId and departmentId as validated numbers; isActive as real boolean.
8. degreeLevel is the degree NAME string, not an ID. Map known degree names to
   badge colors; use a safe default for unknown degree strings.
9. Use API faculty/department records, never fixture IDs or display names as IDs.
10. Do not invent endpoints, counts, records, or persistent success.
11. Report contract mismatches instead of changing the backend.

IMPLEMENT:
- Create src/services/programService.ts for list/detail/create/update/delete
  and summary.
- Replace connected directory fixtures with server records.
- Wire server search/faculty/department/degree/status filters and accurate footer.
- Handle paginated APIs without falsely treating one page as the full list.
- Reuse Faculty and Department APIs for eligible assignment lookup and filter labels.
- Preserve cascading faculty/department behavior, keyboard navigation, and retry.
- Await POST/PUT from the existing Add Program drawer.
- Load GET detail and reuse existing UI for View/Edit.
- PUT the verified payload after validation.
- Confirm before DELETE and handle conflicts.
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
- [ ] Faculty → Department cascading behavior preserved.
- [ ] Existing route protection, authentication, and API client are reused.
- [ ] Backend source, APIs, database, and authentication are untouched.
- [ ] Unrelated frontend modules and their required fixtures are preserved.

### Contracts and data

- [ ] Current endpoints, DTOs, page metadata, errors, and permissions are verified.
- [ ] Connected screens and lookups use backend data.
- [ ] Payload contains the exact fields and no UI/read-only extras.
- [ ] `facultyId` and `departmentId` are validated positive numeric IDs.
- [ ] `isActive` preserves both boolean true and false.
- [ ] `degreeLevel` is sent as the degree name string, not an ID.
- [ ] Backend faculty/department/degree labels are mapped accurately.
- [ ] Search/filter parameters use verified names and values.
- [ ] Full-directory/footer semantics do not misrepresent one page as all data.

### Workflows

- [ ] List loads with separate loading/error/empty states and retry.
- [ ] Detail loads the selected server record with no stale display.
- [ ] Create awaits POST and refreshes directory/summary on success.
- [ ] Edit loads fresh data and sends a valid full PUT payload.
- [ ] Delete requires confirmation and handles 204 and conflicts.
- [ ] Failed writes retain form values/rows.
- [ ] Filters persist after writes and hidden results are explained.
- [ ] Mutation success is distinguished from subsequent refresh failure.
- [ ] Double submissions and stale-response overwrites are prevented.

### Faculty/department selection and validation

- [ ] Only eligible active faculties/departments can be newly assigned.
- [ ] Existing ineligible assignments are handled explicitly, not silently replaced.
- [ ] Faculty → Department cascading works correctly in both create and edit.
- [ ] Global code and department-scoped name+degree conflicts map to correct fields.
- [ ] Field limits and required values follow the actual DTOs.
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
3. Faculty/department lookup eligibility and current-assignment handling.
4. Pagination strategy and footer-count scope.
5. Validation/error behavior and degree-level mapping approach.
6. Automated, browser, and visual verification results, clearly separated.
7. Any missing deployment/contract/permission information that blocks completion.
8. Confirmation that backend code, database, and authentication were not modified.

**Core rule: connect the existing Programs UI to the existing APIs, preserve the approved design and Faculty→Department cascading behavior, and make no backend changes.**
