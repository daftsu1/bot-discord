import { db } from '../connection.js';
import { listTokenRepository } from './listTokenRepository.js';

const PERSONAL_PREFIX = 'personal-';

/**
 * Listas a las que un usuario tiene acceso (propias, compartidas, o en las que participa).
 * Para el portal web: el usuario ve todas sus listas en un solo lugar.
 */
export const userListsRepository = {
  /**
   * Obtiene todas las listas accesibles por el usuario (discord user id).
   * Incluye: listas que creó, listas donde es miembro, listas que tiene en preferencia.
   */
  getListsForUser(userId) {
    const rows = db.prepare(`
      SELECT DISTINCT l.id, l.guild_id, l.channel_id, l.name, l.created_by, l.created_at
      FROM lists l
      WHERE l.created_by = ?
         OR EXISTS (SELECT 1 FROM list_members m WHERE m.list_id = l.id AND m.user_id = ?)
         OR EXISTS (SELECT 1 FROM user_list_preference p WHERE p.list_id = l.id AND p.user_id = ?)
      ORDER BY l.created_at DESC
    `).all(userId, userId, userId);

    const isMember = (listId) =>
      db.prepare('SELECT 1 FROM list_members WHERE list_id = ? AND user_id = ?').get(listId, userId) != null;

    return rows.map(row => {
      const token = listTokenRepository.createOrGetToken(row.id);
      const displayName = row.name.startsWith(PERSONAL_PREFIX) && row.name === `${PERSONAL_PREFIX}${userId}`
        ? 'Mi lista'
        : row.name;
      return {
        id: row.id,
        guildId: row.guild_id,
        channelId: row.channel_id,
        name: row.name,
        displayName,
        createdAt: row.created_at,
        isOwner: row.created_by === userId,
        isMember: isMember(row.id),
        token
      };
    });
  }
};
