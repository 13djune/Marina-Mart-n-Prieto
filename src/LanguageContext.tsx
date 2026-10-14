import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: <T = string>(es: T, en: T) => T;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('es');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  const t = <T = string>(es: T, en: T): T => (lang === 'es' ? es : en);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
