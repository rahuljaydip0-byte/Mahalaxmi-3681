import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/common/ProductCard';
import { Globe2, Sparkles } from 'lucide-react';

export const InternationalCollectionPage: React.FC = () => {
  const { products } = useApp();

  const internationalProducts = products.filter(p => 
    p.category === 'International Collection' || 
    p.category === 'Arabic Floral Embroidery' ||
    p.collections.includes('International Collection')
  );

  return (
    <div className="py-12 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-16 mb-16 bg-gradient-to-r from-emerald-950 via-neutral-900 to-neutral-950 border border-emerald-500/30 text-white text-center shadow-2xl">
          <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono text-xs uppercase tracking-widest">
              <Globe2 className="w-4 h-4 text-emerald-400" />
              GCC • European Haute Couture
            </div>
            <h1 className="font-cinzel text-3xl sm:text-5xl font-bold">
              International Collection
            </h1>
            <p className="text-sm text-neutral-300 leading-relaxed font-sans">
              Refined Middle Eastern Arabesque vines, crystal embellishments, and lightweight cutwork appliques crafted for designer boutiques across Dubai, London, Riyadh, and New York.
            </p>
          </div>
        </div>

        {/* Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {internationalProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </div>
  );
};
