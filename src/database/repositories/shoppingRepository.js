import { db } from '../connection.js';

/**
 * Repositorio de ítems de la lista de compras. Los ítems pertenecen a una lista (list_id).
 */
export const shoppingRepository = {
  addItem(listId, name, quantity = 1, category = null, unit = null) {
    const normalizedName = name.trim().toLowerCase();
    try {
      db.prepare(`
        INSERT INTO shopping_items (list_id, name, quantity, category, unit, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(list_id, name) DO UPDATE SET
          quantity = quantity + excluded.quantity,
          category = COALESCE(excluded.category, category),
          unit = COALESCE(excluded.unit, unit),
          updated_at = datetime('now')
      `).run(listId, normalizedName, quantity, category, unit);
    } catch (e) {
      if (e.code === 'SQLITE_ERROR' && e.message && e.message.includes('ON CONFLICT')) {
        this._addItemUpsert(listId, normalizedName, quantity, category, unit);
      } else {
        throw e;
      }
    }

    return db.prepare(`
      SELECT id, name, quantity, category, unit, is_purchased, price
      FROM shopping_items 
      WHERE list_id = ? AND LOWER(name) = ?
    `).get(listId, normalizedName);
  },

  _addItemUpsert(listId, normalizedName, quantity, category, unit) {
    const row = db.prepare(
      'SELECT id, quantity FROM shopping_items WHERE list_id = ? AND LOWER(name) = ?'
    ).get(listId, normalizedName);
    if (row) {
      db.prepare(`
        UPDATE shopping_items SET
          quantity = quantity + ?,
          category = COALESCE(?, category),
          unit = COALESCE(?, unit),
          updated_at = datetime('now')
        WHERE list_id = ? AND LOWER(name) = ?
      `).run(quantity, category, unit, listId, normalizedName);
    } else {
      db.prepare(`
        INSERT INTO shopping_items (list_id, name, quantity, category, unit, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `).run(listId, normalizedName, quantity, category, unit);
    }
  },

  removeItem(listId, name) {
    const result = db.prepare(`
      DELETE FROM shopping_items 
      WHERE list_id = ? AND LOWER(name) = LOWER(?)
      RETURNING id
    `).run(listId, name.trim());
    return { rowCount: result.changes };
  },

  getItems(listId, { includePurchased = true } = {}) {
    let query = `
      SELECT id, name, quantity, category, unit, is_purchased, purchased_at, purchased_by, price
      FROM shopping_items 
      WHERE list_id = ?
    `;
    if (!includePurchased) {
      query += ` AND is_purchased = 0`;
    }
    query += ` ORDER BY category, name`;

    const stmt = db.prepare(query);
    return stmt.all(listId);
  },

  markAsPurchased(listId, itemName, userId, price = null) {
    const stmt = db.prepare(`
      UPDATE shopping_items 
      SET is_purchased = 1, purchased_at = datetime('now'), purchased_by = ?, price = COALESCE(?, price), updated_at = datetime('now')
      WHERE list_id = ? AND LOWER(name) = LOWER(?)
      RETURNING id, name, quantity, category, unit, price
    `);
    return stmt.get(userId, price ?? null, listId, itemName.trim());
  },

  unmarkAsPurchased(listId, itemName) {
    const stmt = db.prepare(`
      UPDATE shopping_items 
      SET is_purchased = 0, purchased_at = NULL, purchased_by = NULL, price = NULL, updated_at = datetime('now')
      WHERE list_id = ? AND LOWER(name) = LOWER(?)
      RETURNING id, name, quantity, category, unit, price
    `);
    return stmt.get(listId, itemName.trim());
  },

  clearList(listId, { purchasedOnly = false } = {}) {
    let query = `DELETE FROM shopping_items WHERE list_id = ?`;
    if (purchasedOnly) {
      query += ` AND is_purchased = 1`;
    }
    const result = db.prepare(query).run(listId);
    return { rowCount: result.changes };
  }
};
