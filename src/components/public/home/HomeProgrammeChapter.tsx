import Link from 'next/link';

interface HomeProgrammeChapterProps {
  programme: {
    title: string;
    description?: string;
    venue?: string;
    dates: string;
    href: string;
    image?: { src: string; alt: string; width?: number; height?: number };
  } | null;
  isOpeningChapter: boolean;
}

export default function HomeProgrammeChapter({ programme }: HomeProgrammeChapterProps) {
  if (!programme) return null;

  return (
    <section className="home-chapter home-chapter--programme" aria-labelledby="home-programme-title">
      <p className="home-chapter__number" aria-hidden="true">02</p>
      <div className="home-chapter__heading">
        <p className="home-chapter__eyebrow">Current programme</p>
        <h2 id="home-programme-title">Programme</h2>
      </div>
      <article className={`home-programme${!programme.image ? ' home-programme--record' : ''}`}>
        {programme.image ? (
          <Link href={programme.href} className="home-programme__media">
            <img src={programme.image.src} alt={programme.image.alt} width={programme.image.width} height={programme.image.height} loading="lazy" decoding="async" />
          </Link>
        ) : null}
        <div className="home-programme__record">
          <p>Exhibition record</p>
          <h3>{programme.title}</h3>
          <dl>
            <div><dt>Dates</dt><dd>{programme.dates}</dd></div>
            {programme.venue ? <div><dt>Venue</dt><dd>{programme.venue}</dd></div> : null}
          </dl>
          {programme.description ? <p className="home-programme__description">{programme.description}</p> : null}
          <Link href={programme.href}>View exhibition <span aria-hidden="true">↗</span></Link>
        </div>
      </article>
    </section>
  );
}
