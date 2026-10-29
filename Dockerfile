# Featul self-hosted image. Built and run by selfhost/docker-compose.yml; see selfhost/README.md.
#
#   target `migrate`  sets up and upgrades the database, then exits
#   target `app`      the Next.js server (apps/app) on port 3000

FROM oven/bun:1.3.11 AS bun

# Node runs the Next.js build, as it does on Vercel and in CI; Bun installs and runs scripts.
FROM node:22-slim AS deps
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx
WORKDIR /repo
COPY . .
RUN bun install --frozen-lockfile

FROM deps AS migrate
WORKDIR /repo/packages/db
CMD ["bun", "scripts/selfhost/migrate.ts"]

FROM deps AS build
# NEXT_PUBLIC_* values are inlined into the browser bundle, so they are fixed per build.
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_ROOT_DOMAIN
ARG NEXT_PUBLIC_SENTRY_DSN=""
# Lets next/image load uploads from the storage bucket (see next.config.ts).
ARG R2_PUBLIC_BASE_URL=""
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_ROOT_DOMAIN=$NEXT_PUBLIC_ROOT_DOMAIN \
    NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN \
    R2_PUBLIC_BASE_URL=$R2_PUBLIC_BASE_URL \
    NEXT_OUTPUT=standalone \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--max-old-space-size=4096 \
    NODE_ENV=production
# Some clients are created on import, so they get placeholders; nothing connects during the
# build, and the real values come from docker-compose.yml at runtime.
RUN cd apps/app && \
    DATABASE_URL=postgres://build:build@localhost:5432/build \
    UPSTASH_REDIS_REST_URL=http://build.invalid UPSTASH_REDIS_REST_TOKEN=build \
    BETTER_AUTH_SECRET=build-only-placeholder-not-used-at-runtime \
    bun run build

FROM node:22-slim AS app
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=build --chown=node:node /repo/apps/app/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/app/.next/static ./apps/app/.next/static
COPY --from=build --chown=node:node /repo/apps/app/public ./apps/app/public
USER node
EXPOSE 3000
CMD ["node", "apps/app/server.js"]
