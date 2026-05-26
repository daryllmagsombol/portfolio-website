import type { HeroContent } from "../types";

export const hero: HeroContent = {
  greeting: "Hi, I'm",
  name: "Daryll Magsombol",
  roles: [
    "Software Engineer",
    "React / React Native Dev",
    "JavaScript / TypeScript Dev",
  ],
  descriptionParts: [
    {
      type: "text",
      value:
        "7+ years building high-quality web products and cross-platform mobile apps. Currently leading software development at ",
    },
    {
      type: "link",
      value: "MDI Novare",
      href: "https://www.novare.com.ph/",
      className: "accent",
    },
    {
      type: "text",
      value: ", based in Pasig, Metro Manila.",
    },
  ],
  cta: [
    {
      label: "View my work",
      href: "#projects",
      variant: "primary",
    },
    {
      label: "View LinkedIn ↗",
      href: "https://www.linkedin.com/in/daryll-magsombol",
      variant: "ghost",
      external: true,
    },
  ],
};
