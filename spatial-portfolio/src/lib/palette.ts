'use client';

import { useState } from 'react';
import { palettePairs } from '@/lib/colors';
import { useInterval } from '@/lib/hooks';

/** Cycles through the five (bg, text) pairs every `speed` ms. Consumers speed
 * it up on hover (5000ms idle → 400ms strobe). */
export function useChangingPalette(speed: number) {
  const [index, setIndex] = useState(0);
  useInterval(() => setIndex((i) => (i + 1) % palettePairs.length), speed);
  return palettePairs[index];
}
