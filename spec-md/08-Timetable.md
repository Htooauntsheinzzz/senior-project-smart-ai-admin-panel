# Timetable Screen Implementation

## Project

Smart AI Admin Web — Senior Project

## Objective

Implement the **Class Timetable** screen based on the provided Figma design.

Figma reference:

https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=34-3999&m=dev

Target stack:

- Vite
- React
- TypeScript
- Tailwind CSS

---

# Important Instructions

Follow the Figma design as closely as possible.

DO NOT rebuild the entire admin layout.

The project already contains:

- Sidebar
- Top navigation
- Search bar
- Admin profile section
- Theme colors
- Shared layout/components

Reuse the existing components and styles.

Do not change the current project theme.

Do not redesign the sidebar or top navigation.

Only implement the **Timetable Management / Class Timetable content area** and integrate it into the existing admin layout.

---

# Page

Create the timetable page inside the existing admin application.

Suggested route:

`/timetable`

If the project already has an appropriate timetable or schedule route structure, follow the existing routing convention instead of creating a conflicting route.

---

# Page Header

At the top of the content area display:

## Title

`Class Timetable`

## Subtitle

`Weekly schedule view across all faculties and departments`

Keep typography, spacing, sizing, border radius, and layout consistent with the Figma design and existing admin pages.

---

# Header Actions

Place the actions on the right side of the page header.

## View Toggle

Create a segmented control containing:

- Calendar
- List

Default:

`Calendar`

The active option should use the existing project's primary/theme styling.

Switching to **List** should change the timetable presentation to a list-based schedule view.

Do not navigate to another page when switching views.

Use React state.

Example state:

```tsx
const [viewMode, setViewMode] =
  useState<"calendar" | "list">("calendar");