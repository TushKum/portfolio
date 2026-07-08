'use client';

import { useState } from 'react';
import { useChangingPalette } from '@/lib/palette';
import { useCursorHover } from '@/store/cursor';
import { useSceneStore } from '@/store/scene';

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'Twitter', href: 'https://twitter.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
];

/**
 * The fixed email pill (top-left) and social nav (bottom-right). Both ride
 * the cycling palette — a lazy 5s rotation that strobes to 400ms on hover.
 * They slide offscreen during intro/start and while reading a project.
 */
export default function CTA() {
  const scene = useSceneStore((s) => s.scene);
  const visible = scene !== 'intro' && scene !== 'start' && scene !== 'project-open';
  const [hovered, setHovered] = useState(false);
  const { bg, text } = useChangingPalette(hovered ? 400 : 5000);
  const { startHover, stopHover } = useCursorHover('contact');

  return (
    <>
      <a
        href="mailto:tushit.jalan@gmail.com"
        onMouseEnter={() => {
          setHovered(true);
          startHover();
        }}
        onMouseLeave={() => {
          setHovered(false);
          stopHover();
        }}
        className={`fixed left-4 top-4 z-[60] rounded-full border-2 border-black px-5 py-3 font-mono lowercase transition-all duration-300 ${
          visible ? '' : '-translate-y-[200%]'
        } ${hovered ? 'scale-125' : ''}`}
        style={{ background: bg, color: text }}
      >
        tushit.jalan@gmail.com
      </a>
      <nav
        aria-label="Social"
        className={`fixed bottom-4 right-4 z-[60] flex gap-3 transition-all duration-300 ${
          visible ? '' : 'translate-y-[200%]'
        }`}
      >
        {SOCIALS.map((social) => (
          <SocialLink key={social.label} {...social} bg={bg} text={text} />
        ))}
      </nav>
    </>
  );
}

function SocialLink({ label, href, bg, text }: { label: string; href: string; bg: string; text: string }) {
  const { startHover, stopHover } = useCursorHover('external');
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={startHover}
      onMouseLeave={stopHover}
      className="rounded-full border-2 border-black px-3 py-2 font-mono text-sm transition-transform hover:scale-110"
      style={{ background: bg, color: text }}
    >
      {label}
    </a>
  );
}
