import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck, FlaskConical, HeartPulse, Mail,
  GraduationCap, Award, Building2, ArrowRight,
} from "lucide-react";
import { Logo } from "@/src/components/ui/Logo";

export const metadata: Metadata = {
  title: "About — NutriGenius | Evidence-Based Supplement Guidance",
  description:
    "Meet the team behind NutriGenius. Our medical reviewer Dr. Esra Ata, MD, ensures all recommendations are grounded in clinical evidence and safety.",
  alternates: {
    canonical: "https://www.nutrigenius.co/about",
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Dr. Esra Ata",
  jobTitle: "Medical Reviewer",
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "Uludag University" },
    { "@type": "CollegeOrUniversity", name: "Istanbul University Cerrahpasa" },
  ],
  hasCredential: [
    { "@type": "EducationalOccupationalCredential", name: "Doctor of Medicine" },
    { "@type": "EducationalOccupationalCredential", name: "Functional Medicine Certification" },
    { "@type": "EducationalOccupationalCredential", name: "GAPS Protocol Certification" },
  ],
  worksFor: {
    "@type": "Organization",
    name: "NutriGenius",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

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

      {/* Hero with marble background */}
      <section className="relative overflow-hidden border-b border-[#E8ECF1]">
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/images/marble-abstract.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.18]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f9f9ff]/50 via-[#f9f9ff]/70 to-[#f9f9ff]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="inline-flex items-center gap-2 bg-[#e6f4f3] text-[#00685f] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <FlaskConical className="w-3.5 h-3.5" />
            About NutriGenius
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A2332] mb-4">
            Evidence-Based Nutritional Guidance
          </h1>
          <p className="text-[#5A6578] text-lg leading-relaxed max-w-2xl">
            NutriGenius is a health technology platform by Clareo Health, providing personalised,
            evidence-based supplement recommendations through a clinician-designed algorithm.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        {/* Our Mission */}
        <section className="bg-white rounded-2xl ring-1 ring-black/[0.04] p-6 sm:p-8 mb-8">
          <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-4">Our Mission</h2>
          <p className="text-[#5A6578] leading-relaxed mb-4">
            Most people take supplements based on marketing claims, social media trends, or
            well-meaning but uninformed advice. NutriGenius exists to change that. Our goal is to
            make personalised, evidence-based supplement guidance accessible to everyone — for free.
          </p>
          <p className="text-[#5A6578] leading-relaxed">
            Every recommendation is grounded in published clinical trials, peer-reviewed research,
            and established safety standards. We believe supplement decisions should be informed by
            the same rigour applied to pharmaceutical prescriptions.
          </p>
        </section>

        {/* Medical Reviewer */}
        <section id="medical-reviewer" className="bg-white rounded-2xl ring-1 ring-black/[0.04] p-6 sm:p-8 mb-8 scroll-mt-20">
          <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-6">
            Meet Our Medical Reviewer
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
            {/* Photo */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="relative w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] rounded-full overflow-hidden ring-4 ring-[#f9f9ff] shadow-[0_8px_24px_-4px_rgba(0,104,95,0.18)] outline outline-1 outline-[#00685f]/15">
                <Image
                  src="/images/dr-esra-ata.jpg"
                  alt="Dr. Esra Ata, MD — Medical Reviewer at NutriGenius"
                  fill
                  sizes="(max-width: 640px) 150px, 200px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-lg font-bold text-[#1A2332] mb-1">
                Dr. Esra Ata, MD
              </h3>
              <p className="text-sm text-[#00685f] font-semibold mb-3">
                Physician · Functional Medicine Certified · GAPS Certified
              </p>
              <p className="text-[#5A6578] leading-relaxed mb-4">
                Dr. Esra Ata earned her medical degree from Uludag University and pursued
                postgraduate medical education at Istanbul University&apos;s Cerrahpasa Faculty of
                Medicine. She is certified in Functional Medicine and the GAPS (Gut and Psychology
                Syndrome) Protocol. At NutriGenius, Dr. Ata oversees medical content review
                and ensures all recommendations are grounded in clinical evidence and safety.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 text-xs text-[#5A6578] bg-[#f0f3ff] px-2.5 py-1.5 rounded-full">
                  <GraduationCap className="w-3.5 h-3.5 text-[#00685f]" />
                  Uludag University
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#5A6578] bg-[#f0f3ff] px-2.5 py-1.5 rounded-full">
                  <GraduationCap className="w-3.5 h-3.5 text-[#00685f]" />
                  Istanbul University Cerrahpasa
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#5A6578] bg-[#f0f3ff] px-2.5 py-1.5 rounded-full">
                  <Award className="w-3.5 h-3.5 text-[#00685f]" />
                  Functional Medicine
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#5A6578] bg-[#f0f3ff] px-2.5 py-1.5 rounded-full">
                  <Award className="w-3.5 h-3.5 text-[#00685f]" />
                  GAPS Protocol
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Science Behind NutriGenius */}
        <section className="relative bg-white rounded-2xl ring-1 ring-black/[0.04] p-6 sm:p-8 mb-8 overflow-hidden">
          <div className="hidden md:block absolute top-0 right-0 w-40 h-40 rounded-bl-[6rem] overflow-hidden opacity-70">
            <Image
              src="/images/lab-science.jpg"
              alt=""
              fill
              sizes="160px"
              loading="lazy"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-bl from-transparent to-white/70" />
          </div>
          <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-4 relative">
            The Science Behind NutriGenius
          </h2>
          <p className="text-[#5A6578] leading-relaxed mb-5 relative">
            Our 7-layer recommendation algorithm analyses your health profile across multiple
            dimensions to generate a personalised supplement protocol:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Health goals and current conditions",
              "Existing medications and drug interactions",
              "Dietary pattern and nutrient gaps",
              "Lifestyle factors (sleep, stress, exercise)",
              "Age, sex, and life stage adjustments",
              "Lab values and biomarker context",
              "Evidence ratings and clinical confidence levels",
            ].map((layer, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#f9f9ff] rounded-xl px-4 py-3">
                <div className="w-6 h-6 rounded-full bg-[#00685f] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <span className="text-sm text-[#5A6578]">{layer}</span>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <Link
              href="/methodology"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00685f] hover:text-[#005249] transition-colors"
            >
              Read our full methodology <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Clinical Safety */}
        <section className="bg-white rounded-2xl ring-1 ring-black/[0.04] p-6 sm:p-8 mb-8">
          <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-4">
            Clinical Safety
          </h2>
          <p className="text-[#5A6578] leading-relaxed mb-5">
            Every recommendation passes through multiple safety layers before it reaches you:
          </p>
          <div className="space-y-3">
            {[
              { icon: <ShieldCheck className="w-4 h-4" />, text: "Drug interaction screening against a comprehensive pharmaceutical database" },
              { icon: <HeartPulse className="w-4 h-4" />, text: "Pregnancy and breastfeeding safety restrictions strictly enforced" },
              { icon: <FlaskConical className="w-4 h-4" />, text: "Doses never exceed established Upper Tolerable Intake Levels (ULs)" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#e6f4f3] flex items-center justify-center flex-shrink-0 text-[#00685f]">
                  {item.icon}
                </div>
                <span className="text-[#5A6578] text-sm leading-relaxed pt-1">{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Part of Clareo Health */}
        <section className="bg-[#111c2c] rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-5 h-5 text-teal-400" />
            <h2 className="font-heading text-xl font-bold text-white">Part of Clareo Health</h2>
          </div>
          <p className="text-slate-300 leading-relaxed mb-4">
            NutriGenius is built and operated by Clareo Health — a health technology company
            focused on making evidence-based wellness tools accessible to everyone.
          </p>
          <div className="flex items-center gap-2 text-sm text-teal-300">
            <Mail className="w-4 h-4" />
            <a href="mailto:hello@clareohealth.co" className="hover:text-teal-200 transition-colors">
              hello@clareohealth.co
            </a>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-[#00685f] to-[#008577] rounded-2xl p-6 sm:p-8 text-center">
          <h2 className="font-heading text-xl font-bold text-white mb-2">
            Ready to get your personalized protocol?
          </h2>
          <p className="text-white/80 text-sm sm:text-base mb-5 max-w-lg mx-auto">
            Our free 5-minute assessment creates an evidence-based supplement plan tailored to your health profile.
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
          <Link href="/methodology" className="hover:text-[#00685f] transition-colors">Methodology</Link>
          <Link href="/disclaimer" className="hover:text-[#00685f] transition-colors">Medical Disclaimer</Link>
          <Link href="/contact" className="hover:text-[#00685f] transition-colors">Contact</Link>
          <Link href="/" className="hover:text-[#00685f] transition-colors ml-auto">← Back to NutriGenius</Link>
        </div>
      </main>
    </div>
  );
}
