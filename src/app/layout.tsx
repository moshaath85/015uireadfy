import type { Metadata } from 'next';
import '@/styles/design-tokens.css';
import '@/styles/globals.css';
import '@/styles/site-2026.css';
import SiteChrome from '@/components/layout/SiteChrome';
import { IBM_Plex_Sans } from 'next/font/google';
import { SITE } from '@/lib/metadata';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
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
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={ibmPlexSans.variable}>
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
