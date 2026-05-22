# ASH-TEROIDS — Design Handoff

Everything a UI designer needs to reimagine or extend the Ash-teroids portfolio site.

---

## Color Theme

| Token | Hex | Usage |
|---|---|---|
| `--bg-space` | `#020010` | Page background, deep space black |
| `--text-primary` | `#e8e6f0` | Headings, body text, high-emphasis content |
| `--text-secondary` | `#8a86a0` | Subtitles, metadata, low-emphasis text |
| `--accent-glow` | `#6b8db5` | Primary interactive color — links, active states, the space station, orbit rings |
| `--accent-lava` | `#ff6b35` | Danger, emphasis, lava-type asteroids, exit buttons, engine flame |
| `--accent-ice` | `#40e0ff` | Hover accents, secondary CTA, ice-type asteroids, bonus game elements |
| `--accent-purple` | `#c77dff` | Experimental/AI-related highlights, glowing asteroids |
| `--terminal-green` | `#00ff41` | Terminal text, game ship, success indicators, cursor blink |

### Opacity Conventions

- `white/3` — card backgrounds (barely visible)
- `white/5` — card borders, tag backgrounds, subtle separators
- `white/10` — hover border state
- `secondary/50` — section label text
- `secondary/30` — hint text, faint metadata
- Color + `15` suffix (hex) — radial gradient glows (e.g. `#6b8db515`)

### Asteroid Type Color Palettes

Each asteroid type has three values: base / emissive / glow.

| Type | Base | Emissive | Glow | Used For |
|---|---|---|---|---|
| metallic | `#8a9bae` | `#4a6580` | `#6b8db5` | Production apps, TypeScript/JS projects |
| lava | `#c44b2f` | `#ff4500` | `#ff6b35` | Startup ideas, Rust/Java/C++ |
| ice | `#7ec8e3` | `#00bfff` | `#40e0ff` | Backend infra, Docker, Go, Shell |
| glowing | `#7b5ea7` | `#9b59b6` | `#c77dff` | AI/ML experiments, Python |
| rocky | `#6b5b4f` | `#4a3728` | `#8b7355` | Thoughts, blogs, notes |

---

## Typography

| Role | Font | Weight | Size | Tracking |
|---|---|---|---|---|
| Body | Geist Sans | 400 | 14px | normal |
| Headings | Geist Sans | 700 | 24-36px | normal |
| Subtitles / taglines | Geist Sans | 400 | 18px | normal |
| HUD labels | Geist Mono | 700 | 11-12px | `0.3em` |
| Section headers | Geist Mono | 400 | 12px (xs) | `wider` (uppercase) |
| Metadata / hints | Geist Mono | 400 | 10px | `wider` |
| Terminal text | Geist Mono | 400 | 12px | normal |
| Tags / pills | Geist Sans or Mono | 400 | 10px | normal |

---

## Glass Effect System

Two glass tiers used for overlays, cards, and floating UI.

### `.glass`
```css
background: rgba(3, 0, 20, 0.7);
backdrop-filter: blur(12px);
border: 1px solid rgba(107, 141, 181, 0.15);
```

### `.glass-strong`
```css
background: rgba(3, 0, 20, 0.85);
backdrop-filter: blur(20px);
border: 1px solid rgba(107, 141, 181, 0.2);
```

Used for: terminal overlay, save bar, tooltip cards, mode toggle, game HUD.

---

## Component Patterns

### Cards
```
bg-white/3 border border-white/5 rounded-xl p-5
hover: bg-white/5 border-white/10
```
Used for project cards, signal log entries, social link rows.

### Tags / Pills
```
text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-secondary
```
Variants: `text-accent-glow` for highlighted tech tags.

### Buttons
- **Primary CTA**: `bg-accent-glow/20 border border-accent-glow/30 text-accent-glow`, hover brightens
- **Secondary**: `bg-white/5 border border-white/10 text-secondary`, hover to `text-primary`
- **Danger/Exit**: `text-accent-lava` with glass background
- **Navigation**: `text-secondary hover:text-primary font-mono text-xs` with `<-` arrow that shifts on hover

### Section Labels
```
text-xs font-mono text-secondary/50 tracking-wider uppercase mb-3
```
Examples: `TRANSMISSION_DATA`, `EXTERNAL_LINKS`, `LAUNCH_PAD`, `COMM_CHANNELS`

### Mode Toggle
Glass pill with two options, active state indicated by a Framer Motion `layoutId` animated background (`bg-white/10 rounded-full`).

---

## Animation Language

| Pattern | Implementation | Used Where |
|---|---|---|
| Page entry | `opacity: 0 -> 1`, `y: 20 -> 0`, staggered `delay` per section | Project page, recruiter mode, signals |
| Page transition | `ease: [0.22, 1, 0.36, 1]`, 0.6s duration | Asteroid click -> project page |
| Spring toggle | `type: "spring", bounce: 0.2, duration: 0.4` | Mode toggle background |
| Hover glow | CSS `transition: all 0.3s` + filter/opacity changes | Asteroids, station, satellites |
| Float | `translateY(0) -> translateY(-8px)`, 6s ease-in-out infinite | Space station idle |
| Pulse glow | `opacity: 0.6 -> 1`, 2s ease-in-out infinite | Loading text, glowing asteroid cores |
| Terminal blink | `opacity: 1 -> 0`, 1s step-end infinite | Cursor in terminal input |

