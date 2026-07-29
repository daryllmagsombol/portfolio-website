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
  }, { scope: sectionRef });

  return (
    <section id="projects" ref={sectionRef} className="section-world section px-8 py-28" style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
      <div className="container mx-auto">
        <SectionHeader {...header} index={sectionIndex} />
        <div ref={cardsRef} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {projects.map((project) => (
            <TiltCard key={project.title}>
              <div className="glass rounded-2xl overflow-hidden">
                <a
                  href={project.primaryLink?.href || "#"}
                  target={project.primaryLink?.href?.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group relative block aspect-video overflow-hidden bg-[#0a0514]"
                >
                  <img
                    src={project.image.src}
                    alt={project.image.alt}
                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${project.image.contain ? "object-contain p-4" : ""}`}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="font-mono text-sm" style={{ color: "var(--section-accent)" }}>{project.image.overlayText}</span>
                  </div>
                </a>
                <div className="p-5">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold tracking-tight text-[#f5f3ff]">
                      {project.title}
                      {project.badge && <span className="ml-1.5 text-xs opacity-50">{project.badge}</span>}
                    </h3>
                    {project.links?.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#9a9ab0] transition-colors hover:opacity-80"
                        title={link.title}
                      >
                        ↗
                      </a>
                    ))}
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-[#a1a1b5]">{project.description}</p>
                  <ul className="flex flex-wrap gap-1.5">
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
          <p className="mt-6 text-center text-sm italic text-[#9a9ab0]">
            <TextParts parts={noteParts} />
          </p>
        )}
      </div>
    </section>
  );
}
