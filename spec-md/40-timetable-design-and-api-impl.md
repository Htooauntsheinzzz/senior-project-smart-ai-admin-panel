# Admin Timetable — Frontend Design and Backend API Integration

Suggested filename: `spec-md/timetable-design-and-api-integration.md`

## 1. Objective

Implement the Timetable feature in the existing React admin frontend using the inspected Figma design and the existing backend APIs.

Include:

- Weekly calendar.
- List view.
- Semester, academic-year, faculty, department, and course filters.
- Add Class Schedule modal.
- Class Details drawer.
- Edit Schedule flow.
- Schedule Conflicts tab.
- Loading, empty, validation, and error states.

Implement frontend changes only. Do not change backend code.

## 2. Figma Source

Design:
https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=0-1&m=dev

Verified through Figma MCP:

| Screen/component | Node ID |
|---|---|
| Timetable screen | `34:3999` |
| Page heading, tabs, and filters | `34:4266` |
| Weekly calendar | `34:4391` |
| Create Timetable screen | `193:30` |
| Add Class Schedule modal | `193:973` |
| Detail View screen | `193:2113` |
| Class Details drawer | `193:3056` |

Reference sizes:

- Main timetable: approximately 2058 × 1073.
- Modal/detail reference screens: 1512 × 741.
- Sidebar: approximately 252 px.
- Top navigation: approximately 64 px.
- Create modal: approximately 620 px wide.
- Detail drawer: approximately 360 px wide.

Separate List, Schedule Conflicts, and Edit modal designs were not found in the inspected frames. Implement them using existing project components and the rules below; record them as design extensions.

## 3. Required Figma MCP Workflow

Before implementation:

1. Read the Figma design-to-code skill.
2. Create a Figma session for file `FQhq9uVri66RJpADxECMtm`.
3. Use `get_design_context` for the verified component nodes above.
4. Request screenshots and compare them with the implementation.
5. If a response is sparse, inspect its child nodes instead of implementing from metadata alone.
6. Reuse existing components and matching assets.
7. Download required static assets locally.
8. Do not reference temporary Figma asset URLs at runtime.

Treat generated reference code as visual guidance. Adapt it to the existing React application.

## 4. Mandatory Project Rules

Read first:

- `Agent.md` or `AGENTS.md`.
- `spec-md/00-changes-decision.md`.
- Existing authentication and API-client specifications.
- Existing Courses, Course Sections, Semesters, Lecturers, Buildings, and Rooms implementations.
- Backend timetable controllers, DTOs, and API documentation.

Requirements:

- Use the existing React and Tailwind setup.
- Preserve the project's current JavaScript/TypeScript convention.
- Reuse the admin shell, router, authenticated client, form controls, dialogs, and notifications.
- Do not introduce another UI framework or authentication system.
- Do not modify backend endpoints, DTOs, migrations, or database relationships.
- Do not use student timetable APIs for administrator management.
- Do not invent endpoint paths or response fields.
- Keep Figma sample records in preview/test fixtures only.
- Do not display fixture records when an API fails.

## 5. Verify the Backend Contract

Exact timetable endpoints and payloads have not been provided in this chat.

Inspect the existing backend and record:

| Operation | Contract to verify |
|---|---|
| List schedules | Method, path, filters, pagination, sorting |
| Schedule detail | Method, path, schedule ID |
| Create schedule | Method, path, required fields |
| Update schedule | Method, path, editable fields |
| Conflict results | Endpoint or conflict information in existing responses |
| Course lookup | Existing admin course endpoint |
| Section lookup | Existing course-section endpoint and course association |
| Semester lookup | Existing semester endpoint |
| Academic year | Whether independent, derived, or unsupported |
| Faculty/department lookup | Existing endpoints and relationships |
| Lecturer lookup | Existing endpoint and eligibility rules |
| Building/room lookup | Existing endpoints and building association |

For each operation, document:

- Exact HTTP method and path.
- Query parameters and request body.
- Response envelope.
- Identifier types.
- Enum values, including day-of-week encoding.
- Time format and timezone semantics.
- Validation/error structure.
- Authorization requirements.
- Pagination rules.
- Sanitized request/response examples.

Do not assume there is a dedicated timetable endpoint. The backend may expose schedules through course sections.

If source or documentation is unavailable, request the backend project location or OpenAPI/Postman contract before completing API mapping.

## 6. Page Layout

Reuse the existing sidebar and top navigation.

Sidebar:

- Highlight `Timetable`.
- Preserve the other navigation groups.

Page heading:

