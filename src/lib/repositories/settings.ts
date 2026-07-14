import { getSettingsRecord } from "@/lib/cms/production-prisma";

export const settingsRepository = {
  getSiteSettings: () => getSettingsRecord(),
};