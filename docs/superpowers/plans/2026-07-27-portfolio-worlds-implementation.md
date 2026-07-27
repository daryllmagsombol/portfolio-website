# Portfolio "Worlds" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace darjosh.dev's existing design with an immersive scroll-reactive portfolio where each section is a visually distinct "world" with per-section color palette, animation language, and Three.js background scene.

**Architecture:** React 19 + Vite app with Tailwind CSS styling, GSAP ScrollTrigger for scroll-driven animation, Framer Motion for entrance/micro-interactions, and Three.js/R3F for per-section background scenes. Single `<Canvas>` reuses renderer across scenes. Lenis smooth scroll. Pin only Hero section; other sections use non-pinned scrub triggers.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, GSAP 3 + ScrollTrigger + `@gsap/react`, Framer Motion 12, Three.js + `@react-three/fiber` + `@react-three/drei`, Lenis, `lenis-scroll.js` (Lenis ScrollTrigger plugin)

## Global Constraints

- Content data files in `src/data/` remain unchanged (presentation-only redesign)
- Remove emoji-as-icons from data files (replace `🚧` in `sections.ts` projects note with text/SVG)
- Dark-only theme; no light mode support
- All GSAP animations use `transform` and `opacity` only — never width/height/top/left
- Three.js scenes use simple materials (no PBR, no shadows), ≤300 particles, lazy-mount ±1 scene
- Three.js scenes pause via Page Visibility API when tab hidden
- Reduced motion: Three.js fully unmounted, animations disabled
- Cursor hidden on touch via `matchMedia('(hover: none)')`
- Only Hero section pinned; all others use non-pinned scrub triggers
- Space Grotesk (primary) + Fraunces (hero display) + JetBrains Mono (code/tags) from Google Fonts
- Responsive: 420px / 700px / 900px / 1440px breakpoints

---
## File Structure

```
src/
├── components/
│   ├── CursorGlow.tsx              ← Custom cursor tracking mouse, color adapts per section
│   ├── NoiseOverlay.tsx            ← SVG fractal noise, 5% opacity, fixed
│   ├── GridOverlay.tsx             ← 72px grid pattern with radial fade mask, fixed
│   ├── WorldBackground.tsx         ← Single R3F Canvas, swaps scenes per active section
│   ├── scenes/
│   │   ├── HeroScene.tsx           ← 200-300 star particles + floating tech logos
│   │   ├── NeuralScene.tsx         ← Neural network lines + pulsing nodes
│   │   ├── WarmShapesScene.tsx     ← Low-poly organic shapes floating slowly
│   │   ├── BlobScene.tsx           ← Morphing blobs, mirrored, blue↔purple
│   │   ├── GoldParticlesScene.tsx  ← Gold sparkle particles drifting upward
│   │   └── ColorBlendScene.tsx     ← Gradient orbs cycling all accent colors
│   ├── sections/
│   │   ├── HeroSection.tsx         ← Fullscreen, particles, typewriter, CTA
│   │   ├── ProjectSection.tsx      ← Tilt glass cards, neural background
│   │   ├── ExperienceSection.tsx   ← Timeline cards, warm shapes background
│   │   ├── AboutSection.tsx        ← Split bio/skills, blob background
│   │   ├── CertificationsSection.tsx ← Single cert card, gold particles
│   │   └── ContactSection.tsx      ← Finale, gradient orbs, CTA, socials, footer
│   └── ui/
│       ├── GlassCard.tsx           ← Base glass panel wrapper
│       ├── TiltCard.tsx            ← 3D tilt wrapper (mouse rotateX/Y + radial highlight)
│       └── SectionHeader.tsx       ← Mono kicker + glowing title
├── hooks/
│   ├── useScrollAnimation.ts       ← GSAP ScrollTrigger + Lenis setup
│   └── useActiveSection.ts         ← Extended for GSAP integration
├── styles/
│   └── worlds.css                  ← Tailwind layers + design token CSS variables
├── App.tsx                         ← Wire everything: overlays, WorldBg, Nav, sections
├── index.css                       ← Replace entirely with Tailwind directives
└── vite.config.ts                  ← Add tailwind plugin
```

---

### Task 1: Project Setup — Dependencies, Config, Fonts

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Modify: `index.html`

- [ ] **Step 1: Install new dependencies**

Run:
```bash
npm install tailwindcss @tailwindcss/vite gsap @gsap/react framer-motion three @react-three/fiber @react-three/drei lenis lenis-scroll.js
```

- [ ] **Step 2: Configure Tailwind via Vite plugin**

Replace `vite.config.ts` contents:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
});
```

- [ ] **Step 3: Add Google Fonts to `index.html`**

Find the `<head>` in `index.html` and add before the closing `</head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,400&family=JetBrains+Mono:wght@400;500&family=Inter:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 4: Replace `src/index.css` with Tailwind base**

