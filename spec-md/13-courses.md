# Smart AI Admin Portal — Courses

## Source and scope

- [Figma: Courses Screen, node 63:6384](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=63-6384&m=dev)
- Inspected on 2026-10-01 using the screen screenshot, layer metadata, and detailed design context for the sidebar, top navigation, heading, summary cards, filters, representative table cells, and record count.
- Deliverable: Markdown implementation specification. This file does not implement the application or include downloaded assets.
- Related guides: [Departments](FIGMA_DEPARTMENTS_IMPLEMENTATION.md), [Faculties](FIGMA_FACULTIES_IMPLEMENTATION.md), and [Admin User](FIGMA_IMPLEMENTATION.md).

Measurements, colors, visible copy, and records below are sourced from Figma. Suggested interactions, component organization, data contracts, and responsive behavior are implementation proposals where the supplied frame does not define them.

## Project integration

The existing project uses React 19, JavaScript, Vite 7, and Tailwind CSS 4. Its source files are `src/App.jsx`, `src/main.jsx`, and `src/index.css`. The inspected application is a starter without an implemented admin shell, component library, or service layer. No Code Connect mappings were supplied in the retrieved context.

Implement within this stack. Reuse shared shell, buttons, badges, and filter components if they exist when implementation begins. Define shared design tokens in the stylesheet. Translate Figma's generated positioning into flexbox, grid, and a semantic HTML table; do not hard-code the screen height or position each table cell absolutely.

## Screen layout

The root frame is **2058 × 1904px**; its Dashboard child and screenshot extend to **2059px** wide. The sidebar occupies approximately **252px**, leaving **1807px** for the main area.

| Region | Reference geometry |
| --- | --- |
| Sidebar | 251.99px wide, full screen height |
| Top navigation | 63.98px high, white |
| Page heading | 100.25px high; 28px horizontal, 24px top, 20px bottom padding |
| Summary section | 93.69px high; 28px horizontal, 16px top, 4px bottom padding |
| Summary cards | Three equal cards, approximately 572.93 × 73.71px, with 16px gaps |
| Filter toolbar | 70.01px high; 28px horizontal, 16px top, 12px bottom padding; 12px gaps |
| Table card | Approximately 1750.78 × 1528.89px; aligned 28px from main area's left edge |
| Table header | Approximately 48.11px high |
| Table rows | Approximately 73.95px high; final row approximately 73.32px |
| Table cell padding | 16px horizontal and 14px vertical |
| Result count | 12px above its text, aligned with the table's left edge |

At the reference size, the table starts around viewport x = 279.99px and y = 327.94px. The screen shows all 20 rows and a result count below them. Allow normal vertical scrolling on shorter browser windows.

## Design tokens

| Role | Value |
| --- | --- |
| Main canvas | `#F7F8FC` |
| Surface | `#FFFFFF` |
| Table header fill | `#FAFBFC` |
| Main text | `#17213C` |
| Muted text | `#68728A` |
| Primary / selected navigation | `#273238` |
| Primary gradient end | `#1A2329` |
| Borders and row separators | `#E5E8F0` |
| Navigation caption | `#B0B8CC` |
| Placeholder | `rgba(23,33,60,0.5)` |
| Neutral chip / summary icon fill | `rgba(39,50,56,0.07)` |
| Active fill / text and dot | `#D1FAE5` / `#059669` |
| Required fill / text | `#DBEAFE` / `#2563EB` |
| Semester fill / text | `#EDE9FE` / `#7C3AED` |
| Notification dot | `#D80255` |

Detailed context reports **1.25px** borders for this screen. Use the values from this node rather than copying fractional borders from another screen's specification. Inputs and header buttons have 12px corners; summary cards and the visible table card have approximately 16px corners; code chips and the selected nested navigation item have 8px corners. Status, type, and semester badges are pill-shaped.

The Add Course button uses a dark gradient, approximately `linear-gradient(164.63deg, #273238 0%, #1A2329 100%)`. The top navigation has a subtle shadow: `0 1px 2px rgba(24,42,90,0.05)`.

## Typography

Load actual **Plus Jakarta Sans** and **Inter** font resources. A CSS font-family declaration alone will not reproduce the reference.

