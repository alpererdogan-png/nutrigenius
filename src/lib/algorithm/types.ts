// ─────────────────────────────────────────────────────────────────────────────
// NutriGenius — 7-Layer Supplement Recommendation Engine
// Core data structures
// DO NOT modify algorithm logic in this file — types only.
// ─────────────────────────────────────────────────────────────────────────────

// ─── LAYER NAMES ─────────────────────────────────────────────────────────────

export type LayerName =
  | 'demographic'
  | 'dietary'
  | 'lifestyle'
  | 'conditions'
  | 'labs'
  | 'genetics'
  | 'goals'
  | 'synergy'
  | 'safety'
  | 'optimization';

// ─── SUPPLEMENT CATEGORIES ───────────────────────────────────────────────────

export type SupplementCategory =
  | 'vitamin'
  | 'mineral'
  | 'omega-fatty-acid'
  | 'amino-acid'
  | 'adaptogen'
  | 'probiotic'
  | 'enzyme'
  | 'antioxidant'
  | 'herbal'
  | 'compound'
  | 'protein'
  | 'fiber'
  | 'other';

// ─── CYCLING PATTERNS ────────────────────────────────────────────────────────

export interface CyclingPattern {
  type: 'daily' | 'weekdays-only' | 'alternate-day' | '6on1off' | '5on2off' | 'custom';
  /** [Mon, Tue, Wed, Thu, Fri, Sat, Sun] — true = take on this day */
  activeDays: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
  description: string; // "Mon–Fri", "Every other day", "Daily"
}

export const CYCLE_DAILY: CyclingPattern = {
  type: 'daily',
  activeDays: [true, true, true, true, true, true, true],
  description: 'Daily',
};

export const CYCLE_WEEKDAYS: CyclingPattern = {
  type: 'weekdays-only',
  activeDays: [true, true, true, true, true, false, false],
  description: 'Mon–Fri',
};

export const CYCLE_ALTERNATE_DAY: CyclingPattern = {
  type: 'alternate-day',
  activeDays: [true, false, true, false, true, false, true],
  description: 'Mon, Wed, Fri, Sun',
};

export const CYCLE_6ON1OFF: CyclingPattern = {
  type: '6on1off',
  activeDays: [true, true, true, true, true, true, false],
  description: 'Mon–Sat',
};

export const CYCLE_5ON2OFF: CyclingPattern = {
  type: '5on2off',
  activeDays: [true, true, true, true, false, true, false],
  description: 'Sun–Thu',
};

// ─── RECOMMENDATION ──────────────────────────────────────────────────────────

export interface RecommendationReason {
  layer: LayerName;
  /** Human-readable explanation: "Vegan diet — no dietary B12 source" */
  reason: string;
  /** Optional longer clinical explanation */
  detail?: string;
}

export interface LayerSource {
  layer: LayerName;
  action: 'added' | 'modified-dose' | 'modified-form' | 'modified-timing' | 'added-reason';
  /** What the value was before this layer modified it */
  previousValue?: string;
  /** What the value was changed to */
  newValue?: string;
}

