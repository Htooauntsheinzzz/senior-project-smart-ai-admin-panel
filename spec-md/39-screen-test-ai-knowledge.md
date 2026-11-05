# Test AI Knowledge — screen implementation

## Scope and design basis

Implemented on 2026-10-27, frontend only. No screen-specific Figma frame was supplied with this request. The layout is an implementation choice consistent with the existing admin portal; it is not a claim of inspected Figma parity.

- Route: `/admin/test-ai-knowledge` within the existing protected admin routes.
- Sidebar: **AI Management → Test AI Knowledge**.
- Top navigation context: **AI Management**, with the existing Bot icon.
- API investigation: [40-api-implementation-test-ai-knowledge.md](40-api-implementation-test-ai-knowledge.md).

## Screen structure

1. **Test AI Knowledge** heading and short description, with an **API unavailable** badge.
2. Information panel explaining that the backend has no compatible knowledge-testing endpoint.
3. **Test Question** card: labeled multiline editor, draft-only explanation, Clear Question and Run Test controls.
4. **AI Answer** card: explicit unavailable state, stating that no test has run.
5. **Supporting Sources** card: explanation that documents, excerpts and citations require server data.

On wide screens the question editor and results occupy two columns. On smaller screens they stack. Uses existing fonts, pale background, white cards, borders, rounded controls and dark primary-action styling.

## Behavior

- Question editing works through transient React state.
- Clear Question empties the editor and restores keyboard focus; disabled when empty.
- No draft is saved to local/session storage or submitted. Leaving/reloading the screen clears it.
- Run Test is disabled and references the API explanation.
- No sample answers, fabricated citations, confidence scores, timings, retrieval counts or fake test history.
- No speculative model/category selectors or generated-document links.
- Existing authentication and logout conventions are retained.

The question has a native label and associated explanatory text; headings identify sections; decorative icons are hidden from assistive technology; the availability message is a status region. Buttons retain visible focus styling.

## Files

| File | Responsibility |
| --- | --- |
| `src/components/ai/TestKnowledgeContent.tsx` | Question draft, unavailable answer/source areas, accessibility and responsive layout |
| `src/pages/ai/TestKnowledgePage.jsx` | Existing admin shell/session/logout integration |
| `src/data/navigation.ts` | Sidebar destination |
| `src/routes/AppRoutes.jsx` | Protected route |
| `src/components/navigation/TopNav.tsx` | AI Management context |

## Verification

- Lint, TypeScript and all 44 existing tests passed.
- Docker production build passed with the existing large-bundle advisory.
- Rebuilt/recreated only `admin-web`; `/admin/test-ai-knowledge` returned HTTP 200 and the served `/assets/index-CSWBXAT-.js` bundle contains the screen.
- Authenticated visual/keyboard testing remains pending normal sign-in. A Figma-specific visual comparison requires the intended frame.
