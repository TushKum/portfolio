// Procedurally generated hand-drawn stroke data. Every stroke is an array of
// [x, y, 0] triples normalized to the unit square (y up), ~200 points each —
// the Scribble component scales them into world units and resamples through
// a Catmull-Rom curve. All strokes are seeded so the art is stable.
//
// The pipeline that keeps strokes smooth instead of scratchy:
//   anchors → chaikin (corner-cutting rounds every corner)
//           → resample (even arc-length spacing)
//           → wobble  (two LOW-frequency sine waves as hand tremor —
//                      never per-point random noise, that reads as fuzz)
// Fills are continuous cosine serpentines, so the turn-arounds are round.
export type Coord = [number, number, number];

type Pt = [number, number];

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

/** Chaikin corner-cutting: every iteration replaces each corner with two
 * points at 1/4 and 3/4 of its segments — 3 rounds turn any polygon into a
 * smooth rounded shape. Endpoints of open strokes are preserved. */
function chaikin(points: Pt[], iterations: number, closed: boolean): Pt[] {
  let pts = points;
  for (let iter = 0; iter < iterations; iter += 1) {
    const out: Pt[] = [];
    const n = pts.length;
    if (!closed) out.push(pts[0]);
    const segments = closed ? n : n - 1;
    for (let i = 0; i < segments; i += 1) {
      const a = pts[i];
      const b = pts[(i + 1) % n];
      out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      out.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    if (!closed) out.push(pts[n - 1]);
    pts = out;
  }
  return pts;
}

/** Even arc-length resampling to exactly n points. */
function resample(points: Pt[], n: number, closed: boolean): Pt[] {
  const src = closed ? [...points, points[0]] : points;
  const lengths = [0];
  for (let i = 1; i < src.length; i += 1) {
    lengths.push(lengths[i - 1] + Math.hypot(src[i][0] - src[i - 1][0], src[i][1] - src[i - 1][1]));
  }
  const total = lengths[lengths.length - 1] || 1;
  const out: Pt[] = [];
  let j = 1;
  for (let k = 0; k < n; k += 1) {
    const d = (k / (closed ? n : n - 1)) * total;
    while (j < lengths.length - 1 && lengths[j] < d) j += 1;
    const t = (d - lengths[j - 1]) / (lengths[j] - lengths[j - 1] || 1);
    out.push([
      src[j - 1][0] + (src[j][0] - src[j - 1][0]) * t,
      src[j - 1][1] + (src[j][1] - src[j - 1][1]) * t,
    ]);
  }
  return out;
}

/** Hand tremor: two low-frequency sines offset each point along its normal.
 * Closed strokes get integer frequencies so the wobble meets itself at the
 * seam instead of leaving a step. */
function wobble(points: Pt[], amp: number, seed: number, closed: boolean): Pt[] {
  if (amp === 0) return points;
  const rnd = mulberry32(seed);
  let f1 = 2 + rnd() * 1.5;
  let f2 = 5 + rnd() * 2;
  if (closed) {
    f1 = Math.round(f1);
    f2 = Math.round(f2);
  }
  const p1 = rnd() * Math.PI * 2;
  const p2 = rnd() * Math.PI * 2;
  const n = points.length;
  return points.map((p, i) => {
    const t = i / (n - 1);
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    let dx = next[0] - prev[0];
    let dy = next[1] - prev[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const off = amp * (Math.sin(t * f1 * Math.PI * 2 + p1) * 0.7 + Math.sin(t * f2 * Math.PI * 2 + p2) * 0.3);
    return [p[0] - dy * off, p[1] + dx * off];
  });
}

const toCoords = (pts: Pt[]): Coord[] => pts.map(([x, y]) => [x, y, 0]);

interface ShapeOptions {
  closed?: boolean;
  amp?: number;
  seed?: number;
  n?: number;
}

/** Rough anchor polygon → smooth hand-drawn stroke. */
function shape(anchors: Pt[], { closed = true, amp = 0.006, seed = 1, n = 200 }: ShapeOptions = {}): Coord[] {
  return toCoords(wobble(resample(chaikin(anchors, 3, closed), n, closed), amp, seed, closed));
}

/** Continuous crayon fill: y climbs steadily while x sweeps on a cosine, so
 * every turn-around is a smooth arc instead of a hard zigzag corner. */
function serpentine(
  rows: number,
  yMin: number,
  yMax: number,
  halfWidth: (v: number) => number,
  centerX: (v: number) => number,
  seed: number,
  n = 200
): Coord[] {
  const rnd = mulberry32(seed);
  const phase = rnd() * Math.PI * 2;
  const pts: Pt[] = [];
  for (let i = 0; i < n; i += 1) {
    const t = i / (n - 1);
    const y = yMin + (yMax - yMin) * t;
    const x = centerX(t) + halfWidth(t) * Math.cos(Math.PI * rows * t + 0.12 * Math.sin(phase + t * 5));
    pts.push([x, y]);
  }
  return toCoords(pts);
}

/** Smooth ellipse with gentle closed-loop wobble. */
function ellipse(rx: number, ry: number, seed: number, amp = 0.01): Coord[] {
  const pts: Pt[] = [];
  for (let i = 0; i < 200; i += 1) {
    const a = (i / 200) * Math.PI * 2;
    pts.push([0.5 + rx * Math.cos(a), 0.5 + ry * Math.sin(a)]);
  }
  return toCoords(wobble(pts, amp, seed, true));
}

/** Loopy Lissajous scribble — smooth by construction (sums of sines), unlike
 * a random walk which turns in jagged steps. */
export function squiggle(seed: number): Coord[] {
  const rnd = mulberry32(seed);
  const a1 = 1 + Math.floor(rnd() * 2);
  const b1 = a1 + 1;
  const a2 = 3 + Math.floor(rnd() * 3);
  const b2 = 3 + Math.floor(rnd() * 3);
  const p = [rnd(), rnd(), rnd(), rnd()].map((v) => v * Math.PI * 2);
  const raw: Pt[] = [];
  for (let i = 0; i < 200; i += 1) {
    const t = (i / 199) * Math.PI * 2;
    raw.push([
      0.5 + 0.34 * Math.sin(a1 * t + p[0]) + 0.13 * Math.sin(a2 * t + p[1]),
      0.5 + 0.34 * Math.cos(b1 * t + p[2]) + 0.13 * Math.cos(b2 * t + p[3]),
    ]);
  }
  let [minX, maxX, minY, maxY] = [Infinity, -Infinity, Infinity, -Infinity];
  raw.forEach(([x, y]) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });
  return raw.map(([x, y]) => [
    (x - minX) / (maxX - minX || 1),
    (y - minY) / (maxY - minY || 1),
    0,
  ]);
}

export function circle(seed: number, amp = 0.012): Coord[] {
  return ellipse(0.48, 0.48, seed, amp);
}

// ---- The computer: a chunky CRT monitor + keyboard in four strokes.
// Anchor lists include edge midpoints so chaikin rounds the corners without
// collapsing the flat edges.

export const COMPUTER_SCREEN: Coord[] = shape(
  [
    [0.16, 0.4],
    [0.5, 0.41],
    [0.84, 0.42],
    [0.855, 0.64],
    [0.86, 0.86],
    [0.5, 0.87],
    [0.15, 0.88],
    [0.155, 0.64],
  ],
  { seed: 11, amp: 0.005 }
);

export const COMPUTER_BODY: Coord[] = shape(
  [
    [0.08, 0.3],
    [0.5, 0.29],
    [0.9, 0.28],
    [0.92, 0.6],
    [0.93, 0.93],
    [0.5, 0.95],
    [0.07, 0.94],
    [0.06, 0.62],
  ],
  { seed: 22, amp: 0.006 }
);

export const COMPUTER_KEYBOARD: Coord[] = shape(
  [
    [0.05, 0.32],
    [0.5, 0.3],
    [0.95, 0.3],
    [0.8, 0.6],
    [0.5, 0.62],
    [0.2, 0.62],
  ],
  { seed: 33, amp: 0.006 }
);

export const COMPUTER_FILL: Coord[] = serpentine(
  7,
  0.31,
  0.91,
  (v) => 0.36 + 0.05 * Math.sin(v * Math.PI),
  () => 0.5,
  44
);

// ---- The coffee mug: one flowing outline (with handle loop), a serpentine
// crayon fill, and the liquid ellipse that hides when the cup spills.

export const CUP_OUTLINE: Coord[] = shape(
  [
    [0.24, 0.8],
    [0.235, 0.55],
    [0.27, 0.18],
    [0.36, 0.14],
    [0.5, 0.13],
    [0.62, 0.14],
    [0.7, 0.18],
    [0.715, 0.38],
    [0.87, 0.34],
    [0.96, 0.45],
    [0.88, 0.58],
    [0.73, 0.55],
    [0.735, 0.7],
    [0.72, 0.8],
    [0.6, 0.845],
    [0.48, 0.85],
    [0.34, 0.84],
  ],
  { closed: false, seed: 55, amp: 0.005 }
);

export const CUP_FILL: Coord[] = serpentine(
  6,
  0.17,
  0.78,
  (v) => 0.215 + 0.02 * v,
  () => 0.48,
  66
);

export const CUP_LIQUID: Coord[] = ellipse(0.44, 0.15, 77);

// ---- Loose squiggles reused by the background and project title previews.

export const SQUIGGLE_A = squiggle(101);
export const SQUIGGLE_B = squiggle(202);
export const SQUIGGLE_C = squiggle(303);
export const BG_SQUIGGLE = squiggle(404);
export const BG_CIRCLE = circle(505);
export const FOCUS_CIRCLE = circle(606, 0.02);
