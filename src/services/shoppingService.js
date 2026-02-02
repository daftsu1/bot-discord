import { shoppingRepository } from '../database/repositories/shoppingRepository.js';

/**
 * Servicio de lista de compras.
 * Lógica de negocio entre comandos y repositorio.
 */

export const shoppingService = {
  addItem(guildId, channelId, name, quantity = 1, category = null) {
    if (!name?.trim()) throw new Error('El nombre del producto es obligatorio');
    if (quantity < 1) throw new Error('La cantidad debe ser al menos 1');

    const result = shoppingRepository.addItem(guildId, channelId, name, quantity, category);
    return { success: true, item: result };
  },

  removeItem(guildId, channelId, name) {
    if (!name?.trim()) throw new Error('El nombre del producto es obligatorio');

    const result = shoppingRepository.removeItem(guildId, channelId, name);
    if (result.rowCount === 0) {
      throw new Error(`No se encontró "${name}" en la lista`);
    }
    return { success: true };
  },

  getList(guildId, channelId, { includePurchased = true } = {}) {
    return shoppingRepository.getItems(guildId, channelId, { includePurchased });
  },

  markAsPurchased(guildId, channelId, itemName, userId) {
    if (!itemName?.trim()) throw new Error('El nombre del producto es obligatorio');

    const result = shoppingRepository.markAsPurchased(guildId, channelId, itemName, userId);
    if (!result) throw new Error(`No se encontró "${itemName}" en la lista`);
    return { success: true, item: result };
  },

  unmarkAsPurchased(guildId, channelId, itemName) {
    if (!itemName?.trim()) throw new Error('El nombre del producto es obligatorio');

    const result = shoppingRepository.unmarkAsPurchased(guildId, channelId, itemName);
    if (!result) throw new Error(`No se encontró "${itemName}" en la lista`);
    return { success: true, item: result };
  },

  clearList(guildId, channelId, { purchasedOnly = false } = {}) {
    const result = shoppingRepository.clearList(guildId, channelId, { purchasedOnly });
    return { success: true, deleted: result.rowCount };
  }
};
