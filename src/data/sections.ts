import type { SectionHeaderData } from "../types";

export const sections: Record<string, SectionHeaderData> = {
  projects: {
    label: "work",
    title: "Projects",
    note: "This section is a work in progress — more projects coming soon.",
  },
  experience: {
    label: "experience",
    title: "Work History",
  },
  about: {
    label: "me",
    title: "About",
  },
  certifications: {
    label: "credentials",
    title: "Certifications",
  },
  contact: {
    label: "connect",
    title: "Get In Touch",
  },
};
