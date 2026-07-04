'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { PerspectiveCamera } from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import Typewriter from '@/components/terminal/Typewriter';
import TerminalButton from '@/components/terminal/TerminalButton';
import TextWindow from '@/components/terminal/TextWindow';
import PortraitWindow from '@/components/terminal/PortraitWindow';
import TestimonialsWindow from '@/components/terminal/TestimonialsWindow';
import SkillPaintWindow from '@/components/terminal/SkillPaintWindow';
import { colors } from '@/lib/colors';
import { useAspect } from '@/lib/hooks';
import { useSceneStore } from '@/store/scene';
import { useCursorHover } from '@/store/cursor';

export type SlideName = 'intro' | 'mission' | 'testimonials' | 'skills';

// The screen plane in world units, at world z = 2.
const PLANE_W = 3.4;
const PLANE_H = 2;
const PLANE_Z = 2;

/**
 * The DOM terminal pinned over the CRT's screen. Deliberately NOT drei Html's
 * `transform` mode (close cameras blow the div up and Safari blurs it) —
 * instead every frame we compute the exact pixel footprint of a 3.4×2 world
 * plane from the camera fov/distance/aspect and write it to CSS vars. All
 * typography inside is em-based off font-size = width/40, so the entire UI
 * scales as one unit; the div is counter-rotated to match the screen tilt.
 */
export default function Terminal() {
  const setScene = useSceneStore((s) => s.setScene);
  const [slide, setSlide] = useState<SlideName>('intro');
  const rootRef = useRef<HTMLDivElement>(null);
  const aspect = useAspect();
  const wide = aspect >= 1;
  const { startHover, stopHover } = useCursorHover('terminal');

  useFrame(({ camera, size }) => {
    const el = rootRef.current;
    if (!el) return;
    const cam = camera as PerspectiveCamera;
    const dist = Math.abs(cam.position.z - PLANE_Z);
    const vFov = (cam.fov * Math.PI) / 180;
    const worldH = 2 * Math.tan(vFov / 2) * dist;
    const worldW = worldH * (size.width / size.height);
    const w = Math.min((PLANE_W / worldW) * size.width, size.width * 0.9);
    const h = Math.min((PLANE_H / worldH) * size.height, size.height * 0.8);
    el.style.setProperty('--tw', `${w}px`);
    el.style.setProperty('--th', `${h}px`);
  });

  const backToMenu = () => {
    setScene('menu');
    setSlide('intro');
  };

  // Escape backs out of the about deck. keydown, not keypress — most
  // browsers never fire keypress for Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && useSceneStore.getState().scene === 'about') {
        setScene('menu');
        setSlide('intro');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setScene]);

  return (
    <group position={[-1, 0.7, PLANE_Z]} rotation={[0, 0, Math.PI / 40]}>
      <Html center zIndexRange={[30, 20]}>
        <div
          ref={rootRef}
          onMouseEnter={startHover}
          onMouseLeave={stopHover}
          className="relative overflow-hidden rounded-[0.4em] bg-blue font-mono text-white"
          style={{
            width: 'var(--tw, 300px)',
            height: 'var(--th, 180px)',
            fontSize: 'calc(var(--tw, 300px) / 40)',
            transform: wide ? 'rotate(-5deg)' : 'rotate(-4deg)',
          }}
        >
          <SlideLayer active={slide === 'intro'} exit="translate(0, -120%)">
            <div className="flex h-full flex-col justify-between p-[1em] text-[2em] leading-snug">
              <div>
                <Typewriter delay={800} hideCaretAtEnd>
                  Hello! I&apos;m John Doe.
                </Typewriter>
                <Typewriter delay={800 + 19 * 25 + 100}>I build living interfaces.</Typewriter>
              </div>
              <div className="grid place-items-center pb-[0.5em]">
                <TerminalButton
                  delay={2350}
                  disabled={slide !== 'intro'}
                  onClick={() => {
                    setScene('about');
                    setSlide('mission');
                  }}
                >
                  ABOUT_JOHN
                </TerminalButton>
              </div>
            </div>
          </SlideLayer>

          <SlideLayer active={slide === 'mission'} exit="translate(-115%, -60%)">
            <div className="absolute left-[4%] top-[8%] w-[58%]">
              <TextWindow
                title="MISSION.TXT"
                delay={300}
                interactive={slide === 'mission'}
                lines={[
                  'John bridges design and engineering.',
                  'He turns wild ideas into precise, living interfaces.',
                  '(He is also a placeholder person.)',
                ]}
                button={{ label: 'WHO SAYS SO?', onClick: () => setSlide('testimonials') }}
              />
            </div>
            <div className="absolute bottom-[6%] right-[3%] w-[34%]">
              <PortraitWindow delay={600} interactive={slide === 'mission'} />
            </div>
          </SlideLayer>

          <SlideLayer active={slide === 'testimonials'} exit="translate(65%, -125%)">
            <div className="absolute inset-x-[6%] inset-y-[10%]">
              <TestimonialsWindow
                delay={400}
                interactive={slide === 'testimonials'}
                onNext={() => setSlide('skills')}
              />
            </div>
          </SlideLayer>

          <SlideLayer active={slide === 'skills'} exit="translate(-40%, 135%)">
            <div className="absolute inset-[4%]">
              <SkillPaintWindow interactive={slide === 'skills'} onBackToMenu={backToMenu} />
            </div>
          </SlideLayer>

          {slide !== 'intro' && (
            <div className="absolute right-[0.6em] top-[0.6em] z-10">
              <TerminalButton delay={500} onClick={backToMenu} className="text-[max(0.7em,14px)]">
                {wide ? 'BACK_TO_MENU' : 'BACK'}
              </TerminalButton>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

function SlideLayer({
  active,
  exit,
  children,
}: {
  active: boolean;
  exit: string;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 transition-transform duration-1000"
      style={{ transform: active ? 'none' : exit, pointerEvents: active ? undefined : 'none' }}
    >
      {children}
    </div>
  );
}
