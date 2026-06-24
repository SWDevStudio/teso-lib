import type { capSQLiteVersionUpgrade } from '@capacitor-community/sqlite'

export const DB_NAME = 'teso'

// Текущая версия схемы. Поднимайте на +1 и добавляйте новый объект в `upgrades`,
// когда нужно изменить схему или долить данные у уже установленных приложений.
export const DB_VERSION = 3

// Версионные миграции. Каждый объект применяется один раз, когда БД доходит до его toVersion.
// statements[] выполняются по порядку.
export const upgrades: capSQLiteVersionUpgrade[] = [
  {
    toVersion: 1,
    statements: [
      // Без FTS5: его модуль отсутствует в сборке sql.js, на которой работает
      // jeep-sqlite в браузере, — иначе вся миграция откатывается и в web нет
      // ни одной таблицы. Поиск по статьям реализован через LIKE (см. articles.ts).
      `CREATE TABLE IF NOT EXISTS articles (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        title      TEXT NOT NULL,
        body       TEXT NOT NULL,
        author     TEXT,
        tags       TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        is_builtin INTEGER NOT NULL DEFAULT 0
      );`,

      // --- Начальные (встроенные) данные библиотеки. Замените на свои. ---
      // Если справочник большой — лучше собрать готовый app.db и подключить через copyFromAssets
      // (см. README плагина), а отсюда сид убрать.
      `INSERT INTO articles (title, body, author, tags, is_builtin) VALUES
        ('Добро пожаловать', 'Это первая встроенная статья библиотеки.', 'Система', '["intro"]', 1),
        ('Как добавить статью', 'Вызовите addArticle() из src/db. Поиск — searchArticles().', 'Система', '["howto"]', 1);`,
    ],
  },
  {
    toVersion: 2,
    statements: [
      // Заметки пользователя.
      `CREATE TABLE IF NOT EXISTS notes (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        title      TEXT NOT NULL DEFAULT '',
        body       TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );`,

      // Метки (лейблы), которые пользователь создаёт сам — по ним фильтруются персонажи.
      `CREATE TABLE IF NOT EXISTS labels (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL COLLATE NOCASE UNIQUE,
        color      TEXT NOT NULL DEFAULT 'primary',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );`,

      // Важные персонажи (игроки): имя, реальное имя, титулы, заметка.
      `CREATE TABLE IF NOT EXISTS characters (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL,
        real_name  TEXT,
        title      TEXT,
        note       TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );`,

      // Связь «персонаж ↔ лейбл» (у персонажа может быть несколько лейблов).
      `CREATE TABLE IF NOT EXISTS character_labels (
        character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
        label_id     INTEGER NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
        PRIMARY KEY (character_id, label_id)
      );`,
    ],
  },
  {
    toVersion: 3,
    statements: [
      // Связь «заметка ↔ лейбл» (фильтр заметок по лейблам).
      `CREATE TABLE IF NOT EXISTS note_labels (
        note_id  INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
        label_id INTEGER NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
        PRIMARY KEY (note_id, label_id)
      );`,
    ],
  },
]
