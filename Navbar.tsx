import React, { useState } from 'react';
import { useApp, CURRENCIES, CurrencyCode } from '../../context/AppContext';
import { usePWA } from '../../context/PWAContext';
import { 
  Search, 
  Heart, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  ShieldCheck, 
  Crown, 
  Sparkles, 
  PhoneCall, 
  Globe2, 
  MessageCircle,
  ShoppingBag,
  Sliders,
  Palette,
  Video,
  Globe,
  Download,
  Smartphone
} from 'lucide-react';
import { PageRoute } from '../../types';

export const Navbar: React.FC = () => {
  const { 
    currentPage, 
    setCurrentPage, 
    wishlistIds, 
    isDarkMode, 
    toggleDarkMode, 
    setIsSearchOpen, 
    settings,
    isAdminAuthenticated,
    orders,
    customerUser,
    currency,
    setCurrency,
    compareProductIds,
    setIsCompareOpen,
    openCustomizer,
    setIsAppointmentModalOpen,
    setIsInternationalModalOpen
  } = useApp();

  const { isInstallable, isInstalled, promptInstall, isIos, setShowIosGuide } = usePWA();

  const userEmail = customerUser?.email || 'parmarjaydip881987@gmail.com';
  const myOrdersCount = orders.filter(o => o.customerEmail.toLowerCase().trim() === userEmail.toLowerCase().trim()).length;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; route: PageRoute; badge?: string }[] = [
    { label: 'Home', route: 'home' },
    { label: 'Collections', route: 'collections' },
    { label: 'Categories', route: 'categories' },
    { label: 'Bridal Couture', route: 'bridal', badge: 'Royal' },
    { label: 'International', route: 'international', badge: 'GCC' },
    { label: 'Luxury Line', route: 'luxury' },
    { label: 'New Arrivals', route: 'new-arrivals' },
    { label: 'Gallery', route: 'gallery' },
    { label: 'About Us', route: 'about' },
    { label: 'Contact', route: 'contact' },
  ];

  const handleNavClick = (route: PageRoute) => {
    setCurrentPage(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all">
      {/* Top Announcement Bar */}
      {settings.showAnnouncement && (
        <div className="bg-neutral-950 text-amber-200 text-[11px] font-medium py-2 px-4 border-b border-amber-500/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
              <span className="truncate">{settings.announcementText}</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[10px] uppercase tracking-wider text-neutral-400 shrink-0 font-mono">
              {/* Currency Selector */}
              <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30 text-amber-300">
                <Globe className="w-3 h-3 text-amber-400" />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="bg-transparent text-amber-300 text-[10px] font-bold focus:outline-none cursor-pointer"
                >
                  {Object.values(CURRENCIES).map(c => (
                    <option key={c.code} value={c.code} className="bg-neutral-900 text-white">
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <button 
                onClick={() => setIsInternationalModalOpen(true)}
                className="hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <Globe2 className="w-3 h-3 text-amber-400" /> Export Shipping USA • UK • UAE
              </button>

              <button
                onClick={() => setIsAppointmentModalOpen(true)}
                className="hover:text-amber-300 flex items-center gap-1 text-amber-400 font-bold transition-colors"
              >
                <Video className="w-3 h-3" /> Book 1-on-1 Video Call
              </button>

              {!isInstalled && (
                <button
                  onClick={() => {
                    if (isIos) {
                      setShowIosGuide(true);
                    } else if (isInstallable) {
                      promptInstall();
                    } else {
                      alert('To install Mahalakshmi Creation as an app: Open your browser menu and select "Install App" or "Add to Home Screen".');
                    }
                  }}
                  className="px-2.5 py-0.5 rounded-md gold-gradient-bg text-neutral-950 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 hover:brightness-110 transition-all shadow-sm"
                >
                  <Download className="w-3 h-3 stroke-[2.5]" />
                  <span>Install App</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <nav className="frosted-glass-nav transition-colors sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-serif text-xl shadow-md group-hover:scale-105 transition-transform">
              M
            </div>
            <div className="flex flex-col">
              <span className="font-cinzel text-sm sm:text-base tracking-[0.2em] font-bold uppercase leading-none text-[#1A1A1A] dark:text-white group-hover:text-[#D4AF37] transition-colors">
                Mahalakshmi
              </span>
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-semibold">
                Creation
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 text-[11px] uppercase tracking-widest font-semibold">
            {navLinks.map((link) => {
              const isActive = currentPage === link.route;
              return (
                <button
                  key={link.route}
                  onClick={() => handleNavClick(link.route)}
                  className={`relative pb-1 transition-all ${
                    isActive
                      ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-bold'
                      : 'text-[#1A1A1A] dark:text-neutral-200 hover:text-[#D4AF37] transition-colors'
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="ml-1.5 px-1.5 py-0.2 text-[8px] uppercase tracking-normal rounded-full bg-[#D4AF37] text-white font-bold">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
              title="Search Embroidery"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Compare Drawer Toggle */}
            <button
              onClick={() => setIsCompareOpen(true)}
              className="relative p-2.5 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
              title="Compare Designs Side-by-Side"
            >
              <Sliders className="w-5 h-5" />
              {compareProductIds.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-neutral-950 font-bold text-[10px] flex items-center justify-center">
                  {compareProductIds.length}
                </span>
              )}
            </button>

            {/* Design Customizer Shortcut */}
            <button
              onClick={() => openCustomizer()}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
              title="Interactive Bespoke Studio"
            >
              <Palette className="w-4 h-4" />
              <span>Customizer</span>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => handleNavClick('wishlist')}
              className="relative p-2.5 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-neutral-950 font-bold text-[10px] flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* My Orders Button */}
            <button
              onClick={() => handleNavClick('orders')}
              className={`relative px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border flex items-center gap-1.5 ${
                currentPage === 'orders'
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-sm'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="View My Embroidery Orders & Status"
            >
              <ShoppingBag className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <span className="hidden sm:inline">My Orders</span>
              {myOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-neutral-950 font-bold text-[10px]">
                  {myOrdersCount}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
              title="Toggle Dark/Light Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Admin Portal Button */}
            <button
              onClick={() => handleNavClick('admin')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border flex items-center gap-1.5 ${
                isAdminAuthenticated
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-sm'
                  : 'bg-neutral-900 text-amber-400 border-amber-500/40 hover:bg-neutral-800 hover:border-amber-400'
              }`}
              title={isAdminAuthenticated ? "Admin Dashboard (Authorized)" : "Admin Portal Login"}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{isAdminAuthenticated ? 'Admin Panel' : 'Admin Login'}</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2.5 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 dark:bg-neutral-950/95 border-b border-amber-500/20 px-4 py-6 space-y-2 animate-in slide-in-from-top-5 duration-200">
            {navLinks.map((link) => {
              const isActive = currentPage === link.route;
              return (
                <button
                  key={link.route}
                  onClick={() => handleNavClick(link.route)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30'
                      : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-2 py-0.5 text-[9px] uppercase font-bold rounded-full bg-amber-500 text-neutral-950">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => handleNavClick('orders')}
              className="w-full mt-2 p-3.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider bg-amber-500 text-neutral-950 border border-amber-400 flex items-center justify-center gap-2 shadow-lg"
            >
              <ShoppingBag className="w-4 h-4 text-neutral-950" />
              <span>My Orders & Live Status ({myOrdersCount})</span>
            </button>

            <button
              onClick={() => handleNavClick('admin')}
              className="w-full mt-2 p-3.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider bg-neutral-950 text-amber-300 border border-amber-500/40 flex items-center justify-center gap-2 shadow-lg"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{isAdminAuthenticated ? 'Admin Panel Dashboard' : 'Admin Login Portal'}</span>
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};
