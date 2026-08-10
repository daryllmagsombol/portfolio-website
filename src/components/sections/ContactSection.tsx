import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { SectionHeader } from "../ui/SectionHeader";
import { ButtonLink } from "../ButtonLink";
import { SocialLinks } from "../SocialLinks";
import type { ButtonLink as BtnType, SectionHeaderData, SocialLink } from "../../types";

type ContactSectionProps = {
  description: string;
  cta: BtnType;
  socialLinks: SocialLink[];
  header: SectionHeaderData;
  sectionIndex: number;
};

export function ContactSection({ description, cta, socialLinks, header, sectionIndex }: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null!);

  useGSAP(() => {
    const children = sectionRef.current?.children;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      if (children) gsap.set(children, { opacity: 1, y: 0 });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (children) {
        gsap.from(children, {
          opacity: 0,
          y: 24,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        });
      }
    });
  }, { scope: sectionRef });

  return (
    <section id="contact" ref={sectionRef} className="section-world section flex min-h-[80vh] flex-col items-center justify-center px-8 section-padding text-center">
      <div className="mx-auto max-w-[560px]">
        <SectionHeader {...header} index={sectionIndex} />
        <h2 className="mb-4 text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-[1.15] tracking-tight">
          Let's Build{" "}
          <span
            style={{
              background: "linear-gradient(90deg, var(--section-accent), #d97757)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Something Great.
          </span>
        </h2>
        <p className="mx-auto mb-8 max-w-[440px] text-base leading-relaxed text-[#a1a1b5]">
          {description}
        </p>
        <div className="mb-8">
          <ButtonLink {...cta} size="large" />
        </div>
        <SocialLinks links={socialLinks} />
      </div>
    </section>
  );
}
