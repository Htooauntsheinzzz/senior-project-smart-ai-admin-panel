# 20 — Courses CRUD API Integration Specification

## 1. Purpose and Scope

Connect the existing **Courses** frontend to the existing backend for list, detail, create, update, and delete workflows. Preserve the approved Figma/UI design and use the existing authentication and centralized Axios client.

This is an implementation specification for Codex, Claude, OpenCode, or another coding agent. This document does not itself implement the feature.

| Item | Requirement |
| --- | --- |
| Application | Smart AI University Student Assistant — Admin Web |
| Module | Academic Management → Courses |
| Stack | React + Vite + Tailwind CSS + Axios + React Router |
| Existing source conventions | TSX components, TypeScript services/models, JSX page adapter |
| Directory route | `/admin/courses` |
| Existing Add Course route | `/admin/courses/new` |
| Design specification | `spec-md/13-courses.md` |
| Related integration references | `spec-md/18-api-implementation-departments.md`, `spec-md/19-api-implementation-programs.md` |
| Authentication reference | `spec-md/04-authentication.md` |
| Scope | Frontend API integration only |

Follow existing file languages and naming conventions. Do not convert working TSX files to JSX or introduce a new framework.

---

## 2. Non-Negotiable Rules

### 2.1 Preserve the existing design

Do not change:

- Page hierarchy, sidebar, top navigation, branding, or navigation destinations.
- Fonts, colors, spacing, borders, shadows, icons, and responsive breakpoints.
- Table column order, code badges, type badges, credit cells, department/semester cells, section counts, or status badges.
- Summary card layout, icons, or metric order.
- Search and Faculty/Department/Program/Year/Term/Status filter placement or appearance.
- Add Course full-page form layout, section grouping, field order, icon headers, or button styling.
- CSV export button and import placeholder behavior.
- Shared modal styling, focus restoration, native dialog behavior, or scroll locking.

Add loading, validation, success, and error behavior within the current components and styling. Do not introduce a new table library, form framework, component kit, or notification system.

### 2.2 Preserve Faculty → Department → Program cascading behavior

The Add/Edit Course form must continue to have cascading Faculty, Department, and Program selects:

- Selecting a Faculty clears Department and Program if they do not belong to the new Faculty.
- Selecting a Department clears Program if it does not belong to the new Department.
- Department options are filtered to the selected Faculty.
- Program options are filtered to the selected Department.
- Department select is disabled when no Faculty is selected.
- Program select is disabled when no Department is selected.
- Empty-department messaging when a faculty has no departments.
- Empty-program messaging when a department has no programs.
- Preserve the existing `updateCourseDraft` cascading behavior for dirty-close detection.

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

Do not auto-create the sample course. All submitted values must come from the form.

---

## 3. Existing Frontend Inventory

Inspect these files before editing:

| File | Existing responsibility | Integration direction |
| --- | --- | --- |
| `src/pages/courses/CoursesPage.jsx` | Protected layout adapter | Retain routing and shell |
| `src/components/courses/CourseCatalog.tsx` | Demo data loader, context provider via Outlet | Replace with API-backed data loader |
| `src/components/courses/CoursesContent.tsx` | List, filters, footer, export, Add navigation, action placeholder | Replace local data flow with API state |
| `src/components/courses/CoursesTable.tsx` | Existing course table | Preserve columns/styles; map backend labels |
| `src/components/courses/CourseFilters.tsx` | Existing filter bar with cascading options | Use API data for filter options |
| `src/components/courses/CourseSummaryCards.tsx` | Summary metric cards | Map from API summary |
| `src/components/courses/AddCourseContent.tsx` | Add form, cascading selects, dirty-close, beforeunload | Await POST; reuse for edit when practical |
| `src/components/courses/courseCatalogContext.ts` | Outlet context type | Extend for API state |
| `src/services/facultyService.ts` | Faculty API access | Reuse/extend for faculty lookup |
| `src/services/departmentService.ts` | Department API access | Reuse/extend for department lookup |
| `src/services/programService.ts` | Program API access | Reuse/extend for program lookup |
| `src/types/course.ts` | UI course/filter types | Add API models and adapt mapping |
| `src/utils/courses.ts` | Demo filtering, validation, totals, CSV export | Keep reusable pure helpers; remove demo mutation use |
| `src/utils/addCourse.ts` | Demo draft validation, cascading helpers, local creation | Keep reusable pure helpers; remove demo creation use |
| `src/data/courses.ts` | Demo courses, current term | Do not use as connected directory source |
| `src/api/apiClient.js` | Shared Axios client and auth interceptors | Reuse unchanged |
| `src/routes/AppRoutes.jsx` | Protected route definitions | Preserve route protection |
| `src/components/ui/Modal.tsx` | Shared dialog styling and behavior | Reuse for details/actions and delete confirmation |

