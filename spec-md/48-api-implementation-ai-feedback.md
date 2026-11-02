# AI Feedback — API integration status

## Scope and availability

Frontend-only implementation and read-only backend investigation on 2026-10-27. Source searches for feedback, ratings and thumbs-up/down concepts in the current backend `src/main` found no compatible implementation. Prior investigations also found no connected assistant/history service.

**Live feedback integration is blocked by the absence of an existing API contract.** No backend code, database, authorization or authentication behavior was changed. No HTTP method/path, payload, rating scale or review-state enumeration is asserted as supported.

## Current implementation

- `/admin/ai-feedback` uses existing protected admin routes and layout.
- Summaries show unknown values rather than zero or copied sample metrics.
- The list distinguishes unavailable data from a successful empty result.
- Search, rating/status/date filters and export remain disabled with an explanation.
- Chat History is a working navigation link only.
- No speculative requests, fake reviews, local/session-storage feedback, fabricated exports or success messages.
- The UI is a review-directory layout, not a working feedback-collection or moderation service.

## Contract required for future integration

The following are information requirements, **not proposed or implemented endpoints**:

| Area | Required contract |
| --- | --- |
| Authorization | Base URL/token mechanism, permitted roles and visibility of other users' feedback |
| Directory | Method/path, stable IDs, pagination, search/filter/sort parameters |
| Rating | Actual scale/enum and meaning; whether comments are optional |
| Relationships | Authorized contributor metadata and conversation/message IDs linking feedback to an answer |
| Summary | Global versus filtered counts and definitions of positive/negative/unreviewed metrics |
| Dates | Timestamp fields, timezone and range-boundary semantics |
| Review workflow | Whether review states, reviewer notes or assignments exist; allowed transitions and update contracts |
| Detail | Question/answer/context content and any source/citation metadata |
| Export | Supported formats, scope, limits and authorization |
| Failures | Validation, missing/forbidden records, conflicts, rate limits and service-unavailable responses |

After obtaining a compatible contract, use the project's authenticated client only where its base path/token model matches. Validate responses, implement server pagination and distinct loading/empty/error states, cancel stale filter/detail requests, and submit only supported review fields. Render user comments and AI responses as text unless an explicitly sanitized rich-text requirement exists. Show success only after server confirmation. These are future steps, not completed integration.

A working chat API would not by itself establish feedback storage, administrator visibility or review permissions. Those capabilities must be verified independently. The current admin route guard does not grant a new server-side permission.

## Related documentation

- [AI Feedback screen](47-screen-ai-feedback.md).
- [Chat History API status](46-api-implementation-chat-history.md).

## Verification

Static inspection confirms no feedback request or browser-storage write in the new screen. Lint, TypeScript, all 44 existing frontend tests and the Docker production build passed. The frontend container was recreated and its served screen bundle verified on localhost:3000. Live feedback/API tests require a compatible endpoint; authenticated visual checks remain pending normal sign-in.
