import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GalleryItem } from '../types';
import { Play, Eye, X, LayoutGrid, Grid3X3, Sparkles, Image as ImageIcon } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const { gallery } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'masonry'>('grid');

  const categories = ['all', ...Array.from(new Set(gallery.map(g => g.category)))];

  const filteredGallery = selectedCategory === 'all' 
    ? gallery 
    : gallery.filter(g => g.category === selectedCategory);

  return (
    <div className="py-12 bg-neutral-950 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs uppercase tracking-widest inline-block">
            Atelier Visual Showcase
          </span>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-white">
            High-Resolution Gallery
          </h1>
          <p className="text-sm text-neutral-300 leading-relaxed font-sans">
            Witness needlework precision, crystal refraction, and artisan workshop processes in ultra-high resolution.
          </p>
        </div>

        {/* Filter Bar & Layout Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-neutral-800">
          
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                  selectedCategory === cat
                    ? 'gold-gradient-bg text-neutral-950 font-bold border-amber-500 shadow-md'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-amber-500/40'
                }`}
              >
                {cat === 'all' ? 'All Showcase' : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-neutral-900 p-1.5 rounded-xl border border-neutral-800 shrink-0">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                layoutMode === 'grid' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('masonry')}
              className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                layoutMode === 'masonry' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Masonry View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Gallery Grid */}
        {filteredGallery.length === 0 ? (
          <div className="text-center py-24 bg-neutral-900/40 rounded-3xl border border-neutral-800 space-y-3">
            <ImageIcon className="w-12 h-12 text-neutral-600 mx-auto" />
            <h3 className="font-cinzel text-lg font-bold text-neutral-300">No Showcase Media Found</h3>
            <p className="text-xs text-neutral-400 font-sans max-w-sm mx-auto">
              All demo photos and videos have been removed. You can upload custom high-resolution photos and videos from the Super Admin Dashboard.
            </p>
          </div>
        ) : (
          <div className={
            layoutMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
          }>
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className="group relative rounded-2xl overflow-hidden bg-neutral-900 border border-amber-500/20 cursor-pointer shadow-xl transition-all duration-300 hover:border-amber-500/60 break-inside-avoid"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-neutral-950/40 group-hover:bg-neutral-950/20 transition-colors" />

                  {item.type === 'video' && (
                    <div className="absolute top-3 right-3 p-2.5 rounded-full bg-amber-500 text-neutral-950 shadow-lg">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                  )}

                  <div className="absolute inset-x-4 bottom-4 z-10 text-white">
                    <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest block mb-1">
                      {item.category}
                    </span>
                    <h3 className="font-cinzel text-base font-bold group-hover:text-amber-300 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fullscreen Preview Modal */}
        {activeItem && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-xl animate-in fade-in duration-200"
            onClick={() => setActiveItem(null)}
          >
            <div 
              className="relative max-w-4xl w-full bg-neutral-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl p-6 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-300 hover:text-white transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {activeItem.type === 'video' && activeItem.videoUrl ? (
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black mb-4">
                  <video src={activeItem.videoUrl} controls autoPlay className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="max-h-[70vh] w-full rounded-2xl overflow-hidden bg-black mb-4">
                  <img src={activeItem.imageUrl} alt={activeItem.title} className="w-full h-full object-contain mx-auto" />
                </div>
              )}

              <div className="space-y-2">
                <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                  {activeItem.category}
                </span>
                <h3 className="font-cinzel text-xl font-bold text-white">
                  {activeItem.title}
                </h3>
                {activeItem.description && (
                  <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                    {activeItem.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
