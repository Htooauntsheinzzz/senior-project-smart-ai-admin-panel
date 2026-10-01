# SMART AI Admin Portal — Students implementation guide

Source: [Figma — Student Screen](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=28-2369&m=dev)  
File key: `FQhq9uVri66RJpADxECMtm` · Node: `28:2369`  
Inspected: 27 September 2026

## 1. Scope and implementation brief

Implement the Students management screen shown in the linked Figma frame. It contains the admin sidebar, top navigation, page heading and actions, four summary cards, search and six filters, a ten-row student table, and pagination.

This guide is based on the rendered Figma screenshot and detailed design-context responses for the visible sections. Measurements below are CSS pixels, rounded where appropriate. The parent frame is 2058 × 1083; its inner Dashboard is 2059 × 1083, so the reference render is 2059 pixels wide. This one-pixel source discrepancy should not introduce horizontal page overflow.

No application repository or preferred framework was supplied. Use the destination project's existing framework, components, styling system, routes, and tokens. The React/Tailwind representation returned by Figma is a visual reference, not a requirement to install either technology.

**Evidence boundary:** the desktop default state is verified. Responsive layouts, dropdown contents, modal layouts, action-menu contents, backend contracts, and loading/error states are not shown in the selected frame. Recommendations for those behaviors are explicitly identified below.

## 2. Page composition and geometry

Use a two-column application shell with a 252px sidebar and a flexible main area. Main content must have `min-width: 0`. Use normal flex/grid/table layout rather than absolute positioning the entire screen.

| Region | Source node | Reference geometry |
|---|---|---|
| Sidebar | 28:2373 | x 0, y 0, width 252, height 1083 |
| Top navigation | 28:2557 | x 252, y 0, width 1807, height 64 |
| Page heading/actions | 28:2591 | x 252, y 64, width 1807, height 103.25 |
| Summary section | 28:2621 | x 252, y 167.23, width 1807, height 95.68 |
| Search/filter section | 28:2670 | x 252, y 262.92, width 1807, height 70.01 |
| Table outer card | 28:2721 | x 280, y 332.93, width 1750.78, height 692.56 |
| Pagination row | 28:3207 | x about 280, y 1041.49, height 32 |

Main sections use 28px horizontal padding. Top navigation uses 24px horizontal padding. The design is compact with broad horizontal spacing, pale cool backgrounds, dark charcoal active controls, thin borders, and restrained color accents.

Suggested component boundaries:

```text
AdminShell
├── Sidebar
│   ├── Brand
│   ├── NavigationItem / NavigationGroup
│   └── AdminIdentity
└── MainArea
    ├── TopNavigation
    └── StudentsPage
        ├── PageHeader
        ├── StudentSummaryCards
        ├── StudentFilters
        ├── StudentTable
        │   ├── StudentIdentity
        │   ├── SemesterBadge
        │   ├── StatusBadge
        │   └── StudentActions
        └── Pagination
```

## 3. Design tokens

These values are extracted from detailed Figma section context, except the overall canvas background, which is a visual match to the verified pale surface token.

```css
:root {
  --canvas: #f7f8fc;
  --surface: #ffffff;
  --table-head: #fafbfc;
  --border: #e5e8f0;
  --text: #17213c;
  --text-muted: #68728a;
  --text-faint: #b0b8cc;
  --charcoal: #273238;
  --charcoal-end: #1a2329;
  --accent-pink: #d80255;
  --active-fg: #059669;
  --active-bg: #d1fae5;
  --inactive-fg: #6b7280;
  --inactive-bg: #f3f4f6;
  --suspended-fg: #dc2626;
  --suspended-bg: #fee2e2;
  --semester-pink-fg: #c026d3;
  --semester-pink-bg: #fce7f3;
  --purple-fg: #7c3aed;
  --purple-bg: #ede9fe;
  --border-width: 1.25px;
  --radius-small: 8px;
  --radius-control: 12px;
  --radius-card: 16px;
  --sidebar-width: 252px;
  --topbar-height: 64px;
  --content-inset: 28px;
}
```

