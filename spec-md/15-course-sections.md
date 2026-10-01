# Smart AI Admin Portal — Course Sections

[Source Figma design](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=63-8330&m=dev)

- **Screen:** Courses Section Screen
- **Figma node:** `63:8330`
- **Main frame:** 2058 × 2104 px; its dashboard layer is 2059 px wide.
- **Create Section drawer:** 480 × 2104 px, positioned to the right of the dashboard in the reference.
- **Document scope:** Markdown representation of the screen content, layout, and visible initial states.

## Page header

**Course Sections**

Manage individual course sections, lecturers, and class capacity.

**Primary action:** Create Section, with a plus icon, aligned to the right.

## Summary cards

| Icon | Metric | Displayed value | Visual treatment |
| --- | --- | --- | --- |
| 📂 | Total Sections | 23 | Dark neutral |
| ✅ | Active Sections | 21 | Green |
| ⚠️ | Full Sections | 2 | Amber |
| 👥 | Total Enrolled | 1023 | Purple |

Four equal-width white cards sit in a single row, with 16 px gaps and rounded borders.

## Search and filters

| Control | Displayed text | Reference width |
| --- | --- | --- |
| Search input with search icon | Search course or section… | 260 px |
| Course dropdown | Course | 130 px |
| Semester dropdown | Semester | 130 px |
| Year dropdown | Year | 130 px |
| Lecturer dropdown | Lecturer | Approximately 251 px |
| Status dropdown | Status | 130 px |

The controls appear in one horizontal row, separated by 12 px gaps. Dropdown options and filtering behavior are not shown.

## Course sections table

The table contains eight columns in this order: Course, Section, Lecturer, Room / Schedule, Capacity, Semester, Status, Actions.

- **Course:** A small code badge above the course name.
- **Section:** Bold section identifier.
- **Lecturer:** Lecturer name, preserving the title shown in the design.
- **Room / Schedule:** Room above a smaller schedule line.
- **Capacity:** Horizontal occupancy bar and enrolled/capacity count.
- **Semester:** Purple semester badge above the academic year.
- **Status:** Rounded badge with a colored dot and label.
- **Actions:** Vertical three-dot button; its menu is not expanded.

The Markdown table combines stacked content using a dash or middle dot.

