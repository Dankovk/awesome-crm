# Используем официальный Node.js образ
FROM oven/bun:alpine AS base

# Устанавливаем необходимые пакеты
RUN apk add --no-cache netcat-openbsd 

# Этап установки зависимостей
FROM base AS deps
WORKDIR /app

# Копируем файлы для установки зависимостей
COPY package.json package-lock.json* ./
RUN bun i 

# Этап сборки приложения
FROM base AS builder
WORKDIR /app

# Копируем зависимости
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Генерируем Drizzle миграции
RUN bun run db:generate

# Собираем приложение
RUN bun run build

# Этап продакшн образа
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Создаем пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем необходимые файлы
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tailwind.config.js ./tailwind.config.js
COPY --from=builder /app/postcss.config.js ./postcss.config.js

# Копируем Drizzle схемы и миграции
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/lib/schema.ts ./lib/schema.ts
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Копируем собранное приложение
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