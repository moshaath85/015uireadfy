interface CollectionStoryProps {
  description: string;
}

export function CollectionStory({ description }: CollectionStoryProps) {
  const paragraphs = description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (!paragraphs.length) return null;

  return (
    <section className="collection-experience-story" aria-labelledby="collection-story-title">
      <p className="collection-experience-kicker" id="collection-story-title">Curatorial premise</p>
      <div className="collection-experience-story__body">
        {paragraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph.slice(0, 32)}`}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