export interface Recommendation {
  /** Unique identifier: "vitamin-d3", "magnesium-glycinate" */
  id: string;
  /** Display name: "Vitamin D3" */
  supplementName: string;
  /** Specific molecular form: "cholecalciferol", "methylcobalamin", "glycinate" */
  form: string;
  /** Numeric dose value */
  dose: number;
  /** Unit: "IU", "mg", "mcg", "g", "CFU" */
  doseUnit: string;
  frequency: 'daily' | 'twice-daily' | 'three-times-daily';
  timing: ('morning-empty' | 'morning-with-food' | 'midday' | 'evening' | 'bedtime')[];
  withFood: boolean;
  evidenceRating: 'Strong' | 'Moderate' | 'Emerging' | 'Traditional';
  /** Reasons this supplement was recommended, one entry per contributing layer */
  reasons: RecommendationReason[];
  /** Caution notes shown to user */
  warnings: string[];
  /** Hard-block reasons (not displayed on card — used by safety layer) */
  contraindications: string[];
  cyclingPattern: CyclingPattern;
  /** Audit trail of which layers contributed and what they changed */
  sources: LayerSource[];
  /**
   * Priority 1–10. Higher = more clinically important.
   * Used by capProtocol() to decide which supplements to drop when the
   * protocol exceeds the maximum count.
   *
   * Scale:
   *  10 — Pregnancy-critical (folate, iron, DHA, iodine during pregnancy)
   *   9 — Severe deficiency / universal essentials (Vitamin D in high-latitude winter)
   *   8 — Strong-evidence condition-specific / core nutrients
   *   7 — Moderate-evidence condition-specific / age-related (B12 age 50+, D baseline)
   *   6 — Lifestyle-triggered (magnesium, calcium postmenopausal, folate women 18–50)
   *   5 — Goal-optimisation, Moderate evidence (CoQ10, zinc, lycopene, omega-3)
   *   4 — Goal-optimisation, Emerging evidence
   *   3 — Nice-to-have / supportive
   *   2 — Low-priority
   *   1 — Experimental
   */
  priority: number;
  category: SupplementCategory;
  /** IDs of supplements that must be separated by 2+ hours */
  separateFrom: string[];
  /** Additional clinical notes surfaced on the results card */
  notes: string[];
  /**
   * Allergy-driven flags set by Layer 2 (dietary).
   * Guides form-swaps and ingredient warnings on the results card.
   */
  allergyFlags?: AllergyFlag[];
  /**
   * Human-readable estimate of how long until the supplement produces
   * noticeable effects, e.g. "4-8 weeks for anti-inflammatory effects".
   * Populated by the pipeline from the TIME_TO_EFFECT lookup.
   */
  timeToEffect?: string;
  /**
   * Lab-monitoring recommendations for supplements that require periodic
   * blood work. Populated by the pipeline from monitoringNotes rules.
   */
  monitoringNotes?: import('./data/monitoringNotes').MonitoringNote[];
}

// ─── PROTOCOL NOTES ─────────────────────────────────────────────────────────

/**
 * A structured, protocol-level note (not tied to a single supplement).
 * Displayed as its own card section on the results page.
 */
export interface ProtocolNote {
  /** Machine identifier, e.g. 'athlete-electrolyte-guide'. */
  type: string;
  /** Human-readable card title. */
  title: string;
  /** Full multi-line content (rendered with whitespace preserved). */
  content: string;
}

// ─── QUIZ DATA INPUT ─────────────────────────────────────────────────────────

export interface LabValue<U extends string> {
  value: number;
  unit: U;
  /** ISO date string, e.g. "2024-11-01" */
  date?: string;
}

export interface QuizData {
  // ── Layer 1: Demographics ──────────────────────────────────────────────────
  age: number;
  biologicalSex: 'male' | 'female';
  /** ISO 3166-1 alpha-2 country code, e.g. "US", "GB", "TR" */
  country: string;
  /** Derived from country — used for vitamin D sun-synthesis calculations */
  latitude?: number;
  isPregnant: boolean;
  isBreastfeeding: boolean;
  /** Relevant for females aged 45+ */
  isPostmenopausal?: boolean;

  // ── Layer 2: Diet ──────────────────────────────────────────────────────────
  dietaryPattern:
    | 'omnivore'
    | 'vegetarian'
    | 'vegan'
    | 'pescatarian'
    | 'keto'
    | 'paleo'
    | 'mediterranean';
  /** e.g. ['shellfish', 'fish', 'dairy', 'soy', 'gluten', 'nuts'] */
  allergies: string[];
  fishIntake: 'none' | 'low' | 'moderate' | 'high';
  dairyIntake: 'none' | 'low' | 'moderate' | 'high';
  vegetableIntake: 'low' | 'moderate' | 'high';

  // ── Layer 3: Lifestyle ─────────────────────────────────────────────────────
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very-active' | 'athlete';
  /**
   * Training phase — only meaningful when activityLevel is 'very-active' or
   * 'athlete'. Controls phase-specific supplement adjustments in Layer 3.
   */
  trainingPhase?: 'building' | 'maintenance' | 'cutting' | 'competition' | 'recovery';
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  stressLevel: 'low' | 'moderate' | 'high' | 'very-high';
  sunExposure: 'minimal' | 'moderate' | 'high';
  alcoholConsumption: 'none' | 'light' | 'moderate' | 'heavy';
  smokingStatus: 'never' | 'former' | 'current';
  /**
   * Derived convenience flag — set to `true` when smokingStatus === 'current'.
   * Populated by Layer 3 so all subsequent layers can check it without
   * re-reading smokingStatus.
   */
  smokerFlag?: boolean;
  /**
   * Derived flag — set to `true` when the user has digestive conditions
   * (IBS, celiac, Crohn's, SIBO, GERD, etc.) or 3+ food allergies.
   * Populated by the absorption optimizer so downstream layers can
   * select sublingual/high-bioavailability forms.
   */
  absorptionFlag?: boolean;

