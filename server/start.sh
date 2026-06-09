#!/bin/bash
# Script para manejar migraciones fallidas y iniciar la aplicación

# Limpiar migración fallida directamente en la base de datos
echo "Checking for failed migration..."
node prisma/fix-migration.js

# Ejecutar migraciones pendientes
npx prisma migrate deploy

# Ejecutar seed
npm run prisma:seed

# Iniciar aplicación
node dist/src/main
