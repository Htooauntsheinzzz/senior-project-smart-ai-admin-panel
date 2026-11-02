# Timetable — existing API integration

## Scope

Implemented on 2026-10-27, frontend only. Backend controller inventory and course-section DTO/query contracts were inspected read-only. No backend code, database, authentication or permissions were modified.

Route remains `/admin/timetable` with the existing protected page and admin layout. This replaces the active screen's demo schedules and local creation workflow with a live course-section schedule list. The earlier demo behavior documented in `08-Timetable.md` is superseded for this route. Unused demo components/helpers remain untouched.

## Verified capability

There is no Timetable, Schedule or TeachingSession controller. Existing `/lectures` is the lecturer-person resource, not scheduled sessions.

Course Sections returns `room` and `schedule` as nullable strings alongside course/section, lecturer, semester, capacity and status. No structured weekday, start/end timestamp, recurrence or conflict data exists in that DTO. The frontend displays saved schedule text without parsing or inventing calendar events.

## Connected requests

Base: `/api/v1/admin`, using the existing authenticated API client through shared services.

| Endpoint | Use |
| --- | --- |
| GET `/course-sections` | Live paginated schedule list |
| GET `/semesters` | Complete semester filter choices using existing shared loader |

List parameters sent: zero-based `page`, `size=10`, `sort=id,asc`, optional trimmed `search`, numeric `semesterId`, uppercase `status` (ACTIVE/CLOSED). No academic-year, faculty, department, date or conflict parameters are sent. The backend supports additional course/lecturer IDs, but this screen uses search and semester/status controls.

List response: `content`, `page`, `size`, `totalElements`, `totalPages`. The adapter validates pagination metadata, safe totals, row counts and duplicate IDs and maps each record through existing `mapSection`. IDs are server IDs; original schedule text is preserved, and null/blank room or schedule renders as Not specified.

Semester directory loading remains bounded at 2,000 records through the existing loader and rejects incomplete results. Lookup failure has its own error/retry state and does not block text search/status filtering.

## UI behavior

- List is the default view and displays Course, Section, Lecturer, Room, Schedule (as stored), Semester and Status.
- Search is debounced; changing filters resets pagination. Old requests are aborted and ignored, with request keys preventing stale rows under new filters.
- Loading, successful empty, populated and failure/retry states are distinct. Out-of-range pages return to the last available page.
- Refresh reloads the current page and semester choices.
- Calendar and Schedule Conflicts buttons switch to explicit capability explanations. No sample calendar, four-conflict badge or false conflict-free result is shown.
- Manage Course Sections links to the existing API-backed module for section creation and schedule-text editing. This Timetable adapter is read-only; it does not invent a timetable mutation endpoint or perform a partial PUT against the full section-update DTO.
- No browser-local schedule persistence or fake success messages.

The previous faculty/department/year demo filters and sample faculty legend are removed from the active screen because the section response does not provide those scheduling dimensions. Semester filtering remains available. A weekly calendar and conflict detection need a compatible structured session contract with dates/times, timezone, recurrence, room/lecturer identities and validation rules.

## Errors and authorization

Central bearer-token/401 handling is retained. Forbidden responses explain the existing access restriction; invalid filters and other failures use safe messages rather than raw backend errors. Existing backend course-section permissions remain authoritative. No extra access rights are introduced.

## Files

- `src/services/timetableService.ts`: read-only adapter over existing section loader, page validation and safe errors.
- `src/components/timetable/TimetableContent.tsx`: live list, controls and capability explanations.
- `tests/timetable-api.test.cjs`: request contract, invalid filter rejection, pagination integrity and unparsed/null schedule preservation.

## Verification

- `npm run lint` and `npx tsc --noEmit` passed.
- All 48 frontend tests passed, including two timetable API tests.
- Docker production build passed with the existing large-bundle advisory.
- Rebuilt/recreated only `admin-web`; `/admin/timetable` returned HTTP 200 and the served `/assets/index-C4dDdAkL.js` bundle contains the updated timetable screen.
- Authenticated live-data and keyboard/visual checks remain pending normal sign-in. No backend data is mutated by this integration.
