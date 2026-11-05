# Chat History — API integration status

## Scope and availability

Read-only investigation of the existing backend and frontend-only implementation on 2026-10-27. Source searches for chat/history/conversation route mappings and chat/conversation classes found no compatible history API. The preceding AI Assistant investigation also found no connected chat service.

**Live history integration is blocked by the absence of an existing API contract.** No backend source, database schema, permissions or authentication behavior were changed. No endpoint, HTTP method, DTO or participant scope is claimed as supported.

## Current frontend implementation

- `/admin/chat-history` uses existing protected routes and the admin layout.
- Conversations and transcripts show unavailable states, distinct from a successfully loaded empty history.
- Search, date filters and export are disabled with an explanation.
- Open AI Assistant is a working navigation link only.
- No speculative API calls, local/session-storage history, fake messages or export successes.
- Unsent AI Assistant drafts do not become history records.

## Contract required for future integration

The following are information requirements, **not proposed or implemented endpoints**:

| Area | Required information |
| --- | --- |
| Authorization | Actual base URL/token mechanism, permitted roles, own-history versus university-wide scope |
| Conversation list | Method/path, stable IDs, pagination, sorting and supported search fields |
| Metadata | Title/participant fields, message-count definition, timestamps and timezone |
| Date filtering | Supported parameter names, inclusive/exclusive boundaries and relevant timestamp |
| Transcript | Detail endpoint, ordered message IDs/roles/content, pagination and any citations |
| Export | Whether server export exists, supported format/scope, limits and authorization |
| Mutations | Any supported deletion/archive/resume operation and its semantics |
| Failures | Missing/forbidden records, rate limits, validation and service-unavailable responses |

After obtaining a compatible contract, use the existing authenticated client only where its base path and token scheme match. Validate list/detail responses, distinguish loading/empty/error states, cancel stale searches and isolate transcript responses by selected conversation. Render actual server message content safely and show only returned timestamps, evidence and counts. Implement complete export/pagination according to the verified contract. These steps remain future work.

The current admin-route guard does not define permission to read other users' conversations; that scope must come from the server contract. Chat generation, history and feedback are separate capabilities and are not inferred from one another.

## Related documentation

- [Chat History screen](45-screen-chat-history.md).
- [AI Assistant API status](44-api-implementation-ai-assistant.md).

## Verification

Static inspection confirms no history API operation or browser-storage writes in the new screen. Lint, TypeScript, all 44 existing frontend tests and the Docker production build passed. The frontend container was recreated and its served screen bundle verified on localhost:3000. Live history tests require a compatible endpoint; authenticated visual checks remain pending normal sign-in.
