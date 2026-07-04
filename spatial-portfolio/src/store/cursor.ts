'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

export type CursorKind =
  | 'default'
  | 'power-on'
  | 'terminal'
  | 'spill'
  | 'unspill'
  | 'open-project'
  | 'close-project'
  | 'contact'
  | 'external'
  | 'paint'
  | 'none';

// Vanilla store so it is reachable from both DOM components and code inside
// the R3F reconciler (and from the scene store's setScene side effect).
// Hovers are a Map keyed by per-component Symbols with last-inserted-wins
// semantics: overlapping hoverables behave like a stack instead of fighting.
const cursorStore = createStore<{ hovers: Map<symbol, CursorKind> }>(() => ({
  hovers: new Map(),
}));

export function startHoverRaw(key: symbol, cursor: CursorKind) {
  const hovers = new Map(cursorStore.getState().hovers);
  hovers.delete(key); // re-insert so this key moves to the end (wins)
  hovers.set(key, cursor);
  cursorStore.setState({ hovers });
}

export function stopHoverRaw(key: symbol) {
  const hovers = new Map(cursorStore.getState().hovers);
  hovers.delete(key);
  cursorStore.setState({ hovers });
}

/** Called on every scene change so cursor states never leak across scenes. */
export function clearAllHovers() {
  cursorStore.setState({ hovers: new Map() });
}

export function useActiveCursor(): CursorKind {
  return useStore(cursorStore, (s) => {
    let last: CursorKind = 'default';
    s.hovers.forEach((v) => {
      last = v;
    });
    return last;
  });
}

/** startHover/stopHover closures bound to a Symbol unique to this component.
 * Stops hovering on unmount so a removed element can't strand the cursor. */
export function useCursorHover(cursor: CursorKind) {
  const key = useMemo(() => Symbol('cursor-hover'), []);
  useEffect(() => () => stopHoverRaw(key), [key]);
  return {
    startHover: useCallback(() => startHoverRaw(key, cursor), [key, cursor]),
    stopHover: useCallback(() => stopHoverRaw(key), [key]),
  };
}
