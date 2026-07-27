# Portfolio Redesign — "Deep Space Descent"

**Date:** 2026-07-27
**Status:** Approved (design), pending implementation plan
**Branch:** feature/revise-design

## Summary

Redesign darjosh.dev into a dark, cinematic, continuously-parallaxing single-page portfolio. One fixed 2.5D layered world ("Deep Space → Grid Floor") sits behind all content and evolves as the visitor scrolls: the moon recedes, mountains rise and pass, and the visitor lands on a glowing grid floor at the contact section. Implemented with pure CSS/SVG layers driven by a single requestAnimationFrame scroll loop writing CSS custom properties — no WebGL, no new runtime dependencies.

## Goals & Audience

- **Primary audience:** recruiters/employers AND freelance clients.
- Content must stay credible and fast to scan; the parallax world is the "wow" hook that proves craft, never a barrier to content.
- **Content scope:** keep all current sections, order, and copy as-is — Hero → Projects → Experience → About → Certifications → Contact → Footer. This redesign changes presentation only.
- **Full experience on all devices** (desktop and mobile), implemented performance-consciously so "full" doesn't mean janky.

## Non-Goals

- No content/copy changes, no new sections, no blog, no CMS.
- No WebGL / three.js / react-three-fiber.
- No light mode (dark-only design).
- No scroll-jacking — native scroll behavior is preserved at all times.

## The Journey (Storyboard)

One world, six altitudes. Scroll progress maps to a continuous camera descent:

| # | Section | Scene |
|---|---------|-------|
| 01 | Hero | **Deep Space** — large glowing moon, dense starfield, mountains a distant silhouette; mouse-parallax on all layers; name glows center |
| 02 | Projects | **Descent Begins** — sky shifts violet, moon smaller/higher, mountains rise; project cards on frosted glass |
| 03 | Experience | **Among the Peaks** — dramatic midpoint; peaks tower with a faint aurora glow behind them |
| 04 | About | **Alpine Night** — calm open indigo sky, low foothills; quiet personal beat |
| 05 | Certifications | **The Grid Rises** — glowing horizon line appears, grid floor rises into view |
| 06 | Contact | **Touchdown** — standing on the grid, horizon low, CTA floats above; footer merges into the grid floor |

## Architecture

**Core principle: CSS does all the animating; JS only writes a few numbers.**

### Parallax world (background)

- `ParallaxWorld` — fixed-position, full-viewport layer stack rendered behind `<main>` (negative z-index). Purely presentational, rendered once, never re-renders on scroll.
- Layer budget: **6 meaningful layers** (per ui-ux-pro-max guidance that >3–4 layers has diminishing returns; our single-listener design avoids the per-layer listener cost, but visual restraint still applies):
  1. `StarsFar` — small sparse stars, slowest drift
  2. `StarsNear` — larger brighter stars, slightly faster
  3. `Nebula` — soft radial gradient glow
  4. `Moon` — glowing sphere, translates up + shrinks with progress
  5. `Mountains` — far + near SVG silhouettes treated as one system, rising/growing at different multipliers
  6. `GridFloor` — CSS 3D-transformed grid (`perspective` + `rotateX`) that fades/rises in during the final stage
- Each layer reads shared CSS custom properties with its own depth constants via `calc()`; only `transform` and `opacity` are animated (GPU-composited, no layout thrash).

### Scroll/mouse driver

- `useParallax` hook — one passive scroll listener + `requestAnimationFrame` throttle. Computes:
  - `--p` — overall page progress 0→1
  - `--p-descent`, `--p-landing` — stage-local progresses for choreography that needs it
  - `--mx`, `--my` — normalized mouse position (−1…1) for hero mouse-parallax (pointer-based; simply unused on touch devices)
- Writes these as CSS custom properties on the root element. **Zero React re-renders on scroll or mouse move.**
- Descent choreography (moon recede, mountain growth, grid rise) is pure CSS math against these variables.

### Content layer

- Existing sections stay in normal document flow, structurally unchanged.
- Section surfaces become translucent glass: `rgba(23,15,42,.55)` background + `backdrop-filter: blur(8px)` + 1px violet-tinted border, so the world glows through subtly behind cards.
- Existing `useScrollReveal` hook stays for content fade-ins (restyled to the new motion rules).
- Nav: transparent over hero → gains a glass blur bar after scrolling past a threshold.

### Files

