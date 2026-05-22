import type { Project, AshteroidsConfig } from "@/data/projects";
import configData from "@/data/ashteroids.json";

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  html_url: string;
  created_at: string;
  updated_at: string;
  private: boolean;
}

const LANGUAGE_TO_TYPE: Record<string, Project["asteroidType"]> = {
  TypeScript: "metallic",
  JavaScript: "metallic",
  Python: "glowing",
  Rust: "lava",
  Go: "ice",
  Java: "lava",
  "C++": "lava",
  C: "lava",
  Shell: "ice",
  Dockerfile: "ice",
};

const LANGUAGE_TO_TECH: Record<string, string[]> = {
  TypeScript: ["TypeScript"],
  JavaScript: ["JavaScript"],
  Python: ["Python"],
  Rust: ["Rust"],
  Go: ["Go"],
  Java: ["Java"],
  Shell: ["Shell"],
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function titleCase(name: string): string {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function inferOrbit(stars: number, isPrivate: boolean): Project["orbit"] {
  if (stars >= 10) return "inner";
  if (stars >= 2 || isPrivate) return "mid";
  return "deep";
}

function inferSize(stars: number): number {
  if (stars >= 50) return 5;
  if (stars >= 20) return 4;
  if (stars >= 5) return 3;
  if (stars >= 1) return 2;
  return 1;
}

function inferCategory(
  topics: string[],
  language: string | null
): Project["category"] {
  const t = topics.map((s) => s.toLowerCase());
  if (t.includes("startup") || t.includes("product")) return "startup";
  if (t.includes("infra") || t.includes("devops") || t.includes("docker"))
    return "infra";
  if (
    t.includes("experiment") ||
    t.includes("hackathon") ||
    t.includes("ai")
  )
    return "experiment";
  if (language === "Python" || t.includes("ml")) return "experiment";
  return "flagship";
}

export function mergeProjects(
  repos: GitHubRepo[] | null
): Project[] {
  const config = configData as AshteroidsConfig;
  const projects: Project[] = [];

  if (repos) {
    for (const repo of repos) {
      const repoConfig = config.repos[repo.name];
      if (!repoConfig?.enabled) continue;

      const year = repo.created_at
        ? new Date(repo.created_at).getFullYear().toString()
        : undefined;

      const autoTech = repo.language
        ? LANGUAGE_TO_TECH[repo.language] || [repo.language]
        : [];

      const links: { label: string; url: string }[] = [];
      const showLink = repoConfig.showLink ?? !repo.private;
      if (showLink) {
        links.push({ label: "GitHub", url: repo.html_url });
      }

      projects.push({
        slug: slugify(repo.name),
        title: repoConfig.title || titleCase(repo.name),
        tagline:
          repoConfig.tagline || repo.description || "A project on GitHub",
        description:
          repoConfig.description ||
          repo.description ||
          `${titleCase(repo.name)} — a ${repo.language || "software"} project.`,
        techStack: repoConfig.techStack || autoTech,
        category:
          repoConfig.category ||
          inferCategory(repo.topics || [], repo.language),
        orbit: repoConfig.orbit || inferOrbit(repo.stargazers_count, repo.private),
        asteroidType:
          repoConfig.asteroidType ||
          (repo.language && LANGUAGE_TO_TYPE[repo.language]) ||
          "rocky",
        size: repoConfig.size || inferSize(repo.stargazers_count),
        links,
        year,
        isPrivate: repo.private,
        showLink,
      });
    }
  }

  for (const manual of config.manualProjects) {
    projects.push({
      ...manual,
      links: manual.links || [],
      isPrivate: false,
      showLink: true,
    });
  }

  return projects;
}

/** Fallback for when no GitHub data is available (static build, client-side) */
export function getStaticProjects(): Project[] {
  return mergeProjects(null);
}
