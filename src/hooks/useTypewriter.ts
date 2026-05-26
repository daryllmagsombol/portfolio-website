import { useEffect, useRef, useState } from "react";

type TypewriterOptions = {
  startDelay?: number;
  typingDelay?: number;
  deletingDelay?: number;
  pauseDelay?: number;
  nextRoleDelay?: number;
};

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

  const [text, setText] = useState("");
  const stateRef = useRef({ roleIndex: 0, charIndex: 0, isDeleting: false });
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!roles.length) {
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

    timeoutRef.current = window.setTimeout(tick, startDelay);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [
    roles,
    startDelay,
    typingDelay,
    deletingDelay,
    pauseDelay,
    nextRoleDelay,
  ]);

  return text;
}