  // ── Layer 4: Health Conditions ─────────────────────────────────────────────
  /** Condition IDs from existing knowledge base, e.g. "type-2-diabetes", "hypothyroidism" */
  healthConditions: string[];
  /** Condition IDs indicating elevated familial risk */
  familyHistory: string[];
  /** Medication names or IDs, e.g. "warfarin", "metformin", "levothyroxine" */
  medications: string[];

  // ── Layer 5: Lab Values (all optional) ────────────────────────────────────
  labValues?: {
    vitaminD?:    LabValue<'ng/mL'>;
    vitaminB12?:  LabValue<'pg/mL'>;
    ferritin?:    LabValue<'ng/mL'>;
    tsh?:         LabValue<'mIU/L'>;
    hba1c?:       LabValue<'%'>;
    magnesium?:   LabValue<'mg/dL'>;
    crp?:         LabValue<'mg/L'>;
    homocysteine?: LabValue<'µmol/L'>;
    omega3Index?: LabValue<'%'>;
    zinc?:        LabValue<'µg/dL'>;
    folate?:      LabValue<'ng/mL'>;
    iron?:        LabValue<'µg/dL'>;
    tibc?:        LabValue<'µg/dL'>;
  };

  // ── Layer 6: Genetic Variants (all optional) ──────────────────────────────
  geneticVariants?: {
    /** Affects folate metabolism — determines if methylfolate is needed vs folic acid */
    mthfrC677T?:    'normal' | 'heterozygous' | 'homozygous';
    /** Second MTHFR variant — compound heterozygosity compounds methylation impairment */
    mthfrA1298C?:   'normal' | 'heterozygous' | 'homozygous';
    /** Affects dopamine/stress catecholamine clearance — determines methylation support needs */
    comtVal158Met?: 'val-val' | 'val-met' | 'met-met';
    /** Vitamin D receptor variants — affects D3 dose response */
    vdr?: {
      taqI?: boolean;
      bsmI?: boolean;
      fokI?: boolean;
    };
    /** ApoE genotype — affects cardiovascular risk and omega-3/saturated fat response */
    apoe?:          'e2-e2' | 'e2-e3' | 'e3-e3' | 'e3-e4' | 'e4-e4';
    /** FUT2 secretor status — non-secretors absorb dietary B12 less efficiently */
    fut2?:          'secretor' | 'non-secretor';
    /** CYP1A2 caffeine metabolism — affects supplement timing windows */
    cyp1a2?:        'fast' | 'slow';
    /** CBS (Cystathionine Beta-Synthase) — upregulation increases sulfur throughput */
    cbs?:           'normal' | 'upregulation';
    /** BCMO1 — reduced beta-carotene → retinol conversion */
    bcmo1?:         'normal' | 'poor-converter';
    /** FADS1/FADS2 — reduced ALA → EPA/DHA conversion */
    fads?:          boolean;
    /** HFE hemochromatosis gene variants — increased iron absorption risk */
    hfe?:           { c282y?: boolean; h63d?: boolean };
    /** SOD2 Val/Ala variant — altered mitochondrial antioxidant capacity */
    sod2?:          'val-val' | 'val-ala' | 'ala-ala';
    /** PEMT variant — increased dietary choline requirement */
    pemt?:          boolean;
    /** TNF-α pro-inflammatory variant */
    tnfAlpha?:      boolean;
    /** IL-6 pro-inflammatory variant */
    il6?:           boolean;
  };

  // ── Layer 7: Health Goals ──────────────────────────────────────────────────
  /**
   * Goal IDs, e.g.:
   * 'energy', 'cognitive', 'immunity', 'heart-health', 'gut-health',
   * 'skin-hair-nails', 'joint-health', 'longevity', 'weight-management',
   * 'stress-anxiety', 'athletic-performance', 'sleep'
   */
  healthGoals: string[];
}

// ─── SAFETY FILTER OUTPUT ────────────────────────────────────────────────────

export interface BlockedSupplement {
  recommendation: Recommendation;
  reason: string;
  severity: 'critical';
  interactingMedication: string;
}

