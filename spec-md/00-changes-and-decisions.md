# 00 - Changes and Decisions

## Purpose

This document records implementation changes and technical decisions for the Smart AI Admin Web frontend.

## 2026-10-01 - Enroll Student form

- Implemented the user-supplied screenshot of the Enroll Student modal (updated Figma link `70:11910`; live links selected only Page 1). Uses a centered 520px native dialog, divided header, required Student/Course/Section selectors, paired Semester/Academic Year selectors, and Confirm Enrollment/Cancel actions. Narrow screens stack the paired controls.
- Enroll Student now opens the form. Section is initially disabled and resets when Course changes. All five fields are validated; active/pending duplicates for the same student, course, semester, and academic year are rejected. Errors focus the first invalid enabled control. Added submit locking, retry-preserving errors, and dirty-close confirmation.
- Options derive from enrollment-local fixtures rather than assuming cross-directory relationships. Confirmation prepends an Active local demo record with today's local date, updates metrics/filter choices/export, preserves filters, clears selection, and returns to page 1 with explicit feedback if filters hide the new row. Status and duplicate policy are demo assumptions; eligibility, capacity, approval, and persistence still require service contracts.
- TypeScript, lint, production build, Docker build, and 12 validation/creation assertions passed. Recreated `admin-web` successfully at port 3000. Authenticated visual/interaction verification remains pending; local Review tab is at login.

## 2026-10-01 - Enrollments

- Implemented protected `/admin/enrollments` from live Figma node `67:10060` (2059 × 1091 dashboard). Exported and inspected the frame, preserving the existing approved shell and reusing local icons.
- Reproduced header actions, four cards, search and six filters, selectable ten-row table, student avatars, course/section/status treatments, and two-page pagination. Initial totals are 20 / 15 Active / 3 Pending / 2 Withdrawn or Dropped.
- Only ten enrollment records are visible in the supplied frame. Those were transcribed exactly; the ten page-2 records are explicitly named Demo Student records and identified as synthetic in the UI and CSV. Enrollment-local course codes, dates, and semester/year pairs are preserved without inventing relationships with other directories.
- Added combined filters, course-dependent section choices, page reset on filtering, empty results, individual and page selection with indeterminate state, and CSV export of selected records or all filtered records. CSV quotes values and escapes formula prefixes.
- Bulk Enroll, Enroll Student, and row actions explain that their forms/services are unavailable; no server mutations are simulated.
- TypeScript, lint, production build, Docker build, and 12 data/filter/CSV assertions passed. Recreated `admin-web` at port 3000. Existing bundle-size advisory is non-blocking. Authenticated browser verification remains pending because the local app redirected to login.

## 2026-10-01 - Course Sections

- Implemented `15-course-sections.md` at protected `/admin/sections`, linked from Academic Management. Inspected and exported live Figma frame `63:8330`; retained the approved existing shell and local icons.
- Preserved all 23 reference sections, lecturer titles, schedules, semester `1/2568`, and academic year `2024`. Derived totals match 23 sections, 21 Active, 2 Full, 1023 enrolled, and 1130 capacity.
- Added combined course/section search and Course, Semester, Year, Lecturer, Status filters; empty state; filtered footer totals; capacity meters; and explicit unavailable row-action feedback. Summary cards describe the full local directory.
- Added the 480px Create Section drawer, adjacent on desktop and modal below 1280px, with reproducible `?add=1` state. Includes required-field and duplicate validation, positive capacity, first-error focus, pending-submit protection, unsaved-change confirmation, and filter-preserving local creation with zero enrollment.
- Demo assumptions: Full is derived from enrollment reaching capacity unless Closed; Active excludes Full. Capacity bars are neutral below 80%, amber below 100%, and magenta at full. Blank capacity defaults to 50. Course and lecturer options use local fixtures; extra semester options and years 2025/2026 are demo choices. No inferred lecturer identity merging, scheduling conflict policy, or backend contract.
- TypeScript, lint, production build, Docker build, and 18 fixture/filter/validation/creation assertions passed. Recreated `admin-web` successfully at port 3000. Existing non-blocking bundle-size advisory remains. Authenticated interaction and rendered responsive comparison remain pending.

## 2026-10-01 - Add Course

