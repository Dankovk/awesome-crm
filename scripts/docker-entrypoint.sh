#!/bin/sh

echo "🚀 Starting GitHub CRM application..."

# Ждем пока база данных станет доступной
echo "⏳ Waiting for database to be ready..."
until nc -z postgres 5432; do
  echo "Database is unavailable - sleeping"
  sleep 1
done

echo "✅ Database is ready!"

# Генерируем миграции Drizzle
echo "📦 Generating Drizzle migrations..."
bun run db:generate

# Применяем миграции базы данных
echo "🔄 Running database migrations..."
bun run db:push

echo "🎉 Application is starting..."

# Запускаем приложение
exec "$@" 