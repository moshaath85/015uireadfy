import { cookies } from 'next/headers';
import type { Language } from './language';

const COOKIE_NAME = 'gallery-lang';

export async function getServerLanguage(): Promise<Language> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (cookie?.value === 'ar') return 'ar';
  } catch {
    // cookies() may not be available in all contexts
  }
  return 'en';
}

export function getText(arText: string | null | undefined, enText: string | null | undefined, lang: Language): string {
  if (lang === 'ar' && arText) return arText;
  return enText ?? '';
}
