import type { HeroContent } from "../types";
import { useTypewriter } from "../hooks/useTypewriter";
import { ButtonLink } from "./ButtonLink";
import { TextParts } from "./TextParts";

type HeroSectionProps = {
  content: HeroContent;
};

export function HeroSection({ content }: HeroSectionProps) {
  const typedText = useTypewriter(content.roles);

  return (
    <section id="hero">
      <div className="hero-content">
        <p className="hero-greeting mono">{content.greeting}</p>
        <h1 className="hero-name">
          {content.name}
          <span className="accent">.</span>
        </h1>
        <h2 className="hero-role">
          <span>{typedText}</span>
          <span className="cursor">|</span>
        </h2>
        <p className="hero-desc">
          <TextParts parts={content.descriptionParts} />
        </p>
        <div className="hero-cta">
          {content.cta.map((cta) => (
            <ButtonLink key={cta.label} {...cta} />
          ))}
        </div>
      </div>
      <div className="hero-scroll-hint">
        <span className="mono">scroll</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
}
