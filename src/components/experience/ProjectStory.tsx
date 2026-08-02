interface ProjectStoryProps {
  description: string;
}

export function ProjectStory({ description }: ProjectStoryProps) {
  if (!description.trim()) return null;

  return (
    <section className="project-experience-story" aria-labelledby="project-story-title">
      <p className="project-experience-kicker" id="project-story-title">Project story</p>
      <div className="project-experience-story__body">
        <p>{description}</p>
      </div>
    </section>
  );
}
