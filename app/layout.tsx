import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const BASE_URL = "https://nutrigenius-iota.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "NutriGenius — Free Personalized Supplement Recommendations | Evidence-Based",
    template: "%s | NutriGenius",
  },
  description:
    "Get a free personalized supplement plan backed by science. Drug interaction checks, evidence ratings, and a visual weekly schedule. Designed by clinical pharmacology experts.",
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
    title: "NutriGenius — Free Personalized Supplement Recommendations",
    description:
      "Get a free personalized supplement plan backed by science. Drug interaction checks, evidence ratings, and a visual weekly schedule.",
    type: "website",
    url: BASE_URL,
    siteName: "NutriGenius",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NutriGenius — Free Personalized Supplement Recommendations",
    description:
      "Get a free personalized supplement plan backed by science. Drug interaction checks, evidence ratings, and a visual weekly schedule.",
    site: "@nutrigenius",
    creator: "@nutrigenius",
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
      <body
        className={`${dmSans.variable} ${plusJakarta.variable} font-sans antialiased`}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
