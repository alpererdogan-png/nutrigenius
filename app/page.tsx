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
  Clock,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] text-[#1A2332]">
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
          <div className="hidden sm:flex items-center gap-6 text-sm text-[#5A6578]">
            <Link href="#how-it-works" className="hover:text-[#0D9488] transition-colors duration-200">
              How It Works
            </Link>
            <Link href="#features" className="hover:text-[#0D9488] transition-colors duration-200">
              Features
            </Link>
            <Link href="#safety" className="hover:text-[#0D9488] transition-colors duration-200">
              Safety
            </Link>
            <Link href="/blog" className="hover:text-[#0D9488] transition-colors duration-200">
              Blog
            </Link>
          </div>
          <Link
            href="/quiz"
            className="bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-teal-500/20"
          >
            Get Your Free Plan
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#F0FDFA] via-[#CCFBF1]/30 to-transparent rounded-full translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#F0FDFA]/50 to-transparent rounded-full -translate-x-1/4 translate-y-1/4" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `radial-gradient(circle, #0D9488 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <Shield className="w-3.5 h-3.5" />
              Evidence-Based · Clinician-Designed · Free
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[#1A2332] mb-6">
              Your supplements,{" "}
              <span className="text-[#0D9488] relative">
                backed by science
                <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 300 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M0 4C75 1 150 5 225 2C262.5 0.5 281.25 3.5 300 2" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
                </svg>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#5A6578] leading-relaxed mb-8 max-w-2xl">
              Complete a 5-minute health assessment and receive a personalized
              supplement plan — with doses, timing, interactions checked,
              and evidence ratings for every recommendation.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold px-6 py-3.5 rounded-xl text-base transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/25 hover:-translate-y-0.5"
              >
                Get Your Free Plan
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#1A2332] font-medium px-6 py-3.5 rounded-xl text-base transition-all duration-200 hover:border-[#CBD5E1] hover:shadow-sm"
              >
                See How It Works
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-sm text-[#5A6578]">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1">
                  {["bg-teal-400", "bg-blue-400", "bg-purple-400"].map((c, i) => (
                    <div key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-white`} />
                  ))}
                </div>
                <span className="font-medium text-[#1A2332]">10,000+</span> users optimizing their health with science
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
                No account required
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
                5 minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="border-y border-[#E8ECF1] bg-white py-5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-12 text-sm text-[#5A6578]">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-[#0D9488]" />
            Built on peer-reviewed research
          </div>
          <div className="hidden sm:block w-px h-4 bg-[#E8ECF1]" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#0D9488]" />
            Drug interaction safety checks
          </div>
          <div className="hidden sm:block w-px h-4 bg-[#E8ECF1]" />
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-[#0D9488]" />
            Clinician-Designed &amp; Evidence-Based
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A2332] mb-4">
              How NutriGenius works
            </h2>
            <p className="text-[#5A6578] text-lg max-w-2xl mx-auto">
              A systematic, evidence-based approach to supplement
              recommendations — not guesswork.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                icon: <Pill className="w-5 h-5" />,
                title: "Health Assessment",
                description:
                  "Answer questions about your health, medications, lifestyle, and goals. Add lab results or genetic data for even better results.",
              },
              {
                step: "02",
                icon: <FlaskConical className="w-5 h-5" />,
                title: "Evidence Matching",
                description:
                  "Our algorithm searches a curated knowledge base of supplement-condition mappings, each rated by evidence strength.",
              },
              {
                step: "03",
                icon: <Shield className="w-5 h-5" />,
                title: "Safety Screening",
                description:
                  "Every recommendation is cross-checked against your medications for interactions. Unsafe combinations are automatically blocked.",
              },
              {
                step: "04",
                icon: <CalendarCheck className="w-5 h-5" />,
                title: "Your Plan",
                description:
                  "Receive a personalized plan with 5-8 supplements, optimal doses, timing schedule, and clear explanations for each one.",
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
                    Step {item.step}
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
              What makes us different
            </h2>
            <p className="text-[#5A6578] text-lg max-w-2xl mx-auto">
              Most supplement recommendations are marketing-driven.
              Ours are clinically-driven.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Brain className="w-5 h-5" />,
                title: "Deterministic Algorithm",
                description:
                  "Not a chatbot making guesses. A structured rules engine with a curated clinical knowledge base drives every recommendation.",
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: "Drug Interaction Checks",
                description:
                  "Every supplement is screened against your medications. Critical interactions are blocked. Moderate ones are flagged with clear warnings.",
              },
              {
                icon: <Star className="w-5 h-5" />,
                title: "Evidence Ratings",
                description:
                  "Each recommendation shows its evidence level — Strong, Moderate, Emerging, or Traditional — so you know exactly what the science says.",
              },
              {
                icon: <FlaskConical className="w-5 h-5" />,
                title: "Lab-Informed Dosing",
                description:
                  "Upload your blood work results and get recommendations calibrated to your actual biomarker levels, not generic doses.",
              },
              {
                icon: <CalendarCheck className="w-5 h-5" />,
                title: "Visual Weekly Schedule",
                description:
                  "See exactly what to take and when — morning, midday, evening — with timing optimized for absorption and your daily routine.",
              },
              {
                icon: <HeartPulse className="w-5 h-5" />,
                title: "Genetic Personalization",
                description:
                  "Have genetic data? MTHFR, COMT, VDR, and other variants are used to select the right supplement forms for your biology.",
              },
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
                Safety First
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A2332] mb-4">
                Your safety is non-negotiable
              </h2>
              <p className="text-[#5A6578] text-lg leading-relaxed mb-8">
                NutriGenius was designed by a Clinical Pharmacology Expert with
                pharmaceutical clinical development experience. Every recommendation passes through
                multiple safety layers before it reaches you.
              </p>
              <div className="space-y-4">
                {[
                  "Supplements with critical drug interactions are automatically blocked",
                  "Doses never exceed established Upper Tolerable Intake Levels",
                  "Pregnancy and breastfeeding restrictions are strictly enforced",
                  "All recommendations include evidence ratings and source transparency",
                  "This platform supplements — never replaces — professional medical advice",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#0D9488] mt-0.5 flex-shrink-0" />
                    <span className="text-[#3D4B5F] text-sm sm:text-base">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Blog Preview Section ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] text-xs font-medium px-3 py-1.5 rounded-full mb-4">
                <BookOpen className="w-3.5 h-3.5" />
                Health Intelligence
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A2332]">
                Latest Health Insights
              </h2>
              <p className="text-[#5A6578] mt-2 text-lg">
                Evidence-reviewed articles to guide smarter supplement decisions.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[#0D9488] font-medium hover:text-[#0F766E] transition-colors text-sm flex-shrink-0"
            >
              View All Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                category: "Evidence Review",
                categoryColor: "bg-blue-50 text-blue-700 border-blue-200",
                title: "The Complete Guide to Magnesium: Forms, Doses, and What the Science Actually Says",
                excerpt: "Not all magnesium is created equal. We break down glycinate vs. citrate vs. oxide — and the research behind each form's specific benefits.",
                readTime: "8 min read",
                accent: "from-blue-500/10 to-blue-500/5",
              },
              {
                category: "Myth Busting",
                categoryColor: "bg-amber-50 text-amber-700 border-amber-200",
                title: "5 Supplement Myths Your Doctor Didn't Learn in Medical School",
                excerpt: "From 'more is always better' to 'vitamins are harmless' — five widespread supplement myths that may actually be harming your health.",
                readTime: "6 min read",
                accent: "from-amber-500/10 to-amber-500/5",
              },
              {
                category: "Interaction Alert",
                categoryColor: "bg-red-50 text-red-700 border-red-200",
                title: "Supplements That Don't Mix: Critical Interactions You Need to Know",
                excerpt: "Iron and calcium compete for absorption. St John's Wort can reduce contraceptive effectiveness. Learn the interactions that matter.",
                readTime: "7 min read",
                accent: "from-red-500/10 to-red-500/5",
              },
            ].map((article) => (
              <article
                key={article.title}
                className="group bg-white border border-[#E8ECF1] rounded-2xl overflow-hidden hover:border-[#0D9488]/30 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className={`h-2 bg-gradient-to-r ${article.accent} w-full`} />
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${article.categoryColor}`}>
                      <Zap className="w-3 h-3 mr-1" />
                      {article.category}
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-[#1A2332] mb-3 leading-snug group-hover:text-[#0D9488] transition-colors duration-200 line-clamp-3">
                    {article.title}
                  </h3>
                  <p className="text-sm text-[#5A6578] leading-relaxed mb-5 line-clamp-2 flex-1">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-[#E8ECF1]">
                    <div className="flex items-center gap-1.5 text-xs text-[#8896A8]">
                      <Clock className="w-3.5 h-3.5" />
                      {article.readTime}
                    </div>
                    <Link
                      href="/blog"
                      className="text-xs font-medium text-[#0D9488] hover:text-[#0F766E] flex items-center gap-1 transition-colors"
                    >
                      Read more
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 bg-[#F0FDFA] hover:bg-[#CCFBF1] border border-[#99F6E4] text-[#0D9488] font-medium px-6 py-3 rounded-xl text-sm transition-all duration-200 hover:shadow-sm"
            >
              View All Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#FAFBFC]">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-gradient-to-br from-[#0D9488] to-[#0F766E] rounded-3xl p-10 sm:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to optimize your supplement routine?
              </h2>
              <p className="text-teal-100 text-lg mb-8 max-w-2xl mx-auto">
                Join 10,000+ users who have replaced guesswork with
                evidence-based supplementation. It takes 5 minutes and it&apos;s
                completely free.
              </p>
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-teal-50 text-[#0D9488] font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
              >
                Get Your Free Plan
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-teal-200 text-sm mt-4">No account required · 100% free · Takes 5 minutes</p>
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
                Blog
              </Link>
              <Link href="/privacy" className="hover:text-[#0D9488] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[#0D9488] transition-colors">
                Terms of Service
              </Link>
              <Link href="/disclaimer" className="hover:text-[#0D9488] transition-colors">
                Medical Disclaimer
              </Link>
            </div>
          </div>

          <div className="border-t border-[#E8ECF1] pt-6 space-y-3">
            <p className="text-xs text-[#8896A8] leading-relaxed">
              <strong>Medical Disclaimer:</strong> NutriGenius provides
              educational information based on published scientific evidence.
              It is not a substitute for professional medical advice, diagnosis,
              or treatment. Always consult your healthcare provider before
              starting any supplement regimen.
            </p>
            <p className="text-xs text-[#8896A8] leading-relaxed">
              <strong>Affiliate Disclosure:</strong> We may earn commissions
              from purchases made through links on this platform. This does not
              affect the price you pay or our recommendations.
            </p>
            <p className="text-xs text-[#8896A8] leading-relaxed">
              <strong>AI Transparency:</strong> Recommendations are generated
              by an AI system based on published scientific evidence and a
              structured clinical knowledge base.
            </p>
            <p className="text-xs text-[#8896A8] mt-4">
              © {new Date().getFullYear()} NutriGenius. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
