import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck, FlaskConical, Brain, HeartPulse,
  Scale, Pill, Dna, Sun, ArrowRight,
} from "lucide-react";
import { Logo } from "@/src/components/ui/Logo";

export const metadata: Metadata = {
  title: "Methodology — How NutriGenius Works",
  description:
    "Our 7-layer clinical algorithm, evidence standards, drug interaction screening, and safety layers explained. Reviewed by Dr. Esra Ata Erdogan, MD.",
  alternates: {
    canonical: "https://www.nutrigenius.co/methodology",
  },
};

const LAYERS = [
  {
    icon: <HeartPulse className="w-5 h-5" />,
    title: "Health Goals & Conditions",
    description:
      "Your health goals, diagnosed conditions, and symptom patterns determine which supplements enter the candidate pool. Recommendations are mapped to published clinical evidence for each condition.",
  },
  {
    icon: <Pill className="w-5 h-5" />,
    title: "Drug Interaction Screening",
    description:
      "Every candidate supplement is screened against your current medications for clinically significant interactions. Supplements with critical interactions (e.g., St. John's Wort + SSRIs, fish oil + anticoagulants) are automatically blocked.",
  },
  {
    icon: <Scale className="w-5 h-5" />,
    title: "Dietary Pattern Analysis",
    description:
      "Your diet type (omnivore, vegetarian, vegan, keto, etc.) determines baseline nutrient gaps. For example, vegans are flagged for B12, algae omega-3, and iodine; keto dieters for electrolytes and fibre.",
  },
  {
    icon: <Sun className="w-5 h-5" />,
    title: "Lifestyle Adjustments",
    description:
      "Sleep quality, stress levels, exercise intensity, sun exposure, and alcohol intake all influence nutrient requirements. An athlete training >5 hours/week has different magnesium and electrolyte needs than a sedentary individual.",
  },
  {
    icon: <Dna className="w-5 h-5" />,
    title: "Age, Sex & Life Stage",
    description:
      "Recommendations are adjusted for biological sex, age bracket, and life stage. Pregnancy and breastfeeding trigger strict safety filters. Post-menopausal women receive calcium/D3/K2 prioritisation.",
  },
  {
    icon: <FlaskConical className="w-5 h-5" />,
    title: "Lab Values & Biomarkers",
    description:
      "If you provide lab results (vitamin D, ferritin, B12, etc.), the algorithm adjusts doses based on your actual levels rather than population averages. This is the most precise personalisation layer.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Evidence Rating & Safety Validation",
    description:
      "Every final recommendation includes an evidence rating (Strong, Moderate, Emerging) based on the quality and quantity of supporting clinical trials. Doses are capped at established Upper Tolerable Intake Levels (ULs).",
  },
];

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      {/* Header */}
      <header className="bg-white shadow-sm shadow-black/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity duration-200">
            <Logo size="sm" variant="light" />
          </Link>
          <Link
            href="/"
            className="text-sm text-[#5A6578] hover:text-[#00685f] transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-[#e6f4f3] text-[#00685f] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Brain className="w-3.5 h-3.5" />
            Our Methodology
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A2332] mb-4">
            How NutriGenius Builds Your Protocol
          </h1>
          <p className="text-[#5A6578] text-lg leading-relaxed max-w-2xl mb-3">
            A transparent look at the 7-layer clinical algorithm that powers every personalised
            supplement recommendation.
          </p>
          <Link
            href="/about#medical-reviewer"
            className="inline-flex items-center gap-2 text-xs text-[#5A6578] bg-[#f0f9f8] border border-[#d1ede9] px-3 py-1.5 rounded-full hover:bg-[#e6f4f3] transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#00685f]" />
            <span>Reviewed by <strong className="text-[#1A2332]">Dr. Esra Ata Erdogan, MD</strong></span>
          </Link>
        </div>

        {/* 7 Layers */}
        <div className="space-y-4 mb-12">
          {LAYERS.map((layer, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl ring-1 ring-black/[0.04] p-5 sm:p-6 flex gap-4"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-[#00685f] text-white flex items-center justify-center relative">
                  {layer.icon}
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#111c2c] text-white text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-[#1A2332] mb-1.5">
                  {layer.title}
                </h3>
                <p className="text-sm text-[#5A6578] leading-relaxed">{layer.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Evidence Standards */}
        <section className="bg-white rounded-2xl ring-1 ring-black/[0.04] p-6 sm:p-8 mb-8">
          <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-4">
            Evidence Standards
          </h2>
          <p className="text-[#5A6578] leading-relaxed mb-5">
            Every supplement recommendation includes a transparency rating based on the quality of
            supporting evidence:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-20 flex-shrink-0 text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                Strong
              </span>
              <p className="text-sm text-[#5A6578]">
                Multiple large RCTs, meta-analyses, or systematic reviews with consistent findings. Recommended by major clinical guidelines.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-20 flex-shrink-0 text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                Moderate
              </span>
              <p className="text-sm text-[#5A6578]">
                At least one well-designed RCT or multiple cohort studies with plausible mechanism. Benefit outweighs risk.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-20 flex-shrink-0 text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                Emerging
              </span>
              <p className="text-sm text-[#5A6578]">
                Preliminary human studies, animal data with strong mechanism, or traditional use with emerging clinical support. Disclosed transparently.
              </p>
            </div>
          </div>
        </section>

        {/* What We Don't Do */}
        <section className="bg-white rounded-2xl ring-1 ring-black/[0.04] p-6 sm:p-8 mb-8">
          <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-4">
            What We Don&apos;t Do
          </h2>
          <ul className="space-y-2 text-[#5A6578] text-sm leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-red-400 flex-shrink-0 mt-0.5">✕</span>
              We do not diagnose, treat, cure, or prevent any disease
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 flex-shrink-0 mt-0.5">✕</span>
              We do not replace professional medical advice or prescriptions
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 flex-shrink-0 mt-0.5">✕</span>
              We do not recommend supplements without published clinical evidence
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 flex-shrink-0 mt-0.5">✕</span>
              We do not sell supplements — our recommendations are brand-agnostic
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-[#00685f] to-[#008577] rounded-2xl p-6 sm:p-8 text-center">
          <h2 className="font-heading text-xl font-bold text-white mb-2">
            See the algorithm in action
          </h2>
          <p className="text-white/80 text-sm sm:text-base mb-5 max-w-lg mx-auto">
            Take our free 5-minute assessment and receive a personalised supplement protocol with full evidence transparency.
          </p>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 bg-white text-[#00685f] font-semibold text-sm sm:text-base px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
          >
            Take the free assessment <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* Footer nav */}
        <div className="border-t border-[#E8ECF1] pt-8 mt-10 flex flex-wrap gap-4 text-sm text-[#8896A8]">
          <Link href="/about" className="hover:text-[#00685f] transition-colors">About</Link>
          <Link href="/disclaimer" className="hover:text-[#00685f] transition-colors">Medical Disclaimer</Link>
          <Link href="/contact" className="hover:text-[#00685f] transition-colors">Contact</Link>
          <Link href="/" className="hover:text-[#00685f] transition-colors ml-auto">← Back to NutriGenius</Link>
        </div>
      </main>
    </div>
  );
}
