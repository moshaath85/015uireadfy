import Link from 'next/link';

interface HomeWorksChapterProps {
  artworks: Array<{
    id: string;
    href: string;
    title: string;
    facts: string;
    image?: { src: string; alt: string; width?: number; height?: number };
  }>;
}

export default function HomeWorksChapter({ artworks }: HomeWorksChapterProps) {
  if (artworks.length === 0) return null;

  return (
    <section className="home-chapter home-chapter--works" aria-labelledby="home-works-title">
      <p className="home-chapter__number" aria-hidden="true">04</p>
      <div className="home-chapter__heading">
        <p className="home-chapter__eyebrow">Collection study</p>
        <h2 id="home-works-title">Works</h2>
      </div>
      <div className="home-works-study">
        {artworks.map((artwork, index) => (
          <Link href={artwork.href} className={`home-works-study__entry home-works-study__entry--${index + 1}`} key={artwork.id}>
            <div className="home-works-study__media">
              {artwork.image ? <img src={artwork.image.src} alt={artwork.image.alt} width={artwork.image.width} height={artwork.image.height} loading="lazy" decoding="async" /> : <span>015 / Image forthcoming</span>}
            </div>
            <div className="home-works-study__caption"><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{artwork.title}</h3><p>{artwork.facts}</p></div></div>
          </Link>
        ))}
      </div>
      <Link href="/artworks" className="home-chapter__index-link">Explore artworks <span aria-hidden="true">↗</span></Link>
    </section>
  );
}
