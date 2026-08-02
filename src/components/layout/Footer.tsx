import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="g-footer" role="contentinfo">
      <div className="g-footer__inner">
        <div className="g-footer__brand">
          <Link href="/" aria-label="Gallery 015 — Home">
            <img src="/brand/015-logo-white.svg" alt="Gallery 015" />
          </Link>
          <p>
            A contemporary art platform shaped by artists, collectors, and
            place — from the founding generation of Saudi modernism to the
            voices defining it now.
          </p>
        </div>

        <div className="g-footer__col">
          <h3>Visit</h3>
          <address>
            Gallery 015<br />
            Riyadh · Saudi Arabia
          </address>
          <a href="mailto:info@gallery015.com">info@gallery015.com</a>
          <Link href="/contact">Plan a private viewing</Link>
        </div>

        <div className="g-footer__col">
          <h3>Programme</h3>
          <Link href="/artists">Artists</Link>
          <Link href="/exhibitions">Exhibitions</Link>
          <Link href="/artworks">Artworks</Link>
          <Link href="/collections">Collections</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/news">Journal</Link>
        </div>

        <div className="g-footer__col">
          <h3>About</h3>
          <Link href="/services">Services</Link>
          <Link href="/publications">Publications</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/verify">Certificates</Link>
        </div>
      </div>

      <div className="g-footer__bottom">
        <span>© {year} Gallery 015. All rights reserved.</span>
        <span>Riyadh · Saudi Arabia</span>
        <Link href="/contact">Contact</Link>
      </div>
    </footer>
  );
}
