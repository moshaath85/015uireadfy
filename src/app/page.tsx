import Link from 'next/link';
import HomeHero, { type HomeHeroSlide } from '@/components/public/HomeHero';
import { PublicResponsiveMedia } from '@/components/public/PageContainer';
import { artistsRepository } from '@/lib/repositories/artists';
import { artworksRepository } from '@/lib/repositories/artworks';
import { exhibitionsRepository } from '@/lib/repositories/exhibitions';
import { mediaRepository } from '@/lib/repositories/media';
import { newsRepository } from '@/lib/repositories/news';
import { projectsRepository } from '@/lib/repositories/projects';

export const dynamic = 'force-dynamic';

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const heroSlides: HomeHeroSlide[] = [
  {
    src: '/images/hero/gallery-015-hero-05.png',
    alt: 'Gallery 015 private collection project in Riyadh',
    eyebrow: 'Private collections',
    title: 'Art selected for the life around it.',
    description: 'Curatorial direction, acquisition, and placement for residences and private collections.',
    meta: 'Riyadh · Saudi Arabia',
    href: '/projects',
    cta: 'Explore projects',
  },
  {
    src: '/images/hero/gallery-015-hero-01.png',
    alt: 'Gallery 015 institutional exhibition project',
    eyebrow: 'Institutional projects',
    title: 'Transforming space through considered art.',
    description: 'Art programmes for museums, galleries, workplaces, hospitality, and healthcare environments.',
    meta: 'Curatorial planning · Installation · Advisory',
    href: '/projects',
    cta: 'View our work',
  },
  {
    src: '/images/hero/gallery-015-hero-09.png',
    alt: 'Gallery 015 contemporary artwork presentation',
    eyebrow: 'Selected works',
    title: 'A quiet encounter with contemporary art.',
    description: 'Discover artists and works chosen for clarity, presence, and lasting cultural value.',
    meta: 'Gallery 015 collection',
    href: '/artworks',
    cta: 'Discover artworks',
  },
  {
    src: '/images/hero/gallery-015-hero-10.png',
    alt: 'Gallery 015 art advisory and placement project',
    eyebrow: 'Art advisory',
    title: 'From acquisition to final placement.',
    description: 'A discreet advisory service for collectors, institutions, and culturally ambitious spaces.',
    meta: 'Private viewings by appointment',
    href: '/contact',
    cta: 'Start a conversation',
  },
];

