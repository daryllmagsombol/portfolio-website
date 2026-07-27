# Portfolio Redesign — "Worlds" (Full Replacement)

**Date:** 2026-07-27
**Status:** Design approved, pending implementation plan
**Supersedes:** `2026-07-27-portfolio-redesign-design.md` (Deep Space Descent — replaced)

## Summary

Complete visual redesign of darjosh.dev into an immersive, scroll-reactive single-page portfolio where each section is a visually distinct "world" with its own color palette, animation language, and Three.js background scene. Inspired by the AI Modelverse showcase (neuralhub.dev/test-sites/biggy-kimi3) but applied to personal portfolio content.

**Sections (unchanged order):** Hero → Projects → Experience → About → Certifications → Contact → Footer

## Tech Stack

| Library | Purpose |
|---------|---------|
| React 19 + Vite | Framework (unchanged) |
| TypeScript 6 | Typing (unchanged) |
| Tailwind CSS | Utility-first styling (new) |
| GSAP + ScrollTrigger | Scroll-driven animation, pin sections, timeline draws |
| Framer Motion | Entrance animations, typewriter, micro-interactions |
| Three.js / React Three Fiber | Per-section 3D background scenes (particles, shapes, morphing blobs) |

**Added dependencies (npm):** `tailwindcss`, `gsap`, `framer-motion`, `three`, `@react-three/fiber`, `@react-three/drei`

## Content

All content data files in `src/data/` remain **unchanged** (presentation-only redesign) with one exception: the `🚧` emoji in the projects note (`sections.ts`) should be replaced with a clean SVG icon or removed — emoji-as-icons contradict the cinematic technical aesthetic. This is a single-character data change that materially affects visual polish. Content lives in:
- `src/data/hero.ts`
- `src/data/projects.ts`
- `src/data/experience.ts`
- `src/data/about.ts`
- `src/data/certifications.ts`
- `src/data/contact.ts`
- `src/data/skills.ts`
- `src/data/socials.ts`
- `src/data/sections.ts`
- `src/data/nav.ts`

## Architecture

### Component Tree (New)

```
App
├── CursorGlow              ← Custom cursor, color adapts per section
├── NoiseOverlay            ← SVG noise texture (fixed, ~5% opacity)
├── GridOverlay             ← Subtle grid pattern with radial mask (fixed)
├── WorldBackground         ← Active section's Three.js scene (R3F Canvas)
├── NavBar                  ← Refined; consumes `--section-accent` for active link, GitHub button border, toggle icon
├── Sections
│   ├── HeroSection         ← Cinematic void, particles, floating logos (pinned)
│   ├── ProjectSection      ← Creative forge, neural grid, tilt glass cards
│   ├── ExperienceSection   ← Professional timeline, warm shapes
│   ├── AboutSection        ← Personal identity, split screen, morphing blobs
│   ├── CertificationsSection ← Achievement showcase, gold tilt cards
│   └── ContactSection      ← Finale, color-blend background
└── Footer
```

### Data Flow

- `sections.ts` defines section order, labels, and color configs (palette per world)
- `WorldBackground` reads the current active section from a scroll-based context and renders the corresponding Three.js scene
- Color morphing between sections is driven by GSAP ScrollTrigger updating CSS custom properties on `:root`

### Scroll Architecture

1. **GSAP ScrollTrigger pins Hero only** (the most impactful section for a fullscreen pinned intro). Pinning more than 1-2 sections degrades native scroll feel and mobile UX.
2. Remaining sections use `scrub: 1` timelines with `start/end` triggers for reveals, NOT pinning.
3. Between sections, a color-morphing tween transitions `--section-bg`, `--section-accent`, `--section-glow` on `:root` — triggered by scroll position markers.
4. **Color interpolation uses GSAP's `gsap.utils.interpolate` with OKLCH color space** to avoid muddy intermediates when transitioning between section palettes (green→amber→purple→gold). Alternatively, use instant color swaps at section boundaries with a brief 200-300ms crossfade of Three.js scenes as a transition buffer.
5. Each section's Three.js scene fades in/out via opacity tween when its scroll range is active.
6. `WorldBackground` uses a single `<Canvas>` that swaps scene contents based on active section (lazy-loads scenes: only the upcoming ±1 scene is mounted at any time).
7. Smooth scroll via Lenis (matching the Modelverse reference). ScrollTrigger integrates with Lenis via `lenis-scroll.js` plugin — Lenis overrides native scroll, ScrollTrigger listens to Lenis's virtual scroll position.

