import Link from 'next/link';

interface CollectionInquiryProps {
  collectionTitle: string;
}

export function CollectionInquiry({ collectionTitle }: CollectionInquiryProps) {
  return (
    <section className="collection-experience-inquiry" aria-labelledby="collection-inquiry-title">
      <p className="collection-experience-kicker">Private advisory</p>
      <h2 id="collection-inquiry-title">Discuss <em>{collectionTitle}</em> with the gallery</h2>
      <p>Contact the gallery for further information about the collection and its works.</p>
      <Link href="/contact"><span>Contact the gallery</span><span aria-hidden="true">↗</span></Link>
    </section>
  );
}
