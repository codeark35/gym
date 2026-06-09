# Firebase Setup Guide - GymTracker Pro

> Guía paso a paso para configurar Firebase Auth en GymTracker Pro

---

## 🎯 Paso 1: Crear un Proyecto en Firebase

### 1.1 Ir a Firebase Console
1. Abrí tu navegador y andá a: **https://console.firebase.google.com**
2. Loggeate con tu cuenta de Google (la misma que usás para todo)

### 1.2 Crear un proyecto nuevo
1. Click en **"Create a project"** (o "Crear un proyecto")
2. En **"Project name"**, escribí: `gymtracker-pro` (o el nombre que prefieras)
   - Ejemplo: `gymtracker-pro` o `gym-tracker-dev`
3. Click en **"Continue"**
4. **Google Analytics**: Desactivá el switch (no lo necesitamos para esta app)
5. Click en **"Create project"**
6. Esperá unos segundos a que se cree y click en **"Continue"**

---

## 🔐 Paso 2: Habilitar Firebase Authentication

### 2.1 Ir a Authentication
1. En el menú lateral izquierdo, click en **"Build"** (flecha para abajo)
2. Click en **"Authentication"**
3. Click en **"Get started"** (o el botón azul para comenzar)

### 2.2 Habilitar Google Sign-In
1. Vas a ver una lista de proveedores. Click en **"Google"**
2. **Habilitalo**: click en el switch que dice "Enable"
3. En **"Support email for project"**, seleccioná tu email
4. Click en **"Save"**

---

## 🔑 Paso 3: Obtener Configuración del Frontend

### 3.1 Ir a Project Settings
1. En el menú superior, click en **"Project settings"** (icono de engranaje ⚙️)
2. Asegurate de estar en la pestaña **"General"**

### 3.2 Agregar una App Web
1. Bajá hasta encontrar **"Your apps"** ("Tus apps")
2. Click en **"Add app"** (botón con el icono `</>`)
3. Seleccioná **"Web"** (segunda opción, el icono `</>`)
4. Te va a preguntar por un **"App nickname"**. Escribí: `gymtracker-web`
5. Click en **"Register app"**
6. Esperá que termine y click en **"Continue to console"**

### 3.3 Copiar la configuración de Firebase
1. Ahora, en **"Project settings > General"**, vas a ver tu app
2. Bajá hasta encontrar el bloque de código **"SDK setup and configuration"**
3. Copiá el objeto que se ve así:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "TU-PROYECTO.firebaseapp.com",
  projectId: "TU-PROYECTO",
  storageBucket: "TU-PROYECTO.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

4. Copiá esos valores al archivo **`client/.env`** (lo hacemos en el paso 5)

---

## 🔑 Paso 4: Obtener Credenciales del Backend

### 4.1 Ir a Service Accounts
1. En el menú lateral, click en **"Project settings"** ⚙️
2. Click en la pestaña **"Service accounts"** (Cuentas de servicio)
3. Bajá hasta **"Firebase Admin SDK"**
4. Click en **"Generate new private key"** (Generar nueva clave privada)
5. Click en **"Generate key"** en el popup
6. Se va a descargar un archivo `.json` a tu computadora (ej: `gymtracker-pro-firebase-adminsdk-abc123.json`)

### 4.2 Extraer los valores del archivo
1. Abrí el archivo `.json` descargado (con un editor de texto o Notepad)
2. Vas a ver algo como esto:

```json
{
  "type": "service_account",
  "project_id": "gymtracker-pro",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@gymtracker-pro.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/..."
}
```

3. Copiá estos 3 valores:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

---

## 📝 Paso 5: Configurar los .env

### 5.1 Frontend: `client/.env`

1. Abrí el archivo `C:\projects\gym\client\.env`
2. Reemplazá los valores de Firebase con los que copiaste del paso 3.3:

```env
# ============================================
# GymTracker Pro — Frontend Environment Variables
# ============================================

VITE_API_URL=http://localhost:3022/api/v1
VITE_APP_NAME="GymTracker Pro"
VITE_DEV_LOGIN=true

# ─── Firebase Auth ───────────────────────────
# Copiar desde Firebase Console > Project Settings > General
VITE_FIREBASE_API_KEY=AIzaSyB... (tu apiKey)
VITE_FIREBASE_AUTH_DOMAIN= gymtracker-pro.firebaseapp.com
VITE_FIREBASE_PROJECT_ID= gymtracker-pro
VITE_FIREBASE_STORAGE_BUCKET= gymtracker-pro.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID= 123456789
VITE_FIREBASE_APP_ID= 1:123456789:web:abc123
```

