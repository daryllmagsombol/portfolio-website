import { useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import type { ExternalLink, NavLink } from "../types";
import { useSection } from "../context/useSection";
import { getLenis, lenisStart, lenisStop, subscribeLenis } from "../hooks/lenis";

const SECTION_IDS = ["hero", "projects", "experience", "about", "certifications", "contact"];

type NavBarProps = {
  links: NavLink[];
  cta: ExternalLink;
};

export function NavBar({ links, cta }: NavBarProps) {
  const activeIndex = useSection();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navLinksRef = useRef<HTMLUListElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  // Scroll shadow detection: the native window "scroll" listener is the
  // always-on baseline (Lenis drives the real scroll position, so this keeps
  // working in every mode). Additionally, when the Lenis singleton becomes
  // available we attach its own "scroll" handler so styling updates on the
  // same frame as the smoothed scroll. The singleton is created by App's
  // effect after this child mounts, so we subscribe rather than read once.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // init

    const onLenisScroll = ({ scroll }: { scroll: number }) =>
      setIsScrolled(scroll > 20);
    let attached: Lenis | null = null;
    const syncLenis = (lenis: Lenis | null) => {
      if (lenis === attached) return;
      if (attached) attached.off("scroll", onLenisScroll);
      attached = lenis;
      if (lenis) {
        lenis.on("scroll", onLenisScroll);
        // Initialize in case the page is already scrolled (e.g., anchor).
        onLenisScroll({ scroll: window.scrollY });
      }
    };

    syncLenis(getLenis());
    const unsubscribe = subscribeLenis(syncLenis);

    return () => {
      window.removeEventListener("scroll", onScroll);
      unsubscribe();
      if (attached) attached.off("scroll", onLenisScroll);
    };
  }, []);

  // Scroll lock: Lenis stop is primary (its `.lenis-stopped` class sets
  // overflow hidden on <html>); body overflow is the fallback for when
  // Lenis isn't running yet (e.g., very first paint before App's effect).
  useEffect(() => {
    if (menuOpen) {
      lenisStop();
      document.body.style.overflow = "hidden";
    } else {
      lenisStart();
      document.body.style.overflow = "";
    }
    return () => {
      lenisStart();
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close the menu on Escape and return focus to the toggle so keyboard
  // users always have a reachable way to reopen it.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!menuOpen) return;
      const target = event.target as Node;
      const clickedLinks = navLinksRef.current?.contains(target);
      const clickedToggle = toggleRef.current?.contains(target);
      if (!clickedLinks && !clickedToggle) setMenuOpen(false);
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [menuOpen]);

  const handleLinkClick = () => setMenuOpen(false);

  const getHrefIndex = (href: string): number => {
    const id = href.replace("#", "");
    return SECTION_IDS.indexOf(id);
  };

  return (
    <header id="navbar" className={isScrolled ? "scrolled" : undefined}>
      <nav className="nav-inner" aria-label="Primary">
        <a href="#hero" className="nav-logo" onClick={handleLinkClick}>
          daryll<span style={{ color: "var(--section-accent)" }}>.</span>
        </a>
        <ul className={`nav-links${menuOpen ? " open" : ""}`} id="mobile-menu" ref={navLinksRef}>
          {links.map((link) => {
            const isActive = getHrefIndex(link.href) === activeIndex;
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={isActive ? "is-active" : undefined}
                  aria-current={isActive ? "page" : undefined}
                  onClick={handleLinkClick}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
          <li>
            <a
              href={cta.href}
              target="_blank"
              rel="noopener"
              className="nav-github"
              aria-label={cta.ariaLabel ?? cta.label}
              onClick={handleLinkClick}
            >
              {cta.label}
            </a>
          </li>
        </ul>
        <button
          className={`nav-toggle${menuOpen ? " open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((prev) => !prev)}
          ref={toggleRef}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
    </header>
  );
}