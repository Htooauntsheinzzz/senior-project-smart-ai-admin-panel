# Smart Reminders — frontend implementation

## Source and scope

- [Figma reminders screen, node 130:8756](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=130-8756&m=dev).
- Visually inspected through the browser on 2026-10-13.
- Frontend only, existing APIs only, no browser-local persistence.
- Protected route: `/admin/reminders`.
- Sidebar: **Communication → Smart Reminders**.

## Observed design

The screen is a narrow centered settings column within the shared admin shell, on a pale page background.

### Header and explanation

- Heading: **Smart Reminder Rules**.
- Subtitle: **Configure automated notifications for classes, assignments, exams, and events**.
- Compact colored-dot **3 of 4 active** indicator followed by a dark **Save Settings** button.
- Gray **How Smart Reminders work** information panel explaining automatic rules and message-template substitution.

### Rule cards

Four vertically stacked white cards have rounded corners, tinted outlines/icons, title/subtitle, and a right-aligned activation switch in the reference:

| Rule | Reference timing | Reference channel | Reference state | Accent |
| --- | --- | --- | --- | --- |
| Class Reminder | 15 min before | Push + In-App | Active | Blue |
| Assignment Reminder | 24 hours before | Push Notification | Active | Purple |
| Exam Reminder | 3 days before | Push + In-App | Active | Amber |
| University Event Reminder | 1 day before | In-App | Inactive | Gray |

Each card includes **Trigger Timing**, **Notification Channel**, and **Message Template**. Channel choices visible in the design are Push Notification, In-App, Push + In-App, and Email. Timing dropdown options beyond the selected examples are not shown.

Template-variable chips use double braces:

- Class: `course_name`, `timing`, `room`.
- Assignment: `timing`, `assignment_name`, `course_name`.
- Exam: `exam_name`, `timing`, `room`, `time`.
- Event: `event_name`, `timing`, `location`.

The first three cards show **Message Preview** panels containing example rendered mobile notifications. The inactive Event card is muted and has no preview in this frame. Example templates, timing, enabled states and previews are not verified saved settings.

### Footer

A white **Quick Actions** panel describes bulk activation, with outlined **Disable All** and dark **Enable All** buttons. A second **Save Settings** button sits below, aligned right.

## Implementation

| File | Responsibility |
| --- | --- |
| `src/components/communication/RemindersContent.tsx` | Header, explanation, four rule cards, controls, preview placeholders and bulk/save actions |
| `src/pages/communication/RemindersPage.jsx` | Existing admin layout, session and logout integration |
| `src/data/navigation.ts` | Connect Smart Reminders sidebar item |
| `src/routes/AppRoutes.jsx` | Register protected route |
| `src/components/navigation/TopNav.tsx` | Communication context and current-page link |

Reuses existing typography, palette and controls. Content is capped at 760px and centered. Timing/channel fields form two columns on wider screens and stack on narrow screens; headings, variable chips and actions wrap. Native labels/fieldsets identify settings, decorative icons are hidden from assistive technology, and the API explanation is exposed as a status message.

## API boundary and current behavior

Read-only backend source search found no reminder API. The frontend therefore shows **Reminder settings unavailable** and disables all settings and save/bulk actions.

- The active-rule count is unknown, rather than copying 3 of 4 from the reference.
- Activation switches are replaced with **Status unavailable** labels; an unchecked switch would incorrectly imply a known inactive state.
- Timing and templates are unavailable; channel choices have no selected state.
- Template-variable chips document the design vocabulary, not a verified server template engine.
- Preview placeholders replace fictional student/course data.
- Help copy describes the intended concept without claiming that automatic jobs currently run or that saving takes immediate effect.
- No API endpoints, scheduler, email/push delivery, browser persistence, or success feedback are simulated.

Real editing and automation require a compatible existing contract for rule IDs, activation, trigger offsets/units, channels, template validation, variable substitution, preview data and saving. The frontend does not modify backend source, database, authentication or permissions.

This implements the design-based layout with unavailable settings, not functioning reminder automation or exact parity with the populated reference.

## Verification and deployment

- Lint, TypeScript and all 32 existing frontend tests passed.
- Docker production build passed with the existing large-bundle advisory.
- Tracked integration-file whitespace checks passed.
- Rebuilt/recreated Docker `admin-web`; `/admin/reminders` returned HTTP 200 on localhost:3000 and the served `/assets/index-CvFLIwK7.js` bundle includes the reminder screen.
- Authenticated visual and keyboard verification remains pending normal sign-in.
