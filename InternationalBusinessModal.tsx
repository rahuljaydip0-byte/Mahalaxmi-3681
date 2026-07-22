import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Globe, Plane, Calculator, Send, ShieldCheck, Building, Package, ArrowRight, Lock, FileText } from 'lucide-react';
import { dbService } from '../../services/dbService';
import { InternationalOrderProtectionModal } from './InternationalOrderProtectionModal';

const COUNTRIES = [
  { name: 'United States', code: 'US', baseFreightUSD: 45, perKgUSD: 12, estDays: '3-5 Business Days' },
  { name: 'United Arab Emirates', code: 'AE', baseFreightUSD: 30, perKgUSD: 8, estDays: '2-4 Business Days' },
  { name: 'United Kingdom', code: 'GB', baseFreightUSD: 40, perKgUSD: 10, estDays: '3-5 Business Days' },
  { name: 'Canada', code: 'CA', baseFreightUSD: 50, perKgUSD: 13, estDays: '4-6 Business Days' },
  { name: 'Australia', code: 'AU', baseFreightUSD: 55, perKgUSD: 14, estDays: '4-6 Business Days' },
  { name: 'Saudi Arabia', code: 'SA', baseFreightUSD: 35, perKgUSD: 9, estDays: '3-5 Business Days' },
  { name: 'Germany', code: 'DE', baseFreightUSD: 42, perKgUSD: 11, estDays: '3-5 Business Days' },
  { name: 'Singapore', code: 'SG', baseFreightUSD: 32, perKgUSD: 8, estDays: '2-4 Business Days' }
];

export const InternationalBusinessModal: React.FC = () => {
  const { 
    isInternationalModalOpen, 
    setIsInternationalModalOpen, 
    customerUser, 
    addToast,
    formatPrice
  } = useApp();

  const [activeTab, setActiveTab] = useState<'estimator' | 'wholesale'>('estimator');

  // Estimator State
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [weightKg, setWeightKg] = useState(3);
  const [piecesCount, setPiecesCount] = useState(5);

  // Wholesale Form State
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState(customerUser?.displayName || 'Parmar Jaydip');
  const [email, setEmail] = useState(customerUser?.email || 'parmarjaydip881987@gmail.com');
  const [phone, setPhone] = useState(customerUser?.phone || '+91 98765 12345');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showProtectionModal, setShowProtectionModal] = useState(false);

  if (!isInternationalModalOpen) return null;

  const calculatedFreightUSD = selectedCountry.baseFreightUSD + Math.max(0, weightKg - 1) * selectedCountry.perKgUSD;
  const calculatedFreightINR = Math.round(calculatedFreightUSD * 83.5);

  const handleWholesaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dbService.submitInquiry({
        name: `${contactName} (${companyName || 'Boutique Client'})`,
        email,
        phone,
        country: selectedCountry.name,
        productTitle: 'International Wholesale & Bulk Export Inquiry',
        message: `Company: ${companyName}\nEst. Qty: ${piecesCount} pieces\nMessage: ${message}`
      });
      addToast("Wholesale & Export Inquiry sent to Mahalakshmi Creation Admin!", "success");
      setIsInternationalModalOpen(false);
    } catch (err) {
      console.error(err);
      addToast("Failed to send inquiry", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 text-neutral-900 dark:text-white shadow-2xl space-y-6 border border-amber-500/30 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsInternationalModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b pb-4 border-neutral-100 dark:border-neutral-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/30">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-neutral-900 dark:text-white">
              International Orders & Wholesale Hub
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Worldwide Air Freight, Custom Duties Estimator & Bulk B2B Inquiries
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('estimator')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'estimator'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Air Freight Shipping Estimator</span>
          </button>
          <button
            onClick={() => setActiveTab('wholesale')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'wholesale'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Wholesale & Export Inquiry</span>
          </button>
        </div>

        {activeTab === 'estimator' ? (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-neutral-700 dark:text-neutral-300 flex items-center gap-3">
              <Plane className="w-6 h-6 text-amber-500 shrink-0" />
              <p>
                We partner with <strong>DHL Express Air Freight</strong> and <strong>FedEx Priority</strong> to deliver insured luxury embroidery parcels worldwide with custom clearance support.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                  Destination Country *
                </label>
                <select
                  value={selectedCountry.code}
                  onChange={(e) => {
                    const matched = COUNTRIES.find(c => c.code === e.target.value);
                    if (matched) setSelectedCountry(matched);
                  }}
                  className="w-full p-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:border-amber-500 font-semibold"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                  Est. Shipment Weight (KG)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value) || 1)}
                  className="w-full p-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:border-amber-500 font-mono font-bold"
                />
              </div>
            </div>

            {/* Calculated Estimate Box */}
            <div className="p-5 rounded-2xl bg-neutral-900 text-white border border-neutral-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 font-mono uppercase">Courier Partner:</span>
                <span className="font-bold text-amber-400">DHL Priority Express Freight</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 font-mono uppercase">Estimated Air Transit:</span>
                <span className="font-bold text-emerald-400">{selectedCountry.estDays}</span>
              </div>
              <div className="pt-3 border-t border-neutral-800 flex justify-between items-center">
                <span className="text-xs font-mono text-neutral-300 uppercase">Estimated Freight Fee:</span>
                <div className="text-right">
                  <span className="text-xl font-serif font-extrabold text-amber-300 font-mono block">
                    ${calculatedFreightUSD} USD
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    ≈ {formatPrice(calculatedFreightINR)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-neutral-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Includes full transit insurance, tamper-proof luxury wooden/padded packaging</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleWholesaleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                  Boutique / Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Royal Silk Boutique LLC"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full p-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                  Phone / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                Wholesale Requirements & Target Quantities
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mention desired categories (Neck Embroidery, Full Suits, Bridal Sets), target delivery timeline..."
                className="w-full p-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:border-amber-500"
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 border border-neutral-700 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Submit General Inquiry</span>
              </button>

              <button
                type="button"
                onClick={() => setShowProtectionModal(true)}
                className="flex-1 py-3.5 rounded-xl gold-gradient-bg text-neutral-950 font-extrabold text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 border border-amber-300 transition-all hover:scale-102"
              >
                <ShieldCheck className="w-4 h-4 text-neutral-950" />
                <span>Proceed to Order Agreement (PDF)</span>
              </button>
            </div>
          </form>
        )}

        <InternationalOrderProtectionModal
          isOpen={showProtectionModal}
          onClose={() => setShowProtectionModal(false)}
        />
      </div>
    </div>
  );
};