## Visual System

### Typography

| Font | Usage | Source |
|------|-------|--------|
| Space Grotesk | Body, headings, UI text | Google Fonts |
| Fraunces | Hero display name / accent headlines | Google Fonts |
| JetBrains Mono | Mono kickers (`// 01 · HERO`), tags, code | Google Fonts |
| Inter | Body text fallback / UI labels (alternative to Space Grotesk for readability) | Google Fonts |

Space Grotesk chosen for its cinematic, technical character matching the Modelverse reference. Inter available as fallback if body legibility needs improvement. Triple-stack (Space Grotesk + Inter + JetBrains Mono) validated by ui-ux-pro-max for Web3/developer dark-themed sites.

### Design Tokens

```css
:root {
  /* Section-adaptive (morphed by GSAP) */
  --section-bg: #050505;
  --section-accent: #00ff9d;
  --section-glow: rgba(0, 255, 157, 0.15);
  --section-glass: rgba(255, 255, 255, 0.04);

  /* Fixed */
  --font-sans: "Space Grotesk", sans-serif;
  --font-serif: "Fraunces", serif;
  --font-mono: "JetBrains Mono", monospace;
  --transition: 0.3s ease;
  --radius: 8px;
  --glass-blur: 24px;
  --max-w: 1100px;
}
```

### Navbar

- Transparent background pinned to top; gains glass blur (`rgba(255,255,255,0.04)` + `backdrop-filter: blur(12px)` + 1px bottom border) after scrolling past Hero
- **Nav links consume `--section-accent`** — the active section's link uses `color: var(--section-accent)`, other links use muted text
- GitHub CTA button border reads `border-color: var(--section-accent)` to adapt per world
- Mobile hamburger toggle icon color adapts via `var(--section-accent)`
- Logo text stays white (consistent anchor point)

### Shared Visual Elements

| Element | Description |
|---------|-------------|
| Glass panels | `background: rgba(255,255,255,0.04)`, `backdrop-filter: blur(24px)`, 1px white border at 10% opacity |
| Glass bright | Same but `rgba(255,255,255,0.07)` + `blur(40px)` for elevated surfaces |
| Noise overlay | Fixed SVG fractal noise, 5% opacity, `mix-blend-mode: overlay`, pointer-events none |
| Grid overlay | Fixed 72px grid, 2.5% opacity, radial-gradient mask fading edges, pointer-events none |
| Cursor glow | Custom dot + trailing glow, color picks up `--section-accent`, hidden on touch |
| Kicker labels | Mono uppercase, `--section-accent` like `// 02 · PROJECTS`. Responsive sizing: 11px/0.35em (≥900px), 10px/0.25em (≤900px), 9px/0.2em (≤700px) — prevents spacing gaps reducing legibility at small sizes. |
| Section notes | Rendered as small glass panel below section content or inline tag (`.section-note`), `font-size: 0.85rem`, `color: text-muted` |
| 3D tilt cards | `perspective: 1200px`, mouse-driven rotateX/Y, radial highlight at cursor position. Touch: static 2° CSS skew as visual hint (no JS tilt). Detection via `matchMedia('(hover: none)')`. reduced-motion: tilt removed entirely, cards render flat. |

## Section Worlds

### 1. Hero — Cinematic Void

