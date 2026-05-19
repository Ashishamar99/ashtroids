"use client";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { projects } from "@/data/projects";
import { ASTEROID_COLORS } from "@/lib/constants";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <div className="min-h-screen bg-space flex items-center justify-center">
        <div className="text-center">
          <p className="text-xs font-mono text-secondary">
            SIGNAL_LOST — Project not found
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-accent-glow hover:text-accent-ice transition-colors font-mono text-sm"
          >
            Return to orbit
          </button>
        </div>
      </div>
    );
  }

  const colors = ASTEROID_COLORS[project.asteroidType];

  return (
    <div className="min-h-screen bg-space">
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${colors.glow}15 0%, transparent 60%)`,
        }}
      />

      <motion.div
        className="relative z-10 max-w-3xl mx-auto px-6 py-16"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Back button */}
        <motion.button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors font-mono text-xs group mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
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
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors.glow, boxShadow: `0 0 12px ${colors.glow}` }}
            />
            <span className="text-[10px] font-mono text-secondary uppercase tracking-wider">
              {project.category} · {project.orbit} orbit
            </span>
          </div>

          <h1 className="text-4xl font-bold mt-4">{project.title}</h1>
          <p className="text-lg text-secondary mt-2">{project.tagline}</p>
        </motion.div>

        {/* Tech stack */}
        {project.techStack.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/5 text-secondary"
              >
                {tech}
              </span>
            ))}
          </motion.div>
        )}

        {/* Description */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xs font-mono text-secondary/50 tracking-wider mb-3">
            TRANSMISSION_DATA
          </h2>
          <p className="text-primary/80 leading-relaxed">
            {project.description}
          </p>
        </motion.div>

        {/* Links */}
        {project.links && project.links.length > 0 && (
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xs font-mono text-secondary/50 tracking-wider mb-3">
              EXTERNAL_LINKS
            </h2>
            <div className="flex gap-3">
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
          </motion.div>
        )}

        {/* Year */}
        {project.year && (
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-[10px] font-mono text-secondary/30">
              LAUNCHED {project.year}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
