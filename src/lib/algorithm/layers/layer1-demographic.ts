// ─────────────────────────────────────────────────────────────────────────────
// NutriGenius — Layer 1: Demographic Baseline
//
// Seeds the initial recommendation array based solely on age, sex, country,
// and reproductive status. Every subsequent layer receives this array and
// calls addOrModify() — never push() directly — to prevent duplicate IDs.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Recommendation,
  QuizData,
  LayerName,
  LayerSource,
  RecommendationReason,
  CyclingPattern,
  CYCLE_DAILY,
  COUNTRY_DATA,
  SupplementCategory,
} from '../types';

// ─── CONCRETE HELPER IMPLEMENTATIONS ─────────────────────────────────────────
// types.ts only defines the *signatures*; the actual functions live here.

export function findExistingRec(
  recs: Recommendation[],
  supplementId: string,
): Recommendation | undefined {
  return recs.find(r => r.id === supplementId);
}

export function modifyDose(
  recs: Recommendation[],
  supplementId: string,
  newDose: number,
  layer: LayerName,
  reason: string,
): Recommendation[] {
  return recs.map(r => {
    if (r.id !== supplementId) return r;
    const source: LayerSource = {
      layer,
      action: 'modified-dose',
      previousValue: `${r.dose} ${r.doseUnit}`,
      newValue: `${newDose} ${r.doseUnit}`,
    };
    return { ...r, dose: newDose, sources: [...r.sources, source] };
  });
}

export function modifyForm(
  recs: Recommendation[],
  supplementId: string,
  newForm: string,
  layer: LayerName,
  reason: string,
): Recommendation[] {
  return recs.map(r => {
    if (r.id !== supplementId) return r;
    const source: LayerSource = {
      layer,
      action: 'modified-form',
      previousValue: r.form,
      newValue: newForm,
    };
    return { ...r, form: newForm, sources: [...r.sources, source] };
  });
}

export function modifyTiming(
  recs: Recommendation[],
  supplementId: string,
  newTiming: Recommendation['timing'],
  layer: LayerName,
  reason: string,
): Recommendation[] {
  return recs.map(r => {
    if (r.id !== supplementId) return r;
    const source: LayerSource = {
      layer,
      action: 'modified-timing',
      previousValue: r.timing.join(', '),
      newValue: newTiming.join(', '),
    };
    return { ...r, timing: newTiming, sources: [...r.sources, source] };
  });
}

export function addReason(
  recs: Recommendation[],
  supplementId: string,
  layer: LayerName,
  reason: string,
  detail?: string,
): Recommendation[] {
  return recs.map(r => {
    if (r.id !== supplementId) return r;
    const newReason: RecommendationReason = { layer, reason, ...(detail ? { detail } : {}) };
    const source: LayerSource = { layer, action: 'added-reason', newValue: reason };
    return {
      ...r,
      reasons: [...r.reasons, newReason],
      sources: [...r.sources, source],
    };
  });
}

/**
 * THE KEY FUNCTION — prevents duplicate supplement IDs.
 *
 * If newRec.id already exists:
 *   - Higher dose wins
 *   - Form follows the higher-dose entry (caller controls ordering)
 *   - Merges reasons[], warnings[], notes[], separateFrom[], sources[]
 *   - Higher priority wins
 *
 * If not found: appends newRec.
 */
