import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  detectLanguage,
  LanguageContext,
  translations,
  type Language,
  type LanguageContextValue,
} from "./language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(detectLanguage);

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, values = {}) =>
        Object.entries(values).reduce(
          (message, [name, replacement]) => message.replace(`{${name}}`, replacement),
          translations[language][key] as string,
        ),
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}