import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export const FeaturedCategories: React.FC = () => {
  const { categories, setCurrentPage, setCategoryFilter } = useApp();

  const featuredCats = categories.filter(c => c.featured).slice(0, 8);

  const handleCategoryClick = (catName: string) => {
    setCategoryFilter(catName);
    setCurrentPage('categories');
  };

  return (
    <section className="py-20 bg-neutral-50 dark:bg-neutral-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Artisanal Collections
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
            Explore Product Categories
          </h2>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto rounded-full" />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCats.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-amber-500/10 hover:border-amber-500/40 transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

              <div className="absolute inset-x-5 bottom-5 flex flex-col justify-end text-white">
                <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider mb-1">
                  {cat.itemCount} Designs
                </span>
                <h3 className="font-cinzel text-lg font-bold group-hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>{cat.name}</span>
                  <ArrowUpRight className="w-5 h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-neutral-300 line-clamp-1 mt-1 opacity-90 font-sans">
                  {cat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => setCurrentPage('categories')}
            className="px-8 py-3.5 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-amber-300 border border-amber-500/30 font-semibold text-xs uppercase tracking-wider hover:bg-amber-500 hover:text-neutral-950 transition-all shadow-md"
          >
            View All 17 Categories
          </button>
        </div>

      </div>
    </section>
  );
};
