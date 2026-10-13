# Audit Logs — frontend implementation

## Source and scope

- [Figma audit logs screen, node 130:11323](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=130-11323&m=dev).
- Visually inspected in the browser on 2026-10-13.
- Frontend only, existing APIs only, no browser-local persistence.
- Protected route: `/admin/audit-logs`.
- Sidebar: **Settings → Audit Logs**.

## Observed design

### Header and summary

- **Audit Logs** heading with reference subtitle **Immutable record of all admin actions in the SMART AI Admin Portal**.
- Green outlined **Read-Only** badge and outlined **Export Logs** action at the right.
- Four white rounded summary cards with tinted icon tiles: **Total Logs** (20, neutral), **Today's Events** (12, purple), **Successful** (18, green), **Failed / Partial** (2, red).
- These counts are design examples, not verified production totals.

### Filters

Wide **Search by record or admin name…** field, followed by **Admin User**, **Module**, **Action**, and two date-range controls separated by a dash. Below: **20 logs found** at the left and a green-dot **Logs cannot be edited or deleted** note at the right.

### Table

Rounded white panel with pale uppercase headings: **#**, **Timestamp**, **Admin**, **Module**, **Action**, **Record**, **Result**, plus an unlabeled final Details column.

- Compact log IDs and split date/time timestamps.
- Colored administrator initials, name and smaller role label.
- Module labels/icons and colored action badges such as Update, Create, Upload, Publish, Delete and Send.
- Wrapped record descriptions and green Success badges in the visible rows.
- Eye-icon **Details** actions.
- Footer: **Showing 1–10 of 20**, with previous/numbered/next controls at the right.

No expanded filters, detail panel or export dialog is shown; their contracts and behavior are not inferred from the frame.

## Implementation files

| File | Responsibility |
| --- | --- |
| `src/components/settings/AuditLogsContent.tsx` | Header, summaries, filters, read-only table, unavailable state and pagination layout |
| `src/pages/settings/AuditLogsPage.jsx` | Existing admin layout, session and logout integration |
| `src/data/navigation.ts` | Audit Logs sidebar destination |
| `src/routes/AppRoutes.jsx` | Protected route registration |
| `src/components/navigation/TopNav.tsx` | Settings context and current-page link |

Reuses existing fonts, colors, rounded controls and spacing. Summary cards collapse to two/one columns; filters and date controls wrap. The table scrolls within a keyboard-focusable region with semantic headers and caption. The visually unlabeled Details heading has a screen-reader label. Unavailable explanations remain outside the wide table for mobile readability.

## Existing API boundary

Read-only backend inspection found `AdminAccountManagementServiceImpl.audit`, but it only sets `updatedBy` and `updatedAt` on the current account. It does not provide an audit-event history, historical result, export, or log-detail API. Current entity metadata cannot reconstruct complete administrator history.

- Unknown summary counts use **—**; the page displays **Audit log data unavailable** rather than claiming there are zero events.
- Search, filters, pagination and Export Logs are disabled with an explanation.
- No sample identities, security events, results or historical records are fabricated.
- No speculative endpoints, browser-local event collection, downloads or fake export success.
- Read-Only describes this UI: it has no editing or deletion controls. The subtitle and helper text are adjusted so they do not claim server-enforced immutability or complete coverage without a verified API.

Actual history, details and export require a compatible API with verified actor/module/action/result fields, timestamp timezone, pagination, date-range semantics, export format and access control. No backend source, database, authentication or permission changes are introduced.

This delivers the design-based layout and unavailable-data state, not a working audit-history service or exact populated-table parity.

## Verification and deployment

- Lint, TypeScript and all 32 existing frontend tests passed.
- Docker production build passed with the existing large-bundle advisory.
- Tracked integration-file whitespace checks passed.
- Rebuilt/recreated Docker `admin-web`; `/admin/audit-logs` returned HTTP 200 on localhost:3000. The served `/assets/index-Bm_JyWbr.js` bundle includes the Audit Logs screen.
- Authenticated visual and keyboard verification remains pending normal sign-in.
