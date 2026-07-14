import type { Tex7LocaleIdentity } from "./localization-types";

export interface Tex7LocalizationModuleConfig {
  locales: Tex7LocaleIdentity[];
  defaultLocaleCode: string;
  requireStrictMonolingualPublicPages: boolean;
  allowDuplicateEntityPerLocale: false;
}

export const TEX7_GALLERY_015_DEFAULT_LOCALES: Tex7LocaleIdentity[] = [
  {
    code: "ar",
    language: "Arabic",
    direction: "rtl",
    enabled: true,
    isDefault: true,
    fallbackPolicy: {
      mode: "none",
      allowPublicFallback: false,
    },
  },
  {
    code: "en",
    language: "English",
    direction: "ltr",
    enabled: true,
    isDefault: false,
    fallbackPolicy: {
      mode: "configured_locale",
      fallbackLocaleCode: "ar",
      allowPublicFallback: false,
    },
  },
];

export const TEX7_GALLERY_015_LOCALIZATION_CONFIG: Tex7LocalizationModuleConfig =
  {
    locales: TEX7_GALLERY_015_DEFAULT_LOCALES,
    defaultLocaleCode: "ar",
    requireStrictMonolingualPublicPages: true,
    allowDuplicateEntityPerLocale: false,
  };

export function getTex7DefaultLocale(
  config: Tex7LocalizationModuleConfig,
): Tex7LocaleIdentity {
  const locale = config.locales.find((item) => item.isDefault);

  if (!locale) {
    throw new Error("TEX7 localization config requires one default locale.");
  }

  return locale;
}

export function getTex7EnabledLocales(
  config: Tex7LocalizationModuleConfig,
): Tex7LocaleIdentity[] {
  return config.locales.filter((locale) => locale.enabled);
}

export function findTex7Locale(
  config: Tex7LocalizationModuleConfig,
  localeCode: string,
): Tex7LocaleIdentity | undefined {
  return config.locales.find((locale) => locale.code === localeCode);
}