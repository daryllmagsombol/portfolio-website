import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { SectionHeader } from "../ui/SectionHeader";
import { TiltCard } from "../ui/TiltCard";
import { TextParts } from "../TextParts";
import type { Certification, SectionHeaderData, TextPart } from "../../types";

type CertificationsSectionProps = {
  items: Certification[];
  header: SectionHeaderData;
  sectionIndex: number;
  noteParts: TextPart[];
};

export function CertificationsSection({ items, header, sectionIndex, noteParts }: CertificationsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null!);

  useGSAP(() => {
    const certCards = sectionRef.current?.querySelectorAll(".cert-card");
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      if (certCards) gsap.set(certCards, { opacity: 1, y: 0 });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (certCards) {
        gsap.from(certCards, {
          opacity: 0,
          y: 20,
          duration: 0.5,
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
    <section id="certifications" ref={sectionRef} className="section-world section px-8 section-padding" style={{ margin: "0 auto" }}>
      <div className="container mx-auto" style={{ maxWidth: "var(--max-w)" }}>
        <SectionHeader {...header} index={sectionIndex} />

        {items.length > 0 ? (
          <div className="mx-auto max-w-md">
            {items.map((item) => (
              <TiltCard key={item.title}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cert-card glass flex items-center space-md rounded-2xl card-padding transition-colors"
                  style={{ borderColor: "color-mix(in srgb, var(--section-accent) 20%, transparent)" }}
                >
                  <img
                    src={item.image.src}
                    alt={item.image.alt}
                    className="h-12 w-12 flex-shrink-0 rounded-lg object-contain"
                  />
                  <div>
                    <h3 className="text-base font-semibold text-[#f5f3ff]">{item.title}</h3>
                    <p className="text-xs tracking-wide" style={{ color: "var(--section-accent)" }}>{item.issuer}</p>
                    <p className="text-xs text-[#9a9ab0]">{item.date}</p>
                  </div>
                </a>
              </TiltCard>
            ))}
          </div>
        ) : (
          <div className="glass mx-auto max-w-md rounded-2xl border-dashed p-8 text-center">
            <p className="text-sm text-[#9a9ab0]">More credentials coming soon.</p>
          </div>
        )}

        {noteParts.length > 0 && (
          <p className="mt-6 text-center text-sm italic text-[#9a9ab0]">
            <TextParts parts={noteParts} />
          </p>
        )}
      </div>
    </section>
  );
}
