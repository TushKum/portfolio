'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useDrag } from '@use-gesture/react';
import TerminalWindow from '@/components/terminal/TerminalWindow';
import TerminalWindowButton from '@/components/terminal/TerminalWindowButton';
import { colors } from '@/lib/colors';
import { useCursorHover } from '@/store/cursor';
import { useTrueAfterDelay } from '@/lib/hooks';

const SKILL_FILLS = [
  { label: 'REACT', bg: colors.red, fg: colors.white },
  { label: 'THREE.JS', bg: colors.violet, fg: colors.black },
  { label: 'TYPESCRIPT', bg: colors.orange, fg: colors.black },
  { label: 'GLSL', bg: colors.yellow, fg: colors.black },
  { label: 'MOTION', bg: colors.lime, fg: colors.black },
  { label: 'DESIGN', bg: colors.blue, fg: colors.white },
];

const RESOLUTION = 2; // canvas backing store at 2x for crispness

interface Jitter {
  rot: number;
  dx: number;
  dy: number;
}

function paintPoster(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  fill: (typeof SKILL_FILLS)[number],
  jitter: Jitter
) {
  ctx.fillStyle = fill.bg;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2 + jitter.dx, h / 2 + jitter.dy);
  ctx.rotate(jitter.rot);
  const fontSize = Math.min((w * 0.92) / (fill.label.length * 0.62), h * 0.45);
  ctx.font = `700 ${fontSize}px "Roboto Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fill.fg;
  ctx.fillText(fill.label, 0, 0);
  ctx.restore();
}

/**
 * The scratch-off skills poster. Dragging clips the canvas to a capsule
 * between the previous and current pointer position and re-runs the active
 * skill's poster fill inside the clip — paint reveals a stable image because
 * each poster's rotation/offset jitter is memoized. The canvas is oversized
 * 120% and rotated 5° inside the window so strokes bleed past the edges.
 */
export default function SkillPaintWindow({
  interactive = true,
  onBackToMenu,
}: {
  interactive?: boolean;
  onBackToMenu: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState(0);
  const [painted, setPainted] = useState(false);
  const colorsUsed = useRef(new Set<number>());
  const [ctaVisible, setCtaVisible] = useState(false);
  const lateCta = useTrueAfterDelay(12000);
  const { startHover, stopHover } = useCursorHover('paint');

  const jitters = useMemo<Jitter[]>(
    () =>
      SKILL_FILLS.map((_, i) => ({
        rot: ((-5 + (((i * 7919) % 100) / 100 - 0.5) * 4) / 180) * Math.PI,
        dx: (((i * 104729) % 21) - 10) * RESOLUTION,
        dy: (((i * 1299709) % 21) - 10) * RESOLUTION,
      })),
    []
  );

  // Keep the backing store synced to the element's on-screen size (the
  // terminal continuously rescales with the camera, so poll).
  useEffect(() => {
    const sync = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = Math.round(canvas.offsetWidth * RESOLUTION);
      const h = Math.round(canvas.offsetHeight * RESOLUTION);
      if (w > 0 && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    sync();
    const timer = setInterval(sync, 200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (lateCta) setCtaVisible(true);
  }, [lateCta]);

  const bind = useDrag(
    ({ xy: [pointerX, pointerY], memo }) => {
      const canvas = canvasRef.current;
      if (!canvas || !interactive) return [pointerX, pointerY];
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (pointerX - rect.left) * scaleX;
      const y = (pointerY - rect.top) * scaleY;
      const [prevX, prevY] = (memo as [number, number] | undefined) ?? [pointerX, pointerY];
      const px = (prevX - rect.left) * scaleX;
      const py = (prevY - rect.top) * scaleY;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const r = Math.max(canvas.width, canvas.height) / 10;
        const ang = Math.atan2(y - py, x - px);
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, r, ang + Math.PI / 2, ang - Math.PI / 2);
        ctx.arc(x, y, r, ang - Math.PI / 2, ang + Math.PI / 2);
        ctx.closePath();
        ctx.clip();
        paintPoster(ctx, canvas.width, canvas.height, SKILL_FILLS[selected], jitters[selected]);
        ctx.restore();
      }

      if (!painted) setPainted(true);
      colorsUsed.current.add(selected);
      if (colorsUsed.current.size >= 2) setCtaVisible(true);
      return [pointerX, pointerY];
    },
    { pointer: { touch: true } }
  );

  return (
    <TerminalWindow
      title="PAINT_TO_REVEAL_SKILLS"
      color={colors.white}
      topColor={colors.white}
      draggableByTitleBarOnly
      noCloseButton
      interactive={interactive}
      className="h-full"
    >
      <div className="relative h-full w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          {...bind()}
          onMouseEnter={startHover}
          onMouseLeave={stopHover}
          className="absolute left-[-10%] top-[-10%] h-[120%] w-[120%] rotate-[5deg] touch-none"
        />
        {!painted && (
          <p className="pointer-events-none absolute inset-0 grid place-items-center px-[1em] text-center text-[1.6em] text-[#aaa]">
            Click/tap and drag to paint my skills. Every color works.
          </p>
        )}
        <div className="absolute left-[0.5em] top-[0.5em] flex gap-[0.4em]">
          {SKILL_FILLS.map((fill, i) => (
            <button
              key={fill.label}
              type="button"
              aria-label={`Paint with ${fill.label}`}
              disabled={!interactive}
              onClick={() => setSelected(i)}
              className="h-[2.2em] w-[2.2em] border-black"
              style={{ background: fill.bg, borderWidth: selected === i ? '0.4em' : '2px' }}
            />
          ))}
        </div>
        {ctaVisible && (
          <div className="absolute bottom-[1em] right-[1em]">
            <TerminalWindow title="" delay={100} color={colors.cyan} interactive={interactive}>
              <div className="flex gap-[0.7em] p-[0.7em]">
                <TerminalWindowButton delay={200} onClick={onBackToMenu} disabled={!interactive}>
                  BACK_TO_MENU
                </TerminalWindowButton>
                <TerminalWindowButton
                  delay={350}
                  href="mailto:tushit.jalan@gmail.com"
                  bgColor={colors.violet}
                  color={colors.white}
                  disabled={!interactive}
                >
                  CONTACT_ME
                </TerminalWindowButton>
              </div>
            </TerminalWindow>
          </div>
        )}
      </div>
    </TerminalWindow>
  );
}