| Role | Font | Size / line height | Weight |
| --- | --- | --- | --- |
| Page title | Plus Jakarta Sans | 22px / 33px | 800 |
| Summary values | Plus Jakarta Sans | 24px / 24px | 800 |
| Main navigation | Plus Jakarta Sans | 13px / 19.5px | 500 |
| Nested navigation | Plus Jakarta Sans | 12.5px / 18.75px | 500 |
| Context switcher | Plus Jakarta Sans | 13px / 19.5px | 600 |
| Description | Inter | 13px / 19.5px | 400 |
| Header actions | Inter | 13px / 19.5px | 600 |
| Table headings / course names | Inter | 13px / 19.5px | 600 |
| Department names | Inter | 13px / 19.5px | 500 |
| Credit / section numbers | Inter | 13px / 19.5px | 700 |
| Course code | Inter | 12px / 18px | 700 |
| Required / semester / status badges | Inter | 11.5px / 17.25px | 600 |
| Faculty / year / summary labels | Inter | 11.5px / 17.25px | 400 |
| Numeric unit labels | Inter | 11px / 16.5px | 400 |
| Result count | Inter | 12.5px / 18.75px | 400; numbers 700 |

## Sidebar and top navigation

Sidebar node: `63:6388`. Top navigation node: `63:6604`.

The sidebar starts with the Rangsit University logo in a **102.62 × 40px** slot, SMART AI / ADMIN PORTAL branding, and a collapse button. Under the uppercase NAVIGATION caption, preserve this order:

1. Dashboard
2. User Management
3. Students
4. Academic Management — expanded, with Faculties, Departments, Programs & Majors, **Courses**, Course Sections, and Enrollments
5. Timetable
6. Academic Activities
7. Campus Management
8. AI Management
9. Communication
10. Reports & Analytics
11. Settings

Courses is the selected nested item: dark background, white text, and a white dot. Other nested items have muted text and pale dots. The account card at the bottom displays an A avatar, Admin User, and Super Administrator.

The top navigation contains a search field with the placeholder **Search students, courses, rooms…**, an Academic Management context button, a flexible spacer, notification bell with a pink dot, and an AD avatar with a chevron. Use 24px horizontal padding and 16px gaps. The global search is approximately 384px wide and 38px high at the reference size.

## Page heading and actions

Heading node: `63:6641`.

- Title: **Courses**.
- Description: **Manage course catalog, credit hours, and assignments across all departments.**
- Right-hand actions, in order: **Import Courses**, **Export**, **Add Course**.

Actions are vertically centered within their group with 10px gaps. Import Courses and Export are white outlined buttons, approximately 150.48 × 38.5px and 96.50 × 38.5px. Add Course is approximately 131 × 36px with white text and the dark gradient. Preserve the upload, download, and plus icons respectively.

The selected frame contains no open add form, import dialog, export menu, or row action menu. Their fields and menu contents are not specified by this frame.

## Summary cards

Summary node: `63:6671`.

| Card | Value | Icon | Icon fill | Value color |
| --- | --- | --- | --- | --- |
| Total Courses | 20 | 📚 | Neutral translucent gray | `#273238` |
| Active Courses | 20 | ✅ | `#D1FAE5` | `#059669` |
| Current Semester Courses | 20 | 📅 | `#EDE9FE` | `#7C3AED` |

Each card has a white background, border, 16px radius, 16px horizontal padding, and 14px vertical padding. Its 40 × 40px icon container has a 12px radius, followed by a 14px gap and a stacked number/label. These three symbols are emoji text in the supplied context; preserve them as such unless an approved asset replaces them.

## Search and filters

Toolbar node: `63:6708`.

| Control | Initial display | Reference width | Height |
| --- | --- | --- | --- |
| Course search | Course code or course name… | 614.55px, flexible with 240px minimum | 42.01px |
| Faculty filter | Faculty | 261.48px | 38.75px |
| Department filter | Department | 197.73px | 38.75px |
| Program filter | Program | 215.23px | 38.75px |
| Year filter | Year | 130px | 38.75px |
| Semester filter | Semester | 130px | 38.75px |
| Status filter | Status | 130px | 38.75px |

All controls are white with 12px corners and pale borders. Search has a leading 16px icon. Each dropdown has a 10 × 6px chevron. Initial labels represent unselected filters; do not treat Faculty or Department as selected records.

**Proposed behavior:** Search course code and name with case-insensitive, trimmed matching. Combine filters with AND logic. Faculty selection narrows department choices; reset an incompatible department selection when its faculty changes. Program choices require actual course-to-program relationships, which are not present in the visible table. Year denotes curriculum year, while semester contains the academic term and academic year. Keep the displayed `2568` value from the reference; do not silently replace it with the current calendar year.

