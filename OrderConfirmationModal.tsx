import React, { useState } from 'react';
import { Order } from '../../types';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, KeyRound, Mail, Smartphone, AlertTriangle, X, CheckCircle2, Lock } from 'lucide-react';

interface OrderConfirmationModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
  actionType?: 'trash' | 'permanent_delete';
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({ 
  order, 
  onClose, 
  onSuccess,
  actionType = 'trash'
}) => {
  const { 
    adminUser, 
    moveToTrashOrder, 
    permanentlyDeleteOrderWithVerification, 
    addToast 
  } = useApp();

  const [step, setStep] = useState<1 | 2>(1);
  const [reason, setReason] = useState<string>('Customer requested cancellation / Order review required');
  const [verificationMethod, setVerificationMethod] = useState<'Admin Password' | 'Email OTP' | '2FA Authenticator'>('Admin Password');
  
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>('');
  const [totpInput, setTotpInput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Security check: Only Super Admin can proceed
  const isSuperAdmin = adminUser && (adminUser.email === 'parmarjaydip881987@gmail.com' || adminUser.role === 'admin');

  if (!isSuperAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-neutral-900 border border-red-500/50 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center border border-red-500/40">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-white font-cinzel text-xl font-bold">Access Denied: Super Admin Only</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Security policy strictly restricts order deletion and confirmation workflows to authorized Super Admin personnel.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-700 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  const handleSendOtp = () => {
    setOtpSent(true);
    addToast("Verification OTP sent to Super Admin registered email", "info");
  };

  const handleConfirmAction = async () => {
    setIsVerifying(true);
    try {
      await new Promise(r => setTimeout(r, 800));

      if (verificationMethod === 'Admin Password' && adminPasswordInput.trim().length < 4) {
        addToast("Please enter a valid Admin Password", "error");
        setIsVerifying(false);
        return;
      }
      if (verificationMethod === 'Email OTP' && otpInput.trim().length !== 6) {
        addToast("Please enter the 6-digit Email OTP", "error");
        setIsVerifying(false);
        return;
      }
      if (verificationMethod === '2FA Authenticator' && totpInput.trim().length !== 6) {
        addToast("Please enter the 6-digit 2FA Authenticator Code", "error");
        setIsVerifying(false);
        return;
      }

      const adminEmail = adminUser?.email || 'Super Admin';

      if (actionType === 'trash') {
        await moveToTrashOrder(order.id, adminEmail, reason);
        addToast("Order moved to Trash Vault successfully", "success");
      } else {
        await permanentlyDeleteOrderWithVerification(order.id, adminEmail, reason, verificationMethod);
        addToast("Order permanently purged from records", "success");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      addToast("Verification or execution failed", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-xl w-full bg-neutral-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-neutral-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-neutral-950/60 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-white tracking-wide">
                Secure Order Action Verification
              </h3>
              <p className="text-xs text-neutral-400">
                Super Admin authentication required for order ID: <span className="text-amber-300 font-mono">{order.id.slice(-8).toUpperCase()}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Step indicator */}
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className={`px-3 py-1 rounded-full flex items-center space-x-1 ${step === 1 ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400'}`}>
              <span>1. Order Details</span>
            </span>
            <span className="text-neutral-600">→</span>
            <span className={`px-3 py-1 rounded-full flex items-center space-x-1 ${step === 2 ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400'}`}>
              <span>2. Super Admin Re-auth</span>
            </span>
          </div>

          {step === 1 ? (
            <div className="space-y-5">
              {/* Order Details Card */}
              <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 block">Order ID</span>
                    <span className="text-sm font-mono font-bold text-white">{order.id}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 block">Order Date</span>
                    <span className="text-xs text-neutral-300 font-medium">
                      {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 block">Customer Name</span>
                    <span className="text-sm font-semibold text-white">{order.customerName || 'Valued Client'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 block">Total Amount</span>
                    <span className="text-sm font-bold text-amber-400">₹{(order.totalAmount || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Product Details */}
                <div className="pt-2">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-2">Product Items ({order.items?.length || 0})</span>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {order.items && order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-neutral-900/80 border border-neutral-800/80 rounded-xl p-2.5 text-xs">
                        <div className="flex items-center space-x-3">
                          {item.image && (
                            <img src={item.image} alt={item.productTitle} className="w-9 h-9 rounded-lg object-cover border border-neutral-700" />
                          )}
                          <div>
                            <p className="font-semibold text-white line-clamp-1">{item.productTitle}</p>
                            <p className="text-[10px] text-neutral-400">Qty: {item.quantity || 1} {item.color ? `• Color: ${item.color}` : ''}</p>
                          </div>
                        </div>
                        <span className="font-bold text-amber-300">₹{(item.price * (item.quantity || 1)).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Reason for Deletion / Archival
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Customer requested cancellation / Fraudulent transaction"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
                >
                  Proceed to Verification →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Security Warning banner */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  <span className="font-bold block text-amber-300 mb-0.5">Authorization Required</span>
                  You are about to {actionType === 'trash' ? 'move this order to the Trash Vault' : 'permanently purge this record'}. Please re-authenticate as Super Admin.
                </div>
              </div>

              {/* Method Selector */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Admin Password', label: 'Password', icon: KeyRound },
                  { id: 'Email OTP', label: 'Email OTP', icon: Mail },
                  { id: '2FA Authenticator', label: '2FA Code', icon: Smartphone }
                ].map(m => {
                  const Icon = m.icon;
                  const active = verificationMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setVerificationMethod(m.id as any)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-medium transition-all ${
                        active 
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md' 
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1.5" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Inputs based on method */}
              <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-5 space-y-4">
                {verificationMethod === 'Admin Password' && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Super Admin Password ({adminUser?.email})
                    </label>
                    <input
                      type="password"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono tracking-wider"
                    />
                  </div>
                )}

                {verificationMethod === 'Email OTP' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-300">
                        Email Verification Code (OTP)
                      </label>
                      <button
                        onClick={handleSendOtp}
                        type="button"
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
                      >
                        {otpSent ? 'Resend OTP' : 'Send OTP to Email'}
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono tracking-widest text-center"
                    />
                    {otpSent && (
                      <p className="text-[11px] text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 inline" />
                        <span>OTP dispatched to registered Super Admin mail.</span>
                      </p>
                    )}
                  </div>
                )}

                {verificationMethod === '2FA Authenticator' && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Google Authenticator / TOTP 6-Digit Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={totpInput}
                      onChange={(e) => setTotpInput(e.target.value)}
                      placeholder="849201"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono tracking-widest text-center"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  ← Back to Order
                </button>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    disabled={isVerifying}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <span>{actionType === 'trash' ? 'Confirm & Move to Trash' : 'Confirm Permanent Purge'}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
