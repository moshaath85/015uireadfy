import {
  findPublicArtworkExperienceQueryRecord,
  findPublicArtworkRecordBySlug,
  listPublicArtworkRecords,
} from "@/lib/cms/production-prisma";
import { createArtworkExperienceData } from "@/lib/experience/artwork-experience";

export const artworksRepository = {
  getAll: () => listPublicArtworkRecords(),
  getPublicAll: () => listPublicArtworkRecords(),
  getPublicFeatured: () => listPublicArtworkRecords({ featuredOnly: true }),
  getBySlug: findPublicArtworkRecordBySlug,
  getPublicBySlug: findPublicArtworkRecordBySlug,
  getPublicExperienceBySlug: async (slug: string) => {
    const record = await findPublicArtworkExperienceQueryRecord(slug);
    return record ? createArtworkExperienceData(record) : null;
  },
};
