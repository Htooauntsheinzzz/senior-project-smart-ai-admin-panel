# AI Feedback — screen implementation

## Scope and design basis

Implemented on 2026-10-27, frontend only. No screen-specific Figma frame was supplied. The layout follows the existing portal's summary/filter/table patterns; it is an implementation choice, not inspected Figma parity.

- Protected route: `/admin/ai-feedback`.
- Sidebar: **AI Management → AI Feedback**.
- Top navigation: AI Management with Bot icon and current-page link.
- API status: [48-api-implementation-ai-feedback.md](48-api-implementation-ai-feedback.md).

## Layout

1. AI Feedback heading and description.
2. Working Chat History link and disabled Export Feedback action.
3. Four summary cards: Total Feedback, Positive, Negative, Awaiting Review. Values are unknown (**—**).
4. Explicit API-unavailable explanation.
5. Disabled search, rating, review-status and From/To date controls.
6. Feedback Reviews table: Submitted By, Question / Response, Rating, Comment, Submitted At, Review Status, Actions.
7. Unavailable-data state explaining that no feedback records have been loaded.

These labels represent the intended review interface, not confirmed backend fields or enumerations. Positive/negative ratings and review workflow must be reconciled with a real API contract before enabling them.

## Behavior and accessibility

- Chat History navigates to `/admin/chat-history`; nearby copy explains that its data also requires an API.
- No sample people, ratings, comments, answer excerpts, timestamps or review states.
- Search/filter/export controls are disabled and reference the availability notice.
- No record-specific review, deletion or detail actions appear without real records.
- No simulated feedback submission, local storage or fake success messages.
- Uses native labels, semantic table headers/caption, a status message, section headings and visible focus styles. Decorative icons are hidden from assistive technology.
- Cards collapse from four to two/one columns; filters and actions wrap. The wide table has contained keyboard-focusable scrolling. The unavailable-data explanation stays outside wide table content for mobile readability.
- Existing session, protected-route and logout conventions are retained.

## Files

| File | Responsibility |
| --- | --- |
| `src/components/ai/AiFeedbackContent.tsx` | Feedback summaries, controls, directory and unavailable state |
| `src/pages/ai/AiFeedbackPage.jsx` | Admin shell/session/logout integration |
| `src/data/navigation.ts` | Sidebar destination |
| `src/routes/AppRoutes.jsx` | Protected route |
| `src/components/navigation/TopNav.tsx` | AI Management context |

## Verification

- Lint, TypeScript and all 44 existing frontend tests passed.
- Docker production build passed with the existing large-bundle advisory.
- Rebuilt/recreated only `admin-web`; `/admin/ai-feedback` returned HTTP 200 and the served `/assets/index-C4Td3wGq.js` bundle includes the screen.
- Authenticated visual/keyboard testing remains pending normal sign-in. A Figma comparison requires the intended frame.