Use real labels, native selects or accessible comboboxes, keyboard operation, and visible focus styling. The searchable-combobox requirement in the Departments guide applies to that drawer's Faculty field and is not evidence that these six toolbar dropdowns must use the same interaction.

## Course table

Table wrapper node: `63:6759`. Table node: `63:6760`.

| Column | Reference width | Contents |
| --- | --- | --- |
| Course Code | 203.32px | Neutral code chip |
| Course Name | 406.70px | Semibold name, Required badge beneath |
| Credits | 137.83px | Centered bold number, credits beneath |
| Department | 323.55px | Department name, muted faculty beneath |
| Semester | 202.68px | Purple semester chip, muted Year N beneath |
| Sections | 154.65px | Centered bold number, sections beneath |
| Status | 177.09px | Green Active pill with a 6px dot |
| Actions | 142.46px | Vertical ellipsis button |

Use an actual table with column headers and stable record keys. Preserve the two-level cell hierarchy and left-aligned header labels. Credit and section values are centered in their cells. The ellipsis button is approximately 32 × 32px, with an approximately 18px icon and 8px radius.

Required and Active badges are approximately 25.21px high with 10px horizontal padding. The semester chip is more compact, approximately 17.73px high. The CS101 code chip is approximately 55.18 × 21.72px; allow other codes to size to their text instead of forcing that width on every chip.

The initial design has no checkboxes, sorting indicators, pagination controls, or open row menus. The footer reads **Showing 20 of 20 courses**, with both numbers bold. Use a dynamic result count after filtering.

## Reference records

All 20 records are **Required**, **Active**, and assigned to **Sem 1/2568**. Preserve this order for the initial visual comparison.

| Code | Course name | Credits | Department | Faculty | Year | Sections |
| --- | --- | --- | --- | --- | --- | --- |
| CS101 | Introduction to Programming | 3 | Software Engineering | Information Technology | 1 | 4 |
| CS201 | Data Structures | 3 | Software Engineering | Information Technology | 2 | 3 |
| CS301 | Data Structures & Algorithms | 3 | Computer Engineering | Information Technology | 2 | 3 |
| CS315 | Database Systems | 3 | Software Engineering | Information Technology | 2 | 3 |
| CS322 | Software Engineering | 3 | Software Engineering | Information Technology | 3 | 2 |
| CS340 | Computer Networks | 3 | Computer Engineering | Information Technology | 3 | 2 |
| CS401 | Artificial Intelligence | 3 | Data Science | Information Technology | 3 | 2 |
| CS410 | Machine Learning | 3 | Data Science | Information Technology | 3 | 2 |
| CS450 | Cybersecurity Fundamentals | 3 | Cybersecurity | Information Technology | 2 | 2 |
| MTH101 | Calculus I | 3 | Mathematics | Science | 1 | 5 |
| MTH201 | Linear Algebra | 3 | Mathematics | Science | 2 | 3 |
| MTH202 | Probability & Statistics | 3 | Mathematics | Science | 2 | 3 |
| BIZ101 | Principles of Management | 3 | Management | Business Administration | 1 | 4 |
| MKT201 | Marketing Management | 3 | Marketing | Business Administration | 2 | 3 |
| FIN201 | Financial Management | 3 | Finance | Business Administration | 2 | 3 |
| GE101 | English for Academic Purposes | 2 | English | Liberal Arts | 1 | 6 |
| GE201 | Critical Thinking | 2 | Communication Arts | Liberal Arts | 1 | 4 |
| EE301 | Circuit Analysis | 3 | Electrical Engineering | Engineering | 2 | 2 |
| ME201 | Engineering Mechanics | 3 | Mechanical Engineering | Engineering | 2 | 2 |
| CS499 | Senior Project | 6 | Software Engineering | Information Technology | 4 | 1 |

## Proposed component structure

```text
AdminLayout
  Sidebar
  TopNavigation
  CoursesPage
    CoursesHeader
    CourseSummaryCards
    CourseFilters
    CoursesTable
      CourseCodeBadge
      CourseTypeBadge
      SemesterBadge
      StatusBadge
      CourseActionMenu
    CourseResultCount
```

Keep course records separate from presentation. Suggested record fields are `id`, `code`, `name`, `credits`, `departmentId`, `departmentName`, `facultyId`, `facultyName`, `programIds`, `curriculumYear`, `semester`, `academicYear`, `sectionCount`, `type`, and `status`. IDs and program memberships must come from real data or clearly marked fixtures; they cannot be recovered from this screenshot.

