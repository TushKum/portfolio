'use client';

import { type CSSProperties, type ReactNode, useState } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { colors } from '@/lib/colors';
import { useTrueAfterDelay } from '@/lib/hooks';

interface TerminalWindowProps {
  title: string;
  children: ReactNode;
  color?: string;
  topColor?: string;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  draggableByTitleBarOnly?: boolean;
  noCloseButton?: boolean;
  /** False while the parent slide is inactive: kills pointer events so
   * off-screen windows can't be interacted with. */
  interactive?: boolean;
}

/**
 * Retro terminal window: 2px black border, hard up-left offset shadow,
 * colored title bar, steps(8) CRT pop-in. Draggable (framer-motion, no
 * momentum). The close button is a gag — it flips the window 180° and
 * clicking the flipped window rights it again.
 */
export default function TerminalWindow({
  title,
  children,
  color = colors.cyan,
  topColor = colors.lime,
  delay = 300,
  className,
  style,
  draggableByTitleBarOnly = false,
  noCloseButton = false,
  interactive = true,
}: TerminalWindowProps) {
  const shown = useTrueAfterDelay(delay);
  const [flipped, setFlipped] = useState(false);
  const controls = useDragControls();

  return (
    <motion.div
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      className={`relative select-none font-mono text-black ${
        interactive ? 'pointer-events-auto' : 'pointer-events-none'
      } ${className ?? ''}`}
      style={style}
      onPointerDown={(e) => {
        if (!draggableByTitleBarOnly) controls.start(e);
      }}
    >
      <div
        onClick={flipped ? () => setFlipped(false) : undefined}
        className={`flex h-full flex-col overflow-hidden border-2 border-black transition-transform duration-500 [transition-timing-function:steps(8)] ${
          shown ? 'scale-100' : 'scale-0'
        } ${flipped ? 'rotate-180' : ''}`}
        style={{ boxShadow: '-0.2em -0.2em black' }}
      >
        <div
          className="relative grid shrink-0 place-items-center border-b-2 border-black px-[2em] py-[0.2em]"
          style={{ background: topColor }}
          onPointerDown={(e) => {
            if (draggableByTitleBarOnly) controls.start(e);
          }}
        >
          {title}
          {!noCloseButton && (
            <button
              type="button"
              aria-label="Pretends to close the window. Actually flips it upside down."
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                setFlipped((f) => !f);
              }}
              className={`absolute right-[0.5em] h-[0.75em] w-[0.75em] border-2 border-black ${
                flipped ? 'bg-black' : ''
              }`}
            />
          )}
        </div>
        <div className="grow overflow-hidden" style={{ background: color }}>
          {children}
        </div>
      </div>
    </motion.div>
  );
}
