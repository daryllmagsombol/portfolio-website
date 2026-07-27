# Deep Space Descent — Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign darjosh.dev into a dark cinematic single-page portfolio where one fixed 2.5D layered parallax world ("Deep Space → Grid Floor") evolves behind all content as the visitor scrolls.

**Architecture:** A fixed, full-viewport `ParallaxWorld` layer stack (pure CSS/SVG, 6 layers) renders behind `<main>`. A single rAF-throttled scroll/pointer driver (`useParallax`) writes CSS custom properties (`--p`, `--p-descent`, `--p-landing`, `--mx`, `--my`) on the root element; every layer's motion is pure CSS `calc()` against those variables — zero React re-renders on scroll, GPU-composited `transform`/`opacity` only. Existing sections stay in normal flow on translucent glass surfaces. No WebGL, no new runtime dependencies.

**Tech Stack:** React 19, TypeScript, Vite, plain CSS. No test runner installed — verification is `npm run build` (tsc + vite), `npm run lint`, and described visual checks via `npm run dev` (per spec's Testing & Verification section).

**Spec:** `docs/superpowers/specs/2026-07-27-portfolio-redesign-design.md`

## Global Constraints

- Content in `src/data/` and all component props/logic stay untouched (presentation-only redesign); section copy, order, and structure unchanged.
- No new runtime dependencies. No WebGL/three.js. Dark-only design. No scroll-jacking (native scroll preserved).
- Palette: space `#05050a`, glass `#170f2a` @55%, violet `#2d1155`, primary `#8b5cf6`, moon glow `#c084fc`, horizon pink `#e879f9`, text `#f5f3ff` / `#a1a1b5` / muted `#8a8aa3`.
- Fonts unchanged: Inter + JetBrains Mono (already loaded in `index.html`).
- Animate `transform`/`opacity` only; UI transitions 150–300ms ease-out; glow on headings/CTAs only; no infinite decorative animation (starfield static).
- `prefers-reduced-motion: reduce` → parallax disabled, reveals instant, static composed scene.
- Text contrast ≥ 4.5:1; visible violet focus rings; `backdrop-filter` has an opaque `@supports` fallback.
- Commits use plain messages — **no co-author trailer, ever** (user preference).
- Verify responsive at 375 / 768 / 1024 / 1440px; no horizontal scroll.

---

### Task 1: Theme tokens & base elements

**Files:**
- Modify: `src/index.css:4-21` (`:root` tokens), `:40-49` (body), `:79-85` (`.accent`), `:100-149` (buttons + focus rings)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: CSS custom properties every later task uses: `--bg`, `--bg-alt`, `--surface`, `--border`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent`, `--accent-strong`, `--accent-glow`, `--accent-horizon`, `--accent-dim`.

- [ ] **Step 1: Replace the `:root` token block**

Replace lines 4-21 of `src/index.css` with:

```css
:root {
  --bg: #05050a;
  --bg-alt: rgba(10, 5, 24, 0.35);
  --surface: rgba(23, 15, 42, 0.55);
  --border: rgba(167, 139, 250, 0.22);
  --text-primary: #f5f3ff;
  --text-secondary: #a1a1b5;
  --text-muted: #8a8aa3;
  --accent: #a78bfa;
  --accent-strong: #8b5cf6;
  --accent-glow: #c084fc;
  --accent-horizon: #e879f9;
  --accent-dim: rgba(139, 92, 246, 0.14);
  --font-sans:
    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;
  --nav-h: 64px;
  --radius: 8px;
  --transition: 0.2s ease;
  --max-w: 1100px;
}
```

- [ ] **Step 2: Update `.accent` hover, buttons, and focus rings**

Replace `.accent:hover` (line 83-85) with:

```css
.accent:hover {
  color: var(--accent-glow);
}
```

Replace `.btn-primary` / `.btn-primary:hover` / `.btn-ghost` / `.btn-ghost:hover` (lines 113-134) with:

```css
.btn-primary {
  background: linear-gradient(135deg, var(--accent-glow), var(--accent-strong));
  color: #0a0a12;
  font-weight: 600;
  box-shadow: 0 0 18px rgba(139, 92, 246, 0.35);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 26px rgba(139, 92, 246, 0.55);
}

.btn-ghost {
  background-color: transparent;
  color: #c4b5fd;
  border: 1px solid rgba(167, 139, 250, 0.45);
}

.btn-ghost:hover {
  border-color: var(--accent);
  color: var(--text-primary);
  transform: translateY(-1px);
}
```

Replace the focus-visible rule (lines 141-149) with:

```css
.btn:focus-visible,
.nav-links a:focus-visible,
.project-links a:focus-visible,
.project-image-link:focus-visible,
.cert-card:focus-visible,
.social-links a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
```

- [ ] **Step 3: Verify build and lint**

Run: `npm run build` then `npm run lint`
Expected: both pass (token rename is value-only; no class names changed).

- [ ] **Step 4: Visual check**

Run `npm run dev`, open the printed URL. Expect: violet accents everywhere (links, tags, labels), violet gradient primary buttons, near-black page background. Layout otherwise unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "feat: swap theme tokens to deep-space violet palette"
```

---

### Task 2: Parallax data module + driver hook

**Files:**
- Create: `src/data/parallax.ts`
- Create: `src/hooks/useParallax.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `STAGES`, `STAR_COUNTS`, `MOBILE_BREAKPOINT`, `generateStars(count, seed, sizeMin, sizeMax): Star[]`, `clamp01(value): number`, `mapStage(progress, stage): number`, and the `useParallax()` hook that maintains `--p`, `--p-descent`, `--p-landing`, `--mx`, `--my` on `document.documentElement`. Task 3's layers and Task 4's CSS rely on these exact names.

- [ ] **Step 1: Create `src/data/parallax.ts`**

```ts
export type StageName = "descent" | "landing";

export const STAGES: Record<StageName, readonly [number, number]> = {
  descent: [0, 0.6],
  landing: [0.75, 1],
};

export const STAR_COUNTS = {
  desktop: { far: 90, near: 40 },
  mobile: { far: 45, near: 20 },
} as const;

export const MOBILE_BREAKPOINT = "(max-width: 700px)";

export type Star = {
  x: number;
  y: number;
  size: number;
  opacity: number;
};

export function generateStars(
  count: number,
  seed: number,
  sizeMin: number,
  sizeMax: number,
): Star[] {
  let s = seed;
  const rand = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    size: sizeMin + rand() * (sizeMax - sizeMin),
    opacity: 0.35 + rand() * 0.6,
  }));
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function mapStage(
  progress: number,
  stage: readonly [number, number],
): number {
  return clamp01((progress - stage[0]) / (stage[1] - stage[0]));
}
```

- [ ] **Step 2: Create `src/hooks/useParallax.ts`**

```ts
import { useEffect } from "react";
import { STAGES, clamp01, mapStage } from "../data/parallax";

