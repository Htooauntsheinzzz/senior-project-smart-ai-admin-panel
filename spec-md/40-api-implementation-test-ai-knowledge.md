# Test AI Knowledge — API integration status

## Scope

Frontend-only investigation and implementation on 2026-10-27. Backend files were inspected read-only. No backend source, database schema, permissions, authentication behavior or API contracts were changed.

## Verified API availability

Inspection of the current `senior-project-smart-ai-web-backend` controller inventory and source/configuration found authentication, admin-user, student, faculty, department, program, course, semester, lecturer, course-section and enrollment APIs. No controller or compatible endpoint was found for:

- Testing a question against the knowledge base.
- Generating an AI answer.
- Retrieving indexed documents, passages or citations.
- Selecting knowledge collections/models for testing.
- Persisting test runs or reporting test metrics.

The backend's project description mentions university knowledge retrieval as a goal; that is not an implemented API contract. Dashboard knowledge-document numbers are frontend sample data and cannot serve as a knowledge index. The adjacent `backend/auntsheinzzz` directory was empty at inspection time.

**Integration status: blocked by the absence of a compatible existing API.** No HTTP method/path or DTO is asserted as supported. The frontend screen is implemented, but live knowledge testing is not.

## Current frontend behavior

- `/admin/test-ai-knowledge` uses the existing protected route and admin shell.
- The editor holds an unsent question in memory only; Clear Question works locally.
- Run Test is disabled with an availability explanation.
- Answer and source regions show unavailable states.
- No service stub sends speculative requests. No external LLM is called directly from the browser.
- No fake responses, citations, confidence scores, success notifications or browser-local test persistence.

## Contract needed for future integration

The following are information requirements, **not proposed or implemented endpoints**:

| Area | Contract to obtain |
| --- | --- |
| Invocation | Actual HTTP method/path, synchronous versus streaming behavior, request content type |
| Authentication | Whether the existing admin bearer token applies; permitted roles |
| Request | Question field and length limits; any supported collection/model identifiers |
| Answer | Response text format, response ID and handling of unsupported/unanswerable questions |
| Evidence | Source IDs/titles, excerpts, citation relationships and authorized source URLs |
| Metrics | Definitions/units for any timing or relevance values actually returned |
| Failures | Validation, authorization, rate-limit, timeout and unavailable-service responses |
| Lifecycle | Cancellation behavior and whether requests create persisted test records |

Once a compatible existing endpoint is available, connect it using the project's authenticated client when its authorization/base path matches. Validate responses, distinguish loading/empty/no-answer/error states, prevent duplicate submissions and stale results, and render answers as text unless a verified sanitized rich-text requirement exists. Display only server-returned evidence and metrics. These are future integration steps, not completed functionality.

## Verification

Static inspection confirms the screen has no test-network operation or browser-storage code. Lint, TypeScript, all 44 existing frontend tests and the Docker production build passed. The frontend container was recreated and the served screen bundle verified at localhost:3000. Live API tests cannot run without a compatible endpoint. See [screen implementation](39-screen-test-ai-knowledge.md) for UI scope and remaining authenticated verification.