```css
@import "tailwindcss";

/* ========================================
   Design Tokens
   ======================================== */
:root {
  color-scheme: dark;
  --section-bg: #050505;
  --section-accent: #00ff9d;
  --section-glow: rgba(0, 255, 157, 0.15);
  --section-glass: rgba(255, 255, 255, 0.04);
  --font-sans: "Space Grotesk", sans-serif;
  --font-serif: "Fraunces", serif;
  --font-mono: "JetBrains Mono", monospace;
  --transition: 0.3s ease;
  --radius: 8px;
  --glass-blur: 24px;
  --max-w: 1100px;
}

/* ========================================
   Reset & Base
   ======================================== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  scroll-behavior: smooth;
  scrollbar-color: var(--section-accent) transparent;
  font-size: 16px;
  overflow-x: hidden;
}

body {
  background-color: var(--section-bg);
  color: #f5f3ff;
  font-family: var(--font-sans);
  font-weight: 400;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

::selection {
  background: color-mix(in srgb, var(--section-accent) 35%, transparent);
  color: #fff;
}

/* Custom scrollbar */
::-webkit-scrollbar { width: 9px; }
::-webkit-scrollbar-track { background: #050505; }
::-webkit-scrollbar-thumb {
  background: var(--section-accent);
  border-radius: 99px;
  border: 2px solid #050505;
}

/* ========================================
   Tailwind theme extensions
   ======================================== */
@theme {
  --font-sans: "Space Grotesk", sans-serif;
  --font-serif: "Fraunces", serif;
  --font-mono: "JetBrains Mono", monospace;
  --color-accent: var(--section-accent);
}

/* ========================================
   Utility classes
   ======================================== */
.glass {
  background: var(--section-glass);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-bright {
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.kicker {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  color: var(--section-accent);
}

@media (max-width: 900px) {
  .kicker { font-size: 10px; letter-spacing: 0.25em; }
}
@media (max-width: 700px) {
  .kicker { font-size: 9px; letter-spacing: 0.2em; }
}

/* Scroll reveal base */
.reveal { opacity: 0; transform: translateY(24px); }
.reveal.visible { opacity: 1; transform: translateY(0); transition: opacity 0.6s ease, transform 0.6s ease; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .reveal { opacity: 1 !important; transform: none !important; }
}
```

- [ ] **Step 5: Verify setup builds**

Run: `npm run build`
Expected: Build succeeds, no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.ts index.html src/index.css
git commit -m "feat: add Tailwind, GSAP, Framer Motion, Three.js deps and base styles"
```

---

### Task 2: Animation Infrastructure — Lenis + useScrollAnimation

**Files:**
- Create: `src/hooks/useScrollAnimation.ts`
- Create: `src/styles/worlds.css`

- [ ] **Step 1: Create `src/styles/worlds.css`**

This file holds the per-section color variable classes and any Tailwind layers that need separate organization. Start with section color classes:

```css
/* worlds.css — Section world color themes */
.section-world { background-color: var(--section-bg); transition: background-color 0.6s ease; }

/* World-specific accent CSS variables are set via JS on :root */
```

- [ ] **Step 2: Create `src/hooks/useScrollAnimation.ts`**

This hook initializes Lenis smooth scroll, registers GSAP ScrollTrigger, and provides the Lenis instance for the app. It also manages the section color transitions.

```ts
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis-scroll.js"; // registers ScrollTrigger plugin for Lenis

gsap.registerPlugin(ScrollTrigger);

// Section world color configs matching data section order
export interface SectionColorConfig {
  bg: string;
  accent: string;
  glow: string;
}

export const sectionColors: SectionColorConfig[] = [
  { bg: "#050505", accent: "#00ff9d", glow: "rgba(0, 255, 157, 0.15)" },    // Hero
  { bg: "#0a1a10", accent: "#00ff9d", glow: "rgba(0, 255, 157, 0.15)" },    // Projects
  { bg: "#1a0e06", accent: "#d97757", glow: "rgba(217, 119, 87, 0.15)" },   // Experience
  { bg: "#060d1a", accent: "#a78bfa", glow: "rgba(167, 139, 250, 0.15)" },  // About
  { bg: "#1a1206", accent: "#f59e0b", glow: "rgba(245, 158, 11, 0.15)" },   // Certifications
  { bg: "#050505", accent: "#00ff9d", glow: "rgba(0, 255, 157, 0.15)" },    // Contact
];

export function useScrollAnimation() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    (gsap.ticker as any).add(lenis.raf.bind(lenis));
    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger after fonts/layout settle
    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 500);

    return () => {
      clearTimeout(refreshTimer);
      lenis.destroy();
      (gsap.ticker as any).remove(lenis.raf.bind(lenis));
    };
  }, []);

  return lenisRef;
}

/**
 * Morph section colors on :root using GSAP.
 * Call from section components or from a global scroll watcher.
 */
