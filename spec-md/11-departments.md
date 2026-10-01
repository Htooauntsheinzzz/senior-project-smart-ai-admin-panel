# Smart AI Admin Portal — Departments and Add Department Drawer

## Source and scope

- [Figma design, node 42:2512](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=42-2512&m=dev)
- Frame: **Departments Screen One**.
- Inspected on 2026-09-29 using the full-screen screenshot and detailed design context for the heading, filters, table, record count, drawer, sidebar, and top navigation. The initial root response was sparse, so individual sections were retrieved before preparing this guide.
- Deliverable: Markdown implementation guidance; application code and downloaded assets are not part of this document.
- Related specifications: [Faculties](FIGMA_FACULTIES_IMPLEMENTATION.md) and [Add Admin User](FIGMA_IMPLEMENTATION.md).

Visual specifications, displayed records, copy, and initial selections below come from Figma. Interaction behavior, responsive breakpoints, component organization, and service contracts are proposals where the design does not define them.

**User-requested update — 2026-09-30:** In Departments → Add Department, the required Faculty field must be a searchable dropdown. This requirement supersedes the plain select in the original design. It applies to the drawer's Faculty field; the directory toolbar filters retain their documented behavior.

**Latest interaction correction — 2026-09-30:** Use one editable Faculty field with placeholder `Search or select a faculty…`. Type directly in that field to filter options beneath it; selecting an option displays its name in the same field. Do not add a second search box in the popover.

## Existing project and implementation approach

The project uses React 19, Vite 7, JavaScript, and Tailwind CSS 4. Tailwind is already configured through the Vite plugin. `src/main.jsx` mounts the starter in `src/App.jsx`, and `src/index.css` provides the base stylesheet. The inspected source has no existing application component library or service layer.

Use the existing stack and reuse shared shell, field, badge, and drawer components if earlier screens have been implemented by that time. Keep design tokens in the shared stylesheet. Do not install a different styling framework. No Code Connect mappings were supplied in the retrieved context.

Translate the reference into flexbox, semantic HTML tables, and reusable components. Generated absolute positioning and fixed canvas heights describe Figma geometry; they should not cause clipped browser content.

## Layout and measurements

The root frame and dashboard measure **1459 × 1423px**. The sidebar is **252px** wide. An open **460 × 1423px** drawer starts at **x = 1459px**, extending beyond the root's nominal width. The logical dashboard-plus-drawer composition is therefore approximately **1919px** wide; the screenshot includes additional surrounding bounds/shadow.

At the reference size, the drawer sits beside the dashboard and leaves the entire table visible. There is no visible dimming backdrop. Reproduce this adjacent layout for wide-screen visual review; use responsive layout rules rather than literal canvas coordinates.

| Element | Reference specification |
| --- | --- |
| Sidebar | 252px wide, white, right border, full reference height |
| Top navigation | Approximately 64px tall; starts to the right of the sidebar |
| Main content | Approximately 1207px wide; pale canvas background |
| Heading strip | 28px horizontal padding, 24px top, 20px bottom; bottom border |
| Filter toolbar | 28px horizontal padding, 16px top, 12px bottom; 12px gaps |
| Department search | 280px wide, approximately 40.74px tall |
| Faculty filter | Approximately 260.86px wide and 38.13px tall |
| Status filter | 150px wide and approximately 38.13px tall |
| Table card | Approximately 1150.76px wide and 1139.63px tall; 16px radius |
| Table header | Approximately 47.79px high |
| Data rows | Approximately 60.61px high; final row approximately 60.29px |
| Table cell padding | 16px horizontal, 14px vertical |
| Record count | 12px top padding, aligned with table's left edge |
| Drawer | 460px wide, white; shadow `0 25px 25px rgba(0,0,0,0.25)` |
| Drawer header/body padding | 24px horizontal, 20px vertical |
| Drawer footer | Top border; 24px horizontal, 16px vertical padding; 12px action gap |

Most borders are reported as 0.625px in Figma. Preserve that as the initial reference value and evaluate browser rasterization during visual comparison. Let the page scroll through all 18 rows. The drawer body should scroll when necessary while keeping the footer reachable; do not hard-code a 1423px application height.

## Colors and typography

