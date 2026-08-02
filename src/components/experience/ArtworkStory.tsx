interface ArtworkStoryProps {
  description: string;
}

export function ArtworkStory({ description }: ArtworkStoryProps) {
  if (!description.trim()) return null;

  return (
    <section className="artwork-experience-story" aria-labelledby="artwork-story-title">
      <p className="artwork-experience-kicker" id="artwork-story-title">The work</p>
      <div className="artwork-experience-story__body">
        <p>{description}</p>
      </div>
    </section>
  );
}
