FROM node:22-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app

ARG INTERNAL_API_URL=http://app:3000
ARG NEXT_PUBLIC_API_URL=https://vrcapi.arivell-vm.com
ARG NEXT_PUBLIC_SITE_URL=https://vrc10.arivell-vm.com
ARG FRONTEND_ORIGIN=https://vrc10.arivell-vm.com

ENV INTERNAL_API_URL=$INTERNAL_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV FRONTEND_ORIGIN=$FRONTEND_ORIGIN
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build && \
  mkdir -p .next/standalone/node_modules/@swc && \
  rm -rf .next/standalone/node_modules/@swc/helpers && \
  cp -R node_modules/@swc/helpers .next/standalone/node_modules/@swc/helpers && \
    mkdir -p .next/standalone/.next/static .next/standalone/public && \
    cp -R .next/static/. .next/standalone/.next/static/ && \
    cp -R public/. .next/standalone/public/

FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]