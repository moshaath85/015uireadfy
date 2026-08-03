import Link from 'next/link';
import type { Metadata } from 'next';
import '@/styles/home-2026.css';
import HeroRotator, { type HeroSlide } from '@/components/public/home/HeroRotator';
import { OrganizationLd, ArtGalleryLd, BreadcrumbListLd } from '@/lib/jsonld';
import { artistsRepository } from '@/lib/repositories/artists';
import { artworksRepository } from '@/lib/repositories/artworks';
import { exhibitionsRepository } from '@/lib/repositories/exhibitions';
import { mediaRepository } from '@/lib/repositories/media';
import { newsRepository } from '@/lib/repositories/news';
import { projectsRepository } from '@/lib/repositories/projects';
import type { Media } from '@/types';
import { getServerLanguage, getText } from '@/lib/i18n/server-language';
import type { Language } from '@/lib/i18n/language';

const T = {
  statement_head: { ar: 'منصة فنية معاصرة يصوغها الفنانون وجامعو المقتنيات والمكان.', en: 'A contemporary art platform shaped by artists, collectors, and place.' },
  statement_side: { ar: 'تجمع غاليري ٠١٥ بين التمثيل الفني والمعارض والاستشارات الخاصة والمشاريع الثقافية في جميع أنحاء المملكة — من الجيل المؤسس للحداثة السعودية إلى الأصوات التي تحدد معالمها الآن.', en: '015 Gallery brings together representation, exhibitions, private advisory, and cultural projects across the Kingdom — from the founding generation of Saudi modernism to the voices defining it now.' },
  selected_works: { ar: 'أعمال مختارة', en: 'Selected works' },
  selected_works_note: { ar: 'مجموعة متجددة من المجموعة الفنية. كل عمل موثق ومعتمد ومتاح للمشاهدة الخاصة.', en: 'A rotating selection from the collection. Every work is documented, certified, and available for private viewing.' },
  the_roster: { ar: 'قائمة الفنانين', en: 'The roster' },
  exhibition: { ar: 'معرض', en: 'Exhibition' },
  view_exhibition: { ar: 'عرض المعرض', en: 'View exhibition' },
  all_artworks: { ar: 'جميع الأعمال', en: 'All artworks' },
  all_artists: { ar: 'جميع الفنانين', en: 'View all' },
  full_roster: { ar: 'القائمة الكاملة', en: 'Full roster' },
  art_in_context: { ar: 'الفن في سياقه', en: 'Art in context' },
  context_note: { ar: 'برامج فنية مخصصة للمؤسسات والمستشفيات والمعالم الثقافية في جميع أنحاء المملكة.', en: 'Commissioned art programmes for institutions, hospitals, and cultural landmarks across the Kingdom.' },
  all_projects: { ar: 'جميع المشاريع', en: 'All projects' },
  journal_title: { ar: 'مجلة ٠١٥', en: '015 Journal' },
  journal_note: { ar: 'مقالات ونقد حول المشهد الفني السعودي.', en: 'Essays and criticism on the Saudi art scene, written by the gallery.' },
  enter_journal: { ar: 'تصفح المجلة', en: 'Enter the journal' },
  visit_title: { ar: 'للاقتناء والتنسيق والبرامج الفنية المؤسسية.', en: 'For acquisition, placement, and institutional art programmes.' },
  private_viewing: { ar: 'مشاهدة خاصة', en: 'Private viewing' },
  our_services: { ar: 'خدماتنا', en: 'Our services' },
  now_on_view: { ar: 'معروض الآن', en: 'Now on view' },
  from_programme: { ar: 'من البرنامج', en: 'From the programme' },
  exhibitions_note: { ar: 'معارض يقدمها الغاليري في مقرنا بالرياض وخارجه.', en: 'Exhibitions presented by the gallery, at our Riyadh space and beyond.' },
  selected_work: { ar: 'عمل مختار', en: 'Selected work' },
  view_this_work: { ar: 'عرض العمل', en: 'View this work' },
  hero_nav: { ar: 'التنقل بين الأعمال المختارة', en: 'Selected work navigation' },
  hero_show: { ar: 'عرض', en: 'Show' },
  commission: { ar: 'تكليف', en: 'Commission' },
};

function t(key: keyof typeof T, lang: Language): string {
  return lang === 'ar' ? T[key].ar : T[key].en;
}

export const metadata: Metadata = {
  title: 'Gallery 015 — Contemporary Art Gallery, Riyadh',
  description: 'Gallery 015 brings together representation, exhibitions, private advisory, and cultural projects — from the founding generation of Saudi modernism to the voices defining it now.',
  openGraph: {
    title: 'Gallery 015 — Contemporary Art Gallery, Riyadh',
    description: 'A contemporary art platform shaped by artists, collectors, and place.',
    images: [{ url: '/brand/015-logo-black.svg', width: 1200, height: 630 }],
  },
};

export const dynamic = 'force-dynamic';

const longDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

const monthYear = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(date);
};

