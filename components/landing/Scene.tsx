'use client';

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef, useEffect, memo } from "react";
import * as THREE from "three";

import { waveFragmentShader, waveVertexShader } from './shaders';
import './scene.css';

// Use device pixel ratio for crisp rendering on high-DPI displays
const getDPR = () => {
  if (typeof window === 'undefined') return 1;
  // Cap at 2 for performance, but allow higher on very high-DPI displays
  return Math.min(window.devicePixelRatio || 1, 2);
};

const DitheredWaves = memo(() => {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const dprRef = useRef(getDPR());

  // Initialize uniforms with proper default values
  // Three.js uniforms should be plain objects with 'value' property
  const uniforms = useRef({
    time: {
      value: 0.0,
    },
    resolution: {
      value: new THREE.Vector2(
        typeof window !== 'undefined' ? window.innerWidth * dprRef.current : 1920,
        typeof window !== 'undefined' ? window.innerHeight * dprRef.current : 1080
      ),
    },
    colorNum: {
      value: 4.0, // Not used for quantization anymore, kept for compatibility
    },
    pixelSize: {
      value: 2.0,
    },
    mouse: {
      value: new THREE.Vector2(0.5, 0.5),
    },
  }).current;

  // Track mouse movement
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth > 0 && window.innerHeight > 0) {
        mouseRef.current.x = e.clientX / window.innerWidth;
        mouseRef.current.y = 1.0 - (e.clientY / window.innerHeight); // Flip Y coordinate
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  // Initialize resolution on mount and window resize
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
        // Only update time and mouse - resolution is handled in useEffect
        material.uniforms.time.value = clock.getElapsedTime();
        // Smoothly update mouse position
        if (material.uniforms.mouse?.value) {
          material.uniforms.mouse.value.lerp(
            new THREE.Vector2(mouseRef.current.x, mouseRef.current.y),
            0.1
          );
        }
      }
    }
  });

  return (
    <>
      <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          fragmentShader={waveFragmentShader}
          vertexShader={waveVertexShader}
          uniforms={uniforms}
          wireframe={false}
        />
      </mesh>
    </>
  );
});

DitheredWaves.displayName = 'DitheredWaves';

const Scene = memo(() => {
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  
  return (
    <Canvas 
      camera={{ position: [0, 0, 6] }} 
      dpr={[dpr, dpr]}
      style={{ width: '100%', height: '100%', background: 'var(--color-background)' }}
      gl={{ 
        antialias: true, 
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
        depth: false
      }}
      frameloop="always"
      performance={{ min: 0.5 }}
    >
      <Suspense fallback={null}>
        <DitheredWaves />
      </Suspense>
    </Canvas>
  );
});

Scene.displayName = 'Scene';

export default Scene;

