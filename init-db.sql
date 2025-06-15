-- Ініціалізація бази даних GitHub CRM
-- Цей файл буде виконано при першому запуску PostgreSQL контейнера

-- Створюємо базу даних якщо вона не існує
-- (PostgreSQL автоматично створює базу з змінної POSTGRES_DB)

-- Створюємо розширення якщо потрібно
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Основні таблиці будуть створені Drizzle при запуску додатку
SELECT 'Database initialization completed' as status; 