### 5.2 Backend: `server/.env`

1. Abrí el archivo `C:\projects\gym\server\.env`
2. Reemplazá los valores de Firebase con los del paso 4.2:

```env
# ─── Firebase Admin ────────────────────────────
# Copiar desde Firebase Console > Project Settings > Service Accounts
FIREBASE_PROJECT_ID= gymtracker-pro
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL= firebase-adminsdk-xxxxx@gymtracker-pro.iam.gserviceaccount.com
```

⚠️ **IMPORTANTE**: El `FIREBASE_PRIVATE_KEY` debe incluir las comillas dobles `"` al inicio y al final, y el `\n` DEBE estar en el archivo. No lo reemplazés por saltos de línea reales.

---

## 🌐 Paso 6: Autorizar Dominios

### 6.1 Dominios autorizados
1. En Firebase Console, andá a **Authentication** (en el menú lateral)
2. Click en la pestaña **"Settings"** (Configuración)
3. Bajá a **"Authorized domains"** (Dominios autorizados)
4. Si estás en **desarrollo local**, `localhost` ya está incluido por defecto ✅
5. Para **producción**, agregá tu dominio:
   - Click en **"Add domain"**
   - Escribí: `tudominio.com` (o el dominio de tu frontend en Cloudflare Pages)
   - Click en **"Add"**

---

## 🔄 Paso 7: Reiniciar y Probar

### 7.1 Reiniciar backend
1. Si el backend está corriendo, detenelo (Ctrl+C)
2. Inicialo de nuevo:
   ```bash
   cd server
   npm run start:dev
   ```

### 7.2 Reiniciar frontend
1. Si el frontend está corriendo, detenelo (Ctrl+C)
2. Inicialo de nuevo:
   ```bash
   cd client
   npm run dev
   ```

### 7.3 Probar login
1. Abrí la app en el navegador: `http://localhost:5173`
2. Andá a **Login**
3. Click en **"Iniciar sesión con Google"**
4. Debería abrir un **popup** (no redirect) con Google Sign-In
5. Seleccioná tu cuenta
6. ¡Listo! Debería loggearte automáticamente y redirigir al Dashboard

---

## 🐛 Solución de Problemas

### "Firebase no está configurado"
- Verificá que los valores en `client/.env` no estén vacíos
- Reiniciá el frontend (`npm run dev`)

### "El popup fue bloqueado"
- Permití popups en tu navegador para `localhost:5173`
- O usá el botón "Acceso de desarrollo" para testear

### "Este dominio no está autorizado"
- Agregá `localhost` en Firebase Console > Auth > Settings > Authorized domains
- Para producción, agregá tu dominio

### "Token de Firebase inválido" (backend)
- Verificá que `FIREBASE_PRIVATE_KEY` tenga las comillas y `\n` correctos
- Revisá que `FIREBASE_PROJECT_ID` coincida exactamente con el de Firebase Console
- Reiniciá el backend

### "Firebase Admin initialization failed" (backend)
- Si estás en Windows, a veces el `\n` en la private key se rompe
- Probá sin comillas alrededor del private key:
  ```env
  FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n
  ```

---

## 📝 Resumen

| Paso | Archivo | Valor | De dónde sacarlo |
|------|---------|-------|------------------|
| 1 | - | Crear proyecto | Firebase Console |
| 2 | - | Habilitar Google Auth | Firebase Console > Auth |
| 3 | `client/.env` | VITE_FIREBASE_API_KEY, etc. | Firebase Console > Project Settings > General |
| 4 | `server/.env` | FIREBASE_PROJECT_ID, PRIVATE_KEY, CLIENT_EMAIL | Firebase Console > Project Settings > Service Accounts |
| 5 | - | Autorizar dominios | Firebase Console > Auth > Settings |
| 6 | - | Reiniciar todo | Backend + Frontend |

---

> ¿Necesitás ayuda con algún paso? Decime en qué paso estás y te ayudo.
