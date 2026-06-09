#!/bin/bash
# Script para manejar migraciones fallidas y iniciar la aplicación

# Crear archivo temporal de migración para poder marcarla como resuelta
mkdir -p prisma/migrations/20250609000002_clean_duplicates
echo "-- Empty migration" > prisma/migrations/20250609000002_clean_duplicates/migration.sql

# Marcar migración fallida como resuelta
npx prisma migrate resolve --applied "20250609000002_clean_duplicates" || true

# Ejecutar migraciones pendientes
npx prisma migrate deploy

# Ejecutar seed
npm run prisma:seed

# Iniciar aplicación
node dist/src/main
