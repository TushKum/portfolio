'use client';

import { useEffect, useRef } from 'react';
import { PerspectiveCamera, Vector3 } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useHasMouse } from '@/lib/hooks';

interface CameraControllerProps {
  /** Center of the rectangle the camera should frame, in world units. */
  stagePosition: [number, number, number];
  /** [width, height] of that rectangle. A near-zero dimension (0.1) makes the
   * fit constrain only the other axis — the trick for exact-width framing. */
  stageSize: [number, number];
  /** When false (reading views), mouse parallax is frozen. */
  controllable: boolean;
}

const ZERO = { x: 0, y: 0 };

/**
 * The site's entire camera system: no rotation ever, no tween library. Each
 * frame the target is recomputed as stage center + mouse parallax + the dolly
 * distance that exactly fits the stage rect, and the camera lerps 5% of the
 * way there. That one exponential lerp is both the scene-to-scene glide and
 * the parallax settle.
 */
export default function CameraController({ stagePosition, stageSize, controllable }: CameraControllerProps) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const hasMouse = useHasMouse();
  const fitDistance = useRef(5);
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef(new Vector3());

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX / window.innerWidth - 0.5;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // stageSize is a fresh array literal every SceneDirector render, and the
  // director re-renders on resize — that's what keeps refitting on resize
  // working. Don't memoize stageSize upstream.
  useEffect(() => {
    const vFov = (camera.fov * Math.PI) / 180;
    const fitHeight = stageSize[1] / 2 / Math.tan(vFov / 2);
    const fitWidth = stageSize[0] / 2 / camera.aspect / Math.tan(vFov / 2);
    fitDistance.current = Math.max(fitHeight, fitWidth);
  }, [camera, stageSize]);

  useFrame(() => {
    const parallax = controllable && hasMouse ? mouse.current : ZERO;
    target.current.set(
      stagePosition[0] + parallax.x * 2,
      stagePosition[1] + parallax.y * 1,
      stagePosition[2] + fitDistance.current
    );
    camera.position.lerp(target.current, 0.05);
  });

  return null;
}
