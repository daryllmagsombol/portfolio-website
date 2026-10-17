import { useRef, useCallback, useState } from "react";

type TiltCardProps = {
  children: React.ReactNode;
  className?: string;
  sensitivity?: number;
};

export function TiltCard({ children, className = "", sensitivity = 15 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  // Tilt only on precise-pointer devices WITHOUT reduced motion. Touch devices
  // get a static ~2° skew (spec's touch fallback); reduced-motion stays flat.
  const [interaction] = useState(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hoverable = window.matchMedia("(hover: hover)").matches;
    return { hoverable: hoverable && !reduced, touchSkew: !hoverable && !reduced };
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || !interaction.hoverable) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cardRef.current.style.transform = `perspective(1200px) rotateY(${x * sensitivity}deg) rotateX(${-y * sensitivity}deg)`;
      cardRef.current.style.setProperty("--mx", `${(e.clientX - rect.left) / rect.width * 100}%`);
      cardRef.current.style.setProperty("--my", `${(e.clientY - rect.top) / rect.height * 100}%`);
    },
    [interaction.hoverable, sensitivity]
  );

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(1200px) rotateY(0deg) rotateX(0deg)";
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`tilt-card group relative transition-transform duration-300 ${className}`}
      style={{
        transformStyle: "preserve-3d",
        ...(interaction.touchSkew
          ? { transform: "perspective(1200px) rotateY(-2deg) rotateX(-1deg)" }
          : {}),
      }}
    >
      {children}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-400 group-hover:opacity-100"
        style={{
          background: `radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.12), transparent 65%)`,
        }}
      />
    </div>
  );
}
