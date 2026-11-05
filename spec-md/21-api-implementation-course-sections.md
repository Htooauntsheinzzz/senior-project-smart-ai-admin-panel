# 21 — Course Sections CRUD API Integration Specification

## 1. Purpose and Scope

Connect the existing **Course Sections** frontend to the existing backend for list, detail, create, update, and delete workflows. Preserve the approved Figma/UI design and use the existing authentication and centralized Axios client.

This is an implementation specification for Codex, Claude, OpenCode, or another coding agent. This document does not itself implement the feature.

| Item | Requirement |
| --- | --- |
| Application | Smart AI University Student Assistant — Admin Web |
| Module | Academic Management → Course Sections |
| Stack | React + Vite + Tailwind CSS + Axios + React Router |
| Existing source conventions | TSX components, TypeScript services/models, JSX page adapter |
| Directory route | `/admin/sections` |
| Existing Create Section state | `/admin/sections?add=1` |
| Design specification | `spec-md/14-course-sections.md` |
| Related integration references | `spec-md/20-api-implementation-courses.md`, `spec-md/19-api-implementation-programs.md` |
| Authentication reference | `spec-md/04-authentication.md` |
| Scope | Frontend API integration only |

Follow existing file languages and naming conventions. Do not convert working TSX files to JSX or introduce a new framework.

---

## 2. Non-Negotiable Rules

### 2.1 Preserve the existing design

Do not change:

- Page hierarchy, sidebar, top navigation, branding, or navigation destinations.
- Fonts, colors, spacing, borders, shadows, icons, and responsive breakpoints.
- Table column order, course code badges, section numbers, lecturer names, room/schedule cells, capacity meters, semester badges, or status badges.
- Summary card layout, icons, or metric order (Total, Active, Full, Total Enrolled).
- Search and Course/Semester/Year/Lecturer/Status filter placement or appearance.
- Drawer width (480px), field order, header, footer, button styling, or radio controls.
- Shared modal styling, focus restoration, native dialog behavior, or scroll locking.

Add loading, validation, success, and error behavior within the current components and styling. Do not introduce a new table library, form framework, component kit, or notification system.

### 2.2 Preserve capacity meter and computed status behavior

The table must continue to show:

- A capacity progress bar (meter) with color coding.
- Computed status: `Active` (not full, not closed), `Full` (enrolled >= capacity), `Closed` (status is closed).
- The backend provides `status` (`ACTIVE`/`CLOSED`) and `isFull` boolean. The UI computes `Full` from `isFull` or `enrolledCount >= capacity`, not from backend status alone.

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

Do not auto-create the sample section. All submitted values must come from the form.

---

## 3. Existing Frontend Inventory

Inspect these files before editing:

| File | Existing responsibility | Integration direction |
| --- | --- | --- |
| `src/pages/sections/SectionsPage.jsx` | Protected layout adapter and Create drawer URL state | Retain routing, shell, and drawer space reservation; add edit space |
| `src/components/sections/SectionsContent.tsx` | Demo list, summary cards, combined filters, footer counts, Create callback, action placeholder | Replace local data flow with API state |
| `src/components/sections/SectionsTable.tsx` | Existing section table | Preserve columns/styles; map backend course/lecturer/semester labels |
| `src/components/sections/CreateSectionDrawer.tsx` | Create form and dirty-close behavior | Await POST; reuse for edit when practical |
| `src/services/courseService.ts` | Course API access | Reuse/extend for course lookup |
| `src/services/courseService.ts` (semester) | Semester API access | Reuse for semester lookup |
| `src/types/courseSection.ts` | UI section/draft/filter types | Add API models and adapt mapping |
| `src/utils/courseSections.ts` | Demo filtering, validation, totals, capacity meter, local creation | Keep reusable pure helpers; remove demo mutation use |
| `src/data/courseSections.ts` | Demo sections, lecturers, semesters, years | Do not use as connected directory/lookup sources |
| `src/data/courses.ts` | Academic demo fixtures | Do not use as production lookup source |
| `src/api/apiClient.js` | Shared Axios client and auth interceptors | Reuse unchanged |
| `src/routes/AppRoutes.jsx` | Protected route definitions | Preserve route protection |
| `src/components/ui/Modal.tsx` | Shared dialog styling and behavior | Reuse for details/actions and delete confirmation |

