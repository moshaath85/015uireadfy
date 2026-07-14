import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  const isProduction = process.env.TEX7_DATABASE_ENV === 'production';

  return {
    rules: isProduction
      ? [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/invite/'] }]
      : [{ userAgent: '*', disallow: '/' }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
