import { NextRequest, NextResponse } from "next/server";
import { generateProtocol, PipelineResult } from "@/src/lib/algorithm/pipeline";
import type {
  QuizData as PipelineQuizData,
  Recommendation,
  WeeklySchedule as PipelineWeeklySchedule,
} from "@/src/lib/algorithm/types";

// ─── Quiz form types (matches app/quiz/page.tsx) ───────────────────────────────

export type QuizData = {
  age: string;
  biologicalSex: string;
  heightCm: string;
  weightKg: string;
  pregnant: boolean;
  breastfeeding: boolean;
  country: string;
  dietaryPattern: string;
  allergies: string[];
  halalPreference?: boolean;
  healthConditions: string[];
  currentMedications: string[];
  currentSupplements: string[];
  familyHistory: string[];
  activityLevel: string;
  sleepQuality: string;
  sleepHours?: string;
  stressLevel: string;
  sunExposure: string;
  alcoholConsumption: string;
  smokingStatus: string;
  healthGoals: string[];
  labResults: { biomarker: string; value: string; unit: string; testDate: string }[];
  hasGeneticData?: boolean;
  geneticVariants: { gene: string; variant: string; status: string }[];
};

// ─── Response types ────────────────────────────────────────────────────────────

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
  cyclingPattern?: string;
  notes?: string[];
  timeToEffect?: string;
  monitoringNotes?: {
    supplementId: string;
    test: string;
    frequency: string;
    target?: string;
    urgency: 'routine' | 'important' | 'essential';
  }[];
};

type OldWeeklySchedule = {
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

export type RecommendationResult = {
  supplements: SupplementRecommendation[];
  schedule: OldWeeklySchedule;
  focusAreas: string[];
  blockedSupplements: { name: string; reason: string }[];
  hiddenSupplementsCount: number;
  upsellMessage?: string;
  safetyWarnings: {
    supplementId: string;
    medication: string;
    severity: string;
    description: string;
    recommendation: string;
  }[];
  cyclingNotes: string[];
  protocolNotes: { type: string; title: string; content: string }[];
  metadata: {
    totalLayers: number;
    activeLayers: string[];
    totalRecommendations: number;
    displayedCount: number;
    generatedAt: string;
  };
};

// ─── Lookups ──────────────────────────────────────────────────────────────────

const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  "Ireland": "IE",
  "United Kingdom": "GB",
  "United States": "US",
  "Canada": "CA",
  "Australia": "AU",
  "Germany": "DE",
  "France": "FR",
  "Spain": "ES",
  "Italy": "IT",
  "Netherlands": "NL",
  "Belgium": "BE",
  "Sweden": "SE",
  "Denmark": "DK",
  "Norway": "NO",
  "Finland": "FI",
  "Austria": "AT",
  "Switzerland": "CH",
  "Poland": "PL",
  "Portugal": "PT",
  "Greece": "GR",
  "Czech Republic": "CZ",
  "Romania": "RO",
  "Hungary": "HU",
  "Croatia": "HR",
  "Bulgaria": "BG",
  "Turkey": "TR",
  "UAE": "AE",
  "Saudi Arabia": "SA",
  "India": "IN",
  "Other": "US",
};

