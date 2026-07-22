import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  const { settings } = useApp();

  return (
    <div className="py-16 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-3">
          <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="font-cinzel text-3xl sm:text-4xl font-bold">
            Privacy Policy
          </h1>
          <p className="text-xs text-neutral-500 font-mono">
            Effective Date: July 2026 • {settings.brandName}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-12 border border-neutral-200 dark:border-neutral-800 space-y-6 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans shadow-sm">
          <section className="space-y-2">
            <h3 className="font-cinzel text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              1. Information Collection
            </h3>
            <p>
              At {settings.brandName}, we prioritize the privacy and confidentiality of our international clientele. We only collect essential contact information (such as your name, email address, phone number, and delivery country) when you submit a product inquiry form or initiate a WhatsApp chat with our concierge.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-cinzel text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              2. Use of Information
            </h3>
            <p>
              Your contact details are exclusively utilized to fulfill design customization requests, provide wholesale pricing quotes, send swatch samples, and facilitate express air-freight shipping updates. We never sell, lease, or share your data with third-party advertisers.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-cinzel text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              3. Firebase & Data Security
            </h3>
            <p>
              Our website infrastructure is powered by secure Firebase Authentication and encrypted Google Cloud Firestore databases, ensuring strict access control permissions.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-cinzel text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              4. Contact Us
            </h3>
            <p>
              For privacy-related inquiries or data requests, please write to us at <a href={`mailto:${settings.email}`} className="text-amber-500 underline">{settings.email}</a>.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
};
