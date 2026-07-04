'use client';

import { useTrueAfterDelay } from '@/lib/hooks';

interface TerminalButtonProps {
  children: string;
  onClick: () => void;
  delay?: number;
  disabled?: boolean;
  className?: string;
}

/** Blue-screen button: white 2px border, inverts on hover/focus, pops in
 * scale-0→1 with chunky 5-step easing after its delay. */
export default function TerminalButton({
  children,
  onClick,
  delay = 300,
  disabled = false,
  className,
}: TerminalButtonProps) {
  const shown = useTrueAfterDelay(delay);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      tabIndex={shown && !disabled ? 0 : -1}
      className={`border-2 border-white px-[0.75em] py-[0.4em] text-white transition-transform duration-300 [transition-timing-function:steps(5)] hover:bg-white hover:text-blue focus-visible:bg-white focus-visible:text-blue ${
        shown ? 'scale-100' : 'scale-0'
      } ${className ?? ''}`}
    >
      {children}
    </button>
  );
}
