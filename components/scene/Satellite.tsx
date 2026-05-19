"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SatelliteProps {
  label: string;
  url: string;
  transmission: string;
  orbitRadius: number;
  speed: number;
  startAngle: number;
  color: string;
  centerX: number;
  centerY: number;
}

export function Satellite({
  label,
  url,
  transmission,
  orbitRadius,
  speed,
  startAngle,
  color,
  centerX,
  centerY,
}: SatelliteProps) {
  const [hovered, setHovered] = useState(false);
  const [angle, setAngle] = useState(startAngle);
  const animRef = useRef<number>(0);

  useEffect(() => {
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setAngle((a) => a + speed * dt);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [speed]);

  const x = centerX + Math.cos(angle) * orbitRadius;
  const y = centerY + Math.sin(angle) * orbitRadius * 0.45;

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="absolute cursor-pointer select-none"
      style={{
        left: x - 8,
        top: y - 8,
        zIndex: 35,
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Body */}
      <div className="relative w-4 h-4">
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-sm blur-sm transition-opacity duration-300"
          style={{
            background: color,
            opacity: hovered ? 0.8 : 0.3,
            transform: "scale(2)",
          }}
        />

        {/* Satellite body */}
        <div
          className="absolute inset-0 rounded-sm transition-all duration-300"
          style={{
            background: color,
            boxShadow: hovered ? `0 0 10px ${color}` : `0 0 4px ${color}60`,
          }}
        />

        {/* Wings */}
        <div
          className="absolute top-[6px] -left-[5px] w-[4px] h-[4px] rounded-sm"
          style={{ background: `${color}80` }}
        />
        <div
          className="absolute top-[6px] -right-[5px] w-[4px] h-[4px] rounded-sm"
          style={{ background: `${color}80` }}
        />
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 glass rounded-md px-3 py-2 text-center whitespace-nowrap pointer-events-none"
            style={{ bottom: 28 }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
          >
            <p className="text-[10px] text-secondary font-mono">
              Transmission detected
            </p>
            <p className="text-xs font-semibold text-primary mt-0.5">
              {label}
            </p>
            <p className="text-[10px]" style={{ color }}>
              {transmission}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.a>
  );
}
