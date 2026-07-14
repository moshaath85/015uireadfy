import { listPublicCollectionRecords } from "@/lib/cms/production-prisma";

export const collectionsRepository = {
  getAll: () => listPublicCollectionRecords(),
  getPublicAll: () => listPublicCollectionRecords(),
};