| Token | Value | Use |
| --- | --- | --- |
| Canvas | `#F7F8FC` | Main background |
| Surface | `#FFFFFF` | Sidebar, header, table, drawer, controls |
| Table heading fill | `#FAFBFC` | Column heading row |
| Primary | `#273238` | Selected navigation, code text, selected radio |
| Primary gradient end | `#1A2329` | Dark Add Department buttons |
| Text | `#17213C` | Titles, department names, counts, form labels |
| Muted | `#68728A` | Faculty names, headings, descriptions, filters |
| Border | `#E5E8F0` | Dividers, controls, table rows |
| Required accent | `#D80255` | Required asterisks and notification dot |
| Code chip fill | `rgba(39,50,56,0.07)` | Department code badges |
| Active fill / text | `#D1FAE5` / `#059669` | Active status pills and dots |
| Placeholder | `rgba(23,33,60,0.5)` | Text input hints |

Load **Plus Jakarta Sans** for titles, branding, and navigation and **Inter** for table content, inputs, labels, descriptions, and actions. Merely declaring font-family names is insufficient; supply actual font files or an approved font loading source.

| Text role | Size / line height | Weight |
| --- | --- | --- |
| Page title | 22px / 33px, Plus Jakarta Sans | 800 |
| Drawer title | 18px / 27px, Plus Jakarta Sans | 800 |
| Navigation / nested navigation | 13px / 19.5px; 12.5px / 18.75px, Plus Jakarta Sans | 500 |
| Descriptions and faculty names | 13px / 19.5px, Inter | 400 |
| Table headings, department names, numeric counts | 13px / 19.5px, Inter | 600 |
| Code chips | 11.5px / 17.25px, Inter | 700 |
| Status badge text | 11.5px / 17.25px, Inter | 600 |
| Drawer labels | 12.5px / 18.75px, Inter | 600 |
| Drawer inputs | 13.5px, Inter | 400 |
| Drawer action and radio labels | 13.5px / 20.25px, Inter | 600 |

Primary actions use the supplied dark gradient. Inputs and buttons have 12px corners, code chips have 8px corners, and status pills are fully rounded. Only Active table badges are shown in this node; an Inactive row style would be an extension, ideally reusing the existing Faculties badge convention.

## Shell and navigation

Sidebar node: `42:3233`. Top navigation node: `42:3460`.

The sidebar brand combines the Rangsit University logo with `SMART AI` and `ADMIN PORTAL`, plus a collapse button. Under `NAVIGATION`, preserve this order:

1. Dashboard
2. User Management
3. Students
4. Academic Management — expanded: Faculties, Departments, Programs & Majors, Courses, Course Sections, Enrollments
5. Timetable
6. Academic Activities — collapsed
7. Campus Management — collapsed
8. AI Management — collapsed
9. Communication — collapsed
10. Reports & Analytics
11. Settings — expanded: University Settings and Audit Logs

**Departments** is selected with a dark background, white text and marker, and 8px radius. Academic Management uses its active parent icon and dark text. Faculties is unselected. Retain the nested vertical guide and circular markers.

Anchor the account panel at the sidebar bottom with `A`, `Admin User`, and `Super Administrator`. Let navigation scroll independently when screen height is limited.

The top navigation contains global search with `Search students, courses, rooms…`, an **Academic Management** context control with icon/chevron, a notification bell and pink dot, and a circular `AD` avatar with chevron. Keep global search separate from department filtering.

## Heading and filters

Heading node: `42:2520`. Filter toolbar node: `42:2535`.

- Title: **Departments**
- Subtitle: `Manage departments within each faculty.`
- Right-aligned primary action: **Add Department**, with plus icon, 16px horizontal and 8px vertical padding, 8px icon gap, and 12px radius.
- Local search placeholder: `Search department name or code…`
- Faculty dropdown initial display: `Faculty`
- Status dropdown initial display: `Status`

The closed dropdown displays are confirmed; their option lists are not visible. Proposed options are an unfiltered state plus available faculty records, and an unfiltered state plus Active/Inactive for status. Obtain authoritative faculty IDs and eligibility from the backend rather than treating table labels as IDs.

## Table and exact fixture data

Table node: `42:2559`. Use a semantic table with these eight columns:

| Column | Reference width | Presentation |
| --- | --- | --- |
| Code | 138.03px | Left-aligned muted chip |
| Department | 229.62px | Left-aligned semibold name |
| Faculty | 224.66px | Left-aligned muted name |
| Programs | 116.08px | Centered count |
| Courses | 105.97px | Centered count |
| Students | 110.72px | Centered count |
| Status | 124.38px | Pill with colored dot |
| Actions | 100.05px | Vertical-ellipsis button |

Reference rows, in order:

| Code | Department | Faculty | Programs | Courses | Students | Status |
| --- | --- | --- | --- | --- | --- | --- |
| DEPT-CE | Computer Engineering | Engineering | 2 | 22 | 110 | Active |
| DEPT-EE | Electrical Engineering | Engineering | 1 | 18 | 108 | Active |
| DEPT-ME | Mechanical Engineering | Engineering | 1 | 20 | 102 | Active |
| DEPT-SE | Software Engineering | Information Technology | 2 | 19 | 98 | Active |
| DEPT-DS | Data Science | Information Technology | 2 | 15 | 97 | Active |
| DEPT-CYB | Cybersecurity | Information Technology | 1 | 14 | 90 | Active |
| DEPT-MKT | Marketing | Business Administration | 2 | 17 | 145 | Active |
| DEPT-FIN | Finance | Business Administration | 2 | 16 | 138 | Active |
| DEPT-IB | International Business | Business Administration | 1 | 14 | 129 | Active |
| DEPT-MTH | Mathematics | Science | 2 | 12 | 60 | Active |
| DEPT-PHY | Physics | Science | 1 | 10 | 58 | Active |
| DEPT-BCH | Biochemistry | Science | 1 | 11 | 60 | Active |
| DEPT-GM | General Medicine | Medicine | 1 | 32 | 72 | Active |
| DEPT-NRS | Nursing | Medicine | 1 | 24 | 68 | Active |
| DEPT-PHA | Pharmacy | Medicine | 1 | 26 | 63 | Active |
| DEPT-ENG | English | Liberal Arts | 1 | 9 | 54 | Active |
| DEPT-JPN | Japanese | Liberal Arts | 1 | 8 | 52 | Active |
| DEPT-CA | Communication Arts | Liberal Arts | 2 | 11 | 50 | Active |

Each code chip has approximately 8px horizontal padding and 21.74px height. Status pills use a 6px dot, 6px gap, 10px horizontal / 4px vertical padding, and approximately 25.24px height. Row action buttons are approximately 32px square with an 18px ellipsis icon.

Under the table, show **Showing 18 of 18 departments**, emphasizing the numbers as in the reference. Derive the numbers from the dataset. No summary cards, pagination buttons, checkboxes, or sorting indicators are shown on this screen.

The earlier Faculties design reports 20 departments across seven faculties, while this screen shows 18 rows across six faculties. Preserve each screen's supplied reference data for visual fixtures; do not invent two extra rows here. Reconcile the difference against real service data during integration.

## Add Department drawer

Drawer node: `42:3167`. The reference state is **open**, with blank text fields, no faculty selected, and Active selected.

Header:

- **Add Department**
- `Create a new department within a faculty.`
- Close button at the top right, approximately 32px square with a 16px X icon.

| Field | Proposed state key | Control and initial content | Required |
| --- | --- | --- | --- |
| Department Code | `code` | Text; `e.g. DEPT-CE` | Yes |
| Department Name | `name` | Text; `e.g. Computer Engineering` | Yes |
| Faculty | `facultyId` | Single-field searchable combobox; `Search or select a faculty…` | Yes |
| Status | `status` | Radio group: Active / Inactive; Active selected | No required marker |

Use visible labels and pink asterisks for the first three fields. Text inputs are 41px tall; the faculty select is approximately 39px tall. Fields span 412px within the 460px drawer at reference size. Use 6px label-to-control gaps and 16px spacing between groups.

### Required searchable Faculty dropdown

- Preserve the closed field's label, required asterisk, placeholder, border, rounded corners, and arrow. After selection, display the selected faculty name.
- Keep focus in the editable Faculty field and open a field-width popover containing only the scrollable options and loading/error/empty feedback. Do not render a second search input.
- Filter options as the user types, using a trimmed, case-insensitive match on faculty name or code. Match Thai names as well when supplied by the faculty data source. An empty query shows all eligible options.
- Display each option's faculty name and, when available, its code as secondary text. Use stable faculty IDs for option keys and the submitted `facultyId` value.
- Choosing an option updates the form, displays the selected faculty name in the same input, closes the popover, and keeps focus in that field. Search text alone is never a valid selection and must not create a new faculty.
- Show `No faculties found` when the query has no matches. Preserve the search input so the user can revise the query. Provide loading and retryable error states when fetching options.
- Reopening resets the search query and identifies the current selection. Escape or clicking outside closes the popover without changing the selection or clearing other department fields.
- Support Arrow Up/Down to navigate results, Enter to select, and Escape to dismiss. Escape closes this dropdown before closing the parent drawer. Keep keyboard focus visible and scroll the highlighted option into view.
- Use an accessible searchable combobox/listbox pattern with an associated Faculty label, expanded state, controlled list ID, selected-option state, and active descendant where applicable. Keep popover focus within the drawer's focus scope when the drawer is modal.
- Position the popover so it remains inside the viewport and is not clipped by the drawer's scroll region. Use a bounded list height with internal scrolling; open above the field when there is insufficient space below.
- Validate that a faculty option has been selected before submitting. Suggested error: `Please select a faculty.` Retain the selected faculty after unrelated validation or submission failures.

