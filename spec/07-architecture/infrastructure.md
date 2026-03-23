# Infrastructure

> Version: 1.0 | Last updated: 2026-03-20

This document defines the deployment architecture, Docker Compose configuration, Nginx reverse proxy setup, environment variables, MinIO integration, and operational concerns.

---

## 1. Deployment Architecture

```
                    ┌──────────────────────┐
                    │     Cloudflare CDN    │
                    │  (TLS termination,   │
                    │   static caching,    │
                    │   DDoS protection)   │
                    └──────────┬───────────┘
                               │ HTTPS :443
                               ▼
                    ┌──────────────────────┐
                    │   Nginx (Host)       │
                    │   Reverse Proxy      │
                    │   :80 / :443         │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
    ┌─────────────────┐ ┌──────────────┐ ┌────────────┐
    │  Next.js :3000  │ │ Backend :8080│ │ MinIO :9000│
    │  (frontend)     │ │ (Rust/Axum)  │ │ (S3 store) │
    │                 │ │              │ │            │
    │  Docker         │ │  Docker      │ │  Docker    │
    └─────────────────┘ └──────┬───────┘ └────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   PostgreSQL :5432   │
                    │   (Database)         │
                    │   Docker             │
                    └──────────────────────┘

    Nginx routing:
      /              → Next.js (:3000)
      /api/v1/*      → Backend (:8080)
      /minio/*       → MinIO (:9000)  [optional: for public image serving]
```

---

## 2. Docker Compose Services

```yaml
# docker-compose.yml
services:
  frontend:
    build:
      context: ./web/Web-Frontend
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - INTERNAL_API_URL=http://backend:8080
      - NEXT_PUBLIC_API_URL=
      - NEXT_PUBLIC_SITE_URL=${SITE_URL}
      - FRONTEND_ORIGIN=${SITE_URL}
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - app-network

  backend:
    build:
      context: ./api
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgres://vrc:${DB_PASSWORD}@db:5432/vrc
      - FRONTEND_ORIGIN=${SITE_URL}
      - DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
      - DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET}
      - DISCORD_REDIRECT_URI=${SITE_URL}/api/v1/auth/discord/callback
      - DISCORD_GUILD_ID=${DISCORD_GUILD_ID}
      - SYSTEM_API_TOKEN=${SYSTEM_API_TOKEN}
      - MINIO_ENDPOINT=http://minio:9000
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
      - MINIO_BUCKET=vrc-uploads
      - RUST_LOG=info
    depends_on:
      db:
        condition: service_healthy
      minio:
        condition: service_started
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=vrc
      - POSTGRES_USER=vrc
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vrc"]
      interval: 5s
      timeout: 3s
      retries: 10
    networks:
      - app-network

  minio:
    image: minio/minio:latest
    restart: unless-stopped
    command: server /data --console-address ":9001"
    volumes:
      - minio-data:/data
    environment:
      - MINIO_ROOT_USER=${MINIO_ACCESS_KEY}
      - MINIO_ROOT_PASSWORD=${MINIO_SECRET_KEY}
    ports:
      - "9000:9000"
      - "9001:9001"
    networks:
      - app-network

volumes:
  postgres-data:
  minio-data:

networks:
  app-network:
    driver: bridge
```

### 2.1 Next.js Dockerfile

```dockerfile
# Dockerfile (Multi-stage build)
FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 2.2 Next.js Config for Standalone Output

```typescript
// next.config.ts
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com", // Discord avatars
      },
      {
        protocol: "https",
        hostname: "*.example.com", // MinIO public URL (replace with actual domain)
      },
    ],
  },
};
```

---

## 3. Nginx Reverse Proxy

```nginx
# nginx.conf (simplified)
upstream frontend {
    server frontend:3000;
}

upstream backend {
    server backend:8080;
}

server {
    listen 80;
    server_name example.com;

    # Redirect HTTP to HTTPS (handled by Cloudflare in production)
    # return 301 https://$host$request_uri;

    # API routes → Backend
    location /api/v1/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Increase timeout for file uploads
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
        client_max_body_size 10M;
    }

    # Everything else → Next.js
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support (for HMR in development)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 3.1 Same-Domain Benefits

