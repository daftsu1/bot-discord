/**
 * Configuración centralizada del bot.
 * Permite futuros cambios de moneda y otros parámetros.
 */

export const config = {
  /** Moneda por defecto (CLP). Extensible para futuros módulos de finanzas. */
  currency: {
    code: process.env.CURRENCY_CODE || 'CLP',
    symbol: process.env.CURRENCY_SYMBOL || '$',
    locale: process.env.CURRENCY_LOCALE || 'es-CL'
  },

  /** Base de datos (SQLite por defecto, migrable a PostgreSQL) */
  database: {
    path: process.env.DATABASE_PATH || './data/bot.db'
  },

  /** Vista web (lista en el celular) */
  web: {
    port: parseInt(process.env.WEB_PORT || '3000', 10)    baseUrl: (process.env.WEB_BASE_URL || 'http://localhost:3000').trim().replace(/^["']|["']$/g, '')
  }
};
