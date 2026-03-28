import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuizData = {
  age: string;
  biologicalSex: string;
  heightCm: string;
  weightKg: string;
  pregnant: boolean;
  breastfeeding: boolean;
  dietaryPattern: string;
  allergies: string[];
  halalPreference: boolean;
  healthConditions: string[];
  currentMedications: string[];
  currentSupplements: string[];
  familyHistory: string[];
  activityLevel: string;
  sleepQuality: string;
  sleepHours: string;
  stressLevel: string;
  sunExposure: string;
  alcoholConsumption: string;
  smokingStatus: string;
  healthGoals: string[];
  labResults: { biomarker: string; value: string; unit: string; testDate: string }[];
  hasGeneticData: boolean;
  geneticVariants: { gene: string; variant: string; status: string }[];
};

export type SupplementRecommendation = {
  id: string;
  name: string;
  form: string;
  doseMg: number;
  doseDisplay: string;
  evidenceRating: "Strong" | "Moderate" | "Emerging" | "Traditional";
  timing: string;
  timingSlots: { day: string; slot: "Morning" | "Midday" | "Evening" }[];
  whyRecommended: string;
  warnings: string[];
  foodSources: string[];
  category: string;
};

export type RecommendationResult = {
  supplements: SupplementRecommendation[];
  schedule: WeeklySchedule;
  focusAreas: string[];
  blockedSupplements: { name: string; reason: string }[];
};

export type WeeklySchedule = {
  [day: string]: {
    Morning: ScheduleItem[];
    Midday: ScheduleItem[];
    Evening: ScheduleItem[];
  };
};