| Benefit | Description |
|---|---|
| **SameSite=Lax cookies** | Session cookie is automatically sent on all requests to the same domain. No cross-origin cookie issues. |
| **No CORS** | Frontend and API share the same origin. No preflight requests, no CORS headers needed. |
| **Natural SSR cookie forwarding** | RSC can read cookies from `next/headers` and forward to internal API calls. |
| **Simpler client-side fetch** | Client code uses relative URLs (`/api/v1/...`), Nginx routes to backend. |
| **Single TLS certificate** | One domain, one certificate (managed by Cloudflare). |

---

## 4. Environment Variables

### 4.1 Frontend (Next.js)

| Variable | Purpose | Public/Server | Example |
|---|---|---|---|
| `INTERNAL_API_URL` | Backend URL for server-side fetch (Docker internal) | Server | `http://backend:8080` |
| `NEXT_PUBLIC_API_URL` | Backend URL for client-side fetch (empty = same domain) | Public | `` (empty) |
| `NEXT_PUBLIC_SITE_URL` | Full site URL for SEO, sitemap, OG images | Public | `https://example.com` |
| `FRONTEND_ORIGIN` | Origin for CSRF validation in Server Actions | Server | `https://example.com` |
| `NODE_ENV` | Runtime environment | Server | `production` |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | Server | `1` |

### 4.2 Backend (Rust/Axum)

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://vrc:password@db:5432/vrc` |
| `FRONTEND_ORIGIN` | Origin for CSRF checks and redirect URLs | `https://example.com` |
| `DISCORD_CLIENT_ID` | Discord OAuth2 application client ID | `123456789012345678` |
| `DISCORD_CLIENT_SECRET` | Discord OAuth2 application secret | `secret-string` |
| `DISCORD_REDIRECT_URI` | OAuth2 callback URL | `https://example.com/api/v1/auth/discord/callback` |
| `DISCORD_GUILD_ID` | Required Discord server ID for membership check | `987654321098765432` |
| `SYSTEM_API_TOKEN` | Token for system API authentication | 64+ character random string |
| `MINIO_ENDPOINT` | MinIO S3 endpoint | `http://minio:9000` |
| `MINIO_ACCESS_KEY` | MinIO access key | `minioadmin` |
| `MINIO_SECRET_KEY` | MinIO secret key | `minioadmin` |
| `MINIO_BUCKET` | MinIO bucket name | `vrc-uploads` |
| `RUST_LOG` | Rust logging level | `info` |

### 4.3 Environment Variable Validation

Use a `.env.example` file as a template and validate required variables at application startup.

```
# .env.example
INTERNAL_API_URL=http://backend:8080
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SITE_URL=https://example.com
FRONTEND_ORIGIN=https://example.com
```

---

## 5. MinIO Integration

### 5.1 Architecture

```
Upload Flow:
  Browser → Server Action → Backend API → MinIO (S3-compatible)

Read Flow:
  Browser → Nginx → MinIO (public bucket) → Image
  or
  Browser → next/image → MinIO URL → Optimized image
```

### 5.2 Image Upload Strategy

Gallery images are uploaded via Server Actions:

1. Client selects image file
2. Server Action receives `FormData` with the file
3. Server Action forwards to backend API endpoint
4. Backend uploads to MinIO and returns the image URL
5. Frontend receives the URL and displays the image

### 5.3 Presigned URL Alternative

For large files, the backend can generate a presigned upload URL:

1. Client requests a presigned URL from backend
2. Backend generates MinIO presigned PUT URL (time-limited)
3. Client uploads directly to MinIO using the presigned URL
4. Client notifies backend of the completed upload

