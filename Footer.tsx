import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Crown, MapPin, Mail, Phone, MessageCircle, Send, ShieldCheck, Heart, Instagram, Facebook, Youtube } from 'lucide-react';
import { PageRoute } from '../../types';

export const Footer: React.FC = () => {
  const { setCurrentPage, settings, addToast } = useApp();
  const [emailInput, setEmailInput] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput) {
      addToast("Thank you for subscribing to Mahalakshmi Creation VIP Gazette", "success");
      setEmailInput('');
    }
  };

  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-amber-500/20 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-neutral-800">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gold-gradient-bg p-0.5">
                <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center text-amber-400">
                  <Crown className="w-5 h-5 fill-amber-400/20" />
                </div>
              </div>
              <div>
                <h3 className="font-cinzel text-lg font-bold tracking-wider text-white">
                  MAHALAKSHMI
                </h3>
                <p className="text-[9px] uppercase tracking-[0.25em] font-medium text-amber-400">
                  CREATION • COUTURE
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              {settings.tagline}. World-renowned artisans crafting haute couture hand embroidery, Zardozi, mirrorwork, and Middle Eastern arabesque designs.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a 
                href={settings.instagramUrl} 
                target="_blank" 
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-neutral-900 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors border border-neutral-800"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href={settings.facebookUrl} 
                target="_blank" 
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-neutral-900 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors border border-neutral-800"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href={settings.youtubeUrl} 
                target="_blank" 
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-neutral-900 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors border border-neutral-800"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-cinzel text-sm font-bold text-amber-300 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              {[
                { label: 'Home', route: 'home' },
                { label: 'Bridal Collection', route: 'bridal' },
                { label: 'International Collection', route: 'international' },
                { label: 'Luxury Collection', route: 'luxury' },
                { label: 'New Arrivals', route: 'new-arrivals' },
                { label: 'Gallery Showcase', route: 'gallery' },
                { label: 'About Artisans', route: 'about' },
                { label: 'Contact Us', route: 'contact' },
              ].map((item, i) => (
                <li key={i}>
                  <button
                    onClick={() => setCurrentPage(item.route as PageRoute)}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Categories */}
          <div className="space-y-3">
            <h4 className="font-cinzel text-sm font-bold text-amber-300 uppercase tracking-wider">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              {[
                'Neck Embroidery',
                'Front Panel',
                'Back Design',
                'Sleeves',
                'Dupatta Border',
                'Full Suit Embroidery',
                'Mirror Work',
                'Arabic Floral'
              ].map((cat, i) => (
                <li key={i}>
                  <button
                    onClick={() => setCurrentPage('categories')}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h4 className="font-cinzel text-sm font-bold text-amber-300 uppercase tracking-wider">
              Atelier Location
            </h4>
            
            <div className="space-y-2.5 text-xs text-neutral-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{settings.address}, {settings.cityCountry}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-amber-400">{settings.email}</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-amber-400">{settings.phone}</a>
              </div>
            </div>

            <form onSubmit={handleNewsletter} className="pt-2 space-y-2">
              <span className="text-[11px] text-neutral-400 block font-medium">Subscribe for Exclusive Swatches</span>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter email..."
                  className="w-full text-xs p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-400"
                  required
                />
                <button
                  type="submit"
                  className="p-2.5 gold-gradient-bg text-neutral-950 font-bold rounded-xl hover:brightness-110 transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* PWA App Download Info Badge */}
            <div className="p-3 bg-neutral-900/80 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-2 mt-2">
              <div className="flex items-center gap-2">
                <img src="/icon-192.png" alt="Mahalakshmi App" className="w-7 h-7 rounded-lg object-contain bg-neutral-950 border border-amber-500/20" />
                <div>
                  <span className="text-[11px] font-bold text-white block">Mahalakshmi App</span>
                  <span className="text-[9px] text-amber-400 font-mono">Progressive Web App • Offline Ready</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} {settings.brandName}. All Rights Reserved. Crafted with royal precision.</p>

          <div className="flex flex-wrap items-center gap-6">
            <button onClick={() => setCurrentPage('privacy')} className="hover:text-amber-400 transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => setCurrentPage('terms')} className="hover:text-amber-400 transition-colors">
              Terms & Conditions
            </button>
            <button onClick={() => setCurrentPage('faq')} className="hover:text-amber-400 transition-colors">
              FAQ
            </button>
            <button onClick={() => setCurrentPage('admin')} className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