Current UI types:

```ts
type CourseSection = {
  id: string
  courseId: string
  number: string
  lecturerId: string
  room: string
  schedule: string
  capacity: number
  enrolled: number
  semester: string
  academicYear: string
  status: 'active' | 'closed'
}

type SectionDraft = Omit<CourseSection, 'id' | 'enrolled' | 'capacity'> & {
  capacity: string
}

type SectionFilters = {
  query: string
  courseId: string
  semester: string
  academicYear: string
  lecturerId: string
  status: string
}
```

The UI currently uses `lecturerId` but the API uses `lectureId`. The UI currently uses `semester` as a string (`1/2568`) and `academicYear` as a string (`2024`), but the API uses `semesterId` as a numeric ID. The UI currently uses `number` but the API uses `sectionNumber`.

The UI currently uses fixture-based lecturer options with local IDs. The API uses numeric `lectureId` values. Lecturer lookup requires a separate API; verify at implementation time whether `/api/v1/admin/lecturers` or similar exists.

Inspect consumers before changing exported types/service signatures or removing fixtures. Other academic demo screens may still depend on these files. Avoid unrelated module migration during this task.

---

## 4. User-Supplied Request Contract

```json
{
  "courseId": 8,
  "sectionNumber": "141",
  "capacity": 45,
  "lectureId": 4,
  "room": "B11-701",
  "schedule": "Mon/Tues 02:00-4:00",
  "semesterId": 5,
  "status": "ACTIVE"
}
```

Send these exact property names:

```text
courseId
sectionNumber
capacity
lectureId
room
schedule
semesterId
status
```

Do not send UI aliases such as `number`, `lecturerId`, `semester`, `academicYear`, or lowercase `status` as request properties.

Do not submit `courseCode`, `courseName`, `lectureNameTh`, `lectureNameEn`, `lectureNickname`, `semesterNameTh`, `semesterNameEn`, `enrolledCount`, `isFull`, an invented section ID, or audit metadata.

The sample IDs are examples only. They are valid only if those entities exist, are not deleted, and are active in the target backend. Never select arbitrary fallback IDs when lookup loading fails.

---

## 5. Verified Backend Contract and Reverification

The following contract was inspected read-only in the local backend source while preparing this specification. It is source-verified, **not proof of successful requests against the running deployment**.

Before implementing, recheck that the deployed API matches the current controller, DTOs, service, query parser, mapper, and exception handler. Record differences in `spec-md/00-changes-and-decisions.md`.

Source references under the backend package:

```text
feature/coursesection/controller/CourseSectionController.java
feature/coursesection/dto/CourseSectionCreateRequest.java
feature/coursesection/dto/CourseSectionUpdateRequest.java
feature/coursesection/dto/CourseSectionListQuery.java
feature/coursesection/dto/CourseSectionResponse.java
feature/coursesection/dto/CourseSectionListResponse.java
feature/coursesection/dto/CourseSectionPageResponse.java
feature/coursesection/dto/CourseSectionSummaryResponse.java
feature/coursesection/service/impl/CourseSectionServiceImpl.java
feature/coursesection/mapper/CourseSectionMapper.java
feature/coursesection/exception/
exception/GlobalExceptionHandler.java
```

### 5.1 Endpoints

| Operation | Method and path | Success |
| --- | --- | --- |
| Create | `POST /api/v1/admin/course-sections` | `201`, section response |
| List | `GET /api/v1/admin/course-sections` | `200`, page response |
| Summary | `GET /api/v1/admin/course-sections/summary` | `200`, summary response |
| Detail | `GET /api/v1/admin/course-sections/{id}` | `200`, section response |
| Update | `PUT /api/v1/admin/course-sections/{id}` | `200`, section response |
| Delete | `DELETE /api/v1/admin/course-sections/{id}` | `204`, no response body |

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
- Validate IDs before detail/update/delete and entity selection requests.
- If using JavaScript numbers, require positive safe integers; do not silently round an out-of-range ID.
- The backend performs soft deletion.
- Do not implement frontend cascade deletion or substitute a local inactive status for DELETE.

