# Smart AI Admin Web

React and Vite administration frontend for the Smart AI University Student Assistant.

## Environment

Local configuration is read from `.env`. The available variables and development defaults are documented in `.env.example`:

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Backend API URL embedded by Vite | `/` for Compose; `http://localhost:8080` for Vite development |
| `BACKEND_PATH` | Backend checkout relative to this Compose file | `../../backend/senior-project-smart-ai-web-backend` |
| `FRONTEND_PORT` | Host port exposed by Docker Compose | `3000` |

## Local development

Set `VITE_API_BASE_URL=http://localhost:8080` in `.env` for the Vite dev server.

```sh
npm ci
npm run dev
```

## Docker

This folder's `compose.yaml` includes the backend Compose project and uses the same project name, `smart-university`. Running Compose from either folder manages the same PostgreSQL, Redis, backend, and Admin Web containers.

On a fresh device, clone **both** repositories. `.env` files and RSA keys are
intentionally not in Git. Use Docker Desktop with Linux containers on Windows
(WSL2) or macOS, or Docker Engine with Compose v2 on Linux. Compose 2.20+ is
required for the frontend `include` entry point.

Expected layout:

```text
SeniorProject/
  backend/senior-project-smart-ai-web-backend/
  frontend/senior-project-smart-ai-admin-panel/
```

First, in the **backend** directory, copy `.env.example` to `.env` and fill in
the database/Redis passwords. Set:

```dotenv
FRONTEND_PATH=../../frontend/senior-project-smart-ai-admin-panel
VITE_API_BASE_URL=/
```

Then initialize keys and start the stack:

```sh
docker compose run --rm keygen
docker compose up -d --build --wait
```

To start from this **frontend** directory instead, copy its `.env.example` to
`.env` and set `BACKEND_PATH` to your actual backend directory. Then:

```sh
docker compose config --quiet
docker compose up -d --build --wait
```

Copy with `Copy-Item .env.example .env` in PowerShell or `cp .env.example .env`
on macOS/Linux. Preserve existing `.env` files and update only necessary values.
For Windows absolute paths, use forward slashes, for example
`BACKEND_PATH=C:/Users/User/OneDrive/Documents/SeniorProject/backend/senior-project-smart-ai-web-backend`.

The application is available at `http://localhost:3000`. Keep
`VITE_API_BASE_URL=/` in both environment files for Compose. The backend Compose
file supplies an Nginx configuration forwarding `/api/` to `backend:8080`.
This also supports browsers using `http://<Docker-host-IP>:3000` from other
devices without embedding localhost in the API URL. API URL changes require a
frontend rebuild. Ensure both repositories include the updated Docker files.
