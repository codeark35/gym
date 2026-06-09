#!/bin/sh
set -e

echo "🚀 Iniciando GymTracker API..."

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones de Prisma..."
npx prisma migrate deploy

# Iniciar la aplicación
echo "🎉 Iniciando servidor..."
exec npm run start:prod
