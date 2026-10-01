# Smart AI Admin Portal — Faculties and Add Faculty Drawer

## Source and scope

- [Figma: Smart Ai Admin Web, node 42:2](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=42-2&m=dev)
- Inspected on 2026-09-29 using the node's high-fidelity design context and screenshot.
- Frame: `Faculties Screen`. The reference shows the faculty directory and an open **Add Faculty** drawer on its right.
- Deliverable: a Markdown implementation specification. Application code and assets are not implemented by this document.
- Related guide: [Add Admin User implementation](FIGMA_IMPLEMENTATION.md). Reuse shared shell concepts, but apply this screen's navigation selection, typography, and controls.

The visual measurements, copy, data, and default states below are confirmed by Figma. Interaction details, component boundaries, API design, and responsive breakpoints are proposed implementation guidance unless stated otherwise.

## Project integration

The current starter uses React 19, Vite 7, JavaScript, and Tailwind CSS 4 with the Vite plugin already configured. `src/main.jsx` mounts `src/App.jsx`; `src/index.css` imports Tailwind and declares Inter without loading font assets. No reusable application component library or backend integration is present in the inspected source.

Implement with the existing stack. Define shared tokens in `src/index.css`, load the required fonts, and compose reusable React components. Preserve the entry point. Do not add a second CSS framework or copy generated absolute positioning for ordinary content. No Code Connect mappings were supplied in the retrieved response.

## Reference geometry

The dashboard region measures approximately **1459 × 867.5px**. The drawer is **460px wide**, positioned at approximately **x = 1458.75px**, and is **868px tall**. The composition therefore spans approximately **1919px** before screenshot framing. These are canvas measurements, not a requirement to force a 1919px browser width.

The open drawer is shown beside the dashboard, leaving the entire table visible. There is no visible dimming backdrop. Preserve that arrangement for the wide reference state; do not assume an overlay on desktop solely because the layer is called Drawer. Use a flexible main region and a right-hand panel rather than literal canvas coordinates.

| Element | Reference specification |
| --- | --- |
| Sidebar | About 252px wide, white, right border |
| Top navigation | About 64px tall |
| Main page | `#F7F8FC`, flexible remaining width |
| Page heading strip | 28px horizontal padding; 24px top, 20px bottom; bottom border |
| Search region | 28px horizontal padding; 16px top, 12px bottom |
| Table region | 28px horizontal padding; 24px bottom |
| Search input | Full available width; 14px horizontal and 10px vertical padding; 12px radius |
| Table card | About 1151px wide and 522px high at reference size; white; 16px radius; clipped rounded edges |
| Table header / data rows | Approximately 47.8px / 67.6px tall |
| Table cells | 20px horizontal and 14px vertical padding |
| Summary cards | Three equal columns, 16px gaps, 16px below table; about 70.5px tall |
| Drawer | White, 460px width; shadow `0 25px 25px rgba(0,0,0,0.25)` |
| Drawer header and body | 24px horizontal and 20px vertical padding |
| Drawer footer | Top border; 24px horizontal and 16px vertical padding; 12px action gap |
| Drawer fields | 41px height, 12px radius, 14px horizontal padding; 6px label gap; 16px between field groups |

Figma reports most separator and control borders as 0.625px. Start with that measurement and check browser rasterization at the comparison viewport. Use flexbox for the shell, a semantic table for records, and a three-column grid for summary cards. Allow the drawer body to scroll independently while its header and footer remain visible.

## Tokens and typography

| Token | Value | Usage |
| --- | --- | --- |
| Canvas | `#F7F8FC` | Main background |
| Surface | `#FFFFFF` | Sidebar, header, table, cards, drawer |
| Table header | `#FAFBFC` | Column heading background |
| Primary | `#273238` | Selected navigation, primary controls, avatars |
| Primary gradient end | `#1A2329` | Add buttons, gradient angle approximately 164deg |
| Text | `#17213C` | Main text |
| Muted | `#68728A` | Descriptions, Thai names, table labels |
| Border | `#E5E8F0` | Dividers, cards, controls |
| Accent | `#D80255` | Required markers and notification dot |
| Code chip background | `rgba(39,50,56,0.07)` | Faculty codes |
| Active text / background | `#059669` / `#D1FAE5` | Active status |
| Inactive text / background | `#6B7280` / `#F3F4F6` | Inactive status |
| Department metric | `#7C3AED` | Total Departments value |
| Placeholder | `rgba(23,33,60,0.5)` | Search and drawer hints |

