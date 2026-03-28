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
  ExternalLink,
  TestTube,
} from "lucide-react";
import Link from "next/link";
import type { RecommendationResult, SupplementRecommendation } from "@/app/api/recommend/route";
import { getAmazonLink } from "@/lib/amazon-affiliate";
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

// ─── Amazon Buy Link ──────────────────────────────────────────────────────────

function AmazonBuyLink({ name, form }: { name: string; form?: string }) {
  return (
    <div className="mt-4 pt-4 border-t border-[#f0f3ff]">
      <a
        href={getAmazonLink(name, form)}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#00685f] hover:text-[#005249] transition-colors"
      >
        Find on Amazon
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
      <p className="text-[10px] text-[#B0B8C4] mt-1.5 leading-relaxed">
        As an Amazon Associate, Clareo Health earns from qualifying purchases. This doesn&apos;t affect our recommendations.
      </p>
    </div>
  );
}

// ─── Supplement Card ──────────────────────────────────────────────────────────

function SupplementCard({ supp }: { supp: SupplementRecommendation }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-black/5 ring-1 ring-black/[0.04] hover:shadow-md hover:ring-0 hover:scale-[1.005] transition-all duration-200">
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
          <div className="flex items-center gap-1.5 bg-[#F0FDFA] border border-[#99F6E4] text-[#005249] text-xs font-medium px-3 py-1.5 rounded-full">
            <FlaskConical className="w-3.5 h-3.5" />
            {supp.doseDisplay}
          </div>
          <div className="flex items-center gap-1.5 bg-[#f9f9ff] border border-[#ebebf5] text-[#5A6578] text-xs font-medium px-3 py-1.5 rounded-full">
            <Calendar className="w-3.5 h-3.5" />
            {supp.timing}
          </div>
          {supp.category && (
            <div className="flex items-center gap-1.5 bg-[#f9f9ff] border border-[#ebebf5] text-[#5A6578] text-xs font-medium px-3 py-1.5 rounded-full">
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
          className="flex items-center gap-2 text-[#00685f] text-sm font-medium hover:text-[#005249] transition-colors w-full text-left"
        >
          <Info className="w-4 h-4 flex-shrink-0" />
          {t("results.whyRecommendation")}
          {expanded ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
        </button>

        {expanded && (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-[#5A6578] leading-relaxed bg-[#f9f9ff] rounded-xl p-4 border border-[#ebebf5]">
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

        {/* Amazon Buy Link */}
        <AmazonBuyLink name={supp.name} form={supp.form} />
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
              <tr key={slot} className="border-t border-[#ebebf5]">
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
                        <div key={item.supplementId} className="bg-[#f0f3ff] rounded-lg px-2 py-1.5">
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
                  ? "bg-[#00685f] text-white"
                  : "bg-[#f0f3ff] text-[#5A6578]"
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
                      <div key={item.supplementId} className="bg-[#f0f3ff] rounded-xl px-4 py-3">
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
  const [pdfLoading, setPdfLoading] = useState(false);

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

  if (error) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-[#1A2332] font-medium mb-4">{error}</p>
          <button onClick={() => router.push("/quiz")} className="bg-[#00685f] text-white px-6 py-3 rounded-xl font-medium">
            {t("results.retakeQuiz")}
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[#f9f9ff]">
        {/* Skeleton header */}
        <div className="bg-white shadow-sm shadow-black/5 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-6 w-28 bg-slate-200 rounded animate-pulse" />
            <div className="w-24" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Skeleton hero */}
          <div className="bg-[#111c2c] rounded-2xl p-6 sm:p-8 animate-pulse">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex-shrink-0" />
              <div className="flex-1">
                <div className="h-3 w-32 bg-white/10 rounded mb-2" />
                <div className="h-7 w-64 bg-white/10 rounded mb-2" />
                <div className="h-4 w-48 bg-white/10 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="h-8 w-12 bg-white/10 rounded mx-auto mb-2" />
                  <div className="h-3 w-16 bg-white/10 rounded mx-auto" />
                </div>
              ))}
            </div>
          </div>
          {/* Skeleton supplement cards */}
          <div>
            <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-3 w-64 bg-slate-200 rounded animate-pulse mb-5" />
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex-shrink-0 mt-5" />
                  <div className="flex-1 bg-white rounded-2xl p-5 sm:p-6 ring-1 ring-black/[0.04]">
                    <div className="flex justify-between mb-3">
                      <div>
                        <div className="h-5 w-36 bg-slate-200 rounded mb-2" />
                        <div className="h-3 w-24 bg-slate-200 rounded" />
                      </div>
                      <div className="h-6 w-24 bg-slate-200 rounded-full" />
                    </div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-7 w-28 bg-slate-200 rounded-full" />
                      <div className="h-7 w-24 bg-slate-200 rounded-full" />
                    </div>
                    <div className="h-4 w-48 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center pt-4">
            <Loader2 className="w-5 h-5 text-[#00685f] animate-spin inline-block mr-2" />
            <span className="text-[#5A6578] text-sm">{t("results.loading")}</span>
          </div>
        </div>
      </div>
    );
  }

  async function handleDownloadPdf() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, userEmail }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `NutriGenius-Plan-${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Could not generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  }

  const { supplements, schedule, focusAreas, blockedSupplements } = result;
  const deficientLabs = getDeficientLabs(prefs.labResults);

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-sm shadow-black/5 sticky top-0 z-50">
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
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00685f] to-[#005249] flex items-center justify-center shadow-sm">
                <Leaf className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-heading text-base font-semibold tracking-tight text-[#1A2332]">
                Nutri<span className="text-[#00685f]">Genius</span>
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
          <div className="flex items-center gap-3 bg-[#e6f4f3] rounded-xl px-4 py-3">
            <Mail className="w-5 h-5 text-[#00685f] flex-shrink-0" />
            <p className="text-sm text-[#005249]">
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
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="inline-flex items-center gap-2 bg-[#00685f] hover:bg-[#005249] active:scale-95 disabled:bg-[#f9f9ff] disabled:border disabled:border-[#ebebf5] disabled:text-[#8896A8] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
          >
            {pdfLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF…</>
              : <><Download className="w-4 h-4" /> {t("results.downloadPdf")}</>
            }
          </button>
          <button
            disabled
            className="inline-flex items-center gap-2 bg-[#f9f9ff] border border-[#ebebf5] text-[#8896A8] text-sm font-medium px-4 py-2.5 rounded-xl cursor-not-allowed"
          >
            <Bell className="w-4 h-4" />
            {t("results.setReminders")}
            <span className="text-xs bg-[#E8ECF1] text-[#8896A8] px-2 py-0.5 rounded-full">
              {t("results.comingSoon")}
            </span>
          </button>
        </div>

        {/* Protocol Summary Hero */}
        <div className="bg-[#111c2c] rounded-2xl p-6 sm:p-8 text-white overflow-hidden relative">
          {/* Subtle background texture */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00685f]/10 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />

          <div className="relative">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-[#00685f]/20 border border-[#00685f]/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-[#2DD4BF]" />
              </div>
              <div>
                <p className="text-[#6B7E96] text-xs font-semibold uppercase tracking-wider mb-1">Your Personalized Protocol</p>
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white leading-tight">{t("results.heroTitle")}</h1>
                <p className="text-slate-400 mt-1 text-sm sm:text-base">{t("results.heroSubtitle")}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-white">{supplements.length}</div>
                <div className="text-slate-400 text-xs mt-1">{t("results.supplementsLabel")}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-white">
                  {supplements.filter((s) => s.evidenceRating === "Strong" || s.evidenceRating === "Moderate").length}
                </div>
                <div className="text-slate-400 text-xs mt-1">{t("results.evidenceLabel")}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-[#2DD4BF]">
                  {focusAreas.length > 0 ? focusAreas[0].split(" ")[0] : supplements.length}
                </div>
                <div className="text-slate-400 text-xs mt-1">
                  {focusAreas.length > 0 ? "Top Goal" : t("results.supplementsLabel")}
                </div>
              </div>
            </div>

            {focusAreas.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-slate-500 text-xs mb-2">{t("results.keyFocusAreas")}</p>
                <div className="flex flex-wrap gap-2">
                  {focusAreas.map((area) => (
                    <span key={area} className="bg-[#00685f]/20 border border-[#00685f]/30 text-[#2DD4BF] text-xs font-medium px-3 py-1 rounded-full">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Supplements */}
        <section>
          <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-1">{t("results.protocolTitle")}</h2>
          <p className="text-sm text-[#5A6578] mb-5">{t("results.protocolSubtitle")}</p>
          {supplements.length === 0 ? (
            <div className="bg-white border border-[#ebebf5] rounded-2xl p-8 text-center">
              <FlaskConical className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
              <p className="text-[#5A6578]">{t("results.noSupplements")}</p>
              <p className="text-sm text-[#8896A8] mt-1">{t("results.noSupplementsHint")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {supplements.map((supp, i) => (
                <div key={supp.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#F0FDFA] border border-[#99F6E4] text-[#00685f] flex items-center justify-center text-sm font-bold flex-shrink-0 mt-5">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <SupplementCard supp={supp} />
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
                  <div key={lab.biomarker} className="bg-white border border-[#ebebf5] rounded-xl p-4 flex items-start justify-between gap-4">
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
                      className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-[#00685f] border border-[#00685f]/30 bg-[#F0FDFA] hover:bg-[#CCFBF1] px-3 py-1.5 rounded-lg transition-colors"
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
            <div className="bg-white border border-[#ebebf5] rounded-2xl p-4 sm:p-6 overflow-hidden">
              <WeeklySchedule schedule={schedule} supplements={supplements} />
            </div>
          </section>
        )}

        {/* Evidence legend */}
        <section className="bg-white border border-[#ebebf5] rounded-2xl p-5 sm:p-6">
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
        <section className="bg-white border border-[#ebebf5] rounded-2xl p-5 sm:p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-5 h-5 text-[#00685f]" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-semibold text-[#1A2332] mb-1">{t("results.updateTitle")}</h3>
            <p className="text-sm text-[#5A6578] leading-relaxed">{t("results.updateDesc")}</p>
            <button
              onClick={() => router.push("/quiz")}
              className="mt-3 text-sm font-medium text-[#00685f] hover:text-[#005249] transition-colors flex items-center gap-1"
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

      {/* Footer */}
      <footer className="border-t border-[#ebebf5] bg-white py-8 px-4 sm:px-6 mt-8">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-[#8896A8]">
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy" className="hover:text-[#00685f] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#00685f] transition-colors">Terms of Service</Link>
            <Link href="/disclaimer" className="hover:text-[#00685f] transition-colors">Medical Disclaimer</Link>
          </div>
          <span>© {new Date().getFullYear()} NutriGenius. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
