import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { artistsRepository } from '@/lib/repositories/artists';
import { artworksRepository } from '@/lib/repositories/artworks';
import { mediaRepository } from '@/lib/repositories/media';
import { SITE } from '@/lib/metadata';
import { getServerLanguage } from '@/lib/i18n/server-language';
import type { Language } from '@/lib/i18n/language';

interface Props { params: Promise<{ slug: string }> }
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artist = await artistsRepository.getPublicBySlug(slug);
  if (!artist) return { title: 'Artist Not Found' };
  const name = artist.name_en;
  const description = artist.bio_en?.slice(0, 155)?.replace(/\n/g, ' ') ?? `Explore works by ${name} at ${SITE.name}.`;
  return {
    title: `${name} | ${SITE.name}`,
    description,
    openGraph: { title: name, description },
  };
}

export default async function ArtistDetailPage({ params }: Props) {
  const { slug } = await params;
  const lang = await getServerLanguage();
  const artist = await artistsRepository.getPublicBySlug(slug);
  if (!artist) notFound();

  const ar = lang === 'ar';
  const name = ar && artist.name_ar ? artist.name_ar : artist.name_en;
  const bio = ar && artist.bio_ar ? artist.bio_ar : artist.bio_en;
  const nationality = ar && artist.nationality_ar ? artist.nationality_ar : artist.nationality_en;

  const allArtworks = await artworksRepository.getPublicAll();

  const profileMedia = artist.profile_image_id
    ? await mediaRepository.getPublicById(artist.profile_image_id)
    : null;

  const artistWorks = allArtworks
    .filter((work) => work.artist_id === artist.id)
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.display_order - b.display_order);

  const workItems = await Promise.all(
    artistWorks.slice(0, 8).map(async (work) => {
      const image = await mediaRepository.getPublicArtworkPrimaryMedia(work);
      return {
        href: `/artworks/${work.slug}`,
        title: work.title_en,
        meta: [String(work.year), work.medium_en].filter(Boolean).join(' · '),
        image: image ? { src: image.url, alt: image.alt_en || work.title_en } : null,
      };
    }),
  );

  const representationLabel = artist.representation_status
    ? artist.representation_status
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Gallery Artist';

  const facts = [
    { label: ar ? 'الجنسية' : 'Nationality', value: nationality },
    { label: ar ? 'مواليد' : 'Born', value: artist.birth_year > 1900 ? String(artist.birth_year) : undefined },
    { label: ar ? 'التمثيل' : 'Representation', value: representationLabel },
    { label: ar ? 'أعمال في المجموعة' : 'Works in collection', value: artistWorks.length ? String(artistWorks.length) : undefined },
  ].filter((f): f is { label: string; value: string } => Boolean(f?.value));

  return (
    <main className="experience-detail experience-detail--artist">
      <Link className="experience-detail__back" href="/artists">
        ← All artists
      </Link>

      <section className="experience-detail__hero">
        <div className="experience-detail__heading">
          <p className="experience-kicker">Artist</p>
          <h1>{name}</h1>
          {artist.name_ar && <p className="experience-detail__subtitle" dir="rtl" lang="ar">{artist.name_ar}</p>}
        </div>
        <figure className="experience-detail__media">
          {profileMedia ? (
            <img src={profileMedia.url} alt={profileMedia.alt_en || artist.name_en} />
          ) : (
            <span
              aria-label={`${artist.name_en} image unavailable`}
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
        <dl className="experience-facts">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
        {bio ? (
          <div className="experience-body">
            {bio.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
              .map((paragraph, index) => <p key={`bio-${index}`}>{paragraph}</p>)}
          </div>
        ) : null}
      </section>

      {workItems.length ? (
        <section className="experience-related" aria-labelledby="artist-works-title">
          <header>
            <p className="experience-kicker">Collection</p>
            <h2 id="artist-works-title">{ar ? `أعمال ${name}` : `Works by ${name}`}</h2>
          </header>
          <div className="experience-related__list">
            {workItems.map((work) => (
              <Link href={work.href} key={work.href} className="experience-related__item">
                <figure>
                  {work.image ? (
                    <img src={work.image.src} alt={work.image.alt} loading="lazy" />
                  ) : (
                    <span className="experience-detail__media-fallback" role="img" aria-label="Image unavailable">
                      <span aria-hidden="true">015</span>
                    </span>
                  )}
                </figure>
                <h3>{work.title}</h3>
                {work.meta ? <p>{work.meta}</p> : null}
              </Link>
            ))}
          </div>
          {artistWorks.length > workItems.length ? (
            <Link
              href="/artworks"
              className="experience-detail__back"
              style={{ marginTop: '2rem', display: 'inline-flex' }}
            >
              View all {artistWorks.length} works ↗
            </Link>
          ) : null}
        </section>
      ) : null}

      <section className="experience-inquiry">
        <p className="experience-kicker">{ar ? 'مشاهدة خاصة واستشارات' : 'Private viewings and advisory'}</p>
        <h2>{ar ? `استفسر عن ${name}` : `Enquire about ${name}`}</h2>
        <p>{ar ? 'تواصل مع الغاليري للاستفسار عن الأعمال المتاحة ومواعيد المشاهدة الخاصة.' : 'Contact the gallery for available works and private viewing appointments.'}</p>
        <Link href="/contact">{ar ? 'تواصل مع الغاليري' : 'Contact the gallery'}</Link>
      </section>
    </main>
  );
}
