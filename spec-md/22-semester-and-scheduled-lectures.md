# Semester and Lectures — frontend-only, existing APIs

## Current scope (2026-10-07)

The user clarified **no backend code changes** and selected **Existing APIs only** when asked how unsupported metadata and scheduled sessions should be persisted. This supersedes the earlier full-stack implementation. No browser-local storage or fake production records are used.

## Implemented

- Sidebar order: Semester, Faculty, Department, Lectures, Program, Courses, Course Sections, Enrollments. Existing academic URLs and other sidebar sections are preserved.
- `/admin/semesters`: search English/Thai names; list, fresh detail, add, edit and confirmed delete using existing GET/POST `/api/v1/admin/semesters` and GET/PUT/DELETE `/api/v1/admin/semesters/{id}`.
- Only `semesterNameEn` and `semesterNameTh` are submitted. Both are required, trimmed, max 150 characters. Existing backend name-pair uniqueness errors are shown. There is no semester-code field in the unchanged contract.
- Shared semester lookup is reused with complete pagination checks, a 2,000-record bound and no partial/duplicate results. Total Semesters comes from the complete loaded directory. Unknown/error counts are shown as unknown, not zero.
- Before sending DELETE, the portal queries existing `/courses`, `/course-sections`, and `/students` with `semesterId`, page 0, size 1. Known references block deletion with counts; failed/malformed checks block deletion too. This is a frontend preflight, **not an atomic server guarantee**, and cannot detect soft-deleted references hidden by list APIs or references created concurrently.
- Reused AdminLayout, central Axios/auth, Drawer, Modal, Faculty styling, loading/error/empty/success states, dirty confirmation, pending locks, and responsive table scrolling.
- `/admin/lectures`: an explicit API-capability explanation and working link to existing Course Sections. No invented scheduling endpoint or fake CRUD controls. Existing `/lectures` backend records are lecturer **people**, not scheduled sessions.
- Restored the original Timetable route and functionality. Its pre-existing local-demo data was not migrated into fictitious production sessions.

## Blocked by the unchanged API

- Semester codes, code uniqueness, academic-year/date/status persistence, date-range validation, status filtering, and active/upcoming totals.
- Scheduled teaching-session list/search/filter/add/view/edit/delete. Course Sections has room and free-text schedule notes but no dated start/end-time session model or API.
- Atomic server-side prevention of deleting referenced semesters.

These limitations are displayed or documented rather than presenting placeholder controls or fabricated records. They require an existing suitable API to connect in a later frontend-only task.

## Backend restoration and database state

The earlier instruction requested backend/API changes. Before the clarification, V19 was deployed and applied, adding semester metadata columns, a teaching_sessions table, indexes, constraints and reference triggers.

All backend source modifications from that implementation were reverted and the restored original backend was rebuilt/redeployed. `git diff --exit-code` confirms no backend content diff. No new migration is required by this frontend implementation.

**The already-applied V19 database objects and migration history were preserved**, not destructively rolled back. Restored backend startup succeeds and reports schema version 19 ahead of its latest bundled migration 18. The frontend does not depend on the added fields/table. A future database rollback requires checking for data and explicit coordination; do not silently drop objects or remove migration history. This retained schema must be considered before allocating a future V19 migration.

## Verification

- Frontend checks: lint, TypeScript, production build, and `node --test tests/*.test.cjs`.
- Semester tests cover exact legacy payloads, validation, safe IDs, reference-blocked deletion, fail-closed checks, 204, complete pagination and navigation.
- Existing academic service tests remain included.
- Backend restoration verified by successful image build/startup and empty content diff. Earlier teaching-session integration results belong to the reverted implementation and are not evidence of current supported features.
- Authenticated browser CRUD/visual verification requires normal sign-in. No screenshot attachment was available; the existing Faculties page was the visual reference.

### Completed checks and deployment (2026-10-07)

- All 32 frontend tests passed, as did lint, TypeScript, production build and Docker builds.
- Backend working tree is clean (`git status --short` returns no entries). Original backend is running on port 8080.
- Rebuilt/recreated `admin-web`; it is healthy on port 3000.
- Browser navigation to `/admin/semesters` redirects normally to `/login`; authenticated live CRUD and visual checks remain pending.
