import { shoppingRepository } from '../database/repositories/shoppingRepository.js';
import { listService } from './listService.js';
import { validateProductName, validateQuantity, validateCategory, validateUnit } from '../validation/index.js';

const NO_LIST_MSG = 'No tienes una lista activa en este canal. Usa `/mi-lista` (tu lista), `/usar-lista` o `/crear-lista`.';

/**
 * Servicio de lista de compras. Opera sobre la lista actual del usuario en el canal.
 */
export const shoppingService = {
  addItem(guildId, channelId, userId, name, quantity = 1, category = null, unit = null) {
    const list = listService.getCurrentList(guildId, channelId, userId);
    if (!list) throw new Error(NO_LIST_MSG);

    const validName = validateProductName(name);
    const validQuantity = validateQuantity(quantity);
    const validCategory = validateCategory(category);
    const validUnit = validateUnit(unit);

    const result = shoppingRepository.addItem(list.id, validName, validQuantity, validCategory, validUnit);
    return { success: true, item: result };
  },

  removeItem(guildId, channelId, userId, name) {
    const list = listService.getCurrentList(guildId, channelId, userId);
    if (!list) throw new Error(NO_LIST_MSG);

    const validName = validateProductName(name);
    const result = shoppingRepository.removeItem(list.id, validName);
    if (result.rowCount === 0) {
      throw new Error(`No se encontró "${validName}" en la lista`);
    }
    return { success: true };
  },

  getList(guildId, channelId, userId, { includePurchased = true } = {}) {
    const list = listService.getCurrentList(guildId, channelId, userId);
    if (!list) throw new Error(NO_LIST_MSG);
    return shoppingRepository.getItems(list.id, { includePurchased });
  },

  markAsPurchased(guildId, channelId, userId, itemName, markedByUserId) {
    const list = listService.getCurrentList(guildId, channelId, userId);
    if (!list) throw new Error(NO_LIST_MSG);

    const validName = validateProductName(itemName);
    const result = shoppingRepository.markAsPurchased(list.id, validName, markedByUserId);
    if (!result) throw new Error(`No se encontró "${validName}" en la lista`);
    return { success: true, item: result };
  },

  unmarkAsPurchased(guildId, channelId, userId, itemName) {
    const list = listService.getCurrentList(guildId, channelId, userId);
    if (!list) throw new Error(NO_LIST_MSG);

    const validName = validateProductName(itemName);
    const result = shoppingRepository.unmarkAsPurchased(list.id, validName);
    if (!result) throw new Error(`No se encontró "${validName}" en la lista`);
    return { success: true, item: result };
  },

  clearList(guildId, channelId, userId, { purchasedOnly = false } = {}) {
    const list = listService.getCurrentList(guildId, channelId, userId);
    if (!list) throw new Error(NO_LIST_MSG);
    const result = shoppingRepository.clearList(list.id, { purchasedOnly });
    return { success: true, deleted: result.rowCount };
  }
};