export default async function HomePage() {
  const [artists, artworks, exhibitions, news, projects] = await Promise.all([
    artistsRepository.getPublicFeatured(),
    artworksRepository.getAll(),
    exhibitionsRepository.getPublicAll(),
    newsRepository.getAll(),
    projectsRepository.getAll(),
  ]);

  const allArtists = artists.length > 0 ? artists : await artistsRepository.getPublicAll();
  const artistsById = new Map(allArtists.map((artist) => [artist.id, artist.name_en]));

  const featuredArtists = await Promise.all(
    allArtists
      .slice()
      .sort((a, b) => a.display_order - b.display_order)
      .slice(0, 3)
      .map(async (artist) => ({ artist, media: await mediaRepository.getArtistProfileMedia(artist) })),
  );

  const selectedArtworks = await Promise.all(
    artworks
      .slice()
      .sort((a, b) => Number(b.is_featured_homepage || b.featured) - Number(a.is_featured_homepage || a.featured) || a.display_order - b.display_order)
      .slice(0, 4)
      .map(async (artwork) => ({
        artwork,
        media: await mediaRepository.getArtworkPrimaryMedia(artwork),
        artistName: artistsById.get(artwork.artist_id) ?? 'Gallery 015',
      })),
  );

  const featuredExhibition = await (async () => {
    for (const exhibition of exhibitions.slice().sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())) {
      const media = exhibition.cover_media_id ? await mediaRepository.getById(exhibition.cover_media_id) : null;
      if (media) return { exhibition, media };
    }
    return null;
  })();

  const featuredProjects = await Promise.all(
    projects.slice(0, 3).map(async (project) => ({
      project,
      media: project.cover_media_id ? await mediaRepository.getById(project.cover_media_id) : null,
    })),
  );

  const editorialNews = news
    .slice()
    .sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime())
    .slice(0, 3);

  return (
    <div className="home-page">
      <HomeHero slides={heroSlides} />

      <div className="home-page__body">
        <section className="home-intro" aria-labelledby="home-intro-title">
          <p className="home-kicker">Gallery 015</p>
          <h2 id="home-intro-title">A contemporary art platform shaped by artists, collectors, and place.</h2>
          <p>
            We bring together representation, exhibitions, private advisory, and cultural projects through a calm,
            rigorous curatorial approach.
          </p>
        </section>

        {featuredArtists.length > 0 ? (
          <section className="home-section" aria-labelledby="home-artists-title">
            <div className="home-section__header">
              <div><p className="home-kicker">Artists</p><h2 id="home-artists-title">Featured artists</h2></div>
              <Link href="/artists">View all artists <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="home-artists-grid">
              {featuredArtists.map(({ artist, media }, index) => (
                <Link className={`home-artist-card home-artist-card--${index + 1}`} href={`/artists/${artist.slug}`} key={artist.id}>
                  {media ? (
                    <PublicResponsiveMedia
                      image={{ src: media.url, alt: media.alt_en, width: media.width, height: media.height }}
                      className="home-artist-card__media"
                    />
                  ) : <div className="home-media-placeholder" />}
                  <div className="home-card-meta"><h3>{artist.name_en}</h3><p>{[artist.nationality_en, artist.birth_year ? `b. ${artist.birth_year}` : ''].filter(Boolean).join(' · ')}</p></div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {selectedArtworks.length > 0 ? (
          <section className="home-section home-section--works" aria-labelledby="home-works-title">
            <div className="home-section__header">
              <div><p className="home-kicker">Collection</p><h2 id="home-works-title">Selected artworks</h2></div>
              <Link href="/artworks">Explore the collection <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="home-works-grid">
              {selectedArtworks.map(({ artwork, media, artistName }, index) => (
                <Link className={`home-work-card home-work-card--${index + 1}`} href={`/artworks/${artwork.slug}`} key={artwork.id}>
                  {media ? (
                    <PublicResponsiveMedia
                      image={{ src: media.url, alt: media.alt_en, width: media.width, height: media.height }}
                      className="home-work-card__media"
                    />
                  ) : <div className="home-media-placeholder" />}
                  <div className="home-card-meta"><h3>{artwork.title_en}</h3><p>{[artistName, artwork.year, artwork.medium_en].filter(Boolean).join(' · ')}</p></div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {featuredExhibition ? (
          <section className="home-feature" aria-labelledby="home-exhibition-title">
            <Link className="home-feature__image" href={`/exhibitions/${featuredExhibition.exhibition.slug}`}>
              <PublicResponsiveMedia image={{ src: featuredExhibition.media.url, alt: featuredExhibition.media.alt_en, width: featuredExhibition.media.width, height: featuredExhibition.media.height }} />
            </Link>
            <div className="home-feature__copy">
              <p className="home-kicker">Exhibition</p>
              <h2 id="home-exhibition-title">{featuredExhibition.exhibition.title_en}</h2>
              <p>{formatDate(featuredExhibition.exhibition.start_date)} — {formatDate(featuredExhibition.exhibition.end_date)}</p>
              <p>{featuredExhibition.exhibition.venue_en}</p>
              <Link href={`/exhibitions/${featuredExhibition.exhibition.slug}`}>View exhibition <span aria-hidden="true">↗</span></Link>
            </div>
          </section>
        ) : null}

        {featuredProjects.length > 0 ? (
          <section className="home-section" aria-labelledby="home-projects-title">
            <div className="home-section__header">
              <div><p className="home-kicker">Projects</p><h2 id="home-projects-title">Art in context</h2></div>
              <Link href="/projects">Explore projects <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="home-projects-grid">
              {featuredProjects.map(({ project, media }, index) => (
                <Link href={`/projects/${project.slug}`} className={`home-project-card home-project-card--${index + 1}`} key={project.id}>
                  {media ? <PublicResponsiveMedia image={{ src: media.url, alt: media.alt_en, width: media.width, height: media.height }} className="home-project-card__media" /> : <img src={`/images/hero/gallery-015-hero-0${index + 5}.png`} alt="Gallery 015 project" loading="lazy" />}
                  <div><p>{project.type?.replaceAll('_', ' ') ?? 'Art project'}</p><h3>{project.title_en}</h3></div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {editorialNews.length > 0 ? (
          <section className="home-section home-editorial" aria-labelledby="home-editorial-title">
            <div className="home-section__header">
              <div><p className="home-kicker">Journal</p><h2 id="home-editorial-title">Editorial notes</h2></div>
              <Link href="/news">All news <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="home-editorial__list">
              {editorialNews.map((item) => (
                <Link href={`/news/${item.slug}`} key={item.id}>
                  <time dateTime={item.publish_date}>{formatDate(item.publish_date)}</time>
                  <h3>{item.title_en}</h3>
                  <p>{item.excerpt_en}</p>
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="home-contact" aria-label="Private advisory inquiries">
          <p className="home-kicker">Private viewings & advisory</p>
          <h2>For acquisition, placement, and institutional art programmes.</h2>
          <div><Link href="/contact">Get in touch</Link><Link href="/services">Our services</Link></div>
        </section>
      </div>
    </div>
  );
}
