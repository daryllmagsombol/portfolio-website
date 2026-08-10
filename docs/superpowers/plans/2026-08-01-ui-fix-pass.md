# UI Fix Pass — 2026-08-01

Fixes all 12 findings from the 2026-08-01 ui-ux-designer review of the "Portfolio Worlds"
redesign (spec: `docs/superpowers/specs/2026-07-27-portfolio-worlds-redesign.md`).
Stack: React 19 + Vite 8 + Tailwind 4 + GSAP + Framer Motion + Three.js (R3F) + Lenis.

## Global Constraints

- `npm run build` and `npm run lint` must both pass after every task.
- No new runtime dependencies. Removing framer-motion is allowed (Task 3).
- Do NOT modify anything in `src/data/*` — data files are the content source of truth.
- Preserve the uncommitted WIP in the working tree (design-token spacing refactor in
  `src/index.css` + section files + hooks). Do not revert or duplicate it.
- No test framework exists in this repo; verification is build + lint + dev-server check
  + code review. Follow repo precedent — do not add a test framework.
- Do not commit. Leave changes in the working tree for the controller to commit.
- Sections must keep `id` attributes (anchor targets) and the `section-world` class.

## Task 1 — Restore the worlds: scene visibility + scene polish (C1, L1, M6)

**Problem:** WebGL scenes render only in the Hero. `.section-world { background-color: var(--section-bg); }`
(`src/styles/worlds.css:2`) paints an opaque solid color over the canvas (`z-0`), which sits behind
`<main>` (`z-10`, `App.tsx:43`). Scenes also hardcode colors instead of consuming `--section-accent`,
swap instantly (no crossfade), and the hero parallax is dead.

**Requirements:**

