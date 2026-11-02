# AI Assistant — API integration status

## Scope and availability

Frontend-only implementation and read-only backend inspection on 2026-10-27. Searches of the current backend source for assistant/chat/completion route mappings and AI client integrations found no compatible endpoint. Earlier AI Knowledge Base and Test AI Knowledge investigations likewise found no document or retrieval service.

**Live assistant integration is blocked by the absence of an existing API contract.** No backend source, database, authentication, permissions or API contracts were changed. No HTTP method/path, DTO, role or model is asserted as supported for chat.

## Implemented frontend behavior

- `/admin/ai-assistant` uses existing protected routes and the admin session/layout.
- Message drafting and clearing work in React memory only.
- Send Message is disabled with an explanation.
- The conversation panel states that nothing has been sent and replies are unavailable.
- No speculative service calls, direct browser LLM requests, API keys, local conversation persistence or fake messages.
- Links to document management/testing navigate to their existing screens without claiming those services are connected.

## Contract required for future integration

These are information requirements, **not proposed or implemented endpoints**:

| Area | Required contract |
| --- | --- |
| Invocation | Actual base URL, method/path, synchronous versus streaming transport |
| Authorization | Token/session mechanism and permitted roles; whether the existing admin client applies |
| Request | Message field, size limits and any supported model/context fields |
| Conversation | Thread/message identifiers, creation/resume semantics and server persistence rules |
| Response | Answer format, finish state, no-answer behavior and source/citation structure |
| Streaming | Event format, partial/final output, cancellation and interrupted-request handling |
| Failures | Validation, authorization, rate limits, timeouts and service-unavailable response shapes |
| History/actions | Supported history, deletion, retry and feedback operations, if any |

After verification, use the existing authenticated client only if the endpoint's base path and token contract match. Add response validation, real loading/error states, duplicate-send prevention, stale-response isolation, cancellation and safe text rendering. Retry behavior must avoid creating duplicate turns. Conversation persistence and source links must reflect actual server capabilities. These steps remain future work.

AI Assistant chat, knowledge testing, document management and chat history are separate capabilities. No history/feedback API is inferred from the sidebar or from academic endpoints.

## Verification

Static inspection confirms no chat request or browser-storage code in the new screen. Lint, TypeScript, all 44 existing frontend tests and the Docker production build passed. The frontend container was recreated and the served screen bundle verified on localhost:3000. Live chat/API tests require a compatible endpoint; authenticated visual verification remains pending normal sign-in. See [screen implementation](43-screen-ai-assistant.md).