- Implemented `14-add-courses.md` at protected `/admin/courses/new`, reached from Add Course. Inspected/exported live frame `63:7892` and its original back-arrow SVG. Reused local check/chevron assets, fonts, and the existing shell.
- Reproduced the full-width four-card layout, tinted icon/title headers, exact field ordering and placeholders, paired/full-width fields, initial Required type and Active status, dimmed dependent selects, and left-aligned Save Course/Cancel actions. Fields stack on narrow screens.
- Course catalog state now belongs to the parent route so creation can return to the list with the new record, original filters, success feedback, and updated summaries. Optional year/semester/program/capacity are genuinely unassigned when blank, rather than inventing defaults; new records start with zero sections. Table/filter/CSV handling supports unassigned values.
- Department choices merge the existing department fixtures and reference-specific course assignments. Program options use the existing explicitly demo relationships. Faculty/department changes clear incompatible selections. Demo year options are 1–6 and terms are 1/2568, 2/2568, Summer/2568; these are not asserted as backend policy.
- Added required and duplicate-code checks; nonnegative integer credits; optional positive integer capacity; known, non-self prerequisites with case-insensitive lookup and deduplication; dependent-ID validation; first-error focus; pending-submit protection; and dirty Cancel/Back confirmation. Form description, prerequisites, and capacity are retained in the local course record.
- Lint, TypeScript, production build, and 18 validation/creation/relationship/summary assertions passed. Docker frontend was rebuilt and recreated successfully. Production retains the existing non-blocking bundle-size advisory. Authenticated rendered checks remain pending: the browser redirected to login after the sign-in confirmation.

## 2026-10-01 - Courses

- Implemented `13-courses.md` at protected `/admin/courses`, with Academic Management navigation selection and the existing shared shell. Inspected/exported live node `63:6384` and saved its original upload/download SVGs locally; reused matching existing page icons.
- Added all 20 reference records, three catalog-wide summary cards, the exact heading/actions, eight-column table, Required/Active/Sem 1/2568 badges, and filtered result count. Current semester is explicitly configured as 1/2568 rather than inferred from the current date.
- Search and all six filters combine with AND. Faculty changes clear incompatible departments; faculty/department changes clear incompatible program filters. Empty results provide Clear filters. The async local adapter supports loading and retryable error UI without clearing filters.
- Program memberships are explicitly illustrative demo metadata, not Figma-derived relationships. The course-local department IDs preserve the reference's Computer Engineering under IT and Management under Business rather than modifying the existing Department/Program fixtures.
- Export prepares all filtered rows as UTF-8 CSV with quoted delimiters/newlines and spreadsheet-formula escaping. Add Course, Import Courses, and row actions explain that their approved flows/service contracts are unavailable.
- Eighteen assertions for reference totals, combined filters, dependency resets, explicit term counting, and CSV escaping passed, along with lint, TypeScript, production build, and Docker frontend build. The production build reports a non-blocking chunk-size advisory. Published by recreating only `admin-web` at localhost:3000. Authenticated interaction/responsive/visual comparison remains pending: the local-app Review tab was closed; only the Figma tab remains available.

## 2026-09-30 - Programs & Majors

- Implemented `12-programs&majors.md` at `/admin/programs`, with `/admin/programs?add=1` for the reference drawer-open state. Reused the authenticated academic shell and extended the shared Drawer to support 480px panels.
- Exported live `54:4923` after sign-in; the frame had been resized to 2058 × 1983. Transcribed all 25 records, including codes, department assignments, degree labels, durations, credits, and Public Relations as the sole inactive row. Sampled the eight badge background/foreground pairs from the exported image.
- Added combined search/faculty/department/degree/status filters, dependent department reset, accurate counts, and the specified Add Program fields. Department stays disabled until Faculty is selected. Paired controls stack on narrow screens.
- Local creation validates five required fields, case-insensitive duplicate codes, faculty/department compatibility, configured durations, and optional nonnegative whole-number credits. Empty credits remain null; zero is preserved. Filters survive creation and hidden new records are announced. Duration options 1–6 and lookup eligibility are prototype choices; row actions explicitly remain unavailable.
- Lint, TypeScript, production/Docker builds, and 22 data/filter/validation assertions passed. Published by rebuilding/recreating only `admin-web` at port 3000. The user chose to finish with build checks; authenticated interaction/responsive/visual comparison remains pending.

