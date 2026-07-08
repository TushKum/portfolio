# Personalizing this site

This app is a study of [bryantcodes.art](https://bryantcodes.art)'s mechanics — the author's README
invites reverse-engineering, but explicitly asks people not to republish a content-swapped
copy as their own. So treat this build as a **chassis**: the code, the generated art, and all
the copy in here are original and yours to edit, and the final section of this doc lists the
changes that will make the site genuinely *yours* before you put it on the internet.

---

## 1. Run it

```bash
npm install
npm run dev        # http://localhost:3000 (the repo's launch config uses -p 3123)
npm run build      # production build + full type-check — run before deploying
```

Everything below assumes you're editing inside `spatial-portfolio/`.

---

## 2. The 60-second map

| You want to change… | Edit this file |
| --- | --- |
| Your name, tab title, SEO description | `app/layout.tsx` |
| Email + social links (pills in the corners) | `src/components/CTA.tsx` |
| Terminal intro lines ("Hello! I'm…") | `src/components/terminal/Terminal.tsx` |
| Projects (the ice cubes) | `src/components/projects/data.ts` |
| The "BLOG COMING SOON" notebook | `src/components/Notebook.tsx` |
| About windows (mission / portrait / testimonials / skills) | `src/components/terminal/*.tsx` |
| Colors | `src/lib/colors.ts` **and** `tailwind.config.ts` (keep in sync) |
| Hand-drawn shapes | `src/lib/lines.ts` |
| 3D display font | `public/fonts/hand.ttf` |
| Scene framing / camera choreography | `src/components/SceneDirector.tsx` |
| Entrance timings, springs | `src/components/Computer.tsx`, `src/components/Scribble.tsx` |
| Cursor hover labels | `src/components/CustomCursor.tsx` |
| Joke code on the rings | `src/components/CodeRings.tsx` (`JOKES` array) |

State lives in two tiny Zustand stores: `src/store/scene.ts` (which scene you're in, which
project is open) and `src/store/cursor.ts` (a stack of hover states for the custom cursor).
Every component reads from those — there are no props threading scene state around.

---

## 3. Identity (10 minutes)

The site is already set to **Tushit Kumar / Thapar University / tushit.jalan@gmail.com**.
Here's where each piece lives when you want to tweak it:

1. **Name & metadata** — `app/layout.tsx`: `metadata.title`, `metadata.description`
   (browser tab + SEO).
2. **Email** — search the repo for `tushit.jalan@gmail.com` to change it everywhere at once.
   It appears in 3 places: the CTA pill (`src/components/CTA.tsx`), the project modal's
   "Say hi" button (`src/components/projects/ProjectModal.tsx`), and the skills window's
   CONTACT_ME button (`src/components/terminal/SkillPaintWindow.tsx`).
3. **Socials** — `SOCIALS` array in `src/components/CTA.tsx`. ⚠️ Still generic
   `github.com` / `twitter.com` / `linkedin.com` — put your real profile URLs here.
4. **Terminal greeting** — `src/components/terminal/Terminal.tsx`, the intro `SlideLayer`:
   the two `<Typewriter>` lines ("Hi! I'm Tushit Kumar." / "I design & build for the web.")
   and the `ABOUT_TUSHIT` button label. Note the second line's `delay={800 + 21 * 25 + 100}` —
   the `21` is the first line's character count, so the typing chains naturally. Update that
   number when you change the first line.
5. **Mission slide** — same file, the `MISSION.TXT` `lines` array (this is where Thapar
   University is mentioned).
6. **ASCII portrait** — `src/components/terminal/PortraitWindow.tsx`, the `PORTRAIT` string.
   Draw your own face, or swap the `<pre>` for a real `<img>`.
7. **Testimonials** — `src/components/terminal/TestimonialsWindow.tsx` (currently Rubber
   Duck, Thapar WiFi, Hostel Chai Wala — make them yours).
8. **Cursor labels** — `LABELS` in `src/components/CustomCursor.tsx` ("turn on", "spill it",
   "peek"…). These little verbs carry a lot of personality; write your own.
9. **Code-ring jokes** — the `JOKES` array in `src/components/CodeRings.tsx` (the scrolling
   code lines that orbit the scene after power-on).

---

## 4. Projects & cubes (adding more)

All projects live in `src/components/projects/data.ts`. Each entry:

```ts
{
  title: 'Project Epsilon',      // modal headline
  short: 'Epsilon',              // floating label next to the hovered cube
  subtitle: 'One good sentence.',
  year: '2022',
  client: 'Whoever',
  role: 'What you did',
  stack: 'The tools',
  color: '#0A5EDA',              // page background while the project is open (white text sits on it — keep it dark enough)
  body: ['Paragraph one…', 'Paragraph two…'],
}
```

**To add a cube, just append an entry — that's it.** The ring divides a full circle by
`PROJECTS.length` (`ProjectListing.tsx`: `arc = 2π / n`), so 4, 5, or 6 cubes space
themselves automatically. Practical limits:

- **5–6 cubes**: bump the ring `radius` in `ProjectListing.tsx` (currently `2.7` wide / `2.4`
  narrow → try `3.2 / 2.8`) so hover-scaled cubes don't overlap.
- Also widen the camera framing: in `SceneDirector.tsx`, the `projects` stage size
  (`[8.5, 6.5]` wide) — add ~1 unit per extra cube.
- **7+**: consider two rings or a grid — edit the `slots` math in `ProjectListing.tsx`.

Cube look: the ice material is in `ProjectEntry.tsx` (`meshPhysicalMaterial`, `transmission`
0.85). The hover color comes from each project's `color`. Swap the material entirely for a
different vibe — e.g. `meshToonMaterial` for flat cartoon cubes, or a `canvasTexture` with
your own doodles.

---

## 5. The about deck (terminal slides)

`Terminal.tsx` owns the slide order: `intro → mission → testimonials → skills`.

- **Mission** — `TextWindow` lines type themselves; delays are computed from character
  counts automatically, so just edit the `lines` array.
- **Portrait** — `PortraitWindow.tsx` is an ASCII face. Replace the `PORTRAIT` string with
  your own ASCII art, or swap the `<pre>` for an `<img>` of a real photo/drawing.
- **Testimonials** — `TESTIMONIALS` in `TestimonialsWindow.tsx`: name, emoji avatar, quote.
- **Skills** — `SKILL_FILLS` in `SkillPaintWindow.tsx`: label + poster colors. The
  scratch-off canvas fits your label size automatically.
- **Add a slide**: add a name to `SlideName`, drop a new `<SlideLayer>` in `Terminal.tsx`
  with an `exit` transform that pushes it fully off (>110% in one axis), and point some
  button's `onClick` at `setSlide('yourslide')`.

---

## 5b. The menu objects (computer, mug, notebook)

The menu scene has three hand-drawn objects, each its own component with art in
`src/lib/lines.ts`:

- **Computer** (`Computer.tsx`) — an open laptop with a bold flat-yellow screen and
  lightning-bolt accents; click it to power on and enter the menu. Its art is the `LAPTOP_*`
  strokes in `lines.ts` (lid, screen fill, keyboard deck, key rows, two bolts); all body
  parts share one `[0,1]` frame at `size 4, position [-1, -0.14, z]` so they line up, with the
  screen center landing at world `[-1, 0.7]` where the terminal mounts.
- **Coffee mug** (`CoffeeCup.tsx`) — the PROJECTS nav; click to spill into the projects room.
- **Notebook** (`Notebook.tsx`) — a decorative "BLOG COMING SOON" spiral pad, top-right.

To retheme the notebook: change its text (the `'Blog\ncoming\nsoon'` string), its color
(`colors.violet`), or its position (`[4, 1.3, 2.5]` wide / `[-1.5, 3.8, 1.8]` narrow). To make
it *do* something — e.g. open a real blog — copy the `<InteractiveArea>` pattern from
`CoffeeCup.tsx` (give it a real `onClick` and a cursor label) or wrap it to open a URL.

**To add your own fourth object** (a plant, a phone, a cassette deck…): draw it as strokes in
`lines.ts` (section 8's SVG sampler), clone `Notebook.tsx` as a starting point, and render it
in `SceneDirector.tsx` next to `<Notebook />`. Give it a menu-scene world position that
doesn't overlap the others.

---

## 6. Colors & the strobing palette

`src/lib/colors.ts` is the canonical list; `tailwind.config.ts` duplicates the same hexes so
the DOM gets utility classes while three.js does `new Color(hex)`. **Change both together.**

`palettePairs` (also in `colors.ts`) is the five `(bg, text)` pairs that everything strobes
through — CTA pills every 5s (400ms while hovered), project title previews every 500ms.
Reorder/replace to re-mood the whole site in one place. A light-paper-with-navy-ink palette,
or a black site with neon pairs, changes the character completely — cheapest big win here.

---

## 7. Fonts

- **3D hand font** — `public/fonts/hand.ttf` (currently Gochi Hand). Drop in any `.ttf`/
  `.woff` (troika, the 3D text renderer, doesn't read `.woff2`) and keep the filename, or
  update `src/lib/typography.ts`. Every `<Text>` in the scene uses it.
- **Terminal font** — Roboto Mono, loaded via a plain `<link>` stylesheet in
  `app/layout.tsx` **on purpose**: two `<canvas>` painters (code rings, skills poster)
  address the font by literal family name, which `next/font`'s hashed family names would
  break. If you swap it, update the family string in `CodeRings.tsx`,
  `SkillPaintWindow.tsx`, and `tailwind.config.ts`.

---

## 8. The hand-drawn art (`src/lib/lines.ts`)

Every stroke is ~200 `[x, y, 0]` points in a unit square. `Scribble.tsx` scales them by a
`size`, runs them through a Catmull-Rom curve, and draws them in tip-first by animating a
meshline dash uniform. The generator pipeline:

```
anchors → chaikin(3)  → resample(200)  → wobble(amp, seed)
          rounds every   even spacing     two low-frequency sine
          corner                          waves = hand tremor
```

Tuning knobs:

- `amp` (0.004–0.01): more/less tremor. Zero = machine-drawn.
- Anchor lists include edge **midpoints** — that's what keeps flat edges flat while chaikin
  rounds the corners. Fewer anchors = blobbier.
- Fills are `serpentine(rows, …)` — continuous cosine sweeps, so turnarounds stay round.
  More `rows` = finer crayon hatching. Fatter `lineWidth` on the Scribble = more solid.
- Squiggles are Lissajous curves (`squiggle(seed)`) — try seeds until you like the loops.

### Drawing your own strokes (the single biggest "make it mine" move)

Draw shapes in any vector tool (Figma/Illustrator/Inkscape), export an SVG path, then run
this in a browser console to convert it into a stroke array:

```js
// Paste your path's `d` attribute:
const d = 'M 10 80 C 40 10, 65 10, 95 80 …';
const svgNS = 'http://www.w3.org/2000/svg';
const path = document.createElementNS(svgNS, 'path');
path.setAttribute('d', d);
document.body.appendChild(path.ownerSVGElement ?? (() => { const s = document.createElementNS(svgNS, 'svg'); s.appendChild(path); document.body.appendChild(s); return s; })());
const L = path.getTotalLength(), N = 200, pts = [];
for (let i = 0; i < N; i++) { const p = path.getPointAtLength((i / (N - 1)) * L); pts.push([p.x, p.y]); }
const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
// y is flipped because SVG is y-down and the scene is y-up:
console.log(JSON.stringify(pts.map(([x, y]) => [
  +((x - x0) / (x1 - x0)).toFixed(4), +(1 - (y - y0) / (y1 - y0)).toFixed(4), 0,
])));
```

Paste the output as an exported const in `lines.ts` and feed it to any `<Scribble>`. This is
how you replace my generated computer/mug with *your* drawings of *your* objects.

---

## 9. Choreography, camera & scenes

- **Entrance ladder** — `Computer.tsx`: `let time = 450; useTrueAfterDelay(time += 1000)`…
  Each stroke draws in when its boolean flips. Stretch or compress the ladder freely.
- **Springs** — the turn-on explosion is one underdamped spring
  (`{ mass: 1.5, tension: 220, friction: 12 }`). More friction = politer computer.
- **Camera** — there is no camera animation system, just `SceneDirector.tsx` mapping each
  scene to a *stage* (a world rectangle to frame) and `CameraController.tsx` lerping 5%
  per frame toward it. To reframe a scene, edit its stage. To add a **new room**, put
  content at a far-away position (projects live ~12 units below home), add a scene name to
  `src/store/scene.ts`, a stage entry in `SceneDirector.tsx`, and something clickable that
  calls `setScene('yourscene')` (see `InteractiveArea` usage in `CoffeeCup.tsx`).

---

## 10. Making it YOURS (please read this one)

Right now this site runs borrowed metaphors with original code and art. Before publishing,
change enough that someone who knows bryantcodes.art sees *influence*, not a copy. Highest
impact first:

1. **Replace the drawings with your own** (section 8's SVG sampler). Your hand, your
   objects — this alone transforms the site.
2. **Swap the central metaphor.** The computer-as-menu is *his* icon (this build draws it as a
   bold laptop). Yours could be a
   game console, a synth, a bookshelf, a fridge with magnets, a garden — anything you can
   draw as 3–5 strokes with a "screen" area for the terminal (`Terminal.tsx` doesn't care
   what it's mounted on; it's just a plane at a position).
3. **Swap the nav gags.** Spilling coffee → paper plane you throw, a light switch, a pet
   that walks off. `CoffeeCup.tsx` is ~120 lines; clone its pattern (scribbles + spring +
   `InteractiveArea` + `setScene`).
4. **Re-palette** (section 6) and **re-font** (section 7). Paper white + royal blue is his
   look; try warm paper + forest ink, or graphite + highlighter yellow.
5. **Rewrite every string** — terminal lines, cursor verbs, testimonials, ring jokes,
   window titles. Microcopy is most of this genre's charm.
6. **Change the project presentation.** Ice cubes → polaroids on a fridge, cassettes in a
   shoebox, planets. `ProjectEntry.tsx` is the only file that knows cubes exist.
7. **Real content.** Your actual projects with real outcomes will differentiate more than
   any visual change.
8. Nice extras: subtle sound (Web Audio bleeps on hover/typing), a drawn day/night toggle,
   an idle animation when the user goes quiet, a guestbook window.

---

## 11. Deploy

Vercel: import the repo, set the project root to `spatial-portfolio/`, done — it's a static
prerender with client-side WebGL. Any Node host running `npm run build && npm start` also
works.

---

## 12. Troubleshooting

- **"Internal Server Error" / HTTP 500 from the dev server** — the `.next` build cache is
  corrupted. Two known causes: (a) running `npm run build` while `npm run dev` is running
  (they share the `.next` folder — never do both at once), or (b) renaming/removing an
  export while the dev server hot-reloads through the broken in-between state. The code is
  usually fine. Fix:

  ```bash
  # stop the dev server (Ctrl+C), then:
  rm -rf .next
  npm run dev
  ```

- **White canvas in an embedded/hidden preview** — hidden tabs suspend
  `requestAnimationFrame`, which freezes both R3F and the springs. Open the tab for real;
  it's not a bug.
- **A stroke vanishes at some camera angles** — every `Scribble` sets
  `frustumCulled={false}` because meshline bounding spheres are wrong; keep that if you add
  meshes made of lines.
- **`meshLineMaterial` type error about `args`** — the material's constructor requires a
  parameters object: `args={[{ resolution }]}` (see `Scribble.tsx`).
- **Canvas text renders in the wrong font** — the code rings wait for `document.fonts.ready`;
  if you swap fonts, keep that gate and use literal family names (section 7).
