import {
  findPublicProjectExperienceQueryRecord,
  listPublicProjectRecords,
} from '@/lib/cms/production-prisma';
import { createProjectExperienceData } from '@/lib/experience/project-experience';

export const projectsRepository = {
  getAll: () => listPublicProjectRecords(),
  getPublicAll: () => listPublicProjectRecords(),
  getPublicExperienceBySlug: async (slug: string) => {
    const record = await findPublicProjectExperienceQueryRecord(slug);
    return record ? createProjectExperienceData(record) : null;
  },
};
