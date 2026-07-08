'use client';

import { useEffect, useRef } from 'react';
import { type CursorKind, useCursorHover } from '@/store/cursor';

interface InteractiveAreaProps {
  width: number;
  height: number;
  position?: [number, number, number];
  cursor: CursorKind;
  onClick?: () => void;
  onHoverChange?: (hovered: boolean) => void;
  debug?: boolean;
}

/**
 * Invisible rectangular hit area floating in front of scribble art — fat
 * meshline strokes are miserable to raycast, an opacity-0 plane is not
 * (opacity 0 + transparent still participates in R3F raycasting). Flip
 * `debug` to see it. Activation uses pointerdown (mobile-friendlier than
 * click); enter+over both bound as a touch catch.
 */
export default function InteractiveArea({
  width,
  height,
  position,
  cursor,
  onClick,
  onHoverChange,
  debug = false,
}: InteractiveAreaProps) {
  const { startHover, stopHover } = useCursorHover(cursor);

  // Hit areas often unmount as a RESULT of being clicked (power-on, spill…),
  // which skips pointerleave — release the parent's hover state on unmount or
  // it stays stuck at hover scale/tilt forever.
  const hoverChangeRef = useRef(onHoverChange);
  hoverChangeRef.current = onHoverChange;
  useEffect(() => () => hoverChangeRef.current?.(false), []);
  const enter = () => {
    startHover();
    onHoverChange?.(true);
  };
  const leave = () => {
    stopHover();
    onHoverChange?.(false);
  };
  return (
    <mesh
      position={position}
      onPointerEnter={enter}
      onPointerOver={enter}
      onPointerLeave={leave}
      onPointerDown={() => onClick?.()}
    >
      <boxGeometry args={[width, height, 0.01]} />
      <meshBasicMaterial color="red" transparent opacity={debug ? 0.3 : 0} depthTest={false} />
    </mesh>
  );
}
