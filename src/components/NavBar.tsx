import { useEffect, useRef, useState } from "react";
import type { ExternalLink, NavLink } from "../types";
import { useActiveSection } from "../hooks/useActiveSection";

const SECTION_IDS = ["hero", "projects", "experience", "about", "certifications", "contact"];

type NavBarProps = {
  links: NavLink[];
  cta: ExternalLink;
};

export function NavBar({ links, cta }: NavBarProps) {
  const activeIndex = useActiveSection();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navLinksRef = useRef<HTMLUListElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  // Scroll shadow detection
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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
      <nav className="nav-inner">
        <a href="#hero" className="nav-logo" onClick={handleLinkClick}>
          daryll<span style={{ color: "var(--section-accent)" }}>.</span>
        </a>
        <ul className={`nav-links${menuOpen ? " open" : ""}`} ref={navLinksRef}>
          {links.map((link) => {
            const isActive = getHrefIndex(link.href) === activeIndex;
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={isActive ? "is-active" : undefined}
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
