"use client";

import { useEffect, useRef, useState } from "react";

const PUBLISHER_ID = "ca-pub-1364229532852275";
const CONSENT_KEY = "nutrigenius-cookie-consent";

interface AdSenseProps {
  slot: string;
  format?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function AdSense({ slot, format = "auto", responsive = true, style, className }: AdSenseProps) {
  const pushed = useRef(false);
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) return;
      const prefs = JSON.parse(stored) as { advertising?: boolean };
      if (prefs.advertising) setConsented(true);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!consented || pushed.current) return;
    pushed.current = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // ad blocker or script not yet loaded — silently ignore
    }
  }, [consented]);

  if (!consented) return null;

  return (
    <ins
      className={`adsbygoogle${className ? ` ${className}` : ""}`}
      style={{ display: "block", overflow: "hidden", ...style }}
      data-ad-client={PUBLISHER_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
}
