import type { AboutParagraph, ButtonLink } from "../types";

export const aboutParagraphs: AboutParagraph[] = [
  {
    parts: [
      { type: "text", value: "Hey! I'm Daryll — a software engineer with " },
      { type: "strong", value: "7+ years of experience" },
      {
        type: "text",
        value:
          " building web and mobile products. I'm based in Pasig, Metro Manila, and currently working as a Software Engineer Lead at ",
      },
      {
        type: "link",
        value: "MDI Novare",
        href: "https://www.novare.com.ph/",
        className: "accent",
      },
      { type: "text", value: "." },
    ],
  },
  {
    parts: [
      { type: "text", value: "I hold a BS in Computer Science from " },
      { type: "strong", value: "STI College Ortigas-Cainta" },
      {
        type: "text",
        value:
          ". My dad got me into computers early and I never looked back — I'm genuinely excited by the craft of software: clean code, good architecture, and products that actually work well for people.",
      },
    ],
  },
  {
    parts: [
      {
        type: "text",
        value:
          "Outside of the day job, I volunteer as a full-stack developer for ",
      },
      {
        type: "link",
        value: "Transform Lit",
        href: "https://transformlit.com/",
        className: "accent",
      },
      {
        type: "text",
        value: ", enjoy building PCs, and spend time with my family.",
      },
    ],
  },
];

export const aboutCta: ButtonLink = {
  label: "Say hello →",
  href: "mailto:darylljoshuamagsombol@gmail.com",
  variant: "primary",
};

export const aboutSkillsTitle = "tech i work with";