Search, loading, empty, and error states extend the original Figma reference in response to the user's request. Reuse the existing form tokens and spacing so the control matches the drawer.

The status group uses 20px radio circles, a dark selected fill with white 8px center, 10px label gap, and 16px between options. Implement with native radios sharing a name and an accessible Status legend.

The footer appears at the bottom, separated by a top border. Actions are left-aligned in this order: **Add Department** with a check icon, then **Cancel**. Use 20px horizontal / 10px vertical button padding, 12px corners, and 12px between buttons. Preserve the flexible empty space beneath the form rather than adding unrequested fields.

## Proposed interactions and integration rules

1. Open the drawer from the page Add Department button. X and Cancel close it and restore focus to the opener. A dirty-form discard confirmation is a proposed behavior, not a supplied design state.
2. Filter departments by a trimmed, case-insensitive code/name query. Combine search, faculty, and status predicates with AND. Use faculty IDs for matching when available.
3. Update the visible count with results. For a local prototype, use `Showing {matchingCount} of {totalCount} departments`; agree server-pagination semantics before integrating a remote list.
4. Provide a clear empty state when no records match. With the supplied all-Active fixtures, selecting Inactive should produce zero matches; do not alter the original fixture data merely to populate that result.
5. Require code, department name, and faculty selection. Do not infer a mandatory `DEPT-` prefix, character restrictions, or length limits from the example placeholders.
6. Check duplicate department codes according to backend policy. The frame does not establish whether uniqueness is university-wide or scoped to faculty.
7. Submit only the accepted creation fields. Keep inputs on server failure, show field/general errors, block duplicate submissions while pending, and announce outcomes accessibly.
8. On confirmed success, merge or refetch the created record, update the count, close/reset the drawer, and preserve the list's active filters. If the new record is excluded by those filters, clearly communicate creation success without forcibly inserting it into the filtered results.
9. Programs, courses, and student counts come from service data. Use explicitly documented zero defaults only for a mock prototype; they are not creation fields shown in this design.
10. Ellipsis menu contents are not shown. Do not assume edit, delete, or deactivation permissions. Define permitted actions before wiring the menu.
11. Global search, notifications, context switching, account controls, and navigation require host-application integrations. Explicitly identify unavailable prototype functions rather than implying a completed backend action.

Suggested frontend record model, not an established API contract:

```js
{
  id: 'stable-department-id',
  code: 'DEPT-CE',
  name: 'Computer Engineering',
  facultyId: 'stable-faculty-id',
  facultyName: 'Engineering',
  programCount: 2,
  courseCount: 22,
  studentCount: 110,
  status: 'active'
}
```

## Proposed file structure

```text
src/
  App.jsx
  index.css
  components/
    AdminLayout.jsx
    Sidebar.jsx
    TopNav.jsx
    FormField.jsx
    StatusBadge.jsx
    Drawer.jsx
    SearchableFacultySelect.jsx # Search, option list, selection, keyboard support
  features/departments/
    DepartmentsPage.jsx          # Data, search/filter state, drawer state
    DepartmentFilters.jsx
    DepartmentTable.jsx
    AddDepartmentDrawer.jsx      # Form state, validation, creation callback
    departmentFixtures.js        # The 18 reference rows, clearly mock data
  services/
    departments.js               # Implement after API contract is supplied
public/
  assets/figma/
  fonts/
```

These are proposed files, not existing components. Reuse matching shared components introduced by the other screens. Keep routing and API endpoints configurable until actual contracts are available.

## Asset handoff

Retrieve fresh Figma context and download the original assets through the tooling's prescribed method during implementation. Temporary asset URLs expire and must not remain in application source. Do not use the screenshot as a UI background, redraw icons, or substitute unrelated library icons. Preserve intrinsic SVG root dimensions and verify wrapper geometry.

