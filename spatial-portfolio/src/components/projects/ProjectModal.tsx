'use client';

import { useEffect } from 'react';
import { Html } from '@react-three/drei';
import { type Project } from '@/components/projects/data';
import { useAspect } from '@/lib/hooks';

/**
 * The open project's case study, anchored in 3D next to the cube. While open,
 * the page body tints to the project color (body already transitions
 * background-color over 1s), so the white copy floats on project color.
 */
export default function ProjectModal({ project }: { project: Project }) {
  const aspect = useAspect();
  const wide = aspect >= 1;

  useEffect(() => {
    document.body.style.background = project.color;
    return () => {
      document.body.style.background = '';
    };
  }, [project]);

  return (
    <group position={wide ? [-1.6, 0, 4.5] : [0, -0.6, 4.5]}>
      <Html center zIndexRange={[40, 30]}>
        <div
          className="pointer-events-auto select-text font-mono text-white"
          style={{ width: wide ? 'min(45vw, 450px)' : '94vw', height: wide ? '80vh' : '52vh' }}
        >
          <div className="no-scrollbar h-full overflow-y-auto pr-[1em]">
            <h1 className="font-bold leading-tight" style={{ fontSize: 'clamp(28px, 5vw, 72px)' }}>
              {project.title}
            </h1>
            <p className="mt-2 text-lg">{project.subtitle}</p>
            <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 border-y-2 border-white/40 py-3 text-sm uppercase">
              <dt className="opacity-70">Client</dt>
              <dd>{project.client}</dd>
              <dt className="opacity-70">Role</dt>
              <dd>{project.role}</dd>
              <dt className="opacity-70">Stack</dt>
              <dd>{project.stack}</dd>
              <dt className="opacity-70">Year</dt>
              <dd>{project.year}</dd>
            </dl>
            {project.body.map((paragraph) => (
              <p key={paragraph} className="mt-5 leading-relaxed">
                {paragraph}
              </p>
            ))}
            <a
              href="mailto:tushit.jalan@gmail.com"
              className="mt-8 mb-10 inline-block border-2 border-white px-5 py-3 uppercase transition-colors hover:bg-white hover:text-black"
            >
              Want one of these? Say hi →
            </a>
          </div>
        </div>
      </Html>
    </group>
  );
}
