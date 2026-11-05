# AI Knowledge Base — screen implementation

## Scope and design basis

Implemented on 2026-10-27, frontend only. No screen-specific Figma frame was supplied in this request. This layout follows the existing admin portal's document-directory patterns and is an implementation choice, not inspected Figma parity.

- Protected route: `/admin/ai-knowledge-base`.
- Sidebar: **AI Management → AI Knowledge Base**.
- Top navigation: **AI Management**, Bot icon, current-page link.
- API status: [42-api-implementation-ai-knowledge-base.md](42-api-implementation-ai-knowledge-base.md).

## Screen layout

1. **AI Knowledge Base** heading and description.
2. Working **Test AI Knowledge** link and disabled **Upload Document** action.
3. Four white summary cards with tinted icons: **Total Documents**, **Indexed**, **Processing**, **Failed**. All values display **—** (unknown).
4. Explicit API-availability explanation.
5. Disabled document search, category, file-type and indexing-status controls.
6. **Knowledge Documents** table with Document Name, Category, File Type, Size, Indexing Status, Last Updated and Actions headings.
7. **Knowledge documents unavailable** state explaining that no list has been loaded.

Labels and columns express the intended document-management UI; they are not verified backend DTO fields or status enumerations. No specific file types, upload limits or category options are asserted.

## Behavior and accessibility

- Test AI Knowledge navigates to the existing `/admin/test-ai-knowledge` screen. Nearby copy explains that running AI tests also requires an API.
- Upload, search and filters are disabled and reference the availability message.
- No document rows, fake counts, upload progress, download links or indexing jobs are generated.
- No browser storage or local document persistence.
- Existing authentication/logout behavior is retained.
- Native labels, table caption/headers, a status message and visible keyboard focus are included.
- Summary cards collapse from four to two/one columns; filters and header actions wrap. Wide table scrolling is contained in a focusable region. The unavailable-data message remains outside the wide table for mobile readability.

## Files

| File | Responsibility |
| --- | --- |
| `src/components/ai/KnowledgeBaseContent.tsx` | Document-directory layout and unavailable states |
| `src/pages/ai/KnowledgeBasePage.jsx` | Admin shell, session and logout conventions |
| `src/data/navigation.ts` | Sidebar destination |
| `src/routes/AppRoutes.jsx` | Protected route |
| `src/components/navigation/TopNav.tsx` | AI Management context |

## Verification

- Lint, TypeScript and all 44 existing frontend tests passed.
- Docker production build passed with the existing large-bundle advisory.
- Rebuilt/recreated only `admin-web`; `/admin/ai-knowledge-base` returned HTTP 200 and the served `/assets/index-BVmuYCgi.js` bundle includes the screen.
- Authenticated visual/keyboard verification remains pending normal sign-in. A Figma comparison requires the intended frame.