---

## 6. Exact Validation and Business Rules

| Field | Current backend requirement |
| --- | --- |
| `courseId` | Required positive numeric ID; course must exist, not be deleted, and be active |
| `sectionNumber` | Required, trimmed, max 20 characters |
| `capacity` | Optional positive integer; create defaults if omitted |
| `lectureId` | Required positive numeric ID; lecturer must exist and be active |
| `room` | Optional, trimmed, max 100 characters; blank → null |
| `schedule` | Optional, trimmed, max 255 characters; blank → null |
| `semesterId` | Required positive numeric ID; semester must exist |
| `status` | Required string; supported values: `ACTIVE`, `CLOSED` |

Do not silently uppercase user input. Preserve entered values and show the verified rule when invalid.

Current uniqueness rules:

- Section number + course + semester combination is unique.
- The backend excludes the current section ID during update uniqueness checks.
- Soft-deleted identifiers remain reserved by backend uniqueness rules.

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
apiClient.get('/course-sections', { params })
```

Do not repeat `/api/v1/admin` inside the relative URL or hardcode localhost/backend hosts inside components.

Do not read/store tokens in Section components, manually attach per-component authentication headers, or register an additional 401 handler.

Architecture:

```text
Existing Section UI
  → event/request state
  → sectionService
  → existing apiClient/auth interceptor
  → existing Course Section API
  → response adapter
  → existing UI
