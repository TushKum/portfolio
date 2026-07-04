'use client';

import { useCursorHover } from '@/store/cursor';
import { useSceneStore } from '@/store/scene';

/**
 * The giant lowercase 'x' that closes an open project. The modal is anchored
 * in 3D, but its chrome is really screen-space — a fixed DOM button.
 */
export default function CloseProjectButton() {
  const openProject = useSceneStore((s) => s.openProject);
  const setOpenProject = useSceneStore((s) => s.setOpenProject);
  const setScene = useSceneStore((s) => s.setScene);
  const { startHover, stopHover } = useCursorHover('close-project');

  if (openProject === null) return null;

  return (
    <button
      type="button"
      aria-label="Close project"
      onMouseEnter={startHover}
      onMouseLeave={stopHover}
      onClick={() => {
        stopHover();
        setOpenProject(null);
        setScene('projects');
      }}
      className="fixed left-[2vw] top-[0.5vw] z-[70] font-mono uppercase text-white transition-transform duration-200 hover:scale-125"
      style={{ fontSize: 'max(35px, 6vw)', lineHeight: 1 }}
    >
      x
    </button>
  );
}
