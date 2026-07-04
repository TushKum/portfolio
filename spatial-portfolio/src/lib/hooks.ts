'use client';

import { useEffect, useRef, useState } from 'react';

/** Flips to true once, `ms` after mount. The whole site's choreography is
 * built from ladders of these (`let t = 450; useTrueAfterDelay(t += 1000)`). */
export function useTrueAfterDelay(ms: number) {
  const [value, setValue] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setValue(true), ms);
    return () => clearTimeout(timer);
  }, [ms]);
  return value;
}

/** True `delay` ms after `value` becomes true; false immediately when it
 * drops. Used to debounce hover-ins without delaying hover-outs. */
export function useDelayedBoolean(value: boolean, delay: number) {
  const [delayed, setDelayed] = useState(false);
  useEffect(() => {
    if (!value) {
      setDelayed(false);
      return;
    }
    const timer = setTimeout(() => setDelayed(true), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return delayed;
}

export function useInterval(callback: () => void, ms: number | null) {
  const saved = useRef(callback);
  saved.current = callback;
  useEffect(() => {
    if (ms === null) return;
    const timer = setInterval(() => saved.current(), ms);
    return () => clearInterval(timer);
  }, [ms]);
}

/** Window aspect ratio; breakpoints here are aspect-based, not width-based:
 * wide layouts kick in at aspect >= 1, the projects ring at >= 0.8. */
export function useAspect() {
  const [aspect, setAspect] = useState(1.5);
  useEffect(() => {
    const update = () => setAspect(window.innerWidth / window.innerHeight);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return aspect;
}

/** SSR-safe tri-state: null before mount, then whether a fine pointer exists. */
export function useHasMouse() {
  const [hasMouse, setHasMouse] = useState<boolean | null>(null);
  useEffect(() => {
    const query = window.matchMedia('(pointer: fine)');
    const update = () => setHasMouse(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return hasMouse;
}
