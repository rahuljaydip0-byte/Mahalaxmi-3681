import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/common/ProductCard';
import { Crown, Sparkles } from 'lucide-react';

export const LuxuryCollectionPage: React.FC = () => {
  const { products } = useApp();

  const luxuryProducts = products.filter(p => 
    p.category === 'Luxury Collection' || 
    p.collections.includes('Luxury Collection')
  );

  return (
    <div className="py-12 bg-neutral-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-16 mb-16 bg-neutral-950 border border-amber-500/40 text-center shadow-2xl">
          <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 font-mono text-xs uppercase tracking-widest">
              <Crown className="w-4 h-4 text-amber-400" />
              Limited Masterpiece Edition
            </div>
            <h1 className="font-cinzel text-3xl sm:text-5xl font-bold">
              Luxury Embroidery Line
            </h1>
            <p className="text-sm text-neutral-300 leading-relaxed font-sans">
              Handcrafted in limited seasonal runs with over 200 artisan needle hours per design. Featuring multi-layered cutwork lace, dabka wire, and high-shine sequins.
            </p>
          </div>
        </div>

        {/* Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {luxuryProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </div>
  );
};
