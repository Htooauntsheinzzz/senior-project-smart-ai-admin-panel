# 43 - Chat History: API implementation

Screen: sidebar **AI Management › Chat History**, route `/admin/chat-history`, component `src/components/ai/ChatHistoryContent.tsx`.

## 1. Objective

Replace the placeholder with the real conversations students had with the AI Student Assistant: a searchable, paged list, the message transcript of one conversation and a CSV export. Read-only.

## 2. Backend APIs

| Use | Request |
|---|---|
| List | `GET /api/v1/admin/assistant/conversations?page=0&size=10&search=&from=&to=` |
| Transcript | `GET /api/v1/admin/assistant/conversations/{conversationId}?limit=50&beforeMessageId=` |
| Export | `GET /api/v1/admin/assistant/conversations/export?search=&from=&to=` (CSV, at most 5000 rows) |

List:

- Newest activity first. `page` is 0-based, `size` 1 to 50.
- `search` (at most 100 characters) matches the title, the student code, the student name and message text, case-insensitive.
- `from` (inclusive) and `to` (exclusive) are ISO instants and filter on the last activity.
- Row: `conversationId`, `title`, `lastMessagePreview`, `messageCount`, `createdAt`, `updatedAt`, `student { id, studentCode, fullName }`. Page fields: `content`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last`.

Transcript:

- The newest `limit` messages, oldest first; `hasMoreBefore` tells whether older ones exist. `beforeMessageId` loads the window before that message.
- Message: `messageId`, `role` (`USER` or `ASSISTANT`), `content`, `createdAt`, `model`, `sources [{ title, academicYear, category }]`, `feedback { id, rating, comment, reviewStatus }` or `null`.

Errors: `VALIDATION_ERROR` (400), `INVALID_CONVERSATION_ID` (400), `CONVERSATION_NOT_FOUND` (404), 401, 403.

Only student conversations exist. Admin chats (spec 41) and knowledge tests (spec 42) are not stored. A conversation the student deletes disappears from this list.

## 3. Service and helpers

- `getConversations(filters, page, size, signal)`, `getConversation(conversationId, beforeMessageId?, signal)`, `exportConversations(filters)`.
- `historyParams(filters, page?, size?)`: the screen's 1-based page becomes 0-based; an empty search or date is not sent.
- `dateRangeParams(from, to)`: the date inputs are local days. `from` is sent as that day's local midnight, `to` as the start of the **next** local day, so the whole To day is included.
- `dateRangeError(from, to)`: "From date must not be after To date." A range with an error is not sent; the last valid list stays.
- `conversationPath(id)` accepts only a UUID.
- The export is downloaded as a blob and saved as `ai-chat-history-YYYY-MM-DD.csv`.

## 4. Screen behaviour

- Header: **Open AI Assistant** link and **Export History** (disabled while exporting or when the list is empty). After the download a green toast: "Chat history was exported successfully."
- Filters: search box (300 ms debounce), From date, To date. Any change goes back to page 1.
- **Conversations** table: `No.`, Conversation (title as a button, with the preview of the last message under it), Participant (name and student code), Messages, Last Activity. **3 rows per page** with Previous / Next (Hsu's request on 2026-11-13; this table is the exception to the 10-row rule, the request sends `size=3`). The count in the panel header is the total of the filtered list.
- Choosing a title opens the **Message Transcript** panel and marks the row. The choice is kept in the URL as `?conversation=<id>`, so AI Feedback can link to a conversation.
- Transcript: title, student, message count, start and last activity; then the messages (student on the right, assistant on the left) with time, source chips and, on a rated answer, "Student feedback:" with the rating badge and the comment. **Load earlier messages** appears while `hasMoreBefore` is true. **Close** returns to the empty panel.
- States: loading, empty ("No student has chatted ..." or "No conversations match ..."), error with Retry, for the list and for the transcript separately.

## 5. Acceptance checks

1. After a student chats in the app, the conversation is the first row with the right student and message count.
2. Search by student code, by a word of a message and by title each find it; a date range that excludes today hides it.
3. Opening it shows both messages in order; a rated answer shows the rating.
4. A conversation with more than 50 messages offers "Load earlier messages".
5. Export downloads a CSV with the same rows as the filtered list.
6. `/admin/chat-history?conversation=<id>` opens that transcript directly.

## Shared rules (specs 41 to 44)

- Frontend base path: `apiClient` already points at `/api/v1/admin`; the service uses paths that start with `/assistant/`.
- Backend contract: `backend/seniorproject/spec-md/59-admin-ai-management-api.md`. Roles: `SUPER_ADMIN`, `ADMIN`, `ACADEMIC_ADMIN`.
- Files shared by the four screens: `src/types/aiAssistant.ts` (shapes), `src/utils/aiAssistant.ts` (limits, labels, query parameters, error copy), `src/services/aiAssistantService.ts` (requests, response checks and mapping) and `src/components/ai/AssistantUi.tsx` (page header, notice card, message bubble, source chips, rating and review badges).
- Every response is checked in the service. A response with an unexpected shape is an error, never rendered.
- IDs are kept as strings in the frontend.
- Text from the model, from students and from documents is rendered as plain text (`whitespace-pre-wrap`), never as HTML.
- Errors: `assistantError()` maps the backend `code` to fixed copy. A server `message` is never shown as it is.
- Project conventions: a `No.` serial column instead of database IDs, 3 rows per page on this screen (see section 4) with `ui/TablePagination`, a green `SuccessToast` for a completed action, no inline status text under tables.
- The layout of each screen stays the one that was already in the project (header, cards, filter row, panels). Only the placeholders and the "API unavailable" notices are replaced.
- Do not change the backend or the student app from these specs.