## 2026-09-30 - Departments

- Implemented `11-departments.md` at protected `/admin/departments`, with `/admin/departments?add=1` for the open drawer. Connected Academic Management → Departments and the header context label to the existing shell.
- Inspected and exported the user's live node `42:3495` (1459 × 867 dashboard with adjacent 460px drawer). It clips the directory vertically; the Markdown references the taller `42:2512`. Kept all 18 specified rows and natural page scrolling, with initial count `Showing 18 of 18 departments`.
- Search, faculty, and status filters combine with AND. Creation preserves these filters and announces when they hide the newly added record. No extra rows were invented to reconcile the Faculties screen's separate 20-department fixture total.
- Added a reusable native-dialog Drawer: adjacent and nonmodal at 1280px+, modal below that width, independently scrollable content, persistent footer, focus handling, Escape, and dirty-close confirmation. Retained the approved shell and mobile sidebar breakpoint.
- Per the latest user correction, Faculty is one editable combobox with `Search or select a faculty…`. Options filter by English/Thai names and code; selecting a result displays its name in the same field. There is no second search box. Supports keyboard highlighting/selection, Escape-before-drawer dismissal, outside dismissal, selected IDs, loading/retry/empty states, and a bounded top-layer popover positioned above the input when needed to avoid clipping.
- Reused the original exported plus/search/dots/close/check SVGs from Faculties; exported both distinct 10 × 6 department dropdown arrows from the new live frame. Uses existing local fonts including Noto Sans Thai.
- Faculty options come from an asynchronous, explicitly local demo adapter offering all seven faculty fixtures. Production eligibility and API contracts are unresolved. Creation validates required fields, known faculty IDs, and university-wide case-insensitive duplicate codes (a demo policy); new records have zero program/course/student counts and reset on leaving/reloading. Row actions explicitly state unavailable integration.
- Lint, TypeScript, production/Docker builds and 17 data/validation assertions passed. Re-ran lint, TypeScript, production/Docker builds after the final single-input adjustment and deployed the update by recreating only `admin-web` on port 3000. Authenticated UI, keyboard, failure-state, and rendered visual checks remain pending: the app Review tab is at login.

## 2026-09-29 - Add Admin User and Faculties

### Add Admin User

- Implemented `09-add-admin-user.md` at `/admin/users/new`, reached from the existing Add Admin User action. Inspected and exported the user's live Figma frame `42:4478` (1459 × 1148); the specification references its nested `42:4481` frame.
- Reused the existing authenticated shell and fonts. Added the left-aligned 900px three-card form, responsive field grids, independent password visibility, checked force-change option, required/email/password/duplicate validation, field-linked errors, first-error focus, and dirty Cancel/Back confirmation.
- Exported original back, eye, check, and user-plus SVGs to `public/assets/figma/admin-*.svg`. Existing shared shell icons and expansion behavior remain the previously approved implementation.
- User Management now owns in-memory records across its list/new child routes. Successful creation adds only non-sensitive table fields. Department/role/status choices are explicitly mock data; passwords and confirmation are cleared and never placed in list data or browser storage. No account API or first-login enforcement exists.
- Lint, TypeScript, production/Docker builds, and validation/data-boundary assertions passed. Deployed to port 3000. Authenticated browser verification remains pending: the Review tab is at login and the user moved on to Faculties without answering the sign-in request.

### Faculties

- Implemented `10-faculties.md` at `/admin/faculties`; `/admin/faculties?add=1` reproduces the open drawer state. Inspected and exported live frame `42:2`, including its adjacent drawer.
- Added seven exact reference records with English/Thai names, codes, counts, badges, search across all names/codes, empty results, and complete-directory derived metrics of 7 / 6 / 20.
- The 460px drawer reserves space beside the shell at widths of 1280px and up. At narrower widths it uses native modal-dialog behavior; below 460px it fills the available width. Its body scrolls independently between the header and footer. The existing shell retains its 768px mobile navigation breakpoint.
- Creation is local-only with zero department/student counts, required-field and case-insensitive duplicate-code checks, pending-submit protection, status radio controls, focus handling, dirty-close confirmation, and success feedback. Row actions explicitly explain that editing/deletion/status changes are unavailable.
- Exported five original page/drawer SVGs to `public/assets/figma/faculty-*.svg`. Added the locally bundled Noto Sans Thai 400 font for Thai text; reused the approved shell/logo/fonts.
- Lint, TypeScript, production/Docker builds, and 12 assertions covering fixture totals, English/Thai search, empty results, required/duplicate validation, Unicode preservation, and local creation passed. Rebuilt and recreated only `admin-web` on port 3000. The user chose to finish with build checks; authenticated interaction, responsive rendering, and visual comparison checks remain pending.