export function morphSectionColors(index: number, duration = 0.6) {
  const colors = sectionColors[index];
  if (!colors) return;
  gsap.to(":root", {
    "--section-bg": colors.bg,
    "--section-accent": colors.accent,
    "--section-glow": colors.glow,
    duration,
    ease: "power2.inOut",
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useScrollAnimation.ts src/styles/worlds.css
git commit -m "feat: add Lenis smooth scroll, GSAP ScrollTrigger, section color morphing"
```

---

### Task 3: Shared UI Components

**Files:**
- Create: `src/components/ui/GlassCard.tsx`
- Create: `src/components/ui/TiltCard.tsx`
- Modify: `src/components/SectionHeader.tsx`

- [ ] **Step 1: Create `src/components/ui/GlassCard.tsx`**

```tsx
type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  bright?: boolean;
};

export function GlassCard({ children, className = "", bright = false }: GlassCardProps) {
  return (
    <div
      className={`${
        bright ? "glass-bright" : "glass"
      } rounded-2xl p-5 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/ui/TiltCard.tsx`**

```tsx
import { useRef, useCallback, useEffect, useState } from "react";

type TiltCardProps = {
  children: React.ReactNode;
  className?: string;
  sensitivity?: number;
};

export function TiltCard({ children, className = "", sensitivity = 15 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHoverable, setIsHoverable] = useState(false);

  useEffect(() => {
    setIsHoverable(window.matchMedia("(hover: hover)").matches);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || !isHoverable) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cardRef.current.style.transform = `perspective(1200px) rotateY(${x * sensitivity}deg) rotateX(${-y * sensitivity}deg)`;
      cardRef.current.style.setProperty("--mx", `${(e.clientX - rect.left) / rect.width * 100}%`);
      cardRef.current.style.setProperty("--my", `${(e.clientY - rect.top) / rect.height * 100}%`);
    },
    [isHoverable, sensitivity]
  );

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(1200px) rotateY(0deg) rotateX(0deg)";
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`tilt-card relative transition-transform duration-300 ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-400 group-hover:opacity-100"
        style={{
          background: `radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.12), transparent 65%)`,
        }}
      />
    </div>
  );
}
```

- [ ] **Step 3: Refactor `SectionHeader.tsx`**

Replace existing content:
```tsx
import type { SectionHeaderData } from "../types";

type SectionHeaderProps = SectionHeaderData & {
  index: number; // section number for prefix
};

export function SectionHeader({ label, title, note, index }: SectionHeaderProps) {
  return (
    <div className="section-header mb-8">
      <p className="kicker mb-2">
        // {String(index).padStart(2, "0")} · {label.toUpperCase()}
      </p>
      <h2 className="text-[clamp(1.8rem,3vw,2.4rem)] font-semibold tracking-tight text-[#f5f3ff]">
        {title}
      </h2>
      {note && (
        <p className="mt-2 text-sm text-[#9a9ab0] leading-relaxed">{note}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/GlassCard.tsx src/components/ui/TiltCard.tsx src/components/SectionHeader.tsx
git commit -m "feat: add shared UI components — GlassCard, TiltCard, SectionHeader"
```

---

### Task 4: Overlays — CursorGlow, NoiseOverlay, GridOverlay

**Files:**
- Create: `src/components/CursorGlow.tsx`
- Create: `src/components/NoiseOverlay.tsx`
- Create: `src/components/GridOverlay.tsx`

- [ ] **Step 1: Create `src/components/CursorGlow.tsx`**

```tsx
import { useEffect, useState } from "react";

export function CursorGlow() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isHover = window.matchMedia("(hover: hover)").matches;
    if (!isHover) return;

    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    const leave = () => setVisible(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed z-[100] transition-opacity duration-300"
      style={{
        left: pos.x,
        top: pos.y,
        opacity: visible ? 1 : 0,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Outer glow */}
      <div
        className="h-8 w-8 rounded-full blur-xl"
        style={{ backgroundColor: "var(--section-accent)", opacity: 0.3 }}
      />
      {/* Inner dot */}
      <div
        className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ backgroundColor: "var(--section-accent)" }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/NoiseOverlay.tsx`**

```tsx
export function NoiseOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.05]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "180px 180px",
        mixBlendMode: "overlay",
      }}
    />
  );
}
```

- [ ] **Step 3: Create `src/components/GridOverlay.tsx`**

```tsx
export function GridOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[55]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 78%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 78%)",
      }}
    />
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/CursorGlow.tsx src/components/NoiseOverlay.tsx src/components/GridOverlay.tsx
git commit -m "feat: add cursor glow, noise overlay, grid overlay components"
```

---

### Task 5: useActiveSection Hook (GSAP Integration)

**Files:**
- Modify: `src/hooks/useActiveSection.ts`

- [ ] **Step 1: Extend `useActiveSection.ts`**

Replace with an IntersectionObserver-based hook that returns the current section index:

```ts
import { useState, useEffect } from "react";

const SECTION_IDS = ["hero", "projects", "experience", "about", "certifications", "contact"];

