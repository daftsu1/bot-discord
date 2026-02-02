# Bot Discord Alacena

Bot de Discord para gestionar la lista de compras del supermercado, con soporte para cantidades, categorías, marcado de comprados, **listas grupales** (varios usuarios en la misma lista) y **lista personal** por usuario.

## Listas en un canal

En cada canal puedes:

- **Trabajar en grupo** → Alguien crea una lista con `/crear-lista` (ej. `piso`, `familia`). Los demás se unen con `/unirse lista:nombre`. Todos agregan, marcan y ven la misma lista.
- **Usar tu lista personal** → `/mi-lista` crea o activa una lista solo tuya en ese canal; nadie más la ve ni la edita.
- **Tener varias listas** → Puedes crear varias listas grupales con nombres distintos (ej. `piso`, `casa-mamá`). Cada una es independiente. Con `/usar-lista` eliges cuál usar; `/agregar`, `/lista`, `/quitar`, etc. afectan siempre a la lista que tengas activa.

### Lista completada → crear otra nueva

Si con tu grupo completan una lista (todo comprado) y quieren empezar otra:

1. La lista actual **queda como está** (todos los ítems siguen marcados como comprados; sirve de historial).
2. Alguien crea una nueva lista: `/crear-lista nombre` (ej. `piso-semana2` o `compras-abril`).
3. El resto se une: `/unirse lista:nombre`.
4. Todos cambian a la nueva lista: `/usar-lista lista:nombre`.

A partir de ahí trabajan en la nueva lista. La anterior sigue existiendo; si quieren pueden eliminarla con `/eliminar-lista` (solo el creador de la lista puede eliminarla).

---

## Comandos

### Ayuda y listas (elegir en qué lista trabajas)

| Comando | Descripción |
|--------|-------------|
| **/ayuda** | Muestra todos los comandos del bot. |
| **/crear-lista** `nombre` | Crea una **lista grupal** en el canal. Tú quedas dentro; otros se unen con `/unirse`. Puedes crear tantas como quieras (nombres distintos). |
| **/mi-lista** | Activa **tu lista personal** en este canal (solo tú la ves y editas). Si no existía, se crea. |
| **/unirse** `lista` | Te unes a una lista grupal del canal para ver y editar con otros. |
| **/salir** `lista` | Sales de una lista grupal (no borra la lista ni los productos). No aplica a "general" ni a tu lista personal. |
| **/usar-lista** `lista` | Elige qué lista usar en este canal. Opción: `mi lista` para tu lista personal. `/agregar`, `/lista`, etc. afectan a esta lista. |
| **/eliminar-lista** `lista` | **Elimina** una lista y todos sus productos. Solo el **creador** de la lista puede eliminarla. No se puede eliminar la lista "general". Para tu lista personal puedes usar `lista: mi lista`. |

### Productos (sobre la lista que tengas activa)

| Comando | Descripción |
|--------|-------------|
| **/agregar** `producto` [cantidad] [categoría] [unidad] | Añade un producto. Unidad opcional: L, ml, kg, g, un, etc. |
| **/quitar** `producto` | Quita un producto de la lista. |
| **/lista** [incluir_comprados] | Muestra la lista (por defecto incluye comprados). |
| **/limpiar** [solo_comprados] | Vacía la lista. Con `solo_comprados: true` solo borra los marcados como comprados. |
| **/marcar** `comprado` / `pendiente` `producto` | Marca como comprado o vuelve a pendiente. |
| **/ver-lista** [lista] | Genera un **link** para ver y marcar la lista desde el celular. Si no pones lista, usa la que tengas activa. |

---

### Vista web (celular)

Usa **/ver-lista** en un canal: el bot te devuelve un **link privado** para ese canal. Desde la web puedes:
- **Ver** la lista (por comprar y comprados).
- **Marcar comprado** / **Desmarcar**.
- **Quitar** un ítem de la lista (mismo efecto que `/quitar` en Discord).

El link es estable; puedes guardarlo en favoritos. Configura `WEB_BASE_URL` en `.env` con la URL pública (ej. `http://TU_IP:3000` en EC2) para que funcione fuera de tu red.

**Editar** un ítem (cambiar cantidad, unidad, etc.) por ahora solo desde Discord: usa `/quitar` y vuelve a `/agregar` con los datos correctos. Un comando `/editar` o edición desde la web se puede añadir más adelante.

### Portal web (login con Discord)

En `{WEB_BASE_URL}/portal` hay un **portal** donde puedes iniciar sesión con Discord y ver **todas tus listas** en un solo lugar:
- Listas que creaste tú
- Listas grupales a las que te uniste con `/unirse`
- Listas que tengas activas en algún canal

