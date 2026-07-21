import React, { useRef, Suspense, useMemo, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

// Custom Fresnel Glowing Shader
const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColorGlow;
  uniform float uFresnelPower;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), uFresnelPower);
    
    // Additive glowing purple color on the edges
    vec3 color = uColorGlow * fresnel * 1.5;
    
    gl_FragColor = vec4(color, fresnel * 0.85);
  }
`;

function Coin({ position, index, coinFront, coinBack, uniforms }) {
  const coinRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coinRef.current) {
      coinRef.current.rotation.y = t * 0.7 + index * (Math.PI / 3);
      coinRef.current.rotation.x = 0;
      coinRef.current.rotation.z = 0;
    }
  });

  return (
    <group position={position} ref={coinRef}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.28, 0.28, 0.07, 32, 1, true]} />
          <meshStandardMaterial color="#20153b" metalness={0.9} roughness={0.2} />
        </mesh>

        <mesh position={[0, 0.0351, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <circleGeometry args={[0.28, 32]} />
          <meshStandardMaterial map={coinFront} bumpMap={coinFront} bumpScale={0.005} metalness={0.9} roughness={0.15} />
        </mesh>

        <mesh position={[0, -0.0351, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <circleGeometry args={[0.28, 32]} />
          <meshStandardMaterial map={coinBack} bumpMap={coinBack} bumpScale={0.005} metalness={0.9} roughness={0.15} />
        </mesh>

        <mesh>
          <cylinderGeometry args={[0.283, 0.283, 0.073, 32]} />
          <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
    </group>
  );
}

function Scene() {
  const groupRef = useRef();
  const coinsGroupRef = useRef();

  const coinFront = useLoader(THREE.TextureLoader, '/coins/coin1.png');
  const coinBack = useLoader(THREE.TextureLoader, '/coins/coin2.png');

  const coins = useMemo(() => {
    const count = 6;
    const radius = 0.95;
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
    });
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorGlow: { value: new THREE.Color('#c084fc') },
    uFresnelPower: { value: 1.2 }
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = 0.35 + Math.sin(t * 0.1) * 0.04;
      groupRef.current.rotation.x = 0.20 + Math.cos(t * 0.1) * 0.02;
    }
    if (coinsGroupRef.current) {
      coinsGroupRef.current.rotation.z = t * 0.15;
    }
    uniforms.uTime.value = t;
  });

  return (
    <group ref={groupRef} position={[-0.15, 0, 0]}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={2.5} />
      <pointLight position={[-4, 2, 2]} color="#c084fc" intensity={15} decay={1.3} />
      <pointLight position={[4, -2, 2]} color="#06b6d4" intensity={15} decay={1.3} />

      <group ref={coinsGroupRef}>
        {coins.map((coin, idx) => (
          <Coin key={idx} position={[coin.x, coin.y, 0]} index={idx} coinFront={coinFront} coinBack={coinBack} uniforms={uniforms} />
        ))}
      </group>
    </group>
  );
}

export default function ThreeHeroModel({ onLoad }) {
  const [loaded, setLoaded] = useState(false);

  const handleCreated = () => {
    setLoaded(true);
    if (onLoad) {
      setTimeout(() => {
        onLoad();
      }, 300);
    }
  };

  return (
    <div className="w-full h-full relative flex items-center justify-center bg-[#050508]">
      {/* Soft ambient background glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[70%] h-[70%] rounded-full bg-[#00d2ff]/3 blur-[120px] mix-blend-screen" />
        <div className="absolute w-[60%] h-[60%] rounded-full bg-[#7c5cfc]/3 blur-[100px] mix-blend-screen" />
      </div>

      {/* Elegant loading spinner */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className="w-8 h-8 rounded-full border-2 border-[#7c5cfc]/20 border-t-[#7c5cfc] animate-spin" />
        </div>
      )}

      {/* Smooth fade-in container for active canvas */}
      <div className={`w-full h-full z-10 transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <Canvas
          camera={{ position: [0, 0, 4.3], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          className="w-full h-full"
          style={{ background: 'transparent' }}
          onCreated={handleCreated}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
