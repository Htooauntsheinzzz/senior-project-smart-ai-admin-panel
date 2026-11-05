# Buildings — frontend implementation

## Design revision — 2026-10-12

Current reference: [Buildings Screen, node 121:2](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=121-2&m=dev), replacing the former table-cell link.

- Subtitle uses available width instead of an artificial narrow maximum.
- Four shorter tinted summary cards span the desktop content width.
- Status selector sits beside search; the count aligns to the far right.
- Table headings are now visible in Figma: BUILDING CODE, BUILDING NAME, FLOORS, ROOMS, OPENING HOURS, STATUS, ACTIONS. Updated labels and small uppercase styling accordingly.
- Responsive wrapping, unknown counts and unavailable-data handling remain. No backend/persistence changes.

Earlier observations below describe the original frame where they differ from this revision.

## Source and scope

- [Figma Buildings reference, node 117:2957](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=117-2957&m=dev).
- Visually inspected on 2026-10-12. This node selects a **Table Cell** inside the **Buildings Screen**; the surrounding screen was used as the reference.
- Frontend only; no backend code, API contracts, database, migrations, authentication, or server permissions changed.
- Existing-APIs-only constraint retained. Browser-local persistence was explicitly declined.

## Observed design

### Header

- **Campus Buildings**
- **Manage university building information used by the campus navigation system**
- Dark **+ Add Building** button on the right.
- Existing admin shell with Campus Management expanded and Buildings active.

### Summary cards

Four rounded, tinted cards beneath the header:

| Label | Reference value | Treatment |
| --- | --- | --- |
| Total Buildings | 12 | Neutral gray |
| Active | 10 | Green |
| Under Renovation | 1 | Amber |
| Total Rooms | 526 | Purple |

These numbers are design examples, not verified application records.

### Directory

- Search placeholder: **Search buildings…**.
- **All Statuses** selector and building count to the right.
- Rows visibly contain code badges, bold building names with area in m² underneath, floor counts with an F suffix, room counts, opening hours, status pills, and **Actions** dropdown buttons.
- Visible statuses include Active (green) and Under Renovation (amber).
- Alternating light/white rows, subtle horizontal dividers, and compact typography.
- Footer displays **Showing 1–8 of 12**, with pages **1** and **2**.
- The inspected view does not show column-heading text or expanded actions/forms. Implemented semantic headings are inferred from visible row content: Code, Building, Floors, Rooms, Opening Hours, Status, Actions. Form fields and dropdown actions have not been invented.

## Frontend implementation

| File | Responsibility |
| --- | --- |
| `src/pages/campus/BuildingsPage.jsx` | Existing AdminLayout, session and logout conventions |
| `src/components/campus/BuildingsContent.tsx` | Header, tinted summaries, search/status toolbar, semantic table, unavailable-data state and footer |
| `src/data/navigation.ts` | Existing Buildings destination → `/admin/buildings` |
| `src/routes/AppRoutes.jsx` | Protected Buildings route |
| `src/components/navigation/TopNav.tsx` | Campus Management label/icon on Buildings |

Summary cards wrap to two columns on small screens; controls wrap; the table scrolls within a focusable region. Semantic headings, table headers/caption, input labels and an announced availability explanation are included. The unavailable-data message sits outside the wide table to remain readable on mobile.

## Existing API limitations

Read-only search of backend source/resources found no building support. The page therefore displays **Building data unavailable**, summary values **—**, and an unknown record count. Add Building, search, status filtering and pagination are disabled with an explanation. There are no fabricated rows, speculative API requests, false success messages, or local-storage records.

This delivers the design-based screen layout and unavailable-data state. Populated row rendering, actual counts, building CRUD, and exact visual parity with the populated reference require a compatible existing API. Do not treat this screen as completed building management.

## Verification and deployment

- Lint, TypeScript, and all 32 existing frontend tests passed.
- Docker production build passed; existing bundle-size advisory remains.
- Tracked integration-file whitespace checks passed.
- Rebuilt/recreated only `admin-web`. `/admin/buildings` returns HTTP 200 on localhost:3000, and the served JavaScript bundle contains the Buildings screen.
- Authenticated visual/keyboard verification remains pending normal sign-in.

No backend setup or migration required.
