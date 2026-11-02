# Reports & Analytics — screen implementation

## Scope and design basis

Implemented on 2026-10-27, frontend only. No screen-specific Figma frame was supplied with this request. The layout follows existing admin patterns rather than claiming inspected Figma parity.

- Protected route: `/admin/reports`.
- Sidebar/top navigation: Reports & Analytics.
- API contract: [50-api-implementation-reports.md](50-api-implementation-reports.md).

## Layout and behavior

- Header with Refresh and Export Summary controls.
- Current snapshot explanation: counts are global/current and independently fetched, not date-range analytics.
- Four responsive summary panels: Students, Courses, Course Sections and Enrollments. Each contains labeled counts, a fetch timestamp and a View records link to its existing module.
- Loading message during initial load/refresh. Failed modules show safe errors with retry; successful modules remain visible. Unknown data is never represented as zero; real zero counts display normally.
- Refresh reloads all four summaries and hides the previous snapshot while loading. Stale/unmounted requests are aborted and ignored.
- Export is enabled only when all four summaries succeed. CSV contains the displayed metrics and per-section UTC fetch timestamps, not student-level records.
- Additional Analytics panels explain unavailable Student Activity, AI Performance and Campus Usage reporting.
- No unsupported date-range selector, invented time-series charts, growth percentages or fake usage metrics.

Active student accounts are explicitly distinguished from active app users. Full sections are displayed as a server count, not interpreted as historical room utilization.

Panels stack on narrow screens and use two columns on large screens. Semantic headings/definition lists, status/error feedback, native buttons/links and visible keyboard focus follow existing accessibility conventions. Authentication/logout behavior is retained.

## Files

- `src/components/reports/ReportsContent.tsx`: summary panels, loading/error states, refresh/export and capability explanation.
- `src/pages/reports/ReportsPage.jsx`: existing admin shell/session/logout.
- `src/services/reportService.ts`: aggregates existing summary loaders and builds CSV.
- `src/data/navigation.ts`, `src/routes/AppRoutes.jsx`, `src/components/navigation/TopNav.tsx`: navigation integration.
- `tests/reports.test.cjs`: aggregation, partial failures and export completeness.

## Verification

- Lint, TypeScript and all 46 frontend tests passed, including two report tests.
- Docker production build passed with the existing large-bundle advisory.
- Rebuilt/recreated only `admin-web`; `/admin/reports` returned HTTP 200 and the served `/assets/index-DIkWMDjZ.js` bundle includes the screen.
- Authenticated live-data/visual/keyboard checks remain pending normal sign-in. A Figma comparison requires the intended frame.
