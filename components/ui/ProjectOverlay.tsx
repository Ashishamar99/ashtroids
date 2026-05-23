"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { ASTEROID_COLORS } from "@/lib/constants";

export function ProjectOverlay() {
  const activeSlug = useStore((s) => s.activeProjectSlug);
  const setActiveSlug = useStore((s) => s.setActiveProjectSlug);
  const projects = useStore((s) => s.projects);

  const project = activeSlug
    ? projects.find((p) => p.slug === activeSlug)
    : null;

  useEffect(() => {
    if (!activeSlug) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveSlug(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeSlug, setActiveSlug]);

  const colors = project
    ? ASTEROID_COLORS[project.asteroidType]
    : ASTEROID_COLORS.rocky;

  return (
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveSlug(null)}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-lg z-50 overflow-y-auto"
            style={{
              background: `linear-gradient(180deg, rgba(3,0,20,0.95), rgba(3,0,20,0.88))`,
              backdropFilter: "blur(20px)",
              borderLeft: `1px solid ${colors.glow}20`,
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Color glow at top */}
            <div
              className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, ${colors.glow}18 0%, transparent 70%)`,
              }}
            />

            <div className="relative p-8">
              {/* Close + Return to orbit */}
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={() => setActiveSlug(null)}
                  className="flex items-center gap-2 text-secondary hover:text-primary transition-colors font-mono text-xs group"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">
                    &lt;-
                  </span>
                  <span>Return to orbit</span>
                </button>
                <button
                  onClick={() => setActiveSlug(null)}
                  className="text-secondary hover:text-primary transition-colors font-mono text-sm"
                >
                  [ESC]
                </button>
              </div>

              {/* Header */}
              <div className="mt-8">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: colors.glow,
                      boxShadow: `0 0 12px ${colors.glow}`,
                    }}
                  />
                  <span className="text-[10px] font-mono text-secondary uppercase tracking-wider">
                    {project.category} · {project.orbit} orbit
                    {project.isPrivate && " · PRIVATE"}
                  </span>
                </div>

                <h2 className="text-3xl font-bold mt-4">{project.title}</h2>
                <p className="text-lg text-secondary mt-2">
                  {project.tagline}
                </p>
              </div>

              {/* Tech stack */}
              {project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/5 text-secondary"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="mt-8">
                <h3 className="text-xs font-mono text-secondary/50 tracking-wider mb-3">
                  TRANSMISSION_DATA
                </h3>
                <p className="text-primary/80 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Deploy link */}
              {project.deployUrl && (
                <div className="mt-8">
                  <h3 className="text-xs font-mono text-secondary/50 tracking-wider mb-3">
                    LAUNCH_PAD
                  </h3>
                  <a
                    href={project.deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl border text-sm font-mono transition-all hover:shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${colors.glow}15, ${colors.glow}08)`,
                      borderColor: `${colors.glow}40`,
                      color: colors.glow,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.glow;
                      e.currentTarget.style.boxShadow = `0 0 20px ${colors.glow}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${colors.glow}40`;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span>
                      {project.title} is live — ready for takeoff
                    </span>
                    <span>-&gt;</span>
                  </a>
                </div>
              )}

              {/* External links */}
              {project.links && project.links.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xs font-mono text-secondary/50 tracking-wider mb-3">
                    EXTERNAL_LINKS
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {project.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-accent-glow hover:bg-white/10 hover:border-accent-glow/30 transition-all"
                      >
                        {link.label} -&gt;
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Year */}
              {project.year && (
                <div className="mt-12 mb-8">
                  <p className="text-[10px] font-mono text-secondary/30">
                    LAUNCHED {project.year}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
