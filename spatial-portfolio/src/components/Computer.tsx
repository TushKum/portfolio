'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MeshBasicMaterial } from 'three';
import { Text } from '@react-three/drei';
import { animated, useSpring } from '@react-spring/three';
import Scribble from '@/components/Scribble';
import InteractiveArea from '@/components/InteractiveArea';
import CodeRings from '@/components/CodeRings';
import Terminal from '@/components/terminal/Terminal';
import { COMPUTER_BODY, COMPUTER_FILL, COMPUTER_KEYBOARD, COMPUTER_SCREEN } from '@/lib/lines';
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
      <Scribble
        points={COMPUTER_FILL}
        size={5}
        position={[-1, 0.05, 1.7]}
        lineWidth={1}
        color={colors.yellow}
        visible={fillVisible}
        curved
        closed
        scale={partScale}
      />
      <Scribble
        points={COMPUTER_SCREEN}
        size={3.3}
        position={[-1, 0.7, 2.1]}
        rotation={[0, 0, Math.PI / 40]}
        lineWidth={0.6}
        color={on ? colors.blue : colors.screenOff}
        visible={screenVisible}
        curved
        closed
        depthTest={false}
        renderOrder={1}
        scale={partScale}
      />
      <Scribble
        points={COMPUTER_BODY}
        size={4.9}
        position={[-1, 0, 2.3]}
        rotation={[0, 0, Math.PI / 40]}
        lineWidth={0.02}
        color={colors.violet}
        visible={bodyVisible}
        curved
        closed
        depthTest={false}
        renderOrder={2}
        scale={partScale}
      />
      <Scribble
        points={COMPUTER_KEYBOARD}
        size={4.1}
        position={[-0.7, -1.2, 2.5]}
        lineWidth={0.02}
        color={colors.violet}
        visible={bodyVisible}
        curved
        closed
        depthTest={false}
        renderOrder={2}
        scale={partScale}
      />
      {canTurnOn && !on && !turningOn && (
        <>
          <Text
            position={[-1, 0.7, 2.15]}
            rotation={[0, 0, Math.PI / 40]}
            fontSize={0.5}
            font={HAND_FONT}
            color="#888888"
            anchorX="center"
            anchorY="middle"
            material={labelMaterial}
            renderOrder={3}
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
