# Frontend — React SPA

Страница профиля пользователя с лентой постов.

## Стек

- React 18 + TypeScript (strict)
- Vite
- Mantine v7+ (UI-компоненты, CSS Modules)
- TanStack Query v5 (кеширование API)
- Zustand (локальный стейт)
- axios (HTTP-клиент)

## Запуск

```bash
npm install
npm run dev
```

Откроется на http://localhost:5173. API-запросы проксируются на http://localhost:3000 (настроено в `vite.config.ts`).

## Тесты

```bash
npm test              # Запуск тестов (Vitest)
npm run test:coverage # С покрытием
npm run test:watch    # Watch-режим
```

## Структура

```
src/
  pages/              # Страницы (Login, Register, Profile)
  components/         # UI-компоненты
    ProfileCard/      # Карточка профиля (просмотр + inline-редактирование)
    AvatarUpload/     # Загрузка аватара (Dropzone в модалке)
    PostFeed/         # Лента постов (пагинация, сортировка)
    PostCard/         # Карточка поста (редактирование, удаление)
    PostForm/         # Форма создания поста
    Layout/           # AppShell с хедером
    ErrorBoundary/    # Обработка ошибок
  hooks/              # Кастомные хуки (useAuth, useProfile, usePosts)
  services/           # API-клиент (axios + interceptors)
  stores/             # Zustand (auth store)
  types/              # TypeScript-типы
```
