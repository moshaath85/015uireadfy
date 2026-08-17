import Link from 'next/link';
import type { ReactNode } from 'react';

export interface EditorialImage {
  src: string;
  alt: string;
  /** Intrinsic dimensions — used to estimate a card's height for lane balancing. */
  width?: number;
  height?: number;
}

export interface EditorialIndexItem {
  href: string;
  title: string;
  kicker?: string;
  meta?: string;
  description?: string;
  image?: EditorialImage | null;
}

/** The one card the indexes share. Extracted verbatim so the explorer on
    /artworks and the plain indexes cannot drift apart. */
export function EditorialCard({ item, eager = false }: { item: EditorialIndexItem; eager?: boolean }) {
  return (
    <Link className="experience-card" data-reveal="" href={item.href} suppressHydrationWarning>
      <figure className="experience-card__media">
        {item.image ? (
          <img src={item.image.src} alt={item.image.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
        ) : (
          <span
            aria-label={`${item.title} image unavailable`}
            className="experience-card__fallback"
            role="img"
          >
            <span aria-hidden="true">015</span>
            <small>Image forthcoming</small>
          </span>
        )}
      </figure>
      <div className="experience-card__copy">
        {item.kicker ? <p className="experience-kicker">{item.kicker}</p> : null}
        <h2>{item.title}</h2>
        {item.meta ? <p className="experience-card__meta">{item.meta}</p> : null}
        {item.description ? <p className="experience-card__description">{item.description}</p> : null}
        <span>View</span>
      </div>
    </Link>
  );
}

export function EditorialIndex({
  eyebrow,
  title,
  introduction,
  items,
  variant = 'grid',
}: {
  eyebrow: string;
  title: string;
  introduction: string;
  items: EditorialIndexItem[];
  variant?: 'grid' | 'projects' | 'collections' | 'exhibitions';
}) {
  return (
    <main className={`experience-index experience-index--${variant}`}>
      <header className="experience-index__intro">
        <p className="experience-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{introduction}</p>
      </header>
      {items.length ? (
        <div className="experience-index__grid">
          {items.map((item, index) => (
            <EditorialCard item={item} eager={index < 2} key={item.href} />
          ))}
        </div>
      ) : (
        <p className="experience-empty">No published content is currently available.</p>
      )}
    </main>
  );
}

export function EditorialDetail({
  eyebrow,
  title,
  subtitle,
  image,
  facts,
  body,
  children,
  backHref,
  backLabel,
  ctaTitle,
  ctaHref = '/contact',
  ctaLabel = 'Get in touch',
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  image?: EditorialImage | null;
  facts?: Array<{ label: string; value?: ReactNode }>;
  body?: string;
  children?: ReactNode;
  backHref: string;
  backLabel: string;
  ctaTitle: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const visibleFacts = (facts ?? []).filter((fact) => fact.value !== undefined && fact.value !== null && fact.value !== '');
  const bodyParagraphs = (body ?? '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const isArtistDetail = eyebrow.trim().toLowerCase() === 'artist';

  return (
    <main className={`experience-detail${isArtistDetail ? ' experience-detail--artist' : ''}`}>
      <Link className="experience-detail__back" href={backHref}>← {backLabel}</Link>
      <section className="experience-detail__hero">
        <div className="experience-detail__heading">
          <p className="experience-kicker">{eyebrow}</p>
          <h1>{title}</h1>
          {subtitle ? <p className="experience-detail__subtitle">{subtitle}</p> : null}
        </div>
        <figure className="experience-detail__media">
          {image ? <img src={image.src} alt={image.alt} decoding="async" /> : (
            <span
              aria-label={`${title} image unavailable`}
              className="experience-detail__media-fallback"
              role="img"
            >
              <span aria-hidden="true">015</span>
              <small>Image forthcoming</small>
            </span>
          )}
        </figure>
      </section>
      <section className="experience-detail__information">
        {visibleFacts.length ? (
          <dl className="experience-facts">
            {visibleFacts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {bodyParagraphs.length ? (
          <div className="experience-body">
            {bodyParagraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 32)}`}>{paragraph}</p>
            ))}
          </div>
        ) : null}
      </section>
      {children}
      <section className="experience-inquiry">
        <p className="experience-kicker">Private viewings and advisory</p>
        <h2>{ctaTitle}</h2>
        <Link href={ctaHref}>{ctaLabel}</Link>
      </section>
    </main>
  );
}

export function EditorialRelated({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: EditorialIndexItem[];
}) {
  if (!items.length) return null;

  return (
    <section className="experience-related">
      <header>
        <p className="experience-kicker">{eyebrow}</p>
        <h2>{title}</h2>
      </header>
      <div>
        <ul className="experience-related__list">
          {items.map((item) => (
            <li className="experience-related__item" key={item.href}>
              <Link href={item.href}>
                <figure>{item.image ? <img src={item.image.src} alt={item.image.alt} loading="lazy" decoding="async" /> : null}</figure>
                <h3>{item.title}</h3>
                {item.meta ? <p>{item.meta}</p> : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
