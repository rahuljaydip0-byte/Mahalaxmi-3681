import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/common/ProductCard';
import { Filter, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { ProductCategory } from '../types';

export const CategoriesPage: React.FC = () => {
  const { 
    products, 
    categories, 
    categoryFilter, 
    setCategoryFilter, 
    collectionFilter, 
    setCollectionFilter 
  } = useApp();

  const [selectedWork, setSelectedWork] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'alphabetical'>('newest');

  // Filter products
  const filteredProducts = products.filter(product => {
    if (product.status !== 'published') return false;
    
    if (categoryFilter && categoryFilter !== 'all' && product.category !== categoryFilter) {
      return false;
    }

    if (collectionFilter && collectionFilter !== 'all' && !product.collections.includes(collectionFilter as any)) {
      return false;
    }

    if (selectedWork !== 'all' && !product.workType.includes(selectedWork as any)) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="py-12 bg-neutral-50 dark:bg-neutral-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
            Haute Couture Catalog
          </span>
          <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
            {categoryFilter && categoryFilter !== 'all' ? categoryFilter : 'All Product Categories'}
          </h1>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto rounded-full" />
        </div>

        {/* Categories Tab Bar (Scrollable 17 categories) */}
        <div className="mb-8 overflow-x-auto pb-4 scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                !categoryFilter || categoryFilter === 'all'
                  ? 'gold-gradient-bg text-neutral-950 font-bold border-amber-500 shadow-md'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-amber-500/40'
              }`}
            >
              All Categories ({products.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.name)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                  categoryFilter === cat.name
                    ? 'gold-gradient-bg text-neutral-950 font-bold border-amber-500 shadow-md'
                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-amber-500/40'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Work Type & Sort Filters bar */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 mb-8 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4" />
              Work Type:
            </div>

            <select
              value={selectedWork}
              onChange={(e) => setSelectedWork(e.target.value)}
              className="text-xs p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-amber-500 font-sans"
            >
              <option value="all">All Embroidery Techniques</option>
              <option value="Hand Embroidery">Hand Embroidery</option>
              <option value="Machine Embroidery">Machine Embroidery</option>
              <option value="Mirror Work">Mirror Work</option>
              <option value="Stone Work">Stone Work</option>
              <option value="Zari Work">Zari Work</option>
              <option value="Sequins Work">Sequins Work</option>
              <option value="Cutwork Embroidery">Cutwork Embroidery</option>
            </select>

            {(categoryFilter !== 'all' || collectionFilter !== 'all' || selectedWork !== 'all') && (
              <button
                onClick={() => {
                  setCategoryFilter('all');
                  setCollectionFilter('all');
                  setSelectedWork('all');
                }}
                className="px-3 py-2 text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500 uppercase tracking-wider font-mono">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-amber-500 font-sans"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="alphabetical">Alphabetical A-Z</option>
            </select>
          </div>

        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800">
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="font-cinzel text-xl font-bold text-neutral-800 dark:text-white mb-2">
              No Designs Found For Selected Criteria
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-6">
              Try resetting filters to explore our complete collection of haute couture embroidery.
            </p>
            <button
              onClick={() => {
                setCategoryFilter('all');
                setCollectionFilter('all');
                setSelectedWork('all');
              }}
              className="px-6 py-3 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider"
            >
              View All Designs
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
