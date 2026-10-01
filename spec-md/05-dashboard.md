# Smart AI Admin Web — Dashboard Implementation Specification

## 1. Goal and non-negotiable page structure

Implement the Smart AI Admin Web frontend using **Vite + React + TypeScript + Tailwind CSS**. Match the supplied Figma design closely. **Do not redesign the UI.**

Build in this order:

1. Reusable fixed/sticky Sidebar.
2. Dashboard top content from **Dashboard Screen One**.
3. Continue downward into the lower content represented by **Dashboard Screen**.

**These are two views of ONE continuous, vertically scrollable Dashboard page.** Dashboard Screen One is the TOP/INITIAL viewport. Dashboard Screen supplies the LOWER view after scrolling. Do not create separate `DashboardScreenOne` / `DashboardScreen` pages or routes. Use one `DashboardPage` and the project's existing dashboard route (for example, `/dashboard`). Scrolling must not change the route.

Both Figma dashboard nodes contain overlapping content. Render each section, header, sidebar, record, and footer only once. Do not concatenate two complete frame implementations, repeat the statistics halfway down the page, insert a frame boundary, or force a viewport-height gap between sections.

## 2. Figma sources

File key: `FQhq9uVri66RJpADxECMtm` — Smart Ai Admin Web.

| Reference | Node | Implementation role |
| --- | --- | --- |
| [Updated Sidebar](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=12-666) | `12:666` | Authoritative sidebar appearance, expanded groups, and submenu labels |
| [Dashboard Screen One](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=6-936) | `6:936` | Initial/top viewport of the single dashboard |
| [Dashboard Screen](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=9-2) | `9:2` | Continuation and lower sections of that same dashboard |

The actual Figma layer name for `6:936` is “Dashbord Screen One.” Use the node ID to locate it. Its reference render is 1749 × 1165; `9:2` renders at 1460 × 1795. These are reference canvases, not hardcoded page dimensions or separate responsive routes. The updated sidebar's inner component is `12:667` and is approximately 252 px wide. Its reference is 1424 px tall because the menu groups are expanded; use viewport height and scrollable navigation rather than hardcoding this height.

**Sidebar revision:** `12:666` supersedes the earlier sidebar reference and the sidebar copies embedded in both dashboard frames. Use this updated sidebar throughout the existing shell. The dashboard section order, sample content, and single-page scrolling requirements remain unchanged.

Content and appearance below were checked against Figma metadata, screenshots, and detailed child-node context. At implementation time, inspect current Figma child nodes for exact values and assets. If a full-frame response is sparse, request its visible child sections rather than implementing from incomplete metadata. Useful detailed nodes include updated sidebar `12:667`, expanded Academic Management group `12:718`, greeting `6:1160`, and announcements `9:833`.

## 3. Inspect the existing project first

Before editing or adding dependencies:

- Read project instructions and inspect `package.json`, the lockfile, Vite configuration, TypeScript configuration, Tailwind setup, routes, styles, and existing source folders.
- Inspect existing layouts, navigation, buttons, cards, badges, menus, inputs, charts, icons, fonts, logo assets, and design tokens. Reuse or compose suitable components before creating replacements.
- Preserve the installed Tailwind version and project conventions. Do not reinitialize an existing project, replace its package manager, or add a UI/chart/icon dependency without first checking existing capabilities.
- Reuse any applicable Figma Code Connect component mapping. Adapt Figma-generated code into maintainable project-native components; do not paste an entire fixed-position canvas.
- Use the actual Rangsit University logo and Figma icons/assets, or exact matches already in the project. Preserve their proportions and design slots. Download required assets to stable project paths; do not retain expiring Figma asset URLs.
- Use semantic HTML, typed props, stable data IDs, and data-driven repeated items. Keep fixture data separate from presentation. Do not implement unrelated management pages or backend services for this dashboard task.

## 4. Visual foundations and shell

