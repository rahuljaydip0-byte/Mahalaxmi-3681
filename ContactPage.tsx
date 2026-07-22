import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { MapPin, Mail, Phone, Clock, MessageCircle, Send, CheckCircle2, Sparkles } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings, addToast, openWhatsAppInquiry } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    productTitle: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dbService.submitInquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        productTitle: formData.productTitle || 'General Inquiry',
        message: formData.message
      });
      setSubmitted(true);
      addToast("Your inquiry has been submitted! Our concierge will contact you within 24 hours.", "success");
      setFormData({ name: '', email: '', phone: '', country: '', productTitle: '', message: '' });
    } catch (err) {
      addToast("Failed to submit inquiry. Please try WhatsApp directly.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-xs uppercase tracking-widest inline-block">
            Atelier Concierge
          </span>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold">
            Contact Mahalakshmi Creation
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
            Reach out for bespoke tailoring, swatch samples, wholesale catalog requests, or international priority shipment tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-8">
            
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-amber-500/20 luxury-card-shadow space-y-6">
              <h3 className="font-cinzel text-xl font-bold text-neutral-900 dark:text-white">
                Atelier Headquarters
              </h3>

              <div className="space-y-4 text-xs text-neutral-600 dark:text-neutral-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-neutral-900 dark:text-white text-sm mb-0.5">Physical Address:</strong>
                    <span>{settings.address}</span>
                    <span className="block text-neutral-400">{settings.cityCountry}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <Mail className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <strong className="block text-neutral-900 dark:text-white text-xs mb-0.5">Email Inquiry:</strong>
                    <a href={`mailto:${settings.email}`} className="text-amber-600 dark:text-amber-400 hover:underline">
                      {settings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <Phone className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <strong className="block text-neutral-900 dark:text-white text-xs mb-0.5">Direct Helpline:</strong>
                    <a href={`tel:${settings.phone}`} className="text-amber-600 dark:text-amber-400 hover:underline font-mono">
                      {settings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <strong className="block text-neutral-900 dark:text-white text-xs mb-0.5">Working Hours:</strong>
                    <span>{settings.businessHours}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={() => openWhatsAppInquiry(undefined, "Hello Mahalakshmi Creation, I would like to make an inquiry via WhatsApp.")}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Instant WhatsApp Chat
                </button>
              </div>
            </div>

          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-10 border border-amber-500/20 luxury-card-shadow">
            
            <h3 className="font-cinzel text-2xl font-bold mb-2">
              Send Concierge Inquiry
            </h3>
            <p className="text-xs text-neutral-500 mb-8 font-sans">
              Fill out the form below and our chief embroidery designer will review your requirements.
            </p>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 mx-auto" />
                <h4 className="font-cinzel text-lg font-bold">Inquiry Received</h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  Thank you for contacting Mahalakshmi Creation. We will review your message and reach back via email or WhatsApp.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl border border-emerald-500 mt-4"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 block mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Sheikha Maryam"
                      className="w-full text-xs p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. maryam@couture.com"
                      className="w-full text-xs p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 block mb-1">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +971 50 123 4567"
                      className="w-full text-xs p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 block mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={e => setFormData({ ...formData, country: e.target.value })}
                      placeholder="e.g. United Arab Emirates, UK, USA"
                      className="w-full text-xs p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 block mb-1">
                    Interested Product SKU or Category
                  </label>
                  <input
                    type="text"
                    value={formData.productTitle}
                    onChange={e => setFormData({ ...formData, productTitle: e.target.value })}
                    placeholder="e.g. MC-BRD-801 or Neck Embroidery"
                    className="w-full text-xs p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 block mb-1">
                    Detailed Message / Customization Request *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe quantity, color preferences, fabric choice, or delivery deadline..."
                    className="w-full text-xs p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Submitting Message...' : 'Submit Inquiry'}
                </button>
              </form>
            )}

          </div>

        </div>

        {/* Google Map Frame Visual */}
        <div className="rounded-3xl overflow-hidden border border-amber-500/20 shadow-2xl bg-neutral-900">
          <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex items-center gap-2 text-xs font-mono text-amber-400">
            <MapPin className="w-4 h-4" />
            <span>Interactive Map Location • Ring Road Textile Hub, Surat</span>
          </div>
          <iframe
            title="Mahalakshmi Creation Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.0827297920197!2d72.84365787595562!3d21.188879882260656!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04e5f2cf2a875%3A0xb3a826bc5e4ff8bd!2sSurat%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="380"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
          />
        </div>

      </div>
    </div>
  );
};