export function addOrModify(
  recs: Recommendation[],
  newRec: Recommendation,
  layer: LayerName,
): Recommendation[] {
  const idx = recs.findIndex(r => r.id === newRec.id);
  if (idx === -1) {
    return [...recs, newRec];
  }

  const existing = recs[idx];
  const higherDoseEntry = newRec.dose >= existing.dose ? newRec : existing;

  const dedupeStrings = (a: string[], b: string[]): string[] =>
    [...new Set([...a, ...b])];

  const dedupeReasons = (
    a: RecommendationReason[],
    b: RecommendationReason[],
  ): RecommendationReason[] => {
    const seen = new Set(a.map(r => `${r.layer}::${r.reason}`));
    return [...a, ...b.filter(r => !seen.has(`${r.layer}::${r.reason}`))];
  };

  const dedupeSources = (a: LayerSource[], b: LayerSource[]): LayerSource[] => {
    const seen = new Set(a.map(s => `${s.layer}::${s.action}::${s.newValue ?? ''}`));
    return [...a, ...b.filter(s => !seen.has(`${s.layer}::${s.action}::${s.newValue ?? ''}`))];
  };

  const merged: Recommendation = {
    ...existing,
    dose: Math.max(existing.dose, newRec.dose),
    doseUnit: higherDoseEntry.doseUnit,
    form: higherDoseEntry.form,
    priority: Math.max(existing.priority, newRec.priority),
    reasons: dedupeReasons(existing.reasons, newRec.reasons),
    warnings: dedupeStrings(existing.warnings, newRec.warnings),
    notes: dedupeStrings(existing.notes, newRec.notes),
    separateFrom: dedupeStrings(existing.separateFrom, newRec.separateFrom),
    sources: dedupeSources(existing.sources, newRec.sources),
  };

  return [...recs.slice(0, idx), merged, ...recs.slice(idx + 1)];
}

export function removeRec(
  recs: Recommendation[],
  supplementId: string,
  layer: LayerName,
  reason: string,
): Recommendation[] {
  return recs.filter(r => r.id !== supplementId);
}

export function capProtocol(recs: Recommendation[], maxCount: number): Recommendation[] {
  return [...recs].sort((a, b) => b.priority - a.priority).slice(0, maxCount);
}

// ─── INTERNAL HELPERS ─────────────────────────────────────────────────────────

const LAYER: LayerName = 'demographic';

const GULF_COUNTRIES = new Set(['SA', 'AE', 'QA', 'BH', 'KW', 'OM']);

function makeSource(action: LayerSource['action'], extra?: Partial<LayerSource>): LayerSource {
  return { layer: LAYER, action, ...extra };
}

function makeReason(reason: string, detail?: string): RecommendationReason {
  return { layer: LAYER, reason, ...(detail ? { detail } : {}) };
}

/** Returns absolute latitude for a quiz, using COUNTRY_DATA as fallback. */
function getLatitude(quiz: QuizData): number {
  if (quiz.latitude !== undefined) return quiz.latitude;
  return COUNTRY_DATA[quiz.country]?.latitude ?? 0;
}

/** Compute Vitamin D3 dose (IU) from latitude, country, and age. */
function calcVitaminDDose(quiz: QuizData): number {
  const lat = Math.abs(getLatitude(quiz));

  let dose: number;

  if (lat >= 51) {
    dose = 4000; // British Isles, Scandinavia, northern Canada
  } else if (lat >= 40) {
    dose = 3000; // Central Europe, northern US
  } else if (lat >= 35 || GULF_COUNTRIES.has(quiz.country)) {
    // Gulf paradox: despite low latitude, indoor culture means poor synthesis
    dose = 2000;
  } else {
    dose = 1000; // Equatorial / tropical countries
  }

  // Age boosts — absorption and conversion efficiency decline with age
  if (quiz.age >= 60) {
    dose = Math.min(dose + 1000, 4000);
  } else if (quiz.age >= 50) {
    dose = Math.min(dose + 500, 4000);
  }

  return dose;
}

function makeRec(partial: Omit<Recommendation, 'sources'> & { sources?: LayerSource[] }): Recommendation {
  return {
    sources: [makeSource('added')],
    ...partial,
  };
}

// ─── CLINICAL LOGIC ───────────────────────────────────────────────────────────

