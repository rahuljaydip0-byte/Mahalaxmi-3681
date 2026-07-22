import React from 'react';
import { usePWA } from '../../context/PWAContext';
import { WifiOff, Database } from 'lucide-react';

export const OfflineBar: React.FC = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="bg-amber-600/90 text-neutral-950 px-4 py-2 text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-inner border-b border-amber-700">
      <WifiOff className="w-4 h-4 text-neutral-950 animate-pulse" />
      <span>Offline Mode Active — Browsing Cached Collections & Saved Orders</span>
      <Database className="w-3.5 h-3.5 opacity-80" />
    </div>
  );
};