| Asset identifier | Required slot |
| --- | --- |
| `54314.png` | Rangsit University logo, approximately 102.63 × 40px wrapper |
| `f9a63.svg` | Page Add Department plus icon, approximately 16px |
| `13b46.svg` | Department search icon, approximately 16px |
| `26d44.svg` | Faculty/status filter dropdown arrows, 10 × 6px |
| `476b4.svg` | All row ellipsis icons, approximately 18px |
| `50c31.svg` | Drawer close icon, approximately 16px |
| `a81aa.svg` | Drawer faculty-select arrow, 10 × 6px; distinct from filter arrows |
| `1d18a.svg` | Drawer submit check icon, approximately 14px |
| `e517e.svg` | Sidebar collapse control |
| `3bfe2.svg`, `5bc4a.svg`, `9c037.svg` | Dashboard, User Management, Students |
| `5d711.svg`, `fbeb8.svg` | Active Academic Management parent icon and chevron |
| `3b8e1.svg`, `646a9.svg`, `b0dd0.svg` | Timetable, Academic Activities, other group chevrons |
| `14af3.svg`, `1d45f.svg`, `af5e6.svg` | Campus Management, AI Management, Communication |
| `5d063.svg`, `4f373.svg` | Reports & Analytics, Settings |
| `bef91.svg`, `42c27.svg` | Global search and Academic Management context icon |
| `bd3f9.svg`, `258e2.svg` | Header chevrons and notification bell |

Save assets under descriptive local filenames and retain the slot mapping. No assets are downloaded as part of this Markdown deliverable.

## Responsive and accessibility extensions

- Wide desktop: keep the adjacent 460px drawer and the visible full directory as the comparison target.
- Below a proposed 1280px viewport, use an overlay drawer capped at 460px; below 640px, let it fill the width. These breakpoints are implementation proposals.
- Below a proposed 1024px viewport, move the sidebar into an accessible menu. Wrap the three filter controls and let them use full width on narrow screens.
- Keep all eight table columns available through a labeled horizontal scroll region rather than hiding fields. Allow vertical scrolling through all rows.
- Use native table headers, associated form labels, required semantics, radio grouping, visible focus, and department-specific accessible labels for action buttons.
- Move focus into the drawer on opening and restore it on closing. For a modal overlay, trap focus and mark the background inert; for the adjacent nonmodal panel, avoid claiming the background is modal/inaccessible.
- Associate inline errors with their controls and focus the first invalid field. Announce count changes and save outcomes without excessively interrupting typing.
- Ensure X, icon buttons, filters, and drawer footer remain reachable at keyboard zoom and short viewport heights.

## Implementation sequence and acceptance checklist

1. Load fonts, retrieve assets, and establish shared tokens and shell components.
2. Build the heading and filter toolbar, then the semantic table using the exact fixture rows.
3. Add the record count and drawer with required controls and defaults.
4. Implement composed filtering, validation, drawer interactions, and the agreed service or mock adapter.
5. Add responsive behavior, accessible feedback, and loading/error/empty states.
6. Run the build and compare the requested screen against a fresh Figma screenshot at matching viewport and scale.

- [ ] Departments is selected under expanded Academic Management.
- [ ] Page title, subtitle, filter placeholders, and drawer copy match exactly.
- [ ] All 18 rows retain the correct order, names, faculties, counts, and Active badges.
- [ ] Table proportions, 16px cell padding, row heights, code chips, and icon variants match.
- [ ] Initial footer reads `Showing 18 of 18 departments`.
- [ ] The open drawer contains the two text inputs, required searchable Faculty dropdown, and status radios, with Active selected.
- [ ] Faculty search filters by name/code, supports empty and no-match queries, and shows the selected faculty after choosing an option.
- [ ] Keyboard selection, Escape dismissal, focus return, loading/error states, and popover scrolling work within the drawer.
- [ ] Submission requires a selected faculty ID; typing a search query alone does not satisfy validation.
- [ ] Drawer footer order is Add Department followed by Cancel.
- [ ] Search and both filters work independently and together; zero-match results and reset behavior work.
- [ ] Required fields, duplicate-code feedback, pending submission, server failure, and successful creation are verified.
- [ ] Keyboard navigation, labels, error focus, drawer focus behavior, and narrow/short viewport scrolling work.
- [ ] All static assets exist locally, are nonempty, and match their Figma slot and rendered dimensions.
- [ ] `npm run build` passes after application implementation.
- [ ] Document intentional responsive adaptations and unresolved integrations; review only this requested screen.

## Integration decisions still needed

Establish department/faculty service contracts, eligible faculty options, code uniqueness scope, field constraints, authorization and row actions, actual routes, list pagination/filter semantics, and count sources. Reconcile the 18-row reference with the separate Faculties screen's 20-department summary when connecting real data. These decisions do not block a clearly labeled visual prototype.
