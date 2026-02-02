import { shoppingRepository } from '../database/repositories/shoppingRepository.js';
import { validateProductName, validateQuantity, validateCategory } from '../validation/index.js';

/**
 * Servicio de lista de compras.
 * Lógica de negocio entre comandos y repositorio.
 */

export const shoppingService = {
  addItem(guildId, channelId, name, quantity = 1, category = null) {
    const validName = validateProductName(name);
    const validQuantity = validateQuantity(quantity);
    const validCategory = validateCategory(category);

    const result = shoppingRepository.addItem(guildId, channelId, validName, validQuantity, validCategory);
    return { success: true, item: result };
  },

  removeItem(guildId, channelId, name) {
    const validName = validateProductName(name);

    const result = shoppingRepository.removeItem(guildId, channelId, validName);
    if (result.rowCount === 0) {
      throw new Error(`No se encontró "${validName}" en la lista`);
    }
    return { success: true };
  },

  getList(guildId, channelId, { includePurchased = true } = {}) {
    return shoppingRepository.getItems(guildId, channelId, { includePurchased });
  },

  markAsPurchased(guildId, channelId, itemName, userId) {
    const validName = validateProductName(itemName);

    const result = shoppingRepository.markAsPurchased(guildId, channelId, validName, userId);
    if (!result) throw new Error(`No se encontró "${validName}" en la lista`);
    return { success: true, item: result };
  },

  unmarkAsPurchased(guildId, channelId, itemName) {
    const validName = validateProductName(itemName);

    const result = shoppingRepository.unmarkAsPurchased(guildId, channelId, validName);
    if (!result) throw new Error(`No se encontró "${validName}" en la lista`);
    return { success: true, item: result };
  },

  clearList(guildId, channelId, { purchasedOnly = false } = {}) {
    const result = shoppingRepository.clearList(guildId, channelId, { purchasedOnly });
    return { success: true, deleted: result.rowCount };
  }
};
