# Programs & Majors — Figma implementation guide

## Implementation brief

Implement the **Programs & Majors** screen for the Smart AI Admin Portal, including the application sidebar, top navigation, searchable program table, filters, and **Add Program** drawer.

Source: [Smart Ai Admin Web — Program Screen](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=54-4923&m=dev). File key: `FQhq9uVri66RJpADxECMtm`. Target node: `54:4923`.

This guide is based on the inspected Figma screenshot, layer metadata, and detailed design context for the header, filters, sidebar, top navigation, drawer, and representative table cells. No application repository or framework was supplied. Use the destination project's existing stack, components, routing, tokens, and API conventions. Generated Figma React/Tailwind snippets are reference material, not a required stack.

**Evidence boundary:** Measurements, visible text, and styles below are design observations. Sections explicitly marked “proposed” describe implementation decisions where the static design does not establish behavior. Backend endpoints, dropdown option lists, row-menu actions, and mobile layouts were not verified.

## 1. Scope and reference geometry

The selected frame is named `Program Screen`. Its nominal size is **2058 × 1091 px**, but children extend outside it: the dashboard is approximately **2059 × 1983 px** and the drawer is placed at **x = 2059**, with size **480 × 1983 px**. The screenshot includes this overflowing content.

Do not interpret the nominal parent height as the complete page or hide the drawer because it sits outside the parent bounds. Treat the screenshot as a desktop composition with a long program list and a drawer shown to the right. Use content flow and scrolling in the implementation instead of reproducing a fixed 1983 px application height.

| Region | Figma node | Reference measurement |
| --- | --- | --- |
| Sidebar | `54:6125` | 252 px wide |
| Top navigation | `54:6340` | About 64 px high; begins after sidebar |
| Page title and action | `54:4931` | About 100 px high; 28 px horizontal padding |
| Search and filters | `54:4946` | About 70 px high; 12 px gaps |
| Table wrapper | `54:4983` | About 1751 px wide at the reference layout |
| Table | `54:4984` | 48 px header; about 66 px per data row |
| Add Program drawer | `54:6016` | 480 px wide; 24 px horizontal inner padding |

## 2. Visual system

Use these measured values as reference tokens, mapping them onto equivalent existing project tokens where possible.

| Token | Value | Use |
| --- | --- | --- |
| Surface | `#FFFFFF` | Sidebar, top bar, drawer, controls |
| Subtle surface | `#F7F8FC` | Top search and context control; sidebar user card |
| Table header | `#FAFBFC` | Header-cell fill |
| Main text | `#17213C` | Titles, program names, form labels |
| Secondary text | `#68728A` | Descriptions, department names, navigation |
| Border | `#E5E8F0` | Dividers, inputs, table rows |
| Primary dark | `#273238` | Selected navigation, avatars, selected radio |
| Primary gradient | `#273238` → `#1A2329`, approximately 165° | Add Program buttons |
| Accent | `#D80255` | Required asterisk, notification dot |
| Placeholder | `rgba(23, 33, 60, 0.5)` | Input placeholders |
| Active badge | Background `#D1FAE5`, foreground `#059669` | Status label and 6 px dot |
| Engineering degree badge | Background `#DBEAFE`, foreground `#2563EB` | Bachelor of Engineering |
| Standard control radius | 12 px | Inputs, dropdowns, primary buttons |
| Selected submenu radius | 8 px | Programs & Majors navigation |
| Badge radius | Fully rounded | Degree and status badges |
| Reference stroke | 1.25 px | Measured input and divider borders |

The page background appears pale gray-blue in the screenshot. Confirm its exact fill on the page container before final visual matching; `#F7F8FC` is a reasonable provisional reuse of the observed subtle-surface token.

### Typography

Load the actual fonts before judging layout or text wrapping.

| Element | Font | Size / line height | Weight |
| --- | --- | --- | --- |
| Page title | Plus Jakarta Sans | 22 / 33 px | 800 |
| Drawer title | Plus Jakarta Sans | 18 / 27 px | 800 |
| Primary navigation | Plus Jakarta Sans | 13 / 19.5 px | 500 |
| Subnavigation | Plus Jakarta Sans | 12.5 / 18.75 px | 500 |
| Top context label | Plus Jakarta Sans | 13 / 19.5 px | 600 |
| Body, table headers, program names | Inter | 13 / 19.5 px | 400 or 600 |
| Program faculty subline | Inter | 11.5 / 17.25 px | 400 |
| Degree badge | Inter | 11 / 16.5 px | 600 |
| Status badge | Inter | 11.5 / 17.25 px | 600 |
| Form labels | Inter | 12.5 / 18.75 px | 600 |
| Form values and footer buttons | Inter | 13.5 / approximately 20.25 px | 400 or 600 |

