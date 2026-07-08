'use client';

import TerminalWindow from '@/components/terminal/TerminalWindow';
import { colors } from '@/lib/colors';

const PORTRAIT = String.raw`
    .-------.
   /  _   _  \
  |  (o) (o)  |
  |     >     |
  |   \___/   |
   \         /
    '-------'
  || TUSHIT ||
`;

/** Stand-in for a headshot: an ASCII self portrait. */
export default function PortraitWindow({
  delay = 300,
  interactive = true,
}: {
  delay?: number;
  interactive?: boolean;
}) {
  return (
    <TerminalWindow
      title="SELF_PORTRAIT.JPG"
      delay={delay}
      color={colors.white}
      topColor={colors.violet}
      interactive={interactive}
    >
      <pre className="p-[0.5em] text-center text-[0.85em] leading-[1.15]">{PORTRAIT}</pre>
    </TerminalWindow>
  );
}
