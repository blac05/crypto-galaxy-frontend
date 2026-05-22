import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Animated galaxy core
function GalaxyCore() {
  const meshRef = useRef();
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
  });
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <Sphere args={[1.8, 64, 64]}>
        <MeshDistortMaterial
          color="#7B2FBE"
          emissive="#1A6DFF"
          emissiveIntensity={0.6}
          distort={0.5}
          speed={1.5}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
    </mesh>
  );
}

// Orbiting crypto planets
function CryptoPlanet({ position, color, emissive, size = 0.5, speed = 0.3, orbitRadius, orbitSpeed }) {
  const meshRef = useRef();
  const angle = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (!meshRef.current) return;
    angle.current += orbitSpeed * 0.01;
    meshRef.current.position.x = Math.cos(angle.current) * orbitRadius;
    meshRef.current.position.z = Math.sin(angle.current) * orbitRadius;
    meshRef.current.rotation.y += speed * 0.02;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.8}
        roughness={0.2}
        metalness={0.9}
      />
    </mesh>
  );
}

// Orbit ring
function OrbitRing({ radius, color }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return pts;
  }, [radius]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.15} />
    </line>
  );
}

// Particle field (asteroid belt)
function ParticleField({ count = 800 }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 0.3;
      pos[i * 3] = r * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi);
      pos[i * 3 + 2] = r * Math.sin(theta);
    }
    return pos;
  }, [count]);

  const meshRef = useRef();
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#00F5FF" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

// Nebula glow
function NebulaCloud({ position, color, scale = 4 }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z = state.clock.elapsedTime * 0.03;
    meshRef.current.material.opacity = 0.04 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
  });
  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.05} side={THREE.BackSide} />
    </mesh>
  );
}

export default function GalaxyScene({ interactive = true }) {
  return (
    <Canvas
      camera={{ position: [0, 4, 14], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#380466" distance={20} />
      <pointLight position={[10, 5, 0]} intensity={1} color="#1A6DFF" distance={30} />
      <pointLight position={[-10, -5, 0]} intensity={0.8} color="#00F5FF" distance={25} />

      <Suspense fallback={null}>
        <Stars radius={80} depth={60} count={5000} factor={4} saturation={0.5} fade speed={0.5} />

        {/* Galaxy core */}
        <GalaxyCore />

        {/* Nebula clouds */}
        <NebulaCloud position={[8, 2, -5]} color="#7B2FBE" scale={6} />
        <NebulaCloud position={[-8, -2, 5]} color="#1A6DFF" scale={5} />

        {/* Orbit rings */}
        <OrbitRing radius={3} color="#00F5FF" />
        <OrbitRing radius={4.5} color="#7B2FBE" />
        <OrbitRing radius={6} color="#1A6DFF" />
        <OrbitRing radius={8} color="#FFD700" />

        {/* Crypto planets */}
        {/* BTC - Orange */}
        <CryptoPlanet color="#F7931A" emissive="#F7931A" size={0.55} orbitRadius={3} orbitSpeed={0.8} />
        {/* ETH - Blue */}
        <CryptoPlanet color="#627EEA" emissive="#627EEA" size={0.45} orbitRadius={4.5} orbitSpeed={0.5} />
        {/* SOL - Purple */}
        <CryptoPlanet color="#9945FF" emissive="#9945FF" size={0.4} orbitRadius={6} orbitSpeed={0.35} />
        {/* USDT - Green */}
        <CryptoPlanet color="#26A17B" emissive="#26A17B" size={0.35} orbitRadius={8} orbitSpeed={0.25} />

        {/* Particle field */}
        <ParticleField count={600} />
      </Suspense>

      {interactive && <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} maxPolarAngle={Math.PI * 0.6} minPolarAngle={Math.PI * 0.3} />}
    </Canvas>
  );
}