Current UI types:

```ts
interface Course {
  id: string
  code: string
  name: string
  credits: number
  departmentId: string
  departmentName: string
  facultyId: string
  facultyName: string
  programIds: string[]
  curriculumYear: number | null
  semester: string
  academicYear: string
  sectionCount: number
  type: 'Required' | 'Elective'
  status: 'active' | 'inactive'
  description?: string
  prerequisiteCodes?: string[]
  maxStudentsPerSection?: number | null
}

type CourseFilters = {
  query: string
  facultyId: string
  departmentId: string
  programId: string
  year: string
  term: string
  status: string
}

type CourseDraft = {
  code: string
  credits: string
  name: string
  description: string
  facultyId: string
  departmentId: string
  programId: string
  year: string
  term: string
  prerequisites: string
  type: 'Required' | 'Elective'
  maxStudents: string
  status: 'active' | 'inactive'
}
```

The UI currently uses `type: 'Required' | 'Elective'` but the backend API uses `courseType` as an integer code: `100` (General Education), `200` (Major Elective), `300` (Major Required). Map `Required` → `300` and `Elective` → `200`. The `courseTypeName` in responses provides the display name.

The UI currently uses `term: '1/2568' | '2/2568' | 'Summer/2568'` but the backend API uses `semesterId` as a numeric ID. Semester lookup integration is required for create/edit. For listing, the API returns `semesterNameTh` and `semesterNameEn`.

The UI currently uses `year: '1' | '2' | '3' | '4' | '5' | '6'` but the backend API uses `recommendedAcademicYear` as an integer.

Inspect consumers before changing exported types/service signatures or removing fixtures. Other academic demo screens may still depend on these files. Avoid unrelated module migration during this task.

---

## 4. User-Supplied Request Contract

```json
{
  "courseCode": "CSC404",
  "courseName": "Web Developement Using Spring Boot",
  "creditHours": 3,
  "description": "testing from postman",
  "facultyId": 2,
  "departmentId": 2,
  "programId": 8,
  "semesterId": 5,
  "recommendedAcademicYear": 4,
  "prerequisiteCourses": "CSC201",
  "courseType": 300,
  "maximumStudentsPerSection": 45,
  "isActive": true
}
```

Send these exact property names:

```text
courseCode
courseName
creditHours
description
facultyId
departmentId
programId
semesterId
recommendedAcademicYear
prerequisiteCourses
courseType
maximumStudentsPerSection
isActive
```

Do not send UI aliases such as `code`, `name`, `credits`, `type`, `year`, `term`, `maxStudents`, or `status` as request properties.

Do not submit `facultyCode`, `facultyNameEn`, `departmentCode`, `departmentName`, `programCode`, `programName`, `semesterNameTh`, `semesterNameEn`, `courseTypeName`, an invented course ID, or audit metadata.

The sample IDs are examples only. They are valid only if those entities exist, are not deleted, and are active in the target backend. Never select arbitrary fallback IDs when lookup loading fails.

---

## 5. Verified Backend Contract and Reverification

The following contract was inspected read-only in the local backend source while preparing this specification. It is source-verified, **not proof of successful requests against the running deployment**.

Before implementing, recheck that the deployed API matches the current controller, DTOs, service, query parser, mapper, and exception handler. Record differences in `spec-md/00-changes-and-decisions.md`.

Source references under the backend package:

