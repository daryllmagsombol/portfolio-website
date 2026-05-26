import type { Experience } from "../types";

export const experience: Experience[] = [
  {
    period: "Apr 2023 — Present",
    company: "MDI Novare",
    role: "Software Engineer Lead",
    bullets: [
      [
        { type: "text", value: "Led frontend development at " },
        { type: "strong", value: "CBCI Bayad Center" },
        {
          type: "text",
          value:
            " — planning task execution, assigning work across the team, and documenting end-to-end technical processes.",
        },
      ],
      [
        { type: "text", value: "Dev Lead at " },
        { type: "strong", value: "Sun Life" },
        {
          type: "text",
          value:
            " for a migration of legacy Java systems from on-premises to AWS Cloud — overseeing architectural design, planning the migration path, and validating all functionality post-migration.",
        },
      ],
    ],
    tags: [
      "React",
      "NodeJS",
      "TypeScript",
      "Python",
      "Java",
      "AWS",
      "Terraform",
      "Tech Lead",
    ],
  },
  {
    period: "Aug 2021 — Apr 2023",
    company: "MDI Novare",
    role: "Senior Software Engineer",
    bullets: [
      [
        { type: "text", value: "Assigned to " },
        { type: "strong", value: "CBCI Bayad Center" },
        {
          type: "text",
          value:
            " — built vendor systems integrating in-house APIs across transactional, admin, and user management platforms, replacing legacy infrastructure.",
        },
      ],
      [
        {
          type: "text",
          value:
            "Served as the primary frontend engineer on the project, collaborating closely with back-end and product teams.",
        },
      ],
    ],
    tags: [
      "React",
      "NodeJS",
      "TypeScript",
      "Python",
      "AWS",
      "GraphQL",
      "Rest APIs",
    ],
  },
  {
    period: "Jul 2018 — Aug 2021",
    company: "TMJP BPO Services, Inc.",
    role: "Junior Web Developer",
    bullets: [
      [
        {
          type: "text",
          value:
            "Delivered full-stack websites from client specs within an Agile team — breaking down tasks, estimating effort, and shipping iteratively.",
        },
      ],
      [
        {
          type: "text",
          value:
            "Continuously levelled up in React, AWS, and PHP frameworks to stay current with the stack.",
        },
      ],
    ],
    tags: [
      "React",
      "NodeJS",
      "AdonisJS",
      "JavaScript",
      "PHP",
      "MySQL",
      "MongoDB",
      "AWS",
      "Agile",
    ],
  },
  {
    period: "Apr 2017 — May 2017",
    company: "Anderson BPO Inc.",
    role: "Web Developer Intern",
    bullets: [
      [
        {
          type: "text",
          value:
            "Maintained internal systems including seat assignment tooling and fixed UI/UX bugs across the codebase.",
        },
      ],
      [
        {
          type: "text",
          value:
            "Developed a backup module for an inventory system that stored PDF files to both the server and database.",
        },
      ],
    ],
    tags: ["ASP.NET MVC5", "C#", "SQL Server"],
  },
];
