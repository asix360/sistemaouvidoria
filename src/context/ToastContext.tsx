import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  errors?: string[];
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  notifyError: (title: string, errors?: string[] | string) => void;
  notifySuccess: (title: string, message?: string) => void;
  notifyWarning: (title: string, message?: string) => void;
  notifyInfo: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastItem = { ...toast, id };
    
    setToasts(prev => [newToast, ...prev.slice(0, 4)]); // Manter máximo 5 toasts na tela

    const duration = toast.duration || (toast.type === 'error' ? 7000 : 4000);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const notifyError = useCallback((title: string, errors?: string[] | string) => {
    const errList = Array.isArray(errors) ? errors : errors ? [errors] : undefined;
    showToast({
      type: 'error',
      title,
      errors: errList
    });
  }, [showToast]);

  const notifySuccess = useCallback((title: string, message?: string) => {
    showToast({
      type: 'success',
      title,
      message
    });
  }, [showToast]);

  const notifyWarning = useCallback((title: string, message?: string) => {
    showToast({
      type: 'warning',
      title,
      message
    });
  }, [showToast]);

  const notifyInfo = useCallback((title: string, message?: string) => {
    showToast({
      type: 'info',
      title,
      message
    });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, notifyError, notifySuccess, notifyWarning, notifyInfo }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
};

// Componente Visual do Toast Container com Animações Fluidas e Glassmorphism
const ToastContainer: React.FC<{ toasts: ToastItem[]; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
      {toasts.map(toast => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4 flex items-start gap-3.5 ${
              isError
                ? 'bg-rose-950/90 dark:bg-rose-950/95 border-rose-500/40 text-white shadow-rose-950/30'
                : isSuccess
                ? 'bg-emerald-950/90 dark:bg-emerald-950/95 border-emerald-500/40 text-white shadow-emerald-950/30'
                : isWarning
                ? 'bg-amber-950/90 dark:bg-amber-950/95 border-amber-500/40 text-white shadow-amber-950/30'
                : 'bg-slate-900/90 dark:bg-slate-900/95 border-sky-500/40 text-white shadow-slate-950/30'
            }`}
          >
            {/* Ícone de Destaque */}
            <div className={`p-2 rounded-xl shrink-0 ${
              isError ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
              isSuccess ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              isWarning ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-sky-500/20 text-sky-400 border border-sky-500/30'
            }`}>
              {isError && <AlertCircle className="w-5 h-5" />}
              {isSuccess && <CheckCircle2 className="w-5 h-5" />}
              {isWarning && <AlertTriangle className="w-5 h-5" />}
              {!isError && !isSuccess && !isWarning && <Info className="w-5 h-5" />}
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center justify-between gap-2">
                <span>{toast.title}</span>
              </h4>

              {toast.message && (
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {toast.message}
                </p>
              )}

              {/* Lista Detalhada de Erros de Validação */}
              {toast.errors && toast.errors.length > 0 && (
                <div className="mt-2.5 space-y-1.5 pt-2 border-t border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block">
                    Pendências de Validação ({toast.errors.length}):
                  </span>
                  <ul className="space-y-1">
                    {toast.errors.map((err, idx) => (
                      <li key={idx} className="text-xs text-rose-200 flex items-start gap-1.5 bg-rose-900/40 p-1.5 rounded-lg border border-rose-500/20">
                        <span className="text-rose-400 font-bold">•</span>
                        <span className="leading-tight">{err}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Botão Fechar */}
            <button
              onClick={() => onRemove(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
              title="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
