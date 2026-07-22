import React from 'react';
import { useApp } from '../context/AppContext';
import { Crown, Award, Scissors, Users, Globe2, Sparkles, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { settings, setCurrentPage } = useApp();

  return (
    <div className="py-16 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-xs uppercase tracking-widest inline-block">
            Artisanal Heritage Since 1998
          </span>
          <h1 className="font-cinzel text-4xl sm:text-5xl font-bold">
            About {settings.brandName}
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
            Where centuries-old Indian needlecraft meets modern global haute couture.
          </p>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto rounded-full" />
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-amber-500/20">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop"
              alt="Artisan at work"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-neutral-950/20" />
            <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-neutral-950/80 backdrop-blur-md border border-amber-500/30 text-white space-y-1">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block">
                Master Craftsmen Workshop
              </span>
              <p className="font-cinzel text-sm font-semibold">
                Surat, Gujarat • The Textile Capital of India
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <Crown className="w-4 h-4" />
              Our Royal Legacy
            </div>

            <h2 className="font-cinzel text-3xl font-bold leading-tight">
              Preserving Royal Mughal & Kashmiri Embroidery Craft
            </h2>

            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
              Founded in Surat, Gujarat, <strong>{settings.brandName}</strong> has spent nearly three decades creating world-class embroidery for royal families, luxury boutiques, international fashion houses, and discerning brides across the globe.
            </p>

            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
              Our workshop houses over 120 skilled master artisans specializing in authentic hand Zardozi, dabka wire, Kashmiri Resham, cutwork lace, Swaroop mirrorwork, and multi-head precision machine embroidery.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <div className="space-y-1">
                <span className="font-cinzel text-2xl font-bold text-amber-600 dark:text-amber-400">120+</span>
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-mono">Master Artisans</p>
              </div>
              <div className="space-y-1">
                <span className="font-cinzel text-2xl font-bold text-amber-600 dark:text-amber-400">35+</span>
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-mono">Countries Exported</p>
              </div>
            </div>

            <button
              onClick={() => setCurrentPage('contact')}
              className="px-6 py-3.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all"
            >
              Contact Our Atelier
            </button>
          </div>
        </div>

        {/* Quality Standards */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-12 border border-amber-500/20 luxury-card-shadow">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h3 className="font-cinzel text-2xl font-bold">
              Our Uncompromising Standards
            </h3>
            <p className="text-xs text-neutral-500 font-sans">
              Every garment and panel engineered at Mahalakshmi Creation follows strict artisanal protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center text-neutral-950 font-bold font-cinzel">
                01
              </div>
              <h4 className="font-cinzel text-base font-bold">Pure Metallic Threads</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                We use non-tarnish gold and silver zari metallic wires tested for color longevity under diverse climates.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center text-neutral-950 font-bold font-cinzel">
                02
              </div>
              <h4 className="font-cinzel text-base font-bold">Real Glass & Crystals</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Genuine Swaroop convex glass mirrors and high-refraction Swarovski stones hand-clawed onto fabric.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center text-neutral-950 font-bold font-cinzel">
                03
              </div>
              <h4 className="font-cinzel text-base font-bold">Laser Precision Cutwork</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Scalloped border edges and dupatta laces reinforced with thermal cutwork sealing to prevent fraying.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
