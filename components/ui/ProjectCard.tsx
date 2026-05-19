"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Project } from "@/data/projects";
import { ASTEROID_COLORS } from "@/lib/constants";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const colors = ASTEROID_COLORS[project.asteroidType];
  const isThought = project.orbit === "deep";
  const href = isThought ? "/signals" : `/projects/${project.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link href={href} className="block group">
        <div className="p-5 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: colors.glow }}
                />
                <h3 className="text-sm font-semibold text-primary group-hover:text-accent-glow transition-colors">
                  {project.title}
                </h3>
              </div>
              <p className="text-xs text-secondary mt-1.5 leading-relaxed">
                {project.tagline}
              </p>
            </div>
            {project.year && (
              <span className="text-[10px] font-mono text-secondary/50 shrink-0">
                {project.year}
              </span>
            )}
          </div>

          {project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-secondary"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] font-mono text-secondary/40 capitalize">
              {project.category}
            </span>
            <span className="text-secondary/20">·</span>
            <span className="text-[10px] font-mono text-secondary/40 capitalize">
              {project.orbit} orbit
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
