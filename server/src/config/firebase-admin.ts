import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

// Firebase Admin configuration
// IMPORTANTE: Estos valores son placeholders para desarrollo.
// Para producción, debes usar un archivo de credenciales de servicio de Firebase.

// Para obtener la configuración:
// 1. Ir a https://console.firebase.google.com
// 2. Ir a Project Settings > Service Accounts
// 3. Generar nueva clave privada
// 4. Copiar el JSON de credenciales o usar el método alternativo con variables de entorno

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

const isConfigured = !!(
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PROJECT_ID
);

console.log('🔥 Firebase Admin env check:', {
  hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
  hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
  hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
  privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length,
  startsWithQuote: process.env.FIREBASE_PRIVATE_KEY?.startsWith('"'),
  endsWithQuote: process.env.FIREBASE_PRIVATE_KEY?.endsWith('"'),
});

if (isConfigured && getApps().length === 0) {
  try {
    // Remove surrounding quotes if present (dotenv includes them)
    let privateKey = process.env.FIREBASE_PRIVATE_KEY!;
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      }),
    });
    
    adminAuth = getAuth(adminApp);
    console.log('✅ Firebase Admin inicializado correctamente');
  } catch (error: any) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    adminApp = null;
    adminAuth = null;
  }
} else if (!isConfigured) {
  console.warn('⚠️  Firebase Admin no configurado. Usando modo de desarrollo.');
  console.warn('   Para configurar, copiá las credenciales de Firebase Console al archivo .env');
}

// Export a wrapper that checks if auth is available
export const getAdminAuth = (): Auth => {
  if (!adminAuth) {
    throw new Error('Firebase Admin no está configurado. Verificá las variables de entorno FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL y FIREBASE_PROJECT_ID.');
  }
  return adminAuth;
};

export const isFirebaseAdminConfigured = () => isConfigured && adminAuth !== null;
