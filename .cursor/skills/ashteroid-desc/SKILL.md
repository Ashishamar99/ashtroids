---
name: ashteroid-desc
description: Generate project descriptions, taglines, and tech stacks for ash-teroids in the Ash-teroids portfolio site. Use when adding a new project, writing a description for a GitHub repo, or updating ashteroids.json.
---

# Ash-teroid Description Generator

Generate personality-driven project descriptions for the Ash-teroids portfolio. Every project appears as an "ash-teroid" orbiting in space — the writing should match that energy.

## Output Format

For each project, produce a JSON block matching this structure:

```json
{
  "title": "Human-readable project name",
  "tagline": "One line, under 60 chars, punchy",
  "description": "2-4 sentences. What it does, why it exists, what makes it interesting.",
  "techStack": ["Key", "Technologies", "Used"]
}
```

## Voice and Tone

- **First-person builder voice** — write like the developer explaining their own project to a curious stranger
- **Conversational, not corporate** — no "leverages", "utilizes", "innovative solution"
- **Show personality** — dry humor, self-awareness, and honesty are welcome
- **Concrete over abstract** — say what the thing actually does, not what category it fits into

## Rules

### Taglines
- Under 60 characters
- Describe what it does or what it's for, not what it is
- No periods at the end
- Avoid generic phrases like "A web application for..." or "A tool that..."

Good: "Voice-to-prescription for doctors, storage for patients"
Good: "A bot that filters your Udemy courses by what's actually good"
Bad: "An innovative healthcare solution"
Bad: "A Python-based utility tool"

### Descriptions
- 2-4 sentences max
- First sentence: what the project does (concrete, specific)
- Middle: how it works or what makes it interesting
- Last sentence: the human angle — why it was built, what problem it scratches, or a self-aware comment
- Name specific technologies, APIs, or services used — this adds credibility
- End on a note that reveals the builder's personality

Good: "A Selenium-powered scraper bot that logs into your Udemy account, pulls all your enrolled courses, and filters them by rating, student count, and total hours. Exports to CSV so you can finally find the gems buried in that mountain of free courses you enrolled in at 2AM."

Bad: "This project is a web scraping tool built with Python and Selenium. It helps users filter their Udemy courses based on various criteria and exports the results."

### Tech Stacks
- 3-6 tags
- Lead with the primary language/framework
- Include the most distinctive or interesting technologies
- Use proper casing: "Next.js" not "nextjs", "PostgreSQL" not "postgres"
- Include domain-specific tags when relevant: "Steganography", "Voice API", "Web Scraping"
- Don't include generic tags like "HTML", "CSS", "Git"

## Gathering Project Info

When writing a description for a project, look for info in this order:
1. The GitHub repo README (most detailed)
2. The GitHub repo description and topics
3. The repo's primary language and recent activity
4. Ask the user if anything is unclear

Use `gh api repos/OWNER/REPO` or `curl https://api.github.com/repos/OWNER/REPO` to fetch repo metadata. Read the README with `curl https://raw.githubusercontent.com/OWNER/REPO/main/README.md`.

## Assigning Orbit, Category, and Type

When the user hasn't specified these, use these defaults:

**Orbit** (how prominent in the portfolio):
- `inner` — flagship/shipped products, most important work
- `mid` — experiments, tools, side projects
- `deep` — thoughts, tiny scripts, archived work

**Category**:
- `flagship` — polished, shipped, production-ready
- `startup` — product/startup ideas
- `infra` — backend, DevOps, self-hosting
- `experiment` — hackathons, prototypes, explorations
- `thought` — blogs, notes, reflections

**Asteroid Type** (visual style, based on domain):
- `metallic` — production web apps (TypeScript/JS)
- `lava` — startup ideas, Rust/Java/C++
- `ice` — infra, Docker, Go, Shell, DevOps
- `glowing` — AI/ML, Python experiments
- `rocky` — thoughts, notes, small scripts

**Size** (1-5, based on effort/impact):
- 5: Major shipped product
- 4: Significant project with users
- 3: Solid side project or experiment
- 2: Small tool or utility
- 1: Note, thought, or tiny script

## Examples

See [examples.md](examples.md) for full before/after examples.
