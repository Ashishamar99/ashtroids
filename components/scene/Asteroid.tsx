"use client";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Project } from "@/data/projects";
import { ASTEROID_COLORS, ORBIT_RADII, ORBIT_SPEEDS } from "@/lib/constants";
import { useStore } from "@/lib/store";
import { generateProjectAsteroid } from "@/lib/asteroidGenerator";

interface AsteroidProps {
  project: Project;
  index: number;
  totalInOrbit: number;
  centerX: number;
  centerY: number;
  zoom: number;
}

const ASTEROID_PX_SIZES: Record<number, number> = {
  1: 22,
  2: 32,
  3: 44,
  4: 58,
  5: 72,
};

export function Asteroid({
  project,
  index,
  totalInOrbit,
  centerX,
  centerY,
  zoom,
}: AsteroidProps) {
  const [hovered, setHovered] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [textureUrl, setTextureUrl] = useState<string | null>(null);

  const posRef = useRef({ angle: (index / totalInOrbit) * Math.PI * 2, rot: Math.random() * 360 });
  const [pos, setPos] = useState({ x: 0, y: 0, rot: 0 });
  const animRef = useRef<number>(0);
  const router = useRouter();
  const setHoveredAsteroid = useStore((s) => s.setHoveredAsteroid);

  const colors = ASTEROID_COLORS[project.asteroidType];
  const size = ASTEROID_PX_SIZES[project.size] || 64;
  const orbitRadius = ORBIT_RADII[project.orbit] * 40 * zoom;
  const speed = ORBIT_SPEEDS[project.orbit];

  // Unique tumble speed per asteroid
  const tumbleSpeed = useMemo(() => {
    let h = 0;
    for (let i = 0; i < project.slug.length; i++) {
      h = (h << 5) - h + project.slug.charCodeAt(i);
    }
    return 3 + (Math.abs(h) % 15);
  }, [project.slug]);

  // Generate texture on mount
  useEffect(() => {
    const url = generateProjectAsteroid(
      project.slug,
      project.asteroidType,
      size
    );
    setTextureUrl(url);
  }, [project.slug, project.asteroidType, size]);

  // Orbit + tumble animation loop
  useEffect(() => {
    if (launching) return;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const p = posRef.current;
      p.angle += speed * dt;
      p.rot += tumbleSpeed * dt;

      const wobbleX = Math.sin(p.angle * 3 + index * 2) * 4;
      const wobbleY = Math.cos(p.angle * 2.3 + index * 1.7) * 6;

      setPos({
        x: centerX + Math.cos(p.angle) * orbitRadius + wobbleX,
        y: centerY + Math.sin(p.angle) * orbitRadius * 0.45 + wobbleY,
        rot: p.rot,
      });

      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [speed, launching, orbitRadius, centerX, centerY, index, tumbleSpeed]);

  const handleClick = useCallback(() => {
    if (project.orbit === "deep") {
      router.push("/signals");
      return;
    }
    setLaunching(true);
    setTimeout(() => router.push(`/projects/${project.slug}`), 750);
  }, [project, router]);

  const handleHoverStart = useCallback(() => {
    setHovered(true);
    setHoveredAsteroid(project.slug);
  }, [project.slug, setHoveredAsteroid]);

  const handleHoverEnd = useCallback(() => {
    setHovered(false);
    setHoveredAsteroid(null);
  }, [setHoveredAsteroid]);

  if (!textureUrl) return null;

  return (
    <motion.div
      className="absolute cursor-pointer select-none"
      style={{
        left: pos.x - size / 2,
        top: pos.y - size / 2,
        zIndex: hovered ? 50 : Math.round(pos.y),
      }}
      animate={
        launching
          ? {
              scale: [1, 1.3, 0.2],
              opacity: [1, 1, 0],
              x: [0, 0, window.innerWidth / 2 - pos.x],
              y: [0, 0, window.innerHeight / 2 - pos.y],
              filter: [
                "brightness(1)",
                "brightness(2.5)",
                "brightness(4)",
              ],
            }
          : {}
      }
      transition={
        launching
          ? { duration: 0.75, ease: [0.22, 1, 0.36, 1] }
          : undefined
      }
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={handleClick}
    >
      {/* Subtle highlight on hover — no atmospheric glow (asteroids have no atmosphere) */}
      {hovered && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            transform: "scale(1.3)",
            background: `radial-gradient(circle, ${colors.glow}18, transparent 70%)`,
          }}
        />
      )}

      {/* The asteroid texture (rotating) */}
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          transform: `rotate(${pos.rot}deg)`,
          willChange: "transform",
        }}
      >
        <img
          src={textureUrl}
          alt={project.title}
          className="w-full h-full"
          style={{
            filter: hovered
              ? `drop-shadow(0 0 8px ${colors.glow}) brightness(1.15)`
              : "brightness(0.95)",
            transition: "filter 0.3s",
          }}
          draggable={false}
        />
      </div>

      {/* Hover info card */}
      <AnimatePresence>
        {hovered && !launching && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 glass rounded-lg px-4 py-3 min-w-[220px] text-center pointer-events-none"
            style={{ bottom: size + 16 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-sm font-semibold text-primary">
              {project.title}
            </h3>
            <p className="text-xs text-secondary mt-1">{project.tagline}</p>
            {project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 justify-center">
                {project.techStack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-accent-glow"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label */}
      <p
        className="absolute left-1/2 -translate-x-1/2 text-[10px] font-mono whitespace-nowrap transition-all duration-300"
        style={{
          top: size + 6,
          color: hovered ? colors.glow : "rgba(138,134,160,0.4)",
          textShadow: hovered ? `0 0 8px ${colors.glow}60` : "none",
        }}
      >
        {project.title}
      </p>

      {/* Launch burst */}
      {launching && (
        <>
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            initial={{ width: size, height: size, opacity: 0.9 }}
            animate={{ width: size * 5, height: size * 5, opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              background: `radial-gradient(circle, ${colors.glow}, ${colors.emissive}40, transparent)`,
            }}
          />
          {/* Debris particles */}
          {[...Array(6)].map((_, i) => {
            const pAngle = (i / 6) * Math.PI * 2;
            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 3,
                  height: 3,
                  background: colors.glow,
                  left: size / 2,
                  top: size / 2,
                }}
                initial={{ opacity: 0.8 }}
                animate={{
                  x: Math.cos(pAngle) * 60,
                  y: Math.sin(pAngle) * 60,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
            );
          })}
        </>
      )}
    </motion.div>
  );
}
