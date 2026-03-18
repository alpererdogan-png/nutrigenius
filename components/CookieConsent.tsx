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
        enabled ? "bg-[#0D9488]" : "bg-[#D1D5DB]"
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
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-[#1A2332] border-t border-[#2D3748] shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          {/* Main row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            {/* Icon + message */}
            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
              <Cookie className="w-4 h-4 text-[#0D9488] flex-shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-sm text-[#CBD5E1] leading-snug">
                {t("cookies.message")}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setExpanded((e) => !e)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-white border border-[#2D3748] hover:border-[#475569] rounded-lg transition-colors"
              >
                {t("cookies.customize")}
                {expanded ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
              <button
                onClick={() => save(false, false, false)}
                className="px-3 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-white border border-[#2D3748] hover:border-[#475569] rounded-lg transition-colors"
              >
                {t("cookies.rejectNonEssential")}
              </button>
              <button
                onClick={() => save(true, true, true)}
                className="px-4 py-1.5 text-xs font-semibold bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
              >
                {t("cookies.acceptAll")}
              </button>
            </div>
          </div>

          {/* Expanded customize panel */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-[#2D3748]">
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                {/* Necessary — always on */}
                <div className="flex items-start justify-between gap-3 bg-[#243044] rounded-xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {t("cookies.necessary")}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-0.5 leading-snug">
                      {t("cookies.necessaryDesc")}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-1 mt-0.5">
                    <Toggle enabled={true} onChange={() => {}} disabled />
                    <span className="text-[10px] text-[#0D9488] font-medium">
                      {t("cookies.alwaysOn")}
                    </span>
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-start justify-between gap-3 bg-[#243044] rounded-xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {t("cookies.analytics")}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-0.5 leading-snug">
                      {t("cookies.analyticsDesc")}
                    </p>
                  </div>
                  <div className="flex-shrink-0 mt-0.5">
                    <Toggle
                      enabled={prefs.analytics}
                      onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
                    />
                  </div>
                </div>

                {/* Advertising */}
                <div className="flex items-start justify-between gap-3 bg-[#243044] rounded-xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {t("cookies.advertising")}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-0.5 leading-snug">
                      {t("cookies.advertisingDesc")}
                    </p>
                  </div>
                  <div className="flex-shrink-0 mt-0.5">
                    <Toggle
                      enabled={prefs.advertising}
                      onChange={(v) =>
                        setPrefs((p) => ({ ...p, advertising: v }))
                      }
                    />
                  </div>
                </div>

                {/* Functional */}
                <div className="flex items-start justify-between gap-3 bg-[#243044] rounded-xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {t("cookies.functional")}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-0.5 leading-snug">
                      {t("cookies.functionalDesc")}
                    </p>
                  </div>
                  <div className="flex-shrink-0 mt-0.5">
                    <Toggle
                      enabled={prefs.functional}
                      onChange={(v) =>
                        setPrefs((p) => ({ ...p, functional: v }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() =>
                    save(prefs.analytics, prefs.advertising, prefs.functional)
                  }
                  className="px-5 py-2 text-sm font-semibold bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors"
                >
                  {t("cookies.savePreferences")}
                </button>
              </div>
            </div>
          )}
        </div>
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
