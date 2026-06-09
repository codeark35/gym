import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import AppShell from '../../../components/layout/AppShell';
import api from '../../../api/axios';
import { Bot, Send, Sparkles, Brain, TrendingUp, Activity, Heart } from 'lucide-react';

type AnalysisType = 'GENERAL' | 'PROGRESS' | 'VOLUME' | 'RECOVERY';

const ANALYSIS_OPTIONS: { type: AnalysisType; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  { type: 'GENERAL', label: 'Análisis general', desc: 'Resumen de las últimas 4 semanas', icon: <Sparkles size={18} />, color: '#f59e0b' },
  { type: 'PROGRESS', label: 'Progreso de fuerza', desc: 'Evolución de mis pesos y 1RM', icon: <TrendingUp size={18} />, color: '#4338ca' },
  { type: 'VOLUME', label: 'Balance muscular', desc: 'Distribución de volumen por músculo', icon: <Activity size={18} />, color: '#2d6a4f' },
  { type: 'RECOVERY', label: 'Recuperación', desc: 'Frecuencia y descanso entre sesiones', icon: <Heart size={18} />, color: '#ec4899' },
];

export default function AIPage() {
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

  const isLoading = analyze.isPending || chat.isPending;

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div style={{ width: 4, height: 20, background: 'linear-gradient(to bottom, #4338ca, #1e3a5f)', borderRadius: 2 }} />
          <h5 className="fw-bold text-white mb-0">Análisis con IA</h5>
        </div>
        <p className="text-white-50 small mb-0">
          Tu entrenador personal inteligente
        </p>
      </div>

      {/* AI Avatar */}
      <div className="card mb-4" style={{ border: 'none', borderRadius: 16, overflow: 'hidden' }}>
        <div
          className="card-body p-3 position-relative"
          style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}
        >
          <div className="position-absolute" style={{
            top: -20, right: -20, width: 100, height: 100, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(67, 56, 202, 0.2) 0%, transparent 70%)',
          }} />
          <div className="position-relative d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: 56, height: 56, background: 'rgba(67, 56, 202, 0.2)', border: '1px solid rgba(67, 56, 202, 0.3)' }}
            >
              <Brain size={28} style={{ color: '#818cf8' }} />
            </div>
            <div>
              <div className="fw-bold text-white">Gemini Coach</div>
              <div className="small text-white-50">Entrenador personal con IA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick analysis buttons */}
      <div className="row g-2 mb-4">
        {ANALYSIS_OPTIONS.map((opt) => (
          <div key={opt.type} className="col-6">
            <button
              className="btn w-100 text-start p-3"
              onClick={() => analyze.mutate(opt.type)}
              disabled={isLoading}
              style={{
                minHeight: 72,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${opt.color}30`,
                transition: 'all 0.2s ease',
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-1">
                <span style={{ color: opt.color }}>{opt.icon}</span>
                <span className="fw-semibold small text-white">{opt.label}</span>
              </div>
              <div className="text-white-50" style={{ fontSize: '0.7rem' }}>{opt.desc}</div>
            </button>
          </div>
        ))}
      </div>

      {/* Result */}
      {isLoading && (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary me-2" />
          <span className="text-white-50 small">Analizando...</span>
        </div>
      )}

      {result && !isLoading && (
        <div className="card mb-4" style={{ border: 'none', borderRadius: 16, borderLeft: '3px solid #4338ca' }}>
          <div className="card-body">
            <div className="d-flex align-items-center gap-2 mb-2">
              <Bot size={16} style={{ color: '#4338ca' }} />
              <span className="small fw-bold" style={{ color: '#4338ca' }}>RESPUESTA</span>
            </div>
            <p className="mb-0" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: '#1e293b' }}>{result}</p>
          </div>
        </div>
      )}

      {/* Chat */}
      <form onSubmit={handleChat}>
        <div className="input-group">
          <input
            type="text"
            className="form-control bg-dark text-white border-secondary"
            placeholder="Preguntale algo a tu entrenador IA..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isLoading}
            style={{ borderRadius: '12px 0 0 12px' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !chatInput.trim()}
            style={{ borderRadius: '0 12px 12px 0' }}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </AppShell>
  );
}
