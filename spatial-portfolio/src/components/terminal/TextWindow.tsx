'use client';

import TerminalWindow from '@/components/terminal/TerminalWindow';
import TerminalWindowButton from '@/components/terminal/TerminalWindowButton';
import Typewriter from '@/components/terminal/Typewriter';
import { colors } from '@/lib/colors';

interface TextWindowProps {
  title: string;
  lines: string[];
  delay?: number;
  color?: string;
  topColor?: string;
  className?: string;
  interactive?: boolean;
  button?: { label: string; onClick: () => void; bgColor?: string };
}

/** A terminal window whose paragraphs type themselves in sequence — each
 * line's delay is chained off the cumulative character count before it. */
export default function TextWindow({
  title,
  lines,
  delay = 300,
  color,
  topColor,
  className,
  interactive = true,
  button,
}: TextWindowProps) {
  let t = delay + 500;
  const timed = lines.map((line) => {
    const lineDelay = t;
    t += line.length * 25 + 500;
    return { line, lineDelay };
  });

  return (
    <TerminalWindow
      title={title}
      delay={delay}
      color={color}
      topColor={topColor}
      className={className}
      interactive={interactive}
    >
      <div className="space-y-[0.6em] p-[1em]">
        {timed.map(({ line, lineDelay }) => (
          <Typewriter key={line} delay={lineDelay} hideCaretAtEnd>
            {line}
          </Typewriter>
        ))}
        {button && (
          <div className="pt-[0.5em] text-center">
            <TerminalWindowButton
              delay={t + 300}
              onClick={button.onClick}
              bgColor={button.bgColor ?? colors.yellow}
              disabled={!interactive}
            >
              {button.label}
            </TerminalWindowButton>
          </div>
        )}
      </div>
    </TerminalWindow>
  );
}
