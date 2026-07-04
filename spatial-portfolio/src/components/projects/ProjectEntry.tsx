'use client';

import { useMemo, useRef, useState } from 'react';
import { Color, Mesh, MeshPhysicalMaterial } from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { animated, config, useSpring } from '@react-spring/three';
import InteractiveArea from '@/components/InteractiveArea';
import { type Project } from '@/components/projects/data';
import { useInterval } from '@/lib/hooks';
import { useSceneStore } from '@/store/scene';

const tmpColor = new Color();

interface ProjectEntryProps {
  index: number;
  project: Project;
  baseX: number;
  baseY: number;
  hovered: boolean;
  onHoverChange: (index: number | null) => void;
  listingActive: boolean;
}

/**
 * One "ice cube": tumbles at per-axis random speeds and wanders around its
 * ring slot. On hover it unwinds to face the camera — each Euler axis lerps
 * toward its nearest whole turn so accumulated spins unwind the short way —
 * and scales up 3× on a wobbly spring. Opening springs it out to z=4 where
 * the camera zooms to meet it.
 */
export default function ProjectEntry({
  index,
  project,
  baseX,
  baseY,
  hovered,
  onHoverChange,
  listingActive,
}: ProjectEntryProps) {
  const openProject = useSceneStore((s) => s.openProject);
  const setOpenProject = useSceneStore((s) => s.setOpenProject);
  const setScene = useSceneStore((s) => s.setScene);
  const isOpen = openProject === index;

  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshPhysicalMaterial>(null);
  const speeds = useMemo(
    () => [Math.random() * 0.01, Math.random() * 0.01, Math.random() * 0.01],
    []
  );

  // Wander: drift to a new random point in a ±0.5 cube on a randomized
  // cadence; the spring duration matches the cadence so drift is continuous.
  const wanderEvery = useMemo(() => 2500 + Math.random() * 5000, []);
  const [wanderTarget, setWanderTarget] = useState<[number, number, number]>([0, 0, 0]);
  useInterval(
    () =>
      setWanderTarget([Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]),
    isOpen ? null : wanderEvery
  );
  const wanderSpring = useSpring({
    offset: isOpen ? [0, 0, 0] : wanderTarget,
    config: isOpen ? { duration: 100 } : { duration: wanderEvery },
  });

  const positionSpring = useSpring({
    position: isOpen ? [0, 0, 4] : [baseX, baseY, 0],
    scale: isOpen ? 1 : hovered ? 3 : 1,
    config: isOpen ? config.stiff : config.wobbly,
  });

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    if (hovered || isOpen) {
      (['x', 'y', 'z'] as const).forEach((axis) => {
        const current = mesh.rotation[axis];
        const target = Math.round(current / (Math.PI * 2)) * Math.PI * 2;
        mesh.rotation[axis] += (target - current) * 0.1;
      });
    } else {
      mesh.rotation.x += speeds[0];
      mesh.rotation.y += speeds[1];
      mesh.rotation.z += speeds[2];
    }
    if (materialRef.current) {
      materialRef.current.color.lerp(
        tmpColor.set(hovered || isOpen ? project.color : '#bfeef5'),
        0.08
      );
    }
  });

  const showHit = listingActive && openProject === null;

  return (
    <animated.group position={positionSpring.position as unknown as [number, number, number]}>
      <animated.group
        position={wanderSpring.offset as unknown as [number, number, number]}
        scale={positionSpring.scale}
      >
        <RoundedBox ref={meshRef} args={[1, 1, 1]} radius={0.1} smoothness={4}>
          <meshPhysicalMaterial
            ref={materialRef}
            color="#bfeef5"
            transmission={0.85}
            thickness={1.2}
            roughness={0.25}
            ior={1.25}
          />
        </RoundedBox>
      </animated.group>
      {showHit && (
        <InteractiveArea
          width={2}
          height={2}
          position={[0, 0, 1]}
          cursor="open-project"
          onClick={() => {
            setOpenProject(index);
            setScene('project-open');
          }}
          onHoverChange={(h) => onHoverChange(h ? index : null)}
        />
      )}
    </animated.group>
  );
}