`Class Timetable`

Subtitle:

`Weekly schedule view across all faculties and departments.`

Right-side controls:

- Calendar/List segmented switch.
- Primary `Add Class Schedule` button with plus icon.

Below the heading:

- `Class Timetable` tab.
- `Schedule Conflicts` tab with count badge.

Below the tabs:

- Semester filter.
- Academic Year filter.
- Faculty filter.
- Department filter.
- Course filter.
- Faculty color legend.

Match the Figma spacing, borders, typography, dark primary buttons, light surfaces, and muted labels.

The layout must adapt to viewport width. Do not hardcode the complete canvas dimensions.

## 7. Weekly Calendar

Reference: `34:4391`.

### Structure

- Narrow time-label column.
- Six visible day columns: Monday through Saturday.
- Day headings show an uppercase abbreviation and full day name.
- Hour labels begin at 08:00 in the reference and continue through 17:00.
- Pale calendar background.
- Solid hour separators and lighter intermediate separators.
- Vertical day boundaries.
- Colored class blocks.

Use the reference range for the default visual layout, but expand the range or provide access when real schedules fall outside it.

If the backend supports Sunday classes, display Sunday when needed. Never discard supported schedules because the reference shows six days.

### Event content

Each event displays:

- Course code.
- Course name.
- Section and room.
- Lecturer name.

Style:

- Soft faculty-colored background.
- Strong colored left border.
- Rounded corners.
- Compact typography.
- Ellipsis where necessary.
- Full information available in the detail drawer.

The legend contains:

- Information
- Engineering
- Business
- Science
- Medicine
- Liberal

Map colors consistently using stable faculty identifiers. Provide a neutral fallback for unknown faculties.

### Time positioning

Calculate event position from the actual start and end times:

- Vertical offset derives from minutes after the visible start time.
- Height derives from duration.
- Preserve non-hour starts such as 09:30.
- Do not use hardcoded positions from fixture records.

Arrange simultaneous classes in separate lanes within a day.

Simultaneous classes across different faculties are not automatically scheduling conflicts.

Use schedule IDs as event keys. Do not collapse separate meetings because they share a course code.

### Interaction

- Clicking or keyboard-activating an event opens Class Details.
- Switching Calendar/List preserves filters.
- Keep day headings and time labels understandable while scrolling.
- Do not implement drag-and-drop or resizing; these are not shown in the inspected design.

## 8. Filters and Data Loading

Use actual backend lookup records.

Behavior:

- Apply semester and academic-year semantics from the verified contract.
- Filter departments by faculty where supported.
- Clear an incompatible department when faculty changes.
- Clear an incompatible course when its parent filters change.
- Preserve valid selections.
- Cancel or ignore stale requests.
- Show loading and errors for lookup failures.
- Do not show failed lookups as valid empty choices.

Use server-side filtering where available.

If client-side filtering is necessary, operate on a complete dataset for the selected scope. Do not filter only one loaded page and present it as the full timetable.

Calendar mode must load all meetings for its displayed scope, either through a suitable range endpoint or complete pagination.

Do not hardcode Figma values `1/2568` or `2025–2026`.

## 9. List View

This view is a design extension because its content frame was not found.

Use the project's existing admin table component.

Columns:

- Course Code
- Course Name
- Section
- Day
- Start Time
- End Time
- Building
- Room
- Lecturer
- Semester
- Actions

Include Academic Year only when supported or reliably derived.

Actions:

- View Details.
- Edit, when permitted and supported.

Requirements:

- Share filters and data semantics with Calendar.
- Support documented pagination and sorting.
- Use stable backend IDs.
- Keep existing results visible while refreshing.
- Provide an empty state and retry state.
- Do not add Delete unless separately required.

## 10. Add Class Schedule Modal

Reference: `193:973`.

### Appearance

- Centered white modal.
- Width approximately 620 px.
- Rounded corners, approximately 16 px.
- Dimmed backdrop.
- Header padding approximately 24 px.
- Title: `Add Class Schedule`.
- Close control at the top right.
- Header divider.
- Body padding approximately 24 px.
- Inputs approximately 40–42 px high.
- Rounded input borders.
- Required markers in pink/red.

On smaller viewports, fit within the screen and allow the modal body to scroll.

### Field groups

#### Course Information

Two columns:

- Course *
- Section *

#### Schedule

Three columns:

- Day of Week *
- Start Time *
- End Time *

#### Location

Two columns:

- Building *
- Room *

#### Staff & Term

Three columns:

- Lecturer *
- Semester *
- Academic Year *

