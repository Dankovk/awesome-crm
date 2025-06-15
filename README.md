# GitHub CRM

Проста система управління проєктами (CRM) для публічних проєктів GitHub, побудована на Next.js, TypeScript, PostgreSQL та Drizzle ORM.

## Можливості

- 🔐 Реєстрація та авторизація користувачів
- 📊 Відображення інформації про GitHub репозиторії:
  - Власник проєкту
  - Назва проєкту  
  - URL проєкту
  - Кількість зірок (stars)
  - Кількість форків (forks)
  - Кількість відкритих issues
  - Дата створення у форматі UTC Unix timestamp
- ➕ Додавання репозиторіїв за шляхом (наприклад: facebook/react)
- 🔄 Оновлення даних проєктів з GitHub API
- 🗑️ Видалення проєктів
- 📱 Адаптивний дизайн

## Технологічний стек

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **База даних**: PostgreSQL
- **ORM**: Drizzle ORM
- **Аутентифікація**: NextAuth.js
- **UI**: Lucide React, React Hook Form
- **Валідація**: Zod

## Встановлення та запуск

### Попередні вимоги

- Bun 1.0+ (рекомендується) або Node.js 18+
- PostgreSQL
- GitHub Personal Access Token

### 1. Клонування репозиторію

```bash
git clone <repository-url>
cd github-crm
```

### 2. Встановлення залежностей

```bash
bun install
# або
npm install
```

### 3. Налаштування бази даних

Створіть PostgreSQL базу даних та налаштуйте змінні оточення:

```bash
# Створіть файл .env.local
cp .env.example .env.local
```

Заповніть `.env.local`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/github_crm?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# GitHub API
GITHUB_TOKEN="your-github-token-here"
```

### 4. Налаштування Drizzle ORM

```bash
# Генерація міграцій
bun run db:generate

# Застосування міграцій до бази даних
bun run db:push
```

### 5. Запуск додатку

```bash
# Режим розробки
bun run dev

# Або збірка для продакшену
bun run build
bun run start
```

Додаток буде доступний за адресою [http://localhost:3000](http://localhost:3000)

## Отримання GitHub Token

1. Перейдіть в GitHub Settings → Developer settings → Personal access tokens
2. Створіть новий токен (Classic)
3. Виберіть scope: `public_repo` (для доступу до публічних репозиторіїв)
4. Скопіюйте токен та додайте в `.env.local`

## Використання

### Реєстрація
1. Відкрийте додаток у браузері
2. Натисніть "Створити новий акаунт" 
3. Введіть email та пароль
4. Підтвердіть реєстрацію

### Авторизація
1. Введіть email та пароль на сторінці входу
2. Натисніть "Увійти"

### Додавання проєкту
1. На головній сторінці натисніть "Додати проєкт"
2. Введіть шлях до репозиторію у форматі `owner/repository` (наприклад: `facebook/react`)
3. Натисніть "Додати"

### Управління проєктами
- **Оновити** - отримати актуальні дані з GitHub API
- **Відкрити** - перейти на сторінку репозиторію в GitHub  
- **Видалити** - видалити проєкт зі списку

## API Endpoints

### Аутентифікація
- `POST /api/auth/register` - Реєстрація користувача
- `POST /api/auth/signin` - Вхід в систему
- `POST /api/auth/signout` - Вихід з системи

### Проєкти
- `GET /api/projects` - Отримати список проєктів користувача
- `POST /api/projects` - Додати новий проєкт
- `PUT /api/projects/[id]` - Оновити проєкт
- `DELETE /api/projects/[id]` - Видалити проєкт

## Структура проєкту

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Сторінки аутентифікації
│   ├── dashboard/         # Головна сторінка додатку
│   └── globals.css        # Глобальні стилі
├── components/            # React компоненти
├── lib/                   # Утиліти та бібліотеки
├── drizzle/              # Міграції бази даних
└── public/               # Статичні файли
```

## База даних

### Модель User
- `id` - Унікальний ідентифікатор
- `email` - Email користувача (унікальний)
- `password` - Хеш пароля
- `createdAt` - Дата створення
- `updatedAt` - Дата оновлення

### Модель Project  
- `id` - Унікальний ідентифікатор
- `owner` - Власник репозиторію
- `name` - Назва репозиторію
- `url` - URL репозиторію
- `stars` - Кількість зірок
- `forks` - Кількість форків  
- `issues` - Кількість відкритих issues
- `githubId` - ID репозиторію в GitHub
- `description` - Опис репозиторію
- `language` - Основна мова програмування
- `userId` - Зв'язок з користувачем
- `createdAt` - Дата додавання
- `updatedAt` - Дата останнього оновлення

## Команди розробки

```bash
# Запуск в режимі розробки
bun run dev

# Збірка додатку
bun run build

# Запуск зібраного додатку
bun run start

# Лінтинг коду
bun run lint

# Робота з базою даних
bun run db:push      # Застосувати зміни схеми
bun run db:studio    # Відкрити Drizzle Studio
bun run db:generate  # Згенерувати міграції
```

## 🚀 Розгортання

### Docker (локально)

```bash
# Запуск з Docker Compose
docker-compose up -d

# Зупинка
docker-compose down
```

### Railway (рекомендується для продакшену)

Для розгортання на Railway дотримуйтесь інструкцій в [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md).

**Швидкий старт:**
1. Зареєструйтесь на [railway.app](https://railway.app)
2. Підключіть GitHub репозиторій
3. Додайте PostgreSQL базу даних
4. Налаштуйте змінні оточення
5. Розгорніть додаток

Railway надає:
- ✅ Безкоштовний тариф ($5/місяць кредитів)
- ✅ Автоматичні збірки з Dockerfile
- ✅ Керована PostgreSQL база даних
- ✅ SSL сертифікати
- ✅ Моніторинг та логи

## Ліцензія

MIT License 