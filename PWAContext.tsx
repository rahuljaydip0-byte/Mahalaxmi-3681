import React, { createContext, useContext, useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  hasUpdate: boolean;
  isIos: boolean;
  showIosGuide: boolean;
  setShowIosGuide: (show: boolean) => void;
  promptInstall: () => Promise<void>;
  applyUpdate: () => void;
  notificationPermission: NotificationPermission | 'unsupported';
  requestNotificationPermission: () => Promise<boolean>;
  triggerTestNotification: (title?: string, body?: string, url?: string) => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [hasUpdate, setHasUpdate] = useState<boolean>(false);
  const [wbInstance, setWbInstance] = useState<Workbox | null>(null);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const isIos = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    // 1. Detect if running as standalone app
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    setIsInstalled(isStandalone);

    // 2. Listen for install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 3. Online/Offline network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 4. Register Service Worker with Workbox
    if ('serviceWorker' in navigator) {
      const wb = new Workbox('/sw.js');
      setWbInstance(wb);

      wb.addEventListener('waiting', () => {
        setHasUpdate(true);
      });

      wb.register().catch((err) => {
        console.warn('Service Worker registration failed:', err);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const promptInstall = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('PWA install prompt error:', err);
    }
  };

  const applyUpdate = () => {
    if (wbInstance) {
      wbInstance.messageSkipWaiting();
      window.location.reload();
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      alert('Push Notifications are not supported by this browser.');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setNotificationPermission(result);
      if (result === 'granted') {
        triggerTestNotification(
          'Notifications Enabled! 👑',
          'You will now receive VIP alerts for Mahalakshmi Creation new drops and live order updates.',
          '/?page=bridal'
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return false;
    }
  };

  const triggerTestNotification = (title?: string, body?: string, url?: string) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_TEST_NOTIFICATION',
        title: title || 'Mahalakshmi Creation',
        body: body || 'Explore our latest Royal Zardozi & Bridal Embroidery Collection.',
        url: url || '/'
      });
    } else if (Notification.permission === 'granted') {
      new Notification(title || 'Mahalakshmi Creation', {
        body: body || 'Explore our latest Royal Zardozi & Bridal Embroidery Collection.',
        icon: '/icon-192.png'
      });
    }
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isOnline,
        hasUpdate,
        isIos,
        showIosGuide,
        setShowIosGuide,
        promptInstall,
        applyUpdate,
        notificationPermission,
        requestNotificationPermission,
        triggerTestNotification
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};
