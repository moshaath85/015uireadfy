import Link from 'next/link';
import { useLanguage } from '@/components/layout/LanguageProvider';

const L = {
  visit: { ar: 'زيارة', en: 'Visit' },
  programme: { ar: 'البرنامج', en: 'Programme' },
  about: { ar: 'حول', en: 'About' },
  artists: { ar: 'الفنانون', en: 'Artists' },
  exhibitions: { ar: 'المعارض', en: 'Exhibitions' },
  artworks: { ar: 'الأعمال', en: 'Artworks' },
  collections: { ar: 'المجموعات', en: 'Collections' },
  projects: { ar: 'المشاريع', en: 'Projects' },
  journal: { ar: 'المجلة', en: 'Journal' },
  services: { ar: 'الخدمات', en: 'Services' },
  publications: { ar: 'الإصدارات', en: 'Publications' },
  contact: { ar: 'تواصل', en: 'Contact' },
  certificates: { ar: 'الشهادات', en: 'Certificates' },
  plan_visit: { ar: 'خطط لزيارتك', en: 'Plan a private viewing' },
  rights: { ar: '© {year} غاليري ٠١٥. جميع الحقوق محفوظة.', en: '© {year} Gallery 015. All rights reserved.' },
  location: { ar: 'الرياض · المملكة العربية السعودية', en: 'Riyadh · Saudi Arabia' },
  tagline: { ar: 'منصة فنية معاصرة يصوغها الفنانون وجامعو المقتنيات والمكان — من الجيل المؤسس للحداثة السعودية إلى الأصوات التي تحدد معالمها الآن.', en: 'A contemporary art platform shaped by artists, collectors, and place — from the founding generation of Saudi modernism to the voices defining it now.' },
};

export default function Footer() {
  const year = new Date().getFullYear();
  const { lang } = useLanguage();
  const t = (k: keyof typeof L) => lang === 'ar' ? L[k].ar : L[k].en;

  return (
    <footer className="g-footer" role="contentinfo">
      <div className="g-footer__inner">
        <div className="g-footer__brand">
          <Link href="/" aria-label="Gallery 015 — Home">
            <img src="/brand/015-logo-white.svg" alt="Gallery 015" />
          </Link>
          <p>{t('tagline')}</p>
        </div>
        <div className="g-footer__col">
          <h3>{t('visit')}</h3>
          <address>Gallery 015<br />{t('location')}</address>
          <a href="mailto:info@gallery015.com">info@gallery015.com</a>
          <Link href="/contact">{t('plan_visit')}</Link>
        </div>
        <div className="g-footer__col">
          <h3>{t('programme')}</h3>
          <Link href="/artists">{t('artists')}</Link>
          <Link href="/exhibitions">{t('exhibitions')}</Link>
          <Link href="/artworks">{t('artworks')}</Link>
          <Link href="/collections">{t('collections')}</Link>
          <Link href="/projects">{t('projects')}</Link>
          <Link href="/news">{t('journal')}</Link>
        </div>
        <div className="g-footer__col">
          <h3>{t('about')}</h3>
          <Link href="/services">{t('services')}</Link>
          <Link href="/publications">{t('publications')}</Link>
          <Link href="/contact">{t('contact')}</Link>
          <Link href="/verify">{t('certificates')}</Link>
        </div>
      </div>
      <div className="g-footer__bottom">
        <span>{t('rights').replace('{year}', String(year))}</span>
        <span>{t('location')}</span>
        <Link href="/contact">{t('contact')}</Link>
      </div>
    </footer>
  );
}
