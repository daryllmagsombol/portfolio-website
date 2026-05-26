export type NavLink = {
  label: string;
  href: string;
};

export type ExternalLink = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export type ButtonLink = {
  label: string;
  href: string;
  variant: "primary" | "ghost";
  external?: boolean;
};

export type ProjectLink = {
  href: string;
  label: string;
  title?: string;
  ariaLabel?: string;
};

export type ProjectImage = {
  src: string;
  alt: string;
  overlayText: string;
  contain?: boolean;
};

export type Project = {
  title: string;
  badge?: string;
  description: string;
  tags: string[];
  image: ProjectImage;
  primaryLink?: ProjectLink;
  links?: ProjectLink[];
};

export type ExperienceBullet = TextPart[];

export type Experience = {
  period: string;
  company: string;
  role: string;
  bullets: ExperienceBullet[];
  tags: string[];
};

export type Certification = {
  title: string;
  issuer: string;
  date: string;
  href: string;
  image: {
    src: string;
    alt: string;
  };
};

export type SocialLink = {
  label: string;
  href: string;
};

export type TextPart =
  | { type: "text"; value: string }
  | { type: "strong"; value: string }
  | { type: "link"; value: string; href: string; className?: string };

export type AboutParagraph = {
  parts: TextPart[];
};

export type HeroContent = {
  greeting: string;
  name: string;
  roles: string[];
  descriptionParts: TextPart[];
  cta: ButtonLink[];
};

export type SectionHeaderData = {
  label: string;
  title: string;
  note?: string;
};
