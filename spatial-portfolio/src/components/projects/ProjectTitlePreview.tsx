'use client';

import { useMemo, useState } from 'react';
import { MeshBasicMaterial } from 'three';
import { Text } from '@react-three/drei';
import Scribble from '@/components/Scribble';
import { type Project } from '@/components/projects/data';
import { SQUIGGLE_A, SQUIGGLE_B, SQUIGGLE_C } from '@/lib/lines';
import { HAND_FONT } from '@/lib/typography';
import { useInterval } from '@/lib/hooks';
import { useChangingPalette } from '@/lib/palette';

interface ProjectTitlePreviewProps {
  project: Project;
  baseX: number;
  baseY: number;
}

/**
 * The hovered cube's title: hand-font text over three fast-drawing squiggles,
 * the whole group re-rolling a small random z-rotation every 300ms and the
 * bg/text colors strobing through the palette every 500ms — jittery, alive,
 * hand-drawn.
 */
export default function ProjectTitlePreview({ project, baseX, baseY }: ProjectTitlePreviewProps) {
  const { bg, text } = useChangingPalette(500);
  const [jitter, setJitter] = useState(0);
  useInterval(() => setJitter((Math.random() - 0.5) * 2 * 0.02 * Math.PI * 2), 300);

  const textMaterial = useMemo(() => new MeshBasicMaterial({ depthTest: false, transparent: true }), []);

  // Sit toward the ring center so the preview never leaves the stage.
  const x = -baseX / 4;
  const y = baseY - Math.sign(baseY || 1) * (2.5 - Math.abs(baseX) * 0.25);

  return (
    <group position={[x, y, 2]} rotation={[0, 0, jitter]}>
      <group scale={[1, 2, 1]}>
        <Scribble
          points={SQUIGGLE_A}
          size={3}
          lineWidth={0.4}
          color={bg}
          visible
          curved
          nPointsInCurve={800}
          depthTest={false}
          renderOrder={2}
          drawConfig={{ duration: 200 }}
        />
      </group>
      <group scale={[1, 0.5, 1]}>
        <Scribble
          points={SQUIGGLE_B}
          size={2}
          lineWidth={0.3}
          color={bg}
          visible
          curved
          nPointsInCurve={800}
          depthTest={false}
          renderOrder={2}
          drawConfig={{ duration: 200 }}
        />
        <Scribble
          points={SQUIGGLE_C}
          size={3}
          lineWidth={0.3}
          color={bg}
          visible
          curved
          nPointsInCurve={800}
          depthTest={false}
          renderOrder={2}
          drawConfig={{ duration: 200 }}
        />
      </group>
      <Text
        font={HAND_FONT}
        fontSize={0.5}
        color={text}
        anchorX="center"
        anchorY="middle"
        material={textMaterial}
        renderOrder={3}
      >
        {project.short}
      </Text>
    </group>
  );
}
