import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useTypewriter } from "../../hooks/useTypewriter";
import { ButtonLink } from "../ButtonLink";
import { TextParts } from "../TextParts";
import type { HeroContent } from "../../types";

type HeroSectionProps = { content: HeroContent };

export function HeroSection({ content }: HeroSectionProps) {
  const typedText = useTypewriter(content.roles);
  const entranceRef = useRef<HTMLDivElement>(null!);
  const indicatorRef = useRef<HTMLDivElement>(null!);

  // Entrance (fade-up on mount) + scroll-indicator fade-out, gated on
  // reduced motion: reduce → set final states only.
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(entranceRef.current, { opacity: 1, y: 0 });
      // Keep the scroll affordance visible; no fade-out.
      gsap.set(indicatorRef.current, { opacity: 1 });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        entranceRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
      gsap.to(indicatorRef.current, {
        opacity: 0,
        delay: 3,
        duration: 1,
        ease: "power1.inOut",
      });
    });
  });

  return (
    <section id="hero" className="relative flex min-h-screen flex-col justify-center px-8 pt-20" style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
      <div ref={entranceRef}>
        <p className="kicker mb-3">{content.greeting}</p>
        <h1 className="font-serif text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[1.05] tracking-tight text-[#f5f3ff]">
          {content.name}
          <span style={{ color: "var(--section-accent)" }}>.</span>
        </h1>
        <h2 className="mb-6 font-mono text-[clamp(1.1rem,2.5vw,1.6rem)] font-light text-[#a1a1b5] min-h-[2.5rem]">
          <span>{typedText}</span>
          <span className="inline-block animate-pulse ml-0.5" style={{ color: "var(--section-accent)" }}>|</span>
        </h2>
        <p className="mb-8 max-w-[520px] text-base leading-relaxed text-[#a1a1b5]">
          <TextParts parts={content.descriptionParts} />
        </p>
        <div className="flex flex-wrap gap-3">
          {content.cta.map((cta) => (
            <ButtonLink
              key={cta.label}
              {...cta}
              className={cta.variant === "ghost" ? "text-sm opacity-80 hover:opacity-100" : undefined}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={indicatorRef}
        className="absolute bottom-8 left-8 hidden min-[500px]:flex flex-col items-center gap-2"
      >
        <span className="kicker text-[10px]" style={{ writingMode: "vertical-rl" }}>scroll</span>
        <div className="h-[50px] w-px" style={{ background: `linear-gradient(to bottom, var(--section-accent), transparent)` }} />
      </div>
    </section>
  );
}
