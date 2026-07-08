'use client';

import { useMemo, useRef } from 'react';
import { Group, MathUtils, NormalBlending, ShaderMaterial } from 'three';
import { useFrame } from '@react-three/fiber';
import { useStore } from '@/store/useStore';

// ---- Synthetic K-means-style dataset -------------------------------------
// K gaussian clusters in 3-space. Dot size encodes local density via the
// gaussian falloff from each cluster's centroid: dense cores print as fat
// halftone dots, sparse tails as fine specks. One cluster prints in accent
// red ink. Seeded, so the "dataset" is stable across reloads.

const K = 5;
const ACCENT_CLUSTER = 2;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildDataset() {
  const rnd = mulberry32(20260706);
  const gaussian = () => {
    // Box-Muller
    const u = Math.max(rnd(), 1e-9);
    const v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  const positions: number[] = [];
  const sizes: number[] = [];
  const phases: number[] = [];
  const accents: number[] = [];
  const centroids: [number, number, number][] = [];

  for (let c = 0; c < K; c += 1) {
    const cx = (rnd() - 0.5) * 9;
    const cy = (rnd() - 0.5) * 5;
    const cz = (rnd() - 0.5) * 4;
    centroids.push([cx, cy, cz]);
    const sigma = 0.55 + rnd() * 0.6;
    const count = 380 + Math.floor(rnd() * 260);
    for (let i = 0; i < count; i += 1) {
      const dx = gaussian() * sigma;
      const dy = gaussian() * sigma * 0.8;
      const dz = gaussian() * sigma * 0.7;
      positions.push(cx + dx, cy + dy, cz + dz);
      const r2 = (dx * dx + dy * dy + dz * dz) / (sigma * sigma);
      // Density → dot size: gaussian core prints heavy, tails print fine.
      sizes.push(1.6 + 7 * Math.exp(-r2 * 0.85));
      phases.push(rnd() * Math.PI * 2);
      accents.push(c === ACCENT_CLUSTER ? 1 : 0);
    }
  }

  return {
    positions: new Float32Array(positions),
    sizes: new Float32Array(sizes),
    phases: new Float32Array(phases),
    accents: new Float32Array(accents),
    centroids,
  };
}

// ---- Halftone ink shader ---------------------------------------------------
// Each data point is a hard-edged circular "ink dot"; size scales with data
// density (attribute), hover agitation, and scroll velocity. Rendered over
// paper through mix-blend-multiply, so dots read as printed ink.

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uHover;
  uniform float uSpin;
  attribute float aSize;
  attribute float aPhase;
  attribute float aAccent;
  varying float vAccent;

  void main() {
    vec3 p = position;
    float agitation = 0.35 + uHover * 1.4;
    p.x += sin(uTime * 0.6 + aPhase) * 0.05 * agitation;
    p.y += cos(uTime * 0.5 + aPhase * 2.1) * 0.05 * agitation;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float size = aSize * (1.0 + 0.4 * uHover + min(uSpin, 0.5));
    gl_PointSize = size * (95.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vAccent = aAccent;
  }
`;

const FRAGMENT = /* glsl */ `
  varying float vAccent;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.46) discard; // hard ink edge
    vec3 ink = mix(vec3(0.075, 0.067, 0.063), vec3(1.0, 0.17, 0.0), vAccent);
    gl_FragColor = vec4(ink, 1.0);
  }
`;

/**
 * The data cluster: tilts and drifts with damped inertia toward the cursor,
 * sinks as the page scrolls, spins faster with scroll velocity, and swells
 * when any HTML link is hovered (via the shared store).
 */
export default function ClusterField() {
  const group = useRef<Group>(null);
  const data = useMemo(buildDataset, []);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uHover: { value: 0 },
          uSpin: { value: 0 },
        },
        transparent: false,
        depthWrite: false,
        blending: NormalBlending,
      }),
    []
  );

  const lastScroll = useRef(0);
  const velocity = useRef(0);

  useFrame(({ clock }, delta) => {
    const g = group.current;
    if (!g) return;
    const { mouse, scrollY, scrollProgress, linkHover } = useStore.getState();
    const dt = Math.min(delta, 1 / 30);
    const t = clock.elapsedTime;

    // Smoothed scroll velocity → spin + dot swell.
    const raw = (scrollY - lastScroll.current) / Math.max(dt, 1e-4);
    lastScroll.current = scrollY;
    velocity.current = MathUtils.damp(velocity.current, raw, 4, dt);
    const spin = Math.min(Math.abs(velocity.current) / 2200, 1);

    // Fluid inertia: everything reaches its target through exponential damping.
    g.rotation.y = MathUtils.damp(g.rotation.y, mouse.x * 0.38 + t * 0.04, 2.2, dt);
    g.rotation.x = MathUtils.damp(g.rotation.x, -mouse.y * 0.28 + scrollProgress * 0.7 - 0.15, 2.2, dt);
    g.rotation.z = MathUtils.damp(g.rotation.z, spin * 0.12, 2.5, dt);
    g.position.y = MathUtils.damp(g.position.y, 0.8 - scrollProgress * 4.2, 2, dt);

    material.uniforms.uTime.value = t;
    material.uniforms.uSpin.value = MathUtils.damp(material.uniforms.uSpin.value, spin, 4, dt);
    material.uniforms.uHover.value = MathUtils.damp(
      material.uniforms.uHover.value,
      linkHover ? 1 : 0,
      6,
      dt
    );
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[data.sizes, 1]} />
          <bufferAttribute attach="attributes-aPhase" args={[data.phases, 1]} />
          <bufferAttribute attach="attributes-aAccent" args={[data.accents, 1]} />
        </bufferGeometry>
        <primitive object={material} attach="material" />
      </points>

      {/* Centroid crosshairs — the "fitted" K-means centers. */}
      {data.centroids.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh>
            <boxGeometry args={[0.5, 0.015, 0.015]} />
            <meshBasicMaterial color={i === ACCENT_CLUSTER ? '#ff2b00' : '#131110'} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.015, 0.5, 0.015]} />
            <meshBasicMaterial color={i === ACCENT_CLUSTER ? '#ff2b00' : '#131110'} />
          </mesh>
        </group>
      ))}

      {/* Principal axes through the origin — thin technical rules. */}
      <mesh rotation={[0, 0, 0]}>
        <boxGeometry args={[16, 0.008, 0.008]} />
        <meshBasicMaterial color="#131110" transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[10, 0.008, 0.008]} />
        <meshBasicMaterial color="#131110" transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[8, 0.008, 0.008]} />
        <meshBasicMaterial color="#131110" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}
