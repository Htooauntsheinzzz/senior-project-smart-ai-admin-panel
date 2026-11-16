# 42 - Test AI Knowledge: API implementation

Screen: sidebar **AI Management › Test AI Knowledge**, route `/admin/test-ai-knowledge`, component `src/components/ai/TestKnowledgeContent.tsx`.

## 1. Objective

Replace the placeholder with a working knowledge test: one question in, the answer and the exact document passages behind it out. The administrator uses it after uploading a document to check that the knowledge base covers a topic.

## 2. Backend API

`POST /api/v1/admin/assistant/knowledge-test`

Request: `{ "question": "What is the late registration fee?" }`

- `question`: required, 1 to 500 characters after trimming.
- Optional `topK` (1 to 10) and `minScore` (0 to 1) exist on the backend. The screen does not send them, so the backend defaults apply (the same as for students).

Response (200): the same shape as the admin chat (spec 41, section 2).

- With passages: `grounded` is `true`, `model` and `generationMs` are set.
- Without a passage: the model is **not** called. `message` is a fixed text that says nothing matched, `grounded` is `false`, `model` is `null`, `generationMs` is `0`, `passages` is empty.

The difference to the chat: no history, and no answer from general knowledge when nothing matched.

Errors: as in spec 41.

## 3. Service

- `runKnowledgeTest(question, signal)` sends the trimmed question and returns `AssistantAnswer`.
- Download of a source document reuses the knowledge service: `getKnowledgeDocument(documentId)` then `downloadKnowledgeDocument(document)`.

## 4. Screen behaviour

- Header with a link to AI Knowledge Base. Notice card "How the test works".
- **Test Question** panel: textarea with a `0 / 500` counter, **Run Test** (disabled while empty, too long or running) and **Clear Question** (clears question, result and errors, cancels a running test).
- **AI Answer** panel: empty state before the first test, a status line while running, then the tested question, the answer text and a facts row:
  - badge "Answered from N passages" (green) or "No matching passage" (amber),
  - model name, search time and answer time (`formatDuration`). Model and answer time are hidden when no model was called.
- **Supporting Sources** panel: one entry per passage in rank order with `No.`, document title, category · academic year · section · position (`passageLocation`: "Page 12", "Pages 12–13", "Sheet 2", "Part 1"), a match badge (`scorePercent`, for example "86% match"), the passage text in a scrollable quote, and **Download document**.
- When nothing matched, the panel explains what to check in AI Knowledge Base (uploaded, active, Ready).
- A failed test clears the old result and shows the mapped error in the question panel. A failed download shows its own alert in the sources panel.
- Nothing is stored. Each test is independent.

## 5. Acceptance checks

1. A question a Ready document answers: answer, "Answered from N passages", and the passages with their match percentages.
2. A question no document covers: the fixed "no passage" answer, the amber badge, no model name.
3. A 501-character question cannot be sent; the counter turns red.
4. Download document saves the original file; for a deleted document an alert appears.
5. Archive the document in AI Knowledge Base and run the same test again: its passages are gone.

## Shared rules (specs 41 to 44)

- Frontend base path: `apiClient` already points at `/api/v1/admin`; the service uses paths that start with `/assistant/`.
- Backend contract: `backend/seniorproject/spec-md/59-admin-ai-management-api.md`. Roles: `SUPER_ADMIN`, `ADMIN`, `ACADEMIC_ADMIN`.
- Files shared by the four screens: `src/types/aiAssistant.ts` (shapes), `src/utils/aiAssistant.ts` (limits, labels, query parameters, error copy), `src/services/aiAssistantService.ts` (requests, response checks and mapping) and `src/components/ai/AssistantUi.tsx` (page header, notice card, message bubble, source chips, rating and review badges).
- Every response is checked in the service. A response with an unexpected shape is an error, never rendered.
- IDs are kept as strings in the frontend.
- Text from the model, from students and from documents is rendered as plain text (`whitespace-pre-wrap`), never as HTML.
- Errors: `assistantError()` maps the backend `code` to fixed copy. A server `message` is never shown as it is.
- Project conventions: a `No.` serial column instead of database IDs, 10 rows per page (`TABLE_PAGE_SIZE`, `ui/TablePagination`), a green `SuccessToast` for a completed action, no inline status text under tables.
- The layout of each screen stays the one that was already in the project (header, cards, filter row, panels). Only the placeholders and the "API unavailable" notices are replaced.
- Do not change the backend or the student app from these specs.
