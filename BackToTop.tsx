import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 400) {
        setShow(true);
      } else {
        setShow(false);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-6 z-40 p-3.5 bg-neutral-900/90 dark:bg-amber-500 text-amber-300 dark:text-neutral-950 rounded-full shadow-2xl border border-amber-500/30 hover:scale-110 active:scale-95 transition-all duration-300 group"
      aria-label="Back to Top"
    >
      <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
};
