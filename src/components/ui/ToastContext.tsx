import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
      window.setTimeout(() => {
        dismiss(id);
      }, 4200);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11151E] p-4 shadow-lg"
          >
            {t.variant === 'success' && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />}
            {t.variant === 'error' && <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />}
            {t.variant === 'info' && <Info className="h-5 w-5 shrink-0 text-blue-500 mt-0.5" />}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.title}</p>
              {t.description && (
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