Preserve the white sidebar/top navigation, pale page background, dark headings, subtle borders, rounded cards, compact labels, and colored action buttons shown in Figma.

Verified foundational values:

| Element | Reference |
| --- | --- |
| Main dark/active color | `#273238` |
| Heading text | `#17213c` |
| Secondary text | `#68728a` |
| Borders | `#e5e8f0` |
| Pale surface | `#f7f8fc` |
| Muted small text | `#9ca3af` |
| Sidebar Navigation label | `#b0b8cc` |
| Heading/navigation font | Plus Jakarta Sans |
| Body/detail font | Inter |
| Main greeting | 24 px bold, 36 px line height, -0.6 px tracking |
| Sidebar labels | 13 px medium, about 19.5 px line height |
| Panel corners | About 16 px |
| Buttons, nested cards, active nav corners | About 12 px |

Use existing equivalent tokens where available. Read remaining colors, spacing, shadows, and typography from the relevant Figma nodes rather than inventing a new theme.

Desktop shell:

- Sidebar approximately 252 px wide; main column fills the remaining width with `min-width: 0`.
- Sidebar spans the viewport, stays visible while dashboard content scrolls, and has its own scrollable navigation area if necessary. Keep the bottom profile outside that navigation scroll area.
- Top navigation approximately 64 px high. A sticky top navigation is the implementation default; keep one instance above the main scroll content.
- At the wide reference size, dashboard content has approximately 28 px horizontal and 24 px top padding. Match section gaps to the reference, generally 16–24 px.
- Choose one primary vertical dashboard scroll owner. Avoid nested competing content scrollbars. Use flex/grid and natural content height, not absolute positioning for the page layout.

## 5. Phase 1 — reusable Sidebar

### Branding and layout

At the top, show the Rangsit University logo alongside “SMART AI” and “ADMIN PORTAL,” with the small collapse control on the right. Preserve the bottom divider. The logo's reference slot is approximately 102.6 × 40 px.

Below it, display “Navigation” using the uppercase visual treatment, small text, and letter spacing from Figma. Navigation rows are approximately 40 px high, with 8 px outer horizontal padding, 10 px row padding, and approximately 17 px icons.

### Exact navigation order and behavior

| Label | Chevron / expandable group |
| --- | --- |
| Dashboard | No; active in this design |
| User Management | No |
| Students | No |
| Academic Management | Yes |
| Timetable | No |
| Academic Activities | Yes |
| Campus Management | Yes |
| AI Management | Yes |
| Communication | Yes |
| Reports & Analytics | No |
| Settings | Yes |

- Match the icon associated with each label. The active Dashboard row has a dark rounded background and white foreground. Inactive rows use muted text/icons.
- Model direct links and expandable groups separately. Use the project's existing routing system for real destinations and derive the active state from the current route.
- All six chevron groups are expanded in the updated reference. Use this as the initial state for a fresh session and visual matching. Each group toggles independently; multiple groups can remain open. Clicking or pressing Enter/Space toggles its child panel and rotates the chevron (down when expanded, right when collapsed); expose `aria-expanded` and `aria-controls`.
- Render the exact submenu labels below in order. Map them to existing project routes where available. Do not invent destination pages or broken links; for missing destinations, use an explicit unavailable/demo action and report the missing integration. Keep the real labels visible.
- Keep the active route's parent group open on navigation. Collapsed content must be removed from the keyboard tab order. Expansion must not change the main dashboard scroll position or navigate away from the current page.
- The top collapse button toggles a compact sidebar using existing project behavior where available. Keep accessible labels/tooltips in compact mode and restore the expanded view on toggle. Compact styling is a responsive implementation choice because the supplied references show the expanded state.
- Use visible keyboard focus, appropriate hover treatment, and `aria-current="page"` on the active link.

### Exact expanded submenu content