Use pill radii for status/semester badges and circular avatars. The primary Add Student button uses `linear-gradient(164.63deg, #273238 0%, #1a2329 100%)`. The top bar has a subtle shadow corresponding to `0 1px 2px rgba(24,42,90,.05)`. Avoid adding prominent card shadows.

### Typography

Load Inter and Plus Jakarta Sans through the project's established font setup. Fallback sans-serif fonts are temporary fallbacks, not the fidelity target.

| Usage | Family | Size / line height | Weight |
|---|---|---|---|
| Students heading | Plus Jakarta Sans | 22 / 33 | 800 |
| Summary values | Plus Jakarta Sans | 22 / 22 | 800 |
| Sidebar item | Plus Jakarta Sans | 13 / 19.5 | 500 |
| Top Students control | Plus Jakarta Sans | 13 / 19.5 | 600 |
| Subtitle | Inter | 13.5 / 20.25 | 400 |
| Buttons, table headers, student names, year | Inter | 13 / 19.5 | 600 |
| Body/email/major | Inter | 13 / 19.5 | 400 |
| Faculty name | Inter | 13 / 19.5 | 500 |
| IDs, departments, summary labels | Inter | 11.5 / 17.25 | 400 |
| Status label | Inter | 11.5 / 17.25 | 600 |
| Semester label | Inter | 10.5 / 15.75 | 700 |
| Student avatar initials | Inter | 11.22 / 16.83 | 700 |

## 4. Sidebar

White surface with a 1.25px right border. Brand row is approximately 65px tall. It contains a reserved image region of 102.62 × 40, then stacked “SMART AI” and “ADMIN PORTAL”, and a collapse chevron.

**Asset discrepancy:** node `28:2376` is named “Image (Rangsit University)”, but the inspected screenshot shows this area blank and the detailed context returns an empty frame, without an image asset. Preserve its spacing for reference matching. Obtain an approved logo asset before populating it; do not invent a university mark.

Brand text:
- SMART AI: Plus Jakarta Sans 11px/13.75, bold, charcoal.
- ADMIN PORTAL: Inter 9px/13.5, medium, muted, 0.54px letter spacing.
- NAVIGATION section label: Inter 9.5px/14.25, bold, faint, 1.425px letter spacing.

Navigation rows are about 235 × 40, inset 8px from the sidebar edge, with about 2px between rows. Icons are approximately 17px, with 12px between icon and text. Students is active: charcoal background, white label/icon, 12px corner radius.

Navigation order:
1. Dashboard
2. User Management
3. Students — selected
4. Academic Management — disclosure chevron
5. Timetable
6. Academic Activities — disclosure chevron
7. Campus Management — disclosure chevron
8. AI Management — disclosure chevron
9. Communication — disclosure chevron
10. Reports & Analytics
11. Settings — disclosure chevron

Bottom identity section is about 81px tall with a top divider. Its inset pale card is about 227 × 52, radius 12. Include a 32px dark rounded-square avatar with “A”, “Admin User” in 12.5px semibold, and “Super Administrator” in 10.5px muted text.

## 5. Top navigation

White 64px bar with bottom border. Align all elements centrally:

- Search box: about 384 × 38, pale background, 12px radius, 14px horizontal padding, 16px search icon. Placeholder: **Search students, courses, rooms…**
- Students control: about 108.5 × 38.5, pale background, outlined, graduation-cap icon.
- Flexible spacer.
- Notification button: 36 × 36 with 20px bell and an approximately 8px pink unread dot with white border.
- Account button: about 66 × 44, containing a 32px circular charcoal avatar “AD” and 12px chevron.

Keep this global search separate from the student-list search state.

## 6. Page heading and actions

Use 24px top, 20px bottom, and 28px horizontal padding, plus a bottom divider.

Heading: **Students**  
Subtitle: **Manage students who use the SMART AI University Student Assistant mobile app.**

Right-align three actions with 10px gaps:

| Button | Appearance | Reference size |
|---|---|---|
| Import Students | White, outlined, upload icon | 155.48 × 38.5 |
| Export Students | White, outlined, download icon | 157.50 × 38.5 |
| Add Student | Dark gradient, white text, plus icon | 131 × 36 |

All have 12px radii and 13px semibold text. The primary action is vertically offset approximately 1.25px to align its center with the outlined actions.

## 7. Summary cards

Four equal-width cards in one desktop row, 16px gaps. Each is about 425.7 × 71.7 at the reference viewport, white with border and 16px radius. Use 16px horizontal and 14px vertical inner padding, a 40px icon tile with 12px radius, and a 14px tile-to-text gap.

| Value | Label | Icon text | Value color | Tile background |
|---|---|---|---|---|
| 24 | Total Students | 👥 | #273238 | rgba(39,50,56,.07) |
| 20 | Active Students | ✅ | #059669 | #d1fae5 |
| 3 | New This Semester | 🎓 | #7c3aed | #ede9fe |
| 4 | Inactive / Suspended | ⏸ | #d80255 | rgba(216,2,85,.07) |

These icons are actual emoji text in the source, at 18px/28px. Their appearance can vary by platform. The “new” count overlaps other categories; it is not an extra category added to the total.

## 8. Search and filters

One desktop row with 12px gaps, 16px top padding, and 12px bottom padding.

Student search placeholder: **Search by student ID, name or university email…**

The search occupies remaining width (about 880px in the reference), has a 260px minimum width, approximately 42px height, white background, border, and 12px radius.

Dropdown order and reference widths:
- Faculty: 196.48px
- Department: 122.73px
- Major: 120px
- Year: 120px
- Semester: 120px
- Status: 120px

Dropdowns are about 38.75px tall with 13px muted text and a small downward chevron. The screenshot only verifies the closed, unselected state.

## 9. Student table

White bordered card with 16px radius and clipped outer corners. Use a semantic HTML table. The header background is #fafbfc; body rows are white with horizontal separators. There are no selection checkboxes or visible sorting arrows in this frame.

| Column | Reference width | Share of table width | Contents |
|---|---:|---:|---|
| Student | 345.04px | 19.74% | Initials avatar, name, ID |
| Email | 285.10px | 16.31% | Muted university email |
| Faculty | 292.17px | 16.71% | Faculty, then department |
| Major | 316.72px | 18.12% | Major name |
| Year / Sem | 176.74px | 10.11% | Year, then semester pill |
| Status | 204.12px | 11.68% | Colored dot and label |
| Actions | 128.40px | 7.34% | Vertical ellipsis button |

Header height is approximately 48.11px. Body rows are approximately 64.26px. Cells use 16px horizontal padding and around 12px vertical padding. Avoid fixed heights that clip text at increased text scaling; treat these as reference targets.

Student avatars are 34px circles with white bold initials. Leave 12px between avatar and two-line identity. Gradients run 135 degrees from opaque base color to the same color at 80% opacity:
- TS: #7c3aed
- PB, WP, PT: #d97706
- KM: #d80255
- NC: #2563eb
- AT: #059669
- SL, SK: #6366f1
- JS: #0ea5e9

Status badges are approximately 25.2px tall, with 10px horizontal padding, a 6px dot, and a 6px gap. Use the status foreground/background tokens. Preserve the status label so color is not the only indicator.

Semester badges are approximately 16.5px tall with 8px horizontal padding:
- Sem 1/2568: pink background and magenta text.
- Sem 2/2567: purple background and purple text.

Preserve the displayed semester years exactly; do not silently convert 2568/2567 to Gregorian years. Row action buttons are 32px square with an 18px ellipsis icon and 8px radius.

### Verified first-page content

The records below are transcribed from the design. They are fixture content, not a verified production student dataset.

