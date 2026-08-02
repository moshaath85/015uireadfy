import Link from 'next/link';

interface ExhibitionInquiryProps {
  exhibitionTitle: string;
}

export function ExhibitionInquiry({ exhibitionTitle }: ExhibitionInquiryProps) {
  return (
    <section className="exhibition-experience-inquiry" aria-labelledby="exhibition-inquiry-title">
      <p className="exhibition-experience-kicker">Visit and advisory</p>
      <h2 id="exhibition-inquiry-title">Discuss <em>{exhibitionTitle}</em> with the gallery</h2>
      <p>Contact the gallery for further information and private viewing enquiries.</p>
      <Link href="/contact"><span>Contact the gallery</span><span aria-hidden="true">↗</span></Link>
    </section>
  );
}
