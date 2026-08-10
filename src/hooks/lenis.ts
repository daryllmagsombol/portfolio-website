import Lenis from "lenis";

/**
 * Module-scope Lenis singleton.
 *
 * useScrollAnimation() creates the instance (so it stays wired to the GSAP
 * ticker + ScrollTrigger) and registers it here; NavBar and Footer reach the
 * same instance through this module — no prop drilling, no context library.
 * `setLenis(null)` on teardown keeps the singleton honest across HMR and
 * React StrictMode double-mounts.
 */
let instance: Lenis | null = null;

function reducedMotionMedia(): MediaQueryList | null {
  return typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
}

/** True when the user prefers reduced motion (evaluated live per call). */
export function prefersReducedMotion(): boolean {
  return reducedMotionMedia()?.matches ?? false;
}

/** Registered by useScrollAnimation's effect; nulled on teardown. */
export function setLenis(lenis: Lenis | null): void {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}

export function lenisStop(): void {
  instance?.stop();
}

export function lenisStart(): void {
  instance?.start();
}

/**
 * Smooth-scroll to a target through Lenis. Falls back to an instant native
 * jump when Lenis isn't running; jumps instantly when the user prefers
 * reduced motion. Target may be a scroll position or a `#hash` selector.
 */
export function lenisScrollTo(target: number | string, immediate = false): void {
  const jump = immediate || prefersReducedMotion();
  if (instance) {
    instance.scrollTo(target, { immediate: jump });
    return;
  }
  // Lenis not running — instant native fallback.
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "auto" });
  } else {
    document.querySelector(target)?.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

/**
 * Delegated listener so EVERY `#hash` anchor (NavBar links, hero "View my
 * work" CTA, future anchors) smooth-scrolls through Lenis. Reduced motion →
 * instant jump. When Lenis isn't running, the browser's native jump is left
 * untouched. `force: true` keeps scrolling working in the same click that
 * closes the mobile menu — the menu holds Lenis stopped until its effect
 * runs, and Lenis.scrollTo would otherwise early-return (see lenis.mjs
 * `scrollTo`: `if ((this.isStopped || this.isLocked) && !force) return`).
 */
export function setupAnchorSmoothing(): () => void {
  const onClick = (event: MouseEvent) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!anchor || anchor.target === "_blank") return;
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    if (!document.querySelector(href)) return;
    if (!instance) return; // Lenis absent → let the browser jump natively
    event.preventDefault();
    instance.scrollTo(href, { immediate: prefersReducedMotion(), force: true });
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}
