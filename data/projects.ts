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
}

export const projects: Project[] = [
  {
    slug: "ripple",
    title: "Ripple",
    tagline: "AI-powered incident analysis across your entire stack",
    description:
      "Ripple connects to Jira, Slack, GitLab, Sumo Logic, and Gmail to surface correlated incidents and root cause analysis using AI. Built for engineering teams drowning in alert noise.",
    techStack: ["Next.js", "TypeScript", "OpenAI", "Sumo Logic", "Jira API"],
    category: "flagship",
    orbit: "inner",
    asteroidType: "metallic",
    size: 5,
    links: [{ label: "GitHub", url: "#" }],
    year: "2025",
  },
  {
    slug: "shaadi-flow",
    title: "Shaadi Flow",
    tagline: "Wedding planning, organized and stress-free",
    description:
      "A wedding planning app that keeps track of guests, events, budgets, and timelines. Built to replace the chaos of spreadsheets and WhatsApp groups.",
    techStack: ["Next.js", "TypeScript", "Tailwind"],
    category: "flagship",
    orbit: "inner",
    asteroidType: "lava",
    size: 4,
    links: [{ label: "Live", url: "#" }],
    year: "2025",
  },
  {
    slug: "media-server",
    title: "Home Media Server",
    tagline: "Self-hosted streaming infrastructure on Linux",
    description:
      "A complete self-hosted media stack: Plex, Sonarr, Radarr, Prowlarr, and qBittorrent running on a Linux server with automated downloads and organization.",
    techStack: ["Linux", "Docker", "Nginx", "Plex", "Automation"],
    category: "infra",
    orbit: "mid",
    asteroidType: "ice",
    size: 3,
    links: [],
    year: "2024",
  },
  {
    slug: "ai-playground",
    title: "AI Playground",
    tagline: "Experimental AI prototypes and proof-of-concepts",
    description:
      "A collection of AI experiments — from fine-tuning models to building RAG pipelines, prompt engineering tools, and AI-assisted coding workflows.",
    techStack: ["Python", "OpenAI", "LangChain", "RAG", "Vector DBs"],
    category: "experiment",
    orbit: "mid",
    asteroidType: "glowing",
    size: 3,
    links: [{ label: "GitHub", url: "#" }],
    year: "2024",
  },
  {
    slug: "hackathon-projects",
    title: "Hackathon Archive",
    tagline: "48-hour builds that sometimes work",
    description:
      "A collection of hackathon projects built under extreme time pressure. Some brilliant, some broken, all educational.",
    techStack: ["React", "Node.js", "Python", "Various"],
    category: "experiment",
    orbit: "mid",
    asteroidType: "glowing",
    size: 2,
    links: [],
    year: "2023",
  },
  {
    slug: "building-in-public",
    title: "Building in Public",
    tagline: "Thoughts on shipping, failing, and iterating",
    description:
      "Notes and reflections on the process of building software — what worked, what didn't, and what I'd do differently.",
    techStack: [],
    category: "thought",
    orbit: "deep",
    asteroidType: "rocky",
    size: 1,
    year: "2025",
  },
  {
    slug: "tech-notes",
    title: "Technical Notes",
    tagline: "Things I learned the hard way",
    description:
      "A living collection of technical notes, debugging stories, and hard-won knowledge from building real systems.",
    techStack: [],
    category: "thought",
    orbit: "deep",
    asteroidType: "rocky",
    size: 1,
    year: "2024",
  },
];