**New:**
- `src/components/parallax/ParallaxWorld.tsx` — layer stack
- `src/components/parallax/layers/*.tsx` — one file per layer (StarsFar, StarsNear, Nebula, Moon, Mountains, GridFloor)
- `src/hooks/useParallax.ts` — scroll/mouse driver
- `src/data/parallax.ts` — depth constants & stage breakpoints

**Modified:**
- `src/index.css` — full theme rewrite (palette, glass utilities, glow, layer transforms)
- `src/App.css` — section/card restyle
- `src/App.tsx` — render `<ParallaxWorld />` + wire `useParallax`
- `src/components/*.tsx` — className/markup adjustments only where restyling requires

**Untouched:**
- Everything in `src/data/` (content), card component props/logic, Netlify config, build tooling.

## Visual System

- **Fonts:** unchanged — Inter (sans) + JetBrains Mono (kickers, labels, accents).
- **Palette:**
  - Space black `#05050a` (page bg)
  - Glass `#170f2a` (panel base, applied at 55% opacity)
  - Deep violet `#2d1155` (sky gradients)
  - Primary `#8b5cf6` (buttons, interactive)
  - Moon glow `#c084fc` (accents, glow)
  - Horizon pink `#e879f9` (horizon line, mono accents)
  - Text `#f5f3ff` (primary), `#a1a1b5` (secondary)
- **Section headers:** mono kicker (`// 02 · PROJECTS`) + glowing heading.
- **Buttons:** gradient violet primary (`#c084fc→#8b5cf6`) with soft glow; ghost secondary with violet border.
- **Glow discipline:** glow on headings/CTAs/key accents only; body text stays low-emission for readability (ui-ux-pro-max "minimal glow" rule).
- **Icons:** SVG only (Lucide), no emojis as icons.
- **Hover:** cards lift slightly, border brightens with violet glow; links/btn transitions 150–300ms ease-out.

## Motion & UX Rules

- UI transitions: 150–300ms, ease-out for entering elements.
- Per-view animation budget: ambient parallax + 1 content reveal animation at a time (no animating everything at once).
- No infinite decorative loops — the starfield is fully static (all depth comes from scroll/mouse parallax, not self-playing animation).
- Anchor navigation keeps `scroll-behavior: smooth` (already present).
- No horizontal scroll at any breakpoint (`overflow-x: hidden`, already present).

## Accessibility

- `prefers-reduced-motion: reduce` → parallax disabled, reveals disabled, static (still fully composed) scene; content all visible immediately.
- All text/background pairs validated ≥ 4.5:1 contrast (check especially `#a1a1b5` secondary text on glass, and mono accents).
- Visible focus rings (violet) for keyboard navigation; `cursor: pointer` on all clickable elements.
- `backdrop-filter` graceful degradation: browsers without support get a more opaque panel background (readability never depends on blur).

## Performance

- Single passive scroll listener, rAF-throttled; writes only CSS custom properties.
- Animations limited to `transform`/`opacity`.
- Star positions generated once (memoized), no per-frame DOM writes besides custom properties.
- Bundle impact: ~zero new runtime dependencies; world is CSS/SVG.
- Profile with React DevTools Profiler during development (measure, don't guess).
- Responsive verification at 375 / 768 / 1024 / 1440px.
- Mobile: full parallax journey runs; mouse-parallax simply inactive on touch; star counts are reduced via media query (fewer DOM nodes) to protect the frame budget.

## Testing & Verification

- `npm run build` (type-check + build) and `npm run lint` must pass.
- Manual verification at key scroll depths: hero (mouse-parallax), mid-descent, grid rise, touchdown.
- Reduced-motion test (OS setting + DevTools emulation).
- Mobile viewport test (375px) — scroll smoothness, no horizontal scroll, glass legibility.
- Lighthouse check: performance and contrast spot-checks.

## Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Aesthetic | Dark & Cinematic | Premium, immersive; fits recruiter + client audience (user's visual pick) |
| Hero concept | Layered 2.5D parallax horizon | Cinematic depth without heavy WebGL; scroll becomes the show |
| Scroll model | Continuous journey | One evolving world behind all sections; signature modern parallax portfolio |
| Tech approach | Pure CSS/SVG + custom properties | Zero deps, tiny bundle, smooth on phones, easiest accessibility fallback |
| Content | Keep everything as-is | Presentation-only redesign |
| Mobile | Full experience everywhere | User requirement, paired with performance-conscious implementation |
