import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Order } from '../../types';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  CheckCircle2, 
  X, 
  Download, 
  Globe, 
  AlertTriangle,
  Building,
  User,
  MapPin,
  Phone,
  Mail,
  Scale
} from 'lucide-react';
import { captureClientMetadata, generateOrderAgreementPDF } from '../../services/internationalProtectionService';

interface InternationalOrderProtectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  orderItemsOverride?: {
    productTitle: string;
    quantity: number;
    price: number;
    fabric?: string;
  }[];
  totalAmountOverride?: number;
}

export const InternationalOrderProtectionModal: React.FC<InternationalOrderProtectionModalProps> = ({
  isOpen,
  onClose,
  product,
  orderItemsOverride,
  totalAmountOverride
}) => {
  const { customerUser, createOrder, addToast, setCurrentPage } = useApp();

  // Customer Form State
  const [fullName, setFullName] = useState(customerUser?.displayName || 'Parmar Jaydip');
  const [companyName, setCompanyName] = useState('Mahalakshmi Luxury Boutique');
  const [email, setEmail] = useState(customerUser?.email || 'parmarjaydip881987@gmail.com');
  const [phone, setPhone] = useState(customerUser?.phone || '+91 98765 12345');
  const [billingAddress, setBillingAddress] = useState(customerUser?.shippingAddress || '402 Mahalakshmi Complex, Ring Road');
  const [shippingAddress, setShippingAddress] = useState(customerUser?.shippingAddress || '402 Mahalakshmi Complex, Ring Road');
  const [country, setCountry] = useState(customerUser?.cityCountry || 'United States');

  // Terms Acceptance Checkbox
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client Captured IP Metadata
  const [ipAddress, setIpAddress] = useState('Fetching network IP...');
  const [deviceInfo, setDeviceInfo] = useState('');

  useEffect(() => {
    if (isOpen) {
      captureClientMetadata().then(meta => {
        setIpAddress(meta.ipAddress);
        setDeviceInfo(meta.deviceInfo);
      });
      if (customerUser) {
        setFullName(customerUser.displayName || '');
        setEmail(customerUser.email || '');
        setPhone(customerUser.phone || '');
        setShippingAddress(customerUser.shippingAddress || '');
        setBillingAddress(customerUser.shippingAddress || '');
        setCountry(customerUser.cityCountry || 'United States');
      }
    }
  }, [isOpen, customerUser]);

  if (!isOpen) return null;

  const totalVal = totalAmountOverride || (product ? product.price : 125000);
  const requiredAdvance = Math.round(totalVal * 0.5);

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      addToast('You must accept the Terms & Conditions before confirming the order.', 'error');
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim() || !shippingAddress.trim()) {
      addToast('Please complete all required contact and address fields.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const nowIso = new Date().toISOString();

      const rawItems = orderItemsOverride || [
        {
          productId: product?.id,
          productTitle: product?.title || 'Custom Luxury Embroidery Garment',
          sku: product?.sku || 'MC-EXPORT-01',
          image: product?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
          quantity: 1,
          price: product?.price || 125000,
          fabric: product?.fabric || 'Luxury Silk/Velvet',
          color: 'Royal Gold'
        }
      ];

      const items = rawItems.map(it => ({
        ...it,
        image: it.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'
      }));

      const protectionMetadata = {
        fullName: fullName.trim(),
        companyName: companyName.trim() || 'Private Boutique Client',
        email: email.trim(),
        phone: phone.trim(),
        billingAddress: billingAddress.trim(),
        shippingAddress: shippingAddress.trim(),
        country: country.trim(),
        ipAddress,
        deviceInfo,
        timestamp: nowIso,
        termsAccepted: true,
        termsAcceptedAt: nowIso,
        digitalSignature: digitalSignature.trim() || `SIG_${fullName.replace(/\s+/g, '_').toUpperCase()}_${Date.now()}`
      };

      const newOrder = await createOrder({
        customerEmail: email.trim(),
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        companyName: companyName.trim(),
        billingAddress: billingAddress.trim(),
        shippingAddress: shippingAddress.trim(),
        country: country.trim(),
        items,
        totalAmount: totalVal,
        status: 'Inquiry',
        paymentStatus: 'Pending',
        protectionMetadata,
        advancePayment: {
          requiredAdvanceAmount: requiredAdvance,
          paidAdvanceAmount: 0,
          isAdvanceConfirmed: false
        }
      });

      // Generate PDF Agreement
      const { pdfBlob } = generateOrderAgreementPDF(newOrder);

      addToast(`✨ International Order ${newOrder.id} protection agreement created & saved to Firebase!`, 'success');

      // Auto Download Agreement PDF
      const link = window.document.createElement('a');
      link.href = URL.createObjectURL(pdfBlob);
      link.download = `Order_Agreement_${newOrder.id}.pdf`;
      link.click();

      onClose();
      setCurrentPage('orders');
    } catch (err: any) {
      console.error('Order creation error:', err);
      addToast(err.message || 'Failed to confirm order.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-xl bg-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title Banner */}
        <div className="flex items-start gap-4 border-b border-neutral-800 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 font-bold flex items-center justify-center shrink-0 shadow-lg border border-amber-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest border border-amber-500/30">
                Official Protection Binding
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">Firebase Secured</span>
            </div>
            <h2 className="font-cinzel text-xl font-bold text-amber-300 mt-1">
              International Order Protection & Binding Agreement
            </h2>
            <p className="text-xs text-neutral-300">
              Mahalakshmi Creation export documentation system. Every order generates an immutable PDF contract, timestamped metadata, and advance payment record.
            </p>
          </div>
        </div>

        <form onSubmit={handleConfirmOrder} className="space-y-6">
          
          {/* Section 1: Customer Identification Metadata */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              1. Customer Metadata & Legal Identification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="e.g. Parmar Jaydip"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Company / Boutique Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="e.g. Mahalakshmi Luxury Couture"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Official Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="client@domain.com"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Phone Number (with Country Code) *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="+1 555-019-2834"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-neutral-400 block mb-1">Billing Address *</label>
                <input
                  type="text"
                  required
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-neutral-400 block mb-1">Shipping Destination Address *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Country *</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Captured Client Network Node</label>
                <div className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-emerald-400 font-mono">
                  IP: {ipAddress}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Order Valuation & Advance Terms */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400 font-mono">Total Order Valuation:</span>
              <span className="font-serif text-lg font-bold text-amber-300">${totalVal.toLocaleString()} USD</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-neutral-800 pt-2">
              <span className="text-neutral-400 font-mono">Mandatory Advance Payment (50%):</span>
              <span className="font-mono text-sm font-bold text-emerald-400">${requiredAdvance.toLocaleString()} USD</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed pt-1">
              * Production strictly commences upon 50% advance confirmation or full invoice settlement. All transactions logged in Firebase.
            </p>
          </div>

          {/* Section 3: Terms & Conditions Agreement */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Binding Export Terms & Legal Protection
              </span>
            </div>

            <ul className="text-xs text-neutral-300 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>I confirm that all provided personal, company, billing, and shipping details are authentic and accurate.</li>
              <li>I accept that custom artisan embroidery is manufactured exclusively to order and cannot be modified after production starts.</li>
              <li>I acknowledge that digital signatures, device metadata, and network IP addresses are permanently recorded as proof of agreement.</li>
              <li>I understand that 50% advance payment is required prior to starting handcrafted embroidery production.</li>
            </ul>

            <div className="pt-2">
              <label className="text-[11px] text-amber-200 block mb-1 font-mono">
                Digital Signature / Full Name Confirmation
              </label>
              <input
                type="text"
                required
                value={digitalSignature}
                onChange={(e) => setDigitalSignature(e.target.value)}
                placeholder="Type your Full Name to digitally sign contract"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-amber-500/40 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="text-xs text-neutral-200 font-semibold leading-normal">
                I HAVE READ, UNDERSTOOD, AND ACCEPT THE TERMS & CONDITIONS AND BINDING AGREEMENT FOR THIS INTERNATIONAL ORDER.
              </span>
            </label>
          </div>

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold uppercase tracking-wider"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !termsAccepted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-widest shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Generating Agreement PDF...' : 'Confirm Order & Download Contract PDF'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
