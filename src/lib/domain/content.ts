export type LocaleCode = "en" | "ar";

export interface BilingualText {
  readonly en: string;
  readonly ar: string;
}

export interface OptionalBilingualText {
  readonly en?: string;
  readonly ar?: string;
}

export interface BilingualTitle {
  readonly title_en: string;
  readonly title_ar: string;
}

export interface BilingualDescription {
  readonly description_en: string;
  readonly description_ar: string;
}

export interface BilingualContent {
  readonly content_en: string;
  readonly content_ar: string;
}

export interface BilingualExcerpt {
  readonly excerpt_en: string;
  readonly excerpt_ar: string;
}

export interface BilingualAltText {
  readonly alt_en: string;
  readonly alt_ar: string;
}

export interface BilingualLabel {
  readonly label_en: string;
  readonly label_ar: string;
}