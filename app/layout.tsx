import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import CookieConsent from "@/components/CookieConsent";
// AdSense disabled site-wide until Google AdSense approval is granted.
// import { AdSenseLoader } from "@/components/AdSenseLoader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const BASE_URL = "https://www.nutrigenius.co";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "NutriGenius — Free Personalized Supplement Recommendations | Evidence-Based",
    template: "%s | NutriGenius",
  },
  description:
    "Get a free, science-backed supplement plan in 5 minutes. Our 7-layer algorithm checks drug interactions, adjusts for your diet, lifestyle, genetics, and lab values. Designed by clinical pharmacology experts.",
  keywords: [
    "supplements",
    "personalized nutrition",
    "evidence-based supplements",
    "drug interactions",
    "supplement recommendations",
    "vitamin protocol",
    "health optimization",
    "free supplement plan",
  ],
  authors: [{ name: "NutriGenius Clinical Team" }],
  creator: "NutriGenius",
  publisher: "NutriGenius",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "NutriGenius — Your Supplements, Backed by Science",
    description:
      "Free personalized supplement protocol with drug interaction checks, evidence ratings, and a visual weekly schedule.",
    type: "website",
    url: BASE_URL,
    siteName: "NutriGenius",
    locale: "en_US",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "NutriGenius — Free Personalized Supplement Recommendations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NutriGenius — Your Supplements, Backed by Science",
    description:
      "Free personalized supplement protocol with drug interaction checks, evidence ratings, and a visual weekly schedule.",
    site: "@nutrigenius",
    creator: "@nutrigenius",
    images: [`${BASE_URL}/og-image.png`],
  },
  verification: {
    google: "XkM03ceUSDUrlh0R3aMUTnuIqScm6Kc4U5jD7-Xk_qo",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://eemzruagujvgrioxyuxm.supabase.co" />
        <link rel="dns-prefetch" href="https://eemzruagujvgrioxyuxm.supabase.co" />
      </head>
      <body
        className={`${inter.variable} ${plusJakarta.variable} font-sans antialiased`}
      >
        {children}
        <CookieConsent />
        {/* <AdSenseLoader /> — disabled site-wide until AdSense approval is granted */}
      </body>
    </html>
  );
}