/** Works whose title is real editorial content, not an archive placeholder. */
const hasRealTitle = (title: string) => !title.trim().toLowerCase().startsWith('untitled');

export default async function HomePage() {
  const lang = await getServerLanguage();
  const [artworks, artists, exhibitions, projects, news, allMedia] = await Promise.all([
    artworksRepository.getPublicAll(),
    artistsRepository.getPublicAll(),
    exhibitionsRepository.getPublicAll(),
    projectsRepository.getPublicAll(),
    newsRepository.getPublicAll(),
    mediaRepository.getPublicAll(),
  ]);

  const mediaById = new Map(allMedia.map((item) => [item.id, item]));
  const media = (id: string | null | undefined): Media | null => (id ? mediaById.get(id) ?? null : null);
  const artistName = new Map(artists.map((artist) => [artist.id, getText(artist.name_ar, artist.name_en, lang)]));

  // ---- Hero + selected works: titled works that actually have an image ----
  const titledWorks = artworks
    .filter((work) => hasRealTitle(work.title_en) && media(work.primary_image_id))
    .sort((a, b) =>
      Number(b.is_featured_homepage || b.featured) - Number(a.is_featured_homepage || a.featured)
      || a.display_order - b.display_order);

  /* Hero rotates through the strongest titled works — one at a time.
     Only high-resolution scans qualify: the hero renders very large, and a
     small source would fall apart at that size. */
  const HERO_MIN_EDGE = 900;
  const heroSlides: HeroSlide[] = titledWorks
    .filter((work) => {
      const cover = media(work.primary_image_id);
      return cover && Math.min(cover.width ?? 0, cover.height ?? 0) >= HERO_MIN_EDGE;
    })
    .slice(0, 5)
    .map((work) => {
    const cover = media(work.primary_image_id)!;
    return {
      id: work.id,
      slug: work.slug,
      title: getText(work.title_ar, work.title_en, lang),
      artist: artistName.get(work.artist_id) ?? 'Gallery 015',
      spec: [getText(work.medium_ar, work.medium_en, lang), work.dimensions, work.year].filter(Boolean).join(' · '),
      src: cover.url,
      alt: getText(cover.alt_ar, cover.alt_en, lang) || getText(work.title_ar, work.title_en, lang),
    };
  });

  const selectedWorks = titledWorks.slice(5, 11);

  // ---- Programme: newest exhibition that has a cover image ----
  const programme = exhibitions
    .slice()
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
    .map((exhibition) => ({ exhibition, cover: media(exhibition.cover_media_id) }))
    .find((entry) => entry.cover) ?? null;

  const now = Date.now();
  const programmeIsCurrent = programme
    ? new Date(programme.exhibition.start_date).getTime() <= now
      && new Date(programme.exhibition.end_date).getTime() >= now
    : false;

  // ---- Roster: artists with a real portrait ----
  const portraitArtists = artists
    .map((artist) => ({ artist, portrait: media(artist.profile_image_id) }))
    .filter((entry) => entry.portrait)
    .sort((a, b) => a.artist.display_order - b.artist.display_order)
    .slice(0, 7);

  const featuredProjects = projects
    .map((project) => ({ project, cover: media(project.cover_media_id) }))
    .filter((entry) => entry.cover)
    .slice(0, 3);

  const journal = news
    .slice()
    .sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime())
    .slice(0, 3);

  return (
    <>
      <OrganizationLd />
      <ArtGalleryLd />
      <BreadcrumbListLd items={[{ name: 'Gallery 015', url: 'https://gallery015.com' }]} />
      <div className="hp">

      <HeroRotator
        slides={heroSlides}
        labels={{
          selectedWork: t('selected_work', lang),
          viewThisWork: t('view_this_work', lang),
          navigation: t('hero_nav', lang),
          show: t('hero_show', lang),
        }}
      />

      {/* STATEMENT */}
      <section className="hp-statement">
        <div className="hp-wrap hp-statement__grid">
          <p className="hp-big">{t('statement_head', lang)}</p>
          <p className="hp-side">{t('statement_side', lang)}</p>
        </div>
      </section>

      {/* PROGRAMME */}
      {programme ? (
        <section className="hp-programme">
          <div className="hp-wrap">
            <div className="hp-sec-head">
              <h2>{t(programmeIsCurrent ? 'now_on_view' : 'from_programme', lang)}</h2>
              <p className="hp-note">{t('exhibitions_note', lang)}</p>
            </div>
            <Link className="hp-programme__grid" href={`/exhibitions/${programme.exhibition.slug}`}>
              <figure className="hp-programme__media">
                <img
                  src={programme.cover!.url}
                  alt={programme.cover!.alt_en || programme.exhibition.title_en}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
              <div className="hp-record">
                <p className="hp-label">Exhibition</p>
                <h3>{programme.exhibition.title_en}</h3>
                <dl>
                  <div>
                    <dt>Dates</dt>
                    <dd>{longDate(programme.exhibition.start_date)} — {longDate(programme.exhibition.end_date)}</dd>
                  </div>
                  {programme.exhibition.venue_en ? (
                    <div><dt>Venue</dt><dd>{programme.exhibition.venue_en}</dd></div>
                  ) : null}
                </dl>
                <span className="hp-link">View exhibition <span aria-hidden="true">↗</span></span>
              </div>
            </Link>
          </div>
        </section>
      ) : null}

      {/* SELECTED WORKS */}
      {selectedWorks.length ? (
        <section className="hp-works">
          <div className="hp-wrap">
            <div className="hp-sec-head">
              <h2>{t('selected_works', lang)}</h2>
              <p className="hp-note">{t('selected_works_note', lang)}</p>
            </div>
            <div className="hp-works__grid">
              {selectedWorks.map((work, index) => {
                const cover = media(work.primary_image_id)!;
                return (
                  <Link href={`/artworks/${work.slug}`} key={work.id}>
                    <figure className="hp-plate">
                      <img src={cover.url} alt={cover.alt_en || work.title_en} loading="lazy" decoding="async" />
                    </figure>
                    <div className="hp-cap">
                      <span className="hp-idx">{String(index + 1).padStart(2, '0')}</span>
                      <h3>{work.title_en}</h3>
                      <p className="hp-spec">
                        {[artistName.get(work.artist_id), work.medium_en, work.dimensions]
                          .filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="hp-more">
              <Link className="hp-link" href="/artworks">All artworks <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* ROSTER */}
      {portraitArtists.length ? (
        <section className="hp-artists">
          <div className="hp-wrap">
            <div className="hp-sec-head">
              <h2>{t('the_roster', lang)}</h2>
              <p className="hp-note">
                {artists.length} {lang === 'ar' ? 'فنانًا — الجيل المؤسس للحداثة السعودية إلى جانب أصوات معاصرة وعالمية.' : `artists — the founding generation of Saudi modernism alongside contemporary and international voices.`}
              </p>
            </div>
            <div className="hp-artists__grid">
              {portraitArtists.map(({ artist, portrait }) => (
                <Link href={`/artists/${artist.slug}`} key={artist.id}>
                  <figure className="hp-artist__media">
                    <img src={portrait!.url} alt={portrait!.alt_en || artist.name_en} loading="lazy" decoding="async" />
                  </figure>
                  <div className="hp-artist__cap">
                    <h3>{artist.name_en}</h3>
                    <p>{[artist.nationality_en, artist.birth_year > 1900 ? `b. ${artist.birth_year}` : '']
                      .filter(Boolean).join(' · ')}</p>
                  </div>
                </Link>
              ))}
              <Link href="/artists">
                <figure className="hp-artist__media">
                  <span className="hp-label" style={{ textAlign: 'center' }}>
                    {Math.max(artists.length - portraitArtists.length, 0)} more<br />artists
                  </span>
                </figure>
                <div className="hp-artist__cap"><h3>View all</h3><p>Full roster</p></div>
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* PROJECTS */}
      {featuredProjects.length ? (
        <section className="hp-projects">
          <div className="hp-wrap">
            <div className="hp-sec-head">
              <h2>{t('art_in_context', lang)}</h2>
              <p className="hp-note">{t('context_note', lang)}</p>
            </div>
            <div className="hp-projects__grid">
              {featuredProjects.map(({ project, cover }) => (
                <Link href={`/projects/${project.slug}`} key={project.id}>
                  <figure className="hp-proj__media">
                    <img src={cover!.url} alt={cover!.alt_en || project.title_en} loading="lazy" decoding="async" />
                  </figure>
                  <div className="hp-proj__cap">
                    <span className="hp-label">Commission</span>
                    <h3>{project.title_en}</h3>
                  </div>
                </Link>
              ))}
            </div>
            <div className="hp-more">
              <Link className="hp-link" href="/projects">All projects <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* JOURNAL */}
      {journal.length ? (
        <section className="hp-journal">
          <div className="hp-wrap">
            <div className="hp-sec-head">
              <h2>{t('journal_title', lang)}</h2>
              <p className="hp-note">{t('journal_note', lang)}</p>
            </div>
            <div className="hp-journal__list">
              {journal.map((item) => (
                <Link className="hp-entry" href={`/news/${item.slug}`} key={item.id}>
                  <time>{monthYear(item.publish_date)}</time>
                  <h3>{item.title_en}</h3>
                  <p>{item.excerpt_en}</p>
                  <span className="hp-arw" aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
            <div className="hp-more">
              <Link className="hp-link" href="/news">Enter the journal <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* VISIT */}
      <section className="hp-visit">
        <div className="hp-wrap hp-visit__grid">
          <div>
            <p className="hp-label">Visit</p>
            <h2>{t('visit_title', lang)}</h2>
          </div>
          <div className="hp-visit__links">
            <Link className="hp-link" href="/contact">{t('private_viewing', lang)} <span aria-hidden="true">↗</span></Link>
            <Link className="hp-link" href="/services">{t('our_services', lang)} <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

    </div>
    </>
  );
}
