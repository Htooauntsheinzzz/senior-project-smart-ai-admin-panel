# Campus Places — frontend implementation

## Source and scope

- [Figma Campus Places Screen, node 121:3861](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=121-3861&m=dev).
- Visually inspected through the browser on 2026-10-12.
- Frontend only, existing APIs only; no backend code, database, migrations, authentication, or permissions changed. Browser-local record persistence remains excluded.
- Protected route: `/admin/campus-places`.
- Navigation: **Campus Management → Campus Places**.

## Figma layout

### Header

- **Campus Places**
- **Points of interest and campus facilities for the student mobile navigation app**
- Segmented **Cards / Table** display control, Cards selected by default.
- Dark **+ Add Campus Place** action, aligned right.

### Summary

Four equal-width tinted cards across the desktop content area:

| Label | Example value | Treatment |
| --- | --- | --- |
| Total Places | 15 | Neutral gray |
| Open | 14 | Green |
| Closed | 1 | Red |
| Popular | 7 | Amber |

The values are design examples, not verified application records.

### Category and filter bars

Categories appear beneath the summary, with small icons/counts: **All**, **Library**, **Cafeteria**, **Registrar**, **Student Affairs**, **Health Center**, **ATM**, **Parking**, **Sports Center**, **Main Gate**. All has a dark underline.

The next row contains **Search places…**, **All Statuses**, and the place count aligned right.

### Populated card design

The reference has four columns of white rounded cards on a pale background. Each card contains:

- Category-colored icon tile and place name.
- Category and opening-status badges; optional amber Popular badge.
- Compact row-action trigger in the upper right.
- Short description.
- A two-by-two grid of light metadata tiles: Building, Floor, Hours, Phone.

Example cards include Henry Luce II Library, RSU Cafeteria Central, Cafeteria North, Registrar Office, Student Affairs Office, Health Center, bank ATMs, parking zones, RSU Sports Complex, gates, and Counseling & Wellness Center. One ATM displays Temporarily Closed. These examples are not imported as production data.

The supplied frame shows Cards view only. Table columns in this implementation are a frontend interpretation of the card metadata, not a separately verified Figma table state. The Add form and expanded row menu are not shown.

## Implemented frontend files

| File | Responsibility |
| --- | --- |
| `src/pages/campus/CampusPlacesPage.jsx` | Existing admin shell/session/logout integration |
| `src/components/campus/CampusPlacesContent.tsx` | Header, working display-mode switch, summaries, categories, filters and unavailable-data views |
| `src/data/navigation.ts` | Connect existing Campus Places item |
| `src/routes/AppRoutes.jsx` | Register protected page |
| `src/components/navigation/TopNav.tsx` | Campus Management label/icon and current-page link |

Display mode is local React UI state only, with Cards as the initial view. Buttons use `aria-pressed`, preserve focus, and announce the selected view. Table mode displays accessible headers for Place Name, Type, Building, Floor, Hours, Phone, Status, Actions. Both views clearly explain unavailable records.

Summary cards adapt to four/two/one columns. Category/filter controls wrap. Table overflow is confined to a keyboard-focusable region; the availability message stays outside that region so it remains readable on mobile.

## Data boundary and design differences

Read-only backend inspection found no campus-place/location API. Accordingly:

- Summary and category counts display **—**, not example values or false zeroes.
- Cards view contains an explicit unavailable-data panel, not the populated reference grid.
- The Cards/Table switch works independently of backend data; search, categories, status filtering and Add Campus Place remain disabled with an explanation.
- No fictional place records, speculative API calls, browser-local persistence, or false save/delete actions.
- Populated cards, actual counts, creation/edit/deletion and exact parity with the reference's populated view require a compatible existing API.

This is the design-based page shell with an unavailable-data state, not completed campus-place management. No migration or backend setup is required.

## Verification and deployment

- Lint, TypeScript and all 32 existing frontend tests passed.
- Docker production build passed; the existing bundle-size advisory remains.
- Tracked integration-file whitespace checks passed.
- Rebuilt/recreated only `admin-web`. `/admin/campus-places` returns HTTP 200 on localhost:3000 and the served bundle contains the Campus Places screen.
- Authenticated visual, Cards/Table interaction and keyboard verification remain pending sign-in.
