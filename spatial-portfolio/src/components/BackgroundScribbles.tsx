'use client';

import Scribble from '@/components/Scribble';
import { BG_CIRCLE, BG_SQUIGGLE } from '@/lib/lines';
import { colors } from '@/lib/colors';
import { useTrueAfterDelay } from '@/lib/hooks';

/** Two giant strokes far behind everything — the always-on backdrop. */
export default function BackgroundScribbles() {
  const squiggleVisible = useTrueAfterDelay(50);
  const circleVisible = useTrueAfterDelay(450);
  return (
    <>
      <Scribble
        points={BG_SQUIGGLE}
        size={130}
        position={[-4, -0.5, -34]}
        lineWidth={3.5}
        color={colors.lime}
        visible={squiggleVisible}
        curved
        nPointsInCurve={1200}
      />
      <Scribble
        points={BG_CIRCLE}
        size={40}
        position={[13, -5, -20.4]}
        lineWidth={0.5}
        color={colors.cyan}
        visible={circleVisible}
        curved
        closed
        nPointsInCurve={700}
      />
    </>
  );
}
