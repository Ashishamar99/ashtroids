"use client";
import { motion } from "framer-motion";
import { ModeToggle } from "./ModeToggle";
import { useStore } from "@/lib/store";

export function HUD() {
  const toggleTerminal = useStore((s) => s.toggleTerminal);
  const gameActive = useStore((s) => s.gameActive);

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      {/* Top left — Branding */}
      <motion.div
        className="absolute top-6 left-6 pointer-events-auto"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <h1 className="text-lg font-mono font-bold tracking-[0.3em] text-primary">
          ASH-TEROIDS
        </h1>
        <p className="text-[10px] font-mono text-secondary tracking-wider mt-0.5">
          EXPERIMENTS BY ASHISH
        </p>
      </motion.div>

      {/* Top right — Controls */}
      <motion.div
        className="absolute top-6 right-6 flex items-center gap-3 pointer-events-auto"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <ModeToggle />
      </motion.div>

      {/* Bottom left — Hint */}
      <motion.div
        className="absolute bottom-6 left-6 pointer-events-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <button
          onClick={toggleTerminal}
          className="text-[10px] font-mono text-secondary/50 hover:text-secondary transition-colors"
        >
          [`] TERMINAL
        </button>
      </motion.div>

      {/* Bottom right — Navigation hint */}
      <motion.div
        className="absolute bottom-6 right-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        <p className="text-[10px] font-mono text-secondary/30">
          DRAG TO ORBIT · SCROLL TO ZOOM · CLICK TO EXPLORE
        </p>
      </motion.div>

      {/* Game mode indicator */}
      {gameActive && (
        <motion.div
          className="absolute top-6 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="glass rounded-full px-4 py-2">
            <p className="text-xs font-mono text-accent-lava">
              GAME MODE ACTIVE — ESC to exit
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
