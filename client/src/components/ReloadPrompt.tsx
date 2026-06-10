import { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

export default function ReloadPrompt() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const updateSW = useRef<((reload?: boolean) => Promise<void>) | null>(null);
  const waitingWorker = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV || !('serviceWorker' in navigator)) return;

    import('virtual:pwa-register')
      .then(({ registerSW }) => {
        updateSW.current = registerSW({
          onNeedRefresh() {
            setNeedRefresh(true);
          },
          onOfflineReady() {
            setOfflineReady(true);
            setTimeout(() => setOfflineReady(false), 3000);
          },
        });
      })
      .catch(() => {
        // Fallback: manual registration and update detection
        navigator.serviceWorker.register('/sw.js').then((reg) => {
          // Check if there's already a waiting worker
          if (reg.waiting) {
            waitingWorker.current = reg.waiting;
            setNeedRefresh(true);
          }

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                waitingWorker.current = newWorker;
                setNeedRefresh(true);
              }
            });
          });

          // Check for updates every 30 minutes
          const interval = setInterval(() => {
            reg.update().catch(() => {});
          }, 30 * 60 * 1000);

          return () => clearInterval(interval);
        });
      });
  }, []);

  const handleUpdate = () => {
    setNeedRefresh(false);

    if (updateSW.current) {
      // vite-plugin-pwa: skip waiting + reload
      updateSW.current(true);
    } else if (waitingWorker.current) {
      // Fallback: tell SW to skip waiting, then reload
      waitingWorker.current.postMessage({ type: 'SKIP_WAITING' });
      // Wait for controllerchange before reloading
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      }, { once: true });
    } else {
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
  };

  return (
    <>
      {/* Update prompt */}
      {needRefresh && (
        <div
          className="position-fixed bottom-0 start-0 end-0 p-3"
          style={{ zIndex: 9999, paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <div
            className="d-flex align-items-center justify-content-between px-3 py-2 shadow-sm"
            style={{
              borderRadius: 14,
              background: '#1e3a5f',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 28, height: 28, background: 'rgba(245, 158, 11, 0.2)' }}
              >
                <RefreshCw size={14} style={{ color: '#fbbf24' }} />
              </div>
              <span className="small fw-medium">Nueva versión disponible</span>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-link text-white-50 py-1 px-2"
                onClick={handleDismiss}
                style={{ fontSize: '0.75rem', textDecoration: 'none' }}
              >
                Después
              </button>
              <button
                className="btn btn-sm btn-warning fw-semibold py-1 px-3"
                onClick={handleUpdate}
                style={{ borderRadius: 8, fontSize: '0.8125rem' }}
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline ready toast */}
      {offlineReady && (
        <div
          className="position-fixed top-0 start-0 end-0 p-3 d-flex justify-content-center"
          style={{ zIndex: 9999 }}
        >
          <div
            className="px-3 py-2 shadow-sm"
            style={{
              borderRadius: 10,
              background: 'rgba(45, 106, 79, 0.95)',
              color: 'white',
              fontSize: '0.8125rem',
            }}
          >
            App lista para uso offline
          </div>
        </div>
      )}
    </>
  );
}
