# 🐳 Docker Deployment Guide

Данный гайд поможет вам запустить GitHub CRM с помощью Docker и Docker Compose.

## 📋 Предварительные требования

- Docker (версия 20.10+)
- Docker Compose (версия 2.0+)
- Git
- GitHub Personal Access Token

## 🚀 Быстрый старт

### 1. Клонирование и настройка

```bash
# Клонируем репозиторий
git clone <your-repo-url>
cd github-crm

# Создаем файл с переменными окружения
cp env.example .env.local
```

### 2. Настройка переменных окружения

Отредактируйте `.env.local`:

```env
# Database (для Docker)
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/github_crm?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-me-in-production"

# GitHub API Token
GITHUB_TOKEN="ghp_your_github_personal_access_token"
```

### 3. Получение GitHub Token

1. Перейдите в [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Нажмите "Generate new token (classic)"
3. Выберите scopes: `public_repo`
4. Скопируйте токен и вставьте в `.env.local`

### 4. Запуск приложения

```bash
# Запуск в production режиме
docker-compose up -d

# Или запуск с логами
docker-compose up
```

Приложение будет доступно по адресу: http://localhost:3000

## 🛠 Команды для разработки

### Запуск только базы данных для разработки

```bash
# Запуск PostgreSQL + Adminer для разработки
docker-compose -f docker-compose.dev.yml up -d

# Приложение запускается локально с npm run dev
npm run dev
```

База данных будет доступна на порту `5433`, Adminer на `8080`.

### Подключение к базе данных для разработки

```env
# В .env.local для локальной разработки
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/github_crm_dev?schema=public"
```

## 📊 Управление

### Остановка сервисов

```bash
# Остановка всех сервисов
docker-compose down

# Остановка с удалением volumes (ВНИМАНИЕ: удалит все данные)
docker-compose down -v
```

### Просмотр логов

```bash
# Логи всех сервисов
docker-compose logs -f

# Логи только приложения
docker-compose logs -f app

# Логи только базы данных
docker-compose logs -f postgres
```

### Перезапуск сервисов

```bash
# Перезапуск всех сервисов
docker-compose restart

# Перезапуск только приложения
docker-compose restart app
```

## 🔧 Отладка

### Подключение к контейнеру

```bash
# Подключение к контейнеру приложения
docker exec -it github-crm-app sh

# Подключение к контейнеру базы данных
docker exec -it github-crm-db psql -U postgres -d github_crm
```

### Просмотр состояния сервисов

```bash
# Состояние всех сервисов
docker-compose ps

# Информация о контейнерах
docker ps
```

### Пересборка образа

```bash
# Пересборка образа приложения
docker-compose build app

# Пересборка с очисткой кеша
docker-compose build --no-cache app
```

## 🗄 База данных

### Adminer (Web UI для БД)

При использовании `docker-compose.dev.yml` доступен Adminer:
- URL: http://localhost:8080
- Система: PostgreSQL
- Сервер: postgres-dev
- Пользователь: postgres
- Пароль: postgres
- База данных: github_crm_dev

### Backup и Restore

```bash
# Создание backup
docker exec github-crm-db pg_dump -U postgres github_crm > backup.sql

# Восстановление из backup
docker exec -i github-crm-db psql -U postgres github_crm < backup.sql
```

## 🔐 Безопасность

### Для продакшена обязательно измените:

1. **NEXTAUTH_SECRET** - сгенерируйте случайную строку
2. **Пароли базы данных** - используйте сильные пароли
3. **Порты** - не выставляйте БД наружу в продакшене

### Генерация секретного ключа

```bash
# Генерация случайного ключа
openssl rand -base64 32
```

## 📝 Структура файлов

```
├── Dockerfile              # Образ для приложения
├── docker-compose.yml      # Production конфигурация
├── docker-compose.dev.yml  # Development конфигурация
├── .dockerignore           # Исключения для Docker
├── init-db.sql            # Инициализация БД
└── scripts/
    └── docker-entrypoint.sh  # Скрипт запуска
```

## 🐛 Troubleshooting

### Проблема: "Database connection failed"

```bash
# Проверьте состояние базы данных
docker-compose logs postgres

# Проверьте переменные окружения
docker-compose config
```

### Проблема: "Permission denied"

```bash
# Дайте права на выполнение скрипта
chmod +x scripts/docker-entrypoint.sh
```

### Проблема: "Port already in use"

```bash
# Найдите процесс, использующий порт
lsof -i :3000

# Остановите конфликтующие сервисы
docker-compose down
```

## 🌟 Дополнительные возможности

### Мониторинг

Для мониторинга можно добавить:
- Prometheus + Grafana
- Sentry для отслеживания ошибок
- Health checks

### Масштабирование

```bash
# Запуск нескольких экземпляров приложения
docker-compose up --scale app=3
```

### CI/CD

Пример GitHub Actions workflow для автоматического развертывания:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          docker-compose pull
          docker-compose up -d
``` 