import { ButtonLink } from "./components/ButtonLink";
import { CertificationCard } from "./components/CertificationCard";
import { ExperienceCard } from "./components/ExperienceCard";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { NavBar } from "./components/NavBar";
import { ProjectCard } from "./components/ProjectCard";
import { SectionHeader } from "./components/SectionHeader";
import { SkillsGrid } from "./components/SkillsGrid";
import { SocialLinks } from "./components/SocialLinks";
import { TextParts } from "./components/TextParts";
import { aboutCta, aboutParagraphs, aboutSkillsTitle } from "./data/about";
import { certifications, certificationsNoteParts } from "./data/certifications";
import { contactCta, contactDescription } from "./data/contact";
import { experience } from "./data/experience";
import { hero } from "./data/hero";
import { navCta, navLinks } from "./data/nav";
import { projects, projectsGitHubNoteParts } from "./data/projects";
import { sections } from "./data/sections";
import { skills } from "./data/skills";
import { socialLinks } from "./data/socials";
import { useScrollReveal } from "./hooks/useScrollReveal";

function App() {
  useScrollReveal();

  return (
    <>
      <NavBar links={navLinks} cta={navCta} />
      <main>
        <HeroSection content={hero} />

        <section id="projects" className="section">
          <div className="container">
            <SectionHeader {...sections.projects} />
            <div className="projects-grid">
              {projects.map((project) => (
                <ProjectCard key={project.title} project={project} />
              ))}
            </div>
            <p className="projects-note reveal">
              <TextParts parts={projectsGitHubNoteParts} />
            </p>
          </div>
        </section>

        <section id="experience" className="section section--alt">
          <div className="container">
            <SectionHeader {...sections.experience} />
            <div className="experience-list">
              {experience.map((item) => (
                <ExperienceCard key={item.period} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <div className="container">
            <SectionHeader {...sections.about} />
            <div className="about-grid">
              <div className="about-text reveal">
                {aboutParagraphs.map((paragraph, index) => (
                  <p key={`about-${index}`}>
                    <TextParts parts={paragraph.parts} />
                  </p>
                ))}
                <ButtonLink {...aboutCta} className="about-cta" />
              </div>
              <div className="about-skills reveal">
                <h3 className="skills-title mono">{aboutSkillsTitle}</h3>
                <SkillsGrid skills={skills} />
              </div>
            </div>
          </div>
        </section>

        <section id="certifications" className="section section--alt">
          <div className="container">
            <SectionHeader {...sections.certifications} />
            <div className="certs-grid">
              {certifications.map((item) => (
                <CertificationCard key={item.title} item={item} />
              ))}
            </div>
            <p className="certs-note reveal">
              <TextParts parts={certificationsNoteParts} />
            </p>
          </div>
        </section>

        <section id="contact" className="section">
          <div className="container">
            <SectionHeader {...sections.contact} />
            <div className="contact-content reveal">
              <p className="contact-desc">{contactDescription}</p>
              <ButtonLink {...contactCta} size="large" />
              <SocialLinks links={socialLinks} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default App;
