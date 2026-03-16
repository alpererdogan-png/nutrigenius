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
} from "lucide-react";
import type { RecommendationResult, SupplementRecommendation } from "@/app/api/recommend/route";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const EVIDENCE_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Strong:      { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200", dot: "bg-green-500" },
  Moderate:    { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",  dot: "bg-blue-500" },
  Emerging:    { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200", dot: "bg-amber-500" },
  Traditional: { bg: "bg-gray-50",   text: "text-gray-600",   border: "border-gray-200",  dot: "bg-gray-400" },
};

function EvidenceBadge({ rating }: { rating: string }) {
  const s = EVIDENCE_STYLES[rating] ?? EVIDENCE_STYLES.Traditional;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {rating} Evidence
    </span>
  );
}

function SupplementCard({ supp }: { supp: SupplementRecommendation }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-[#E8ECF1] rounded-2xl overflow-hidden">
      <div className="p-5 sm:p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-lg font-semibold text-[#1A2332]">{supp.name}</h3>
            <p className="text-sm text-[#5A6578] mt-0.5">{supp.form}</p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <EvidenceBadge rating={supp.evidenceRating} />
          </div>
        </div>

        {/* Dose & timing chips */}
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

        {/* Warnings */}
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

        {/* Why recommended — expandable */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-[#0D9488] text-sm font-medium hover:text-[#0F766E] transition-colors w-full text-left"
        >
          <Info className="w-4 h-4 flex-shrink-0" />
          Why this recommendation?
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
                  <span className="text-sm font-medium text-[#1A2332]">Natural food sources</span>
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
      </div>
    </div>
  );
}

function WeeklySchedule({ schedule, supplements }: { schedule: RecommendationResult["schedule"]; supplements: SupplementRecommendation[] }) {
  const slots = ["Morning", "Midday", "Evening"] as const;
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

  // Mobile: show one day at a time
  const [activeDay, setActiveDay] = useState(0);

  return (
    <div>
      {/* Desktop: full grid */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-[#8896A8] px-3 py-2 w-24">Slot</th>
              {DAYS.map((day) => (
                <th key={day} className="text-center text-xs font-medium text-[#1A2332] px-2 py-2">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot} className="border-t border-[#E8ECF1]">
                <td className="px-3 py-3 align-top">
                  <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border ${slotColors[slot]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${slotDotColors[slot]}`} />
                    {slot}
                  </div>
                </td>
                {DAYS.map((day) => (
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
          {slots.map((slot) => {
            const items = schedule[DAYS[activeDay]]?.[slot] ?? [];
            return (
              <div key={slot}>
                <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border mb-2 ${slotColors[slot]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${slotDotColors[slot]}`} />
                  {slot}
                </div>
                {items.length === 0 ? (
                  <p className="text-sm text-[#B0B8C4] pl-1">Nothing scheduled</p>
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

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("nutrigenius_recommendations");
    if (!raw) {
      router.replace("/quiz");
      return;
    }
    try {
      setResult(JSON.parse(raw));
    } catch {
      setError("Could not load your recommendations. Please retake the quiz.");
    }
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-[#1A2332] font-medium mb-4">{error}</p>
          <button onClick={() => router.push("/quiz")} className="bg-[#0D9488] text-white px-6 py-3 rounded-xl font-medium">
            Retake Quiz
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
          <p className="text-[#5A6578] text-sm">Loading your protocol...</p>
        </div>
      </div>
    );
  }

  const { supplements, schedule, focusAreas, blockedSupplements } = result;

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
            Retake Quiz
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#0D9488]" />
            <span className="text-sm font-semibold text-[#1A2332]">NutriGenius</span>
          </div>
          <div className="w-24" /> {/* spacer */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Hero summary */}
        <div className="bg-gradient-to-br from-[#0D9488] to-[#0F766E] rounded-2xl p-6 sm:p-8 text-white">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Your Personalised Protocol</h1>
              <p className="text-teal-100 mt-1 text-sm sm:text-base">
                Evidence-based recommendations tailored to your health profile
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white/15 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{supplements.length}</div>
              <div className="text-teal-100 text-xs mt-1">Supplements Recommended</div>
            </div>
            <div className="bg-white/15 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">
                {supplements.filter((s) => s.evidenceRating === "Strong" || s.evidenceRating === "Moderate").length}
              </div>
              <div className="text-teal-100 text-xs mt-1">Strong/Moderate Evidence</div>
            </div>
            <div className="bg-white/15 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
              <div className="text-3xl font-bold">{blockedSupplements.length}</div>
              <div className="text-teal-100 text-xs mt-1">Safety Filtered Out</div>
            </div>
          </div>

          {focusAreas.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-teal-100 text-xs mb-2">Key focus areas</p>
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
          <h2 className="text-xl font-bold text-[#1A2332] mb-1">Your Supplement Protocol</h2>
          <p className="text-sm text-[#5A6578] mb-5">
            Ranked by priority — lab-confirmed deficiencies first, then evidence strength.
          </p>
          {supplements.length === 0 ? (
            <div className="bg-white border border-[#E8ECF1] rounded-2xl p-8 text-center">
              <FlaskConical className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
              <p className="text-[#5A6578]">No specific supplements identified for your profile.</p>
              <p className="text-sm text-[#8896A8] mt-1">Try adding health conditions or goals in the quiz.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {supplements.map((supp, i) => (
                <div key={supp.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#F0FDFA] border border-[#99F6E4] text-[#0D9488] flex items-center justify-center text-sm font-bold flex-shrink-0 mt-5">
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

        {/* Blocked supplements */}
        {blockedSupplements.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#1A2332] mb-1">Safety Filtered</h2>
            <p className="text-sm text-[#5A6578] mb-4">
              These supplements were excluded due to potential interactions or contraindications.
            </p>
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
            <h2 className="text-xl font-bold text-[#1A2332] mb-1">Weekly Schedule</h2>
            <p className="text-sm text-[#5A6578] mb-5">
              Optimal timing based on absorption science and supplement interactions.
            </p>
            <div className="bg-white border border-[#E8ECF1] rounded-2xl p-4 sm:p-6 overflow-hidden">
              <WeeklySchedule schedule={schedule} supplements={supplements} />
            </div>
          </section>
        )}

        {/* Evidence legend */}
        <section className="bg-white border border-[#E8ECF1] rounded-2xl p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-[#1A2332] mb-3">Evidence Rating Guide</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["Strong", "Moderate", "Emerging", "Traditional"] as const).map((r) => {
              const s = EVIDENCE_STYLES[r];
              return (
                <div key={r} className={`rounded-xl border p-3 ${s.bg} ${s.border}`}>
                  <div className={`text-sm font-semibold ${s.text}`}>{r}</div>
                  <p className="text-xs text-[#5A6578] mt-1">
                    {r === "Strong" && "Multiple RCTs with consistent findings"}
                    {r === "Moderate" && "Clinical studies with good evidence"}
                    {r === "Emerging" && "Promising early research"}
                    {r === "Traditional" && "Long historical use; limited trials"}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Disclaimer */}
        <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-2xl p-5 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-[#B45309] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#92400E]">Medical Disclaimer</p>
            <p className="text-xs text-[#A16207] mt-1 leading-relaxed">
              These recommendations are for informational purposes only and do not constitute medical advice.
              Always consult a qualified healthcare professional before starting any supplement regimen,
              especially if you have existing health conditions or take prescription medications.
              Supplement requirements vary by individual and should be assessed by a qualified clinician.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
