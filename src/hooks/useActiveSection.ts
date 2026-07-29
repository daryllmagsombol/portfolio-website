import { useState, useEffect } from "react";

const SECTION_IDS = ["hero", "projects", "experience", "about", "certifications", "contact"];

export function useActiveSection(): number {
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
        { threshold: 0.35 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return active;
}
