import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const { openWhatsAppInquiry, settings } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    openWhatsAppInquiry(undefined, message);
    setIsOpen(false);
    setMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 p-5 bg-neutral-900/95 text-white rounded-2xl shadow-2xl border border-amber-500/40 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-amber-300 font-cinzel">{settings.brandName}</h4>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live WhatsApp Concierge
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-neutral-300 mb-3 leading-relaxed">
            Connect with our Chief Embroidery Master for custom tailoring, wholesale inquiries, or international priority shipping details.
          </p>

          <form onSubmit={handleSend} className="space-y-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your custom embroidery request or inquiry..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl bg-neutral-800/80 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-amber-400 transition-colors placeholder:text-neutral-500 resize-none"
              required
            />
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl gold-gradient-bg text-neutral-950 font-semibold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Start Instant Chat on WhatsApp
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-full shadow-2xl border border-emerald-400/40 hover:scale-105 active:scale-95 transition-all duration-300 group"
        aria-label="Contact via WhatsApp"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-200"></span>
        </span>
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="hidden md:inline font-medium text-xs tracking-wide">WhatsApp Inquiry</span>
      </button>
    </div>
  );
};
