"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { Cookie, ChevronDown, ChevronUp } from "lucide-react";

interface CookiePrefs {
  necessary: true;
  analytics: boolean;
  advertising: boolean;
  functional: boolean;
  timestamp: string;
}

const STORAGE_KEY = "nutrigenius-cookie-consent";

function Toggle({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => !disabled && onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        enabled ? "bg-[#00685f]" : "bg-[#D1D5DB]"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          enabled ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function CookieConsent() {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState({
    analytics: true,
    advertising: true,
    functional: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const timer = setTimeout(() => setShow(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Expose a function for the "Cookie Settings" footer link
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__nutrigenius_openCookieSettings = () => {
      setExpanded(false);
      setShow(true);
    };
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__nutrigenius_openCookieSettings;
    };
  }, []);

  function save(analytics: boolean, advertising: boolean, functional: boolean) {
    const consent: CookiePrefs = {
      necessary: true,
      analytics,
      advertising,
      functional,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-full max-w-[360px] animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-2xl shadow-xl shadow-black/10 overflow-hidden ring-1 ring-black/5">
        {/* Card header */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#00685f]/10 flex items-center justify-center flex-shrink-0">
              <Cookie className="w-4 h-4 text-[#00685f]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1a2332] leading-snug">Cookie Preferences</p>
              <p className="text-xs text-[#5a6578] mt-0.5 leading-snug">
                {t("cookies.message")}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => save(false, false, false)}
              className="flex-1 px-3 py-2 text-xs font-medium text-[#5a6578] bg-[#f0f3ff] hover:bg-[#e5e8f5] rounded-xl transition-colors"
            >
              {t("cookies.rejectNonEssential")}
            </button>
            <button
              onClick={() => save(true, true, true)}
              className="flex-1 px-3 py-2 text-xs font-semibold bg-[#00685f] hover:bg-[#005249] text-white rounded-xl transition-colors"
            >
              {t("cookies.acceptAll")}
            </button>
          </div>

          {/* Customize toggle */}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center justify-center gap-1 w-full mt-2 py-1.5 text-xs font-medium text-[#5a6578] hover:text-[#1a2332] transition-colors"
          >
            {t("cookies.customize")}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Expanded customize panel */}
        {expanded && (
          <div className="border-t border-[#f0f3ff] bg-[#f9f9ff] px-5 py-4">
            <div className="space-y-2 mb-4">
              {/* Necessary — always on */}
              <div className="flex items-center justify-between gap-3 bg-white rounded-xl px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#1a2332]">{t("cookies.necessary")}</p>
                  <p className="text-[11px] text-[#5a6578] leading-snug mt-0.5">{t("cookies.necessaryDesc")}</p>
                </div>
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                  <Toggle enabled={true} onChange={() => {}} disabled />
                  <span className="text-[10px] text-[#00685f] font-medium">{t("cookies.alwaysOn")}</span>
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between gap-3 bg-white rounded-xl px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#1a2332]">{t("cookies.analytics")}</p>
                  <p className="text-[11px] text-[#5a6578] leading-snug mt-0.5">{t("cookies.analyticsDesc")}</p>
                </div>
                <Toggle enabled={prefs.analytics} onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))} />
              </div>

              {/* Advertising */}
              <div className="flex items-center justify-between gap-3 bg-white rounded-xl px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#1a2332]">{t("cookies.advertising")}</p>
                  <p className="text-[11px] text-[#5a6578] leading-snug mt-0.5">{t("cookies.advertisingDesc")}</p>
                </div>
                <Toggle enabled={prefs.advertising} onChange={(v) => setPrefs((p) => ({ ...p, advertising: v }))} />
              </div>

              {/* Functional */}
              <div className="flex items-center justify-between gap-3 bg-white rounded-xl px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#1a2332]">{t("cookies.functional")}</p>
                  <p className="text-[11px] text-[#5a6578] leading-snug mt-0.5">{t("cookies.functionalDesc")}</p>
                </div>
                <Toggle enabled={prefs.functional} onChange={(v) => setPrefs((p) => ({ ...p, functional: v }))} />
              </div>
            </div>

            <button
              onClick={() => save(prefs.analytics, prefs.advertising, prefs.functional)}
              className="w-full px-4 py-2 text-xs font-semibold bg-[#00685f] hover:bg-[#005249] text-white rounded-xl transition-colors"
            >
              {t("cookies.savePreferences")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Drop this anywhere in a footer to reopen the cookie settings panel. */
export function CookieSettingsLink({
  className,
}: {
  className?: string;
}) {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      onClick={() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fn = (window as any).__nutrigenius_openCookieSettings;
        if (typeof fn === "function") fn();
      }}
      className={className}
    >
      {t("cookies.cookieSettings")}
    </button>
  );
}
