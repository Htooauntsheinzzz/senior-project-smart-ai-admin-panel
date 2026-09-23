# 01 - Docker Setup

## 1. Purpose

This specification defines the Docker setup for the:

**Smart AI University Student Assistant – Admin Web**

The system contains:

```text
Frontend
React + Vite + Tailwind CSS

Backend
Spring Boot REST API
```

The frontend must communicate with the backend through:

```text
/api/v1/admin/**
```

Example:

```text
/api/v1/admin/auth/login
```

Docker must allow the frontend and backend to run together inside the same Docker network.

---

# 2. Architecture

Use the following Docker architecture:

```text
Browser
   |
   v
Frontend Container
React Production Build
Nginx
Port 3000
   |
   | /api/*
   v
Backend Container
Spring Boot
Port 8080
   |
   v
Database / Redis
```

The browser should communicate with:

```text
http://localhost:3000
```

Frontend requests such as:

```text
/api/v1/admin/auth/login
```

must be forwarded by Nginx to:

```text
http://backend:8080/api/v1/admin/auth/login
```

Do NOT expose Docker service names such as:

```text
http://backend:8080
```

directly to browser JavaScript.

Docker service names only work inside the Docker network.

---

# 3. Required Docker Files

The frontend project should contain:

```text
frontend/
├── Dockerfile
├── .dockerignore
├── nginx.conf
├── docker-compose.yml
├── package.json
├── vite.config.js
├── src/
├── spec-md/
│   └── 01-docker-set-up.md
└── AGENT.md
```

If the Docker Compose file is managed from the project root, this structure may instead be:

```text
smart-ai-university-assistant/
├── docker-compose.yml
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .dockerignore
│   └── ...
│
└── backend/
    ├── Dockerfile
    └── ...
```

Prefer the root-level `docker-compose.yml` when frontend and backend are stored in the same repository.

---

# 4. Frontend Docker Strategy

Use a multi-stage Docker build.

The frontend build should contain two stages:

```text
Stage 1
Node.js
   ↓
npm install
   ↓
npm run build
   ↓
dist/

Stage 2
Nginx
   ↓
Copy dist/
   ↓
Serve React application
```

Do not run the Vite development server in the production container.

Production must use:

```text
Nginx
```

---

# 5. Frontend Dockerfile

Create:

```text
Dockerfile
```

Recommended implementation:

