#!/bin/bash
set -e

PASSWORD="$1"

if [ -z "$PASSWORD" ]; then
    echo "❌ Error: Se requiere la contraseña como parámetro"
    echo "Uso: $0 <password>"
    exit 1
fi

echo "🚀 Iniciando despliegue BLUE-GREEN..."
echo "🔄 Cambiando a GREEN..."

# Desplegar en GREEN
echo "📦 Desplegando en GREEN..."
cd /srv/app/green
docker compose build --no-cache
docker compose up -d

# Esperar a que esté listo
echo "⏳ Esperando que GREEN esté listo..."
sleep 10

# Cambiar configuración de Nginx
echo "🔀 Cambiando tráfico a GREEN..."
echo "$PASSWORD" | sudo -S rm -f /etc/nginx/sites-enabled/app_active.conf
echo "$PASSWORD" | sudo -S ln -s /etc/nginx/sites-available/app_green.conf /etc/nginx/sites-enabled/app_active.conf
echo "$PASSWORD" | sudo -S systemctl daemon-reload
echo "$PASSWORD" | sudo -S nginx -t && echo "$PASSWORD" | sudo -S systemctl reload nginx

echo "✅ Cambiado a GREEN exitosamente"

# Verificar
sleep 5
curl http://localhost
