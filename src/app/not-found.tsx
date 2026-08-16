import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerLanguage } from '@/lib/i18n/server-language';
import type { Language } from '@/lib/i18n/language';

const T = {
  kicker: { ar: 'خطأ', en: 'Not found' },
  heading1: { ar: 'الصفحة غير', en: 'This page' },
  heading2: { ar: 'موجودة.', en: 'does not exist.' },
  body: { ar: 'المسار الذي طلبته غير متاح في سجلات الغاليري. قد تكون حركته أو أزيل أو لم ينشر بعد.', en: 'The page you requested is not in the gallery records. It may have moved, been removed, or not yet been published.' },
  home: { ar: 'العودة إلى الرئيسية', en: 'Return to the homepage' },
  contact: { ar: 'تواصل معنا', en: 'Contact the gallery' },
};

function t(key: keyof typeof T, lang: Language): string { return lang === 'ar' ? T[key].ar : T[key].en; }

export const metadata: Metadata = {
  title: 'Page not found | Gallery 015',
  description: 'The requested page could not be found.',
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  const lang = await getServerLanguage();
  return (
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
          <p>{t('body', lang)}</p>
          <div className="g-page__links">
            <Link href="/">{t('home', lang)}</Link>
            <Link href="/contact">{t('contact', lang)}</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
