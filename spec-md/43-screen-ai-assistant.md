# AI Assistant — screen implementation

## Scope and design basis

Implemented on 2026-10-27, frontend only. No screen-specific Figma frame was supplied. The layout follows the existing admin portal's typography, colors and controls; it is an implementation choice rather than inspected Figma parity.

- Protected route: `/admin/ai-assistant`.
- Sidebar: **AI Management → AI Assistant**.
- Top navigation: **AI Management**, Bot icon and current-page link.
- API status: [44-api-implementation-ai-assistant.md](44-api-implementation-ai-assistant.md).

## Layout

1. AI Assistant heading, university-question description and API unavailable badge.
2. Availability notice explaining that the backend has no assistant/chat endpoint.
3. Conversation panel with a clearly labeled unavailable state, not a fake transcript.
4. Labeled message composer with draft-only explanation, Clear Draft and Send Message buttons.
5. Related tools panel linking to AI Knowledge Base and Test AI Knowledge, with their API limitations explained.

The conversation and tools panel are side by side at wide widths and stack on smaller screens. Header/actions wrap and the editor resizes vertically. Uses pale page background, white rounded cards, subtle borders and the shared admin shell.

## Behavior

- Message editing works in transient React state.
- Clear Draft empties the editor and returns focus; disabled when empty.
- Enter inserts a newline. There is no submit shortcut or request handler.
- Send Message remains disabled and references the availability notice.
- Drafts are not submitted, stored or added to a transcript; route departure/reload clears them.
- Related-tool links navigate to existing protected screens.
- No fake assistant replies, typing indicators, sources, model labels, conversation history, token metrics or success messages.

Native labels, descriptive text, semantic sections, a status message and visible focus styles support accessibility. Decorative icons are hidden from assistive technology. Existing authentication/logout conventions are retained.

## Files

| File | Responsibility |
| --- | --- |
| `src/components/ai/AiAssistantContent.tsx` | Composer, unavailable conversation and related links |
| `src/pages/ai/AiAssistantPage.jsx` | Admin layout/session/logout integration |
| `src/data/navigation.ts` | Sidebar destination |
| `src/routes/AppRoutes.jsx` | Protected route |
| `src/components/navigation/TopNav.tsx` | AI Management context |

## Verification

- Lint, TypeScript and all 44 existing frontend tests passed.
- Docker production build passed with the existing large-bundle advisory.
- Rebuilt/recreated only `admin-web`; `/admin/ai-assistant` returned HTTP 200 and the served `/assets/index-xvuzOx7X.js` bundle includes the screen.
- Authenticated visual/keyboard checks remain pending normal sign-in. A Figma comparison requires the intended frame.
