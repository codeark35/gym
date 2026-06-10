#!/bin/bash
# Script para manejar migraciones fallidas y iniciar la aplicación

set -e  # Exit on any error

echo "=== GymTracker Pro Startup Script ==="

# Crear archivo temporal de migración para poder marcarla como resuelta
echo "[1/4] Creating temporary migration file..."
mkdir -p prisma/migrations/20250609000002_clean_duplicates
echo "-- Empty migration" > prisma/migrations/20250609000002_clean_duplicates/migration.sql

# Marcar migración fallida como resuelta
echo "[2/4] Resolving failed migration..."
npx prisma migrate resolve --applied "20250609000002_clean_duplicates" || echo "Migration already resolved"

# Ejecutar migraciones pendientes
echo "[3/4] Running migrations..."
npx prisma migrate deploy

# Ejecutar seed (limpia duplicados y carga ejercicios)
echo "[4/4] Seeding exercises..."
npm run prisma:seed

# Iniciar aplicación
echo "=== Starting application..."
node dist/src/main
