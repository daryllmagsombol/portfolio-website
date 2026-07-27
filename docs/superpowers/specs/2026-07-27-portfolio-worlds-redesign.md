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

All content data files in `src/data/` remain **unchanged**. This is a presentation-only redesign. Content lives in:
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
├── NavBar                  ← Refined; transparent → glass on scroll
├── Sections (pinned by GSAP ScrollTrigger)
│   ├── HeroSection         ← Cinematic void, particles, floating logos
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

1. GSAP ScrollTrigger pins each section in view sequentially
2. Between sections, a color-morphing tween transitions `--section-bg`, `--section-accent`, `--section-glow` on `:root`
3. Each section's Three.js scene fades in/out via opacity tween when it becomes active
4. `WorldBackground` uses a single `<Canvas>` that swaps scene contents based on active section
5. Smooth scroll via Lenis (matching the Modelverse reference) — preserves native scroll feel. ScrollTrigger integrates with Lenis via `lenis-scroll.js` plugin — Lenis overrides native scroll, ScrollTrigger listens to Lenis's virtual scroll position

## Visual System

### Typography

| Font | Usage | Source |
|------|-------|--------|
| Space Grotesk | Body, headings, UI text | Google Fonts |
| Fraunces | Hero display name / accent headlines | Google Fonts |
| JetBrains Mono | Mono kickers (`// 01 · HERO`), tags, code | Google Fonts |

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

### Shared Visual Elements

| Element | Description |
|---------|-------------|
| Glass panels | `background: rgba(255,255,255,0.04)`, `backdrop-filter: blur(24px)`, 1px white border at 10% opacity |
| Glass bright | Same but `rgba(255,255,255,0.07)` + `blur(40px)` for elevated surfaces |
| Noise overlay | Fixed SVG fractal noise, 5% opacity, `mix-blend-mode: overlay`, pointer-events none |
| Grid overlay | Fixed 72px grid, 2.5% opacity, radial-gradient mask fading edges, pointer-events none |
| Cursor glow | Custom dot + trailing glow, color picks up `--section-accent`, hidden on touch |
| Kicker labels | Mono uppercase, `letter-spacing: 0.35em`, ~11px, `--section-accent` like `// 02 · PROJECTS` |
| 3D tilt cards | `perspective: 1200px`, mouse-driven rotateX/Y, radial highlight at cursor position |

## Section Worlds

### 1. Hero — Cinematic Void

| Property | Value |
|----------|-------|
| Colors | `#050505` bg → `#00ff9d` accent |
| Background | Three.js particle field (200-300 stars, slow drift, mouse parallax) + floating tech logo meshes (React, TypeScript, Node, Vite) orbiting at different z-depths |
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
| Layout | Vertical timeline — left column (period + company), right column (role + bullets + tags), line connecting dots |
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
| Layout | 2-column card gallery — each card has badge image, title, issuer, date |
| Cards | Same 3D tilt as Projects; badge images get golden glow on hover |
| Animations | GSAP stagger fade-up reveal, tilt on mousemove |

### 6. Contact — The Finale

| Property | Value |
|----------|-------|
| Colors | `#050505` bg → all accents blending |
| Background | Three.js gradient orbs cycling through green → amber → purple → gold |
| Headline | "Let's Build **Something Great.** " — multi-color gradient text (all 4 accents) |
| CTA | Gradient green→purple button, glow on hover |
| Social links | Mono text, hover picks up cycling accent color |
| Footer | Minimal credit line, small |
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

### Three.js (Backgrounds)

- **Hero:** Particle field (PointsGeometry, BufferAttribute position updates, mouse parallax)
- **Projects:** Neural network (LineSegments + animated nodes)
- **Experience:** Organic shapes (low-poly IcosahedronGeometry, vertex displacement)
- **About:** Morphing blobs (SphereGeometry with animated vertex positions, dual instances for mirror)
- **Certifications:** Sparkle particles (Points, upward drift, golden color)
- **Contact:** Gradient orbs (multiple SphereGeometry with fragment shader color blending)

All Three.js scenes mounted/unmounted via conditional render in a single `<Canvas>`; transitions cross-fade via opacity.

## Accessibility

- `prefers-reduced-motion: reduce` — GSAP/Framer Motion animations disabled, Three.js scenes static (or hidden), all content immediately visible
- All text/background pairs validated ≥ 4.5:1 contrast
- Visible focus rings (section accent color) for keyboard navigation
- Cursor glow hidden on touch devices (`hover: none` media query or `ontouchstart` check)
- Semantic HTML sectioning and landmarks
- Custom scrollbar retains native functionality; Lenis is accessibility-aware

## Performance

- Single Three.js `<Canvas>` reuses renderer (no mount/unmount overhead per scene)
- Three.js scenes use low polygon counts and simple materials (no PBR, no shadows)
- Particle systems limited to 300 points max
- GSAP ScrollTrigger: passive listeners, `scrub: 1` for smooth but not overburdened updates
- Tailwind: purge unused styles in production build
- Lenis: requestAnimationFrame-based, paused when tab not visible

## Responsive

- **Desktop-first** (optimize for "desktop wow-factor" per reference prompt)
- Tablet (≤900px): sections stack vertically, split layouts collapse to single column, tilt effects simplified
- Mobile (≤700px): Three.js backgrounds hidden (performance), animations simplified, timeline becomes stacked list
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
