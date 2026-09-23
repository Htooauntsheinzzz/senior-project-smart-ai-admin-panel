# 00 - Changes and Decisions

## Purpose

This document records implementation changes and technical decisions for the Smart AI Admin Web frontend.

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
