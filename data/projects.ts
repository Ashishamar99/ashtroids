export interface Project {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  techStack: string[];
  category: "flagship" | "startup" | "infra" | "experiment" | "thought";
  orbit: "inner" | "mid" | "deep";
  asteroidType: "metallic" | "lava" | "ice" | "glowing" | "rocky";
  size: number;
  links?: { label: string; url: string }[];
  image?: string;
  year?: string;
  deployUrl?: string;
  isPrivate?: boolean;
  showLink?: boolean;
}

export type RepoConfig = {
  enabled: boolean;
  orbit?: Project["orbit"];
  category?: Project["category"];
  asteroidType?: Project["asteroidType"];
  size?: number;
  title?: string;
  tagline?: string;
  description?: string;
  techStack?: string[];
  showLink?: boolean;
  deployUrl?: string;
};

export type ManualProject = Omit<Project, "links" | "isPrivate"> & {
  links?: { label: string; url: string }[];
  deployUrl?: string;
};

export interface AshteroidsConfig {
  githubUsername: string;
  repos: Record<string, RepoConfig>;
  manualProjects: ManualProject[];
}
