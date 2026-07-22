import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Center, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Product } from '../../types';
import { X, RotateCw, ZoomIn, Sparkles, Sun, Moon, Shield, Eye, Layers } from 'lucide-react';

function MannequinSculpture({ fabricType }: { fabricType: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.25;
    }
  });

  // Color & texture style based on fabric
  let baseColor = "#171717";
  let accentColor = "#D4AF37";
  if (fabricType.toLowerCase().includes('velvet')) {
    baseColor = "#1a0b12";
    accentColor = "#e6c567";
  } else if (fabricType.toLowerCase().includes('silk')) {
    baseColor = "#261c0d";
    accentColor = "#ffd700";
  }

  return (
    <group ref={groupRef}>
      {/* Mannequin Torso */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.7, 0.5, 2.2, 32]} />
        <meshStandardMaterial color={baseColor} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Neck & Stand */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
        <meshStandardMaterial color={accentColor} metalness={0.9} roughness={0.2} />
      </mesh>
      <sphereGeometry />
      <mesh position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={accentColor} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Golden Zardozi Embroidery Ring Motif across Chest */}
      <mesh position={[0, 0.6, 0.35]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[0.8, 0.05, 16, 64]} />
        <meshStandardMaterial color="#FFD700" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Sequins & Mirror Jewels */}
      {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 0.2 + (i % 2) * 0.3, 0.45]}>
          <octahedronGeometry args={[0.08]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#ffd700" : "#ff4500"} metalness={1} roughness={0.1} />
        </mesh>
      ))}

      {/* Flowing Dupatta / Kalis */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[1.2, 0, 0]} rotation={[0, 0, -0.3]}>
          <planeGeometry args={[1.2, 2.5, 16, 16]} />
          <meshStandardMaterial color={baseColor} roughness={0.5} metalness={0.7} side={THREE.DoubleSide} />
        </mesh>
      </Float>
    </group>
  );
}

export const ProductViewer3DModal: React.FC<{ product: Product; onClose: () => void }> = ({ product, onClose }) => {
  const [lightingMode, setLightingMode] = useState<'studio' | 'sunset' | 'royal'>('studio');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'3d' | 'details' | 'fabric'>('3d');

  let lightColor = "#ffd700";
  let ambientIntensity = 1.0;
  if (lightingMode === 'sunset') {
    lightColor = "#ff7b00";
    ambientIntensity = 0.8;
  } else if (lightingMode === 'royal') {
    lightColor = "#e6c567";
    ambientIntensity = 1.4;
  }

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-5xl h-[90vh] rounded-3xl bg-neutral-900 border border-amber-500/40 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gold-gradient-bg text-neutral-950 font-bold flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold block">
                Mahalakshmi 3D Immersive Showroom
              </span>
              <h2 className="text-white font-cinzel text-base sm:text-lg font-bold truncate max-w-md">
                {product.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('3d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === '3d' ? 'gold-gradient-bg text-neutral-950' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              3D Mannequin
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === 'details' ? 'gold-gradient-bg text-neutral-950' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Embroidery Spec
            </button>
            <button
              onClick={() => setActiveTab('fabric')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === 'fabric' ? 'gold-gradient-bg text-neutral-950' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Fabric Texture
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 ml-4 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 overflow-hidden flex flex-col md:flex-row">
          
          {/* Main 3D Viewport or Tabs */}
          {activeTab === '3d' ? (
            <div className="flex-1 relative w-full h-full min-h-[400px]">
              <Canvas camera={{ position: [0, 1, 5], fov: 50 }} gl={{ antialias: true }}>
                <ambientLight intensity={ambientIntensity} />
                <directionalLight position={[5, 8, 5]} intensity={2.5} color={lightColor} castShadow />
                <pointLight position={[-5, -5, -2]} intensity={1.5} color="#d97706" />
                
                <Stage environment="city" intensity={0.5} adjustCamera={false}>
                  <Center>
                    <MannequinSculpture fabricType={product.fabric} />
                  </Center>
                </Stage>

                <OrbitControls 
                  enableZoom={true} 
                  autoRotate={autoRotate} 
                  autoRotateSpeed={1.5} 
                  maxPolarAngle={Math.PI / 2 + 0.1}
                  minDistance={2}
                  maxDistance={9}
                />
              </Canvas>

              {/* 3D Control Overlay Floating Toolbar */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-neutral-950/90 border border-amber-500/40 backdrop-blur-md shadow-2xl text-white text-xs font-mono">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors ${
                    autoRotate ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: autoRotate ? '6s' : '0s' }} />
                  <span>360° Rotate</span>
                </button>

                <div className="h-4 w-[1px] bg-neutral-800" />

                <span className="text-neutral-400">Lighting:</span>
                {(['studio', 'sunset', 'royal'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setLightingMode(mode)}
                    className={`px-2.5 py-1 rounded-lg uppercase text-[10px] tracking-wider font-bold transition-all ${
                      lightingMode === mode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          ) : activeTab === 'details' ? (
            <div className="flex-1 p-8 overflow-y-auto space-y-6 text-white font-sans">
              <div className="border-b border-neutral-800 pb-4">
                <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">SKU: {product.sku}</span>
                <h3 className="font-cinzel text-2xl font-bold mt-1">{product.title}</h3>
                <p className="text-amber-400 font-mono text-lg font-bold mt-2">₹{product.price.toLocaleString('en-IN')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <span className="text-neutral-400 uppercase font-mono text-[10px]">Fabric & Base Material</span>
                  <p className="font-bold text-white text-sm">{product.fabric}</p>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <span className="text-neutral-400 uppercase font-mono text-[10px]">Embroidery Work Type</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {product.workType.map((w, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px]">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h4 className="font-cinzel font-bold text-amber-300 text-sm uppercase tracking-wider">Craftsmanship Description</h4>
                <p className="text-neutral-300 text-xs leading-relaxed">{product.description}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-8 overflow-y-auto space-y-6 text-white font-sans">
              <div className="border-b border-neutral-800 pb-4">
                <h3 className="font-cinzel text-xl font-bold text-amber-300">Fabric Texture & Metallic Zari Inspection</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  High-definition macroscopic view of the hand-stitched Zardozi and metal wire embroidery.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.images.map((img, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-amber-500/30 bg-neutral-950 relative group aspect-video">
                    <img src={img} alt={`Texture ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent flex items-end p-4">
                      <span className="text-xs font-mono text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> High-Resolution Fabric Zoom Angle {i + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Right Sidebar Thumbnail Quick Switch */}
          <div className="w-full md:w-80 bg-neutral-950 p-6 border-t md:border-t-0 md:border-l border-neutral-800 flex flex-col justify-between shrink-0">
            <div className="space-y-4">
              <h4 className="font-cinzel text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4" /> Available Colors & Swatches
              </h4>

              <div className="space-y-2">
                {product.availableColors.map((col, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
                    <span className="w-5 h-5 rounded-full border border-white/20 shrink-0 shadow-md" style={{ backgroundColor: col.hex }} />
                    <span className="font-bold text-white">{col.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">Min Order Qty:</span>
                <span className="text-amber-300 font-bold">{product.minOrderQty || 1} Piece(s)</span>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl gold-gradient-bg text-neutral-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-lg"
              >
                Close 3D Viewer
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
