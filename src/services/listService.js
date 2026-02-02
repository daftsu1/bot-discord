import { listRepository } from '../database/repositories/listRepository.js';
import { userListPreferenceRepository } from '../database/repositories/userListPreferenceRepository.js';

const PERSONAL_PREFIX = 'personal-';

/** Nombre a mostrar: "Mi lista" para la lista personal del usuario, sino el nombre de la lista. */
export function getListDisplayName(list, userId) {
  if (!list) return '';
  if (list.name.startsWith(PERSONAL_PREFIX) && list.name === `${PERSONAL_PREFIX}${userId}`) return 'Mi lista';
  return list.name;
}

/**
 * Servicio de listas nombradas: listas grupales (varios usuarios) o lista personal por usuario.
 */
export const listService = {
  getListDisplayName,

  /** Lista que el usuario está usando en este canal (o null si no hay). */
  getCurrentList(guildId, channelId, userId) {
    const listId = userListPreferenceRepository.get(guildId, channelId, userId);
    if (listId) {
      const list = listRepository.getById(listId);
      if (list && listRepository.canUse(listId, userId)) return list;
    }
    const general = listRepository.getByChannelAndName(guildId, channelId, 'general');
    if (general && listRepository.canUse(general.id, userId)) return general;
    return null;
  },

  /** Establece la lista actual del usuario en este canal. Acepta "mi lista" para la lista personal. */
  setCurrentList(guildId, channelId, userId, listName) {
    const input = (listName || '').trim().toLowerCase();
    let list;
    if (input === 'mi lista') {
      list = this.ensurePersonalList(guildId, channelId, userId);
    } else {
      list = listRepository.getByChannelAndName(guildId, channelId, listName);
    }
    if (!list) throw new Error(`No existe la lista "${listName}" en este canal.`);
    if (!listRepository.canUse(list.id, userId)) {
      throw new Error(`No puedes usar esa lista. Únete primero con \`/unirse\` (listas grupales) o usa \`/mi-lista\` para la tuya.`);
    }
    userListPreferenceRepository.set(guildId, channelId, userId, list.id);
    return list;
  },

  /** Obtiene o crea la lista personal del usuario en este canal y la deja como actual. */
  ensurePersonalList(guildId, channelId, userId) {
    const personalName = `${PERSONAL_PREFIX}${userId}`;
    let list = listRepository.getByChannelAndName(guildId, channelId, personalName);
    if (!list) {
      list = listRepository.create(guildId, channelId, personalName, userId);
      if (list) listRepository.addMember(list.id, userId);
    }
    if (!list) throw new Error('No se pudo crear tu lista personal.');
    userListPreferenceRepository.set(guildId, channelId, userId, list.id);
    return list;
  },

  /** Crea una lista grupal y añade al creador como miembro; la establece como actual. */
  createList(guildId, channelId, name, userId) {
    const normalized = (name || '').trim().toLowerCase();
    if (normalized === 'mi lista' || normalized.startsWith(PERSONAL_PREFIX)) {
      throw new Error('Para tu lista personal usa el comando /mi-lista.');
    }
    const list = listRepository.create(guildId, channelId, normalized, userId);
    if (!list) throw new Error(`Ya existe una lista llamada "${normalized}" en este canal.`);
    listRepository.addMember(list.id, userId);
    userListPreferenceRepository.set(guildId, channelId, userId, list.id);
    return list;
  },

  /** Añade al usuario a una lista grupal (no a listas personales de otros). */
  joinList(guildId, channelId, listName, userId) {
    const list = listRepository.getByChannelAndName(guildId, channelId, listName);
    if (!list) throw new Error(`No existe la lista "${listName}" en este canal.`);
    if (list.name.startsWith(PERSONAL_PREFIX) && list.name !== `${PERSONAL_PREFIX}${userId}`) {
      throw new Error('Esa lista es personal de otro usuario. Para la tuya usa /mi-lista.');
    }
    const added = listRepository.addMember(list.id, userId);
    if (!added) throw new Error(`Ya estás en la lista "${getListDisplayName(list, userId)}".`);
    return list;
  },

  /** Quita al usuario de una lista grupal (no de "general" ni de tu lista personal). */
  leaveList(guildId, channelId, listName, userId) {
    const input = (listName || '').trim().toLowerCase();
    let list;
    if (input === 'mi lista') {
      list = listRepository.getByChannelAndName(guildId, channelId, `${PERSONAL_PREFIX}${userId}`);
    } else {
      list = listRepository.getByChannelAndName(guildId, channelId, listName);
    }
    if (!list) throw new Error(`No existe la lista "${listName}" en este canal.`);
    if (list.name === 'general') throw new Error('No puedes salir de la lista "general".');
    if (list.name.startsWith(PERSONAL_PREFIX) && list.name === `${PERSONAL_PREFIX}${userId}`) {
      throw new Error('Tu lista personal no se abandona; usa /usar-lista para cambiar a otra lista.');
    }
    const removed = listRepository.removeMember(list.id, userId);
    if (!removed) throw new Error(`No estabas en la lista "${list.name}".`);
    const currentListId = userListPreferenceRepository.get(guildId, channelId, userId);
    if (currentListId === list.id) {
      const general = listRepository.getByChannelAndName(guildId, channelId, 'general');
      if (general) userListPreferenceRepository.set(guildId, channelId, userId, general.id);
    }
    return list;
  },

  /** Elimina una lista. Solo el creador puede eliminarla; no se puede eliminar "general". */
  deleteList(guildId, channelId, listName, userId) {
    const input = (listName || '').trim().toLowerCase();
    let list;
    if (input === 'mi lista') {
      list = listRepository.getByChannelAndName(guildId, channelId, `${PERSONAL_PREFIX}${userId}`);
    } else {
      list = listRepository.getByChannelAndName(guildId, channelId, listName);
    }
    if (!list) throw new Error(`No existe la lista "${listName}" en este canal.`);
    if (list.name === 'general') throw new Error('No se puede eliminar la lista "general".');
    if (list.name.startsWith(PERSONAL_PREFIX)) {
      if (list.name !== `${PERSONAL_PREFIX}${userId}`) throw new Error('No puedes eliminar la lista personal de otro usuario.');
    } else {
      if (list.created_by && list.created_by !== userId) {
        throw new Error('Solo quien creó la lista puede eliminarla.');
      }
    }
    listRepository.deleteList(list.id);
    return list;
  },

  /** Listas del canal que el usuario puede usar (general, grupales donde está, su lista personal). */
  getListsForChannel(guildId, channelId, userId) {
    const lists = listRepository.getByChannel(guildId, channelId);
    const currentListId = userListPreferenceRepository.get(guildId, channelId, userId);
    return lists
      .filter(list => listRepository.canUse(list.id, userId))
      .map(list => ({
        ...list,
        displayName: getListDisplayName(list, userId),
        isMember: listRepository.isMember(list.id, userId),
        isCurrent: list.id === currentListId
      }));
  }
};
