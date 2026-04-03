# CLAUDE.md

Этот файл содержит инструкции для Claude Code (claude.ai/code) при работе с данным репозиторием.

## Язык общения

Всегда отвечай на русском языке. Вся документация, комментарии в коде и коммит-сообщения — на русском.

## Обзор проекта

Fullstack-приложение: страница профиля пользователя с лентой постов.
Монорепозиторий с раздельными frontend и backend приложениями.

- **Frontend**: React + TypeScript, TanStack Query, Zustand, Mantine v7+ (CSS Modules)
- **Backend**: NestJS + TypeScript, PostgreSQL + TypeORM, JWT-аутентификация (access + refresh токены)
- **Инфраструктура**: Docker + docker-compose для PostgreSQL и backend-сервера
- **Хранение изображений**: локальная файловая система (`uploads/`)

## Архитектура

```
backend/          # NestJS-приложение
  src/
    modules/      # NestJS-модули (auth, users, posts)
    entities/     # TypeORM-сущности
    dto/          # DTO запросов и ответов
frontend/         # React-приложение
  src/
    pages/        # Страницы (страница профиля)
    components/   # Переиспользуемые UI-компоненты
    hooks/        # Кастомные React-хуки
    services/     # Слой API-клиента
    types/        # Общие TypeScript-типы
```

Frontend и backend взаимодействуют исключительно через REST API. Общий runtime-код между ними запрещён.

## Ключевые ограничения (из конституции проекта)

- TypeScript strict mode включён в обоих приложениях; использование `any` запрещено
- Все API-эндпоинты следуют REST-конвенциям с пагинацией `limit`/`offset`
- Prettier обязателен; весь код должен проходить проверку форматирования
- Файлы не должны превышать 300 строк
- Изменения БД только через миграции TypeORM (никакого `synchronize: true` в проде)
- Загрузки файлов должны проверять MIME-тип и размер
- Пароли хешируются через bcrypt

## Оптимизация работы

- Используй TeamCreate для параллельного выполнения независимых задач (создание файлов разных модулей, параллельный research и т.д.)
- Rules-файлы в `.claude/rules/` автоматически активируются по glob-паттернам — не дублируй их содержимое

## Specify-воркфлоу

Проект использует `.specify/` для планирования фич:
- `/speckit.specify` — создать спецификацию фичи
- `/speckit.plan` — сгенерировать план реализации
- `/speckit.tasks` — сгенерировать список задач
- `/speckit.implement` — выполнить задачи
- Конституция: `.specify/memory/constitution.md`

## Active Technologies
- TypeScript 5.x (strict mode), Node.js 20+ (001-profile-post-feed)
- PostgreSQL 16 (Docker), файловая система (`uploads/`) (001-profile-post-feed)
- N/A (все репозитории мокаются) (002-unit-tests)

## Recent Changes
- 001-profile-post-feed: Added TypeScript 5.x (strict mode), Node.js 20+
