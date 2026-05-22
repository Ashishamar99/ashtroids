"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { profile } from "@/data/profile";
import { ProjectCard } from "./ProjectCard";

export function RecruiterMode() {
  const viewMode = useStore((s) => s.viewMode);
  const setViewMode = useStore((s) => s.setViewMode);
  const projects = useStore((s) => s.projects);

  const innerProjects = projects.filter((p) => p.orbit === "inner");
  const midProjects = projects.filter((p) => p.orbit === "mid");
  const deepProjects = projects.filter((p) => p.orbit === "deep");

  return (
    <AnimatePresence>
      {viewMode === "recruiter" && (
        <motion.div
          className="fixed inset-0 z-30 overflow-y-auto"
          style={{ background: "var(--bg-space)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="max-w-3xl mx-auto px-6 py-20">
            {/* Back to orbit */}
            <motion.button
              onClick={() => setViewMode("orbit")}
              className="flex items-center gap-2 text-secondary hover:text-primary transition-colors font-mono text-xs group mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 }}
            >
              <span className="group-hover:-translate-x-1 transition-transform">
                &lt;-
              </span>
              <span>Return to orbit</span>
            </motion.button>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-3xl font-bold">{profile.name}</h1>
              <p className="text-secondary mt-1">{profile.title}</p>
              <p className="text-sm text-primary/60 mt-3 max-w-md leading-relaxed">
                {profile.bio[0]}
              </p>

              {/* Quick links */}
              <div className="flex gap-3 mt-4">
                {profile.socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-secondary hover:text-primary hover:border-white/10 transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Flagship Projects */}
            <Section title="FLAGSHIP" delay={0.2}>
              {innerProjects.map((p, i) => (
                <ProjectCard key={p.slug} project={p} index={i} />
              ))}
            </Section>

            {/* Experiments */}
            <Section title="EXPERIMENTS" delay={0.3}>
              {midProjects.map((p, i) => (
                <ProjectCard key={p.slug} project={p} index={i} />
              ))}
            </Section>

            {/* Deep Space */}
            <Section title="SIGNAL LOGS" delay={0.4}>
              {deepProjects.map((p, i) => (
                <ProjectCard key={p.slug} project={p} index={i} />
              ))}
            </Section>

            {/* Skills */}
            <motion.div
              className="mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-xs font-mono text-secondary/50 tracking-wider mb-3">
                INTERESTS & SKILLS
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/3 border border-white/5 text-secondary"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div
              className="mt-12 mb-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-xs font-mono text-secondary/40">
                DIRECT_SIGNAL
              </p>
              <a
                href={`mailto:${profile.email}`}
                className="text-accent-glow hover:text-accent-ice transition-colors font-mono text-sm"
              >
                {profile.email}
              </a>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  delay,
  children,
}: {
  title: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="mt-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <h2 className="text-xs font-mono text-secondary/50 tracking-wider mb-3">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </motion.div>
  );
}