## 3. Application shell

### Sidebar

White background with a right divider. At the top, preserve the Rangsit University logo image at approximately **103 × 40 px**, beside the two-line text `SMART AI` and `ADMIN PORTAL`. Include the collapse control.

Display the following navigation in order:

1. Dashboard
2. User Management
3. Students
4. Academic Management, expanded
   - Faculties
   - Departments
   - **Programs & Majors**, selected
   - Courses
   - Course Sections
   - Enrollments
5. Timetable
6. Academic Activities
7. Campus Management
8. AI Management
9. Communication
10. Reports & Analytics
11. Settings

Main items are approximately 40 px high with 17 px icons. The selected submenu is dark with white text and a white dot. Keep the vertical guide and indented submenu hierarchy. Place the `Admin User` / `Super Administrator` card with an `A` avatar at the bottom of the sidebar.

### Top navigation

Use a white bar, subtle bottom divider/shadow, 24 px side padding, and 16 px gaps. Include:

- Global search: `Search students, courses, rooms…`, maximum width approximately 384 px.
- Context selector: `Academic Management` with book and chevron icons.
- Flexible spacer.
- Notification bell with a small pink unread indicator.
- Dark circular `AD` avatar and dropdown chevron.

Use existing application routes and shell handlers. Destinations, global search results, notification contents, and profile-menu contents are outside this screen's verified design.

## 4. Page header and filters

Title: **Programs & Majors**.

Description: `Manage academic programs and degree offerings across all departments.`

Place a plus-icon **Add Program** button at the far right. It is approximately 139 × 36 px with an 8 px icon/text gap. Header padding is 24 px top, 20 px bottom, and 28 px horizontally.

The filter row contains, in order:

| Control | Placeholder | Reference width |
| --- | --- | --- |
| Text search | `Search program name or code…` | 280 px |
| Faculty select | `Faculty` | 261 px |
| Department select | `Department` | 198 px |
| Degree select | `Degree Level` | 259 px |
| Status select | `Status` | 150 px |

Search height is approximately 42 px; select height is approximately 39 px. Use 16 px top padding, 12 px bottom padding, 28 px horizontal padding, and 12 px gaps.

**Proposed behavior:** Search names and codes case-insensitively. Combine active filters using AND. Faculty selection narrows department choices and clears an incompatible department selection. Include an unfiltered choice in each selector. Filter the displayed count with the results. Use existing server-side querying if provided; otherwise use a clearly identified local fixture adapter.

## 5. Programs table

Use a semantic table on a white rounded surface with a light outline and horizontal row dividers. Preserve the following column order and approximate width proportions:

| Column | Reference width | Content |
| --- | --- | --- |
| Code | 202 px | Compact neutral code badge |
| Program Name | 373 px | Semibold name, muted faculty below |
| Department | 274 px | Muted department name |
| Degree | 310 px | Colored pill with complete degree name |
| Duration | 131 px | Centered value, e.g. `4 yrs` |
| Total Credits | 171 px | Centered number and smaller `cr` suffix |
| Status | 165 px | Status pill with dot and text |
| Actions | 122 px | Vertical ellipsis button |

Header text is semibold and muted. Body cells use approximately 16 px horizontal and 14 px vertical padding. Action buttons are about 32 × 32 px with an 18 px ellipsis icon. Do not substitute a screenshot for the table.

The reference contains **25 programs**, with the footer `Showing 25 of 25 programs`. Public Relations is Inactive; the other reference rows are Active. The screenshot shows these program names in order:

1. Computer Engineering
2. Computer Engineering (Graduate)
3. Electrical Engineering
4. Mechanical Engineering
5. Software Engineering
6. Mobile Development
7. Data Science
8. Artificial Intelligence
9. Cybersecurity
10. Marketing
11. Digital Marketing
12. Finance
13. Financial Technology
14. International Business
15. Applied Mathematics
16. Statistics
17. Applied Physics
18. Biochemistry
19. Doctor of Medicine
20. Nursing Science
21. Pharmaceutical Science
22. English for Communication
23. Japanese Studies
24. Mass Communication
25. Public Relations

Verified example rows suitable for initial fixtures:

| Code | Name | Faculty | Department | Degree | Years | Credits | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PRG-CE-BS | Computer Engineering | Engineering | Computer Engineering | Bachelor of Engineering | 4 | 144 | Active |
| PRG-CE-MS | Computer Engineering (Graduate) | Engineering | Computer Engineering | Master of Engineering | 2 | 36 | Active |
| PRG-EE-BS | Electrical Engineering | Engineering | Electrical Engineering | Bachelor of Engineering | 4 | 138 | Active |
| PRG-ME-BS | Mechanical Engineering | Engineering | Mechanical Engineering | Bachelor of Engineering | 4 | 140 | Active |

