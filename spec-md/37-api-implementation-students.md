# Students API — frontend implementation

## Scope

Implemented 2026-10-22 against the existing `StudentAdminController`, request/response DTOs, `StudentServiceImpl` and academic/credential services, inspected read-only. Only frontend source, tests and this document are changed. No backend code, migrations or API contracts are changed.

Route: `/admin/students`. The existing admin layout and central bearer-token client are retained. Demo records are no longer used by this screen.

## Verified endpoints

Base: `/api/v1/admin/students`.

| Method | Path | Use |
| --- | --- | --- |
| GET | `/` | Server-paginated directory |
| GET | `/summary` | Global total, active, pending, inactive-or-suspended counts |
| GET | `/{id}` | Fresh full details before editing |
| POST | `/` | Create student and credential |
| PUT | `/{id}` | Full profile/placement/status update |
| DELETE | `/{id}` | Soft delete and revoke access; accepts 204 |
| POST | `/{id}/reset-password` | Reset temporary password; accepts 204 |

The service requires SUPER_ADMIN, ADMIN or ACADEMIC_ADMIN and rejects actors who must change their password. Backend authorization remains authoritative. Central 401 handling ends expired sessions; 403 feedback explains access restrictions.

## Directory and summary

List parameters: zero-based `page`, `size` (1–100), `search`, `facultyId`, `departmentId`, `programId`, `semesterId`, `academicYear`, `enrollmentYear`, `status`, `sort`. Frontend uses ten rows per page and stable `id,asc` ordering. Search covers student code, email, first and last name. Filters are sent to the server, not applied to a single downloaded page.

Response: `content`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last`, `sort`. Page totals, row counts, IDs and duplicate IDs are validated. Requests are debounced and aborted when filters change; a request key prevents stale results from appearing under new filters. Loading, failure/retry, empty and populated states are distinct. Deleting the final row on a page moves to the last available page.

Summary fields: `totalStudents`, `activeStudents`, `pendingStudents`, `inactiveOrSuspendedStudents`. These are global server totals, not filtered counts. Failed summaries show unknown values rather than zero.

## Create and update

Fields: `studentCode`, `universityEmail`, `firstName`, `lastName`, optional `phoneNumber`, past `dateOfBirth`, required positive `facultyId`, `departmentId`, `programId`, optional `semesterId`, optional `academicYear` and `enrollmentYear` (1900–9999), `accountStatus`.

Create additionally sends `temporaryPassword`, `confirmPassword`, `forcePasswordChange`. Passwords require at least 15 Unicode characters, at most 72 UTF-8 bytes, no NUL and matching confirmation. Passwords are not trimmed, logged, persisted in browser storage, or included in PUT. Optional blank fields become null; numeric IDs/years are numbers, and explicit false is preserved.

Academic choices use existing complete faculty, department, program and semester directory loaders. Faculty changes clear department/program; department changes clear program. New inactive placements cannot be selected; existing inactive selections remain visible for edits. Backend validates placement relationships and state. Lookup failures disable add/edit and provide retry.

Supported statuses: PENDING, ACTIVE, INACTIVE, SUSPENDED. Admin creation excludes PENDING. Existing PENDING records retain that status: activation requires mobile registration. Non-pending records cannot be changed to PENDING. Password reset is disabled for PENDING records. Deletion confirmation describes server soft deletion and access revocation.

The old demo year-of-study field is replaced by the actual academic year; no year-of-study value is inferred. Detail data includes phone, birth date, enrollment year and force-password-change state.

## Export and unsupported import

Export fetches every filtered page at size 100 with stable ID order, capped at 10,000 records. Changing totals, duplicate IDs, incomplete pages and oversized directories fail before download. This is not an atomic backend snapshot; concurrent changes preserving totals may still occur. CSV escapes quotes and prefixes formula-like cell values. The CSV contains public directory fields, not credentials or birth dates.

No import endpoint exists. Import remains disabled and the page explains why. No mock records or local-only mutations remain in the active screen.

## Files

- `src/services/studentService.ts`: DTO payloads, pagination, mapping, CRUD/reset, export directory and safe feedback.
- `src/components/students/StudentsContent.tsx`: API directory, filters, summaries, details, deletion/reset and export.
- `src/components/students/StudentApiForm.tsx`: API-backed create/edit form and academic hierarchy.
- `tests/students.test.cjs`: request contracts, credential exclusion, IDs, null/false handling, paging integrity and safe error feedback.

Existing unused demo helpers/components remain available to avoid deleting unrelated work; the active screen does not import them. No changes are required to the protected route or page shell.

## Verification

- Lint and TypeScript passed.
- All 38 existing/new frontend tests passed, including four student-service tests.
- Docker production build passed with the existing large-bundle advisory.
- Rebuilt/recreated only `admin-web`; `/admin/students` returned HTTP 200 and the served `/assets/index-CCo2U-g5.js` bundle contains the new Students integration.
- Authenticated CRUD smoke testing remains pending normal sign-in and authorized test records. No production records were created solely for verification.
