#!/bin/sh

echo "🚀 Starting GitHub CRM application..."

# Extract database host from DATABASE_URL for Railway
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

# Default to Railway's internal networking if extraction fails
if [ -z "$DB_HOST" ]; then
    DB_HOST="postgres"
fi
if [ -z "$DB_PORT" ]; then
    DB_PORT="5432"
fi

# Wait for database to be ready
echo "⏳ Waiting for database to be ready at $DB_HOST:$DB_PORT..."
until nc -z $DB_HOST $DB_PORT; do
  echo "Database is unavailable - sleeping"
  sleep 1
done

echo "✅ Database is ready!"

# Generate Drizzle migrations
echo "📦 Generating Drizzle migrations..."
bun run db:generate

# Apply database migrations
echo "🔄 Running database migrations..."
bun run db:push

echo "🎉 Application is starting..."

# Start the application
exec "$@" 