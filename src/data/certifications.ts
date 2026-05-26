import type { Certification, TextPart } from "../types";

export const certifications: Certification[] = [
  {
    title: "AWS Certified Cloud Practitioner ↗",
    issuer: "Amazon Web Services",
    date: "Issued Dec 2022 · Expires Dec 2028",
    href: "https://www.credly.com/badges/af0a44ff-827f-49cd-b1f9-f8676991bd26",
    image: {
      src: "https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/dark/aws-color.png",
      alt: "AWS Certified Cloud Practitioner badge",
    },
  },
];

export const certificationsNoteParts: TextPart[] = [
  {
    type: "text",
    value: "More certifications in progress — always leveling up. ",
  },
  {
    type: "link",
    value: "View all on Credly ↗",
    href: "https://www.credly.com/users/daryll-joshua-magsombol/badges",
    className: "accent",
  },
];