| Parent group | Children, in displayed order | Figma group node |
| --- | --- | --- |
| Academic Management | Faculties; Departments; Programs & Majors; Courses; Course Sections; Enrollments | `12:718` |
| Academic Activities | Assignments; Exams | `12:776` |
| Campus Management | Campus Map; Buildings; Rooms; Campus Places; Navigation Routes | `12:802` |
| AI Management | AI Knowledge Base; Test AI Knowledge; AI Assistant; Chat History; AI Feedback | `12:844` |
| Communication | Announcements; Notifications; Smart Reminders | `12:885` |
| Settings | University Settings; Audit Logs | Inspect within `12:667` |

There are **23 submenu entries** across the six groups. Dashboard, User Management, Students, Timetable, and Reports & Analytics remain direct top-level items.

Match the expanded submenu treatment from `12:718` across the groups:

- Indent the submenu container approximately 22 px from the group row's left edge.
- Use a thin vertical guide line in `#e5e8f0`, approximately 1.25 px in the reference, with 12 px inner left padding and 4 px vertical padding.
- Child rows are approximately 31 px high, with 10 px horizontal and 6 px vertical padding, and 8 px corner radius.
- Use a small approximately 6 px pale circular bullet, followed by a 10 px gap before the label.
- Submenu typography: Plus Jakarta Sans medium, 12.5 px, approximately 18.75 px line height, `#68728a`.
- Use natural expanded content height. Do not copy generated fixed heights or `max-height` values that clip labels. Keep the navigation region `min-height: 0` and vertically scrollable between the branding area and bottom profile so every entry remains reachable on normal laptop and mobile heights.

### Bottom administrator profile

Anchor the profile to the sidebar bottom with a top divider and pale rounded inner surface:

- Dark rounded-square avatar with **A**.
- **Admin User**.
- **Super Administrator**.

The avatar is approximately 32 × 32 px. Preserve the distinction between this sidebar avatar and the top-navigation **AD** avatar.

Phase 1 is complete when the sidebar is reusable, visually matched, accessible, responsive, and usable in an otherwise minimal shell. Do not build dashboard content during a Phase 1-only request.

## 6. Phase 2 — one continuous Dashboard

Reuse the Phase 1 Sidebar and layout. Build the top content first, then continue downward into the lower sections. The following is one ordered page composition.

### 6.1 Top navigation

Show, in order:

1. Rounded search field with search icon and placeholder **Search students, courses, rooms…**.
2. Rounded **Dashboard** button/current-location control with dashboard icon. Match this control rather than inventing an additional breadcrumb trail.
3. Flexible spacer.
4. Notification bell with small colored unread indicator.
5. Dark circular **AD** profile avatar and dropdown chevron.

Give icon-only controls accessible names. Reuse existing search, notification, and account-menu flows. If no backend exists, provide local demo behavior and clear empty/result states without pretending a server action succeeded. Menus must close on Escape/outside interaction and restore focus to their trigger.

### 6.2 Greeting and date

- Heading: **Good morning, Admin**
- Subtitle: **Here is what is happening across the university today.**
- Calendar/date pill: **Saturday, 30 Aug 2026**

Keep the exact Figma sample date for visual matching, even if its weekday/calendar combination is inconsistent. Treat these as fixture strings, not the actual current date.

### 6.3 Statistics cards

Render six cards in this order, in one row at the wide reference size. Each has a colored icon tile, prominent value, label, and small supporting line.

| Value | Label | Supporting line | Visual accent |
| --- | --- | --- | --- |
| 12,847 | Total Students | +234 this month | Dark neutral |
| 384 | Total Courses | 5 added this week | Purple |
| 126 | Today's Classes | 18 currently live | Orange |
| 23 | Active Buildings | All operational | Green |
| 1,304 | AI Questions Today | +18.5% vs yesterday | Pink |
| 2,198 | Knowledge Documents | 12 indexed today | Cyan |

Use one reusable `StatCard` driven by typed data. Preserve the reference spacing, icon backgrounds, and approximately 149 px card height on wide desktop.

