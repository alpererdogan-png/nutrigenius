"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Leaf,
  Calendar,
  FlaskConical,
  ArrowLeft,
  Loader2,
  Info,
  Download,
  Bell,
  Mail,
  RefreshCw,
  ShoppingCart,
  ExternalLink,
  BadgeCheck,
  Star,
  TestTube,
} from "lucide-react";
import Link from "next/link";
import type { RecommendationResult, SupplementRecommendation } from "@/app/api/recommend/route";
import type { AffiliateProduct } from "@/app/api/affiliate-products/route";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/language-context";

// ─── Lab deficiency thresholds (mirrors recommend route) ─────────────────────

const LAB_RETEST_MAP: Record<string, { threshold: number; label: string }> = {
  "Vitamin D (25-OH)": { threshold: 30,  label: "Vitamin D" },
  "Vitamin B12":       { threshold: 300, label: "Vitamin B12" },
  "Ferritin":          { threshold: 30,  label: "Ferritin (Iron)" },
  "Folate":            { threshold: 3,   label: "Folate" },
  "Magnesium":         { threshold: 1.7, label: "Magnesium" },
  "Zinc":              { threshold: 70,  label: "Zinc" },
  "Omega-3 Index":     { threshold: 8,   label: "Omega-3 Index" },
};

type LabResult = { biomarker: string; value: string; unit: string; testDate: string };

function getDeficientLabs(labResults: LabResult[]): LabResult[] {
  return labResults.filter((r) => {
    const rule = LAB_RETEST_MAP[r.biomarker];
    if (!rule || !r.value) return false;
    const val = parseFloat(r.value);
    return !isNaN(val) && val < rule.threshold;
  });
}

// ─── Name normaliser for affiliate lookup ─────────────────────────────────────

// These map engine supplement names (from DB) to the lookup key used with the affiliate API.
// Keep in sync with the SUPPLEMENT_ALIAS in app/api/affiliate-products/route.ts.
const SUPPLEMENT_ALIAS: Record<string, string> = {
  "methylfolate": "Folate",
  "vitamin d":    "Vitamin D3",
  "fish oil":     "Omega-3 Fatty Acids",
  "omega-3":      "Omega-3 Fatty Acids",
  "inositol":     "Myo-Inositol",
  "lion's mane":  "Lions Mane",
  "lions mane":   "Lions Mane",
  "coenzyme q10": "Coenzyme Q10",
  "coq10":        "Coenzyme Q10",
  "rhodiola":     "Rhodiola Rosea",
  "collagen":     "Collagen Peptides",
};

function normalizeForAffiliate(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(SUPPLEMENT_ALIAS)) {
    if (lower === key || lower.includes(key)) return val;
  }
  return name;
}

// ─── Evidence styles ─────────────────────────────────────────────────────────

