import { db } from '../connection.js';

const GENERAL_NAME = 'general';

/**
 * Listas nombradas por canal. Una lista puede ser grupal (varios miembros) o personal (un solo miembro).
 */
export const listRepository = {
  /** Crea una lista en el canal. name en minúsculas. */
  create(guildId, channelId, name, createdBy = null) {
    const normalizedName = name.trim().toLowerCase();
    if (!normalizedName) return null;
    try {
      db.prepare(
        'INSERT INTO lists (guild_id, channel_id, name, created_by) VALUES (?, ?, ?, ?)'
      ).run(guildId, channelId, normalizedName, createdBy);
      return db.prepare(
        'SELECT id, guild_id, channel_id, name, created_by, created_at FROM lists WHERE guild_id = ? AND channel_id = ? AND name = ?'
      ).get(guildId, channelId, normalizedName);
    } catch (e) {
      if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') return null;
      throw e;
    }
  },

  /** Obtiene lista por id. */
  getById(listId) {
    return db.prepare(
      'SELECT id, guild_id, channel_id, name, created_by, created_at FROM lists WHERE id = ?'
    ).get(listId) ?? null;
  },

  /** Obtiene lista por canal y nombre. */
  getByChannelAndName(guildId, channelId, name) {
    const normalizedName = name.trim().toLowerCase();
    return db.prepare(
      'SELECT id, guild_id, channel_id, name, created_by, created_at FROM lists WHERE guild_id = ? AND channel_id = ? AND name = ?'
    ).get(guildId, channelId, normalizedName) ?? null;
  },

  /** Lista todas las listas del canal. */
  getByChannel(guildId, channelId) {
    return db.prepare(
      'SELECT id, guild_id, channel_id, name, created_by, created_at FROM lists WHERE guild_id = ? AND channel_id = ? ORDER BY name'
    ).all(guildId, channelId);
  },

  /** Añade un miembro a la lista. */
  addMember(listId, userId) {
    try {
      db.prepare('INSERT INTO list_members (list_id, user_id) VALUES (?, ?)').run(listId, userId);
      return true;
    } catch (e) {
      if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') return false;
      throw e;
    }
  },

  /** Quita un miembro de la lista. */
  removeMember(listId, userId) {
    const result = db.prepare('DELETE FROM list_members WHERE list_id = ? AND user_id = ?').run(listId, userId);
    return result.changes > 0;
  },

  /** Indica si el usuario es miembro de la lista. */
  isMember(listId, userId) {
    return db.prepare('SELECT 1 FROM list_members WHERE list_id = ? AND user_id = ?').get(listId, userId) != null;
  },

  /** Lista "general" no tiene restricción de miembros: cualquiera en el canal puede usarla. */
  isGeneralList(list) {
    return list && list.name === GENERAL_NAME;
  },

  /** Indica si el usuario puede usar la lista (es miembro o es lista general). */
  canUse(listId, userId) {
    const list = this.getById(listId);
    if (!list) return false;
    if (this.isGeneralList(list)) return true;
    return this.isMember(listId, userId);
  },

  /** Miembros de una lista. */
  getMembers(listId) {
    return db.prepare('SELECT user_id, joined_at FROM list_members WHERE list_id = ? ORDER BY joined_at').all(listId);
  },

  /** Elimina una lista y todos sus ítems (CASCADE). Devuelve true si se eliminó. */
  deleteList(listId) {
    const result = db.prepare('DELETE FROM lists WHERE id = ?').run(listId);
    return result.changes > 0;
  }
};