### 6.4 Quick Actions

Display the small uppercase visual heading **Quick Actions** and these buttons in order:

| Button | Reference color |
| --- | --- |
| Add Student | Dark neutral |
| Add Course | Purple |
| Create Timetable | Orange |
| Upload AI Document | Pink |
| Create Announcement | Green |

Preserve leading icons, white labels, rounded corners, and subtle colored shadows. Reuse existing action handlers/routes/forms. Where a target flow is absent, expose a typed callback and explicit demo/unavailable feedback; do not create unrelated full pages just to make buttons clickable.

### 6.5 AI Assistant Usage and Upcoming Academic Events

Use a desktop two-column row: the usage panel takes approximately 60% and events approximately 40%. Match the equal-height panel treatment and the intentional open space below the graph.

**AI Assistant Usage**

- Subtitle: **Questions asked today — 24-hour view**.
- Pink total badge: **1,304 today**.
- Smooth cyan line with pale cyan area fill and subtle dashed horizontal gridlines.
- X-axis: `00:00`, `02:00`, `04:00`, `06:00`, `08:00`, `10:00`, `12:00`, `14:00`, `16:00`, `18:00`, `20:00`, `22:00`.
- Y-axis: `0`, `65`, `130`, `195`, `260`.
- Match the reference curve: low overnight, rising after 06:00, a peak near 10:00, a dip at 12:00, highest near 14:00, then declining toward 22:00.
- Inspect Figma chart geometry or existing fixture data for exact point values. Axis labels alone do not establish the underlying series; document any approximated demo values. Reuse the existing chart library or chart component before adding dependencies. Render a real responsive chart, not a screenshot of the design.

**Upcoming Academic Events** has a **View all** control and five stacked bordered event cards:

| Event | Date | Category | Priority |
| --- | --- | --- | --- |
| Mid-Term Examination Period | Sep 15–22, 2026 | Examination | HIGH |
| Faculty Research Symposium | Sep 28, 2026 | Academic | MEDIUM |
| New Student Orientation Day | Oct 3, 2026 | Orientation | MEDIUM |
| Annual Campus Sports Festival | Oct 10–12, 2026 | Activity | LOW |
| End-of-Term Grade Submission | Oct 30, 2026 | Deadline | HIGH |

Each event has a dark calendar icon tile, title, muted date, neutral category pill, and priority pill. Match red/pink high, amber medium, and green low treatments. Preserve priority text as well as color.

### 6.6 Lower continuation: activities and classes

Continue directly below the usage/events row with two approximately equal-width panels. The top reference already reveals the start of this row: that partial overlap must not become a second copy.

**Recent Administrative Activities**, with **View log**:

| Activity | Detail | Time |
| --- | --- | --- |
| Student account created | Panida Thongchai enrolled in CS Year 1 | 3 min ago |
| Course record updated | CS301 Algorithms — seat capacity raised to 45 | 18 min ago |
| Timetable modified | ICT-301 slot swapped — Monday → Wednesday 13:00 | 42 min ago |
| Student handbook uploaded | Student Handbook 2026 (128 pages) indexed | 1 hr ago |
| Announcement published | Mid-term notice sent to 4,218 students | 2 hr ago |

Use colored icon circles, a stronger activity title, muted detail, and right-aligned timestamps. Keep long details readable at smaller sizes.

**Today's Class Summary**, with **126 total** badge:

| Code | Course | Room and time | Instructor and students | Status |
| --- | --- | --- | --- | --- |
| CS 101 | Intro to Programming | ICT-201 · 08:00–10:00 | Dr. Kanya Srisuk · 52 students | Completed |
| CS 301 | Algorithms & Data Structures | ICT-301 · 10:00–12:00 | Dr. Supawit Kamnerd · 41 students | Live Now |
| BA 201 | Business Communication | BUS-401 · 13:00–15:00 | Asst. Prof. Nipa Chaiya · 67 students | Upcoming |
| ENG 102 | Academic English II | HUM-105 · 15:00–17:00 | Dr. Mark Williams · 38 students | Upcoming |

