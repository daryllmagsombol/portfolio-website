import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { prefersReducedMotion, setLenis, setupAnchorSmoothing } from "./lenis";

gsap.registerPlugin(ScrollTrigger);

// Section world color configs matching data section order.
// Stored as oklch() strings so GSAP interpolates the numeric L/C/H components
// (no muddy RGB midpoints when tweening between far-apart hues).
export interface SectionColorConfig {
  bg: string;
  accent: string;
  glow: string;
}

function srgbToLinear(c: number): number {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** hex -> "oklch(L C H)" (or "oklch(L C H / alpha)"). Björn Ottosson's OKLab, validated against CSS Color 4. */
function hexToOklch(hex: string, alpha?: number): string {
  const r = srgbToLinear(parseInt(hex.slice(1, 3), 16));
  const g = srgbToLinear(parseInt(hex.slice(3, 5), 16));
  const b = srgbToLinear(parseInt(hex.slice(5, 7), 16));
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.sqrt(a * a + b_ * b_);
  let h = (Math.atan2(b_, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  const base = `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${h.toFixed(2)}`;
  return alpha === undefined ? `${base})` : `${base} / ${alpha})`;
}

export const sectionColors: SectionColorConfig[] = [
  { bg: hexToOklch("#050505"), accent: hexToOklch("#00ff9d"), glow: hexToOklch("#00ff9d", 0.15) },    // Hero
  { bg: hexToOklch("#0a1a10"), accent: hexToOklch("#00ff9d"), glow: hexToOklch("#00ff9d", 0.15) },    // Projects
  { bg: hexToOklch("#1a0e06"), accent: hexToOklch("#d97757"), glow: hexToOklch("#d97757", 0.15) },   // Experience
  { bg: hexToOklch("#060d1a"), accent: hexToOklch("#a78bfa"), glow: hexToOklch("#a78bfa", 0.15) },  // About
  { bg: hexToOklch("#1a1206"), accent: hexToOklch("#f59e0b"), glow: hexToOklch("#f59e0b", 0.15) },   // Certifications
  { bg: hexToOklch("#050505"), accent: hexToOklch("#00ff9d"), glow: hexToOklch("#00ff9d", 0.15) },    // Contact
];

export function useScrollAnimation() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Reduced motion: skip Lenis entirely — native instant scrolling stays
    // active. Anchor clicks fall back to the browser's instant jump
    // (setupAnchorSmoothing no-ops when the singleton instance is null).
    if (prefersReducedMotion()) {
      return;
    }

    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    // Share the instance with NavBar/Footer via the lenis singleton.
    setLenis(lenis);

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    // GSAP ticker passes time in seconds, but Lenis.raf() expects milliseconds
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // All #hash anchor clicks smooth-scroll through Lenis (reduced-motion aware).
    const stopAnchors = setupAnchorSmoothing();

    // Refresh ScrollTrigger after fonts/layout settle
    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 500);

    return () => {
      clearTimeout(refreshTimer);
      setLenis(null);
      stopAnchors();
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, []);

  return lenisRef;
}

/**
 * Normalize a CSS oklch() string to canonical decimal form
 * ("oklch(L C H / A)" with L/C/H as 0-1 numbers). The build pipeline
 * (LightningCSS via Tailwind v4) rewrites stylesheet values to percentage
 * form ("oklch(87.99% .21 156.86)"), while GSAP writes inline number-form
 * values at runtime — both must be normalized so GSAP interpolates matching
 * number spaces (a 100x L mismatch would clamp to white mid-tween).
 */
function normalizeOklch(value: string): string {
  const m = value.match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/i);
  if (!m) return value;
  // CSS Color 4: L 100% = 1.0, chroma 100% = 0.4, alpha 100% = 1.0.
  const L = parseFloat(m[1]) / (m[1].includes("%") ? 100 : 1);
  const C = parseFloat(m[2]) * (m[2].includes("%") ? 0.4 / 100 : 1);
  const h = parseFloat(m[3]);
  const a = m[4] !== undefined ? parseFloat(m[4]) / (m[4].includes("%") ? 100 : 1) : undefined;
  const base = `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${h.toFixed(2)}`;
  return a === undefined ? `${base})` : `${base} / ${a})`;
}

/**
 * Morph section colors on :root using GSAP.
 * Call from section components or from a global scroll watcher.
 *
 * Colors are oklch() strings, so GSAP interpolates the numeric L/C/H
 * components (OKLCH interpolation) instead of RGB hex — no muddy midpoints.
 * This JS morph is the SINGLE color-timing authority (0.3s power1.out);
 * CSS provides no color transitions of its own.
 */
export function morphSectionColors(index: number, duration = 0.3) {
  const colors = sectionColors[index];
  if (!colors) return;
  const rootStyle = getComputedStyle(document.documentElement);
  const current = (name: string, fallback: string) => {
    const v = rootStyle.getPropertyValue(name).trim();
    return v ? normalizeOklch(v) : fallback;
  };
  gsap.fromTo(
    ":root",
    {
      "--section-bg": current("--section-bg", colors.bg),
      "--section-accent": current("--section-accent", colors.accent),
      "--section-glow": current("--section-glow", colors.glow),
    },
    {
      "--section-bg": colors.bg,
      "--section-accent": colors.accent,
      "--section-glow": colors.glow,
      duration,
      ease: "power1.out",
      overwrite: true,
    }
  );
}
