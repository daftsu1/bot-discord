# Bot Discord Alacena

Bot de Discord para gestionar la lista de compras del supermercado, con soporte para cantidades, categorías y marcado de comprados.

## Módulo 1: Lista de compras

- **/agregar** – Añade productos (con cantidad y categoría opcionales)
- **/quitar** – Elimina un producto de la lista
- **/lista** – Muestra la lista (incluye o excluye comprados)
- **/limpiar** – Vacía la lista (total o solo comprados)
- **/marcar** – Marca como comprado o vuelve a pendiente

Cada canal de texto tiene su propia lista.

## Requisitos

- Node.js 18+
- Cuenta de Discord y bot creado en [Discord Developer Portal](https://discord.com/developers/applications)

## Instalación

```bash
npm install
cp .env.example .env
```

Edita `.env` y configura:
- `DISCORD_BOT_TOKEN` – Token del bot
- `DISCORD_CLIENT_ID` – ID de la aplicación (para registrar comandos slash)

SQLite se usa por defecto; la base de datos se crea en `./data/bot.db`.

## Ejecución

```bash
npm start
```

O en modo desarrollo con recarga automática:

```bash
npm run dev
```

## Configuración de moneda

La moneda por defecto es CLP (peso chileno). Para cambiarla en el futuro:

```env
CURRENCY_CODE=CLP
CURRENCY_SYMBOL=$
CURRENCY_LOCALE=es-CL
```

## Estructura

```
src/
├── commands/      # Comandos slash (add, remove, list, clear, mark)
├── config/        # Configuración (moneda, BD, etc.)
├── database/      # SQLite, esquema y repositorios
├── services/      # Lógica de negocio
└── index.js       # Entrada del bot
```
