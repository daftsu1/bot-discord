import { describe, it, expect } from 'vitest';
import { validateProductName, validateQuantity, validateCategory, validateUnit, validatePrice, LIMITS } from './index.js';

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

describe('validateUnit', () => {
  it('devuelve null para null, undefined o string vacío', () => {
    expect(validateUnit(null)).toBeNull();
    expect(validateUnit(undefined)).toBeNull();
    expect(validateUnit('')).toBeNull();
    expect(validateUnit('   ')).toBeNull();
  });

  it('rechaza unidad mayor al límite', () => {
    const long = 'a'.repeat(LIMITS.UNIT_MAX_LENGTH + 1);
    expect(() => validateUnit(long)).toThrow(
      `La unidad no puede tener más de ${LIMITS.UNIT_MAX_LENGTH} caracteres`
    );
  });

  it('acepta unidad válida y devuelve trim', () => {
    expect(validateUnit('  L  ')).toBe('L');
    expect(validateUnit('kg')).toBe('kg');
    expect(validateUnit('ml')).toBe('ml');
  });
});

describe('validatePrice', () => {
  it('devuelve null para null, undefined o string vacío', () => {
    expect(validatePrice(null)).toBeNull();
    expect(validatePrice(undefined)).toBeNull();
    expect(validatePrice('')).toBeNull();
    expect(validatePrice('   ')).toBeNull();
  });

  it('devuelve null para valores inválidos', () => {
    expect(validatePrice(-1)).toBeNull();
    expect(validatePrice(-0.01)).toBeNull();
    expect(validatePrice('abc')).toBeNull();
    expect(validatePrice(NaN)).toBeNull();
  });

  it('acepta precio válido y redondea a 2 decimales', () => {
    expect(validatePrice(1500)).toBe(1500);
    expect(validatePrice(99.99)).toBe(99.99);
    expect(validatePrice(99.996)).toBe(100);
    expect(validatePrice('1500')).toBe(1500);
    expect(validatePrice('99,50')).toBe(99.5);
  });

  it('acepta 0', () => {
    expect(validatePrice(0)).toBe(0);
  });
});
