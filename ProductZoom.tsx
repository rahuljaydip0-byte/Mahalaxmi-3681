import React, { useState, useRef } from 'react';
import { ZoomIn, Sparkles, Layers, Search, Eye } from 'lucide-react';

interface ProductZoomProps {
  src: string;
  alt: string;
}

export const ProductZoom: React.FC<ProductZoomProps> = ({ src, alt }) => {
  const [zoom, setZoom] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50, cursorX: 0, cursorY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    // Calculate cursor position in relative percentages (0 - 100%)
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    
    // Pixel coordinates for lens box overlay placement
    const cursorX = e.clientX - left;
    const cursorY = e.clientY - top;

    setPosition({ x, y, cursorX, cursorY });
  };

  return (
    <div className="relative w-full">
      {/* Main Image Viewport with Hover Lens */}
      <div
        ref={containerRef}
        className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-950 border border-[#E5E1D8] dark:border-neutral-800 cursor-crosshair shadow-md group select-none"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-200"
        />

        {/* Floating Lens Box on Main Image */}
        {zoom && (
          <div
            className="absolute w-36 h-36 border-2 border-[#D4AF37] bg-[#D4AF37]/10 backdrop-blur-[1px] pointer-events-none rounded-xl shadow-lg -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
            }}
          >
            {/* Corner Markers */}
            <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-[#D4AF37]" />
            <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-[#D4AF37]" />
            <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-[#D4AF37]" />
            <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-[#D4AF37]" />
            <div className="w-2 h-2 bg-[#D4AF37]/60 rounded-full animate-ping" />
          </div>
        )}

        {/* In-place Loupe Zoom Fallback for Mobile / Quick view */}
        {zoom && (
          <div className="block lg:hidden absolute inset-0 pointer-events-none z-10">
            <div
              className="w-full h-full bg-no-repeat"
              style={{
                backgroundImage: `url(${src})`,
                backgroundPosition: `${position.x}% ${position.y}%`,
                backgroundSize: '350%'
              }}
            />
          </div>
        )}

        {/* Hover Prompt Badge */}
        {!zoom && (
          <div className="absolute bottom-4 right-4 z-10 px-3.5 py-2 rounded-full bg-white/90 dark:bg-neutral-900/90 text-[#1A1A1A] dark:text-amber-300 text-xs font-semibold backdrop-blur-md border border-[#E5E1D8] dark:border-amber-500/30 flex items-center gap-2 shadow-lg pointer-events-none">
            <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Hover to inspect hand embroidery</span>
          </div>
        )}
      </div>

      {/* Side Pane Magnifier Window (Desktop - Floating Side Panel) */}
      {zoom && (
        <div className="hidden lg:block absolute left-[103%] top-0 z-50 w-[420px] h-[520px] rounded-3xl overflow-hidden bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border-2 border-[#D4AF37] shadow-2xl transition-all duration-150 animate-in fade-in zoom-in-95">
          {/* Header Bar */}
          <div className="h-12 px-4 bg-neutral-900 text-white flex items-center justify-between border-b border-amber-500/20">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Embroidery Detail Pane</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-400">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                3.8x Zoom
              </span>
              <span>X:{Math.round(position.x)}% Y:{Math.round(position.y)}%</span>
            </div>
          </div>

          {/* Zoomed Canvas */}
          <div className="relative w-full h-[calc(100%-48px)] overflow-hidden bg-neutral-950">
            <div
              className="w-full h-full bg-no-repeat transition-all duration-75 ease-out"
              style={{
                backgroundImage: `url(${src})`,
                backgroundPosition: `${position.x}% ${position.y}%`,
                backgroundSize: '380%'
              }}
            />

            {/* Fine Alignment Crosshair Overlay */}
            <div className="absolute inset-0 pointer-events-none border border-amber-500/10 flex items-center justify-center">
              <div className="w-full h-[1px] bg-amber-500/20" />
              <div className="h-full w-[1px] bg-amber-500/20 absolute" />
            </div>

            {/* Micro Detail Overlay Label */}
            <div className="absolute bottom-3 left-3 right-3 bg-neutral-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-amber-500/30 text-amber-200 text-[11px] flex items-center justify-between font-serif">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                Zari, Bead & Thread Texture
              </span>
              <span className="text-[10px] font-mono text-amber-400/80">HD Precision</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

