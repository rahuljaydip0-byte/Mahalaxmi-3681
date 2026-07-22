import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2, Check, ArrowRight, Sparkles, MessageCircle, Sliders } from 'lucide-react';

export const CompareModal: React.FC = () => {
  const { 
    isCompareOpen, 
    setIsCompareOpen, 
    compareProductIds, 
    products, 
    removeFromCompare, 
    clearCompare, 
    formatPrice,
    openWhatsAppInquiry,
    openCustomizer,
    setCurrentPage
  } = useApp();

  if (!isCompareOpen) return null;

  const compareProducts = products.filter(p => compareProductIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-6xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-amber-500/20 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Luxury Embroidery Comparison ({compareProducts.length}/4)</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Compare fabric, work type, motif craftsmanship, and pricing side-by-side
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {compareProducts.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs font-semibold text-neutral-400 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={() => setIsCompareOpen(false)}
              className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="p-6 overflow-x-auto overflow-y-auto flex-1">
          {compareProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Sparkles className="w-12 h-12 text-amber-500/40 mx-auto" />
              <h4 className="text-base font-bold text-neutral-900 dark:text-white">No items in your comparison drawer</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                Click the 'Compare' icon on any product card or detail page to compare luxury embroidery specs side by side.
              </p>
            </div>
          ) : (
            <div className="min-w-[700px] grid grid-cols-5 gap-4">
              {/* Feature Row Labels */}
              <div className="space-y-6 pt-32 font-bold text-xs uppercase tracking-wider text-neutral-400 border-r border-neutral-100 dark:border-neutral-800 pr-4">
                <div className="h-10 flex items-center">Product Title</div>
                <div className="h-8 flex items-center">SKU Code</div>
                <div className="h-8 flex items-center">Price Rate</div>
                <div className="h-8 flex items-center">Category</div>
                <div className="h-8 flex items-center">Fabric Type</div>
                <div className="h-16 flex items-center">Embroidery Work</div>
                <div className="h-12 flex items-center">Color Options</div>
                <div className="h-8 flex items-center">Min Order Qty</div>
                <div className="h-12 flex items-center">Actions</div>
              </div>

              {/* Product Columns */}
              {compareProducts.map(product => (
                <div key={product.id} className="space-y-6 bg-neutral-50/50 dark:bg-neutral-950/50 p-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-800">
                  {/* Image & Header */}
                  <div className="relative h-28 rounded-xl overflow-hidden group">
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-neutral-900/80 text-white hover:bg-red-500 transition-colors"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="h-10 flex items-center font-serif font-bold text-xs text-neutral-900 dark:text-white line-clamp-2">
                    {product.title}
                  </div>

                  <div className="h-8 flex items-center font-mono text-xs text-amber-500 font-bold">
                    {product.sku}
                  </div>

                  <div className="h-8 flex items-center font-mono font-extrabold text-sm text-neutral-900 dark:text-amber-300">
                    {formatPrice(product.price)}
                  </div>

                  <div className="h-8 flex items-center text-xs text-neutral-600 dark:text-neutral-300">
                    {product.category}
                  </div>

                  <div className="h-8 flex items-center text-xs text-neutral-600 dark:text-neutral-300">
                    {product.fabric}
                  </div>

                  <div className="h-16 flex flex-wrap gap-1 items-center overflow-hidden">
                    {product.workType.map((wt, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-semibold border border-amber-500/20">
                        {wt}
                      </span>
                    ))}
                  </div>

                  <div className="h-12 flex items-center gap-1">
                    {product.availableColors?.map((c, i) => (
                      <span 
                        key={i} 
                        className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-700 shrink-0" 
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>

                  <div className="h-8 flex items-center text-xs font-mono text-neutral-500">
                    {product.minOrderQty || 1} Piece(s)
                  </div>

                  <div className="h-12 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsCompareOpen(false);
                        openCustomizer(product);
                      }}
                      className="flex-1 py-2 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[11px] font-bold border border-amber-500/30 flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Customize</span>
                    </button>
                    <button
                      onClick={() => openWhatsAppInquiry(product)}
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 transition-colors"
                      title="WhatsApp Quote"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
