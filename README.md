# GitHub CRM

Простая система управления проектами (CRM) для публичных проектов GitHub, построенная на Next.js, TypeScript, PostgreSQL и Drizzle ORM.

## Возможности

- 🔐 Регистрация и авторизация пользователей
- 📊 Отображение информации о GitHub репозиториях:
  - Владелец проекта
  - Название проекта  
  - URL проекта
  - Количество звезд (stars)
  - Количество форков (forks)
  - Количество открытых issues
  - Дата создания в формате UTC Unix timestamp
- ➕ Добавление репозиториев по пути (например: facebook/react)
- 🔄 Обновление данных проектов из GitHub API
- 🗑️ Удаление проектов
- 📱 Адаптивный дизайн

## Технологический стек

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **База данных**: PostgreSQL
- **ORM**: Drizzle ORM
- **Аутентификация**: NextAuth.js
- **UI**: Lucide React, React Hook Form
- **Валидация**: Zod

## Установка и запуск

### Предварительные требования

- Bun 1.0+ (рекомендуется) или Node.js 18+
- PostgreSQL
- GitHub Personal Access Token

### 1. Клонирование репозитория

\`\`\`bash
git clone <repository-url>
cd github-crm
\`\`\`

### 2. Установка зависимостей

\`\`\`bash
bun install
# или
npm install
\`\`\`

### 3. Настройка базы данных

Создайте PostgreSQL базу данных и настройте переменные окружения:

\`\`\`bash
# Создайте файл .env.local
cp .env.example .env.local
\`\`\`

Заполните `.env.local`:

\`\`\`env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/github_crm?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# GitHub API
GITHUB_TOKEN="your-github-token-here"
\`\`\`

### 4. Настройка Drizzle ORM

\`\`\`bash
# Генерация миграций
bun run db:generate

# Применение миграций к базе данных
bun run db:push
\`\`\`

### 5. Запуск приложения

\`\`\`bash
# Режим разработки
bun run dev

# Или сборка для продакшена
bun run build
bun run start
\`\`\`

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

## Получение GitHub Token

1. Перейдите в GitHub Settings → Developer settings → Personal access tokens
2. Создайте новый токен (Classic)
3. Выберите scope: `public_repo` (для доступа к публичным репозиториям)
4. Скопируйте токен и добавьте в `.env.local`

## Использование

### Регистрация
1. Откройте приложение в браузере
2. Нажмите "Создать новый аккаунт" 
3. Введите email и пароль
4. Подтвердите регистрацию

### Авторизация
1. Введите email и пароль на странице входа
2. Нажмите "Войти"

### Добавление проекта
1. На главной странице нажмите "Добавить проект"
2. Введите путь к репозиторию в формате `owner/repository` (например: `facebook/react`)
3. Нажмите "Добавить"

### Управление проектами
- **Обновить** - получить актуальные данные из GitHub API
- **Открыть** - перейти на страницу репозитория в GitHub  
- **Удалить** - удалить проект из списка

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/signin` - Вход в систему
- `POST /api/auth/signout` - Выход из системы

### Проекты
- `GET /api/projects` - Получить список проектов пользователя
- `POST /api/projects` - Добавить новый проект
- `PUT /api/projects/[id]` - Обновить проект
- `DELETE /api/projects/[id]` - Удалить проект

## Структура проекта

\`\`\`
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Страницы аутентификации
│   ├── dashboard/         # Главная страница приложения
│   └── globals.css        # Глобальные стили
├── components/            # React компоненты
├── lib/                   # Утилиты и библиотеки
├── drizzle/              # Миграции базы данных
└── public/               # Статические файлы
\`\`\`

## База данных

### Модель User
- `id` - Уникальный идентификатор
- `email` - Email пользователя (уникальный)
- `password` - Хеш пароля
- `createdAt` - Дата создания
- `updatedAt` - Дата обновления

### Модель Project  
- `id` - Уникальный идентификатор
- `owner` - Владелец репозитория
- `name` - Название репозитория
- `url` - URL репозитория
- `stars` - Количество звезд
- `forks` - Количество форков  
- `issues` - Количество открытых issues
- `githubId` - ID репозитория в GitHub
- `description` - Описание репозитория
- `language` - Основной язык программирования
- `userId` - Связь с пользователем
- `createdAt` - Дата добавления
- `updatedAt` - Дата последнего обновления

## Команды разработки

\`\`\`bash
# Запуск в режиме разработки
bun run dev

# Сборка приложения
bun run build

# Запуск собранного приложения
bun run start

# Линтинг кода
bun run lint

# Работа с базой данных
bun run db:push      # Применить изменения схемы
bun run db:studio    # Открыть Drizzle Studio
bun run db:generate  # Сгенерировать миграции
\`\`\`

## 🐳 Docker Deployment

Для быстрого развертывания с Docker:

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd github-crm

# Настройте переменные окружения
cp env.example .env.local
# Отредактируйте .env.local с вашими настройками

# Запустите с Docker Compose
docker-compose up -d
```

Подробные инструкции: [Docker Deployment Guide](./docker-deploy.md)

## Лицензия

MIT License 