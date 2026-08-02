import {
  findPublicExhibitionExperienceQueryRecord,
  listPublicExhibitionRecords,
} from '@/lib/cms/production-prisma';
import { createExhibitionExperienceData } from '@/lib/experience/exhibition-experience';

export const exhibitionsRepository = {
  getAll: () => listPublicExhibitionRecords(),
  getPublicAll: () => listPublicExhibitionRecords(),
  getPublicExperienceBySlug: async (slug: string) => {
    const record = await findPublicExhibitionExperienceQueryRecord(slug);
    return record ? createExhibitionExperienceData(record) : null;
  },
};
