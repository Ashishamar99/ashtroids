/**
 * Procedural asteroid texture generator.
 * Renders a jagged, irregular rocky asteroid — NOT a planet.
 * Uses high-roughness boundary noise, deep craters, and harsh lighting.
 */

interface AsteroidGenOptions {
  size: number;
  seed: number;
  baseColor: [number, number, number];
  craterCount?: number;
  roughness?: number;
  lightAngle?: number;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function noise2D(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 43758.5453) * 43758.5453;
  return n - Math.floor(n);
}

function fbm(x: number, y: number, seed: number, octaves: number): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2D(x * frequency, y * frequency, seed + i * 100);
    amplitude *= 0.5;
    frequency *= 2.2;
  }
  return value;
}

export function generateAsteroidTexture(options: AsteroidGenOptions): string {
  const {
    size,
    seed,
    baseColor,
    craterCount = 12,
    roughness = 1.0,
    lightAngle = -0.8,
  } = options;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const cx = size / 2;
  const cy = size / 2;
  const baseRadius = size * 0.38;
  const rng = seededRandom(seed);

  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  const lightX = Math.cos(lightAngle);
  const lightY = Math.sin(lightAngle);

  // Pre-compute the jagged boundary as a lookup table (angle -> radius)
  const BOUNDARY_SAMPLES = 256;
  const boundaryRadii = new Float32Array(BOUNDARY_SAMPLES);
  for (let i = 0; i < BOUNDARY_SAMPLES; i++) {
    const angle = (i / BOUNDARY_SAMPLES) * Math.PI * 2;
    const ax = Math.cos(angle);
    const ay = Math.sin(angle);

    // Layer multiple noise scales for craggy, irregular shape
    const n1 = fbm(ax * 1.5, ay * 1.5, seed, 3); // large lumps
    const n2 = fbm(ax * 4, ay * 4, seed + 200, 3); // medium bumps
    const n3 = fbm(ax * 9, ay * 9, seed + 500, 2); // fine crag

    const deform = n1 * 0.5 + n2 * 0.25 + n3 * 0.12;
    boundaryRadii[i] = baseRadius * (0.55 + deform * roughness);
  }

  function getRadius(angle: number): number {
    const norm = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const t = (norm / (Math.PI * 2)) * BOUNDARY_SAMPLES;
    const i0 = Math.floor(t) % BOUNDARY_SAMPLES;
    const i1 = (i0 + 1) % BOUNDARY_SAMPLES;
    const frac = t - Math.floor(t);
    return boundaryRadii[i0] * (1 - frac) + boundaryRadii[i1] * frac;
  }

  // Pre-generate craters — more, deeper, varied
  const craters: { cx: number; cy: number; r: number; depth: number }[] = [];
  for (let i = 0; i < craterCount; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = rng() * baseRadius * 0.65;
    craters.push({
      cx: cx + Math.cos(angle) * dist,
      cy: cy + Math.sin(angle) * dist,
      r: 2 + rng() * (size * 0.07),
      depth: 0.4 + rng() * 0.6,
    });
  }

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const edgeR = getRadius(angle);

      if (dist > edgeR + 1) continue;

      // Approximate normal from the irregular surface
      const rPlus = getRadius(angle + 0.05);
      const rMinus = getRadius(angle - 0.05);
      const edgeVariation = (rPlus - rMinus) / (baseRadius * 0.1);

      const nx = dx / edgeR + edgeVariation * 0.3;
      const ny = dy / edgeR;
      const nLen = Math.sqrt(nx * nx + ny * ny + 1);
      const nnx = nx / nLen;
      const nny = ny / nLen;
      const nnz = 1 / nLen;

      // Harsh directional light + weak ambient
      let light = nnx * lightX + nny * lightY + nnz * 0.4;
      light = Math.max(0.03, Math.min(1, light));
      // Boost contrast for rocky feel
      light = Math.pow(light, 1.3);

      // Multi-scale surface noise for rocky grain
      const grain1 = fbm(px * 0.04, py * 0.04, seed, 5);
      const grain2 = fbm(px * 0.12, py * 0.12, seed + 50, 4);
      const grain3 = fbm(px * 0.3, py * 0.3, seed + 120, 3);

      // Crater influence
      let craterShade = 0;
      for (const crater of craters) {
        const cdx = px - crater.cx;
        const cdy = py - crater.cy;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cdist < crater.r * 1.2) {
          const t = cdist / crater.r;
          if (t > 0.85) {
            // Raised rim
            craterShade += (1 - (t - 0.85) / 0.35) * 0.2;
          } else if (t < 0.85) {
            // Dark interior
            craterShade -= crater.depth * (1 - t / 0.85) * 0.4;
          }
          // Directional rim highlight
          const rimNx = cdx / Math.max(crater.r, 1);
          const rimLight = rimNx * lightX + (cdy / Math.max(crater.r, 1)) * lightY;
          if (t > 0.6 && t < 1.0) {
            craterShade += Math.max(0, rimLight) * 0.25;
          }
        }
      }

      const colorNoise = grain1 * 0.25 + grain2 * 0.15 + grain3 * 0.08;
      const totalLight = light + craterShade + colorNoise - 0.15;
      const clamped = Math.max(0.02, Math.min(1, totalLight));

      let r = baseColor[0] * clamped;
      let g = baseColor[1] * clamped;
      let b = baseColor[2] * clamped;

      // Color variation across surface
      r += (grain1 - 0.5) * 20;
      g += (grain2 - 0.5) * 15;
      b += (grain3 - 0.5) * 10;

      // Harsh edge — no soft limb darkening (asteroids aren't atmosphered)
      // Just a sharp falloff at the boundary
      let alpha = 255;
      if (dist > edgeR - 1.5) {
        alpha = Math.max(0, Math.min(255, (edgeR + 0.5 - dist) * 170));
      }

      const idx = (py * size + px) * 4;
      data[idx] = Math.max(0, Math.min(255, r));
      data[idx + 1] = Math.max(0, Math.min(255, g));
      data[idx + 2] = Math.max(0, Math.min(255, b));
      data[idx + 3] = alpha;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

const ASTEROID_BASE_COLORS: Record<string, [number, number, number]> = {
  metallic: [130, 135, 145],
  lava: [140, 80, 50],
  ice: [125, 155, 170],
  glowing: [115, 95, 135],
  rocky: [110, 90, 70],
};

const ASTEROID_CRATER_COUNTS: Record<string, number> = {
  metallic: 10,
  lava: 8,
  ice: 7,
  glowing: 6,
  rocky: 14,
};

export function generateProjectAsteroid(
  slug: string,
  type: string,
  pixelSize: number
): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }

  return generateAsteroidTexture({
    size: pixelSize * 2,
    seed: Math.abs(hash),
    baseColor: ASTEROID_BASE_COLORS[type] || ASTEROID_BASE_COLORS.rocky,
    craterCount: ASTEROID_CRATER_COUNTS[type] || 12,
    roughness: type === "ice" ? 0.7 : type === "metallic" ? 0.8 : 1.0,
    lightAngle: -0.7 + (Math.abs(hash) % 100) / 200,
  });
}