```text
feature/course/controller/CourseController.java
feature/course/dto/CourseCreateRequest.java
feature/course/dto/CourseUpdateRequest.java
feature/course/dto/CourseListQuery.java
feature/course/dto/CourseResponse.java
feature/course/dto/CourseListResponse.java
feature/course/dto/CoursePageResponse.java
feature/course/dto/CourseSummaryResponse.java
feature/course/service/impl/CourseServiceImpl.java
feature/course/mapper/CourseMapper.java
feature/course/enums/CourseType.java
feature/course/exception/
exception/GlobalExceptionHandler.java
```

### 5.1 Endpoints

| Operation | Method and path | Success |
| --- | --- | --- |
| Create | `POST /api/v1/admin/courses` | `201`, course response |
| List | `GET /api/v1/admin/courses` | `200`, page response |
| Summary | `GET /api/v1/admin/courses/summary` | `200`, summary response |
| Detail | `GET /api/v1/admin/courses/{id}` | `200`, course response |
| Update | `PUT /api/v1/admin/courses/{id}` | `200`, course response |
| Delete | `DELETE /api/v1/admin/courses/{id}` | `204`, no response body |

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
| `courseCode` | Required, trimmed, max 50 characters |
| `courseName` | Required, trimmed, max 255 characters |
| `creditHours` | Required positive integer |
| `description` | Optional, trimmed, max 1000 characters; blank → null |
| `facultyId` | Required positive numeric ID; faculty must exist, not be deleted, and be active |
| `departmentId` | Required positive numeric ID; department must exist, not be deleted, be active, and belong to the selected faculty |
| `programId` | Optional positive numeric ID; program must exist, not be deleted, be active, and belong to the selected department |
| `semesterId` | Optional positive numeric ID; semester must exist |
| `recommendedAcademicYear` | Optional positive integer |
| `prerequisiteCourses` | Optional, trimmed, max 1000 characters; blank → null |
| `courseType` | Required integer; supported values: `100` (General Education), `200` (Major Elective), `300` (Major Required) |
| `maximumStudentsPerSection` | Optional positive integer |
| `isActive` | Boolean; create defaults to true if omitted, but frontend must send an explicit value; update requires it |

Do not invent a `CSC-` prefix requirement. `CSC404` is valid under the inspected code pattern.

Current uniqueness rules:

- Course code is unique globally.
- The backend excludes the current course ID during update uniqueness checks.
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
apiClient.get('/courses', { params })
```

Do not repeat `/api/v1/admin` inside the relative URL or hardcode localhost/backend hosts inside components.

Do not read/store tokens in Course components, manually attach per-component authentication headers, or register an additional 401 handler.

Architecture:

```text
Existing Course UI
  → event/request state
  → courseService
  → existing apiClient/auth interceptor
  → existing Course API
  → response adapter
  → existing UI
