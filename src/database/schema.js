import { db } from './connection.js';

/**
 * Inicializa el esquema de la base de datos.
 * Cada canal de texto tiene su propia lista de compras.
 */
export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS shopping_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      category TEXT,
      is_purchased INTEGER DEFAULT 0,
      purchased_at TEXT,
      purchased_by TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(guild_id, channel_id, name)
    );

    CREATE INDEX IF NOT EXISTS idx_shopping_channel 
      ON shopping_items(guild_id, channel_id);
    CREATE INDEX IF NOT EXISTS idx_shopping_purchased 
      ON shopping_items(is_purchased);

    CREATE TABLE IF NOT EXISTS channel_tokens (
      token TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(guild_id, channel_id)
    );
    CREATE INDEX IF NOT EXISTS idx_channel_tokens_lookup 
      ON channel_tokens(guild_id, channel_id);
  `);
}
