"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { profile } from "@/data/profile";

export function AboutOverlay() {
  const aboutOpen = useStore((s) => s.aboutOpen);
  const setAboutOpen = useStore((s) => s.setAboutOpen);

  return (
    <AnimatePresence>
      {aboutOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAboutOpen(false)}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-lg z-50 glass-strong overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="p-8">
              {/* Close */}
              <button
                onClick={() => setAboutOpen(false)}
                className="absolute top-6 right-6 text-secondary hover:text-primary transition-colors font-mono text-sm"
              >
                [ESC]
              </button>

              {/* Header */}
              <div className="mt-8">
                <p className="text-xs font-mono text-accent-glow tracking-wider">
                  // TRANSMISSION_RECEIVED
                </p>
                <h2 className="text-3xl font-bold mt-3">{profile.name}</h2>
                <p className="text-secondary mt-1">{profile.title}</p>
              </div>

              {/* Bio */}
              <div className="mt-8 space-y-3">
                {profile.bio.map((line, i) => (
                  <p key={i} className="text-primary/80 leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>

              {/* Tagline */}
              <div className="mt-8 border-l-2 border-accent-glow/30 pl-4">
                <p className="text-sm text-secondary italic">
                  {profile.tagline}
                </p>
              </div>

              {/* Interests */}
              <div className="mt-8">
                <h3 className="text-xs font-mono text-secondary tracking-wider mb-3">
                  SIGNAL_INTERESTS
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-primary/70"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Socials */}
              <div className="mt-8">
                <h3 className="text-xs font-mono text-secondary tracking-wider mb-3">
                  COMM_CHANNELS
                </h3>
                <div className="space-y-2">
                  {profile.socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-white/3 hover:bg-white/5 border border-white/5 transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-medium text-primary">
                          {social.label}
                        </p>
                        <p className="text-[10px] font-mono text-secondary">
                          {social.transmission}
                        </p>
                      </div>
                      <span className="text-secondary/40 group-hover:text-accent-glow transition-colors font-mono text-xs">
                        -&gt;
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="mt-8 mb-8">
                <h3 className="text-xs font-mono text-secondary tracking-wider mb-3">
                  DIRECT_SIGNAL
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
