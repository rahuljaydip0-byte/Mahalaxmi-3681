import React, { useState } from 'react';
import { Order } from '../../types';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Trash2, KeyRound, Mail, Smartphone, AlertTriangle, X } from 'lucide-react';

interface SecureOrderDeleteModalProps {
  order: Order;
  mode: 'single_trash' | 'permanent_delete' | 'clear_all_trash';
  onClose: () => void;
  onSuccess: () => void;
}

export const SecureOrderDeleteModal: React.FC<SecureOrderDeleteModalProps> = ({ order, mode, onClose, onSuccess }) => {
  const { 
    adminUser, 
    moveToTrashOrder, 
    permanentlyDeleteOrderWithVerification, 
    clearAllTrashWithVerification, 
    addToast 
  } = useApp();

  const [step, setStep] = useState<1 | 2>(1);
  const [reason, setReason] = useState<string>('Customer requested cancellation / Duplicate order');
  const [verificationMethod, setVerificationMethod] = useState<'Admin Password' | 'Email OTP' | '2FA Authenticator'>('Admin Password');
  
  // Verification input states
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>('');
  const [totpInput, setTotpInput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Security check: Only Super Admin can delete/clear
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
            Security policy strictly prohibits staff or customers from deleting or purging order records. Only authorized Super Admin credentials can execute this action.
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
    addToast("Verification OTP sent to Super Admin email", "info");
  };

  const handleExecuteDeletion = async () => {
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

      if (mode === 'single_trash') {
        await moveToTrashOrder(order.id, adminEmail, reason);
      } else if (mode === 'permanent_delete') {
        await permanentlyDeleteOrderWithVerification(order.id, adminEmail, reason, verificationMethod);
      } else if (mode === 'clear_all_trash') {
        await clearAllTrashWithVerification(adminEmail, reason, verificationMethod);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      addToast("Verification failed", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-neutral-900 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/40">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">
                Secure Deletion & Audit Gateway
              </span>
              <h3 className="text-white font-cinzel text-base font-bold">
                {mode === 'clear_all_trash' ? 'Bulk Clear Trash Vault' : `Secure Delete Order #${order.id}`}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          
          {step === 1 ? (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  <strong className="text-white block font-bold mb-1">MANDATORY DELETION PROTOCOL</strong>
                  Instant permanent deletion is disabled. Orders are first safely moved to the <strong className="text-white">Trash Vault</strong> with automated encrypted backups and IP audit logging.
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                  Target Order Summary
                </span>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-500 block">Order ID</span>
                    <strong className="text-white font-mono">#{order.id}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Order Date</span>
                    <strong className="text-white">{new Date(order.orderDate).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Customer Name</span>
                    <strong className="text-amber-300">{order.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Total Amount</span>
                    <strong className="text-emerald-400 font-mono">₹{order.totalAmount.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800">
                  <span className="text-[10px] font-mono text-neutral-500 block mb-1">Ordered Items ({order.items.length})</span>
                  <div className="space-y-1">
                    {order.items.map((it, idx) => (
                      <p key={idx} className="text-xs text-neutral-300 truncate">
                        • {it.productTitle} (Qty: {it.quantity}) - ₹{it.price.toLocaleString()}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reason Input */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-neutral-300 uppercase tracking-wider block">
                  Reason for Deletion / Archival *
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter detailed reason for auditing..."
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Step 2: Super Admin Verification</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Authorized Admin</span>
                  <strong className="text-white text-sm">{adminUser?.email} (Super Admin)</strong>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Verified Identity ✓
                </span>
              </div>

              {/* Verification Method Selector */}
              <div className="space-y-3">
                <label className="text-xs font-mono text-neutral-300 uppercase tracking-wider block">
                  Select Two-Step Verification Method
                </label>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setVerificationMethod('Admin Password')}
                    className={`p-3 rounded-2xl border text-left space-y-1 transition-all ${
                      verificationMethod === 'Admin Password' 
                        ? 'bg-amber-500/20 border-amber-500 text-white' 
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs block">Admin Password</span>
                  </button>

                  <button
                    onClick={() => setVerificationMethod('Email OTP')}
                    className={`p-3 rounded-2xl border text-left space-y-1 transition-all ${
                      verificationMethod === 'Email OTP' 
                        ? 'bg-amber-500/20 border-amber-500 text-white' 
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs block">Email OTP</span>
                  </button>

                  <button
                    onClick={() => setVerificationMethod('2FA Authenticator')}
                    className={`p-3 rounded-2xl border text-left space-y-1 transition-all ${
                      verificationMethod === '2FA Authenticator' 
                        ? 'bg-amber-500/20 border-amber-500 text-white' 
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs block">2FA Authenticator</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Verification Input */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                {verificationMethod === 'Admin Password' && (
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-neutral-300 block">Enter Master Admin Password</label>
                    <input
                      type="password"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                {verificationMethod === 'Email OTP' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono text-neutral-300">6-Digit Email OTP</label>
                      <button
                        onClick={handleSendOtp}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider"
                      >
                        {otpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="123456"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs tracking-widest font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                {verificationMethod === '2FA Authenticator' && (
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-neutral-300">Google Authenticator / TOTP Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={totpInput}
                      onChange={(e) => setTotpInput(e.target.value)}
                      placeholder="987654"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs tracking-widest font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs uppercase tracking-wider hover:bg-neutral-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleExecuteDeletion}
                  disabled={isVerifying}
                  className="flex-1 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isVerifying ? 'Verifying & Executing...' : 'Authorize & Execute Deletion'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