export function useParallax() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      return;
    }

    const root = document.documentElement;
    const finePointer = window.matchMedia("(pointer: fine)");
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const flush = () => {
      frame = 0;
      const max = root.scrollHeight - root.clientHeight;
      const p = max > 0 ? clamp01(window.scrollY / max) : 0;
      root.style.setProperty("--p", p.toFixed(4));
      root.style.setProperty(
        "--p-descent",
        mapStage(p, STAGES.descent).toFixed(4),
      );
      root.style.setProperty(
        "--p-landing",
        mapStage(p, STAGES.landing).toFixed(4),
      );
      root.style.setProperty("--mx", pointerX.toFixed(4));
      root.style.setProperty("--my", pointerY.toFixed(4));
    };

    const schedule = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(flush);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      pointerY = (event.clientY / window.innerHeight) * 2 - 1;
      schedule();
    };

    flush();
    window.addEventListener("scroll", schedule, { passive: true });
    if (finePointer.matches) {
      window.addEventListener("pointermove", onPointerMove, {
        passive: true,
      });
    }

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("pointermove", onPointerMove);
      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);
}
```

- [ ] **Step 3: Verify build and lint**

Run: `npm run build` then `npm run lint`
Expected: both pass. (Nothing consumes the modules yet — `tsc -b` still type-checks them.)

- [ ] **Step 4: Commit**

```bash
git add src/data/parallax.ts src/hooks/useParallax.ts
git commit -m "feat: add parallax stage math and rAF scroll/pointer driver hook"
```

---

### Task 3: ParallaxWorld layers + static scene

**Files:**
- Create: `src/components/parallax/ParallaxWorld.tsx`
- Create: `src/components/parallax/parallax.css`
- Modify: `src/App.tsx:1-29` (imports + render)

**Interfaces:**
- Consumes: `generateStars`, `STAR_COUNTS`, `MOBILE_BREAKPOINT` from `src/data/parallax.ts` (Task 2); CSS custom property defaults `--p*`/`--m*` (defined in parallax.css `:root`).
- Produces: `<ParallaxWorld />` rendered before `<NavBar />`; layer class names `plx-stars--far`, `plx-stars--near`, `plx-nebula`, `plx-moon`, `plx-mountains--far`, `plx-mountains--near`, `plx-horizon`, `plx-grid` that Task 4's choreography CSS targets.

- [ ] **Step 1: Create `src/components/parallax/ParallaxWorld.tsx`**

```tsx
import { useMemo } from "react";
import {
  MOBILE_BREAKPOINT,
  STAR_COUNTS,
  generateStars,
} from "../../data/parallax";
import "./parallax.css";