## 2026-09-29 - Class Timetable

- Implemented `08-Timetable.md` at protected `/admin/timetable`, with the existing layout, navigation, authentication, and shared modal. The Markdown ends at the view-toggle example; the remaining calendar content was based on the exported 2058 × 1073 Figma frame `34:3999` after user sign-in.
- Added Monday–Saturday Calendar and List views sharing 29 reference-based schedules, semester/year and dependent faculty/department/course filters, faculty colors, schedule details, and a local Add Class Schedule form. Department assignments are demo metadata; ellipses preserve clipped reference values.
- New schedules validate required fields, time boundaries, minimum one-hour duration, and overlapping rooms, instructors, or course sections. Additions are local page state and reset on leaving the page.
- Schedule Conflicts preserves the reference count of four and explicitly states that conflict records are unavailable. The reference count is not represented as computed backend data.
- Lint, TypeScript, production build, nine utility checks covering layout/filter/validation behavior, and Docker frontend build passed. Published by rebuilding and recreating only `admin-web` at localhost:3000.
- Authenticated rendering, responsive browser checks, and rendered visual comparison remain pending: opening the protected route redirected to login. The user chose to finish with build checks. Figma export inspection is complete, but does not constitute rendered browser verification.

## 2026-09-29 - Students Management

### Implementation and scope

- Implemented `07-students.md` at the protected `/admin/students` route, reusing `AdminLayout`, Sidebar active-link styling, TopNav, Modal, Badge, existing fonts, and Lucide icons. Added reusable Pagination and typed student fixtures/filter/validation/export helpers.
- Added the specified heading/actions, four dataset-wide metrics (24 / 20 / 3 / 4 initially), ten verified first-page records, faculty/department and year/semester hierarchy, colored statuses, and ten-row pagination.
- Search matches ID/name/email; six filters combine with AND and reset pagination. Faculty and department changes clear incompatible dependent filters. Global search remains independent.
- Per the user's subsequent screenshot, search and six filters share one compact desktop row at 1440px as well as the wide reference size. Narrower layouts wrap without shrinking text or introducing horizontal page scrolling; the table owns its horizontal scrolling.
- Add Student validates required fields, email format, duplicate IDs/emails, supported statuses/semesters, years, and academic combinations. Successful additions exist only in local page state and clearly disclose that no server account was created. Row action buttons open read-only student details using the shared accessible dialog.
- Export Students downloads all filtered rows, not just the current page, as `students.csv` with quoted fields and spreadsheet formula escaping.
- Import Students opens an explicit unavailable state: this repository defines neither an agreed import schema nor an import endpoint. No schema/API/delete/permission operations were invented.
- Fourteen additional records are explicitly named `Demo Student` with `DEMO-STU-*` IDs and example.com emails. They are synthetic, not Figma-extracted. `newThisSemester` is an explicit demo flag on three synthetic records, not an inference from academic year/semester. Creation forms allow this flag to be set explicitly.
- The reference's blank university-image slot is superseded by the previously approved `public/assets/rsulogo.png`. The existing shared logo, expanded sidebar, header styling, Dashboard, and Admin Users layout remain intact.

### Verification