Obtain the remaining exact fixture values from the table's child layers before a full reference-data screenshot comparison. Do not label a four-row fixture as 25 rows.

Degree badges visually distinguish Engineering (blue), Master of Engineering (cyan), Science (green), Business Administration (amber), Medicine (orange), Nursing (pink), Pharmacy (red), and Arts (purple). Only the Bachelor of Engineering exact colors are specified above from detailed context; fetch the corresponding badge nodes for the remaining exact color pairs.

**Proposed behavior:** Each ellipsis opens the project's program action menu for that row. The source does not show its contents; connect existing actions or obtain the missing menu design before adding edit/delete functionality. No sorting or pagination controls are visible in this state.

## 6. Add Program drawer

The reference explicitly shows the drawer open beside the dashboard. Preserve this state in a preview or component story; the normal page can begin closed as a proposed interaction choice.

Use a white 480 px panel. Its header has 20 px vertical and 24 px horizontal padding, a bottom border, title **Add Program**, subtitle `Create a new academic program or major.`, and a 32 px close button. Reference shadow: `0 25px 25px rgba(0,0,0,0.25)`.

The form body uses 24 px horizontal and 20 px vertical padding. Full-width fields are 432 px wide; paired fields are 208 px each with a 16 px gap. Use a 6 px label/control gap and approximately 16 px separation between field groups.

| Order | Field | Control | Required in design | Initial state |
| --- | --- | --- | --- | --- |
| 1, left | Program Code | Text input | Yes | `e.g. PRG-CE-BS` |
| 1, right | Degree Level | Select | Yes | `Select…` |
| 2 | Program Name | Text input | Yes | `e.g. Computer Engineering` |
| 3 | Faculty | Select | Yes | `Select a faculty…` |
| 4 | Department | Select | Yes | `Select a department…`; disabled appearance at 50% opacity |
| 5, left | Duration (years) | Select | No asterisk | `4 years` |
| 5, right | Total Credits | Numeric input | No asterisk | `e.g. 132` |
| 6 | Status | Radio group | No asterisk | Active selected; Inactive available |

Text inputs are approximately 43 px high and dropdowns 39 px. Status radios are 20 px circles; the selected control is dark with an 8 px white center. Required asterisks are pink.

Footer: top divider, 24 px horizontal and 16 px vertical padding, 12 px gap, dark **Add Program** button with check icon, then outlined **Cancel**. Keep the large flexible space between the form and footer at tall viewport sizes.

### Proposed form behavior

- Open via the page's Add Program button. Close via Cancel or the close icon without creating a record.
- Enable Department after Faculty is selected; restrict choices to that faculty. Clear an incompatible department when Faculty changes.
- Require the five asterisk-marked fields. Trim code/name. Enforce code uniqueness through the backend where available.
- Validate supplied credit values as nonnegative integers and duration against the configured options. Exact domain limits and dropdown options must come from the application's data model.
- During submission, disable duplicate submission and show a pending state. Preserve values and show actionable errors on failure.
- On success, update/reload the list and count, close the drawer, and show the project's standard success feedback. Preserve filters; do not silently clear them to reveal the new row.
- Use existing unsaved-change handling if the product has it.

## 7. Suggested component and data structure

Adapt these responsibilities to the project; filenames and framework are intentionally unspecified.

```text
AdminLayout
├── SidebarNavigation
├── TopNavigation
└── ProgramsPage
    ├── ProgramsHeader
    ├── ProgramFilters
    ├── ProgramsTable
    │   ├── ProgramCodeBadge
    │   ├── DegreeBadge
    │   ├── StatusBadge
    │   └── ProgramActions
    ├── ResultsCount
    └── ProgramDrawer
        └── ProgramForm
```

Proposed domain shape, expressed in TypeScript for clarity only:

```ts
type ProgramStatus = 'active' | 'inactive';

interface Program {
  id: string;
  code: string;
  name: string;
  facultyId: string;
  departmentId: string;
  degreeId: string;
  durationYears: number;
  totalCredits: number | null;
  status: ProgramStatus;
}

interface ProgramFilters {
  query: string;
  facultyId: string | null;
  departmentId: string | null;
  degreeId: string | null;
  status: ProgramStatus | null;
}
```

Keep lookup labels separate from stable IDs. Derive filtered results and counts rather than duplicating them in state. Keep form draft, validation errors, drawer visibility, and submission state separate. Use actual service contracts; no API route is established by Figma.

## 8. Assets and Figma retrieval

Reuse exact existing assets where available. Otherwise export the logo and source icon assets through Figma design context and store them locally using the tool's download instructions. Temporary Figma asset URLs are not durable production dependencies.