Render these as stacked bordered class cards, not an invented table UI. Each includes the dark course-code tile, course details, and a right-hand status pill: neutral Completed, green Live Now, blue Upcoming. The table above specifies content only.

### 6.7 Recent Announcements

Full-width panel beneath activities/classes. Heading **Recent Announcements** and a dark **Create Announcement** button with leading communication icon. Inside, show three equal-width announcement cards on desktop:

| Category | Timestamp | Title | Body | Author |
| --- | --- | --- | --- | --- |
| Academic | Today, 09:14 | Mid-Term Exam Schedule Released | The official mid-term timetable for Semester 1/2026 is now available in the student portal. | Registrar Office |
| System | Yesterday | AI Assistant Maintenance Window | SMART AI will undergo scheduled maintenance on Saturday Sep 6, 02:00–04:00. | IT Services |
| Campus | Aug 28, 2026 | Library Extended Hours — Exams | The main library will operate extended hours (07:00–23:00) throughout the exam period. | Library Services |

Preserve each category pill, muted timestamp, bold title, body copy, and divider above the author. Use complete body text; Figma layer names truncate these strings, but the visible text and detailed node context contain the complete copy above. Both Create Announcement buttons should invoke the same action.

### 6.8 Footer

End the page with the centered footer:

**© 2026 Rangsit University · SMART AI Admin Portal · IT Support**

Reuse the existing IT Support destination if available. Do not invent a support URL.

## 7. Reusable component and file structure

Adapt this suggested structure to the actual repository; do not create duplicate equivalents where components already exist.

```text
src/
  assets/
    branding/                 # Exact university logo and fonts as appropriate
    icons/                    # Locally stored Figma icons when needed
  layouts/
    AdminLayout.tsx           # One Sidebar, one TopNav, one main content area
  components/
    navigation/
      Sidebar.tsx
      SidebarNavItem.tsx
      SidebarNavGroup.tsx
      SidebarProfile.tsx
      TopNav.tsx
    dashboard/
      DashboardGreeting.tsx
      StatCard.tsx
      QuickActions.tsx
      AiUsageChart.tsx
      UpcomingEvents.tsx
      EventCard.tsx
      ActivityFeed.tsx
      ActivityItem.tsx
      ClassSummary.tsx
      ClassCard.tsx
      RecentAnnouncements.tsx
      AnnouncementCard.tsx
      DashboardFooter.tsx
    ui/                       # Reuse existing Button, Card, Badge, Input, Menu
  pages/
    DashboardPage.tsx         # Only dashboard page component
  data/
    navigation.ts
    dashboard.ts              # Typed sample content, stable IDs, chart data
  types/
    dashboard.ts
  styles/                     # Existing global styles/tokens/Tailwind entry
```

`DashboardPage` composes greeting → statistics → quick actions → usage/events → activities/classes → announcements → footer inside `AdminLayout`. Extract common panel headers, badges, and action styles when useful. Keep a single source of truth for shared data and actions.

## 8. Responsive behavior and accessibility

The supplied references establish desktop appearance. The following smaller-screen behavior is an implementation adaptation, not a claim that mobile Figma frames were supplied. Prefer existing project breakpoints.

