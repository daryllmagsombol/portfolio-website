import { lazy, Suspense, useEffect } from "react";
import { CursorGlow } from "./components/CursorGlow";
import { NoiseOverlay } from "./components/NoiseOverlay";
import { GridOverlay } from "./components/GridOverlay";
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
import { morphSectionColors } from "./hooks/useScrollAnimation";
import { SectionProvider } from "./context/SectionContext";
import { startPerfMonitor, stopPerfMonitor } from "./hooks/usePerformanceMode";
import { useSection } from "./context/useSection";

// Code-split the WebGL background: three.js + R3F are heavy (~1MB raw), and the
// canvas is decorative — it must not block first paint. The chunk loads lazily
// on idle; Suspense keeps a null placeholder so layout is unaffected.
const WorldBackground = lazy(() =>
  import("./components/WorldBackground").then((m) => ({ default: m.WorldBackground }))
);

/**
 * Inner App that reads the active section from SectionContext (single observer
 * owned by SectionProvider) and triggers the per-section color morph.
 */
function AppContent() {
  const activeSection = useSection();

  useEffect(() => {
    morphSectionColors(activeSection);
  }, [activeSection]);

  return (
    <>
      <NoiseOverlay />
      <GridOverlay />
      <Suspense fallback={null}>
        <WorldBackground />
      </Suspense>
      <NavBar links={navLinks} cta={navCta} />
      <main id="main" className="relative z-10">
        <HeroSection content={hero} />
        <ProjectSection
          projects={projects}
          header={sections.projects}
          sectionIndex={1}
          noteParts={projectsGitHubNoteParts}
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
          noteParts={certificationsNoteParts}
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

function App() {
  useScrollAnimation();

  // Start the adaptive perf monitor on mount; it auto-disables the WebGL
  // canvas + Lenis smooth scroll + backdrop blur when frame rate drops or the
  // device looks low-end.
  useEffect(() => {
    startPerfMonitor();
    return () => stopPerfMonitor();
  }, []);

  return (
    <>
      {/* Skip link: first focusable element, hidden until focused. */}
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <CursorGlow />
      <SectionProvider>
        <AppContent />
      </SectionProvider>
    </>
  );
}

export default App;