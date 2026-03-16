import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "NutriGenius — Evidence-Based Supplement Recommendations",
  description:
    "Get a personalized supplement protocol backed by science. Drug interaction checks, evidence ratings, and a visual weekly schedule — designed by a Medical Director.",
  keywords: [
    "supplements",
    "personalized nutrition",
    "evidence-based supplements",
    "drug interactions",
    "supplement recommendations",
    "vitamin protocol",
    "health optimization",
  ],
  openGraph: {
    title: "NutriGenius — Evidence-Based Supplement Recommendations",
    description:
      "Get a personalized supplement protocol backed by science. Free, clinician-designed, and safety-checked.",
    type: "website",
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
        {children}
      </body>
    </html>
  );
}
