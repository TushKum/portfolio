'use client';

import { useMemo, useState } from 'react';
import { MeshBasicMaterial } from 'three';
import { Text } from '@react-three/drei';
import { animated, config, useSpring } from '@react-spring/three';
import Scribble from '@/components/Scribble';
import InteractiveArea from '@/components/InteractiveArea';
import { NOTEBOOK_FILL, NOTEBOOK_OUTLINE, NOTEBOOK_SPIRAL } from '@/lib/lines';
import { colors } from '@/lib/colors';
import { HAND_FONT } from '@/lib/typography';
import { useAspect, useTrueAfterDelay } from '@/lib/hooks';
import { useSceneStore } from '@/store/scene';

/**
 * A decorative spiral-bound notepad ("BLOG COMING SOON") that sits top-right
 * in the menu — the third object alongside the computer and coffee mug.
 * Violet crayon fill, black outline + coil binding, with a lazy hover tilt.
 */
export default function Notebook() {
  const scene = useSceneStore((s) => s.scene);
  const aspect = useAspect();
  const wide = aspect >= 1;

  const show = scene !== 'intro' && scene !== 'start';
  let time = 450;
  const fillVisible = useTrueAfterDelay((time += 1000)) && show;
  const linesVisible = useTrueAfterDelay((time += 500)) && show;

  const [hovered, setHovered] = useState(false);
  const position: [number, number, number] = wide ? [4, 1.3, 2.5] : [-1.5, 3.8, 1.8];

  const spring = useSpring({
    rotationZ: hovered ? -0.12 : 0.04,
    scale: hovered ? 1.08 : 1,
    config: config.wobbly,
  });

  const textMaterial = useMemo(() => new MeshBasicMaterial({ depthTest: false, transparent: true }), []);

  if (!show) return null;

  return (
    <animated.group
      position={position}
      rotation-z={spring.rotationZ}
      scale={spring.scale}
    >
      <Scribble
        points={NOTEBOOK_FILL}
        size={1.5}
        position={[0.03, 0, -0.05]}
        lineWidth={0.5}
        color={colors.violet}
        visible={fillVisible}
        curved
        nPointsInCurve={120}
        drawConfig={config.molasses}
      />
      <Scribble
        points={NOTEBOOK_OUTLINE}
        size={1.5}
        lineWidth={0.02}
        color={colors.black}
        visible={linesVisible}
        curved
        closed
        depthTest={false}
        renderOrder={2}
      />
      <Scribble
        points={NOTEBOOK_SPIRAL}
        size={1.5}
        position={[0, 0, 0.02]}
        lineWidth={0.025}
        color={colors.black}
        visible={linesVisible}
        curved
        nPointsInCurve={220}
        depthTest={false}
        renderOrder={3}
      />
      <Text
        position={[0.08, 0, 0.1]}
        fontSize={0.22}
        font={HAND_FONT}
        color={colors.black}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        lineHeight={1.05}
        material={textMaterial}
        renderOrder={4}
        visible={linesVisible}
      >
        {'Blog\ncoming\nsoon'.toUpperCase()}
      </Text>
      <InteractiveArea
        width={1.3}
        height={1.3}
        position={[0.1, 0, 0.3]}
        cursor="default"
        onHoverChange={setHovered}
      />
    </animated.group>
  );
}
