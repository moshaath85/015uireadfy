import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerLanguage } from '@/lib/i18n/server-language';
import type { Language } from '@/lib/i18n/language';
import { BreadcrumbListLd } from '@/lib/jsonld';

const T = {
  kicker: { ar: 'الشروط', en: 'Terms' },
  heading: { ar: 'شروط الاستخدام', en: 'Terms of use' },
  updated: { ar: 'آخر تحديث: ١٦ أغسطس ٢٠٢٦', en: 'Last updated: 16 August 2026' },
  s1_t: { ar: 'الاستخدام العام', en: 'General use' },
  s1_b: { ar: 'يقدم هذا الموقع معلومات حول غاليري ٠١٥ وفنانيه وبرامجه للأغراض الإعلامية. قد يتغير المحتوى دون إشعار، ولا نضمن دقته أو اكتماله في أي وقت.', en: 'This site presents information about Gallery 015, its artists, and its programme for informational purposes. Content may change without notice, and we make no guarantee of its accuracy or completeness at any given time.' },
  s2_t: { ar: 'الملكية الفكرية', en: 'Intellectual property' },
  s2_b: { ar: 'جميع المحتوى — الأعمال الفنية والنصوص والصور والعلامات — محمي بحقوق الملكية الفكرية ولا يجوز إعادة إنتاجه دون إذن كتابي مسبق من الغاليري أو أصحاب الحقوق.', en: 'All content — artworks, text, images, and marks — is protected by intellectual-property rights and may not be reproduced without prior written permission from the gallery or the rights holders.' },
  s3_t: { ar: 'المشاهدة الخاصة', en: 'Private viewing' },
  s3_b: { ar: 'تُعرض الأعمال للمشاهدة الخاصة بموعد مسبق. لا تنشر الأسعار ولا تتوفر كتالوجات أعمال متاحة للبيع، وجميع الاستفسارات تبدأ بمحادثة.', en: 'Works are shown by appointment for private viewing. No prices are published and no catalogues of available works are offered; every enquiry begins with a conversation.' },
  s4_t: { ar: 'الروابط الخارجية', en: 'External links' },
  s4_b: { ar: 'قد يشير الموقع إلى موارد خارجية. لا نتحمل مسؤولية محتوى أو ممارسات تلك الموارد الخارجية.', en: 'The site may link to external resources. We are not responsible for the content or practices of those external resources.' },
  s5_t: { ar: 'تطبيق القانون', en: 'Governing law' },
  s5_b: { ar: 'تخضع هذه الشروط للقوانين السارية في المملكة العربية السعودية.', en: 'These terms are governed by the laws in force in the Kingdom of Saudi Arabia.' },
  contact_label: { ar: 'للاستفسارات', en: 'For enquiries' },
};

function t(key: keyof typeof T, lang: Language): string { return lang === 'ar' ? T[key].ar : T[key].en; }

export const metadata: Metadata = {
  title: 'Terms of Use | Gallery 015',
  description: 'Terms governing the use of the Gallery 015 website.',
};

export default async function TermsPage() {
  const lang = await getServerLanguage();
  return (
    <>
      <BreadcrumbListLd items={[{ name: 'Gallery 015', url: 'https://gallery015.com' }, { name: 'Terms of Use', url: 'https://gallery015.com/terms' }]} />
      <main className="g-page">
        <div className="g-page__grid">
          <header className="g-page__header">
            <p className="g-page__kicker">{t('kicker', lang)}</p>
            <h1>{t('heading', lang)}</h1>
          </header>
          <div className="g-page__body">
            <p>{t('updated', lang)}</p>
            <div className="g-page__section">
              <h2>{t('s1_t', lang)}</h2>
              <p>{t('s1_b', lang)}</p>
            </div>
            <div className="g-page__section">
              <h2>{t('s2_t', lang)}</h2>
              <p>{t('s2_b', lang)}</p>
            </div>
            <div className="g-page__section">
              <h2>{t('s3_t', lang)}</h2>
              <p>{t('s3_b', lang)}</p>
            </div>
            <div className="g-page__section">
              <h2>{t('s4_t', lang)}</h2>
              <p>{t('s4_b', lang)}</p>
            </div>
            <div className="g-page__section">
              <h2>{t('s5_t', lang)}</h2>
              <p>{t('s5_b', lang)}</p>
            </div>
            <div className="g-page__links">
              <span>{t('contact_label', lang)}</span>
              <a href="mailto:info@gallery015.com">info@gallery015.com</a>
              <Link href="/privacy">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
