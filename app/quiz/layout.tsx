import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Health Assessment Quiz — Get Your Free Plan",
  description:
    "Complete our 5-minute health assessment to receive personalized supplement recommendations with safety checks and evidence ratings.",
  alternates: {
    canonical: "https://nutrigenius-iota.vercel.app/quiz",
  },
  openGraph: {
    title: "Health Assessment Quiz | NutriGenius — Get Your Free Plan",
    description:
      "Complete our 5-minute health assessment to receive personalized supplement recommendations with safety checks and evidence ratings.",
    type: "website",
    url: "https://nutrigenius-iota.vercel.app/quiz",
    siteName: "NutriGenius",
  },
  twitter: {
    card: "summary_large_image",
    title: "Health Assessment Quiz | NutriGenius",
    description:
      "Complete our 5-minute health assessment to receive personalized supplement recommendations with safety checks and evidence ratings.",
  },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
