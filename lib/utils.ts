export function orbitPosition(
  radius: number,
  angle: number,
  tilt: number = 0.15
): [number, number, number] {
  return [
    Math.cos(angle) * radius,
    Math.sin(angle * 0.5) * tilt * radius,
    Math.sin(angle) * radius,
  ];
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
