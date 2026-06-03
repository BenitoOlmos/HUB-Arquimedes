#!/bin/bash

# Script de Despliegue Inicial para HUB-Arquimedes en Servidor Benito
# Ubicación: /var/www/HUB-Arquimedes/

set -e

PROJECT_PATH="/var/www/HUB-Arquimedes"

# Obtener token de GitHub para clonar
if [ -z "$1" ]; then
    read -sp "Introduce tu Token de Acceso Personal (PAT) de GitHub: " GITHUB_TOKEN
    echo ""
else
    GITHUB_TOKEN=$1
fi

if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: Se requiere un token de GitHub."
    exit 1
fi

REPO_URL="https://BenitoOlmos:${GITHUB_TOKEN}@github.com/BenitoOlmos/HUB-Arquimedes.git"

echo "=== 🧪 Iniciando Despliegue en Servidor Benito ==="

# 1. Clonar o actualizar el repositorio
if [ ! -d "$PROJECT_PATH" ]; then
    echo "Clonando repositorio por primera vez..."
    git clone "$REPO_URL" "$PROJECT_PATH"
else
    echo "El directorio ya existe. Actualizando código con git pull..."
    cd "$PROJECT_PATH"
    git pull
fi

cd "$PROJECT_PATH"

# 2. Crear archivo .env de producción
echo "Creando archivo .env de configuración..."
cat << 'EOF' > .env
# CONFIGURACIÓN DEL PROYECTO
PROJECT_NAME=HUB-Arquimedes
COMPOSE_PROJECT_NAME=hub-arquimides

# UBICACIÓN DEL PROYECTO
SERVER=servidor-benito
PROJECT_PATH=/var/www/HUB-Arquimedes/

# PUERTOS HOST (Rango 20000)
PORT=20000
HOST_PORT_BACKEND=20001
HOST_PORT_DB=20002
HOST_PORT_REDIS=20003
HOST_PORT_WEB=20004
HOST_PORT_CENTRIFUGA=20000

# VARIABLES DEL BACKEND
DATABASE_URL="postgresql://admin_arquimedes:admin_password_secure@localhost:20002/arquimedes_database?schema=public"
JWT_SECRET="CualquierClaveLargaYSecreta123"

# VISUALIZACION EN LA WEB
WEB_URL="https://www.arquimedes.online"
CENTRIFUGA_URL="https://centrifuga.arquimedes.online"

# CREDENCIALES ZOHO MAIL
SMTP_HOST="smtp.zoho.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="notificaciones@arquimedes.online"
SMTP_PASS="8zYzyk5P1eGN"

# GOOGLE CLOUD & VERTEX AI
GOOGLE_APPLICATION_CREDENTIALS="/var/www/erp-encontrarte/backend/vertex-credentials.json"
GOOGLE_CLOUD_PROJECT="practical-mason-448013-k8"
GOOGLE_CLOUD_LOCATION="us-central1"

# CLOUDFLARE TUNNEL TOKEN
TUNNEL_TOKEN="eyJhIjoiYzYwYTU1OWYxN2E5ZDgyMGI4ZTFhZmI2N2EzNDdjY2EiLCJ0IjoiNDc2ODI2Y2ItZjE0Ni00NmYyLWEwYzktOTkyNjY4MTQzYWNhIiwicyI6Ik4yTmtPREkxWm1JdE56ZGhPQzAwTXpoa0xXSXlNelV0TVRrek1HUTJPREEzTXpkayJ9"
EOF

# 3. Levantar contenedores Docker
echo "Construyendo y levantando contenedores Docker..."
docker compose up --build -d

# 4. Esperar a que la base de datos esté lista
echo "Esperando que la base de datos esté lista..."
until docker compose exec db pg_isready -U admin_arquimedes -d arquimedes_database; do
  echo "Base de datos iniciando, esperando 2 segundos..."
  sleep 2
done

# 5. Ejecutar migraciones y seeder de base de datos
echo "Aplicando esquema de Prisma en PostgreSQL..."
docker compose exec backend npx prisma db push

echo "Poblando base de datos con componentes iniciales..."
docker compose exec backend npx prisma db seed

echo "=== 🚀 Despliegue Completado con Éxito ==="
echo "Acceso a servicios:"
echo " - Portal Web: http://localhost:20004"
echo " - Simulador Bomba (React): http://localhost:20000"
echo " - API Backend: http://localhost:20001"
echo " - PostgreSQL: localhost:20002"
