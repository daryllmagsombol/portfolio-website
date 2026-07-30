import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

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
    // GSAP ticker passes time in seconds, but Lenis.raf() expects milliseconds
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger after fonts/layout settle
    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 500);

    return () => {
      clearTimeout(refreshTimer);
      lenis.destroy();
      gsap.ticker.remove(raf);
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
