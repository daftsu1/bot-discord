import { db } from '../connection.js';

/**
 * Preferencia de lista actual por usuario y canal (cuál lista usa /agregar, /lista, etc.).
 */
export const userListPreferenceRepository = {
  get(guildId, channelId, userId) {
    const row = db.prepare(
      'SELECT list_id FROM user_list_preference WHERE guild_id = ? AND channel_id = ? AND user_id = ?'
    ).get(guildId, channelId, userId);
    return row ? row.list_id : null;
  },

  set(guildId, channelId, userId, listId) {
    db.prepare(`
      INSERT INTO user_list_preference (guild_id, channel_id, user_id, list_id, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(guild_id, channel_id, user_id) DO UPDATE SET list_id = excluded.list_id, updated_at = datetime('now')
    `).run(guildId, channelId, userId, listId);
  }
};
