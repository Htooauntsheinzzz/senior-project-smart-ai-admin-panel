# Smart AI Admin Web

React and Vite administration frontend for the Smart AI University Student Assistant.

## Environment

Local configuration is read from `.env`. The available variables and development defaults are documented in `.env.example`:

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Backend API URL embedded by Vite | `http://localhost:8080` |
| `FRONTEND_PORT` | Host port exposed by Docker Compose | `3000` |

## Local development

```sh
npm ci
npm run dev
```

## Docker

This folder's `compose.yaml` includes the backend Compose project and uses the same project name, `smart-university`. Running Compose from either folder manages the same PostgreSQL, Redis, backend, and Admin Web containers.

From this frontend folder:

```sh
docker compose up -d --build
```

Or from `backend/seniorproject`:

```sh
docker compose up -d --build
```

The application is available at `http://localhost:3000`. Configure `FRONTEND_PORT` and `VITE_API_BASE_URL` in `backend/seniorproject/.env` when needed, then rebuild from either folder.

`VITE_API_BASE_URL` is embedded in the frontend bundle during the image build. It remains `http://localhost:8080` because the browser runs on the host; internal container-to-container traffic uses the `backend` service name.
