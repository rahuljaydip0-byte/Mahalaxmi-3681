import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductZoom } from '../components/product/ProductZoom';
import { Product360Viewer } from '../components/product/Product360Viewer';
import { ProductCard } from '../components/common/ProductCard';
import { SEOHead } from '../components/common/SEOHead';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Rotate3D, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  ChevronRight, 
  ArrowLeft, 
  Play, 
  Scissors, 
  Award,
  Sliders,
  Palette,
  CheckCircle2,
  UserCheck,
  Eye,
  Shirt,
  Lock
} from 'lucide-react';
import { GuestCheckoutModal } from '../components/common/GuestCheckoutModal';

export const ProductDetailPage: React.FC = () => {
  const { 
    selectedProductId, 
    products, 
    setCurrentPage, 
    openWhatsAppInquiry, 
    toggleWishlist, 
    isInWishlist, 
    addRecentlyViewed, 
    recentlyViewedIds,
    settings,
    addToast,
    formatPrice,
    openCustomizer,
    compareProductIds,
    addToCompare,
    removeFromCompare,
    setSelected3DProduct
  } = useApp();

  const product = products.find(p => p.id === selectedProductId) || products[0];

  const [activeTab, setActiveTab] = useState<'photos' | 'virtual-model' | '360' | 'video'>('photos');
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [selectedModelViewIdx, setSelectedModelViewIdx] = useState(0);
  const [showOriginalComparison, setShowOriginalComparison] = useState(false);
  const [isGuestCheckoutOpen, setIsGuestCheckoutOpen] = useState(false);

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product?.id]);

  if (!product) return null;

  const isSaved = isInWishlist(product.id);

  // Related Products
  const relatedProducts = products.filter(p => 
    p.id !== product.id && 
    (p.category === product.category || p.collections.some(c => product.collections.includes(c)))
  ).slice(0, 4);

  // Recently Viewed Products
  const recentlyViewedProds = products.filter(p => 
    p.id !== product.id && 
    recentlyViewedIds.includes(p.id)
  ).slice(0, 4);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast(`Link copied for "${product.title}"`, "success");
  };

  // Virtual Model Views list
  const virtualModelViews = product.virtualModel?.modelViews || (
    product.aiGeneratedImages && product.aiGeneratedImages.length > 0 ? [
      { viewType: 'front', label: 'Front Model View', imageUrl: product.aiGeneratedImages[0] },
      { viewType: 'side', label: '3/4 Side Profile', imageUrl: product.aiGeneratedImages[1] || product.aiGeneratedImages[0] },
      { viewType: 'back', label: 'Rear Tailoring View', imageUrl: product.aiGeneratedImages[2] || product.aiGeneratedImages[0] },
      { viewType: 'detail', label: 'Macro Craftsmanship', imageUrl: product.aiGeneratedImages[3] || product.aiGeneratedImages[0] }
    ] : []
  );

  return (
    <div className="py-12 bg-neutral-50 dark:bg-neutral-950 min-h-screen transition-colors">
      <SEOHead product={product} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs & Back */}
        <div className="flex items-center justify-between mb-8 text-xs font-medium text-neutral-500">
          <button
            onClick={() => setCurrentPage('categories')}
            className="flex items-center gap-1.5 hover:text-amber-500 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </button>

          <div className="hidden sm:flex items-center gap-2 font-mono">
            <span>Home</span>
            <ChevronRight className="w-3 h-3 text-neutral-400" />
            <span>{product.category}</span>
            <ChevronRight className="w-3 h-3 text-neutral-400" />
            <span className="text-amber-500">{product.sku}</span>
          </div>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start bg-white dark:bg-neutral-900 rounded-3xl p-6 md:p-10 border border-amber-500/20 luxury-card-shadow mb-16">
          
          {/* Left Column: Media Stage */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* View Mode Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-2xl w-fit">
              <button
                onClick={() => setSelected3DProduct(product)}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-neutral-950 text-amber-300 border border-amber-500/60 shadow-lg flex items-center gap-1.5 hover:bg-amber-500 hover:text-neutral-950 transition-all animate-pulse"
              >
                <Sparkles className="w-4 h-4" />
                Immersive 3D Showroom
              </button>

              <button
                onClick={() => setActiveTab('photos')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'photos' ? 'gold-gradient-bg text-neutral-950 shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:text-amber-500'
                }`}
              >
                HD Photos & Zoom
              </button>

              <button
                onClick={() => setActiveTab('virtual-model')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeTab === 'virtual-model' ? 'gold-gradient-bg text-neutral-950 shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:text-amber-500'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                AI Virtual Model Try-On
              </button>

              {product.threeSixtyImages && product.threeSixtyImages.length > 0 && (
                <button
                  onClick={() => setActiveTab('360')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    activeTab === '360' ? 'gold-gradient-bg text-neutral-950 shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:text-amber-500'
                  }`}
                >
                  <Rotate3D className="w-4 h-4" />
                  360° View
                </button>
              )}

              {product.videoUrl && (
                <button
                  onClick={() => setActiveTab('video')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    activeTab === 'video' ? 'gold-gradient-bg text-neutral-950 shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:text-amber-500'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  Video Showcase
                </button>
              )}
            </div>

            {/* Media Viewports */}
            {activeTab === 'photos' && (
              <div className="space-y-4">
                <ProductZoom 
                  src={product.images[selectedImgIdx] || product.images[0]} 
                  alt={product.title} 
                />

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImgIdx(idx)}
                        className={`relative w-20 h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                          selectedImgIdx === idx ? 'border-amber-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AI VIRTUAL MODEL TRY-ON VIEWPORT */}
            {activeTab === 'virtual-model' && (
              <div className="space-y-5">
                <div className="p-4 rounded-3xl bg-neutral-900 border border-amber-500/30 text-white space-y-4">
                  
                  {/* Top Info Banner */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl gold-gradient-bg flex items-center justify-center text-neutral-950 font-bold shadow">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <div>
                        <h3 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                          <span>AI Virtual Model Photoshoot</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase">
                            Super Admin Render
                          </span>
                        </h3>
                        <p className="text-[11px] text-neutral-400">
                          {product.virtualModel?.description || 'Garment automatically rendered on realistic model with exact embroidery & fabric details.'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowOriginalComparison(!showOriginalComparison)}
                      className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {showOriginalComparison ? 'Show Single View' : 'Compare Flat Lay / Original'}
                    </button>
                  </div>

                  {/* Main Display Stage */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Primary Model Stage */}
                    <div className={`${showOriginalComparison ? 'md:col-span-6' : 'md:col-span-12'} relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl`}>
                      <img
                        src={
                          virtualModelViews[selectedModelViewIdx]?.imageUrl ||
                          product.images[0]
                        }
                        alt="AI Virtual Model View"
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-2 text-[10px] font-bold text-amber-300 font-mono uppercase shadow-lg">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{virtualModelViews[selectedModelViewIdx]?.label || 'Front Studio Model View'}</span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 bg-neutral-950/80 backdrop-blur-md p-2.5 rounded-xl border border-neutral-800 flex items-center justify-between text-[10px] text-neutral-300 font-sans">
                        <span className="flex items-center gap-1">
                          <Shirt className="w-3.5 h-3.5 text-amber-400" />
                          Category: <strong>{product.virtualModel?.detectedClothingType || product.category}</strong>
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          100% Fit & Texture Preserved
                        </span>
                      </div>
                    </div>

                    {/* Side-By-Side Original Comparison (If toggled) */}
                    {showOriginalComparison && (
                      <div className="md:col-span-6 relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl">
                        <img
                          src={product.virtualModel?.originalImage || product.images[0]}
                          alt="Original Flat Lay / Cutout"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-700 text-[10px] font-bold text-neutral-300 font-mono uppercase shadow-lg">
                          Original Garment / Flat Lay
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pose / View Selector Buttons */}
                  {virtualModelViews.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold">
                        Select Photoshoot Pose & Angle ({virtualModelViews.length} Views):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {virtualModelViews.map((mv, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedModelViewIdx(idx)}
                            className={`p-2 rounded-xl border transition-all flex items-center gap-2 text-left ${
                              selectedModelViewIdx === idx
                                ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg'
                                : 'bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:text-white'
                            }`}
                          >
                            <img src={mv.imageUrl} alt={mv.label} className="w-10 h-12 rounded-lg object-cover shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="text-[11px] font-bold block truncate">{mv.label}</span>
                              <span className="text-[9px] font-mono text-amber-400 uppercase block">{mv.viewType} pose</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {activeTab === '360' && product.threeSixtyImages && (
              <Product360Viewer frames={product.threeSixtyImages} productTitle={product.title} />
            )}

            {activeTab === 'video' && product.videoUrl && (
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-amber-500/30">
                <video src={product.videoUrl} controls autoPlay className="w-full h-full object-cover" />
              </div>
            )}

          </div>

          {/* Right Column: Specifications & Actions */}
          <div className="lg:col-span-5 space-y-6">
            
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono uppercase font-bold">
                  {product.category}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  SKU: {product.sku}
                </span>
              </div>

              <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-3">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold font-cinzel text-neutral-900 dark:text-amber-300">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-neutral-400 line-through font-mono">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans mb-6">
                {product.description}
              </p>
            </div>

            {/* Fabric & Technical Specs */}
            <div className="space-y-4 p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
              <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-amber-500" />
                Craftsmanship & Material Specs
              </h4>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 block font-mono text-[10px] uppercase">Fabric Material</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.fabric}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-mono text-[10px] uppercase">Needle Techniques</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.workType.join(', ')}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-mono text-[10px] uppercase">Collections</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.collections.join(', ')}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-mono text-[10px] uppercase">Min Order Qty</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.minOrderQty || 1} Set</span>
                </div>
              </div>
            </div>

            {/* Colors Swatches */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block">
                  Available Color Swatches:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.availableColors.map((color, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 shadow-sm"
                    >
                      <span className="w-4 h-4 rounded-full border border-neutral-400" style={{ backgroundColor: color.hex }} />
                      <span>{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block">
                  Available Sizing Options:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.availableSizes.map((size, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setIsGuestCheckoutOpen(true)}
                className="w-full py-4 px-6 gold-gradient-bg hover:scale-102 text-neutral-950 font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all border border-amber-300"
              >
                <ShieldCheck className="w-5 h-5 text-neutral-950" />
                <span>Place Guest Order (Email / WhatsApp OTP Verified)</span>
              </button>

              <button
                onClick={() => openWhatsAppInquiry(product)}
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Inquire & Order On WhatsApp</span>
              </button>

              <button
                onClick={() => openCustomizer(product)}
                className="w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Palette className="w-4 h-4" />
                <span>Customize Fabric & Embroidery Specs</span>
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`flex-1 py-3 px-4 rounded-2xl border font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isSaved ? 'bg-amber-500 border-amber-500 text-neutral-950' : 'border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-amber-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Wishlist'}</span>
                </button>

                <button
                  onClick={() => {
                    if (compareProductIds.includes(product.id)) {
                      removeFromCompare(product.id);
                    } else {
                      addToCompare(product.id);
                    }
                  }}
                  className={`flex-1 py-3 px-4 rounded-2xl border font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    compareProductIds.includes(product.id) ? 'bg-amber-500 border-amber-500 text-neutral-950' : 'border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-amber-500'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>{compareProductIds.includes(product.id) ? 'Comparing' : 'Compare'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="py-3 px-4 rounded-2xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-amber-500 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                  title="Share Product Link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <span>100% Quality Inspected</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Worldwide Priority Freight</span>
              </div>
            </div>

          </div>

        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="mb-16 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-cinzel text-2xl font-bold text-neutral-900 dark:text-white">
                Related Embroidery Designs
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed Products */}
        {recentlyViewedProds.length > 0 && (
          <div className="space-y-8">
            <h2 className="font-cinzel text-xl font-bold text-neutral-900 dark:text-white">
              Recently Viewed
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewedProds.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Guest Order Verification Modal */}
        <GuestCheckoutModal
          isOpen={isGuestCheckoutOpen}
          onClose={() => setIsGuestCheckoutOpen(false)}
          product={product}
        />
      </div>
    </div>
  );
};