```

---

## 8. Service Implementation Structure

Create `src/services/courseService.ts`.

Required operations:

```ts
getCourses(params, options?)
getCourseById(id, options?)
createCourse(payload)
updateCourse(id, payload)
deleteCourse(id)
getCourseSummary(options?)
```

Exact function signatures may follow project conventions. Avoid creating two services with conflicting ownership of `/courses`.

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
| `code` | `courseCode` | Trim outer whitespace |
| `name` | `courseName` | Trim outer whitespace |
| `credits` | `creditHours` | Parse positive integer |
| `description` | `description` | Trim; empty/null if blank |
| `facultyId` | `facultyId` | Validate positive integer, then convert to number |
| `departmentId` | `departmentId` | Validate positive integer, then convert to number |
| `programId` | `programId` | Validate positive integer, then convert to number; omit if blank |
| `term` | `semesterId` | Map term string to semester ID via lookup; omit if blank |
| `year` | `recommendedAcademicYear` | Parse positive integer; omit if blank |
| `prerequisites` | `prerequisiteCourses` | Trim; empty/null if blank |
| `type` | `courseType` | `Required` → `300`, `Elective` → `200` |
| `maxStudents` | `maximumStudentsPerSection` | Parse positive integer; omit if blank |
| `status` | `isActive` | `status === 'active'` |

Example after validation:

```ts
function buildCoursePayload(value: CourseDraft) {
  const payload: Record<string, unknown> = {
    courseCode: value.code.trim(),
    courseName: value.name.trim(),
    creditHours: Number(value.credits),
    facultyId: Number(value.facultyId),
    departmentId: Number(value.departmentId),
    isActive: value.status === 'active',
    courseType: value.type === 'Required' ? 300 : 200,
  }
  const description = value.description.trim() || null
  if (description) payload.description = description
  if (value.programId) payload.programId = Number(value.programId)
  if (value.term) payload.semesterId = Number(value.term) // or map via lookup
  if (value.year) payload.recommendedAcademicYear = Number(value.year)
  const prerequisites = value.prerequisites.trim() || null
  if (prerequisites) payload.prerequisiteCourses = prerequisites
  if (value.maxStudents.trim()) payload.maximumStudentsPerSection = Number(value.maxStudents)
  return payload
}
```

Invalid entity selections must be rejected before this mapping. `Number('')` produces zero and must never become an accidental request value.

Do not send:

```json
{ "facultyId": "2", "isActive": "false", "courseType": "Required" }
```

Correct request:

```json
{
  "courseCode": "CSC404",
  "courseName": "Web Developement Using Spring Boot",
  "creditHours": 3,
  "description": "testing from postman",
  "facultyId": 2,
  "departmentId": 2,
  "programId": 8,
  "semesterId": 5,
  "recommendedAcademicYear": 4,
  "prerequisiteCourses": "CSC201",
  "courseType": 300,
  "maximumStudentsPerSection": 45,
  "isActive": true
}
```

Never use `Boolean('false')` or `response.isActive || true`. Preserve explicit false.

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
courseCode
courseName
creditHours
facultyId
facultyCode
facultyNameEn
departmentId
departmentCode
departmentName
programId
programCode
programName
semesterId
semesterNameTh
semesterNameEn
recommendedAcademicYear
courseType
courseTypeName
maximumStudentsPerSection
sectionCount
isActive
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
| `courseCode` | `code` |
| `courseName` | `name` |
| `creditHours` | `credits` |
| `facultyId` | Faculty selection value |
| `facultyCode`, `facultyNameEn` | Faculty label |
| `departmentId` | Department selection value |
| `departmentCode`, `departmentName` | Department label |
| `programId`, `programCode`, `programName` | Program label (single program, not array) |
| `semesterId`, `semesterNameTh`, `semesterNameEn` | Semester display |
| `recommendedAcademicYear` | `curriculumYear` |
| `courseType` | Type badge: `100`→General Education, `200`→Major Elective, `300`→Major Required |
| `courseTypeName` | Type badge display text |
| `maximumStudentsPerSection` | `maxStudentsPerSection` |
| `sectionCount` | Section count cell |
| `isActive` | Active/Inactive status |

Important: The API returns a single `programId` (nullable), not `programIds` array. The UI currently stores `programIds: string[]`. Extend or adapt the UI model to handle the single program from the API. For filtering, if the API returns a single program, filter by that program ID.

For semester display, use `semesterNameEn` or `semesterNameTh` if available. The current UI displays `semester/academicYear`. If the API provides semester name strings, use them. If not, derive from semester lookup.

For the type badge, use `courseTypeName` from the API for display text, but determine badge colors from the `courseType` code:
- `100` (General Education): neutral gray
- `200` (Major Elective): existing Elective style
- `300` (Major Required): existing Required style

Validate required response properties. A malformed response is an error, not an empty collection.

---

## 11. Faculty, Department, Program, and Semester Lookup Integration

Reuse the existing Faculty, Department, and Program APIs/services. Semester lookup requires a separate API call.

Current endpoints include:

```http
GET /api/v1/admin/faculties
GET /api/v1/admin/faculties/{id}
GET /api/v1/admin/departments
GET /api/v1/admin/departments/{id}
GET /api/v1/admin/programs
GET /api/v1/admin/programs/{id}
```

Semester endpoints (verify at implementation time):

```http
GET /api/v1/admin/semesters
GET /api/v1/admin/semesters/{id}
```

### 11.1 Assignment options versus filter options

- **Form assignment options:** active, non-deleted entities only.
- **Directory filter options:** should include relevant existing entities, including inactive ones where appropriate for browsing.

Preserve current service consumers when extending lookup services. Dedicated lookup helpers are acceptable; duplicate Axios instances are not.

### 11.2 Faculty → Department → Program cascading

Preserve the existing cascading behavior:

```text
Faculty *
[ Select a faculty… ]

