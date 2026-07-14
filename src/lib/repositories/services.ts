import { listPublicServiceRecords } from "@/lib/cms/production-prisma";

export const servicesRepository = {
  getAll: () => listPublicServiceRecords(),
  getPublicAll: () => listPublicServiceRecords(),
};