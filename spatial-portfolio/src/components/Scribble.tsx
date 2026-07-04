'use client';

import { useMemo, useRef } from 'react';
import { CatmullRomCurve3, Vector2, Vector3 } from 'three';
import { extend, useFrame, useThree, type ThreeElement } from '@react-three/fiber';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { animated, config, easings, useSpring, type SpringConfig } from '@react-spring/three';
import type { Coord } from '@/lib/lines';

extend({ MeshLineGeometry, MeshLineMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}

interface ScribbleProps {
  points: Coord[];
  size: number;
  lineWidth: number;
  color: string;
  visible: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  curved?: boolean;
  closed?: boolean;
  nPointsInCurve?: number;
  /** Draw-on spring; default is a 1s easeInOutQuint sweep. */
  drawConfig?: SpringConfig;
  /** Uniform scale target — springs there with a wobbly config (hover pops). */
  scale?: number;
  depthTest?: boolean;
  renderOrder?: number;
  opacity?: number;
}

/**
 * A hand-drawn stroke that draws itself in tip-first. The trick: meshline's
 * dash uniforms with dashArray=1 make the whole line a single dash, so
 * animating dashRatio 1→0 acts as a draw-progress scrubber. The spring value
 * is written into the material imperatively each frame — meshline uniforms
 * aren't spring-bindable as props.
 */
export default function Scribble({
  points,
  size,
  lineWidth,
  color,
  visible,
  position,
  rotation,
  curved = false,
  closed = false,
  nPointsInCurve = 700,
  drawConfig,
  scale = 1,
  depthTest = true,
  renderOrder = 0,
  opacity = 1,
}: ScribbleProps) {
  const material = useRef<MeshLineMaterial>(null);
  const viewport = useThree((s) => s.size);
  const resolution = useMemo(() => new Vector2(viewport.width, viewport.height), [viewport]);

  const flatPoints = useMemo(() => {
    const vecs = points.map(([x, y, z]) => new Vector3(x * size - size / 2, y * size - size / 2, z));
    const sampled = curved ? new CatmullRomCurve3(vecs, closed).getPoints(nPointsInCurve) : vecs;
    const flat: number[] = [];
    sampled.forEach((v) => flat.push(v.x, v.y, v.z));
    return flat;
  }, [points, size, curved, closed, nPointsInCurve]);

  const { drawn } = useSpring({
    drawn: visible ? 1 : 0,
    from: { drawn: 0 },
    config: drawConfig ?? { duration: 1000, easing: easings.easeInOutQuint },
  });
  const { s } = useSpring({ s: scale, config: config.wobbly });

  useFrame(() => {
    if (!material.current) return;
    const ratio = 1 - drawn.get();
    if (material.current.dashRatio !== ratio) material.current.dashRatio = ratio;
  });

  // frustumCulled off: MeshLineGeometry's bounding sphere doesn't track its
  // instanced point data, so strokes get culled at some camera framings.
  return (
    <animated.mesh position={position} rotation={rotation} scale={s} renderOrder={renderOrder} frustumCulled={false}>
      <meshLineGeometry points={flatPoints} />
      <meshLineMaterial
        ref={material}
        args={[{ resolution }]}
        transparent
        lineWidth={lineWidth}
        color={color}
        opacity={opacity}
        depthTest={depthTest}
        dashArray={1}
        dashRatio={1}
        dashOffset={0}
        toneMapped={false}
        resolution={resolution}
      />
    </animated.mesh>
  );
}
