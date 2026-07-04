'use client';

import { colors } from '@/lib/colors';
import { useTrueAfterDelay } from '@/lib/hooks';

interface TerminalWindowButtonProps {
  children: string;
  onClick?: () => void;
  href?: string;
  delay?: number;
  bgColor?: string;
  color?: string;
  disabled?: boolean;
}

/**
 * Chunky pushable button: a black backing slab peeks out the top-left while
 * the face sits offset (0.15em, 0.15em); hover/focus snaps the face flat and
 * :active squashes to 75% — a satisfying press.
 */
export default function TerminalWindowButton({
  children,
  onClick,
  href,
  delay = 300,
  bgColor = colors.yellow,
  color = colors.black,
  disabled = false,
}: TerminalWindowButtonProps) {
  const shown = useTrueAfterDelay(delay);
  const face = (
    <span className="relative inline-block">
      <span className="absolute inset-0 bg-black" aria-hidden />
      <span
        className={`relative inline-block border-2 px-[1em] py-[0.5em] transition-transform ${
          disabled
            ? ''
            : 'translate-x-[0.15em] translate-y-[0.15em] group-hover:translate-x-0 group-hover:translate-y-0 group-focus-within:translate-x-0 group-focus-within:translate-y-0 group-active:scale-75'
        }`}
        style={{
          borderColor: disabled ? '#444' : color,
          color: disabled ? '#444' : color,
          background: disabled ? '#888' : bgColor,
        }}
      >
        {children}
      </span>
    </span>
  );
  const shared = `group inline-block transition-transform duration-300 [transition-timing-function:steps(5)] ${
    shown ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
  }`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={shared} tabIndex={disabled ? -1 : 0}>
        {face}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={shared} tabIndex={disabled ? -1 : 0}>
      {face}
    </button>
  );
}
