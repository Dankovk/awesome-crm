
FROM oven/bun:alpine AS base

RUN apk add --no-cache netcat-openbsd 

# ===============================
# Етап встановлення залежностей (для кешування)
# ===============================

FROM base AS deps
WORKDIR /app


COPY package.json bun.lock ./
RUN bun i 


FROM base AS builder
WORKDIR /app


COPY --from=deps /app/node_modules ./node_modules
COPY . .


# ===============================
# Етап збірки додатку
# ===============================

# Генерируем Drizzle миграции
RUN bun run db:generate

# Збираємо додаток
RUN bun run build


# ===============================
# Етап продакшн образу
# ===============================

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Створюємо користувача для безпеки
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tailwind.config.js ./tailwind.config.js
COPY --from=builder /app/postcss.config.js ./postcss.config.js


COPY --from=builder /app/node_modules ./node_modules


COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/lib/db/schema.ts ./lib/db/schema.ts
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts


COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static


COPY --chown=nextjs:nodejs ./scripts/docker-entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

ENTRYPOINT ["./entrypoint.sh"]

CMD ["bun", "server.js"] 