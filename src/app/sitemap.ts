import type { MetadataRoute } from 'next';

import { artistsRepository } from '@/lib/repositories/artists';
import { artworksRepository } from '@/lib/repositories/artworks';
import { collectionsRepository } from '@/lib/repositories/collections';
import { exhibitionsRepository } from '@/lib/repositories/exhibitions';
import { newsRepository } from '@/lib/repositories/news';
import { projectsRepository } from '@/lib/repositories/projects';
import { publicationsRepository } from '@/lib/repositories/publications';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  const now = new Date();

  const [artists, artworks, collections, exhibitions, projects, news, publications] = await Promise.all([
    artistsRepository.getPublicAll(),
    artworksRepository.getPublicAll(),
    collectionsRepository.getPublicAll(),
    exhibitionsRepository.getPublicAll(),
    projectsRepository.getPublicAll(),
    newsRepository.getPublicAll(),
    publicationsRepository.getPublicAll(),
  ]);

  const staticRoutes = ['', '/artists', '/artworks', '/collections', '/exhibitions', '/projects', '/services', '/news', '/publications', '/contact'];

  return [
    ...staticRoutes.map((route) => ({ url: `${siteUrl}${route}`, lastModified: now })),
    ...artists.map((item) => ({ url: `${siteUrl}/artists/${item.slug}`, lastModified: now })),
    ...artworks.map((item) => ({ url: `${siteUrl}/artworks/${item.slug}`, lastModified: now })),
    ...collections.map((item) => ({ url: `${siteUrl}/collections/${item.slug}`, lastModified: now })),
    ...exhibitions.map((item) => ({ url: `${siteUrl}/exhibitions/${item.slug}`, lastModified: now })),
    ...projects.map((item) => ({ url: `${siteUrl}/projects/${item.slug}`, lastModified: now })),
    ...news.map((item) => ({ url: `${siteUrl}/news/${item.slug}`, lastModified: now })),
    ...publications.map((item) => ({ url: `${siteUrl}/publications/${item.slug}`, lastModified: now })),
  ];
}
