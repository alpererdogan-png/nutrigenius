import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Health Assessment — NutriGenius",
  description:
    "Complete a 5-minute health assessment to receive your personalized supplement protocol. We analyze your demographics, diet, lifestyle, conditions, and medications.",
  alternates: {
    canonical: "https://www.nutrigenius.co/quiz",
  },
  openGraph: {
    title: "Health Assessment — NutriGenius",
    description:
      "Complete a 5-minute health assessment to receive your personalized supplement protocol. We analyze your demographics, diet, lifestyle, conditions, and medications.",
    type: "website",
    url: "https://www.nutrigenius.co/quiz",
    siteName: "NutriGenius",
  },
  twitter: {
    card: "summary_large_image",
    title: "Health Assessment — NutriGenius",
    description:
      "Complete a 5-minute health assessment to receive your personalized supplement protocol.",
  },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
