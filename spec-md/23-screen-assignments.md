# Assignments — frontend implementation

## Design revision — 2026-10-12

Current reference: [Assignments Screen, node 121:620](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=121-620&m=dev), replacing 112:2. The new frame is 1757 × 1111.

- Removed the narrow heading constraint; Export and single-line Create Assignment align right.
- Four equal summary cards span the desktop content width.
- Search grows beside Course, Section, Status, and Due in one desktop toolbar; controls wrap on small screens.
- Pagination aligns right.
- Moved the unavailable-data message outside the wide table so it remains readable on mobile.
- Existing-API-only limitations below still apply. No backend/persistence changes.

Earlier observations below describe the original frame where they differ from this revision.

## Source and scope

- [Figma: Assignments Screen, node 112:2](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=112-2&m=dev).
- The frame was visually inspected through the browser. Earlier direct HTTP access returned 403, but the supplied frame subsequently loaded in the browser.
- Frontend only: no backend code, database, API contracts, or authentication rules changed.
- Route: `/admin/assignments`, under the existing protected admin route.

## Observed design

The reference contains:

1. Existing admin sidebar and top navigation; Academic Activities is the active navigation group.
2. **Assignments** heading with subtitle: “Create and manage course assignments across all sections.”
3. Outlined **Export** action and dark **Create Assignment** action beside the heading.
4. Four white rounded summary cards above the filters: **Total Assignments**, **Published**, **Drafts**, **Closed**. Icon tiles use neutral, green, gray, and blue treatments respectively.
5. Search placeholder **Search by title, course, or section…**, with **Course** beside it; **Section**, **Status**, and **Due:** controls on the next row.
6. Rounded white table with columns in this order: **Assignment Title**, **Course**, **Section**, **Due Date**, **Priority**, **Status**, **Actions**.
7. Reference row styling: title with points/submissions underneath; course code with course name below; purple section badges; due date with time underneath; colored priority tags; status pills; vertical action menus.
8. Record count and compact pagination below the table.

The reference shows 18 total, 13 published, 4 drafts, and 1 closed, with 10 example rows on the first page. These are design examples, not verified application data.

## Implemented files

| File | Responsibility |
| --- | --- |
| `src/pages/assignments/AssignmentsPage.jsx` | Existing AdminLayout/auth/logout integration |
| `src/components/assignments/AssignmentsContent.tsx` | Design-based header, cards, filter layout, table and unavailable-data state |
| `src/data/navigation.ts` | Connect existing Assignments item to `/admin/assignments` |
| `src/routes/AppRoutes.jsx` | Register protected Assignments route |
| `src/components/navigation/TopNav.tsx` | Academic Activities label/icon on Assignments |

Uses existing typography, rounded borders, background colors, Lucide icons, responsive control wrapping, and horizontally scrollable table semantics. The existing sidebar handles active/expanded state.

## Data limitation and explicit design differences

Read-only inspection of the backend found no coursework-assignment endpoint. Department/user assignment classes concern organizational access, not student coursework.

Following the user's existing-APIs-only constraint:

- No speculative API requests, fabricated records, or browser-local persistence were introduced.
- Summary values display **—** rather than sample totals or misleading zeroes.
- The table displays an explanatory **Assignment data unavailable** state instead of Figma's sample records.
- Export, Create Assignment, filters, and pagination are disabled, with the API limitation stated on the page.
- No unsupported creation form, row actions, or successful mutation notifications are presented.

This implements the screen layout and its unavailable-data state, not working assignment CRUD. Populated row styling and interactive CRUD remain pending a compatible existing API. Exact pixel parity for the populated Figma screen is not claimed.

## Verification

- `npm run lint`: passed.
- `npx tsc --noEmit`: passed.
- `node --test tests/*.test.cjs`: 32 tests passed.
- `npm run build`: passed; existing large-bundle advisory remains.
- Authenticated browser comparison of the implemented screen remains pending normal sign-in.

No migration or backend setup is required. Run the frontend normally and sign in, then open **Academic Activities → Assignments**. Docker-hosted installations require rebuilding the frontend image to serve this change.
