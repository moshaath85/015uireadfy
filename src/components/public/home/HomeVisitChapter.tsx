import Link from 'next/link';

export default function HomeVisitChapter() {
  return (
    <section className="home-chapter home-chapter--visit" aria-labelledby="home-visit-title">
      <p className="home-chapter__number" aria-hidden="true">07</p>
      <div className="home-chapter__heading">
        <p className="home-chapter__eyebrow">Visit</p>
        <h2 id="home-visit-title">For acquisition, placement, and institutional art programmes.</h2>
      </div>
      <div className="home-visit__links"><Link href="/contact">Private viewings &amp; advisory <span aria-hidden="true">↗</span></Link><Link href="/services">Our services <span aria-hidden="true">↗</span></Link></div>
    </section>
  );
}