| Property | Value |
|----------|-------|
| Colors | `#050505` bg → `#00ff9d` accent |
| Background | Three.js particle field (200-300 stars, slow drift, mouse parallax) + floating tech logo meshes (React, TypeScript, Node, Vite) orbiting at different z-depths. During unpin (last 200px of pin range): logos decelerate orbit via GSAP tween and fade to 0 opacity. After unpin: logos unmount with Hero scene. |
| Layout | Fullscreen centered — greeting, huge name, typewriter role, description, CTA row |
| Animations | Framer Motion fade-up headline, typewriter cycling roles, Three.js particles + orbit logos, scroll indicator fades out on scroll |
| CTA buttons | Primary: green gradient `#00ff9d → #00cc7a`, Ghost: white border 20% opacity |

### 2. Projects — Creative Forge

| Property | Value |
|----------|-------|
| Colors | `#0a1a10` bg → `#00ff9d` accent |
| Background | Three.js animated neural network lines with pulsing node dots |
| Layout | Section header + 2-column card grid (same data, restyled) |
| Cards | Glassmorphism + 3D tilt (perspective, rotateX/Y, radial hover glow) |
| Animations | GSAP stagger reveal (y:40, opacity:0 → y:0, opacity:1), tilt on mousemove, tag brighten on hover |
| Tags | `background: rgba(0,255,157,0.1)`, `color: #00ff9d` |

### 3. Experience — Professional Timeline

| Property | Value |
|----------|-------|
| Colors | `#1a0e06` bg → `#d97757` accent |
| Background | Three.js warm organic low-poly shapes floating slowly |
| Layout | Timeline cards — period displayed as a sticky badge/header at top of each card, company + role as prominent header, bullets flowing below. Connecting line runs along left edge of cards with a dot at each entry's start. Card height accommodates multi-paragraph bullets (real experience data has 8+ lines per entry). |
| Timeline | GSAP draws line (top→bottom), dots activate (pulse + glow) as entries enter view |
| Animations | Slower editorial timing — entries fade in from left (x:-20, opacity:0), 0.8s ease, staggered |
| Motion mood | Calm, refined, deliberate |

### 4. About — Personal Identity

| Property | Value |
|----------|-------|
| Colors | `#060d1a` bg → `#a78bfa` / `#4b8bf5` accent |
| Background | Three.js morphing blobs (vertex displacement), blue↔purple color lerp, mirrored/duplicated |
| Layout | Split-screen 1.2:1 — left: bio paragraphs + CV CTA, right: skills grid |
| Animations | Columns reveal independently (left from x:-30, right from x:30), staggered 0.15s; skills tags stagger fade-up 0.05s apart |
| Motion mood | Energetic but controlled — mirrored shapes suggest duality |

### 5. Certifications — Achievement Showcase

| Property | Value |
|----------|-------|
| Colors | `#1a1206` bg → `#f59e0b` accent |
| Background | Three.js gold sparkle particles drifting upward |
| Layout | Single-column centered layout (only 1 cert in data). Single card centered with gold glow background. If more certs added later, switches to 2-column grid. Empty slots: glass panel with dashed border + "coming soon" text. |
| Cards | Same 3D tilt as Projects; badge images get golden glow on hover |
| Animations | GSAP stagger fade-up reveal, tilt on mousemove |

### 6. Contact — The Finale

| Property | Value |
|----------|-------|
| Colors | `#050505` bg → all accents blending |
| Background | Three.js gradient orbs cycling through green → amber → purple → gold |
| Headline | "Let's Build **Something Great.** " — static multi-color gradient text (all 4 accents combined, `background-clip: text`) — vibrant but stable, not cycling |
| CTA | Gradient green→purple button (stable gradient), glow on hover |
| Social links | Mono text, hover picks up a static accent color (not cycling — keeps interactive elements predictable) |
| Footer | Minimal credit line, small. Includes back-to-top link/button ("↑ Back to top") — essential with Lenis smooth scroll for navigating back to Hero. |
| Motion | Cinematic, calm — ambient color morph, no frantic animations |

## Animations

### GSAP (Scroll-Triggered)

