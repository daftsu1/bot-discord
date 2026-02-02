import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shoppingService } from './shoppingService.js';

vi.mock('../database/repositories/shoppingRepository.js', () => ({
  shoppingRepository: {
    addItem: vi.fn(),
    removeItem: vi.fn(),
    getItems: vi.fn(),
    markAsPurchased: vi.fn(),
    unmarkAsPurchased: vi.fn(),
    clearList: vi.fn()
  }
}));

import { shoppingRepository } from '../database/repositories/shoppingRepository.js';

const GUILD = 'guild-1';
const CHANNEL = 'channel-1';

describe('shoppingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addItem', () => {
    it('lanza si el nombre está vacío', () => {
      expect(() => shoppingService.addItem(GUILD, CHANNEL, '')).toThrow('El nombre del producto es obligatorio');
      expect(() => shoppingService.addItem(GUILD, CHANNEL, '   ')).toThrow('El nombre del producto es obligatorio');
      expect(shoppingRepository.addItem).not.toHaveBeenCalled();
    });

    it('lanza si la cantidad es inválida', () => {
      expect(() => shoppingService.addItem(GUILD, CHANNEL, 'leche', 0)).toThrow('La cantidad debe ser al menos 1');
      expect(() => shoppingService.addItem(GUILD, CHANNEL, 'leche', -1)).toThrow('La cantidad debe ser al menos 1');
      expect(shoppingRepository.addItem).not.toHaveBeenCalled();
    });

    it('llama al repositorio con datos válidos y devuelve el ítem', () => {
      const mockItem = { id: 1, name: 'leche', quantity: 2, category: 'lácteos', unit: 'L', is_purchased: 0 };
      vi.mocked(shoppingRepository.addItem).mockReturnValue(mockItem);

      const result = shoppingService.addItem(GUILD, CHANNEL, 'leche', 2, 'lácteos', 'L');

      expect(shoppingRepository.addItem).toHaveBeenCalledWith(GUILD, CHANNEL, 'leche', 2, 'lácteos', 'L');
      expect(result).toEqual({ success: true, item: mockItem });
    });
  });

  describe('removeItem', () => {
    it('lanza si el nombre está vacío', () => {
      expect(() => shoppingService.removeItem(GUILD, CHANNEL, '')).toThrow('El nombre del producto es obligatorio');
      expect(shoppingRepository.removeItem).not.toHaveBeenCalled();
    });

    it('lanza si no se encontró el ítem', () => {
      vi.mocked(shoppingRepository.removeItem).mockReturnValue({ rowCount: 0 });

      expect(() => shoppingService.removeItem(GUILD, CHANNEL, 'inexistente')).toThrow(
        'No se encontró "inexistente" en la lista'
      );
    });

    it('devuelve success si se eliminó', () => {
      vi.mocked(shoppingRepository.removeItem).mockReturnValue({ rowCount: 1 });

      const result = shoppingService.removeItem(GUILD, CHANNEL, 'leche');

      expect(result).toEqual({ success: true });
    });
  });

  describe('getList', () => {
    it('devuelve lo que devuelve el repositorio', () => {
      const items = [{ id: 1, name: 'leche', quantity: 1 }];
      vi.mocked(shoppingRepository.getItems).mockReturnValue(items);

      const result = shoppingService.getList(GUILD, CHANNEL, { includePurchased: true });

      expect(shoppingRepository.getItems).toHaveBeenCalledWith(GUILD, CHANNEL, { includePurchased: true });
      expect(result).toEqual(items);
    });
  });

  describe('markAsPurchased', () => {
    it('lanza si el nombre está vacío', () => {
      expect(() => shoppingService.markAsPurchased(GUILD, CHANNEL, '   ', 'user-1')).toThrow(
        'El nombre del producto es obligatorio'
      );
      expect(shoppingRepository.markAsPurchased).not.toHaveBeenCalled();
    });

    it('lanza si no se encontró el ítem', () => {
      vi.mocked(shoppingRepository.markAsPurchased).mockReturnValue(null);

      expect(() => shoppingService.markAsPurchased(GUILD, CHANNEL, 'inexistente', 'user-1')).toThrow(
        'No se encontró "inexistente" en la lista'
      );
    });

    it('devuelve success e ítem si se marcó', () => {
      const mockItem = { id: 1, name: 'leche', quantity: 1, category: null };
      vi.mocked(shoppingRepository.markAsPurchased).mockReturnValue(mockItem);

      const result = shoppingService.markAsPurchased(GUILD, CHANNEL, 'leche', 'user-1');

      expect(result).toEqual({ success: true, item: mockItem });
    });
  });

  describe('unmarkAsPurchased', () => {
    it('lanza si el nombre está vacío', () => {
      expect(() => shoppingService.unmarkAsPurchased(GUILD, CHANNEL, '')).toThrow(
        'El nombre del producto es obligatorio'
      );
    });

    it('lanza si no se encontró el ítem', () => {
      vi.mocked(shoppingRepository.unmarkAsPurchased).mockReturnValue(null);

      expect(() => shoppingService.unmarkAsPurchased(GUILD, CHANNEL, 'inexistente')).toThrow(
        'No se encontró "inexistente" en la lista'
      );
    });

    it('devuelve success si se desmarcó', () => {
      const mockItem = { id: 1, name: 'leche', quantity: 1, category: null };
      vi.mocked(shoppingRepository.unmarkAsPurchased).mockReturnValue(mockItem);

      const result = shoppingService.unmarkAsPurchased(GUILD, CHANNEL, 'leche');

      expect(result).toEqual({ success: true, item: mockItem });
    });
  });

  describe('clearList', () => {
    it('devuelve deleted del repositorio', () => {
      vi.mocked(shoppingRepository.clearList).mockReturnValue({ rowCount: 3 });

      const result = shoppingService.clearList(GUILD, CHANNEL, { purchasedOnly: false });

      expect(shoppingRepository.clearList).toHaveBeenCalledWith(GUILD, CHANNEL, { purchasedOnly: false });
      expect(result).toEqual({ success: true, deleted: 3 });
    });
  });
});
