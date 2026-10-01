# Smart AI Admin Portal — Add Course

[Source Figma design](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=63-7892&m=dev)

- **Screen:** Add Course Screen
- **Figma node:** `63:7892`
- **Reference canvas:** 2059 × 1431 px
- **Purpose:** Create a new course in the academic catalog.

## Page header

**Add Course**

Create a new course in the academic catalog.

**Navigation action:** Back to Courses

## Basic Information

| Field | Control shown | Required | Placeholder |
| --- | --- | --- | --- |
| Course Code | Single-line input | Yes | e.g. CS301 |
| Credit Hours | Single-line input | Yes | e.g. 3 |
| Course Name | Single-line input | Yes | e.g. Data Structures & Algorithms |
| Course Description | Multiline input | No marker | Brief description of the course content and objectives… |

Course Code and Credit Hours share a row. Course Name and Course Description each span the full card width.

## Academic Classification

| Field | Control shown | Required | Placeholder | Initial appearance |
| --- | --- | --- | --- | --- |
| Faculty | Dropdown | Yes | Select faculty… | Enabled appearance |
| Department | Dropdown | Yes | Select department… | Dimmed |
| Program | Dropdown | No marker | Select program… | Dimmed |
| Recommended Academic Year | Dropdown | No marker | Select year… | Enabled appearance |
| Semester | Dropdown | No marker | Select semester… | Enabled appearance |

Faculty and Department share the first row. Program and Recommended Academic Year share the second row. Semester occupies the left column of the third row.

## Requirements

| Field | Control shown | Placeholder or selected value |
| --- | --- | --- |
| Prerequisite Courses | Full-width single-line input | e.g. CS101, CS201 (comma-separated course codes) |
| Course Type | Dropdown | Required |
| Maximum Students per Section | Single-line input | e.g. 50 |

Course Type and Maximum Students per Section share a row. These fields have no required-field markers in the design. “Required” is the displayed Course Type value.

## Status

| Option | Initial state |
| --- | --- |
| Active | Selected |
| Inactive | Unselected |

The options appear as a horizontal radio group.

## Form actions

- **Save Course:** Primary dark button with a check icon.
- **Cancel:** Secondary outlined button.

Both actions are positioned below the Status card, aligned to the left.

## Sidebar

The white sidebar is approximately 252 px wide and displays the Rangsit University logo beside **SMART AI / ADMIN PORTAL**. A collapse control appears beside the branding.

| Navigation item | State or children |
| --- | --- |
| Dashboard | Top-level item |
| User Management | Top-level item |
| Students | Top-level item |
| Academic Management | Expanded |
| ↳ Faculties | Child item |
| ↳ Departments | Child item |
| ↳ Programs & Majors | Child item |
| ↳ Courses | Selected; dark background and white text |
| ↳ Course Sections | Child item |
| ↳ Enrollments | Child item |
| Timetable | Top-level item |
| Academic Activities | Collapsed appearance |
| Campus Management | Collapsed appearance |
| AI Management | Collapsed appearance |
| Communication | Top-level item |
| Reports & Analytics | Top-level item |
| Settings | Collapsed appearance |

The bottom account area shows an **A** avatar, **Admin User**, and **Super Administrator**.

## Top bar

- Search placeholder: **Search students, courses, rooms…**
- Context control: **Academic Management**
- Notification bell with an indicator.
- Profile avatar: **AD**, with a dropdown chevron.

## Visual design

| Element | Observed styling |
| --- | --- |
| Page background | `#F7F8FC` |
| Sidebar and cards | `#FFFFFF` |
| Card header background | `#FAFBFC` |
| Borders | `#E5E8F0` |
| Main form text | `#17213C` |
| Dark accent and selected navigation | `#273238` |
| Secondary text | `#68728A` |
| Required markers | `#EF4355` |
| Primary button | Gradient from `#273238` to `#1A2329` |
| Heading and navigation font | Plus Jakarta Sans |
| Form and supporting font | Inter |
| Card corner radius | 16 px |
| Input and action corner radius | 12 px |
| Card body padding | 24 px |
| Form grid gap | 16 px |
| Vertical space between cards | 20 px |
| Section headings | 15 px, bold |
| Field labels | 12.5 px, semibold |
| Field text | 13.5 px, regular |

The form uses four vertically stacked cards with two-column field layouts and full-width rows where described above. Card headers pair a title with an icon: 📋 Basic Information, 🎓 Academic Classification, 📎 Requirements, and ⚡ Status.

## Scope and unconfirmed behavior

This document records the content, appearance, and initial state of the linked Figma screen. Markdown represents its structure rather than reproducing the visual layout.

The screen does not establish dropdown option lists, validation rules beyond visible required markers, save/cancel outcomes, responsive layouts, or loading/error/success states. Department and Program appear dimmed; the conditions for enabling them are not confirmed by this static design.
