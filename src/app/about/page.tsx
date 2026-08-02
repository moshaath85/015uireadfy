import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About | Gallery 015',
  description: 'Gallery 015 is a contemporary art platform shaped by artists, collectors, and place — rooted in Riyadh, connected globally.',
};

export default function AboutPage() {
  return (
    <main className="g-page">
      <div className="g-page__grid">
        <header className="g-page__header">
          <p className="g-page__kicker">About</p>
          <h1>
            A contemporary art<br />
            platform shaped by artists,<br />
            collectors, and place.
          </h1>
        </header>

        <div className="g-page__body">
          <p>
            Gallery 015 brings together representation, exhibitions, private advisory, and
            cultural projects across the Kingdom — from the founding generation of Saudi
            modernism to the voices defining it now.
          </p>
          <p>
            Founded in Riyadh, the gallery works at the intersection of institutional
            programming and private collecting. Our approach is curatorial, not
            transactional — every work is documented, certified, and presented with the
            scholarly rigour of a museum, combined with the intimacy of a private
            collection.
          </p>
          <p>
            We represent a focused roster of artists whose practices span painting,
            sculpture, photography, installation, and new media. Our programme includes
            gallery exhibitions, institutional collaborations, commissioned projects for
            cultural landmarks, and a publishing imprint that produces monographs,
            catalogues, and the 015 Journal.
          </p>

          <h2>The space</h2>
          <p>
            The gallery occupies a purpose-built space in Riyadh designed for the
            contemplation of art. Natural light, considered proportions, and material warmth
            create an environment where works can be experienced without distraction.
            Private viewing rooms, a research library, and climate-controlled storage
            support the full lifecycle of collecting — from first encounter to long-term
            stewardship.
          </p>

          <h2>Services</h2>
          <p>
            Beyond exhibitions, the gallery provides private advisory, collection
            management, artwork authentication, installation design, and institutional
            commissioning. Every engagement begins with a conversation — there are no
            catalogues of available works, no posted prices, no transactional storefront.
            The gallery is a relationship, not a marketplace.
          </p>

          <div className="g-page__links">
            <Link href="/artists">The roster</Link>
            <Link href="/exhibitions">Exhibitions</Link>
            <Link href="/services">Our services</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
