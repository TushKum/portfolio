'use client';

import { useState } from 'react';
import TerminalWindow from '@/components/terminal/TerminalWindow';
import TerminalWindowButton from '@/components/terminal/TerminalWindowButton';
import Typewriter from '@/components/terminal/Typewriter';
import { colors } from '@/lib/colors';

const TESTIMONIALS = [
  {
    name: 'Rubber Duck',
    avatar: '🦆',
    quote:
      'John explained his bug to me for ten minutes. I said nothing. He fixed it himself. Five stars.',
  },
  {
    name: 'Coffee Machine',
    avatar: '☕',
    quote: 'Reliable. Visits hourly. Returns the mugs, mostly.',
  },
  {
    name: 'His Mom',
    avatar: '💐',
    quote: 'I have no idea what he does, but he seems very busy and I am proud of him.',
  },
];

// The longest quote is stacked invisibly under the pane so switching
// testimonials never reflows the window.
const LONGEST = TESTIMONIALS.reduce((a, b) => (a.quote.length >= b.quote.length ? a : b)).quote;

/** An email-client parody: sender rail on the left, quote pane on the right,
 * quotes typed at 2ms/char. */
export default function TestimonialsWindow({
  delay = 300,
  interactive = true,
  onNext,
}: {
  delay?: number;
  interactive?: boolean;
  onNext: () => void;
}) {
  const [selected, setSelected] = useState(0);
  return (
    <TerminalWindow
      title="INBOX (3_UNREAD)"
      delay={delay}
      color={colors.white}
      topColor={colors.orange}
      interactive={interactive}
    >
      <div className="grid h-full grid-cols-[9em_1fr]">
        <div className="flex flex-col border-r-2 border-black">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={t.name}
              type="button"
              disabled={!interactive}
              onClick={() => setSelected(i)}
              className={`flex items-center gap-[0.5em] border-b-2 border-black px-[0.5em] py-[0.6em] text-left ${
                selected === i ? 'bg-[#c2ffc2]' : ''
              }`}
            >
              <span aria-hidden>{t.avatar}</span>
              <span className="leading-tight">{t.name}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col bg-[#c2ffc2] p-[0.8em]">
          <div className="relative grow">
            <p className="opacity-0" aria-hidden>
              {LONGEST}
            </p>
            <div className="absolute inset-0">
              <Typewriter timePerChar={2} delay={200} hideCaretAtEnd>
                {TESTIMONIALS[selected].quote}
              </Typewriter>
              <p className="mt-[0.6em] text-right">— {TESTIMONIALS[selected].name}</p>
            </div>
          </div>
          <div className="pt-[0.6em] text-right">
            <TerminalWindowButton delay={delay + 1200} onClick={onNext} bgColor={colors.violet} color={colors.white} disabled={!interactive}>
              SKILLS, THO?
            </TerminalWindowButton>
          </div>
        </div>
      </div>
    </TerminalWindow>
  );
}
