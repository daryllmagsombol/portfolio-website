import { useEffect, useRef, useState } from "react";

type TypewriterOptions = {
  startDelay?: number;
  typingDelay?: number;
  deletingDelay?: number;
  pauseDelay?: number;
  nextRoleDelay?: number;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Live `prefers-reduced-motion` flag. Re-evaluates when the OS setting
 * changes mid-session so the typewriter can bail out (or resume) correctly.
 */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(REDUCED_MOTION_QUERY);
    const handleChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}

/**
 * Cycles through `roles`, typing/deleting each in turn. Pauses while the
 * hero section is off-screen so the animation doesn't burn CPU/battery when
 * the user is reading later sections. Reduced-motion users see the full
 * first role statically.
 */
export function useTypewriter(
  roles: string[],
  options: TypewriterOptions = {},
) {
  const {
    startDelay = 800,
    typingDelay = 90,
    deletingDelay = 60,
    pauseDelay = 2200,
    nextRoleDelay = 400,
  } = options;

  const reducedMotion = useReducedMotion();
  const [text, setText] = useState("");
  const stateRef = useRef({ roleIndex: 0, charIndex: 0, isDeleting: false });
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Reduced motion: skip the type/delete loop entirely — the displayed
    // text falls back to the full first role (derived in `displayText`).
    if (!roles.length || reducedMotion) {
      return;
    }

    const tick = () => {
      const currentRole = roles[stateRef.current.roleIndex] ?? "";
      const { charIndex, isDeleting } = stateRef.current;

      const nextIndex = isDeleting ? charIndex - 1 : charIndex + 1;
      stateRef.current.charIndex = nextIndex;
      setText(currentRole.slice(0, Math.max(nextIndex, 0)));

      let delay = isDeleting ? deletingDelay : typingDelay;

      if (!isDeleting && nextIndex === currentRole.length) {
        stateRef.current.isDeleting = true;
        delay = pauseDelay;
      } else if (isDeleting && nextIndex <= 0) {
        stateRef.current.isDeleting = false;
        stateRef.current.roleIndex =
          (stateRef.current.roleIndex + 1) % roles.length;
        delay = nextRoleDelay;
      }

      timeoutRef.current = window.setTimeout(tick, delay);
    };

    const startTyping = () => {
      if (timeoutRef.current === null) {
        // For the very first run, honour startDelay; on resume after pause,
        // schedule the next tick immediately (chain state is preserved).
        const initial = timeoutRef.current === null && stateRef.current.charIndex === 0;
        timeoutRef.current = window.setTimeout(tick, initial ? startDelay : 1);
      }
    };
    const stopTyping = () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    startTyping();

    // Pause when the hero scrolls off-screen. IntersectionObserver isn't
    // available in some test environments — fall back to "always on".
    const heroEl =
      typeof document !== "undefined" ? document.getElementById("hero") : null;
    let observer: IntersectionObserver | null = null;
    if (heroEl && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) startTyping();
          else stopTyping();
        },
        { threshold: 0 }
      );
      observer.observe(heroEl);
    }

    return () => {
      stopTyping();
      observer?.disconnect();
    };
  }, [
    roles,
    reducedMotion,
    startDelay,
    typingDelay,
    deletingDelay,
    pauseDelay,
    nextRoleDelay,
  ]);

  // Under reduced motion, show the complete first role immediately —
  // derived (not set in an effect) so the very first paint is correct.
  const displayText = reducedMotion ? (roles[0] ?? "") : text;

  return displayText;
}