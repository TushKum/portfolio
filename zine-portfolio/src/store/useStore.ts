import { create } from 'zustand';

interface ZineStore {
  /** Pointer position normalized to [-1, 1], +y up. */
  mouse: { x: number; y: number };
  scrollY: number;
  /** Page scroll progress in [0, 1]. */
  scrollProgress: number;
  /** True while any interactive HTML element is hovered — the canvas reads
   * this to swell/agitate the halftone cluster. */
  linkHover: boolean;
  setMouse: (x: number, y: number) => void;
  setScroll: (scrollY: number, scrollProgress: number) => void;
  setLinkHover: (hover: boolean) => void;
}

// One store bridging the HTML grid and the WebGL canvas. DOM components
// subscribe with selectors; the canvas reads transiently via getState()
// inside useFrame, so per-frame values never trigger React re-renders.
export const useStore = create<ZineStore>()((set) => ({
  mouse: { x: 0, y: 0 },
  scrollY: 0,
  scrollProgress: 0,
  linkHover: false,
  setMouse: (x, y) => set({ mouse: { x, y } }),
  setScroll: (scrollY, scrollProgress) => set({ scrollY, scrollProgress }),
  setLinkHover: (linkHover) => set({ linkHover }),
}));
