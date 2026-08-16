import type { Language } from './language';

/* The language is switched client-side by LanguageProvider after hydration,
   so the server render does not need to read the cookie. Returning 'en' here
   keeps every page statically renderable/cacheable (no dynamic cookies()
   call), which removes the ~5s server TTFB on the serverless host. The client
   corrects the language to Arabic immediately on load when the cookie is set. */
export async function getServerLanguage(): Promise<Language> {
  return 'en';
}

export function getText(arText: string | null | undefined, enText: string | null | undefined, lang: Language): string {
  if (lang === 'ar' && arText) return arText;
  return enText ?? '';
}
