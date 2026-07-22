import React from 'react';
import { useApp } from '../../context/AppContext';
import { Instagram, Heart, Sparkles, ExternalLink, Crown } from 'lucide-react';

export const InstagramFeed: React.FC = () => {
  const { settings } = useApp();

  const brandTags = [
    { tag: "RoyalZardozi", subtitle: "Handcrafted Heritage" },
    { tag: "ArabicCouture", subtitle: "Gulf & Dubai Line" },
    { tag: "NecklineDesigns", subtitle: "Precision Cutwork" },
    { tag: "BridalLehenga", subtitle: "Custom Atelier" },
    { tag: "AtelierJournal", subtitle: "Behind The Craft" }
  ];

  return (
    <section className="py-16 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold block mb-1">
              Follow Our Official Instagram
            </span>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Instagram className="w-6 h-6 text-amber-500" />
              @mahalakshmicreation_official
            </h2>
          </div>

          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md shrink-0 flex items-center gap-2"
          >
            <span>Follow on Instagram</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {brandTags.map((item, idx) => (
            <a
              key={idx}
              href={settings.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-amber-500/20 p-5 flex flex-col justify-between hover:border-amber-500 transition-all shadow-lg text-white"
            >
              <div className="flex items-center justify-between text-amber-400">
                <Crown className="w-5 h-5" />
                <Instagram className="w-4 h-4 text-neutral-400 group-hover:text-amber-400 transition-colors" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-amber-300 block">
                  #{item.tag}
                </span>
                <span className="text-[10px] text-neutral-400 font-sans block line-clamp-1">
                  {item.subtitle}
                </span>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                <span className="group-hover:text-amber-300 transition-colors">View Post</span>
                <Sparkles className="w-3 h-3 text-amber-400/60" />
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
};