- **Section pinning:** Each section pinned via ScrollTrigger; duration matches section height
- **Color morphing:** Between section boundaries, `--section-bg`, `--section-accent` tweened on `:root`
- **Timeline draw:** Line height and dot activation per scroll progress
- **Stagger reveals:** Cards, entries, tags fade up with stagger delays
- **Reveal direction:** Sections reveal from different directions (projects: y, experience: x, about: split x)

### Framer Motion (Entry / UI)

- Hero headline fade-up on mount
- Typewriter role cycling (AnimatePresence)
- Button hover micro-interactions (scale, glow)
- Navigation link hover underline

### Animation Discipline

- **Continuous animation** reserved exclusively for Three.js background scenes (low opacity, slow motion) — never for content UI elements
- No decorative bounce/spin/pulse on icons, buttons, or cards (per ui-ux-pro-max: "continuous animation for loading indicators only")
- All GSAP animations use `transform` and `opacity` only — never width/height/top/left (avoids layout thrash)
- GSAP pinning limited to 1 section (Hero) to avoid fighting native scroll feel
- Two animation trigger strategies used depending on type:
  - **Scrub animations** (timeline draw, color morph): `toggleActions: 'play none none none'` + `scrub: 1` — animation state tied to scroll position
  - **One-pass reveals** (stagger cards, entries): `toggleActions: 'play none none none'` with no reverse — elements appear once and stay visible; if user scrolls back up, they remain in their final state (no re-triggering, no reverse)

### Three.js (Backgrounds)

- **Hero:** Particle field (PointsGeometry, BufferAttribute position updates, mouse parallax)
- **Projects:** Neural network (LineSegments + animated nodes)
- **Experience:** Organic shapes (low-poly IcosahedronGeometry, vertex displacement)
- **About:** Morphing blobs (SphereGeometry with animated vertex positions, dual instances for mirror)
- **Certifications:** Sparkle particles (Points, upward drift, golden color)
- **Contact:** Gradient orbs (multiple SphereGeometry with fragment shader color blending)

All Three.js scenes mounted/unmounted via conditional render in a single `<Canvas>`; transitions cross-fade via opacity. Only the upcoming ±1 scene is mounted at any time (lazy mount). All scenes pause when `document.hidden` is true.

## Accessibility

- `prefers-reduced-motion: reduce` — GSAP/Framer Motion animations disabled, Three.js scenes fully unmounted (not just frozen — saves GPU memory), CSS gradient backgrounds replace them. All content immediately visible.
- All text/background pairs validated ≥ 4.5:1 contrast
- Visible focus rings (section accent color) for keyboard navigation
- Cursor glow hidden on touch devices via `matchMedia('(hover: none)')` — correctly handles hybrid devices (iPad Pro + keyboard, Surface) that `ontouchstart` would misclassify
- Semantic HTML sectioning and landmarks
- Custom scrollbar retains native functionality; Lenis is accessibility-aware

## Performance

### First-Load Sequence

Hero content (greeting, name, typewriter) renders immediately with solid background color. SVG noise overlay renders next (CSS, zero cost). Three.js Canvas mounts and compiles shaders asynchronously (≤1500ms). Particle field fades in over 500ms once ready. Users never see a blank canvas.

### Runtime

- Single Three.js `<Canvas>` reuses renderer (no mount/unmount overhead per scene)
- Project images converted to WebP/AVIF for glass overlay compositing quality; `image-rendering: auto` on card images
- Three.js scenes use low polygon counts and simple materials (no PBR, no shadows)
- Particle systems limited to 300 points max
- Three.js scenes are lazy-mounted: only the upcoming ±1 scene is in the DOM at any time; others are unmounted
- Three.js scenes pause animation (via `useFrame` stop) when document.hidden is true (Page Visibility API) — continuous ambient animation that stops when not visible
- GSAP ScrollTrigger: passive listeners, `scrub: 1` for smooth but not overburdened updates
- GSAP pinning limited to 1 section (Hero) to avoid layout thrash per ui-ux-pro-max guidance
- Tailwind: purge unused styles in production build
- Lenis: requestAnimationFrame-based, paused when tab not visible
- Continuous animations (Three.js backgrounds) kept at very low opacity/speed so they do not distract from content — never animate content UI elements continuously