Department *
[ Select a department… ] (disabled until faculty selected)

Program
[ Select a program… ] (disabled until department selected)
```

- When Faculty changes, clear Department and Program if incompatible.
- When Department changes, clear Program if incompatible.
- Department options filter to selected Faculty.
- Program options filter to selected Department.
- Empty-department and empty-program messages preserved.

### 11.3 Semester mapping

The UI currently uses term strings like `1/2568`, `2/2568`, `Summer/2568`. The API uses `semesterId` as a numeric ID.

For create/edit:
- Load active semesters from the backend.
- Display semester names (e.g., `Sem 1/2568`, `Sem 2/2568`).
- Submit the selected semester's ID as `semesterId`.
- If semester lookup fails, show a safe error and allow the user to retry or leave blank.

For listing:
- The API response includes `semesterNameTh` and `semesterNameEn`. Use these for display.
- If semester is null, display "Not assigned".

### 11.4 Lookup loading and completeness

- Replace fixture-based options with API-backed options.
- Preserve loading, retry, empty-list states.
- Do not auto-select the first option after a lookup failure.
- Use stable loaders/callbacks so effect dependencies do not cause repeated request loops.

---

## 12. Routes and Form Reuse

Preserve:

```text
/admin/courses
/admin/courses/new
```

Keep the current protected route. The Add Course form is a full page, not a drawer.

Reuse the Add Course form for edit mode where practical:

- Mode-specific title and submit label may change to Edit/Update Course.
- The fields, sizing, spacing, and controls remain the same.
- Dirty-close confirmation must compare against loaded edit values, not empty create defaults.
- Beforeunload handler must use edit-mode dirty detection.

Reuse row action triggers and existing modal/button patterns for View/Edit/Delete. Do not create a new full-page form or top-level navigation item.

If URL states for detail/edit are added, keep them protected, validate IDs, and preserve unrelated search parameters.

---

## 13. List and Filter Workflow

```text
Open Courses
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
| `facultyId` | Optional positive numeric faculty ID |
| `departmentId` | Optional positive numeric department ID |
| `programId` | Optional positive numeric program ID |
| `semesterId` | Optional positive numeric semester ID |
| `recommendedAcademicYear` | Optional positive integer |
| `courseType` | Optional; `100`, `200`, or `300` |
| `status` | `ACTIVE` or `INACTIVE` |
| `sort` | `field,direction`; supported fields `id`, `courseCode`, `courseName`, `creditHours`, `recommendedAcademicYear`, `courseType`, `maximumStudentsPerSection`, `createdAt`, `updatedAt` |

Unknown query parameters are rejected. Do not send `isActive`, `query`, `type`, `year`, `term`, or lowercase status as list query keys/values.

Map UI filters:

```text
query → search
facultyId string → validated numeric facultyId
departmentId string → validated numeric departmentId
programId string → validated numeric programId
year → recommendedAcademicYear
status active → ACTIVE / inactive → INACTIVE
courseType Required → 300 / Elective → 200
term → semesterId (via lookup mapping)
empty filter → omitted parameter
```

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

- **Total Courses**: from `totalCourses` in summary response.
- **Active Courses**: from `activeCourses` in summary response.
- **Current Semester Courses**: from `currentSemesterCourses` in summary response.

On initial/failed reads, show loading or unknown values (`—`) instead of fabricated zero totals.

### 13.3 Footer semantics

Preserve the existing `Showing X of Y courses` presentation:

- `X`: complete filtered result count, not just one fetched page.
- `Y`: overall non-deleted course total from the summary endpoint.

