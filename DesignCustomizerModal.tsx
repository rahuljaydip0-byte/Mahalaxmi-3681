import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Palette, Sparkles, Check, MessageCircle, Video, ShieldCheck, RefreshCw } from 'lucide-react';

const FABRICS = [
  { name: 'Raw Silk', extraPrice: 0, color: '#D4AF37', description: 'Heavy structured luxury silk ideal for bridal lehengas' },
  { name: 'Pure Organza', extraPrice: 1500, color: '#F7E7CE', description: 'Ultra-light sheer fabric with subtle natural sheen' },
  { name: 'Royal Velvet', extraPrice: 2500, color: '#4A0E17', description: 'Deep plush velvet for winter royal heritage look' },
  { name: 'Georgette Silk', extraPrice: 1000, color: '#E8C5C8', description: 'Fluid drape with delicate textured weave' },
  { name: 'Pure Chiffon', extraPrice: 2000, color: '#FFF8DC', description: 'Breezy lightweight luxury with airy flow' }
];

const EMBROIDERIES = [
  { name: '24K Gold Zardozi', extraPrice: 3500, detail: 'Handcrafted gold metallic thread with copper core' },
  { name: 'Antique Silver Wire', extraPrice: 3000, detail: 'Subtle regal matte silver embroidery' },
  { name: 'Cut Mirror & Resham', extraPrice: 2000, detail: 'Reflective glass mirrors bound by silk threads' },
  { name: 'Swarovski Stone Work', extraPrice: 4500, detail: 'Precision-cut crystal rhinestones for maximum shimmer' },
  { name: 'Gota Patti & Sequins', extraPrice: 1800, detail: 'Traditional Rajasthani metallic ribbon appliqués' }
];

const SLEEVES = ['Full Sleeves', 'Elbow Length', 'Bell Sleeves', 'Cap Sleeves', 'Sleeveless'];
const NECKLINES = ['Sweetheart Neck', 'Deep Royal V-Neck', 'Round Boat Neck', 'High Stand Collar', 'Square Heritage'];
const DUPATTAS = ['Heavy 4-Side Border Organza', 'Net with All-Over Spray Dots', 'Double Bridal Dupatta Set', 'Light Scalloped Border'];

