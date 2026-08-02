import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerLanguage } from '@/lib/i18n/server-language';
import type { Language } from '@/lib/i18n/language';
import { BreadcrumbListLd } from '@/lib/jsonld';

const T = {
  kicker: { ar: 'زيارة', en: 'Visit' },
  heading1: { ar: 'مشاهدة خاصة', en: 'Private viewing' },
  heading2: { ar: 'بموعد مسبق.', en: 'by appointment.' },
  location: { ar: 'الموقع', en: 'Location' },
  address: { ar: 'غاليري ٠١٥\nالرياض · المملكة العربية السعودية', en: 'Gallery 015\nRiyadh · Saudi Arabia' },
  hours: { ar: 'ساعات العمل', en: 'Hours' },
  hours_p1: { ar: 'المشاهدة الخاصة بموعد مسبق', en: 'Private viewing by appointment' },
  hours_p2: { ar: 'الإثنين–الخميس، ١٠:٠٠–١٨:٠٠', en: 'Monday–Thursday, 10:00–18:00' },
  hours_p3: { ar: 'الجمعة، ١٤:٠٠–١٨:٠٠', en: 'Friday, 14:00–18:00' },
  hours_p4: { ar: 'السبت بالترتيب', en: 'Saturday by arrangement' },
  hours_p5: { ar: 'الأحد مغلق', en: 'Sunday closed' },
  contact: { ar: 'تواصل', en: 'Contact' },
  access: { ar: 'الوصول', en: 'Access' },
  access_text: { ar: 'الغاليري متاح للزوار ذوي الاحتياجات الخاصة. يرجى إبلاغنا بأي متطلبات وصول عند حجز موعدك.', en: 'The gallery is accessible to visitors with reduced mobility. Please inform us of any access requirements when booking your appointment.' },
  link_book: { ar: 'احجز مشاهدة خاصة', en: 'Book a private viewing' },
  link_about: { ar: 'عن الغاليري', en: 'About the gallery' },
};

function t(key: keyof typeof T, lang: Language): string { return lang === 'ar' ? T[key].ar : T[key].en; }

export const metadata: Metadata = {
  title: 'Visit | Gallery 015',
  description: 'Plan your visit to Gallery 015 in Riyadh. Hours, location, and private viewing appointments.',
};

export default async function VisitPage() {
  const lang = await getServerLanguage();
  return (
    <>
      <BreadcrumbListLd items={[{ name: 'Gallery 015', url: 'https://gallery015.com' }, { name: 'Visit', url: 'https://gallery015.com/visit' }]} />
    <main className="g-page">
      <div className="g-page__grid">
        <header className="g-page__header">
          <p className="g-page__kicker">{t('kicker', lang)}</p>
          <h1>
            {t('heading1', lang)}<br />
            {t('heading2', lang)}
          </h1>
        </header>

        <div className="g-page__body">
          <div className="g-page__section">
            <h2>{t('location', lang)}</h2>
            <address>
              {t('address', lang).split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </address>
          </div>

          <div className="g-page__section">
            <h2>{t('hours', lang)}</h2>
            <p>{t('hours_p1', lang)}</p>
            <p>{t('hours_p2', lang)}</p>
            <p>{t('hours_p3', lang)}</p>
            <p>{t('hours_p4', lang)}</p>
            <p>{t('hours_p5', lang)}</p>
          </div>

          <div className="g-page__section">
            <h2>{t('contact', lang)}</h2>
            <a href="mailto:info@gallery015.com">info@gallery015.com</a>
            <a href="tel:+966123456789">+966 12 345 6789</a>
          </div>

          <div className="g-page__section">
            <h2>{t('access', lang)}</h2>
            <p>{t('access_text', lang)}</p>
          </div>

          <div className="g-page__links">
            <Link href="/contact">{t('link_book', lang)}</Link>
            <Link href="/about">{t('link_about', lang)}</Link>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