- Wide desktop: expanded sidebar; six statistic cards; approximately 60/40 usage/events row; 50/50 activities/classes row; three announcement cards.
- Medium widths: reduce statistics to three or two columns as needed; allow quick actions to wrap. Keep paired panels only while their contents remain readable. Use the existing compact-sidebar pattern when space requires it.
- Mobile: sidebar becomes an off-canvas drawer triggered from top navigation. Include a backdrop, Escape-to-close, focus containment, and focus restoration. Keep all navigation labels and the profile available.
- Stack dashboard panels in their existing reading order. Statistics can use two columns, then one if needed; announcement cards become one column. Let the greeting/date and search/header controls wrap without clipping.
- Keep chart labels legible and the chart within its container. Use flexible widths and `min-width: 0`; do not introduce horizontal page scrolling.
- Keep the sidebar profile reachable on short screens; scroll the navigation rather than hiding lower items.
- Use actual links and buttons, labeled search input, semantic headings, visible focus, accessible expanded states, and text equivalents for chart meaning. Do not use color as the only status indicator. Respect reduced motion for transitions.

## 9. Verification and acceptance criteria

- [ ] Project assets, components, routes, and dependencies were inspected and suitable equivalents reused.
- [ ] Sidebar matches updated node `12:666`: all 11 top-level labels, all 23 submenu labels in order, six independently expandable groups initially open, submenu guide lines/bullets, active Dashboard treatment, logo, collapse control, and bottom profile.
- [ ] All expanded submenu entries remain reachable at short viewport heights; collapsed entries cannot receive keyboard focus, and expanding groups does not move the dashboard scroll position.
- [ ] There is exactly one Dashboard page/route and one persistent shell.
- [ ] Initial viewport follows `6:936`; scrolling reveals the remaining content represented by `9:2` without a route change, duplicated sections, or artificial frame gap.
- [ ] All six statistics, five quick actions, five events, five activities, four class cards, three announcements, and footer appear once.
- [ ] Search, notification/profile controls, menu expansion, collapse/drawer, and action controls have deliberate behavior. Any absent backend or destination is identified honestly.
- [ ] Typography, assets, icon placement, colors, borders, spacing, corner radii, and chart appearance were compared against Figma at comparable desktop sizes.
- [ ] Check both the top and scrolled lower page visually. Also check a tablet width, mobile width, and short viewport for overflow and reachable navigation.
- [ ] Run the project's existing build, type-check, and applicable lint/test commands. Add focused behavior tests only where useful for navigation/scroll regressions; report any unresolved issues or approximated chart data.

## 10. Concise Codex prompts

### Phase 1 — Sidebar only

```text
Read DASHBOARD.md and implement only Phase 1: the reusable fixed/sticky Sidebar
for Smart AI Admin Web using Vite + React + TypeScript + Tailwind CSS.
Inspect existing assets, components, tokens, routes, and dependencies first.
Use Figma file FQhq9uVri66RJpADxECMtm, updated Sidebar node 12:666
(inner sidebar 12:667). This supersedes older sidebar references.
Match its exact labels, icons, active state, chevron groups, branding, and bottom
admin profile. Implement accessible expansion, collapse, and mobile drawer behavior.
Include all 23 exact submenu labels from DASHBOARD.md, with six groups initially
expanded and independently collapsible. Match submenu guide lines and bullets.
Keep navigation scrollable above the bottom profile; reuse existing destinations.
Do not redesign the UI or implement dashboard content yet. Verify the result.
```

### Phase 2 — Full continuous Dashboard

```text
Read DASHBOARD.md and implement Phase 2 in Vite + React + TypeScript + Tailwind CSS.
Inspect and reuse existing project assets/components before adding dependencies.
Reuse the updated Phase 1 Sidebar from node 12:666 and one AdminLayout. In Figma file
FQhq9uVri66RJpADxECMtm, node 6:936 is the TOP/INITIAL Dashboard viewport;
node 9:2 represents the LOWER content of the SAME vertically scrollable page.
Build the top first, then continue downward, rendering overlapping content once.
Use one DashboardPage and one dashboard route. Never create separate
DashboardScreenOne/DashboardScreen pages or routes.
Match Figma's top navigation, sample content, cards, chart, events, activities,
class summary, announcements, and footer. Keep the sidebar fixed/sticky.
Do not redesign. Verify desktop top and scrolled views, responsive behavior,
interactions, build, and type checks; report any missing integrations.
```
