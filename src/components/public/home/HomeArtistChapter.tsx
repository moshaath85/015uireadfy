import Link from 'next/link';

interface HomeArtistChapterProps {
  artists: Array<{
    id: string;
    href: string;
    name: string;
    identity?: string;
    image?: { src: string; alt: string; width?: number; height?: number };
  }>;
}

export default function HomeArtistChapter({ artists }: HomeArtistChapterProps) {
  if (artists.length === 0) return null;

  return (
    <section className="home-chapter home-chapter--artists" aria-labelledby="home-artists-title">
      <p className="home-chapter__number" aria-hidden="true">03</p>
      <div className="home-chapter__heading">
        <p className="home-chapter__eyebrow">Representation</p>
        <h2 id="home-artists-title">Artists</h2>
      </div>
      <div className="home-artist-roster">
        {artists.map((artist, index) => (
          <Link href={artist.href} className={`home-artist-roster__entry home-artist-roster__entry--${index + 1}`} key={artist.id}>
            <div className="home-artist-roster__media">
              {artist.image ? <img src={artist.image.src} alt={artist.image.alt} width={artist.image.width} height={artist.image.height} loading="lazy" decoding="async" /> : <span>015 / Image forthcoming</span>}
            </div>
            <div className="home-artist-roster__identity"><h3>{artist.name}</h3>{artist.identity ? <p>{artist.identity}</p> : null}</div>
          </Link>
        ))}
      </div>
      <Link href="/artists" className="home-chapter__index-link">All artists <span aria-hidden="true">↗</span></Link>
    </section>
  );
}
