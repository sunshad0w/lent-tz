# Лента — Страница профиля с лентой постов

Fullstack-приложение: страница профиля пользователя с лентой постов.

## Технологический стек

**Frontend**: React + TypeScript, TanStack Query, Zustand, Mantine v7+, CSS Modules

**Backend**: NestJS + TypeScript, PostgreSQL 16 + TypeORM, JWT-аутентификация

**Инфраструктура**: Docker + docker-compose

## Быстрый старт

### 1. Клонировать и настроить

```bash
git clone <repo-url>
cd lent-tz
cp .env.example .env
```

### 2. Запустить backend + БД

```bash
docker-compose up --build
```

Backend API будет доступен на http://localhost:3000/api

### 3. Запустить frontend (отдельный терминал)

```bash
cd frontend
npm install
npm run dev
```

Frontend будет доступен на http://localhost:5173

> Frontend проксирует API-запросы `/api/*` на backend (настроено в `vite.config.ts`).

### Альтернатива: полностью локальная разработка

```bash
# Запустить только БД
docker-compose up postgres

# Backend (терминал 1)
cd backend
npm install
npm run start:dev

# Frontend (терминал 2)
cd frontend
npm install
npm run dev
```

### Тесты

```bash
# Backend тесты
cd backend && npm test

# Frontend тесты
cd frontend && npm test

# С покрытием
cd backend && npm run test:cov
cd frontend && npm run test:coverage
```

## Переменные окружения

Скопируйте `.env.example` в `.env` и при необходимости измените значения:

| Переменная | Описание | По умолчанию |
|------------|----------|:---:|
| DB_HOST | Хост PostgreSQL | postgres |
| DB_PORT | Порт PostgreSQL | 5432 |
| DB_NAME | Имя базы данных | lent_db |
| DB_USER | Пользователь БД | postgres |
| DB_PASSWORD | Пароль БД | postgres |
| JWT_ACCESS_SECRET | Секрет access-токена | — |
| JWT_REFRESH_SECRET | Секрет refresh-токена | — |
| PORT | Порт backend | 3000 |
| NODE_ENV | Окружение | development |

## Функционал

- Регистрация и авторизация (JWT access + refresh)
- Просмотр и inline-редактирование профиля
- Загрузка аватара (Drag & Drop)
- Лента постов с пагинацией («Загрузить ещё») и сортировкой
- Создание, редактирование и удаление постов
- Загрузка изображений к постам (до 10, макс. 10 МБ)

## API эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /api/auth/register | Регистрация |
| POST | /api/auth/login | Вход |
| POST | /api/auth/refresh | Обновление токенов |
| POST | /api/auth/logout | Выход |
| GET | /api/profile | Получить профиль |
| PATCH | /api/profile | Обновить профиль |
| PATCH | /api/profile/avatar | Загрузить аватар |
| GET | /api/posts | Список постов (limit/offset/sort) |
| POST | /api/posts | Создать пост |
| PATCH | /api/posts/:id | Обновить пост |
| DELETE | /api/posts/:id | Удалить пост (soft-delete) |