```dockerfile
# ==============================
# Build Stage
# ==============================

FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# ==============================
# Production Stage
# ==============================

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

# 6. Frontend Docker Ignore

Create:

```text
.dockerignore
```

Recommended content:

```dockerignore
node_modules
dist
.git
.gitignore
.idea
.vscode
.DS_Store
npm-debug.log
README.md
spec-md
```

Do not copy unnecessary local files into the Docker build context.

---

# 7. Nginx Configuration

Create:

```text
nginx.conf
```

The configuration must support:

1. React SPA routing.
2. Static frontend files.
3. Backend API proxy.
4. `/api/**` forwarding to Spring Boot.

Recommended configuration:

```nginx
server {
    listen 80;

    server_name localhost;

    root /usr/share/nginx/html;

    index index.html;


    # ==============================
    # React Application
    # ==============================

    location / {
        try_files $uri $uri/ /index.html;
    }


    # ==============================
    # Backend API
    # ==============================

    location /api/ {
        proxy_pass http://backend:8080;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

The Docker service name:

```text
backend
```

must match the backend service name inside `docker-compose.yml`.

---

# 8. Frontend API Configuration

Frontend code should use relative API URLs.

Recommended:

```javascript
/api/v1/admin
```

Do NOT use:

```javascript
http://backend:8080/api/v1/admin
```

Do NOT hardcode:

```javascript
http://localhost:8080/api/v1/admin
```

throughout React components.

Recommended environment variable:

```env
VITE_API_BASE_URL=/api/v1/admin
```

---

# 9. Axios Client

The centralized Axios client should use:

```javascript
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1/admin",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
```

Example request:

```javascript
apiClient.post("/auth/login", request);
```

This produces:

```text
/api/v1/admin/auth/login
```

---

# 10. Backend Docker Requirements

The backend is a:

```text
Spring Boot application
```

The backend container must listen internally on:

```text
8080
```

Docker service name must be:

```text
backend
```

Recommended backend configuration:

```yaml
server:
  port: 8080
```

---

# 11. Backend Dockerfile

The backend should have its own:

```text
backend/Dockerfile
```

The exact Dockerfile must follow the build system used by the backend.

If using Maven:

```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

COPY . .

RUN ./mvnw clean package -DskipTests


FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

If the backend already has a working Dockerfile, do not replace it unnecessarily.

Reuse the existing backend Docker configuration.

---

# 12. Docker Compose

Create:

```text
docker-compose.yml
```

Prefer storing it in the root directory containing both frontend and backend.

Example structure:

```text
smart-ai-university-assistant/
├── docker-compose.yml
├── frontend/
└── backend/
```

Recommended Compose configuration:

```yaml
services:

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile

    container_name: smart-ai-admin-frontend

    ports:
      - "3000:80"

    depends_on:
      - backend

    networks:
      - smart-ai-network


  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile

    container_name: smart-ai-backend

    ports:
      - "8080:8080"

    networks:
      - smart-ai-network


networks:
  smart-ai-network:
    driver: bridge
```

---

# 13. Docker Communication

Inside Docker:

```text
frontend
   |
   | Nginx
   |
   v
http://backend:8080
```

Outside Docker:

```text
Browser
   |
   v
http://localhost:3000
```

Backend may also be accessed directly during development through:

```text
http://localhost:8080
```

---

# 14. API Request Workflow

Example login request:

```text
React Login Page
      |
      v
POST /api/v1/admin/auth/login
      |
      v
Nginx
      |
      v
http://backend:8080/api/v1/admin/auth/login
      |
      v
Spring Boot Authentication API
```

The React application should not need to know the Docker backend hostname.

---

# 15. React Router Support

The frontend uses React Router.

For example:

```text
/login
/admin/dashboard
/admin/users
/admin/users/create
```

Refreshing a route such as:

```text
http://localhost:3000/admin/users
```

must not produce:

```text
404 Not Found
```

Therefore Nginx must contain:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

# 16. Development Mode

Docker should primarily be used for integrated and production-like testing.

For normal frontend development:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:8080
```

---

# 17. Vite Development Proxy

During local development, Vite should proxy `/api` requests to Spring Boot.

Update:

```text
vite.config.js
```

Recommended:

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    port: 5173,

    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
```

Then frontend code can use the same API path in both environments:

```text
/api/v1/admin
```

Development:

```text
React
localhost:5173
   |
   v
Vite Proxy
   |
   v
localhost:8080
```

Docker:

```text
React
localhost:3000
   |
   v
Nginx
   |
   v
backend:8080
```

---

# 18. Important API Rule

Use one consistent API format:

```text
/api/v1/admin
```

Examples:

```text
POST /api/v1/admin/auth/login

GET /api/v1/admin/users

POST /api/v1/admin/users

GET /api/v1/admin/users/{id}

PUT /api/v1/admin/users/{id}

DELETE /api/v1/admin/users/{id}
```

Do not create separate URLs for Docker and local development inside application code.

---

# 19. Environment File

Create:

```text
.env
```

Example:

```env
VITE_API_BASE_URL=/api/v1/admin
```

Create:

```text
.env.example
```

Example:

```env
VITE_API_BASE_URL=/api/v1/admin
```

Do not place sensitive backend credentials in the frontend `.env`.

---

# 20. Sensitive Information

Never place the following in the frontend Docker image:

```text
Database password
Redis password
JWT signing secret
Private RSA key
Backend secret
Super Admin password
API private credentials
```

Frontend environment variables are visible to the browser after the application is built.

Only browser-safe configuration may use:

```text
VITE_*
```

---

# 21. Backend Environment Variables

Backend secrets should be configured only for the backend container.

Example:

```yaml
backend:
  environment:
    SPRING_PROFILES_ACTIVE: docker
```

Database and Redis configuration should be stored in backend environment configuration.

Do not pass backend secrets to:

```text
frontend
```

---

# 22. Database Integration

If the backend requires a database, add it as a separate Docker service.

Example architecture:

```text
Frontend
   |
   v
Backend
   |
   +----------------+
   |                |
   v                v
Database           Redis
```

The frontend must never connect directly to:

```text
PostgreSQL
MySQL
Redis
```

Only the backend communicates with these services.

---

# 23. Redis Integration

If authentication or backend caching uses Redis:

```text
Frontend
   |
   v
Backend
   |
   v
Redis
```

The frontend must never communicate directly with Redis.

Redis authentication and configuration remain entirely inside the backend infrastructure.

---

# 24. Extended Docker Compose Structure

When database and Redis are included, the architecture may become:

```yaml
services:

  frontend:
    build:
      context: ./frontend

    ports:
      - "3000:80"

    depends_on:
      - backend

    networks:
      - smart-ai-network


  backend:
    build:
      context: ./backend

    ports:
      - "8080:8080"

    depends_on:
      - database
      - redis

    networks:
      - smart-ai-network


  database:
    image: postgres:latest

    networks:
      - smart-ai-network


  redis:
    image: redis:alpine

    networks:
      - smart-ai-network


networks:
  smart-ai-network:
    driver: bridge
```

The exact database version and credentials must follow the backend project's existing Docker specification.

Do not replace working backend database configuration without a requirement.

---

# 25. Container Naming

Recommended names:

```text
Frontend:
smart-ai-admin-frontend

Backend:
smart-ai-backend

Database:
smart-ai-database

Redis:
smart-ai-redis
```

Container names should remain consistent across project documentation.

---

# 26. Build Commands

Build all containers:

```bash
docker compose build
```

Start containers:

```bash
docker compose up
```

Start in detached mode:

```bash
docker compose up -d
```

Build and start:

```bash
docker compose up --build
```

---

# 27. Stop Containers

Stop containers:

```bash
docker compose down
```

Stop and remove volumes only when intentionally resetting persistent data:

```bash
docker compose down -v
```

Do not remove database volumes during normal development unless a database reset is required.

---

# 28. View Containers

Check running containers:

```bash
docker compose ps
```

or:

```bash
docker ps
```

---

# 29. View Logs

Frontend logs:

```bash
docker compose logs frontend
```

Backend logs:

```bash
docker compose logs backend
```

Follow backend logs:

```bash
docker compose logs -f backend
```

Follow frontend logs:

```bash
docker compose logs -f frontend
```

---

# 30. Rebuild Frontend

When frontend source code changes and the production Docker image needs rebuilding:

```bash
docker compose build frontend
```

Then:

```bash
docker compose up -d frontend
```

Or:

```bash
docker compose up --build
```

---

# 31. Docker Health Verification

After containers start, verify:

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:8080
```

Then verify frontend-to-backend communication.

Example:

```text
POST
/api/v1/admin/auth/login
```

---

# 32. Expected Network Flow

The final network flow must be:

```text
Browser
   |
   | http://localhost:3000
   |
   v
Nginx + React
   |
   | /api/*
   |
   v
backend:8080
   |
   v
Spring Boot
   |
   +-------------------+
   |                   |
   v                   v
Database              Redis
```

---

# 33. CORS

When using the Nginx `/api` proxy, frontend and backend requests appear under the same frontend origin.

Example:

```text
Frontend:
http://localhost:3000

API:
http://localhost:3000/api/v1/admin/...
```

This reduces unnecessary CORS configuration for the Docker frontend.

During direct development using:

```text
localhost:5173
```

the Vite proxy should also be used instead of manually calling:

```text
localhost:8080
```

from frontend components.

---

# 34. Docker Security Rules

Follow these rules:

- Do not commit secrets.
- Do not copy `.env` containing production secrets into frontend Docker images.
- Do not expose database ports unless development requires them.
- Do not expose Redis publicly unless development requires it.
- Use lightweight runtime images.
- Use multi-stage frontend builds.
- Do not run Vite development server as the production frontend server.
- Never include backend private keys inside the frontend repository.
- Never include JWT signing secrets inside frontend code.

---

# 35. Implementation Workflow

The agent must follow this order:

```text
Read AGENT.md
      ↓
Read 01-docker-set-up.md
      ↓
Inspect existing backend Docker configuration
      ↓
Inspect frontend package.json
      ↓
Create frontend Dockerfile
      ↓
Create .dockerignore
      ↓
Create nginx.conf
      ↓
Configure Vite development proxy
      ↓
Configure frontend API base URL
      ↓
Connect frontend and backend in Docker Compose
      ↓
Build containers
      ↓
Start containers
      ↓
Verify frontend
      ↓
Verify backend
      ↓
Verify frontend → backend API
```

---

# 36. Existing Backend Rule

Before modifying backend Docker files, inspect the existing backend project.

If the backend already contains:

```text
Dockerfile
docker-compose.yml
database container
Redis container
environment configuration
network configuration
```

reuse those configurations.

Do not recreate or replace existing working infrastructure unless necessary.

The frontend Docker setup must integrate with the existing backend infrastructure.

---

# 37. Do Not Modify Backend Business Logic

This Docker task must not modify:

```text
Controllers
Services
Repositories
Entities
Authentication business logic
Database schema
Flyway migrations
Redis business logic
```

unless a Docker-specific configuration requires a small infrastructure change.

Docker setup is an infrastructure task.

---

# 38. Acceptance Criteria

Docker setup is complete when all of the following work:

- Frontend Docker image builds successfully.
- Backend Docker image builds successfully.
- Frontend container starts successfully.
- Backend container starts successfully.
- Frontend is available at:

```text
http://localhost:3000
```

- Backend is available at:

```text
http://localhost:8080
```

- React Router routes work after browser refresh.
- `/api/**` requests are proxied to Spring Boot.
- Frontend does not hardcode `backend:8080`.
- Frontend does not hardcode `localhost:8080` inside page components.
- Login API can be called from the frontend.
- Frontend and backend share the Docker network.
- No backend secrets are exposed to React.
- Database is accessed only through the backend.
- Redis is accessed only through the backend.
- Existing backend Docker configuration is preserved where possible.

---

# 39. Final Required Architecture

```text
               Browser
                  |
                  |
          http://localhost:3000
                  |
                  v
        +-------------------+
        |     FRONTEND      |
        |                   |
        | React             |
        | Vite Build        |
        | Tailwind CSS      |
        | Nginx             |
        +-------------------+
                  |
                  |
              /api/*
                  |
                  v
        +-------------------+
        |      BACKEND      |
        |                   |
        | Spring Boot       |
        | Port 8080         |
        +-------------------+
             |         |
             |         |
             v         v
        +---------+ +-------+
        |Database | | Redis |
        +---------+ +-------+
```

The frontend must communicate only with the backend REST API.

The frontend must never communicate directly with the database or Redis.