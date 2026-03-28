// ─────────────────────────────────────────────────────────────────────────────
// NutriGenius — Layer 2: Dietary Analysis
//
// Analyses the user's dietary pattern and food-intake frequencies to close
// nutritional gaps introduced by the diet. Modifies Layer 1 recommendations
// where appropriate (dose / form upgrades) and adds new ones.
//
// CRITICAL: Always call addOrModify() / modifyDose() / modifyForm() / addReason()
//           instead of pushing directly. Never create duplicate supplement IDs.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Recommendation,
  QuizData,
  LayerName,
  LayerSource,
  RecommendationReason,
  AllergyFlag,
  CYCLE_DAILY,
  CYCLE_ALTERNATE_DAY,
} from '../types';

import {
  findExistingRec,
  modifyDose,
  modifyForm,
  addReason,
  addOrModify,
  removeRec,
} from './layer1-demographic';

// ─── LAYER CONSTANT ───────────────────────────────────────────────────────────

const LAYER: LayerName = 'dietary';

// ─── INTERNAL HELPERS ─────────────────────────────────────────────────────────

function makeReason(reason: string, detail?: string): RecommendationReason {
  return { layer: LAYER, reason, ...(detail ? { detail } : {}) };
}

function makeSource(
  action: LayerSource['action'],
  extra?: Partial<LayerSource>,
): LayerSource {
  return { layer: LAYER, action, ...extra };
}

function makeRec(
  partial: Omit<Recommendation, 'sources'> & { sources?: LayerSource[] },
): Recommendation {
  return { sources: [makeSource('added')], ...partial };
}

/**
 * Append an informational note to an existing recommendation.
 * No-ops if the supplement is not in the list or the note is already present.
 */
export function appendNote(
  recs: Recommendation[],
  supplementId: string,
  note: string,
): Recommendation[] {
  return recs.map(r => {
    if (r.id !== supplementId || r.notes.includes(note)) return r;
    return { ...r, notes: [...r.notes, note] };
  });
}

/**
 * Attach an AllergyFlag to a recommendation.
 * No-ops if the supplement is not in the list or the flag already exists.
 */
export function addAllergyFlag(
  recs: Recommendation[],
  supplementId: string,
  flag: AllergyFlag,
): Recommendation[] {
  return recs.map(r => {
    if (r.id !== supplementId) return r;
    const existing = r.allergyFlags ?? [];
    if (existing.some(f => f.allergen === flag.allergen && f.action === flag.action)) return r;
    return { ...r, allergyFlags: [...existing, flag] };
  });
}

/**
 * Swap the omega-3 entry from fish oil to algae-based DHA.
 *
 * Uses modifyForm() for a proper sources[] audit entry, then updates
 * supplementName and dose (fields modifyForm does not touch).
 * If form is already algae-oil, only adds the reason — no duplication.
 * No-ops if omega-3-fish-oil is not in the list.
 */
export function swapOmega3ToAlgae(
  recs: Recommendation[],
  reason: string,
): Recommendation[] {
  const existing = findExistingRec(recs, 'omega-3-fish-oil');
  if (!existing) return recs;

  // Already swapped (e.g. vegan logic ran before allergy logic)
  if (existing.form === 'algae-oil') {
    return addReason(recs, 'omega-3-fish-oil', LAYER, reason);
  }

  // modifyForm records the form change in sources[]
  let updated = modifyForm(recs, 'omega-3-fish-oil', 'algae-oil', LAYER, reason);
  // Attach human-readable reason to reasons[]
  updated = addReason(updated, 'omega-3-fish-oil', LAYER, reason);
  // Update display fields not covered by modifyForm
  return updated.map(r =>
    r.id !== 'omega-3-fish-oil'
      ? r
      : {
          ...r,
          supplementName: 'Algae Omega-3 (DHA)',
          dose: 500,
          notes: [
            ...r.notes.filter(n => !n.includes('fishy aftertaste')),
            'Take with food for best DHA absorption',
          ],
        },
  );
}

// ─── VEGAN ────────────────────────────────────────────────────────────────────

