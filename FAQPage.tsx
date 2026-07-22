import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "How do I place a custom embroidery or wholesale order?",
      a: "You can click on 'WhatsApp Inquiry' on any product page or use the Contact Form. Our chief designer will discuss fabric choices, neck depth, color swatches, and provide a wholesale proforma invoice."
    },
    {
      q: "Do you ship internationally to USA, UK, UAE, and GCC countries?",
      a: "Yes! We export daily across the United States, United Kingdom, United Arab Emirates, Saudi Arabia, Canada, Australia, and Europe via door-to-door express air freight."
    },
    {
      q: "Can I request custom colors or fabric alterations?",
      a: "Absolutely. All our embroidery designs can be stitched onto German velvet, raw silk, organza, georgette, or chiffon with custom thread color combinations."
    },
    {
      q: "What is the difference between Hand Embroidery and Machine Embroidery?",
      a: "Hand embroidery involves 100% manual needlework (Zardozi, Resham, mirror framing) created over 100-200 artisan hours. Machine embroidery uses high-density multi-needle technology to deliver consistent, cost-effective high-volume production."
    },
    {
      q: "What is the typical production and delivery timeframe?",
      a: "Ready swatch sets and catalog samples dispatch within 48 hours. Custom bridal lehenga panels and bulk boutique orders take 10-18 business days depending on handwork density."
    }
  ];

  return (
    <div className="py-16 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-3">
          <HelpCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="font-cinzel text-3xl sm:text-4xl font-bold">
            Frequently Asked Questions
          </h1>
          <p className="text-xs text-neutral-500 font-sans">
            Find answers regarding custom orders, embroidery techniques, and global express shipping.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-cinzel font-semibold text-sm sm:text-base text-neutral-900 dark:text-white hover:text-amber-500 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-amber-500 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`} />
              </button>

              {openIdx === idx && (
                <div className="p-5 pt-0 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans border-t border-neutral-100 dark:border-neutral-800/60">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
