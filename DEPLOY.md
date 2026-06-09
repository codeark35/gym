# 🚀 Guía de Deploy — GymTracker Pro

## Stack de Deploy Recomendado

| Servicio | Uso | Por qué |
|---|---|---|
| **Vercel** | Frontend React | Deploy automático desde GitHub, CDN global, HTTPS gratuito, perfecto para SPAs |
| **Railway** | Backend NestJS + PostgreSQL | Deploy simple de Docker, PostgreSQL integrado, variables de entorno fáciles, buen free tier |

> ⚠️ **Alternativa**: Podés usar Render o Fly.io para el backend si prefierís. Railway es el más simple para empezar.

---

## 1. Deploy del Backend (Railway)

### 1.1 Crear proyecto en Railway

1. Andá a https://railway.app y logueate con GitHub
2. Crear nuevo proyecto → "Deploy from GitHub repo"
3. Seleccioná tu repo `gym/server` (o subilo a GitHub primero)
4. Railway detecta automáticamente que es Node.js

### 1.2 Agregar PostgreSQL

1. En el proyecto de Railway, click en "New" → "Database" → "Add PostgreSQL"
2. Railway crea la base de datos y te da la `DATABASE_URL` automáticamente
3. No necesitás configurar nada más

### 1.3 Configurar variables de entorno

En Railway → Variables, agregá:

```env
# Railway te da esto automáticamente
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT
JWT_SECRET=super-secret-key-32-caracteres-o-mas
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN=7d

# Frontend (TU dominio de Vercel)
FRONTEND_URL=https://tu-app.vercel.app
CORS_ORIGINS=https://tu-app.vercel.app

# Gemini AI
GEMINI_API_KEY=tu-api-key

# Firebase Admin (copiar desde el .env que ya tenés)
FIREBASE_PROJECT_ID=gymrat-1e753
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-... 

# App
NODE_ENV=production
PORT=3000
```

### 1.4 Configurar deploy

El archivo `railway.json` ya está en el repo. Railway lo va a usar automáticamente.

1. Prisma migrate se ejecuta automáticamente antes de iniciar
2. El healthcheck verifica que el servidor esté vivo

### 1.5 Obtener la URL del backend

1. Una vez deployado, Railway te da una URL como `https://gymtracker-pro.up.railway.app`
2. Copiá esa URL — la vas a necesitar para el frontend

---

## 2. Deploy del Frontend (Vercel)

### 2.1 Preparar el frontend

1. Subí el frontend a GitHub (si no está ya)
2. Asegurate de tener `vercel.json` en la raíz del proyecto `client/`

### 2.2 Crear proyecto en Vercel

1. Andá a https://vercel.com e logueate con GitHub
2. "Add New Project" → Importá tu repo `gym/client`
3. Vercel detecta automáticamente que es Vite + React

### 2.3 Configurar variables de entorno

En Vercel → Settings → Environment Variables:

```env
VITE_API_URL=https://tu-backend.up.railway.app/api/v1
VITE_APP_NAME="GymTracker Pro"
VITE_DEV_LOGIN=false

# Firebase
VITE_FIREBASE_API_KEY=AIzaSyBsGVSbjxsgxFzc2OlnBJVbR6Boyc-Cf70
VITE_FIREBASE_AUTH_DOMAIN=gymrat-1e753.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gymrat-1e753
VITE_FIREBASE_STORAGE_BUCKET=gymrat-1e753.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=259539129480
VITE_FIREBASE_APP_ID=1:259539129480:web:3075f4fdd89c9aae927b3d
```

> ⚠️ **Importante**: La URL del backend debe ser la que te dio Railway (paso 1.5)

### 2.4 Deploy

1. Hacé clic en "Deploy"
2. Vercel compila y deploya automáticamente
3. Te da una URL como `https://gymtracker-pro.vercel.app`

---

## 3. Configurar Firebase para producción

### 3.1 Dominios autorizados

1. Andá a Firebase Console → Authentication → Settings → Authorized domains
2. Agregá tu dominio de Vercel:
   - `https://tu-app.vercel.app`
   - `https://tu-app-git-main.vercel.app` (preview deploys)

### 3.2 Service Account (backend)

1. Firebase Console → Project Settings → Service Accounts
2. Generar nueva private key
3. Copiar el JSON en la variable `FIREBASE_PRIVATE_KEY` de Railway

---

## 4. Configurar CORS en el backend

El backend ya está configurado para leer `CORS_ORIGINS` desde variables de entorno. Solo asegurate de que `FRONTEND_URL` en Railway sea tu dominio de Vercel.

---

## 5. HTTPS obligatorio

Todo el stack usa HTTPS automáticamente:
- **Vercel**: HTTPS gratuito con certificado Let's Encrypt
- **Railway**: HTTPS gratuito con certificado gestionado

No necesitás configurar nada.

---

## 6. Actualizar DNS (opcional)

Si querés usar tu propio dominio (ej: `gymtracker.com`):

1. Comprá el dominio en Cloudflare o Namecheap
2. En Vercel: Settings → Domains → Add domain
3. En Cloudflare: CNAME `www` → `cname.vercel-dns.com`
4. En Railway: Settings → Domains → Add custom domain

---

## 7. Comandos útiles

### Ver logs en Railway
```bash
railway logs
```

### Re-deploy manual
```bash
railway up
```

### Ver variables
```bash
railway variables
```

---

## 8. Troubleshooting

### Error 401 al loguear
- Verificar que `FIREBASE_PRIVATE_KEY` esté correctamente escapada en Railway
- Verificar que `FIREBASE_PROJECT_ID` coincida con el frontend

### Error de CORS
- Verificar que `CORS_ORIGINS` incluya el dominio de Vercel
- Verificar que `FRONTEND_URL` sea correcto

### No se conecta a la base de datos
- Verificar que `DATABASE_URL` esté seteada en Railway
- Railway debería hacerlo automáticamente si agregaste PostgreSQL

### Build falla en Vercel
- Verificar que `vercel.json` esté en la raíz del proyecto
- Verificar que `package.json` tenga el script `build`

---

## 9. Costos estimados

### Free Tier
- **Vercel**: Ilimitado para proyectos personales (hobby plan)
- **Railway**: $5 de crédito mensual (suficiente para 1 app + DB)
- **Firebase**: 10,000 usuarios/mes gratis
- **Gemini**: 60 queries/minuto gratis

### Cuando escales
- Railway: ~$5-10/mes para 1 app + PostgreSQL
- Vercel: Gratis para uso personal
- Firebase: Gratis hasta 10k usuarios

---

## 10. Checklist pre-deploy

- [ ] Backend en Railway con PostgreSQL
- [ ] Variables de entorno configuradas en Railway
- [ ] Frontend en Vercel
- [ ] Variables de entorno configuradas en Vercel (incluyendo URL del backend)
- [ ] Firebase Auth configurado con dominio de Vercel
- [ ] Service Account de Firebase en Railway
- [ ] CORS configurado en backend
- [ ] HTTPS funcionando en ambos
- [ ] Login con Google funcionando
- [ ] Registro de entrenamientos funcionando
- [ ] Resumen de entrenamiento funcionando

---

¿Listo para deployar? 🚀
