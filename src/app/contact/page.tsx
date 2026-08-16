import type { Metadata } from 'next';
import ContactForm from '@/components/public/ContactForm';
import { getServerLanguage } from '@/lib/i18n/server-language';
import type { Language } from '@/lib/i18n/language';
import { BreadcrumbListLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Contact | Gallery 015',
  description: 'Contact Gallery 015 for private viewings, acquisitions, institutional programmes, and press enquiries.',
};

const T = {
  kicker: { ar: 'تواصل', en: 'Contact' },
  heading: { ar: 'للاقتناء والتنسيق والبرامج الفنية المؤسسية.', en: 'For acquisition, placement, and institutional art programmes.' },
  intro: { ar: 'تواصل مع فريق الغاليري لحجز مواعيد المشاهدة الخاصة والاستفسار عن توفر الأعمال والاستشارات الفنية واستفسارات الصحافة. نرد على جميع الرسائل خلال ٤٨ ساعة.', en: 'Contact the gallery team for private viewing appointments, artwork availability, collection advisory, and press enquiries. We respond to all messages within 48 hours.' },
  visit: { ar: 'زيارة الغاليري', en: 'Visit the gallery' },
  by_appointment: { ar: 'المشاهدة الخاصة بموعد مسبق', en: 'Private viewing by appointment' },
  direct_contact: { ar: 'تواصل مباشر', en: 'Direct contact' },
};

function t(key: keyof typeof T, lang: Language) { return lang === 'ar' ? T[key].ar : T[key].en; }

export default async function ContactPage() {
  const lang = await getServerLanguage();
  return (
    <>
      <BreadcrumbListLd items={[{ name: 'Gallery 015', url: 'https://gallery015.com' }, { name: 'Contact', url: 'https://gallery015.com/contact' }]} />
    <main className="g-contact">
      <div className="g-contact__grid">
        <header className="g-contact__header">
          <p className="g-contact__kicker">{t('kicker', lang)}</p>
          <h1>{t('heading', lang)}</h1>
          <p className="g-contact__intro">{t('intro', lang)}</p>
        </header>
        <div className="g-contact__details">
          <div className="g-contact__info">
            <h2>{t('visit', lang)}</h2>
            <address>Gallery 015<br />{lang === 'ar' ? 'الرياض · المملكة العربية السعودية' : 'Riyadh · Saudi Arabia'}</address>
            <p>{t('by_appointment', lang)}</p>
          </div>
          <div className="g-contact__info">
            <h2>{t('direct_contact', lang)}</h2>
            <a href="mailto:info@gallery015.com">info@gallery015.com</a>
          </div>
        </div>
        <div className="g-contact__form-wrap">
          <ContactForm />
        </div>
      </div>
    </main>
    </>
  );
}
