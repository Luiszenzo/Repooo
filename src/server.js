#!/bin/bash
set -e

PASSWORD="$1"

if [ -z "$PASSWORD" ]; then
    echo "❌ Error: Se requiere la contraseña como parámetro"
    echo "Uso: $0 <password>"
    exit 1
fi

echo "🚀 Iniciando despliegue BLUE-GREEN..."
echo "🔄 Cambiando a BLUE..."

# Detectar ambiente actual ANTES del cambio
CURRENT_ENV=$(curl -s http://localhost | grep -o '"environment":"[^"]*' | cut -d'"' -f4 2>/dev/null || echo "unknown")
echo "🔍 Ambiente actual (antes): $CURRENT_ENV"

# Desplegar en BLUE
echo "📦 Desplegando en BLUE..."
cd /srv/app/blue
docker compose build --no-cache
docker compose up -d

# Esperar a que esté listo
echo "⏳ Esperando que BLUE esté listo..."
for i in {1..10}; do
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ BLUE está saludable"
        break
    fi
    echo "⏰ Intento $i/10 - BLUE no responde, esperando..."
    sleep 3
done

# Cambiar configuración de Nginx (FORZAR)
echo "🔀 Cambiando tráfico a BLUE..."
echo "$PASSWORD" | sudo -S rm -f /etc/nginx/sites-enabled/app_active.conf
echo "$PASSWORD" | sudo -S ln -s /etc/nginx/sites-available/app_blue.conf /etc/nginx/sites-enabled/app_active.conf

# Recargar completamente Nginx
echo "$PASSWORD" | sudo -S systemctl daemon-reload
echo "$PASSWORD" | sudo -S nginx -t
echo "$PASSWORD" | sudo -S systemctl stop nginx
echo "$PASSWORD" | sudo -S systemctl start nginx
sleep 3

echo "✅ Cambiado a BLUE exitosamente"

# Verificar DESPUÉS del cambio
echo "🎯 Verificando cambio..."
sleep 5
NEW_ENV=$(curl -s http://localhost | grep -o '"environment":"[^"]*' | cut -d'"' -f4)
echo "🔍 Ambiente actual (después): $NEW_ENV"

# Verificar contenedores
echo "📊 Estado de contenedores:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
