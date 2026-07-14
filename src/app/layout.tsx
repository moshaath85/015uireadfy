import '@/styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const dynamic = 'force-dynamic';
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body><Header /><main>{children}</main><Footer /></body></html>; }
