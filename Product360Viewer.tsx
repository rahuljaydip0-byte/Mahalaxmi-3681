import React, { useState, useRef, useEffect } from 'react';
import { Rotate3D, Play, Pause, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface Product360ViewerProps {
  frames: string[];
  productTitle: string;
}

export const Product360Viewer: React.FC<Product360ViewerProps> = ({ frames, productTitle }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const isDragging = useRef(false);
  const startX = useRef(0);

  const totalFrames = frames.length > 0 ? frames.length : 1;

  useEffect(() => {
    if (!isAutoRotating || totalFrames <= 1) return;
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % totalFrames);
    }, 200);
    return () => clearInterval(interval);
  }, [isAutoRotating, totalFrames]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    setIsAutoRotating(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - startX.current;
    if (Math.abs(deltaX) > 15) {
      if (deltaX > 0) {
        setCurrentFrame(prev => (prev - 1 + totalFrames) % totalFrames);
      } else {
        setCurrentFrame(prev => (prev + 1) % totalFrames);
      }
      startX.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  if (!frames || frames.length === 0) return null;

  return (
    <div className="relative p-6 bg-neutral-950 rounded-3xl border border-amber-500/30 text-white shadow-2xl overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Rotate3D className="w-5 h-5 text-amber-400 animate-spin-slow" />
          <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-amber-300">
            Interactive 360° Rotational View
          </h3>
        </div>
        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
          Drag horizontally to rotate
        </span>
      </div>

      {/* Main Interactive Stage */}
      <div
        className="relative aspect-[4/5] max-h-[500px] w-full mx-auto overflow-hidden rounded-2xl bg-neutral-900 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={frames[currentFrame]}
          alt={`${productTitle} - 360 view frame ${currentFrame + 1}`}
          className="w-full h-full object-cover object-center pointer-events-none transition-all duration-75"
        />

        {/* Rotation Badge overlay */}
        <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-neutral-950/80 backdrop-blur-md border border-amber-500/30 text-[11px] font-mono text-amber-300 flex items-center gap-2">
          <span>Frame {currentFrame + 1} / {totalFrames}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentFrame(prev => (prev - 1 + totalFrames) % totalFrames)}
            className="p-2.5 rounded-xl bg-neutral-900 text-amber-400 hover:bg-neutral-800 border border-neutral-800 transition-colors"
            title="Previous Frame"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsAutoRotating(prev => !prev)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
              isAutoRotating ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-900 text-amber-300 border border-neutral-800'
            }`}
          >
            {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isAutoRotating ? 'Pause 360°' : 'Auto 360° Spin'}
          </button>

          <button
            onClick={() => setCurrentFrame(prev => (prev + 1) % totalFrames)}
            className="p-2.5 rounded-xl bg-neutral-900 text-amber-400 hover:bg-neutral-800 border border-neutral-800 transition-colors"
            title="Next Frame"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-neutral-400 hidden sm:block font-sans">
          Inspect stitch density & mirror depth from all angles
        </p>
      </div>

    </div>
  );
};
