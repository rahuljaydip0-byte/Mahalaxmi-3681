import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Sparkles, Film, Crown, CheckCircle2 } from 'lucide-react';

export const EmbroideryVideoShowcase: React.FC = () => {
  const { videos } = useApp();
  const [activeVidIdx, setActiveVidIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  if (videos.length === 0) return null;

  const currentVid = videos[activeVidIdx] || videos[0];

  return (
    <section className="py-20 bg-neutral-950 text-white border-y border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-amber-400 font-bold mb-2">
              <Film className="w-4 h-4" />
              Motion & Reflection Showcase
            </div>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold">
              Embroidery Video Gallery
            </h2>
          </div>
          <p className="text-xs text-neutral-400 max-w-md font-sans leading-relaxed">
            Witness the three-dimensional shimmer of Swarovski crystals, hand-spun Zardozi wires, and precision multi-needle embroidery under movement.
          </p>
        </div>

        {/* Video Player & Playlist */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Video Viewport */}
          <div className="lg:col-span-2 relative aspect-video rounded-3xl overflow-hidden bg-neutral-900 border border-amber-500/30 shadow-2xl">
            {isPlaying ? (
              <video
                src={currentVid.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={currentVid.thumbnailUrl}
                  alt={currentVid.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-neutral-950/40 flex flex-col items-center justify-center p-6 text-center">
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="w-20 h-20 rounded-full gold-gradient-bg text-neutral-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform mb-4 group"
                    aria-label="Play Embroidery Video"
                  >
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </button>
                  <span className="text-xs font-mono text-amber-300 uppercase tracking-widest bg-neutral-900/80 px-3 py-1 rounded-full border border-amber-500/30">
                    HD • 4K Reflection Inspection
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Playlist Side items */}
          <div className="space-y-4">
            <h3 className="font-cinzel text-sm uppercase font-bold text-amber-300 tracking-wider flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Featured Master Videos
            </h3>

            <div className="space-y-3">
              {videos.map((vid, idx) => (
                <div
                  key={vid.id}
                  onClick={() => {
                    setActiveVidIdx(idx);
                    setIsPlaying(true);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                    activeVidIdx === idx
                      ? 'bg-neutral-900 border-amber-500/50 shadow-lg'
                      : 'bg-neutral-900/40 border-neutral-800 hover:border-amber-500/20'
                  }`}
                >
                  <div className="relative w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-neutral-800">
                    <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-neutral-950/30 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-current" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-cinzel text-xs font-semibold text-white line-clamp-1">
                      {vid.title}
                    </h4>
                    <span className="text-[10px] text-neutral-400 font-mono block mt-1">
                      Duration: {vid.duration || '2:00'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