---

## 14. Create Course Workflow

```text
Navigate to /admin/courses/new
  → load catalog data for prerequisite validation
  → load active Faculty/Department/Program/Semester choices
  → complete all fields
  → validate
  → map exact payload
  → POST /courses
  → successful response
  → navigate back to /admin/courses and refresh list/summary
  → existing success feedback
```

Requirements:

1. Start with blank identity/entity fields and Active/Required selected, matching current behavior.
2. Never prefill or submit the sample payload automatically.
3. Await the real mutation promise.
4. Lock submission immediately and disable duplicate submit/navigate while pending.
5. Keep form values on validation, lookup, conflict, permission, or network errors.
6. Navigate back only after confirmed mutation success.
7. Use the server ID; never call `crypto.randomUUID()` for a persisted course.
8. Preserve the current directory filters after creation.
9. Refetch affected directory/summary data; do not append a fake local record.
10. The beforeunload handler should not warn after successful submission.

---

## 15. Detail Workflow

```text
Row action → View → validate course ID → GET detail → existing modal
```

- Load current detail from the server.
- Show loading, error, retry, and not-found states using existing styles.
- Show course code/name, credits, faculty/department/program labels, semester, year, type, prerequisites, max students, and status.
- Do not show the previously selected course's information during another request.
- Ignore responses when the modal closes or the selected ID changes.

---

## 16. Edit Course Workflow

```text
Row action → Edit → GET fresh detail
  → populate reused form and selected entity labels
  → user changes fields
  → validation and payload mapping
  → PUT /courses/{id}
  → success → navigate back and refresh
```

Requirements:

- Do not enable an empty edit form while detail loading is incomplete or failed.
- Preserve inactive status; do not default a returned false value to true.
- Establish the dirty baseline from fetched data.
- Preserve the existing entity assignments until the user explicitly changes them or resolves an eligibility error.
- Faculty → Department → Program cascading must still work correctly in edit mode.
- Do not report the unchanged code as a duplicate against the same record.
- PUT includes all required fields, not only changed fields.
- Do not send display labels, audit fields, or the record ID in the body.
- Keep edits on failure and prevent repeated saves while pending.
- Clear stale form/error state when switching between records or between create/edit.
- Refresh server data after success while preserving filters.

---

## 17. Delete Course Workflow

```text
Delete action → confirmation modal → explicit Confirm
  → DELETE /courses/{id}
  → 204 success → close modal → refetch list and summary
```

Rules:

- The initial Delete click never issues DELETE.
- Identify the course by server ID and show its code/name in confirmation.
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
Course code is required.
Use at most 50 characters.
Course name is required.
Use at most 255 characters.
Credit hours are required.
Enter credit hours as a positive whole number.
Select a faculty.
Select a department within the chosen faculty.
Select a valid program for this department, or leave blank.
Select a valid semester, or leave blank.
Enter a positive whole number for academic year, or leave blank.
Enter prerequisite courses as comma-separated codes, or leave blank.
A course cannot be its own prerequisite.
Select a course type.
Enter a positive whole number for maximum students, or leave blank.
This course code is already in use.
```

Client validation must reject:

- Blank/whitespace-only required text.
- Overlength text fields.
- Missing faculty/department selection, zero/negative/fractional/unsafe IDs.
- Invalid course type values.
- Non-numeric or non-positive credits, year, max students when provided.
- Self-referential prerequisites.
- Invalid status values.

Keep all entered values after rejection. Do not replace fields with example defaults.

Use existing error styles, `aria-invalid`, and `aria-describedby`. Focus the first invalid enabled control.

Backend uniqueness and eligibility remain authoritative.

---

## 19. Error Handling and Verified Codes

Use known error codes and safe copy. Do not render arbitrary backend exception messages.

| Status/code | Required behavior |
| --- | --- |
| 400 `VALIDATION_ERROR` | Safe form-level validation message |
| 400 `INVALID_COURSE_RELATIONSHIP` | Faculty/department/program field error |
| 400 `INVALID_PREREQUISITE_COURSE` | Prerequisite field error |
| 400 `INVALID_COURSE_TYPE` | Type field error |
| 404 `FACULTY_NOT_FOUND` | Faculty field error |
| 404 `DEPARTMENT_NOT_FOUND` | Department field error |
| 404 `PROGRAM_NOT_FOUND` | Program field error |
| 404 `COURSE_NOT_FOUND` | Course not found; prevent stale edit/delete |
| 409 `COURSE_CODE_ALREADY_EXISTS` | Map to code field |
| 401 | Existing central auth handling only |
| 403 | Access denied/password-change restriction |
| Other 409 | Safe conflict/reload message; preserve edits |
| 500/503 | Generic retryable error; no SQL/Java/internal details |
| Network/timeout | Connection feedback; preserve entered values |
| Cancelled read | Ignore without an error toast |
| Malformed success body | Contract error, not fake/empty success |

Differentiate entity-related 404s using the documented code. Do not reuse a generic error helper.

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
Faculty/department/program/semester lookup loading/error
Detail loading/error
Create/update pending/error
Delete pending/error
Success feedback
```

