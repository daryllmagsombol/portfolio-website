import type { Experience } from "../types";
import { TextParts } from "./TextParts";

type ExperienceCardProps = {
  item: Experience;
};

export function ExperienceCard({ item }: ExperienceCardProps) {
  return (
    <div className="exp-card reveal">
      <div className="exp-meta">
        <span className="exp-period mono">{item.period}</span>
        <span className="exp-company">{item.company}</span>
      </div>
      <div className="exp-detail">
        <h3 className="exp-role">{item.role}</h3>
        <ul className="exp-bullets">
          {item.bullets.map((bullet, index) => (
            <li key={`bullet-${index}`}>
              <TextParts parts={bullet} />
            </li>
          ))}
        </ul>
        <ul className="exp-tags">
          {item.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
