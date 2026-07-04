'use client';

import { create } from 'zustand';
import { clearAllHovers } from '@/store/cursor';

export type SceneName = 'intro' | 'start' | 'menu' | 'projects' | 'project-open' | 'about';

interface SceneStore {
  scene: SceneName;
  /** Index into PROJECTS while a project is open, else null. */
  openProject: number | null;
  setScene: (scene: SceneName) => void;
  setOpenProject: (index: number | null) => void;
}

// The whole site is one state machine: any component may jump to any scene.
// setScene centralizes the one side effect that matters — clearing cursor
// hover state so a vanishing hoverable can't strand the custom cursor.
export const useSceneStore = create<SceneStore>()((set) => ({
  scene: 'intro',
  openProject: null,
  setScene: (scene) => {
    clearAllHovers();
    set({ scene });
  },
  setOpenProject: (openProject) => set({ openProject }),
}));
