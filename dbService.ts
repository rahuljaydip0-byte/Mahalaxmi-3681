import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  addDoc 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { deleteFromCloudflareR2 } from './r2ClientService';
import { 
  Product, 
  CategoryItem, 
  CollectionItem, 
  GalleryItem, 
  VideoShowcaseItem, 
  HeroBanner, 
  CustomerReview, 
  CustomerInquiry, 
  WebsiteSettings,
  Order,
  CustomerUser,
  OrderAuditLog,
  OrderCommunicationRecord,
  AdvancePaymentRecord,
  OrderStatus,
  OrderDeletionAuditLog
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_COLLECTIONS, 
  INITIAL_GALLERY, 
  INITIAL_VIDEOS, 
  INITIAL_HERO_BANNERS, 
  INITIAL_REVIEWS, 
  INITIAL_INQUIRIES, 
  INITIAL_SETTINGS,
  INITIAL_ORDERS 
} from '../data/initialData';

const LOCAL_STORAGE_KEYS = {
  PRODUCTS: 'mc_products',
  CATEGORIES: 'mc_categories',
  COLLECTIONS: 'mc_collections',
  GALLERY: 'mc_gallery',
  VIDEOS: 'mc_videos',
  HERO: 'mc_hero_banners',
  REVIEWS: 'mc_reviews',
  INQUIRIES: 'mc_inquiries',
  SETTINGS: 'mc_settings',
  WISHLIST: 'mc_wishlist',
  RECENTLY_VIEWED: 'mc_recently_viewed',
  ORDERS: 'mc_orders',
  TRASH_ORDERS: 'mc_trash_orders',
  DELETION_AUDIT_LOGS: 'mc_order_deletion_audit_logs',
  PROFILES: 'mc_customer_profiles'
};

// Helper function to read from local storage with fallback to initial data
function getLocal<T>(key: string, initial: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(item);
    
    // Auto-clean old demo gallery items & demo videos from local storage if present
    if (key === LOCAL_STORAGE_KEYS.GALLERY && Array.isArray(parsed) && parsed.some((g: any) => g.id?.startsWith('gal-') || g.videoUrl?.includes('mov_bbb.mp4'))) {
      const filtered = parsed.filter((g: any) => !g.id?.startsWith('gal-') && !g.videoUrl?.includes('mov_bbb.mp4'));
      localStorage.setItem(key, JSON.stringify(filtered));
      return filtered as unknown as T;
    }
    if (key === LOCAL_STORAGE_KEYS.VIDEOS && Array.isArray(parsed) && parsed.some((v: any) => v.id?.startsWith('vid-') || v.videoUrl?.includes('mov_bbb.mp4'))) {
      const filtered = parsed.filter((v: any) => !v.id?.startsWith('vid-') && !v.videoUrl?.includes('mov_bbb.mp4'));
      localStorage.setItem(key, JSON.stringify(filtered));
      return filtered as unknown as T;
    }

    return parsed;
  } catch {
    return initial;
  }
}

