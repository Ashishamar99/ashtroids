export const ORBIT_RADII = {
  inner: 6,
  mid: 10,
  deep: 15,
} as const;

export const ORBIT_SPEEDS = {
  inner: 0.08,
  mid: 0.05,
  deep: 0.02,
} as const;

export const ASTEROID_COLORS = {
  metallic: { base: "#8a9bae", emissive: "#4a6580", glow: "#6b8db5" },
  lava: { base: "#c44b2f", emissive: "#ff4500", glow: "#ff6b35" },
  ice: { base: "#7ec8e3", emissive: "#00bfff", glow: "#40e0ff" },
  glowing: { base: "#7b5ea7", emissive: "#9b59b6", glow: "#c77dff" },
  rocky: { base: "#6b5b4f", emissive: "#4a3728", glow: "#8b7355" },
} as const;

export const ASTEROID_SIZES = {
  1: 0.2,
  2: 0.35,
  3: 0.5,
  4: 0.7,
  5: 0.9,
} as const;

export const CAMERA_DEFAULTS = {
  position: [0, 8, 18] as [number, number, number],
  fov: 60,
  near: 0.1,
  far: 200,
  minDistance: 5,
  maxDistance: 35,
  autoRotateSpeed: 0.3,
};

export const SCENE_COLORS = {
  background: "#030014",
  orbitRing: "#1a1a3e",
  starField: "#ffffff",
  ambientLight: "#1a1a2e",
  pointLight: "#ffeedd",
};
