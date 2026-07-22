import React from 'react';
import { useApp } from '../context/AppContext';
import { HeroBannerSlider } from '../components/home/HeroBanner';
import { FeaturedCategories } from '../components/home/FeaturedCategories';
import { EmbroideryVideoShowcase } from '../components/home/EmbroideryVideoShowcase';
import { WhyChooseUs } from '../components/home/WhyChooseUs';
import { CustomerReviews } from '../components/home/CustomerReviews';
import { InstagramFeed } from '../components/home/InstagramFeed';
import { ProductCard } from '../components/common/ProductCard';
import { VirtualShowroom3D } from '../components/three/VirtualShowroom3D';
import { EmbroideryParticles3D } from '../components/three/EmbroideryParticles3D';
import { Sparkles, ArrowRight, Crown, MessageCircle, Heart, Award } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { products, setCurrentPage, openWhatsAppInquiry } = useApp();

  const featuredProds = products.filter(p => p.isFeatured && p.status === 'published').slice(0, 4);
  const trendingProds = products.filter(p => p.isTrending && p.status === 'published').slice(0, 4);
  const newArrivals = products.filter(p => p.isNewArrival && p.status === 'published').slice(0, 4);
  const bridalProds = products.filter(p => p.category === 'Bridal Embroidery' || p.collections.includes('Bridal Collection')).slice(0, 3);
  const internationalProds = products.filter(p => p.category === 'Arabic Floral Embroidery' || p.collections.includes('International Collection')).slice(0, 3);

  return (
    <div className="space-y-0">
      
      {/* 1. Luxury Hero Banner Slider */}
      <HeroBannerSlider />

      {/* 2. Featured Categories */}
      <FeaturedCategories />

      {/* 2.5 Immersive 3D Virtual Showroom */}
      <section className="py-20 bg-neutral-950 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold font-mono">
              Immersive WebGL Experience
            </span>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white">
              Virtual 3D Fashion Showroom
            </h2>
            <p className="text-xs text-neutral-400">
              Explore our luxury atelier in real-time 3D. Rotate collections, inspect metallic Zardozi threads, and experience haute couture digitally.
            </p>
          </div>

          <VirtualShowroom3D onSelectCategory={(cat) => setCurrentPage('categories')} />
        </div>
      </section>

      {/* 3. Featured Haute Couture Embroidery */}
      <section className="py-20 bg-white dark:bg-neutral-900 border-b border-amber-500/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold mb-2">
                <Crown className="w-4 h-4" />
                Artisanal Masterpieces
              </div>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
                Featured Embroidery
              </h2>
            </div>

            <button
              onClick={() => setCurrentPage('categories')}
              className="px-6 py-3 rounded-xl bg-neutral-900 dark:bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-neutral-800 transition-all shrink-0"
            >
              <span>Explore All Designs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProds.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

        </div>
      </section>

      {/* 4. Dedicated Bridal Collection Spotlight */}
      <section className="py-24 bg-neutral-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs uppercase tracking-widest inline-block">
                Royal Heritage Series
              </span>
              <h2 className="font-cinzel text-3xl sm:text-5xl font-bold text-white leading-tight">
                Bridal Embroidery Collection
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                Crown jewel lehenga panels, royal Dupattas, and heavy Zardozi necklines crafted with pure gold metallic wire, hand-strung pearls, and Swarovski stones.
              </p>
              
              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => setCurrentPage('bridal')}
                  className="px-6 py-3.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-xl flex items-center gap-2"
                >
                  Explore Bridal Line
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {bridalProds.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 5. Trending Designs */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
              Most Coveted By Fashion Houses
            </span>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
              Trending Embroidery Patterns
            </h2>
            <div className="w-16 h-0.5 bg-amber-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProds.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

        </div>
      </section>

      {/* 6. International Arabic Collection Spotlight */}
      <section className="py-20 bg-white dark:bg-neutral-900 border-y border-neutral-100 dark:border-neutral-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 order-2 lg:order-1">
              {internationalProds.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs uppercase tracking-widest inline-block">
                Dubai • Riyadh • London • New York
              </span>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white leading-tight">
                International Arabic Collection
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
                Precision-engineered fluid floral vines, micro-sequins borders, and crystal appliques tailored for Middle Eastern Abayas, Kaftans, and Western high-fashion gowns.
              </p>

              <button
                onClick={() => setCurrentPage('international')}
                className="px-6 py-3.5 rounded-xl bg-neutral-900 dark:bg-amber-500 text-amber-300 dark:text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-110 transition-all shadow-xl"
              >
                View International Catalogue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 7. Video Showcase */}
      <EmbroideryVideoShowcase />

      {/* 8. New Arrivals Grid */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold block mb-2">
                Fresh From Workshop
              </span>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
                New Arrivals
              </h2>
            </div>

            <button
              onClick={() => setCurrentPage('new-arrivals')}
              className="px-6 py-3 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-amber-500 hover:text-neutral-950 transition-all shrink-0"
            >
              See All New Arrivals
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

        </div>
      </section>

      {/* 9. Why Choose Us */}
      <WhyChooseUs />

      {/* 10. Customer Reviews */}
      <CustomerReviews />

      {/* 11. WhatsApp Direct CTA Banner */}
      <section className="py-16 gold-gradient-bg text-neutral-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest font-mono text-neutral-800">
              Direct Artisanal Concierge
            </span>
            <h2 className="font-cinzel text-2xl sm:text-4xl font-extrabold">
              Need Custom Embroidery Specs or Swatch Samples?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-800 font-medium">
              Connect directly with Mahalakshmi Creation on WhatsApp for instant catalog PDFs and pricing.
            </p>
          </div>

          <button
            onClick={() => openWhatsAppInquiry(undefined, "Hello Mahalakshmi Creation, I would like to request swatch samples and full catalog details.")}
            className="px-8 py-4 rounded-full bg-neutral-950 text-amber-300 hover:text-white font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            <MessageCircle className="w-5 h-5 text-emerald-400 fill-current" />
            <span>Chat On WhatsApp</span>
          </button>
        </div>
      </section>

      {/* 12. Instagram Feed */}
      <InstagramFeed />

    </div>
  );
};
