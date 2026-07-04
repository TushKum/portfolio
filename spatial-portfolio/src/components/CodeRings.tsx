'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BackSide, CanvasTexture, LinearFilter, MeshStandardMaterial, NearestFilter, RepeatWrapping } from 'three';
import { useFrame } from '@react-three/fiber';
import { animated, config, useSpring } from '@react-spring/three';
import { colors } from '@/lib/colors';
import { useAspect, useInterval } from '@/lib/hooks';

const N_RINGS = 16;
const LINE_LENGTH = 158;
const CURSOR = '▓▓█'; // ▓▓█
const TYPE_TICK = 100;

// Original joke one-liners, right-padded to exactly fill the canvas width.
const JOKES = [
  'while (!succeeding) { try(); } // any day now',
  'const bugs = features.filter(Boolean); // all of them, apparently',
  'if (coffee.isEmpty()) { refill(); } else { code(); } // the main loop',
  '// TODO: delete this whole file before anyone important sees it',
  'const isOdd = (n) => !isEven(n); const isEven = (n) => !isOdd(n);',
  'git commit -m "fix" && git commit -m "actually fix" && git push --force',
  "document.write('<blink>hire me</blink>'); // brave choice",
  'for (;;) { dance(); } // ship it',
  'await fetch("https://is-even.example.com/?n=" + n); // microservices',
].map((line) => line.slice(0, LINE_LENGTH).padEnd(LINE_LENGTH, '.'));

/** One shared canvas that perpetually re-types joke code, character by
 * character, with a chunky block cursor overwriting the previous line. */
function makeTypingCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 1146;
  canvas.height = 12;
  const ctx = canvas.getContext('2d')!;
  let previous = JOKES[0];
  let next = JOKES[1];
  let i = 0;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '100 12px "Roboto Mono", monospace';
    ctx.fillStyle = colors.blue;
    ctx.textBaseline = 'middle';
    ctx.fillText(next.slice(0, i) + CURSOR + previous.slice(i + CURSOR.length), 0, 6);
    i += 1;
    if (i > LINE_LENGTH) {
      i = 0;
      previous = next;
      next = JOKES[Math.floor(Math.random() * JOKES.length)];
    }
  };
  tick();
  const interval = setInterval(tick, TYPE_TICK);
  return { canvas, stop: () => clearInterval(interval) };
}

/**
 * The turn-on payoff: 16 open-ended cylinders squashed into ellipses, stacked
 * facing the camera, reading joke code off their inner far wall (BackSide).
 * The TEXTURE offset scrolls, not the mesh rotation — rotating a non-uniformly
 * scaled cylinder would visibly wobble the ellipse axes.
 */
export default function CodeRings({ visible }: { visible: boolean }) {
  const aspect = useAspect();
  const ringHeight = aspect >= 1 ? 0.02 : 0.06;

  // Nothing renders until the mono font is confirmed loaded — canvas text
  // would otherwise silently draw in a fallback font.
  const [fontReady, setFontReady] = useState(false);
  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => {
      if (alive) setFontReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!fontReady) return;
    const typing = makeTypingCanvas();
    setCanvas(typing.canvas);
    return typing.stop;
  }, [fontReady]);

  const textures = useMemo(() => {
    if (!canvas) return null;
    return Array.from({ length: N_RINGS }, (_, i) => {
      const texture = new CanvasTexture(canvas);
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.flipY = false;
      texture.minFilter = LinearFilter;
      texture.magFilter = NearestFilter; // crisp retro text
      texture.premultiplyAlpha = true;
      // Negative x-repeat: we read the texture off the cylinder's inner far
      // wall (BackSide), which mirrors horizontally — this flips it back.
      texture.repeat.x = -Math.max(4 - Math.floor(i / 5), 1);
      return texture;
    });
  }, [canvas]);

  const [nVisibleRings, setNVisibleRings] = useState(0);
  useInterval(
    () => setNVisibleRings((n) => n + 1),
    visible && nVisibleRings < N_RINGS ? 50 : null
  );
  useInterval(
    () => textures?.forEach((t) => (t.needsUpdate = true)),
    visible && textures ? TYPE_TICK : null
  );

  if (!textures) return null;

  return (
    <group rotation={[Math.PI / 2, 0, 0]} position={[-1, 1, 2]} scale={1.8}>
      {textures.map((texture, i) => (
        <Ring
          key={i}
          index={i}
          texture={texture}
          ringHeight={ringHeight}
          visible={i > N_RINGS - 1 - nVisibleRings}
        />
      ))}
    </group>
  );
}

function Ring({
  index,
  texture,
  ringHeight,
  visible,
}: {
  index: number;
  texture: CanvasTexture;
  ringHeight: number;
  visible: boolean;
}) {
  const material = useRef<MeshStandardMaterial>(null);
  const speed = useMemo(() => 0.5 + Math.random() * 0.5, []);
  const startOffset = useMemo(() => Math.random(), []);
  const { s } = useSpring({ s: visible ? 1 : 0, from: { s: 0 }, config: config.wobbly });

  useFrame(({ clock }) => {
    texture.offset.x = startOffset + (clock.elapsedTime / 60) * -speed;
    const m = material.current;
    if (m && visible && m.opacity < 1) m.opacity = Math.min(1, m.opacity + 0.1);
  });

  const radius = 3 - index * 0.1;
  return (
    <animated.group scale={s}>
      <mesh position={[0, index * -4 * ringHeight, 0]} scale={[2, 1, 1]}>
        <cylinderGeometry args={[radius, radius - 0.05, ringHeight * 2, 64, 1, true]} />
        <meshStandardMaterial
          ref={material}
          map={texture}
          transparent
          opacity={0}
          side={BackSide}
          toneMapped={false}
        />
      </mesh>
    </animated.group>
  );
}
