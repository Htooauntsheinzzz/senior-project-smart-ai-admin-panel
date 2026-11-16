# 41 - AI Assistant: API implementation

Screen: sidebar **AI Management › AI Assistant**, route `/admin/ai-assistant`, component `src/components/ai/AiAssistantContent.tsx`.

## 1. Objective

Replace the "API unavailable" placeholder with a working chat. An administrator asks the assistant a question and sees the answer a student would get from the knowledge base, with the documents the answer came from. This is a test chat: the student side is not changed.

## 2. Backend API

`POST /api/v1/admin/assistant/chat`

Request:

```json
{
  "message": "What is the late registration fee?",
  "history": [
    { "role": "USER", "content": "Hello" },
    { "role": "ASSISTANT", "content": "Hello, how can I help?" }
  ]
}
```

- `message`: required, 1 to 4000 characters after trimming.
- `history`: optional, at most 20 turns, `role` is `USER` or `ASSISTANT`, `content` at most 8000 characters. Unknown fields are rejected (400).

Response (200):

```json
{
  "message": "The late registration fee is 500 baht ...",
  "requestId": "b7c1e0c2-...",
  "model": "gemini-2.5-flash",
  "createdAt": "2026-11-13T03:00:00Z",
  "grounded": true,
  "retrievalMs": 182,
  "generationMs": 2140,
  "passages": [
    { "rank": 1, "score": 0.86, "documentId": 7, "title": "Student Handbook", "category": "Regulations",
      "academicYear": "2026-2027", "sectionTitle": "Registration fees", "unitType": "PAGE", "pageStart": 12, "pageEnd": 13,
      "content": "A student who registers after ..." }
  ]
}
```

Answer text: `message` is plain text written like a chat reply. The backend removes Markdown and tells the model not to cite documents in the text; the sources are in `passages`. Render it as plain text.

How the backend answers: it searches the knowledge documents whose AI Status is Ready (the same search as `POST /knowledge/search`), puts the best passages into the prompt and calls the model once. The model has no tools, so it cannot read student records. Nothing is stored: there is no admin conversation on the server.

Errors: `VALIDATION_ERROR` (400), `AI_ASSISTANT_UNAVAILABLE` (503), `AI_REQUEST_TIMEOUT` (504), `AI_PROVIDER_RATE_LIMITED` (429), `INVALID_AI_PROVIDER_RESPONSE` (502), `KNOWLEDGE_SEARCH_NOT_CONFIGURED` / `KNOWLEDGE_SEARCH_UNAVAILABLE` (503), 401, 403.

## 3. Service

`sendAssistantMessage(message, turns, signal)` in `src/services/aiAssistantService.ts`:

- Sends the trimmed message.
- `historyTurns(turns)` builds `history`: the newest 20 turns, each cut to 8000 characters, never starting with an assistant turn. An empty history is not sent.
- Returns `AssistantAnswer` (`mapAnswer`).

## 4. Screen behaviour

- Header: title, description and a **New Chat** button (clears the conversation, cancels a running request, focuses the composer).
- Notice card: answers come from Ready documents; the chat is not saved and does not appear in Chat History; student records are not available here.
- Conversation panel (`role="log"`): the administrator's messages on the right, the assistant's on the left, each with the time. While waiting, a status bubble says the knowledge base is searched. The panel scrolls to the newest message.
- Under an answer: one chip per source document (`sourceDocuments(passages)`, title and academic year). When no passage matched: "No knowledge document matched this message."
- Composer: textarea with a `0 / 4000` counter. Enter sends, Shift + Enter adds a line. **Send Message** is disabled while the draft is empty, too long or a request runs. **Clear Draft** empties the textarea only.
- Failure: the question is taken out of the conversation and put back into the composer, and an alert with the mapped error is shown above the composer.
- Side card "AI Management Tools": links to AI Knowledge Base, Test AI Knowledge and Chat History.
- The conversation lives in component state only. Leaving or reloading the screen clears it.

## 5. Acceptance checks

1. Ask a question that a Ready document answers: the answer appears with at least one source chip.
2. Ask a follow-up ("and the deadline?"): the request carries the two earlier turns in `history`.
3. Ask "Hello" with no matching document: an answer appears with the "no knowledge document matched" line.
4. Stop the backend AI key: the alert explains that the AI model is not available and the question is back in the composer.
5. New Chat clears the messages; reloading the page clears them too; nothing appears in Chat History.

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
