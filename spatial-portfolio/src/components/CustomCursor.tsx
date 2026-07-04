'use client';

import { useEffect, useRef, useState } from 'react';
import { colors } from '@/lib/colors';
import { useHasMouse } from '@/lib/hooks';
import { type CursorKind, useActiveCursor } from '@/store/cursor';

// Short action labels per hover state. 'default' renders as the small dot.
const LABELS: Partial<Record<CursorKind, string>> = {
  'power-on': 'turn on',
  contact: 'say hi',
  spill: 'spill it',
  unspill: 'clean up',
  'open-project': 'peek',
  'close-project': 'back',
  external: 'go see',
  paint: 'paint!',
};

/**
 * The custom cursor: one blue bubble with a white ring that follows the
 * pointer raw (a mousemove handler mutating the ref's transform — no springs,
 * no setState) and CSS-morphs between a small dot and a labeled 75px lens.
 * Renders only for fine pointers, only once the mouse has actually moved
 * (otherwise it would sit at 0,0 on load), and only while inside the page.
 */
export default function CustomCursor() {
  const kind = useActiveCursor();
  const hasMouse = useHasMouse();
  const ref = useRef<HTMLDivElement>(null);
  const [moved, setMoved] = useState(false);
  const [inside, setInside] = useState(true);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMoved(true);
      if (ref.current) ref.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    const onLeave = () => setInside(false);
    const onEnter = () => setInside(true);
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  if (!hasMouse || !moved || !inside || kind === 'none') return null;

  const label = LABELS[kind];
  const small = !label;

  return (
    <>
      <style>{'* { cursor: none !important; }'}</style>
      <div
        ref={ref}
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{ filter: 'drop-shadow(0 0 0.2rem black)' }}
        aria-hidden
      >
        <div
          className={`grid h-[75px] w-[75px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[5px] border-white text-center font-mono text-[12px] leading-none text-white transition-all duration-200 ${
            small ? 'scale-[0.25]' : 'scale-100'
          }`}
          style={{ background: colors.blue }}
        >
          {label && <span className="whitespace-pre">{label}</span>}
        </div>
      </div>
    </>
  );
}
