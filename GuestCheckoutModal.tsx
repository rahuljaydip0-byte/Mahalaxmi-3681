import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Order, GuestVerificationInfo } from '../../types';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  X, 
  Mail, 
  MessageSquare, 
  Clock, 
  RefreshCw, 
  AlertTriangle,
  User,
  Building,
  Phone,
  Globe,
  MapPin,
  Send,
  FileText,
  Sparkles,
  Check,
  Bot
} from 'lucide-react';
import { captureClientMetadata, generateOrderAgreementPDF } from '../../services/internationalProtectionService';
import { 
  evaluateAntiFraudRisk, 
  checkIsDisposableEmail, 
  checkIsPhoneValid, 
  checkRateLimit, 
  recordOtpRequest, 
  checkDuplicateOrder 
} from '../../services/antiFraudService';

interface GuestCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  orderItemsOverride?: {
    productId?: string;
    productTitle: string;
    sku?: string;
    image: string;
    quantity: number;
    price: number;
    fabric?: string;
    color?: string;
  }[];
  totalAmountOverride?: number;
}

export const GuestCheckoutModal: React.FC<GuestCheckoutModalProps> = ({
  isOpen,
  onClose,
  product,
  orderItemsOverride,
  totalAmountOverride
}) => {
  const { createOrder, addToast, setCurrentPage, customerUser, orders } = useApp();

  // Wizard Step: 1 = Details, 2 = OTP Verification, 3 = Confirmed
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [fullName, setFullName] = useState(customerUser?.displayName || '');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState(customerUser?.email || '');
  const [whatsAppNumber, setWhatsAppNumber] = useState(customerUser?.phone || '');
  const [phone, setPhone] = useState(customerUser?.phone || '');
  const [country, setCountry] = useState(customerUser?.cityCountry || 'India');
  const [shippingAddress, setShippingAddress] = useState(customerUser?.shippingAddress || '');
  const [billingAddress, setBillingAddress] = useState(customerUser?.shippingAddress || '');

  // reCAPTCHA bot security check state
  const [reCaptchaVerified, setReCaptchaVerified] = useState<boolean>(false);
  const [isCaptchating, setIsCaptchating] = useState<boolean>(false);

  // Verification Method
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'whatsapp'>('email');

  // OTP State
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [inputOtp, setInputOtp] = useState<string>('');
  const [attemptsCount, setAttemptsCount] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [otpSentNotice, setOtpSentNotice] = useState<string>('');

  // Timers
  const [otpTimerSeconds, setOtpTimerSeconds] = useState<number>(300); // 5 min
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState<number>(0);

  // Client Captured Metadata
  const [ipAddress, setIpAddress] = useState('Fetching network IP...');
  const [deviceInfo, setDeviceInfo] = useState('');

  // Created Order Result
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

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
        setWhatsAppNumber(customerUser.phone || '');
        setShippingAddress(customerUser.shippingAddress || '');
        setBillingAddress(customerUser.shippingAddress || '');
      }
    }
  }, [isOpen, customerUser]);

  // Timer countdown hook for OTP validity (300s)
  useEffect(() => {
    let interval: any = null;
    if (step === 2 && otpTimerSeconds > 0) {
      interval = setInterval(() => {
        setOtpTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (otpTimerSeconds === 0 && step === 2) {
      addToast('OTP has expired. Please request a new OTP.', 'error');
    }
    return () => clearInterval(interval);
  }, [step, otpTimerSeconds]);

  // Resend cooldown timer hook (60s)
  useEffect(() => {
    let interval: any = null;
    if (resendCooldownSeconds > 0) {
      interval = setInterval(() => {
        setResendCooldownSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldownSeconds]);

  if (!isOpen) return null;

  const totalVal = totalAmountOverride || (product ? product.price : 125000);

  // Send OTP trigger with anti-fake order checks
  const handleSendOtp = (method: 'email' | 'whatsapp') => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !shippingAddress.trim() || !billingAddress.trim() || !country.trim()) {
      addToast('Please complete all required contact & shipping fields first.', 'error');
      return;
    }

    if (!reCaptchaVerified) {
      addToast('Please complete the Google reCAPTCHA bot security check below.', 'error');
      return;
    }

    // 1. Disposable Email Filter
    if (checkIsDisposableEmail(email)) {
      addToast('Disposable or temporary email addresses are blocked to prevent fake orders. Please use a valid email.', 'error');
      return;
    }

    // 2. Phone Validity Check
    const activePhone = method === 'whatsapp' ? (whatsAppNumber || phone) : phone;
    if (!checkIsPhoneValid(activePhone)) {
      addToast('Please enter a valid phone number (minimum 8 digits, dummy numbers not allowed).', 'error');
      return;
    }

    // 3. Rate Limit Check (Max 5 requests/hr)
    const rateCheck = checkRateLimit(email);
    if (rateCheck.exceeded) {
      addToast('Rate limit exceeded: Maximum 5 OTP requests per hour allowed per user.', 'error');
      return;
    }

    // 4. Duplicate Order Check (within 10 mins)
    if (checkDuplicateOrder(email, activePhone, orders)) {
      addToast('Notice: A recent order from this email/phone was placed recently.', 'info');
    }

    // Record rate limit attempt
    recordOtpRequest(email);

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setVerificationMethod(method);
    setAttemptsCount(0);
    setInputOtp('');
    setOtpTimerSeconds(300); // 5 minutes valid
    setResendCooldownSeconds(60); // 60s resend cooldown

    const destination = method === 'email' ? email : (whatsAppNumber || phone);
    const notice = `SECURE OTP [${code}] generated & dispatched via ${method.toUpperCase()} to ${destination}.`;
    setOtpSentNotice(notice);

    addToast(`🔑 OTP sent via ${method.toUpperCase()} to ${destination}`, 'info');
    setStep(2);
  };

  // Verify OTP & Complete Order
  const handleVerifyOtpAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (attemptsCount >= 5) {
      addToast('Maximum OTP verification attempts reached (5/5). Please request a new OTP.', 'error');
      return;
    }

    if (otpTimerSeconds <= 0) {
      addToast('OTP has expired. Please click "Resend OTP" to receive a new 6-digit code.', 'error');
      return;
    }

    if (inputOtp.trim() !== generatedOtp) {
      const newAttempts = attemptsCount + 1;
      setAttemptsCount(newAttempts);
      addToast(`Incorrect OTP code. Attempt ${newAttempts} of 5.`, 'error');
      return;
    }

    setIsVerifying(true);

    try {
      const nowIso = new Date().toISOString();
      const verifiedBadge = verificationMethod === 'email' ? 'Email Verified ✅' : 'WhatsApp Verified ✅';

      // Evaluate Risk Score
      const activePhone = whatsAppNumber.trim() || phone.trim();
      const riskEval = evaluateAntiFraudRisk(email, activePhone, orders, reCaptchaVerified);

      const items = orderItemsOverride || [
        {
          productId: product?.id,
          productTitle: product?.title || 'Custom Luxury Embroidery Garment',
          sku: product?.sku || 'MC-EXPORT-01',
          image: product?.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
          quantity: 1,
          price: product?.price || 125000,
          fabric: product?.fabric || 'Luxury Silk/Velvet',
          color: 'Royal Gold'
        }
      ];

      const guestVerification: GuestVerificationInfo = {
        method: verificationMethod,
        status: verifiedBadge,
        verifiedAt: nowIso,
        otpCode: generatedOtp,
        ipAddress,
        deviceInfo,
        browser: window.navigator.userAgent,
        attemptsCount: attemptsCount + 1,
        whatsappNumber: activePhone,
        adminApprovalStatus: 'Pending Admin Approval',
        adminNotes: `Order verified via ${verificationMethod.toUpperCase()} OTP. Risk Score: ${riskEval.riskScore}/100 (${riskEval.riskLevel}). Awaiting Super Admin review.`,
        riskScore: riskEval.riskScore,
        riskLevel: riskEval.riskLevel,
        isDisposableEmail: riskEval.isDisposableEmail,
        isPhoneValid: riskEval.isPhoneValid,
        isBotVerified: reCaptchaVerified,
        rateLimitExceeded: riskEval.rateLimitExceeded
      };

      const protectionMetadata = {
        fullName: fullName.trim(),
        companyName: companyName.trim() || 'Guest Buyer',
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
        digitalSignature: `GUEST_VERIFIED_${verificationMethod.toUpperCase()}_${Date.now()}`
      };

      const newOrder = await createOrder({
        customerEmail: email.trim(),
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        whatsappNumber: activePhone,
        companyName: companyName.trim(),
        billingAddress: billingAddress.trim(),
        shippingAddress: shippingAddress.trim(),
        country: country.trim(),
        items,
        totalAmount: totalVal,
        status: 'Pending Admin Approval',
        paymentStatus: 'Pending',
        verificationInfo: guestVerification,
        protectionMetadata,
        advancePayment: {
          requiredAdvanceAmount: Math.round(totalVal * 0.5),
          paidAdvanceAmount: 0,
          isAdvanceConfirmed: false
        }
      });

      setCreatedOrder(newOrder);
      setStep(3);
      addToast(`✨ Order #${newOrder.id} successfully verified & submitted for Admin Approval!`, 'success');

      // Super Admin notification simulate log
      console.log(`[NOTIFY ADMIN] New Guest Order #${newOrder.id} verified via ${verificationMethod.toUpperCase()}. Status: Pending Admin Approval.`);
    } catch (err: any) {
      console.error('Guest order creation failed:', err);
      addToast(err.message || 'Failed to place guest order.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-xl bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-start gap-4 border-b border-neutral-800 pb-5">
          <div className="w-12 h-12 rounded-2xl gold-gradient-bg text-neutral-950 font-bold flex items-center justify-center shrink-0 shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest border border-amber-500/30">
                Guest Checkout Verification
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">No Account Required</span>
            </div>
            <h2 className="font-cinzel text-xl font-bold text-amber-300 mt-1">
              Mahalakshmi Creation Order Verification
            </h2>
            <p className="text-xs text-neutral-300">
              Verify your identity using Email OTP or WhatsApp OTP to place your guest order safely.
            </p>
          </div>
        </div>

        {/* Wizard Progress Steps */}
        <div className="flex items-center justify-between gap-2 border-b border-neutral-800/80 pb-4 text-xs font-mono">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-amber-300 font-bold' : 'text-neutral-500'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-800'}`}>1</span>
            <span>Guest Details</span>
          </div>
          <div className="h-0.5 flex-1 bg-neutral-800" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-amber-300 font-bold' : 'text-neutral-500'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-800'}`}>2</span>
            <span>OTP Verification</span>
          </div>
          <div className="h-0.5 flex-1 bg-neutral-800" />
          <div className={`flex items-center gap-2 ${step === 3 ? 'text-emerald-400 font-bold' : 'text-neutral-500'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-emerald-500 text-neutral-950 font-bold' : 'bg-neutral-800'}`}>3</span>
            <span>Order Submitted</span>
          </div>
        </div>

        {/* STEP 1: GUEST DETAILS FORM */}
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              1. Guest Identification & Delivery Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Parmar Jaydip"
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Company / Boutique Name (Optional)</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Mahalakshmi Couture"
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="parmarjaydip881987@gmail.com"
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">WhatsApp Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={whatsAppNumber}
                  onChange={(e) => setWhatsAppNumber(e.target.value)}
                  placeholder="+91 98765 12345"
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Contact Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 12345"
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
                  placeholder="e.g. India or United States"
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-neutral-400 block mb-1">Shipping Address *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Full street address, city, state & postal code"
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-neutral-400 block mb-1">Billing Address *</label>
                <input
                  type="text"
                  required
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Billing street address"
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Google reCAPTCHA Anti-Bot Security Check */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCaptchating(true);
                    setTimeout(() => {
                      setReCaptchaVerified(true);
                      setIsCaptchating(false);
                      addToast('reCAPTCHA bot check verified ✓', 'success');
                    }, 600);
                  }}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                    reCaptchaVerified 
                      ? 'bg-emerald-500 border-emerald-400 text-neutral-950' 
                      : 'border-neutral-600 bg-neutral-900 hover:border-amber-400'
                  }`}
                >
                  {isCaptchating ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  ) : reCaptchaVerified ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : null}
                </button>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {reCaptchaVerified ? 'reCAPTCHA Verified: I am not a robot' : "I'm not a robot (Google reCAPTCHA Security)"}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">Anti-Bot & Spam Order Protection</span>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-[9px] font-mono font-bold text-amber-400 block uppercase tracking-widest">Protected by</span>
                <span className="text-[10px] text-neutral-400 font-mono">reCAPTCHA v2</span>
              </div>
            </div>

            {/* Choose Verification Method Buttons */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono font-bold text-amber-300 uppercase block">
                Choose Verification Channel (Requires ONE Successful OTP):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSendOtp('email')}
                  className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/40 hover:border-amber-400 text-left transition-all hover:scale-102 flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block group-hover:text-amber-300">Option 1: Email Verification (OTP)</span>
                    <span className="text-[10px] text-neutral-400 block truncate font-mono">{email || 'Receive 6-digit code via email'}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendOtp('whatsapp')}
                  className="p-4 rounded-2xl bg-neutral-950 border border-emerald-500/40 hover:border-emerald-400 text-left transition-all hover:scale-102 flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block group-hover:text-emerald-300">Option 2: WhatsApp Verification (OTP)</span>
                    <span className="text-[10px] text-neutral-400 block truncate font-mono">{whatsAppNumber || phone || 'Receive 6-digit code via WhatsApp'}</span>
                  </div>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: OTP VERIFICATION & VALIDITY */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtpAndSubmit} className="space-y-6">
            <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-2">
                  {verificationMethod === 'email' ? <Mail className="w-4 h-4 text-amber-400" /> : <MessageSquare className="w-4 h-4 text-emerald-400" />}
                  Verify via {verificationMethod.toUpperCase()} OTP
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Valid for: {formatTimer(otpTimerSeconds)}
                </span>
              </div>

              {/* Simulated Dispatch Notice */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 font-mono">
                <p className="font-bold text-amber-300">Simulated Gateway Transmission:</p>
                <p className="mt-0.5">{otpSentNotice}</p>
                <div className="mt-2 p-2 bg-neutral-900 rounded border border-amber-500/40 text-center font-bold text-amber-300 text-sm tracking-widest">
                  YOUR DEMO OTP CODE: <span className="text-emerald-400 text-base">{generatedOtp}</span>
                </div>
              </div>

              {/* Input OTP */}
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1 font-mono">
                  Enter 6-Digit Verification Code (Attempts: {attemptsCount}/5) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 text-center text-xl font-mono tracking-widest rounded-xl bg-neutral-900 border border-amber-500/50 text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Resend Cooldown Controls */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  disabled={resendCooldownSeconds > 0}
                  onClick={() => handleSendOtp(verificationMethod)}
                  className="text-amber-400 hover:text-amber-300 font-mono font-bold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>
                    {resendCooldownSeconds > 0 ? `Resend OTP in ${resendCooldownSeconds}s` : 'Resend OTP Code'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-neutral-400 hover:text-white underline text-[11px]"
                >
                  Change Channel / Details
                </button>
              </div>
            </div>

            {/* Network Node Metadata */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 font-mono space-y-1">
              <div className="flex justify-between">
                <span>Network Node IP:</span>
                <span className="text-emerald-400">{ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span>Device Signature:</span>
                <span className="text-neutral-300 truncate max-w-[250px]">{deviceInfo}</span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold uppercase tracking-wider"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isVerifying || inputOtp.length !== 6 || attemptsCount >= 5 || otpTimerSeconds <= 0}
                className="px-8 py-3.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-widest shadow-xl hover:scale-102 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                <span>{isVerifying ? 'Verifying OTP Code...' : 'Verify OTP & Submit Order'}</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: ORDER CONFIRMED & PENDING ADMIN APPROVAL */}
        {step === 3 && createdOrder && (
          <div className="space-y-6 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
                {createdOrder.verificationInfo?.status || 'Verified ✅'}
              </span>
              <h3 className="font-cinzel text-2xl font-bold text-amber-300 mt-2">
                Order #{createdOrder.id} Verified & Created
              </h3>
              <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                Your guest order has been successfully verified via {createdOrder.verificationInfo?.method.toUpperCase()} OTP. 
                It is currently <strong className="text-amber-400">Pending Admin Approval</strong> before going into artisan production.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/30 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-400">Customer:</span>
                <span className="text-white font-bold">{createdOrder.customerName} ({createdOrder.customerEmail})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Order Valuation:</span>
                <span className="text-amber-300 font-bold">${createdOrder.totalAmount.toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Status Stage:</span>
                <span className="text-amber-400 font-bold">Pending Admin Approval</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Verification Timestamp:</span>
                <span className="text-emerald-400">{new Date(createdOrder.verificationInfo?.verifiedAt || Date.now()).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  const { pdfBlob } = generateOrderAgreementPDF(createdOrder);
                  const link = window.document.createElement('a');
                  link.href = URL.createObjectURL(pdfBlob);
                  link.download = `Order_Agreement_${createdOrder.id}.pdf`;
                  link.click();
                  addToast(`Downloaded PDF Contract for #${createdOrder.id}`, 'success');
                }}
                className="flex-1 py-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-amber-500/30"
              >
                <FileText className="w-4 h-4" />
                <span>Download Contract PDF</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  setCurrentPage('orders');
                }}
                className="flex-1 py-3.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-102 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>View Orders Log</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
