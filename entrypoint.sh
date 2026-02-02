#!/bin/sh
set -e
# Asegurar que /app/data sea escribible por el usuario del contenedor (volumen montado)
chown -R 1001:1001 /app/data 2>/dev/null || true
exec gosu 1001 node src/index.js
