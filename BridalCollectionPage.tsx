import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/common/ProductCard';
import { Crown, Sparkles, Heart } from 'lucide-react';

export const BridalCollectionPage: React.FC = () => {
  const { products } = useApp();

  const bridalProducts = products.filter(p => 
    p.category === 'Bridal Embroidery' || 
    p.collections.includes('Bridal Collection')
  );

  return (
    <div className="py-12 bg-neutral-950 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-16 mb-16 bg-neutral-900 border border-amber-500/30 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
          <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-950 border border-amber-500/40 text-amber-300 font-mono text-xs uppercase tracking-widest">
              <Crown className="w-4 h-4 text-amber-400" />
              Royal Maharani Heritage
            </div>
            <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-white">
              Bridal Embroidery Collection
            </h1>
            <p className="text-sm text-neutral-300 leading-relaxed font-sans">
              Designed for the regal bride. Hand-sculpted Zardozi, real pearls, Swaroop mirrors, and antique gold threadwork woven on pure German velvet & raw silks.
            </p>
          </div>
        </div>

        {/* Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {bridalProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </div>
  );
};
