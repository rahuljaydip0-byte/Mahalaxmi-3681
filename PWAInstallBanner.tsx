import React, { useState } from 'react';
import { usePWA } from '../../context/PWAContext';
import { Download, Smartphone, X, Share, PlusSquare, Sparkles, CheckCircle2, Bell } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, promptInstall, isIos, showIosGuide, setShowIosGuide, notificationPermission, requestNotificationPermission } = usePWA();
  const [dismissed, setDismissed] = useState<boolean>(false);

  if (isInstalled || dismissed) return null;

  return (
    <>
      {/* Floating App Installation / VIP Mobile App Banner */}
      {(isInstallable || isIos) && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="p-4 rounded-2xl bg-neutral-950/95 border border-amber-500/40 shadow-2xl backdrop-blur-md text-white flex items-center justify-between gap-3 relative">
            
            {/* Close / Dismiss */}
            <button
              onClick={() => setDismissed(true)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 flex items-center justify-center text-xs transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-amber-500/30 p-1 shrink-0 flex items-center justify-center shadow-lg">
                <img src="/icon-192.png" alt="Mahalakshmi App" className="w-full h-full object-contain rounded-lg" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Official PWA App
                </span>
                <h4 className="text-xs font-bold text-white font-cinzel">Install Mahalakshmi App</h4>
                <p className="text-[10px] text-neutral-400 font-sans line-clamp-1">
                  Instant offline access, push alerts & fast mobile experience.
                </p>
              </div>
            </div>

            <button
              onClick={promptInstall}
              className="px-3.5 py-2 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-[11px] uppercase tracking-wider shrink-0 hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isIos ? 'Install' : 'Install App'}</span>
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari "Add to Home Screen" Instructions Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-amber-500/30 p-6 text-white space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 className="font-cinzel text-sm font-bold text-amber-300 uppercase tracking-wider">
                  Install on iPhone / iPad
                </h3>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              To install <strong>Mahalakshmi Creation</strong> on your iOS home screen without the App Store:
            </p>

            <div className="space-y-3 text-xs font-sans">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <p className="font-bold text-white flex items-center gap-1">
                    Tap the Share button <Share className="w-3.5 h-3.5 text-amber-400 inline" />
                  </p>
                  <p className="text-[11px] text-neutral-400">Located in your Safari browser bottom toolbar.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">2</span>
                <div>
                  <p className="font-bold text-white flex items-center gap-1">
                    Select "Add to Home Screen" <PlusSquare className="w-3.5 h-3.5 text-amber-400 inline" />
                  </p>
                  <p className="text-[11px] text-neutral-400">Scroll down in the action menu list.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <p className="font-bold text-white">Tap "Add"</p>
                  <p className="text-[11px] text-neutral-400">Launch directly from your home screen like a native app!</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-3 rounded-xl bg-neutral-800 text-neutral-200 font-bold text-xs uppercase tracking-wider hover:bg-neutral-700 transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
