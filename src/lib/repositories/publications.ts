import { listPublicPublicationRecords } from "@/lib/cms/production-prisma";

export const publicationsRepository = {
  getAll: () => listPublicPublicationRecords(),
  getPublicAll: () => listPublicPublicationRecords(),
};