Para activarlo:
1. En [Discord Developer Portal](https://discord.com/developers/applications) → tu aplicación → OAuth2 → Redirects, añade:  
   `http://localhost:3000/portal/auth/callback` (desarrollo) y/o  
   `https://tu-dominio/portal/auth/callback` (producción).
2. En `.env` añade `DISCORD_CLIENT_SECRET` (misma app, pestaña OAuth2).
3. Opcional: `SESSION_SECRET` para firmar cookies (si no, se usa el bot token).

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

## Tests y validaciones

El proyecto incluye **tests** con [Vitest](https://vitest.dev) y **validaciones** en la capa de servicio.

**Ejecutar tests:**

```bash
npm test
```

En modo watch (re-ejecuta al cambiar archivos):

```bash
npm run test:watch
```

**Validaciones aplicadas:**

- **Nombre de producto:** obligatorio, sin espacios vacíos, máximo 100 caracteres.
- **Cantidad:** entero ≥ 1 y ≤ 9999.
- **Categoría:** opcional, máximo 50 caracteres.

Los comandos slash (`/agregar`, `/quitar`, `/marcar`) usan `setMaxLength` y `setMaxValue` para que Discord también aplique estos límites en la UI.

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

Copia `.env.example` a `.env`, rellena `DISCORD_BOT_TOKEN` y `DISCORD_CLIENT_ID`, y súbelo a la instancia (o créalo allí y pega los valores). Si quieres usar la vista web en el celular (**/ver-lista**), añade `WEB_BASE_URL=http://TU_IP_PUBLICA:3000` (reemplaza por la IP de tu EC2) y abre el **puerto 3000** en el grupo de seguridad de la instancia (inbound rule TCP 3000 desde tu IP o 0.0.0.0/0 si quieres acceder desde cualquier red).

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

# Git (para clonar y para CI/CD)
sudo yum install -y git
```

**Ubuntu:**

```bash
sudo apt update && sudo apt install -y docker.io git
sudo systemctl start docker && sudo systemctl enable docker
sudo usermod -aG docker ubuntu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

Cierra sesión SSH y vuelve a entrar (o ejecuta `newgrp docker`) para que el usuario pueda usar Docker sin `sudo`.

### 3. Configurar SSH en EC2 (para clonar por Git y para CI/CD)

Así la instancia puede clonar el repo por SSH y, más adelante, un pipeline (p. ej. GitHub Actions) puede hacer `git pull` o desplegar vía SSH.

**En la instancia EC2:**

1. Generar una clave SSH (sin passphrase para uso en servidor):

```bash
ssh-keygen -t ed25519 -C "ec2-bot-despensa" -f ~/.ssh/id_ed25519_bot -N ""
```

2. Ver la clave pública para copiarla:

```bash
cat ~/.ssh/id_ed25519_bot.pub
```

Copia todo el contenido (empieza con `ssh-ed25519 ...`).

3. En **GitHub** (o GitLab/Bitbucket):
   - Repo → **Settings** → **Deploy keys** → **Add deploy key**
   - **Title:** `EC2 bot alacena` (o el nombre que quieras)
   - **Key:** pega la clave pública
   - Marca **Allow write access** solo si el CI/CD va a hacer push desde la instancia (normalmente no)
   - **Add key**

4. Opcional: configurar Git para usar esta clave solo con GitHub:

```bash
# En EC2
mkdir -p ~/.ssh
cat >> ~/.ssh/config << 'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_bot
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
```

5. Probar que SSH funciona:

```bash
ssh -T git@github.com
```

Deberías ver algo como: `Hi usuario/repo! You've successfully authenticated...`

### 4. Clonar, crear `.env` y levantar el bot

```bash
# Clonar por SSH (reemplaza con tu usuario y repo)
git clone git@github.com:TU_USUARIO/bot-discord-despensa.git
cd bot-discord-despensa

# Crear .env con DISCORD_BOT_TOKEN y DISCORD_CLIENT_ID
nano .env

# Levantar el bot (usa docker-compose si en tu sistema el comando es con guión)
docker compose up -d --build
# O: docker-compose up -d --build
```

- Ver logs: `docker compose logs -f` (o `docker-compose logs -f`)
- Reiniciar: `docker compose restart` (o `docker-compose restart`)
- Parar: `docker compose down` (o `docker-compose down`)

Si obtienes `unknown shorthand flag: 'd'`, tu instalación usa el binario clásico: ejecuta **`docker-compose`** (con guión) en lugar de `docker compose`.

El volumen `./data` persiste la base SQLite en el host, así que los datos se mantienen al actualizar la imagen.

**Resetear la BD en producción** (borra todas las listas y productos):

```bash
# En el servidor (EC2), dentro del directorio del proyecto:
docker compose down
# Borrar la BD (y archivos WAL si existen)
rm -f data/bot.db data/bot.db-shm data/bot.db-wal
docker compose up -d --build
```

Al arrancar, el bot creará de nuevo el esquema vacío.

### CI/CD con GitHub Actions

Al hacer **push a `main` o `master`**, un workflow despliega automáticamente en EC2: se conecta por SSH, hace `git pull` y ejecuta `docker compose up -d --build`.

**Secrets que debes configurar en el repo** (Settings → Secrets and variables → Actions → New repository secret):

| Secret          | Descripción |
|-----------------|-------------|
| `EC2_HOST`      | IP pública o hostname de la instancia EC2 (ej. `3.12.34.56` o `ec2-3-12-34-56.compute-1.amazonaws.com`) |
| `EC2_USER`      | Usuario SSH en la instancia: `ec2-user` (Amazon Linux) o `ubuntu` (Ubuntu) |
| `EC2_SSH_KEY`   | Contenido completo del archivo `.pem` (clave privada) que usas para conectarte a EC2 por SSH. Copia todo el archivo, incluidas las líneas `-----BEGIN ... KEY-----` y `-----END ... KEY-----`. |

**Ruta del proyecto en EC2:** el workflow asume que el repo está en `~/proyectos/bot-discord-despensa`. Si clonaste en otra ruta (por ejemplo `~/proyectos/bot-discord`), edita `.github/workflows/deploy.yml` y cambia la línea del `cd` en el `script`.

### Build solo con Docker (sin compose)

```bash
docker build -t bot-despensa .
docker run -d --restart unless-stopped --env-file .env -v $(pwd)/data:/app/data --name bot-despensa bot-despensa
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
