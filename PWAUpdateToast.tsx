import React from 'react';
import { usePWA } from '../../context/PWAContext';
import { RefreshCw, Sparkles } from 'lucide-react';

export const PWAUpdateToast: React.FC = () => {
  const { hasUpdate, applyUpdate } = usePWA();

  if (!hasUpdate) return null;

  return (
    <div className="fixed top-4 right-4 z-[90] animate-in fade-in slide-in-from-top-5 duration-300">
      <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/50 shadow-2xl text-white flex items-center gap-4 max-w-sm">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h4 className="text-xs font-bold font-cinzel text-amber-300">New App Version Available</h4>
          <p className="text-[10px] text-neutral-400 font-sans">
            Update now to access new collection features and performance improvements.
          </p>
        </div>
        <button
          onClick={applyUpdate}
          className="px-3 py-2 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-[10px] uppercase tracking-wider hover:brightness-110 transition-all shrink-0 flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Update</span>
        </button>
      </div>
    </div>
  );
};
