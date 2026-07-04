'use client';

import CameraController from '@/components/CameraController';
import BackgroundScribbles from '@/components/BackgroundScribbles';
import Computer from '@/components/Computer';
import CoffeeCup from '@/components/CoffeeCup';
import ProjectListing from '@/components/projects/ProjectListing';
import { useAspect } from '@/lib/hooks';
import { useSceneStore } from '@/store/scene';

/**
 * Maps the scene name to a camera stage (a world-space rectangle to frame).
 * "Rooms" are just distant world regions — projects live ~12 units below the
 * home area, and travelling there is nothing but re-aiming the stage.
 */
export default function SceneDirector() {
  const scene = useSceneStore((s) => s.scene);
  const aspect = useAspect();
  const wide = aspect >= 1;
  const projectsWide = aspect >= 0.8;

  const listingPosition: [number, number, number] = [0, projectsWide ? -12 : -11, 1];

  let stagePosition: [number, number, number] = [-1, 0, 3];
  let stageSize: [number, number] = [15, 15]; // intro: far pull-back for the draw-in

  if (scene === 'start') {
    stageSize = [5, 4];
  } else if (scene === 'menu') {
    stagePosition = wide ? [1.25, 0, 3] : [-0.8, -0.2, 3];
    stageSize = wide ? [8, 4.5] : [4.3, 10];
  } else if (scene === 'projects') {
    stagePosition = projectsWide ? [0.5, -12, 3] : [0, -10, 3];
    stageSize = projectsWide ? [8.5, 6.5] : [6, 10];
  } else if (scene === 'project-open') {
    const [lx, ly, lz] = listingPosition;
    stagePosition = wide ? [lx - 0.6, ly, lz + 4.5] : [lx, ly - 1.0, lz + 4.5];
    stageSize = wide ? [2, 0.1] : [0.1, 2.8];
  } else if (scene === 'about') {
    stagePosition = wide ? [-1, 0.7, 2.1] : [-1, 0.75, 2.1];
    stageSize = wide ? [4.2, 3] : [1, 1];
  }

  return (
    <>
      <CameraController
        stagePosition={stagePosition}
        stageSize={stageSize}
        controllable={scene !== 'project-open' && scene !== 'about'}
      />
      <BackgroundScribbles />
      <Computer />
      <CoffeeCup />
      <ProjectListing position={listingPosition} />
    </>
  );
}
