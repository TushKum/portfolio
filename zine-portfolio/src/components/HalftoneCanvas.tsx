'use client';

import { Canvas } from '@react-three/fiber';
import ClusterField from '@/components/ClusterField';

/**
 * Fixed full-viewport canvas behind the HTML grid. The wrapper carries
 * mix-blend-multiply so the dark halftone ink multiplies into the paper
 * background — dots read as printed, not overlaid.
 */
export default function HalftoneCanvas() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 mix-blend-multiply">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 13], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ClusterField />
      </Canvas>
    </div>
  );
}
