#!/bin/bash
# Script para manejar migraciones fallidas y iniciar la aplicación

set -e  # Exit on any error

echo "=== GymTracker Pro Startup Script ==="

# Limpiar migración fallida directamente en la base de datos
echo "[1/5] Checking for failed migration..."
node prisma/fix-migration.js

# Ejecutar migraciones pendientes
echo "[2/5] Running migrations..."
npx prisma migrate deploy

# Limpiar duplicados de ejercicios
echo "[3/5] Cleaning up duplicate exercises..."
node prisma/clean-duplicates.js

# Ejecutar seed
echo "[4/5] Seeding exercises..."
npm run prisma:seed

# Iniciar aplicación
echo "[5/5] Starting application..."
node dist/src/main
