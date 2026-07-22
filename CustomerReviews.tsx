import React from 'react';
import { useApp } from '../../context/AppContext';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export const CustomerReviews: React.FC = () => {
  const { reviews } = useApp();

  const approvedReviews = reviews.filter(r => r.status === 'approved');

  if (approvedReviews.length === 0) return null;

  return (
    <section className="py-20 bg-neutral-50 dark:bg-neutral-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
            Client Testimonials & Praise
          </span>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
            Words From Our Global Clientele
          </h2>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {approvedReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-amber-500/20 luxury-card-shadow flex flex-col justify-between space-y-6 relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-amber-500/20" />

              <div className="space-y-4">
                {/* Rating Stars */}
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-neutral-300 dark:text-neutral-700'}`}
                    />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
                {rev.avatarUrl ? (
                  <img
                    src={rev.avatarUrl}
                    alt={rev.clientName}
                    className="w-10 h-10 rounded-full object-cover border border-amber-500/30"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full gold-gradient-bg text-neutral-950 font-bold flex items-center justify-center font-cinzel text-sm">
                    {rev.clientName.charAt(0)}
                  </div>
                )}

                <div>
                  <h4 className="font-cinzel font-semibold text-sm text-neutral-900 dark:text-white">
                    {rev.clientName}
                  </h4>
                  <span className="text-[10px] text-neutral-400 block">
                    {rev.location}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
