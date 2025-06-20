# GitHub CRM
Cистема управління проєктами (CRM) для публічних проєктів GitHub, побудована на Next.js, TypeScript, PostgreSQL та Drizzle ORM.

**Демо: [https://universe-testovoe-production.up.railway.app](https://universe-testovoe-production.up.railway.app)**

## Можливості

- 🔐 Реєстрація та авторизація користувачів (локальна та через GitHub).
- 📊 Відображення інформації про GitHub репозиторії:
  - Власник та назва проєкту
  - URL проєкту
  - Кількість зірок, форків, та відкритих issues
  - Дата створення
- ➕ Додавання репозиторіїв за шляхом (наприклад: `facebook/react`).
- 🔄 Оновлення даних проєктів з GitHub API.
- 🗑️ Видалення проєктів.
- 📱 Адаптивний дизайн з підтримкою світлої та темної теми.

## Технологічний стек

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **База даних**: PostgreSQL
- **ORM**: Drizzle ORM
- **Аутентифікація**: NextAuth.js
- **UI**: shadcn/ui, Lucide React, React Hook Form
- **Валідація**: Zod
- **Інструменти для розробки**: Biome (Linter/Formatter), Docker

## Встановлення та запуск

### Попередні вимоги

- Bun 1.0+
- Docker та Docker Compose (для запуску PostgreSQL)


### 1. Встановлення залежностей

Проєкт використовує `bun` як пакетний менеджер.

```bash
bun install
```

### 2. Налаштування середовища

Створіть файл `.env.local` з копії `.env.example` та заповніть його вашими даними.

```bash
cp .env.example .env.local
```

Заповніть `.env.local`:

```env
# Підключення до бази даних
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/github_crm"
DATABASE_HOST="localhost"
DATABASE_USER="postgres"
DATABASE_PASSWORD="postgres"
DATABASE_NAME="github_crm"
DATABASE_PORT="5432"
DATABASE_SSL="false"

# Налаштування NextAuth.js
# Згенеруйте новий секретний ключ, наприклад, через `openssl rand -base64 32`
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET"

# GitHub OAuth App
# Створіть новий GitHub OAuth App у налаштуваннях вашого профілю
GITHUB_ID="YOUR_GITHUB_ID"
GITHUB_SECRET="YOUR_GITHUB_SECRET"
```

### 3. Запуск бази даних

Найпростіший спосіб запустити PostgreSQL - це використати Docker.

```bash
docker-compose up -d postgres
```

### 4. Налаштування Drizzle ORM

```bash
# Генерація міграцій (якщо ви змінили схему)
bun run db:generate

# Застосування міграцій до бази даних
bun run db:push
```

### 5. Запуск додатку

```bash
# Режим розробки
bun run dev
```

Додаток буде доступний за адресою [http://localhost:3000](http://localhost:3000).

## Використання

### Реєстрація та вхід
Ви можете зареєструватися, використовуючи email та пароль, або увійти за допомогою вашого GitHub акаунту.

### Додавання проєкту
1. На головній сторінці натисніть "Додати проєкт".
2. Введіть шлях до репозиторію у форматі `owner/repository` (наприклад: `facebook/react`).
3. Натисніть "Додати". Додаток спробує отримати дані для публічних репозиторіїв. Для приватних репозиторіїв потрібна авторизація через GitHub.

### Управління проєктами
- **Оновити** - отримати актуальні дані з GitHub API.
- **Відкрити** - перейти на сторінку репозиторію в GitHub.
- **Видалити** - видалити проєкт зі списку.

## API Endpoints

### Аутентифікація
Аутентифікація реалізована через NextAuth.js. Основні ендпоінти знаходяться за адресою `/api/auth/*`.

- `POST /api/auth/register` - Реєстрація нового користувача (локально).

### Проєкти
- `GET /api/projects` - Отримати список проєктів поточного користувача.
- `POST /api/projects` - Додати новий проєкт.
- `PUT /api/projects/[id]` - Оновити дані проєкту з GitHub API.
- `DELETE /api/projects/[id]` - Видалити проєкт.

## Структура проєкту

```
.
├── app/                  # Next.js App Router
│   ├── api/              # API routes
│   ├── auth/             # Сторінки аутентифікації
│   └── dashboard/        # Головна сторінка додатку
├── components/           # React компоненти (UI та кастомні)
├── drizzle/              # Файли міграцій Drizzle
├── lib/                  # Утиліти, моделі даних, конфігурація
│   ├── db/               # Схема та підключення до БД
│   ├── model/            # Моделі для роботи з даними (User, Project)
│   └── util/             # Допоміжні функції (включаючи auth)
├── public/               # Статичні файли
├── scripts/              # Скрипти (наприклад, для Docker)
├── types/                # Глобальні визначення типів TypeScript
└── ...                   # Файли конфігурації
```

## База даних

### Модель User
- `id` (string) - Унікальний ідентифікатор
- `email` (string) - Email користувача (унікальний)
- `password` (string) - Хеш пароля (для локальної реєстрації)
- `githubId` (string) - ID користувача в GitHub (для OAuth)
- `githubToken` (string) - Токен доступу GitHub
- `createdAt` (Date) - Дата створення
- `updatedAt` (Date) - Дата оновлення

### Модель Project
- `id` (string) - Унікальний ідентифікатор
- `owner` (string) - Власник репозиторію
- `name` (string) - Назва репозиторію
- `url` (string) - URL репозиторію
- `stars` (number) - Кількість зірок
- `forks` (number) - Кількість форків
- `issues` (number) - Кількість відкритих issues
- `githubId` (number) - ID репозиторію в GitHub
- `description` (string) - Опис репозиторію
- `language` (string) - Основна мова програмування
- `githubCreatedAt` (Date) - Дата створення репозиторію в GitHub
- `userId` (string) - Зв'язок з користувачем (foreign key)
- `createdAt` (Date) - Дата додавання
- `updatedAt` (Date) - Дата останнього оновлення

## Команди

```bash
# Запуск в режимі розробки
bun run dev

# Збірка додатку для продакшену
bun run build

# Запуск продакшн-збірки
bun run start

# Лінтинг та форматування коду
bun run lint

# Застосувати зміни схеми до БД
bun run db:push

# Відкрити Drizzle Studio для перегляду даних
bun run db:studio

# Згенерувати нові міграції (після зміни схеми)
bun run db:generate
```

## 🚀 Розгортання

### Docker

Для запуску додатку та бази даних у Docker контейнерах:
```bash
docker-compose up --build
```
Для зупинки:
```bash
docker-compose down
```