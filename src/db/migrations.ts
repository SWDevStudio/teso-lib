import type { capSQLiteVersionUpgrade } from '@capacitor-community/sqlite'

export const DB_NAME = 'teso'

// Текущая версия схемы. Поднимайте на +1 и добавляйте новый объект в `upgrades`,
// когда нужно изменить схему или долить данные у уже установленных приложений.
export const DB_VERSION = 2

// Версионные миграции. Каждый объект применяется один раз, когда БД доходит до его toVersion.
// statements[] выполняются по порядку.
export const upgrades: capSQLiteVersionUpgrade[] = [
  {
    toVersion: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS articles (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        title      TEXT NOT NULL,
        body       TEXT NOT NULL,
        author     TEXT,
        tags       TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        is_builtin INTEGER NOT NULL DEFAULT 0
      );`,

      // Полнотекстовый поиск по статьям (FTS5, внешний контент = таблица articles).
      `CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
        title, body, content='articles', content_rowid='id'
      );`,

      // Триггеры синхронизации FTS-индекса с таблицей articles.
      `CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
        INSERT INTO articles_fts(rowid, title, body) VALUES (new.id, new.title, new.body);
      END;`,
      `CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
        INSERT INTO articles_fts(articles_fts, rowid, title, body) VALUES ('delete', old.id, old.title, old.body);
      END;`,
      `CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE ON articles BEGIN
        INSERT INTO articles_fts(articles_fts, rowid, title, body) VALUES ('delete', old.id, old.title, old.body);
        INSERT INTO articles_fts(rowid, title, body) VALUES (new.id, new.title, new.body);
      END;`,

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
]