const CONDITION_NAME_TO_ID: Record<string, string> = {
  "Hypertension": "hypertension",
  "High Cholesterol": "hyperlipidemia",
  "Heart Failure": "heart-failure",
  "Atrial Fibrillation": "atrial-fibrillation",
  "Coronary Artery Disease": "coronary-artery-disease",
  "Type 2 Diabetes": "type-2-diabetes",
  "Type 1 Diabetes": "type-1-diabetes",
  "Vitamin D Deficiency": "vitamin-d-deficiency",
  "Iron Deficiency Anemia": "iron-deficiency-anemia",
  "Vitamin B12 Deficiency": "vitamin-b12-deficiency",
  "Metabolic Syndrome": "metabolic-syndrome",
  "Gout": "gout",
  "Migraine": "migraine",
  "Neuropathy": "neuropathy",
  "Epilepsy": "epilepsy",
  "Multiple Sclerosis": "multiple-sclerosis",
  "Osteoporosis": "osteoporosis",
  "Osteoarthritis": "osteoarthritis",
  "Fibromyalgia": "fibromyalgia",
  "Back Pain": "back-pain",
  "IBS": "ibs",
  "GERD": "gerd",
  "Crohn's Disease": "crohns",
  "Ulcerative Colitis": "ulcerative-colitis",
  "Celiac Disease": "celiac",
  "SIBO": "sibo",
  "Asthma": "asthma",
  "COPD": "copd",
  "Seasonal Allergies": "seasonal-allergies",
  "Rheumatoid Arthritis": "rheumatoid-arthritis",
  "Hashimoto Thyroiditis": "hashimotos",
  "Lupus": "lupus",
  "Psoriasis": "psoriasis",
  "Generalized Anxiety": "anxiety",
  "Depression": "depression",
  "ADHD": "adhd",
  "Bipolar Disorder": "bipolar-disorder",
  "OCD": "ocd",
  "Hypothyroidism": "hypothyroidism",
  "Hyperthyroidism": "hyperthyroidism",
  "PCOS": "pcos",
  "Low Testosterone": "low-testosterone",
  "Menopause": "menopause",
  "Acne": "acne",
  "Eczema": "eczema",
  "Rosacea": "rosacea",
  "Hair Loss": "hair-loss",
  "Chronic Fatigue": "chronic-fatigue-syndrome",
  "Insomnia": "insomnia",
  "Obesity": "obesity",
};

const ACTIVITY_MAP: Record<string, PipelineQuizData["activityLevel"]> = {
  sedentary: "sedentary",
  lightly_active: "light",
  moderately_active: "moderate",
  very_active: "very-active",
  athlete: "athlete",
};

const STRESS_MAP: Record<string, PipelineQuizData["stressLevel"]> = {
  low: "low",
  moderate: "moderate",
  high: "high",
  very_high: "very-high",
};