- `npm run lint`, `npx tsc --noEmit`, `npm run build`, and the Docker frontend production build passed. Recreated only `admin-web`, keeping the canonical app on port 3000.
- Verified the actual route after normal user sign-in: Students active link, ten IDs in source order, initial range `Showing 1–10 of 24 students`, summary values, each search field, all six filters, dependent-selection resets, combined filters, zero-results range, page-three boundary, required-field and duplicate validation, local addition, summary updates, dialog closure/focus restoration, and export of 14 filtered demo rows across pagination.
- Checked actual protected rendering at controlled viewport widths 2059, 1440, 1024, and 390. No page overflow at those sizes; four/two/one summary columns; desktop filter row stays inline; narrow tables scroll within their container. Temporary responsive-check frames were removed afterward; the final app contains one main and one student table.
- Figma authentication succeeded, but node `28:2369` repeatedly redirected to Page 1 without selecting a Students frame. Styling follows the detailed recorded measurements in the spec and the user's search/filter screenshot. An exact live-frame visual comparison remains pending an accessible Students node or reference export.

## 2026-09-27 - User Management / Admin Users

### Implementation

- Read `06-user-management.md` and inspected the existing React/TypeScript components, routes, authentication, styles, and assets before implementation.
- After the user signed in to Figma, inspected node `22:1698` and exported its 1460 × 1066 PNG. Followed the visible Admin Users title/subtitle, Export and Add Admin User labels, filter bar, eight table columns, visible account fixtures, role/status badges, and pagination.
- The user's subsequent screenshot overrides the original centered tabs: Admin Users / Roles & Permissions is left-aligned below the page description.
- Added the protected `/admin/users` route. Reused `AdminLayout`, Sidebar link/active styles, existing TopNav, shared `Badge` and `Panel`, local logo/fonts, and Lucide icons. The header's existing location control changes its label/icon for User Management; its styling is unchanged. Dashboard source and shared shell styling were not modified for this feature.
- Admin Users behavior is implemented in TypeScript components with separate typed fixtures and utility functions. A small JSX route adapter follows the existing JavaScript authentication-hook pattern.
- Added immediate search by name/email/role/employee ID, combined role/status/department filters, eight-row pagination, clear empty states, CSV export of the displayed page, and row-detail dialogs.
- Added a reusable native-dialog Modal and Add Admin form with required fields, valid-email checks, duplicate email/employee-ID checks, keyboard focus containment/restoration, Escape dismissal, and explicit frontend-only feedback.
- Admin changes are in-memory demo data and reset when the page is reopened. The first eight rows match the visible reference; four clearly named demo accounts support its 12-account/two-page count. Creation dates and second-page records are fixtures, not claimed Figma/backend data.
- Roles & Permissions remains visible and displays exactly `Not available right now`. No permission functionality or management API endpoints were introduced.

### Verification

- `npm run lint`, `npx tsc --noEmit`, and `npm run build` passed.
- Rebuilt and ran only the existing Docker frontend on port 3000, preserving backend/data services and authentication.
- After normal user sign-in, verified the actual protected route, User Management active link, eight initial rows, search by each supported field, no-result state, page two, filter-induced page reset, combined filters, unavailable Roles & Permissions state, modal required/duplicate validation, successful local addition, focus restoration, and downloaded CSV contents (header plus eight displayed records).
- Compared the actual authenticated page at a controlled 1460 × 1066 viewport against the exported reference. Also checked 1024, 768, and 390 px widths: the table scrolls horizontally inside its panel with no page overflow. At a 320 px viewport with a non-overlay scrollbar, the existing global 320 px minimum page width leaves scrollbar-width overflow; shared global styling was preserved per the request.
- Temporary responsive checks loaded the actual protected route with the real session, not a replacement component or mocked authentication, and were removed afterward.

## 2026-09-25 - Sidebar Logo Asset

- Updated the sidebar to use the supplied `public/assets/rsulogo.png` via `/assets/rsulogo.png`.
- Preserved the approximately 103 × 40 px logo slot with proportional `object-contain` sizing and prevented flex shrinking.

## 2026-09-25 - Local Runtime Investigation and Updated Deployment

