import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <img src="/brand/015-logo-black.svg" alt="Gallery 015" />
        <p>Contemporary art, cultural programmes, and institutional advisory.</p>
      </div>
      <div className="site-footer__column">
        <p>Visit & contact</p>
        <a href="mailto:info@gallery015.com">info@gallery015.com</a>
        <a href="tel:+966123456789">+966 12 345 6789</a>
        <Link href="/contact">Plan a private viewing</Link>
      </div>
      <div className="site-footer__column">
        <p>Explore</p>
        <Link href="/artists">Artists</Link>
        <Link href="/exhibitions">Exhibitions</Link>
        <Link href="/projects">Projects</Link>
      </div>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} Gallery 015</span>
        <span>Riyadh · Saudi Arabia</span>
        <Link href="/verify">Certificate verification</Link>
      </div>
    </footer>
  );
}
