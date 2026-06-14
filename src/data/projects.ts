import type { Project } from "../types";

export const projects: Project[] = [
  {
    title: "Daryll & Hannah",
    description:
      "A custom-built wedding website for Hannah and me — showcasing our journey together, venue and schedule details, a photo gallery, and an online RSVP system for managing guest responses.",
    tags: ["React", "NodeJS", "MySQL", "Azure", "Cloudflare"],
    image: {
      src: "/images/1_wedding_site.png",
      alt: "Daryll and Hannah Wedding Site",
      overlayText: "Visit ↗",
    },
    primaryLink: {
      href: "https://daryllandhannah.com",
      label: "Visit ↗",
      title: "Live site",
    },
    links: [
      {
        href: "https://daryllandhannah.com",
        label: "↗",
        title: "Live site",
      },
    ],
  },
  {
    title: "Blink Social",
    description:
      "Instagram-like social media platform built with NestJS, Next.js, PostgreSQL, and Prisma. Mono Repo via Turbo Repo. Vibe coded in OpenCode AI.",
    tags: [
      "Nest JS",
      "Next JS",
      "React",
      "PostgreSQL",
      "Prisma",
      "Turbo Repo",
      "OpenCode AI",
      "Azure",
    ],
    image: {
      src: "images/blink-social.jpg",
      alt: "Blink Social",
      overlayText: "Visit ↗",
    },
    primaryLink: {
      href: "https://blink.darjosh.dev/",
      label: "Visit ↗",
      title: "Live site",
    },
    links: [
      {
        href: "https://blink.darjosh.dev/",
        label: "↗",
        title: "Live site",
      },
    ],
  },
  {
    title: "Transformlit Community Site",
    badge: "MVP",
    description:
      "A multi-tenant community platform built for reading groups, book clubs, and literary organizations. Warm, paper-toned design with group management, chat, announcements, and document sharing.",
    tags: [
      "Nest JS",
      "Next JS",
      "React",
      "PostgreSQL",
      "Prisma",
      "Turbo Repo",
      "Github Copilot",
      "Azure",
    ],
    image: {
      src: "images/transformlit-webapp-mvp.jpeg",
      alt: "Transformlit Community Site",
      overlayText: "Visit ↗",
    },
    primaryLink: {
      href: "https://transformlit.darjosh.dev/",
      label: "Visit ↗",
      title: "Live site",
    },
    links: [
      {
        href: "https://transformlit.darjosh.dev/",
        label: "↗",
        title: "Live site",
      },
    ],
  },
  {
    title: "IBMF Cantata - Check-in System",
    description:
      "A custom-built check-in system for the IBMF Cantata event — streamlining the registration and attendance tracking process.",
    tags: ["React", "NodeJS", "MySQL", "Azure"],
    image: {
      src: "/images/cantata-check-in.jpeg",
      alt: "IBMF Cantata Check-in System",
      overlayText: "Visit ↗",
    },
    primaryLink: {
      href: "https://cantata.transformlit.com/",
      label: "Visit ↗",
      title: "Live site",
    },
    links: [
      {
        href: "https://cantata.transformlit.com/",
        label: "↗",
        title: "Live site",
      },
    ],
  },
  {
    title: "IBMF Phils - Wordpress Site",
    description:
      "A website for IBMF Philippines built on WordPress — featuring event information, registration, and resources for attendees and members. Volunteered to modify content and create Javascript-based interactive elements.",
    tags: ["WordPress", "Elementor", "JavaScript"],
    image: {
      src: "/images/ibmf-phils.jpeg",
      alt: "IBMF Philippines Wordpress Site",
      overlayText: "Visit ↗",
    },
    primaryLink: {
      href: "https://ibmfphils.org/",
      label: "Visit ↗",
      title: "Live site",
    },
    links: [
      {
        href: "https://ibmfphils.org/",
        label: "↗",
        title: "Live site",
      },
    ],
  },
  {
    title: "SmartPower Monitor",
    badge: "POC",
    description:
      "A prototype energy monitoring dashboard that visualizes power consumption data in real time — built to demonstrate extracting power data from an SDM via USB Bus.",
    tags: ["React", "NodeJS", "MySQL", "Python", "Charts"],
    image: {
      src: "/images/smartpower.png",
      alt: "SmartPower Monitor",
      overlayText: "Visit ↗",
    },
    primaryLink: {
      href: "https://smartpower.darjosh.dev/",
      label: "Visit ↗",
      title: "Live site",
    },
    links: [
      {
        href: "https://smartpower.darjosh.dev/",
        label: "↗",
        title: "Live site",
        ariaLabel: "Open SmartPower Monitor live site",
      },
    ],
  },
  {
    title: "Transformlit App",
    description:
      "A mobile app published on Google Play Store — a community helping users transform their reading habit through curated Christian literature.",
    tags: ["React Native", "NodeJS", "TypeScript", "MySQL", "Azure", "Android"],
    image: {
      src: "/images/transformlit_app_old.jpg",
      alt: "Transformlit App",
      overlayText: "APK Pure (delisted from Play Store) ↗",
      contain: true,
    },
    primaryLink: {
      href: "https://apkpure.net/transformlit-app/com.transformlit.app",
      label: "APK Pure (delisted from Play Store) ↗",
      title: "APK Pure",
    },
    links: [
      {
        href: "https://apkpure.net/transformlit-app/com.transformlit.app",
        label: "↗",
        title: "APK Pure",
      },
    ],
  },
  {
    title: "Eventful",
    badge: "POC",
    description:
      "A proof-of-concept event discovery platform for the Philippines — browse and explore local events in a clean, modern interface.",
    tags: ["React", "JavaScript"],
    image: {
      src: "/images/3_eventful_poc.png",
      alt: "Eventful POC",
      overlayText: "Visit ↗",
    },
    primaryLink: {
      href: "https://eventfulph.darjosh.dev/",
      label: "Visit ↗",
      title: "Live site",
    },
    links: [
      {
        href: "https://eventfulph.darjosh.dev/",
        label: "↗",
        title: "Live site",
        ariaLabel: "Open Eventful live site",
      },
    ],
  },
];
