import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text, Center, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Sparkles as SparklesIcon, Compass, ArrowRight, Layers, Crown, Shield } from 'lucide-react';

function ShowroomHall() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Luxury Marble Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0c0a09" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Golden Pillars */}
      {[-8, -4, 4, 8].map((x, idx) => (
        <group key={idx} position={[x, 0, -6]}>
          <mesh>
            <cylinderGeometry args={[0.4, 0.4, 6, 32]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Floating Display Podiums */}
      {[-4, 0, 4].map((x, idx) => (
        <group key={idx} position={[x, -1.5, -2 + idx * 0.5]}>
          <mesh>
            <cylinderGeometry args={[1.2, 1.4, 1, 32]} />
            <meshStandardMaterial color="#1a1408" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[1.0, 1.0, 0.1, 32]} />
            <meshStandardMaterial color="#FFD700" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export const VirtualShowroom3D: React.FC<{ onSelectCategory: (category: string) => void }> = ({ onSelectCategory }) => {
  const [selectedZone, setSelectedZone] = useState<string>('Bridal Couture');

  const zones = [
    { title: 'Royal Bridal Lehengas', desc: 'Handcrafted Zardozi, Kundan & Resham Kalis', color: 'from-amber-500/20 to-neutral-900', count: '12 Masterpieces' },
    { title: 'International GCC Wear', desc: 'Exquisite Dubai & Saudi Embroidery Standards', color: 'from-yellow-600/20 to-neutral-900', count: '18 Styles' },
    { title: 'Neck & Front Panels', desc: 'Intricate Cutwork & Mirror Embellishments', color: 'from-amber-400/20 to-neutral-900', count: '24 Designs' }
  ];

  return (
    <div className="relative w-full h-[650px] rounded-3xl bg-neutral-950 border border-amber-500/30 overflow-hidden shadow-2xl flex flex-col">
      
      {/* Showroom Header Overlay */}
      <div className="absolute top-6 left-6 right-6 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gold-gradient-bg p-0.5 shadow-xl">
            <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <Crown className="w-6 h-6" />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
              Immersive 3D Atelier Showroom
            </span>
            <h2 className="text-white font-cinzel text-xl font-bold">Mahalakshmi Palace & Museum</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-amber-500/30">
          {zones.map((zone, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedZone(zone.title)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                selectedZone === zone.title 
                  ? 'gold-gradient-bg text-neutral-950 shadow-lg' 
                  : 'text-neutral-300 hover:text-white bg-neutral-800/50'
              }`}
            >
              {zone.title.split(' ')[0]} {zone.title.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 w-full h-full">
        <Canvas camera={{ position: [0, 1.5, 7], fov: 50 }}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[10, 10, 5]} intensity={2.5} color="#ffd700" />
          <pointLight position={[-10, 5, -5]} intensity={1.8} color="#d97706" />

          <ShowroomHall />

          <Sparkles count={100} scale={15} size={4} speed={0.3} color="#ffd700" opacity={0.6} />

          <OrbitControls 
            enableZoom={true} 
            autoRotate 
            autoRotateSpeed={0.8} 
            maxPolarAngle={Math.PI / 2} 
            minDistance={4}
            maxDistance={10}
          />
        </Canvas>
      </div>

      {/* Bottom Floating Interactive Zone Info Card */}
      <div className="absolute bottom-6 left-6 right-6 z-10 p-6 rounded-2xl bg-neutral-900/90 backdrop-blur-xl border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-400 font-mono text-xs uppercase font-bold">
            <SparklesIcon className="w-4 h-4" />
            <span>Active Showroom Zone: {selectedZone}</span>
          </div>
          <p className="text-white font-cinzel text-base font-bold">
            {zones.find(z => z.title === selectedZone)?.desc}
          </p>
        </div>

        <button
          onClick={() => onSelectCategory(selectedZone)}
          className="px-6 py-3 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-2 shadow-xl shrink-0"
        >
          <span>Explore Collection</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
