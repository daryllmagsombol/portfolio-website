import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { SectionHeader } from "../ui/SectionHeader";
import { TiltCard } from "../ui/TiltCard";
import { TextParts } from "../TextParts";
import type { Project, SectionHeaderData, TextPart } from "../../types";

type ProjectSectionProps = {
  projects: Project[];
  header: SectionHeaderData;
  sectionIndex: number;
  noteParts: TextPart[];
};

export function ProjectSection({ projects, header, sectionIndex, noteParts }: ProjectSectionProps) {
  const sectionRef = useRef<HTMLElement>(null!);
  const cardsRef = useRef<HTMLDivElement>(null!);

  useGSAP(() => {
    const cards = cardsRef.current?.children;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      if (cards) gsap.set(cards, { opacity: 1, y: 0 });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (cards) {
        gsap.from(cards, {
          opacity: 0,
          y: 40,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      }
    });
  }, { scope: sectionRef });

  return (
    <section id="projects" ref={sectionRef} className="section-world section px-8 section-padding" style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
      <div className="container mx-auto">
        <SectionHeader {...header} index={sectionIndex} />
        <div ref={cardsRef} className="relative z-0 grid grid-cols-1 gap-8 md:grid-cols-2">
          {projects.map((project) => (
            <TiltCard key={project.title}>
              <div className="glass relative h-full overflow-hidden rounded-2xl">
                <a
                  href={project.primaryLink?.href || "#"}
                  target={project.primaryLink?.href?.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group relative block aspect-video overflow-hidden bg-[#0a0514]"
                >
                  <img
                    src={project.image.src}
                    alt={project.image.alt}
                    className={`h-full max-h-full w-full max-w-full object-cover transition-transform duration-500 group-hover:scale-105 ${project.image.contain ? "object-contain p-4" : ""}`}
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-black/80 to-transparent px-3 py-2 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
                    <span className="font-mono text-xs md:text-sm" style={{ color: "var(--section-accent)" }}>{project.image.overlayText}</span>
                  </div>
                </a>
                <div className="card-padding">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold leading-snug tracking-tight text-[#f5f3ff]">
                      {project.title}
                      {project.badge && <span className="ml-1.5 text-xs opacity-50">{project.badge}</span>}
                    </h3>
                    {project.links?.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.ariaLabel ?? link.title}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-sm text-[#9a9ab0] transition-colors hover:opacity-80"
                        title={link.title}
                      >
                        ↗
                      </a>
                    ))}
                  </div>
                  {project.metric && (
                    <p
                      className="mb-2 font-mono text-xs"
                      style={{ color: "var(--section-accent)" }}
                    >
                      {project.metric}
                    </p>
                  )}
                  <p className="mb-4 text-sm leading-relaxed text-[#a1a1b5]">{project.description}</p>
                  <ul className="flex flex-wrap space-sm">
                    {project.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded px-2 py-0.5 font-mono text-[0.72rem] tracking-wide transition-colors"
                        style={{
                          backgroundColor: "color-mix(in srgb, var(--section-accent) 10%, transparent)",
                          color: "var(--section-accent)",
                        }}
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
        {noteParts.length > 0 && (
          <p className="relative z-10 mt-8 text-center text-sm italic text-[#9a9ab0]">
            <TextParts parts={noteParts} />
          </p>
        )}
      </div>
    </section>
  );
}
