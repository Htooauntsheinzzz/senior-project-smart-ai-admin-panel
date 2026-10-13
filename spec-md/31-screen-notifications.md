# Notifications — frontend implementation

## Source and scope

- [Figma notifications screen, node 130:7893](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=130-7893&m=dev).
- Visually inspected in the browser on 2026-10-13.
- Frontend only, existing APIs only; no browser-local record persistence.
- Protected route: `/admin/notifications`.
- Sidebar: **Communication → Notifications**.

## Observed design

### Header and summaries

Heading **Notifications**, subtitle **Send and track push notifications to students and faculty**, and dark **+ Send Notification** action aligned right. Content sits on the existing pale background within the shared admin shell.

Four equal white rounded summary cards combine a tinted icon tile, bold number, label and small description:

| Label | Reference value | Description | Icon treatment |
| --- | --- | --- | --- |
| Sent Today | 2 | notifications | Neutral send icon |
| Scheduled | 2 | pending delivery | Blue clock |
| Delivered | 29,524 | messages received | Green success icon |
| Failed | 3,654 | delivery errors | Red failure icon |

These are sample design values, not verified production metrics.

### Filters

Wide **Search notifications…** field, followed by **Type**, **Target Audience**, **Status**, and a final unlabeled control. The implementation uses a date input for the final control, consistent with the adjacent Announcements screen. This is an interpretation; exact date semantics require clarification before API integration. Dropdowns are not expanded in the frame, so the implementation retains their placeholder labels without inventing supported API enumerations.

### Notification table

Rounded white panel with pale uppercase heading row and seven columns:

1. Notification Title
2. Type
3. Audience
4. Scheduled Time
5. Sent Time
6. Delivery Status
7. Actions

Reference rows use bold titles with truncated preview text beneath, colored type badges (Reminder, Academic, Emergency, Announcement, System), audience labels such as All Students, Major and Faculty, date/time pairs, and vertical-ellipsis actions. Delivery cells combine Delivered/Scheduled badges, percentages, recipient counts, and progress bars. Scheduled records can have no sent timestamp. The frame does not show expanded action menus or a send form.

The footer shows **Showing 1–8 of 14**, with previous/numbered/next pagination on the right. These records and counts are design examples.

## Implementation files

| File | Responsibility |
| --- | --- |
| `src/components/communication/NotificationsContent.tsx` | Header, summaries, filter controls, table, pagination layout and unavailable-data message |
| `src/pages/communication/NotificationsPage.jsx` | Existing admin layout, session and logout integration |
| `src/data/navigation.ts` | Notifications sidebar destination |
| `src/routes/AppRoutes.jsx` | Protected route registration |
| `src/components/navigation/TopNav.tsx` | Communication context label/icon and current-page link |

Uses existing fonts, colors, border radii and spacing. Summary cards collapse from four to two/one columns; filter controls wrap; table scrolling is contained in a keyboard-focusable region. Accessible labels, semantic table headers/caption and a status message are provided. The unavailable-data message remains outside wide table content so mobile users can read it without horizontal scrolling.

## Data availability and behavior

Read-only search of the existing backend source found no notification API. The existing top-navigation demo popup is not a production notification source.

- Summary values are **—**, representing unknown totals.
- The table presents **Notification data unavailable**, not a claim that no notifications exist.
- Send Notification, search, filters and pagination are disabled and reference the explanation.
- No sample recipients, delivery percentages, progress bars or false sending/scheduling results are presented as real data.
- Actual sending, scheduling, delivery tracking, filtering and record actions require a compatible existing API, including verified audience identifiers, timezone semantics, delivery states and pagination contracts.

This delivers the Figma-based layout with an unavailable-data state. It does not provide notification CRUD or populated-table visual parity. No backend source, database, authentication or permission changes are required.

## Verification and deployment

- Lint, TypeScript and all 32 existing frontend tests passed.
- Docker production build passed with the existing large-bundle advisory.
- Tracked integration-file whitespace checks passed.
- Rebuilt/recreated Docker `admin-web`. `/admin/notifications` returned HTTP 200 on localhost:3000; the served `/assets/index-BN_eyQB3.js` bundle includes the Notifications screen.
- Authenticated visual and keyboard verification remains pending normal sign-in.