```

---

## 8. Service Implementation Structure

Create `src/services/sectionService.ts`.

Required operations:

```ts
getSections(params, options?)
getSectionById(id, options?)
createSection(payload)
updateSection(id, payload)
deleteSection(id)
getSectionSummary(options?)
```

Exact function signatures may follow project conventions. Avoid creating two services with conflicting ownership of `/course-sections`.

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
| `courseId` | `courseId` | Validate positive integer, then convert to number |
| `number` | `sectionNumber` | Trim outer whitespace |
| `capacity` | `capacity` | Parse positive integer; omit if blank (backend may default) |
| `lecturerId` | `lectureId` | Validate positive integer, then convert to number |
| `room` | `room` | Trim; empty/null if blank |
| `schedule` | `schedule` | Trim; empty/null if blank |
| `term` (semester ID) | `semesterId` | Validate positive integer, then convert to number |
| `status` | `status` | Uppercase: `active` → `ACTIVE`, `closed` → `CLOSED` |

Example after validation:

```ts
function buildSectionPayload(value: SectionDraft) {
  const payload: Record<string, unknown> = {
    courseId: Number(value.courseId),
    sectionNumber: value.number.trim(),
    lectureId: Number(value.lecturerId),
    semesterId: Number(value.term), // term stores semester ID string
    status: value.status === 'active' ? 'ACTIVE' : 'CLOSED',
  }
  if (value.capacity.trim()) payload.capacity = Number(value.capacity)
  const room = value.room.trim() || null
  if (room) payload.room = room
  const schedule = value.schedule.trim() || null
  if (schedule) payload.schedule = schedule
  return payload
}
```

Invalid entity selections must be rejected before this mapping. `Number('')` produces zero and must never become an accidental request value.

Do not send:

```json
{ "courseId": "8", "status": "active", "lecturerId": "4" }
```

Correct request:

```json
{
  "courseId": 8,
  "sectionNumber": "141",
  "capacity": 45,
  "lectureId": 4,
  "room": "B11-701",
  "schedule": "Mon/Tues 02:00-4:00",
  "semesterId": 5,
  "status": "ACTIVE"
}
```

Never use `toUpperCase()` on null or send lowercase status. Preserve explicit `CLOSED`.

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
courseId
courseCode
courseName
sectionNumber
lectureId
lectureNameEn
lectureNameTh
room
schedule
capacity
enrolledCount
isFull
semesterId
semesterNameEn
semesterNameTh
status
createdAt
updatedAt
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
| `courseId` | Course selection value |
| `courseCode`, `courseName` | Course badge and label |
| `sectionNumber` | `number` |
| `lectureId` | `lecturerId` |
| `lectureNameEn`, `lectureNameTh` | Lecturer display name |
| `room` | Room cell |
| `schedule` | Schedule cell |
| `capacity` | Capacity meter max |
| `enrolledCount` | Capacity meter current value |
| `isFull` | Full status computation |
| `semesterId` | Semester selection value |
| `semesterNameEn`, `semesterNameTh` | Semester badge display |
| `status` | `ACTIVE` → `active`, `CLOSED` → `closed` |

Important: The API uses `lectureId` (not `lecturerId`). Map this carefully at the request/response boundary without changing the UI field name if that would break existing styling.

For the semester display, use `semesterNameEn` or `semesterNameTh` from the API. The current UI displays `semester` and `academicYear`. If the API provides semester name strings, use them. The `academicYear` field may be derived from semester name or omitted if not provided.

For capacity meter and computed status:
- `isFull` from API determines `Full` status.
- `status === 'CLOSED'` determines `Closed` status.
- Otherwise, the section is `Active`.
- Capacity bar colors: use the existing `capacityColor` helper with `enrolledCount` and `capacity`.

Validate required response properties. A malformed response is an error, not an empty collection.

---

## 11. Course, Semester, and Lecturer Lookup Integration

Reuse the existing Course and Semester APIs/services. Lecturer lookup requires a separate API call.

Current endpoints include:

```http
GET /api/v1/admin/courses
GET /api/v1/admin/courses/{id}
GET /api/v1/admin/semesters
GET /api/v1/admin/semesters/{id}
```

Lecturer endpoints (verify at implementation time):

```http
GET /api/v1/admin/lecturers
GET /api/v1/admin/lecturers/{id}
```

### 11.1 Assignment options versus filter options

- **Form assignment options:** active, non-deleted entities only.
- **Directory filter options:** should include relevant existing entities, including inactive ones where appropriate for browsing.

Preserve current service consumers when extending lookup services. Dedicated lookup helpers are acceptable; duplicate Axios instances are not.

### 11.2 Semester mapping

The UI currently uses term strings like `1/2568`, `2/2568`, `Summer/2568` combined with `academicYear` like `2024`. The API uses `semesterId` as a numeric ID.

For create/edit:
- Load semesters from the backend.
- Display semester names (e.g., `Semester 1/2568`).
- Submit the selected semester's ID as `semesterId`.
- The `academicYear` field in the UI may be derived from the semester name or omitted.

For listing:
- The API response includes `semesterNameTh` and `semesterNameEn`. Use these for display.
- If semester is null, display "Not assigned".

### 11.3 Lecturer mapping

The UI currently uses `lecturerId` with fixture lecturers. The API uses `lectureId`.

- Load lecturers from the backend if a lecturer API exists.
- Display `lectureNameEn` or `lectureNameTh`.
- Map the selected lecturer's numeric ID to `lectureId` in requests.
- If no lecturer API exists, the form may need to accept a numeric lecture ID directly or use a text input.

### 11.4 Lookup loading and completeness

- Replace fixture-based options with API-backed options.
- Preserve loading, retry, empty-list states.
- Do not auto-select the first option after a lookup failure.
- Use stable loaders/callbacks so effect dependencies do not cause repeated request loops.

---

## 12. Routes and Drawer Reuse

Preserve:

```text
/admin/sections
/admin/sections?add=1
```

Keep the current protected route and the existing 480px adjacent desktop drawer/mobile modal behavior.

Reuse the Create Section drawer for edit mode where practical:

- Mode-specific title and submit label may change to Edit/Update Section.
- The fields, sizing, spacing, and controls remain the same.
- Reserve desktop drawer width when either create or edit is open.
- Do not allow two simultaneous create/edit drawers.
- Dirty-close confirmation must compare against loaded edit values, not empty create defaults.

Reuse row action triggers and existing modal/button patterns for View/Edit/Delete. Do not create a new full-page form or top-level navigation item.

If URL states for detail/edit are added, keep them protected, validate IDs, and preserve unrelated search parameters.

---

## 13. List and Filter Workflow

```text
Open Course Sections
  → load directory and filter options
  → loading state
  → map API page records
  → render existing table, summary cards, and footer
