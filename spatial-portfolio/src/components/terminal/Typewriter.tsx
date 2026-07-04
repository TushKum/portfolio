'use client';

import { useState } from 'react';
import { useInterval, useTrueAfterDelay } from '@/lib/hooks';

interface TypewriterProps {
  children: string;
  delay?: number;
  timePerChar?: number;
  hideCaretAtEnd?: boolean;
  className?: string;
}

/**
 * Types one character per tick. Layout-shift trick: the full target string is
 * rendered invisibly to reserve final space, and the growing prefix overlays
 * it absolutely. If the target changes mid-type, the text resets and retypes.
 */
export default function Typewriter({
  children: target,
  delay = 100,
  timePerChar = 25,
  hideCaretAtEnd = false,
  className,
}: TypewriterProps) {
  const started = useTrueAfterDelay(delay);
  const [text, setText] = useState('');
  const done = text === target;

  useInterval(
    () => setText((t) => (target.startsWith(t) ? target.slice(0, t.length + 1) : '')),
    started && !done ? timePerChar : null
  );

  const [blink, setBlink] = useState(true);
  useInterval(() => setBlink((b) => !b), 300);
  const showCaret = started && !(done && hideCaretAtEnd) && blink;

  return (
    <div className={`relative ${className ?? ''}`}>
      <span className="opacity-0" aria-hidden>
        {target}
      </span>
      <span className="absolute inset-0">
        {text}
        <span className={showCaret ? '' : 'opacity-0'}>_</span>
      </span>
    </div>
  );
}
