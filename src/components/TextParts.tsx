import type { TextPart } from "../types";

type TextPartsProps = {
  parts: TextPart[];
};

export function TextParts({ parts }: TextPartsProps) {
  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "strong") {
          return <strong key={`part-${index}`}>{part.value}</strong>;
        }

        if (part.type === "link") {
          const isExternal = !part.href.startsWith("#");
          return (
            <a
              key={`part-${index}`}
              href={part.href}
              className={part.className}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener" : undefined}
            >
              {part.value}
            </a>
          );
        }

        return <span key={`part-${index}`}>{part.value}</span>;
      })}
    </>
  );
}