---

## Space Metaphor Language

The entire UI avoids generic web terminology and uses a consistent space vocabulary:

| Generic | Ash-teroids Equivalent |
|---|---|
| Projects | Ash-teroids |
| Categories | Orbit layers (inner / mid / deep) |
| About page | Space Station |
| Social links | Satellites, Transmission channels |
| Blog posts | Signal Logs, Intercepted Transmissions |
| Homepage | The Field |
| Navigate back | "Return to orbit" |
| View project | "Launch" |
| Deploy link | "Launch Pad — ready for takeoff" |
| Contact | "Direct Signal" |
| Resume | "Black Box Recorder" |
| List view | "Command Mode" |
| 3D view | "Orbit Mode" |
| Section headers | `TRANSMISSION_DATA`, `SIGNAL_INTERESTS`, `COMM_CHANNELS` |

---

## Page Structure

### Landing (Orbit Mode)
- Full-viewport 2D space scene
- Parallax star field (canvas-rendered, 400 stars, 3 layers)
- Elliptical orbit rings (SVG dashed strokes)
- Procedurally generated asteroid textures orbiting in rings
- Space station at center (about), satellites orbiting it (socials)
- HUD overlay: branding top-left, mode toggle top-right, terminal hint bottom-left, nav hint bottom-right

### Landing (Command Mode)
- Clean scrollable list view, dark background
- "Return to orbit" back button at top
- Profile header with social link pills
- Sections: FLAGSHIP, EXPERIMENTS, SIGNAL LOGS
- Skills/interests as tag pills
- Contact at bottom

### Project Detail (`/projects/[slug]`)
- Radial gradient glow at top matching asteroid type color
- Back button, category/orbit badge, title, tagline, tech tags
- Description section
- Links section (GitHub, deploy)
- Year footer

### Signal Logs (`/signals`)
- Styled as intercepted transmissions
- Each entry: signal ID, date, signal strength indicator, title, content, tags

### Terminal Overlay
- Bottom-anchored, max-width 2xl
- Green-on-dark retro aesthetic
- Commands: scan, open, about, contact, links, launch, clear, help

### Admin (`/admin`)
- GitHub OAuth connection status
- Repo list with toggle checkboxes and expandable config
- Manual project management
- Sticky save bar

---

## Project Detail Page — Improvement Suggestions

These are recommendations for a UI redesign of `/projects/[slug]`:

1. **Hero area**: Add a screenshot/preview image or a large procedurally-generated asteroid texture specific to the project. Gives the page visual weight instead of jumping straight to text.

2. **Status indicator**: Show project status (Active / Archived / Experimental) with a colored dot next to the category badge. Active = green, Archived = grey, Experimental = purple.

3. **Two-column layout** (desktop): Left column for description and links. Right column for a compact metadata sidebar card showing year, category, orbit, tech stack, and status in a structured layout.

4. **Launch Pad CTA**: The deployment link should be the most prominent element — a large glowing button with a rocket/launch metaphor. Visually distinct from the smaller GitHub link.

5. **Related ash-teroids**: A "Nearby in orbit" section at the bottom showing 2-3 projects from the same orbit layer as clickable mini-cards.

6. **Star field background**: Reuse the canvas StarField component behind the page content for visual continuity with the main scene.

7. **Mission Log**: A timeline/changelog section for projects that are actively developed. Each entry is a dated transmission.

8. **Animated entry**: The asteroid texture could "land" at the top of the page (continuing the meteor-crash animation from the orbit view) before settling into the hero position.

---

## File Reference

| File | Purpose |
|---|---|
| `app/globals.css` | All CSS variables, glass effects, keyframe animations |
| `lib/constants.ts` | Orbit radii, speeds, asteroid color palettes, camera defaults |
| `lib/asteroidGenerator.ts` | Procedural asteroid texture generator (canvas pixel-level) |
| `components/scene/StarField.tsx` | Canvas star field with parallax, twinkle, nebula |
| `components/scene/Asteroid.tsx` | 2D asteroid with orbit, hover, click-to-launch |
| `components/scene/SpaceStation.tsx` | Center station element |
| `components/scene/Satellite.tsx` | Orbiting social link elements |
| `components/ui/HUD.tsx` | Heads-up display overlay |
| `components/ui/ModeToggle.tsx` | Orbit/Command toggle |
| `components/ui/AboutOverlay.tsx` | About panel (slide-in from right) |
| `components/ui/RecruiterMode.tsx` | Clean list view |
| `components/ui/TerminalOverlay.tsx` | Terminal with command parser |
| `components/ui/LoadingScreen.tsx` | Intro loading animation |
| `components/game/AsteroidsGame.tsx` | Easter egg mini-game |
| `data/ashteroids.json` | Project configuration |
| `data/profile.ts` | Bio, socials, signal logs |