| Course | Section | Lecturer | Room / Schedule | Capacity | Semester / Year | Status | Actions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CS101 — Introduction to Programming | Sec 01 | Asst. Prof. Nittaya Chindakhan | IT-101 · Mon/Wed 08:00–09:30 | 48/50 | Sem 1/2568 · 2024 | Active | ⋮ |
| CS101 — Introduction to Programming | Sec 02 | Asst. Prof. Nittaya Chindakhan | IT-102 · Mon/Wed 10:00–11:30 | 47/50 | Sem 1/2568 · 2024 | Active | ⋮ |
| CS101 — Introduction to Programming | Sec 03 | Dr. Pongsakorn Rattana | IT-103 · Tue/Thu 08:00–09:30 | 46/50 | Sem 1/2568 · 2024 | Active | ⋮ |
| CS101 — Introduction to Programming | Sec 04 | Dr. Pongsakorn Rattana | IT-104 · Tue/Thu 10:00–11:30 | 39/50 | Sem 1/2568 · 2024 | Active | ⋮ |
| CS201 — Data Structures | Sec 01 | Assoc. Prof. Wichai Saengsuwan | IT-201 · Mon/Wed 13:00–14:30 | 50/50 | Sem 1/2568 · 2024 | Full | ⋮ |
| CS201 — Data Structures | Sec 02 | Assoc. Prof. Wichai Saengsuwan | IT-202 · Tue/Thu 13:00–14:30 | 48/50 | Sem 1/2568 · 2024 | Active | ⋮ |
| CS201 — Data Structures | Sec 03 | Dr. Apinya Srisawat | IT-203 · Fri 09:00–12:00 | 37/50 | Sem 1/2568 · 2024 | Active | ⋮ |
| CS301 — Data Structures & Algorithms | Sec 01 | Prof. Supakorn Tantibundit | IT-301 · Mon/Wed 09:00–10:30 | 45/50 | Sem 1/2568 · 2024 | Active | ⋮ |
| CS301 — Data Structures & Algorithms | Sec 02 | Prof. Supakorn Tantibundit | IT-302 · Tue/Thu 09:00–10:30 | 43/50 | Sem 1/2568 · 2024 | Active | ⋮ |
| CS301 — Data Structures & Algorithms | Sec 03 | Dr. Apinya Srisawat | IT-303 · Mon/Wed 15:00–16:30 | 40/50 | Sem 1/2568 · 2024 | Active | ⋮ |
| CS315 — Database Systems | Sec 01 | Dr. Nittaya Chindakhan | IT-201 · Tue/Thu 13:00–14:30 | 46/50 | Sem 1/2568 · 2024 | Active | ⋮ |
| CS315 — Database Systems | Sec 02 | Dr. Nittaya Chindakhan | IT-202 · Mon/Wed 11:00–12:30 | 44/50 | Sem 1/2568 · 2024 | Active | ⋮ |
| CS315 — Database Systems | Sec 03 | Asst. Prof. Siriporn Kaewmanee | IT-404 · Fri 13:00–16:00 | 40/50 | Sem 1/2568 · 2024 | Active | ⋮ |
| CS322 — Software Engineering | Sec 01 | Prof. Supakorn Tantibundit | IT-405 · Mon/Wed 13:00–14:30 | 43/45 | Sem 1/2568 · 2024 | Active | ⋮ |
| CS322 — Software Engineering | Sec 02 | Assoc. Prof. Wichai Saengsuwan | IT-406 · Tue/Thu 15:00–16:30 | 41/45 | Sem 1/2568 · 2024 | Active | ⋮ |
| MTH101 — Calculus I | Sec 01 | Prof. Chanida Buransiri | SCI-101 · Mon/Wed/Fri 08:00–09:00 | 50/50 | Sem 1/2568 · 2024 | Full | ⋮ |
| MTH101 — Calculus I | Sec 02 | Prof. Chanida Buransiri | SCI-102 · Mon/Wed/Fri 10:00–11:00 | 48/50 | Sem 1/2568 · 2024 | Active | ⋮ |
| MTH101 — Calculus I | Sec 03 | Dr. Thanawat Phongsatit | SCI-103 · Tue/Thu 09:00–10:30 | 47/50 | Sem 1/2568 · 2024 | Active | ⋮ |
| GE101 — English for Academic Purposes | Sec 01 | Asst. Prof. Sarah Mitchell | LA-101 · Mon/Wed 09:00–10:30 | 48/50 | Sem 1/2568 · 2024 | Active | ⋮ |
| GE101 — English for Academic Purposes | Sec 02 | Asst. Prof. Sarah Mitchell | LA-102 · Tue/Thu 09:00–10:30 | 47/50 | Sem 1/2568 · 2024 | Active | ⋮ |
| GE101 — English for Academic Purposes | Sec 03 | Ms. Emma Johnson | LA-103 · Mon/Wed 13:00–14:30 | 44/50 | Sem 1/2568 · 2024 | Active | ⋮ |
| CS450 — Cybersecurity Fundamentals | Sec 01 | Dr. Apinya Srisawat | IT-B01 · Mon 13:00–16:00 | 44/45 | Sem 1/2568 · 2024 | Active | ⋮ |
| CS450 — Cybersecurity Fundamentals | Sec 02 | Dr. Apinya Srisawat | IT-B02 · Thu 13:00–16:00 | 38/45 | Sem 1/2568 · 2024 | Active | ⋮ |

### Table footer

**Showing 23 of 23 sections**

**1023 enrolled / 1130 total capacity**

### Capacity and status appearance

- Active status uses a pale green pill with green text and dot.
- Full status uses a pale amber pill with amber text and dot.
- Capacity bars are approximately 80 × 6 px, with rounded ends.
- The reference shows dark bars for 39/50 and 37/50, amber bars for the other non-full rows, and magenta bars for 50/50.
- Exact color-switch thresholds are not specified by the static screen.

## Create Section drawer

**Create Section**

Add a new section to an existing course.

A close icon appears at the top right. The drawer is white with a shadow, a bordered header, and a bottom action area separated by a border.

### Form fields

| Field | Control | Required marker | Initial value or placeholder |
| --- | --- | --- | --- |
| Course | Dropdown | Yes | Select a course… |
| Section Number | Single-line input | Yes | e.g. 01 |
| Capacity | Single-line input | No | 50 |
| Lecturer | Dropdown | Yes | Select a lecturer… |
| Room | Single-line input | No | e.g. IT-301 |
| Schedule | Single-line input | No | e.g. Mon/Wed 09:00–10:30 |
| Semester | Dropdown | No | Semester 1/2568 |
| Academic Year | Dropdown | No | 2024 |
| Status | Radio group | No | Active selected; Closed unselected |