function addVitaminD(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const dose = calcVitaminDDose(quiz);
  const lat = Math.abs(getLatitude(quiz));

  const latReason =
    lat >= 51
      ? 'High latitude (≥51°N) — minimal UVB Oct–Mar; supplementation is essential'
      : lat >= 40
      ? 'Mid-high latitude (40–51°) — limited UVB synthesis Nov–Feb'
      : lat >= 35
      ? 'Mid latitude (35–40°) — reduced winter synthesis'
      : GULF_COUNTRIES.has(quiz.country)
      ? 'Gulf region — indoor lifestyle limits sun exposure despite low latitude'
      : 'Baseline Vitamin D3 for all adults';

  const rec = makeRec({
    id: 'vitamin-d3',
    supplementName: 'Vitamin D3',
    form: 'cholecalciferol',
    dose,
    doseUnit: 'IU',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason(latReason)],
    warnings: dose >= 4000
      ? ['Do not exceed 4,000 IU daily without medical supervision']
      : [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 7,
    category: 'vitamin',
    separateFrom: [],
    notes: ['Fat-soluble — take with your largest meal for best absorption'],
  });

  return addOrModify(recs, rec, LAYER);
}

function addMagnesium(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  // Age 60+ benefits from slightly higher dose for muscle and sleep
  const dose = quiz.age >= 60 ? 300 : 200;

  const rec = makeRec({
    id: 'magnesium-glycinate',
    supplementName: 'Magnesium Glycinate',
    form: 'glycinate',
    dose,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['bedtime'],
    withFood: false,
    evidenceRating: 'Strong',
    reasons: [makeReason('Baseline magnesium for all adults — >50% of adults are deficient')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 6,
    category: 'mineral',
    separateFrom: [],
    notes: ['Glycinate form is highly bioavailable and gentle on the stomach'],
  });

  return addOrModify(recs, rec, LAYER);
}

function addOmega3(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const rec = makeRec({
    id: 'omega-3-fish-oil',
    supplementName: 'Omega-3 Fish Oil',
    form: 'fish-oil',
    dose: 1000,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['midday'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason('Baseline omega-3 for all adults — EPA/DHA support cardiovascular and cognitive health')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 5,
    category: 'omega-fatty-acid',
    separateFrom: [],
    notes: [
      'Take with food to minimise fishy aftertaste',
      'Layer 2 (dietary) will switch to algae-based DHA if vegan',
    ],
  });

  return addOrModify(recs, rec, LAYER);
}

function addVitaminB12(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (quiz.age < 50) return recs;

  // Age 65+ has significantly impaired intrinsic factor production
  const dose = quiz.age >= 65 ? 1000 : 500;

  const rec = makeRec({
    id: 'vitamin-b12',
    supplementName: 'Vitamin B12',
    form: 'methylcobalamin',
    dose,
    doseUnit: 'mcg',
    frequency: 'daily',
    timing: ['morning-empty'],
    withFood: false,
    evidenceRating: 'Strong',
    reasons: [
      makeReason(
        `Age ${quiz.age}+ — gastric acid and intrinsic factor production decline, reducing dietary B12 absorption`,
        'Methylcobalamin is the active, neurologically available form — preferred over cyanocobalamin',
      ),
    ],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 7,
    category: 'vitamin',
    separateFrom: [],
    notes: ['Methylcobalamin — take sublingually or on empty stomach for best absorption'],
  });

  return addOrModify(recs, rec, LAYER);
}

function addFolate(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  // Pregnant women receive a higher prenatal dose later; skip baseline here
  if (quiz.biologicalSex !== 'female') return recs;
  if (quiz.isPregnant) return recs;
  if (quiz.age < 18 || quiz.age > 50) return recs;

  const rec = makeRec({
    id: 'folate-5mthf',
    supplementName: 'Folate (5-MTHF)',
    form: '5-methyltetrahydrofolate',
    dose: 400,
    doseUnit: 'mcg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [
      makeReason(
        'Women aged 18–50 — neural tube defect prevention and folate cycle support',
        '5-MTHF is the bioactive form, bypassing the MTHFR enzyme step',
      ),
    ],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 6,
    category: 'vitamin',
    separateFrom: [],
    notes: ['Active methylfolate form — effective even with MTHFR variants'],
  });

  return addOrModify(recs, rec, LAYER);
}

function addCalcium(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (quiz.biologicalSex !== 'female') return recs;
  const isEligible = quiz.age >= 50 || quiz.isPostmenopausal === true;
  if (!isEligible) return recs;

  // Age 65+ or confirmed postmenopausal: higher dose for bone density
  const dose = quiz.age >= 65 || quiz.isPostmenopausal ? 600 : 500;

  const rec = makeRec({
    id: 'calcium-citrate',
    supplementName: 'Calcium Citrate',
    form: 'citrate',
    dose,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['evening'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [
      makeReason(
        'Postmenopausal / age 50+ woman — oestrogen loss accelerates bone mineral density loss',
        'Citrate form absorbs with or without stomach acid — preferred over carbonate post-menopause',
      ),
    ],
    warnings: [
      'Separate by ≥2 hours from iron or zinc supplements to avoid absorption competition',
    ],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 6,
    category: 'mineral',
    separateFrom: ['iron-bisglycinate', 'zinc-picolinate'],
    notes: ['Citrate form does not require stomach acid — suitable post-menopause'],
  });

  return addOrModify(recs, rec, LAYER);
}

function addZincAndLycopene(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (quiz.biologicalSex !== 'male') return recs;
  if (quiz.age < 40) return recs;

  // Zinc for prostate health and testosterone support
  const zinc = makeRec({
    id: 'zinc-picolinate',
    supplementName: 'Zinc Picolinate',
    form: 'picolinate',
    dose: 15,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Moderate',
    reasons: [
      makeReason(
        'Men 40+ — zinc supports prostate health, testosterone synthesis, and immune function',
      ),
    ],
    warnings: ['Do not exceed 40 mg/day (tolerable upper intake level)'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 5,
    category: 'mineral',
    separateFrom: ['calcium-citrate', 'iron-bisglycinate'],
    notes: ['Picolinate form: best absorbed zinc chelate'],
  });

  // Lycopene for prostate and cardiovascular protection
  const lycopene = makeRec({
    id: 'lycopene',
    supplementName: 'Lycopene',
    form: 'lycopene',
    dose: 10,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['midday'],
    withFood: true,
    evidenceRating: 'Moderate',
    reasons: [
      makeReason(
        'Men 40+ — lycopene is associated with reduced prostate cancer risk and LDL oxidation',
      ),
    ],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 5,
    category: 'antioxidant',
    separateFrom: [],
    notes: ['Fat-soluble carotenoid — take with a meal containing healthy fats'],
  });

  let updated = addOrModify(recs, zinc, LAYER);
  updated = addOrModify(updated, lycopene, LAYER);
  return updated;
}

function addCoQ10(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (quiz.age < 60) return recs;

  // 200 mg at 70+ when endogenous synthesis has declined further
  const dose = quiz.age >= 70 ? 200 : 100;

  const rec = makeRec({
    id: 'coq10-ubiquinol',
    supplementName: 'CoQ10 (Ubiquinol)',
    form: 'ubiquinol',
    dose,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Moderate',
    reasons: [
      makeReason(
        `Age ${quiz.age}+ — endogenous CoQ10 production declines significantly after 60; ubiquinol supports mitochondrial energy and cardiovascular function`,
      ),
    ],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 5,
    category: 'antioxidant',
    separateFrom: [],
    notes: ['Ubiquinol (reduced form) has 3–8× better absorption than ubiquinone'],
  });

  return addOrModify(recs, rec, LAYER);
}

function addPrenatalStack(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!quiz.isPregnant) return recs;

  // Folate 800 mcg — doubles the baseline dose, priority 10
  const folate = makeRec({
    id: 'folate-5mthf',
    supplementName: 'Folate (5-MTHF)',
    form: '5-methyltetrahydrofolate',
    dose: 800,
    doseUnit: 'mcg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason('Pregnancy — 800 mcg 5-MTHF reduces neural tube defect risk by >70%')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 10,
    category: 'vitamin',
    separateFrom: [],
    notes: ['Critical in first trimester — ideally started pre-conception'],
  });

  // Iron 27 mg bisglycinate — gentle, low-GI form
  const iron = makeRec({
    id: 'iron-bisglycinate',
    supplementName: 'Iron (Bisglycinate)',
    form: 'bisglycinate',
    dose: 27,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-empty'],
    withFood: false,
    evidenceRating: 'Strong',
    reasons: [makeReason('Pregnancy — iron requirements double to 27 mg/day for fetal red cell production')],
    warnings: ['Separate from calcium and zinc by ≥2 hours'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 10,
    category: 'mineral',
    separateFrom: ['calcium-citrate', 'zinc-picolinate'],
    notes: [
      'Bisglycinate form causes significantly less constipation than ferrous sulphate',
      'Take with vitamin C to enhance absorption',
    ],
  });

  // DHA 200 mg — algae-based (safe for all dietary patterns)
  const dha = makeRec({
    id: 'dha-algae',
    supplementName: 'DHA (Algae-Derived)',
    form: 'algae-oil',
    dose: 200,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['midday'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason('Pregnancy — DHA is critical for fetal brain and retinal development (third trimester)')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 10,
    category: 'omega-fatty-acid',
    separateFrom: [],
    notes: ['Algae-derived DHA — the original marine source, suitable for all dietary patterns'],
  });

  // Choline 450 mg — often missing from prenatal vitamins
  const choline = makeRec({
    id: 'choline',
    supplementName: 'Choline',
    form: 'choline-bitartrate',
    dose: 450,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason('Pregnancy — 450 mg/day choline supports fetal hippocampal development and maternal liver function')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 10,
    category: 'vitamin',
    separateFrom: [],
    notes: ['Often underdosed or absent in standard prenatal vitamins — supplement separately if needed'],
  });

  // Iodine 220 mcg — critical for fetal thyroid and cognitive development
  const iodine = makeRec({
    id: 'iodine',
    supplementName: 'Iodine',
    form: 'potassium-iodide',
    dose: 220,
    doseUnit: 'mcg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason('Pregnancy — 220 mcg/day iodine is required for fetal thyroid hormone synthesis and IQ development')],
    warnings: ['Do not exceed 1,100 mcg/day total iodine intake'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 10,
    category: 'mineral',
    separateFrom: [],
    notes: ['Iodine deficiency during pregnancy is the leading preventable cause of intellectual disability worldwide'],
  });

  let updated = recs;
  for (const rec of [folate, iron, dha, choline, iodine]) {
    updated = addOrModify(updated, rec, LAYER);
  }

  // Boost Vitamin D3 to 4,000 IU for pregnancy (already in recs from addVitaminD)
  if (findExistingRec(updated, 'vitamin-d3')) {
    const currentD = findExistingRec(updated, 'vitamin-d3')!;
    if (currentD.dose < 4000) {
      updated = modifyDose(updated, 'vitamin-d3', 4000, LAYER, 'Pregnancy — 4,000 IU supports fetal bone, immune, and neurological development');
    }
  }

  return updated;
}

function addBreastfeedingStack(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!quiz.isBreastfeeding) return recs;
  // Prenatal and breastfeeding are mutually exclusive in practice; handle both gracefully

  // DHA 200 mg — supports infant brain development via breast milk
  const dha = makeRec({
    id: 'dha-algae',
    supplementName: 'DHA (Algae-Derived)',
    form: 'algae-oil',
    dose: 200,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['midday'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason('Breastfeeding — maternal DHA directly transfers to breast milk; supports infant cognitive development')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 9,
    category: 'omega-fatty-acid',
    separateFrom: [],
    notes: ['Algae-derived DHA — suitable for all dietary patterns'],
  });

  // Iodine 290 mcg — higher requirement during lactation
  const iodine = makeRec({
    id: 'iodine',
    supplementName: 'Iodine',
    form: 'potassium-iodide',
    dose: 290,
    doseUnit: 'mcg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason('Breastfeeding — 290 mcg/day iodine needed; breast milk is the infant\'s sole iodine source')],
    warnings: ['Do not exceed 1,100 mcg/day total iodine intake'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 9,
    category: 'mineral',
    separateFrom: [],
    notes: [],
  });

  let updated = recs;
  for (const rec of [dha, iodine]) {
    updated = addOrModify(updated, rec, LAYER);
  }

  // Boost Vitamin D3 to 4,000 IU — breast milk D content tracks maternal levels
  if (findExistingRec(updated, 'vitamin-d3')) {
    const currentD = findExistingRec(updated, 'vitamin-d3')!;
    if (currentD.dose < 4000) {
      updated = modifyDose(updated, 'vitamin-d3', 4000, LAYER, 'Breastfeeding — 4,000 IU maintains adequate breast milk Vitamin D for infant');
    }
  }

  return updated;
}

function addIodine(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  // Skip if pregnant or breastfeeding — those stacks already handle iodine
  if (quiz.isPregnant || quiz.isBreastfeeding) return recs;

  const countryData = COUNTRY_DATA[quiz.country];
  if (!countryData?.iodineDeficient) return recs;

  const rec = makeRec({
    id: 'iodine',
    supplementName: 'Iodine',
    form: 'potassium-iodide',
    dose: 150,
    doseUnit: 'mcg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Moderate',
    reasons: [
      makeReason(
        `${quiz.country} has endemic borderline iodine deficiency — 150 mcg/day meets adult RDA`,
        'National nutritional surveys indicate insufficient iodine intake in this population',
      ),
    ],
    warnings: ['Do not exceed 1,100 mcg/day total iodine intake'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 5,
    category: 'mineral',
    separateFrom: [],
    notes: [],
  });

  return addOrModify(recs, rec, LAYER);
}

// ─── LAYER 1 ENTRY POINT ──────────────────────────────────────────────────────

/**
 * Layer 1 — Demographic Baseline.
 *
 * Generates a seed recommendation array from demographics alone.
 * Subsequent layers receive this array and call addOrModify() to refine it.
 *
 * Clinical logic applied (in order):
 *   1. Vitamin D3       — all adults; dose by latitude + Gulf paradox + age
 *   2. Magnesium glycinate — all adults
 *   3. Omega-3 fish oil — all adults (Layer 2 overrides for vegans)
 *   4. Vitamin B12      — age 50+
 *   5. Folate 5-MTHF    — women 18–50 (non-pregnant)
 *   6. Calcium citrate  — women 50+ / postmenopausal
 *   7. Zinc + Lycopene  — men 40+
 *   8. CoQ10 ubiquinol  — age 60+
 *   9. Prenatal stack   — if isPregnant (overrides folate dose to 800 mcg)
 *  10. Breastfeeding stack — if isBreastfeeding
 *  11. Iodine 150 mcg   — iodine-deficient countries (non-pregnant/breastfeeding)
 */
export const layer1Demographic = (quiz: QuizData): Recommendation[] => {
  let recs: Recommendation[] = [];

  recs = addVitaminD(quiz, recs);
  recs = addMagnesium(quiz, recs);
  recs = addOmega3(quiz, recs);
  recs = addVitaminB12(quiz, recs);
  recs = addFolate(quiz, recs);
  recs = addCalcium(quiz, recs);
  recs = addZincAndLycopene(quiz, recs);
  recs = addCoQ10(quiz, recs);
  recs = addPrenatalStack(quiz, recs);
  recs = addBreastfeedingStack(quiz, recs);
  recs = addIodine(quiz, recs);

  return recs;
};
