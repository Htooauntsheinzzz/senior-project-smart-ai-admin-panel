# Enrollments API — frontend implementation

## Scope

Implemented on 2026-10-23 against the existing `AdminEnrollmentController`, enrollment DTOs, mapper, service and status enum, inspected read-only. All changes are frontend-only. No backend source, API contracts, database migrations or permissions are changed.

- Screen: `/admin/enrollments`.
- Sidebar: Academic Management → Enrollments.
- Existing admin layout, protected route and central authenticated Axios client retained.
- Active screen now uses server data instead of Figma/synthetic records and local mutations.

## Endpoint contract

Base: `/api/v1/admin/enrollments`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/` | Server-paginated directory |
| GET | `/summary` | Global enrollment counts |
| GET | `/{id}` | Full details, including section occupancy |
| POST | `/` | Create enrollment |
| PUT | `/{id}` | Update enrollment |
| PATCH | `/{id}/status` | Change status only |
| DELETE | `/{id}` | Soft-delete; accepts 204 |

Authorization is enforced by the backend for SUPER_ADMIN, ADMIN and ACADEMIC_ADMIN. Actors required to change their password are rejected. Central 401 handling and safe 403 feedback are retained.

### List

Supported parameters: zero-based `page`, `size` (1–100), `search`, `studentId`, `courseId`, `courseSectionId`, `semesterId`, `status`, `enrollmentDate`, `sort`. Frontend uses ten rows per page and stable `id,asc` ordering. Only allowlisted parameters are sent; academic year is not supported and is not sent.

Search covers student code/name/email and course code/name. Date filtering is an exact enrollment date, not a range. Status filters use exact uppercase values.

Response includes `content`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last`, `sort`. Each row supplies server IDs, student code/name, course code/name, section number, enrollment date, semester English/Thai names and status. Response/page shape, safe positive IDs, dates, statuses, duplicate IDs and incomplete pages are checked before display.

Requests are debounced and aborted on filter changes. A request key hides stale results. Loading, failure/retry, empty and populated states are distinct. Deletion of the last row on a page returns to the last available page.

### Summary

Fields: `totalEnrollments`, `activeEnrollments`, `pendingEnrollments`, `withdrawnEnrollments`, `droppedEnrollments`, `withdrawnOrDropped`. The existing four cards show total, active, pending and combined withdrawn/dropped. Counts are global, not calculated from a page or filtered set. Failed/loading counts show unknown values.

### Create/update payload

```json
{
  "studentId": 2,
  "courseSectionId": 4,
  "enrollmentDate": "2026-10-23",
  "status": "ACTIVE"
}
```

IDs are positive numbers. Date is optional: null on creation uses the server's current date; null on update preserves the existing date. Only these four fields are sent. Course, semester, lecturer, room, schedule and capacity are derived by the backend from the chosen section, not written independently.

Status PATCH sends only `{ "status": "ACTIVE" }`. Successful writes are followed by a list/summary refresh; refresh failure is not reported as a failed write. Mutation controls prevent duplicate submissions and closing during writes.

## Business rules reflected in the UI

- New enrollment requires an active, non-deleted student and an active section.
- PENDING and ACTIVE both reserve a seat; server locking/capacity checks remain authoritative.
- PENDING may transition to ACTIVE, WITHDRAWN or DROPPED.
- ACTIVE may transition to WITHDRAWN or DROPPED, not PENDING.
- WITHDRAWN and DROPPED are terminal; same-state updates remain possible.
- Only PENDING records may move to another student or section. Other edits retain those IDs.
- Duplicate student/section pairs are rejected even when the old enrollment was soft-deleted. The UI explains this in deletion confirmation.
- Seat-holding enrollment in another section of the same course/semester is rejected.
- Deletion soft-deletes and releases any held seat; no hard-delete claim is made.

Create/edit uses paginated searchable student and section pickers, not fixed first-page dropdowns. Assignment pickers request ACTIVE records. Existing selected IDs remain visible when editing even if their records are no longer eligible for a new assignment. Full sections are labeled; server checks determine whether a requested status/operation is permitted.

Details are fetched before actions and map the distinct detail response (`studentFirstName`/`studentLastName`) into a display name. The modal shows email, lecturer, room, schedule, capacity/occupancy, date and status. Null room/schedule and false/zero values remain intact.

## Filters, selection and export

- Student filter uses a paginated searchable picker with all account statuses.
- Course/section choices come from the existing complete section directory; semester choices come from the existing semester directory. Course choices represent courses with available section-directory records. These shared loaders cap complete directories at 2,000 records and reject partial results. Failures show retry while search and paginated enrollment forms remain available.
- Course/semester changes clear the section selection. Clear Filters resets the selected student too.
- Selection is explicitly page-scoped and clears on pagination, filter changes and refresh.
- With selection: export the displayed selected rows. Otherwise: fetch every filtered page at size 100, capped at 10,000 records.
- Export rejects changed totals, duplicate IDs, incomplete pages and oversized directories. It is not an atomic server snapshot; concurrent edits preserving totals can still occur.
- CSV quotes cells, doubles embedded quotes, prefixes formula-like cell contents, uses UTF-8 BOM and excludes credentials.
- No bulk/import endpoint exists. Bulk Enroll remains disabled with an explanation. No bulk requests or fake successes are simulated.
- The old academic-year filter and synthetic year display are omitted because the enrollment endpoint exposes neither. Semester filtering remains available.

## Error handling

Safe messages distinguish duplicate student/section, same-course conflict, full/closed section, ineligible student, invalid status transition, disallowed reassignment, missing record and access failure. Raw backend exception text is not displayed. Failed mutations leave the form/confirmation open for correction or retry.

## Files

- `src/services/enrollmentService.ts`: types, payloads, mapping, directory/summary/detail, CRUD/status, export and errors.
- `src/components/enrollments/EnrollmentsContent.tsx`: API-backed screen and record actions.
- `src/components/enrollments/EnrollmentApiForm.tsx`: create/edit form.
- `src/components/enrollments/EnrollmentRecordPicker.tsx`: paginated searchable student/section choices.
- `tests/enrollments.test.cjs`: endpoint contracts, transition rules, DTO distinctions, invalid input rejection, export integrity, CSV and safe errors.

Existing demo helpers and the old demo modal remain unused by the active screen; unrelated frontend work is preserved.

## Verification and deployment

- Lint and TypeScript passed.
- All 44 frontend tests passed, including six enrollment service tests.
- Tracked enrollment-screen whitespace checks passed.
- Docker production build passed with the existing large-bundle advisory.
- Rebuilt/recreated only Docker `admin-web`; `/admin/enrollments` returned HTTP 200. The served `/assets/index-D5eFEohc.js` bundle contains the enrollment API integration.
- Authenticated CRUD/capacity/concurrency smoke tests remain pending normal sign-in and authorized test records; service tests do not prove live backend behavior.