function handleVeganB12(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const existing = findExistingRec(recs, 'vitamin-b12');
  const reason =
    'Vegan diet — essentially zero dietary B12; supplementation is essential';

  if (existing) {
    if (existing.dose < 1000) {
      recs = modifyDose(recs, 'vitamin-b12', 1000, LAYER,
        'Vegan diet — 1,000 mcg/day ensures adequate absorption via passive diffusion');
    }
    return addReason(recs, 'vitamin-b12', LAYER, reason);
  }

  return addOrModify(recs, makeRec({
    id: 'vitamin-b12',
    supplementName: 'Vitamin B12',
    form: 'methylcobalamin',
    dose: 1000,
    doseUnit: 'mcg',
    frequency: 'daily',
    timing: ['morning-empty'],
    withFood: false,
    evidenceRating: 'Strong',
    reasons: [makeReason(reason,
      'Methylcobalamin is the active neurological form. 1,000 mcg/day achieves adequate levels via passive diffusion even without intrinsic factor.')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 9,
    category: 'vitamin',
    separateFrom: [],
    notes: ['Methylcobalamin — take sublingually or on empty stomach for best absorption'],
  }), LAYER);
}

function handleVeganOmega3(recs: Recommendation[]): Recommendation[] {
  // Pregnant / breastfeeding users already have dha-algae from L1
  if (findExistingRec(recs, 'dha-algae') && !findExistingRec(recs, 'omega-3-fish-oil')) {
    return addReason(recs, 'dha-algae', LAYER,
      'Vegan diet — algae-based DHA already in protocol; no fish oil required');
  }
  return swapOmega3ToAlgae(recs,
    'Vegan diet — algae is the original marine source of DHA; plant-based and equally bioavailable');
}

function handleVeganIron(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const existing = findExistingRec(recs, 'iron-bisglycinate');
  if (existing) {
    return addReason(recs, 'iron-bisglycinate', LAYER,
      'Vegan diet — non-heme iron from plant sources has ~10% absorption vs ~25% for haem iron');
  }

  return addOrModify(recs, makeRec({
    id: 'iron-bisglycinate',
    supplementName: 'Iron (Bisglycinate)',
    form: 'bisglycinate',
    dose: 18,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-empty'],
    withFood: false,
    evidenceRating: 'Strong',
    reasons: [makeReason(
      'Vegan diet — non-heme iron has lower bioavailability; ferrous bisglycinate is the best-tolerated supplemental form',
      'Recommended due to vegan diet. If ferritin levels are adequate (>30 ng/mL), iron supplementation may not be necessary.',
    )],
    warnings: [
      'Recommended due to vegan diet. If ferritin is adequate (>30 ng/mL), iron supplementation may not be necessary.',
    ],
    contraindications: [],
    cyclingPattern: CYCLE_ALTERNATE_DAY,
    priority: 7,
    category: 'mineral',
    separateFrom: ['calcium-citrate', 'zinc-picolinate'],
    notes: [
      'Take with Vitamin C for enhanced non-heme iron absorption',
      'Alternate-day dosing — emerging evidence suggests this maximises hepcidin clearance and absorption efficiency',
    ],
  }), LAYER);
}

function handleVeganZinc(recs: Recommendation[]): Recommendation[] {
  const phytateReason =
    'Vegan diet — dietary phytates reduce zinc absorption by ~35%; dose adjusted upward to compensate';
  const existing = findExistingRec(recs, 'zinc-picolinate');

  if (existing) {
    const newDose = Math.min(Math.round(existing.dose * 1.5), 25);
    let updated = modifyDose(recs, 'zinc-picolinate', newDose, LAYER, phytateReason);
    return addReason(updated, 'zinc-picolinate', LAYER, phytateReason);
  }

  return addOrModify(recs, makeRec({
    id: 'zinc-picolinate',
    supplementName: 'Zinc Picolinate',
    form: 'picolinate',
    dose: 22,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason(phytateReason)],
    warnings: ['Do not exceed 40 mg/day (tolerable upper intake level)'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 7,
    category: 'mineral',
    separateFrom: ['calcium-citrate', 'iron-bisglycinate'],
    notes: ['Picolinate form: best absorbed zinc chelate'],
  }), LAYER);
}

function handleVeganIodine(recs: Recommendation[]): Recommendation[] {
  const reason = 'Vegan diet — no fish or dairy; primary dietary iodine sources eliminated';
  const existing = findExistingRec(recs, 'iodine');
  if (existing) return addReason(recs, 'iodine', LAYER, reason);

  return addOrModify(recs, makeRec({
    id: 'iodine',
    supplementName: 'Iodine',
    form: 'potassium-iodide',
    dose: 150,
    doseUnit: 'mcg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason(reason,
      '150 mcg/day meets the adult RDA and prevents subclinical hypothyroidism from dietary iodine exclusion')],
    warnings: ['Do not exceed 1,100 mcg/day total iodine intake'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 7,
    category: 'mineral',
    separateFrom: [],
    notes: [],
  }), LAYER);
}

