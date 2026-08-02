'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const mainLinks = [
  { href: '/museum', label: 'Museum' },
  { href: '/artists', label: 'Artists' },
  { href: '/exhibitions', label: 'Exhibitions' },
  { href: '/artworks', label: 'Artworks' },
  { href: '/collections', label: 'Collections' },
  { href: '/projects', label: 'Projects' },
  { href: '/news', label: 'Journal' },
  { href: '/services', label: 'Services' },
];

const secondaryLinks = [
  { href: '/publications', label: 'Publications' },
  { href: '/contact', label: 'Contact' },
  { href: '/verify', label: 'Certificates' },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  return (
    <>
      <a href="#main-content" className="g-skip-link">
        Skip to main content
      </a>

      <header className={`g-header${scrolled ? ' is-scrolled' : ''}`}>
        <Link
          href="/"
          className="g-header__brand"
          aria-label="Gallery 015 — Home"
          onClick={closeMenu}
        >
          <img src="/brand/015-logo-black.svg" alt="Gallery 015" />
        </Link>

        <nav className="g-header__nav" aria-label="Primary">
          <ul>
            {mainLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={isActive(link.href) ? 'is-active' : undefined}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="g-header__actions">
          <Link href="/contact" className="g-header__cta">Contact</Link>
          <button
            type="button"
            className={`g-header__toggle${menuOpen ? ' is-open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        className={`g-nav-overlay${menuOpen ? ' is-open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <nav className="g-nav-overlay__inner" aria-label="Mobile navigation">
          <ul className="g-nav-overlay__primary">
            {[...mainLinks, ...secondaryLinks].map((link, i) => (
              <li
                key={link.href}
                style={{ '--stagger': i } as React.CSSProperties}
              >
                <Link
                  href={link.href}
                  className={isActive(link.href) ? 'is-active' : undefined}
                  onClick={closeMenu}
                >
                  <span className="g-nav-overlay__num">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="g-nav-overlay__secondary">
            <Link href="/verify" onClick={closeMenu}>Certificate verification</Link>
            <Link href="/contact" onClick={closeMenu}>Private viewing</Link>
          </div>
        </nav>
      </div>
    </>
  );
}
