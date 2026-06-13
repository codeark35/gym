import { useState, useCallback, useRef } from 'react';
import ConfirmDialog from '../components/ui/ConfirmDialog';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

export function useConfirm() {
  const [state, setState] = useState<{
    show: boolean;
    options: ConfirmOptions;
  }>({ show: false, options: { message: '' } });

  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ show: true, options: opts });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true);
    setState((s) => ({ ...s, show: false }));
  }, []);

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    setState((s) => ({ ...s, show: false }));
  }, []);

  const dialog = state.show ? (
    <ConfirmDialog
      show={state.show}
      title={state.options.title ?? 'Confirmar'}
      message={state.options.message}
      confirmLabel={state.options.confirmLabel}
      cancelLabel={state.options.cancelLabel}
      variant={state.options.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return { confirm, dialog };
}
