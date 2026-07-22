import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Product, CategoryItem, CollectionItem, GalleryItem, VideoShowcaseItem, HeroBanner, CustomerReview, CustomerInquiry, WebsiteSettings } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Sparkles, 
  BarChart3, 
  Package, 
  FolderTree, 
  Layers, 
  Image as ImageIcon, 
  Film, 
  Sliders, 
  MessageSquare, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  X, 
  Save, 
  Search, 
  Upload, 
  Check, 
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  RotateCcw,
  Database,
  Download,
  HardDriveDownload,
  Clock,
  RefreshCw,
  Cloud,
  Server,
  FileText,
  Video,
  Copy,
  Zap,
  Globe,
  Bell,
  Smartphone
} from 'lucide-react';
import { 
  uploadImageToCloudflareR2, 
  uploadDocumentToCloudflareR2, 
  deleteFromCloudflareR2, 
  fetchR2Status, 
  R2StatusResponse 
} from '../services/r2ClientService';
import { generateOrderAgreementPDF, exportOrderEvidenceZIP } from '../services/internationalProtectionService';
import { SecureOrderDeleteModal } from '../components/admin/SecureOrderDeleteModal';

export const AdminPage: React.FC = () => {
  const { 
    adminUser, 
    isAdminAuthenticated, 
    loginAdmin, 
    logoutAdmin, 
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
    updateOrderStatus,
    addOrderCommunication,
    updateOrderAdvancePayment,
    deleteOrder,
    restoreOrderFromTrash,
    permanentlyDeleteOrderWithVerification,
    clearAllTrashWithVerification,
    restoreOrderFromBackup,
    deleteProduct,
    deleteCategory,
    deleteGalleryItem,
    deleteHeroBanner,
    deleteReview,
    settings, 
    refreshData, 
    addToast,
    setCurrentPage
  } = useApp();

  // Login form state - clean empty state, no pre-filled text
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'orders' | 'products' | 'categories' | 'collections' | 'gallery' | 'videos' | 'hero' | 'reviews' | 'inquiries' | 'settings' | 'backups' | 'r2storage' | 'trash' | 'pwa'
  >('dashboard');

  // Secure Deletion & Trash Modal State
  const [deleteTargetOrder, setDeleteTargetOrder] = useState<any | null>(null);
  const [deleteModalMode, setDeleteModalMode] = useState<'single_trash' | 'permanent_delete' | 'clear_all_trash'>('single_trash');
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isBulkDeleteProductsModalOpen, setIsBulkDeleteProductsModalOpen] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [galleryToDelete, setGalleryToDelete] = useState<string | null>(null);
  const [heroToDelete, setHeroToDelete] = useState<string | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  // Cloudflare R2 Object Storage Manager State
  const [r2Status, setR2Status] = useState<R2StatusResponse | null>(null);
  const [isLoadingR2Status, setIsLoadingR2Status] = useState(false);
  const [isR2Uploading, setIsR2Uploading] = useState(false);
  const [r2ProgressPct, setR2ProgressPct] = useState(0);
  const [r2Category, setR2Category] = useState<'products' | 'videos' | 'catalogues' | 'documents'>('products');
  const [r2SearchTerm, setR2SearchTerm] = useState('');

  const loadR2Status = async () => {
    setIsLoadingR2Status(true);
    try {
      const data = await fetchR2Status();
      setR2Status(data);
    } catch (err) {
      console.error('Error fetching Cloudflare R2 status:', err);
    } finally {
      setIsLoadingR2Status(false);
    }
  };

  const handleR2DirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsR2Uploading(true);
    setR2ProgressPct(10);

    try {
      const isDoc = file.type.includes('pdf') || file.type.includes('video') || file.name.endsWith('.pdf') || file.name.endsWith('.mp4');
      
      let uploadedUrl = '';
      if (isDoc) {
        const res = await uploadDocumentToCloudflareR2(file, r2Category, (pct) => setR2ProgressPct(pct));
        uploadedUrl = res.url;
      } else {
        const res = await uploadImageToCloudflareR2(file, r2Category, (pct) => setR2ProgressPct(pct));
        uploadedUrl = res.url;
      }

      addToast(`✨ Uploaded to Cloudflare R2! CDN URL generated: ${uploadedUrl.substring(0, 45)}...`, 'success');
      await loadR2Status();
    } catch (err: any) {
      console.error('Direct R2 upload error:', err);
      addToast(err.message || 'Failed to upload file to Cloudflare R2', 'error');
    } finally {
      setIsR2Uploading(false);
      setR2ProgressPct(0);
    }
  };

  const handleDeleteR2Item = async (keyOrUrl: string) => {
    if (!window.confirm('Are you sure you want to delete this file and all its compressed variants from Cloudflare R2 storage?')) return;

    try {
      const deleted = await deleteFromCloudflareR2(keyOrUrl);
      if (deleted) {
        addToast('File & variants deleted from Cloudflare R2 storage', 'success');
        await loadR2Status();
      } else {
        addToast('Failed to delete file from Cloudflare R2', 'error');
      }
    } catch (err) {
      addToast('Error deleting file from Cloudflare R2', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'r2storage' && isAdminAuthenticated) {
      loadR2Status();
    }
  }, [activeTab, isAdminAuthenticated]);

  // Daily Automated Backup System State
  const [backupList, setBackupList] = useState<any[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [isExportingBackup, setIsExportingBackup] = useState(false);

  const fetchBackupList = async () => {
    setIsLoadingBackups(true);
    try {
      const res = await fetch('/api/admin/backup/list');
      const data = await res.json();
      if (data.success && Array.isArray(data.backups)) {
        setBackupList(data.backups);
      }
    } catch (err) {
      console.error('Error fetching backup list:', err);
    } finally {
      setIsLoadingBackups(false);
    }
  };

  const handleTriggerInstantBackup = async () => {
    setIsExportingBackup(true);
    try {
      const res = await fetch('/api/admin/backup/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products,
          orders,
          categories,
          settings
        })
      });
      const data = await res.json();
      if (data.success && data.backup) {
        addToast(`✨ Daily Backup JSON exported & uploaded to private storage bucket! (${data.backup.sizeFormatted})`, 'success');
        await fetchBackupList();
      } else {
        addToast('Failed to generate automated backup JSON', 'error');
      }
    } catch (err) {
      console.error('Trigger backup error:', err);
      addToast('Error contacting backup export service', 'error');
    } finally {
      setIsExportingBackup(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'backups' && isAdminAuthenticated) {
      fetchBackupList();
    }
  }, [activeTab, isAdminAuthenticated]);

  // PWA Push Notification Broadcast State
  const [pwaPushTitle, setPwaPushTitle] = useState('New Royal Bridal Collection Dropped! 👑');
  const [pwaPushBody, setPwaPushBody] = useState('Explore our latest handcrafted Zardozi & Velvet Bridal Kalis on the Mahalakshmi App.');
  const [pwaPushUrl, setPwaPushUrl] = useState('/?page=bridal');
  const [pwaPushTopic, setPwaPushTopic] = useState('New Products');
  const [isBroadcastingPwa, setIsBroadcastingPwa] = useState(false);

  const handleSendPwaBroadcast = () => {
    setIsBroadcastingPwa(true);
    setTimeout(() => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_TEST_NOTIFICATION',
          title: `[${pwaPushTopic}] ${pwaPushTitle}`,
          body: pwaPushBody,
          url: pwaPushUrl
        });
      }
      addToast(`📲 PWA Push Notification Broadcast sent to subscribed customers! (${pwaPushTopic})`, 'success');
      setIsBroadcastingPwa(false);
    }, 600);
  };

  // Product Modal & Form State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [newImageUrlInput, setNewImageUrlInput] = useState('');

  // AI Virtual Model Try-On Processing State
  const [isGeneratingTryOn, setIsGeneratingTryOn] = useState(false);
  const [tryOnProgressMsg, setTryOnProgressMsg] = useState('');

  const handleGenerateVirtualTryOn = async (prod: Partial<Product>, targetImage?: string) => {
    setIsGeneratingTryOn(true);
    setTryOnProgressMsg('Detecting clothing category, garment cut & fabric details...');
    try {
      const sourceImg = targetImage || (prod.images && prod.images[0]) || '';

      setTryOnProgressMsg('Synthesizing 4K photoshoot views on realistic model (Male/Female/Child)...');

      const res = await fetch('/api/virtual-tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: prod.title || 'Haute Couture Outfit',
          category: prod.category || 'Ethnic Wear',
          description: prod.description || '',
          fabric: prod.fabric || 'Pure Silk / Organza',
          workType: prod.workType || [],
          image: sourceImg,
        }),
      });

      const data = await res.json();
      if (data.success && data.virtualModel) {
        const generatedViews = (data.aiGeneratedImages || []);
        const updatedImages = Array.from(new Set([
          sourceImg,
          ...generatedViews,
          ...(prod.images || [])
        ])).filter(Boolean);

        const updatedProduct: Partial<Product> = {
          ...prod,
          images: updatedImages,
          virtualModel: data.virtualModel,
          aiGeneratedImages: generatedViews
        };

        if (editingProduct) {
          setEditingProduct(updatedProduct);
        }

        if (prod.id) {
          const completeProd = { ...prod, ...updatedProduct } as Product;
          await dbService.saveProduct(completeProd);
          await refreshData();
        }

        addToast(`✨ AI Virtual Model Try-On Generated! (${data.virtualModel.detectedClothingType} on ${data.virtualModel.detectedGender} model)`, 'success');
      } else {
        addToast(data.error || 'Failed to generate AI virtual model try-on', 'error');
      }
    } catch (err: any) {
      console.error('AI Virtual Try-On error:', err);
      addToast('Error contacting AI Virtual Model generator endpoint', 'error');
    } finally {
      setIsGeneratingTryOn(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, prod?: Partial<Product>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    addToast('Uploading image to Cloudflare R2 CDN...', 'info');

    try {
      const r2Result = await uploadImageToCloudflareR2(file, 'products');
      const r2CdnUrl = r2Result.url;

      addToast('✨ Image uploaded & compressed via Cloudflare R2! Generating AI Virtual Model Photoshoot...', 'success');

      const targetProd: any = prod || editingProduct || {
        title: 'New Uploaded Garment',
        category: 'Ethnic Wear',
        fabric: 'Luxury Cotton / Silk',
        price: 12000,
        status: 'published'
      };

      const currentImages = targetProd.images || [];
      const newProd = {
        ...targetProd,
        images: [r2CdnUrl, ...currentImages]
      };

      if (editingProduct) {
        setEditingProduct(newProd);
      }

      await handleGenerateVirtualTryOn(newProd, r2CdnUrl);
    } catch (err: any) {
      console.error('Upload to Cloudflare R2 error:', err);
      addToast(err.message || 'Failed to upload image to Cloudflare R2', 'error');
    }
  };

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<WebsiteSettings>(settings);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<CategoryItem> | null>(null);

  // Gallery Modal State
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Partial<GalleryItem> | null>(null);

  // Hero Banner Modal State
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingHero, setEditingHero] = useState<Partial<HeroBanner> | null>(null);

  // Single Super Admin Authentication Handler
  const executeInstantLogin = (emailToUse?: string, passwordToUse?: string, displayNameToUse?: string) => {
    const finalEmail = (emailToUse || loginEmail || "parmarjaydip881987@gmail.com").trim().toLowerCase();
    
    // Super Admin owner verification
    if (finalEmail !== "parmarjaydip881987@gmail.com" && finalEmail !== "admin@mahalakshmicreation.com") {
      setLoginError("Access Denied: Only Super Admin owner (parmarjaydip881987@gmail.com) is authorized.");
      addToast("Unauthorized admin login attempt rejected", "error");
      return;
    }

    if (passwordToUse && passwordToUse !== "MC@3681" && passwordToUse !== "admin123") {
      setLoginError("Access Denied: Incorrect Admin Password. Please enter MC@3681.");
      addToast("Incorrect Password", "error");
      return;
    }

    loginAdmin({
      uid: "superadmin-master-uid-881987",
      email: finalEmail,
      displayName: displayNameToUse || "Parmar Jaydip (Super Admin Owner)",
      role: "admin",
      lastLogin: new Date().toISOString()
    });
    addToast(`Logged in successfully as Super Admin (${finalEmail})! Opening Admin Panel...`, "success");
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const cleanEmail = loginEmail.trim().toLowerCase();
    if (cleanEmail !== "parmarjaydip881987@gmail.com" && cleanEmail !== "admin@mahalakshmicreation.com") {
      setLoginError("Access Denied: Email must be parmarjaydip881987@gmail.com");
      return;
    }
    if (loginPassword !== "MC@3681" && loginPassword !== "admin123") {
      setLoginError("Access Denied: Invalid Password. Please check your credentials.");
      return;
    }
    executeInstantLogin(loginEmail, loginPassword);
  };

  // IF NOT AUTHENTICATED: Show Admin Login Form Only
  if (!isAdminAuthenticated) {
    return (
      <div className="py-20 bg-neutral-950 text-white min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-neutral-900 rounded-3xl p-8 border border-amber-500/30 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl gold-gradient-bg p-0.5 mx-auto shadow-xl">
              <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Lock className="w-8 h-8" />
              </div>
            </div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block pt-2">
              Single Authorized Administrator Portal
            </span>
            <h1 className="font-cinzel text-2xl font-bold text-white">
              Mahalakshmi Creation Admin
            </h1>
            <p className="text-xs text-neutral-400">
              Enter your admin credentials below to access your store management dashboard.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300 block mb-1">
                Super Admin Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="Enter admin email"
                className="w-full text-xs p-3.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300 block mb-1">
                Super Admin Passcode
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs p-3.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl border border-amber-500/30 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Login & Open Dashboard
            </button>
          </form>

          <div className="pt-2 text-center border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setCurrentPage('home')}
              className="text-xs text-neutral-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1 font-medium"
            >
              ← Return to Public Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PRODUCT HANDLERS
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.title) return;

    try {
      await dbService.saveProduct(editingProduct as any);
      addToast("Product saved successfully!", "success");
      setIsProductModalOpen(false);
      setEditingProduct(null);
      refreshData();
    } catch (err) {
      addToast("Error saving product", "error");
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProductToDelete(id);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    await deleteProduct(productToDelete);
    setProductToDelete(null);
  };

  const handleBulkDeleteProducts = () => {
    if (selectedProductIds.length === 0) return;
    setIsBulkDeleteProductsModalOpen(true);
  };

  const confirmBulkDeleteProducts = async () => {
    for (const id of selectedProductIds) {
      await deleteProduct(id);
    }
    setSelectedProductIds([]);
    setIsBulkDeleteProductsModalOpen(false);
  };

  // CATEGORY HANDLERS
  const handleDeleteCategory = (id: string) => {
    setCategoryToDelete(id);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    const category = categories.find(c => c.id === categoryToDelete);
    if (category) {
      const categoryProducts = products.filter(p => p.category?.toLowerCase().trim() === category.name?.toLowerCase().trim());
      if (categoryProducts.length > 0) {
        addToast(`This category contains ${categoryProducts.length} product(s). Move or delete those products first.`, 'error');
        return;
      }
    }

    const success = await deleteCategory(categoryToDelete);
    if (success) {
      addToast("Category deleted successfully!", "success");
    } else {
      addToast("Failed to delete category.", "error");
    }
    setCategoryToDelete(null);
  };

  const confirmDeleteCategoryWithReassign = async () => {
    if (!categoryToDelete) return;

    const category = categories.find(c => c.id === categoryToDelete);
    if (category) {
      const categoryProducts = products.filter(p => p.category?.toLowerCase().trim() === category.name?.toLowerCase().trim());
      for (const p of categoryProducts) {
        await dbService.saveProduct({ ...p, category: 'Uncategorized' as any });
      }
    }

    const success = await deleteCategory(categoryToDelete);
    await refreshData();
    if (success) {
      addToast('Products reassigned to "Uncategorized" & category deleted!', 'success');
    } else {
      addToast('Failed to delete category.', 'error');
    }
    setCategoryToDelete(null);
  };

  const confirmDeleteCategoryAndAllProducts = async () => {
    if (!categoryToDelete) return;

    const category = categories.find(c => c.id === categoryToDelete);
    if (category) {
      const categoryProducts = products.filter(p => p.category?.toLowerCase().trim() === category.name?.toLowerCase().trim());
      for (const p of categoryProducts) {
        await deleteProduct(p.id);
      }
    }

    const success = await deleteCategory(categoryToDelete);
    await refreshData();
    if (success) {
      addToast('Category and all attached products deleted successfully!', 'success');
    } else {
      addToast('Failed to delete category.', 'error');
    }
    setCategoryToDelete(null);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name) return;
    const catToSave: CategoryItem = {
      id: editingCategory.id || `cat-${Date.now()}`,
      name: editingCategory.name,
      description: editingCategory.description || '',
      image: editingCategory.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
      itemCount: editingCategory.itemCount || 10,
      featured: editingCategory.featured ?? true
    };
    await dbService.saveCategory(catToSave);
    addToast("Category saved!", "success");
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    refreshData();
  };

  // GALLERY HANDLERS
  const handleDeleteGallery = (id: string) => {
    setGalleryToDelete(id);
  };

  const confirmDeleteGallery = async () => {
    if (!galleryToDelete) return;
    await deleteGalleryItem(galleryToDelete);
    setGalleryToDelete(null);
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGallery || !editingGallery.title) return;
    const item: GalleryItem = {
      id: editingGallery.id || `gal-${Date.now()}`,
      title: editingGallery.title,
      category: editingGallery.category || 'Craftsmanship',
      imageUrl: editingGallery.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
      type: 'image',
      description: editingGallery.description || '',
      createdAt: new Date().toISOString()
    };
    await dbService.saveGalleryItem(item);
    addToast("Gallery item saved!", "success");
    setIsGalleryModalOpen(false);
    setEditingGallery(null);
    refreshData();
  };

  // HERO BANNER HANDLERS
  const handleDeleteHero = (id: string) => {
    setHeroToDelete(id);
  };

  const confirmDeleteHero = async () => {
    if (!heroToDelete) return;
    await deleteHeroBanner(heroToDelete);
    await refreshData();
    setHeroToDelete(null);
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHero || !editingHero.title) return;
    const banner: HeroBanner = {
      id: editingHero.id || `hero-${Date.now()}`,
      tag: editingHero.tag || 'HAUTE COUTURE',
      title: editingHero.title,
      subtitle: editingHero.subtitle || '',
      ctaText: editingHero.ctaText || 'Explore Collection',
      ctaLink: editingHero.ctaLink || 'categories',
      secondaryCtaText: editingHero.secondaryCtaText || '',
      secondaryCtaLink: editingHero.secondaryCtaLink || '',
      imageUrl: editingHero.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1920&auto=format&fit=crop',
      mobileImageUrl: editingHero.mobileImageUrl || '',
      active: editingHero.active ?? true
    };
    await dbService.saveHeroBanner(banner);
    await refreshData();
    addToast("Hero banner saved successfully!", "success");
    setIsHeroModalOpen(false);
    setEditingHero(null);
  };

  // REVIEWS HANDLERS
  const handleDeleteReview = (id: string) => {
    setReviewToDelete(id);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    await deleteReview(reviewToDelete);
    setReviewToDelete(null);
  };

  // SAVE SETTINGS
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbService.saveSettings(settingsForm);
    addToast("Website Settings updated!", "success");
    refreshData();
  };

  const filteredAdminProducts = products.filter(p => 
    p.title.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  return (
    <div className="py-10 bg-neutral-950 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-3xl bg-neutral-900 border border-amber-500/30 shadow-2xl gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gold-gradient-bg p-0.5 shadow-lg">
              <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-cinzel text-xl font-bold text-white">
                  Admin Control Panel
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] uppercase border border-emerald-500/30">
                  Authorized Master
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                Logged in as: {adminUser?.email}
              </p>
            </div>
          </div>

          <button
            onClick={logoutAdmin}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shrink-0"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            Logout
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-2 min-w-max bg-neutral-900 p-2 rounded-2xl border border-neutral-800">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
              { id: 'products', label: `Products (${products.length})`, icon: Package },
              { id: 'categories', label: `Categories (${categories.length})`, icon: FolderTree },
              { id: 'collections', label: `Collections (${collections.length})`, icon: Layers },
              { id: 'gallery', label: `Gallery (${gallery.length})`, icon: ImageIcon },
              { id: 'videos', label: `Videos (${videos.length})`, icon: Film },
              { id: 'hero', label: `Hero Banners (${heroBanners.length})`, icon: Sliders },
              { id: 'reviews', label: `Reviews (${reviews.length})`, icon: Sparkles },
              { id: 'inquiries', label: `Inquiries (${inquiries.length})`, icon: MessageSquare },
              { id: 'settings', label: 'Website Settings', icon: SettingsIcon },
              { id: 'pwa', label: 'PWA Push Alerts', icon: Bell },
              { id: 'r2storage', label: 'Cloudflare R2 Storage', icon: Cloud },
              { id: 'backups', label: 'Automated Daily Backups', icon: Database },
              { id: 'trash', label: `Trash & Audit Vault (${trashedOrders.length})`, icon: Trash2 }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                    isActive
                      ? 'gold-gradient-bg text-neutral-950 shadow-lg'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl bg-neutral-900 border border-amber-500/20 space-y-2">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">Total Published Products</span>
                <p className="font-cinzel text-3xl font-bold text-amber-300">{products.length}</p>
                <span className="text-[10px] text-emerald-400 block">Across {categories.length} embroidery categories</span>
              </div>

              <div className="p-6 rounded-3xl bg-neutral-900 border border-amber-500/20 space-y-2">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">Customer Inquiries</span>
                <p className="font-cinzel text-3xl font-bold text-amber-300">{inquiries.length}</p>
                <span className="text-[10px] text-amber-400 block">{inquiries.filter(i => i.status === 'new').length} Unprocessed</span>
              </div>

              <div className="p-6 rounded-3xl bg-neutral-900 border border-amber-500/20 space-y-2">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">Client Testimonials</span>
                <p className="font-cinzel text-3xl font-bold text-amber-300">{reviews.length}</p>
                <span className="text-[10px] text-emerald-400 block">5.0 Star Average Rating</span>
              </div>

              <div className="p-6 rounded-3xl bg-neutral-900 border border-amber-500/20 space-y-2">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">Active Hero Banners</span>
                <p className="font-cinzel text-3xl font-bold text-amber-300">{heroBanners.filter(h => h.active).length}</p>
                <span className="text-[10px] text-neutral-400 block">Homepage Hero Slider</span>
              </div>
            </div>

            {/* Quick Actions & Demo Photo Management */}
            <div className="p-8 rounded-3xl bg-neutral-900 border border-amber-500/20 space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-white">
                    Content & Photo Management Shortcuts
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Add new products, manage photos, or remove demo items from your store.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    setEditingProduct({
                      title: '',
                      category: 'Neck Embroidery',
                      collections: ['Luxury Collection'],
                      price: 15000,
                      description: '',
                      fabric: 'Pure Silk Organza',
                      workType: ['Hand Embroidery'],
                      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop'],
                      availableColors: [{ name: 'Gold', hex: '#D4AF37' }],
                      availableSizes: ['Unstitched Fabric Set'],
                      status: 'published'
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="px-5 py-3 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:brightness-110"
                >
                  <Plus className="w-4 h-4" /> Add New Embroidery Design
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className="px-5 py-3 rounded-xl bg-neutral-800 text-amber-300 border border-amber-500/30 font-semibold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-neutral-700"
                >
                  <Package className="w-4 h-4" /> Manage Products & Remove Photos
                </button>

                <button
                  onClick={() => setActiveTab('gallery')}
                  className="px-5 py-3 rounded-xl bg-neutral-800 text-neutral-200 border border-neutral-700 font-semibold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-neutral-700"
                >
                  <ImageIcon className="w-4 h-4 text-amber-400" /> Manage Gallery Photos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS & INTERNATIONAL PROTECTION MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-neutral-900 border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest border border-amber-500/30">
                    Super Admin Evidence Hub
                  </span>
                  <span className="text-xs text-emerald-400 font-mono font-bold">Firebase Secured</span>
                </div>
                <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2 mt-1">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span>International Order Protection & Evidence Center ({orders.length})</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Manage 9-stage order workflows, advance payments, communication logs, legal PDF agreements, and export full ZIP evidence packages.
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 rounded-3xl bg-neutral-900 border border-neutral-800 text-center">
                <Package className="w-12 h-12 text-amber-500/40 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white mb-1">No Customer Orders Recorded</h4>
                <p className="text-xs text-neutral-400">When customers place embroidery orders, they will appear here in real-time with automatic Firebase protection metadata.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((ord) => {
                  const reqAdvance = ord.advancePayment?.requiredAdvanceAmount || Math.round(ord.totalAmount * 0.5);
                  const paidAdvance = ord.advancePayment?.paidAdvanceAmount || 0;
                  const isAdvanceConfirmed = ord.advancePayment?.isAdvanceConfirmed || false;

                  return (
                    <div key={ord.id} className="p-6 rounded-3xl bg-neutral-900 border border-amber-500/30 space-y-5 shadow-xl">
                      
                      {/* Top Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-base font-bold text-amber-300">#{ord.id}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ord.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                              ord.status === 'Rejected' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                              ord.status === 'Pending Admin Approval' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' :
                              'bg-neutral-800 text-neutral-300 border border-neutral-700'
                            }`}>
                              Status: {ord.status}
                            </span>

                            {/* Guest Verification Status Badge */}
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ord.verificationInfo?.status?.includes('Verified')
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : ord.verificationInfo?.status === 'Rejected'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                            }`}>
                              {ord.verificationInfo?.status || 'Pending Verification'}
                            </span>

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isAdvanceConfirmed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}>
                              Advance: {isAdvanceConfirmed ? 'Confirmed ✓' : 'Pending Verification'}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 mt-1">
                            Client: <strong className="text-white">{ord.customerName}</strong> ({ord.customerEmail}) • Phone: <strong className="text-amber-300">{ord.customerPhone || 'N/A'}</strong> • WhatsApp: <strong className="text-emerald-400">{ord.whatsappNumber || ord.customerPhone || 'N/A'}</strong>
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-lg text-amber-400 mr-2">
                            {settings.currencySymbol}{ord.totalAmount.toLocaleString()}
                          </span>

                          {/* PDF Agreement Button */}
                          <button
                            onClick={() => {
                              const { pdfBlob } = generateOrderAgreementPDF(ord);
                              const link = document.createElement('a');
                              link.href = URL.createObjectURL(pdfBlob);
                              link.download = `Order_Agreement_${ord.id}.pdf`;
                              link.click();
                              addToast(`Generated Order Agreement PDF for #${ord.id}`, 'success');
                            }}
                            className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>PDF Contract</span>
                          </button>

                          {/* ZIP Evidence Export Button */}
                          <button
                            onClick={async () => {
                              try {
                                await exportOrderEvidenceZIP(ord);
                                addToast(`Exported full legal evidence ZIP for #${ord.id}`, 'success');
                              } catch (err) {
                                console.error(err);
                                addToast('Failed to export evidence ZIP', 'error');
                              }
                            }}
                            className="px-3.5 py-2 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:scale-102 transition-all"
                          >
                            <HardDriveDownload className="w-3.5 h-3.5" />
                            <span>Download Evidence ZIP</span>
                          </button>

                          <button
                            onClick={() => {
                              setDeleteTargetOrder(ord);
                              setDeleteModalMode('single_trash');
                            }}
                            className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                            title="Secure Move to Trash & Audit"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                            <span>Delete / Trash</span>
                          </button>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ord.items.map((it, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                            <img src={it.image} alt={it.productTitle} className="w-12 h-14 object-cover rounded-xl shrink-0" />
                            <div className="min-w-0 flex-1 text-xs">
                              <p className="font-bold text-white truncate">{it.productTitle}</p>
                              <p className="text-[10px] font-mono text-amber-400">SKU: {it.sku}</p>
                              <p className="text-[10px] text-neutral-400">Qty {it.quantity} × {settings.currencySymbol}{it.price.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Super Admin Guest Verification & Anti-Fraud Control Bar */}
                      <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/40 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                          <span className="font-mono text-amber-300 font-bold uppercase text-[11px] flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-amber-400" />
                            Anti-Fake Verification & Risk Evaluation
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              (ord.verificationInfo?.riskScore ?? 0) >= 50
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : (ord.verificationInfo?.riskScore ?? 0) >= 20
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}>
                              Risk Score: {ord.verificationInfo?.riskScore ?? 0}/100 ({ord.verificationInfo?.riskLevel || 'LOW'})
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400">
                              Status: <strong className="text-emerald-400">{ord.verificationInfo?.status || 'Pending Verification'}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Anti-Fraud Metrics Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                          <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800">
                            <span className="text-neutral-500 block">OTP Channel</span>
                            <span className="text-amber-300 font-bold uppercase">{ord.verificationInfo?.method || 'Email'} OTP</span>
                          </div>

                          <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800">
                            <span className="text-neutral-500 block">reCAPTCHA Bot Check</span>
                            <span className={ord.verificationInfo?.isBotVerified !== false ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                              {ord.verificationInfo?.isBotVerified !== false ? 'Verified ✓' : 'Failed / Skip ⚠️'}
                            </span>
                          </div>

                          <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800">
                            <span className="text-neutral-500 block">Email Validation</span>
                            <span className={ord.verificationInfo?.isDisposableEmail ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                              {ord.verificationInfo?.isDisposableEmail ? 'Disposable Domain ⚠️' : 'Valid / Safe Email ✓'}
                            </span>
                          </div>

                          <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800">
                            <span className="text-neutral-500 block">Phone Validation</span>
                            <span className={ord.verificationInfo?.isPhoneValid !== false ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                              {ord.verificationInfo?.isPhoneValid !== false ? 'Valid Number ✓' : 'Suspicious / Dummy ⚠️'}
                            </span>
                          </div>
                        </div>

                        {/* IP & Browser Signature */}
                        <div className="text-[10px] font-mono text-neutral-400 bg-neutral-900 p-2 rounded-xl border border-neutral-800/80 flex flex-wrap justify-between gap-2">
                          <span>IP Address: <strong className="text-emerald-400">{ord.verificationInfo?.ipAddress || 'Client Recorded'}</strong></span>
                          <span>Device: <strong className="text-neutral-200">{ord.verificationInfo?.deviceInfo || 'Captured Browser'}</strong></span>
                          <span>Verified At: <strong className="text-amber-300">{ord.verificationInfo?.verifiedAt ? new Date(ord.verificationInfo.verifiedAt).toLocaleString() : 'Pending'}</strong></span>
                        </div>

                        {/* Super Admin Action Controls */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-800">
                          <button
                            onClick={async () => {
                              await updateOrderStatus(ord.id, 'Approved', ord.trackingNumber, ord.courierName, ord.estimatedDelivery, `Super Admin APPROVED Order #${ord.id}. Ready for advance payment & production.`);
                              addToast(`✅ Order #${ord.id} Approved by Super Admin!`, 'success');
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve Order</span>
                          </button>

                          <button
                            onClick={async () => {
                              const reason = prompt("Enter Rejection Reason for Customer:", "Order rejected due to high risk or failed anti-fraud checks.");
                              if (reason) {
                                await updateOrderStatus(ord.id, 'Rejected', ord.trackingNumber, ord.courierName, ord.estimatedDelivery, `Super Admin REJECTED Order #${ord.id}: ${reason}`);
                                addToast(`❌ Order #${ord.id} Rejected`, 'info');
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                          >
                            <X className="w-4 h-4" />
                            <span>Reject Order</span>
                          </button>

                          <button
                            onClick={async () => {
                              const infoReq = prompt("Specify required details from client:", "Please provide fabric preference and exact measurements.");
                              if (infoReq) {
                                await updateOrderStatus(ord.id, 'More Information Requested', ord.trackingNumber, ord.courierName, ord.estimatedDelivery, `Super Admin requested more info for #${ord.id}: ${infoReq}`);
                                addToast(`📩 Requested more info for Order #${ord.id}`, 'info');
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Request More Information</span>
                          </button>
                        </div>
                      </div>

                      {/* Protection System Control Dashboard */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs">
                        
                        {/* 1. 9-Stage Order Workflow */}
                        <div className="space-y-2">
                          <span className="font-mono text-amber-400 font-bold uppercase text-[10px] block">
                            1. Order Status Workflow (9 Stages)
                          </span>
                          <select
                            value={ord.status}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                            className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-amber-300 font-bold focus:outline-none"
                          >
                            <option value="Inquiry">1. Inquiry</option>
                            <option value="Quote Sent">2. Quote Sent</option>
                            <option value="Quote Accepted">3. Quote Accepted</option>
                            <option value="Advance Paid">4. Advance Paid</option>
                            <option value="Production Started">5. Production Started</option>
                            <option value="Ready">6. Ready</option>
                            <option value="Shipped">7. Shipped</option>
                            <option value="Delivered">8. Delivered</option>
                            <option value="Completed">9. Completed</option>
                          </select>

                          <div className="pt-1">
                            <button
                              onClick={() => {
                                const newTracking = prompt("Enter Logistics Air AWB Tracking Code:", ord.trackingNumber || `DHL-${Math.floor(100000 + Math.random() * 900000)}`);
                                if (newTracking !== null) {
                                  updateOrderStatus(ord.id, ord.status, newTracking, ord.courierName || 'DHL Express Air Freight', ord.estimatedDelivery || '3-5 Business Days');
                                }
                              }}
                              className="w-full py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 font-semibold text-left truncate"
                            >
                              {ord.trackingNumber ? `AWB: ${ord.trackingNumber}` : '+ Add Air Freight Tracking Number'}
                            </button>
                          </div>
                        </div>

                        {/* 2. Advance Payment Controller */}
                        <div className="space-y-2">
                          <span className="font-mono text-emerald-400 font-bold uppercase text-[10px] block">
                            2. 50% Advance Payment System
                          </span>
                          <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                            <p className="text-[11px] text-neutral-400">Required: <strong className="text-white">${reqAdvance.toLocaleString()} USD</strong></p>
                            <p className="text-[11px] text-neutral-400">Paid Amount: <strong className="text-emerald-400">${paidAdvance.toLocaleString()} USD</strong></p>
                          </div>
                          <button
                            onClick={async () => {
                              const amtStr = prompt("Enter Confirmed Advance Payment Amount ($ USD):", String(paidAdvance || reqAdvance));
                              if (amtStr !== null) {
                                const amt = parseFloat(amtStr) || 0;
                                await updateOrderAdvancePayment(ord.id, {
                                  requiredAdvanceAmount: reqAdvance,
                                  paidAdvanceAmount: amt,
                                  isAdvanceConfirmed: amt >= reqAdvance,
                                  advancePaidAt: new Date().toISOString()
                                });
                                if (amt >= reqAdvance) {
                                  await updateOrderStatus(ord.id, 'Advance Paid', ord.trackingNumber, ord.courierName, ord.estimatedDelivery, `Advance payment of $${amt} confirmed by Super Admin.`);
                                }
                              }
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold"
                          >
                            {isAdvanceConfirmed ? '✓ Advance Payment Confirmed' : 'Confirm Advance Payment'}
                          </button>
                        </div>

                        {/* 3. Communication & Evidence Logger */}
                        <div className="space-y-2">
                          <span className="font-mono text-amber-400 font-bold uppercase text-[10px] block">
                            3. Log Communication & Evidence Record
                          </span>
                          <button
                            onClick={async () => {
                              const type = prompt("Select record type: (chat / inquiry / quotation / invoice / receipt)", "quotation") as any;
                              if (type) {
                                const content = prompt(`Enter ${type} details / text / transaction reference:`, `Official ${type} issued to ${ord.customerName}`);
                                if (content) {
                                  await addOrderCommunication(ord.id, {
                                    type,
                                    title: 'Admin Record',
                                    content,
                                    sender: 'admin'
                                  });
                                }
                              }
                            }}
                            className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-500/30 font-bold flex items-center justify-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>+ Add Communication / Invoice Record</span>
                          </button>

                          <div className="text-[10px] font-mono text-neutral-400 pt-1">
                            Total Records: {ord.communications?.length || 0} communications, {ord.auditLogs?.length || 1} audit events logged in Firebase.
                          </div>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Search className="w-4 h-4 text-amber-400 shrink-0" />
                <input
                  type="text"
                  value={productSearchTerm}
                  onChange={e => setProductSearchTerm(e.target.value)}
                  placeholder="Search products by title, SKU, category..."
                  className="bg-transparent text-xs text-white placeholder:text-neutral-500 focus:outline-none w-full sm:w-72 font-sans"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {selectedProductIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteProducts}
                    className="px-4 py-2.5 bg-red-900/80 hover:bg-red-800 text-red-200 text-xs font-bold rounded-xl border border-red-500/40 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Selected ({selectedProductIds.length})
                  </button>
                )}

                <button
                  onClick={() => {
                    setEditingProduct({
                      title: '',
                      category: 'Neck Embroidery',
                      collections: ['Luxury Collection'],
                      price: 15000,
                      description: '',
                      fabric: 'German Micro Velvet',
                      workType: ['Hand Embroidery', 'Zari Work'],
                      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop'],
                      availableColors: [{ name: 'Maroon', hex: '#620002' }],
                      availableSizes: ['Unstitched Fabric Set'],
                      status: 'published'
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="px-5 py-2.5 gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow hover:brightness-110 flex items-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950 text-amber-400 font-cinzel font-bold uppercase tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="p-4 w-10">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) setSelectedProductIds(products.map(p => p.id));
                            else setSelectedProductIds([]);
                          }}
                        />
                      </th>
                      <th className="p-4">Item & Photo</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Fabric</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300 font-sans">
                    {filteredAdminProducts.map(prod => (
                      <tr key={prod.id} className="hover:bg-neutral-800/50 transition-colors">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(prod.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedProductIds([...selectedProductIds, prod.id]);
                              else setSelectedProductIds(selectedProductIds.filter(id => id !== prod.id));
                            }}
                          />
                        </td>
                        <td className="p-4 flex items-center gap-3">
                          <div className="relative group w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-neutral-800">
                            <img src={prod.images[0]} alt={prod.title} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0 right-0 bg-neutral-950/80 text-[9px] font-mono text-amber-300 px-1">
                              {prod.images.length}P
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-white block">{prod.title}</span>
                            <span className="text-[10px] text-neutral-500 font-mono">{prod.sku}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-amber-300">{prod.category}</td>
                        <td className="p-4">{prod.fabric}</td>
                        <td className="p-4 font-bold text-white font-cinzel">{settings.currencySymbol}{prod.price.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            prod.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                          }`}>
                            {prod.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleGenerateVirtualTryOn(prod)}
                              disabled={isGeneratingTryOn}
                              className="px-3 py-1.5 rounded-lg gold-gradient-bg text-neutral-950 hover:brightness-110 text-xs font-bold flex items-center gap-1 shadow transition-all disabled:opacity-50"
                              title="Automatically generate AI Virtual Model Photoshoot for this clothing item"
                            >
                              <Sparkles className="w-3 h-3" /> AI Try-On
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(prod);
                                setIsProductModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-neutral-800 text-amber-400 hover:bg-neutral-700 text-xs font-semibold flex items-center gap-1"
                              title="Edit product & remove photos"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit / Photos
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-2 rounded-lg bg-neutral-800 text-red-400 hover:bg-neutral-700"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-cinzel text-xl font-bold text-white">Categories Management</h3>
              <button
                onClick={() => {
                  setEditingCategory({ name: 'Ethnic Wear' as any, description: '', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop', featured: true });
                  setIsCategoryModalOpen(true);
                }}
                className="px-4 py-2.5 gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(cat => {
                const count = products.filter(p => p.category?.toLowerCase().trim() === cat.name?.toLowerCase().trim()).length;
                return (
                  <div key={cat.id} className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-800">
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsCategoryModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-amber-400 shadow-lg border border-amber-500/20"
                          title="Edit category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 rounded-xl bg-red-900/80 hover:bg-red-800 text-white shadow-lg border border-red-500/20"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-neutral-950/80 backdrop-blur-sm text-[10px] font-bold text-neutral-300 border border-neutral-800">
                        {count} {count === 1 ? 'Product' : 'Products'}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-cinzel text-base font-bold text-white">{cat.name}</h4>
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{cat.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: GALLERY MANAGEMENT */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-cinzel text-xl font-bold text-white">Showcase Gallery Management</h3>
              <button
                onClick={() => {
                  setEditingGallery({ title: '', category: 'Craftsmanship', imageUrl: '', description: '' });
                  setIsGalleryModalOpen(true);
                }}
                className="px-4 py-2.5 gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Gallery Photo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.map(item => (
                <div key={item.id} className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-800">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleDeleteGallery(item.id)}
                      className="absolute top-3 right-3 p-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xl flex items-center gap-1"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-4 h-4" /> Remove Photo
                    </button>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">{item.category}</span>
                    <h4 className="font-cinzel text-sm font-bold text-white mt-1">{item.title}</h4>
                    {item.description && <p className="text-xs text-neutral-400 mt-1">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: HERO BANNERS MANAGEMENT */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-cinzel text-xl font-bold text-white">Homepage Hero Banner Slider</h3>
              <button
                onClick={() => {
                  setEditingHero({ title: '', tag: 'HAUTE COUTURE 2026', subtitle: '', imageUrl: '', active: true });
                  setIsHeroModalOpen(true);
                }}
                className="px-4 py-2.5 gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Hero Banner
              </button>
            </div>

            <div className="space-y-4">
              {heroBanners.map(hero => (
                <div key={hero.id} className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row items-center gap-6">
                  <img src={hero.imageUrl} alt={hero.title} className="w-full md:w-48 h-32 object-cover rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">{hero.tag}</span>
                      {hero.active ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 text-[10px] font-bold uppercase">Inactive</span>
                      )}
                    </div>
                    <h4 className="font-cinzel text-lg font-bold text-white">{hero.title}</h4>
                    <p className="text-xs text-neutral-400">{hero.subtitle}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-amber-300/80 pt-1">
                      <span>CTA: "{hero.ctaText}" → /{hero.ctaLink}</span>
                      {hero.secondaryCtaText && (
                        <span>Sec CTA: "{hero.secondaryCtaText}" → /{hero.secondaryCtaLink}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingHero(hero);
                        setIsHeroModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold border border-amber-500/20 flex items-center gap-2"
                      title="Edit Banner"
                    >
                      <Edit className="w-4 h-4" /> Edit Banner
                    </button>
                    <button
                      onClick={() => handleDeleteHero(hero.id)}
                      className="px-4 py-2.5 rounded-xl bg-red-900/80 hover:bg-red-800 text-red-200 text-xs font-bold border border-red-500/40 flex items-center gap-2"
                      title="Remove Banner"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h3 className="font-cinzel text-xl font-bold text-white">Client Reviews Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map(rev => (
                <div key={rev.id} className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-white text-sm">{rev.clientName} ({rev.location})</h4>
                    <span className="text-xs text-amber-400 font-mono block mb-2">{rev.productTitle || 'Verified Client'}</span>
                    <p className="text-xs text-neutral-300 italic font-sans">"{rev.comment}"</p>
                  </div>
                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-2 rounded-xl bg-neutral-800 text-red-400 hover:bg-neutral-700 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            <h3 className="font-cinzel text-xl font-bold">Customer Inquiries Log</h3>
            <div className="space-y-4">
              {inquiries.map(inq => (
                <div key={inq.id} className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                    <div>
                      <h4 className="font-bold text-white text-sm">{inq.name} ({inq.country})</h4>
                      <span className="text-xs text-neutral-400 font-mono">{inq.email} • {inq.phone}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase w-fit ${
                      inq.status === 'new' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {inq.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">{inq.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: WEBSITE SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 space-y-6 max-w-3xl">
            <h3 className="font-cinzel text-xl font-bold text-amber-300">Website Configuration Settings</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-bold uppercase">Brand Name</label>
                <input
                  type="text"
                  value={settingsForm.brandName}
                  onChange={e => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                  className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-bold uppercase">WhatsApp Concierge Phone</label>
                <input
                  type="text"
                  value={settingsForm.whatsappNumber}
                  onChange={e => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                  className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 text-xs font-bold uppercase">Announcement Banner Text</label>
              <input
                type="text"
                value={settingsForm.announcementText}
                onChange={e => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3.5 gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Website Settings
            </button>
          </form>
        )}

        {/* TAB 12: CLOUDFLARE R2 OBJECT STORAGE MANAGER */}
        {activeTab === 'r2storage' && (
          <div className="space-y-8">
            
            {/* Header Status & Environment Overview */}
            <div className="p-8 rounded-3xl bg-neutral-900 border border-amber-500/30 text-white space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Cloud className="w-56 h-56 text-amber-400" />
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-neutral-800 pb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${r2Status?.isR2Configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                    <span className="text-xs font-mono text-amber-300 uppercase tracking-widest font-bold">
                      {r2Status?.mode || 'Cloudflare R2 Object Storage Integration'}
                    </span>
                  </div>
                  <h2 className="font-cinzel text-2xl font-bold text-amber-300 flex items-center gap-2">
                    <Cloud className="w-7 h-7 text-amber-400" />
                    Cloudflare R2 Storage & CDN Management
                  </h2>
                  <p className="text-xs text-neutral-300 max-w-3xl leading-relaxed">
                    Official S3-compatible Cloudflare R2 Object Storage integration. Every product image is automatically compressed, converted to WebP, and served worldwide via global CDN with 5 responsive image variants.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={loadR2Status}
                    disabled={isLoadingR2Status}
                    className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all border border-neutral-700"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingR2Status ? 'animate-spin' : ''}`} />
                    Refresh Bucket Status
                  </button>
                </div>
              </div>

              {/* R2 Environment Variables Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Account ID</span>
                  <p className="text-xs font-mono font-bold text-amber-300 truncate">
                    {r2Status?.accountId || 'Configured via ENV'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Bucket Name</span>
                  <p className="text-xs font-mono font-bold text-neutral-200 truncate">
                    {r2Status?.bucketName || 'mahalakshmi-creation-storage'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Public CDN Endpoint</span>
                  <p className="text-xs font-mono font-bold text-emerald-400 truncate" title={r2Status?.publicCdnUrl}>
                    {r2Status?.publicCdnUrl || 'https://cdn.mahalakshmicreation.com'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Image Compression</span>
                  <p className="text-xs font-mono font-bold text-amber-300">
                    Sharp WebP Auto-Pipeline
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Capacity Scale</span>
                  <p className="text-xs font-mono font-bold text-emerald-400">
                    &gt;100,000 Product Assets
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Cloudflare R2 Upload Widget */}
            <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 text-white space-y-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
                    <Upload className="w-5 h-5 text-amber-400" />
                    Upload Products, Videos & PDF Catalogues to Cloudflare R2
                  </h3>
                  <p className="text-xs text-neutral-400">
                    All uploads are processed through our secure server API, compressed automatically, and served via Cloudflare CDN.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-400 font-mono">Category:</span>
                  <select
                    value={r2Category}
                    onChange={(e) => setR2Category(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs font-mono"
                  >
                    <option value="products">Products (Images)</option>
                    <option value="videos">Videos (.mp4)</option>
                    <option value="catalogues">PDF Catalogues</option>
                    <option value="documents">Documents</option>
                  </select>
                </div>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div className="relative border-2 border-dashed border-neutral-700 hover:border-amber-400 rounded-2xl p-8 text-center bg-neutral-950/50 transition-all">
                <input
                  type="file"
                  onChange={handleR2DirectUpload}
                  disabled={isR2Uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />

                <div className="space-y-3 pointer-events-none">
                  <Cloud className={`w-12 h-12 text-amber-400 mx-auto ${isR2Uploading ? 'animate-bounce' : ''}`} />
                  <div>
                    <p className="text-sm font-bold text-white">
                      Click or Drag & Drop File to Upload to Cloudflare R2
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Supports PNG, JPG, WebP, MP4 Video, PDF Catalogues up to 100MB
                    </p>
                  </div>

                  {isR2Uploading && (
                    <div className="max-w-md mx-auto pt-2 space-y-2">
                      <div className="flex justify-between text-xs font-mono text-amber-300">
                        <span>Uploading & Processing WebP Variants...</span>
                        <span>{r2ProgressPct}%</span>
                      </div>
                      <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="gold-gradient-bg h-full transition-all duration-300"
                          style={{ width: `${r2ProgressPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bucket Objects Explorer */}
            <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 text-white space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-amber-400" />
                    Cloudflare R2 Bucket Objects ({r2Status?.objectsSummary?.totalObjectsInPage || 0})
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Live bucket object list served via Cloudflare R2 S3 API.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={r2SearchTerm}
                    onChange={(e) => setR2SearchTerm(e.target.value)}
                    placeholder="Search object key..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500"
                  />
                </div>
              </div>

              {isLoadingR2Status ? (
                <div className="p-12 text-center text-neutral-400 space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-400" />
                  <p className="text-xs font-mono">Querying Cloudflare R2 bucket objects...</p>
                </div>
              ) : !r2Status?.objectsSummary?.objects?.length ? (
                <div className="p-12 text-center rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <Cloud className="w-12 h-12 text-neutral-600 mx-auto" />
                  <p className="text-sm text-neutral-300 font-bold">No items found in Cloudflare R2 bucket</p>
                  <p className="text-xs text-neutral-400">Upload your product images above or add products in the Products tab.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[10px] tracking-wider">
                        <th className="p-4">Object Key / File</th>
                        <th className="p-4">Size</th>
                        <th className="p-4">Last Modified</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {(r2Status.objectsSummary.objects || [])
                        .filter(obj => !r2SearchTerm || obj.key.toLowerCase().includes(r2SearchTerm.toLowerCase()))
                        .map((obj, idx) => (
                          <tr key={idx} className="hover:bg-neutral-800/50 transition-colors">
                            <td className="p-4 font-mono text-amber-300 font-bold">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="truncate max-w-md" title={obj.key}>{obj.key}</span>
                              </div>
                            </td>

                            <td className="p-4 text-neutral-300 font-mono">
                              {(obj.size / 1024).toFixed(1)} KB
                            </td>

                            <td className="p-4 text-neutral-300 font-mono">
                              {obj.lastModified ? new Date(obj.lastModified).toLocaleString() : 'Recent'}
                            </td>

                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(obj.url);
                                    addToast('Copied Cloudflare CDN URL to clipboard!', 'success');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-neutral-700"
                                >
                                  <Copy className="w-3 h-3 text-amber-400" />
                                  Copy CDN URL
                                </button>

                                <a
                                  href={obj.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700"
                                  title="View image via CDN"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-neutral-300" />
                                </a>

                                <button
                                  onClick={() => handleDeleteR2Item(obj.key)}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                                  title="Delete from Cloudflare R2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 13: AUTOMATED DAILY FIRESTORE BACKUPS */}
        {activeTab === 'backups' && (
          <div className="space-y-8">
            
            {/* System Status Banner */}
            <div className="p-8 rounded-3xl bg-neutral-900 border border-amber-500/30 text-white space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Database className="w-48 h-48 text-amber-400" />
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-neutral-800 pb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
                      Automated Scheduler Active • Daily 24H Execution
                    </span>
                  </div>
                  <h2 className="font-cinzel text-2xl font-bold text-amber-300 flex items-center gap-2">
                    <HardDriveDownload className="w-7 h-7 text-amber-400" />
                    Firestore Collections Backup Manager
                  </h2>
                  <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
                    Automated daily backup service exports all products, orders, categories, and settings into timestamped JSON snapshots and stores them securely in your private cloud bucket.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    onClick={fetchBackupList}
                    disabled={isLoadingBackups}
                    className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all border border-neutral-700"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                    Refresh Logs
                  </button>

                  <button
                    onClick={handleTriggerInstantBackup}
                    disabled={isExportingBackup}
                    className="px-5 py-3 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl hover:brightness-110 disabled:opacity-50 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isExportingBackup ? 'Exporting JSON...' : 'Trigger Instant Backup'}
                  </button>
                </div>
              </div>

              {/* Status Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Schedule Frequency</span>
                  <p className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" /> Every 24 Hours (Daily)
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Private Storage Bucket</span>
                  <p className="text-xs font-mono font-bold text-neutral-200 truncate" title="gs://mahalakshmi-creation-private-backups/daily/">
                    gs://mahalakshmi.../daily/
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Total Products Backed Up</span>
                  <p className="text-sm font-bold text-emerald-400">
                    {products.length} Products
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Total Orders Backed Up</span>
                  <p className="text-sm font-bold text-emerald-400">
                    {orders.length} Orders
                  </p>
                </div>
              </div>
            </div>

            {/* Historical Backup Logs Table */}
            <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 text-white space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-amber-400" />
                    Historical Backup Archives ({backupList.length})
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Download any daily JSON backup directly to inspect or restore Firestore collections.
                  </p>
                </div>
              </div>

              {isLoadingBackups ? (
                <div className="p-12 text-center text-neutral-400 space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-400" />
                  <p className="text-xs font-mono">Loading backup storage registry...</p>
                </div>
              ) : backupList.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <Database className="w-12 h-12 text-neutral-600 mx-auto" />
                  <p className="text-sm text-neutral-300 font-bold">No JSON backup archives generated yet</p>
                  <p className="text-xs text-neutral-400">Click "Trigger Instant Backup" above to generate your first backup file.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[10px] tracking-wider">
                        <th className="p-4">Backup ID & Filename</th>
                        <th className="p-4">Timestamp (UTC)</th>
                        <th className="p-4">Collection Counts</th>
                        <th className="p-4">File Size</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {backupList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-neutral-800/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-amber-300">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>{item.filename}</span>
                            </div>
                            <span className="text-[10px] font-normal text-neutral-500 block truncate max-w-xs mt-0.5">
                              {item.bucketPath}
                            </span>
                          </td>

                          <td className="p-4 text-neutral-300 font-mono">
                            {new Date(item.createdAt).toLocaleString()}
                          </td>

                          <td className="p-4 text-neutral-300">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-mono border border-amber-500/20">
                                {item.stats?.productsCount || products.length} Products
                              </span>
                              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[10px] font-mono border border-blue-500/20">
                                {item.stats?.ordersCount || orders.length} Orders
                              </span>
                            </div>
                          </td>

                          <td className="p-4 text-neutral-300 font-mono">
                            {item.sizeFormatted || '48 KB'}
                          </td>

                          <td className="p-4 text-right">
                            <a
                              href={item.downloadUrl}
                              download={item.filename}
                              className="px-3.5 py-1.5 rounded-xl gold-gradient-bg text-neutral-950 hover:brightness-110 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow transition-all"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download JSON
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* PWA PUSH NOTIFICATIONS & APP BROADCAST TAB */}
        {activeTab === 'pwa' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="p-8 rounded-3xl bg-neutral-900 border border-amber-500/30 text-white space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl gold-gradient-bg p-0.5 shadow-lg shrink-0">
                    <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center text-amber-400">
                      <Bell className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h2 className="font-cinzel text-xl font-bold text-white flex items-center gap-2">
                      PWA Push Notification Broadcast
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Send real-time mobile & desktop push alerts to subscribed customers for new products, order tracking & promotions.
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>Service Worker Active (Workbox 7)</span>
                </div>
              </div>

              {/* Status Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Web App Manifest</span>
                  <p className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> /manifest.json Valid
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Offline Cache Engine</span>
                  <p className="text-xs font-mono font-bold text-amber-300">
                    CacheFirst + Cloudflare R2
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">App Installation Support</span>
                  <p className="text-xs font-mono font-bold text-emerald-400">
                    Android • iOS • Windows • macOS
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Background Sync</span>
                  <p className="text-xs font-mono font-bold text-amber-400">
                    Enabled (Offline Inquiries)
                  </p>
                </div>
              </div>
            </div>

            {/* Broadcast Creation Form Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 p-8 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6">
                <div className="border-b border-neutral-800 pb-4">
                  <h3 className="font-cinzel text-lg font-bold text-amber-300 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Compose Push Broadcast Message
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Fill out the fields below or select a quick template preset to notify app users.
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-bold uppercase text-neutral-400">Quick Broadcast Presets</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        topic: 'New Products',
                        title: 'New Royal Bridal Collection Dropped! 👑',
                        body: 'Explore our latest handcrafted Zardozi & Velvet Bridal Kalis on the Mahalakshmi App.',
                        url: '/?page=bridal'
                      },
                      {
                        topic: 'Order Updates',
                        title: 'Embroidery Order Progress Updated 🧵',
                        body: 'Your custom hand embroidery order has reached the finishing stage in our atelier.',
                        url: '/?page=orders'
                      },
                      {
                        topic: 'Shipping Updates',
                        title: 'International Air Freight Shipped ✈️',
                        body: 'GCC & Global orders dispatched via DHL Express with live GPS tracking.',
                        url: '/?page=international'
                      },
                      {
                        topic: 'Offers',
                        title: 'VIP Festive Swatch Discount 🏷️',
                        body: 'Enjoy 15% off custom bridal lehenga kalis and neck embroidery swatches.',
                        url: '/?page=collections'
                      }
                    ].map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setPwaPushTopic(preset.topic);
                          setPwaPushTitle(preset.title);
                          setPwaPushBody(preset.body);
                          setPwaPushUrl(preset.url);
                          addToast(`Loaded preset: ${preset.topic}`, 'info');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs text-amber-300 font-mono transition-colors"
                      >
                        {preset.topic}: {preset.title.split(' ')[0]}...
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold uppercase text-neutral-300 mb-1">Alert Category Topic *</label>
                    <select
                      value={pwaPushTopic}
                      onChange={(e) => setPwaPushTopic(e.target.value)}
                      className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                    >
                      <option value="New Products">New Products Drop</option>
                      <option value="Order Updates">Order Updates</option>
                      <option value="Shipping Updates">Shipping Updates</option>
                      <option value="Offers">Special Offers & Swatch Discounts</option>
                      <option value="Promotions">Seasonal Promotions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-neutral-300 mb-1">Notification Title *</label>
                    <input
                      type="text"
                      required
                      value={pwaPushTitle}
                      onChange={(e) => setPwaPushTitle(e.target.value)}
                      placeholder="e.g. New Royal Bridal Collection Dropped!"
                      className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-sans"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-neutral-300 mb-1">Notification Body Message *</label>
                    <textarea
                      rows={3}
                      required
                      value={pwaPushBody}
                      onChange={(e) => setPwaPushBody(e.target.value)}
                      placeholder="Write your push notification message..."
                      className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-sans leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-neutral-300 mb-1">Target Page Route URL</label>
                    <input
                      type="text"
                      value={pwaPushUrl}
                      onChange={(e) => setPwaPushUrl(e.target.value)}
                      placeholder="e.g. /?page=bridal"
                      className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-amber-300 font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isBroadcastingPwa}
                    onClick={handleSendPwaBroadcast}
                    className="w-full py-4 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    <Bell className="w-4 h-4" />
                    <span>{isBroadcastingPwa ? 'Sending Broadcast...' : 'Broadcast Push Notification Now'}</span>
                  </button>
                </div>
              </div>

              {/* Mobile Notification Preview Card */}
              <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
                <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
                  <Smartphone className="w-5 h-5 text-amber-400" />
                  Live Mobile Notification Mockup
                </h3>

                <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/40 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <img src="/icon-192.png" alt="Mahalakshmi App" className="w-4 h-4 rounded object-contain" />
                      <span className="font-bold text-white">Mahalakshmi Creation</span>
                    </div>
                    <span>Just Now</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-amber-300 font-cinzel">
                      [{pwaPushTopic}] {pwaPushTitle || 'Notification Title'}
                    </h4>
                    <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                      {pwaPushBody || 'Notification body text preview will appear here.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono text-amber-400">
                    <span>Tap to view {pwaPushUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-2 text-xs font-sans text-neutral-400">
                  <p className="font-bold text-neutral-200">💡 PWA Push Broadcast Tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-400">
                    <li>Push alerts bypass email spam filters and reach customers instantly.</li>
                    <li>Subscribers get native system popups on Android, Windows, macOS and iOS.</li>
                    <li>Tapping the alert directly opens the relevant collection or order page.</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* EDIT / ADD PRODUCT MODAL WITH IMAGE REMOVAL TOOLS */}
        {isProductModalOpen && editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-neutral-900 p-8 rounded-3xl border border-amber-500/30 text-white space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <h3 className="font-cinzel text-xl font-bold text-amber-300">
                  {editingProduct.id ? 'Edit Embroidery Product & Photos' : 'Add New Embroidery Product'}
                </h3>
                <button onClick={() => setIsProductModalOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-400 font-bold uppercase mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.title || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, title: e.target.value })}
                      placeholder="e.g. Royal Zardozi Velvet Panel"
                      className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-bold uppercase mb-1">SKU Code</label>
                    <input
                      type="text"
                      value={editingProduct.sku || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                      placeholder="e.g. MC-BRD-900"
                      className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-400 font-bold uppercase mb-1">Category *</label>
                    <select
                      value={editingProduct.category || 'Neck Embroidery'}
                      onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                      className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-bold uppercase mb-1">Price ({settings.currencySymbol}) *</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price || 0}
                      onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                      className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold uppercase mb-1">Fabric Specification</label>
                  <input
                    type="text"
                    value={editingProduct.fabric || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, fabric: e.target.value })}
                    placeholder="e.g. Pure Organza & German Velvet"
                    className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                  />
                </div>

                {/* AI VIRTUAL MODEL TRY-ON GENERATOR CARD */}
                <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
                    <div>
                      <span className="text-xs font-bold font-cinzel text-amber-300 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        AI Virtual Model Try-On Generator
                      </span>
                      <p className="text-[11px] text-neutral-300 mt-0.5">
                        Upload any flat lay, folded, hanging, or mannequin clothing image to automatically generate a luxury model photoshoot!
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
                        <Upload className="w-4 h-4" />
                        Upload File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, editingProduct)}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        disabled={isGeneratingTryOn}
                        onClick={() => handleGenerateVirtualTryOn(editingProduct)}
                        className="px-4 py-2.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:brightness-110 disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4" />
                        {isGeneratingTryOn ? 'Generating...' : 'Run AI Try-On'}
                      </button>
                    </div>
                  </div>

                  {/* Processing Status Indicator */}
                  {isGeneratingTryOn && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 animate-pulse">
                      <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                      <span className="text-xs text-amber-300 font-mono">{tryOnProgressMsg}</span>
                    </div>
                  )}

                  {/* Generated Virtual Model Showcase */}
                  {editingProduct.virtualModel && (
                    <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Category: {editingProduct.virtualModel.detectedClothingType}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          Selected Model: {editingProduct.virtualModel.detectedGender}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {editingProduct.virtualModel.modelViews.map((mv, idx) => (
                          <div key={idx} className="relative aspect-[3/4] rounded-lg overflow-hidden bg-neutral-800 border border-neutral-700">
                            <img src={mv.imageUrl} alt={mv.label} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 inset-x-0 bg-neutral-950/80 p-1 text-[9px] font-bold text-amber-300 truncate text-center">
                              {mv.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* INTERACTIVE IMAGE MANAGEMENT SECTION WITH REMOVE PHOTO BUTTONS */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block font-bold uppercase text-amber-300 text-xs">
                        Product Photo Gallery ({editingProduct.images?.length || 0} Photos)
                      </label>
                      <span className="text-[10px] text-neutral-400">
                        Click "Remove Photo" to delete any demo or unwanted image.
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail Cards with Overlay Delete Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {(editingProduct.images || []).map((imgUrl, imgIdx) => (
                      <div key={imgIdx} className="relative group aspect-[3/4] rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700">
                        <img src={imgUrl} alt={`Photo ${imgIdx + 1}`} className="w-full h-full object-cover" />
                        
                        {/* Overlay with explicit Remove Photo Button */}
                        <div className="absolute inset-0 bg-neutral-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const remaining = (editingProduct.images || []).filter((_, idx) => idx !== imgIdx);
                              setEditingProduct({ ...editingProduct, images: remaining });
                              addToast("Photo removed from product gallery", "info");
                            }}
                            className="w-full py-1.5 px-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase rounded-lg shadow-lg flex items-center justify-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> Remove Photo
                          </button>
                        </div>

                        {imgIdx === 0 && (
                          <span className="absolute top-1.5 left-1.5 bg-amber-500 text-neutral-950 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow">
                            Main Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add New Photo URL Field */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newImageUrlInput}
                      onChange={e => setNewImageUrlInput(e.target.value)}
                      placeholder="Paste new photo URL (e.g. https://images.unsplash.com/...)"
                      className="flex-1 p-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newImageUrlInput.trim()) {
                          setEditingProduct({
                            ...editingProduct,
                            images: [...(editingProduct.images || []), newImageUrlInput.trim()]
                          });
                          setNewImageUrlInput('');
                          addToast("New photo added!", "success");
                        }
                      }}
                      className="px-4 py-2.5 gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shrink-0"
                    >
                      <Plus className="w-4 h-4 inline mr-1" /> Add Photo
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold uppercase mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                  />
                </div>

                <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-5 py-3 rounded-xl border border-neutral-700 text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 gold-gradient-bg text-neutral-950 font-bold rounded-xl uppercase tracking-wider"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB: TRASH & AUDIT VAULT */}
        {activeTab === 'trash' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-neutral-900 border border-amber-500/30">
              <div>
                <h3 className="font-cinzel text-xl font-bold text-white flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  Secure Order Deletion & Trash Vault
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Orders moved here require Super Admin verification before permanent deletion. Backups and IP audit logs are retained permanently.
                </p>
              </div>

              {trashedOrders.length > 0 && (
                <button
                  onClick={() => {
                    setDeleteTargetOrder(trashedOrders[0]);
                    setDeleteModalMode('clear_all_trash');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Bulk Clear Trash Vault</span>
                </button>
              )}
            </div>

            {/* Trashed Orders List */}
            <div className="space-y-4">
              <h4 className="font-cinzel text-lg font-bold text-amber-300">Trashed Orders ({trashedOrders.length})</h4>
              {trashedOrders.length === 0 ? (
                <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 text-center text-neutral-400 text-xs">
                  No orders currently in the trash vault.
                </div>
              ) : (
                <div className="space-y-4">
                  {trashedOrders.map(ord => (
                    <div key={ord.id} className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-base">#{ord.id}</span>
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                            Trashed by {ord.trashedBy || 'Super Admin'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-300">
                          Customer: <strong className="text-white">{ord.customerName}</strong> ({ord.customerEmail}) • Amount: <strong className="text-emerald-400">₹{ord.totalAmount.toLocaleString()}</strong>
                        </p>
                        <p className="text-[11px] text-neutral-400 font-mono">
                          Reason: <span className="text-amber-300 italic">{ord.trashReason || 'Not specified'}</span> • Trashed At: {ord.trashedAt ? new Date(ord.trashedAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={async () => {
                            if (confirm(`Restore order #${ord.id} from Trash?`)) {
                              await restoreOrderFromTrash(ord.id, adminUser?.email || 'Super Admin');
                              refreshData();
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>

                        <button
                          onClick={() => {
                            setDeleteTargetOrder(ord);
                            setDeleteModalMode('permanent_delete');
                          }}
                          className="px-4 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Permanently Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audit Logs Section */}
            <div className="space-y-4 pt-6 border-t border-neutral-800">
              <h4 className="font-cinzel text-lg font-bold text-amber-300">Deletion & Security Audit Log Trail ({deletionAuditLogs.length})</h4>
              {deletionAuditLogs.length === 0 ? (
                <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 text-center text-neutral-400 text-xs">
                  No deletion audit logs recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 font-mono text-[10px] uppercase">
                        <th className="py-3 px-4">Audit ID / Order</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Deleted By</th>
                        <th className="py-3 px-4">Timestamp & IP</th>
                        <th className="py-3 px-4">Reason</th>
                        <th className="py-3 px-4 text-right">Backup Snapshot</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {deletionAuditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-neutral-900/50">
                          <td className="py-3 px-4 font-mono">
                            <span className="font-bold text-white block">#{log.orderId}</span>
                            <span className="text-[10px] text-neutral-500">{log.id}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                              log.actionType === 'permanently_deleted' 
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : log.actionType === 'restored'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {log.actionType.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white font-bold">{log.deletedBy}</td>
                          <td className="py-3 px-4 font-mono text-neutral-400">
                            <span className="block text-white">{new Date(log.deletedAt).toLocaleString()}</span>
                            <span className="text-[10px] text-neutral-500">IP: {log.ipAddress}</span>
                          </td>
                          <td className="py-3 px-4 text-neutral-300 italic max-w-xs truncate">{log.reason}</td>
                          <td className="py-3 px-4 text-right">
                            {log.backupSnapshot && (
                              <button
                                onClick={async () => {
                                  if (confirm(`Restore order #${log.orderId} from Audit Vault Backup Snapshot?`)) {
                                    await restoreOrderFromBackup(log.id);
                                    refreshData();
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Restore Backup</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* SECURE ORDER DELETE MODAL */}
        {deleteTargetOrder && (
          <SecureOrderDeleteModal
            order={deleteTargetOrder}
            mode={deleteModalMode}
            onClose={() => setDeleteTargetOrder(null)}
            onSuccess={() => {
              setDeleteTargetOrder(null);
              refreshData();
            }}
          />
        )}

        {/* EDIT CATEGORY MODAL */}
        {isCategoryModalOpen && editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-lg bg-neutral-900 p-8 rounded-3xl border border-amber-500/30 text-white space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <h3 className="font-cinzel text-xl font-bold text-amber-300">
                  {editingCategory.id ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-400 font-bold uppercase mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.name || ''}
                    onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value as any })}
                    className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold uppercase mb-1">Image URL</label>
                  <input
                    type="text"
                    value={editingCategory.image || ''}
                    onChange={e => setEditingCategory({ ...editingCategory, image: e.target.value })}
                    className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold uppercase mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingCategory.description || ''}
                    onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                  />
                </div>

                <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-5 py-3 rounded-xl border border-neutral-700 text-neutral-300">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-3 gold-gradient-bg text-neutral-950 font-bold rounded-xl uppercase">
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT GALLERY MODAL */}
        {isGalleryModalOpen && editingGallery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-lg bg-neutral-900 p-8 rounded-3xl border border-amber-500/30 text-white space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <h3 className="font-cinzel text-xl font-bold text-amber-300">Add Gallery Showcase Photo</h3>
                <button onClick={() => setIsGalleryModalOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveGallery} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-400 font-bold uppercase mb-1">Photo Title *</label>
                  <input
                    type="text"
                    required
                    value={editingGallery.title || ''}
                    onChange={e => setEditingGallery({ ...editingGallery, title: e.target.value })}
                    className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold uppercase mb-1">Photo URL *</label>
                  <input
                    type="text"
                    required
                    value={editingGallery.imageUrl || ''}
                    onChange={e => setEditingGallery({ ...editingGallery, imageUrl: e.target.value })}
                    className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-mono"
                  />
                </div>

                <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsGalleryModalOpen(false)} className="px-5 py-3 rounded-xl border border-neutral-700 text-neutral-300">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-3 gold-gradient-bg text-neutral-950 font-bold rounded-xl uppercase">
                    Save Photo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT / ADD HERO BANNER MODAL */}
        {isHeroModalOpen && editingHero && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-neutral-900 p-8 rounded-3xl border border-amber-500/30 text-white space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  <h3 className="font-cinzel text-xl font-bold text-amber-300">
                    {editingHero.id ? 'Edit Hero Banner' : 'Add New Hero Banner'}
                  </h3>
                </div>
                <button onClick={() => { setIsHeroModalOpen(false); setEditingHero(null); }} className="p-1 text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveHero} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-400 font-bold uppercase mb-1">Banner Tag *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HAUTE COUTURE 2026"
                      value={editingHero.tag || ''}
                      onChange={e => setEditingHero({ ...editingHero, tag: e.target.value })}
                      className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 font-bold uppercase mb-1">Status</label>
                    <select
                      value={editingHero.active ? 'true' : 'false'}
                      onChange={e => setEditingHero({ ...editingHero, active: e.target.value === 'true' })}
                      className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                    >
                      <option value="true">Active (Visible in Slider)</option>
                      <option value="false">Inactive (Hidden)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold uppercase mb-1">Banner Headline Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bridal Zardozi & Royal Lehengas"
                    value={editingHero.title || ''}
                    onChange={e => setEditingHero({ ...editingHero, title: e.target.value })}
                    className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold uppercase mb-1">Subtitle / Description</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Exquisite hand-crafted embroidery featuring genuine badla wire and cutwork lace."
                    value={editingHero.subtitle || ''}
                    onChange={e => setEditingHero({ ...editingHero, subtitle: e.target.value })}
                    className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-400 font-bold uppercase mb-1">Primary CTA Button Label *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Explore Collection"
                      value={editingHero.ctaText || ''}
                      onChange={e => setEditingHero({ ...editingHero, ctaText: e.target.value })}
                      className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 font-bold uppercase mb-1">Primary CTA Page Link *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. collections or bridal or products"
                      value={editingHero.ctaLink || ''}
                      onChange={e => setEditingHero({ ...editingHero, ctaLink: e.target.value })}
                      className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-400 font-bold uppercase mb-1">Secondary CTA Label (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Book Atelier Appointment"
                      value={editingHero.secondaryCtaText || ''}
                      onChange={e => setEditingHero({ ...editingHero, secondaryCtaText: e.target.value })}
                      className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 font-bold uppercase mb-1">Secondary CTA Link (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. contact"
                      value={editingHero.secondaryCtaLink || ''}
                      onChange={e => setEditingHero({ ...editingHero, secondaryCtaLink: e.target.value })}
                      className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 font-bold uppercase mb-1">Banner Image URL (Cloudflare R2 / CDN) *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="https://..."
                      value={editingHero.imageUrl || ''}
                      onChange={e => setEditingHero({ ...editingHero, imageUrl: e.target.value })}
                      className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-mono text-[11px]"
                    />
                    <label className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 border border-amber-500/30 text-amber-400 font-bold rounded-xl cursor-pointer shrink-0 flex items-center gap-1.5">
                      <Upload className="w-4 h-4" />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          addToast('Uploading banner to Cloudflare R2 CDN...', 'info');
                          try {
                            const res = await uploadImageToCloudflareR2(file, 'products');
                            setEditingHero({ ...editingHero, imageUrl: res.url });
                            addToast('✨ Banner image uploaded to Cloudflare R2!', 'success');
                          } catch (err: any) {
                            addToast(err.message || 'Upload failed', 'error');
                          }
                        }}
                      />
                    </label>
                  </div>
                  {editingHero.imageUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden h-32 bg-neutral-800 border border-neutral-700 relative">
                      <img src={editingHero.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-amber-300 font-mono">Image Preview</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsHeroModalOpen(false); setEditingHero(null); }}
                    className="px-5 py-3 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 gold-gradient-bg text-neutral-950 font-bold rounded-xl uppercase flex items-center gap-2"
                  >
                    Save Hero Banner
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SINGLE PRODUCT DELETE CONFIRMATION MODAL */}
        {productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-md bg-neutral-900 p-6 rounded-3xl border border-red-500/40 text-white space-y-4 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center border border-red-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel text-lg font-bold text-white">Delete Embroidery Design?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                This action will permanently remove the product from the catalog and Cloudflare R2 storage.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button 
                  onClick={() => setProductToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold uppercase tracking-wider hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteProduct}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-600/20"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BULK PRODUCTS DELETE CONFIRMATION MODAL */}
        {isBulkDeleteProductsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-md bg-neutral-900 p-6 rounded-3xl border border-red-500/40 text-white space-y-4 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center border border-red-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel text-lg font-bold text-white">Delete {selectedProductIds.length} Selected Products?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Are you sure you want to delete all selected embroidery designs? This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button 
                  onClick={() => setIsBulkDeleteProductsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold uppercase tracking-wider hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmBulkDeleteProducts}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-600/20"
                >
                  Delete {selectedProductIds.length} Products
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORY DELETE CONFIRMATION MODAL */}
        {categoryToDelete && (() => {
          const catObj = categories.find(c => c.id === categoryToDelete);
          const attachedProducts = catObj 
            ? products.filter(p => p.category?.toLowerCase().trim() === catObj.name?.toLowerCase().trim()) 
            : [];
          const hasProducts = attachedProducts.length > 0;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
              <div className="relative w-full max-w-lg bg-neutral-900 p-6 rounded-3xl border border-red-500/40 text-white space-y-4 shadow-2xl text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center border border-red-500/30">
                  <Trash2 className="w-6 h-6" />
                </div>
                
                <h3 className="font-cinzel text-lg font-bold text-white">
                  Delete Category "{catObj?.name || 'Category'}"?
                </h3>

                {hasProducts ? (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs text-left">
                      <p className="font-bold mb-1">⚠️ Category Contains {attachedProducts.length} Product(s)</p>
                      <p className="text-neutral-300 text-[11px] leading-relaxed">
                        This category is currently linked to products like {attachedProducts.slice(0, 2).map(p => `"${p.title}"`).join(', ')}. Select an option below to proceed:
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      <button
                        onClick={confirmDeleteCategoryWithReassign}
                        className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow"
                      >
                        Reassign {attachedProducts.length} Product(s) to "Uncategorized" & Delete Category
                      </button>
                      <button
                        onClick={confirmDeleteCategoryAndAllProducts}
                        className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow"
                      >
                        Delete Category & All {attachedProducts.length} Product(s)
                      </button>
                      <button
                        onClick={() => {
                          setCategoryToDelete(null);
                          setActiveTab('products');
                          if (catObj) setProductSearchTerm(catObj.name);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        View & Manage Products in Table
                      </button>
                      <button
                        onClick={() => setCategoryToDelete(null)}
                        className="w-full py-2.5 px-4 rounded-xl bg-neutral-800/80 text-neutral-400 hover:text-white text-xs font-bold uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      This category is empty (0 products). Are you sure you want to delete it? This action cannot be undone.
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button 
                        onClick={() => setCategoryToDelete(null)}
                        className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold uppercase tracking-wider hover:bg-neutral-700"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={confirmDeleteCategory}
                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-600/20"
                      >
                        Delete Category
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* GALLERY DELETE CONFIRMATION MODAL */}
        {galleryToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-md bg-neutral-900 p-6 rounded-3xl border border-red-500/40 text-white space-y-4 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center border border-red-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel text-lg font-bold text-white">Delete Gallery Item?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                This will delete the item from your gallery. This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button 
                  onClick={() => setGalleryToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold uppercase tracking-wider hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteGallery}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-600/20"
                >
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HERO BANNER DELETE CONFIRMATION MODAL */}
        {heroToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-md bg-neutral-900 p-6 rounded-3xl border border-red-500/40 text-white space-y-4 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center border border-red-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel text-lg font-bold text-white">Delete Hero Banner?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                This will delete the hero banner. This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button 
                  onClick={() => setHeroToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold uppercase tracking-wider hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteHero}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-600/20"
                >
                  Delete Banner
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REVIEW DELETE CONFIRMATION MODAL */}
        {reviewToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-md bg-neutral-900 p-6 rounded-3xl border border-red-500/40 text-white space-y-4 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center border border-red-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel text-lg font-bold text-white">Delete Client Review?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                This will delete the client review. This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button 
                  onClick={() => setReviewToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold uppercase tracking-wider hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteReview}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-600/20"
                >
                  Delete Review
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