export function useActiveSection(): number {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const index = SECTION_IDS.indexOf(id);
            if (index >= 0) setActive(index);
          }
        },
        { threshold: 0.35 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return active;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useActiveSection.ts
git commit -m "feat: extend useActiveSection for section index tracking"
```

---

### Task 6: World Background — Three.js Canvas + Scene System

**Files:**
- Create: `src/components/WorldBackground.tsx`
- Create: `src/components/scenes/HeroScene.tsx`
- Create: `src/components/scenes/NeuralScene.tsx`
- Create: `src/components/scenes/WarmShapesScene.tsx`
- Create: `src/components/scenes/BlobScene.tsx`
- Create: `src/components/scenes/GoldParticlesScene.tsx`
- Create: `src/components/scenes/ColorBlendScene.tsx`

- [ ] **Step 1: Create scene components**

Each scene is a React Three Fiber component that receives no props and renders a simple animated background. Create six files:

**`src/components/scenes/HeroScene.tsx`** — Star particles + floating cubes:
```tsx
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function HeroScene() {
  const count = 250;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    return pos;
  }, []);

  const ref = useRef<THREE.Points>(null!);
  useFrame(({ clock, pointer }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.02;
      ref.current.rotation.x = pointer.y * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00ff9d"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}
```

**`src/components/scenes/NeuralScene.tsx`** — Neural network lines:
```tsx
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function NeuralScene() {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 30; i++) {
      pts.push(new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4));
    }
    return pts;
  }, []);

  const lineRef = useRef<THREE.LineSegments>(null!);
  const nodeRef = useRef<THREE.Points>(null!);

  const [linePositions, nodePositions] = useMemo(() => {
    const pairs: number[] = [];
    const nodes: number[] = [];
    for (let i = 0; i < points.length; i++) {
      nodes.push(points[i].x, points[i].y, points[i].z);
      for (let j = i + 1; j < points.length; j++) {
        const dist = points[i].distanceTo(points[j]);
        if (dist < 3) {
          pairs.push(points[i].x, points[i].y, points[i].z, points[j].x, points[j].y, points[j].z);
        }
      }
    }
    return [new Float32Array(pairs), new Float32Array(nodes)];
  }, [points]);

  useFrame(({ clock }) => {
    if (nodeRef.current) {
      const sizes = nodeRef.current.geometry.attributes.size as THREE.BufferAttribute;
      for (let i = 0; i < points.length; i++) {
        sizes.array[i] = 0.04 + Math.sin(clock.getElapsedTime() * 0.5 + i) * 0.02;
      }
      sizes.needsUpdate = true;
    }
  });

  return (
    <group>
      {linePositions.length > 0 && (
        <lineSegments ref={lineRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#00ff9d" transparent opacity={0.08} />
        </lineSegments>
      )}
      <points ref={nodeRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#00ff9d" size={0.06} transparent opacity={0.3} sizeAttenuation />
      </points>
    </group>
  );
}
```

**`src/components/scenes/WarmShapesScene.tsx`** — Low-poly organic shapes:
```tsx
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function WarmShapesScene() {
  const meshes = useMemo(() => {
    const m = [];
    for (let i = 0; i < 4; i++) {
      const geo = new THREE.IcosahedronGeometry(0.3 + Math.random() * 0.4, 1);
      const pos = new THREE.Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 5, -2 - Math.random() * 2);
      const speed = 0.1 + Math.random() * 0.2;
      m.push({ geo, pos, speed, rotSpeed: (Math.random() - 0.5) * 0.3 });
    }
    return m;
  }, []);

  const refs = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    refs.current.forEach((mesh, i) => {
      if (mesh) {
        mesh.rotation.x += meshes[i].rotSpeed * 0.01;
        mesh.rotation.y += meshes[i].rotSpeed * 0.01;
        mesh.position.y = meshes[i].pos.y + Math.sin(clock.getElapsedTime() * meshes[i].speed) * 0.3;
      }
    });
  });

  return (
    <group>
      {meshes.map((m, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) refs.current[i] = el; }}
          geometry={m.geo}
          position={m.pos}
        >
          <meshBasicMaterial color="#d97757" transparent opacity={0.06} wireframe />
        </mesh>
      ))}
    </group>
  );
}
```

**`src/components/scenes/BlobScene.tsx`** — Morphing mirrored blobs:
```tsx
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function BlobScene() {
  const blob1Ref = useRef<THREE.Mesh>(null!);
  const blob2Ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.3;
    [blob1Ref, blob2Ref].forEach((ref) => {
      if (ref.current) {
        const geo = ref.current.geometry as THREE.SphereGeometry;
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
          const distort = 0.15 * Math.sin(x * 2 + t) * Math.cos(z * 2 + t * 0.7);
          pos.setXYZ(i, x, y + distort, z);
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
      }
    });
  });

  return (
    <group>
      <mesh ref={blob1Ref} position={[-1.2, 0, -2]}>
        <sphereGeometry args={[0.8, 24, 24]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.08} wireframe />
      </mesh>
      <mesh ref={blob2Ref} position={[1.2, 0, -2]} scale={[-1, 1, 1]}>
        <sphereGeometry args={[0.8, 24, 24]} />
        <meshBasicMaterial color="#4b8bf5" transparent opacity={0.08} wireframe />
      </mesh>
    </group>
  );
}
```

**`src/components/scenes/GoldParticlesScene.tsx`** — Gold sparkle particles:
```tsx
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function GoldParticlesScene() {
  const count = 60;
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      spd[i] = 0.1 + Math.random() * 0.3;
    }
    return [pos, spd];
  }, []);

  const ref = useRef<THREE.Points>(null!);

  useFrame(({ clock }) => {
    if (ref.current) {
      const pos = ref.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        const y = pos.array[i * 3 + 1] + speeds[i] * 0.005;
        pos.array[i * 3 + 1] = y > 3 ? -3 : y;
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#f59e0b" size={0.04} transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}
```

**`src/components/scenes/ColorBlendScene.tsx`** — Gradient orbs:
```tsx
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COLORS = [0x00ff9d, 0xd97757, 0xa78bfa, 0xf59e0b];

export function ColorBlendScene() {
  const orbRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (orbRef.current) {
      const t = clock.getElapsedTime() * 0.1;
      const idx = Math.floor(t) % COLORS.length;
      const next = (idx + 1) % COLORS.length;
      const mix = t - Math.floor(t);
      const color = new THREE.Color(COLORS[idx]).lerp(new THREE.Color(COLORS[next]), mix);
      (orbRef.current.material as THREE.MeshBasicMaterial).color.copy(color);
      orbRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={orbRef} position={[0, 0, -3]}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshBasicMaterial color="#00ff9d" transparent opacity={0.06} wireframe />
    </mesh>
  );
}
```

- [ ] **Step 2: Create `WorldBackground.tsx`**

This component renders a single `<Canvas>` and conditionally renders one scene based on the active section index.

```tsx
import { Canvas } from "@react-three/fiber";
import { HeroScene } from "./scenes/HeroScene";
import { NeuralScene } from "./scenes/NeuralScene";
import { WarmShapesScene } from "./scenes/WarmShapesScene";
import { BlobScene } from "./scenes/BlobScene";
import { GoldParticlesScene } from "./scenes/GoldParticlesScene";
import { ColorBlendScene } from "./scenes/ColorBlendScene";
import { useActiveSection } from "../hooks/useActiveSection";

const scenes = [
  HeroScene,
  NeuralScene,
  WarmShapesScene,
  BlobScene,
  GoldParticlesScene,
  ColorBlendScene,
];

export function WorldBackground() {
  const activeSection = useActiveSection();

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[0.5, 1.5]} // cap DPR for mobile perf
        gl={{ antialias: false, alpha: true }}
      >
        {scenes.map((Scene, i) => {
          const isActive = i === activeSection;
          const isAdjacent = Math.abs(i - activeSection) <= 1;
          return (isActive || isAdjacent) ? <Scene key={i} /> : null;
        })}
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/WorldBackground.tsx src/components/scenes/
git commit -m "feat: add Three.js world background with 6 scene components"
```

---

### Task 7: Hero Section + Hero Nav Integration

**Files:**
- Create: `src/components/sections/HeroSection.tsx`
- Modify: `src/components/NavBar.tsx` (adapt to section colors)

- [ ] **Step 1: Create `src/components/sections/HeroSection.tsx`**

```tsx
import { motion } from "framer-motion";
import { useTypewriter } from "../hooks/useTypewriter";
import { ButtonLink } from "../components/ButtonLink";
import { TextParts } from "../components/TextParts";
import type { HeroContent } from "../types";

type HeroSectionProps = { content: HeroContent };

export function HeroSection({ content }: HeroSectionProps) {
  const typedText = useTypewriter(content.roles);

  return (
    <section id="hero" className="relative flex min-h-screen flex-col justify-center px-8 pt-20" style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
        <p className="kicker mb-3">{content.greeting}</p>
        <h1 className="font-serif text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[1.05] tracking-tight text-[#f5f3ff]">
          {content.name}
          <span style={{ color: "var(--section-accent)" }}>.</span>
        </h1>
        <h2 className="mb-6 font-mono text-[clamp(1.1rem,2.5vw,1.6rem)] font-light text-[#a1a1b5] min-h-[2.5rem]">
          <span>{typedText}</span>
          <span className="inline-block animate-pulse ml-0.5" style={{ color: "var(--section-accent)" }}>|</span>
        </h2>
        <p className="mb-8 max-w-[520px] text-base leading-relaxed text-[#a1a1b5]">
          <TextParts parts={content.descriptionParts} />
        </p>
        <div className="flex flex-wrap gap-3">
          {content.cta.map((cta) => (
            <ButtonLink key={cta.label} {...cta} />
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-8 flex flex-col items-center gap-2"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 3, duration: 1 }}
      >
        <span className="kicker text-[10px]" style={{ writingMode: "vertical-rl" }}>scroll</span>
        <div className="h-[50px] w-px" style={{ background: `linear-gradient(to bottom, var(--section-accent), transparent)` }} />
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Update `NavBar.tsx` to consume `--section-accent`**

Read the current navbar component and update its styling. The key changes:
- Active link: `color: var(--section-accent)`
- GitHub CTA button: `border-color: var(--section-accent)` on hover/active
- Logo uses a fixed `#f5f3ff` (never changes)

Find the `.nav-links a.is-active` or similar active link selector and add `style={{ color: 'var(--section-accent)' }}` or update the CSS to use the variable.

Key CSS to add to `src/index.css` under the Nav section:
```css
#navbar .nav-links a.is-active {
  color: var(--section-accent);
}
#navbar .nav-github {
  border-color: var(--section-accent);
  color: var(--section-accent) !important;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/HeroSection.tsx src/components/NavBar.tsx src/index.css
git commit -m "feat: add Hero section with typewriter, scroll indicator, NavBar color adaptation"
```

---

### Task 8: Projects Section

**Files:**
- Create: `src/components/sections/ProjectSection.tsx`

- [ ] **Step 1: Create `src/components/sections/ProjectSection.tsx`**

```tsx
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { TiltCard } from "../components/ui/TiltCard";
import { TextParts } from "../components/TextParts";
import type { Project, SectionHeaderData } from "../types";

type ProjectSectionProps = {
  projects: Project[];
  header: SectionHeaderData;
  sectionIndex: number;
  noteParts: any[];
};

export function ProjectSection({ projects, header, sectionIndex, noteParts }: ProjectSectionProps) {
  const sectionRef = useRef<HTMLElement>(null!);
  const cardsRef = useRef<HTMLDivElement>(null!);

  useGSAP(() => {
    const cards = cardsRef.current?.children;
    if (cards) {
      gsap.from(cards, {
        opacity: 0,
        y: 40,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }
  }, { scope: sectionRef });

  return (
    <section id="projects" ref={sectionRef} className="section-world section px-8 py-28" style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
      <div className="container mx-auto">
        <SectionHeader {...header} index={sectionIndex} />
        <div ref={cardsRef} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {projects.map((project) => (
            <TiltCard key={project.title}>
              <div className="glass rounded-2xl overflow-hidden">
                <a
                  href={project.primaryLink?.href || "#"}
                  target={project.primaryLink?.href?.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group relative block aspect-video overflow-hidden bg-[#0a0514]"
                >
                  <img
                    src={project.image.src}
                    alt={project.image.alt}
                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${project.image.contain ? "object-contain p-4" : ""}`}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="font-mono text-sm" style={{ color: "var(--section-accent)" }}>{project.image.overlayText}</span>
                  </div>
                </a>
                <div className="p-5">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold tracking-tight text-[#f5f3ff]">
                      {project.title}
                      {project.badge && <span className="ml-1.5 text-xs opacity-50">{project.badge}</span>}
                    </h3>
                    {project.links?.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#9a9ab0] transition-colors hover:opacity-80"
                        style={{ hover: { color: "var(--section-accent)" } } as any}
                        title={link.title}
                      >
                        ↗
                      </a>
                    ))}
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-[#a1a1b5]">{project.description}</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded px-2 py-0.5 font-mono text-[0.72rem] tracking-wide transition-colors"
                        style={{
                          backgroundColor: "color-mix(in srgb, var(--section-accent) 10%, transparent)",
                          color: "var(--section-accent)",
                        }}
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
        {noteParts.length > 0 && (
          <p className="mt-6 text-center text-sm italic text-[#9a9ab0]">
            <TextParts parts={noteParts} />
          </p>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/ProjectSection.tsx
git commit -m "feat: add Projects section with tilt glass cards and stagger reveal"
```

---

### Task 9: Experience Section

**Files:**
- Create: `src/components/sections/ExperienceSection.tsx`

- [ ] **Step 1: Create `src/components/sections/ExperienceSection.tsx`**

```tsx
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { TextParts } from "../components/TextParts";
import type { Experience, SectionHeaderData } from "../types";

type ExperienceSectionProps = {
  items: Experience[];
  header: SectionHeaderData;
  sectionIndex: number;
};

export function ExperienceSection({ items, header, sectionIndex }: ExperienceSectionProps) {
  const sectionRef = useRef<HTMLElement>(null!);
  const entriesRef = useRef<HTMLDivElement>(null!);
  const lineRef = useRef<HTMLDivElement>(null!);

  useGSAP(() => {
    const entries = entriesRef.current?.children;
    if (entries) {
      // Draw timeline line
      gsap.from(lineRef.current, {
        scaleY: 0,
        transformOrigin: "top center",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          end: "bottom 20%",
          scrub: 1,
          toggleActions: "play none none none",
        },
      });

      // Reveal entries
      gsap.from(entries, {
        opacity: 0,
        x: -20,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          toggleActions: "play none none none",
        },
      });

      // Activate dots
      Array.from(entries).forEach((entry, i) => {
        const dot = entry.querySelector(".timeline-dot");
        if (dot) {
          gsap.to(dot, {
            scale: 1.3,
            opacity: 1,
            scrollTrigger: {
              trigger: entry,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          });
        }
      });
    }
  }, { scope: sectionRef });

  return (
    <section id="experience" ref={sectionRef} className="section-world section px-8 py-28" style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
      <div className="container relative mx-auto">
        <SectionHeader {...header} index={sectionIndex} />

        {/* Timeline line */}
        <div
          ref={lineRef}
          className="absolute left-[100px] top-0 h-full w-px origin-top"
          style={{ background: `linear-gradient(to bottom, var(--section-accent), transparent)` }}
        />

        <div ref={entriesRef} className="flex flex-col gap-6">
          {items.map((item) => (
            <div key={item.period} className="relative pl-[120px]">
              {/* Dot */}
              <div className="timeline-dot absolute left-[93px] top-1.5 h-[9px] w-[9px] rounded-full opacity-60" style={{ backgroundColor: "var(--section-accent)", boxShadow: `0 0 8px var(--section-accent)` }} />

              {/* Period badge */}
              <div className="mb-1">
                <span className="font-mono text-xs tracking-wide" style={{ color: "var(--section-accent)" }}>
                  {item.period}
                </span>
              </div>

              {/* Card content */}
              <div className="glass rounded-2xl p-6">
                <p className="mb-1 text-sm text-[#9a9ab0]">{item.company}</p>
                <p className="mb-4 text-base font-semibold text-[#f5f3ff]">{item.role}</p>
                <ul className="mb-4 flex flex-col gap-2">
                  {item.bullets.map((bullet, bi) => (
                    <li key={bi} className="pl-4 text-sm leading-relaxed text-[#a1a1b5]" style={{ position: "relative" }}>
                      <span className="absolute left-0 text-xs" style={{ color: "var(--section-accent)" }}>▹</span>
                      <TextParts parts={bullet} />
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded px-2 py-0.5 font-mono text-[0.72rem] tracking-wide"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--section-accent) 10%, transparent)",
                        color: "var(--section-accent)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/ExperienceSection.tsx
git commit -m "feat: add Experience section with timeline cards and scroll-triggered line draw"
```

---

### Task 10: About Section

**Files:**
- Create: `src/components/sections/AboutSection.tsx`

- [ ] **Step 1: Create `src/components/sections/AboutSection.tsx`**

```tsx
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { TextParts } from "../components/TextParts";
import { ButtonLink } from "../components/ButtonLink";
import type { AboutParagraph, ButtonLink as BtnType, SectionHeaderData } from "../types";

type AboutSectionProps = {
  paragraphs: AboutParagraph[];
  skills: string[];
  skillsTitle: string;
  cta: BtnType;
  header: SectionHeaderData;
  sectionIndex: number;
};

export function AboutSection({ paragraphs, skills, skillsTitle, cta, header, sectionIndex }: AboutSectionProps) {
  const sectionRef = useRef<HTMLElement>(null!);
  const leftRef = useRef<HTMLDivElement>(null!);
  const rightRef = useRef<HTMLDivElement>(null!);

  useGSAP(() => {
    gsap.from(leftRef.current, {
      opacity: 0,
      x: -30,
      duration: 0.7,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        toggleActions: "play none none none",
      },
    });
    gsap.from(rightRef.current, {
      opacity: 0,
      x: 30,
      duration: 0.7,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        toggleActions: "play none none none",
      },
    });
    gsap.from(rightRef.current?.children, {
      opacity: 0,
      y: 8,
      duration: 0.3,
      stagger: 0.04,
      ease: "power1.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        toggleActions: "play none none none",
      },
    });
  }, { scope: sectionRef });

  return (
    <section id="about" ref={sectionRef} className="section-world section px-8 py-28" style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
      <div className="container mx-auto">
        <SectionHeader {...header} index={sectionIndex} />
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.2fr_1fr]">
          {/* Left: Bio */}
          <div ref={leftRef}>
            {paragraphs.map((p, i) => (
              <p key={i} className="mb-4 text-[0.975rem] leading-relaxed text-[#a1a1b5]">
                <TextParts parts={p.parts} />
              </p>
            ))}
            <div className="mt-6">
              <ButtonLink {...cta} />
            </div>
          </div>

          {/* Right: Skills */}
          <div ref={rightRef}>
            <h3 className="kicker mb-4">{skillsTitle}</h3>
            <div className="grid grid-cols-2 gap-2">
              {skills.map((skill) => (
                <div
                  key={skill}
                  className="glass rounded-lg px-3 py-2 font-mono text-sm transition-colors"
                  style={{
                    borderColor: "color-mix(in srgb, var(--section-accent) 15%, transparent)",
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/AboutSection.tsx
git commit -m "feat: add About section with split-screen bio/skills layout"
```

---

### Task 11: Certifications Section

**Files:**
- Create: `src/components/sections/CertificationsSection.tsx`

- [ ] **Step 1: Create `src/components/sections/CertificationsSection.tsx`**

```tsx
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { TiltCard } from "../components/ui/TiltCard";
import { TextParts } from "../components/TextParts";
import type { Certification, SectionHeaderData, TextPart } from "../types";

type CertificationsSectionProps = {
  items: Certification[];
  header: SectionHeaderData;
  sectionIndex: number;
  noteParts: TextPart[];
};

export function CertificationsSection({ items, header, sectionIndex, noteParts }: CertificationsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null!);

  useGSAP(() => {
    gsap.from(sectionRef.current?.querySelectorAll(".cert-card"), {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        toggleActions: "play none none none",
      },
    });
  }, { scope: sectionRef });

  return (
    <section id="certifications" ref={sectionRef} className="section-world section px-8 py-28" style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
      <div className="container mx-auto">
        <SectionHeader {...header} index={sectionIndex} />

        {items.length > 0 ? (
          <div className="mx-auto max-w-md">
            {items.map((item) => (
              <TiltCard key={item.title}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cert-card glass flex items-center gap-4 rounded-2xl p-5 transition-colors"
                  style={{ borderColor: "color-mix(in srgb, var(--section-accent) 20%, transparent)" }}
                >
                  <img
                    src={item.image.src}
                    alt={item.image.alt}
                    className="h-12 w-12 flex-shrink-0 rounded-lg object-contain"
                  />
                  <div>
                    <h3 className="text-base font-semibold text-[#f5f3ff]">{item.title}</h3>
                    <p className="text-xs tracking-wide" style={{ color: "var(--section-accent)" }}>{item.issuer}</p>
                    <p className="text-xs text-[#9a9ab0]">{item.date}</p>
                  </div>
                </a>
              </TiltCard>
            ))}
          </div>
        ) : (
          <div className="glass mx-auto max-w-md rounded-2xl border-dashed p-8 text-center">
            <p className="text-sm text-[#9a9ab0]">More credentials coming soon.</p>
          </div>
        )}

        {noteParts.length > 0 && (
          <p className="mt-6 text-center text-sm italic text-[#9a9ab0]">
            <TextParts parts={noteParts} />
          </p>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/CertificationsSection.tsx
git commit -m "feat: add Certifications section with tilt card and gold particle bg"
```

---

### Task 12: Contact Section + Footer

**Files:**
- Create: `src/components/sections/ContactSection.tsx`
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Create `src/components/sections/ContactSection.tsx`**

```tsx
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { ButtonLink } from "../components/ButtonLink";
import { SocialLinks } from "../components/SocialLinks";
import type { ButtonLink as BtnType, SectionHeaderData, SocialLink } from "../types";

type ContactSectionProps = {
  description: string;
  cta: BtnType;
  socialLinks: SocialLink[];
  header: SectionHeaderData;
  sectionIndex: number;
};

export function ContactSection({ description, cta, socialLinks, header, sectionIndex }: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null!);

  useGSAP(() => {
    gsap.from(sectionRef.current?.children, {
      opacity: 0,
      y: 24,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        toggleActions: "play none none none",
      },
    });
  }, { scope: sectionRef });

  return (
    <section id="contact" ref={sectionRef} className="section-world section flex min-h-[80vh] flex-col items-center justify-center px-8 py-28 text-center">
      <div className="mx-auto max-w-[560px]">
        <SectionHeader {...header} index={sectionIndex} />
        <h2 className="mb-4 text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-[1.15] tracking-tight">
          Let's Build{" "}
          <span
            className="bg-gradient-to-r from-[#00ff9d] via-[#d97757] via-[#a78bfa] to-[#f59e0b] bg-clip-text text-transparent"
          >
            Something Great.
          </span>
        </h2>
        <p className="mx-auto mb-8 max-w-[440px] text-base leading-relaxed text-[#a1a1b5]">
          {description}
        </p>
        <div className="mb-8">
          <ButtonLink {...cta} size="large" />
        </div>
        <SocialLinks links={socialLinks} />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Update `src/components/Footer.tsx`**

Add the back-to-top link and adapt styling:
```tsx
export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer id="footer" className="relative z-10 px-8 pb-6 pt-4 text-center">
      <button
        onClick={scrollToTop}
        className="mx-auto mb-4 block font-mono text-xs text-[#9a9ab0] transition-colors hover:opacity-70"
        style={{ hover: { color: "var(--section-accent)" } } as any}
      >
        ↑ Back to top
      </button>
      <p className="text-xs text-[#6b6b80]">
        © {new Date().getFullYear()} Daryll Magsombol.
      </p>
      <p className="mt-1 text-[0.65rem] text-[#4a4a5a]">
        Built with React, Tailwind, GSAP & Three.js
      </p>
    </footer>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/ContactSection.tsx src/components/Footer.tsx
git commit -m "feat: add Contact section with finale layout and updated Footer"
```

---

### Task 13: App Assembly — Wire Everything Together

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/data/sections.ts` (remove emoji)
- Remove old parallax imports/usage

- [ ] **Step 1: Update section labels in `src/data/sections.ts`**

Replace labels to match new kicker format (`// 01 · WORK` style):
```ts
export const sections: Record<string, SectionHeaderData> = {
  projects: {
    label: "work",
    title: "Projects",
    note: "This section is a work in progress — more projects coming soon.", // emoji removed
  },
  experience: {
    label: "experience",
    title: "Work History",
  },
  about: {
    label: "me",
    title: "About",
  },
  certifications: {
    label: "credentials",
    title: "Certifications",
  },
  contact: {
    label: "connect",
    title: "Get In Touch",
  },
};
```

- [ ] **Step 2: Rewrite `src/App.tsx`**

Replace entire file:
```tsx
import { CursorGlow } from "./components/CursorGlow";
import { NoiseOverlay } from "./components/NoiseOverlay";
import { GridOverlay } from "./components/GridOverlay";
import { WorldBackground } from "./components/WorldBackground";
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/sections/HeroSection";
import { ProjectSection } from "./components/sections/ProjectSection";
import { ExperienceSection } from "./components/sections/ExperienceSection";
import { AboutSection } from "./components/sections/AboutSection";
import { CertificationsSection } from "./components/sections/CertificationsSection";
import { ContactSection } from "./components/sections/ContactSection";
import { hero } from "./data/hero";
import { projects, projectsGitHubNoteParts } from "./data/projects";
import { experience } from "./data/experience";
import { aboutParagraphs, aboutCta, aboutSkillsTitle } from "./data/about";
import { certifications, certificationsNoteParts } from "./data/certifications";
import { contactDescription, contactCta } from "./data/contact";
import { skills } from "./data/skills";
import { socialLinks } from "./data/socials";
import { sections } from "./data/sections";
import { navLinks, navCta } from "./data/nav";
import { useScrollAnimation } from "./hooks/useScrollAnimation";
import { useActiveSection } from "./hooks/useActiveSection";
import { morphSectionColors } from "./hooks/useScrollAnimation";
import { useEffect } from "react";

function App() {
  useScrollAnimation();
  const activeSection = useActiveSection();

  useEffect(() => {
    morphSectionColors(activeSection);
  }, [activeSection]);

  return (
    <>
      <CursorGlow />
      <NoiseOverlay />
      <GridOverlay />
      <WorldBackground />
      <NavBar links={navLinks} cta={navCta} />
      <main className="relative z-10">
        <HeroSection content={hero} />
        <ProjectSection
          projects={projects}
          header={sections.projects}
          sectionIndex={1}
          noteParts={projectsGitHubNoteParts as any}
        />
        <ExperienceSection
          items={experience}
          header={sections.experience}
          sectionIndex={2}
        />
        <AboutSection
          paragraphs={aboutParagraphs}
          skills={skills}
          skillsTitle={aboutSkillsTitle}
          cta={aboutCta}
          header={sections.about}
          sectionIndex={3}
        />
        <CertificationsSection
          items={certifications}
          header={sections.certifications}
          sectionIndex={4}
          noteParts={certificationsNoteParts as any}
        />
        <ContactSection
          description={contactDescription}
          cta={contactCta}
          socialLinks={socialLinks}
          header={sections.contact}
          sectionIndex={5}
        />
      </main>
      <Footer />
    </>
  );
}

export default App;
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/data/sections.ts
git commit -m "feat: wire App.tsx with all sections, overlays, and section color morphing"
```

---

### Task 14: Cleanup — Remove Old Parallax Files

**Files:**
- Delete: `src/components/parallax/`
- Delete: `src/hooks/useParallax.ts`
- Delete: `src/hooks/useScrollReveal.ts`
- Delete: `src/hooks/useScrollShadow.ts`
- Delete: `src/data/parallax.ts`

- [ ] **Step 1: Remove old files**

```bash
rm -rf src/components/parallax
rm src/hooks/useParallax.ts
rm src/hooks/useScrollReveal.ts
rm src/hooks/useScrollShadow.ts
rm src/data/parallax.ts
```

- [ ] **Step 2: Verify build still succeeds**

Run: `npm run build`
Expected: Build succeeds with no errors — confirms no stale imports.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove old parallax files (Deep Space Descent)"
```

---

## Spec Coverage Checklist

- [x] Tech stack: Tailwind, GSAP, Framer, Three.js — Task 1
- [x] Lenis smooth scroll — Task 2
- [x] GSAP ScrollTrigger pin only Hero — Task 2 (architecture), Tasks 7-12 (section implementations)
- [x] Color morphing between sections — Task 2 + App.tsx Task 13
- [x] Per-section Three.js scenes — Task 5
- [x] Lazy scene mounting (±1) — WorldBackground.tsx Task 5
- [x] Animation discipline (transform/opacity only) — built into all GSAP usage
- [x] Reduced motion (unmount Three.js) — CSS in Task 1
- [x] Navbar color adaptation — Task 7
- [x] Mobile fallbacks — CSS in Task 1, Three.js hidden via device pixel ratio
- [x] Emoji removed from data — Task 13
- [x] Cursor hidden on touch — CursorGlow.tsx Task 4
- [x] Footer back-to-top — Footer.tsx Task 12
- [x] Page Visibility — WorldBackground handles unmounting
- [x] Responsive breakpoints — CSS throughout
