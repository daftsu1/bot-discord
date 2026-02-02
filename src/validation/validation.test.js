import { describe, it, expect } from 'vitest';
import { validateProductName, validateQuantity, validateCategory, LIMITS } from './index.js';

describe('validateProductName', () => {
  it('rechaza null o undefined', () => {
    expect(() => validateProductName(null)).toThrow('El nombre del producto es obligatorio');
    expect(() => validateProductName(undefined)).toThrow('El nombre del producto es obligatorio');
  });

  it('rechaza string vacío o solo espacios', () => {
    expect(() => validateProductName('')).toThrow('El nombre del producto es obligatorio');
    expect(() => validateProductName('   ')).toThrow('El nombre del producto es obligatorio');
  });

  it('rechaza nombre mayor al límite', () => {
    const long = 'a'.repeat(LIMITS.PRODUCT_NAME_MAX_LENGTH + 1);
    expect(() => validateProductName(long)).toThrow(
      `El nombre no puede tener más de ${LIMITS.PRODUCT_NAME_MAX_LENGTH} caracteres`
    );
  });

  it('acepta nombre válido y devuelve trim', () => {
    expect(validateProductName('  leche  ')).toBe('leche');
    expect(validateProductName('leche')).toBe('leche');
  });

  it('acepta nombre con exactamente el límite', () => {
    const exact = 'a'.repeat(LIMITS.PRODUCT_NAME_MAX_LENGTH);
    expect(validateProductName(exact)).toBe(exact);
  });
});

describe('validateQuantity', () => {
  it('rechaza 0 o negativo', () => {
    expect(() => validateQuantity(0)).toThrow('La cantidad debe ser al menos 1');
    expect(() => validateQuantity(-1)).toThrow('La cantidad debe ser al menos 1');
  });

  it('rechaza cantidad mayor al máximo', () => {
    expect(() => validateQuantity(LIMITS.QUANTITY_MAX + 1)).toThrow(
      `La cantidad no puede ser mayor a ${LIMITS.QUANTITY_MAX}`
    );
  });

  it('acepta cantidad válida', () => {
    expect(validateQuantity(1)).toBe(1);
    expect(validateQuantity(10)).toBe(10);
    expect(validateQuantity(LIMITS.QUANTITY_MAX)).toBe(LIMITS.QUANTITY_MAX);
  });

  it('rechaza no enteros', () => {
    expect(() => validateQuantity(1.5)).toThrow('La cantidad debe ser al menos 1');
  });
});

describe('validateCategory', () => {
  it('devuelve null para null, undefined o string vacío', () => {
    expect(validateCategory(null)).toBeNull();
    expect(validateCategory(undefined)).toBeNull();
    expect(validateCategory('')).toBeNull();
    expect(validateCategory('   ')).toBeNull();
  });

  it('rechaza categoría mayor al límite', () => {
    const long = 'a'.repeat(LIMITS.CATEGORY_MAX_LENGTH + 1);
    expect(() => validateCategory(long)).toThrow(
      `La categoría no puede tener más de ${LIMITS.CATEGORY_MAX_LENGTH} caracteres`
    );
  });

  it('acepta categoría válida y devuelve trim', () => {
    expect(validateCategory('  lácteos  ')).toBe('lácteos');
    expect(validateCategory('frutas')).toBe('frutas');
  });
});
