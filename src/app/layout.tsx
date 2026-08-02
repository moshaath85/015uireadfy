import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import '@/styles/design-tokens.css';
import '@/styles/globals.css';
import '@/styles/site-2026.css';
import SiteChrome from '@/components/layout/SiteChrome';
import LanguageProvider from '@/components/layout/LanguageProvider';
import { IBM_Plex_Sans, EB_Garamond } from 'next/font/google';
import { SITE } from '@/lib/metadata';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

/* Display serif for editorial headings and long-form reading.
   Italic is shipped because subtitles and hero meta use font-style: italic. */
const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-serif-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Contemporary Art Gallery, Riyadh`, template: `%s` },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  generator: 'Gallery 015',
  keywords: ['contemporary art', 'gallery', 'Riyadh', 'Saudi Arabia', 'exhibitions', 'artists', 'artworks', 'collections'],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: `${SITE.name} — Contemporary Art Gallery, Riyadh`,
    description: SITE.description,
    url: SITE.url,
    locale: SITE.locale,
    images: [{ url: SITE.ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — Contemporary Art Gallery, Riyadh`,
    description: SITE.description,
  },
  icons: {
    icon: '/brand/015-logo-black.svg',
    apple: '/brand/015-logo-black.svg',
  },
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('gallery-lang');
  const initialLang = langCookie?.value === 'ar' ? 'ar' : 'en';
  const isRtl = initialLang === 'ar';

  return (
    <html lang={initialLang} dir={isRtl ? 'rtl' : 'ltr'} className={`${ibmPlexSans.variable} ${ebGaramond.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider initialLang={initialLang}>
          <SiteChrome>{children}</SiteChrome>
        </LanguageProvider>
      </body>
    </html>
  );
}
