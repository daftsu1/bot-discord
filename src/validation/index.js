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

export { LIMITS };
