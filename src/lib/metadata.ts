export const SITE = {
  name: 'Gallery 015',
  shortName: '015',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://gallery015.com',
  description: 'Gallery 015 is a contemporary art gallery in Riyadh presenting artists, exhibitions, artworks, collections, projects, publications, and cultural programmes.',
  locale: 'en_SA',
  ogImage: '/brand/015-logo-black.svg',
  twitterHandle: '',
} as const;

export function canonical(path: string): string {
  return `${SITE.url}${path}`;
}

export function ogImageUrl(imagePath?: string | null): string {
  if (imagePath) return imagePath.startsWith('http') ? imagePath : `${SITE.url}${imagePath}`;
  return `${SITE.url}${SITE.ogImage}`;
}