| Initials | Name | Student ID | Email | Faculty | Department | Major | Year | Semester | Status |
|---|---|---|---|---|---|---|---|---|---|
| TS | Thanapon Srisuk | STD-2024-0001 | thanapon.s@rsu.ac.th | Engineering | Computer Engineering | Computer Engineering | Year 2 | Sem 1/2568 | Active |
| PB | Pimchanok Buranasiri | STD-2024-0002 | pimchanok.b@rsu.ac.th | Business Administration | Marketing | Digital Marketing | Year 3 | Sem 1/2568 | Active |
| KM | Kittipong Manit | STD-2024-0003 | kittipong.m@rsu.ac.th | Information Technology | Software Engineering | Mobile Development | Year 1 | Sem 1/2568 | Active |
| NC | Naruemon Chaiya | STD-2023-0147 | naruemon.c@rsu.ac.th | Science | Data Science | Data Science | Year 3 | Sem 2/2567 | Active |
| WP | Wanchai Pongpai | STD-2022-0283 | wanchai.p@rsu.ac.th | Medicine | General Medicine | General Medicine | Year 4 | Sem 1/2568 | Active |
| AT | Apirak Thongchai | STD-2023-0312 | apirak.t@rsu.ac.th | Engineering | Electrical Engineering | Electrical Engineering | Year 3 | Sem 1/2568 | Inactive |
| SL | Sirikwan Lertsak | STD-2024-0058 | sirikwan.l@rsu.ac.th | Liberal Arts | English | English for Communication | Year 2 | Sem 1/2568 | Active |
| PT | Phongphat Tadee | STD-2022-0401 | phongphat.t@rsu.ac.th | Business Administration | Finance | Financial Technology | Year 4 | Sem 1/2568 | Active |
| SK | Sutida Kamnerd | STD-2024-0099 | sutida.k@rsu.ac.th | Information Technology | Cybersecurity | Cybersecurity | Year 1 | Sem 1/2568 | Active |
| JS | Jirapon Sombat | STD-2023-0205 | jirapon.s@rsu.ac.th | Science | Mathematics | Applied Mathematics | Year 3 | Sem 2/2567 | Suspended |

Only ten records are provided by this frame. Do not claim the other fourteen records were extracted. For a working demo, distinguish any additional synthetic fixtures from these source rows.

## 10. Pagination

Place pagination 16px below the table. Left copy: **Showing 1–10 of 24 students**, with the range and total bold/dark and surrounding text muted.

Right controls: previous chevron, **1**, **2**, **3**, next chevron. Buttons are 32px square, 8px radius, with 6px gaps. Page 1 uses charcoal fill and white text. Previous is disabled in this state. Use 10 records per page.

## 11. Behavior recommendations — not specified by this frame

Implement visible controls through the existing application's behavior. If building a standalone demo, the following are reasonable defaults:

| Control | Recommended behavior |
|---|---|
| Student search | Case-insensitive matching across ID, name, and email; reset to page 1 |
| Filters | Combine using AND; include an All/reset choice; reset pagination when changed |
| Faculty/department/major | Use real academic taxonomy; clear incompatible dependent selections |
| Pagination | Slice filtered results; calculate range and page count; disable unavailable directions |
| Summary cards | Show dataset-wide metrics unless product requirements define filtered metrics |
| Add Student | Open an existing form/route; validate required fields and unique student ID/email |
| Import Students | Open file selection and validate against an agreed schema before saving |
| Export Students | Export the agreed scope; recommended default is all filtered rows |
| Row ellipsis | Open the existing student action menu; menu contents are not defined here |
| Sidebar disclosures | Expand existing groups; child destinations are not provided here |
| Sidebar collapse | Toggle compact navigation with accessible labels/tooltips |
| Bell/account | Connect existing notification/account menus |
| Global search | Connect application-wide search independently of student filtering |

Do not invent API endpoints, permissions, delete operations, or import schemas as Figma requirements. Define those through the host application's contracts. “New This Semester” needs an explicit enrollment-period rule or backend metric; it cannot be reliably derived from the displayed ten rows.

