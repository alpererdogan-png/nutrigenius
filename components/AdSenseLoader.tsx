"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ADSENSE_SCRIPT_ID = "adsense-script";
const PUBLISHER_ID = "ca-pub-1364229532852275";
const CONSENT_KEY = "nutrigenius-cookie-consent";

/**
 * Injects the AdSense script only after advertising cookies are accepted
 * AND only on blog routes (`/blog`, `/blog/*`). This prevents Google Auto Ads
 * from injecting "Advertisement" placeholders on the homepage, quiz flow,
 * or any non-article page.
 */
export function AdSenseLoader() {
  const pathname = usePathname();
  const isBlogRoute =
    pathname === "/blog" || (pathname?.startsWith("/blog/") ?? false);

  useEffect(() => {
    if (!isBlogRoute) return;

    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) return;
      const prefs = JSON.parse(stored) as { advertising?: boolean };
      if (!prefs.advertising) return;
    } catch {
      return;
    }

    if (document.getElementById(ADSENSE_SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLISHER_ID}`;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      // Push any adsbygoogle units injected via HTML (e.g., inline article ads)
      document
        .querySelectorAll<HTMLElement>(".adsbygoogle:not([data-adsbygoogle-status])")
        .forEach(() => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          } catch {
            // ignore
          }
        });
    };
    document.head.appendChild(script);
  }, [isBlogRoute]);

  return null;
}
