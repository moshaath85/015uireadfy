import type { Artist, Artwork, Certificate, Collection, Exhibition, Project, Service, News, Publication, Media, Settings } from '@/types';
import settingsData from '../../../data/settings.json';
import artistsData from '../../../data/artists.json';
import artworksData from '../../../data/artworks.json';
import collectionsData from '../../../data/collections.json';
import exhibitionsData from '../../../data/exhibitions.json';
import projectsData from '../../../data/projects.json';
import servicesData from '../../../data/services.json';
import certificatesData from '../../../data/certificates.json';
import newsData from '../../../data/news.json';
import publicationsData from '../../../data/publications.json';
import mediaData from '../../../data/media.json';
function filterPublic<T extends { visibility_status?: string }>(items: T[]): T[] { return items.filter(item => item.visibility_status === 'public'); }
export function getSettings(): Settings { return settingsData as Settings; }
export function getArtists(): Artist[] { return filterPublic(artistsData as Artist[]); }
export function getArtistBySlug(slug: string): Artist | undefined { return getArtists().find(artist => artist.slug === slug); }
export function getArtworks(): Artwork[] { return filterPublic(artworksData as Artwork[]); }
export function getArtworkBySlug(slug: string): Artwork | undefined { return getArtworks().find(artwork => artwork.slug === slug); }
export function getCollections(): Collection[] { return filterPublic(collectionsData as Collection[]); }
export function getExhibitions(): Exhibition[] { return filterPublic(exhibitionsData as Exhibition[]); }
export function getProjects(): Project[] { return filterPublic(projectsData as Project[]); }
export function getServices(): Service[] { return filterPublic(servicesData as Service[]); }
export function getCertificates(): Certificate[] { return certificatesData as Certificate[]; }
export function getCertificateByNumber(certificateNumber: string): Certificate | undefined { return getCertificates().find(certificate => certificate.certificate_number.toLowerCase() === certificateNumber.toLowerCase()); }
export function getCertificateByVerificationUrl(verificationUrl: string): Certificate | undefined { return getCertificates().find(certificate => certificate.verification_url === verificationUrl); }
export function getNews(): News[] { return filterPublic(newsData as News[]); }
export function getPublications(): Publication[] { return filterPublic(publicationsData as Publication[]); }
export function getMedia(): Media[] { return mediaData as Media[]; }
export function getMediaById(id: string): Media | undefined { return getMedia().find(media => media.id === id); }
export function getArtworkPrimaryMedia(artwork: Artwork): Media | undefined { if (!artwork.primary_image_id) return undefined; return getMediaById(artwork.primary_image_id); }
export function getArtistProfileMedia(artist: Artist): Media | undefined { if (!artist.profile_image_id) return undefined; return getMediaById(artist.profile_image_id); }
