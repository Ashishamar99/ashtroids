"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { profile } from "@/data/profile";
import { playOpen, playClose } from "@/lib/uiSounds";

export function AboutOverlay() {
  const aboutOpen = useStore((s) => s.aboutOpen);
  const setAboutOpen = useStore((s) => s.setAboutOpen);

  useEffect(() => {
    if (!aboutOpen) return;
    playOpen();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playClose();
        setAboutOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [aboutOpen, setAboutOpen]);

  const close = () => {
    playClose();
    setAboutOpen(false);
  };

  return (
    <AnimatePresence>
      {aboutOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-xl z-50 overflow-y-auto overflow-x-hidden"
            style={{
              background: "#060018",
              borderLeft: "1px solid rgba(107,141,181,0.12)",
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
                background:
                  "linear-gradient(90deg, transparent, #6b8db5, transparent)",
              }}
            />

            {/* Glow */}
            <div
              className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% -20%, rgba(107,141,181,0.1) 0%, transparent 70%)",
              }}
            />

            <div className="relative px-12 py-10">
              {/* Nav */}
              <div className="flex items-center justify-between">
                <button
                  onClick={close}
                  className="flex items-center gap-2 text-secondary/60 hover:text-primary transition-colors font-mono text-[11px] group"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">
                    &lt;-
                  </span>
                  <span>Return to orbit</span>
                </button>
                <button
                  onClick={close}
                  className="text-secondary/40 hover:text-primary transition-colors font-mono text-[11px]"
                >
                  ESC
                </button>
              </div>

              {/* Badge */}
              <div className="flex items-center gap-2 mt-10">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: "#6b8db5",
                    boxShadow: "0 0 8px #6b8db5",
                  }}
                />
                <span className="text-[10px] font-mono text-secondary/50 uppercase tracking-widest">
                  Transmission Received
                </span>
              </div>

              {/* Name */}
              <h2
                className="text-3xl font-bold mt-4"
                style={{ color: "#f0eef5" }}
              >
                {profile.name}
              </h2>
              <p className="text-[15px] text-secondary mt-2">
                {profile.title}
              </p>

              {/* Divider */}
              <div
                className="mt-10 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(107,141,181,0.2), transparent)",
                }}
              />

              {/* Bio */}
              <div className="mt-10 space-y-4">
                {profile.bio.map((line, i) => (
                  <p
                    key={i}
                    className="text-[13.5px] text-primary/70 leading-[1.9]"
                  >
                    {line}
                  </p>
                ))}
              </div>

              {/* Tagline */}
              <div
                className="mt-8 pl-4"
                style={{ borderLeft: "2px solid rgba(107,141,181,0.2)" }}
              >
                <p className="text-[13px] text-secondary/50 italic leading-relaxed">
                  {profile.tagline}
                </p>
              </div>

              {/* Interests */}
              <div className="mt-12">
                <h3 className="text-[10px] font-mono text-secondary/40 tracking-widest uppercase mb-4">
                  Signal Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="text-[11px] px-2.5 py-1 rounded-md font-mono"
                      style={{
                        background: "rgba(107,141,181,0.06)",
                        border: "1px solid rgba(107,141,181,0.12)",
                        color: "rgba(107,141,181,0.75)",
                      }}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  marginTop: 20,
                  height: 1,
                  background:
                    "linear-gradient(90deg, rgba(107,141,181,0.15), transparent)",
                }}
              />

              {/* Socials */}
              <div style={{ marginTop: 40 }}>
                <h3
                  className="text-[10px] font-mono text-secondary/40 tracking-widest uppercase"
                  style={{ marginBottom: 20 }}
                >
                  Comm Channels
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {profile.socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg transition-all group"
                      style={{
                        padding: "8px 12px",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.04)";
                        e.currentTarget.style.borderColor =
                          "rgba(107,141,181,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.02)";
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.04)";
                      }}
                    >
                      <div>
                        <p className="text-[13px] font-medium text-primary/80 group-hover:text-primary transition-colors">
                          {social.label}
                        </p>
                        <p
                          className="text-[10px] font-mono text-secondary/35"
                          style={{ marginTop: 4 }}
                        >
                          {social.transmission}
                        </p>
                      </div>
                      <span className="text-secondary/25 group-hover:text-accent-glow group-hover:translate-x-0.5 transition-all font-mono text-xs">
                        -&gt;
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div style={{ marginTop: 24, marginBottom: 40 }}>
                <h3 className="text-[10px] font-mono text-secondary/40 tracking-widest uppercase mb-3">
                  Direct Signal
                </h3>
                <a
                  href={`mailto:${profile.email}`}
                  className="text-accent-glow hover:text-accent-ice transition-colors font-mono text-sm"
                >
                  {profile.email}
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
