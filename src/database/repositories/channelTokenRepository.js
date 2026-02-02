import { db } from '../connection.js';
import crypto from 'crypto';

/**
 * Tokens para acceder a la lista del canal desde la web (link para celular).
 */
export const channelTokenRepository = {
  /** Crea un token para el canal o devuelve el existente. */
  createOrGet(guildId, channelId) {
    const existing = db.prepare(
      'SELECT token FROM channel_tokens WHERE guild_id = ? AND channel_id = ?'
    ).get(guildId, channelId);
    if (existing) return existing.token;

    const token = crypto.randomBytes(24).toString('base64url');
    db.prepare(
      'INSERT INTO channel_tokens (token, guild_id, channel_id) VALUES (?, ?, ?)'
    ).run(token, guildId, channelId);
    return token;
  },

  /** Obtiene guild_id y channel_id por token. */
  getByToken(token) {
    return db.prepare(
      'SELECT guild_id, channel_id FROM channel_tokens WHERE token = ?'
    ).get(token) ?? null;
  }
};
