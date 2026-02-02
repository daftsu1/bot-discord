# Configurar HTTPS en EC2 con Nginx y Let's Encrypt

Guía para poner tu bot tras HTTPS usando tu hostname de No-IP (ej: `bot-listas.ddns.net`).

## Requisitos previos

- Instancia EC2 (Amazon Linux 2)
- Hostname de No-IP apuntando a la IP de tu EC2
- Repo en GitHub (o similar)

---

## Parte A: Setup inicial (si empiezas de cero)

### A.1. Conectar por SSH

```bash
ssh -i tu-clave.pem ec2-user@54.89.163.56
```

### A.2. Instalar Docker, Docker Compose y Git

**Amazon Linux 2:**
```bash
sudo yum update -y
sudo yum install -y docker git
sudo systemctl start docker && sudo systemctl enable docker
sudo usermod -aG docker ec2-user
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

Cierra sesión y vuelve a entrar (o ejecuta `newgrp docker`).

### A.3. Crear carpeta del proyecto y clonar

```bash
mkdir -p ~/proyectos
cd ~/proyectos
git clone https://github.com/TU_USUARIO/bot-discord-despensa.git
cd bot-discord-despensa
```

(Reemplaza la URL por la de tu repositorio)

### A.4. Crear el archivo .env

```bash
cp .env.example .env
nano .env
```

Rellena al menos:
```
DISCORD_BOT_TOKEN=tu_token
DISCORD_CLIENT_ID=tu_client_id
DISCORD_CLIENT_SECRET=tu_client_secret
WEB_BASE_URL=http://54.89.163.56:3000
```

(Luego cambiarás `WEB_BASE_URL` a HTTPS cuando termines la guía)

### A.5. Levantar el bot

```bash
docker compose up -d --build
```

Verifica: `docker ps` — debe aparecer el contenedor corriendo.

### A.6. Abrir puerto 3000 en AWS

En AWS Console → EC2 → Security Groups → tu instancia:
- Añadir regla de entrada: Puerto **3000**, Origen `0.0.0.0/0`

Prueba: `http://54.89.163.56:3000/portal` — debe cargar (sin HTTPS aún).

---

## Parte B: Configurar HTTPS

### 1. Instalar Nginx

**Amazon Linux 2:**
```bash
sudo yum install -y nginx
sudo systemctl start nginx && sudo systemctl enable nginx
```

### 2. Crear carpetas y configurar Nginx como reverse proxy

En Amazon Linux, Nginx usa `/etc/nginx/conf.d/`. Crea el archivo de configuración (reemplaza `bot-listas.ddns.net` por tu hostname):

```bash
sudo nano /etc/nginx/conf.d/despensa.conf
```

Pega esta configuración (HTTP por ahora; HTTPS lo añadirá Certbot):

```nginx
server {
    listen 80;
    server_name bot-listas.ddns.net;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Guarda (Ctrl+O, Enter, Ctrl+X).

Quita el default si existe y recarga Nginx:

```bash
sudo rm -f /etc/nginx/conf.d/default.conf
sudo nginx -t && sudo systemctl reload nginx
```

### 3. Abrir puertos 80 y 443 en AWS

1. En AWS Console → EC2 → Security Groups
2. Selecciona el security group de tu instancia
3. Edita las reglas de entrada (Inbound rules)
4. Añade:
   - **Puerto 80** (HTTP): Origen `0.0.0.0/0`
   - **Puerto 443** (HTTPS): Origen `0.0.0.0/0`

### 4. Instalar Certbot y obtener el certificado SSL

**Amazon Linux 2:**
```bash
sudo amazon-linux-extras install epel -y
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d bot-listas.ddns.net
```

Certbot te pedirá:
- Un email (para avisos de renovación)
- Aceptar los términos
- Opcional: compartir el email con la EFF

Si todo va bien, Certbot modificará la configuración de Nginx para usar HTTPS.

### 5. Actualizar la app

En tu `.env` del servidor, cambia:

```
WEB_BASE_URL=https://bot-listas.ddns.net
```

En [Discord Developer Portal](https://discord.com/developers/applications) → tu app → OAuth2 → Redirects, añade:
```
https://bot-listas.ddns.net/portal/auth/callback
```

Luego reinicia el contenedor:

```bash
cd ~/proyectos/bot-discord-despensa
docker compose down && docker compose up -d
```

(Usa la ruta real de tu proyecto)

### 6. Probar

Abre en el navegador:

```
https://bot-listas.ddns.net/portal
```

Deberías ver el portal con el candado verde.

---

## Renovación automática del certificado

Let's Encrypt caduca cada 90 días. Certbot configura un cron para renovar. Puedes comprobarlo con:

```bash
sudo certbot renew --dry-run
```

---

## Problemas habituales

### "Connection refused" al abrir la URL
- Comprueba que el bot está corriendo: `docker ps`
- Que Nginx escucha: `sudo systemctl status nginx`

### Certbot falla con "Challenge failed"
- Verifica que el hostname resuelve a tu IP: `nslookup bot-listas.ddns.net`
- Que el puerto 80 está abierto en el security group

### La app usa HTTP internamente
- Nginx envía `X-Forwarded-Proto`, que ya está configurado
- Si usas cookies/sesiones, asegúrate de que funcionan con HTTPS
