import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/common/ProductCard';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { wishlistIds, products, setCurrentPage } = useApp();

  const savedProducts = products.filter(p => wishlistIds.includes(p.id));

  return (
    <div className="py-16 bg-neutral-50 dark:bg-neutral-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
            <Heart className="w-4 h-4 text-amber-500 fill-current" />
            Your Saved Curations
          </div>
          <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
            Saved Wishlist ({savedProducts.length})
          </h1>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto rounded-full" />
        </div>

        {savedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 max-w-lg mx-auto p-8 shadow-sm">
            <Heart className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
            <h3 className="font-cinzel text-lg font-bold text-neutral-800 dark:text-white mb-2">
              Your Saved Wishlist is Currently Empty
            </h3>
            <p className="text-xs text-neutral-500 mb-6 font-sans">
              Click the heart icon on any embroidery design to save it for quick review or bulk WhatsApp inquiry.
            </p>
            <button
              onClick={() => setCurrentPage('categories')}
              className="px-6 py-3 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 mx-auto"
            >
              <span>Explore Embroidery Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
