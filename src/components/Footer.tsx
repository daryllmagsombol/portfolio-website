export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer id="footer" className="relative z-10 px-8 pb-6 pt-4 text-center">
      <button
        onClick={scrollToTop}
        className="mx-auto mb-4 block font-mono text-xs text-[#9a9ab0] transition-colors hover:text-[var(--section-accent)]"
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
