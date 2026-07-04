'use client';

import { useEffect, useMemo, useState } from 'react';
import { DoubleSide, MeshBasicMaterial } from 'three';
import { MeshDistortMaterial, Text } from '@react-three/drei';
import { animated, config, useSpring } from '@react-spring/three';
import ProjectEntry from '@/components/projects/ProjectEntry';
import ProjectTitlePreview from '@/components/projects/ProjectTitlePreview';
import ProjectModal from '@/components/projects/ProjectModal';
import { PROJECTS } from '@/components/projects/data';
import { colors } from '@/lib/colors';
import { HAND_FONT } from '@/lib/typography';
import { useAspect, useDelayedBoolean, useHasMouse, useInterval } from '@/lib/hooks';
import { useSceneStore } from '@/store/scene';

/**
 * The projects "room", ~12 world units below home. A ring of ice cubes around
 * a squashed distort-blob; entries take turns hovering themselves on
 * touch-only devices. Escape closes an open project.
 */
export default function ProjectListing({ position }: { position: [number, number, number] }) {
  const scene = useSceneStore((s) => s.scene);
  const openProject = useSceneStore((s) => s.openProject);
  const setOpenProject = useSceneStore((s) => s.setOpenProject);
  const setScene = useSceneStore((s) => s.setScene);
  const active = scene === 'projects' || scene === 'project-open';

  const aspect = useAspect();
  const projectsWide = aspect >= 0.8;
  const radius = projectsWide ? 2.7 : 2.4;
  const arc = (Math.PI * 2) / PROJECTS.length;

  const hasMouse = useHasMouse();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const previewVisible = useDelayedBoolean(hoveredIndex !== null, 800);

  // Auto-hover cycle for touch devices: cubes take turns presenting.
  useInterval(
    () => setHoveredIndex((i) => ((i ?? -1) + 1) % PROJECTS.length),
    active && hasMouse === false && openProject === null ? 2000 : null
  );

  const blobBig = useDelayedBoolean(active, 500);
  const blobSpring = useSpring({
    scale: blobBig ? 1 : 0,
    position: blobBig
      ? [0, 0, -5]
      : projectsWide
        ? [3.62, 1.91, -5]
        : [1, 3.91, -5],
    config: blobBig ? config.gentle : config.stiff,
  });

  // Escape closes the open project.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && useSceneStore.getState().scene === 'project-open') {
        setOpenProject(null);
        setScene('projects');
        setHoveredIndex(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpenProject, setScene]);

  const instructionMaterial = useMemo(
    () => new MeshBasicMaterial({ depthTest: false, transparent: true }),
    []
  );

  const slots = PROJECTS.map((_, i) => ({
    baseX: Math.sin(i * arc) * radius,
    baseY: Math.cos(i * arc) * radius,
  }));

  return (
    <group position={position}>
      <animated.group
        scale={blobSpring.scale}
        position={blobSpring.position as unknown as [number, number, number]}
      >
        <mesh scale={[2.5, 2.5, 0.1]}>
          <sphereGeometry args={[4, 70, 70]} />
          <MeshDistortMaterial
            color={colors.coffee}
            speed={6}
            distort={0.3}
            transparent
            opacity={0.7}
            side={DoubleSide}
          />
        </mesh>
      </animated.group>
      {active && openProject === null && (
        <Text
          font={HAND_FONT}
          fontSize={0.5}
          color={colors.cyan}
          position={[0, 0, 0.5]}
          anchorX="center"
          anchorY="middle"
          textAlign="center"
          material={instructionMaterial}
          renderOrder={1}
        >
          {hasMouse === false ? 'Tap an\nice cube.' : 'Pick an\nice cube.'}
        </Text>
      )}
      {PROJECTS.map((project, i) => (
        <ProjectEntry
          key={project.title}
          index={i}
          project={project}
          baseX={slots[i].baseX}
          baseY={slots[i].baseY}
          hovered={hoveredIndex === i || openProject === i}
          onHoverChange={setHoveredIndex}
          listingActive={active}
        />
      ))}
      {previewVisible && hoveredIndex !== null && openProject === null && (
        <ProjectTitlePreview
          project={PROJECTS[hoveredIndex]}
          baseX={slots[hoveredIndex].baseX}
          baseY={slots[hoveredIndex].baseY}
        />
      )}
      {openProject !== null && <ProjectModal project={PROJECTS[openProject]} />}
    </group>
  );
}
