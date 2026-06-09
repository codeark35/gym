import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Dumbbell, Zap, Shield, Infinity, Code2, AlertTriangle } from 'lucide-react';
import api from '../../../api/axios';

export default function LoginPage() {
  const { login, isAuthenticated, isFirebaseReady, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await googleLogin();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/dev-login');
      const accessToken = res.data?.data?.access_token ?? res.data?.access_token;
      await login(accessToken);
      navigate('/');
    } catch {
      setError('Error al conectar con el servidor. ¿Está corriendo el backend?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg d-flex align-items-center justify-content-center px-3">
      <div className="w-100" style={{ maxWidth: 420, zIndex: 1 }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <div className="position-relative d-inline-block">
            <div
              className="d-inline-flex align-items-center justify-content-center mb-3"
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                background: 'linear-gradient(135deg, #1e3a5f, #2d4a6f)',
                boxShadow: '0 10px 30px -5px rgba(30, 58, 95, 0.5), 0 0 0 4px rgba(30, 58, 95, 0.2)',
              }}
            >
              <Dumbbell size={40} className="text-white" />
            </div>
            <div
              className="position-absolute"
              style={{
                top: -10, right: -15,
                width: 40, height: 40,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%)',
              }}
            />
          </div>
          <h2 className="fw-bold text-white mb-1">GymTracker Pro</h2>
          <div className="d-flex justify-content-center gap-1 mb-2">
            <div style={{ width: 20, height: 3, borderRadius: 2, background: '#f59e0b' }} />
            <div style={{ width: 10, height: 3, borderRadius: 2, background: '#1e3a5f' }} />
            <div style={{ width: 5, height: 3, borderRadius: 2, background: '#2d6a4f' }} />
          </div>
          <p className="text-white-50">Tu compañero de entrenamiento</p>
        </div>

        {/* Login Card */}
        <div className="login-card p-4">
          {error && (
            <div className="alert alert-danger py-2 small mb-3 d-flex align-items-center gap-2">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          {!isFirebaseReady && (
            <div className="alert alert-warning py-2 small mb-3">
              <div className="d-flex align-items-center gap-2 mb-1">
                <AlertTriangle size={14} />
                <strong>Firebase no configurado</strong>
              </div>
              <div className="small">
                Para usar login con Google, necesitás configurar Firebase. Podés usar el acceso de desarrollo por ahora.
              </div>
            </div>
          )}

          {/* Google Login */}
          <button
            type="button"
            className="btn btn-dark w-100 btn-action mb-3 d-flex align-items-center justify-content-center gap-2"
            onClick={handleGoogleLogin}
            disabled={loading || !isFirebaseReady}
            style={{
              background: '#1e3a5f',
              border: 'none',
              minHeight: 52,
              opacity: !isFirebaseReady ? 0.6 : 1,
            }}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            )}
            {isFirebaseReady ? 'Iniciar sesión con Google' : 'Google Login (requiere configuración)'}
          </button>

          <p className="text-muted text-center small mb-3">
            100% gratuito. Sin suscripciones ni límites.
          </p>

          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="flex-grow-1" style={{ height: 1, background: '#e2e8f0' }} />
            <span className="small text-muted" style={{ fontSize: '0.75rem' }}>o</span>
            <div className="flex-grow-1" style={{ height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Dev Login */}
          <button
            className="btn w-100 btn-action d-flex align-items-center justify-content-center gap-2"
            onClick={handleDevLogin}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #1e3a5f, #2d4a6f)',
              border: 'none',
              color: 'white',
              minHeight: 52,
            }}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" />
            ) : (
              <Code2 size={18} />
            )}
            Acceso de desarrollo
          </button>
          <p className="text-center small mt-2 mb-0" style={{ color: '#94a3b8', fontSize: '0.6875rem' }}>
            Para testear sin configurar Firebase
          </p>
        </div>

        {/* Features */}
        <div className="row g-2 mt-4">
          <div className="col-4">
            <div className="text-center">
              <div
                className="d-inline-flex align-items-center justify-content-center mb-1"
                style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245, 158, 11, 0.15)' }}
              >
                <Zap size={18} style={{ color: '#fbbf24' }} />
              </div>
              <div className="text-white small" style={{ fontSize: '0.75rem' }}>Rápido</div>
            </div>
          </div>
          <div className="col-4">
            <div className="text-center">
              <div
                className="d-inline-flex align-items-center justify-content-center mb-1"
                style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(30, 58, 95, 0.3)' }}
              >
                <Shield size={18} style={{ color: '#60a5fa' }} />
              </div>
              <div className="text-white small" style={{ fontSize: '0.75rem' }}>Seguro</div>
            </div>
          </div>
          <div className="col-4">
            <div className="text-center">
              <div
                className="d-inline-flex align-items-center justify-content-center mb-1"
                style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(45, 106, 79, 0.2)' }}
              >
                <Infinity size={18} style={{ color: '#34d399' }} />
              </div>
              <div className="text-white small" style={{ fontSize: '0.75rem' }}>Gratis</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