Footer:

- Primary `Create Schedule`.
- Secondary `Cancel`.

Preserve this visual grouping while respecting the backend's actual data model.

## 11. Field Mapping and Dependencies

### Course and section

- Load courses from the existing admin API.
- If schedules require `courseSectionId`, select an existing section belonging to the selected course.
- Do not submit a typed section label as an ID.
- The Figma section text field may become a searchable select when the backend requires a section relationship.
- Preserve its dimensions and styling.
- Do not create a new course section implicitly.

### Building and room

- Select Building first.
- Load/filter Rooms for that building.
- Disable Room until a valid Building is selected.
- Clear Room when the Building changes.
- Submit the exact identifiers required by the backend.

### Lecturer and semester

If these are determined by the selected course section:

- Populate them from that section.
- Render them read-only where appropriate.
- Do not allow incompatible overrides.

If the backend accepts independent values, use its documented validation rules.

### Academic year

The design contains an Academic Year field, but the backend may derive it from another record or may not support it.

- Do not add a backend field to match Figma.
- Display a derived read-only value when reliable.
- Otherwise omit/disable the unsupported control with a documented explanation.
- Never submit an invented academic-year property.

### Time

- Require an end time later than start time for same-day schedules.
- Follow backend precision and accepted intervals.
- Do not assume all classes start on the hour.
- Support overnight schedules only if explicitly documented.
- Preserve local class times without accidental browser timezone conversion.
- Use Asia/Bangkok when the backend defines university times in that timezone.

Do not convert Buddhist-era labels into Gregorian years by guessing from strings.

## 12. Create Workflow

1. Open the modal.
2. Load required lookup data.
3. Prefill compatible active filters.
4. Validate required fields and relationships.
5. Submit one request using the verified payload.
6. Disable duplicate submission.
7. Keep the form open when validation or server errors occur.
8. Preserve entered values on failure.
9. On confirmed success, close the modal and show a success notification.
10. Refresh affected schedule queries and conflict information.

If the new schedule does not match current filters, explain that it was created outside the current view.

Do not report success before the server confirms it.

Do not automatically retry create requests after a timeout; the server may already have created the record.

## 13. Class Details Drawer

Reference: `193:3056`.

Appearance:

- Right-side drawer.
- Approximately 360 px wide on desktop.
- Full viewport height.
- Soft shadow.
- Tinted faculty-colored header.
- Header close icon.
- Scrollable body.
- Footer remains accessible.

Header content:

- `CLASS DETAILS`.
- Course-code badge.
- Section badge.
- Course name.
- Faculty and department line.

Body cards:

1. Day.
2. Time.
3. Building.
4. Room.
5. Lecturer.
6. Semester, including academic year when available.

Each card:

- Pale background.
- Rounded corners.
- Leading icon.
- Small uppercase label.
- Dark value.
- Approximately 12 px spacing between cards.

Footer:

- Primary `Edit Schedule`.
- Secondary `Close`.

Fetch authoritative details by schedule ID when supported.

Show loading, retry, and unavailable-record states. Do not retain another schedule's details while a new selection loads.

## 14. Edit Schedule

No separate Edit modal frame was found.

Reuse the Add modal layout:

- Title: `Edit Class Schedule`.
- Primary action: `Save Changes`.
- Prefill the selected schedule's current values.
- Preserve the schedule ID.
- Submit only fields accepted by the update contract.
- Respect read-only section-derived values.
- Apply the same dependency and time validation as Create.
- Keep the form open on validation/conflict errors.
- Refresh details, calendar/list, and conflict results after success.

If the API uses versioning or conditional updates, preserve and submit the required version information.

Handle stale-record responses without silently overwriting another administrator's changes.

## 15. Schedule Conflicts

The Figma design includes a `Schedule Conflicts` tab and sample badge `4`. The detailed contents were not present.

Use the actual backend conflict result/count.

Never hardcode `4`.

Suggested conflict view using existing table components:

- Conflict type.
- Affected schedules.
- Day and overlapping time.
- Room, lecturer, or section involved.
- Explanation.
- View/Edit action.

Only display conflict types supported by the backend.

Potential types to verify:

- Room overlap.
- Lecturer overlap.
- Section/student-group overlap.

Requirements:

- Backend validation remains authoritative.
- A successful optional pre-check does not guarantee a later write will succeed.
- Show conflict errors returned during Create or Update.
- Do not provide a force-save action unless supported and authorized.
- Do not call overlapping events a conflict merely because their times coincide.
- Do not present a client-only check as complete if it sees only filtered or paginated records.

