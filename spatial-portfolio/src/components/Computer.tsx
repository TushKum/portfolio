'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MeshBasicMaterial } from 'three';
import { Text } from '@react-three/drei';
import { animated, useSpring } from '@react-spring/three';
import Scribble from '@/components/Scribble';
import InteractiveArea from '@/components/InteractiveArea';
import CodeRings from '@/components/CodeRings';
import Terminal from '@/components/terminal/Terminal';
import {
  LAPTOP_BASE,
  LAPTOP_BOLT_A,
  LAPTOP_BOLT_B,
  LAPTOP_KEYS,
  LAPTOP_LID,
  LAPTOP_SCREEN,
} from '@/lib/lines';
import { colors } from '@/lib/colors';
import { HAND_FONT } from '@/lib/typography';
import { useHasMouse, useTrueAfterDelay } from '@/lib/hooks';
import { useSceneStore } from '@/store/scene';

/**
 * The hand-drawn CRT. Entrance is a delay ladder (screen 1450ms — which also
 * advances intro→start — body/keyboard 1950ms, crayon fill 2450ms, clickable
 * 3450ms). Turning it on: a 300ms crouch (scale 0.5, tilt π/7) then targets
 * snap back through one underdamped spring — the overshoot is the explosion.
 */
export default function Computer() {
  const scene = useSceneStore((s) => s.scene);
  const setScene = useSceneStore((s) => s.setScene);
  const hasMouse = useHasMouse();

  let time = 450;
  const screenVisible = useTrueAfterDelay((time += 1000));
  const bodyVisible = useTrueAfterDelay((time += 500));
  const fillVisible = useTrueAfterDelay((time += 500));
  const canTurnOn = useTrueAfterDelay((time += 1000));

  const [on, setOn] = useState(false);
  const [turningOn, setTurningOn] = useState(false);
  const [hovered, setHovered] = useState(false);
  const powering = useRef(false);

  // The screen appearing is also the intro→start transition, guarded so a
  // future deep-link start scene isn't clobbered by the timer.
  useEffect(() => {
    if (screenVisible && useSceneStore.getState().scene === 'intro') setScene('start');
  }, [screenVisible, setScene]);

  const powerOn = useCallback(() => {
    if (powering.current) return;
    powering.current = true;
    setTurningOn(true);
    setTimeout(() => {
      setTurningOn(false);
      setOn(true);
    }, 300);
  }, []);

  // Failsafe: if the scene has moved past start and the computer is still
  // off, auto-play the turn-on so world state matches the scene.
  useEffect(() => {
    if (scene === 'intro' || scene === 'start' || on) return;
    const timer = setTimeout(powerOn, 4000);
    return () => clearTimeout(timer);
  }, [scene, on, powerOn]);

  const groupSpring = useSpring({
    scale: turningOn ? 0.5 : 1,
    rotation: turningOn ? [Math.PI / 7, 0, Math.PI / 7] : [0, 0, 0],
    config: { mass: 1.5, tension: 220, friction: 12 },
  });
  const partScale = turningOn ? 0.95 : hovered ? 1.1 : 1;

  const labelMaterial = useMemo(() => new MeshBasicMaterial({ depthTest: false, transparent: true }), []);

  return (
    <animated.group
      scale={groupSpring.scale}
      rotation={groupSpring.rotation as unknown as [number, number, number]}
    >
      {/* All body parts share size 4 / position [-1, -0.14, z] so they align;
          the screen center of the [0,1] frame lands at world [-1, 0.7], where
          the terminal mounts. */}
      <Scribble
        points={LAPTOP_BASE}
        size={4}
        position={[-1, -0.14, 1.95]}
        lineWidth={0.05}
        color={colors.black}
        visible={bodyVisible}
        curved
        closed
        depthTest={false}
        renderOrder={1}
        scale={partScale}
      />
      <Scribble
        points={LAPTOP_SCREEN}
        size={4}
        position={[-1, -0.14, 2.0]}
        lineWidth={0.7}
        color={on ? colors.blue : colors.yellow}
        visible={fillVisible}
        curved
        depthTest={false}
        renderOrder={2}
        scale={partScale}
      />
      <Scribble
        points={LAPTOP_LID}
        size={4}
        position={[-1, -0.14, 2.05]}
        lineWidth={0.05}
        color={colors.black}
        visible={screenVisible}
        curved
        closed
        depthTest={false}
        renderOrder={3}
        scale={partScale}
      />
      <Scribble
        points={LAPTOP_KEYS}
        size={4}
        position={[-1, -0.14, 2.06]}
        lineWidth={0.02}
        color={colors.black}
        visible={bodyVisible}
        depthTest={false}
        renderOrder={4}
        scale={partScale}
      />
      <Scribble
        points={LAPTOP_BOLT_A}
        size={1.3}
        position={[1.15, 1.35, 2.1]}
        lineWidth={0.14}
        color={colors.yellow}
        visible={fillVisible}
        curved
        depthTest={false}
        renderOrder={5}
        scale={partScale}
      />
      <Scribble
        points={LAPTOP_BOLT_B}
        size={1.2}
        position={[-2.7, -1.15, 2.1]}
        lineWidth={0.14}
        color={colors.yellow}
        visible={fillVisible}
        curved
        depthTest={false}
        renderOrder={5}
        scale={partScale}
      />
      {canTurnOn && !on && !turningOn && (
        <>
          <Text
            position={[-1, 0.68, 2.15]}
            rotation={[0, 0, Math.PI / 40]}
            fontSize={0.42}
            font={HAND_FONT}
            color={colors.black}
            anchorX="center"
            anchorY="middle"
            material={labelMaterial}
            renderOrder={6}
          >
            {hasMouse === false ? 'Tap to start' : 'Click to start'}
          </Text>
          <InteractiveArea
            width={3.7}
            height={3.3}
            position={[-0.7, 0.05, 2.2]}
            cursor="power-on"
            onClick={() => {
              powerOn();
              setScene('menu');
            }}
            onHoverChange={setHovered}
          />
        </>
      )}
      {on && <Terminal />}
      <CodeRings visible={on} />
    </animated.group>
  );
}
