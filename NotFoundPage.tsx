import React from 'react';
import { useApp } from '../context/AppContext';
import { Crown, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { setCurrentPage } = useApp();

  return (
    <div className="py-24 bg-neutral-950 text-white min-h-[70vh] flex items-center justify-center text-center">
      <div className="max-w-md mx-auto px-4 space-y-6">
        <Crown className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
        <span className="font-mono text-xs uppercase tracking-widest text-amber-500 block">
          404 • Page Not Found
        </span>
        <h1 className="font-cinzel text-3xl font-bold text-white">
          The Couture Page You Seeking Does Not Exist
        </h1>
        <p className="text-xs text-neutral-400 font-sans leading-relaxed">
          The requested URL was moved or is no longer available. Please return to our main embroidery catalog.
        </p>
        <button
          onClick={() => setCurrentPage('home')}
          className="px-6 py-3.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Homepage
        </button>
      </div>
    </div>
  );
};
