import {
  findPublicCollectionExperienceQueryRecord,
  listPublicCollectionRecords,
} from '@/lib/cms/production-prisma';
import { createCollectionExperienceData } from '@/lib/experience/collection-experience';

export const collectionsRepository = {
  getAll: () => listPublicCollectionRecords(),
  getPublicAll: () => listPublicCollectionRecords(),
  getPublicExperienceBySlug: async (slug: string) => {
    const record = await findPublicCollectionExperienceQueryRecord(slug);
    return record ? createCollectionExperienceData(record) : null;
  },
};
