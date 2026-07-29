import { useEffect } from "react";
import { CursorGlow } from "./components/CursorGlow";
import { NoiseOverlay } from "./components/NoiseOverlay";
import { GridOverlay } from "./components/GridOverlay";
import { WorldBackground } from "./components/WorldBackground";
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/sections/HeroSection";
import { ProjectSection } from "./components/sections/ProjectSection";
import { ExperienceSection } from "./components/sections/ExperienceSection";
import { AboutSection } from "./components/sections/AboutSection";
import { CertificationsSection } from "./components/sections/CertificationsSection";
import { ContactSection } from "./components/sections/ContactSection";
import { hero } from "./data/hero";
import { projects, projectsGitHubNoteParts } from "./data/projects";
import { experience } from "./data/experience";
import { aboutParagraphs, aboutCta, aboutSkillsTitle } from "./data/about";
import { certifications, certificationsNoteParts } from "./data/certifications";
import { contactDescription, contactCta } from "./data/contact";
import { skills } from "./data/skills";
import { socialLinks } from "./data/socials";
import { sections } from "./data/sections";
import { navLinks, navCta } from "./data/nav";
import { useScrollAnimation } from "./hooks/useScrollAnimation";
import { useActiveSection } from "./hooks/useActiveSection";
import { morphSectionColors } from "./hooks/useScrollAnimation";

function App() {
  useScrollAnimation();
  const activeSection = useActiveSection();

  useEffect(() => {
    morphSectionColors(activeSection);
  }, [activeSection]);

  return (
    <>
      <CursorGlow />
      <NoiseOverlay />
      <GridOverlay />
      <WorldBackground />
      <NavBar links={navLinks} cta={navCta} />
      <main className="relative z-10">
        <HeroSection content={hero} />
        <ProjectSection
          projects={projects}
          header={sections.projects}
          sectionIndex={1}
          noteParts={projectsGitHubNoteParts as any}
        />
        <ExperienceSection
          items={experience}
          header={sections.experience}
          sectionIndex={2}
        />
        <AboutSection
          paragraphs={aboutParagraphs}
          skills={skills}
          skillsTitle={aboutSkillsTitle}
          cta={aboutCta}
          header={sections.about}
          sectionIndex={3}
        />
        <CertificationsSection
          items={certifications}
          header={sections.certifications}
          sectionIndex={4}
          noteParts={certificationsNoteParts as any}
        />
        <ContactSection
          description={contactDescription}
          cta={contactCta}
          socialLinks={socialLinks}
          header={sections.contact}
          sectionIndex={5}
        />
      </main>
      <Footer />
    </>
  );
}

export default App;
