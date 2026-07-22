import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, ArrowRight, Sparkles, Camera, Upload, Filter, Check, Image as ImageIcon } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    searchQuery, 
    setSearchQuery, 
    products, 
    setCurrentPage,
    categories,
    formatPrice 
  } = useApp();

  const [aiImageSearching, setAiImageSearching] = useState(false);
  const [selectedFabricFilter, setSelectedFabricFilter] = useState<string>('All');
  const [selectedWorkFilter, setSelectedWorkFilter] = useState<string>('All');
  const [aiDetectedTag, setAiDetectedTag] = useState<string | null>(null);

  if (!isSearchOpen) return null;

  // Handle AI Image Upload Simulation
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiImageSearching(true);
    setAiDetectedTag(null);

    // Simulate AI Vision Analysis of Embroidery Motif
    setTimeout(() => {
      setAiImageSearching(false);
      const tags = ['Zardozi', 'Mirror Work', 'Bridal Floral', 'Peacock Motif', 'Cutwork'];
      const randomTag = tags[Math.floor(Math.random() * tags.length)];
      setAiDetectedTag(randomTag);
      setSearchQuery(randomTag);
    }, 1200);
  };

  const filteredProducts = products.filter(p => {
    const matchesQuery = searchQuery.trim() === '' || (
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fabric.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.workType.some(w => w.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const matchesFabric = selectedFabricFilter === 'All' || p.fabric.toLowerCase().includes(selectedFabricFilter.toLowerCase());
    const matchesWork = selectedWorkFilter === 'All' || p.workType.some(w => w.toLowerCase().includes(selectedWorkFilter.toLowerCase()));

    return matchesQuery && matchesFabric && matchesWork;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-amber-500/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-100 dark:border-neutral-800 space-y-4">
          <div className="flex items-center gap-3">
            <Search className="w-6 h-6 text-amber-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search neck embroidery, bridal lehengas, zari work, SKU..."
              className="w-full bg-transparent text-base sm:text-lg font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none font-sans"
              autoFocus
            />

            {/* AI Image Search Trigger */}
            <label 
              className="p-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 transition-colors"
              title="Search Embroidery by Uploading Image / Sketch"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">AI Image Search</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </label>

            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setAiDetectedTag(null);
                }}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => setIsSearchOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-amber-500 border border-neutral-200 dark:border-neutral-800 rounded-xl"
            >
              Esc
            </button>
          </div>

          {/* AI Detection Banner */}
          {aiImageSearching && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 flex items-center gap-2 animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Analyzing uploaded image motif, zari density & fabric weave with AI Vision...</span>
            </div>
          )}

          {aiDetectedTag && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                AI Vision Detected Motif Pattern: <strong>#{aiDetectedTag}</strong>
              </span>
              <button
                onClick={() => {
                  setAiDetectedTag(null);
                  setSearchQuery('');
                }}
                className="text-neutral-400 hover:text-white text-[10px] uppercase font-bold"
              >
                Clear AI Tag
              </button>
            </div>
          )}

          {/* Quick Filters Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <span className="text-neutral-400 font-mono flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </span>

            {/* Fabric Filter */}
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-lg">
              <span className="text-neutral-500">Fabric:</span>
              <select
                value={selectedFabricFilter}
                onChange={(e) => setSelectedFabricFilter(e.target.value)}
                className="bg-transparent text-neutral-900 dark:text-white font-bold focus:outline-none"
              >
                <option value="All">All Fabrics</option>
                <option value="Raw Silk">Raw Silk</option>
                <option value="Organza">Organza</option>
                <option value="Velvet">Velvet</option>
                <option value="Georgette">Georgette</option>
                <option value="Chiffon">Chiffon</option>
              </select>
            </div>

            {/* Work Type Filter */}
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-lg">
              <span className="text-neutral-500">Work:</span>
              <select
                value={selectedWorkFilter}
                onChange={(e) => setSelectedWorkFilter(e.target.value)}
                className="bg-transparent text-neutral-900 dark:text-white font-bold focus:outline-none"
              >
                <option value="All">All Work Types</option>
                <option value="Zardozi">Zardozi</option>
                <option value="Mirror">Mirror Work</option>
                <option value="Kundan">Kundan & Stone</option>
                <option value="Cutwork">Cutwork</option>
                <option value="Resham">Resham Silk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {searchQuery.trim() === '' && !aiDetectedTag ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Popular Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 8).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setCurrentPage('categories');
                      }}
                      className="px-3.5 py-1.5 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/30 border border-transparent transition-all"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-400 mb-3">
                  Quick Search Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['Bridal', 'Zardozi', 'Arabic Floral', 'Mirror Work', 'Velvet Couture', 'Dupatta Border'].map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1 text-xs rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-amber-500 underline underline-offset-4"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span>Found <strong>{filteredProducts.length}</strong> matching embroidery items</span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-sm">
                  No embroidery designs match your search filters. Try searching for "Zardozi", "Mirror", or uploading a design photo.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setCurrentPage('product-detail', p.id);
                      }}
                      className="group p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 hover:border-amber-500/50 transition-all cursor-pointer flex gap-3 items-center"
                    >
                      <img 
                        src={p.images[0]} 
                        alt={p.title} 
                        className="w-16 h-20 object-cover rounded-xl shrink-0 group-hover:scale-105 transition-transform" 
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono text-amber-500 font-bold uppercase">{p.sku}</span>
                        <h5 className="font-serif font-bold text-xs text-neutral-900 dark:text-white truncate group-hover:text-amber-500 transition-colors">
                          {p.title}
                        </h5>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                          {p.fabric} • {p.category}
                        </p>
                        <p className="text-xs font-mono font-bold text-neutral-900 dark:text-amber-300 mt-1">
                          {formatPrice(p.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
