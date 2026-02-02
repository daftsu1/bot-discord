/**
 * Límites de validación para la lista de compras.
 * Evitan abusos y mantienen datos razonables.
 */

export const LIMITS = {
  /** Longitud máxima del nombre del producto (caracteres) */
  PRODUCT_NAME_MAX_LENGTH: 100,
  /** Longitud máxima de la categoría (caracteres) */
  CATEGORY_MAX_LENGTH: 50,
  /** Cantidad máxima por ítem (evita números desproporcionados) */
  QUANTITY_MAX: 9999,
  /** Longitud máxima de la unidad (L, ml, kg, g, un, etc.) */
  UNIT_MAX_LENGTH: 10
};
