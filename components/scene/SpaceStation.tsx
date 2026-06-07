"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";

interface SpaceStationProps {
  centerX: number;
  centerY: number;
}

export function SpaceStation({ centerX, centerY }: SpaceStationProps) {
  const [hovered, setHovered] = useState(false);
  const setAboutOpen = useStore((s) => s.setAboutOpen);
  const setActiveProjectSlug = useStore((s) => s.setActiveProjectSlug);
  const activeProjectSlug = useStore((s) => s.activeProjectSlug);
  const aboutOpen = useStore((s) => s.aboutOpen);
  const overlayOpen = !!activeProjectSlug || aboutOpen;

  const handleClick = useCallback(() => {
    if (overlayOpen) return;
    setActiveProjectSlug(null);
    setAboutOpen(true);
  }, [setAboutOpen, setActiveProjectSlug, overlayOpen]);

  return (
    <motion.div
      className={`absolute select-none ${overlayOpen ? "cursor-default" : "cursor-pointer"}`}
      style={{
        left: centerX - 30,
        top: centerY - 30,
        zIndex: 35,
      }}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      onHoverStart={() => { if (!overlayOpen) setHovered(true); }}
      onHoverEnd={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(circle, rgba(107,141,181,0.2), transparent 70%)",
          transform: "scale(3)",
          opacity: hovered ? 1 : 0.4,
        }}
      />

      {/* Spinning ring */}
      <motion.div
        className="absolute"
        style={{
          width: 60,
          height: 60,
          left: 0,
          top: 0,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="w-full h-full rounded-full border transition-colors duration-300"
          style={{
            borderColor: hovered
              ? "rgba(107,141,181,0.6)"
              : "rgba(107,141,181,0.2)",
            borderWidth: 1.5,
          }}
        />
      </motion.div>

      {/* Core diamond */}
      <motion.div
        className="absolute"
        style={{
          width: 24,
          height: 24,
          left: 18,
          top: 18,
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <polygon
            points="12,0 24,12 12,24 0,12"
            fill="rgba(74,101,128,0.9)"
            stroke={hovered ? "#6b8db5" : "#4a6580"}
            strokeWidth={1.5}
            style={{
              filter: hovered
                ? "drop-shadow(0 0 8px #6b8db5)"
                : "drop-shadow(0 0 3px #6b8db5)",
              transition: "all 0.3s",
            }}
          />
        </svg>
      </motion.div>

      {/* Point light */}
      <div
        className="absolute w-2 h-2 rounded-full left-[26px] top-[26px] transition-all duration-300"
        style={{
          background: "#6b8db5",
          boxShadow: hovered
            ? "0 0 12px 4px rgba(107,141,181,0.6)"
            : "0 0 6px 2px rgba(107,141,181,0.3)",
        }}
      />

      {/* Hover tooltip */}
      <AnimatePresence>
        {hovered && !overlayOpen && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 glass rounded-lg px-3 py-2 text-center whitespace-nowrap pointer-events-none"
            style={{ bottom: 72 }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
          >
            <p className="text-xs text-accent-glow font-mono">// ABOUT_ASH</p>
            <p className="text-[10px] text-secondary mt-0.5">
              Click to learn more
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