Load **Plus Jakarta Sans** for titles, navigation, branding, and summary values; use **Inter** for table content, form labels, descriptions, and actions. Provide a verified Thai-capable fallback for Thai names, since the returned font declaration alone does not establish Thai glyph coverage. Verify the resulting Thai line metrics against the screenshot.

| Text role | Size / line height | Weight and family |
| --- | --- | --- |
| Page title | 22px / 33px | 800, Plus Jakarta Sans |
| Drawer title | 18px / 27px | 800, Plus Jakarta Sans |
| Summary values | 22px / 22px | 800, Plus Jakarta Sans |
| Main / nested navigation | 13px / 19.5px; 12.5px / 18.75px | 500, Plus Jakarta Sans |
| Descriptions | 13px / 19.5px | 400, Inter |
| Table headings / English names | 13px / 19.5px | 600, Inter |
| Faculty code | 12px / 18px | 700, Inter |
| Thai names / summary captions | 11.5px / 17.25px | 400, Inter |
| Department and student counts | 15px / 22.5px | 700, Inter |
| Count captions | 11px / 16.5px | 400, Inter |
| Status badges | 11.5px / 17.25px | 600, Inter |
| Drawer labels | 12.5px / 18.75px | 600, Inter |
| Drawer input text | 13.5px | 400, Inter |
| Drawer actions / radio labels | 13.5px / 20.25px | 600, Inter |

## Shared shell and navigation

Sidebar node: `42:503`. Display the Rangsit University logo beside `SMART AI` and `ADMIN PORTAL`, a collapse control, and the `NAVIGATION` caption.

Preserve menu order:

1. Dashboard
2. User Management
3. Students
4. Academic Management — expanded, with Faculties, Departments, Programs & Majors, Courses, Course Sections, Enrollments
5. Timetable
6. Academic Activities — collapsed
7. Campus Management — collapsed
8. AI Management — collapsed
9. Communication — collapsed
10. Reports & Analytics
11. Settings — expanded, with University Settings and Audit Logs

**Faculties** is selected within Academic Management: dark background, white text, white circular marker, 8px corner radius. The Academic Management parent uses dark text and its active icon variant but does not have the child's filled selection background. User Management is inactive on this screen.

Place the account panel at the sidebar bottom: `A` avatar, `Admin User`, and `Super Administrator`. Permit navigation scrolling on short screens.

The top navigation contains global search (`Search students, courses, rooms…`), an **Academic Management** context control with icon and chevron, notification bell with a pink dot, and `AD` avatar with chevron. The global search and faculty search are separate controls.

## Faculty directory

### Heading and search

- Heading: **Faculties**
- Subtitle: `Manage university faculties and their administrative structure.`
- Upper-right primary button: **Add Faculty**, with a plus icon, 12px radius, and dark gradient.
- Local search placeholder: `Search faculty name or code…`

### Table — node 42:35

Use six columns in this order: **Faculty Code**, **Faculty Name**, **Departments**, **Students**, **Status**, **Actions**.

Reference widths are approximately 167.89, 406.07, 166.06, 131.48, 158.14, and 119.85px respectively. Preserve these proportions at the reference size while allowing responsive overflow. Do not shrink long names until they become unreadable.

| Faculty Code | Faculty Name | Thai Name | Departments | Students | Status |
| --- | --- | --- | --- | --- | --- |
| FAC-ENG | Faculty of Engineering | คณะวิศวกรรมศาสตร์ | 3 | 320 | Active |
| FAC-IT | Faculty of Information Technology | คณะเทคโนโลยีสารสนเทศ | 3 | 285 | Active |
| FAC-BIZ | Faculty of Business Administration | คณะบริหารธุรกิจ | 3 | 412 | Active |
| FAC-SCI | Faculty of Science | คณะวิทยาศาสตร์ | 3 | 178 | Active |
| FAC-MED | Faculty of Medicine | คณะแพทยศาสตร์ | 3 | 203 | Active |
| FAC-LA | Faculty of Liberal Arts | คณะศิลปศาสตร์ | 3 | 156 | Active |
| FAC-LAW | Faculty of Law | คณะนิติศาสตร์ | 2 | 89 | Inactive |

The Thai Name column above documents data; in the UI, render Thai text beneath the English name in the same **Faculty Name** cell. Codes appear in muted gray chips with 8px radius. Counts are centered above lowercase `departments` or `students` captions. Status is a pill with a 6px colored dot, 6px gap, and 10px horizontal / 4px vertical padding. Each Actions cell has a vertical-ellipsis button with an approximately 32px square hit area and 18px icon.

