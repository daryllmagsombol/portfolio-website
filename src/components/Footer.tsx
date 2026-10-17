import { lenisScrollTo } from "../hooks/lenis";

export function Footer() {
  // Smooth through Lenis; instant jump when reduced motion or Lenis absent.
  const scrollToTop = () => lenisScrollTo(0);

  return (
    <footer id="footer" className="relative z-10 px-8 pb-6 pt-4 text-center">
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className="mx-auto mb-4 block rounded-full border border-white/15 px-4 py-2 font-mono text-xs text-[#9a9ab0] transition-colors hover:border-[var(--section-accent)] hover:text-[var(--section-accent)]"
      >
        ↑ Back to top
      </button>
      <p className="text-xs text-[#8a8aa0]">
        © {new Date().getFullYear()} Daryll Magsombol.
      </p>
      <p className="mt-1 text-[0.75rem] text-[#8a8aa0]">
        Built with React, Tailwind, GSAP & Three.js
      </p>
    </footer>
  );
}