| Asset group | Source node |
| --- | --- |
| Rangsit University logo | `54:6128` |
| Sidebar navigation icons and brand | `54:6125` |
| Search, context, notification, profile chevrons | `54:6340` |
| Page plus icon | `54:4941` |
| Filter search and dropdown arrows | `54:4946` |
| Row ellipsis | `54:5048` |
| Drawer close icon | `54:6027` |
| Drawer submit check | `54:6118` |

Preserve source SVG dimensions and aspect ratios. Do not replace the university logo with text or an unrelated mark. Do not inline/redraw exported SVG paths or use the screen screenshot as an implementation asset. The Markdown deliverable does not include an asset bundle; retrieve fresh exports during implementation.

When retrieving the full screen, Figma may return sparse metadata because the table is large. Request detailed context for the child regions listed above and individual table cells/badges rather than implementing from sparse metadata alone. Follow any Code Connect mappings returned for those nodes.

## 9. Responsive and accessible behavior — proposed

The supplied design establishes a desktop composition only. Use these adaptations unless the project already defines alternatives:

- Desktop: use a 252 px sidebar and flexible main area. Preserve the adjacent 480 px drawer where the viewport permits it; avoid globally shrinking the screen to fit.
- Medium widths: wrap filters, let the table scroll horizontally inside its container, and use the application's compact sidebar pattern.
- Small widths: make the drawer at most the viewport width, collapse paired form fields when necessary, and place navigation behind an accessible menu trigger.
- Let the drawer body scroll while keeping its header/footer reachable. Avoid clipping controls with a fixed content height.
- Use semantic headings, navigation, table headers, labels, buttons, and a fieldset/legend for Status.
- Give icon-only buttons meaningful names such as `Close Add Program` and `Actions for Computer Engineering`.
- Mark the selected route with `aria-current="page"`; expose expanded navigation state.
- Associate validation errors with their inputs and move focus to the first invalid field after failed validation.
- If the narrow-screen drawer is modal, trap focus, support Escape, make background content inert, and restore focus to its trigger on close. Do not trap focus in a nonmodal docked panel.
- Show focus indicators and communicate status with text as well as color.

## 10. Implementation sequence

1. Inspect the destination repository for its stack, instructions, existing admin shell, reusable controls, fonts, tokens, asset directory, and API conventions.
2. Fetch any missing detailed Figma context, exact badge styles, and assets. Reuse mapped or equivalent existing components.
3. Build the shell and desktop spacing, then the header, filters, table, and count.
4. Add the drawer with the exact field order, paired layout, disabled Department state, and footer actions.
5. Connect filtering and form state to existing services or clearly identified fixtures. Implement loading, empty, error, and submission states using project conventions.
6. Add responsive scrolling and keyboard/focus behavior.
7. Render both drawer-closed and reference drawer-open states. Compare against Figma at matching dimensions, accounting for the source's overflowing children.
8. Run relevant project checks and behavior tests. Record any remaining integration decisions instead of claiming the static design specifies them.

## 11. Acceptance checklist

- [ ] Programs & Majors is selected under expanded Academic Management.
- [ ] Logo, top bar, heading, subtitle, filters, eight table columns, count, and drawer match the source composition.
- [ ] Fonts load correctly; spacing, colors, row density, badges, and dividers match inspected values.
- [ ] Both drawer states are reachable, and the reference open state is reproducible.
- [ ] Search and combined filters produce correct results and an accurate count.
- [ ] Department selection follows Faculty in the creation form.
- [ ] Required-field errors, submitting state, failed submission, and successful creation behave correctly.
- [ ] Cancel/close do not create records; repeated submit does not create duplicates.
- [ ] Empty, loading, and failed-load states are usable.
- [ ] Keyboard interaction, focus visibility, accessible labels, and drawer focus behavior work.
- [ ] Narrow layouts preserve readable content and reachable form/footer controls.
- [ ] Every static asset exists locally, is nonempty, and renders in its correct position and proportions.
- [ ] No temporary Figma asset URLs or full-screen screenshots are used as production UI.
- [ ] Row-menu actions and other unprovided product behavior are wired to existing requirements or explicitly recorded as unresolved.

## Ready-to-use coding prompt

> Implement the Programs & Majors screen from the linked Figma node using this guide. First inspect the repository and reuse its stack, admin shell, design tokens, components, assets, and service conventions. Re-fetch detailed Figma context and a screenshot for visual comparison, including the Add Program drawer and any missing badge/table details. Preserve measured typography, spacing, table density, field order, and navigation state. Build working filters and creation form behavior, with accessible controls and responsive scrolling. Treat proposed behaviors in this guide as implementation defaults, not verified Figma interactions. Do not invent backend endpoints or unshown destructive row actions. Verify the drawer-open and drawer-closed states, run relevant project checks, and report implementation results and remaining integration limitations.