Suggested local state consists of the search query, six filter values, active row menu ID, loading state, and error state. Derive filtered rows from records and filter state. For this 20-row fixture, local filtering is sufficient; a production service can supply the same shape without requiring the table to know how data is fetched.

**Proposed summary semantics:** Compute the cards from the full catalog, while the footer reports filtered rows out of the total catalog. The current-semester count should use an explicit configured academic term. The reference has all three values equal to 20 and does not establish behavior after filtering.

## Proposed action behavior and additional states

| Control or state | Implementation guidance |
| --- | --- |
| Add Course | Wire to the application's approved creation flow; obtain its design before claiming visual fidelity for a drawer or form |
| Import Courses | Open the approved import flow with validation and a visible result summary; file format and schema remain unspecified |
| Export | Export the current filtered result set, with clear column labels and correct escaping; this scope is a proposal |
| Row ellipsis | Open a keyboard-accessible menu associated with that course; menu items require product requirements |
| Empty result | Show a clear no-matches message and an accessible way to clear filters |
| Loading | Keep column geometry stable and expose an accessible loading status |
| Failure | Show an error message and a retry control without discarding the user's filters |
| Global search / notifications / profile | Connect to existing shell behavior when available |

Do not report successful imports, exports, or saves unless the corresponding operation actually succeeds. The reference alone does not define API endpoints, permissions, validation rules, deletion behavior, or persistence.

## Asset handling

The Figma response supplies the university logo and SVGs for navigation, search, chevrons, notification bell, upload, download, plus, and row ellipsis. During application implementation, retrieve fresh asset URLs through detailed design context and save them locally. Temporary Figma asset URLs should not become permanent application dependencies.

| Asset group | Source nodes |
| --- | --- |
| University logo and sidebar icons | `63:6388`, logo `63:6391` |
| Global search, context icon, bell, chevrons | `63:6604` |
| Upload, download, plus | `63:6641` |
| Course search and filter chevrons | `63:6708` |
| Row ellipsis | `63:6836`, icon `63:6839` |

Use each asset in its original slot and preserve its proportions. Reuse a local asset only when it is an exact match. Preserve SVG root dimensions and inspect effective rendered geometry; avoid blanket sizing rules that stretch icons. Use the full-screen screenshot only as a visual reference, not as the page implementation. No assets were downloaded for this Markdown deliverable.

## Responsive and accessibility guidance

The provided frame defines a wide desktop layout. The following behavior is proposed for other widths:

- Let the heading actions and filter controls wrap before labels collide.
- Keep the search field flexible; move filters onto additional rows as needed.
- Reduce the summary grid from three columns to one when cards cannot fit comfortably.
- Place the table in a horizontally scrollable region on smaller screens, preserving all eight columns and readable cell content.
- Use a collapsible navigation panel at narrow widths; preserve access to every navigation item.
- Keep controls keyboard reachable and return focus to the trigger when a menu or dialog closes.
- Give icon-only controls accessible names, such as “Actions for CS101” and “Notifications”.
- Mark Courses with `aria-current="page"`; expose navigation expansion with `aria-expanded`.
- Use text as well as color for course status and type. Announce result changes without moving focus.

## Implementation acceptance checklist

- [ ] Use the existing React, Vite, JavaScript, and Tailwind stack.
- [ ] Load both font families and the specified weights.
- [ ] Match the reference at approximately 2059 × 1904px before checking smaller widths.
- [ ] Preserve sidebar order, expanded Academic Management, and selected Courses.
- [ ] Match heading copy and the three action labels.
- [ ] Show three summary values of 20 in the initial fixture.
- [ ] Show the search and all six filters in the documented order.
- [ ] Render all 20 reference records with correct credits, years, departments, faculties, and section counts.
- [ ] Preserve Required, Active, and Sem 1/2568 badges and their distinct styles.
- [ ] Display Showing 20 of 20 courses initially and update the result count when filtering.
- [ ] Verify search, combined filters, incompatible dependent selections, empty results, and keyboard access.
- [ ] Verify each static asset's local file, intended slot, callsite, and rendered dimensions.
- [ ] Run `npm run build` after application implementation and compare the rendered Courses screen with Figma.

## Verification status

This specification was checked against the retrieved Figma screenshot, metadata, detailed component context, and the existing project files. Application rendering, asset downloads, interaction tests, and a production build have not been performed because this deliverable is a Markdown file.
