import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { SectionHeader } from "../ui/SectionHeader";
import { TextParts } from "../TextParts";
import { ButtonLink } from "../ButtonLink";
import type { AboutParagraph, ButtonLink as BtnType, SectionHeaderData } from "../../types";

type AboutSectionProps = {
  paragraphs: AboutParagraph[];
  skills: string[];
  skillsTitle: string;
  cta: BtnType;
  header: SectionHeaderData;
  sectionIndex: number;
};

export function AboutSection({ paragraphs, skills, skillsTitle, cta, header, sectionIndex }: AboutSectionProps) {
  const sectionRef = useRef<HTMLElement>(null!);
  const leftRef = useRef<HTMLDivElement>(null!);
  const rightRef = useRef<HTMLDivElement>(null!);

  useGSAP(() => {
    gsap.from(leftRef.current, {
      opacity: 0,
      x: -30,
      duration: 0.7,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        toggleActions: "play none none none",
      },
    });
    gsap.from(rightRef.current, {
      opacity: 0,
      x: 30,
      duration: 0.7,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        toggleActions: "play none none none",
      },
    });
    gsap.from(rightRef.current?.children, {
      opacity: 0,
      y: 8,
      duration: 0.3,
      stagger: 0.04,
      ease: "power1.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        toggleActions: "play none none none",
      },
    });
  }, { scope: sectionRef });

  return (
    <section id="about" ref={sectionRef} className="section-world section px-8 py-28" style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
      <div className="container mx-auto">
        <SectionHeader {...header} index={sectionIndex} />
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.2fr_1fr]">
          {/* Left: Bio */}
          <div ref={leftRef}>
            {paragraphs.map((p, i) => (
              <p key={i} className="mb-4 text-[0.975rem] leading-relaxed text-[#a1a1b5]">
                <TextParts parts={p.parts} />
              </p>
            ))}
            <div className="mt-6">
              <ButtonLink {...cta} />
            </div>
          </div>

          {/* Right: Skills */}
          <div ref={rightRef}>
            <h3 className="kicker mb-4">{skillsTitle}</h3>
            <div className="grid grid-cols-2 gap-2">
              {skills.map((skill) => (
                <div
                  key={skill}
                  className="glass rounded-lg px-3 py-2 font-mono text-sm transition-colors"
                  style={{
                    borderColor: "color-mix(in srgb, var(--section-accent) 15%, transparent)",
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
