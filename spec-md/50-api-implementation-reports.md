# Reports & Analytics — API implementation

## Scope

Frontend-only implementation on 2026-10-27. Existing backend controllers and summary DTOs were inspected read-only. No backend code, database, authentication or permissions were changed.

No dedicated historical reporting endpoint was found. The Reports screen integrates existing current-count summaries through their existing frontend services and authenticated API client.

## Connected endpoints

All paths are under `/api/v1/admin`. Requests are GET, with no date/filter parameters.

| Endpoint | Displayed response fields |
| --- | --- |
| `/students/summary` | totalStudents, activeStudents, pendingStudents, inactiveOrSuspendedStudents |
| `/courses/summary` | totalCourses, activeCourses, inactiveCourses |
| `/course-sections/summary` | totalSections, activeSections, closedSections, fullSections |
| `/enrollments/summary` | totalEnrollments, activeEnrollments, pendingEnrollments, withdrawnEnrollments, droppedEnrollments |

The existing loaders validate DTOs; the report aggregator also requires nonnegative safe-integer metrics. Other returned fields are not automatically treated as analytics: currentSemesterCourses, totalEnrolled and withdrawnOrDropped are not displayed or combined into new metrics.

## Data semantics

- Counts are global current server summaries, not filtered or historical reports.
- Active accounts do not imply daily/monthly active app users.
- Enrollment statuses represent enrollment state, not attendance or academic achievement.
- Each endpoint is fetched independently. This is not an atomic cross-module snapshot.
- Fetch timestamps are client receipt times, not server snapshot/as-of timestamps. UI displays local time; CSV retains ISO UTC timestamps.
- No growth rates, historical activity, accuracy metrics or usage distributions are derived from current totals.

## Frontend request behavior

`getReportSections` starts the four existing summary loaders concurrently and passes one AbortSignal to them. Failures are isolated per section; no all-or-nothing loss of successful summaries. 401 uses existing central session handling; 403 is explained without bypassing server authorization. Other failures show safe retry text rather than raw server exception messages.

Initial load, refresh and retry are controlled by a request version. Cleanup aborts old requests; aborted results never update the screen. Refresh hides the previous snapshot until the new requests settle. Existing API services and modules are unchanged.

## Export

Client-side CSV of the successfully loaded displayed snapshot, with Section, Metric, Value and Fetched at (UTC) columns. UTF-8 BOM, CRLF records and escaped quoted cells are used. Export is disabled and rejected if any of the four sections is missing or failed. Export does not trigger an unsupported backend reporting endpoint, include personal student records or claim a historical/atomic snapshot.

## Unsupported analytics

Student activity/session trends, AI response time/accuracy/token/feedback metrics, campus navigation/popularity/room usage and date-range reporting require compatible existing analytics endpoints. Their paths, DTOs, access controls, date semantics and metric definitions must be supplied before integration. Existing dashboard fixtures are not a source of production analytics.

## Files and verification

- `src/services/reportService.ts`: aggregation, safe feedback and CSV.
- `src/components/reports/ReportsContent.tsx`: consumes report sections and handles lifecycle/export.
- `tests/reports.test.cjs`: meaningful aggregation/error/export checks with mocked summary loaders.

Lint, TypeScript and all 46 frontend tests passed, including two report aggregation/export tests. Docker production build passed; `admin-web` was recreated and the Reports bundle verified at localhost:3000. Live authenticated endpoint/permission verification remains pending normal sign-in. See [screen implementation](49-screen-reports.md).
