"use client";

import { useState } from "react";
import Link from "next/link";
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
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-[#E8ECF1] z-50">
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
            <Link href="#how-it-works" className="hover:text-[#0D9488] transition-colors duration-200">
              {t("nav.howItWorks")}
            </Link>
            <Link href="#features" className="hover:text-[#0D9488] transition-colors duration-200">
              {t("nav.features")}
            </Link>
            <Link href="#safety" className="hover:text-[#0D9488] transition-colors duration-200">
              {t("nav.safety")}
            </Link>
            <Link href="/blog" className="hover:text-[#0D9488] transition-colors duration-200">
              {t("nav.blog")}
            </Link>
            <LanguageSwitcher />
          </div>
          <Link
            href="/quiz"
            className="hidden sm:inline-flex bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-teal-500/20"
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
        {/* Mobile slide-down menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-[#E8ECF1] bg-white/95 backdrop-blur-md">
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
                className="flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors mt-3 mb-2"
              >
                {t("hero.cta")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-16 sm:pt-20 pb-2 sm:pb-8 px-4 sm:px-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#F0FDFA] via-[#CCFBF1]/20 to-transparent rounded-full translate-x-1/3 -translate-y-1/4" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle, #0D9488 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] text-xs font-medium px-3 py-1 rounded-full mb-3">
              <Shield className="w-3 h-3" />
              {t("hero.badge")}
            </div>

            <h1 className="font-heading text-2xl sm:text-4xl font-bold leading-[1.1] tracking-tight text-[#1A2332] mb-2 sm:mb-3">
              {t("hero.title")}{" "}
              <span className="text-[#0D9488]">{t("hero.titleHighlight")}</span>
            </h1>

            {/* Short description on mobile, full on desktop */}
            <p className="sm:hidden text-sm text-[#5A6578] leading-relaxed mb-3 max-w-xl">
              {t("hero.descriptionShort")}
            </p>
            <p className="hidden sm:block text-base text-[#5A6578] leading-relaxed mb-4 max-w-xl">
              {t("hero.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5">
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/25 hover:-translate-y-0.5"
              >
                {t("hero.cta")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#1A2332] font-medium px-5 py-2.5 rounded-xl text-sm transition-all duration-200 hover:border-[#CBD5E1]"
              >
                {t("hero.ctaSecondary")}
              </Link>
            </div>

            {/* Social proof — compact row on mobile */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs text-[#5A6578]">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1">
                  {["bg-teal-400", "bg-blue-400", "bg-purple-400"].map((c, i) => (
                    <div key={i} className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${c} border-2 border-white`} />
                  ))}
                </div>
                <span className="font-medium text-[#1A2332]">10,000+</span> {t("hero.usersLabel")}
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0D9488]" />
                {t("hero.noAccount")}
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0D9488]" />
                {t("hero.freeTime")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Blog Carousel Section ── */}
      <section className="pt-2 sm:pt-6 pb-8 sm:pb-12 lg:pb-16 bg-[#FAFBFC] overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-2 sm:mb-6">
            <div className="inline-flex items-center gap-2 bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] text-xs font-medium px-3 py-1.5 rounded-full mb-1 sm:mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              {t("blog.badge")}
            </div>
            <h2 className="font-heading text-xl sm:text-3xl font-bold text-[#1A2332] mb-1 sm:mb-2">
              {t("blog.title")}
            </h2>
            <p className="text-[#5A6578] text-sm sm:text-base max-w-2xl">
              {t("blog.description")}
            </p>
          </div>

          <div className="-mx-4 sm:-mx-6 px-4 sm:px-6">
            <BlogCarousel />
          </div>

          <div className="mt-3 sm:mt-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-[#F0FDFA] hover:bg-[#CCFBF1] border border-[#99F6E4] text-[#0D9488] font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-200 hover:shadow-sm"
            >
              {t("blog.cta")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A2332] mb-4">
              {t("how.title")}
            </h2>
            <p className="text-[#5A6578] text-lg max-w-2xl mx-auto">
              {t("how.description")}
            </p>
          </div>

          {/* Trust Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-10 text-xs sm:text-sm text-[#5A6578] border border-[#E8ECF1] rounded-2xl bg-white px-4 py-3 sm:py-4 mb-8 sm:mb-10">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <FlaskConical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0D9488] flex-shrink-0" />
              {t("trust.research")}
            </div>
            <div className="hidden sm:block w-px h-4 bg-[#E8ECF1]" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0D9488] flex-shrink-0" />
              {t("trust.drugChecks")}
            </div>
            <div className="hidden sm:block w-px h-4 bg-[#E8ECF1]" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <HeartPulse className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0D9488] flex-shrink-0" />
              {t("trust.clinicianDesigned")}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                icon: <Pill className="w-5 h-5" />,
                title: t("how.s1Title"),
                description: t("how.s1Desc"),
              },
              {
                step: "02",
                icon: <FlaskConical className="w-5 h-5" />,
                title: t("how.s2Title"),
                description: t("how.s2Desc"),
              },
              {
                step: "03",
                icon: <Shield className="w-5 h-5" />,
                title: t("how.s3Title"),
                description: t("how.s3Desc"),
              },
              {
                step: "04",
                icon: <CalendarCheck className="w-5 h-5" />,
                title: t("how.s4Title"),
                description: t("how.s4Desc"),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white border border-[#E8ECF1] rounded-2xl p-6 hover:border-[#0D9488]/40 hover:shadow-md hover:shadow-teal-500/5 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] flex items-center justify-center text-[#0D9488] group-hover:bg-[#0D9488] group-hover:text-white transition-colors duration-300">
                    {item.icon}
                  </div>
                  <span className="text-xs font-semibold text-[#0D9488] tracking-wider uppercase">
                    {t("how.stepLabel")} {item.step}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-[#1A2332] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#5A6578] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A2332] mb-4">
              {t("features.title")}
            </h2>
            <p className="text-[#5A6578] text-lg max-w-2xl mx-auto">
              {t("features.description")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Brain className="w-5 h-5" />, title: t("features.f1Title"), description: t("features.f1Desc") },
              { icon: <Shield className="w-5 h-5" />, title: t("features.f2Title"), description: t("features.f2Desc") },
              { icon: <Star className="w-5 h-5" />, title: t("features.f3Title"), description: t("features.f3Desc") },
              { icon: <FlaskConical className="w-5 h-5" />, title: t("features.f4Title"), description: t("features.f4Desc") },
              { icon: <CalendarCheck className="w-5 h-5" />, title: t("features.f5Title"), description: t("features.f5Desc") },
              { icon: <HeartPulse className="w-5 h-5" />, title: t("features.f6Title"), description: t("features.f6Desc") },
            ].map((feature) => (
              <div
                key={feature.title}
                className="border border-[#E8ECF1] rounded-2xl p-6 hover:border-[#0D9488]/40 hover:shadow-md hover:shadow-teal-500/5 transition-all duration-300 bg-[#FAFBFC] group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] flex items-center justify-center text-[#0D9488] mb-4 group-hover:bg-[#0D9488] group-hover:text-white transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-heading text-lg font-semibold text-[#1A2332] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#5A6578] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Safety Section ── */}
      <section id="safety" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-[#F0FDFA] to-[#CCFBF1]/40 border border-[#99F6E4] rounded-3xl p-8 sm:p-12">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/80 text-[#0D9488] text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-[#99F6E4]">
                <Shield className="w-3.5 h-3.5" />
                {t("safety.badge")}
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A2332] mb-4">
                {t("safety.title")}
              </h2>
              <p className="text-[#5A6578] text-lg leading-relaxed mb-8">
                {t("safety.description")}
              </p>
              <div className="space-y-4">
                {(["p1", "p2", "p3", "p4", "p5"] as const).map((key) => (
                  <div key={key} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#0D9488] mt-0.5 flex-shrink-0" />
                    <span className="text-[#3D4B5F] text-sm sm:text-base">
                      {t(`safety.${key}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#FAFBFC]">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-gradient-to-br from-[#0D9488] to-[#0F766E] rounded-3xl p-6 sm:p-10 lg:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
                {t("cta.title")}
              </h2>
              <p className="text-teal-100 text-lg mb-8 max-w-2xl mx-auto">
                {t("cta.description")}
              </p>
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-teal-50 text-[#0D9488] font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
              >
                {t("cta.button")}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-teal-200 text-sm mt-4">{t("cta.subtext")}</p>
            </div>
          </div>
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
              <Link href="/blog" className="hover:text-[#0D9488] transition-colors">
                {t("footer.blog")}
              </Link>
              <Link href="/privacy" className="hover:text-[#0D9488] transition-colors">
                {t("footer.privacy")}
              </Link>
              <Link href="/terms" className="hover:text-[#0D9488] transition-colors">
                {t("footer.terms")}
              </Link>
              <Link href="/disclaimer" className="hover:text-[#0D9488] transition-colors">
                {t("footer.disclaimer")}
              </Link>
            </div>
          </div>

          <div className="border-t border-[#E8ECF1] pt-6 space-y-3">
            <p className="text-xs text-[#8896A8] leading-relaxed">
              <strong>{t("footer.medicalTitle")}</strong>{" "}
              {t("footer.medicalText")}
            </p>
            <p className="text-xs text-[#8896A8] leading-relaxed">
              <strong>{t("footer.affiliateTitle")}</strong>{" "}
              {t("footer.affiliateText")}
            </p>
            <p className="text-xs text-[#8896A8] leading-relaxed">
              <strong>{t("footer.aiTitle")}</strong>{" "}
              {t("footer.aiText")}
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
