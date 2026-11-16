# 44 - AI Feedback: API implementation

Screen: sidebar **AI Management › AI Feedback**, route `/admin/ai-feedback`, component `src/components/ai/AiFeedbackContent.tsx`.

## 1. Objective

Replace the placeholder with the ratings students give to AI answers: totals, a searchable and paged list, the full question and answer of one feedback, a review step for the administrator and a CSV export.

## 2. Backend APIs

| Use | Request |
|---|---|
| List | `GET /api/v1/admin/assistant/feedback?page=0&size=10&search=&rating=&reviewStatus=&from=&to=` |
| Totals | `GET /api/v1/admin/assistant/feedback/statistics` |
| Detail | `GET /api/v1/admin/assistant/feedback/{id}` |
| Review | `PATCH /api/v1/admin/assistant/feedback/{id}/review` |
| Export | `GET /api/v1/admin/assistant/feedback/export` (same filters, CSV, at most 5000 rows) |

- `rating`: `POSITIVE` or `NEGATIVE`. `reviewStatus`: `PENDING` (shown as "Awaiting Review"), `REVIEWED`, `RESOLVED`.
- `search` (at most 100 characters) matches the student code and name, the question, the answer and the comment. `from` / `to` filter on the submission time, as in spec 43.
- Row: `id`, `rating`, `comment`, `reviewStatus`, `reviewNote`, `reviewedBy { id, displayName }`, `reviewedAt`, `submittedAt`, `student`, `conversationId`, `conversationTitle`, `messageId`, `question`, `answer`, `model`, `sources`. In the list `question` and `answer` are previews of 300 characters; the detail has the complete texts.
- Totals: `totalFeedback`, `positive`, `negative`, `awaitingReview` (over all feedback, not the filtered list).
- Review body: `{ "reviewStatus": "REVIEWED", "reviewNote": "Handbook needs an update" }`. The note is optional, at most 1000 characters. `PENDING` puts the feedback back to Awaiting Review and clears the reviewer. The response is the updated feedback.

Errors: `VALIDATION_ERROR` (400), `ASSISTANT_FEEDBACK_NOT_FOUND` (404), 401, 403.

Where feedback comes from: the student endpoint `PUT /api/v1/student/assistant/conversations/{conversationId}/feedback` (backend spec 59). One rating per answer; rating the same answer again replaces it and sets it back to Awaiting Review. The mobile app has to call this endpoint before rows appear here.

## 3. Service and helpers

- `getFeedback(filters, page, size, signal)`, `getFeedbackStatistics(signal)`, `getFeedbackDetail(id, signal)`, `reviewFeedback(id, reviewStatus, reviewNote)`, `exportFeedback(filters)`.
- `feedbackParams(filters, page?, size?)` adds `rating` and `reviewStatus` to the history parameters of spec 43.
- `reviewFeedback` trims the note and sends `null` for an empty one.
- The export is saved as `ai-feedback-YYYY-MM-DD.csv`.

## 4. Screen behaviour

- Header: **Chat History** link and **Export Feedback** (disabled while exporting or when the list is empty). Toast after the download: "AI feedback was exported successfully."
- Four cards: Total Feedback, Positive, Negative, Awaiting Review. A dash while loading or when the totals cannot be loaded (with a Retry line).
- Filters: search (300 ms debounce), Rating, Review status, From date, To date. Any change goes back to page 1. A reversed date range shows an error and is not sent.
- **Feedback Reviews** table: `No.`, Submitted By (name and student code), Question / Response (two lines each), Rating badge, Comment, Submitted At, Review Status badge, Actions. 10 rows per page with Previous / Next.
- Actions: **Review** for a feedback that awaits review, **View** for the others. Both open the **Review Feedback** modal:
  - student, time, rating and status; the student's comment; the complete question and answer; the sources and model of the answer; a link "Open the conversation in Chat History" (`/admin/chat-history?conversation=<id>`);
  - the last reviewer and time, when there is one;
  - form: Review status (Awaiting Review, Reviewed, Resolved; "Reviewed" is preselected for a feedback that awaits review) and Review note with a `0 / 1000` counter;
  - **Save Review** sends the PATCH once (the modal stays open while saving), then closes, reloads the list and the cards and shows the toast "Feedback review saved."; **Cancel** closes without saving.
- States: loading, empty ("No feedback yet ..." or "No feedback matches ..."), error with Retry.

## 5. Acceptance checks

1. After a student rates an answer, the row appears first and the cards count it.
2. Rating = Negative and Review status = Awaiting Review each narrow the list; search finds a word of the comment.
3. Review → Reviewed with a note: toast, the badge changes, Awaiting Review goes down by one.
4. Opening the same row again shows the note, the reviewer and the time; setting it to Awaiting Review clears them.
5. Export downloads a CSV with the filtered rows.
6. The link in the modal opens the conversation in Chat History.

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