```

Verified list query parameters:

| Parameter | Current contract |
| --- | --- |
| `page` | Zero-based nonnegative integer; default 0 |
| `size` | 1–100; default 20 |
| `search` | Trimmed, optional, max 255 characters |
| `courseId` | Optional positive numeric course ID |
| `semesterId` | Optional positive numeric semester ID |
| `lectureId` | Optional positive numeric lecturer ID |
| `status` | `ACTIVE` or `CLOSED` |
| `sort` | `field,direction`; supported fields `id`, `sectionNumber`, `capacity`, `status`, `room`, `createdAt`, `updatedAt` |

Unknown query parameters are rejected. Do not send `isFull`, `query`, or lowercase status as list query keys/values.

Map UI filters:

```text
query → search
courseId string → validated numeric courseId
term (semester ID) → semesterId
lecturerId string → validated numeric lectureId
status active → ACTIVE / closed → CLOSED / full → omitted (computed from isFull)
empty filter → omitted parameter
```

Note: The UI has a "Full" status filter option, but the backend list query only supports `ACTIVE`/`CLOSED`. The "Full" filter should be applied client-side over the fetched results, or omitted if not supported by the API.

Combined filters use the server's AND behavior. Debounce search approximately 250–400 ms. Ignore or abort old reads so they cannot overwrite new results.

Reset the internal server page when filters change. Keep input values on retry. Clear obsolete displayed rows while a new result is pending, or explicitly mark them stale.

### 13.1 No-pagination design

The existing screen has a directory table and a count footer, not a demonstrated pagination control.

To preserve the design:

- Read all matching documented pages when the directory is suitably bounded.
- Use a stable sort such as `id,asc` and a valid page size.
- Bound the total work, for example 20 pages/2,000 records, and document the chosen frontend limit.
- Do not silently truncate when the limit is exceeded; show safe feedback to narrow filters or request a design decision for pagination.
- Reject partial loads and inconsistent totals/duplicate IDs; offer a read retry.

### 13.2 Summary cards

Preserve the existing summary cards:

- **Total Sections**: from `totalSections` in summary response.
- **Active Sections**: from `activeSections` in summary response.
- **Full Sections**: from `fullSections` in summary response.
- **Total Enrolled**: from `totalEnrolled` in summary response.

On initial/failed reads, show loading or unknown values (`—`) instead of fabricated zero totals.

### 13.3 Footer semantics

Preserve the existing `Showing X of Y sections` and `enrolled / capacity` presentation:

- `X`: complete filtered result count, not just one fetched page.
- `Y`: overall non-deleted section total from the summary endpoint or directory count.
- Enrolled/capacity: sum of filtered results.

---

## 14. Create Section Workflow

```text
Create Section
  → existing drawer
  → load active Course/Lecturer/Semester choices
  → complete course, section number, capacity, lecturer, room, schedule, semester, status
  → validate
  → map exact payload
  → POST /course-sections
  → successful response
  → close drawer and refresh list/summary
  → existing success feedback
