import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  show: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  show,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  useEffect(() => {
    if (!show) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [show, onCancel]);

  if (!show) return null;

  const accentColor = variant === 'danger' ? '#dc2626' : variant === 'warning' ? '#f59e0b' : '#3b82f6';
  const accentBg = variant === 'danger' ? 'rgba(220,38,38,0.1)' : variant === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)';

  return (
    <div
      ref={dialogRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        padding: '1rem',
      }}
      onClick={(e) => { if (e.target === dialogRef.current) onCancel(); }}
    >
      <div
        style={{
          background: '#1e293b',
          borderRadius: 20,
          maxWidth: 360,
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          animation: 'confirmFadeIn 0.2s ease-out',
        }}
      >
        <style>{`
          @keyframes confirmFadeIn {
            from { opacity: 0; transform: scale(0.92); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Header */}
        <div className="d-flex align-items-center justify-content-between p-3 pb-0">
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: 36, height: 36, background: accentBg }}
            >
              <AlertTriangle size={18} style={{ color: accentColor }} />
            </div>
            <span className="fw-bold text-white" style={{ fontSize: '1rem' }}>{title}</span>
          </div>
          <button
            onClick={onCancel}
            className="btn p-0 d-flex align-items-center justify-content-center"
            style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.05)' }}
          >
            <X size={16} style={{ color: '#94a3b8' }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-3">
          <p className="text-white-50 mb-0" style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{message}</p>
        </div>

        {/* Footer */}
        <div className="p-3 pt-0 d-flex gap-2">
          <button
            onClick={onCancel}
            className="btn flex-fill fw-semibold"
            style={{
              height: 44,
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: '#cbd5e1',
              fontSize: '0.875rem',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="btn flex-fill fw-semibold text-white"
            style={{
              height: 44,
              borderRadius: 12,
              border: 'none',
              background: accentColor,
              color: '#fff',
              fontSize: '0.875rem',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
