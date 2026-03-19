"use client";

import { useState } from "react";
import Link from "next/link";
import { CookieSettingsLink } from "@/components/CookieConsent";
import {
  Shield,
  FlaskConical,
  Brain,
  CalendarCheck,
  ArrowRight,
  Pill,
  HeartPulse,
  Leaf,
  Star,
  CheckCircle2,
  BookOpen,
  Menu,
  X,
  Dna,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { BlogCarousel } from "./components/BlogCarousel";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/language-context";

export default function Home() {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NutriGenius",
    url: "https://nutrigenius.co",
    description: "Evidence-based personalized supplement recommendations",
    sameAs: [],
  };

  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "NutriGenius",
    url: "https://nutrigenius.co",
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    description:
      "Free personalized supplement plan backed by science. Drug interaction checks, evidence ratings, and a visual weekly schedule.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
  };

  const HOW_STEPS = [
    { step: "01", icon: <Pill className="w-6 h-6" />, title: t("how.s1Title"), description: t("how.s1Desc") },
    { step: "02", icon: <FlaskConical className="w-6 h-6" />, title: t("how.s2Title"), description: t("how.s2Desc") },
    { step: "03", icon: <Shield className="w-6 h-6" />, title: t("how.s3Title"), description: t("how.s3Desc") },
    { step: "04", icon: <CalendarCheck className="w-6 h-6" />, title: t("how.s4Title"), description: t("how.s4Desc") },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-[#1A2332]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />

      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl border-b border-[#E8ECF1] z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center shadow-sm">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-[#1A2332] font-heading">
              Nutri<span className="text-[#0D9488]">Genius</span>
            </span>
          </div>
          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-5 text-sm text-[#5A6578]">
            <Link href="#how-it-works" className="hover:text-[#0D9488] transition-colors duration-200">{t("nav.howItWorks")}</Link>
            <Link href="#features" className="hover:text-[#0D9488] transition-colors duration-200">{t("nav.features")}</Link>
            <Link href="#safety" className="hover:text-[#0D9488] transition-colors duration-200">{t("nav.safety")}</Link>
            <Link href="/blog" className="hover:text-[#0D9488] transition-colors duration-200">{t("nav.blog")}</Link>
            <LanguageSwitcher />
          </div>
          <Link
            href="/quiz"
            className="hidden sm:inline-flex bg-[#0D9488] hover:bg-[#0F766E] active:scale-95 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-teal-500/20"
          >
            {t("nav.cta")}
          </Link>
          {/* Mobile: language + hamburger */}
          <div className="flex items-center gap-1 sm:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-[#5A6578] hover:bg-[#F1F5F9] transition-colors"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="sm:hidden border-t border-[#E8ECF1] bg-white/80 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-4 py-2 space-y-0">
              {[
                { href: "#how-it-works", label: t("nav.howItWorks") },
                { href: "#features", label: t("nav.features") },
                { href: "#safety", label: t("nav.safety") },
                { href: "/blog", label: t("nav.blog") },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center py-3 text-sm text-[#5A6578] hover:text-[#0D9488] border-b border-[#F1F5F9] last:border-0 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/quiz"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] active:scale-95 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-all duration-200 mt-3 mb-2"
              >
                {t("hero.cta")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════════════════
          HERO — Two-column, dark gradient background
      ══════════════════════════════════════════════════ */}
      <section className="relative pt-16 overflow-hidden bg-gradient-to-br from-slate-900 via-[#0B1A2E] to-slate-900">
        {/* Ambient glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-teal-500/10 rounded-full -translate-y-1/3 translate-x-1/4 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-600/8 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-28 relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* ── Left column ── */}
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-500/15 border border-teal-500/25 text-teal-300 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 tracking-wide">
                <Shield className="w-3.5 h-3.5" />
                {t("hero.badge")}
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.07] tracking-tight text-white mb-5">
                {t("hero.title")}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                  {t("hero.titleHighlight")}
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
                {t("hero.description")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link
                  href="/quiz"
                  className="inline-flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] active:scale-95 text-white font-bold px-8 py-4 rounded-xl text-base transition-all duration-200 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5"
                >
                  {t("hero.cta")}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 active:scale-95 border border-white/20 text-white font-medium px-6 py-4 rounded-xl text-base transition-all duration-200"
                >
                  {t("hero.ctaSecondary")}
                </Link>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  {t("hero.noAccount")}
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  {t("hero.freeTime")}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1.5">
                    {["bg-teal-400", "bg-blue-400", "bg-purple-400"].map((c, i) => (
                      <div key={i} className={`w-5 h-5 rounded-full ${c} border-2 border-slate-900`} />
                    ))}
                  </div>
                  <span>
                    <span className="text-white font-semibold">10,000+</span> {t("hero.usersLabel")}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Right column: Mock Protocol Card ── */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-[420px]">
                {/* Glow behind card */}
                <div className="absolute inset-6 bg-teal-500/20 rounded-3xl blur-2xl" />

                {/* Free badge floating top-right */}
                <div className="absolute -top-3 -right-3 z-20 bg-emerald-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg shadow-emerald-500/40 tracking-wide">
                  FREE · 5 min
                </div>

                <div className="relative bg-[#0D1B2A] border border-white/10 rounded-2xl p-6 shadow-2xl">
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-teal-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">
                        Your Personalized Protocol
                      </p>
                      <h3 className="font-heading text-white font-bold text-lg tracking-tight">
                        Daily Supplement Plan
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-teal-400" />
                    </div>
                  </div>

                  {/* Supplement rows */}
                  {[
                    { num: "01", name: "Vitamin D3", form: "Cholecalciferol", dose: "5,000 IU", timing: "Morning", evidence: "Strong", ec: "text-green-400 bg-green-500/10 border-green-500/25" },
                    { num: "02", name: "Magnesium Glycinate", form: "Chelated form", dose: "400 mg", timing: "Evening", evidence: "Strong", ec: "text-green-400 bg-green-500/10 border-green-500/25" },
                    { num: "03", name: "Omega-3", form: "EPA + DHA", dose: "2,000 mg", timing: "With meals", evidence: "Moderate", ec: "text-blue-400 bg-blue-500/10 border-blue-500/25" },
                  ].map((s) => (
                    <div key={s.name} className="flex items-start gap-3 py-3.5 border-b border-white/5 last:border-0">
                      <span className="text-[10px] font-mono text-slate-600 mt-1 w-5 flex-shrink-0">{s.num}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold leading-tight">{s.name}</p>
                        <p className="text-slate-500 text-[11px] mb-1.5">{s.form}</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[10px] bg-teal-500/15 border border-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-medium">{s.dose}</span>
                          <span className="text-[10px] bg-white/5 border border-white/10 text-slate-400 px-2 py-0.5 rounded-full">{s.timing}</span>
                          <span className={`text-[10px] border px-2 py-0.5 rounded-full font-medium ${s.ec}`}>{s.evidence}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Footer bar */}
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-slate-500">3 supplements · Interactions cleared</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-teal-400 font-semibold">
                      <Shield className="w-3 h-3" /> Safety checked
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Fade to page background */}
        <div className="h-20 bg-gradient-to-b from-transparent to-[#FAFBFC]" />
      </section>

      {/* ── Blog Carousel Section ── */}
      <section className="pb-10 sm:pb-16 bg-[#FAFBFC] overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-3 sm:mb-6">
            <div className="inline-flex items-center gap-2 bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] text-xs font-medium px-3 py-1.5 rounded-full mb-2 sm:mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              {t("blog.badge")}
            </div>
            <h2 className="font-heading text-xl sm:text-3xl font-bold text-[#1A2332] mb-1 sm:mb-2 tracking-tight">
              {t("blog.title")}
            </h2>
            <p className="text-[#5A6578] text-sm sm:text-base max-w-2xl">
              {t("blog.description")}
            </p>
          </div>
          <div className="-mx-4 sm:-mx-6 px-4 sm:px-6">
            <BlogCarousel />
          </div>
          <div className="mt-4 sm:mt-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-[#F0FDFA] hover:bg-[#CCFBF1] active:scale-95 border border-[#99F6E4] text-[#0D9488] font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-200"
            >
              {t("blog.cta")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS — Horizontal timeline
      ══════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 sm:mb-20">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A2332] mb-4 tracking-tight">
              {t("how.title")}
            </h2>
            <p className="text-[#5A6578] text-lg max-w-2xl mx-auto">
              {t("how.description")}
            </p>
          </div>

          {/* ── Desktop: horizontal timeline ── */}
          <div className="hidden lg:block">
            <div className="relative flex items-start justify-between">
              {/* Connecting gradient line */}
              <div
                className="absolute top-9 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-200 via-teal-400 to-slate-200"
                style={{ left: "calc(12.5% - 0px)", right: "calc(12.5% - 0px)" }}
              />

              {HOW_STEPS.map((item, i) => (
                <div key={item.step} className="flex-1 flex flex-col items-center text-center px-4 group">
                  {/* Step circle */}
                  <div className="relative mb-7 z-10">
                    <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-xl shadow-teal-500/30 ring-4 ring-white group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white">{item.icon}</span>
                    </div>
                    {/* Step number badge */}
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#1A2332] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#1A2332] mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-[#5A6578] leading-relaxed max-w-[210px]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Mobile: vertical timeline ── */}
          <div className="lg:hidden space-y-0">
            {HOW_STEPS.map((item, i) => (
              <div key={item.step} className="flex gap-5 pb-10 relative">
                {/* Vertical connector */}
                {i < HOW_STEPS.length - 1 && (
                  <div className="absolute left-[22px] top-[52px] bottom-0 w-0.5 bg-gradient-to-b from-teal-400 to-teal-100" />
                )}
                {/* Circle */}
                <div className="relative flex-shrink-0 z-10">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/25">
                    <span className="text-white [&>svg]:w-5 [&>svg]:h-5">{item.icon}</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1A2332] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                    {i + 1}
                  </div>
                </div>
                <div className="pt-1.5">
                  <h3 className="font-heading text-base font-bold text-[#1A2332] mb-1 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-[#5A6578] leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust bar */}
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-10 text-xs sm:text-sm text-[#5A6578] border border-[#E8ECF1] rounded-2xl bg-[#FAFBFC] px-4 py-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-[#0D9488] flex-shrink-0" />
              {t("trust.research")}
            </div>
            <div className="hidden sm:block w-px h-4 bg-[#E8ECF1]" />
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0D9488] flex-shrink-0" />
              {t("trust.drugChecks")}
            </div>
            <div className="hidden sm:block w-px h-4 bg-[#E8ECF1]" />
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-[#0D9488] flex-shrink-0" />
              {t("trust.clinicianDesigned")}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FEATURES — Bento grid
      ══════════════════════════════════════════════════ */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#FAFBFC]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A2332] mb-4 tracking-tight">
              {t("features.title")}
            </h2>
            <p className="text-[#5A6578] text-lg max-w-2xl mx-auto">
              {t("features.description")}
            </p>
          </div>

          {/* Bento grid layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-4">

            {/* LARGE CARD 1 — Drug Interaction Checks (col-span-1 row-span-2) */}
            <div className="sm:col-span-1 lg:col-span-1 lg:row-span-2 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border border-amber-200/70 rounded-2xl p-7 flex flex-col group hover:scale-[1.01] transition-all duration-200 cursor-pointer">
              <div className="w-13 h-13 rounded-2xl bg-amber-500/15 border border-amber-300/40 flex items-center justify-center text-amber-600 mb-5 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 w-14 h-14">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-xl font-bold text-[#1A2332] mb-3 tracking-tight">
                {t("features.f2Title")}
              </h3>
              <p className="text-[#5A6578] leading-relaxed text-sm flex-1">{t("features.f2Desc")}</p>
              <div className="mt-6 pt-5 border-t border-amber-200/60">
                <p className="text-xs text-amber-700/70 font-medium mb-2.5 uppercase tracking-wider">Interaction-checked drugs</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Warfarin", "Metformin", "SSRIs", "Statins", "Thyroid meds"].map((med) => (
                    <span key={med} className="text-xs bg-amber-100/80 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                      {med}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* LARGE CARD 2 — Evidence Ratings (col-span-1 row-span-2) */}
            <div className="sm:col-span-1 lg:col-span-1 lg:row-span-2 bg-gradient-to-br from-green-50 via-teal-50 to-green-50 border border-green-200/70 rounded-2xl p-7 flex flex-col group hover:scale-[1.01] transition-all duration-200 cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-300/40 flex items-center justify-center text-green-600 mb-5 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                <Star className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-xl font-bold text-[#1A2332] mb-3 tracking-tight">
                {t("features.f3Title")}
              </h3>
              <p className="text-[#5A6578] leading-relaxed text-sm flex-1">{t("features.f3Desc")}</p>
              <div className="mt-6 pt-5 border-t border-green-200/60 space-y-2.5">
                {[
                  { label: "Strong", color: "bg-green-500", w: "w-full", text: "text-green-700" },
                  { label: "Moderate", color: "bg-blue-400", w: "w-3/4", text: "text-blue-700" },
                  { label: "Emerging", color: "bg-amber-400", w: "w-1/2", text: "text-amber-700" },
                  { label: "Traditional", color: "bg-slate-400", w: "w-1/3", text: "text-slate-600" },
                ].map((e) => (
                  <div key={e.label} className="flex items-center gap-2.5">
                    <span className={`text-xs font-medium w-20 flex-shrink-0 ${e.text}`}>{e.label}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${e.color} ${e.w} transition-all`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 small cards — right column */}
            {[
              {
                icon: <Brain className="w-5 h-5" />,
                title: t("features.f1Title"),
                desc: t("features.f1Desc"),
                bg: "from-purple-50 to-violet-50",
                border: "border-purple-200/60",
                iconCls: "bg-purple-500/15 border-purple-300/40 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
              },
              {
                icon: <Dna className="w-5 h-5" />,
                title: t("features.f4Title"),
                desc: t("features.f4Desc"),
                bg: "from-blue-50 to-indigo-50",
                border: "border-blue-200/60",
                iconCls: "bg-blue-500/15 border-blue-300/40 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
              },
              {
                icon: <CalendarCheck className="w-5 h-5" />,
                title: t("features.f5Title"),
                desc: t("features.f5Desc"),
                bg: "from-teal-50 to-cyan-50",
                border: "border-teal-200/60",
                iconCls: "bg-teal-500/15 border-teal-300/40 text-teal-600 group-hover:bg-teal-600 group-hover:text-white",
              },
              {
                icon: <HeartPulse className="w-5 h-5" />,
                title: t("features.f6Title"),
                desc: t("features.f6Desc"),
                bg: "from-rose-50 to-pink-50",
                border: "border-rose-200/60",
                iconCls: "bg-rose-500/15 border-rose-300/40 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
              },
            ].map((f, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${f.bg} border ${f.border} rounded-2xl p-5 group hover:scale-[1.02] transition-all duration-200 cursor-pointer`}
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 transition-all duration-300 ${f.iconCls}`}>
                  {f.icon}
                </div>
                <h3 className="font-heading text-base font-bold text-[#1A2332] mb-1.5 tracking-tight">{f.title}</h3>
                <p className="text-sm text-[#5A6578] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SAFETY — Dark section with layered stack visual
      ══════════════════════════════════════════════════ */}
      <section id="safety" className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-500/15 border border-teal-500/25 text-teal-300 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 tracking-wide">
                <Shield className="w-3.5 h-3.5" />
                {t("safety.badge")}
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-5 tracking-tight">
                {t("safety.title")}
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                {t("safety.description")}
              </p>
              <div className="space-y-4">
                {(["p1", "p2", "p3", "p4", "p5"] as const).map((key) => (
                  <div key={key} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    </div>
                    <span className="text-slate-300 text-sm sm:text-base leading-relaxed">
                      {t(`safety.${key}`)}
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
          CTA — Full-width teal-to-emerald gradient
      ══════════════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 overflow-hidden">
        {/* Dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: "22px 22px",
          }}
        />
        {/* Top highlight line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        {/* Ambient glow blobs */}
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 tracking-wide">
            <Lock className="w-3.5 h-3.5" />
            Free · No credit card · Results in 5 minutes
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            {t("cta.title")}
          </h2>
          <p className="text-teal-100 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            {t("cta.description")}
          </p>
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center gap-3 bg-white hover:bg-teal-50 active:scale-95 text-[#0D9488] font-bold px-12 py-5 rounded-2xl text-xl transition-all duration-200 hover:-translate-y-1"
            style={{ boxShadow: "0 0 60px rgba(255,255,255,0.25), 0 20px 50px rgba(0,0,0,0.18)" }}
          >
            {t("cta.button")}
            <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="text-teal-200/80 text-sm mt-6">{t("cta.subtext")}</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E8ECF1] bg-white py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading text-lg font-semibold tracking-tight">
                Nutri<span className="text-[#0D9488]">Genius</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-[#5A6578]">
              <Link href="/blog" className="hover:text-[#0D9488] transition-colors">{t("footer.blog")}</Link>
              <Link href="/privacy" className="hover:text-[#0D9488] transition-colors">{t("footer.privacy")}</Link>
              <Link href="/terms" className="hover:text-[#0D9488] transition-colors">{t("footer.terms")}</Link>
              <Link href="/disclaimer" className="hover:text-[#0D9488] transition-colors">{t("footer.disclaimer")}</Link>
              <CookieSettingsLink className="hover:text-[#0D9488] transition-colors cursor-pointer" />
            </div>
          </div>
          <div className="border-t border-[#E8ECF1] pt-6 space-y-3">
            <p className="text-xs text-[#8896A8] leading-relaxed">
              <strong>{t("footer.medicalTitle")}</strong>{" "}{t("footer.medicalText")}
            </p>
            <p className="text-xs text-[#8896A8] leading-relaxed">
              <strong>{t("footer.affiliateTitle")}</strong>{" "}{t("footer.affiliateText")}
            </p>
            <p className="text-xs text-[#8896A8] leading-relaxed">
              <strong>{t("footer.aiTitle")}</strong>{" "}{t("footer.aiText")}
            </p>
            <p className="text-xs text-[#8896A8] mt-4">
              {t("footer.copyright", { year: new Date().getFullYear().toString() })}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
