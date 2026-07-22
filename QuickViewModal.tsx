import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Heart, MessageCircle, ArrowRight, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { GuestCheckoutModal } from './GuestCheckoutModal';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, setCurrentPage, openWhatsAppInquiry, toggleWishlist, isInWishlist, settings } = useApp();
  const [selectedImg, setSelectedImg] = useState(0);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  if (!quickViewProduct) return null;

  const isSaved = isInWishlist(quickViewProduct.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-amber-500/20 p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full bg-neutral-100 dark:bg-neutral-800 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <img
                src={quickViewProduct.images[selectedImg] || quickViewProduct.images[0]}
                alt={quickViewProduct.title}
                className="w-full h-full object-cover"
              />
              {quickViewProduct.isNewArrival && (
                <span className="absolute top-3 left-3 px-3 py-1 text-xs font-bold uppercase tracking-wider gold-gradient-bg text-neutral-950 rounded-md shadow">
                  New Arrival
                </span>
              )}
            </div>

            {quickViewProduct.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {quickViewProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(idx)}
                    className={`relative w-16 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImg === idx ? 'border-amber-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col h-full justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-semibold mb-2">
                <span>{quickViewProduct.category}</span>
                <span>•</span>
                <span className="font-mono text-neutral-400">{quickViewProduct.sku}</span>
              </div>

              <h2 className="font-cinzel text-xl md:text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                {quickViewProduct.title}
              </h2>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-bold font-cinzel text-neutral-900 dark:text-amber-300">
                  {settings.currencySymbol}{quickViewProduct.price.toLocaleString()}
                </span>
                {quickViewProduct.originalPrice && (
                  <span className="text-sm text-neutral-400 line-through font-mono">
                    {settings.currencySymbol}{quickViewProduct.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
                {quickViewProduct.description}
              </p>

              {/* Fabric & Work */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 mb-6">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-sans">Fabric:</span>
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{quickViewProduct.fabric}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-sans">Work Types:</span>
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{quickViewProduct.workType.join(', ')}</span>
                </div>
              </div>

              {/* Colors */}
              {quickViewProduct.availableColors && quickViewProduct.availableColors.length > 0 && (
                <div className="mb-6">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-2">Available Swatch Colors:</span>
                  <div className="flex items-center gap-2">
                    {quickViewProduct.availableColors.map((color, i) => (
                      <div key={i} className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs">
                        <span className="w-3.5 h-3.5 rounded-full border border-neutral-400 shadow-inner" style={{ backgroundColor: color.hex }}></span>
                        <span className="text-neutral-600 dark:text-neutral-400 text-[11px]">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setIsGuestModalOpen(true)}
                className="w-full py-3.5 px-5 gold-gradient-bg text-neutral-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-102 border border-amber-300"
              >
                <ShieldCheck className="w-4 h-4 text-neutral-950" />
                <span>Place Guest Order (Email / WhatsApp OTP)</span>
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    openWhatsAppInquiry(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  className="flex-1 py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider rounded-xl shadow flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Inquire on WhatsApp
                </button>

                <button
                  onClick={() => toggleWishlist(quickViewProduct.id)}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isSaved ? 'bg-amber-500 border-amber-500 text-neutral-950' : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-amber-500'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>

              <button
                onClick={() => {
                  const id = quickViewProduct.id;
                  setQuickViewProduct(null);
                  setCurrentPage('product-detail', id);
                }}
                className="w-full py-3 px-5 bg-neutral-900 dark:bg-amber-500/10 text-amber-400 hover:bg-neutral-800 font-semibold text-xs rounded-xl border border-amber-500/30 flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
              >
                View Full Product Specs & 360° Rotation
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <GuestCheckoutModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        product={quickViewProduct}
      />
    </div>
  );
};
