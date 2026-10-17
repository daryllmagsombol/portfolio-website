import { useEffect, useRef } from "react";

/**
 * Cursor glow that follows the pointer.
 *
 * Performance: batches mouse events into a single rAF tick and writes the
 * position directly to a DOM ref via style.transform. The component does not
 * re-render after its initial mount — every pointer move is a DOM write, not
 * a React state update.
 */
export function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: -100, y: -100 });
  const visibleRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const isHover = window.matchMedia("(hover: hover)").matches;
    if (!isHover) return;

    const tick = () => {
      rafRef.current = null;
      const x = targetRef.current.x;
      const y = targetRef.current.y;
      const transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      const opacity = visibleRef.current ? 1 : 0;
      if (dotRef.current) {
        dotRef.current.style.transform = transform;
        dotRef.current.style.opacity = String(opacity);
      }
      if (glowRef.current) {
        glowRef.current.style.transform = transform;
        glowRef.current.style.opacity = String(opacity * 0.3);
      }
    };

    const schedule = () => {
      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    const move = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      visibleRef.current = true;
      schedule();
    };
    const leave = () => {
      visibleRef.current = false;
      schedule();
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {/* Outer glow */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] h-8 w-8 rounded-full blur-xl"
        style={{ backgroundColor: "var(--section-accent)" }}
      />
      {/* Inner dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: "var(--section-accent)" }}
      />
    </>
  );
}