For local state, keep query, faculty, department, major, year, semester, status, current page, and page size separate. Derive filtered results and the visible page instead of storing duplicate arrays. Handle zero results as “Showing 0 of 0 students” with a clear empty state. Add loading, recoverable error, and success feedback using the host design system.

Suggested data fields: studentId, name, email, faculty, department, major, year, semester, status, initials, avatarColor. Keep status as a constrained value: Active, Inactive, or Suspended. Use studentId as the stable row key.

## 12. Responsive recommendations — not verified Figma variants

First reproduce the desktop reference. Then adapt to available width without shrinking text or scaling the entire page.

- Use flexible equal-width summary columns; switch to two columns and then one when needed.
- Let page-header actions wrap below the description.
- Move student search to a full-width row before wrapping dropdowns into a grid.
- Keep the table inside its own horizontal scroll container at narrow widths. Preserve all columns.
- Collapse the sidebar or use an accessible drawer on small screens.
- Allow the top search to shrink or move to a second row while retaining notification/account access.
- Keep the profile card at the sidebar bottom using flex layout, not a fixed screen coordinate.

Breakpoint choices are implementation decisions. Suggested verification widths are 2059, 1440, 1024, and 390px.

## 13. Assets and source traceability

This Markdown is an implementation specification, not an asset bundle. Re-query the source nodes when implementing to obtain current downloadable SVG assets. Figma-generated asset links are temporary and should not become runtime dependencies.

| Asset group | Source node |
|---|---|
| Sidebar collapse and navigation icons | 28:2373 |
| Top search, graduation cap, bell, chevron | 28:2557 |
| Upload, download, plus | 28:2591 |
| Student search and dropdown chevrons | 28:2670 |
| Row ellipsis | 28:2721 |
| Pagination chevrons | 28:3207 |
| Unresolved university image slot | 28:2376 |

Reuse exact matching assets/components already present in the project. Otherwise download the supplied assets through the Figma workflow and reference stable local files. Preserve each asset's intended slot, aspect ratio, and intrinsic SVG dimensions; do not replace the design icons with arbitrary emoji or a vaguely similar icon set. The four summary emoji are separate source text elements.

Never use the full screenshot as the implemented interface. Use it only for visual comparison.

## 14. Build sequence and acceptance criteria

1. Inspect the destination project for existing shell, controls, badges, typography, icons, and table components.
2. Establish font loading and map the source values onto existing design tokens.
3. Build the shell, sidebar, and top bar.
4. Build the page header, summary cards, and filter controls.
5. Render the verified rows through reusable table cells and badges.
6. Connect search, filters, pagination, and authorized application actions.
7. Add responsive behavior and accessible loading/empty/error states.
8. Compare a desktop render with the selected Figma frame.

Acceptance checklist:

- [ ] Desktop proportions match the roughly 252px sidebar and 64px top bar.
- [ ] Students is the active navigation item; navigation order and labels match.
- [ ] Heading, subtitle, action labels, placeholders, and filter order match exactly.
- [ ] Summary values read 24, 20, 3, and 4 in the reference fixture state.
- [ ] All ten source records appear in the same order with correct IDs and statuses.
- [ ] Department appears beneath faculty; semester appears beneath year.
- [ ] Font families, weights, small-text sizes, borders, radii, and spacing match.
- [ ] Active, Inactive, and Suspended badges match their respective colors and labels.
- [ ] Initial pagination reads 1–10 of 24 and highlights page 1.
- [ ] Table scrolling stays inside its container on narrow screens.
- [ ] Search/filter combinations, empty results, and pagination boundaries work.
- [ ] Inputs have accessible names; navigation marks the current page.
- [ ] Icon buttons have descriptive labels; menus support keyboard use and Escape.
- [ ] Focus is visible; dialogs return focus to their opener.
- [ ] Static assets are non-empty local files with correct placement and geometry.
- [ ] The blank university-logo slot is explicitly tracked rather than silently replaced.
- [ ] Any additional screens, fixtures, or behaviors are identified as implementation additions.

