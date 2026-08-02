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
];

const secondaryLinks = [
  { href: '/publications', label: 'Publications', labelAr: 'الإصدارات' },
  { href: '/contact', label: 'Contact', labelAr: 'تواصل' },
  { href: '/verify', label: 'Certificates', labelAr: 'الشهادات' },
];

export default function Header() {
  const pathname = usePathname();
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
            {mainLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
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