```

Requirements:

1. Start with blank identity fields and Active selected, matching current behavior.
2. Never prefill or submit the sample payload automatically.
3. Await the real mutation promise from the drawer callback; update callback types accordingly.
4. Lock submission immediately and disable duplicate submit/close while pending.
5. Keep form values on validation, lookup, conflict, permission, or network errors.
6. Close/reset only after confirmed mutation success.
7. Use the server ID; never call `crypto.randomUUID()` for a persisted section.
8. Preserve the current directory filters after creation.
9. If filters hide the created section, state this in the existing success message rather than changing filters silently.
10. Refetch affected directory/summary data; do not append a fake local record.

---

## 15. Detail Workflow

```text
Row action → View → validate section ID → GET detail → existing modal
```

- Load current detail from the server.
- Show loading, error, retry, and not-found states using existing styles.
- Show course code/name, section number, lecturer name, room, schedule, capacity meter, semester, and status.
- Do not show the previously selected section's information during another request.
- Ignore responses when the modal closes or the selected ID changes.
- Preserve API-provided labels even if lookup loading fails.

---

## 16. Edit Section Workflow

```text
Row action → Edit → GET fresh detail
  → populate reused drawer and selected entity labels
  → user changes fields
  → validation and payload mapping
  → PUT /course-sections/{id}
  → success → close and refresh
```

Requirements:

- Do not enable an empty edit form while detail loading is incomplete or failed.
- Preserve closed status; do not default a returned `CLOSED` to `ACTIVE`.
- Establish the dirty baseline from fetched data.
- Preserve the existing entity assignments until the user explicitly changes them or resolves an eligibility error.
- Do not report the unchanged section number as a duplicate against the same record.
- PUT includes all required fields, not only changed fields.
- Do not send display labels, audit fields, or the record ID in the body.
- Keep edits on failure and prevent repeated saves while pending.
- Clear stale form/error state when switching between records or between create/edit.
- Refresh server data after success while preserving filters.

---

## 17. Delete Section Workflow

```text
Delete action → confirmation modal → explicit Confirm
  → DELETE /course-sections/{id}
  → 204 success → close modal → refetch list and summary
