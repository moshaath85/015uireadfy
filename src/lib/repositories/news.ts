import { listPublicNewsRecords } from "@/lib/cms/production-prisma";

export const newsRepository = {
  getAll: () => listPublicNewsRecords(),
  getPublicAll: () => listPublicNewsRecords(),
};