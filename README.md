# Bot Discord Alacena

Bot de Discord para gestionar la lista de compras del supermercado, con soporte para cantidades, categorías y marcado de comprados.

## Módulo 1: Lista de compras

- **/ayuda** – Muestra los comandos disponibles del bot
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
