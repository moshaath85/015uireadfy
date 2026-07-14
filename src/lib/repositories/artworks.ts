import {
  findPublicArtworkRecordBySlug,
  listPublicArtworkRecords,
} from "@/lib/cms/production-prisma";

export const artworksRepository = {
  getAll: () => listPublicArtworkRecords(),
  getPublicAll: () => listPublicArtworkRecords(),
  getPublicFeatured: () => listPublicArtworkRecords({ featuredOnly: true }),
  getBySlug: findPublicArtworkRecordBySlug,
  getPublicBySlug: findPublicArtworkRecordBySlug,
};