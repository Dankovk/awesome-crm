#!/bin/sh

echo "🚀 Запуск GitHub CRM додатку..."

# Витягуємо хост бази даних з DATABASE_URL 
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

# За замовчуванням використовуємо внутрішню мережу якщо витягування не вдалося
if [ -z "$DB_HOST" ]; then
    DB_HOST="postgres"
fi
if [ -z "$DB_PORT" ]; then
    DB_PORT="5432"
fi

# Чекаємо поки база даних стане готовою
echo "⏳ Очікування готовності бази даних на $DB_HOST:$DB_PORT..."
until nc -z $DB_HOST $DB_PORT; do
  echo "База даних недоступна - очікування"
  sleep 1
done

echo "✅ База даних готова!"

# Генеруємо міграції Drizzle
echo "📦 Генерація міграцій Drizzle..."
if bunx drizzle-kit generate; then
    echo "✅ Міграції згенеровано успішно"
else
    echo "⚠️  Генерація міграцій не вдалася, але продовжуємо..."
fi

# Застосовуємо міграції бази даних
echo "🔄 Застосування міграцій бази даних..."
if bunx drizzle-kit push --force; then
    echo "✅ Міграції застосовано успішно"
else
    echo "⚠️  Застосування міграцій не вдалося, але продовжуємо..."
fi

echo "🎉 Додаток запускається..."

# Запускаємо додаток
exec "$@" 