# Exams — frontend implementation

## Design revision — 2026-10-12

Current reference: [Exams Screen, node 121:1504](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=121-1504&m=dev), replacing 112:859. The new frame is 1757 × 1091.

- Full-width heading area, with conflict indicator, Export and single-line Schedule Exam aligned right.
- Four equal summary cards span the desktop content width.
- All six filters appear in a single wrapping toolbar instead of two fixed-width groups.
- Type legend remains left; schedule-conflict explanation moves right.
- Pagination aligns right.
- Existing-API-only limitations below still apply. No backend/persistence changes.

## Design reference

[Figma exams screen, node 112:859](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=112-859&m=dev), visually inspected in the browser.

- Heading: **Exams**.
- Subtitle: **Schedule and manage course examinations with conflict detection.**
- Header: amber conflicts indicator, outlined Export, dark Schedule Exam action.
- Summary cards: Total Exams, Scheduled, Completed, With Conflicts.
- Filters: Exam Type, Course, Semester; Status, Conflict, date.
- Legend: Quiz (blue), Midterm (purple), Final (red), Practical (green); yellow row means schedule conflict.
- Table: Exam, Course, Section, Type, Date, Time, Building / Room, Status, Actions.
- Footer: record/conflict counts and compact pagination.

The reference's 18 exams, 14 scheduled, 4 completed, and 3 conflicts are illustrative design values, not live records.

## Implementation

- Protected route `/admin/exams` and existing Academic Activities → Exams item connected.
- `src/pages/exams/ExamsPage.jsx` reuses AdminLayout, authentication, and logout conventions.
- `src/components/exams/ExamsContent.tsx` implements the design-based layout and unavailable-data state.
- TopNav identifies Academic Activities on both Assignments and Exams.
- Responsive card grid, wrapping controls, keyboard-focusable horizontal table scrolling, semantic headers, accessible control labels, and a status announcement.
- Unavailable-data message remains outside the wide scrollable table so it is readable on mobile.

## Existing-API-only scope

Read-only search of backend source found no exam support. No backend code, database, migration, permissions, or authentication changes were made.

As with Assignments, totals are unknown (—), the data state is explicit, and unsupported filters/actions are disabled. No example rows, fake conflict detection, browser-local persistence, or invented API requests are used. Populated rows, scheduling, export, and conflict detection require an existing compatible API before integration. The populated reference screen's exact pixel parity is not claimed.

## Verification and deployment

- Lint and TypeScript passed; all 32 existing tests passed.
- Docker frontend production build passed (existing large-bundle advisory remains); tracked integration-file whitespace checks passed.
- Rebuilt and recreated only `admin-web`. `/admin/exams` returns HTTP 200 on localhost:3000; served bundle contains both Exams and Assignments screens.
- Authenticated visual verification remains pending normal sign-in.