If conflict reporting is unavailable, show an explicit unavailable state rather than `0 conflicts`.

## 16. API and State Architecture

Reuse the established API client and state/query libraries.

Suggested feature structure:

    src/features/timetable/
      api/
        timetableApi.js
      adapters/
        timetableAdapter.js
      hooks/
        useTimetable.js
        useScheduleDetails.js
        useScheduleLookups.js
      components/
        TimetableToolbar.jsx
        TimetableFilters.jsx
        WeeklyCalendar.jsx
        CalendarEvent.jsx
        TimetableList.jsx
        ScheduleFormModal.jsx
        ScheduleDetailsDrawer.jsx
        ScheduleConflicts.jsx
      pages/
        TimetablePage.jsx

Adapt to the repository's existing naming and organization.

Keep separate:

- Backend DTO mapping.
- Calendar layout calculations.
- Form state.
- Server query state.
- Drawer/modal selection state.

Include every relevant filter in query/cache keys.

After mutations, invalidate only affected timetable, details, and conflict queries.

## 17. Authentication and Errors

- Use existing admin authentication.
- Reuse existing token refresh behavior.
- Enforce route and action permissions in the UI.
- Keep server authorization authoritative.
- Do not hardcode an administrator identity or role.

Handle:

| Condition | Behavior |
|---|---|
| Initial loading | Calendar/table skeleton |
| No schedules | Empty state for current filters |
| Lookup failure | Retry beside the affected field |
| Validation error | Map to the corresponding form field |
| Scheduling conflict | Explain conflict and retain form values |
| Unauthorized | Existing authentication flow |
| Forbidden | Permission message |
| Deleted/missing schedule | Close stale editing state and refresh |
| Network/server failure | Retry without fake data |
| Mutation timeout | Explain uncertain result and refresh before retrying |

Never display raw exceptions or log authentication tokens.

## 18. Accessibility and Responsive Behavior

- Keyboard-accessible tabs, events, buttons, and filters.
- Visible focus states.
- Accessible names for icon-only controls.
- Focus trapping and restoration for modal dialogs.
- Escape closes dialogs when no submission is in progress.
- Associate validation messages with inputs.
- Do not rely on faculty color alone.
- Maintain horizontal scrolling for the calendar when required.
- Stack modal fields on narrow screens.
- Keep drawer actions reachable at short viewport heights.

## 19. Verification

Run the existing project's lint, test, and production-build commands.

Add focused tests for:

- API payload/response mapping.
- Day-of-week and time conversion.
- Non-hour event positioning.
- Overlapping event lanes.
- Complete calendar loading across pagination.
- Filter dependencies and stale requests.
- Course-to-section and building-to-room relationships.
- Create/update validation and duplicate-submit prevention.
- Server conflict responses.
- Detail drawer selecting the correct schedule.
- Unsupported academic-year handling.
- Authentication and permission failures.

Manually verify:

- Calendar design against `34:3999`.
- Add modal against `193:973`.
- Details drawer against `193:3056`.
- Create and Edit against real backend test data.
- Calendar/List consistency.
- Filters, empty states, and API errors.
- No fixture records appear in production API mode.

Report only checks actually performed.

## 20. Change and Decision Log

Append to `spec-md/00-changes-decision.md`:

- Date.
- Next sequential decision ID.
- Feature: Admin Timetable.
- Figma node references.
- Verified endpoints and payload mappings.
- Section and semester relationship decisions.
- Academic-year handling.
- Calendar overlap and time semantics.
- Added List, Conflict, and Edit layouts.
- Backend capability gaps.
- Files changed.
- Tests and visual checks performed.

Do not include passwords, tokens, or private records.

## 21. Acceptance Criteria

- [ ] Timetable opens from the existing admin sidebar.
- [ ] Calendar layout matches the inspected Figma design.
- [ ] Production schedules come from verified backend APIs.
- [ ] Filters operate on the correct complete data scope.
- [ ] Calendar and List preserve shared filters.
- [ ] Add Class Schedule matches the inspected modal.
- [ ] Course-section and building-room relationships are valid.
- [ ] Class Details matches the inspected drawer.
- [ ] Editing updates the existing schedule correctly.
- [ ] Conflict results reflect backend capabilities.
- [ ] Unsupported fields are not invented or submitted.
- [ ] Loading, empty, permission, and failure states work.
- [ ] No backend code or database changes are made.
- [ ] Relevant validation passes.
- [ ] `spec-md/00-changes-decision.md` is updated.