import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, Clock, Video, User, Mail, Phone, Globe, CheckCircle2, Sparkles } from 'lucide-react';
import { dbService } from '../../services/dbService';

export const AppointmentModal: React.FC = () => {
  const { 
    isAppointmentModalOpen, 
    setIsAppointmentModalOpen, 
    customerUser, 
    addToast 
  } = useApp();

  const [clientName, setClientName] = useState(customerUser?.displayName || 'Parmar Jaydip');
  const [clientEmail, setClientEmail] = useState(customerUser?.email || 'parmarjaydip881987@gmail.com');
  const [clientPhone, setClientPhone] = useState(customerUser?.phone || '+91 98765 12345');
  const [appointmentDate, setAppointmentDate] = useState('2026-07-25');
  const [timeSlot, setTimeSlot] = useState('11:00 AM IST (5:30 AM GMT)');
  const [consultationType, setConsultationType] = useState('Bridal & Luxury Lehenga Customization');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAppointmentModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dbService.submitInquiry({
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        country: 'International / India',
        productTitle: `Virtual Video Consultation: ${consultationType}`,
        message: `Appointment Date: ${appointmentDate} at ${timeSlot}\nNotes: ${specialNotes || 'None'}`
      });
      setIsSubmitted(true);
      addToast("Virtual Consultation Booked Successfully!", "success");
    } catch (err) {
      console.error(err);
      addToast("Error booking appointment", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIsSubmitted(false);
    setIsAppointmentModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 text-neutral-900 dark:text-white shadow-2xl space-y-6 border border-amber-500/30 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-bold text-xl text-neutral-900 dark:text-white">
              Appointment Confirmed!
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
              We have reserved your 1-on-1 VIP Video Call with our Master Embroidery Designer for <strong className="text-amber-500">{appointmentDate}</strong> at <strong className="text-amber-500">{timeSlot}</strong>.
            </p>
            <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400 font-mono">
              Meeting Invitation & WhatsApp Video Link sent to {clientEmail}
            </div>
            <button
              onClick={resetAndClose}
              className="px-6 py-3 bg-neutral-900 text-amber-300 dark:bg-amber-500 dark:text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3 border-b pb-4 border-neutral-100 dark:border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/30">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-neutral-900 dark:text-white">
                  Book Virtual Designer Consultation
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Connect via HD Video Call with our Ahmedabad Master Artisans
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                  WhatsApp Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                  Consultation Focus
                </label>
                <select
                  value={consultationType}
                  onChange={(e) => setConsultationType(e.target.value)}
                  className="w-full p-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:border-amber-500 font-semibold"
                >
                  <option value="Bridal & Luxury Lehenga Customization">Bridal & Luxury Lehenga Customization</option>
                  <option value="Custom Neck & Panel Embroidery Order">Custom Neck & Panel Embroidery Order</option>
                  <option value="Wholesale & Export Bulk Sampling">Wholesale & Export Bulk Sampling</option>
                  <option value="Fabric & Swatch Inspection">Fabric & Swatch Inspection</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                  Preferred Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                  Preferred Time Slot *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:border-amber-500 font-semibold"
                  >
                    <option value="11:00 AM IST (5:30 AM GMT)">11:00 AM IST (5:30 AM GMT)</option>
                    <option value="03:00 PM IST (09:30 AM GMT)">03:00 PM IST (09:30 AM GMT)</option>
                    <option value="07:00 PM IST (01:30 PM GMT)">07:00 PM IST (01:30 PM GMT)</option>
                    <option value="10:00 PM IST (04:30 PM GMT / US Morning)">10:00 PM IST (04:30 PM GMT / US Morning)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                Custom Specs / Outfit Notes
              </label>
              <textarea
                rows={2}
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="Mention color preferences, wedding target date, or specific SKUs..."
                className="w-full p-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:border-amber-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 border border-amber-300 transition-all disabled:opacity-50"
            >
              <Video className="w-4 h-4" />
              <span>Confirm & Book Video Call Slot</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
