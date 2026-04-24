import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import AppShell from '../../../components/layout/AppShell';
import api from '../../../api/axios';
import { useSubscription } from '../../../hooks/useSubscription';
import { Bot, Send, Lock } from 'lucide-react';

type AnalysisType = 'GENERAL' | 'PROGRESS' | 'VOLUME' | 'RECOVERY';

const ANALYSIS_OPTIONS: { type: AnalysisType; label: string; desc: string }[] = [
  { type: 'GENERAL', label: 'Análisis general', desc: 'Resumen de las últimas 4 semanas' },
  { type: 'PROGRESS', label: 'Progreso de fuerza', desc: 'Evolución de mis pesos y 1RM' },
  { type: 'VOLUME', label: 'Balance muscular', desc: 'Distribución de volumen por músculo' },
  { type: 'RECOVERY', label: 'Recuperación', desc: 'Frecuencia y descanso entre sesiones' },
];

export default function AIPage() {
  const { aiEnabled } = useSubscription();
  const [result, setResult] = useState('');
  const [chatInput, setChatInput] = useState('');

  const analyze = useMutation({
    mutationFn: async (type: AnalysisType) => {
      const res = await api.post<{ data: string }>('/ai/analyze', { type });
      return res.data.data ?? res.data;
    },
    onSuccess: (data) => setResult(data as string),
  });

  const chat = useMutation({
    mutationFn: async (message: string) => {
      const res = await api.post<{ data: string }>('/ai/chat', { message });
      return res.data.data ?? res.data;
    },
    onSuccess: (data) => setResult(data as string),
  });

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      chat.mutate(chatInput.trim());
      setChatInput('');
    }
  };

  if (!aiEnabled) {
    return (
      <AppShell>
        <div className="text-center py-5">
          <Lock size={48} className="text-secondary mb-3" />
          <h5 className="fw-semibold">Función exclusiva de Plan Pro</h5>
          <p className="text-muted small">Actualizá tu plan para acceder al análisis con IA</p>
          <button className="btn btn-primary">Ver planes</button>
        </div>
      </AppShell>
    );
  }

  const isLoading = analyze.isPending || chat.isPending;

  return (
    <AppShell>
      <div className="d-flex align-items-center gap-2 mb-4">
        <Bot size={24} className="text-primary" />
        <h5 className="fw-bold mb-0">Análisis con IA</h5>
      </div>

      {/* Quick analysis buttons */}
      <div className="row g-2 mb-4">
        {ANALYSIS_OPTIONS.map((opt) => (
          <div key={opt.type} className="col-6">
            <button
              className="btn btn-outline-secondary w-100 text-start p-3"
              onClick={() => analyze.mutate(opt.type)}
              disabled={isLoading}
              style={{ minHeight: 72 }}
            >
              <div className="fw-semibold small">{opt.label}</div>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>{opt.desc}</div>
            </button>
          </div>
        ))}
      </div>

      {/* Result */}
      {isLoading && (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary me-2" />
          <span className="text-muted small">Analizando...</span>
        </div>
      )}

      {result && !isLoading && (
        <div className="card mb-4 border-0 bg-light">
          <div className="card-body">
            <p className="mb-0" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{result}</p>
          </div>
        </div>
      )}

      {/* Chat */}
      <form onSubmit={handleChat}>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Preguntale algo a tu entrenador IA..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !chatInput.trim()}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </AppShell>
  );
}