const ALCOHOL_MAP: Record<string, PipelineQuizData["alcoholConsumption"]> = {
  none: "none",
  occasional: "light",
  moderate: "moderate",
  heavy: "heavy",
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ─── Lab results mapping ───────────────────────────────────────────────────────

function mapLabResults(
  labResults: QuizData["labResults"]
): PipelineQuizData["labValues"] {
  if (!labResults.length) return undefined;

  const labValues: NonNullable<PipelineQuizData["labValues"]> = {};

  for (const lab of labResults) {
    const v = parseFloat(lab.value);
    if (isNaN(v)) continue;
    const date = lab.testDate || undefined;

    switch (lab.biomarker) {
      case "Vitamin D (25-OH)":
        labValues.vitaminD = { value: v, unit: "ng/mL", date };
        break;
      case "Vitamin B12":
        labValues.vitaminB12 = { value: v, unit: "pg/mL", date };
        break;
      case "Ferritin":
        labValues.ferritin = { value: v, unit: "ng/mL", date };
        break;
      case "Folate":
        labValues.folate = { value: v, unit: "ng/mL", date };
        break;
      case "Iron":
        labValues.iron = { value: v, unit: "µg/dL", date };
        break;
      case "TIBC":
        labValues.tibc = { value: v, unit: "µg/dL", date };
        break;
      case "TSH":
        labValues.tsh = { value: v, unit: "mIU/L", date };
        break;
      case "HbA1c":
        labValues.hba1c = { value: v, unit: "%", date };
        break;
      case "Magnesium":
        labValues.magnesium = { value: v, unit: "mg/dL", date };
        break;
      case "Zinc":
        labValues.zinc = { value: v, unit: "µg/dL", date };
        break;
      case "Omega-3 Index":
        labValues.omega3Index = { value: v, unit: "%", date };
        break;
      case "Homocysteine":
        labValues.homocysteine = { value: v, unit: "µmol/L", date };
        break;
      case "CRP":
        labValues.crp = { value: v, unit: "mg/L", date };
        break;
    }
  }

  return Object.keys(labValues).length ? labValues : undefined;
}

// ─── Genetic variants mapping ──────────────────────────────────────────────────

function mapGeneticVariants(
  variants: QuizData["geneticVariants"]
): PipelineQuizData["geneticVariants"] {
  if (!variants || !variants.length) return undefined;

  const out: NonNullable<PipelineQuizData["geneticVariants"]> = {};

  for (const v of variants) {
    const gene = v.gene.toUpperCase();
    const variantId = (v.variant ?? "").toUpperCase();
    const status = v.status ?? "";

    if (gene === "MTHFR" && variantId.includes("C677T")) {
      if (status.includes("Homozygous") || status.includes("Two Copies")) {
        out.mthfrC677T = "homozygous";
      } else if (status.includes("Heterozygous") || status.includes("One Copy")) {
        out.mthfrC677T = "heterozygous";
      } else {
        out.mthfrC677T = "normal";
      }
    }
    if (gene === "MTHFR" && variantId.includes("A1298C")) {
      if (status.includes("Homozygous") || status.includes("Two Copies")) {
        out.mthfrA1298C = "homozygous";
      } else if (status.includes("Heterozygous") || status.includes("One Copy")) {
        out.mthfrA1298C = "heterozygous";
      } else {
        out.mthfrA1298C = "normal";
      }
    }
    if (gene === "VDR") {
      if (status.includes("Variant")) {
        out.vdr = { taqI: true };
      }
    }
    if (gene === "COMT") {
      if (status.includes("Met/Met") || status.includes("Slow")) {
        out.comtVal158Met = "met-met";
      } else if (status.includes("Val/Met") || status.includes("Intermediate")) {
        out.comtVal158Met = "val-met";
      } else {
        out.comtVal158Met = "val-val";
      }
    }
    if (gene === "APOE") {
      if (status.includes("ε2/ε2")) out.apoe = "e2-e2";
      else if (status.includes("ε2/ε3")) out.apoe = "e2-e3";
      else if (status.includes("ε3/ε4")) out.apoe = "e3-e4";
      else if (status.includes("ε4/ε4")) out.apoe = "e4-e4";
      else out.apoe = "e3-e3";
    }
    if (gene === "FUT2") {
      out.fut2 = status.includes("Non-Secretor") ? "non-secretor" : "secretor";
    }
    if (gene === "CYP1A2") {
      out.cyp1a2 = status.includes("Slow") ? "slow" : "fast";
    }
  }

  return Object.keys(out).length ? out : undefined;
}

// ─── Derive fish/dairy/vegetable intake ───────────────────────────────────────

function deriveDietaryIntake(body: QuizData) {
  const hasAllergyFish = body.allergies.some(a =>
    a.toLowerCase().includes("fish") || a.toLowerCase().includes("shellfish")
  );
  const hasAllergyDairy = body.allergies.some(a => a.toLowerCase() === "dairy");

  let fishIntake: PipelineQuizData["fishIntake"] = "moderate";
  if (hasAllergyFish || body.dietaryPattern === "vegan" || body.dietaryPattern === "vegetarian") {
    fishIntake = "none";
  } else if (body.dietaryPattern === "pescatarian") {
    fishIntake = "high";
  } else if (["keto", "paleo", "other"].includes(body.dietaryPattern)) {
    fishIntake = "low";
  }

  let dairyIntake: PipelineQuizData["dairyIntake"] = "moderate";
  if (hasAllergyDairy || body.dietaryPattern === "vegan") {
    dairyIntake = "none";
  } else if (["keto", "paleo", "other"].includes(body.dietaryPattern)) {
    dairyIntake = "low";
  }

  let vegetableIntake: PipelineQuizData["vegetableIntake"] = "moderate";
  if (["vegan", "vegetarian", "mediterranean"].includes(body.dietaryPattern)) {
    vegetableIntake = "high";
  } else if (["keto", "paleo"].includes(body.dietaryPattern)) {
    vegetableIntake = "low";
  }

  return { fishIntake, dairyIntake, vegetableIntake };
}

// ─── Main mapping: quiz form → pipeline QuizData ──────────────────────────────

function mapRequestToQuizData(body: QuizData): PipelineQuizData {
  const { fishIntake, dairyIntake, vegetableIntake } = deriveDietaryIntake(body);
  const age = parseInt(body.age) || 30;
  const isFemale = body.biologicalSex === "female";

  const isPostmenopausal =
    isFemale && (body.healthConditions.includes("Menopause") || age >= 52);

  const healthConditions = body.healthConditions.map(
    c => CONDITION_NAME_TO_ID[c] ?? c.toLowerCase().replace(/\s+/g, "-")
  );

  const familyHistory = (body.familyHistory ?? []).map(
    f => CONDITION_NAME_TO_ID[f] ?? f.toLowerCase().replace(/\s+/g, "-")
  );

  const medications = (body.currentMedications ?? []).map(m => m.toLowerCase());

  const dietaryPattern = (
    body.dietaryPattern === "other" ? "omnivore" : body.dietaryPattern
  ) as PipelineQuizData["dietaryPattern"];

  return {
    age,
    biologicalSex: body.biologicalSex === "male" || body.biologicalSex === "female"
      ? body.biologicalSex
      : "male",
    country: COUNTRY_NAME_TO_ISO[body.country] ?? "US",
    isPregnant: body.pregnant ?? false,
    isBreastfeeding: body.breastfeeding ?? false,
    isPostmenopausal,
    dietaryPattern,
    allergies: body.allergies ?? [],
    fishIntake,
    dairyIntake,
    vegetableIntake,
    activityLevel: ACTIVITY_MAP[body.activityLevel] ?? "moderate",
    sleepQuality: (body.sleepQuality as PipelineQuizData["sleepQuality"]) ?? "fair",
    stressLevel: STRESS_MAP[body.stressLevel] ?? "moderate",
    sunExposure: (body.sunExposure as PipelineQuizData["sunExposure"]) ?? "moderate",
    alcoholConsumption: ALCOHOL_MAP[body.alcoholConsumption] ?? "none",
    smokingStatus: (body.smokingStatus as PipelineQuizData["smokingStatus"]) ?? "never",
    healthConditions,
    familyHistory,
    medications,
    labValues: mapLabResults(body.labResults ?? []),
    geneticVariants: mapGeneticVariants(body.geneticVariants ?? []),
    healthGoals: body.healthGoals ?? [],
  };
}

// ─── Timing helpers ────────────────────────────────────────────────────────────

function timingToSlot(
  t: Recommendation["timing"][number]
): "Morning" | "Midday" | "Evening" {
  if (t === "morning-empty" || t === "morning-with-food") return "Morning";
  if (t === "midday") return "Midday";
  return "Evening";
}

function timingToDisplayString(timing: Recommendation["timing"]): string {
  const labels: Record<string, string> = {
    "morning-empty": "Morning (empty stomach)",
    "morning-with-food": "Morning (with food)",
    "midday": "Midday (with meal)",
    "evening": "Evening",
    "bedtime": "At bedtime",
  };
  return timing.map(t => labels[t] ?? t).join(", ");
}

// ─── Map a single Recommendation → SupplementRecommendation ──────────────────

function mapRecommendation(rec: Recommendation): SupplementRecommendation {
  const primaryTiming = rec.timing[0] ?? "morning-with-food";
  const slot = timingToSlot(primaryTiming);

  const timingSlots: SupplementRecommendation["timingSlots"] = [];
  for (let i = 0; i < 7; i++) {
    if (rec.cyclingPattern.activeDays[i]) {
      timingSlots.push({ day: DAYS[i], slot });
    }
  }

  const whyRecommended =
    rec.reasons.map(r => r.reason).join(" ") ||
    `${rec.supplementName} recommended based on your health profile.`;

  const doseDisplay =
    rec.doseUnit === "IU"
      ? `${rec.dose} IU`
      : rec.doseUnit === "mcg"
      ? `${rec.dose} mcg`
      : rec.doseUnit === "g"
      ? `${rec.dose} g`
      : rec.doseUnit === "CFU"
      ? `${rec.dose} billion CFU`
      : `${rec.dose} mg`;

  return {
    id: rec.id,
    name: rec.supplementName,
    form: rec.form,
    doseMg: rec.dose,
    doseDisplay,
    evidenceRating: rec.evidenceRating,
    timing: timingToDisplayString(rec.timing),
    timingSlots,
    whyRecommended,
    warnings: rec.warnings,
    foodSources: [],
    category: rec.category,
    cyclingPattern: rec.cyclingPattern.description,
    notes: rec.notes,
    timeToEffect: rec.timeToEffect,
    monitoringNotes: rec.monitoringNotes,
  };
}

// ─── Convert new WeeklySchedule → old { [day]: { Morning, Midday, Evening } } ─

function convertSchedule(ws: PipelineWeeklySchedule): OldWeeklySchedule {
  const schedule: OldWeeklySchedule = {};

  for (const day of ws.days) {
    const morning: ScheduleItem[] = [];
    const midday: ScheduleItem[] = [];
    const evening: ScheduleItem[] = [];

    for (const timeSlot of day.timeSlots) {
      const bucket =
        timeSlot.timing === "morning-empty" || timeSlot.timing === "morning-with-food"
          ? morning
          : timeSlot.timing === "midday"
          ? midday
          : evening;

      for (const supp of timeSlot.supplements) {
        bucket.push({
          supplementId: supp.supplementName.toLowerCase().replace(/\s+/g, "-"),
          name: supp.supplementName,
          dose: `${supp.dose} ${supp.doseUnit}`,
          note: supp.notes[0] ?? timeSlot.displayLabel,
        });
      }
    }

    schedule[day.dayName] = { Morning: morning, Midday: midday, Evening: evening };
  }

  // Ensure all 7 days are present
  for (const dayName of DAYS) {
    if (!schedule[dayName]) {
      schedule[dayName] = { Morning: [], Midday: [], Evening: [] };
    }
  }

  return schedule;
}

// ─── Map full PipelineResult → API response ────────────────────────────────────

function mapPipelineToResponse(result: PipelineResult): RecommendationResult {
  const supplements = result.displayedRecommendations.map(mapRecommendation);

  const blockedSupplements = result.blocked.map(b => ({
    name: b.recommendation.supplementName,
    reason: b.reason,
  }));

  const categoryCount = new Map<string, number>();
  for (const s of supplements) {
    categoryCount.set(s.category, (categoryCount.get(s.category) ?? 0) + 1);
  }
  const focusAreas = [...categoryCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  return {
    supplements,
    schedule: convertSchedule(result.schedule),
    focusAreas,
    blockedSupplements,
    hiddenSupplementsCount: result.metadata.hiddenCount,
    upsellMessage: result.upsellMessage,
    safetyWarnings: result.warnings.map(w => ({
      supplementId: w.supplementId,
      medication: w.medication,
      severity: w.severity,
      description: w.description,
      recommendation: w.recommendation,
    })),
    cyclingNotes: result.schedule.summary.cyclingNotes,
    protocolNotes: result.protocolNotes.map(n => ({
      type: n.type,
      title: n.title,
      content: n.content,
    })),
    metadata: {
      totalLayers: result.metadata.totalLayers,
      activeLayers: result.metadata.activeLayers,
      totalRecommendations: result.metadata.totalRecommendations,
      displayedCount: result.metadata.displayedCount,
      generatedAt: result.metadata.generatedAt,
    },
  };
}

// ─── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: QuizData = await req.json();
    const pipelineData = mapRequestToQuizData(body);
    const pipelineResult = generateProtocol(pipelineData, "free");
    const response = mapPipelineToResponse(pipelineResult);
    return NextResponse.json(response);
  } catch (err) {
    console.error("Recommendation error:", err);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
