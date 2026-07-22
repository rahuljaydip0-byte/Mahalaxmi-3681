import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  PageNav, 
  Product, 
  CategoryItem, 
  CollectionItem, 
  GalleryItem, 
  VideoShowcaseItem, 
  HeroBanner, 
  CustomerReview, 
  CustomerInquiry, 
  WebsiteSettings, 
  AdminUser, 
  CustomerUser,
  Order,
  OrderStatus,
  OrderDeletionAuditLog,
  PageRoute 
} from '../types';
import { dbService } from '../services/dbService';
import { INITIAL_SETTINGS } from '../data/initialData';

export type CurrencyCode = 'INR' | 'USD' | 'AED' | 'EUR';

export interface CurrencyDetails {
  code: CurrencyCode;
  symbol: string;
  rate: number; // multiplier from INR base
  label: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyDetails> = {
  INR: { code: 'INR', symbol: '₹', rate: 1, label: 'Indian Rupee (₹)' },
  USD: { code: 'USD', symbol: '$', rate: 0.012, label: 'US Dollar ($)' },
  AED: { code: 'AED', symbol: 'AED ', rate: 0.044, label: 'UAE Dirham (AED)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.011, label: 'Euro (€)' }
};

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface AppContextType {
  // Navigation & Page State
  currentPage: PageRoute;
  setCurrentPage: (page: PageRoute, productId?: string) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  categoryFilter: string | null;
  setCategoryFilter: (category: string | null) => void;
  collectionFilter: string | null;
  setCollectionFilter: (collection: string | null) => void;

  // Dark Mode & Aesthetics
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  customCursorEnabled: boolean;
  setCustomCursorEnabled: (enabled: boolean) => void;

  // Multi-Currency Engine
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (amountInINR: number) => string;

  // Compare Engine
  compareProductIds: string[];
  addToCompare: (productId: string) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;

  // Design Customizer Modal
  isCustomizerOpen: boolean;
  customizerProduct: Product | null;
  openCustomizer: (product?: Product) => void;
  closeCustomizer: () => void;

  // Appointment & Video Call Booking
  isAppointmentModalOpen: boolean;
  setIsAppointmentModalOpen: (open: boolean) => void;

  // International Business Modal
  isInternationalModalOpen: boolean;
  setIsInternationalModalOpen: (open: boolean) => void;

  // Search Modal
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Wishlist & Recently Viewed
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  recentlyViewedIds: string[];
  addRecentlyViewed: (productId: string) => void;

  // Quick View Product Modal
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  // 3D Product Viewer Modal
  selected3DProduct: Product | null;
  setSelected3DProduct: (product: Product | null) => void;

  // Data Collections
  products: Product[];
  categories: CategoryItem[];
  collections: CollectionItem[];
  gallery: GalleryItem[];
  videos: VideoShowcaseItem[];
  heroBanners: HeroBanner[];
  reviews: CustomerReview[];
  inquiries: CustomerInquiry[];
  orders: Order[];
  trashedOrders: Order[];
  deletionAuditLogs: OrderDeletionAuditLog[];
  settings: WebsiteSettings;
  isLoadingData: boolean;
  refreshData: () => Promise<void>;

  // Customer Account & Orders
  customerUser: CustomerUser | null;
  loginCustomer: (user: CustomerUser) => void;
  logoutCustomer: () => void;
  updateCustomerProfile: (updatedData: Partial<CustomerUser>) => Promise<CustomerUser>;
  createOrder: (order: Omit<Order, 'id' | 'orderDate'>) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus, trackingNumber?: string, courierName?: string, estimatedDelivery?: string, note?: string) => Promise<boolean>;
  addOrderCommunication: (id: string, comm: Omit<import('../types').OrderCommunicationRecord, 'id' | 'timestamp'>) => Promise<boolean>;
  updateOrderAdvancePayment: (id: string, advanceRecord: Partial<import('../types').AdvancePaymentRecord>) => Promise<boolean>;
  deleteOrder: (id: string) => Promise<boolean>;
  moveToTrashOrder: (id: string, deletedBy?: string, reason?: string) => Promise<boolean>;
  restoreOrderFromTrash: (id: string, restoredBy?: string) => Promise<boolean>;
  permanentlyDeleteOrderWithVerification: (id: string, deletedBy?: string, reason?: string, verificationMethod?: 'Admin Password' | 'Email OTP' | '2FA Authenticator') => Promise<boolean>;
  clearAllTrashWithVerification: (deletedBy?: string, reason?: string, verificationMethod?: 'Admin Password' | 'Email OTP' | '2FA Authenticator') => Promise<boolean>;
  restoreOrderFromBackup: (auditLogId: string) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  deleteGalleryItem: (id: string) => Promise<boolean>;
  deleteHeroBanner: (id: string) => Promise<boolean>;
  deleteReview: (id: string) => Promise<boolean>;

  // Admin Auth State
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  loginAdmin: (user: AdminUser) => void;
  logoutAdmin: () => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // WhatsApp helper
  openWhatsAppInquiry: (product?: Product, customMessage?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPageRaw] = useState<PageRoute>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null);

