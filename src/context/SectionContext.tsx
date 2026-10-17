import { useEffect, useState, type ReactNode } from "react";
import { SectionContext } from "./useSection";

const SECTION_IDS = ["hero", "projects", "experience", "about", "certifications", "contact"];

/**
 * Single source of truth for the currently-active section. Owns one set of
 * IntersectionObservers (one per section) and exposes the active index via
 * SectionContext. Downstream consumers should call useSection() from
 * "./useSection" instead of subscribing their own observers.
 */
function useActiveSectionInternal(): number {
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
        { threshold: 0.25, rootMargin: "-10% 0px -10% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return active;
}

export function SectionProvider({ children }: { children: ReactNode }) {
  const activeIndex = useActiveSectionInternal();
  return (
    <SectionContext.Provider value={activeIndex}>
      {children}
    </SectionContext.Provider>
  );
}