// Helper function to save to local storage
function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving to localStorage key ${key}:`, err);
  }
}

// Flag to track whether Firestore network is reachable
let isFirestoreOnline = true;

function markFirestoreOffline(err: any): void {
  isFirestoreOnline = false;
  // Silently fall back to local storage without throwing error toasts
  if (process.env.NODE_ENV !== 'production') {
    console.info("Firestore network unavailable or timed out; operating in offline local storage mode.");
  }
}

// Timeout wrapper for Firestore operations so network delays fallback instantly
function withTimeout<T>(promise: Promise<T>, ms = 1500): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      markFirestoreOffline('timeout');
      reject(new Error(`Firestore request timed out (${ms}ms)`));
    }, ms);
    promise.then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        markFirestoreOffline(err);
        reject(err);
      }
    );
  });
}

export const dbService = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    if (isFirebaseConfigured && db && isFirestoreOnline) {
      try {
        const querySnapshot = await withTimeout(getDocs(collection(db, 'products')));
        if (!querySnapshot.empty) {
          const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
          setLocal(LOCAL_STORAGE_KEYS.PRODUCTS, docs);
          return docs;
        } else if (localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS) !== null) {
          return getLocal<Product[]>(LOCAL_STORAGE_KEYS.PRODUCTS, []);
        } else {
          const initial = INITIAL_PRODUCTS;
          setLocal(LOCAL_STORAGE_KEYS.PRODUCTS, initial);
          for (const prod of initial) {
            try {
              await setDoc(doc(db, 'products', prod.id), prod, { merge: true });
            } catch (err) {
              console.warn("Error seeding product to firestore:", err);
            }
          }
          return initial;
        }
      } catch (e) {
        markFirestoreOffline(e);
      }
    }
    return getLocal<Product[]>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  async getProductById(id: string): Promise<Product | null> {
    if (isFirebaseConfigured && db && isFirestoreOnline) {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await withTimeout(getDoc(docRef));
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Product;
        }
      } catch (e) {
        markFirestoreOffline(e);
      }
    }
    const products = getLocal<Product[]>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return products.find(p => p.id === id) || null;
  },

  async saveProduct(product: Partial<Product> & { title: string }): Promise<Product> {
    const isNew = !product.id;
    const newId = product.id || `prod-${Date.now()}`;
    const now = new Date().toISOString();

    const fullProduct: Product = {
      id: newId,
      sku: product.sku || `MC-PRD-${Math.floor(100 + Math.random() * 900)}`,
      title: product.title,
      category: product.category || 'Neck Embroidery',
      collections: product.collections || ['Luxury Collection'],
      price: product.price || 9900,
      originalPrice: product.originalPrice,
      description: product.description || '',
      fabric: product.fabric || 'Pure Silk',
      workType: product.workType || ['Hand Embroidery'],
      images: product.images && product.images.length > 0 ? product.images : [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop'
      ],
      threeSixtyImages: product.threeSixtyImages,
      videoUrl: product.videoUrl,
      availableColors: product.availableColors || [{ name: 'Gold', hex: '#D4AF37' }],
      availableSizes: product.availableSizes || ['Standard'],
      isNewArrival: product.isNewArrival ?? true,
      isTrending: product.isTrending ?? false,
      isFeatured: product.isFeatured ?? false,
      isPopular: product.isPopular ?? false,
      status: product.status || 'published',
      createdAt: product.createdAt || now,
      updatedAt: now,
      tags: product.tags || [],
      minOrderQty: product.minOrderQty || 1
    };

    if (isFirebaseConfigured && db && isFirestoreOnline) {
      try {
        await setDoc(doc(db, 'products', newId), fullProduct, { merge: true });
      } catch (e) {
        markFirestoreOffline(e);
      }
    }

    const products = getLocal<Product[]>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const existingIndex = products.findIndex(p => p.id === newId);
    let updatedProducts: Product[];
    if (existingIndex >= 0) {
      updatedProducts = [...products];
      updatedProducts[existingIndex] = fullProduct;
    } else {
      updatedProducts = [fullProduct, ...products];
    }
    setLocal(LOCAL_STORAGE_KEYS.PRODUCTS, updatedProducts);
    return fullProduct;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const products = getLocal<Product[]>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const targetProduct = products.find(p => p.id === id);

    // Auto-delete product images from Cloudflare R2 storage
    if (targetProduct && Array.isArray(targetProduct.images)) {
      for (const imgUrl of targetProduct.images) {
        if (imgUrl && (imgUrl.includes('.r2.cloudflarestorage.com') || imgUrl.includes('/r2-uploads/') || imgUrl.includes('cdn.'))) {
          deleteFromCloudflareR2(imgUrl).catch(() => {});
        }
      }
    }

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (e) {
        console.error("Firestore deleteProduct error:", e);
      }
    }
    const filtered = products.filter(p => p.id !== id);
    setLocal(LOCAL_STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  },

  // CATEGORIES
  async getCategories(): Promise<CategoryItem[]> {
    if (isFirebaseConfigured && db && isFirestoreOnline) {
      try {
        const querySnapshot = await withTimeout(getDocs(collection(db, 'categories')));
        if (!querySnapshot.empty) {
          const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CategoryItem));
          setLocal(LOCAL_STORAGE_KEYS.CATEGORIES, docs);
          return docs;
        } else if (localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES) !== null) {
          return getLocal<CategoryItem[]>(LOCAL_STORAGE_KEYS.CATEGORIES, []);
        } else {
          const initial = INITIAL_CATEGORIES;
          setLocal(LOCAL_STORAGE_KEYS.CATEGORIES, initial);
          for (const cat of initial) {
            try {
              await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
            } catch (err) {
              console.warn("Error seeding category to firestore:", err);
            }
          }
          return initial;
        }
      } catch (e) {
        markFirestoreOffline(e);
      }
    }
    return getLocal<CategoryItem[]>(LOCAL_STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  async saveCategory(category: CategoryItem): Promise<CategoryItem> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'categories', category.id), category, { merge: true });
      } catch (e) {
        console.warn("Firestore saveCategory fallback:", e);
      }
    }
    const list = getLocal<CategoryItem[]>(LOCAL_STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const idx = list.findIndex(c => c.id === category.id);
    const updated = idx >= 0 ? list.map(c => c.id === category.id ? category : c) : [category, ...list];
    setLocal(LOCAL_STORAGE_KEYS.CATEGORIES, updated);
    return category;
  },

  async deleteCategory(id: string): Promise<boolean> {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'categories', id));
      } catch (e) {
        console.error("Firestore deleteCategory error:", e);
      }
    }
    const currentRaw = localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES);
    const list: CategoryItem[] = currentRaw !== null ? JSON.parse(currentRaw) : INITIAL_CATEGORIES;
    const filtered = list.filter(c => c.id !== id);
    setLocal(LOCAL_STORAGE_KEYS.CATEGORIES, filtered);
    return true;
  },

  // COLLECTIONS
  async getCollections(): Promise<CollectionItem[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await withTimeout(getDocs(collection(db, 'collections')));
        if (!querySnapshot.empty) {
          return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CollectionItem));
        }
      } catch (e) {
        console.warn("Firestore getCollections fallback:", e);
      }
    }
    return getLocal<CollectionItem[]>(LOCAL_STORAGE_KEYS.COLLECTIONS, INITIAL_COLLECTIONS);
  },

  async saveCollection(item: CollectionItem): Promise<CollectionItem> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'collections', item.id), item, { merge: true });
      } catch (e) {
        console.warn("Firestore saveCollection fallback:", e);
      }
    }
    const list = getLocal<CollectionItem[]>(LOCAL_STORAGE_KEYS.COLLECTIONS, INITIAL_COLLECTIONS);
    const idx = list.findIndex(c => c.id === item.id);
    const updated = idx >= 0 ? list.map(c => c.id === item.id ? item : c) : [item, ...list];
    setLocal(LOCAL_STORAGE_KEYS.COLLECTIONS, updated);
    return item;
  },

  async deleteCollection(id: string): Promise<boolean> {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'collections', id));
      } catch (e) {
        console.warn("Firestore deleteCollection fallback:", e);
      }
    }
    const list = getLocal<CollectionItem[]>(LOCAL_STORAGE_KEYS.COLLECTIONS, INITIAL_COLLECTIONS);
    setLocal(LOCAL_STORAGE_KEYS.COLLECTIONS, list.filter(c => c.id !== id));
    return true;
  },

  // GALLERY
  async getGallery(): Promise<GalleryItem[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await withTimeout(getDocs(collection(db, 'gallery')));
        if (!querySnapshot.empty) {
          return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
        }
      } catch (e) {
        console.warn("Firestore getGallery fallback:", e);
      }
    }
    return getLocal<GalleryItem[]>(LOCAL_STORAGE_KEYS.GALLERY, INITIAL_GALLERY);
  },

  async saveGalleryItem(item: GalleryItem): Promise<GalleryItem> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'gallery', item.id), item, { merge: true });
      } catch (e) {
        console.warn("Firestore saveGalleryItem fallback:", e);
      }
    }
    const list = getLocal<GalleryItem[]>(LOCAL_STORAGE_KEYS.GALLERY, INITIAL_GALLERY);
    const updated = [item, ...list.filter(g => g.id !== item.id)];
    setLocal(LOCAL_STORAGE_KEYS.GALLERY, updated);
    return item;
  },

  async deleteGalleryItem(id: string): Promise<boolean> {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'gallery', id));
      } catch (e) {
        console.warn("Firestore deleteGalleryItem fallback:", e);
      }
    }
    const list = getLocal<GalleryItem[]>(LOCAL_STORAGE_KEYS.GALLERY, INITIAL_GALLERY);
    setLocal(LOCAL_STORAGE_KEYS.GALLERY, list.filter(g => g.id !== id));
    return true;
  },

  // VIDEOS
  async getVideos(): Promise<VideoShowcaseItem[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await withTimeout(getDocs(collection(db, 'videos')));
        if (!querySnapshot.empty) {
          return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoShowcaseItem));
        }
      } catch (e) {
        console.warn("Firestore getVideos fallback:", e);
      }
    }
    return getLocal<VideoShowcaseItem[]>(LOCAL_STORAGE_KEYS.VIDEOS, INITIAL_VIDEOS);
  },

  async saveVideo(item: VideoShowcaseItem): Promise<VideoShowcaseItem> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'videos', item.id), item, { merge: true });
      } catch (e) {
        console.warn("Firestore saveVideo fallback:", e);
      }
    }
    const list = getLocal<VideoShowcaseItem[]>(LOCAL_STORAGE_KEYS.VIDEOS, INITIAL_VIDEOS);
    const updated = [item, ...list.filter(v => v.id !== item.id)];
    setLocal(LOCAL_STORAGE_KEYS.VIDEOS, updated);
    return item;
  },

  async deleteVideo(id: string): Promise<boolean> {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'videos', id));
      } catch (e) {
        console.warn("Firestore deleteVideo fallback:", e);
      }
    }
    const list = getLocal<VideoShowcaseItem[]>(LOCAL_STORAGE_KEYS.VIDEOS, INITIAL_VIDEOS);
    setLocal(LOCAL_STORAGE_KEYS.VIDEOS, list.filter(v => v.id !== id));
    return true;
  },

  // HERO BANNERS
  async getHeroBanners(): Promise<HeroBanner[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await withTimeout(getDocs(collection(db, 'hero')));
        if (!querySnapshot.empty) {
          return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HeroBanner));
        }
      } catch (e) {
        console.warn("Firestore getHeroBanners fallback:", e);
      }
    }
    return getLocal<HeroBanner[]>(LOCAL_STORAGE_KEYS.HERO, INITIAL_HERO_BANNERS);
  },

  async saveHeroBanner(banner: HeroBanner): Promise<HeroBanner> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'hero', banner.id), banner, { merge: true });
      } catch (e) {
        console.warn("Firestore saveHeroBanner fallback:", e);
      }
    }
    const list = getLocal<HeroBanner[]>(LOCAL_STORAGE_KEYS.HERO, INITIAL_HERO_BANNERS);
    const updated = [banner, ...list.filter(b => b.id !== banner.id)];
    setLocal(LOCAL_STORAGE_KEYS.HERO, updated);
    return banner;
  },

  async deleteHeroBanner(id: string): Promise<boolean> {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'hero', id));
      } catch (e) {
        console.warn("Firestore deleteHeroBanner fallback:", e);
      }
    }
    const list = getLocal<HeroBanner[]>(LOCAL_STORAGE_KEYS.HERO, INITIAL_HERO_BANNERS);
    setLocal(LOCAL_STORAGE_KEYS.HERO, list.filter(b => b.id !== id));
    return true;
  },

  // REVIEWS
  async getReviews(): Promise<CustomerReview[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await withTimeout(getDocs(collection(db, 'reviews')));
        if (!querySnapshot.empty) {
          return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomerReview));
        }
      } catch (e) {
        console.warn("Firestore getReviews fallback:", e);
      }
    }
    return getLocal<CustomerReview[]>(LOCAL_STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  },

  async addReview(review: Omit<CustomerReview, 'id' | 'createdAt' | 'status'>): Promise<CustomerReview> {
    const newReview: CustomerReview = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'approved'
    };
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'reviews', newReview.id), newReview);
      } catch (e) {
        console.warn("Firestore addReview fallback:", e);
      }
    }
    const list = getLocal<CustomerReview[]>(LOCAL_STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    const updated = [newReview, ...list];
    setLocal(LOCAL_STORAGE_KEYS.REVIEWS, updated);
    return newReview;
  },

  async deleteReview(id: string): Promise<boolean> {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'reviews', id));
      } catch (e) {
        console.warn("Firestore deleteReview fallback:", e);
      }
    }
    const list = getLocal<CustomerReview[]>(LOCAL_STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    setLocal(LOCAL_STORAGE_KEYS.REVIEWS, list.filter(r => r.id !== id));
    return true;
  },

  // CUSTOMER INQUIRIES
  async getInquiries(): Promise<CustomerInquiry[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await withTimeout(getDocs(collection(db, 'contact')));
        if (!querySnapshot.empty) {
          return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomerInquiry));
        }
      } catch (e) {
        console.warn("Firestore getInquiries fallback:", e);
      }
    }
    return getLocal<CustomerInquiry[]>(LOCAL_STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES);
  },

  async submitInquiry(inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'status'>): Promise<CustomerInquiry> {
    const newInquiry: CustomerInquiry = {
      ...inquiry,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'new'
    };
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'contact', newInquiry.id), newInquiry);
      } catch (e) {
        console.warn("Firestore submitInquiry fallback:", e);
      }
    }
    const list = getLocal<CustomerInquiry[]>(LOCAL_STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES);
    const updated = [newInquiry, ...list];
    setLocal(LOCAL_STORAGE_KEYS.INQUIRIES, updated);
    return newInquiry;
  },

  async updateInquiryStatus(id: string, status: CustomerInquiry['status']): Promise<boolean> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'contact', id), { status });
      } catch (e) {
        console.warn("Firestore updateInquiryStatus fallback:", e);
      }
    }
    const list = getLocal<CustomerInquiry[]>(LOCAL_STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES);
    const updated = list.map(i => i.id === id ? { ...i, status } : i);
    setLocal(LOCAL_STORAGE_KEYS.INQUIRIES, updated);
    return true;
  },

  // WEBSITE SETTINGS
  async getSettings(): Promise<WebsiteSettings> {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await withTimeout(getDoc(docRef));
        if (docSnap.exists()) {
          return { ...INITIAL_SETTINGS, ...docSnap.data() } as WebsiteSettings;
        }
      } catch (e) {
        console.warn("Firestore getSettings fallback:", e);
      }
    }
    return getLocal<WebsiteSettings>(LOCAL_STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  async saveSettings(settings: WebsiteSettings): Promise<WebsiteSettings> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
      } catch (e) {
        console.warn("Firestore saveSettings fallback:", e);
      }
    }
    setLocal(LOCAL_STORAGE_KEYS.SETTINGS, settings);
    return settings;
  },

  // CUSTOMER ORDERS & INTERNATIONAL PROTECTION
  async getOrders(): Promise<Order[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await withTimeout(getDocs(collection(db, 'orders')));
        if (!querySnapshot.empty) {
          return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        }
      } catch (e) {
        console.warn("Firestore getOrders fallback:", e);
      }
    }
    return getLocal<Order[]>(LOCAL_STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },

  async getUserOrders(email: string): Promise<Order[]> {
    const allOrders = await this.getOrders();
    if (!email) return [];
    return allOrders.filter(o => o.customerEmail.toLowerCase().trim() === email.toLowerCase().trim());
  },

  async createOrder(order: Omit<Order, 'id' | 'orderDate'>): Promise<Order> {
    const nowIso = new Date().toISOString();
    const orderId = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const metadata = order.protectionMetadata || {
      fullName: order.customerName,
      companyName: order.companyName || 'Private Client',
      email: order.customerEmail,
      phone: order.customerPhone || '+1 000-000-0000',
      billingAddress: order.billingAddress || order.shippingAddress || 'N/A',
      shippingAddress: order.shippingAddress || 'N/A',
      country: order.country || 'International',
      ipAddress: '127.0.0.1',
      deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Client Device',
      timestamp: nowIso,
      termsAccepted: true,
      termsAcceptedAt: nowIso,
      digitalSignature: `SIG_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    };

    const initialAuditLogs: OrderAuditLog[] = [
      {
        id: `audit-${Date.now()}-1`,
        timestamp: nowIso,
        actor: order.customerName,
        actorRole: 'customer',
        action: 'ORDER_SUBMITTED_AND_TERMS_ACCEPTED',
        newStatus: order.status || 'Inquiry',
        details: `Customer accepted binding Terms & Conditions and placed international order. IP: ${metadata.ipAddress}`,
        ipAddress: metadata.ipAddress
      }
    ];

    const initialCommunications: OrderCommunicationRecord[] = [
      {
        id: `comm-${Date.now()}-1`,
        type: 'inquiry',
        sender: 'customer',
        title: 'Initial Order Inquiry & Protection Binding',
        content: `Order created for ${order.items.length} items. Total Amount: $${order.totalAmount.toLocaleString()} USD. Terms accepted on ${nowIso}.`,
        timestamp: nowIso
      }
    ];

    const advancePaymentRecord: AdvancePaymentRecord = order.advancePayment || {
      requiredAdvanceAmount: Math.round(order.totalAmount * 0.5),
      paidAdvanceAmount: order.paymentStatus === 'Paid' ? order.totalAmount : (order.paymentStatus === 'Advance Received' ? Math.round(order.totalAmount * 0.5) : 0),
      isAdvanceConfirmed: order.paymentStatus === 'Paid' || order.paymentStatus === 'Advance Received',
      advancePaidAt: order.paymentStatus !== 'Pending' ? nowIso : undefined
    };

    const newOrder: Order = {
      ...order,
      id: orderId,
      orderDate: nowIso,
      termsAccepted: true,
      termsAcceptedAt: nowIso,
      protectionMetadata: metadata,
      auditLogs: initialAuditLogs,
      communications: initialCommunications,
      advancePayment: advancePaymentRecord,
      isLockedByProtection: true
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'orders', newOrder.id), newOrder);
        // Also save to immutable order evidence collection for permanent legal backup
        await setDoc(doc(db, 'order_evidence', newOrder.id), {
          orderId: newOrder.id,
          protectionMetadata: metadata,
          createdAt: nowIso,
          auditTrail: initialAuditLogs
        });
      } catch (e) {
        console.warn("Firestore createOrder fallback:", e);
      }
    }
    const list = getLocal<Order[]>(LOCAL_STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const updated = [newOrder, ...list];
    setLocal(LOCAL_STORAGE_KEYS.ORDERS, updated);
    return newOrder;
  },

  async updateOrderStatus(
    id: string, 
    status: Order['status'], 
    trackingNumber?: string, 
    courierName?: string, 
    estimatedDelivery?: string,
    note?: string,
    actorName: string = 'Super Admin'
  ): Promise<boolean> {
    const list = getLocal<Order[]>(LOCAL_STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const nowIso = new Date().toISOString();

    let targetOrder = list.find(o => o.id === id);
    if (!targetOrder) return false;

    const prevStatus = targetOrder.status;
    const newLog: OrderAuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: nowIso,
      actor: actorName,
      actorRole: 'admin',
      action: 'STATUS_UPDATED',
      previousStatus: prevStatus,
      newStatus: status,
      details: note || `Order status updated from ${prevStatus} to ${status}.`
    };

    const existingLogs = targetOrder.auditLogs || [];
    const updatedLogs = [newLog, ...existingLogs];

    const updated = list.map(o => {
      if (o.id === id) {
        return {
          ...o,
          status,
          auditLogs: updatedLogs,
          ...(trackingNumber !== undefined && { trackingNumber }),
          ...(courierName !== undefined && { courierName }),
          ...(estimatedDelivery !== undefined && { estimatedDelivery })
        };
      }
      return o;
    });
    setLocal(LOCAL_STORAGE_KEYS.ORDERS, updated);

    if (isFirebaseConfigured && db) {
      try {
        const updateData: any = { 
          status,
          auditLogs: updatedLogs 
        };
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (courierName) updateData.courierName = courierName;
        if (estimatedDelivery) updateData.estimatedDelivery = estimatedDelivery;

        await updateDoc(doc(db, 'orders', id), updateData);
      } catch (e) {
        console.warn("Firestore updateOrderStatus fallback:", e);
      }
    }
    return true;
  },

  async addOrderCommunication(id: string, comm: Omit<OrderCommunicationRecord, 'id' | 'timestamp'>): Promise<boolean> {
    const list = getLocal<Order[]>(LOCAL_STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const nowIso = new Date().toISOString();
    const newCommRecord: OrderCommunicationRecord = {
      ...comm,
      id: `comm-${Date.now()}`,
      timestamp: nowIso
    };

    const updated = list.map(o => {
      if (o.id === id) {
        const existingComms = o.communications || [];
        return {
          ...o,
          communications: [newCommRecord, ...existingComms]
        };
      }
      return o;
    });
    setLocal(LOCAL_STORAGE_KEYS.ORDERS, updated);

    if (isFirebaseConfigured && db) {
      try {
        const target = updated.find(o => o.id === id);
        if (target) {
          await updateDoc(doc(db, 'orders', id), { communications: target.communications });
        }
      } catch (e) {
        console.warn("Firestore addOrderCommunication error:", e);
      }
    }
    return true;
  },

  async updateOrderAdvancePayment(id: string, advanceRecord: Partial<AdvancePaymentRecord>): Promise<boolean> {
    const list = getLocal<Order[]>(LOCAL_STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const nowIso = new Date().toISOString();

    const updated = list.map(o => {
      if (o.id === id) {
        const currentAdv = o.advancePayment || {
          requiredAdvanceAmount: Math.round(o.totalAmount * 0.5),
          paidAdvanceAmount: 0,
          isAdvanceConfirmed: false
        };
        const newAdv: AdvancePaymentRecord = {
          ...currentAdv,
          ...advanceRecord
        };
        const newPaymentStatus = newAdv.paidAdvanceAmount >= o.totalAmount ? 'Paid' : (newAdv.paidAdvanceAmount > 0 ? 'Advance Received' : 'Pending');
        const newOrderStatus: OrderStatus = (newAdv.paidAdvanceAmount > 0 && o.status === 'Quote Accepted') ? 'Advance Paid' : o.status;

        return {
          ...o,
          advancePayment: newAdv,
          paymentStatus: newPaymentStatus,
          status: newOrderStatus
        };
      }
      return o;
    });
    setLocal(LOCAL_STORAGE_KEYS.ORDERS, updated);

    if (isFirebaseConfigured && db) {
      try {
        const target = updated.find(o => o.id === id);
        if (target) {
          await updateDoc(doc(db, 'orders', id), {
            advancePayment: target.advancePayment,
            paymentStatus: target.paymentStatus,
            status: target.status
          });
        }
      } catch (e) {
        console.warn("Firestore updateOrderAdvancePayment error:", e);
      }
    }
    return true;
  },

  async deleteOrder(id: string): Promise<boolean> {
    return this.moveToTrash(id, 'Super Admin', 'Manual Order Deletion');
  },

  // TRASH & SECURE ORDER DELETION AUDIT SYSTEM
  async getTrashedOrders(): Promise<Order[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await withTimeout(getDocs(collection(db, 'order_trash')));
        if (!querySnapshot.empty) {
          return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        }
      } catch (e) {
        console.warn("Firestore getTrashedOrders fallback:", e);
      }
    }
    return getLocal<Order[]>(LOCAL_STORAGE_KEYS.TRASH_ORDERS, []);
  },

  async getDeletionAuditLogs(): Promise<OrderDeletionAuditLog[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await withTimeout(getDocs(collection(db, 'order_deletion_audit_logs')));
        if (!querySnapshot.empty) {
          return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OrderDeletionAuditLog));
        }
      } catch (e) {
        console.warn("Firestore getDeletionAuditLogs fallback:", e);
      }
    }
    return getLocal<OrderDeletionAuditLog[]>(LOCAL_STORAGE_KEYS.DELETION_AUDIT_LOGS, []);
  },

  async moveToTrash(
    id: string, 
    deletedBy: string = 'Super Admin', 
    reason: string = 'Order moved to Trash', 
    ipAddress: string = '127.0.0.1'
  ): Promise<boolean> {
    const nowIso = new Date().toISOString();
    const activeOrders = getLocal<Order[]>(LOCAL_STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const targetOrder = activeOrders.find(o => o.id === id);

    if (!targetOrder) return false;

    const trashedOrder: Order = {
      ...targetOrder,
      isTrashed: true,
      trashedAt: nowIso,
      trashedBy: deletedBy,
      trashReason: reason
    };

    // Remove from active orders, add to trash
    const updatedActive = activeOrders.filter(o => o.id !== id);
    const currentTrash = getLocal<Order[]>(LOCAL_STORAGE_KEYS.TRASH_ORDERS, []);
    const updatedTrash = [trashedOrder, ...currentTrash.filter(t => t.id !== id)];

    setLocal(LOCAL_STORAGE_KEYS.ORDERS, updatedActive);
    setLocal(LOCAL_STORAGE_KEYS.TRASH_ORDERS, updatedTrash);

    // Record Audit Log
    const auditRecord: OrderDeletionAuditLog = {
      id: `del-audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId: id,
      deletedBy,
      deletedAt: nowIso,
      ipAddress,
      reason,
      actionType: 'moved_to_trash',
      backupSnapshot: targetOrder
    };

    const currentLogs = getLocal<OrderDeletionAuditLog[]>(LOCAL_STORAGE_KEYS.DELETION_AUDIT_LOGS, []);
    setLocal(LOCAL_STORAGE_KEYS.DELETION_AUDIT_LOGS, [auditRecord, ...currentLogs]);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'order_trash', id), trashedOrder);
        await deleteDoc(doc(db, 'orders', id));
        await setDoc(doc(db, 'order_deletion_audit_logs', auditRecord.id), auditRecord);
      } catch (e) {
        console.warn("Firestore moveToTrash fallback:", e);
      }
    }

    return true;
  },

  async restoreFromTrash(id: string, restoredBy: string = 'Super Admin'): Promise<boolean> {
    const nowIso = new Date().toISOString();
    const currentTrash = getLocal<Order[]>(LOCAL_STORAGE_KEYS.TRASH_ORDERS, []);
    const targetOrder = currentTrash.find(o => o.id === id);

    if (!targetOrder) return false;

    const restoredOrder: Order = {
      ...targetOrder,
      isTrashed: false,
      trashedAt: undefined,
      trashedBy: undefined,
      trashReason: undefined
    };

    const updatedTrash = currentTrash.filter(o => o.id !== id);
    const activeOrders = getLocal<Order[]>(LOCAL_STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const updatedActive = [restoredOrder, ...activeOrders.filter(o => o.id !== id)];

    setLocal(LOCAL_STORAGE_KEYS.TRASH_ORDERS, updatedTrash);
    setLocal(LOCAL_STORAGE_KEYS.ORDERS, updatedActive);

    // Record Audit Log
    const auditRecord: OrderDeletionAuditLog = {
      id: `del-audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId: id,
      deletedBy: restoredBy,
      deletedAt: nowIso,
      ipAddress: '127.0.0.1',
      reason: `Order #${id} restored from Trash by ${restoredBy}`,
      actionType: 'restored',
      backupSnapshot: restoredOrder
    };

    const currentLogs = getLocal<OrderDeletionAuditLog[]>(LOCAL_STORAGE_KEYS.DELETION_AUDIT_LOGS, []);
    setLocal(LOCAL_STORAGE_KEYS.DELETION_AUDIT_LOGS, [auditRecord, ...currentLogs]);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'orders', id), restoredOrder);
        await deleteDoc(doc(db, 'order_trash', id));
        await setDoc(doc(db, 'order_deletion_audit_logs', auditRecord.id), auditRecord);
      } catch (e) {
        console.warn("Firestore restoreFromTrash fallback:", e);
      }
    }

    return true;
  },

  async permanentlyDeleteOrder(
    id: string, 
    deletedBy: string = 'Super Admin', 
    reason: string = 'Permanent Purge', 
    verificationMethod: 'Admin Password' | 'Email OTP' | '2FA Authenticator' = 'Admin Password',
    ipAddress: string = '127.0.0.1'
  ): Promise<boolean> {
    const nowIso = new Date().toISOString();
    const currentTrash = getLocal<Order[]>(LOCAL_STORAGE_KEYS.TRASH_ORDERS, []);
    const activeOrders = getLocal<Order[]>(LOCAL_STORAGE_KEYS.ORDERS, INITIAL_ORDERS);

    const targetOrder = currentTrash.find(o => o.id === id) || activeOrders.find(o => o.id === id);

    if (!targetOrder) return false;

    // Purge from both lists
    setLocal(LOCAL_STORAGE_KEYS.TRASH_ORDERS, currentTrash.filter(o => o.id !== id));
    setLocal(LOCAL_STORAGE_KEYS.ORDERS, activeOrders.filter(o => o.id !== id));

    // Record Audit Log with permanent Backup Snapshot
    const auditRecord: OrderDeletionAuditLog = {
      id: `del-audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId: id,
      deletedBy,
      deletedAt: nowIso,
      ipAddress,
      reason,
      actionType: 'permanently_deleted',
      verificationMethodUsed: verificationMethod,
      backupSnapshot: targetOrder
    };

    const currentLogs = getLocal<OrderDeletionAuditLog[]>(LOCAL_STORAGE_KEYS.DELETION_AUDIT_LOGS, []);
    setLocal(LOCAL_STORAGE_KEYS.DELETION_AUDIT_LOGS, [auditRecord, ...currentLogs]);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'order_trash', id));
        await deleteDoc(doc(db, 'orders', id));
        await setDoc(doc(db, 'order_deletion_audit_logs', auditRecord.id), auditRecord);
      } catch (e) {
        console.warn("Firestore permanentlyDeleteOrder fallback:", e);
      }
    }

    return true;
  },

  async clearAllTrash(
    deletedBy: string = 'Super Admin', 
    reason: string = 'Bulk Empty Trash', 
    verificationMethod: 'Admin Password' | 'Email OTP' | '2FA Authenticator' = 'Admin Password',
    ipAddress: string = '127.0.0.1'
  ): Promise<boolean> {
    const nowIso = new Date().toISOString();
    const currentTrash = getLocal<Order[]>(LOCAL_STORAGE_KEYS.TRASH_ORDERS, []);

    if (currentTrash.length === 0) return true;

    // Record audit logs for all trashed orders before clearing
    const currentLogs = getLocal<OrderDeletionAuditLog[]>(LOCAL_STORAGE_KEYS.DELETION_AUDIT_LOGS, []);
    const newLogs: OrderDeletionAuditLog[] = currentTrash.map(ord => ({
      id: `del-audit-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      orderId: ord.id,
      deletedBy,
      deletedAt: nowIso,
      ipAddress,
      reason: `[Bulk Clear Trash] ${reason}`,
      actionType: 'bulk_trash_cleared',
      verificationMethodUsed: verificationMethod,
      backupSnapshot: ord
    }));

    setLocal(LOCAL_STORAGE_KEYS.TRASH_ORDERS, []);
    setLocal(LOCAL_STORAGE_KEYS.DELETION_AUDIT_LOGS, [...newLogs, ...currentLogs]);

    if (isFirebaseConfigured && db) {
      try {
        for (const ord of currentTrash) {
          await deleteDoc(doc(db, 'order_trash', ord.id));
        }
        for (const log of newLogs) {
          await setDoc(doc(db, 'order_deletion_audit_logs', log.id), log);
        }
      } catch (e) {
        console.warn("Firestore clearAllTrash fallback:", e);
      }
    }

    return true;
  },

  async restoreFromBackup(auditLogId: string): Promise<boolean> {
    const logs = getLocal<OrderDeletionAuditLog[]>(LOCAL_STORAGE_KEYS.DELETION_AUDIT_LOGS, []);
    const log = logs.find(l => l.id === auditLogId);

    if (!log || !log.backupSnapshot) return false;

    const restoredOrder: Order = {
      ...log.backupSnapshot,
      isTrashed: false,
      trashedAt: undefined,
      trashedBy: undefined,
      trashReason: undefined
    };

    const activeOrders = getLocal<Order[]>(LOCAL_STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const updatedActive = [restoredOrder, ...activeOrders.filter(o => o.id !== restoredOrder.id)];

    setLocal(LOCAL_STORAGE_KEYS.ORDERS, updatedActive);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'orders', restoredOrder.id), restoredOrder);
      } catch (e) {
        console.warn("Firestore restoreFromBackup fallback:", e);
      }
    }

    return true;
  },

  // CUSTOMER PROFILES (FIREBASE PERSISTED)
  async getUserProfile(email: string): Promise<CustomerUser | null> {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'customer_profiles', cleanEmail);
        const docSnap = await withTimeout(getDoc(docRef));
        if (docSnap.exists()) {
          return docSnap.data() as CustomerUser;
        }
      } catch (e) {
        console.warn("Firestore getUserProfile fallback:", e);
      }
    }

    // Fallback to local storage
    const profiles = getLocal<Record<string, CustomerUser>>(LOCAL_STORAGE_KEYS.PROFILES, {});
    return profiles[cleanEmail] || null;
  },

  async saveUserProfile(user: CustomerUser): Promise<CustomerUser> {
    const cleanEmail = user.email.toLowerCase().trim();
    const updatedUser = { ...user, email: cleanEmail };

    // Local Storage save
    const profiles = getLocal<Record<string, CustomerUser>>(LOCAL_STORAGE_KEYS.PROFILES, {});
    profiles[cleanEmail] = updatedUser;
    setLocal(LOCAL_STORAGE_KEYS.PROFILES, profiles);
    localStorage.setItem('mc_customer_session', JSON.stringify(updatedUser));

    // Firebase Firestore sync
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'customer_profiles', cleanEmail), updatedUser, { merge: true });
      } catch (e) {
        console.warn("Firestore saveUserProfile fallback:", e);
      }
    }

    return updatedUser;
  }
};