---

## 21. Accessibility, Concurrency, and State Cleanup

Preserve:

- Existing full-page form layout and responsive behavior.
- Beforeunload dirty-warning behavior.
- Focus restoration to the initiating action.
- Dialog Escape handling, scroll locking, and dirty cancellation.
- Faculty → Department → Program cascading select behavior.
- English/Thai name rendering where applicable.

Use polite status announcements for loading/success and alerts for failures.

Do not allow pending mutations to be dismissed in a way that encourages resubmission.

Abort or ignore obsolete reads on unmount, filter changes, lookup changes, and selected-record changes.

---

## 22. Demo-to-API Migration

Remove from the connected Courses runtime path:

```text
useState(initialCourses) as the directory source
initialFaculties as authoritative production lookup data
initialDepartments as authoritative production lookup data
initialPrograms as authoritative production lookup data
createDemoCourse as successful creation
Generated local record IDs
Local-only success/persistence messages
Demo term options as the only semester choices
```

Do not delete shared fixtures/helpers until their consumers have been inspected. Other local-demo modules remain outside this task.

Audit `CoursesTable`, `CourseFilters`, and the add form for hidden fixture-based name resolution.

Refresh related visible Course data after mutations.

---

## 23. Testing Plan

Use existing project tooling and focused tests.

### 23.1 Request and response tests

- Exact create/update property names.
- Faculty/department/program IDs are numeric.
- `courseType` maps: Required→300, Elective→200.
- Boolean false remains false.
- Optional fields omitted when blank; included when provided.
- Whitespace normalization follows DTO behavior.
- List/detail labels map from API data, not fixtures.
- Unexpected response wrappers/types are handled safely.
- Invalid IDs are rejected before HTTP requests.

### 23.2 Cascading tests

- Faculty change clears incompatible department/program.
- Department change clears incompatible program.
- Department options filter to selected faculty.
- Program options filter to selected department.
- Empty-department and empty-program states shown.
- Form assignment options exclude inactive/deleted entities.

### 23.3 Create/update tests

- Required/invalid fields prevent API calls.
- Double-click/Enter sends one mutation.
- 400/409 keeps values and maps errors to correct fields.
- Editing the same record does not conflict with itself locally.
- Inactive status loads and submits correctly.
- Successful mutation refreshes list/summary and preserves filters.
- Refresh failure after write success is not reported as write failure.

### 23.4 List/search tests

- Supported query parameter names and uppercase status values are sent.
- Search, faculty, department, program, year, term, type, and status combine correctly.
- Blank filters are omitted.
- Old responses cannot replace newer results.
- Empty success differs from error/loading.
- Complete-directory loading handles page boundaries, bounds, partial failures, and duplicate IDs.
- Summary cards use correct scopes.
- Server failures never activate demo fallback.

### 23.5 Detail/delete tests

