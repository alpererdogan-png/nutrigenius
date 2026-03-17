"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import en from "@/translations/en.json";
import de from "@/translations/de.json";
import es from "@/translations/es.json";
import fr from "@/translations/fr.json";
import tr from "@/translations/tr.json";
import ar from "@/translations/ar.json";

export type LanguageCode = "en" | "de" | "es" | "fr" | "tr" | "ar";

const TRANSLATIONS: Record<LanguageCode, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  de: de as Record<string, unknown>,
  es: es as Record<string, unknown>,
  fr: fr as Record<string, unknown>,
  tr: tr as Record<string, unknown>,
  ar: ar as Record<string, unknown>,
};

const BROWSER_LANG_MAP: Record<string, LanguageCode> = {
  en: "en",
  de: "de",
  es: "es",
  fr: "fr",
  tr: "tr",
  ar: "ar",
};

function detectBrowserLanguage(): LanguageCode {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language?.split("-")[0]?.toLowerCase();
  return BROWSER_LANG_MAP[lang] ?? "en";
}

function getNestedValue(obj: Record<string, unknown>, key: string): string {
  const parts = key.split(".");
  let value: unknown = obj;
  for (const part of parts) {
    if (value === null || value === undefined || typeof value !== "object") return key;
    value = (value as Record<string, unknown>)[part];
  }
  return typeof value === "string" ? value : key;
}

type LanguageContextType = {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: string, params?: Record<string, string>) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [mounted, setMounted] = useState(false);

  // On mount: read from localStorage or detect from browser
  useEffect(() => {
    const stored = localStorage.getItem("nutrigenius-lang") as LanguageCode | null;
    if (stored && TRANSLATIONS[stored]) {
      setLanguageState(stored);
    } else {
      const detected = detectBrowserLanguage();
      setLanguageState(detected);
    }
    setMounted(true);
  }, []);

  // Update document dir and lang when language changes
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language, mounted]);

  const setLanguage = (code: LanguageCode) => {
    setLanguageState(code);
    localStorage.setItem("nutrigenius-lang", code);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const translations = TRANSLATIONS[language] ?? TRANSLATIONS.en;
    let result = getNestedValue(translations, key);
    // Fallback to English if key not found in current language
    if (result === key && language !== "en") {
      result = getNestedValue(TRANSLATIONS.en, key);
    }
    if (params) {
      result = result.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