export const DesignCustomizerModal: React.FC = () => {
  const { 
    isCustomizerOpen, 
    closeCustomizer, 
    customizerProduct, 
    formatPrice,
    openWhatsAppInquiry,
    setIsAppointmentModalOpen,
    addToast
  } = useApp();

  const basePrice = customizerProduct ? customizerProduct.price : 24900;
  
  const [selectedFabric, setSelectedFabric] = useState(FABRICS[0]);
  const [selectedEmbroidery, setSelectedEmbroidery] = useState(EMBROIDERIES[0]);
  const [selectedSleeve, setSelectedSleeve] = useState(SLEEVES[0]);
  const [selectedNeckline, setSelectedNeckline] = useState(NECKLINES[0]);
  const [selectedDupatta, setSelectedDupatta] = useState(DUPATTAS[0]);
  const [threadColorHex, setThreadColorHex] = useState('#D4AF37');

  const totalPrice = basePrice + selectedFabric.extraPrice + selectedEmbroidery.extraPrice;

  if (!isCustomizerOpen) return null;

  const handleWhatsAppCustomQuote = () => {
    const specSummary = `Custom Design Spec Order:\nProduct: ${customizerProduct ? customizerProduct.title : 'Custom Embroidery Outfit'}\nBase SKU: ${customizerProduct ? customizerProduct.sku : 'MC-CUSTOM'}\nFabric: ${selectedFabric.name}\nEmbroidery: ${selectedEmbroidery.name}\nThread Hex: ${threadColorHex}\nSleeves: ${selectedSleeve}\nNeckline: ${selectedNeckline}\nDupatta: ${selectedDupatta}\nEstimated Custom Total: ${formatPrice(totalPrice)}`;
    openWhatsAppInquiry(customizerProduct || undefined, specSummary);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden max-h-[92vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Interactive Visual Stage */}
        <div className="w-full md:w-1/2 bg-neutral-950 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-800 text-white relative">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Interactive Studio
              </span>
            </div>
            <h3 className="font-serif font-bold text-xl text-white">
              {customizerProduct ? customizerProduct.title : 'Bespoke Customizer'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Select custom fabrics, hand embroidery motifs & neckline specs in real-time.
            </p>
          </div>

          {/* Interactive Artwork Render Simulation */}
          <div className="my-6 relative aspect-[4/5] rounded-2xl bg-neutral-900 overflow-hidden border border-amber-500/20 flex items-center justify-center p-4">
            {customizerProduct ? (
              <img 
                src={customizerProduct.images[0]} 
                alt="Customizer Base" 
                className="w-full h-full object-cover rounded-xl transition-all duration-300" 
              />
            ) : (
              <div className="text-center p-6 space-y-2">
                <Palette className="w-12 h-12 text-amber-400 mx-auto" />
                <p className="text-sm font-bold text-white">Custom Blouse / Suit Panel</p>
              </div>
            )}

            {/* Simulated Live Embroidery Layer Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-transparent pointer-events-none" />

            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-neutral-900/90 backdrop-blur-md border border-amber-500/30 space-y-2 text-xs">
              <div className="flex justify-between items-center text-[11px] text-amber-300 font-mono">
                <span>Selected Fabric: <strong>{selectedFabric.name}</strong></span>
                <span>Thread: <span className="inline-block w-3 h-3 rounded-full align-middle border border-white" style={{ backgroundColor: threadColorHex }} /></span>
              </div>
              <p className="text-[11px] text-neutral-300">
                Work: <strong>{selectedEmbroidery.name}</strong> • Neckline: <strong>{selectedNeckline}</strong>
              </p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Estimated Total</span>
              <span className="text-2xl font-serif font-extrabold text-amber-400 font-mono">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <button
              onClick={() => {
                closeCustomizer();
                setIsAppointmentModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Video className="w-4 h-4 text-amber-400" />
              <span>Book Virtual Call</span>
            </button>
          </div>
        </div>

        {/* Right Side: Options Form */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto space-y-6 text-neutral-900 dark:text-white relative">
          <button
            onClick={closeCustomizer}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="pr-8">
            <h4 className="font-serif font-bold text-lg text-neutral-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Tailor Your Outfit</span>
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Handcrafted to order by master artisans in our Ahmedabad atelier.
            </p>
          </div>

          {/* 1. Fabric Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              1. Choose Base Fabric
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FABRICS.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedFabric(f)}
                  className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    selectedFabric.name === f.name
                      ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-bold'
                      : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{f.name}</p>
                    <p className="text-[10px] text-neutral-400 font-normal">{f.description}</p>
                  </div>
                  {f.extraPrice > 0 && (
                    <span className="text-[10px] font-mono text-amber-500 shrink-0 font-bold">
                      +{formatPrice(f.extraPrice)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Embroidery Work Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              2. Choose Hand Embroidery Style
            </label>
            <div className="space-y-2">
              {EMBROIDERIES.map((e, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedEmbroidery(e)}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    selectedEmbroidery.name === e.name
                      ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-bold'
                      : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{e.name}</p>
                    <p className="text-[10px] text-neutral-400 font-normal">{e.detail}</p>
                  </div>
                  <span className="text-[10px] font-mono text-amber-500 shrink-0 font-bold">
                    +{formatPrice(e.extraPrice)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Thread Color Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              3. Thread / Zari Tone Accent
            </label>
            <div className="flex items-center gap-3">
              {[
                { name: 'Royal Gold', hex: '#D4AF37' },
                { name: 'Antique Silver', hex: '#C0C0C0' },
                { name: 'Rose Gold', hex: '#B76E79' },
                { name: 'Emerald Green', hex: '#046307' },
                { name: 'Ruby Red', hex: '#9B111E' }
              ].map((clr, i) => (
                <button
                  key={i}
                  onClick={() => setThreadColorHex(clr.hex)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    threadColorHex === clr.hex ? 'scale-110 border-amber-500 ring-2 ring-amber-500/30' : 'border-neutral-300 dark:border-neutral-700'
                  }`}
                  style={{ backgroundColor: clr.hex }}
                  title={clr.name}
                />
              ))}
            </div>
          </div>

          {/* 4. Sleeves & Neckline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                Sleeve Style
              </label>
              <select
                value={selectedSleeve}
                onChange={(e) => setSelectedSleeve(e.target.value)}
                className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold focus:outline-none"
              >
                {SLEEVES.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                Neckline Cut
              </label>
              <select
                value={selectedNeckline}
                onChange={(e) => setSelectedNeckline(e.target.value)}
                className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold focus:outline-none"
              >
                {NECKLINES.map((n, i) => <option key={i} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
            <button
              onClick={handleWhatsAppCustomQuote}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Custom Order Specs on WhatsApp</span>
            </button>

            <p className="text-[10px] text-neutral-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>100% Handcrafted Guarantee • Free Air Express Shipping Worldwide</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