- Port 3000 was served by the Docker `smart-university-admin-web-1` container (Nginx, host 3000 → container 80), built before the dashboard changes. Its old bundle `index-Dpi3r5Io.js` contained the signed-in-email dashboard placeholder.
- Docker Compose is owned by `SeniorProject/backend/senior-project-smart-ai-web-backend/compose.yaml`; its resolved frontend build context is `SeniorProject/frontend/senior-project-smart-ai-admin-panel`, the current checkout containing the updated components.
- Port 3001 was Vite PID 19904, launched from this same frontend checkout. Its API base was `http://localhost:8080`, but the running backend only allowed CORS origin `http://localhost:3000`. A preflight from port 3001 returned HTTP 403, explaining the login connection error.
- Port 3002 had no active listener/process during investigation. Its previous working directory cannot be established from the current process list.
- Rebuilt `admin-web` from the current checkout and ran `docker compose up -d --no-deps admin-web` in the backend Compose directory. Only the frontend container was replaced. Backend, Postgres, Redis, and other processes were left running; existing source/configuration changes were preserved.
- Canonical local URL: **http://localhost:3000/admin/dashboard**. The new served bundle is `index-DNi8eM_-.js`; the frontend container is healthy. Docker build uses `VITE_API_BASE_URL=http://localhost:8080` from the existing resolved configuration.
- Verified CORS preflight from port 3000 returns 200 with the correct allowed origin. A browser POST with an empty login payload reaches the real API and returns its expected 400 validation response, rather than a connection failure.
- The user then signed in normally in the Review pane. Verified the actual authenticated `/admin/dashboard` DOM: one sidebar, one header, one dashboard main, six expanded-group controls, 23 submenu items, six statistics, five quick actions, five events, five activities, four classes, three announcements, and footer. Old placeholder absent; scrolling preserves the route; no horizontal overflow at the current preview viewport. No authentication bypass or mocked session was used.
- This confirms the deployed version and authenticated rendering, not a pixel comparison with Figma. Figma visual comparison remains pending reference access.

---

## 2026-09-25 - Updated Dashboard Sidebar

### Changes and decisions

- Added reusable typed `AdminLayout`, `Sidebar`, and navigation data using the installed React Router, Lucide icons, local university logo, and Plus Jakarta Sans font.
- This checkout had no existing sidebar and only a minimal dashboard. Wrapped its existing content and Logout action in the new shell, retaining the single `/admin/dashboard` route.
- Included all 11 top-level entries, six independently expanded groups, and 23 exact submenu labels from `05-dashboard.md`, with indented guide lines and bullets.
- Navigation scrolls independently within a viewport-height sidebar; branding and the administrator profile remain anchored. Added compact mode and a mobile drawer with focus containment, Escape/backdrop dismissal, and focus restoration.
- Missing management destinations display explicit unavailable feedback instead of broken links. Dashboard is the only integrated destination.
- Added TypeScript checking for new typed files and ESLint TypeScript support using already-installed dependencies. Loaded the existing font package's medium weight and put the form font reset in Tailwind's base layer so navigation typography utilities apply.
- Figma returned HTTP 403; used the updated specification's documented node measurements and labels. Exact live Figma/icon comparison remains unverified.

### Validation

- `npm run lint`, `npm run build`, and `npx tsc --noEmit` passed.
- Browser checks used the real sidebar/layout in an isolated React Router harness (without changing application authentication), at 1440×900, 1024×768, 768×600, 390×844, 320×480, and 1280×420.
- Verified 11 top-level items, 23 children, six initially open groups, independent collapse, hidden collapsed panels, preserved main scroll position, compact width, no horizontal overflow, reachable Audit Logs, anchored profile, mobile Escape/focus restoration, and forward/reverse focus containment.

---

## 2026-09-25 - Complete Protected Dashboard

### Changes and decisions

- Removed the browser-only sidebar verification harness by reloading the preview. Its “Dashboard scroll verification” text was never part of application source; the underlying dashboard was still a minimal placeholder.
- Inspected `AppRoutes`, `ProtectedRoute`, `AuthProvider`, login navigation, and the API client. `/admin/dashboard` is protected and redirects unauthenticated visitors to `/login`. Authentication was not bypassed or mocked.
- Replaced the minimal dashboard content with the complete single-page composition from `05-dashboard.md`: top navigation, greeting/date, six statistics, five quick actions, usage chart/five events, five activities/four classes, three announcements, and footer.
- Added typed sample data, reusable panel/badge/action components, and a responsive SVG chart with accessible text. Reused the installed icon/font packages, university logo, sidebar, router, and real logout flow. Existing login-specific Button/Input components have fixed dimensions unsuitable for compact dashboard controls.
- Kept one dashboard route and document scroll owner. Retained the independently scrollable sidebar and bottom profile. Dashboard panels stack at smaller widths; statistics and announcements use responsive grids.
- Search filters displayed sample course/room/announcement data. Notifications disclose the absent live feed. Missing workflows display explicit unavailable feedback, including the shared Create Announcement handler. Account menu retains real Logout.
- Usage values `[18, 12, 9, 35, 130, 210, 155, 245, 190, 145, 100, 55]` are approximate demo values based on the written curve description; they are not Figma-extracted or live analytics. Accent colors and geometry beyond the documented spec are provisional pending design access.

