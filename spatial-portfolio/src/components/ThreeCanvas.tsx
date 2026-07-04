'use client';

import { Suspense } from 'react';
import { LinearToneMapping } from 'three';
import { Canvas } from '@react-three/fiber';
import SceneDirector from '@/components/SceneDirector';

/**
 * Bare R3F canvas on r3f defaults (fov 75, camera z 5, dpr [1,2]) except tone
 * mapping forced to Linear so the flat sketch colors don't get filmic-crushed.
 * Transparent — the DOM body's background color shows through.
 */
export default function ThreeCanvas() {
  return (
    <Canvas
      onCreated={({ gl }) => {
        gl.toneMapping = LinearToneMapping;
      }}
    >
      <ambientLight />
      <Suspense fallback={null}>
        <SceneDirector />
      </Suspense>
    </Canvas>
  );
}
