"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { ASTEROID_COLORS } from "@/lib/constants";
import { playOpen, playClose } from "@/lib/uiSounds";

export function ProjectOverlay() {
  const activeSlug = useStore((s) => s.activeProjectSlug);
  const setActiveSlug = useStore((s) => s.setActiveProjectSlug);
  const projects = useStore((s) => s.projects);

  const project = activeSlug
    ? projects.find((p) => p.slug === activeSlug)
    : null;

  useEffect(() => {
    if (!activeSlug) return;
    playOpen();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playClose();
        setActiveSlug(null);
      }
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
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              playClose();
              setActiveSlug(null);
            }}
          />

          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-xl z-50 overflow-y-auto overflow-x-hidden"
            style={{
              background: "#060018",
              borderLeft: `1px solid ${colors.glow}15`,
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Top accent bar */}
            <div
              className="h-[2px] w-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${colors.glow}, transparent)`,
              }}
            />

            {/* Glow */}
            <div
              className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 50% -20%, ${colors.glow}12 0%, transparent 70%)`,
              }}
            />

            <div className="relative px-12 py-10">
              {/* Nav bar */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    playClose();
                    setActiveSlug(null);
                  }}
                  className="flex items-center gap-2 text-secondary/60 hover:text-primary transition-colors font-mono text-[11px] group"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">
                    &lt;-
                  </span>
                  <span>Return to orbit</span>
                </button>
                <button
                  onClick={() => {
                    playClose();
                    setActiveSlug(null);
                  }}
                  className="text-secondary/40 hover:text-primary transition-colors font-mono text-[11px]"
                >
                  ESC
                </button>
              </div>

              {/* Badge row */}
              <div className="flex items-center gap-2 mt-10">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: colors.glow,
                    boxShadow: `0 0 8px ${colors.glow}`,
                  }}
                />
                <span className="text-[10px] font-mono text-secondary/50 uppercase tracking-widest">
                  {project.category}
                </span>
                <span className="text-secondary/20 text-[10px]">/</span>
                <span className="text-[10px] font-mono text-secondary/50 uppercase tracking-widest">
                  {project.orbit} orbit
                </span>
                {project.isPrivate && (
                  <>
                    <span className="text-secondary/20 text-[10px]">/</span>
                    <span className="text-[10px] font-mono text-secondary/50 uppercase tracking-widest">
                      private
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              <h2
                className="text-3xl font-bold mt-4 leading-tight"
                style={{ color: "#f0eef5" }}
              >
                {project.title}
              </h2>

              {/* Tagline */}
              {project.tagline &&
                project.tagline !== "A project on GitHub" && (
                  <p className="text-[15px] text-secondary mt-3 leading-relaxed">
                    {project.tagline}
                  </p>
                )}

              {/* Tech stack */}
              {project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] px-2.5 py-1 rounded-md font-mono"
                      style={{
                        background: `${colors.glow}08`,
                        border: `1px solid ${colors.glow}15`,
                        color: `${colors.glow}cc`,
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {/* Divider */}
              <div
                className="mt-10 h-px"
                style={{
                  background: `linear-gradient(90deg, ${colors.glow}20, transparent)`,
                }}
              />

              {/* Description */}
              {project.description &&
                !project.description.endsWith("software project.") && (
                  <div className="mt-10">
                    <p className="text-[13.5px] text-primary/70 leading-[1.9]">
                      {project.description}
                    </p>
                  </div>
                )}

              {/* Deploy CTA */}
              {project.deployUrl && (
                <div style={{ marginTop: 34 }}>
                  <a
                    href={project.deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-5 py-3 rounded-lg text-[12px] font-mono transition-all group"
                    style={{
                      background: `${colors.glow}10`,
                      border: `1px solid ${colors.glow}25`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${colors.glow}50`;
                      e.currentTarget.style.background = `${colors.glow}18`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${colors.glow}25`;
                      e.currentTarget.style.background = `${colors.glow}10`;
                    }}
                  >
                    <span
                      className="text-[10px] uppercase tracking-widest"
                      style={{ color: `${colors.glow}60` }}
                    >
                      Launch Pad
                    </span>
                    <span
                      className="text-[10px]"
                      style={{ color: `${colors.glow}30` }}
                    >
                      |
                    </span>
                    <span style={{ color: `${colors.glow}cc` }}>
                      Ready for takeoff
                    </span>
                    <span
                      className="group-hover:translate-x-1 transition-transform"
                      style={{ color: `${colors.glow}80` }}
                    >
                      -&gt;
                    </span>
                  </a>
                </div>
              )}

              {/* Other links */}
              {project.links && project.links.length > 0 && (
                <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
                  {project.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] font-mono px-4 py-2.5 rounded-lg transition-all"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.5)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.15)";
                        e.currentTarget.style.color =
                          "rgba(255,255,255,0.8)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.06)";
                        e.currentTarget.style.color =
                          "rgba(255,255,255,0.5)";
                      }}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}

              {/* About Me shortcut */}
              <div style={{ marginTop: 48 }}>
                <div
                  style={{
                    height: 1,
                    background:
                      "linear-gradient(90deg, rgba(107,141,181,0.15), transparent)",
                  }}
                />
                <button
                  onClick={() => {
                    playClose();
                    setActiveSlug(null);
                    setTimeout(() => {
                      useStore.getState().setAboutOpen(true);
                    }, 100);
                  }}
                  className="flex items-center gap-2 font-mono text-[11px] group transition-colors"
                  style={{ marginTop: 20, color: "rgba(107,141,181,0.5)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "rgba(107,141,181,0.9)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(107,141,181,0.5)";
                  }}
                >
                  <span>About Ashish</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    -&gt;
                  </span>
                </button>
              </div>

              {/* Year footer */}
              {project.year && (
                <div style={{ marginTop: 48, marginBottom: 32 }}>
                  <p className="text-[10px] font-mono text-secondary/25 tracking-wider">
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
