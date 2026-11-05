# Navigation Routes — frontend implementation

## Source and scope

- [Figma Navigation Screen, node 121:5185](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=121-5185&m=dev).
- Visually inspected through the browser on 2026-10-12.
- Frontend only, existing APIs only. No backend source, database, migration, authentication, permission or API contract changes. No browser-local record persistence.
- Protected route: `/admin/navigation-routes`.
- Navigation: **Campus Management → Navigation Routes**.

## Observed Figma design

### Header and summary

- Heading: **Navigation Routes**.
- Subtitle: **Manage campus walking graph — nodes and paths used by the student mobile navigation**.
- Outlined **Add Node** and dark **Connect Nodes** actions at the right.
- Four equal tinted cards: **Total Routes** (18, neutral), **Active** (16, green), **Accessible** (15, purple), **Under Construction** (1, amber).
- The numbers are design examples, not verified production counts.

### Filters and legend

**Filter Routes:** All, Active, Inactive, Under Construction. All is a dark selected pill; the others are pale outlined pills.

The right-aligned legend distinguishes Active, Inactive, Under Construction, and Accessible. Line patterns and an accessibility icon supplement color.

### Walking graph

A large rounded pale-blue panel appears above the route list. The populated reference includes:

- Building, gate, campus-place and junction nodes with short labels.
- Connections with distance labels in meters and accessibility symbols.
- Blue paths, a dashed inactive connection, and highlighted nodes.
- A subtle horizontal/vertical background cross.

The supplied frame does not display add/connect forms or prove dragging, pathfinding, zoom or map-tile behavior. Those behaviors are not invented.

### Route List

White bordered panel titled **Route List**. Uppercase columns:

1. ID
2. Start Node
3. End Node
4. Distance
5. Walk Time
6. Accessible
7. Surface
8. Status
9. Actions

Reference rows show compact ID badges, named endpoints, meter/minute values, accessibility indicators, surface descriptions (e.g. Covered Walkway, Paved, Gravel), status badges, and Edit/delete controls. Light alternating rows and dividers keep the list compact. No pagination control is visible in the supplied frame.

## Frontend implementation

| File | Responsibility |
| --- | --- |
| `src/pages/campus/NavigationRoutesPage.jsx` | Existing admin shell, authentication and logout conventions |
| `src/components/campus/NavigationRoutesContent.tsx` | Header, summary cards, filter pills, legend, graph unavailable state and Route List |
| `src/data/navigation.ts` | Connect existing Navigation Routes item |
| `src/routes/AppRoutes.jsx` | Register protected route |
| `src/components/navigation/TopNav.tsx` | Campus Management label/icon and current-page link |

Uses existing fonts, colors, rounded controls and responsive spacing. Summary cards collapse to two/one columns; filters/legend wrap. The list has a semantic caption/headers and keyboard-focusable horizontal scrolling. Unavailable-data explanations remain outside wide table content for mobile readability. Controls have accessible names and reference the API explanation.

## Data boundary and design differences

Read-only backend inspection found no navigation-node, walking-route or coordinate API. Accordingly:

- Summary values are unknown (**—**), not the sample values or misleading zeroes.
- The graph background is decorative; no fabricated nodes, links, distances, walk times or accessibility claims appear.
- Add Node, Connect Nodes and status-filter pills are disabled with an explanation.
- Route List shows an unavailable-data state instead of example routes or nonfunctional per-record actions.
- No speculative requests, pathfinding simulation, browser-local data, or false save/delete successes.

This delivers the design-based layout and unavailable-data state, not working navigation management or exact parity with the populated Figma graph. Real node/route rendering and editing require a compatible existing API with verified endpoint relationships, coordinates, units, accessibility and status contracts.

## Verification and deployment

- Lint, TypeScript and all 32 existing frontend tests passed.
- Docker production build passed; existing bundle-size advisory remains.
- Tracked integration-file whitespace checks passed.
- Rebuilt/recreated only `admin-web`. `/admin/navigation-routes` returns HTTP 200 on localhost:3000 and its served JavaScript bundle contains the Navigation Routes screen.
- Authenticated visual/keyboard verification remains pending sign-in.

No backend setup or database migration is required.
