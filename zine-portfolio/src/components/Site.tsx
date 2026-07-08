'use client';

import { type ReactNode, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';

const HalftoneCanvas = dynamic(() => import('@/components/HalftoneCanvas'), { ssr: false });

const EASE: [number, number, number, number] = [0.83, 0, 0.17, 1];

/** Rigid editorial reveal: text guillotines up into view inside a clipped row. */
function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        initial={{ y: '110%' }}
        whileInView={{ y: '0%' }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.7, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Any interactive element reports hover to the store → the cluster reacts. */
function HoverLink({
  href,
  children,
  className,
  external = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}) {
  const setLinkHover = useStore((s) => s.setLinkHover);
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      onMouseEnter={() => setLinkHover(true)}
      onMouseLeave={() => setLinkHover(false)}
      className={`underline decoration-1 underline-offset-4 transition-colors hover:bg-ink hover:text-paper hover:no-underline ${className ?? ''}`}
    >
      {children}
    </a>
  );
}

const LOG_LINES = [
  '$ kmeans --k 5 --dims 3 --seed 20260706',
  '[iter 001]  inertia: 812.4401',
  '[iter 014]  inertia: 341.0227',
  '[iter 037]  inertia: 214.8719',
  '[iter 052]  converged  Δ < 1e-4',
  '$ pca --components 3',
  'explained variance: 87.3%',
  'projection: live · fig. 01',
];

export default function Site() {
  const setMouse = useStore((s) => s.setMouse);
  const setScroll = useStore((s) => s.setScroll);

  // Native scroll stays; "smooth physics" live in the canvas, which chases
  // scroll/cursor with damped inertia rather than hijacking the scrollbar.
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScroll(window.scrollY, max > 0 ? window.scrollY / max : 0);
    };
    const onMove = (e: MouseEvent) => {
      setMouse((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('mousemove', onMove);
    };
  }, [setScroll, setMouse]);

  return (
    <div className="relative min-h-screen">
      <HalftoneCanvas />
      <div className="grain pointer-events-none fixed inset-0 z-[60]" />

      {/* Masthead */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-ink bg-paper/90 backdrop-blur-sm">
        <div className="flex items-stretch justify-between text-[11px] uppercase tracking-widest">
          <span className="border-r border-ink px-4 py-3 font-bold">Tushit Kumar — Field Notes</span>
          <nav className="flex items-stretch">
            {[
              ['Visuals', '#visuals'],
              ['Systems', '#systems'],
              ['Contact', '#contact'],
            ].map(([label, href]) => (
              <HoverLink
                key={href}
                href={href}
                className="flex items-center border-l border-ink px-4 no-underline"
              >
                {label}
              </HoverLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl border-x border-ink">
        {/* ---- Hero ---- */}
        <section className="grid grid-cols-12 border-b border-ink pt-24 md:pt-28">
          <div className="col-span-12 border-b border-ink px-4 py-2 text-[11px] uppercase tracking-widest md:col-span-8 md:border-r">
            Iteration № 047 — structural build tracking
          </div>
          <div className="col-span-12 flex items-center justify-between px-4 py-2 text-[11px] uppercase tracking-widest md:col-span-4 md:border-b md:border-ink">
            <span>Vol. 01</span>
            <span className="text-accent">●</span>
            <span>2026</span>
          </div>

          <h1 className="col-span-12 border-b border-ink px-4 py-8 font-serif text-[13vw] font-black leading-[0.85] md:col-span-9 md:border-r md:text-[9vw]">
            <Reveal>Structural</Reveal>
            <Reveal delay={0.08}>
              Iterations<span className="text-accent">.</span>
            </Reveal>
          </h1>
          <aside className="col-span-12 flex flex-col justify-between gap-6 border-b border-ink px-4 py-6 text-[11px] uppercase leading-relaxed tracking-widest md:col-span-3">
            <p>
              Tushit Kumar
              <br />
              Design × Engineering
              <br />
              Thapar University, Patiala
            </p>
            <p className="text-right">
              Set on #F4F1EA
              <br />
              Ink coverage: variable
            </p>
          </aside>

          <div className="col-span-12 overflow-hidden whitespace-nowrap px-0 py-2 text-[11px] uppercase tracking-[0.3em]">
            {Array.from({ length: 8 })
              .map(() => 'Design × Engineering × Caffeine — ')
              .join('')}
          </div>
        </section>

        {/* ---- Section 01: the visualization ---- */}
        <section id="visuals" className="grid grid-cols-12 border-b border-t border-ink">
          <div className="col-span-12 border-b border-ink px-4 py-3">
            <h2 className="font-serif text-3xl font-black md:text-5xl">
              <Reveal>01 — Algorithmic Visualizations</Reveal>
            </h2>
          </div>

          {/* Technical log rail */}
          <div className="col-span-12 border-b border-ink px-4 py-6 text-xs leading-loose md:col-span-4 md:border-b-0 md:border-r">
            {LOG_LINES.map((line, i) => (
              <motion.p
                key={line}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.12 }}
                className={line.startsWith('$') ? 'font-bold' : 'pl-4'}
              >
                {line}
              </motion.p>
            ))}
            <p className="mt-6 border-t border-ink pt-4 text-[11px] uppercase tracking-widest">
              Fig. 01 — K-means cluster, live projection.
              <br />
              Move the cursor. Scroll. Hover any link.
            </p>
          </div>

          {/* Deliberately sparse cell: the canvas performs here. */}
          <div className="relative col-span-12 min-h-[70vh] md:col-span-8">
            <span className="absolute right-4 top-4 text-[11px] uppercase tracking-widest">
              K=5 · N=2,4xx · σ per cluster
            </span>
            <span className="absolute bottom-4 left-4 text-[11px] uppercase tracking-widest">
              Dot ø ∝ local density
            </span>
          </div>
        </section>

        {/* ---- Section 02: newspaper columns ---- */}
        <section id="systems" className="border-b border-ink">
          <div className="border-b border-ink px-4 py-3">
            <h2 className="font-serif text-3xl font-black md:text-5xl">
              <Reveal>02 — System Architecture &amp; Strategy</Reveal>
            </h2>
          </div>
          <div className="newsprint-cols gap-8 px-4 py-8 text-sm leading-relaxed md:columns-3">
            <h3 className="font-serif text-xl font-black">The Pipeline</h3>
            <p className="mt-2">
              Every project here moves through the same press: a sketch becomes a schema, the
              schema becomes a system, and the system gets thrown at real users until the soft
              parts show. Nothing ships on vibes; everything ships with a rollback plan.
            </p>
            <p className="mt-4">
              The stack stays boring on purpose — typed end to end, tested where it hurts, and
              instrumented so the graphs confess before the users complain.
            </p>

            <h3 className="mt-8 font-serif text-xl font-black">Revenue Engineering</h3>
            <p className="mt-2">
              Performance budgets are treated like invoices: a slow route is a leak, a heavy
              bundle is a tax. Cutting 400ms off first paint has paid better than most feature
              launches, and it never asks for a meeting.
            </p>
            <p className="mt-4">
              The rule of thumb printed above the desk: measure, cut, and only then decorate.
            </p>

            <h3 className="mt-8 font-serif text-xl font-black">Failure Budget</h3>
            <p className="mt-2">
              A fixed share of every semester is spent on experiments expected to fail —
              shaders, weird input models, half-baked simulations. The failures compost into
              the next iteration; this page is built from that compost.
            </p>
            <p className="mt-4 border-l-2 border-accent pl-3 font-serif text-lg font-bold italic">
              “Print the system, read the smudges, reprint.”
            </p>
          </div>
        </section>

        {/* ---- Contact ---- */}
        <section id="contact" className="grid grid-cols-12">
          <div className="col-span-12 px-4 py-10 md:col-span-8 md:border-r md:border-ink">
            <h2 className="font-serif text-[10vw] font-black leading-none md:text-7xl">
              <Reveal>
                Write in<span className="text-accent">*</span>
              </Reveal>
            </h2>
            <p className="mt-4 text-sm">
              <HoverLink href="mailto:tushit.jalan@gmail.com">tushit.jalan@gmail.com</HoverLink>
            </p>
          </div>
          <div className="col-span-12 flex flex-col justify-end gap-2 px-4 py-6 text-[11px] uppercase leading-relaxed tracking-widest md:col-span-4">
            <p>*Letters to the editor welcome.</p>
            <p>
              <HoverLink href="https://github.com" external>
                GitHub
              </HoverLink>{' '}
              ·{' '}
              <HoverLink href="https://linkedin.com" external>
                LinkedIn
              </HoverLink>
            </p>
          </div>
          <footer className="col-span-12 flex flex-wrap items-center justify-between gap-2 border-t border-ink px-4 py-3 text-[10px] uppercase tracking-widest">
            <span>© 2026 Tushit Kumar</span>
            <span>Set in Playfair &amp; Space Mono</span>
            <span>Printed on #F4F1EA · № 001</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
