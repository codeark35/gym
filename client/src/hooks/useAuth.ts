import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigured } from '../config/firebase';
import api from '../api/axios';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  isFirebaseReady: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  googleLogin: async () => {},
  logout: async () => {},
  isFirebaseReady: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  const isConfigured = isFirebaseConfigured();

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      setIsFirebaseReady(false);
      return;
    }

    setIsFirebaseReady(true);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const res = await api.post('/auth/firebase', { idToken });
          const accessToken = res.data?.data?.access_token ?? res.data?.access_token;
          if (!accessToken) {
            throw new Error('No access token received from backend');
          }
          localStorage.setItem('access_token', accessToken);
          
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Usuario',
            email: firebaseUser.email || '',
            avatarUrl: firebaseUser.photoURL || undefined,
          });
        } catch (error) {
          console.error('Error verifying Firebase token:', error);
          // Si el backend falla, no loguear al usuario en la app
          localStorage.removeItem('access_token');
          setUser(null);
          // Opcional: desloguear de Firebase para evitar estado inconsistente
          try {
            await signOut(auth);
          } catch (e) {
            // ignore
          }
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Escuchar sesión expirada desde el interceptor de axios
    const handleSessionExpired = () => {
      setUser(null);
      setIsLoading(false);
    };
    window.addEventListener('gymtracker:session-expired', handleSessionExpired);

    return () => {
      unsubscribe();
      window.removeEventListener('gymtracker:session-expired', handleSessionExpired);
    };
  }, [isConfigured]);

  const login = useCallback(async (token: string) => {
    localStorage.setItem('access_token', token);
    try {
      const res = await api.get('/auth/me');
      const userData = res.data?.data ?? res.data;
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }, []);

  const googleLogin = useCallback(async () => {
    if (!isConfigured) {
      throw new Error('Firebase no está configurado');
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();
      const res = await api.post('/auth/firebase', { idToken });
      const accessToken = res.data?.data?.access_token ?? res.data?.access_token;
      localStorage.setItem('access_token', accessToken);
      
      setUser({
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Usuario',
        email: firebaseUser.email || '',
        avatarUrl: firebaseUser.photoURL || undefined,
      });
    } catch (error: any) {
      console.error('Google login error:', error);
      if (error.code === 'auth/popup-blocked') {
        throw new Error('El popup fue bloqueado. Por favor, permití popups para este sitio.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Login cancelado.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('Este dominio no está autorizado en Firebase. Agregalo en la consola de Firebase.');
      } else {
        throw new Error('Error al iniciar sesión con Google.');
      }
    }
  }, [isConfigured]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Firebase logout error:', error);
    }
    localStorage.removeItem('access_token');
    setUser(null);
  }, []);

  const contextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    googleLogin,
    logout,
    isFirebaseReady,
  };

  return React.createElement(AuthContext.Provider, { value: contextValue }, children);
}

export function useAuth() {
  return useContext(AuthContext);
}

export { auth, googleProvider };
