import React from 'react';
import { Award, Globe2, Sparkles, Scissors, Clock, ShieldCheck } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const pillars = [
    {
      icon: Award,
      title: "Royal Heritage Craftsmanship",
      desc: "Authentic Zardozi, Tilla, Resham, and cutwork needlecraft engineered by 3rd-generation master artisans."
    },
    {
      icon: Scissors,
      title: "100% Bespoke Tailoring",
      desc: "Custom color swatches, adjustable neck depths, and full tech-pack modifications according to designer specifications."
    },
    {
      icon: Globe2,
      title: "Express Global Priority Shipping",
      desc: "Direct air-freight door-to-door delivery across USA, UK, UAE, Saudi Arabia, Canada, Europe & Australia."
    },
    {
      icon: ShieldCheck,
      title: "Strict Quality Inspection",
      desc: "Every panel passes 12-point inspection checking stitch density, mirror binding strength, and stone alignment."
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-neutral-900 border-b border-amber-500/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
            Uncompromising Excellence
          </span>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
            Why Choose Mahalakshmi Creation
          </h2>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-amber-500/15 dark:border-neutral-700/50 luxury-card-shadow hover:-translate-y-1 transition-all duration-300 space-y-4"
              >
                <div className="w-12 h-12 rounded-xl gold-gradient-bg p-0.5 shadow-md inline-block">
                  <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center text-amber-400">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="font-cinzel font-semibold text-lg text-neutral-900 dark:text-white">
                  {p.title}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
