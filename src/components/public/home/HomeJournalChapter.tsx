import Link from 'next/link';

interface HomeJournalChapterProps {
  entries: Array<{ id: string; href: string; date: string; title: string; excerpt?: string }>;
}

export default function HomeJournalChapter({ entries }: HomeJournalChapterProps) {
  if (entries.length === 0) return null;

  return (
    <section className="home-chapter home-chapter--journal" aria-labelledby="home-journal-title">
      <p className="home-chapter__number" aria-hidden="true">06</p>
      <div className="home-chapter__heading">
        <p className="home-chapter__eyebrow">Publication</p>
        <h2 id="home-journal-title">015 Journal</h2>
      </div>
      <div className="home-journal-list">
        {entries.map((entry) => (
          <Link href={entry.href} key={entry.id} className="home-journal-list__entry">
            <time>{entry.date}</time><h3>{entry.title}</h3>{entry.excerpt ? <p>{entry.excerpt}</p> : null}<span aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
      <Link href="/news" className="home-chapter__index-link">Enter the journal <span aria-hidden="true">↗</span></Link>
    </section>
  );
}
