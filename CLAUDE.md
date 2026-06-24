# teso-lib

Vue 3 + Vite + Capacitor (Android). UI — Tailwind CSS v4 + daisyUI. Состояние — Pinia. Роутинг — vue-router. Язык — TypeScript.

## Доступные библиотеки — проверь перед написанием фичи

Перед реализацией новой фичи **сначала посмотри, что уже установлено в проекте, и переиспользуй это**. Не пиши с нуля то, что уже решается готовой библиотекой, и не добавляй новую зависимость, если задачу закрывает существующая. Полный список — в `package.json`.

- **@vueuse/core** — большая коллекция готовых composable-утилит (`useLocalStorage`, `useFetch`, `useDark`, `useEventListener`, `useDebounceFn`, `useClipboard`, `useGeolocation` и др.). **Первым делом ищи готовый composable здесь**, прежде чем писать собственную реактивную логику.
- **Pinia** — глобальное состояние, setup-stores.
- **vue-router** — навигация и маршруты.
- **Tailwind CSS v4 + daisyUI** — стилизация. Используй классы daisyUI (`btn`, `card`, `modal`, `input` и т.д.) вместо ручной верстки одинаковых элементов.
- **@capacitor/core** / **@capacitor/android** — нативный мост (камера, гео, файлы и т.д. через плагины Capacitor).

## Правила написания кода (в т.ч. для ИИ)

- **Без комментариев.** Не добавляй комментарии в код, если пользователь явно об этом не попросил. Имена переменных, функций и компонентов должны делать код самодокументируемым.
- **Не копипастить.** Если фрагмент кода повторяется — сразу выноси его в отдельный компонент (`src/components/`) или composable (`src/composables/`). Дублирование недопустимо.
- **Композиция через composables.** Переиспользуемую реактивную логику оформляй как composable (`useXxx`) в `src/composables/`, а не дублируй в компонентах.

## Конвенции Vue

- Только **Composition API** + `<script setup lang="ts">`. Options API не использовать.
- Порядок блоков в SFC: `<template>` → `<script setup>` → `<style scoped>`.
- Имена компонентов — **PascalCase**, многословные (`UserCard.vue`, а не `Card.vue`).
- Props и emits — типизированные дженериками: `defineProps<{ ... }>()`, `defineEmits<{ ... }>()`.
- Стили — `<style scoped>` по умолчанию.
- TypeScript везде, без `any`.
- Pinia — setup-stores (функция-фабрика с `ref`/`computed`/функциями), как в `src/stores/counter.ts`.
- Форматирование — oxfmt: без `;`, одинарные кавычки, отступ 2 пробела. Стиль вручную не правь — полагайся на форматтер/линтер.

## Структура

- `src/components/` — переиспользуемые компоненты
- `src/views/` — страницы (точки роутинга)
- `src/stores/` — Pinia-сторы
- `src/composables/` — переиспользуемая логика (composables)
- `src/router/` — маршруты
- `src/assets/` — стили и статика

## Мобильная разработка — тач-таргеты

Приложение рассчитано на телефон. Все интерактивные элементы (кнопки, иконки-кнопки, чекбоксы, чипы, ссылки) должны быть удобны для пальца:

- **Минимальная зона нажатия — 44–48px.** Apple HIG: ≥ 44×44 pt; Material Design 3 (Android): ≥ 48×48 dp; WCAG 2.2 (минимум, AA): ≥ 24×24 px. Ориентир — 44–48px.
- Иконка может быть визуально маленькой (16–24px), но **область нажатия** добивается размером/отступами до 44–48px. Для icon-кнопок используй `<UiButton icon>` — он даёт квадрат ≥44px.
- Между соседними тач-целями — отступ не меньше 8px.
- Деструктивные действия (удаление) — с подтверждением или возможностью отмены.

Источники:

- [Apple HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple HIG — Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
- [Material Design 3 — Accessibility](https://m3.material.io/foundations/designing/structure)
- [Android Developers — Make apps more accessible](https://developer.android.com/guide/topics/ui/accessibility/apps)
- [WCAG 2.2 — Target Size (Minimum) 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

## Правила коммитов

Сообщение коммита начинается с тега слоя в квадратных скобках, затем — краткое описание на русском:

```text
[СЛОЙ]: что сделано
```

Один коммит — один слой. Если изменение затрагивает несколько слоёв, разбей на отдельные коммиты. Теги слоёв:

- `[FRONT]` — Vue: страницы, компоненты, UI-кит, роутер, стили
- `[SQL]` — БД: схема, миграции, запросы (`src/db`)
- `[STORE]` — Pinia-сторы (`src/stores`)
- `[DATA]` — статические данные справочника (`src/assets/data`)
- `[CONF]` — конфигурация и тулинг (Vite, TypeScript, ESLint/oxlint, Tailwind, зависимости)
- `[CAP]` — Capacitor и нативная часть (Android)
- `[DOCS]` — документация (README, CLAUDE.md)

Примеры:

- `[FRONT]: добавил страницу пантеона с модалкой божества`
- `[SQL]: миграция v3 — таблица квестов`

## Команды

- `npm run dev` — дев-сервер
- `npm run build` — type-check + production-сборка
- `npm run lint` — oxlint + eslint с автофиксом
- `npm run format` — форматирование oxfmt
- `npm run cap:android` — сборка и открытие проекта в Android Studio
