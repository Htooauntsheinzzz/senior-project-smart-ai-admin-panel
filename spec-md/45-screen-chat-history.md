# Chat History — screen implementation

## Scope and design basis

Implemented on 2026-10-27, frontend only. No screen-specific Figma frame was supplied. The layout follows existing admin styles and is an implementation choice, not inspected Figma parity.

- Protected route: `/admin/chat-history`.
- Sidebar: **AI Management → Chat History**.
- Top navigation: AI Management with Bot icon and current-page link.
- API investigation: [46-api-implementation-chat-history.md](46-api-implementation-chat-history.md).

## Layout

1. Chat History heading and description.
2. Working Open AI Assistant link and disabled Export History button.
3. Explicit API-unavailable explanation.
4. Disabled search and From/To date controls with native labels.
5. Conversations panel: Conversation, Participant, Messages and Last Activity columns; unknown count and unavailable-data message.
6. Message Transcript panel with an unavailable state.
7. Explanation that unsent AI Assistant drafts are not stored history.

Conversation list and transcript appear side by side on wide screens and stack at smaller widths. Header actions/filters wrap. Wide table scrolling is contained in a keyboard-focusable region; the availability explanation remains outside the wide table. Uses existing fonts, colors, white cards, rounded borders and focus styles.

## Behavior and accessibility

- Open AI Assistant navigates to `/admin/ai-assistant`; it does not create a thread.
- No history is fetched, simulated or stored locally.
- Search, date filtering and export are disabled and reference the availability notice.
- No fake participants, messages, citations, timestamps, zero totals or record-selection actions.
- Table caption/headers, native input labels, section headings and a status message provide accessible structure. Decorative icons are hidden from assistive technology.
- Existing authentication and logout conventions are retained.

Column labels and date controls express an intended UI, not verified DTO fields, participant scope or filtering semantics. A compatible API is needed before enabling list selection, transcript loading and pagination.

## Files

| File | Responsibility |
| --- | --- |
| `src/components/ai/ChatHistoryContent.tsx` | History/transcript layout and unavailable states |
| `src/pages/ai/ChatHistoryPage.jsx` | Existing admin shell/session/logout integration |
| `src/data/navigation.ts` | Sidebar destination |
| `src/routes/AppRoutes.jsx` | Protected route |
| `src/components/navigation/TopNav.tsx` | AI Management context |

## Verification

- Lint, TypeScript and all 44 existing frontend tests passed.
- Docker production build passed with the existing large-bundle advisory.
- Rebuilt/recreated only `admin-web`; `/admin/chat-history` returned HTTP 200 and the served `/assets/index-DvDuF_xK.js` bundle includes the screen.
- Authenticated visual/keyboard checks remain pending normal sign-in. A Figma comparison requires the intended frame.
