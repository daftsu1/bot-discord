import { db } from '../connection.js';

/**
 * Repositorio para operaciones de la lista de compras.
 * Separa la lógica de persistencia del negocio.
 */

export const shoppingRepository = {
  addItem(guildId, channelId, name, quantity = 1, category = null) {
    const normalizedName = name.trim().toLowerCase();
    db.prepare(`
      INSERT INTO shopping_items (guild_id, channel_id, name, quantity, category, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(guild_id, channel_id, name) DO UPDATE SET
        quantity = quantity + excluded.quantity,
        category = COALESCE(excluded.category, category),
        updated_at = datetime('now')
    `).run(guildId, channelId, normalizedName, quantity, category);

    return db.prepare(`
      SELECT id, name, quantity, category, is_purchased
      FROM shopping_items 
      WHERE guild_id = ? AND channel_id = ? AND LOWER(name) = ?
    `).get(guildId, channelId, normalizedName);
  },

  removeItem(guildId, channelId, name) {
    const result = db.prepare(`
      DELETE FROM shopping_items 
      WHERE guild_id = ? AND channel_id = ? AND LOWER(name) = LOWER(?)
      RETURNING id
    `).run(guildId, channelId, name.trim());
    return { rowCount: result.changes };
  },

  getItems(guildId, channelId, { includePurchased = true } = {}) {
    let query = `
      SELECT id, name, quantity, category, is_purchased, purchased_at, purchased_by
      FROM shopping_items 
      WHERE guild_id = ? AND channel_id = ?
    `;
    if (!includePurchased) {
      query += ` AND is_purchased = 0`;
    }
    query += ` ORDER BY category, name`;

    const stmt = db.prepare(query);
    return stmt.all(guildId, channelId);
  },

  markAsPurchased(guildId, channelId, itemName, userId) {
    const stmt = db.prepare(`
      UPDATE shopping_items 
      SET is_purchased = 1, purchased_at = datetime('now'), purchased_by = ?, updated_at = datetime('now')
      WHERE guild_id = ? AND channel_id = ? AND LOWER(name) = LOWER(?)
      RETURNING id, name, quantity, category
    `);
    return stmt.get(userId, guildId, channelId, itemName.trim());
  },

  unmarkAsPurchased(guildId, channelId, itemName) {
    const stmt = db.prepare(`
      UPDATE shopping_items 
      SET is_purchased = 0, purchased_at = NULL, purchased_by = NULL, updated_at = datetime('now')
      WHERE guild_id = ? AND channel_id = ? AND LOWER(name) = LOWER(?)
      RETURNING id, name, quantity, category
    `);
    return stmt.get(guildId, channelId, itemName.trim());
  },

  clearList(guildId, channelId, { purchasedOnly = false } = {}) {
    let query = `DELETE FROM shopping_items WHERE guild_id = ? AND channel_id = ?`;
    if (purchasedOnly) {
      query += ` AND is_purchased = 1`;
    }
    const result = db.prepare(query).run(guildId, channelId);
    return { rowCount: result.changes };
  }
};
