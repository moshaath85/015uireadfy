import {
  findPublicArtistPrismaRecordBySlug,
  listPublicArtistPrismaRecords,
} from '@/lib/cms/artists/artists-prisma-adapter';

export const artistsRepository = {
  getPublicAll: () => listPublicArtistPrismaRecords(),
  getPublicFeatured: () => listPublicArtistPrismaRecords({ featuredOnly: true }),
  getPublicBySlug: findPublicArtistPrismaRecordBySlug,
};