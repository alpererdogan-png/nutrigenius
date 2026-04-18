"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { CookieSettingsLink } from "@/components/CookieConsent";
import {
  Shield,
  FlaskConical,
  CalendarCheck,
  ArrowRight,
  Pill,
  HeartPulse,
  Star,
  CheckCircle2,
  Menu,
  X,
  Dna,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { Logo } from "@/src/components/ui/Logo";
import { TestimonialsCarousel } from "@/src/components/TestimonialsCarousel";

// ─── Hero half — nav + hero (needs menuOpen state) ───────────────────────────

export function HomeClientHero() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full bg-white/75 backdrop-blur-xl z-50 max-h-[60px]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity duration-200">
            <Logo size="sm" variant="light" />
          </Link>
          <div className="hidden sm:flex items-center gap-5 text-sm text-[#5A6578]">
            <Link href="#how-it-works" className="hover:text-[#00685f] transition-colors duration-200">How It Works</Link>
            <Link href="#features" className="hover:text-[#00685f] transition-colors duration-200">Features</Link>
            <Link href="#safety" className="hover:text-[#00685f] transition-colors duration-200">Safety</Link>
            <Link href="/blog" className="hover:text-[#00685f] transition-colors duration-200">Blog</Link>
          </div>
          <Link
            href="/quiz"
            className="hidden sm:inline-flex bg-[#00685f] hover:bg-[#005249] active:scale-95 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-teal-500/20"
          >
            Get Your Free Personalized Plan
          </Link>
          <div className="flex items-center gap-1 sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-[#5A6578] hover:bg-[#f0ebe2] transition-colors"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="sm:hidden bg-white/90 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-4 py-2 space-y-0">
              {[
                { href: "#how-it-works", label: "How It Works" },
                { href: "#features", label: "Features" },
                { href: "#safety", label: "Safety" },
                { href: "/blog", label: "Blog" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center py-4 text-base text-[#5A6578] hover:text-[#00685f] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/quiz"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-[#00685f] hover:bg-[#005249] active:scale-95 text-white font-semibold px-5 py-4 rounded-xl text-base w-full transition-all duration-200 mt-3 mb-2"
              >
                Get Your Free Personalized Plan
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero section ── */}
      <section className="relative pt-14 sm:pt-16 overflow-hidden bg-[#f9f7f4]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/images/marble-abstract.jpg"
            alt=""
            fill
            priority
            quality={75}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
            className="object-cover opacity-[0.28]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f9f7f4]/60 via-[#f9f7f4]/30 to-[#f9f7f4]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f9f7f4]/70 via-transparent to-[#f9f7f4]/70" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-12 sm:pt-16 sm:pb-12 lg:pt-20 lg:pb-12 relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00685f] mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#bfa785]" />
                Evidence-Based Supplementation
              </p>
              <h1 className="font-heading text-[2.5rem] sm:text-[3rem] lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-[#2c2420] mb-5">
                Your supplements,{" "}
                <span className="italic text-[#00685f]">backed by science.</span>
              </h1>
              <p className="text-[#6B5E52] text-base sm:text-[1.1rem] leading-relaxed mb-8 max-w-lg">
                A 5-minute assessment creates your personalized supplement plan — with doses, timing, and drug interaction checks.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-5">
                <Link
                  href="/quiz"
                  className="inline-flex items-center justify-center gap-2 bg-[#00685f] hover:bg-[#005249] active:scale-95 text-white font-semibold px-8 py-4 rounded-full text-base transition-all duration-200 hover:-translate-y-0.5 w-full sm:w-auto"
                  style={{ boxShadow: "0 14px 30px rgba(0,104,95,0.22), 0 4px 10px rgba(44,36,32,0.06)" }}
                >
                  Get Your Free Personalized Plan
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5A6578] hover:text-[#00685f] px-2 py-2 transition-colors group"
                >
                  See How It Works
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <p className="text-[0.85rem] text-[#9A8E82]">
                Free · 5 minutes · No account required
              </p>
              <div className="mt-6 pt-5 border-t border-[#e5ddd1]/80 max-w-lg">
                <p className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10.5px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b7f6f]">
                  <span>94 drug-supplement interactions screened</span>
                  <span className="text-[#d4c9b5]" aria-hidden="true">·</span>
                  <span>60+ conditions supported</span>
                  <span className="text-[#d4c9b5]" aria-hidden="true">·</span>
                  <span>Medically reviewed</span>
                </p>
              </div>
            </div>

            {/* Protocol preview card */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-[420px] transform -rotate-[1deg]">
                <div
                  className="relative bg-white rounded-2xl p-8 border-l-4 border-[#bfa785]"
                  style={{ boxShadow: "0 20px 40px rgba(44,36,32,0.08), 0 6px 16px rgba(44,36,32,0.04)" }}
                >
                  <div className="mb-6">
                    <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00685f] mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#bfa785]" />
                      Your Protocol
                    </p>
                    <h3 className="font-heading text-[1.25rem] font-bold text-[#2c2420] tracking-tight">
                      Daily Supplement Plan
                    </h3>
                  </div>
                  <div className="divide-y divide-[#f2ede6]">
                    {[
                      { num: "1", name: "Vitamin D3", form: "Cholecalciferol", dose: "5,000 IU", timing: "Morning", evidence: "Strong" },
                      { num: "2", name: "Vitamin K2", form: "MK-7 (menaquinone)", dose: "100 mcg", timing: "Morning", evidence: "Strong" },
                      { num: "3", name: "Magnesium Glycinate", form: "Chelated form", dose: "400 mg", timing: "Evening", evidence: "Strong" },
                      { num: "4", name: "Omega-3", form: "EPA + DHA", dose: "2,000 mg", timing: "With meals", evidence: "Moderate" },
                      { num: "5", name: "Creatine Monohydrate", form: "Micronized", dose: "5 g", timing: "Daily", evidence: "Strong" },
                    ].map((s) => (
                      <div key={s.name} className="flex items-start gap-4 py-3.5 first:pt-0 last:pb-0">
                        <span className="font-heading text-[1.5rem] text-[#bfa785] leading-none mt-0.5 w-5 flex-shrink-0">
                          {s.num}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#2c2420] text-[1rem] font-semibold leading-tight">{s.name}</p>
                          <p className="italic text-[#9A8E82] text-[0.85rem] mb-2">{s.form}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                            <span className="font-bold text-[#2c2420]">{s.dose}</span>
                            <span className="text-[#9A8E82]">· {s.timing}</span>
                            <span
                              className={`ml-auto px-2 py-0.5 rounded-full font-semibold ${
                                s.evidence === "Strong"
                                  ? "bg-teal-50 text-teal-700"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {s.evidence}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 pt-4 border-t border-[#f2ede6] flex items-center gap-1.5 text-xs text-[#9A8E82]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00685f]" />
                    5 supplements · Interactions cleared
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── Content half — how-it-works onward ──────────────────────────────────────

export function HomeClientContent() {

  // ── Newsletter signup state ──
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] =
    useState<"idle" | "submitting" | "success" | "error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(null);

  const handleNewsletterSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const email = newsletterEmail.trim();
      if (!email || !email.includes("@")) {
        setNewsletterStatus("error");
        setNewsletterMessage("Please enter a valid email address.");
        return;
      }
      setNewsletterStatus("submitting");
      setNewsletterMessage(null);
      try {
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newsletter_opt_in: true }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Something went wrong. Please try again.");
        }
        setNewsletterStatus("success");
        setNewsletterMessage("Thanks — you're subscribed.");
        setNewsletterEmail("");
      } catch (err) {
        console.error("Newsletter signup failed:", err);
        setNewsletterStatus("error");
        setNewsletterMessage(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        );
      }
    },
    [newsletterEmail]
  );

  const HOW_STEPS = [
    { step: "01", icon: <Pill className="w-6 h-6" />, title: "Health Assessment", description: "Answer questions about your health, medications, lifestyle, and goals. Add lab results or genetic data for even better results." },
    { step: "02", icon: <FlaskConical className="w-6 h-6" />, title: "Evidence Matching", description: "Our algorithm searches a curated knowledge base of supplement-condition mappings, each rated by evidence strength." },
    { step: "03", icon: <Shield className="w-6 h-6" />, title: "Safety Screening", description: "Every recommendation is cross-checked against your medications for interactions. Unsafe combinations are automatically blocked." },
    { step: "04", icon: <CalendarCheck className="w-6 h-6" />, title: "Your Plan", description: "Receive a personalized plan with 5-8 supplements, optimal doses, timing schedule, and clear explanations for each one." },
  ];

  return (
    <>

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS — Single responsive vertical timeline
      ══════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-10 sm:py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14 sm:mb-20">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#bfa785] mb-3">
              How it works
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2c2420] mb-4 tracking-tight">
              A systematic, evidence-based approach
            </h2>
            <p className="text-[#5A6578] text-base sm:text-lg max-w-2xl mx-auto">
              Four steps from your health profile to a personalized protocol. Not guesswork.
            </p>
          </div>

          {/* Vertical timeline — responsive for all sizes */}
          <ol className="relative">
            <div className="absolute left-[22px] sm:left-[27px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-teal-300 via-teal-400 to-teal-100" />
            {HOW_STEPS.map((item, i) => (
              <li key={item.step} className="flex gap-5 sm:gap-6 pb-10 sm:pb-12 last:pb-0 relative">
                <div className="relative flex-shrink-0 z-10">
                  <div className="w-11 h-11 sm:w-[54px] sm:h-[54px] rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/25 ring-4 ring-white">
                    <span className="text-white [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6">{item.icon}</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#2c2420] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                    {i + 1}
                  </div>
                </div>
                <div className="pt-2 sm:pt-2.5 flex-1">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-[#2c2420] mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-sm sm:text-base text-[#5A6578] leading-relaxed max-w-xl">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Trust bar */}
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-10 text-xs sm:text-sm text-[#5A6578] rounded-2xl bg-[#f9f7f4] px-4 py-5 sm:py-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-[#00685f] flex-shrink-0" />
              Built on peer-reviewed research
            </div>
            <div className="hidden sm:block w-px h-4 bg-[#e0d8cc]" />
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00685f] flex-shrink-0" />
              Drug interaction safety checks
            </div>
            <div className="hidden sm:block w-px h-4 bg-[#e0d8cc]" />
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-[#00685f] flex-shrink-0" />
              Clinician-Designed &amp; Evidence-Based
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          VISUAL BREAK — Full-width morning-routine lifestyle
      ══════════════════════════════════════════════════ */}
      <section className="relative h-[250px] sm:h-[380px] lg:h-[440px] overflow-hidden">
        <Image
          src="/images/morning-routine.jpg"
          alt="A calm morning routine with supplements and linen"
          fill
          quality={75}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
          loading="lazy"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2c2420]/70 via-[#2c2420]/35 to-transparent" />
        <div className="relative h-full max-w-6xl mx-auto px-6 sm:px-10 flex items-center">
          <div className="max-w-md">
            <p className="text-amber-200/90 text-[11px] font-semibold uppercase tracking-[0.22em] mb-3">
              Built into your day
            </p>
            <p className="font-heading text-white text-xl sm:text-3xl lg:text-[34px] leading-tight italic font-light">
              &ldquo;A supplement plan shouldn&rsquo;t feel like a prescription. It should feel like a morning ritual.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FEATURES — 3 alternating image+text pairs
      ══════════════════════════════════════════════════ */}
      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6 bg-[#f9f7f4]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 sm:mb-24">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#bfa785] mb-3">
              What makes us different
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2c2420] tracking-tight">
              Clinically-driven, not marketing-driven
            </h2>
          </div>

          <div className="space-y-20 sm:space-y-28">
            {[
              {
                img: "/images/flatlay-supplements.jpg",
                alt: "Overhead flatlay of supplement bottles",
                label: "Drug Interaction Checks",
                heading: "Every supplement, screened against your medications",
                desc: "Critical interactions are blocked automatically. Moderate ones are flagged with clear warnings. We check against warfarin, metformin, SSRIs, statins, thyroid meds, and more.",
                link: { href: "#safety", text: "Learn more about our safety checks" },
                reverse: false,
              },
              {
                img: "/images/vitamin-macro.jpg",
                alt: "Macro close-up of vitamins and minerals",
                label: "Evidence Ratings",
                heading: "Strong, moderate, emerging — you decide",
                desc: "Every recommendation shows its evidence level — Strong (multiple RCTs), Moderate (some studies), Emerging (preliminary research), or Traditional (historical use) — so you know exactly what the science says.",
                link: { href: "/methodology", text: "See our methodology" },
                reverse: true,
              },
              {
                img: "/images/lab-science.jpg",
                alt: "Laboratory setup with microscope and supplement bottles",
                label: "Deterministic Algorithm",
                heading: "Structured clinical rules, not a chatbot",
                desc: "NutriGenius uses a curated knowledge base of supplement-condition mappings, drug interactions, dosage limits, and safety rules. Not a language model making guesses — a structured engine producing consistent, evidence-based recommendations.",
                link: { href: "/methodology", text: "Read about our algorithm" },
                reverse: false,
              },
            ].map((f) => (
              <div
                key={f.label}
                className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${f.reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
              >
                <div className="relative aspect-[4/3] w-full max-w-[520px] mx-auto lg:mx-0 rounded-2xl overflow-hidden"
                  style={{ boxShadow: "0 20px 40px rgba(44, 36, 32, 0.12), 0 6px 16px rgba(44, 36, 32, 0.06)" }}>
                  <Image
                    src={f.img}
                    alt={f.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
                <div className="max-w-xl">
                  <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00685f] mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#bfa785]" />
                    {f.label}
                  </p>
                  <h3 className="font-heading text-2xl sm:text-3xl lg:text-[2rem] font-bold text-[#2c2420] mb-5 tracking-tight leading-[1.15]">
                    {f.heading}
                  </h3>
                  <p className="text-[#5A6578] text-base sm:text-lg leading-relaxed mb-6">
                    {f.desc}
                  </p>
                  <Link
                    href={f.link.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00685f] hover:text-[#005249] transition-colors group"
                  >
                    {f.link.text}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* ── Additional features: simpler 2x2 grid ── */}
          <div className="mt-24 sm:mt-32 pt-12 border-t border-[#e5ddd1]">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#bfa785] text-center mb-10">
              Additional features
            </p>
            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8 max-w-3xl mx-auto">
              {[
                { icon: <Dna className="w-5 h-5" />, title: "Lab-Informed Dosing", desc: "Biomarker-calibrated recommendations from your blood work." },
                { icon: <CalendarCheck className="w-5 h-5" />, title: "Visual Weekly Schedule", desc: "Morning, midday, evening — timing optimized for absorption." },
                { icon: <HeartPulse className="w-5 h-5" />, title: "Genetic Personalization", desc: "MTHFR, COMT, VDR variants inform supplement form selection." },
                { icon: <Shield className="w-5 h-5" />, title: "Clinician-Designed Protocols", desc: "Medically reviewed rules from practicing clinicians." },
              ].map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white ring-1 ring-[#e5ddd1] flex items-center justify-center text-[#00685f] flex-shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="font-heading text-base font-bold text-[#2c2420] mb-1 tracking-tight">{f.title}</h4>
                    <p className="text-sm text-[#5A6578] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TESTIMONIALS — Member experiences
      ══════════════════════════════════════════════════ */}
      <section id="testimonials" className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#bfa785] mb-3">
              Member Experiences
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2c2420] tracking-tight">
              What our members are saying
            </h2>
            <p className="mt-4 text-[#5A6578] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Real stories from people using NutriGenius to navigate conditions,
              diets, and life stages with personalized, evidence-based protocols.
            </p>
          </div>

          <TestimonialsCarousel />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SAFETY — Dark section with layered stack visual
      ══════════════════════════════════════════════════ */}
      <section id="safety" className="py-12 sm:py-20 px-4 sm:px-6 bg-[#2c2420]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 text-amber-200 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 tracking-wide">
                <Shield className="w-3.5 h-3.5" />
                {"Safety First"}
              </div>
              <h2 className="font-heading text-2xl sm:text-4xl font-bold text-white mb-5 tracking-tight">
                {"Your safety is non-negotiable"}
              </h2>
              <p className="text-stone-300 text-lg leading-relaxed mb-8">
                {"Medically reviewed by Dr. Esra Ata, MD — a physician certified in Functional Medicine and GAPS Protocol. Clinical architecture by a Pharmaceutical Clinical Development Expert. Every recommendation passes through multiple safety layers before it reaches you."}
              </p>
              <div className="space-y-4">
                {[
                  "Supplements with critical drug interactions are automatically blocked",
                  "Doses never exceed established Upper Tolerable Intake Levels",
                  "Pregnancy and breastfeeding restrictions are strictly enforced",
                  "All recommendations include evidence ratings and source transparency",
                  "This platform supplements — never replaces — professional medical advice",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                    <span className="text-stone-300 text-sm sm:text-base leading-relaxed">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: layered safety shield stack (CSS-only) */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-80 h-72">
                {[
                  { label: "Dosage Limits", icon: <FlaskConical className="w-4 h-4" />, bg: "bg-slate-800/60", top: 56, rotate: -12, shadow: "0 12px 40px rgba(0,0,0,0.5)" },
                  { label: "Evidence Gates", icon: <Star className="w-4 h-4" />, bg: "bg-slate-800", top: 42, rotate: -8, shadow: "0 10px 35px rgba(0,0,0,0.5)" },
                  { label: "Pregnancy Safety", icon: <HeartPulse className="w-4 h-4" />, bg: "bg-slate-700", top: 28, rotate: -4, shadow: "0 8px 30px rgba(0,0,0,0.45)" },
                  { label: "Allergy Filters", icon: <AlertTriangle className="w-4 h-4" />, bg: "bg-teal-800", top: 14, rotate: -2, shadow: "0 6px 25px rgba(13,148,136,0.3)" },
                  { label: "Drug Interactions", icon: <Shield className="w-4 h-4" />, bg: "bg-teal-600", top: 0, rotate: 0, shadow: "0 4px 20px rgba(13,148,136,0.5)" },
                ].map((layer, i) => (
                  <div
                    key={layer.label}
                    className={`absolute inset-x-0 ${layer.bg} border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3`}
                    style={{
                      top: layer.top,
                      zIndex: 5 - i,
                      transform: `rotate(${layer.rotate}deg)`,
                      boxShadow: layer.shadow,
                    }}
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white flex-shrink-0">
                      {layer.icon}
                    </div>
                    <span className="text-white text-sm font-semibold">{layer.label}</span>
                    <div className="ml-auto w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          Newsletter signup — light bridge between dark safety
          and dark CTA. Writes to `newsletter_subscribers`
          (same Supabase table as /quiz post-results flow).
      ══════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#f9f7f4] border-t border-[#E8ECF1]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#e6f4f3] text-[#00685f] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-wide">
            Newsletter
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1A2332] mb-3 tracking-tight">
            Stay up to date on supplement science
          </h2>
          <p className="text-[#5A6578] text-sm sm:text-base mb-8 leading-relaxed">
            Evidence-based insights and safety updates in your inbox. No spam, unsubscribe anytime.
          </p>

          <form
            onSubmit={handleNewsletterSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            noValidate
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={newsletterEmail}
              onChange={(e) => {
                setNewsletterEmail(e.target.value);
                if (newsletterStatus === "error" || newsletterStatus === "success") {
                  setNewsletterStatus("idle");
                  setNewsletterMessage(null);
                }
              }}
              disabled={newsletterStatus === "submitting"}
              className="flex-1 min-w-0 bg-white rounded-xl px-4 py-3 text-[15px] text-[#1A2332] placeholder:text-[#8896A8] ring-1 ring-[#E8ECF1] focus:outline-none focus:ring-2 focus:ring-[#00685f]/40 focus:border-[#00685f] transition-shadow disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={newsletterStatus === "submitting"}
              className="inline-flex items-center justify-center gap-2 bg-[#00685f] hover:bg-[#005249] active:scale-[0.98] text-white font-semibold text-[15px] px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {newsletterStatus === "submitting" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>

          {newsletterMessage && (
            <p
              role={newsletterStatus === "error" ? "alert" : "status"}
              className={
                "text-sm mt-4 " +
                (newsletterStatus === "success"
                  ? "text-[#00685f]"
                  : newsletterStatus === "error"
                    ? "text-rose-600"
                    : "text-[#5A6578]")
              }
            >
              {newsletterMessage}
            </p>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CTA — Dark warm with capsules-scatter background
      ══════════════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 bg-[#2c2420] overflow-hidden">
        {/* Capsules background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/images/capsules-scatter.jpg"
            alt=""
            fill
            quality={75}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
            loading="lazy"
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2c2420]/90 via-[#1f1916]/75 to-[#2c2420]/85" />
        </div>
        {/* Top highlight line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        {/* Ambient glow */}
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-64 h-64 bg-amber-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 tracking-wide">
            <Lock className="w-3.5 h-3.5" />
            Free · No credit card · Results in 5 minutes
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            {"Ready to optimize your supplement routine?"}
          </h2>
          <p className="text-slate-300 text-base sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            {"Replace guesswork with evidence-based supplementation. It takes 5 minutes and it's completely free."}
          </p>
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center gap-3 bg-white hover:bg-amber-50 active:scale-95 text-[#2c2420] font-bold px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl transition-all duration-200 hover:-translate-y-1 w-full sm:w-auto"
            style={{ boxShadow: "0 0 60px rgba(251,191,36,0.25), 0 20px 50px rgba(0,0,0,0.35)" }}
          >
            {"Get Your Free Personalized Plan"}
            <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="text-slate-400 text-sm mt-6">{"No account required · 100% free · Takes 5 minutes"}</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <Link href="/" className="hover:opacity-80 transition-opacity duration-200">
              <Logo size="md" variant="light" />
            </Link>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#5A6578]">
              <Link href="/blog" className="hover:text-[#00685f] transition-colors">{"Blog"}</Link>
              <Link href="/about" className="hover:text-[#00685f] transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-[#00685f] transition-colors">{"Privacy Policy"}</Link>
              <Link href="/terms" className="hover:text-[#00685f] transition-colors">{"Terms of Service"}</Link>
              <Link href="/disclaimer" className="hover:text-[#00685f] transition-colors">{"Medical Disclaimer"}</Link>
              <Link href="/disclosure" className="hover:text-[#00685f] transition-colors">{"Affiliate Disclosure"}</Link>
              <CookieSettingsLink className="hover:text-[#00685f] transition-colors cursor-pointer" />
            </div>
          </div>
          <div className="bg-[#f9f7f4] rounded-xl p-4 mt-4 space-y-3">
            <p className="text-xs text-[#8896A8] leading-relaxed">
              <strong>{"Medical Disclaimer:"}</strong>{" "}{"NutriGenius provides educational information based on published scientific evidence. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your healthcare provider before starting any supplement regimen."}
            </p>
            <p className="text-xs text-[#8896A8] leading-relaxed">
              <strong>{"Affiliate Disclosure:"}</strong>{" "}
              As an Amazon Associate, Clareo Health earns from qualifying purchases.
              Recommendations are based on evidence, not commissions, and the price you pay is unchanged.{" "}
              <Link href="/disclosure" className="text-[#00685f] hover:underline">
                Read the full disclosure
              </Link>
              .
            </p>
            <p className="text-xs text-[#8896A8] leading-relaxed">
              <strong>{"AI Transparency:"}</strong>{" "}{"Recommendations are generated by an AI system based on published scientific evidence and a structured clinical knowledge base."}
            </p>
            <p className="text-xs text-[#8896A8] leading-relaxed">
              <strong>Medical Review:</strong>{" "}
              <Link href="/about#medical-reviewer" className="text-[#00685f] hover:underline">Dr. Esra Ata, MD</Link>
              {" "}— Physician, Functional Medicine &amp; GAPS Certified
            </p>
            <p className="text-xs text-[#8896A8] mt-4">
              {`© ${new Date().getFullYear()} NutriGenius. All rights reserved.`}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