export interface SafetyWarning {
  supplementId: string;
  medication: string;
  severity: 'major' | 'moderate' | 'informational';
  description: string;
  /** e.g. "Monitor INR closely" or "Separate by 4 hours" */
  recommendation: string;
}

export interface SupplementInteraction {
  supplement1Id: string;
  supplement2Id: string;
  type: 'absorption-competition' | 'cumulative-effect' | 'timing-conflict';
  description: string;
  /** e.g. "Separate by 2+ hours" or "Monitor cumulative bleeding risk" */
  resolution: string;
}

export interface ULCheck {
  nutrient: string;
  totalDose: number;
  unit: string;
  upperLimit: number;
  exceedsUL: boolean;
  /** IDs of supplements contributing to this nutrient's total dose */
  sources: string[];
}

export interface SafetyResult {
  approvedRecommendations: Recommendation[];
  blockedRecommendations: BlockedSupplement[];
  warnings: SafetyWarning[];
  supplementInteractions: SupplementInteraction[];
  ulChecks: ULCheck[];
}

// ─── WEEKLY SCHEDULE OUTPUT ──────────────────────────────────────────────────

export interface ScheduledSupplement {
  supplementName: string;
  form: string;
  dose: number;
  doseUnit: string;
  withFood: boolean;
  /** e.g. ["Take with Vitamin C for absorption", "Avoid calcium within 2 hours"] */
  notes: string[];
}

export interface TimeSlot {
  timing: 'morning-empty' | 'morning-with-food' | 'midday' | 'evening' | 'bedtime';
  /** Human-readable label: "Morning (empty stomach)", "With Breakfast", etc. */
  displayLabel: string;
  supplements: ScheduledSupplement[];
}

export interface DaySchedule {
  dayName: string;   // "Monday", "Tuesday", etc.
  dayIndex: number;  // 0 = Monday, 6 = Sunday
  timeSlots: TimeSlot[];
  totalSupplements: number;
}

export interface ScheduleSummary {
  totalUniqueSupplements: number;
  dailyAverage: number;
  timeSlotsUsed: string[];
  /** e.g. ["Zinc: Mon–Fri only (copper balance)"] */
  cyclingNotes: string[];
}

export interface WeeklySchedule {
  /** 7 entries, Monday through Sunday */
  days: DaySchedule[];
  summary: ScheduleSummary;
}

// ─── LAYER FUNCTION SIGNATURES ───────────────────────────────────────────────

/**
 * Layer 1 (Demographic) — seeds the initial recommendation array.
 * All other layers receive and return the accumulated array.
 */
export type Layer1Fn = (quiz: QuizData) => Recommendation[];

/**
 * Layers 2–7 — each receives the quiz data plus the current recommendation
 * array (output of the previous layer) and returns the modified array.
 * Layers MUST NOT create duplicate supplement IDs; use addOrModify() instead.
 */
export type LayerFn = (quiz: QuizData, currentRecs: Recommendation[]) => Recommendation[];

/**
 * Safety filter — receives all collected medications and the full
 * recommendation list; returns structured safety results.
 */
export type SafetyFn = (medications: string[], recs: Recommendation[]) => SafetyResult;

/**
 * Schedule builder — converts approved recommendations into a 7-day
 * timed schedule, respecting cycling patterns and separation rules.
 */
export type ScheduleFn = (recs: Recommendation[]) => WeeklySchedule;

// ─── COUNTRY → LATITUDE LOOKUP ───────────────────────────────────────────────

/**
 * Approximate latitude for vitamin D sun-synthesis calculations.
 * Above ~51°N: meaningful synthesis is impossible Oct–Mar.
 * Above ~37°N: synthesis is limited Nov–Feb.
 *
 * Also flags countries with known population-level iodine deficiency
 * (relevant for iodine / seaweed supplementation decisions).
 */
export interface CountryData {
  latitude: number;
  /** True if national surveys show endemic/borderline iodine deficiency */
  iodineDeficient: boolean;
}