  // Theme & Settings
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('mc_theme') === 'dark';
  });
  const [customCursorEnabled, setCustomCursorEnabled] = useState<boolean>(true);

  // Search
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Wishlist & Recently Viewed
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('mc_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('mc_recently_viewed');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // 3D Product Viewer Modal State
  const [selected3DProduct, setSelected3DProduct] = useState<Product | null>(null);

  // Multi-Currency Engine
  const [currency, setCurrencyRaw] = useState<CurrencyCode>(() => {
    try {
      const stored = localStorage.getItem('mc_currency') as CurrencyCode;
      return stored && CURRENCIES[stored] ? stored : 'INR';
    } catch {
      return 'INR';
    }
  });

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyRaw(c);
    localStorage.setItem('mc_currency', c);
  };

  const formatPrice = (amountInINR: number): string => {
    const details = CURRENCIES[currency] || CURRENCIES.INR;
    const converted = Math.round(amountInINR * details.rate);
    return `${details.symbol}${converted.toLocaleString()}`;
  };

  // Compare Engine
  const [compareProductIds, setCompareProductIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('mc_compare');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);

  const addToCompare = (id: string) => {
    setCompareProductIds(prev => {
      if (prev.includes(id)) return prev;
      if (prev.length >= 4) {
        addToast("You can compare up to 4 items at once", "info");
        return prev;
      }
      const next = [...prev, id];
      localStorage.setItem('mc_compare', JSON.stringify(next));
      addToast("Item added to Compare drawer", "success");
      return next;
    });
  };

  const removeFromCompare = (id: string) => {
    setCompareProductIds(prev => {
      const next = prev.filter(i => i !== id);
      localStorage.setItem('mc_compare', JSON.stringify(next));
      return next;
    });
  };

  const clearCompare = () => {
    setCompareProductIds([]);
    localStorage.removeItem('mc_compare');
  };

  // Design Customizer Modal
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [customizerProduct, setCustomizerProduct] = useState<Product | null>(null);

  const openCustomizer = (product?: Product) => {
    setCustomizerProduct(product || null);
    setIsCustomizerOpen(true);
  };

  const closeCustomizer = () => {
    setIsCustomizerOpen(false);
    setCustomizerProduct(null);
  };

  // Appointment & Video Call Booking
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState<boolean>(false);

  // International Business Modal
  const [isInternationalModalOpen, setIsInternationalModalOpen] = useState<boolean>(false);

  // Main Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoShowcaseItem[]>([]);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [trashedOrders, setTrashedOrders] = useState<Order[]>([]);
  const [deletionAuditLogs, setDeletionAuditLogs] = useState<OrderDeletionAuditLog[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings>(INITIAL_SETTINGS);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Customer User State (defaulted to Parmar Jaydip for seamless experience)
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(() => {
    try {
      const stored = localStorage.getItem('mc_customer_session');
      return stored ? JSON.parse(stored) : {
        uid: 'usr-default-8819',
        email: 'parmarjaydip881987@gmail.com',
        displayName: 'Parmar Jaydip',
        phone: '+91 98765 12345',
        cityCountry: 'Ahmedabad, Gujarat, India'
      };
    } catch {
      return {
        uid: 'usr-default-8819',
        email: 'parmarjaydip881987@gmail.com',
        displayName: 'Parmar Jaydip'
      };
    }
  });

  // Admin Auth State
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem('mc_admin_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Page routing wrapper that scrolls to top
  const setCurrentPage = (page: PageRoute, productId?: string) => {
    setCurrentPageRaw(page);
    if (productId) {
      setSelectedProductId(productId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Theme
  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('mc_theme', next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Toast functions
  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Wishlist handlers
  const toggleWishlist = (productId: string) => {
    setWishlistIds(prev => {
      let updated: string[];
      if (prev.includes(productId)) {
        updated = prev.filter(id => id !== productId);
        addToast("Removed item from saved wishlist", "info");
      } else {
        updated = [...prev, productId];
        addToast("Item added to your saved wishlist", "success");
      }
      localStorage.setItem('mc_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  // Recently Viewed
  const addRecentlyViewed = (productId: string) => {
    setRecentlyViewedIds(prev => {
      const filtered = prev.filter(id => id !== productId);
      const updated = [productId, ...filtered].slice(0, 10);
      localStorage.setItem('mc_recently_viewed', JSON.stringify(updated));
      return updated;
    });
  };

  // Customer Account handlers
  const loginCustomer = async (user: CustomerUser) => {
    // Check if remote profile exists in Firebase
    const existing = await dbService.getUserProfile(user.email);
    const fullUser = existing ? { ...user, ...existing } : user;
    setCustomerUser(fullUser);
    localStorage.setItem('mc_customer_session', JSON.stringify(fullUser));
    addToast(`Signed in as ${fullUser.displayName} (${fullUser.email})`, 'success');
  };

  const logoutCustomer = () => {
    setCustomerUser(null);
    localStorage.removeItem('mc_customer_session');
    addToast("Logged out from customer portal", "info");
  };

  const updateCustomerProfile = async (updatedData: Partial<CustomerUser>): Promise<CustomerUser> => {
    const current = customerUser || {
      uid: 'usr-default-8819',
      email: 'parmarjaydip881987@gmail.com',
      displayName: 'Parmar Jaydip'
    };

    const merged: CustomerUser = {
      ...current,
      ...updatedData
    };

    const saved = await dbService.saveUserProfile(merged);
    setCustomerUser(saved);
    addToast("Profile and shipping address updated in Firebase!", "success");
    return saved;
  };

  // Customer Order Handlers
  const createOrder = async (orderData: Omit<Order, 'id' | 'orderDate'>): Promise<Order> => {
    const created = await dbService.createOrder(orderData);
    setOrders(prev => [created, ...prev]);
    addToast(`Order ${created.id} placed successfully!`, 'success');
    return created;
  };

  const updateOrderStatus = async (id: string, status: OrderStatus, trackingNumber?: string, courierName?: string, estimatedDelivery?: string, note?: string): Promise<boolean> => {
    const success = await dbService.updateOrderStatus(id, status, trackingNumber, courierName, estimatedDelivery, note);
    if (success) {
      await refreshData();
      addToast(`Updated order ${id} status to ${status}`, 'success');
    }
    return success;
  };

  const addOrderCommunication = async (id: string, comm: Omit<import('../types').OrderCommunicationRecord, 'id' | 'timestamp'>): Promise<boolean> => {
    const success = await dbService.addOrderCommunication(id, comm);
    if (success) {
      await refreshData();
      addToast('Communication record saved to order evidence trail', 'success');
    }
    return success;
  };

  const updateOrderAdvancePayment = async (id: string, advanceRecord: Partial<import('../types').AdvancePaymentRecord>): Promise<boolean> => {
    const success = await dbService.updateOrderAdvancePayment(id, advanceRecord);
    if (success) {
      await refreshData();
      addToast('Advance payment record updated & synced to Firebase', 'success');
    }
    return success;
  };

  const deleteOrder = async (id: string): Promise<boolean> => {
    return moveToTrashOrder(id, 'Super Admin', 'Order moved to Trash');
  };

  const moveToTrashOrder = async (id: string, deletedBy: string = 'Super Admin', reason: string = 'Moved to Trash'): Promise<boolean> => {
    const success = await dbService.moveToTrash(id, deletedBy, reason);
    if (success) {
      await refreshData();
      addToast(`🗑️ Order #${id} moved to Trash. Backup created!`, 'info');
    }
    return success;
  };

  const restoreOrderFromTrash = async (id: string, restoredBy: string = 'Super Admin'): Promise<boolean> => {
    const success = await dbService.restoreFromTrash(id, restoredBy);
    if (success) {
      await refreshData();
      addToast(`♻️ Order #${id} successfully restored from Trash!`, 'success');
    }
    return success;
  };

  const permanentlyDeleteOrderWithVerification = async (
    id: string, 
    deletedBy: string = 'Super Admin', 
    reason: string = 'Permanent Order Purge', 
    verificationMethod: 'Admin Password' | 'Email OTP' | '2FA Authenticator' = 'Admin Password'
  ): Promise<boolean> => {
    const success = await dbService.permanentlyDeleteOrder(id, deletedBy, reason, verificationMethod);
    if (success) {
      await refreshData();
      addToast(`🚨 Order #${id} permanently purged. Audit log & backup retained in vault.`, 'info');
    }
    return success;
  };

  const clearAllTrashWithVerification = async (
    deletedBy: string = 'Super Admin', 
    reason: string = 'Bulk Empty Trash', 
    verificationMethod: 'Admin Password' | 'Email OTP' | '2FA Authenticator' = 'Admin Password'
  ): Promise<boolean> => {
    const success = await dbService.clearAllTrash(deletedBy, reason, verificationMethod);
    if (success) {
      await refreshData();
      addToast(`🗑️ Trash emptied successfully. Security audit logs recorded.`, 'info');
    }
    return success;
  };

  const restoreOrderFromBackup = async (auditLogId: string): Promise<boolean> => {
    const success = await dbService.restoreFromBackup(auditLogId);
    if (success) {
      await refreshData();
      addToast(`🛡️ Order restored from Audit Log Backup Vault!`, 'success');
    }
    return success;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    const success = await dbService.deleteProduct(id);
    if (success) {
      setProducts(prev => prev.filter(p => p.id !== id));
      addToast('Product deleted successfully', 'info');
      await refreshData();
    }
    return success;
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    const success = await dbService.deleteCategory(id);
    if (success) {
      setCategories(prev => prev.filter(c => c.id !== id));
      addToast('Category removed', 'info');
      await refreshData();
    }
    return success;
  };

  const deleteGalleryItem = async (id: string): Promise<boolean> => {
    const success = await dbService.deleteGalleryItem(id);
    if (success) {
      setGallery(prev => prev.filter(g => g.id !== id));
      addToast('Gallery item deleted', 'info');
      await refreshData();
    }
    return success;
  };

  const deleteHeroBanner = async (id: string): Promise<boolean> => {
    const success = await dbService.deleteHeroBanner(id);
    if (success) {
      setHeroBanners(prev => prev.filter(b => b.id !== id));
      addToast('Hero banner deleted', 'info');
      await refreshData();
    }
    return success;
  };

  const deleteReview = async (id: string): Promise<boolean> => {
    const success = await dbService.deleteReview(id);
    if (success) {
      setReviews(prev => prev.filter(r => r.id !== id));
      addToast('Review deleted', 'info');
      await refreshData();
    }
    return success;
  };

  // Admin Auth handlers
  const loginAdmin = (user: AdminUser) => {
    setAdminUser(user);
    localStorage.setItem('mc_admin_session', JSON.stringify(user));
    addToast(`Welcome Admin (${user.email})`, 'success');
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem('mc_admin_session');
    addToast("Logged out from Admin portal", "info");
  };

  // Fetch all database records
  const refreshData = async () => {
    setIsLoadingData(true);
    try {
      const [
        prods,
        cats,
        cols,
        gals,
        vids,
        heros,
        revs,
        inqs,
        ords,
        trashOrds,
        auditLogs,
        sets
      ] = await Promise.all([
        dbService.getProducts(),
        dbService.getCategories(),
        dbService.getCollections(),
        dbService.getGallery(),
        dbService.getVideos(),
        dbService.getHeroBanners(),
        dbService.getReviews(),
        dbService.getInquiries(),
        dbService.getOrders(),
        dbService.getTrashedOrders(),
        dbService.getDeletionAuditLogs(),
        dbService.getSettings()
      ]);

      setProducts(prods);
      setCategories(cats);
      setCollections(cols);
      setGallery(gals);
      setVideos(vids);
      setHeroBanners(heros);
      setReviews(revs);
      setInquiries(inqs);
      setOrders(ords);
      setTrashedOrders(trashOrds);
      setDeletionAuditLogs(auditLogs);
      setSettings(sets);
      if (customerUser?.email) {
        const remoteProfile = await dbService.getUserProfile(customerUser.email);
        if (remoteProfile) {
          setCustomerUser(prev => prev ? { ...prev, ...remoteProfile } : remoteProfile);
        }
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // WhatsApp Inquiry trigger
  const openWhatsAppInquiry = (product?: Product, customMessage?: string) => {
    const rawNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    let text = `Hello Mahalakshmi Creation,\nI would like to make an inquiry regarding your luxury embroidery collection.`;

    if (product) {
      text = `Hello Mahalakshmi Creation,\nI am interested in ordering/inquiring about the following luxury embroidery piece:\n\n*Product:* ${product.title}\n*SKU:* ${product.sku}\n*Category:* ${product.category}\n*Price:* ${settings.currencySymbol}${product.price.toLocaleString()}\n\nPlease provide customization details, fabric swatches, and delivery timeframe.`;
    } else if (customMessage) {
      text = customMessage;
    }

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${rawNumber}?text=${encodedText}`, '_blank');
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedProductId,
        setSelectedProductId,
        categoryFilter,
        setCategoryFilter,
        collectionFilter,
        setCollectionFilter,

        isDarkMode,
        toggleDarkMode,
        customCursorEnabled,
        setCustomCursorEnabled,

        currency,
        setCurrency,
        formatPrice,

        compareProductIds,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isCompareOpen,
        setIsCompareOpen,

        isCustomizerOpen,
        customizerProduct,
        openCustomizer,
        closeCustomizer,

        isAppointmentModalOpen,
        setIsAppointmentModalOpen,

        isInternationalModalOpen,
        setIsInternationalModalOpen,

        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,

        wishlistIds,
        toggleWishlist,
        isInWishlist,
        recentlyViewedIds,
        addRecentlyViewed,

        quickViewProduct,
        setQuickViewProduct,

        selected3DProduct,
        setSelected3DProduct,

        products,
        categories,
        collections,
        gallery,
        videos,
        heroBanners,
        reviews,
        inquiries,
        orders,
        trashedOrders,
        deletionAuditLogs,
        settings,
        isLoadingData,
        refreshData,

        customerUser,
        loginCustomer,
        logoutCustomer,
        updateCustomerProfile,
        createOrder,
        updateOrderStatus,
        addOrderCommunication,
        updateOrderAdvancePayment,
        deleteOrder,
        moveToTrashOrder,
        restoreOrderFromTrash,
        permanentlyDeleteOrderWithVerification,
        clearAllTrashWithVerification,
        restoreOrderFromBackup,
        deleteProduct,
        deleteCategory,
        deleteGalleryItem,
        deleteHeroBanner,
        deleteReview,

        adminUser,
        isAdminAuthenticated: Boolean(adminUser),
        loginAdmin,
        logoutAdmin,

        toasts,
        addToast,
        removeToast,

        openWhatsAppInquiry
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
