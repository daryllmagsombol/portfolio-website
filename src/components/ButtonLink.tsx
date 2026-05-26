import type { ButtonLink as ButtonLinkType } from "../types";

type ButtonLinkProps = ButtonLinkType & {
  className?: string;
  size?: "default" | "large";
};

export function ButtonLink({
  label,
  href,
  variant,
  external,
  className,
  size = "default",
}: ButtonLinkProps) {
  const variantClass = variant === "primary" ? "btn-primary" : "btn-ghost";
  const sizeClass = size === "large" ? "btn--large" : "";
  const classes = ["btn", variantClass, sizeClass, className]
    .filter(Boolean)
    .join(" ");
  const isExternal = external ?? href.startsWith("http");

  return (
    <a
      href={href}
      className={classes}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener" : undefined}
    >
      {label}
    </a>
  );
}
