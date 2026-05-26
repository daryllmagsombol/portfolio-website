type SkillsGridProps = {
  skills: string[];
};

export function SkillsGrid({ skills }: SkillsGridProps) {
  return (
    <div className="skills-grid">
      {skills.map((skill) => (
        <div key={skill} className="skill-item">
          {skill}
        </div>
      ))}
    </div>
  );
}
