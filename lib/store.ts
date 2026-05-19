import { create } from "zustand";

export type ViewMode = "orbit" | "recruiter";

interface AshtroidsState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  terminalOpen: boolean;
  setTerminalOpen: (open: boolean) => void;
  toggleTerminal: () => void;

  aboutOpen: boolean;
  setAboutOpen: (open: boolean) => void;

  gameActive: boolean;
  setGameActive: (active: boolean) => void;

  hoveredAsteroid: string | null;
  setHoveredAsteroid: (slug: string | null) => void;

  launchingAsteroid: string | null;
  setLaunchingAsteroid: (slug: string | null) => void;

  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;

  reducedMotion: boolean;
  setReducedMotion: (reduced: boolean) => void;
}

export const useStore = create<AshtroidsState>((set) => ({
  viewMode: "orbit",
  setViewMode: (mode) => set({ viewMode: mode }),

  terminalOpen: false,
  setTerminalOpen: (open) => set({ terminalOpen: open }),
  toggleTerminal: () => set((s) => ({ terminalOpen: !s.terminalOpen })),

  aboutOpen: false,
  setAboutOpen: (open) => set({ aboutOpen: open }),

  gameActive: false,
  setGameActive: (active) => set({ gameActive: active }),

  hoveredAsteroid: null,
  setHoveredAsteroid: (slug) => set({ hoveredAsteroid: slug }),

  launchingAsteroid: null,
  setLaunchingAsteroid: (slug) => set({ launchingAsteroid: slug }),

  isMobile: false,
  setIsMobile: (mobile) => set({ isMobile: mobile }),

  reducedMotion: false,
  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
}));
