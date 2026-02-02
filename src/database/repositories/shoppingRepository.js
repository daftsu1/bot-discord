import { db } from '../connection.js';

/**
 * Repositorio de ítems de la lista de compras. Los ítems pertenecen a una lista (list_id).
 */
export const shoppingRepository = {
  addItem(listId, name, quantity = 1, category = null, unit = null) {
    const normalizedName = name.trim().toLowerCase();
    db.prepare(`
      INSERT INTO shopping_items (list_id, name, quantity, category, unit, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(list_id, name) DO UPDATE SET
        quantity = quantity + excluded.quantity,
        category = COALESCE(excluded.category, category),
        unit = COALESCE(excluded.unit, unit),
        updated_at = datetime('now')
    `).run(listId, normalizedName, quantity, category, unit);

    return db.prepare(`
      SELECT id, name, quantity, category, unit, is_purchased
      FROM shopping_items 
      WHERE list_id = ? AND LOWER(name) = ?
    `).get(listId, normalizedName);
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
      SELECT id, name, quantity, category, unit, is_purchased, purchased_at, purchased_by
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

  markAsPurchased(listId, itemName, userId) {
    const stmt = db.prepare(`
      UPDATE shopping_items 
      SET is_purchased = 1, purchased_at = datetime('now'), purchased_by = ?, updated_at = datetime('now')
      WHERE list_id = ? AND LOWER(name) = LOWER(?)
      RETURNING id, name, quantity, category, unit
    `);
    return stmt.get(userId, listId, itemName.trim());
  },

  unmarkAsPurchased(listId, itemName) {
    const stmt = db.prepare(`
      UPDATE shopping_items 
      SET is_purchased = 0, purchased_at = NULL, purchased_by = NULL, updated_at = datetime('now')
      WHERE list_id = ? AND LOWER(name) = LOWER(?)
      RETURNING id, name, quantity, category, unit
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