## Responsive

- **Desktop-first** (optimize for "desktop wow-factor" per reference prompt)
- Tablet (≤900px): sections stack vertically, split layouts collapse to single column, tilt effects simplified
- Mobile (≤700px): Three.js backgrounds hidden (performance), replaced by CSS gradient fallbacks:
  - Hero: `radial-gradient(ellipse at center, #00ff9d15 0%, #050505 70%)`
  - Projects: `radial-gradient(ellipse at 50% 0%, #00ff9d08 0%, #0a1a10 100%)`
  - Experience: `radial-gradient(ellipse at 50% 100%, #d9775710 0%, #1a0e06 100%)`
  - About: `radial-gradient(ellipse at center, #a78bfa0a 0%, #060d1a 100%)`
  - Certifications: `radial-gradient(ellipse at center, #f59e0b08 0%, #1a1206 100%)`
  - Contact: `radial-gradient(ellipse at center, #00ff9d08 0%, #050505 70%)`
- Noise/grid overlays hidden on ≤700px (compositing cost without Three.js reward)
- Animations simplified: stagger reveals remain (CSS class toggle), scroll-triggered color changes remain, tilt and Three.js removed
- Timeline becomes stacked list (period badge above card, no connecting line)
- Reduced star/particle counts on mobile via `useMediaQuery` or Three.js pixel ratio capping

## Migration

### Files to Create

```
src/
├── components/
│   ├── CursorGlow.tsx
│   ├── NoiseOverlay.tsx
│   ├── GridOverlay.tsx
│   ├── WorldBackground.tsx
│   ├── scenes/
│   │   ├── HeroScene.tsx
│   │   ├── NeuralScene.tsx
│   │   ├── WarmShapesScene.tsx
│   │   ├── BlobScene.tsx
│   │   ├── GoldParticlesScene.tsx
│   │   └── ColorBlendScene.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx       (refactored)
│   │   ├── ProjectSection.tsx    (refactored)
│   │   ├── ExperienceSection.tsx (refactored)
│   │   ├── AboutSection.tsx      (refactored)
│   │   ├── CertificationsSection.tsx (refactored)
│   │   └── ContactSection.tsx    (refactored)
│   └── ui/
│       ├── GlassCard.tsx
│       ├── TiltCard.tsx
│       └── SectionHeader.tsx     (refactored)
├── hooks/
│   ├── useScrollAnimation.ts
│   └── useActiveSection.ts      (keep, extend for GSAP)
└── styles/
    └── worlds.css               (Tailwind layers + custom tokens)
```

### Files to Modify

- `App.tsx` — new component tree, GSAP/Lenis setup
- `index.html` — Google Fonts links (Space Grotesk, Fraunces, JetBrains Mono)
- `index.css` — replace with Tailwind directives + token variables
- `vite.config.ts` — tailwind plugin
- `package.json` — new dependencies

### Files to Delete

- `src/components/parallax/` (ParallaxWorld + layers, parallax.css)
- `src/hooks/useParallax.ts`
- `src/hooks/useScrollReveal.ts`
- `src/hooks/useScrollShadow.ts`
- `src/data/parallax.ts`

## Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Approach | Full World Swap | User chose this over hybrid/restrained options |
| Tech additions | Tailwind + GSAP + Framer + Three.js | User approved full stack from reference prompt |
| Content | Keep all existing data files unchanged | Presentation-only redesign |
| Backgrounds | Three.js per-section with single Canvas | Reuses renderer, avoids mount thrash |
| Smooth scroll | Lenis | Matching Modelverse reference feel |
| Color theme | Per-section distinct palettes | Each section as its own "world" |
| Section order | Keep current order | User explicitly chose this |