export const COUNTRY_DATA: Record<string, CountryData> = {
  // British Isles / Northern Europe (high latitude, iodine deficient)
  IE: { latitude: 53.0, iodineDeficient: true  },
  GB: { latitude: 54.0, iodineDeficient: true  },
  NO: { latitude: 64.0, iodineDeficient: false },
  SE: { latitude: 62.0, iodineDeficient: false },
  FI: { latitude: 65.0, iodineDeficient: false },
  DK: { latitude: 56.0, iodineDeficient: false },

  // Western / Central Europe
  DE: { latitude: 51.0, iodineDeficient: true  },
  FR: { latitude: 46.0, iodineDeficient: true  },
  NL: { latitude: 52.0, iodineDeficient: true  },
  BE: { latitude: 50.5, iodineDeficient: true  },
  AT: { latitude: 47.5, iodineDeficient: true  },
  CH: { latitude: 47.0, iodineDeficient: false },
  PL: { latitude: 52.0, iodineDeficient: false },

  // Southern Europe
  IT: { latitude: 43.0, iodineDeficient: true  },
  ES: { latitude: 40.0, iodineDeficient: false },
  PT: { latitude: 39.5, iodineDeficient: false },
  GR: { latitude: 39.0, iodineDeficient: false },

  // North America
  US: { latitude: 38.0, iodineDeficient: false },
  CA: { latitude: 56.0, iodineDeficient: false },
  MX: { latitude: 23.0, iodineDeficient: false },

  // South America
  BR: { latitude: -10.0, iodineDeficient: false },
  AR: { latitude: -35.0, iodineDeficient: false },

  // Oceania
  AU: { latitude: -27.0, iodineDeficient: false },
  NZ: { latitude: -42.0, iodineDeficient: false },

  // East Asia
  JP: { latitude: 36.0, iodineDeficient: false },
  KR: { latitude: 37.0, iodineDeficient: false },
  CN: { latitude: 35.0, iodineDeficient: false },

  // South Asia
  IN: { latitude: 20.0, iodineDeficient: false },
  PK: { latitude: 30.0, iodineDeficient: true  },
  BD: { latitude: 24.0, iodineDeficient: true  },

  // Middle East / Gulf
  TR: { latitude: 39.0, iodineDeficient: true  },
  SA: { latitude: 24.0, iodineDeficient: false },
  AE: { latitude: 24.0, iodineDeficient: false },
  QA: { latitude: 25.0, iodineDeficient: false },
  BH: { latitude: 26.0, iodineDeficient: false },
  KW: { latitude: 29.0, iodineDeficient: false },
  OM: { latitude: 21.0, iodineDeficient: false },

  // Africa
  ZA: { latitude: -29.0, iodineDeficient: false },
  EG: { latitude: 27.0,  iodineDeficient: true  },
  NG: { latitude: 10.0,  iodineDeficient: true  },
  ET: { latitude:  9.0,  iodineDeficient: true  },
};

// ─── RECOMMENDATION UTILITY FUNCTION SIGNATURES ──────────────────────────────

/**
 * Find an existing recommendation by its ID.
 * Returns undefined if not present — use this before calling addOrModify().
 */
export type FindExistingRecFn = (
  recs: Recommendation[],
  supplementId: string,
) => Recommendation | undefined;

/**
 * Increase or decrease the dose of an existing recommendation.
 * Records the modification in sources[].
 * No-ops silently if the supplement ID is not found.
 */
export type ModifyDoseFn = (
  recs: Recommendation[],
  supplementId: string,
  newDose: number,
  layer: LayerName,
  reason: string,
) => Recommendation[];

/**
 * Swap the molecular form of an existing recommendation (e.g. folic acid →
 * methylfolate). Records the modification in sources[].
 */
export type ModifyFormFn = (
  recs: Recommendation[],
  supplementId: string,
  newForm: string,
  layer: LayerName,
  reason: string,
) => Recommendation[];

/**
 * Swap or append timing slots on an existing recommendation.
 * Records the modification in sources[].
 */
export type ModifyTimingFn = (
  recs: Recommendation[],
  supplementId: string,
  newTiming: Recommendation['timing'],
  layer: LayerName,
  reason: string,
) => Recommendation[];

/**
 * Append an additional reason to an existing recommendation's reasons[].
 * Used when multiple layers independently support the same supplement.
 */
export type AddReasonFn = (
  recs: Recommendation[],
  supplementId: string,
  layer: LayerName,
  reason: string,
  detail?: string,
) => Recommendation[];

