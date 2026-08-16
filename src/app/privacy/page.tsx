import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerLanguage } from '@/lib/i18n/server-language';
import type { Language } from '@/lib/i18n/language';
import { BreadcrumbListLd } from '@/lib/jsonld';

const T = {
  kicker: { ar: 'الخصوصية', en: 'Privacy' },
  heading: { ar: 'سياسة الخصوصية', en: 'Privacy policy' },
  updated: { ar: 'آخر تحديث: ١٦ أغسطس ٢٠٢٦', en: 'Last updated: 16 August 2026' },
  s1_t: { ar: 'ما نجمع', en: 'What we collect' },
  s1_b: { ar: 'لا نطلب تسجيلًا لعرض المحتوى العام. عند التواصل عبر نموذج الاتصال، نجمع الاسم والبريد الإلكتروني والرسالة فقط. لا نستخدم ملفات تعريف الارتباط للتتبع عبر المواقع.', en: 'No registration is required to view public content. When you write through the contact form, we collect only your name, email address, and message. We do not use cross-site tracking cookies.' },
  s2_t: { ar: 'كيف نستخدمه', en: 'How we use it' },
  s2_b: { ar: 'تُستخدم المعلومات المقدمة عبر النماذج حصريًا للرد على استفسارك وترتيب المشاهدة الخاصة. لا نبيع بياناتك ولا نشاركها مع أطراف خارجية إلا عند الحاجة لتقديم الخدمة أو عند تطلب القانون.', en: 'Information submitted through forms is used solely to respond to your enquiry and arrange private viewings. We do not sell your data and share it with third parties only as needed to provide a service or as required by law.' },
  s3_t: { ar: 'الاحتفاظ والأمان', en: 'Retention and security' },
  s3_b: { ar: 'نحتفظ بالمراسلات طالما يلزم ذلك للرد وترتيب الخدمات، ثم نحذفها أو نؤمنها وفق ممارسات حماية البيانات. تتخذ تدابير تقنية وتنظيمية مناسبة لحماية ما نستلمه.', en: 'We retain correspondence as long as needed to respond and arrange services, then delete or securely store it in line with data-protection practice. Appropriate technical and organisational measures protect what we receive.' },
  s4_t: { ar: 'حقوقك', en: 'Your rights' },
  s4_b: { ar: 'يمكنك طلب الوصول إلى بياناتك أو تصحيحها أو حذفها في أي وقت بالتواصل معنا. يسري ذلك ضمن الحدود المنصوص عليها في الأنظمة المعمول بها.', en: 'You may request access to, correction of, or deletion of your data at any time by contacting us, subject to the limits set by applicable regulations.' },
  contact_label: { ar: 'للاستفسارات', en: 'For enquiries' },
};

function t(key: keyof typeof T, lang: Language): string { return lang === 'ar' ? T[key].ar : T[key].en; }

export const metadata: Metadata = {
  title: 'Privacy Policy | Gallery 015',
  description: 'How Gallery 015 collects, uses, and protects personal information.',
};

export default async function PrivacyPage() {
  const lang = await getServerLanguage();
  return (
    <>
      <BreadcrumbListLd items={[{ name: 'Gallery 015', url: 'https://gallery015.com' }, { name: 'Privacy Policy', url: 'https://gallery015.com/privacy' }]} />
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
            <div className="g-page__links">
              <span>{t('contact_label', lang)}</span>
              <a href="mailto:info@gallery015.com">info@gallery015.com</a>
              <Link href="/">Gallery 015</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