function Stars({ variant }: { variant: "far" | "near" }) {
  const stars = useMemo(() => {
    const mobile = window.matchMedia(MOBILE_BREAKPOINT).matches;
    const counts = mobile ? STAR_COUNTS.mobile : STAR_COUNTS.desktop;
    const isFar = variant === "far";
    return generateStars(
      counts[variant],
      isFar ? 42 : 1337,
      isFar ? 1 : 1.5,
      isFar ? 2 : 2.75,
    );
  }, [variant]);

  return (
    <div className={`plx-stars plx-stars--${variant}`} aria-hidden="true">
      {stars.map((star, index) => (
        <span
          key={index}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
}

const MOUNTAIN_FAR_PATH =
  "M0,224 L120,128 L260,200 L420,96 L560,180 L720,110 L900,210 L1080,140 L1260,220 L1440,160 L1440,320 L0,320 Z";
const MOUNTAIN_NEAR_PATH =
  "M0,260 L180,150 L340,240 L520,120 L700,230 L880,150 L1060,250 L1240,170 L1440,240 L1440,320 L0,320 Z";

export function ParallaxWorld() {
  return (
    <div className="parallax-world" aria-hidden="true">
      <div className="plx-sky" />
      <Stars variant="far" />
      <Stars variant="near" />
      <div className="plx-nebula" />
      <div className="plx-moon" />
      <svg
        className="plx-mountains plx-mountains--far"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path d={MOUNTAIN_FAR_PATH} />
      </svg>
      <svg
        className="plx-mountains plx-mountains--near"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path d={MOUNTAIN_NEAR_PATH} />
      </svg>
      <div className="plx-horizon" />
      <div className="plx-grid" />
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/parallax/parallax.css` (static composition only — no scroll wiring yet)**

```css
:root {
  --p: 0;
  --p-descent: 0;
  --p-landing: 0;
  --mx: 0;
  --my: 0;
}

.parallax-world {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background: linear-gradient(180deg, #05050a 0%, #0d0620 55%, #170a2e 100%);
}

.plx-sky {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #12081f 0%, #2d1155 70%, #1e0a3c 100%);
  opacity: 0;
}

.plx-stars {
  position: absolute;
  inset: -50% 0;
  height: 200%;
}

.plx-stars span {
  position: absolute;
  border-radius: 50%;
  background: #fff;
}

.plx-stars--near span {
  background: #e9d5ff;
  box-shadow: 0 0 6px rgba(196, 181, 253, 0.8);
}

.plx-nebula {
  position: absolute;
  top: -10%;
  left: -20%;
  width: 140%;
  height: 70%;
  background:
    radial-gradient(ellipse 40% 55% at 30% 40%, rgba(124, 58, 237, 0.16), transparent 70%),
    radial-gradient(ellipse 35% 45% at 70% 30%, rgba(232, 121, 249, 0.1), transparent 70%);
}

.plx-moon {
  position: absolute;
  top: 14%;
  right: 12%;
  width: clamp(90px, 12vw, 170px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 38% 35%, #f3e8ff, #c084fc 55%, #7c3aed);
  box-shadow:
    0 0 40px rgba(192, 132, 252, 0.55),
    0 0 120px rgba(168, 85, 247, 0.3);
}

.plx-mountains {
  position: absolute;
  bottom: 0;
  left: -5%;
  width: 110%;
  height: 38vh;
  transform-origin: bottom center;
}

.plx-mountains--far {
  fill: #2e1065;
  opacity: 0.55;
}

.plx-mountains--near {
  fill: #100726;
  opacity: 0.95;
}

.plx-horizon {
  position: absolute;
  bottom: 42vh;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(232, 121, 249, 0.8), transparent);
  filter: blur(1px);
  opacity: 0;
}

.plx-grid {
  position: absolute;
  bottom: -2%;
  left: -25%;
  width: 150%;
  height: 45vh;
  background-image:
    linear-gradient(rgba(167, 139, 250, 0.35) 1px, transparent 1px),
    linear-gradient(90deg, rgba(167, 139, 250, 0.35) 1px, transparent 1px);
  background-size: 48px 48px;
  transform: perspective(600px) rotateX(62deg);
  transform-origin: bottom center;
  opacity: 0;
}
```

- [ ] **Step 3: Wire into `src/App.tsx`**

Add the import after line 10 (`import { TextParts } ...`):

```tsx
import { ParallaxWorld } from "./components/parallax/ParallaxWorld";
```

Render it first inside the fragment (before `<NavBar ... />`, line 29):

```tsx
  return (
    <>
      <ParallaxWorld />
      <NavBar links={navLinks} cta={navCta} />
```

- [ ] **Step 4: Verify build and lint**

Run: `npm run build` then `npm run lint`
Expected: both pass.

- [ ] **Step 5: Visual check**

Run `npm run dev`. Expect: deep-space scene (stars, nebula, glowing moon top-right, mountain silhouettes) visible behind the hero; grid floor and horizon line hidden (opacity 0); sections below show their old solid backgrounds over the scene. Nothing moves yet — that is Task 4.

- [ ] **Step 6: Commit**

```bash
git add src/components/parallax/ParallaxWorld.tsx src/components/parallax/parallax.css src/App.tsx
git commit -m "feat: add static ParallaxWorld deep-space scene behind content"
```

---

### Task 4: Scroll & mouse choreography

**Files:**
- Modify: `src/components/parallax/parallax.css` (add transforms to every layer + `main` stacking)
- Modify: `src/App.tsx:24-27` (call `useParallax()`)

**Interfaces:**
- Consumes: `useParallax` (Task 2) writing `--p`, `--p-descent`, `--p-landing`, `--mx`, `--my`; layer class names from Task 3.
- Produces: the full journey — moon recedes/shrinks, mountains grow, nebula fades, sky crossfades to violet, horizon + grid appear at the end.

- [ ] **Step 1: Call the hook in `src/App.tsx`**

After line 25 (`useScrollReveal();`) add:

```tsx
  useParallax();
```

Add the import:

```tsx
import { useParallax } from "./hooks/useParallax";
```

- [ ] **Step 2: Add choreography to `src/components/parallax/parallax.css`**

Append at the end of the file:

```css
/* ========================================
   Choreography — CSS calc against --p*
   ======================================== */
.plx-sky {
  opacity: calc(var(--p-descent) * 0.9);
}

.plx-stars--far {
  transform: translate3d(
    calc(var(--mx) * -8px),
    calc(var(--my) * -6px + var(--p-descent) * -12vh),
    0
  );
}

.plx-stars--near {
  transform: translate3d(
    calc(var(--mx) * -16px),
    calc(var(--my) * -12px + var(--p-descent) * -22vh),
    0
  );
  opacity: calc(1 - var(--p-descent) * 0.5);
}

.plx-nebula {
  transform: translate3d(
    calc(var(--mx) * -20px),
    calc(var(--my) * -14px + var(--p-descent) * -8vh),
    0
  );
  opacity: calc(1 - var(--p-landing));
}

.plx-moon {
  transform: translate3d(
      calc(var(--mx) * -28px),
      calc(var(--my) * -20px + var(--p-descent) * -48vh),
      0
    )
    scale(calc(1 - var(--p-descent) * 0.35));
}

.plx-mountains--far {
  transform: translate3d(calc(var(--mx) * -6px), 0, 0)
    scale(calc(1 + var(--p-descent) * 0.55));
  opacity: calc(0.55 + var(--p-descent) * 0.3 - var(--p-landing) * 0.85);
}

.plx-mountains--near {
  transform: translate3d(calc(var(--mx) * -12px), 0, 0)
    scale(calc(1 + var(--p-descent) * 1.05));
  opacity: calc(0.95 - max(0, var(--p-descent) - 0.7) * 2 - var(--p-landing));
}

.plx-horizon {
  opacity: var(--p-landing);
}

.plx-grid {
  transform: perspective(600px) rotateX(62deg)
    translate3d(0, calc((1 - var(--p-landing)) * 60%), 0);
  opacity: var(--p-landing);
}
```

Note: `max()` in `.plx-mountains--near` is intentional (peaks fade late in the descent); `min()/max()/clamp()` are supported in all modern browsers.

- [ ] **Step 3: Raise content above the world**

Append to `src/components/parallax/parallax.css`:

```css
main {
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 4: Verify build and lint**

Run: `npm run build` then `npm run lint`
Expected: both pass.

- [ ] **Step 5: Visual check — the journey**

Run `npm run dev` and scroll slowly top → bottom. Expect:
- Hero: moon large top-right; moving the mouse drifts stars/nebula/moon against the cursor (nearest layers drift most).
- Projects: sky crossfades to violet; moon smaller and higher; mountains visibly larger.
- Experience/About: near peaks at maximum size, then fading; nebula still visible.
- Certifications → Contact: horizon glow line appears; grid floor rises from below; mountains and nebula gone.
No horizontal scrollbar at any point.

- [ ] **Step 6: Commit**

```bash
git add src/components/parallax/parallax.css src/App.tsx
git commit -m "feat: wire scroll and mouse parallax choreography"
```

---

### Task 5: Glass content surfaces

**Files:**
- Modify: `src/index.css` — `.section--alt` (line 254-256), `.project-card` (399-414), `.skill-item` (584-600), `.exp-card` (611-624), `.about-cert` (700-721), `.cert-card` (732-751); append `@supports` fallback at end of file

**Interfaces:**
- Consumes: tokens from Task 1 (`--surface`, `--border`), `main` stacking from Task 4.
- Produces: glass card treatment used by all content sections; `backdrop-filter` fallback.

- [ ] **Step 1: Make alternate sections translucent**

Replace `.section--alt` (lines 254-256) with:

```css
.section--alt {
  background-color: var(--bg-alt);
}
```

(`--bg-alt` is now `rgba(10, 5, 24, 0.35)` from Task 1 — the world shows through while sections keep visual rhythm.)

- [ ] **Step 2: Glass cards**

In `.project-card` (lines 399-408), replace the `background-color` and `border` declarations with:

```css
  background-color: var(--surface);
  border: 1px solid var(--border);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
```

Apply the same three-declaration replacement (`background-color` → `var(--surface)`, `border` → `1px solid var(--border)`, add both backdrop-filter lines) in:
- `.skill-item` (line 584-590)
- `.exp-card` (line 611-618)
- `.about-cert` (line 700-709) — keep its existing `border-left: 3px solid var(--accent);` line after the generic border declaration
- `.cert-card` (line 732-742)

- [ ] **Step 3: Hover glow updates**

Replace `.project-card:hover` (lines 410-414) with:

```css
.project-card:hover {
  border-color: var(--accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(139, 92, 246, 0.18);
}
```

- [ ] **Step 4: `@supports` fallback for browsers without backdrop-filter**

Append to the end of `src/index.css`:

```css
/* ========================================
   Glass fallback — no backdrop-filter
   ======================================== */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .project-card,
  .skill-item,
  .exp-card,
  .about-cert,
  .cert-card {
    background-color: rgba(23, 15, 42, 0.94);
  }
}
```

- [ ] **Step 5: Verify build and lint**

Run: `npm run build` then `npm run lint`
Expected: both pass.

- [ ] **Step 6: Visual check**

Run `npm run dev`. Expect: the parallax world subtly visible through project/experience/cert cards and skill chips; alternate sections only faintly tinted; card text fully readable at every scroll depth (hero → contact).

- [ ] **Step 7: Commit**

```bash
git add src/index.css
git commit -m "feat: glass content surfaces over the parallax world"
```

---

### Task 6: Nav, hero, section header & footer polish

**Files:**
- Modify: `src/index.css` — `#navbar` / `#navbar.scrolled` (lines 154-170), `.hero-name` (305-312), `.hero-greeting` (298-304), `.section-label` (262-269), `.section-title` (271-276), `#footer` (841-851), `.project-overlay` (444-458), `.project-image` (420-426)

**Interfaces:**
- Consumes: tokens from Task 1; existing `useScrollShadow` toggling `#navbar.scrolled` (no JS change).
- Produces: final visual polish states.

- [ ] **Step 1: Nav — transparent at top, glass when scrolled**

Replace `#navbar` and `#navbar.scrolled` (lines 154-170) with:

```css
#navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--nav-h);
  background-color: transparent;
  border-bottom: 1px solid transparent;
  transition:
    background-color var(--transition),
    border-color var(--transition),
    backdrop-filter var(--transition);
}

#navbar.scrolled {
  background-color: rgba(10, 5, 24, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom-color: var(--border);
}
```

Also update the mobile menu open state background so it stays readable over the world — in the `@media (max-width: 700px)` block, find `.nav-links` (line 925-937) and change `background-color: var(--bg);` to:

```css
    background-color: rgba(10, 5, 24, 0.96);
```

- [ ] **Step 2: Hero glow (headings/CTA only — minimal glow rule)**

Replace `.hero-name` (lines 305-312) with:

```css
.hero-name {
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 1.05;
  color: var(--text-primary);
  text-shadow:
    0 0 40px rgba(167, 139, 250, 0.45),
    0 0 12px rgba(167, 139, 250, 0.2);
  margin-bottom: 0.75rem;
}
```

Replace `.hero-greeting` (lines 298-304) with:

```css
.hero-greeting {
  font-size: 1rem;
  color: var(--accent-horizon);
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}
```

- [ ] **Step 3: Section headers — horizon-pink kicker + glowing title**

Replace `.section-label` (lines 262-269) with:

```css
.section-label {
  font-size: 0.8rem;
  color: var(--accent-horizon);
  letter-spacing: 0.1em;
  text-transform: lowercase;
  display: block;
  margin-bottom: 0.5rem;
}
```

Replace `.section-title` (lines 271-276) with:

```css
.section-title {
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  text-shadow: 0 0 24px rgba(167, 139, 250, 0.4);
}
```

- [ ] **Step 4: Project image overlay + footer merge**

Replace `.project-overlay` background (line 447) `background: rgba(13, 13, 13, 0.7);` with:

```css
  background: rgba(10, 5, 24, 0.72);
```

Replace `.project-image` `background-color: #0a0a0a;` (line 425) with:

```css
  background-color: #0a0514;
```

Replace `#footer` (lines 841-845) with:

```css
#footer {
  position: relative;
  z-index: 1;
  padding: 2rem;
  text-align: center;
}
```

(Removing `border-top` lets the footer merge into the grid floor scene.)

- [ ] **Step 5: Verify build and lint**

Run: `npm run build` then `npm run lint`
Expected: both pass.

- [ ] **Step 6: Visual check**

Run `npm run dev`. Expect: nav fully transparent over hero, gaining a violet-tinted glass bar after ~20px of scroll; hero name softly glowing; section kickers in horizon pink; footer text floating over the grid floor with no separating border.

- [ ] **Step 7: Commit**

```bash
git add src/index.css
git commit -m "feat: polish nav, hero, section headers, and footer for the journey"
```

---

### Task 7: Reduced motion & accessibility hardening

**Files:**
- Modify: `src/components/parallax/parallax.css` (append reduced-motion block)
- Modify: `src/index.css` (append reduced-motion block for reveals/cursor/scroll-hint)

**Interfaces:**
- Consumes: everything above.
- Produces: WCAG-honoring static fallback; no behavior change for motion-allowed users.

- [ ] **Step 1: Freeze the world for reduced motion**

Append to `src/components/parallax/parallax.css`:

```css
/* ========================================
   Reduced motion — static composed scene
   ======================================== */
@media (prefers-reduced-motion: reduce) {
  .plx-sky {
    opacity: 0;
  }

  .plx-stars--far,
  .plx-stars--near,
  .plx-nebula,
  .plx-moon,
  .plx-mountains--far,
  .plx-mountains--near,
  .plx-horizon,
  .plx-grid {
    transform: none !important;
  }

}
```

(This pins every layer to its untransformed initial composition — the deep-space scene. With `useParallax` skipping its listeners under reduced motion, all `--p*` variables stay 0, so every choreographed `opacity` already resolves to its correct static value: grid and horizon hidden, mountains and stars at their initial opacities. Only the transforms need forcing off.)

- [ ] **Step 2: Instant reveals + no decorative animation for reduced motion**

Append to `src/index.css`:

```css
/* ========================================
   Reduced motion
   ======================================== */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  .reveal {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }

  .cursor,
  .scroll-line {
    animation: none !important;
  }
}
```

- [ ] **Step 3: Verify build and lint**

Run: `npm run build` then `npm run lint`
Expected: both pass.

- [ ] **Step 4: Manual reduced-motion check**

Run `npm run dev`. In Chrome DevTools → Rendering → emulate CSS media feature `prefers-reduced-motion: reduce`. Expect: starfield/moon/mountains frozen (no mouse or scroll movement), all content visible immediately without fade-in, cursor and scroll-line static. Toggle the emulation off and confirm the parallax returns.

- [ ] **Step 5: Contrast spot-check**

In DevTools, inspect: (a) `.section-note` / muted text over glass, (b) `.section-label` horizon pink, (c) `.btn-ghost` text. Use the color-picker contrast readout. Expect ≥ 4.5:1 for (a) and (b); (c) is large/interactive text, ≥ 3:1 acceptable. If (a) fails, raise `--text-muted` lightness (e.g. `#9a9ab0`) and re-check.

- [ ] **Step 6: Commit**

```bash
git add src/components/parallax/parallax.css src/index.css
git commit -m "feat: honor reduced-motion and verify contrast"
```

---

### Task 8: Final QA sweep

**Files:**
- None (verification only; fix-forward if a check fails)

**Interfaces:**
- Consumes: the complete redesign.
- Produces: go/no-go for merge.

- [ ] **Step 1: Full build + lint**

Run: `npm run build && npm run lint`
Expected: both pass clean.

- [ ] **Step 2: Journey check at four widths**

Run `npm run dev`. At each viewport width — 375, 768, 1024, 1440 (DevTools device toolbar) — scroll hero → contact. Expect: no horizontal scrollbar; journey beats match the storyboard (deep space → descent → peaks → calm → grid rise → touchdown); cards readable; mobile shows fewer stars but the full scene sequence.

- [ ] **Step 3: Interaction check**

Keyboard: Tab through nav links, buttons, project links, cert cards — violet focus ring visible on every stop; Enter activates. Mouse: hover states transition smoothly (150–300ms). Anchor nav: clicking "Projects" smooth-scrolls (instant under reduced-motion emulation).

- [ ] **Step 4: Production preview**

Run: `npm run build && npm run preview`, open the preview URL, repeat the scroll-through once. Expect: identical behavior to dev.

- [ ] **Step 5: Lighthouse spot-check**

Chrome DevTools → Lighthouse (desktop, Performance + Accessibility categories) against the preview URL. Expect: no contrast errors under Accessibility; Performance reasonable for a CSS/SVG-only page (no large JS added — bundle should be within a few KB of the pre-redesign size). Investigate only regressions, not the absolute score.

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix: final QA adjustments"
```

(If no fixes were needed, skip the commit.)
