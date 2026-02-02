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

- Node.js 18+ o [Bun](https://bun.sh) (para desarrollo local)
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

## Despliegue en EC2 (Bun + Docker)

El proyecto incluye un **Dockerfile** con [Bun](https://bun.sh) y **docker-compose** para desplegar en una instancia EC2 (por ejemplo en el tier gratuito).

### 1. En tu máquina: preparar `.env`

Copia `.env.example` a `.env`, rellena `DISCORD_BOT_TOKEN` y `DISCORD_CLIENT_ID`, y súbelo a la instancia (o créalo allí y pega los valores).

### 2. En la instancia EC2

- Instala Docker y Docker Compose (Amazon Linux 2 / Ubuntu):

```bash
# Amazon Linux 2
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker && sudo systemctl enable docker
sudo usermod -aG docker ec2-user
# Cerrar sesión y volver a entrar, luego:
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

- Clona el repo (o sube los archivos), crea `.env` y levanta el bot:

```bash
cd bot-discord-despensa
# Crear .env con DISCORD_BOT_TOKEN y DISCORD_CLIENT_ID
docker compose up -d --build
```

- Ver logs: `docker compose logs -f`

- Reiniciar: `docker compose restart`  
- Parar: `docker compose down`

El volumen `./data` persiste la base SQLite en el host, así que los datos se mantienen al actualizar la imagen.

### Build solo con Docker (sin compose)

```bash
docker build -t bot-alacena .
docker run -d --restart unless-stopped --env-file .env -v $(pwd)/data:/app/data --name bot-alacena bot-alacena
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
