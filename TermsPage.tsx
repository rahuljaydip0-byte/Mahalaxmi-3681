import React from 'react';
import { useApp } from '../context/AppContext';
import { FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const { settings } = useApp();

  return (
    <div className="py-16 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-3">
          <FileText className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="font-cinzel text-3xl sm:text-4xl font-bold">
            Terms & Conditions
          </h1>
          <p className="text-xs text-neutral-500 font-mono">
            {settings.brandName} • Couture Terms
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-12 border border-neutral-200 dark:border-neutral-800 space-y-6 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans shadow-sm">
          <section className="space-y-2">
            <h3 className="font-cinzel text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              1. Custom Orders & Tailoring
            </h3>
            <p>
              All custom embroidery designs, lehenga panels, and bespoke cutwork pieces manufactured by {settings.brandName} are crafted according to approved tech packs and swatch colors. Minor variations in dye lot or hand-stitch density reflect authentic artisanal handwork.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-cinzel text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              2. Intellectual Property & Designs
            </h3>
            <p>
              All embroidery patterns, high-resolution photographs, 360° rotational frame assets, and design catalogues showcased on this website are protected intellectual property of {settings.brandName}.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-cinzel text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              3. International Express Shipping
            </h3>
            <p>
              We ship worldwide via priority air courier (DHL, FedEx, Aramex). Import customs duties or local taxes applicable in destination countries remain the responsibility of the recipient.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
};
