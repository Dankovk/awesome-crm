# Використовуємо офіційний Node.js образ
FROM oven/bun:alpine AS base

# Встановлюємо необхідні пакети
RUN apk add --no-cache netcat-openbsd 

# Етап встановлення залежностей
FROM base AS deps
WORKDIR /app

# Копіюємо файли для встановлення залежностей
COPY package.json package-lock.json* ./
RUN bun i 

# Етап збірки додатку
FROM base AS builder
WORKDIR /app

# Копіюємо залежності
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Генерируем Drizzle миграции
RUN bun run db:generate

# Збираємо додаток
RUN bun run build

# Етап продакшн образу
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Створюємо користувача для безпеки
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копіюємо необхідні файли
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tailwind.config.js ./tailwind.config.js
COPY --from=builder /app/postcss.config.js ./postcss.config.js

# Копіюємо node_modules для доступу до drizzle-kit
COPY --from=builder /app/node_modules ./node_modules

# Копируем Drizzle схемы и миграции
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/lib/schema.ts ./lib/schema.ts
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Копіюємо зібраний додаток
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Копируем и делаем исполняемым entrypoint скрипт
COPY --chown=nextjs:nodejs ./scripts/docker-entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Используем entrypoint скрипт
ENTRYPOINT ["./entrypoint.sh"]

# Команда запуска
CMD ["bun", "server.js"] 