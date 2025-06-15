-- Инициализация базы данных GitHub CRM
-- Этот файл будет выполнен при первом запуске PostgreSQL контейнера

-- Создаем базу данных если она не существует
-- (PostgreSQL автоматически создает базу из переменной POSTGRES_DB)

-- Создаем расширения если нужно
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Основные таблицы будут созданы Prisma при запуске приложения
SELECT 'Database initialization completed' as status; 