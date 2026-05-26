import type { Project } from "../types";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const imageClasses = ["project-image"];
  if (project.image.contain) {
    imageClasses.push("project-image--contain");
  }

  const image = (
    <div className={imageClasses.join(" ")}>
      <img
        src={project.image.src}
        alt={project.image.alt}
        loading="lazy"
        decoding="async"
      />
      <div className="project-overlay">
        <span>{project.image.overlayText}</span>
      </div>
    </div>
  );

  const imageBlock = project.primaryLink ? (
    <a
      href={project.primaryLink.href}
      target="_blank"
      rel="noopener"
      className="project-image-link"
    >
      {image}
    </a>
  ) : (
    image
  );

  return (
    <article className="project-card reveal">
      {imageBlock}
      <div className="project-info">
        <div className="project-header">
          <h3 className="project-title">
            {project.title}
            {project.badge ? (
              <span className="accent mono project-badge">{project.badge}</span>
            ) : null}
          </h3>
          {project.links?.length ? (
            <div className="project-links">
              {project.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener"
                  title={link.title}
                  aria-label={link.ariaLabel}
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <p className="project-desc">{project.description}</p>
        <ul className="project-tags">
          {project.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