- Correct record is fetched; stale detail is not displayed.
- Course not found differs from faculty/department/program not found.
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
- Compare table, filters, summary cards, form, controls, typography, colors, and spacing with the approved UI.
- Verify existing desktop/mobile breakpoints and horizontal table scrolling.
- Verify cascading select behavior and dirty cancellation.
- Exercise live persistence only with an authorized disposable test course.
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
Implement Courses CRUD API integration according to
spec-md/20-api-implementation-courses.md.

Read applicable AGENTS.md/AGENT.md instructions if present, then inspect:
- spec-md/13-courses.md
- spec-md/04-authentication.md
- src/components/courses/
- src/pages/courses/CoursesPage.jsx
- src/routes/AppRoutes.jsx
- src/services/facultyService.ts
- src/services/departmentService.ts
- src/services/programService.ts
- src/api/apiClient.js
- src/types/course.ts
- src/utils/courses.ts
- src/utils/addCourse.ts
- src/data/courses.ts

STRICT RULES:
1. Frontend only. Do not modify backend source, APIs, database, migrations,
   authentication, authorization, or CORS.
2. Preserve existing Figma/UI design and responsive layout.
3. Preserve Faculty → Department → Program cascading select behavior.
4. Preserve summary cards, CSV export, and import placeholder.
5. Reuse existing components, services, and central Axios/auth client.
6. Reverify source-documented contracts against the current backend.
7. Send exact request keys: courseCode, courseName, creditHours, description,
   facultyId, departmentId, programId, semesterId, recommendedAcademicYear,
   prerequisiteCourses, courseType, maximumStudentsPerSection, isActive.
8. Send facultyId, departmentId, programId, semesterId as validated numbers;
   isActive as real boolean.
9. courseType mapping: Required → 300, Elective → 200.
10. Use API faculty/department/program/semester records, never fixture IDs.
11. Do not invent endpoints, counts, records, or persistent success.
12. Report contract mismatches instead of changing the backend.

IMPLEMENT:
- Create src/services/courseService.ts for list/detail/create/update/delete
  and summary.
- Replace connected directory fixtures with server records.
- Wire server search/faculty/department/program/year/term/type/status filters,
  summary cards, and footer.
- Handle paginated APIs without falsely treating one page as the full list.
- Reuse Faculty, Department, and Program APIs for eligible assignment lookup.
- Implement or reuse Semester API for semester lookup.
- Preserve cascading faculty/department/program behavior.
- Await POST/PUT from the existing Add Course form.
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

- [ ] Existing page, table, filters, summary cards, badges, fonts, colors, spacing, and form design remain unchanged.
- [ ] Faculty → Department → Program cascading behavior preserved.
- [ ] CSV export and import placeholder behavior preserved.
- [ ] Existing route protection, authentication, and API client are reused.
- [ ] Backend source, APIs, database, and authentication are untouched.
- [ ] Unrelated frontend modules and their required fixtures are preserved.

### Contracts and data

- [ ] Current endpoints, DTOs, page metadata, errors, and permissions are verified.
- [ ] Connected screens and lookups use backend data.
- [ ] Payload contains the exact fields and no UI/read-only extras.
- [ ] `facultyId`, `departmentId`, `programId`, `semesterId` are validated positive numeric IDs.
- [ ] `isActive` preserves both boolean true and false.
- [ ] `courseType` maps correctly: Required→300, Elective→200.
- [ ] Backend faculty/department/program/semester labels are mapped accurately.
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

- [ ] Only eligible active faculties/departments/programs/semesters can be newly assigned.
- [ ] Existing ineligible assignments are handled explicitly, not silently replaced.
- [ ] Faculty → Department → Program cascading works correctly in both create and edit.
- [ ] Global code conflicts map to correct fields.
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
3. Faculty/department/program/semester lookup eligibility and current-assignment handling.
4. Pagination strategy and summary/footer-count scope.
5. Validation/error behavior and courseType mapping approach.
6. Automated, browser, and visual verification results, clearly separated.
7. Any missing deployment/contract/permission information that blocks completion.
8. Confirmation that backend code, database, and authentication were not modified.

**Core rule: connect the existing Courses UI to the existing APIs, preserve the approved design and Faculty→Department→Program cascading behavior, and make no backend changes.**
