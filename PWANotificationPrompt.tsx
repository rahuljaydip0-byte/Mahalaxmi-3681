import React, { useState } from 'react';
import { usePWA } from '../../context/PWAContext';
import { Bell, BellRing, Sparkles, Check, Package, Truck, Tag, ShieldCheck, X } from 'lucide-react';

export const PWANotificationPrompt: React.FC = () => {
  const { notificationPermission, requestNotificationPermission, triggerTestNotification } = usePWA();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);

  const handleEnable = async () => {
    setIsSubscribing(true);
    const success = await requestNotificationPermission();
    setIsSubscribing(false);
    if (success) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Bell Trigger Button in bottom right */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-40 p-3 rounded-full bg-neutral-900/90 border border-amber-500/40 text-amber-400 hover:text-white hover:bg-neutral-800 shadow-xl backdrop-blur-md transition-all flex items-center gap-2 group"
        title="App Notifications Settings"
      >
        {notificationPermission === 'granted' ? (
          <BellRing className="w-5 h-5 text-emerald-400" />
        ) : (
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
        )}
        <span className="text-xs font-bold font-mono text-amber-300 hidden sm:inline pr-1">
          {notificationPermission === 'granted' ? 'Alerts Active' : 'Enable VIP Alerts'}
        </span>
      </button>

      {/* Push Notification Manager Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-amber-500/40 p-6 text-white space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl gold-gradient-bg text-neutral-950 flex items-center justify-center font-bold shadow-lg shrink-0">
                <Bell className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold block">
                  Mahalakshmi VIP Push Service
                </span>
                <h3 className="font-cinzel text-base font-bold text-white">Live Push Notifications</h3>
              </div>
            </div>

            <p className="text-xs text-neutral-300 font-sans leading-relaxed">
              Stay connected with real-time push alerts directly to your mobile or desktop device.
            </p>

            {/* Topics Included */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-neutral-300">Order Updates</span>
              </div>
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-neutral-300">Shipping Dispatch</span>
              </div>
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="text-neutral-300">New Bridal Drops</span>
              </div>
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-neutral-300">VIP Promotions</span>
              </div>
            </div>

            {/* Action State */}
            {notificationPermission === 'granted' ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs font-mono text-emerald-300">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Push Alerts Enabled
                  </span>
                  <Check className="w-4 h-4" />
                </div>
                
                <button
                  onClick={() => triggerTestNotification('Sample Order Update 🚚', 'Order #MH-1092 has been dispatched via DHL Express.', '/?page=orders')}
                  className="w-full py-2.5 rounded-xl bg-neutral-800 border border-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wider hover:bg-neutral-700 transition-colors"
                >
                  Send Sample Push Notification
                </button>
              </div>
            ) : (
              <button
                onClick={handleEnable}
                disabled={isSubscribing}
                className="w-full py-3.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Bell className="w-4 h-4" />
                <span>{isSubscribing ? 'Requesting Permission...' : 'Enable VIP Push Notifications'}</span>
              </button>
            )}

            <p className="text-[10px] text-neutral-500 text-center font-mono">
              You can modify or mute app notifications anytime in your browser / device settings.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
