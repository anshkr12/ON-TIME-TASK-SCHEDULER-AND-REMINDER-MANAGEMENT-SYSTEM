import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div
      className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-start gap-2.5 transition-all animate-in slide-in-from-bottom-2 ${
        isSuccess
          ? 'bg-white border-emerald-200 text-slate-800'
          : isError
          ? 'bg-white border-rose-200 text-slate-800'
          : 'bg-white border-blue-200 text-slate-800'
      }`}
    >
      <div className="mt-0.5 shrink-0">
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : isError ? (
          <AlertCircle className="w-4 h-4 text-rose-500" />
        ) : (
          <Info className="w-4 h-4 text-blue-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-900 leading-snug">{toast.title}</p>
        {toast.message && (
          <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-slate-400 hover:text-slate-600 rounded-md shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
