import React, { useState } from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { Heart, Eye, MessageCircle, Sparkles, Share2, Sliders, Palette } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    setCurrentPage, 
    openWhatsAppInquiry, 
    toggleWishlist, 
    isInWishlist, 
    setQuickViewProduct,
    settings,
    addToast,
    formatPrice,
    compareProductIds,
    addToCompare,
    removeFromCompare,
    openCustomizer,
    setSelected3DProduct
  } = useApp();

  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const isSaved = isInWishlist(product.id);
  const isCompared = compareProductIds.includes(product.id);

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin);
    addToast(`Link copied for "${product.title}"`, "success");
  };

  return (
    <div 
      onClick={() => setCurrentPage('product-detail', product.id)}
      className="group relative frosted-glass-card rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Product Image Container */}
      <div 
        className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-950"
        onMouseEnter={() => product.images.length > 1 && setCurrentImgIdx(1)}
        onMouseLeave={() => setCurrentImgIdx(0)}
      >
        <img
          src={product.images[currentImgIdx] || product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelected3DProduct(product);
            }}
            className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-neutral-950/90 text-amber-300 border border-amber-500/60 rounded-md shadow-xl flex items-center gap-1 hover:bg-amber-500 hover:text-neutral-950 transition-all"
            title="Launch 3D Mannequin Showroom"
          >
            <Sparkles className="w-3 h-3" />
            <span>3D View</span>
          </button>
          {product.isNewArrival && (
            <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider gold-gradient-bg text-neutral-950 rounded-md shadow-md">
              New
            </span>
          )}
          {product.isTrending && (
            <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-neutral-950 text-amber-300 border border-amber-500/40 rounded-md shadow-md">
              Trending
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-red-600 text-white rounded-md shadow-md">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Top Right Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-lg ${
              isSaved 
                ? 'bg-amber-500 text-neutral-950' 
                : 'bg-neutral-900/60 text-white hover:bg-neutral-900 hover:text-amber-400'
            }`}
            aria-label="Add to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isCompared) {
                removeFromCompare(product.id);
              } else {
                addToCompare(product.id);
              }
            }}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-lg ${
              isCompared 
                ? 'bg-amber-500 text-neutral-950 font-bold' 
                : 'bg-neutral-900/60 text-white hover:bg-neutral-900 hover:text-amber-400'
            }`}
            title={isCompared ? "Remove from Compare" : "Compare Design"}
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-neutral-900/60 text-white hover:bg-neutral-900 hover:text-amber-400 backdrop-blur-md transition-all shadow-lg"
            title="Share Product"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Hover Quick Actions Bar */}
        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openCustomizer(product);
            }}
            className="py-2.5 px-2 bg-amber-500/90 hover:bg-amber-500 text-neutral-950 font-bold text-xs rounded-xl backdrop-blur-md border border-amber-300 flex items-center justify-center gap-1 transition-all"
            title="Bespoke Customizer"
          >
            <Palette className="w-3.5 h-3.5" />
            Customize
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="flex-1 py-2.5 px-2 bg-neutral-900/90 hover:bg-neutral-900 text-amber-300 font-medium text-xs rounded-xl backdrop-blur-md border border-amber-500/30 flex items-center justify-center gap-1.5 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              openWhatsAppInquiry(product);
            }}
            className="py-2.5 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl backdrop-blur-md flex items-center justify-center gap-1.5 transition-all"
            title="WhatsApp Inquiry"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-medium uppercase tracking-wider mb-1">
            <span>{product.category}</span>
            <span className="text-neutral-400 font-mono text-[10px]">{product.sku}</span>
          </div>

          <h3 className="font-cinzel font-semibold text-neutral-900 dark:text-neutral-100 text-sm line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-2">
            {product.title}
          </h3>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div>
          {/* Work types & fabric tag */}
          <div className="flex flex-wrap gap-1 mb-3">
            <span className="px-2 py-0.5 text-[10px] rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-medium">
              {product.fabric}
            </span>
            {product.workType.slice(0, 2).map((w, i) => (
              <span key={i} className="px-2 py-0.5 text-[10px] rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                {w}
              </span>
            ))}
          </div>

          {/* Pricing & CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div>
              <span className="text-xs text-neutral-400 uppercase tracking-wider font-sans">Price: </span>
              <span className="font-bold text-base text-neutral-900 dark:text-amber-300 font-cinzel">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-neutral-400 line-through ml-2 font-mono">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openWhatsAppInquiry(product);
              }}
              className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
              title="Quick WhatsApp Order"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
