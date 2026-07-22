import React from 'react';
import { useApp } from '../context/AppContext';
import { CollectionItem } from '../types';
import { ArrowRight, Sparkles, Crown } from 'lucide-react';

export const CollectionsPage: React.FC = () => {
  const { collections, setCurrentPage, setCollectionFilter } = useApp();

  const handleCollectionSelect = (name: string) => {
    setCollectionFilter(name);
    if (name === 'Bridal Collection') setCurrentPage('bridal');
    else if (name === 'International Collection') setCurrentPage('international');
    else if (name === 'Luxury Collection') setCurrentPage('luxury');
    else setCurrentPage('categories');
  };

  return (
    <div className="py-16 bg-neutral-50 dark:bg-neutral-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-xs uppercase tracking-widest inline-block">
            High Couture Thematic Editions
          </span>
          <h1 className="font-cinzel text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white">
            Our Designer Collections
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
            Explore curated design philosophies ranging from traditional royal Mughal heritage to modern Middle Eastern arabesque cutwork.
          </p>
        </div>

        {/* Collections List */}
        <div className="space-y-12">
          {collections.map((col, idx) => (
            <div
              key={col.id}
              onClick={() => handleCollectionSelect(col.name)}
              className="group relative rounded-3xl overflow-hidden bg-neutral-900 text-white shadow-2xl border border-amber-500/20 cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0 hover:border-amber-500/50 transition-all duration-300"
            >
              <div className={`lg:col-span-7 aspect-[16/9] lg:aspect-auto relative overflow-hidden ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                <img
                  src={col.bannerImage}
                  alt={col.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-neutral-950/30 group-hover:bg-neutral-950/10 transition-colors" />
              </div>

              <div className={`lg:col-span-5 p-8 md:p-12 flex flex-col justify-center space-y-6 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="inline-flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-widest">
                  <Crown className="w-4 h-4" />
                  {col.productCount} Signature Pieces
                </div>

                <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-white group-hover:text-amber-300 transition-colors">
                  {col.name}
                </h2>

                <p className="text-amber-200/90 font-serif italic text-sm">
                  "{col.tagline}"
                </p>

                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  {col.description}
                </p>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 group-hover:translate-x-2 transition-transform">
                    Explore Line
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
