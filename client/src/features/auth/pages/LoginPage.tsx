import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Dumbbell } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(token.trim());
      navigate('/');
    } catch {
      setError('Token inválido. Verificá tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3"
    >
      <div className="card shadow-sm w-100" style={{ maxWidth: 400 }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <Dumbbell size={40} className="text-primary mb-2" />
            <h4 className="fw-bold mb-0">GymTracker Pro</h4>
            <p className="text-muted small">Ingresá con tu token de acceso Labscore</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Token de acceso</label>
              <input
                type="password"
                className="form-control"
                placeholder="Bearer token..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                autoFocus
              />
              <div className="form-text">
                Obtené tu token en{' '}
                <a href="https://app.labscore.com.py" target="_blank" rel="noreferrer">
                  app.labscore.com.py
                </a>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small">{error}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100 btn-action"
              disabled={loading || !token}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" />
              ) : null}
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
