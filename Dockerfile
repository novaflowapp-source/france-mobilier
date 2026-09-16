# syntax=docker/dockerfile:1
# CACHE_BUST=2026-08-28-railway-logo-auth
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN echo "=== APP ROUTES IN CONTEXT ===" \
  && ls -la src/app \
  && test -d src/app/connexion \
  && test -d src/app/compte \
  && test -d src/app/inscription \
  && test -f public/logo-france-mobilier.png \
  && test -f data/products.ts \
  && test -d src/app/api/auth \
  && test -d src/app/api/reviews
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Public URL must be known at build: sitemap.xml and robots.txt are generated then.
# BETTER_AUTH_URL stays localhost so the auth adapter can compile without the live host.
ENV NEXT_PUBLIC_SITE_URL=https://francemobilier.org
RUN DATABASE_URL=:memory: \
  BETTER_AUTH_SECRET=build-time-placeholder-not-for-runtime \
  BETTER_AUTH_URL=http://localhost:3000 \
  NEXT_PUBLIC_SITE_URL=https://francemobilier.org \
  npm run build \
  && test -f .next/standalone/server.js \
  && test -d .next/static

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# SQLite lives on the Railway volume mounted at /app/data — without it, every deploy wipes accounts.
ENV DATABASE_URL=file:/app/data/maisonora.db
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh \
  && mkdir -p /app/data /tmp/next-cache \
  && chown -R nextjs:nodejs /app /tmp/next-cache
# Stay root: the Railway volume mounted at /app/data is root-owned. USER nextjs
# caused SQLITE_CANTOPEN (14) on every auth request.
EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
