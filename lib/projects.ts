import type { Project, AshteroidsConfig, RepoConfig } from "@/data/projects";

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
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCase(name: string): string {
  return name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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

/** Build a project from config alone (no GitHub API data). */
function projectFromConfig(name: string, rc: RepoConfig): Project {
  const username = "Ashishamar99";
  const showLink = rc.showLink ?? true;
  const links: { label: string; url: string }[] = [];
  if (showLink) {
    links.push({ label: "GitHub", url: `https://github.com/${username}/${name}` });
  }

  return {
    slug: slugify(name),
    title: rc.title || titleCase(name),
    tagline: rc.tagline || "A project on GitHub",
    description: rc.description || `${titleCase(name)} — a software project.`,
    techStack: rc.techStack || [],
    category: rc.category || "flagship",
    orbit: rc.orbit || "mid",
    asteroidType: rc.asteroidType || "rocky",
    size: rc.size || 2,
    links,
    deployUrl: rc.deployUrl,
    isPrivate: false,
    showLink,
  };
}

export function mergeProjects(
  config: AshteroidsConfig,
  repos: GitHubRepo[] | null
): Project[] {
  const projects: Project[] = [];
  const handledRepos = new Set<string>();

  // Merge GitHub repos with config overrides
  if (repos) {
    for (const repo of repos) {
      const rc = config.repos[repo.name];
      if (!rc?.enabled) continue;
      handledRepos.add(repo.name);

      const year = repo.created_at
        ? new Date(repo.created_at).getFullYear().toString()
        : undefined;

      const autoTech = repo.language
        ? LANGUAGE_TO_TECH[repo.language] || [repo.language]
        : [];

      const links: { label: string; url: string }[] = [];
      const showLink = rc.showLink ?? !repo.private;
      if (showLink) {
        links.push({ label: "GitHub", url: repo.html_url });
      }

      projects.push({
        slug: slugify(repo.name),
        title: rc.title || titleCase(repo.name),
        tagline: rc.tagline || repo.description || "A project on GitHub",
        description:
          rc.description ||
          repo.description ||
          `${titleCase(repo.name)} — a ${repo.language || "software"} project.`,
        techStack: rc.techStack || autoTech,
        category:
          rc.category || inferCategory(repo.topics || [], repo.language),
        orbit: rc.orbit || inferOrbit(repo.stargazers_count, repo.private),
        asteroidType:
          rc.asteroidType ||
          (repo.language && LANGUAGE_TO_TYPE[repo.language]) ||
          "rocky",
        size: rc.size || inferSize(repo.stargazers_count),
        links,
        year,
        deployUrl: rc.deployUrl,
        isPrivate: repo.private,
        showLink,
      });
    }
  }

  // Any enabled repos NOT in the GitHub data — build from config alone
  for (const [name, rc] of Object.entries(config.repos)) {
    if (!rc.enabled || handledRepos.has(name)) continue;
    projects.push(projectFromConfig(name, rc));
  }

  // Manual projects
  for (const manual of config.manualProjects) {
    projects.push({
      ...manual,
      links: manual.links || [],
      deployUrl: manual.deployUrl,
      isPrivate: false,
      showLink: true,
    });
  }

  return projects;
}

/** Load config at runtime (client-side) and build projects without GitHub API. */
export async function loadProjects(): Promise<Project[]> {
  try {
    const res = await fetch("/api/config");
    const config: AshteroidsConfig = await res.json();
    return mergeProjects(config, null);
  } catch {
    // Fallback to bundled config
    const configData = await import("@/data/ashteroids.json");
    return mergeProjects(configData as unknown as AshteroidsConfig, null);
  }
}

/** Synchronous fallback using bundled config (for SSR / initial load). */
export function getStaticProjects(): Project[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const configData = require("@/data/ashteroids.json") as AshteroidsConfig;
  return mergeProjects(configData, null);
}
