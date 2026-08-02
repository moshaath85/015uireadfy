import Link from 'next/link';

export interface HomeHeroChapter {
  eyebrow: string;
  title: string;
  context?: string;
  summary?: string;
  href?: string;
  linkLabel?: string;
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
}

interface HomeHeroProps {
  chapter: HomeHeroChapter | null;
}

export default function HomeHero({ chapter }: HomeHeroProps) {
  const fallback = !chapter;
  const title = chapter?.title ?? 'Gallery 015';
  const eyebrow = chapter?.eyebrow ?? 'Contemporary art';
  const context = chapter?.context ?? 'Artists · Artworks · Exhibitions · Projects';
  const summary = chapter?.summary;

  return (
    <section className={`institutional-chapter${fallback ? ' institutional-chapter--fallback' : ''}`} aria-label="Gallery 015 institutional chapter">
      {chapter?.image ? (
        <figure className="institutional-chapter__media">
          <img
            src={chapter.image.src}
            alt={chapter.image.alt}
            width={chapter.image.width}
            height={chapter.image.height}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </figure>
      ) : <div className="institutional-chapter__absence" aria-hidden="true" />}

      <div className="institutional-chapter__reading">
        <p className="institutional-chapter__eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <div className="institutional-chapter__facts">
          <p>{context}</p>
          {summary ? <p>{summary}</p> : null}
        </div>
        {chapter?.href && chapter.linkLabel ? (
          <Link href={chapter.href} className="institutional-chapter__link">
            {chapter.linkLabel}<span aria-hidden="true">↗</span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
