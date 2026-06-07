import { create } from "zustand";
import type { Project } from "@/data/projects";

export type ViewMode = "orbit" | "recruiter";

interface AshtroidsState {
  projects: Project[];
  setProjects: (projects: Project[]) => void;

  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  terminalOpen: boolean;
  setTerminalOpen: (open: boolean) => void;
  toggleTerminal: () => void;

  aboutOpen: boolean;
  setAboutOpen: (open: boolean) => void;

  activeProjectSlug: string | null;
  setActiveProjectSlug: (slug: string | null) => void;

  gameActive: boolean;
  setGameActive: (active: boolean) => void;

  hoveredAsteroid: string | null;
  setHoveredAsteroid: (slug: string | null) => void;

  launchingAsteroid: string | null;
  setLaunchingAsteroid: (slug: string | null) => void;

  burstCount: number;
  incrementBurst: () => void;
  resetBursts: () => void;

  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;

  reducedMotion: boolean;
  setReducedMotion: (reduced: boolean) => void;
}

export const useStore = create<AshtroidsState>((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),

  viewMode: "orbit",
  setViewMode: (mode) => set({ viewMode: mode }),

  terminalOpen: false,
  setTerminalOpen: (open) => set({ terminalOpen: open }),
  toggleTerminal: () => set((s) => ({ terminalOpen: !s.terminalOpen })),

  aboutOpen: false,
  setAboutOpen: (open) => set({ aboutOpen: open }),

  activeProjectSlug: null,
  setActiveProjectSlug: (slug) => set({ activeProjectSlug: slug }),

  gameActive: false,
  setGameActive: (active) => set({ gameActive: active }),

  hoveredAsteroid: null,
  setHoveredAsteroid: (slug) => set({ hoveredAsteroid: slug }),

  launchingAsteroid: null,
  setLaunchingAsteroid: (slug) => set({ launchingAsteroid: slug }),

  burstCount: 0,
  incrementBurst: () => set((s) => ({ burstCount: s.burstCount + 1 })),
  resetBursts: () => set({ burstCount: 0 }),

  isMobile: false,
  setIsMobile: (mobile) => set({ isMobile: mobile }),

  reducedMotion: false,
  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
}));
