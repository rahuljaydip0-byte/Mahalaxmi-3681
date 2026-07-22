import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/common/ProductCard';
import { Sparkles } from 'lucide-react';

export const NewArrivalsPage: React.FC = () => {
  const { products } = useApp();

  const newProducts = products.filter(p => p.isNewArrival);

  return (
    <div className="py-12 bg-neutral-50 dark:bg-neutral-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
            <Sparkles className="w-4 h-4" /> Fresh Off The Embroidery Loom
          </div>
          <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
            New Arrivals 2026
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
            Be the first to browse our latest released necklines, front panels, and dupatta border laces.
          </p>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto rounded-full" />
        </div>

        {/* Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </div>
  );
};
