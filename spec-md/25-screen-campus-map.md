# Campus Map — frontend implementation

## Source and scope

- [Figma Campus Map Screen, node 117:1820](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=117-1820&m=dev).
- Visually inspected through the browser on 2026-10-12.
- Frontend only. No backend source, API contract, database, migration, or authentication changes.
- Protected route: `/admin/campus-map`; sidebar: **Campus Management → Campus Map**.

## Observed Figma design

### Header and shell

- Existing admin sidebar and top navigation; Campus Management expanded and Campus Map active.
- Title: **Campus Map**.
- Subtitle: **Interactive map for mobile navigation data management**.
- Dark **Add Location** action and outlined **Manage Routes** action.

### Left control panel

White panel with thin section dividers alongside the map:

1. **Search locations…** input.
2. **Map Layers**: Buildings, Campus Places, Navigation Nodes, Walking Routes. The reference displays all switches on except Navigation Nodes.
3. **Filter by Type**: All, Academic Building, Library, Cafeteria, Registrar, Student Affairs, Health Center, Parking, Sports Center. All is selected with a neutral background; counts appear at the right.
4. **Summary**: Total Locations, Active, Inactive; active value uses green.

The design shows 12 total locations, 11 active, and 1 inactive. These are reference values, not verified backend data.

### Map viewport

- Pale-blue background, campus title in a white rounded label: **Rangsit University Campus**.
- Illustrated location markers with category colors, route outline, and landscaped areas.
- Upper-right plus/minus zoom buttons; lower-left compass/orientation control.
- Bottom instruction: **Click a marker to view location details**.

## Implemented frontend

| File | Responsibility |
| --- | --- |
| `src/pages/campus/CampusMapPage.jsx` | AdminLayout, existing session and logout integration |
| `src/components/campus/CampusMapContent.tsx` | Header, control panel, type legend/counts, summary, map viewport and unavailable-data state |
| `src/data/navigation.ts` | Connect existing Campus Map item |
| `src/routes/AppRoutes.jsx` | Register protected page |
| `src/components/navigation/TopNav.tsx` | Campus Management label/icon on this page |

Uses existing fonts, palette, rounded controls, Lucide icons, and responsive layout conventions. On smaller screens, controls stack above the map. Inputs and disabled controls have accessible labels and an explanation; layer switches have explicit states and the map state is announced with `role="status"`.

## API limitations and visual differences

Read-only backend source search found no campus/building/location-coordinate support. Following the existing-APIs-only approach used for Assignments and Exams:

- No fictional map service, external tile provider, geolocation request, or browser-local persistence.
- Counts display **—**, not example totals or false zeroes.
- Search, filters, layer switches, zoom/orientation controls, Add Location, and Manage Routes are disabled with a visible API explanation.
- Switches retain the design's initial visual states but do not imply loaded map layers.
- The pale-blue viewport is a styled background, not a georeferenced map. No invented campus markers or routes are displayed.
- The center shows **Campus map data unavailable**. The bottom instruction explains that markers will appear when campus data is available.
- No location-detail or creation form is invented: the supplied frame does not show either state.

This implements the reference layout with an explicit unavailable-data state. It does not provide working map management or claim exact parity with the populated Figma illustration. Actual markers, filtering, detail views, edits and routing require a compatible existing API with verified coordinates and contracts.

## Verification and deployment

- Lint and TypeScript passed; all 32 existing frontend tests passed.
- Docker production build and tracked integration-file whitespace checks passed. Existing bundle-size advisory remains.
- Rebuilt/recreated only `admin-web`. `http://localhost:3000/admin/campus-map` returns HTTP 200 and the served bundle contains the Campus Map screen.
- Authenticated visual/keyboard comparison remains pending sign-in.

No backend setup or migration is required.
