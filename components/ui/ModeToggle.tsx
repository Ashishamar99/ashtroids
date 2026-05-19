"use client";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";

export function ModeToggle() {
  const viewMode = useStore((s) => s.viewMode);
  const setViewMode = useStore((s) => s.setViewMode);

  return (
    <div className="glass rounded-full flex items-center p-0.5 gap-0.5">
      <ToggleButton
        active={viewMode === "orbit"}
        onClick={() => setViewMode("orbit")}
        label="Orbit"
      />
      <ToggleButton
        active={viewMode === "recruiter"}
        onClick={() => setViewMode("recruiter")}
        label="Command"
      />
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="relative px-3 py-1.5 text-[11px] font-mono rounded-full transition-colors"
    >
      {active && (
        <motion.div
          layoutId="mode-toggle-bg"
          className="absolute inset-0 rounded-full bg-white/10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        />
      )}
      <span
        className={`relative z-10 ${active ? "text-primary" : "text-secondary/60"}`}
      >
        {label}
      </span>
    </button>
  );
}
