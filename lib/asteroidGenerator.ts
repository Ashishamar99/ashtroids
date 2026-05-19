/**
 * Procedural asteroid texture generator.
 * Renders a realistic-looking rocky asteroid onto an offscreen canvas
 * with craters, surface noise, directional lighting, and shadow.
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
    frequency *= 2;
  }
  return value;
}

export function generateAsteroidTexture(options: AsteroidGenOptions): string {
  const {
    size,
    seed,
    baseColor,
    craterCount = 8,
    roughness = 0.6,
    lightAngle = -0.8,
  } = options;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.42;
  const rng = seededRandom(seed);

  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  const lightX = Math.cos(lightAngle);
  const lightY = Math.sin(lightAngle);

  // Irregular shape boundary using noise
  function getRadius(angle: number): number {
    const n = fbm(
      Math.cos(angle) * 2,
      Math.sin(angle) * 2,
      seed,
      4
    );
    return radius * (0.75 + n * roughness * 0.5);
  }

  // Pre-generate craters
  const craters: { cx: number; cy: number; r: number; depth: number }[] = [];
  for (let i = 0; i < craterCount; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = rng() * radius * 0.7;
    craters.push({
      cx: cx + Math.cos(angle) * dist,
      cy: cy + Math.sin(angle) * dist,
      r: 3 + rng() * (size * 0.08),
      depth: 0.3 + rng() * 0.5,
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

      // Normal of the sphere for lighting
      const nx = dx / edgeR;
      const ny = dy / edgeR;
      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));

      // Diffuse lighting
      let light = nx * lightX + ny * lightY + nz * 0.6;
      light = Math.max(0.08, Math.min(1, light));

      // Surface noise for rocky texture
      const surfaceNoise = fbm(px * 0.05, py * 0.05, seed, 5);
      const detailNoise = fbm(px * 0.15, py * 0.15, seed + 50, 3);

      // Crater influence
      let craterShade = 0;
      for (const crater of craters) {
        const cdx = px - crater.cx;
        const cdy = py - crater.cy;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cdist < crater.r) {
          const t = cdist / crater.r;
          // Crater rim is bright, inside is dark
          if (t > 0.7) {
            craterShade += (1 - (t - 0.7) / 0.3) * 0.15;
          } else {
            craterShade -= crater.depth * (1 - t / 0.7) * 0.3;
          }
          // Crater rim highlight on light side
          const rimNx = cdx / crater.r;
          const rimLight = rimNx * lightX + (cdy / crater.r) * lightY;
          if (t > 0.6 && t < 0.9) {
            craterShade += Math.max(0, rimLight) * 0.2;
          }
        }
      }

      const colorVariation = surfaceNoise * 0.3 + detailNoise * 0.15;
      const totalLight = light + craterShade + colorVariation - 0.2;
      const clamped = Math.max(0.05, Math.min(1, totalLight));

      let r = baseColor[0] * clamped;
      let g = baseColor[1] * clamped;
      let b = baseColor[2] * clamped;

      // Subtle color variation across the surface
      r += (surfaceNoise - 0.5) * 15;
      g += (surfaceNoise - 0.5) * 10;
      b += (detailNoise - 0.5) * 8;

      // Edge darkening (limb darkening)
      const edgeFade = dist / edgeR;
      if (edgeFade > 0.85) {
        const fade = 1 - (edgeFade - 0.85) / 0.15;
        r *= fade;
        g *= fade;
        b *= fade;
      }

      // Anti-aliased edge
      let alpha = 255;
      if (dist > edgeR - 1) {
        alpha = Math.max(0, Math.min(255, (edgeR + 1 - dist) * 128));
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

// Asteroid color palettes matching the types
const ASTEROID_BASE_COLORS: Record<string, [number, number, number]> = {
  metallic: [145, 155, 170],
  lava: [160, 90, 60],
  ice: [140, 180, 200],
  glowing: [130, 110, 160],
  rocky: [120, 100, 80],
};

const ASTEROID_CRATER_COUNTS: Record<string, number> = {
  metallic: 6,
  lava: 4,
  ice: 5,
  glowing: 3,
  rocky: 10,
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
    size: pixelSize * 2, // 2x for retina
    seed: Math.abs(hash),
    baseColor: ASTEROID_BASE_COLORS[type] || ASTEROID_BASE_COLORS.rocky,
    craterCount: ASTEROID_CRATER_COUNTS[type] || 8,
    roughness: type === "ice" ? 0.3 : type === "metallic" ? 0.4 : 0.6,
    lightAngle: -0.7 + (Math.abs(hash) % 100) / 200,
  });
}