No row action menu contents, sorting controls, pagination, or bulk selection are visible. Do not claim those features are design requirements.

### Summary cards — node 42:358

| Value | Label | Value color |
| --- | --- | --- |
| 7 | Total Faculties | `#273238` |
| 6 | Active Faculties | `#059669` |
| 20 | Total Departments | `#7C3AED` |

Use white cards with 16px radius and 16px horizontal / 14px vertical padding. Derive metrics from source data or server totals; do not hard-code counters separately from records. Proposed behavior: these represent the complete directory, not just search results. Confirm this with the product contract when integrating remote data.

## Add Faculty drawer — node 42:396

The supplied reference has the drawer **open** with blank inputs and Active selected. Provide a reproducible open state for visual review. The closed directory state and opening transition are implementation extensions.

Header: **Add Faculty**, followed by `Create a new faculty in the university.` Place a 32px close button with the supplied X icon on the right.

| Label | Proposed state key | Placeholder / options | Required |
| --- | --- | --- | --- |
| Faculty Code | `code` | `e.g. FAC-ENG` | Yes |
| Faculty Name (English) | `nameEn` | `e.g. Faculty of Engineering` | Yes |
| Faculty Name (Thai) | `nameTh` | `e.g. คณะวิศวกรรมศาสตร์` | No |
| Status | `status` | Active / Inactive | Active initially selected |

Show pink required asterisks after the first two labels. Use native radio controls grouped by a fieldset and Status legend. The reference radio diameter is 20px, with a dark selected circle and white 8px center; options have a 16px gap.

The footer has a top separator and left-aligned actions: gradient **Add Faculty** with a check icon first, then outlined **Cancel**. Preserve this order. Buttons use 12px radius, 20px horizontal / 10px vertical padding, and an 8px icon gap for the primary action. Leave flexible space between the fields and footer.

## Proposed behavior and data boundaries

1. Clicking the page's Add Faculty button opens the panel with empty values and Active selected. X and Cancel close it; a dirty-form discard prompt is a proposed safeguard.
2. Faculty search filters by code, English name, or Thai name. Trim the query and compare text case-insensitively where applicable. Define a clear empty-result state; its visual treatment is not supplied by Figma.
3. Validate nonempty code and English name. Preserve Thai Unicode text. Do not infer a mandatory `FAC-` prefix, permitted character set, or maximum lengths solely from placeholders.
4. Enforce code uniqueness in the backend; a local duplicate check may improve a mock prototype. Show field errors with accessible associations and focus the first invalid field on submission.
5. On submit, disable repeated submission while pending. On success, incorporate the confirmed record, refresh metrics, close/reset the panel, and announce success. On failure, keep the entered values and show actionable feedback. Exact success/error copy is an implementation extension.
6. The frame does not specify new faculty department/student counts. Use server-returned values, or explicitly documented zero values in a mock-only prototype.
7. Row ellipsis controls need an authorized action definition. Do not assume deletion, editing, or status toggling is permitted simply because an Actions column exists. In a prototype, clearly indicate unavailable actions rather than silently doing nothing.
8. Search, notifications, context switching, account menus, and sidebar destinations require host-application callbacks. Avoid inventing production endpoints or routes.

Suggested record shape (a frontend model, not a confirmed API contract):

```js
{
  id: 'stable-record-id',
  code: 'FAC-ENG',
  nameEn: 'Faculty of Engineering',
  nameTh: 'คณะวิศวกรรมศาสตร์',
  departmentCount: 3,
  studentCount: 320,
  status: 'active'
}
```

Creation should send only fields accepted by the actual backend contract; aggregate counts and identifiers should normally come from the response. Prototype fixtures must be labeled as mock data.

## Components and files to introduce

```text
src/
  App.jsx                       # Compose shell and Faculties screen
  index.css                     # Shared tokens, fonts, responsive styles
  components/
    AdminLayout.jsx
    Sidebar.jsx
    TopNav.jsx
    FormField.jsx
    StatusBadge.jsx
  features/faculties/
    FacultiesPage.jsx            # Data, local search, drawer state
    FacultyTable.jsx             # Semantic table and row actions
    FacultySummary.jsx           # Derived metrics
    AddFacultyDrawer.jsx         # Form, validation, close/submit behavior
    facultyFixtures.js           # Design sample data for prototype only
  services/
    faculties.js                # Adapter after API contract is established
public/
  assets/figma/                  # Original exported images and icons
  fonts/                        # Locally hosted font files where available
```

