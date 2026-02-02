import { db } from '../connection.js';
import crypto from 'crypto';

/**
 * Tokens para el link web por lista (no por canal).
 */
export const listTokenRepository = {
  createOrGet(listId) {
    const existing = db.prepare('SELECT token FROM list_tokens WHERE list_id = ?').get(listId);
    if (existing) return existing.token;
    const token = crypto.randomBytes(24).toString('base64url');
    db.prepare('INSERT INTO list_tokens (token, list_id) VALUES (?, ?)').run(token, listId);
    return token;
  },

  getByToken(token) {
    return db.prepare('SELECT list_id FROM list_tokens WHERE token = ?').get(token) ?? null;
  },

  /** Obtiene el token para una lista (crea uno si no existe). */
  getTokenForList(listId) {
    const row = db.prepare('SELECT token FROM list_tokens WHERE list_id = ?').get(listId);
    return row ? row.token : null;
  },

  /** Crea o devuelve el token para una lista (para el portal). */
  createOrGetToken(listId) {
    return this.getTokenForList(listId) || this.createOrGet(listId);
  }
};
