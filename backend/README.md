# Backend — NestJS API

REST API для страницы профиля с лентой постов.

## Стек

- NestJS + TypeScript (strict)
- PostgreSQL 16 + TypeORM
- JWT-аутентификация (access + refresh)
- class-validator для валидации DTO
- Multer для загрузки файлов

## Запуск

```bash
# Через Docker (рекомендуется)
cd .. && docker-compose up --build

# Локально (нужен PostgreSQL)
npm install
npm run start:dev
```

## Тесты

```bash
npm test              # Запуск тестов
npm run test:cov      # С покрытием
npm run test:watch    # Watch-режим
```

## Структура

```
src/
  modules/
    auth/           # Аутентификация (JWT, bcrypt)
    users/          # Профиль пользователя
    posts/          # CRUD постов
  entities/         # TypeORM-сущности
  dto/              # DTO с class-validator
  common/utils/     # Утилиты (загрузка файлов)
  migrations/       # Миграции БД
uploads/            # Загруженные файлы (аватары, фото постов)
```

## API

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /api/auth/register | Регистрация |
| POST | /api/auth/login | Вход |
| POST | /api/auth/refresh | Обновление токенов |
| POST | /api/auth/logout | Выход |
| GET | /api/profile | Профиль |
| PATCH | /api/profile | Обновить профиль |
| PATCH | /api/profile/avatar | Загрузить аватар |
| GET | /api/posts | Список постов |
| POST | /api/posts | Создать пост |
| PATCH | /api/posts/:id | Обновить пост |
| DELETE | /api/posts/:id | Удалить пост |