```

Rules:

- The initial Delete click never issues DELETE.
- Identify the section by server ID and show its course code/section number in confirmation.
- Cancel/Escape/close before submission sends no request.
- Lock the operation while pending.
- Do not remove the row optimistically.
- Do not attempt to read JSON from a 204 response.
- On failure, preserve the record and confirmation context with safe feedback.
- Do not implement cascade deletion or frontend-only soft deletion.

---

## 18. Validation Feedback

Examples:

```text
Select a course.
Section number is required.
Use at most 20 characters.
Enter a positive whole-number capacity, or leave blank for default.
Select a lecturer.
Room must be at most 100 characters.
Schedule must be at most 255 characters.
Select a semester.
Select a valid status.
This section already exists for this course and semester.
```

Client validation must reject:

- Blank/whitespace-only required text.
- Overlength fields.
- Missing course/lecturer/semester selection, zero/negative/fractional/unsafe IDs.
- Invalid status values.
- Non-numeric or non-positive capacity when provided.

Keep all entered values after rejection. Do not replace fields with example defaults.

Use existing error styles, `aria-invalid`, and `aria-describedby`. Focus the first invalid enabled control.

Backend uniqueness and eligibility remain authoritative.

---

## 19. Error Handling and Verified Codes

Use known error codes and safe copy. Do not render arbitrary backend exception messages.

| Status/code | Required behavior |
| --- | --- |
| 400 `VALIDATION_ERROR` | Safe form-level validation message |
| 400 `INVALID_COURSE_SECTION_COURSE` | Course field error: inactive course |
| 400 `INVALID_COURSE_SECTION_LECTURER` | Lecturer field error: invalid lecturer |
| 400 `INVALID_COURSE_SECTION_STATUS` | Status field error |
| 404 `COURSE_SECTION_NOT_FOUND` | Section not found; prevent stale edit/delete |
| 409 `COURSE_SECTION_ALREADY_EXISTS` | Section number conflict for course and semester |
| 401 | Existing central auth handling only |
| 403 | Access denied/password-change restriction |
| Other 409 | Safe conflict/reload message; preserve edits |
| 500/503 | Generic retryable error; no SQL/Java/internal details |
| Network/timeout | Connection feedback; preserve entered values |
| Cancelled read | Ignore without an error toast |
| Malformed success body | Contract error, not fake/empty success |

Differentiate entity-related errors using the documented code. Do not reuse a generic error helper.

Safe fallback:

```text
Unable to complete the request. Please try again.
```

No automatic retries for writes following an ambiguous timeout.

Do not log access tokens, complete authorization headers, or raw Axios error/request objects.

---

## 20. Mutation Success versus Refresh Failure

Treat these as separate outcomes:

```text
POST/PUT/DELETE succeeded
GET refresh failed
```

Show that the write succeeded and that the directory could not refresh. Offer a GET retry. Do not report the write as failed.

Maintain independent state for:

```text
Directory loading/error
Summary loading/error
Course/lecturer/semester lookup loading/error
Detail loading/error
Create/update pending/error
Delete pending/error
Success feedback
```

---

## 21. Accessibility, Concurrency, and State Cleanup

Preserve:

- Existing 480px desktop drawer and modal behavior below 1280px.
- Desktop content-space reservation for edit as well as create.
- Focus restoration to the initiating action.
- Dialog Escape handling, scroll locking, and dirty cancellation.
- Capacity meter aria-labels, valuemin, valuemax, valuenow, and valuetext.
- English/Thai name rendering where applicable.

Use polite status announcements for loading/success and alerts for failures.

Do not allow pending mutations to be dismissed in a way that encourages resubmission.

Abort or ignore obsolete reads on unmount, filter changes, lookup changes, and selected-record changes.

---

## 22. Demo-to-API Migration

Remove from the connected Sections runtime path:

```text
useState(initialSections) as the directory source
initialCourses as authoritative production lookup data
sectionLecturers as authoritative production lookup data
sectionSemesters as authoritative production lookup data
sectionYears as authoritative production lookup data
createDemoSection as successful creation
Generated local record IDs
Local-only success/persistence messages
Demo term options as the only semester choices
```

Do not delete shared fixtures/helpers until their consumers have been inspected. Other local-demo modules remain outside this task.

Audit `SectionsTable` and the drawer for hidden fixture-based name resolution.

Refresh related visible Section data after mutations.

---

## 23. Testing Plan

Use existing project tooling and focused tests.

### 23.1 Request and response tests

- Exact create/update property names including `sectionNumber`, `lectureId`, `semesterId`.
- Entity IDs are numeric.
- `status` maps: active → `ACTIVE`, closed → `CLOSED`.
- Optional fields omitted when blank; included when provided.
- Whitespace normalization follows DTO behavior.
- List/detail labels map from API data, not fixtures.
- Unexpected response wrappers/types are handled safely.
- Invalid IDs are rejected before HTTP requests.

### 23.2 Create/update tests

- Required/invalid fields prevent API calls.
- Double-click/Enter sends one mutation.
- 400/409 keeps values and maps errors to correct fields.
- Editing the same record does not conflict with itself locally.
- Closed status loads and submits correctly.
- Successful mutation refreshes list/summary and preserves filters.
- Refresh failure after write success is not reported as write failure.

### 23.3 List/search tests

- Supported query parameter names and uppercase status values are sent.
- Search, course, semester, lecturer, and status combine correctly.
- Blank filters are omitted.
- Old responses cannot replace newer results.
- Empty success differs from error/loading.
- Complete-directory loading handles page boundaries, bounds, partial failures, and duplicate IDs.
- Summary cards use correct scopes.
- Server failures never activate demo fallback.

### 23.4 Detail/delete tests

- Correct record is fetched; stale detail is not displayed.
- Section not found differs from course/lecturer not found.
- Initial Delete and Cancel send no DELETE.
- Confirmation sends exactly one DELETE for the selected ID.
- 204 requires no JSON body.
- No cascade/local deactivation occurs.

### 23.5 Authentication and safety tests

- Requests reuse existing auth interception.
- 401 delegates to the central handler.
- 403 is shown without bypass attempts.
- 500/network failures expose no internal exceptions or tokens.
- No backend code/database/auth changes are included in the diff.

### 23.6 Browser/visual tests

- Sign in normally and verify the protected route.
- Compare table, filters, summary cards, drawer, controls, typography, colors, and spacing with the approved UI.
- Verify existing desktop/mobile breakpoints and horizontal table scrolling.
- Verify capacity meter colors and computed status behavior.
- Exercise live persistence only with an authorized disposable test section.
- Do not delete existing university records to demonstrate the flow.

Required checks:

```sh
npm run lint
npx tsc --noEmit
npm run build
```

---

## 24. Agent Implementation Instructions

Copyable prompt:

```text
Implement Course Sections CRUD API integration according to
spec-md/21-api-implementation-course-sections.md.