### Project checks

- `npm run lint`, `npm run build`, and `npx tsc --noEmit` passed.
- Source search confirms no verification placeholder or alternate DashboardScreen components remain.

### Visual verification — pending, not passed

- No Figma tools or MCP resources were exposed in the session; direct design access returned HTTP 403. Requested screenshots of sidebar `12:666`, top `6:936`, and lower `9:2`.
- Opened the actual `/admin/dashboard` URL. The connected preview redirected to `/login`; after the user reported signing in, the connected tab still showed `/login` after refresh. Requested login in that specific Review-pane browser session.
- The authenticated dashboard's top/lower screenshots, same-size/100%-zoom Figma comparison, and rendered responsive checks are blocked pending authenticated preview access and reference screenshots. Earlier sidebar-harness checks do not constitute full-dashboard visual verification.

---

## 2026-09-22 - Docker Setup

### Changes

- Added multi-stage `Dockerfile` using Node.js 22 Alpine for the frontend build.
- Added Nginx Alpine as the production runtime.
- Initially added a frontend-local `compose.yaml` for the `admin-web` service.
- Added `nginx.conf` with React SPA fallback routing.
- Added `.dockerignore` to reduce the Docker build context.
- Updated `.gitignore` for dependencies, build output, environment files, logs, caches, editors, and OS files.
- Updated `README.md` with Docker usage.

### Decisions

- The frontend production container serves the Vite build through Nginx rather than running the Vite development server.
- The frontend container exposes port `3000` by default.
- `VITE_API_BASE_URL` is supplied at image build time because Vite embeds environment variables into the browser bundle.

### Validation

- `npm run build` passed.
- `npm run lint` passed.
- `docker compose config` passed.
- Docker image build passed.
- Nginx configuration test passed.
- Docker health check and HTTP response test passed.

---

## 2026-09-22 - Environment Configuration

### Changes

- Added `.env` with local development defaults.
- Added `.env.example` with documented environment variables.
- Updated `README.md` with environment variable documentation.

### Decisions

- `VITE_API_BASE_URL` defaults to `http://localhost:8080`.
- `FRONTEND_PORT` defaults to `3000`.
- `.env` remains ignored by Git.
- `.env.example` remains trackable because it contains no secrets.

### Validation

- `npm run build` passed.
- `docker compose config` passed.

---

## 2026-09-22 - MCP Setup

### Changes

- Added `.vscode/mcp.json` for the remote Figma MCP server.
- Added `opencode.jsonc` for OpenCode project instructions and Figma MCP configuration.
- Updated `.gitignore` so `.vscode/mcp.json` can be committed.

### Decisions

- Figma remote MCP uses `https://mcp.figma.com/mcp`.
- No Figma token, password, or credential is stored in project configuration.
- OpenCode uses the current valid schema format: `mcp.figma`, not the older `mcp.servers.figma` shape.
- VS Code uses its required `servers.figma` shape.

### Current Status

- OpenCode detects the Figma MCP server.
- Figma OAuth authentication is blocked externally because Figma reports that the OpenCode OAuth client ID does not exist.
- No project-side credential or endpoint failure was found.

### Validation

- `.vscode/mcp.json` parsed as valid JSON.
- `opencode mcp list` detected `figma` and reported `needs authentication`.

---

## 2026-09-22 - Login Screen

### Changes

- Implemented responsive `/login` page.
- Added login branding, login card, form validation, password visibility toggle, Remember Me UI, forgot-password message state, security indicators, staff notice, and footer.
- Added reusable `Input` and `Button` UI components.
- Added local Rangsit University logo usage from `public/assets/rsulogo.png`.
- Added local Inter and Plus Jakarta Sans font loading.
- Added Axios API client and authentication service.
- Added React Router.
- Set Vite development server port to `3000`.
- Vertically centered the full login content column in the viewport.