/**
 * THE KEY FUNCTION — call this instead of pushing directly to the array.
 *
 * If a recommendation with newRec.id already exists:
 *   - Uses the HIGHER of the two dose values
 *   - Prefers the more bioavailable form (caller is responsible for ordering)
 *   - Merges reasons[], warnings[], notes[], and sources[]
 *   - Uses the higher priority value
 *
 * If the supplement does not yet exist: appends newRec to the array.
 *
 * NEVER creates duplicate supplement IDs.
 */
export type AddOrModifyFn = (
  recs: Recommendation[],
  newRec: Recommendation,
  layer: LayerName,
) => Recommendation[];

/**
 * Remove a recommendation by ID.
 * Records the removal in the returned array's audit trail via a warning
 * (the supplement is gone, but the reason is preserved in blockedRecommendations).
 */
export type RemoveRecFn = (
  recs: Recommendation[],
  supplementId: string,
  layer: LayerName,
  reason: string,
) => Recommendation[];

/**
 * Enforce a maximum supplement count.
 * Sorts by priority descending, keeps the top maxCount, drops the rest.
 * Should be called as the final step before safety filtering.
 */
export type CapProtocolFn = (
  recs: Recommendation[],
  maxCount: number,
) => Recommendation[];

// ─── ALLERGY FLAGS ────────────────────────────────────────────────────────────

/**
 * Attached to a Recommendation by Layer 2 (dietary) when a user's allergy
 * affects the supplement's default ingredient or form.
 *
 * e.g. fish allergy → omega-3 fish oil needs 'swap-form' to algae-based DHA.
 */
export interface AllergyFlag {
  /** The allergen that triggered this flag, e.g. "fish", "shellfish", "dairy" */
  allergen: string;
  action: 'swap-form' | 'avoid-ingredient' | 'use-alternative';
  /** Human-readable note surfaced on the results card */
  note: string;
}

// ─── PLAN TIERS ───────────────────────────────────────────────────────────────

export type PlanTier = 'free' | 'premium';

export interface TierConfig {
  /** Maximum number of supplements shown in the protocol */
  maxSupplements: number;
  /** Whether the full 7-day timing schedule is shown */
  showFullSchedule: boolean;
  /** Whether per-supplement layer explanations ("why this was recommended") are shown */
  showLayerExplanations: boolean;
  /** Whether genetic variant insights are shown */
  showGeneticInsights: boolean;
  /** Whether lab value interpretation callouts are shown */
  showLabInterpretation: boolean;
  /** Whether drug-interaction detail cards are shown (safety warnings always visible) */
  showDrugInteractionDetails: boolean;
  /** Whether molecular form optimisation notes are shown */
  showFormOptimization: boolean;
  /** Whether the PDF download button is enabled */
  pdfDownload: boolean;
  /** Whether Amazon affiliate links are shown on supplement cards */
  amazonLinks: boolean;
}

export const TIER_CONFIG: Record<PlanTier, TierConfig> = {
  free: {
    maxSupplements: 5,
    showFullSchedule: true,
    showLayerExplanations: false,
    showGeneticInsights: false,
    showLabInterpretation: false,
    showDrugInteractionDetails: true,  // safety information always visible
    showFormOptimization: false,
    pdfDownload: true,
    amazonLinks: true,
  },
  premium: {
    maxSupplements: 10,
    showFullSchedule: true,
    showLayerExplanations: true,
    showGeneticInsights: true,
    showLabInterpretation: true,
    showDrugInteractionDetails: true,
    showFormOptimization: true,
    pdfDownload: true,
    amazonLinks: true,
  },
};

// ─── PROTOCOL RESULT ─────────────────────────────────────────────────────────

/**
 * The final output of the full 7-layer pipeline, post-safety-filter.
 * Separates displayed vs. hidden recommendations based on the user's tier,
 * and carries the complete safety and scheduling output.
 */
export interface ProtocolResult {
  tier: PlanTier;
  /**
   * Supplements shown to the user — capped at TIER_CONFIG[tier].maxSupplements,
   * sorted by priority descending.
   */
  displayedRecommendations: Recommendation[];
  /**
   * Supplements calculated but hidden because the user is on the free tier.
   * Shown as a blurred/locked upsell row on the results page.
   */
  hiddenRecommendations: Recommendation[];
  /** Optional upsell copy, e.g. "Unlock 5 more personalised supplements with Premium" */
  upsellMessage?: string;
  safetyResult: SafetyResult;
  weeklySchedule: WeeklySchedule;
}
