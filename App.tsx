import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PWAProvider } from './context/PWAContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { QuickViewModal } from './components/common/QuickViewModal';
import { SearchModal } from './components/common/SearchModal';
import { CompareModal } from './components/common/CompareModal';
import { DesignCustomizerModal } from './components/common/DesignCustomizerModal';
import { AppointmentModal } from './components/common/AppointmentModal';
import { InternationalBusinessModal } from './components/common/InternationalBusinessModal';
import { ProductViewer3DModal } from './components/three/ProductViewer3DModal';
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { CustomCursor } from './components/layout/CustomCursor';
import { BackToTop } from './components/layout/BackToTop';
import { ToastContainer } from './components/common/Toast';

// PWA Overlay Components
import { OfflineBar } from './components/common/OfflineBar';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';
import { PWAUpdateToast } from './components/common/PWAUpdateToast';
import { PWANotificationPrompt } from './components/common/PWANotificationPrompt';

import { HomePage } from './pages/HomePage';
import { CollectionsPage } from './pages/CollectionsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { BridalCollectionPage } from './pages/BridalCollectionPage';
import { InternationalCollectionPage } from './pages/InternationalCollectionPage';
import { LuxuryCollectionPage } from './pages/LuxuryCollectionPage';
import { NewArrivalsPage } from './pages/NewArrivalsPage';
import { GalleryPage } from './pages/GalleryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { FAQPage } from './pages/FAQPage';
import { WishlistPage } from './pages/WishlistPage';
import { OrdersPage } from './pages/OrdersPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

const AppContent: React.FC = () => {
  const { currentPage, selected3DProduct, setSelected3DProduct } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'collections':
        return <CollectionsPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'bridal':
        return <BridalCollectionPage />;
      case 'international':
        return <InternationalCollectionPage />;
      case 'luxury':
        return <LuxuryCollectionPage />;
      case 'new-arrivals':
        return <NewArrivalsPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'product-detail':
        return <ProductDetailPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      case 'terms':
        return <TermsPage />;
      case 'faq':
        return <FAQPage />;
      case 'wishlist':
        return <WishlistPage />;
      case 'orders':
        return <OrdersPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] dark:bg-[#0d0d0d] text-[#1A1A1A] dark:text-[#F3F3F3] flex flex-col font-sans transition-colors selection:bg-[#D4AF37] selection:text-white">
      
      {/* Offline Status Bar */}
      <OfflineBar />

      {/* Navigation */}
      <Navbar />

      {/* Main View Port */}
      <main className="flex-grow">
        {renderPage()}
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Interactive Overlays */}
      <QuickViewModal />
      <SearchModal />
      <CompareModal />
      <DesignCustomizerModal />
      <AppointmentModal />
      <InternationalBusinessModal />
      {selected3DProduct && (
        <ProductViewer3DModal product={selected3DProduct} onClose={() => setSelected3DProduct(null)} />
      )}
      <WhatsAppButton />
      <CustomCursor />
      <BackToTop />
      <ToastContainer />

      {/* Progressive Web App Overlays */}
      <PWAInstallBanner />
      <PWAUpdateToast />
      <PWANotificationPrompt />

    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <PWAProvider>
        <AppContent />
      </PWAProvider>
    </AppProvider>
  );
}

export default App;
