import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerLanguage } from '@/lib/i18n/server-language';
import type { Language } from '@/lib/i18n/language';
import { BreadcrumbListLd } from '@/lib/jsonld';

const T = {
  kicker: { ar: 'حول', en: 'About' },
  heading: { ar: 'منصة فنية معاصرة\nيصوغها الفنانون\nوجامعو المقتنيات والمكان.', en: 'A contemporary art\nplatform shaped by artists,\ncollectors, and place.' },
  p1: { ar: 'تجمع غاليري ٠١٥ بين التمثيل الفني والمعارض والاستشارات الخاصة والمشاريع الثقافية في جميع أنحاء المملكة — من الجيل المؤسس للحداثة السعودية إلى الأصوات التي تحدد معالمها الآن.', en: 'Gallery 015 brings together representation, exhibitions, private advisory, and cultural projects across the Kingdom — from the founding generation of Saudi modernism to the voices defining it now.' },
  p2: { ar: 'تأسس الغاليري في الرياض، ويعمل عند تقاطع البرمجة المؤسسية والاقتناء الخاص. نهجنا تنظيمي وليس تجاريًا — كل عمل موثق ومعتمد ويُقدم بدقة أكاديمية متحفية، مع حميمية المجموعة الخاصة.', en: 'Founded in Riyadh, the gallery works at the intersection of institutional programming and private collecting. Our approach is curatorial, not transactional — every work is documented, certified, and presented with the scholarly rigour of a museum, combined with the intimacy of a private collection.' },
  p3: { ar: 'نمثل قائمة مركزة من الفنانين الذين تمتد ممارساتهم عبر الرسم والنحت والتصوير الفوتوغرافي والتركيب والوسائط الجديدة. يشمل برنامجنا معارض في الغاليري وتعاونات مؤسسية ومشاريع مكلفة للمعالم الثقافية، بالإضافة إلى إصدارات تنشر الدراسات والكتالوجات ومجلة ٠١٥.', en: 'We represent a focused roster of artists whose practices span painting, sculpture, photography, installation, and new media. Our programme includes gallery exhibitions, institutional collaborations, commissioned projects for cultural landmarks, and a publishing imprint that produces monographs, catalogues, and the 015 Journal.' },
  space_heading: { ar: 'المساحة', en: 'The space' },
  space_text: { ar: 'يشغل الغاليري مساحة مصممة خصيصًا في الرياض لتأمل الفن. الضوء الطبيعي والنسب المدروسة والدفء المادي يخلقون بيئة يمكن فيها تجربة الأعمال دون تشتيت. غرف مشاهدة خاصة ومكتبة بحثية وتخزين متحكم مناخيًا تدعم دورة حياة الاقتناء الكاملة — من اللقاء الأول إلى الرعاية طويلة الأمد.', en: 'The gallery occupies a purpose-built space in Riyadh designed for the contemplation of art. Natural light, considered proportions, and material warmth create an environment where works can be experienced without distraction. Private viewing rooms, a research library, and climate-controlled storage support the full lifecycle of collecting — from first encounter to long-term stewardship.' },
  services_heading: { ar: 'الخدمات', en: 'Services' },
  services_text: { ar: 'إلى جانب المعارض، يقدم الغاليري استشارات خاصة وإدارة مجموعات وتوثيق الأعمال الفنية وتصميم التركيبات والتكليف المؤسسي. كل تعامل يبدأ بمحادثة — لا توجد كتالوجات للأعمال المتاحة ولا أسعار منشورة ولا واجهة تجارية. الغاليري علاقة وليس سوقًا.', en: 'Beyond exhibitions, the gallery provides private advisory, collection management, artwork authentication, installation design, and institutional commissioning. Every engagement begins with a conversation — there are no catalogues of available works, no posted prices, no transactional storefront. The gallery is a relationship, not a marketplace.' },
  links_roster: { ar: 'قائمة الفنانين', en: 'The roster' },
  links_exhibitions: { ar: 'المعارض', en: 'Exhibitions' },
  links_services: { ar: 'خدماتنا', en: 'Our services' },
  links_contact: { ar: 'تواصل', en: 'Contact' },
};

function t(key: keyof typeof T, lang: Language): string { return lang === 'ar' ? T[key].ar : T[key].en; }

export const metadata: Metadata = {
  title: 'About | Gallery 015',
  description: 'Gallery 015 is a contemporary art platform shaped by artists, collectors, and place — rooted in Riyadh, connected globally.',
};

export default async function AboutPage() {
  const lang = await getServerLanguage();
  return (
    <>
      <BreadcrumbListLd items={[{ name: 'Gallery 015', url: 'https://gallery015.com' }, { name: 'About', url: 'https://gallery015.com/about' }]} />
    <main className="g-page">
      <div className="g-page__grid">
        <header className="g-page__header">
          <p className="g-page__kicker">{t('kicker', lang)}</p>
          <h1>
            {t('heading', lang).split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </h1>
        </header>

        <div className="g-page__body">
          <p>{t('p1', lang)}</p>
          <p>{t('p2', lang)}</p>
          <p>{t('p3', lang)}</p>

          <h2>{t('space_heading', lang)}</h2>
          <p>{t('space_text', lang)}</p>

          <h2>{t('services_heading', lang)}</h2>
          <p>{t('services_text', lang)}</p>

          <div className="g-page__links">
            <Link href="/artists">{t('links_roster', lang)}</Link>
            <Link href="/exhibitions">{t('links_exhibitions', lang)}</Link>
            <Link href="/services">{t('links_services', lang)}</Link>
            <Link href="/contact">{t('links_contact', lang)}</Link>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