### 5.4 next/image Integration

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/avatars/**",
      },
      {
        protocol: "https",
        hostname: "storage.example.com", // MinIO public URL behind Nginx
        pathname: "/vrc-uploads/**",
      },
    ],
  },
};
```

Usage in components:

```tsx
import Image from "next/image";

<Image
  src={member.avatar_url}
  alt={member.discord_username}
  width={80}
  height={80}
  className="rounded-full"
/>
```

Benefits:
- Automatic WebP/AVIF conversion
- Responsive `srcSet` generation
- Lazy loading by default
- Blur placeholder support

---

## 6. CDN Layer (Cloudflare)

| Feature | Configuration |
|---|---|
| TLS termination | Cloudflare handles HTTPS certificates |
| Static asset caching | `/_next/static/*` cached at edge |
| DDoS protection | Cloudflare automatic mitigation |
| DNS | Proxied A/AAAA records pointing to server |
| Cache rules | Cache static assets, bypass for API and dynamic routes |
| SSL mode | Full (strict) — Cloudflare → Nginx with valid cert |

### 6.1 Cloudflare Cache Rules

| Pattern | Cache Behavior |
|---|---|
| `/_next/static/*` | Cache Everything (immutable assets, hashed filenames) |
| `/api/v1/*` | Bypass (dynamic API) |
| `*.ico`, `*.png`, `*.jpg` | Cache (static images) |
| Everything else | Standard (respect origin cache headers) |

---

## 7. Health Check Endpoints

| Service | Endpoint | Expected Response |
|---|---|---|
| Backend | `GET /health` | `200 OK` |
| Next.js | Port `3000` is listening | TCP connection success |
| PostgreSQL | `pg_isready -U vrc` | Exit code 0 |
| MinIO | `GET /minio/health/live` | `200 OK` |

---

## 8. Logging Strategy

| Service | Logger | Format | Output |
|---|---|---|---|
| Next.js | Built-in + console | JSON (production) | stdout/stderr |
| Backend (Rust) | `tracing` + `tracing-subscriber` | JSON | stdout |
| Nginx | access.log + error.log | Combined format | File + stdout |
| PostgreSQL | Built-in | Standard | Docker logs |

### 8.1 Structured Log Fields

- `timestamp`: ISO 8601
- `level`: info, warn, error
- `service`: frontend, backend, nginx
- `request_id`: Unique per-request (traced through Nginx → Backend)
- `path`: Request path
- `status`: HTTP status code
- `duration`: Response time in ms

---

## 9. Monitoring (Future)

| Component | Tool | Purpose |
|---|---|---|
| Metrics | Prometheus | Service metrics, request rates, error rates |
| Dashboards | Grafana | Visualization of metrics |
| Uptime | UptimeRobot (or self-hosted) | External availability monitoring |
| Error tracking | Sentry (optional) | Frontend and backend error aggregation |

---

## 10. Backup Strategy

| Resource | Method | Frequency | Retention |
|---|---|---|---|
| PostgreSQL | `pg_dump` to compressed file | Daily | 30 days |
| MinIO data | `mc mirror` to backup location | Daily | 30 days |
| Server configuration | Git repository | On change | Indefinite |
| Docker volumes | Volume snapshot | Weekly | 4 weeks |

### 10.1 Database Backup Script

```bash
#!/bin/bash
# backup-db.sh
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/backups/postgres

docker compose exec -T db pg_dump -U vrc vrc | gzip > "${BACKUP_DIR}/vrc_${TIMESTAMP}.sql.gz"

# Remove backups older than 30 days
find "${BACKUP_DIR}" -name "vrc_*.sql.gz" -mtime +30 -delete
```

---

## 11. Network Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                     Docker Network (app-network)                │
│                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│  │  frontend    │   │  backend    │   │    db        │          │
│  │  :3000       │──▶│  :8080      │──▶│  :5432       │          │
│  │              │   │             │   │              │          │
│  └─────────────┘   └──────┬──────┘   └─────────────┘          │
│                            │                                    │
│                            ▼                                    │
│                    ┌─────────────┐                              │
│                    │   minio     │                              │
│                    │   :9000     │                              │
│                    │   :9001     │ (console)                    │
│                    └─────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
          ▲
          │ Exposed ports: 3000, 8080, 9000
          │
    ┌─────────────┐
    │    Nginx     │ (host or separate container)
    │    :80/:443  │
    └─────────────┘
          ▲
          │
    ┌─────────────┐
    │  Cloudflare  │
    │  CDN / DNS   │
    └─────────────┘
```
