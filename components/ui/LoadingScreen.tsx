"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "ready" | "done">("loading");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 15 + 5;
        if (next >= 100) {
          clearInterval(interval);
          setPhase("ready");
          setTimeout(() => {
            setPhase("done");
            setTimeout(onComplete, 500);
          }, 800);
          return 100;
        }
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[100] bg-space flex flex-col items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <motion.h1
            className="text-2xl md:text-4xl font-mono font-bold tracking-[0.4em] text-primary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            ASH-TROIDS
          </motion.h1>

          <motion.p
            className="text-xs font-mono text-secondary mt-2 tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {phase === "loading"
              ? "INITIALIZING FIELD..."
              : "FIELD READY — ENTERING ORBIT"}
          </motion.p>

          {/* Progress bar */}
          <motion.div
            className="mt-8 w-48 h-px bg-white/10 overflow-hidden rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="h-full bg-accent-glow/60"
              style={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.1 }}
            />
          </motion.div>

          <motion.p
            className="mt-3 text-[10px] font-mono text-secondary/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {Math.min(Math.round(progress), 100)}%
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
