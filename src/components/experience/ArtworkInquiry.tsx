import Link from 'next/link';

interface ArtworkInquiryProps {
  artworkTitle: string;
}

export function ArtworkInquiry({ artworkTitle }: ArtworkInquiryProps) {
  return (
    <section className="artwork-experience-inquiry" aria-labelledby="artwork-inquiry-title">
      <p className="artwork-experience-kicker">Private viewings and advisory</p>
      <h2 id="artwork-inquiry-title">Enquire about <em>{artworkTitle}</em></h2>
      <p>Contact the gallery for availability and further information.</p>
      <Link href="/contact"><span>Contact the gallery</span><span aria-hidden="true">↗</span></Link>
    </section>
  );
}
