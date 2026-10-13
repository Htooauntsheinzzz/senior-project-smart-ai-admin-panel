# Rooms — frontend implementation

## Source and scope

- [Figma Rooms Screen, node 121:3054](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=121-3054&m=dev).
- Visually inspected through the browser on 2026-10-12.
- Frontend-only changes; existing APIs only. No backend source, API contract, migration, database, authentication, or permission changes.
- Route: `/admin/rooms`, under the existing protected admin route.
- Sidebar: **Campus Management → Rooms**, preserving the existing section order.

## Observed design

### Header

- **Rooms**
- **Manage classroom, lab, and office room data for campus navigation**
- Dark **+ Add Room** action aligned right.
- Existing admin sidebar and Campus Management top-navigation label.

### Summary cards

Four full-width, equal desktop cards with rounded corners and tinted fills:

| Label | Reference value | Color |
| --- | --- | --- |
| Total Rooms | 18 | Neutral gray |
| Available | 9 | Green |
| Occupied | 4 | Red |
| Maintenance | 2 | Amber |

Reference values are examples; they are not verified production counts. Do not infer other status totals from these figures.

### Filters

A horizontal toolbar contains **Search rooms…**, **All Buildings**, **All Floors**, **All Types**, and **All Statuses**, with the room count at the far right.

Visible row types: Classroom, Computer Lab, Laboratory, Lecture Hall, Meeting Room, Study Room. Visible statuses: Available, Occupied, Reserved, Under Maintenance. Filter dropdowns are not expanded in the supplied frame; these values are derived from visible row labels, not a verified API enumeration.

### Directory

Uppercase headings, in order:

1. Room Number
2. Room Name
3. Building
4. Floor
5. Type
6. Capacity
7. Status
8. Facilities
9. Actions

The reference uses compact neutral room-number badges, building names with codes below, F-prefixed floor numbers, colored room-type/status badges, capacities with a pax suffix, small facility icons, and Actions dropdown buttons. Rows alternate white and pale gray with subtle dividers. Footer shows **Showing 1–10 of 18**, with page 1 active and page 2 available.

The provided frame does not show an expanded action menu or Add Room form; neither is invented as a functional workflow.

## Implementation files

| File | Responsibility |
| --- | --- |
| `src/pages/campus/RoomsPage.jsx` | AdminLayout, existing authentication and logout behavior |
| `src/components/campus/RoomsContent.tsx` | Header, tinted summaries, filters, table structure, unavailable-data state and pagination |
| `src/data/navigation.ts` | Existing Rooms item linked to `/admin/rooms` |
| `src/routes/AppRoutes.jsx` | Protected Rooms route |
| `src/components/navigation/TopNav.tsx` | Campus Management label/icon for Rooms |

Uses existing typography, spacing, controls and responsive patterns. Cards collapse to two/one columns; filters wrap; the table scrolls within a keyboard-focusable region. Accessible labels, a semantic caption/headers, and a status announcement explain unavailable data. The message is outside the wide table to remain readable on mobile.

## Existing API limitation

Read-only backend inspection found room names only as a free-text field on Course Sections. There is no room-directory model/API containing room number, name, building, floor, type, capacity, status, and facilities. A section's enrollment capacity must not be treated as room capacity.

Following the user's existing-APIs-only choice and rejection of browser-local persistence:

- Display unknown totals as **—**, with **Room data unavailable** and an explicit explanation.
- Disable Add Room, filters and pagination until a compatible existing API is available.
- Do not generate directory records from section strings or present Figma's sample records as live data.
- No speculative requests, fabricated facilities/statuses, local-storage records, or false success actions.

This implements the design-based layout and unavailable-data state, not room CRUD or exact parity with the populated reference table. Actual row data/actions require a verified existing API.

## Verification and deployment

- Lint, TypeScript and all 32 existing frontend tests passed.
- Docker production build passed; the existing bundle-size advisory remains.
- Tracked integration-file whitespace checks passed.
- Rebuilt/recreated only `admin-web`. `/admin/rooms` returns HTTP 200 on localhost:3000; its served JavaScript bundle contains the Rooms screen.
- Authenticated visual/keyboard verification remains pending normal sign-in.

No backend setup or database migration is required.
