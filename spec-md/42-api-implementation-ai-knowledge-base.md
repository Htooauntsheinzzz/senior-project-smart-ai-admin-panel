# AI Knowledge Base — API integration status

## Scope

Frontend-only implementation and read-only API investigation on 2026-10-27. No backend code, database, authorization rules or API contracts were changed.

## Verified availability

The current `senior-project-smart-ai-web-backend/src/main` controller inventory and source search expose existing authentication, user, student, academic and enrollment APIs. No compatible knowledge-document, upload, embedding or indexing endpoint was found.

**Live integration is blocked by the absence of an existing knowledge-base API.** No HTTP path, method, DTO or enumeration is claimed as available for this module. The dashboard's sample knowledge-document counts are not a document directory or index.

Unavailable operations include listing/searching documents, fetching summaries/categories, uploading files, viewing/downloading source documents, editing metadata, deleting records, starting/retrying indexing, and reading indexing progress/errors.

## Frontend implementation

- `/admin/ai-knowledge-base` uses the existing protected admin routes and layout.
- Summary values remain unknown, rather than zero or copied sample totals.
- Document controls are disabled with an explicit explanation.
- The table presents an unavailable-data state, distinct from a successful empty list.
- No speculative network requests, service stubs, browser uploads, external AI calls, local persistence or fake success feedback.
- The Test AI Knowledge link is functional navigation to the existing question-drafting screen, not evidence of a working retrieval service.

## Contract needed for integration

These are requirements to obtain from a compatible existing service, **not implemented or proposed endpoints**:

| Area | Required information |
| --- | --- |
| Authentication | Base URL, token mechanism and permitted roles |
| Directory | Actual method/path, pagination, search/filter/sort names, stable document IDs |
| Metadata | Authoritative names, category/type, size units and timestamps |
| Summary | Count definitions, whether counts are global or filtered |
| Upload | Actual method/path, multipart or other format, field names, accepted MIME types/extensions, file-size limits and duplicate rules |
| Indexing | Real state enumeration, job identifiers, polling/streaming semantics, cancellation/retry behavior |
| Document access | Authorized detail/content/download URLs and response formats |
| Mutations | Supported metadata changes, deletion semantics and index cleanup behavior |
| Failures | Validation, access, upload-size, conflict, rate-limit and service-unavailable responses |

Once verified, a frontend service can use the existing authenticated API client where the base path/token contract matches. Implement real loading/empty/error states, stale-request protection, complete pagination, server-driven statuses, and safe user-facing errors. Upload/indexing completion must follow actual server responses rather than inferred timers. These steps remain future work.

## Relationship to testing

Document management and question testing are separate capabilities. Adding a document API alone does not enable AI answer generation or citations. See [Test AI Knowledge API status](40-api-implementation-test-ai-knowledge.md).

## Verification

Static inspection confirms the new screen sends no knowledge-management requests or browser-storage writes. Lint, TypeScript, all 44 existing frontend tests and the Docker production build passed. The frontend container was recreated and its served screen bundle verified on localhost:3000. Live document/API testing requires a compatible endpoint; authenticated visual checks remain pending normal sign-in. See [screen implementation](41-screen-ai-knowledge-base.md).
