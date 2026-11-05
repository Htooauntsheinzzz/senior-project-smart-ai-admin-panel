# Announcements — frontend implementation

## Source and scope

- [Figma announcements screen, node 130:7141](https://www.figma.com/design/FQhq9uVri66RJpADxECMtm/Smart-Ai-Admin-Web?node-id=130-7141&m=dev).
- Visually inspected through the browser on 2026-10-12.
- Frontend only, existing APIs only. No backend source, database, migrations, API contracts, authentication or permission changes. No browser-local record persistence.
- Protected route: `/admin/announcements`.
- Navigation: **Communication → Announcements**.

## Observed design

### Header

- **Announcements**
- **Manage and publish announcements to students, faculty, and departments**
- Dark **+ Create Announcement** button aligned right.
- Pale page background; the header is within the page rather than a separate white band.

### Summary cards

Five white rounded cards, each containing a compact tinted number tile and a label:

| Label | Reference value | Number-tile treatment |
| --- | --- | --- |
| Total | 12 | Neutral |
| Published | 3 | Green |
| Scheduled | 4 | Blue |
| Draft | 2 | Gray |
| Emergency | 1 | Red |

The figures are design examples, not verified backend counts.

### Filters and table

- Search placeholder **Search announcements…** followed by **Category**, **Status**, **Target Audience**, and a final unlabeled date-style control. The implementation assigns that control an accessible date-filter label; its exact date semantics need API/design clarification before integration.
- Rounded white table with uppercase headings: **Title**, **Category**, **Target Audience**, **Publish Date**, **Expiry Date**, **Priority**, **Status**, **Actions**.
- Titles are bold and some have a small leading indicator; the frame alone does not establish its behavior.
- Categories use colored badges. Visible categories: Registration, Scholarship, Event, Academic, General, Emergency.
- Visible audiences include All Students and Faculty.
- Dates have smaller time text below. High/Medium/Low priority and Published/Scheduled/Expired statuses use colored badges. Draft is also present in the summary.
- Row actions use compact vertical ellipses; no expanded menu or creation form is shown.
- Footer is inside the table card, with **Showing 1–8 of 12** on the left and previous/numbered/next controls on the right.

Dropdowns are not expanded in the source; implemented option labels come from visible examples and do not define a verified API enumeration.

## Frontend files

| File | Responsibility |
| --- | --- |
| `src/pages/communication/AnnouncementsPage.jsx` | Existing admin shell, session and logout integration |
| `src/components/communication/AnnouncementsContent.tsx` | Header, five summaries, filters, table and unavailable-data state |
| `src/data/navigation.ts` | Connect existing Announcements item |
| `src/routes/AppRoutes.jsx` | Register protected route |
| `src/components/navigation/TopNav.tsx` | Communication label/icon and current-page link |

Uses existing typography, colors and spacing. Cards wrap from five to two/one columns; filters wrap; the table has contained keyboard-focusable horizontal scrolling. Accessible labels, caption, headers and a status message are included. The data explanation sits outside the wide table so it remains readable on mobile.

## Existing API limitation

Read-only backend search found no announcement API. Existing dashboard announcement fixtures are sample UI data, not persisted announcement records, and are not reused as a production source.

- Summary values remain **—** and the list displays **Announcement data unavailable**.
- Search, filters, Create Announcement and pagination are disabled with an explanation.
- No fabricated announcement rows, publishing/scheduling behavior, speculative endpoints, browser-local storage, or false save/delete success actions.
- Actual records, publishing workflows, scheduling and row actions require a compatible existing API.

This implements the design-based layout and unavailable-data state, not announcement CRUD or exact parity with the populated Figma table. No backend setup or migration is required.

## Verification and deployment

- Lint, TypeScript and all 32 existing frontend tests passed.
- Docker production build and tracked integration-file whitespace checks passed.
- Rebuilt/recreated Docker `admin-web`; `/admin/announcements` returned HTTP 200 on localhost:3000. The served bundle includes the Announcements screen.
- Authenticated visual/keyboard verification remains pending sign-in.
