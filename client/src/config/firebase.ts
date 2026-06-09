// Firebase configuration
// IMPORTANTE: Estos valores son placeholders. Debes crear un proyecto en Firebase Console
// y reemplazar estos valores con los de tu proyecto.

// Para obtener la configuración:
// 1. Ir a https://console.firebase.google.com
// 2. Crear un proyecto nuevo
// 3. Ir a Project Settings > General
// 4. Agregar una app web
// 5. Copiar el objeto de configuración

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== 'YOUR_API_KEY' && 
         firebaseConfig.apiKey !== '' &&
         firebaseConfig.apiKey !== undefined;
};
