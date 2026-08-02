'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getLanguage, setLanguage, type Language } from '@/lib/i18n/language';

const LangCtx = createContext<{ lang: Language; switchLang: (l: Language) => void }>({
  lang: 'en',
  switchLang: () => {},
});

export function useLanguage() {
  return useContext(LangCtx);
}

export default function LanguageProvider({ children, initialLang }: { children: React.ReactNode; initialLang?: string }) {
  const [lang, setLang] = useState<Language>((initialLang === 'ar' ? 'ar' : 'en') as Language);

  useEffect(() => {
    const detected = getLanguage();
    if (detected !== lang) {
      setLang(detected);
      document.documentElement.lang = detected;
      document.documentElement.dir = detected === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const switchLang = (l: Language) => {
    setLang(l);
    setLanguage(l);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <LangCtx.Provider value={{ lang, switchLang }}>
      {children}
    </LangCtx.Provider>
  );
}
