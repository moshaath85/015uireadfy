'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMuseum = pathname.startsWith('/museum');

  if (isMuseum) {
    return (
      <>
        <a href="#main-content" className="g-skip-link" style={{ zIndex: 9999 }}>
          Skip to main content
        </a>
        <main id="main-content">{children}</main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
