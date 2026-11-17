FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Sign in with Google and registration texts (spec-md/45). None of these is a
# secret. The backend compose.yaml passes them from the backend .env.
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ARG VITE_GOOGLE_HOSTED_DOMAIN=
ENV VITE_GOOGLE_HOSTED_DOMAIN=${VITE_GOOGLE_HOSTED_DOMAIN}
ARG VITE_ADMIN_EMAIL_DOMAIN=rsu.ac.th
ENV VITE_ADMIN_EMAIL_DOMAIN=${VITE_ADMIN_EMAIL_DOMAIN}

RUN npm run build

FROM nginx:1.28-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
