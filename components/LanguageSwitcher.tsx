"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage, type LanguageCode } from "@/lib/language-context";

const LANGUAGES: {
  code: LanguageCode;
  flagCode: string;
  nativeName: string;
  shortCode: string;
}[] = [
  { code: "en", flagCode: "gb", nativeName: "English", shortCode: "EN" },
  { code: "de", flagCode: "de", nativeName: "Deutsch", shortCode: "DE" },
  { code: "es", flagCode: "es", nativeName: "Español", shortCode: "ES" },
  { code: "fr", flagCode: "fr", nativeName: "Français", shortCode: "FR" },
  { code: "tr", flagCode: "tr", nativeName: "Türkçe", shortCode: "TR" },
  { code: "ar", flagCode: "sa", nativeName: "العربية", shortCode: "AR" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm font-medium text-[#5A6578] hover:text-[#1A2332] transition-colors px-2 py-1.5 rounded-lg hover:bg-[#F1F5F9]"
        aria-label="Switch language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <img
          src={`https://flagcdn.com/24x18/${current.flagCode}.png`}
          width={20}
          height={20}
          className="rounded-full object-cover"
          alt=""
        />
        <span className="hidden sm:inline">{current.shortCode}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute top-full mt-1 right-0 bg-white rounded-xl shadow-lg shadow-black/10 z-[100] min-w-[160px] py-1 overflow-hidden ring-1 ring-black/[0.04]"
          role="listbox"
          aria-label="Language options"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={lang.code === language}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                lang.code === language
                  ? "bg-[#e6f4f3] text-[#00685f] font-medium"
                  : "text-[#3D4B5F] hover:bg-[#f0f3ff] font-normal"
              }`}
            >
              <img
                src={`https://flagcdn.com/24x18/${lang.flagCode}.png`}
                width={20}
                height={20}
                className="rounded-full object-cover flex-shrink-0"
                alt=""
              />
              <span>{lang.nativeName}</span>
              {lang.code === language && (
                <span className="ms-auto w-2 h-2 rounded-full bg-[#00685f]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