The Course, Lecturer, Room, and Schedule controls span the form width. Section Number and Capacity share a row. Semester and Academic Year share another row. Each two-column row uses a 16 px gap.

The form has 24 px horizontal padding, yielding 432 px of content width. Two-column controls are approximately 208 px wide. Labels are separated from controls by 6 px, with approximately 16 px between field groups. Inputs are approximately 43 px high; dropdowns are approximately 39 px high.

### Drawer actions

- **Create Section:** Dark primary button with a check icon.
- **Cancel:** Secondary outlined button.
- **Close:** Icon button in the header.

The footer sits at the bottom of the tall drawer, leaving a large blank area below the fields in the reference. Submission, cancellation, and close behavior are not demonstrated.

## Sidebar

The 252 px white sidebar contains the Rangsit University logo and **SMART AI / ADMIN PORTAL** branding, followed by a Navigation label.

| Navigation item | Visible state |
| --- | --- |
| Dashboard | Top-level item |
| User Management | Top-level item |
| Students | Top-level item |
| Academic Management | Expanded |
| ↳ Faculties | Child item |
| ↳ Departments | Child item |
| ↳ Programs & Majors | Child item |
| ↳ Courses | Child item |
| ↳ Course Sections | Selected; dark background and white text |
| ↳ Enrollments | Child item |
| Timetable | Top-level item |
| Academic Activities | Collapsed appearance |
| Campus Management | Collapsed appearance |
| AI Management | Collapsed appearance |
| Communication | Collapsed appearance |
| Reports & Analytics | Top-level item |
| Settings | Collapsed appearance |

The bottom account panel displays an **A** avatar, **Admin User**, and **Super Administrator**. A collapse control appears beside the branding.

## Top navigation

The top bar is approximately 64 px high and contains:

- Global search: **Search students, courses, rooms…**
- Context button: **Academic Management**
- Notification bell with an indicator.
- **AD** profile avatar with a dropdown chevron.

## Layout and visual styling

The dashboard uses a pale background, a persistent left sidebar, a top navigation bar, and a main content area. The main area stacks the page header, summary cards, filters, table, and table footer. Main content has approximately 28 px horizontal padding. The creation drawer is shown alongside this layout.

| Element | Observed specification |
| --- | --- |
| Main background | Pale blue-gray |
| Cards, inputs, and drawer | White |
| Borders | `#E5E8F0`, typically 1.25 px |
| Main text | `#17213C` |
| Secondary text | `#68728A` |
| Dark accent | `#273238` |
| Primary button gradient | `#273238` to `#1A2329` |
| Green accent / pale fill | `#059669` / `#D1FAE5` |
| Amber accent / pale fill | `#D97706` / `#FEF3C7` |
| Purple accent / pale fill | `#7C3AED` / `#EDE9FE` |
| Drawer required markers | `#D80255` |
| Heading and metric font | Plus Jakarta Sans |
| Body and form font | Inter |
| Page heading | 22 px, extra bold, 33 px line height |
| Page description | 13 px, regular, 19.5 px line height |
| Metric values | 20 px, extra bold |
| Metric labels | 11 px, regular |
| Drawer heading | 18 px, extra bold, 27 px line height |
| Drawer labels | 12.5 px, semibold |
| Drawer control text | 13.5 px |
| Active badge text | 11.5 px, semibold |
| Summary card radius | 16 px |
| Input and button radius | 12 px |
| Course code badge radius | 8 px |
| Table header height | Approximately 48 px |
| Table row height | Approximately 73 px |
| Table cell horizontal padding | 16 px |
| Drawer shadow | 0 px horizontal, 25 px vertical, 25 px blur, black at 25% opacity |

## Source details and unconfirmed behavior

- The table rows sum to **1023 enrolled** and **1130 capacity**, matching the displayed footer.
- The 23 displayed rows contain **21 Active** and **2 Full** statuses.
- The semester text **1/2568** and academic year **2024** are preserved exactly as shown; their calendar relationship is not explained in the design.
- The drawer offers **Active** and **Closed**, while the table also displays **Full**. The rule relating enrollment, capacity, and these statuses is not specified.
- No expanded action menu, dropdown option lists, validation errors, success messages, loading states, empty results, mobile layout, or backend behavior are shown.
- This is a Markdown design document. It records visible controls and data without implementing an interactive website.