### Decisions

- The login form submits through a real `<form>` and `onSubmit`.
- `rememberMe` is not sent to the backend because the backend login request contract only supports `email` and `password`.
- Credentials are not logged or persisted.
- Figma fixed-artboard dimensions were converted to responsive layout using viewport sizing, max width, flexbox, and responsive spacing.
- The official RSU logo is served locally from `public/assets/rsulogo.png` instead of a temporary remote URL.

### Validation

- `npm run lint` passed.
- `npm run build` passed.
- Docker production build passed.
- Direct `/login` SPA route test passed.
- Nginx fallback routing passed.

---

## 2026-09-22 - Frontend Authentication

### Changes

- Added centralized `AuthContext` and `useAuth` hook.
- Added centralized `tokenStorage` utility.
- Added login, refresh, and logout methods to `authService`.
- Added Axios request interceptor for `Authorization: Bearer <accessToken>`.
- Added centralized Axios 401 response handling.
- Added authentication initialization using the backend refresh endpoint.
- Added `ProtectedRoute` for `/admin/*`.
- Added `AppRoutes` and root redirect behavior.
- Added temporary `DashboardPage` with authenticated user display and logout.
- Connected successful login to `/admin/dashboard`.
- Connected authenticated `/login` access to `/admin/dashboard`.
- Connected unauthenticated dashboard access to `/login`.
- Removed the obsolete duplicate `authSession.js` helper.

### Decisions

- Authentication state is managed by React Context.
- Only authentication tokens are persisted; raw passwords are never persisted.
- Remember Me uses `localStorage`; non-Remember Me sessions use `sessionStorage`.
- Access and refresh tokens are also mirrored in memory for centralized interceptor access.
- Authentication restoration uses `POST /api/v1/admin/auth/refresh` when stored tokens exist.
- Logout calls `POST /api/v1/admin/auth/logout` and clears frontend authentication state in a `finally` block.
- A 401 response clears frontend authentication state centrally without coupling Axios directly to React Router.
- The dashboard remains temporary because the complete Dashboard module has its own future specification.

### Validation

- `npm run lint` passed.
- `npm run build` passed.
- Docker production build passed.
- Direct `/login` SPA route test passed.
- Direct `/admin/dashboard` SPA route test passed.
- Backend login endpoint returned the expected `401` for invalid credentials.

---

## 2026-09-22 - Unified Docker Compose Project

### Changes

- Moved the `admin-web` service definition into `backend/seniorproject/compose.yaml` under project name `smart-university`.
- Replaced the separate frontend Compose project with a frontend `compose.yaml` that includes the backend Compose file.
- The frontend Compose entry overrides only the `admin-web` build context so it uses this frontend folder.
- The frontend Compose entry explicitly loads `backend/seniorproject/.env` for the included backend services.
- Added `FRONTEND_PORT` and `VITE_API_BASE_URL` to the backend `.env` and `.env.example` files.
- Updated frontend and backend README Docker instructions.

### Decisions

- Both commands operate on one Compose project named `smart-university`:
  - `docker compose up -d --build` from `frontend/smart-ai-admin-web`
  - `docker compose up -d --build` from `backend/seniorproject`
- Docker containers are grouped under `smart-university` as `postgres-1`, `redis-1`, `backend-1`, and `admin-web-1`.
- The backend Compose file remains the source of truth for PostgreSQL, Redis, and backend settings.
- The frontend Compose file exists so running Compose from the frontend folder still manages the complete same project without orphan warnings.
- `admin-web` starts after `backend`.
- `VITE_API_BASE_URL` remains `http://localhost:8080` because browser JavaScript runs on the host and cannot resolve Docker's internal `backend` hostname.
- Backend database, Redis, JWT, and private-key environment variables remain in the backend service only and are not passed to the frontend.

### Validation

- Unified `docker compose config` passed from the frontend folder.
- `docker compose config --services` showed `postgres`, `redis`, `backend`, and `admin-web`.
- `docker compose up -d --build` from the frontend folder built and started the complete stack under `smart-university` without orphan warnings.
- `docker compose ps` showed all four services under the `smart-university` project.
- Frontend HTTP route check passed.
- Backend login endpoint returned the expected `401` for invalid credentials.
