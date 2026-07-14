import { listPublicProjectRecords } from "@/lib/cms/production-prisma";

export const projectsRepository = {
  getAll: () => listPublicProjectRecords(),
  getPublicAll: () => listPublicProjectRecords(),
};