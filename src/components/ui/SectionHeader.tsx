import type { SectionHeaderData } from "../../types";

type SectionHeaderProps = SectionHeaderData & {
  index: number; // section number for prefix
};

export function SectionHeader({ label, title, note, index }: SectionHeaderProps) {
  return (
    <div className="section-header mb-8">
      <p className="kicker mb-2">
        // {String(index).padStart(2, "0")} · {label.toUpperCase()}
      </p>
      <h2 className="text-[clamp(1.8rem,3vw,2.4rem)] font-semibold tracking-tight text-[#f5f3ff]">
        {title}
      </h2>
      {note && (
        <p className="mt-2 text-sm text-[#9a9ab0] leading-relaxed">{note}</p>
      )}
    </div>
  );
}
