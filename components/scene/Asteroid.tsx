"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Project } from "@/data/projects";
import { ASTEROID_COLORS, ORBIT_RADII, ORBIT_SPEEDS } from "@/lib/constants";
import { useStore } from "@/lib/store";

interface AsteroidProps {
  project: Project;
  index: number;
  totalInOrbit: number;
  centerX: number;
  centerY: number;
  zoom: number;
}

const ASTEROID_PX_SIZES: Record<number, number> = {
  1: 28,
  2: 40,
  3: 55,
  4: 72,
  5: 90,
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
  const [angle, setAngle] = useState(
    () => (index / totalInOrbit) * Math.PI * 2
  );
  const animRef = useRef<number>(0);
  const router = useRouter();
  const setHoveredAsteroid = useStore((s) => s.setHoveredAsteroid);

  const colors = ASTEROID_COLORS[project.asteroidType];
  const size = ASTEROID_PX_SIZES[project.size] || 55;
  const orbitRadius = ORBIT_RADII[project.orbit] * 40 * zoom;
  const speed = ORBIT_SPEEDS[project.orbit];

  useEffect(() => {
    if (launching) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setAngle((a) => a + speed * dt);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [speed, launching]);

  const wobble = Math.sin(angle * 2 + index) * 6;
  const x = centerX + Math.cos(angle) * orbitRadius;
  const y = centerY + Math.sin(angle) * orbitRadius * 0.45 + wobble;

  const handleClick = useCallback(() => {
    if (project.orbit === "deep") {
      router.push("/signals");
      return;
    }
    setLaunching(true);
    setTimeout(() => {
      router.push(`/projects/${project.slug}`);
    }, 700);
  }, [project, router]);

  const handleHoverStart = useCallback(() => {
    setHovered(true);
    setHoveredAsteroid(project.slug);
  }, [project.slug, setHoveredAsteroid]);

  const handleHoverEnd = useCallback(() => {
    setHovered(false);
    setHoveredAsteroid(null);
  }, [setHoveredAsteroid]);

  const rotation = (angle * 180) / Math.PI;

  return (
    <motion.div
      className="absolute cursor-pointer select-none"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        zIndex: hovered ? 50 : Math.round(y),
      }}
      animate={
        launching
          ? {
              scale: [1, 1.5, 3],
              opacity: [1, 1, 0],
              x: [0, 0, window.innerWidth / 2 - x],
              y: [0, 0, window.innerHeight / 2 - y],
            }
          : { scale: 1, opacity: 1 }
      }
      transition={
        launching
          ? { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
          : { duration: 0.3 }
      }
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={handleClick}
    >
      {/* Main asteroid body */}
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
        animate={{
          rotate: launching ? rotation + 720 : rotation,
        }}
        transition={
          launching
            ? { duration: 0.7 }
            : { duration: 0, type: false }
        }
      >
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-full blur-md transition-opacity duration-300"
          style={{
            background: colors.glow,
            opacity: hovered ? 0.5 : 0.15,
            transform: "scale(1.4)",
          }}
        />

        {/* Body */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full drop-shadow-lg"
        >
          <polygon
            points={getAsteroidShape(project.slug)}
            fill={colors.base}
            stroke={hovered ? colors.glow : colors.emissive}
            strokeWidth={hovered ? 2 : 1}
            style={{
              filter: hovered
                ? `drop-shadow(0 0 6px ${colors.glow})`
                : "none",
              transition: "all 0.3s",
            }}
          />
        </svg>

        {/* Ember particles for lava type */}
        {project.asteroidType === "lava" && (
          <div className="absolute inset-0">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full animate-float"
                style={{
                  background: colors.glow,
                  left: `${30 + i * 20}%`,
                  top: `${20 + i * 15}%`,
                  animationDelay: `${i * 0.5}s`,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
        )}

        {/* Glowing core for experimental */}
        {project.asteroidType === "glowing" && (
          <div
            className="absolute rounded-full animate-pulse-glow"
            style={{
              width: "40%",
              height: "40%",
              left: "30%",
              top: "30%",
              background: `radial-gradient(circle, ${colors.glow}80, transparent)`,
            }}
          />
        )}
      </motion.div>

      {/* Hover info card */}
      <AnimatePresence>
        {hovered && !launching && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 glass rounded-lg px-4 py-3 min-w-[200px] text-center pointer-events-none whitespace-nowrap"
            style={{ bottom: size + 12 }}
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

      {/* Label below */}
      <p
        className="absolute left-1/2 -translate-x-1/2 text-[10px] font-mono text-secondary/50 whitespace-nowrap transition-colors duration-300"
        style={{
          top: size + 4,
          color: hovered ? colors.glow : undefined,
        }}
      >
        {project.title}
      </p>

      {/* Launch trail effect */}
      {launching && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          initial={{ width: size, height: size, opacity: 0.8 }}
          animate={{ width: size * 4, height: size * 4, opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: `radial-gradient(circle, ${colors.glow}, transparent)`,
          }}
        />
      )}
    </motion.div>
  );
}

function getAsteroidShape(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const points = 8;
  const coords: string[] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const rng = Math.abs(Math.sin(hash * (i + 1) * 0.1)) * 0.25;
    const r = 35 + rng * 30;
    const cx = 50 + Math.cos(angle) * r;
    const cy = 50 + Math.sin(angle) * r;
    coords.push(`${cx.toFixed(1)},${cy.toFixed(1)}`);
  }
  return coords.join(" ");
}