function handleVeganCalcium(recs: Recommendation[]): Recommendation[] {
  const reason =
    'Vegan diet — no dairy; calcium intake from plant sources is often insufficient';
  const existing = findExistingRec(recs, 'calcium-citrate');
  if (existing) return addReason(recs, 'calcium-citrate', LAYER, reason);

  return addOrModify(recs, makeRec({
    id: 'calcium-citrate',
    supplementName: 'Calcium Citrate',
    form: 'citrate',
    dose: 500,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['evening'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason(reason,
      'Citrate form is well-absorbed without food and has lower kidney stone risk than carbonate')],
    warnings: ['Separate by ≥2 hours from iron or zinc supplements to avoid absorption competition'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 7,
    category: 'mineral',
    separateFrom: ['iron-bisglycinate', 'zinc-picolinate'],
    notes: ['Calcium citrate is well-absorbed and completely dairy-free'],
  }), LAYER);
}

function handleVeganVitaminD(recs: Recommendation[]): Recommendation[] {
  const existing = findExistingRec(recs, 'vitamin-d3');
  if (!existing) return recs;

  const newDose = Math.min(existing.dose + 1000, 5000);
  let updated = modifyDose(recs, 'vitamin-d3', newDose, LAYER,
    'Vegan diet — few plant food sources of Vitamin D; dietary contribution is minimal');
  updated = addReason(updated, 'vitamin-d3', LAYER,
    'Vegan diet — dietary Vitamin D is essentially absent; dose increased by 1,000 IU');
  return appendNote(updated, 'vitamin-d3',
    'Look for vegan-certified Vitamin D3 (from lichen) or use D2 (ergocalciferol) — standard D3 (cholecalciferol) is typically derived from lanolin (sheep wool)');
}

function handleVeganK2(recs: Recommendation[]): Recommendation[] {
  if (findExistingRec(recs, 'vitamin-k2-mk7')) return recs;

  return addOrModify(recs, makeRec({
    id: 'vitamin-k2-mk7',
    supplementName: 'Vitamin K2 (MK-7)',
    form: 'menaquinone-7',
    dose: 100,
    doseUnit: 'mcg',
    frequency: 'daily',
    timing: ['evening'],
    withFood: true,
    evidenceRating: 'Moderate',
    reasons: [makeReason(
      'Vegan diet — works synergistically with Vitamin D3 and calcium to direct calcium into bones rather than arteries',
      'Natto (fermented soy) is the richest dietary source — rarely consumed in Western diets',
    )],
    warnings: ['May interact with warfarin — consult physician if on anticoagulants'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 5,
    category: 'vitamin',
    separateFrom: [],
    notes: ['MK-7 form has a long half-life (~3 days) — once-daily dosing is sufficient'],
  }), LAYER);
}

function applyVeganModifications(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  recs = handleVeganB12(quiz, recs);
  recs = handleVeganOmega3(recs);
  recs = handleVeganIron(quiz, recs);
  recs = handleVeganZinc(recs);
  recs = handleVeganIodine(recs);
  recs = handleVeganCalcium(recs);
  recs = handleVeganVitaminD(recs);
  recs = handleVeganK2(recs);
  return recs;
}

// ─── VEGETARIAN ───────────────────────────────────────────────────────────────

function applyVegetarianModifications(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  // B12: dairy and eggs provide some, but often insufficient for optimal levels
  const b12Reason =
    'Vegetarian diet — dairy and eggs provide some B12, but levels are often sub-optimal without supplementation';
  const existingB12 = findExistingRec(recs, 'vitamin-b12');
  if (existingB12) {
    recs = addReason(recs, 'vitamin-b12', LAYER, b12Reason);
  } else {
    recs = addOrModify(recs, makeRec({
      id: 'vitamin-b12',
      supplementName: 'Vitamin B12',
      form: 'methylcobalamin',
      dose: 500,
      doseUnit: 'mcg',
      frequency: 'daily',
      timing: ['morning-empty'],
      withFood: false,
      evidenceRating: 'Strong',
      reasons: [makeReason(b12Reason,
        'Methylcobalamin is the active neurological form — preferred over cyanocobalamin')],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 7,
      category: 'vitamin',
      separateFrom: [],
      notes: ['Methylcobalamin — take sublingually or on empty stomach for best absorption'],
    }), LAYER);
  }

  // Omega-3: swap to algae if no fish AND dairy is low/absent
  if (quiz.fishIntake === 'none' &&
      (quiz.dairyIntake === 'none' || quiz.dairyIntake === 'low')) {
    recs = swapOmega3ToAlgae(recs,
      'Vegetarian diet with low/no dairy and no fish — algae-based DHA is the appropriate plant-based source');
  }

  // Zinc: moderate phytate presence — increase by ~4 mg
  const existingZinc = findExistingRec(recs, 'zinc-picolinate');
  if (existingZinc) {
    const newDose = Math.min(existingZinc.dose + 4, 25);
    recs = modifyDose(recs, 'zinc-picolinate', newDose, LAYER,
      'Vegetarian diet — moderate phytate levels reduce zinc absorption; small dose increase to compensate');
    recs = addReason(recs, 'zinc-picolinate', LAYER,
      'Vegetarian diet — phytates in grains and legumes moderately reduce zinc bioavailability');
  }

  return recs;
}

// ─── PESCATARIAN ──────────────────────────────────────────────────────────────

function applyPescatarianModifications(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (quiz.fishIntake === 'moderate' || quiz.fishIntake === 'high') {
    recs = addReason(recs, 'omega-3-fish-oil', LAYER,
      'Pescatarian diet with regular fish intake — dietary omega-3 may be adequate');
    recs = appendNote(recs, 'omega-3-fish-oil',
      'Consider reducing or skipping omega-3 supplement if eating fatty fish (salmon, mackerel, sardines) 2+ times/week');
    // Reduce to maintenance dose given dietary EPA/DHA contribution
    const existing = findExistingRec(recs, 'omega-3-fish-oil');
    if (existing && existing.dose > 500) {
      recs = modifyDose(recs, 'omega-3-fish-oil', 500, LAYER,
        'Pescatarian with moderate/high fish intake — reduced to maintenance dose given dietary EPA/DHA');
    }
  } else {
    recs = addReason(recs, 'omega-3-fish-oil', LAYER,
      'Pescatarian diet with low fish intake — supplement bridges the dietary EPA/DHA gap');
  }

  // B12: only add under 50 if fish intake is genuinely low/absent
  if (quiz.age < 50 && (quiz.fishIntake === 'low' || quiz.fishIntake === 'none')) {
    if (!findExistingRec(recs, 'vitamin-b12')) {
      recs = addOrModify(recs, makeRec({
        id: 'vitamin-b12',
        supplementName: 'Vitamin B12',
        form: 'methylcobalamin',
        dose: 500,
        doseUnit: 'mcg',
        frequency: 'daily',
        timing: ['morning-empty'],
        withFood: false,
        evidenceRating: 'Strong',
        reasons: [makeReason(
          'Pescatarian diet with low/no fish intake — dietary B12 from fish is absent; dairy alone may be insufficient')],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 6,
        category: 'vitamin',
        separateFrom: [],
        notes: ['Methylcobalamin — take sublingually or on empty stomach for best absorption'],
      }), LAYER);
    }
  }

  return recs;
}

// ─── KETO / LOW-CARB ──────────────────────────────────────────────────────────

function applyKetoModifications(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  // Magnesium: increase to 400 mg minimum
  const existingMg = findExistingRec(recs, 'magnesium-glycinate');
  if (existingMg) {
    if (existingMg.dose < 400) {
      recs = modifyDose(recs, 'magnesium-glycinate', 400, LAYER,
        'Ketogenic diet — rapid magnesium depletion through increased urinary excretion; 400 mg/day is the minimum effective dose');
      recs = addReason(recs, 'magnesium-glycinate', LAYER,
        'Ketogenic diet — magnesium depletion is common; dose increased to 400 mg/day');
    } else {
      recs = addReason(recs, 'magnesium-glycinate', LAYER,
        'Ketogenic diet — magnesium depletion is common; current dose is adequate');
    }
  }

  // Potassium citrate
  if (!findExistingRec(recs, 'potassium-citrate')) {
    recs = addOrModify(recs, makeRec({
      id: 'potassium-citrate',
      supplementName: 'Potassium Citrate',
      form: 'citrate',
      dose: 300,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Moderate',
      reasons: [makeReason(
        'Ketogenic diet — electrolyte depletion through increased renal excretion; 300 mg/day bridges the dietary gap',
        'Supplemental potassium — continue eating potassium-rich whole foods (avocado, leafy greens, nuts)',
      )],
      warnings: [
        'Do not exceed 3,500 mg/day total potassium from all sources',
        'Consult physician if on ACE inhibitors, ARBs, or potassium-sparing diuretics',
      ],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 6,
      category: 'mineral',
      separateFrom: [],
      notes: [
        'Supplemental potassium — continue eating potassium-rich foods (avocado, leafy greens, nuts)',
        'Increase dietary sodium to 3–5 g/day (broth, salt, electrolyte drinks) to maintain full electrolyte balance on keto',
      ],
    }), LAYER);
  }

  // Psyllium husk: if vegetable intake is low on keto
  if (quiz.vegetableIntake === 'low' && !findExistingRec(recs, 'psyllium-husk')) {
    recs = addOrModify(recs, makeRec({
      id: 'psyllium-husk',
      supplementName: 'Psyllium Husk',
      form: 'psyllium-husk',
      dose: 7,
      doseUnit: 'g',
      frequency: 'daily',
      timing: ['evening'],
      withFood: false,
      evidenceRating: 'Strong',
      reasons: [makeReason(
        'Ketogenic diet with low vegetable intake — dietary fibre is critically low; psyllium husk bridges the gut-health gap',
      )],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 5,
      category: 'fiber',
      separateFrom: [],
      notes: [
        'Take with a large glass of water (≥250 mL) — do not take dry',
        'Space 2+ hours from medications or other supplements; psyllium can reduce absorption',
      ],
    }), LAYER);
  }

  // Taurine: supports bile acid conjugation on a high-fat diet
  if (!findExistingRec(recs, 'taurine')) {
    recs = addOrModify(recs, makeRec({
      id: 'taurine',
      supplementName: 'Taurine',
      form: 'taurine',
      dose: 750,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Emerging',
      reasons: [makeReason(
        'Ketogenic diet — taurine supports bile acid conjugation, which is important for efficient fat digestion and absorption',
      )],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 4,
      category: 'amino-acid',
      separateFrom: [],
      notes: [],
    }), LAYER);
  }

  return recs;
}

// ─── PALEO ────────────────────────────────────────────────────────────────────

function applyPaleoModifications(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  // No dairy — ensure calcium is in the protocol
  const existingCalcium = findExistingRec(recs, 'calcium-citrate');
  if (!existingCalcium) {
    recs = addOrModify(recs, makeRec({
      id: 'calcium-citrate',
      supplementName: 'Calcium Citrate',
      form: 'citrate',
      dose: 400,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['evening'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [makeReason(
        'Paleo diet — excludes dairy; calcium intake from bone broth and leafy greens alone may be insufficient',
      )],
      warnings: ['Separate by ≥2 hours from iron or zinc supplements'],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 6,
      category: 'mineral',
      separateFrom: ['iron-bisglycinate', 'zinc-picolinate'],
      notes: ['Calcium citrate is well-absorbed without food or high stomach acid'],
    }), LAYER);
  } else {
    recs = addReason(recs, 'calcium-citrate', LAYER,
      'Paleo diet — no dairy; calcium supplementation supports adequate bone mineral density');
  }

  // No grains — flag absent B-vitamin contributions via general protocol note
  recs = appendNote(recs, 'magnesium-glycinate',
    'Paleo diet excludes grains — ensure adequate B-vitamin intake through eggs, organ meat, and leafy vegetables; consider a targeted B-complex if energy or mood is affected');

  return recs;
}

// ─── MEDITERRANEAN ────────────────────────────────────────────────────────────

function applyMediterraneanModifications(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  recs = appendNote(recs, 'vitamin-d3',
    'Mediterranean diet — associated with the strongest evidence for long-term cardiovascular, cognitive, and longevity outcomes');

  if (quiz.fishIntake === 'moderate' || quiz.fishIntake === 'high') {
    recs = addReason(recs, 'omega-3-fish-oil', LAYER,
      'Mediterranean diet with regular fish intake — dietary EPA/DHA may be adequate');
    recs = appendNote(recs, 'omega-3-fish-oil',
      'Consider reducing or skipping omega-3 supplement if eating fatty fish 3+ times/week');
    const existing = findExistingRec(recs, 'omega-3-fish-oil');
    if (existing && existing.dose > 500) {
      recs = modifyDose(recs, 'omega-3-fish-oil', 500, LAYER,
        'Mediterranean diet with high fish intake — reduced to maintenance dose given dietary EPA/DHA');
    }
  }

  return recs;
}

// ─── OMNIVORE ─────────────────────────────────────────────────────────────────

function applyOmnivoreModifications(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  // Fish intake
  if (quiz.fishIntake === 'none' || quiz.fishIntake === 'low') {
    recs = addReason(recs, 'omega-3-fish-oil', LAYER,
      'Low dietary fish intake — omega-3 supplement bridges the EPA/DHA gap');
  } else {
    recs = appendNote(recs, 'omega-3-fish-oil',
      'Consider reducing omega-3 supplement if eating fatty fish (salmon, mackerel, sardines) 3+ times/week');
  }

  // Dairy intake
  if (quiz.dairyIntake === 'none' || quiz.dairyIntake === 'low') {
    recs = appendNote(recs, 'vitamin-d3',
      'Low dairy intake — Vitamin D supplementation is especially important as fortified dairy is a primary dietary source');
    const existingCalcium = findExistingRec(recs, 'calcium-citrate');
    if (!existingCalcium) {
      recs = addOrModify(recs, makeRec({
        id: 'calcium-citrate',
        supplementName: 'Calcium Citrate',
        form: 'citrate',
        dose: 400,
        doseUnit: 'mg',
        frequency: 'daily',
        timing: ['evening'],
        withFood: true,
        evidenceRating: 'Strong',
        reasons: [makeReason(
          'Low dairy intake — calcium supplementation helps bridge the dietary gap',
        )],
        warnings: ['Separate by ≥2 hours from iron or zinc supplements'],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 5,
        category: 'mineral',
        separateFrom: ['iron-bisglycinate', 'zinc-picolinate'],
        notes: ['Calcium citrate is well-absorbed without dairy'],
      }), LAYER);
    } else {
      recs = addReason(recs, 'calcium-citrate', LAYER,
        'Low dairy intake — calcium supplementation supports adequate bone mineral density');
    }
  }

  // Vegetable intake
  if (quiz.vegetableIntake === 'low') {
    recs = appendNote(recs, 'vitamin-d3',
      'Increasing vegetable intake is strongly recommended for micronutrient coverage — consider a quality multivitamin if dietary change is difficult');
    if (!findExistingRec(recs, 'vitamin-c')) {
      recs = addOrModify(recs, makeRec({
        id: 'vitamin-c',
        supplementName: 'Vitamin C',
        form: 'ascorbic-acid',
        dose: 500,
        doseUnit: 'mg',
        frequency: 'daily',
        timing: ['morning-with-food'],
        withFood: true,
        evidenceRating: 'Strong',
        reasons: [makeReason(
          'Low vegetable intake — dietary Vitamin C is likely insufficient; supplementation closes the gap',
        )],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 5,
        category: 'vitamin',
        separateFrom: [],
        notes: ['Ascorbic acid — take with food to reduce GI discomfort at higher doses'],
      }), LAYER);
    }
  }

  return recs;
}

// ─── ALLERGY / INTOLERANCE MODIFICATIONS ──────────────────────────────────────

function applyAllergyModifications(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const allergies = quiz.allergies ?? [];

  if (allergies.includes('fish')) {
    recs = swapOmega3ToAlgae(recs,
      'Fish allergy — algae-based DHA replaces fish oil; same EPA/DHA, zero allergen risk');
    recs = addAllergyFlag(recs, 'omega-3-fish-oil', {
      allergen: 'fish',
      action: 'swap-form',
      note: 'Algae-based DHA replaces fish oil. Also avoid cod liver oil and krill oil.',
    });
  }

  if (allergies.includes('shellfish')) {
    // Glucosamine (Layer 4) must use vegan corn-fermentation form — note carried here
    recs = appendNote(recs, 'vitamin-d3',
      'Shellfish allergy — if glucosamine is later recommended, ensure vegan-sourced form (corn fermentation), NOT shellfish-derived');
  }

  if (allergies.includes('dairy')) {
    recs = addAllergyFlag(recs, 'calcium-citrate', {
      allergen: 'dairy',
      action: 'avoid-ingredient',
      note: 'Calcium citrate is dairy-free. Avoid any calcium supplement derived from milk, whey, or dairy powder.',
    });
    recs = appendNote(recs, 'vitamin-d3',
      'Dairy allergy — verify all supplements are dairy-free; avoid whey-based capsule fillers');
  }

  if (allergies.includes('soy')) {
    recs = addAllergyFlag(recs, 'vitamin-d3', {
      allergen: 'soy',
      action: 'avoid-ingredient',
      note: 'Soy allergy — ensure soy-free sourcing for Vitamin E (some brands use soy-based tocopherols), lecithin, and phosphatidylserine',
    });
  }

  if (allergies.includes('gluten')) {
    recs = appendNote(recs, 'vitamin-d3',
      'Gluten intolerance — verify all supplements are certified gluten-free; some capsule fillers and excipients may contain gluten');
  }

  if (allergies.includes('nuts')) {
    recs = appendNote(recs, 'vitamin-d3',
      'Tree nut allergy — verify all supplements are manufactured in nut-free facilities; some softgels use nut-derived carrier oils');
  }

  return recs;
}

// ─── LAYER 2 ENTRY POINT ──────────────────────────────────────────────────────

/**
 * Layer 2 — Dietary Analysis.
 *
 * Receives the Layer 1 recommendation array and modifies/extends it based on
 * the user's dietary pattern, food-intake frequencies, and known allergies.
 *
 * Processing order:
 *   1. Dietary-pattern-specific modifications (vegan/vegetarian/pescatarian/
 *      keto/paleo/mediterranean/omnivore)
 *   2. Allergy/intolerance modifications — applied regardless of dietary pattern
 *
 * Clinical logic per pattern:
 *   Vegan       — B12, algae omega-3, iron (alt-day), zinc (+50%), iodine,
 *                 calcium, +1,000 IU D3, lichen D3 note, K2 MK-7
 *   Vegetarian  — B12 (500 mcg), algae omega-3 if no fish/low dairy, zinc (+4 mg)
 *   Pescatarian — omega-3 dose reduced if high fish intake; B12 if low fish + age <50
 *   Keto        — magnesium ≥400 mg, potassium citrate, psyllium (if low veg), taurine
 *   Paleo       — calcium, B-vitamin awareness note
 *   Mediterranean — positive diet note, omega-3 reduction if high fish intake
 *   Omnivore    — omega-3 reason, calcium (if low dairy), vitamin C (if low veg)
 */
export const layer2Dietary = (
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] => {
  switch (quiz.dietaryPattern) {
    case 'vegan':
      recs = applyVeganModifications(quiz, recs);
      break;
    case 'vegetarian':
      recs = applyVegetarianModifications(quiz, recs);
      break;
    case 'pescatarian':
      recs = applyPescatarianModifications(quiz, recs);
      break;
    case 'keto':
      recs = applyKetoModifications(quiz, recs);
      break;
    case 'paleo':
      recs = applyPaleoModifications(quiz, recs);
      break;
    case 'mediterranean':
      recs = applyMediterraneanModifications(quiz, recs);
      break;
    case 'omnivore':
    default:
      recs = applyOmnivoreModifications(quiz, recs);
      break;
  }

  recs = applyAllergyModifications(quiz, recs);

  return recs;
};
