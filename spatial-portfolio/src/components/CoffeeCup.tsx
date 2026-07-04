'use client';

import { useMemo, useState } from 'react';
import { MeshBasicMaterial } from 'three';
import { Text } from '@react-three/drei';
import { animated, config, useSpring } from '@react-spring/three';
import Scribble from '@/components/Scribble';
import InteractiveArea from '@/components/InteractiveArea';
import { CUP_FILL, CUP_LIQUID, CUP_OUTLINE } from '@/lib/lines';
import { colors } from '@/lib/colors';
import { HAND_FONT } from '@/lib/typography';
import { useAspect, useTrueAfterDelay } from '@/lib/hooks';
import { useSceneStore } from '@/store/scene';

/**
 * The projects nav is a coffee mug. Clicking it "spills" — the cup springs
 * down toward the projects room while tipping over with a full extra spin
 * (2 + 2π radians of z-rotation on a wobbly spring). Clicking the spilled cup
 * un-spills back to the menu.
 */
export default function CoffeeCup() {
  const scene = useSceneStore((s) => s.scene);
  const setScene = useSceneStore((s) => s.setScene);
  const aspect = useAspect();
  const wide = aspect >= 1;
  const projectsWide = aspect >= 0.8;

  const show = scene !== 'intro' && scene !== 'start';
  let time = 450;
  const outlineVisible = useTrueAfterDelay((time += 1000)) && show;
  const fillVisible = useTrueAfterDelay((time += 1000)) && show;

  const spilled = scene === 'projects' || scene === 'project-open';
  const [hovered, setHovered] = useState(false);

  const menuPosition: [number, number, number] = wide ? [3.5, -0.8, 3.5] : [0.2, -2.9, 3.8];
  const spillPosition: [number, number, number] = projectsWide ? [4, -10.5, 3.02] : [1.5, -6.5, 3.02];

  const spring = useSpring({
    position: spilled ? spillPosition : menuPosition,
    rotationZ:
      (spilled ? 2 + Math.PI * 2 : 0) + (hovered ? (spilled ? -1 : 1) * (Math.PI / 6) * 0.5 : 0),
    config: config.wobbly,
  });

  const labelMaterial = useMemo(() => new MeshBasicMaterial({ depthTest: false, transparent: true }), []);

  return (
    <animated.group position={spring.position as unknown as [number, number, number]}>
      <animated.group rotation-z={spring.rotationZ} scale={hovered ? 1.1 : 1}>
        <Scribble
          points={CUP_OUTLINE}
          size={1.8}
          lineWidth={0.02}
          color={colors.blue}
          visible={outlineVisible}
          curved
        />
        <Scribble
          points={CUP_FILL}
          size={1.8}
          lineWidth={0.4}
          color={colors.cyan}
          visible={fillVisible}
          curved
          closed
          drawConfig={config.molasses}
        />
        {!spilled && (
          <Scribble
            points={CUP_LIQUID}
            size={1}
            position={[0, 0.55, 0.1]}
            lineWidth={0.15}
            color={colors.coffeeLight}
            visible={fillVisible}
            curved
            closed
            nPointsInCurve={200}
          />
        )}
      </animated.group>
      {show && (
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.5}
          font={HAND_FONT}
          color={colors.blue}
          anchorX="center"
          anchorY="middle"
          material={labelMaterial}
          renderOrder={3}
        >
          {spilled ? 'BACK' : 'PROJECTS'}
        </Text>
      )}
      {scene === 'menu' && (
        <InteractiveArea
          width={2}
          height={2}
          position={[0, 0, 0.2]}
          cursor="spill"
          onClick={() => setScene('projects')}
          onHoverChange={setHovered}
        />
      )}
      {scene === 'projects' && (
        <InteractiveArea
          width={1.5}
          height={1.5}
          position={[0, 0, 0.2]}
          cursor="unspill"
          onClick={() => setScene('menu')}
          onHoverChange={setHovered}
        />
      )}
    </animated.group>
  );
}