1. **Scene visibility (C1).** Make `--section-bg` section backgrounds translucent so the WebGL
   canvas shows through. Per spec §Responsive: use per-section radial-gradient fallbacks at low
   alpha (5–10% tint of the section's world color over near-black) instead of a solid hex.
   Update `src/styles/worlds.css` (`.section-world`) accordingly. Verify every section keeps good
   text contrast after translucency (body text is #f5f3ff on near-black — gradients must stay dark).
   Keep the 0.6s background-color transition or drop it if the JS morph (Task 1.4) owns color timing —
   pick ONE timing authority and note the decision.
2. **Scene accent coupling.** All 6 scenes (`src/components/scenes/*.tsx`:
   HeroScene:30, NeuralScene:42, WarmShapesScene:37, BlobScene:35,39, GoldParticlesScene:34,
   ColorBlendScene:5) hardcode colors. Make them read `--section-accent` (or a `--section-*` color)
   from the DOM (`getComputedStyle` on a CSS variable) so the scene palette follows the section morph.
   Scenes must re-read on `activeSection` change (they only re-render on mount — hook into the
   `useActiveSection` value or observe `:root` style changes).
3. **Scene crossfade.** In `WorldBackground.tsx` SceneManager (lines 20-42), animate scene opacity
   in/out (150–400ms) when its scroll range becomes active/adjacent, instead of mounting/unmounting
   abruptly. Keep the ±1 adjacency lazy-mount behavior. Respect `prefers-reduced-motion`
   (WorldBackground already returns null under reduced motion — keep that).
4. **OKLCH morph (M6).** `morphSectionColors` in `src/hooks/useScrollAnimation.ts:62-73` tweens
   hex CSS vars in RGB → muddy midpoints. Switch to OKLCH/OKLAB interpolation:
   `gsap.utils.interpolate` over `oklch()` values (or animate `--section-accent` etc. as oklch
   strings so GSAP interpolates the numeric components). Keep the `overwrite: true` + 0.3s
   `power1.out` easing that's already in the working tree.
5. **Hero parallax (L1).** `WorldBackground.tsx:65` sets `pointer-events-none` on the canvas
   wrapper, so R3F `pointer` never updates (`HeroScene.tsx:19` rotation stays zero). Fix by tracking
   normalized mouse on `window` (same pattern as `CursorGlow.tsx`) and driving HeroScene rotation
   from it — either via a shared module value read by the scene, or `eventSource` on the Canvas.
   Do NOT re-enable pointer events on the canvas.

**Files:** `src/styles/worlds.css`, `src/components/WorldBackground.tsx`,
`src/components/scenes/*.tsx` (all 6), `src/hooks/useScrollAnimation.ts`, `src/components/CursorGlow.tsx`
(reference only), `src/index.css` (only if needed for gradient fallbacks).

## Task 2 — Smooth anchor scrolling + mobile menu a11y (H1, M2)

**Problem:** Nav links, hero CTA, and footer back-to-top all jump instantly; Lenis is created without
`anchors: true` (`useScrollAnimation.ts:29-35`) and the footer uses native `window.scrollTo`
(`Footer.tsx:2`) which races the Lenis rAF loop. Mobile menu lacks `aria-expanded`/`aria-controls`,
Escape handling, and its `body` overflow lock fights Lenis.

**Requirements:**

1. **Lenis anchors (H1).** Create Lenis with `anchors: true` (or intercept anchor clicks with
   `lenis.scrollTo(hash)`). All `#`-anchor navigation (NavBar links, hero "View my work" CTA from
   `src/data/hero.ts`, footer) must smooth-scroll through Lenis. Under `prefers-reduced-motion`,
   fall back to instant jump. Make the Lenis instance accessible to NavBar and Footer (e.g., export
   from `useScrollAnimation.ts` module scope or a small `src/hooks/lenis.ts` — simplest clean
   approach; do not use a new dependency like a context library).
2. **Footer back-to-top (H1).** Replace `window.scrollTo({ behavior: "smooth" })` with
   `lenis.scrollTo(0)` (fallback to `window.scrollTo` instant if Lenis not running, e.g. reduced
   motion/mobile).
3. **Mobile menu a11y (M2).** In `NavBar.tsx`: add `aria-expanded={menuOpen}` and
   `aria-controls` to the toggle button; close the menu on Escape; manage scroll lock through
   Lenis (`lenis.stop()` / `lenis.start()`) instead of only `document.body.style.overflow`
   (keep overflow as a fallback). Ensure focus stays usable while the menu is open (no focus trap
   required, but Escape must work and the toggle must stay reachable).

**Files:** `src/hooks/useScrollAnimation.ts`, `src/components/NavBar.tsx`,
`src/components/Footer.tsx`, `src/index.css` (only if needed).

## Task 3 — Reduced motion everywhere + bundle split (H2, H3)

**Problem:** `prefers-reduced-motion` only kills CSS animations (`index.css:122-129`). GSAP reveals
run in 5 sections, Lenis initializes unconditionally, the typewriter keeps blinking, and
`HeroSection.tsx:14` uses Framer Motion entrance. Bundle is one 1.36MB chunk (395 kB gzip) — Three.js
+ R3F + GSAP + Framer Motion + Lenis all eager, and `index.html:15` loads Inter (never used).

**Requirements:**

1. **Full reduced-motion (H2).**
   - Wrap each section's GSAP reveal (`ProjectSection.tsx:23`, `ExperienceSection.tsx:36`,
     `AboutSection.tsx:24`, `CertificationsSection.tsx:20`, `ContactSection.tsx:21`) in
     `gsap.matchMedia()` with a `(prefers-reduced-motion: reduce)` branch that sets final states
     (no tweens).
   - Skip Lenis init under reduced motion (Task 2's scroll fallback covers anchors).
   - Typewriter (`src/hooks/useTypewriter.ts`): render final text immediately under reduced motion
     (or a `useMediaQuery` check inside the hook).
   - HeroSection entrance: if framer-motion is removed (see 2), implement the entrance with GSAP or
     CSS and gate it under reduced motion.
2. **Code-split WebGL (H3).** `React.lazy(() => import("./components/WorldBackground"))` in
   `App.tsx` inside `<Suspense>` (no visible fallback needed — it's a background; use `null` or a
   transparent placeholder). This moves the Three.js graph off the critical path.
3. **Drop framer-motion (H3).** It's only used in `HeroSection.tsx`. Port the hero entrance to GSAP
   (already in the bundle). Remove the dependency from `package.json` (`npm uninstall framer-motion`).
4. **Remove dead weight (H3).** Remove the unused Inter font `<link>` from `index.html:15`
   (fonts are Space Grotesk/Fraunces/JetBrains Mono — check how fonts are loaded and keep those).
   Delete unused template assets `src/assets/react.svg` and `src/assets/vite.svg` only if nothing
   imports them (verify with grep first).

**Files:** `src/App.tsx`, `src/components/sections/*.tsx` (5 sections), `src/hooks/useTypewriter.ts`,
`src/hooks/useScrollAnimation.ts`, `src/components/sections/HeroSection.tsx`, `index.html`,
`package.json`/`package-lock.json`, `src/assets/`.

## Task 4 — Component & CSS polish (M1, M3, M4, M5, L2, dead code)

**Requirements:**

1. **Footer contrast/size (M1).** `Footer.tsx:15-17` tech-stack line: `text-[0.65rem]` (10.4px)
   `#4a4a5a` on `#050505` = 2.35:1 → raise to ≥ `#8a8aa0` and ≥ 0.75rem. Copyright line
   (`Footer.tsx:12-14`, 12px `#6b6b80` = 3.92:1) → ≥ 4.5:1 (e.g. `#8a8aa0`).
2. **Project links (M3).** `ProjectSection.tsx:74-79`: render `aria-label={link.ariaLabel ?? link.title}`
   (data already has `ariaLabel` — `projects.ts:159,208`). Increase link hit area to ≥ 44×44px.
   `ProjectSection.tsx:58-60`: the hover-only "Visit ↗" overlay is unreachable on touch — make the
   affordance persistent or add a visible label that also works on mobile.
3. **Contact gradient (M4).** `ContactSection.tsx:42` uses two `via-` stops — compiled CSS proves
   only one wins (amber overrides purple). Replace with inline 4-stop
   `linear-gradient(90deg, #00ff9d, #d97757, #a78bfa, #f59e0b)` + `background-clip: text`.
4. **TiltCard (M5).** `src/components/ui/TiltCard.tsx:41`: the radial highlight overlay uses
   `group-hover:opacity-100` but no ancestor has `group` — add `group` to the TiltCard root.
   Gate tilt on `prefers-reduced-motion` in addition to `(hover: hover)` (line 11). Implement the
   spec's touch fallback (static ~2° skew) if simple; otherwise leave cards flat on touch.
5. **Breakpoints (L2).** Unify WebGL/noise/grid hide breakpoints at 700px:
   `NoiseOverlay.tsx:4` and `GridOverlay.tsx:4` use `max-sm:hidden` (640px) → change to
   `max-[700px]:hidden` to match `WorldBackground.tsx:59`.
6. **Mobile timeline (L2).** `ExperienceSection.tsx:73-83` hardcodes `left-[100px]` / `left-[93px]` /
   `pl-[120px]` at all sizes. Implement the spec's ≤700px collapse: stacked list without connecting
   line/dots, reduced padding.
7. **Dead code.** Remove `.reveal`/`.reveal.visible` from `index.css:117-119` ONLY if no component
   uses them (grep first — if `useScrollAnimation` or sections add `.visible`, keep the classes and
   note why). Remove the no-op `.section` class from `worlds.css`/`index.css` if it has no styles.
   Do not touch `kicker`, `glass`, `.btn-*`, navbar styles.

**Files:** `src/components/Footer.tsx`, `src/components/sections/ProjectSection.tsx`,
`src/components/sections/ContactSection.tsx`, `src/components/sections/ExperienceSection.tsx`,
`src/components/ui/TiltCard.tsx`, `src/components/NoiseOverlay.tsx`,
`src/components/GridOverlay.tsx`, `src/index.css`, `src/styles/worlds.css`.
