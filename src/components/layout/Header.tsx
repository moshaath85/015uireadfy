'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/components/layout/LanguageProvider';

const mainLinks = [
  { href: '/museum', label: 'Museum', labelAr: 'المتحف' },
  { href: '/artists', label: 'Artists', labelAr: 'الفنانون' },
  { href: '/exhibitions', label: 'Exhibitions', labelAr: 'المعارض' },
  { href: '/artworks', label: 'Artworks', labelAr: 'الأعمال' },
  { href: '/collections', label: 'Collections', labelAr: 'المجموعات' },
  { href: '/projects', label: 'Projects', labelAr: 'المشاريع' },
  { href: '/news', label: 'Journal', labelAr: 'المجلة' },
  { href: '/services', label: 'Services', labelAr: 'الخدمات' },
  { href: '/verify', label: 'Certificates', labelAr: 'الشهادات' },
];

const secondaryLinks = [
  { href: '/publications', label: 'Publications', labelAr: 'الإصدارات' },
  { href: '/contact', label: 'Contact', labelAr: 'تواصل' },
  { href: '/verify', label: 'Certificates', labelAr: 'الشهادات' },
];

export default function Header({ emptySections = [] }: { emptySections?: string[] }) {
  const pathname = usePathname();
  const visible = (l: { href: string }) => !emptySections.includes(l.href);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, switchLang } = useLanguage();

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
            {mainLinks.filter(visible).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch={false}
                  className={isActive(link.href) ? 'is-active' : undefined}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {lang === 'ar' ? link.labelAr : link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="g-header__actions">
          <Link
            href="/search"
            className="g-header__search"
            aria-label={lang === 'ar' ? 'بحث' : 'Search'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>
          <button
            type="button"
            className="g-header__lang"
            onClick={() => switchLang(lang === 'en' ? 'ar' : 'en')}
            aria-label={lang === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
          >
            {lang === 'en' ? 'AR' : 'EN'}
          </button>
          <Link href="/contact" className="g-header__cta">{lang === 'ar' ? 'تواصل' : 'Contact'}</Link>
          <button
            type="button"
            className={`g-header__toggle${menuOpen ? ' is-open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="g-nav-overlay"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        id="g-nav-overlay"
        className={`g-nav-overlay${menuOpen ? ' is-open' : ''}`}
        aria-hidden={!menuOpen}
        aria-modal={menuOpen ? 'true' : undefined}
      >
        <nav className="g-nav-overlay__inner" aria-label="Mobile navigation">
          <ul className="g-nav-overlay__primary">
            {[...mainLinks, ...secondaryLinks].filter(visible).map((link, i) => (
              <li
                key={link.href}
                style={{ '--stagger': i } as React.CSSProperties}
              >
                <Link
                  href={link.href}
                  className={isActive(link.href) ? 'is-active' : undefined}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  onClick={closeMenu}
                >
                  <span className="g-nav-overlay__num">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {lang === 'ar' ? link.labelAr : link.label}
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
