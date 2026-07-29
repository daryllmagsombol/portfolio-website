import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { SectionHeader } from "../ui/SectionHeader";
import { TextParts } from "../TextParts";
import type { Experience, SectionHeaderData } from "../../types";

type ExperienceSectionProps = {
  items: Experience[];
  header: SectionHeaderData;
  sectionIndex: number;
};

export function ExperienceSection({ items, header, sectionIndex }: ExperienceSectionProps) {
  const sectionRef = useRef<HTMLElement>(null!);
  const entriesRef = useRef<HTMLDivElement>(null!);
  const lineRef = useRef<HTMLDivElement>(null!);

  useGSAP(() => {
    const entries = entriesRef.current?.children;
    if (entries) {
      // Draw timeline line
      gsap.from(lineRef.current, {
        scaleY: 0,
        transformOrigin: "top center",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          end: "bottom 20%",
          scrub: 1,
          toggleActions: "play none none none",
        },
      });

      // Reveal entries
      gsap.from(entries, {
        opacity: 0,
        x: -20,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          toggleActions: "play none none none",
        },
      });

      // Activate dots
      Array.from(entries).forEach((entry) => {
        const dot = entry.querySelector(".timeline-dot");
        if (dot) {
          gsap.to(dot, {
            scale: 1.3,
            opacity: 1,
            scrollTrigger: {
              trigger: entry,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          });
        }
      });
    }
  }, { scope: sectionRef });

  return (
    <section id="experience" ref={sectionRef} className="section-world section px-8 py-28" style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
      <div className="container relative mx-auto">
        <SectionHeader {...header} index={sectionIndex} />

        {/* Timeline line */}
        <div
          ref={lineRef}
          className="absolute left-[100px] top-0 h-full w-px origin-top"
          style={{ background: `linear-gradient(to bottom, var(--section-accent), transparent)` }}
        />

        <div ref={entriesRef} className="flex flex-col gap-6">
          {items.map((item) => (
            <div key={item.period} className="relative pl-[120px]">
              {/* Dot */}
              <div className="timeline-dot absolute left-[93px] top-1.5 h-[9px] w-[9px] rounded-full opacity-60" style={{ backgroundColor: "var(--section-accent)", boxShadow: `0 0 8px var(--section-accent)` }} />

              {/* Period badge */}
              <div className="mb-1">
                <span className="font-mono text-xs tracking-wide" style={{ color: "var(--section-accent)" }}>
                  {item.period}
                </span>
              </div>

              {/* Card content */}
              <div className="glass rounded-2xl p-6">
                <p className="mb-1 text-sm text-[#9a9ab0]">{item.company}</p>
                <p className="mb-4 text-base font-semibold text-[#f5f3ff]">{item.role}</p>
                <ul className="mb-4 flex flex-col gap-2">
                  {item.bullets.map((bullet, bi) => (
                    <li key={bi} className="pl-4 text-sm leading-relaxed text-[#a1a1b5]" style={{ position: "relative" }}>
                      <span className="absolute left-0 text-xs" style={{ color: "var(--section-accent)" }}>▹</span>
                      <TextParts parts={bullet} />
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded px-2 py-0.5 font-mono text-[0.72rem] tracking-wide"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--section-accent) 10%, transparent)",
                        color: "var(--section-accent)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
