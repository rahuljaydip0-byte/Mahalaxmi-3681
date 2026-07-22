import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-neutral-900/90 text-amber-200 border-amber-500/40'
              : toast.type === 'error'
              ? 'bg-red-950/90 text-red-200 border-red-500/40'
              : 'bg-neutral-900/90 text-neutral-200 border-neutral-700'
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-amber-300 shrink-0" />}
            <span className="text-sm font-medium tracking-wide">{toast.text}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:opacity-75 transition-opacity text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