This tree is proposed; the components do not exist yet. Reuse matching shell and form components if the Add Admin User screen is implemented first, while keeping page-specific selection and fields configurable.

## Asset mapping

Refresh Figma context at implementation time and download original assets using the method supplied by the tooling. Asset URLs returned by Figma expire; never retain those URLs in production source. This Markdown-only deliverable does not download assets. The screenshot is a visual comparison target, not an implementation asset.

| Asset identifier | Slot |
| --- | --- |
| `54314.png` | Rangsit University logo, approximately 102.63 × 40px wrapper |
| `f9a63.svg` | Page Add Faculty plus icon, approximately 16px |
| `13b46.svg` | Faculty search icon, approximately 16px |
| `476b4.svg` | Every row's ellipsis, approximately 18px |
| `50c31.svg` | Drawer close icon, approximately 16px |
| `1d18a.svg` | Drawer Add Faculty check icon, approximately 14px |
| `e517e.svg` | Sidebar collapse |
| `3bfe2.svg`, `5bc4a.svg`, `9c037.svg` | Dashboard, inactive User Management, Students |
| `5d711.svg`, `fbeb8.svg` | Active Academic Management parent icon and chevron |
| `3b8e1.svg`, `646a9.svg`, `b0dd0.svg` | Timetable, Academic Activities, other group chevrons |
| `14af3.svg`, `1d45f.svg`, `af5e6.svg` | Campus Management, AI Management, Communication |
| `5d063.svg`, `4f373.svg` | Reports & Analytics, Settings |
| `bef91.svg`, `42c27.svg` | Global search, Academic Management context icon |
| `bd3f9.svg`, `258e2.svg` | Header chevrons, notification bell |

Use descriptive local filenames. Preserve each SVG's root width/height and its correct slot/variant; do not replace icons with approximations or apply blanket image stretching. The selected sidebar variant differs from the Add Admin User design.

## Responsive and accessibility proposals

- Wide screens: reproduce the adjacent 460px drawer and fully visible directory. Fit the shell to available space with `min-width: 0` on flexible regions.
- Below a proposed 1280px viewport, use a right-side overlay drawer capped at 460px; below 640px, use full width. This is an adaptation, not a measured Figma breakpoint.
- Below a proposed 1024px viewport, collapse the sidebar into an accessible menu. Stack summary cards when three columns no longer fit comfortably.
- Keep table columns readable in a labeled horizontal scroll region on narrow screens. Do not hide the Thai names, status, or row actions to force a fit.
- Use native table semantics with column headers; accessible row-action names should identify the faculty. Badge text must convey status independently of color.
- On open, move focus into the panel. Escape closes it when appropriate and restores focus to the opener. Trap focus and use modal semantics only for the overlay/modal variant; an adjacent nonmodal panel should remain keyboard reachable without claiming the background is inert.
- Associate labels and validation errors with inputs, use a shared name for status radios, provide visible focus indicators, and announce save outcomes.
- Keep drawer fields scrollable on short viewports, with the footer reachable. Test zoom, Thai font fallback, and expanded text.

## Implementation and verification checklist

- [ ] Retrieve fresh context and assets; load fonts and define reusable tokens.
- [ ] Build the shell with Academic Management expanded and Faculties selected.
- [ ] Reproduce the heading, page Add Faculty button, and faculty search field.
- [ ] Render all seven records with exact English/Thai names, counts, and status.
- [ ] Derive summary values 7, 6, and 20 from the fixture data.
- [ ] Match table proportions, chips, badge colors, typography, spacing, and action icons.
- [ ] Reproduce the open drawer, three blank text fields, Active radio selection, and footer action order.
- [ ] Implement search, empty results, drawer opening/closing, validation, and the agreed save callback.
- [ ] Verify keyboard operation, focus return, radio selection, required-field errors, and narrow/short viewport behavior.
- [ ] Exercise successful and failed creation, duplicate-code feedback, and duplicate-submit prevention using a mock adapter or real API as applicable.
- [ ] Verify every asset's local file, slot, variant, and effective rendered geometry.
- [ ] Run `npm run build` after application implementation; compare the requested screen against a fresh Figma screenshot at matching scale and viewport.
- [ ] Record intentional responsive differences and unresolved integrations without changing unrelated screens.

## Integration details still required

The design and starter do not define faculty API endpoints, authorization rules, code format/uniqueness policy, permitted row actions, navigation destinations, search pagination, or whether summary totals come from a separate endpoint. Establish these during backend integration. They do not block a visual prototype with clearly identified fixtures and callbacks.
