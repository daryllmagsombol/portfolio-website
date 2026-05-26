import type { SectionHeaderData } from "../types";

type SectionHeaderProps = SectionHeaderData & {
  className?: string;
};

export function SectionHeader({
  label,
  title,
  note,
  className,
}: SectionHeaderProps) {
  const classes = ["section-header", "reveal", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <span className="section-label mono">{label}</span>
      <h2 className="section-title">{title}</h2>
      {note ? <p className="section-note mono">{note}</p> : null}
    </div>
  );
}
