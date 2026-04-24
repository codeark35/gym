# Dockerfile para el sistema de gimnasio
FROM node:22-alpine

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache openssl netcat-openbsd

# Crear directorio de trabajo
WORKDIR /app/gym

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias (incluir devDependencies para el build)
RUN npm ci

# Copiar código fuente
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Construir la aplicación
RUN npm run build

# Copiar y hacer ejecutable el script de entrada
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Exponer puerto
EXPOSE 3000

# Usar el script de entrada personalizado
ENTRYPOINT ["docker-entrypoint.sh"]