Read applicable AGENTS.md/AGENT.md instructions if present, then inspect:
- spec-md/14-course-sections.md
- spec-md/04-authentication.md
- src/components/sections/
- src/pages/sections/SectionsPage.jsx
- src/services/courseService.ts
- src/api/apiClient.js
- src/types/courseSection.ts
- src/utils/courseSections.ts
- src/data/courseSections.ts

STRICT RULES:
1. Frontend only. Do not modify backend source, APIs, database, migrations,
   authentication, authorization, or CORS.
2. Preserve existing Figma/UI design and responsive layout.
3. Preserve capacity meter, computed status (Active/Full/Closed), and summary cards.
4. Preserve summary card layout and metric order.
5. Reuse existing components, services, and central Axios/auth client.
6. Reverify source-documented contracts against the current backend.
7. Send exact request keys: courseId, sectionNumber, capacity, lectureId, room,
   schedule, semesterId, status.
8. Send courseId, lectureId, semesterId as validated numbers.
9. status mapping: active → ACTIVE, closed → CLOSED.
10. Use API course/semester records, never fixture IDs or display names as IDs.
11. Map lectureId (API) ↔ lecturerId (UI) carefully at the boundary.
12. Do not invent endpoints, counts, records, or persistent success.
13. Report contract mismatches instead of changing the backend.

IMPLEMENT:
- Create src/services/sectionService.ts for list/detail/create/update/delete
  and summary.
- Replace connected directory fixtures with server records.
- Wire server search/course/semester/lecturer/status filters, summary cards,
  and footer.
- Handle paginated APIs without falsely treating one page as the full list.
- Reuse Course and Semester APIs for eligible assignment lookup.
- Implement or verify Lecturer API for lecturer lookup.
- Preserve capacity meter, computed status, and aria accessibility.
- Await POST/PUT from the existing Create Section drawer.
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

- [ ] Existing page, table, filters, summary cards, badges, capacity meter, fonts, colors, spacing, and drawer design remain unchanged.
- [ ] Capacity meter and computed status (Active/Full/Closed) preserved.
- [ ] Existing route protection, authentication, and API client are reused.
- [ ] Backend source, APIs, database, and authentication are untouched.
- [ ] Unrelated frontend modules and their required fixtures are preserved.

### Contracts and data

- [ ] Current endpoints, DTOs, page metadata, errors, and permissions are verified.
- [ ] Connected screens and lookups use backend data.
- [ ] Payload contains the exact fields and no UI/read-only extras.
- [ ] `courseId`, `lectureId`, `semesterId` are validated positive numeric IDs.
- [ ] `status` maps correctly: active → ACTIVE, closed → CLOSED.
- [ ] `sectionNumber` is sent, not `number`.
- [ ] Backend course/lecturer/semester labels are mapped accurately.
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

### Entity selection and validation

- [ ] Only eligible active courses/lecturers/semesters can be newly assigned.
- [ ] Existing ineligible assignments are handled explicitly, not silently replaced.
- [ ] Global section number conflicts map to correct fields.
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
3. Course/lecturer/semester lookup eligibility and current-assignment handling.
4. Pagination strategy and summary/footer-count scope.
5. Validation/error behavior and status mapping approach.
6. Automated, browser, and visual verification results, clearly separated.
7. Any missing deployment/contract/permission information that blocks completion.
8. Confirmation that backend code, database, and authentication were not modified.

**Core rule: connect the existing Course Sections UI to the existing APIs, preserve the approved design and capacity meter/computed status behavior, and make no backend changes.**