type ScheduleItem = {
  supplementId: string;
  name: string;
  dose: string;
  note: string;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ─── Timing rules ─────────────────────────────────────────────────────────────

const TIMING_RULES: Record<string, { slot: "Morning" | "Midday" | "Evening"; note: string }> = {
  "Vitamin D":        { slot: "Morning",  note: "With breakfast (fat-soluble)" },
  "Vitamin K2":       { slot: "Morning",  note: "With breakfast (fat-soluble)" },
  "Omega-3":          { slot: "Midday",   note: "With largest meal" },
  "Fish Oil":         { slot: "Midday",   note: "With largest meal" },
  "Iron":             { slot: "Morning",  note: "Empty stomach or with vitamin C" },
  "Magnesium":        { slot: "Evening",  note: "1 hour before bed" },
  "Zinc":             { slot: "Evening",  note: "Away from iron" },
  "Vitamin B12":      { slot: "Morning",  note: "On empty stomach if possible" },
  "Folate":           { slot: "Morning",  note: "With water" },
  "Methylfolate":     { slot: "Morning",  note: "With water" },
  "Coenzyme Q10":     { slot: "Morning",  note: "With breakfast (fat-soluble)" },
  "Vitamin C":        { slot: "Morning",  note: "With or without food" },
  "Probiotics":       { slot: "Morning",  note: "30 min before breakfast" },
  "Melatonin":        { slot: "Evening",  note: "30–60 min before sleep" },
  "Ashwagandha":      { slot: "Evening",  note: "With dinner to reduce cortisol" },
  "Curcumin":         { slot: "Midday",   note: "With black pepper & fat for absorption" },
  "Berberine":        { slot: "Midday",   note: "With or just before meals" },
  "Calcium":          { slot: "Midday",   note: "Split from iron/magnesium" },
  "NAC":              { slot: "Morning",  note: "On empty stomach" },
  "Alpha-Lipoic Acid":{ slot: "Morning",  note: "30 min before meals" },
};

function getTimingForSupplement(name: string): { slot: "Morning" | "Midday" | "Evening"; note: string } {
  for (const [key, rule] of Object.entries(TIMING_RULES)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return rule;
  }
  return { slot: "Morning", note: "With breakfast" };
}

// ─── Evidence explanation templates ──────────────────────────────────────────

function buildExplanation(
  supp: { name: string; evidence_rating: string; mechanism?: string },
  quiz: QuizData,
  labTrigger?: string,
  goalTrigger?: string,
  conditionTrigger?: string,
  geneticNote?: string
): string {
  const parts: string[] = [];

  if (labTrigger) {
    parts.push(`Your lab results show ${labTrigger}, making this a high-priority recommendation.`);
  } else if (conditionTrigger) {
    parts.push(`Recommended based on your reported ${conditionTrigger}.`);
  } else if (goalTrigger) {
    parts.push(`Selected to support your goal: ${goalTrigger}.`);
  }

  if (supp.mechanism) {
    parts.push(supp.mechanism);
  }

  if (geneticNote) {
    parts.push(geneticNote);
  }

  const evidenceMap: Record<string, string> = {
    Strong: "Supported by multiple randomised controlled trials.",
    Moderate: "Supported by clinical studies with consistent findings.",
    Emerging: "Emerging research is promising; evidence is still building.",
    Traditional: "Has a long history of traditional use; formal research is limited.",
  };
  parts.push(evidenceMap[supp.evidence_rating] ?? "");

  return parts.filter(Boolean).join(" ");
}

// ─── Lab deficiency detection ─────────────────────────────────────────────────

const LAB_DEFICIENCY_MAP: Record<string, { supplement: string; threshold: number; unit: string }> = {
  "Vitamin D (25-OH)": { supplement: "Vitamin D", threshold: 30, unit: "ng/mL" },
  "Vitamin B12":       { supplement: "Vitamin B12", threshold: 300, unit: "pg/mL" },
  "Ferritin":          { supplement: "Iron", threshold: 30, unit: "ng/mL" },
  "Folate":            { supplement: "Folate", threshold: 3, unit: "ng/mL" },
  "Magnesium":         { supplement: "Magnesium", threshold: 1.7, unit: "mg/dL" },
  "Zinc":              { supplement: "Zinc", threshold: 70, unit: "mcg/dL" },
  "Omega-3 Index":     { supplement: "Omega-3", threshold: 8, unit: "%" },
};

function getLabDeficiencies(labResults: QuizData["labResults"]): Map<string, string> {
  const deficiencies = new Map<string, string>(); // supplement name → lab trigger string
  for (const result of labResults) {
    const rule = LAB_DEFICIENCY_MAP[result.biomarker];
    if (!rule || !result.value) continue;
    const val = parseFloat(result.value);
    if (!isNaN(val) && val < rule.threshold) {
      deficiencies.set(
        rule.supplement.toLowerCase(),
        `low ${result.biomarker} (${result.value} ${result.unit})`
      );
    }
  }
  return deficiencies;
}

// ─── Genetic form adjustments ──────────────────────────────────────────────────

type GeneticAdjustment = { formOverride?: string; doseMultiplier?: number; note: string };

function getGeneticAdjustments(geneticVariants: QuizData["geneticVariants"]): Map<string, GeneticAdjustment> {
  const adj = new Map<string, GeneticAdjustment>();
  for (const v of geneticVariants) {
    const gene = v.gene.toUpperCase();
    const status = v.status.toLowerCase();

    if (gene === "MTHFR" && (status.includes("homozygous") || status.includes("two copies"))) {
      adj.set("folate", { formOverride: "Methylfolate 400 mcg", note: "MTHFR homozygous: methylfolate recommended over folic acid for proper conversion." });
    }
    if (gene === "MTHFR" && status.includes("heterozygous")) {
      adj.set("folate", { formOverride: "Methylfolate 400 mcg", note: "MTHFR heterozygous: methylfolate preferred for optimal folate metabolism." });
    }
    if (gene === "VDR" && status.includes("variant")) {
      adj.set("vitamin d", { doseMultiplier: 1.5, note: "VDR variant detected: higher Vitamin D dose may be needed for optimal receptor response." });
    }
    if (gene === "FUT2" && status.includes("non-secretor")) {
      adj.set("vitamin b12", { doseMultiplier: 1.5, note: "FUT2 non-secretor: reduced B12 absorption — higher dose or sublingual form recommended." });
    }
    if (gene === "APOE" && (status.includes("ε3/ε4") || status.includes("ε4/ε4"))) {
      adj.set("omega-3", { formOverride: "Omega-3 (EPA/DHA) 2000 mg", doseMultiplier: 1.5, note: "APOE ε4 variant: higher-dose omega-3 recommended for cardiovascular protection." });
    }
    if (gene === "COMT" && status.includes("met/met")) {
      adj.set("magnesium", { note: "COMT slow metaboliser: magnesium glycinate preferred to support stress response and methylation." });
    }
  }
  return adj;
}

// ─── Dose personalisation ─────────────────────────────────────────────────────

function personaliseDose(
  baseDoseMg: number,
  supplementName: string,
  quiz: QuizData,
  labDeficiencies: Map<string, string>,
  geneticAdj: Map<string, GeneticAdjustment>
): { doseMg: number; doseDisplay: string } {
  let dose = baseDoseMg;
  const age = parseInt(quiz.age) || 35;
  const weight = parseFloat(quiz.weightKg) || 70;
  const nameL = supplementName.toLowerCase();

  // Age adjustments
  if (age > 60) {
    if (nameL.includes("vitamin d") || nameL.includes("calcium") || nameL.includes("b12")) {
      dose = Math.round(dose * 1.25);
    }
  }

  // Weight-based for fat-solubles (simple)
  if (weight > 100 && (nameL.includes("vitamin d") || nameL.includes("omega"))) {
    dose = Math.round(dose * 1.2);
  }

  // Lab deficiency → boost
  if (labDeficiencies.has(nameL)) {
    dose = Math.round(dose * 1.5);
  }

  // Genetic multiplier
  const adj = geneticAdj.get(nameL);
  if (adj?.doseMultiplier) {
    dose = Math.round(dose * adj.doseMultiplier);
  }

  // Format display
  let doseDisplay = "";
  if (nameL.includes("vitamin d")) {
    doseDisplay = `${dose} IU`;
  } else if (nameL.includes("omega") || nameL.includes("fish oil")) {
    doseDisplay = `${dose} mg EPA/DHA`;
  } else if (nameL.includes("b12") || nameL.includes("folate")) {
    doseDisplay = `${dose} mcg`;
  } else {
    doseDisplay = `${dose} mg`;
  }

  return { doseMg: dose, doseDisplay };
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const quiz: QuizData = await req.json();
    const supabase = await createClient();

    // ── Layer 1: Knowledge base lookup ────────────────────────────────────────

    // Condition-based candidates
    const conditionCandidates: Map<string, { sourceCondition: string; sourceGoal?: string }> = new Map();
    const goalCandidates: Map<string, { sourceGoal: string }> = new Map();

    if (quiz.healthConditions.length > 0) {
      // Resolve condition names → IDs first (PostgREST doesn't support .in on joined columns)
      const { data: condRows } = await supabase
        .from("conditions")
        .select("id, name")
        .in("name", quiz.healthConditions);

      const conditionIds = (condRows ?? []).map((c) => c.id);
      const conditionNameById = new Map((condRows ?? []).map((c) => [c.id, c.name]));

      if (conditionIds.length > 0) {
        const { data: condMappings } = await supabase
          .from("supplement_condition_mappings")
          .select("supplement_id, condition_id, evidence_rating")
          .in("condition_id", conditionIds);

        for (const m of condMappings ?? []) {
          if (!conditionCandidates.has(m.supplement_id)) {
            conditionCandidates.set(m.supplement_id, {
              sourceCondition: conditionNameById.get(m.condition_id) ?? "",
            });
          }
        }
      }
    }

    if (quiz.healthGoals.length > 0) {
      // Resolve goal names → IDs first
      const { data: goalRows } = await supabase
        .from("health_goals")
        .select("id, name")
        .in("name", quiz.healthGoals);

      const goalIds = (goalRows ?? []).map((g) => g.id);
      const goalNameById = new Map((goalRows ?? []).map((g) => [g.id, g.name]));

      if (goalIds.length > 0) {
        const { data: goalMappings } = await supabase
          .from("supplement_goal_mappings")
          .select("supplement_id, goal_id, evidence_rating")
          .in("goal_id", goalIds);

        for (const m of goalMappings ?? []) {
          if (!goalCandidates.has(m.supplement_id)) {
            goalCandidates.set(m.supplement_id, {
              sourceGoal: goalNameById.get(m.goal_id) ?? "",
            });
          }
        }
      }
    }

    // Collect all unique supplement IDs
    const allCandidateIds = new Set([...conditionCandidates.keys(), ...goalCandidates.keys()]);

    // Fetch full supplement data for all candidates
    const { data: allSupplements } = await supabase
      .from("supplements")
      .select("*")
      .in("id", Array.from(allCandidateIds));

    const supplementMap = new Map<string, Record<string, unknown>>();
    for (const s of allSupplements ?? []) {
      supplementMap.set(s.id, s);
    }

    // ── Layer 2: Safety filter ────────────────────────────────────────────────

    const blockedIds = new Set<string>();
    const blockedSupplements: { name: string; reason: string }[] = [];
    const warningMap = new Map<string, string[]>(); // suppId → warnings

    if (quiz.currentMedications.length > 0) {
      const { data: interactions } = await supabase
        .from("drug_nutrient_interactions")
        .select("supplement_id, drug_name, severity, interaction_description")
        .in("drug_name", quiz.currentMedications);

      for (const interaction of interactions ?? []) {
        const sev = interaction.severity?.toLowerCase();
        const suppId = interaction.supplement_id;
        const suppName = (supplementMap.get(suppId)?.name as string | undefined) ?? suppId;

        if (sev === "critical" || sev === "major") {
          blockedIds.add(suppId);
          blockedSupplements.push({
            name: suppName,
            reason: `Blocked — ${sev} interaction with ${interaction.drug_name ?? "your medication"}: ${interaction.interaction_description}`,
          });
        } else if (sev === "moderate") {
          const existing = warningMap.get(suppId) ?? [];
          existing.push(`Moderate interaction: ${interaction.interaction_description}`);
          warningMap.set(suppId, existing);
        }
      }
    }

    // Check supplement–supplement interactions among candidates
    const candidateIdArray = Array.from(allCandidateIds);
    if (candidateIdArray.length > 1) {
      const { data: suppInteractions } = await supabase
        .from("supplement_interactions")
        .select("supplement_a_id, supplement_b_id, interaction_type, description")
        .or(
          candidateIdArray
            .map((id) => `supplement_a_id.eq.${id},supplement_b_id.eq.${id}`)
            .join(",")
        );

      for (const si of suppInteractions ?? []) {
        if (si.interaction_type === "avoid") {
          // Block the less evidence-strong one — for simplicity block supplement_b
          blockedIds.add(si.supplement_b_id);
        } else if (si.interaction_type === "caution") {
          const existing = warningMap.get(si.supplement_a_id) ?? [];
          existing.push(`Take separately from other supplements: ${si.description}`);
          warningMap.set(si.supplement_a_id, existing);
        }
      }
    }

    // Pregnancy/breastfeeding filter
    for (const [id, supp] of supplementMap) {
      if (quiz.pregnant && supp.is_pregnancy_safe === false) {
        blockedIds.add(id);
        blockedSupplements.push({ name: supp.name as string, reason: "Not recommended during pregnancy." });
      }
      if (quiz.breastfeeding && supp.is_breastfeeding_safe === false) {
        blockedIds.add(id);
        blockedSupplements.push({ name: supp.name as string, reason: "Not recommended while breastfeeding." });
      }
    }

    // Remove blocked from candidates
    for (const id of blockedIds) allCandidateIds.delete(id);

    // ── Layer 3: Prioritisation ───────────────────────────────────────────────

    const labDeficiencies = getLabDeficiencies(quiz.labResults);
    const geneticAdjustments = getGeneticAdjustments(quiz.geneticVariants);

    const evidenceWeight: Record<string, number> = {
      Strong: 4, Moderate: 3, Emerging: 2, Traditional: 1,
    };

    // Fetch evidence ratings for remaining candidates from mappings
    const { data: evidenceRows } = await supabase
      .from("supplement_condition_mappings")
      .select("supplement_id, evidence_rating")
      .in("supplement_id", Array.from(allCandidateIds));

    const evidenceRatingMap = new Map<string, string>();
    for (const row of evidenceRows ?? []) {
      if (!evidenceRatingMap.has(row.supplement_id)) {
        evidenceRatingMap.set(row.supplement_id, row.evidence_rating ?? "Emerging");
      }
    }

    // Also fetch from goal mappings for supplements only in goals
    const { data: goalEvidenceRows } = await supabase
      .from("supplement_goal_mappings")
      .select("supplement_id, evidence_rating")
      .in("supplement_id", Array.from(allCandidateIds));

    for (const row of goalEvidenceRows ?? []) {
      if (!evidenceRatingMap.has(row.supplement_id)) {
        evidenceRatingMap.set(row.supplement_id, row.evidence_rating ?? "Emerging");
      }
    }

    // Score each candidate
    const scored = Array.from(allCandidateIds).map((id) => {
      const supp = supplementMap.get(id);
      if (!supp) return { id, score: 0 };

      const nameL = (supp.name as string).toLowerCase();
      const evRating = evidenceRatingMap.get(id) ?? "Emerging";
      let score = evidenceWeight[evRating] ?? 2;

      if (labDeficiencies.has(nameL)) score += 10; // Lab-confirmed deficiency = top priority
      if (conditionCandidates.has(id)) score += 3;
      if (goalCandidates.has(id)) score += 2;
      if (geneticAdjustments.has(nameL)) score += 2;

      return { id, score, evRating };
    });

    scored.sort((a, b) => b.score - a.score);
    const topIds = scored.slice(0, 8).map((s) => s.id);

    // ── Layer 4: Personalisation ─────────────────────────────────────────────

    const finalSupplements: SupplementRecommendation[] = [];

    for (const id of topIds) {
      const supp = supplementMap.get(id);
      if (!supp) continue;

      const nameL = (supp.name as string).toLowerCase();
      const evRating = (evidenceRatingMap.get(id) ?? "Emerging") as SupplementRecommendation["evidenceRating"];
      const geneticAdj = geneticAdjustments.get(nameL);
      const labTrigger = labDeficiencies.get(nameL);
      const condInfo = conditionCandidates.get(id);
      const goalInfo = goalCandidates.get(id);

      // Form override from genetics
      let form = (supp.form as string) ?? (supp.name as string);
      if (geneticAdj?.formOverride) form = geneticAdj.formOverride;

      // Dose personalisation
      const { doseMg, doseDisplay } = personaliseDose(
        (supp.default_dose_mg as number) ?? 0,
        supp.name as string,
        quiz,
        labDeficiencies,
        geneticAdjustments
      );

      // Timing
      const timing = getTimingForSupplement(supp.name as string);

      // Build weekly schedule slots (all 7 days)
      const timingSlots = DAYS.map((day) => ({ day, slot: timing.slot }));

      // Explanation
      const whyRecommended = buildExplanation(
        { name: supp.name as string, evidence_rating: evRating, mechanism: supp.mechanism as string | undefined },
        quiz,
        labTrigger,
        goalInfo?.sourceGoal,
        condInfo?.sourceCondition,
        geneticAdj?.note
      );

      // Warnings
      const warnings: string[] = [...(warningMap.get(id) ?? [])];

      // Food sources
      let foodSources: string[] = [];
      const fs = supp.food_sources;
      if (Array.isArray(fs)) foodSources = fs;
      else if (typeof fs === "string") {
        try { foodSources = JSON.parse(fs); } catch { foodSources = [fs]; }
      }

      finalSupplements.push({
        id,
        name: supp.name as string,
        form,
        doseMg,
        doseDisplay,
        evidenceRating: evRating,
        timing: `${timing.slot} — ${timing.note}`,
        timingSlots,
        whyRecommended,
        warnings,
        foodSources,
        category: (supp.category as string) ?? "General",
      });
    }

    // ── Layer 5: Schedule generation ─────────────────────────────────────────

    const schedule: WeeklySchedule = {};
    for (const day of DAYS) {
      schedule[day] = { Morning: [], Midday: [], Evening: [] };
    }

    for (const supp of finalSupplements) {
      const timing = getTimingForSupplement(supp.name);
      for (const day of DAYS) {
        const item: ScheduleItem = {
          supplementId: supp.id,
          name: supp.name,
          dose: supp.doseDisplay,
          note: timing.note,
        };
        schedule[day][timing.slot].push(item);
      }
    }

    // Focus areas
    const categoryCount = new Map<string, number>();
    for (const s of finalSupplements) {
      categoryCount.set(s.category, (categoryCount.get(s.category) ?? 0) + 1);
    }
    const focusAreas = [...categoryCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    const result: RecommendationResult = {
      supplements: finalSupplements,
      schedule,
      focusAreas,
      blockedSupplements,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("Recommendation error:", err);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
