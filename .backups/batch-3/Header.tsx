import Link from 'next/link';

const navLinks = [
  { href: '/artists', label: 'Artists' },
  { href: '/artworks', label: 'Artworks' },
  { href: '/collections', label: 'Collections' },
  { href: '/exhibitions', label: 'Exhibitions' },
  { href: '/projects', label: 'Projects' },
  { href: '/news', label: 'News' },
  { href: '/publications', label: 'Publications' },
  { href: '/services', label: 'Services' },
];

export default function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="site-header__brand" aria-label="Gallery 015 home">
        <img src="/brand/015-logo-black.svg" alt="Gallery 015" />
      </Link>
      <nav className="site-header__nav" aria-label="Primary navigation">
        <ul>
          {navLinks.map((link) => (
            <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
          ))}
        </ul>
      </nav>
      <div className="site-header__actions">
        <Link href="/contact">Contact</Link>
        <details className="site-header__menu">
          <summary aria-label="Open menu"><span /><span /></summary>
          <div>
            <Link href="/verify">Verify certificate</Link>
            <Link href="/contact">Private viewing</Link>
          </div>
        </details>
      </div>
    </header>
  );
}