const EVIDENCE_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Strong:      { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200", dot: "bg-green-500" },
  Moderate:    { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",  dot: "bg-blue-500" },
  Emerging:    { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200", dot: "bg-amber-500" },
  Traditional: { bg: "bg-gray-50",   text: "text-gray-600",   border: "border-gray-200",  dot: "bg-gray-400" },
};

const EVIDENCE_TRANSLATION_KEYS: Record<string, { label: string; desc: string }> = {
  Strong:      { label: "results.evidenceStrong",      desc: "results.evidenceStrongDesc" },
  Moderate:    { label: "results.evidenceModerate",    desc: "results.evidenceModerateDesc" },
  Emerging:    { label: "results.evidenceEmerging",    desc: "results.evidenceEmergingDesc" },
  Traditional: { label: "results.evidenceTraditional", desc: "results.evidenceTraditionalDesc" },
};

function EvidenceBadge({ rating }: { rating: string }) {
  const { t } = useLanguage();
  const s = EVIDENCE_STYLES[rating] ?? EVIDENCE_STYLES.Traditional;
  const keys = EVIDENCE_TRANSLATION_KEYS[rating] ?? EVIDENCE_TRANSLATION_KEYS.Traditional;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {t(keys.label)} {t("results.evidenceSuffix")}
    </span>
  );
}

// ─── Where to Buy ─────────────────────────────────────────────────────────────

function WhereToBuy({ products, halalFirst }: { products: AffiliateProduct[]; halalFirst: boolean }) {
  if (products.length === 0) return null;

  const sorted = halalFirst
    ? [...products.filter((p) => p.halal_certified), ...products.filter((p) => !p.halal_certified)]
    : products;

  return (
    <div className="mt-4 pt-4 border-t border-[#E8ECF1]">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingCart className="w-4 h-4 text-[#0D9488]" />
        <span className="text-sm font-medium text-[#1A2332]">Where to Buy</span>
      </div>

      <div className="space-y-2">
        {sorted.slice(0, 3).map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between gap-3 bg-[#F8FAFC] border border-[#E8ECF1] rounded-xl px-3 py-2.5 hover:border-[#0D9488]/30 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-[#1A2332]">{product.brand}</span>
                {product.quality_verified && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full">
                    <BadgeCheck className="w-2.5 h-2.5" />
                    Verified
                  </span>
                )}
                {product.halal_certified && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                    <Star className="w-2.5 h-2.5" />
                    Halal
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#5A6578] truncate mt-0.5">{product.product_name}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-semibold text-[#1A2332]">
                ${product.price_usd.toFixed(2)}
              </span>
              <a
                href={product.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                Buy
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-[#B0B8C4] mt-2 leading-relaxed">
        Affiliate disclosure: We may earn a small commission from purchases via these links.
        This doesn&apos;t affect the price you pay or our recommendations.
      </p>
    </div>
  );
}

// ─── Supplement Card ──────────────────────────────────────────────────────────

function SupplementCard({
  supp,
  products,
  halalFirst,
}: {
  supp: SupplementRecommendation;
  products: AffiliateProduct[];
  halalFirst: boolean;
}) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-[#E8ECF1] rounded-2xl overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-lg font-semibold text-[#1A2332]">{supp.name}</h3>
            <p className="text-sm text-[#5A6578] mt-0.5">{supp.form}</p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <EvidenceBadge rating={supp.evidenceRating} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1.5 bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] text-xs font-medium px-3 py-1.5 rounded-full">
            <FlaskConical className="w-3.5 h-3.5" />
            {supp.doseDisplay}
          </div>
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E8ECF1] text-[#5A6578] text-xs font-medium px-3 py-1.5 rounded-full">
            <Calendar className="w-3.5 h-3.5" />
            {supp.timing}
          </div>
          {supp.category && (
            <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E8ECF1] text-[#5A6578] text-xs font-medium px-3 py-1.5 rounded-full">
              {supp.category}
            </div>
          )}
        </div>

        {supp.warnings.length > 0 && (
          <div className="mb-4 space-y-1.5">
            {supp.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">{w}</p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-[#0D9488] text-sm font-medium hover:text-[#0F766E] transition-colors w-full text-left"
        >
          <Info className="w-4 h-4 flex-shrink-0" />
          {t("results.whyRecommendation")}
          {expanded ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
        </button>

        {expanded && (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-[#5A6578] leading-relaxed bg-[#F8FAFC] rounded-xl p-4 border border-[#E8ECF1]">
              {supp.whyRecommended}
            </p>

            {supp.foodSources.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-[#1A2332]">
                    {t("results.naturalSources")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {supp.foodSources.map((f) => (
                    <span key={f} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Where to Buy */}
        <WhereToBuy products={products} halalFirst={halalFirst} />
      </div>
    </div>
  );
}

// ─── Weekly Schedule ──────────────────────────────────────────────────────────

function WeeklySchedule({
  schedule,
  supplements,
}: {
  schedule: RecommendationResult["schedule"];
  supplements: SupplementRecommendation[];
}) {
  const { t } = useLanguage();

  const DAYS_FULL = [
    t("results.monday"), t("results.tuesday"), t("results.wednesday"),
    t("results.thursday"), t("results.friday"), t("results.saturday"), t("results.sunday"),
  ];
  const DAYS_SHORT = [
    t("results.mon"), t("results.tue"), t("results.wed"),
    t("results.thu"), t("results.fri"), t("results.sat"), t("results.sun"),
  ];
  const DAYS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const SLOTS_EN = ["Morning", "Midday", "Evening"] as const;
  const SLOT_LABELS: Record<string, string> = {
    Morning: t("results.morning"),
    Midday: t("results.midday"),
    Evening: t("results.evening"),
  };

  const slotColors: Record<string, string> = {
    Morning: "bg-amber-50 border-amber-200 text-amber-800",
    Midday:  "bg-blue-50 border-blue-200 text-blue-800",
    Evening: "bg-indigo-50 border-indigo-200 text-indigo-800",
  };
  const slotDotColors: Record<string, string> = {
    Morning: "bg-amber-400",
    Midday:  "bg-blue-400",
    Evening: "bg-indigo-400",
  };

  const [activeDay, setActiveDay] = useState(0);

  return (
    <div>
      {/* Desktop: full grid */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-[#8896A8] px-3 py-2 w-24">
                {t("results.slotLabel")}
              </th>
              {DAYS_FULL.map((day) => (
                <th key={day} className="text-center text-xs font-medium text-[#1A2332] px-2 py-2">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOTS_EN.map((slot) => (
              <tr key={slot} className="border-t border-[#E8ECF1]">
                <td className="px-3 py-3 align-top">
                  <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border ${slotColors[slot]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${slotDotColors[slot]}`} />
                    {SLOT_LABELS[slot]}
                  </div>
                </td>
                {DAYS_EN.map((day) => (
                  <td key={day} className="px-2 py-3 align-top">
                    <div className="space-y-1.5">
                      {(schedule[day]?.[slot] ?? []).map((item) => (
                        <div key={item.supplementId} className="bg-[#F8FAFC] border border-[#E8ECF1] rounded-lg px-2 py-1.5">
                          <p className="text-xs font-medium text-[#1A2332] leading-tight">{item.name}</p>
                          <p className="text-[10px] text-[#8896A8] mt-0.5">{item.dose}</p>
                        </div>
                      ))}
                      {(schedule[day]?.[slot] ?? []).length === 0 && (
                        <span className="text-[10px] text-[#CBD5E1]">—</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: day tabs */}
      <div className="lg:hidden">
        <div className="flex gap-1 overflow-x-auto pb-2 mb-4 no-scrollbar">
          {DAYS_SHORT.map((d, i) => (
            <button
              key={d}
              onClick={() => setActiveDay(i)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeDay === i
                  ? "bg-[#0D9488] text-white"
                  : "bg-[#F8FAFC] border border-[#E8ECF1] text-[#5A6578]"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {SLOTS_EN.map((slot) => {
            const items = schedule[DAYS_EN[activeDay]]?.[slot] ?? [];
            return (
              <div key={slot}>
                <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border mb-2 ${slotColors[slot]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${slotDotColors[slot]}`} />
                  {SLOT_LABELS[slot]}
                </div>
                {items.length === 0 ? (
                  <p className="text-sm text-[#B0B8C4] pl-1">{t("results.nothingScheduled")}</p>
                ) : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.supplementId} className="bg-[#F8FAFC] border border-[#E8ECF1] rounded-xl px-4 py-3">
                        <p className="text-sm font-medium text-[#1A2332]">{item.name}</p>
                        <p className="text-xs text-[#5A6578] mt-0.5">{item.dose} · {item.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Results Page ─────────────────────────────────────────────────────────────

type UserPrefs = {
  country: string;
  halalPreference: boolean;
  labResults: LabResult[];
};

export default function ResultsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<UserPrefs>({ country: "", halalPreference: false, labResults: [] });
  const [affiliateProducts, setAffiliateProducts] = useState<Record<string, AffiliateProduct[]>>({});

  useEffect(() => {
    const raw = sessionStorage.getItem("nutrigenius_recommendations");
    const email = sessionStorage.getItem("nutrigenius_email");
    const rawPrefs = sessionStorage.getItem("nutrigenius_prefs");

    if (!raw) {
      router.replace("/quiz");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as RecommendationResult;
      setResult(parsed);
      setUserEmail(email);

      if (rawPrefs) {
        const parsedPrefs = JSON.parse(rawPrefs) as UserPrefs;
        setPrefs(parsedPrefs);
      }
    } catch {
      setError(t("results.loadError"));
    }
  }, [router, t]);

  // Fetch affiliate products once recommendations are loaded
  useEffect(() => {
    if (!result || result.supplements.length === 0) return;

    const names = result.supplements.map((s) => normalizeForAffiliate(s.name));
    const params = new URLSearchParams({
      names: names.join(","),
      country: prefs.country ?? "",
      halal: prefs.halalPreference ? "true" : "false",
    });

    fetch(`/api/affiliate-products?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: Record<string, AffiliateProduct[]>) => {
        setAffiliateProducts(data);
      })
      .catch(() => {});
  }, [result, prefs]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-[#1A2332] font-medium mb-4">{error}</p>
          <button onClick={() => router.push("/quiz")} className="bg-[#0D9488] text-white px-6 py-3 rounded-xl font-medium">
            {t("results.retakeQuiz")}
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#0D9488] animate-spin mx-auto mb-3" />
          <p className="text-[#5A6578] text-sm">{t("results.loading")}</p>
        </div>
      </div>
    );
  }

  const { supplements, schedule, focusAreas, blockedSupplements } = result;
  const deficientLabs = getDeficientLabs(prefs.labResults);

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8ECF1] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/quiz")}
            className="flex items-center gap-2 text-[#5A6578] hover:text-[#1A2332] text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("results.retakeQuiz")}
          </button>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center shadow-sm">
                <Leaf className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-heading text-base font-semibold tracking-tight text-[#1A2332]">
                Nutri<span className="text-[#0D9488]">Genius</span>
              </span>
            </Link>
            <LanguageSwitcher />
          </div>
          <div className="w-24" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Email confirmation banner */}
        {userEmail && (
          <div className="flex items-center gap-3 bg-[#F0FDFA] border border-[#99F6E4] rounded-xl px-4 py-3">
            <Mail className="w-5 h-5 text-[#0D9488] flex-shrink-0" />
            <p className="text-sm text-[#0F766E]">
              <span className="font-medium">
                {t("results.planSentTo", { email: userEmail })}
              </span>{" "}
              {t("results.checkInbox")}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            disabled
            className="inline-flex items-center gap-2 bg-[#F8FAFC] border border-[#E8ECF1] text-[#8896A8] text-sm font-medium px-4 py-2.5 rounded-xl cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {t("results.downloadPdf")}
            <span className="text-xs bg-[#E8ECF1] text-[#8896A8] px-2 py-0.5 rounded-full">
              {t("results.comingSoon")}
            </span>
          </button>
          <button
            disabled
            className="inline-flex items-center gap-2 bg-[#F8FAFC] border border-[#E8ECF1] text-[#8896A8] text-sm font-medium px-4 py-2.5 rounded-xl cursor-not-allowed"
          >
            <Bell className="w-4 h-4" />
            {t("results.setReminders")}
            <span className="text-xs bg-[#E8ECF1] text-[#8896A8] px-2 py-0.5 rounded-full">
              {t("results.comingSoon")}
            </span>
          </button>
        </div>

        {/* Hero summary */}
        <div className="bg-gradient-to-br from-[#0D9488] to-[#0F766E] rounded-2xl p-6 sm:p-8 text-white">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold">{t("results.heroTitle")}</h1>
              <p className="text-teal-100 mt-1 text-sm sm:text-base">{t("results.heroSubtitle")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white/15 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{supplements.length}</div>
              <div className="text-teal-100 text-xs mt-1">{t("results.supplementsLabel")}</div>
            </div>
            <div className="bg-white/15 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">
                {supplements.filter((s) => s.evidenceRating === "Strong" || s.evidenceRating === "Moderate").length}
              </div>
              <div className="text-teal-100 text-xs mt-1">{t("results.evidenceLabel")}</div>
            </div>
            <div className="bg-white/15 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
              <div className="text-3xl font-bold">{blockedSupplements.length}</div>
              <div className="text-teal-100 text-xs mt-1">{t("results.safetyLabel")}</div>
            </div>
          </div>

          {focusAreas.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-teal-100 text-xs mb-2">{t("results.keyFocusAreas")}</p>
              <div className="flex flex-wrap gap-2">
                {focusAreas.map((area) => (
                  <span key={area} className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Supplements */}
        <section>
          <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-1">{t("results.protocolTitle")}</h2>
          <p className="text-sm text-[#5A6578] mb-5">{t("results.protocolSubtitle")}</p>
          {supplements.length === 0 ? (
            <div className="bg-white border border-[#E8ECF1] rounded-2xl p-8 text-center">
              <FlaskConical className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
              <p className="text-[#5A6578]">{t("results.noSupplements")}</p>
              <p className="text-sm text-[#8896A8] mt-1">{t("results.noSupplementsHint")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {supplements.map((supp, i) => (
                <div key={supp.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#F0FDFA] border border-[#99F6E4] text-[#0D9488] flex items-center justify-center text-sm font-bold flex-shrink-0 mt-5">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <SupplementCard
                      supp={supp}
                      products={affiliateProducts[normalizeForAffiliate(supp.name)] ?? []}
                      halalFirst={prefs.halalPreference}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Lab Retest Prompts */}
        {deficientLabs.length > 0 && (
          <section>
            <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-1">Lab Retest Reminders</h2>
            <p className="text-sm text-[#5A6578] mb-4">
              Based on your entered lab values, we recommend retesting these biomarkers in 3 months to track progress.
            </p>
            <div className="space-y-3">
              {deficientLabs.map((lab) => {
                const rule = LAB_RETEST_MAP[lab.biomarker];
                return (
                  <div key={lab.biomarker} className="bg-white border border-[#E8ECF1] rounded-xl p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <TestTube className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1A2332]">
                          Your {rule?.label ?? lab.biomarker} is{" "}
                          <span className="text-red-600 font-semibold">{lab.value} {lab.unit}</span>
                          {" "}(below optimal range)
                        </p>
                        <p className="text-xs text-[#5A6578] mt-0.5">
                          We recommend retesting in 3 months after starting supplementation.
                        </p>
                      </div>
                    </div>
                    <a
                      href="#lab-testing"
                      className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-[#0D9488] border border-[#0D9488]/30 bg-[#F0FDFA] hover:bg-[#CCFBF1] px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Find a Lab
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Blocked supplements */}
        {blockedSupplements.length > 0 && (
          <section>
            <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-1">
              {t("results.safetyFilteredTitle")}
            </h2>
            <p className="text-sm text-[#5A6578] mb-4">{t("results.safetyFilteredSubtitle")}</p>
            <div className="space-y-2">
              {blockedSupplements.map((b, i) => (
                <div key={i} className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-red-800">{b.name}</span>
                    <p className="text-xs text-red-600 mt-0.5">{b.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Weekly schedule */}
        {supplements.length > 0 && (
          <section>
            <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-1">{t("results.scheduleTitle")}</h2>
            <p className="text-sm text-[#5A6578] mb-5">{t("results.scheduleSubtitle")}</p>
            <div className="bg-white border border-[#E8ECF1] rounded-2xl p-4 sm:p-6 overflow-hidden">
              <WeeklySchedule schedule={schedule} supplements={supplements} />
            </div>
          </section>
        )}

        {/* Evidence legend */}
        <section className="bg-white border border-[#E8ECF1] rounded-2xl p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-[#1A2332] mb-3">{t("results.evidenceGuideTitle")}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["Strong", "Moderate", "Emerging", "Traditional"] as const).map((r) => {
              const s = EVIDENCE_STYLES[r];
              const keys = EVIDENCE_TRANSLATION_KEYS[r];
              return (
                <div key={r} className={`rounded-xl border p-3 ${s.bg} ${s.border}`}>
                  <div className={`text-sm font-semibold ${s.text}`}>{t(keys.label)}</div>
                  <p className="text-xs text-[#5A6578] mt-1">{t(keys.desc)}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Retake section */}
        <section className="bg-white border border-[#E8ECF1] rounded-2xl p-5 sm:p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-semibold text-[#1A2332] mb-1">{t("results.updateTitle")}</h3>
            <p className="text-sm text-[#5A6578] leading-relaxed">{t("results.updateDesc")}</p>
            <button
              onClick={() => router.push("/quiz")}
              className="mt-3 text-sm font-medium text-[#0D9488] hover:text-[#0F766E] transition-colors flex items-center gap-1"
            >
              {t("results.retakeAssessment")}
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-2xl p-5 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-[#B45309] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#92400E]">{t("results.disclaimerTitle")}</p>
            <p className="text-xs text-[#A16207] mt-1 leading-relaxed">{t("results.disclaimerText")}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
