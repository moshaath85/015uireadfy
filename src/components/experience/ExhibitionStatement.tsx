interface ExhibitionStatementProps {
  statement: string;
}

export function ExhibitionStatement({ statement }: ExhibitionStatementProps) {
  if (!statement.trim()) return null;

  const paragraphs = statement
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <section className="exhibition-experience-statement" aria-labelledby="exhibition-statement-title">
      <header className="exhibition-experience-statement__header">
        <p className="exhibition-experience-kicker" id="exhibition-statement-title">Statement</p>
        <h2>Curatorial text</h2>
      </header>
      <div className="exhibition-experience-statement__body">
        {(paragraphs.length ? paragraphs : [statement]).map((paragraph, index) => (
          <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
