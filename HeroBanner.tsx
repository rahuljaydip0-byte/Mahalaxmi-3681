import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowRight, MessageCircle, ChevronLeft, ChevronRight, Crown } from 'lucide-react';

export const HeroBannerSlider: React.FC = () => {
  const { heroBanners, setCurrentPage, openWhatsAppInquiry } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const activeBanners = heroBanners.filter(b => b.active);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const slide = activeBanners[currentSlide] || activeBanners[0];

  return (
    <section className="relative w-full h-[85vh] min-h-[580px] max-h-[820px] overflow-hidden bg-neutral-950 text-white">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          key={slide.id}
          src={slide.imageUrl}
          alt={slide.title}
          className="w-full h-full object-cover object-center scale-105 animate-in fade-in zoom-in-95 duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
      </div>

      {/* Hero Content with Frosted Glass Card */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-2xl bg-white/75 dark:bg-neutral-900/80 backdrop-blur-2xl border border-white/60 dark:border-white/10 p-8 sm:p-12 rounded-3xl shadow-2xl space-y-6">
          
          {/* Tag */}
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-12 bg-[#D4AF37]"></div>
            <span className="text-[12px] uppercase tracking-[0.35em] text-[#D4AF37] font-semibold italic">
              {slide.tag || "Artistry in every thread"}
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#1A1A1A] dark:text-white drop-shadow-sm">
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#555] dark:text-neutral-300 max-w-lg leading-relaxed font-light">
            {slide.subtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => setCurrentPage(slide.ctaLink as any)}
              className="px-8 py-4 bg-[#1A1A1A] dark:bg-[#D4AF37] text-white dark:text-neutral-950 rounded-full text-xs uppercase tracking-[0.2em] font-bold shadow-xl shadow-black/10 hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>{slide.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => openWhatsAppInquiry(undefined, `Hello Mahalakshmi Creation, I am interested in inquiring about ${slide.title}`)}
              className="px-8 py-4 bg-[#25D366] hover:bg-[#22c35e] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-full flex items-center gap-2 shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{slide.secondaryCtaText || 'WhatsApp Inquiry'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Slide Navigation Controls */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3">
          <button
            onClick={() => setCurrentSlide(prev => (prev - 1 + activeBanners.length) % activeBanners.length)}
            className="p-3 rounded-full bg-neutral-900/80 text-amber-400 hover:bg-neutral-800 border border-amber-500/30 backdrop-blur-md transition-colors"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-2">
            {activeBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === i ? 'w-8 bg-amber-400' : 'w-2 bg-neutral-600 hover:bg-neutral-400'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide(prev => (prev + 1) % activeBanners.length)}
            className="p-3 rounded-full bg-neutral-900/80 text-amber-400 hover:bg-neutral-800 border border-amber-500/30 backdrop-blur-md transition-colors"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  );
};
