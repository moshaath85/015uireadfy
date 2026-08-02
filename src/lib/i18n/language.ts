export type Language = 'en' | 'ar';

const COOKIE_NAME = 'gallery-lang';

export function getLanguage(): Language {
  if (typeof document === 'undefined') return 'en';
  const cookie = document.cookie.split(';').find(c => c.trim().startsWith(COOKIE_NAME + '='));
  if (cookie) {
    const val = cookie.split('=')[1]?.trim();
    if (val === 'ar') return 'ar';
  }
  if (typeof navigator !== 'undefined' && navigator.language?.startsWith('ar')) return 'ar';
  return 'en';
}

export function setLanguage(lang: Language): void {
  document.cookie = `${COOKIE_NAME}=${lang};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

export function getText(arText: string | null | undefined, enText: string | null | undefined, lang: Language): string {
  if (lang === 'ar' && arText) return arText;
  return enText ?? '';
}
