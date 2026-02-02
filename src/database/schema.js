import { db } from './connection.js';

/**
 * Inicializa el esquema de la base de datos.
 * Listas nombradas por canal: varios usuarios pueden unirse a una lista grupal
 * o usar cada uno su lista personal en el mismo canal.
 */
export function initSchema() {
  // Crear solo tablas de listas y tokens; shopping_items se crea o migra después
  db.exec(`
    CREATE TABLE IF NOT EXISTS lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_by TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(guild_id, channel_id, name)
    );
    CREATE INDEX IF NOT EXISTS idx_lists_channel ON lists(guild_id, channel_id);

    CREATE TABLE IF NOT EXISTS list_members (
      list_id INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL,
      joined_at TEXT DEFAULT (datetime('now')),
      UNIQUE(list_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS idx_list_members_list ON list_members(list_id);
    CREATE INDEX IF NOT EXISTS idx_list_members_user ON list_members(user_id);

    CREATE TABLE IF NOT EXISTS user_list_preference (
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      list_id INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(guild_id, channel_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS idx_user_pref_channel ON user_list_preference(guild_id, channel_id, user_id);

    CREATE TABLE IF NOT EXISTS list_tokens (
      token TEXT PRIMARY KEY,
      list_id INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_list_tokens_list ON list_tokens(list_id);

    CREATE TABLE IF NOT EXISTS channel_tokens (
      token TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(guild_id, channel_id)
    );
    CREATE INDEX IF NOT EXISTS idx_channel_tokens_lookup ON channel_tokens(guild_id, channel_id);
  `);

  ensureShoppingItemsTable();
}

/** Crea shopping_items si no existe, o migra desde esquema antiguo (guild_id/channel_id) y aplica índices. */
function ensureShoppingItemsTable() {
  const tableExists = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='shopping_items'"
  ).get();

  if (!tableExists) {
    db.exec(`
      CREATE TABLE shopping_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        list_id INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        category TEXT,
        unit TEXT,
        is_purchased INTEGER DEFAULT 0,
        purchased_at TEXT,
        purchased_by TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        UNIQUE(list_id, name)
      );
      CREATE INDEX IF NOT EXISTS idx_shopping_list ON shopping_items(list_id);
      CREATE INDEX IF NOT EXISTS idx_shopping_purchased ON shopping_items(is_purchased);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_shopping_list_name ON shopping_items(list_id, name);
    `);
    return;
  }

  const tableInfo = db.prepare('PRAGMA table_info(shopping_items)').all();
  const hasListId = tableInfo.some(c => c.name === 'list_id');
  const hasGuildId = tableInfo.some(c => c.name === 'guild_id');

  if (!hasListId && hasGuildId) {
    db.exec('ALTER TABLE shopping_items ADD COLUMN list_id INTEGER REFERENCES lists(id)');
    runListsMigration();
    runRecreateItemsTable();
  } else if (hasListId && hasGuildId) {
    runListsMigration();
    runRecreateItemsTable();
  }

  try {
    db.exec('CREATE INDEX IF NOT EXISTS idx_shopping_list ON shopping_items(list_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_shopping_purchased ON shopping_items(is_purchased)');
    // Índice único para que INSERT ... ON CONFLICT(list_id, name) funcione (p. ej. tras migración antigua)
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_shopping_list_name ON shopping_items(list_id, name)');
  } catch (_) {}

  const currentInfo = db.prepare('PRAGMA table_info(shopping_items)').all();
  if (!currentInfo.some(c => c.name === 'unit')) {
    db.exec('ALTER TABLE shopping_items ADD COLUMN unit TEXT');
  }
}

function runRecreateItemsTable() {
  try {
    const tableInfo = db.prepare('PRAGMA table_info(shopping_items)').all();
    if (!tableInfo.some(c => c.name === 'list_id')) return;
    const withNull = db.prepare('SELECT COUNT(1) as n FROM shopping_items WHERE list_id IS NULL').get();
    if (withNull.n > 0) return;

    db.exec(`
      CREATE TABLE IF NOT EXISTS shopping_items_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        list_id INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        category TEXT,
        unit TEXT,
        is_purchased INTEGER DEFAULT 0,
        purchased_at TEXT,
        purchased_by TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        UNIQUE(list_id, name)
      )
    `);
    db.prepare(`
      INSERT INTO shopping_items_new (id, list_id, name, quantity, category, unit, is_purchased, purchased_at, purchased_by, created_at, updated_at)
      SELECT id, list_id, name, quantity, category, unit, is_purchased, purchased_at, purchased_by, created_at, updated_at
      FROM shopping_items
    `).run();
    db.exec('DROP TABLE shopping_items');
    db.exec('ALTER TABLE shopping_items_new RENAME TO shopping_items');
    db.exec('CREATE INDEX IF NOT EXISTS idx_shopping_list ON shopping_items(list_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_shopping_purchased ON shopping_items(is_purchased)');
  } catch (_) {}
}

function runListsMigration() {
  try {
    const info = db.prepare('PRAGMA table_info(shopping_items)').all();
    const hasListId = info.some(c => c.name === 'list_id');
    if (!hasListId) return;

    const withNull = db.prepare('SELECT COUNT(1) as n FROM shopping_items WHERE list_id IS NULL').get();
    if (withNull.n === 0) return;

    const channels = db.prepare('SELECT DISTINCT guild_id, channel_id FROM shopping_items WHERE list_id IS NULL').all();
    for (const ch of channels) {
      const exists = db.prepare(
        "SELECT id FROM lists WHERE guild_id = ? AND channel_id = ? AND name = 'general'"
      ).get(ch.guild_id, ch.channel_id);
      if (!exists) {
        db.prepare(
          "INSERT INTO lists (guild_id, channel_id, name, created_by) VALUES (?, ?, 'general', NULL)"
        ).run(ch.guild_id, ch.channel_id);
      }
      const list = db.prepare(
        "SELECT id FROM lists WHERE guild_id = ? AND channel_id = ? AND name = 'general'"
      ).get(ch.guild_id, ch.channel_id);
      if (list) {
        db.prepare(
          'UPDATE shopping_items SET list_id = ? WHERE guild_id = ? AND channel_id = ? AND list_id IS NULL'
        ).run(list.id, ch.guild_id, ch.channel_id);
      }
    }
  } catch (_) {}
}
