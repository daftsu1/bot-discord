import { LIMITS } from './constants.js';

/**
 * Valida y normaliza el nombre de un producto.
 * @param {string} name
 * @returns {string} nombre recortado y sin espacios extra
 * @throws {Error} si está vacío o excede longitud
 */
export function validateProductName(name) {
  if (name == null || typeof name !== 'string') {
    throw new Error('El nombre del producto es obligatorio');
  }
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('El nombre del producto es obligatorio');
  }
  if (trimmed.length > LIMITS.PRODUCT_NAME_MAX_LENGTH) {
    throw new Error(`El nombre no puede tener más de ${LIMITS.PRODUCT_NAME_MAX_LENGTH} caracteres`);
  }
  return trimmed;
}

/**
 * Valida la cantidad.
 * @param {number} quantity
 * @returns {number}
 * @throws {Error} si es inválida
 */
export function validateQuantity(quantity) {
  const num = Number(quantity);
  if (!Number.isInteger(num) || num < 1) {
    throw new Error('La cantidad debe ser al menos 1');
  }
  if (num > LIMITS.QUANTITY_MAX) {
    throw new Error(`La cantidad no puede ser mayor a ${LIMITS.QUANTITY_MAX}`);
  }
  return num;
}

/**
 * Valida y normaliza la categoría (opcional).
 * @param {string|null|undefined} category
 * @returns {string|null}
 * @throws {Error} si excede longitud
 */
export function validateCategory(category) {
  if (category == null || category === '') {
    return null;
  }
  const trimmed = String(category).trim();
  if (!trimmed) return null;
  if (trimmed.length > LIMITS.CATEGORY_MAX_LENGTH) {
    throw new Error(`La categoría no puede tener más de ${LIMITS.CATEGORY_MAX_LENGTH} caracteres`);
  }
  return trimmed;
}

/**
 * Valida la unidad de medida (opcional): L, ml, kg, g, un, etc.
 * @param {string|null|undefined} unit
 * @returns {string|null}
 */
export function validateUnit(unit) {
  if (unit == null || unit === '') return null;
  const trimmed = String(unit).trim();
  if (!trimmed) return null;
  if (trimmed.length > LIMITS.UNIT_MAX_LENGTH) {
    throw new Error(`La unidad no puede tener más de ${LIMITS.UNIT_MAX_LENGTH} caracteres`);
  }
  return trimmed;
}

/**
 * Valida el precio de compra (opcional). Número >= 0.
 * @param {number|string|null|undefined} price
 * @returns {number|null}
 */
export function validatePrice(price) {
  if (price == null || price === '') return null;
  const trimmed = String(price).trim();
  if (!trimmed) return null;
  const num = Number(trimmed.replace(',', '.'));
  if (Number.isNaN(num) || num < 0) return null;
  if (num > LIMITS.PRICE_MAX) return null;
  return Math.round(num * 100) / 100; // 2 decimales
}

export { LIMITS };
