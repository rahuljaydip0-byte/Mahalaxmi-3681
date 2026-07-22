import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function FloatingEmbroideryRing({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <torusGeometry args={[1.5, 0.08, 16, 100]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.9} 
          roughness={0.15} 
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

function FloatingSilkCloth({ position }: { position: [number, number, number] }) {
  const clothRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (clothRef.current) {
      clothRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={clothRef} position={position} rotation={[0.4, 0.2, 0]}>
        <planeGeometry args={[3, 3, 32, 32]} />
        <MeshDistortMaterial
          color="#1a1408"
          roughness={0.3}
          metalness={0.8}
          distort={0.4}
          speed={2}
          bumpScale={0.05}
        />
      </mesh>
    </Float>
  );
}

export const EmbroideryParticles3D: React.FC<{ className?: string }> = ({ className = "absolute inset-0 pointer-events-none" }) => {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 10, 5]} intensity={2.5} color="#ffd700" />
        <pointLight position={[-10, -10, -5]} intensity={1.5} color="#d97706" />

        {/* Floating Gold & Bronze Embroidery Rings */}
        <FloatingEmbroideryRing position={[-3, 1.5, -2]} color="#D4AF37" scale={1.2} />
        <FloatingEmbroideryRing position={[3.5, -1, -3]} color="#E5C158" scale={0.9} />
        <FloatingEmbroideryRing position={[-2, -2, -1]} color="#B8860B" scale={0.7} />

        {/* Floating Silk & Zardozi Planes */}
        <FloatingSilkCloth position={[2.5, 2, -2.5]} />

        {/* Sparkling Thread Dust */}
        <Sparkles 
          count={150} 
          scale={12} 
          size={3} 
          speed={0.4} 
          color="#ffd700" 
          opacity={0.8}
        />
        <Sparkles 
          count={80} 
          scale={10} 
          size={5} 
          speed={0.2} 
          color="#fff5cc" 
          opacity={0.6}
        />
      </Canvas>
    </div>
  );
};
