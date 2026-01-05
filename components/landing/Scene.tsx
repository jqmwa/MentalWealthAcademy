'use client';

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useEffect, memo } from "react";
import * as THREE from "three";

import { cubeFragmentShader, cubeVertexShader } from './cubeShaders';
import './scene.css';

// Use device pixel ratio for crisp rendering on high-DPI displays
const getDPR = () => {
  if (typeof window === 'undefined') return 1;
  return Math.min(window.devicePixelRatio || 1, 2);
};

// Cube component with unique rotation
const RotatingCube = memo(({ position, rotationSpeed, scale }: { position: [number, number, number], rotationSpeed: [number, number, number], scale: number }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const dprRef = useRef(getDPR());
  const textureRef = useRef<THREE.Texture | null>(null);

  // Create texture on mount
  useEffect(() => {
    if (!textureRef.current && typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Create a simple gradient texture
        const gradient = ctx.createLinearGradient(0, 0, 256, 256);
        gradient.addColorStop(0, 'rgba(81, 104, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(45, 55, 100, 0.8)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        textureRef.current = new THREE.CanvasTexture(canvas);
        textureRef.current.needsUpdate = true;
        
        // Update uniform if material exists
        if (mesh.current?.material) {
          const material = mesh.current.material as THREE.ShaderMaterial;
          if (material.uniforms?.utexture) {
            material.uniforms.utexture.value = textureRef.current;
          }
        }
      }
    }
  }, []);

  const uniforms = useRef({
    time: { value: 0.0 },
    rotationSpeed: { value: new THREE.Vector3(...rotationSpeed) },
    ucolor1: { value: new THREE.Vector3(0.318, 0.408, 1.0) }, // Purple
    ucolor2: { value: new THREE.Vector3(0.22, 0.25, 0.38) }, // Dark purple
    ucolor3: { value: new THREE.Vector3(0.45, 0.55, 1.0) }, // Bright purple
    ucolor4: { value: new THREE.Vector3(0.18, 0.18, 0.24) }, // Dark
    ucolor5: { value: new THREE.Vector3(0.28, 0.35, 0.55) }, // Medium purple
    asciicode: { value: 20.0 },
    utexture: { value: null as THREE.Texture | null },
    brightness: { value: 1.0 },
    asciiu: { value: 0.3 },
    resolution: {
      value: new THREE.Vector2(
        typeof window !== 'undefined' ? window.innerWidth * dprRef.current : 1920,
        typeof window !== 'undefined' ? window.innerHeight * dprRef.current : 1080
      ),
    },
  }).current;

  // Update texture uniform when texture is ready
  useEffect(() => {
    if (textureRef.current && uniforms.utexture) {
      uniforms.utexture.value = textureRef.current;
    }
  }, [uniforms]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateResolution = () => {
      dprRef.current = getDPR();
      if (uniforms.resolution.value && window.innerWidth > 0 && window.innerHeight > 0) {
        uniforms.resolution.value.set(
          window.innerWidth * dprRef.current,
          window.innerHeight * dprRef.current
        );
      }
    };
    
    updateResolution();
    window.addEventListener('resize', updateResolution);
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateResolution);
      }
    };
  }, [uniforms]);

  useFrame((state) => {
    const { clock } = state;
    if (mesh.current && mesh.current.material) {
      const material = mesh.current.material as THREE.ShaderMaterial;
      if (material.uniforms) {
        material.uniforms.time.value = clock.getElapsedTime();
      }
    }
  });

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <boxGeometry args={[1.0, 1.0, 1.0]} />
      <shaderMaterial
        fragmentShader={cubeFragmentShader}
        vertexShader={cubeVertexShader}
        uniforms={uniforms}
      />
    </mesh>
  );
});

RotatingCube.displayName = 'RotatingCube';

const CubesScene = memo(() => {
  // Generate cubes with unique positions and rotation speeds
  const cubes = [];
  const count = 20;
  
  for (let i = 0; i < count; i++) {
    // Use a more spread out distribution
    const angle = (i / count) * Math.PI * 2;
    // Larger radius range for more spacing
    const radius = 4 + Math.random() * 5;
    const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 2;
    const y = Math.sin(angle) * radius + (Math.random() - 0.5) * 2;
    // More depth spread
    const z = (Math.random() - 0.5) * 8;
    
    // Unique rotation speeds for each cube
    const rotX = (Math.random() - 0.5) * 0.5;
    const rotY = (Math.random() - 0.5) * 0.5;
    const rotZ = (Math.random() - 0.5) * 0.5;
    
    // Scale variation - only larger (1.0 to 2.5 range)
    const scale = 1.0 + Math.random() * 1.5; // Range: 1.0 to 2.5
    
    cubes.push({
      position: [x, y, z] as [number, number, number],
      rotationSpeed: [rotX, rotY, rotZ] as [number, number, number],
      scale: scale,
    });
  }

  return (
    <>
      {cubes.map((cube, i) => (
        <RotatingCube
          key={i}
          position={cube.position}
          rotationSpeed={cube.rotationSpeed}
          scale={cube.scale}
        />
      ))}
    </>
  );
});

CubesScene.displayName = 'CubesScene';

const Scene = memo(() => {
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  
  return (
    <Canvas 
      camera={{ position: [0, 0, 10], fov: 75 }} 
      dpr={[dpr, dpr]}
      style={{ width: '100%', height: '100%', background: 'var(--color-background)' }}
      gl={{ 
        antialias: true, 
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
        depth: true
      }}
      frameloop="always"
      performance={{ min: 0.5 }}
    >
      <Suspense fallback={null}>
        <CubesScene />
      </Suspense>
    </Canvas>
  );
});

Scene.displayName = 'Scene';

export default Scene;

