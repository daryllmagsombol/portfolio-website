import type { SectionHeaderData } from "../types";

export const sections: Record<string, SectionHeaderData> = {
  projects: {
    label: "01. work",
    title: "Projects",
    note: "🚧 This section is a work in progress — more projects coming soon.",
  },
  experience: {
    label: "02. experience",
    title: "Work History",
  },
  about: {
    label: "03. me",
    title: "About",
  },
  certifications: {
    label: "04. credentials",
    title: "Certifications",
  },
  contact: {
    label: "05. connect",
    title: "Get In Touch",
  },
};
