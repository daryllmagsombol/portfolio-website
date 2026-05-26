import { useEffect } from "react";

export function useScrollReveal() {
  useEffect(() => {
    const revealElements = document.querySelectorAll<HTMLElement>(".reveal");
    const isMobile = window.matchMedia("(max-width: 700px)").matches;

    if (!revealElements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: isMobile ? 0.05 : 0.12 },
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, []);
}
