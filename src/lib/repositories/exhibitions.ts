import { listPublicExhibitionRecords } from "@/lib/cms/production-prisma";

export const exhibitionsRepository = {
  getAll: () => listPublicExhibitionRecords(),
  getPublicAll: () => listPublicExhibitionRecords(),
};