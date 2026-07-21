import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

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
    vec3 color = uColorGlow * fresnel * 1.5;
    gl_FragColor = vec4(color, fresnel * 0.85);
  }
`;

export default function ThreeHeroModel() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const textureLoader = new THREE.TextureLoader();
    const coinFront = textureLoader.load('/coins/coin1.png');
    const coinBack = textureLoader.load('/coins/coin2.png');

    const scene = new THREE.Scene();
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.3);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const purpleLight = new THREE.PointLight(0xc084fc, 15, 8);
    purpleLight.position.set(-4, 2, 2);
    scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 15, 8);
    cyanLight.position.set(4, -2, 2);
    scene.add(cyanLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const coinsGroup = new THREE.Group();
    mainGroup.add(coinsGroup);

    const coinGroups = [];
    const count = 6;
    const radius = 0.95;

    const sideMat = new THREE.MeshStandardMaterial({ color: 0x20153b, metalness: 0.9, roughness: 0.2 });
    const topFaceMat = new THREE.MeshStandardMaterial({ map: coinFront, bumpMap: coinFront, bumpScale: 0.005, metalness: 0.9, roughness: 0.15 });
    const bottomFaceMat = new THREE.MeshStandardMaterial({ map: coinBack, bumpMap: coinBack, bumpScale: 0.005, metalness: 0.9, roughness: 0.15 });

    const uniforms = { uTime: { value: 0 }, uColorGlow: { value: new THREE.Color('#c084fc') }, uFresnelPower: { value: 1.2 } };

    const sideGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.07, 32, 1, true);
    const faceGeom = new THREE.CircleGeometry(0.28, 32);
    const glowGeom = new THREE.CylinderGeometry(0.283, 0.283, 0.073, 32);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const coinGroup = new THREE.Group();
      coinGroup.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);

      const meshGroup = new THREE.Group();
      meshGroup.rotation.x = Math.PI / 2;
      coinGroup.add(meshGroup);

      meshGroup.add(new THREE.Mesh(sideGeom, sideMat));

      const topMesh = new THREE.Mesh(faceGeom, topFaceMat);
      topMesh.position.y = 0.0351;
      topMesh.rotation.x = -Math.PI / 2;
      meshGroup.add(topMesh);

      const bottomMesh = new THREE.Mesh(faceGeom, bottomFaceMat);
      bottomMesh.position.y = -0.0351;
      bottomMesh.rotation.x = Math.PI / 2;
      meshGroup.add(bottomMesh);

      const glowMat = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      meshGroup.add(new THREE.Mesh(glowGeom, glowMat));

      coinsGroup.add(coinGroup);
      coinGroups.push(coinGroup);
    }

    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      mainGroup.rotation.y = 0.35 + Math.sin(t * 0.1) * 0.04;
      mainGroup.rotation.x = 0.20 + Math.cos(t * 0.1) * 0.02;
      coinsGroup.rotation.z = t * 0.15;
      coinGroups.forEach((coin, idx) => {
        coin.rotation.y = t * 0.7 + idx * (Math.PI / 3);
        coin.rotation.x = 0;
        coin.rotation.z = 0;
      });
      uniforms.uTime.value = t;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    cleanupRef.current = () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      sideGeom.dispose();
      faceGeom.dispose();
      glowGeom.dispose();
      sideMat.dispose();
      topFaceMat.dispose();
      bottomFaceMat.dispose();
      coinFront.dispose();
      coinBack.dispose();
    };

    return () => { if (cleanupRef.current) cleanupRef.current(); };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative flex items-center justify-center bg-transparent">
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[70%] h-[70%] rounded-full bg-[#00d2ff]/3 blur-[120px] mix-blend-screen" />
        <div className="absolute w-[60%] h-[60%] rounded-full bg-[#7c5cfc]/3 blur-[100px] mix-blend-screen" />
      </div>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
