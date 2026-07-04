'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import CTA from '@/components/CTA';
import CloseProjectButton from '@/components/CloseProjectButton';
import CustomCursor from '@/components/CustomCursor';

// WebGL never renders on the server; a CSS spinner holds the fort.
const ThreeCanvas = dynamic(() => import('@/components/ThreeCanvas'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue border-t-[transparent]" />
    </div>
  ),
});

/**
 * The page never scrolls — the world is navigated by moving the camera.
 * Height comes from a JS-maintained --vh var so mobile browser chrome
 * doesn't lie about the viewport.
 */
export default function App() {
  useEffect(() => {
    const setVh = () =>
      document.documentElement.style.setProperty('--vh', `${window.innerHeight / 100}px`);
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  return (
    <main className="relative w-screen overflow-hidden" style={{ height: 'calc(100 * var(--vh, 1vh))' }}>
      <ThreeCanvas />
      <CTA />
      <CloseProjectButton />
      <CustomCursor />
    </main>
  );
}
