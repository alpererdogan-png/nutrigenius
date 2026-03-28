// ─────────────────────────────────────────────────────────────────────────────
// NutriGenius — Synergy Enforcement
//
// Runs AFTER Layer 7 (goals) but BEFORE the safety filter.
// Ensures synergistic nutrient pairs are always present together.
// Uses addOrModify exclusively — never creates duplicate IDs.
//
// Rules:
//   1. Vitamin D ≥ 2,000 IU  → ensure Vitamin K2 (MK-7) 100–200 mcg
//   2. Iron present           → ensure Vitamin C ≥ 200 mg at same timing
//   3. Zinc ≥ 25 mg           → ensure Copper 2–3 mg (separate timing)
//   4. Curcumin present       → add absorption note (piperine or liposomal)
//   5. Calcium present        → ensure Magnesium at ~½ calcium dose
//   6. B12 present            → ensure Folate (5-MTHF) 400 mcg
//   7. Collagen + athlete     → pre-exercise timing + Vitamin C 500 mg
// ─────────────────────────────────────────────────────────────────────────────

import {
  Recommendation,
  QuizData,
  LayerName,
  LayerSource,
  RecommendationReason,
  CYCLE_DAILY,
} from '../types';

import {
  findExistingRec,
  addOrModify,
  addReason,
  modifyTiming,
} from '../layers/layer1-demographic';

// ─── Constants ────────────────────────────────────────────────────────────────

const LAYER: LayerName = 'synergy';

// Curcumin forms that already have enhanced bioavailability (no piperine needed)
const ENHANCED_CURCUMIN_FORMS = [
  'liposomal',
  'phytosome',
  'meriva',
  'bcm-95',
  'phospholipid-complex',
  'theracurmin',
  'longvida',
];

// ─── Local helpers ────────────────────────────────────────────────────────────

function makeSource(
  action: LayerSource['action'],
  extra?: Partial<LayerSource>,
): LayerSource {
  return { layer: LAYER, action, ...extra };
}

function makeReason(reason: string, detail?: string): RecommendationReason {
  return { layer: LAYER, reason, ...(detail ? { detail } : {}) };
}

function makeRec(
  partial: Omit<Recommendation, 'sources'> & { sources?: LayerSource[] },
): Recommendation {
  return { sources: [makeSource('added')], ...partial };
}

/** Append a note string to an existing recommendation (no-op if already present). */
function addNote(
  recs: Recommendation[],
  supplementId: string,
  note: string,
): Recommendation[] {
  return recs.map(r => {
    if (r.id !== supplementId) return r;
    if (r.notes.includes(note)) return r;
    const src: LayerSource = { layer: LAYER, action: 'added-reason', newValue: note };
    return { ...r, notes: [...r.notes, note], sources: [...r.sources, src] };
  });
}

/** Raise an existing rec's dose if it is below the minimum. */
function ensureMinDose(
  recs: Recommendation[],
  supplementId: string,
  minDose: number,
): Recommendation[] {
  return recs.map(r => {
    if (r.id !== supplementId || r.dose >= minDose) return r;
    const src: LayerSource = {
      layer: LAYER,
      action: 'modified-dose',
      previousValue: `${r.dose} ${r.doseUnit}`,
      newValue: `${minDose} ${r.doseUnit}`,
    };
    return { ...r, dose: minDose, sources: [...r.sources, src] };
  });
}

const put = (recs: Recommendation[], rec: Recommendation) =>
  addOrModify(recs, rec, LAYER);

// ─── Rule 1: Vitamin D ≥ 2,000 IU → Vitamin K2 (MK-7) ───────────────────────

function applyVitDK2Synergy(recs: Recommendation[]): Recommendation[] {
  const vitD = findExistingRec(recs, 'vitamin-d3');
  if (!vitD || vitD.doseUnit !== 'IU' || vitD.dose < 2000) return recs;

  const k2Dose = vitD.dose >= 4000 ? 200 : 100;
  const reason =
    'K2 directs calcium to bones and away from arteries — essential when supplementing Vitamin D at 2,000+ IU';

  const existingK2 = findExistingRec(recs, 'vitamin-k2-mk7');
  if (existingK2) {
    let r = addReason(recs, 'vitamin-k2-mk7', LAYER, reason);
    r = ensureMinDose(r, 'vitamin-k2-mk7', k2Dose);
    return r;
  }

  return put(recs, makeRec({
    id: 'vitamin-k2-mk7',
    supplementName: 'Vitamin K2 (MK-7)',
    form: 'menaquinone-7',
    dose: k2Dose,
    doseUnit: 'mcg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Moderate',
    reasons: [makeReason(reason)],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 7,
    category: 'vitamin',
    separateFrom: [],
    notes: ['Fat-soluble — take with largest meal alongside Vitamin D'],
  }));
}

// ─── Rule 2: Iron present → Vitamin C ≥ 200 mg at same timing ────────────────

function applyIronVitaminCSynergy(recs: Recommendation[]): Recommendation[] {
  const iron = findExistingRec(recs, 'iron-bisglycinate');
  if (!iron) return recs;

  const ironTiming = iron.timing[0] ?? 'morning-empty';
  const reason = 'Vitamin C increases non-heme iron absorption by up to 6x';

  const existingC = findExistingRec(recs, 'vitamin-c');
  if (existingC) {
    let r = addReason(recs, 'vitamin-c', LAYER, reason);
    // Ensure at least 200 mg
    r = ensureMinDose(r, 'vitamin-c', 200);
    // If timing diverges, add a co-administration note
    if (!existingC.timing.includes(ironTiming)) {
      r = addNote(
        r,
        'vitamin-c',
        'Take your Vitamin C dose with your iron dose for enhanced absorption',
      );
    }
    return r;
  }

  return put(recs, makeRec({
    id: 'vitamin-c',
    supplementName: 'Vitamin C',
    form: 'ascorbic-acid',
    dose: 200,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: [ironTiming],
    withFood: iron.withFood,
    evidenceRating: 'Strong',
    reasons: [makeReason(reason)],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 6,
    category: 'vitamin',
    separateFrom: [],
    notes: ['Take at the same time as your iron supplement'],
  }));
}

// ─── Rule 3: Zinc ≥ 25 mg → Copper 2–3 mg (separate timing) ─────────────────

function applyZincCopperSynergy(recs: Recommendation[]): Recommendation[] {
  const zinc = findExistingRec(recs, 'zinc-picolinate');
  if (!zinc || zinc.dose < 25) return recs;

  const copperDose = zinc.dose >= 40 ? 3 : 2;
  const reason =
    'Zinc >25 mg/day depletes copper over time — supplemental copper prevents deficiency';

  const existingCopper = findExistingRec(recs, 'copper-glycinate');
  if (existingCopper) {
    let r = addReason(recs, 'copper-glycinate', LAYER, reason);
    r = ensureMinDose(r, 'copper-glycinate', copperDose);
    return r;
  }

  // Place copper at a different time-slot than zinc
  const zincSlot = zinc.timing[0] ?? 'evening';
  const copperTiming: Recommendation['timing'][number] =
    zincSlot === 'morning-with-food' || zincSlot === 'morning-empty'
      ? 'midday'
      : 'morning-with-food';

  return put(recs, makeRec({
    id: 'copper-glycinate',
    supplementName: 'Copper (Glycinate)',
    form: 'glycinate',
    dose: copperDose,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: [copperTiming],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason(reason)],
    warnings: ['Separate from zinc by at least 2 hours'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 7,
    category: 'mineral',
    separateFrom: ['zinc-picolinate'],
    notes: ['Separate from zinc by 2+ hours to prevent absorption competition'],
  }));
}

// ─── Rule 4: Curcumin present → absorption note ───────────────────────────────

function applyCurcuminAbsorptionNote(recs: Recommendation[]): Recommendation[] {
  const curcumin = findExistingRec(recs, 'curcumin');
  if (!curcumin) return recs;

  const formL = curcumin.form.toLowerCase();
  const isEnhanced = ENHANCED_CURCUMIN_FORMS.some(f => formL.includes(f));

  const note = isEnhanced
    ? 'This form has enhanced absorption — no black pepper needed'
    : 'Take with black pepper (piperine) or fatty food — standard curcumin has very low absorption without piperine (2,000% increase)';

  return addNote(recs, 'curcumin', note);
}

// ─── Rule 5: Calcium present → Magnesium at ~½ dose ─────────────────────────

function applyCalciumMagnesiumSynergy(recs: Recommendation[]): Recommendation[] {
  const calcium = findExistingRec(recs, 'calcium-citrate');
  if (!calcium) return recs;

  const reason =
    'Calcium and magnesium work synergistically for bone mineralisation and muscle function';

  const existingMg = findExistingRec(recs, 'magnesium-glycinate');
  if (existingMg) {
    return addReason(recs, 'magnesium-glycinate', LAYER, reason);
  }

  const mgDose = Math.max(150, Math.round(calcium.dose / 2));

  return put(recs, makeRec({
    id: 'magnesium-glycinate',
    supplementName: 'Magnesium Glycinate',
    form: 'glycinate',
    dose: mgDose,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['evening'],
    withFood: false,
    evidenceRating: 'Moderate',
    reasons: [makeReason(reason)],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 6,
    category: 'mineral',
    separateFrom: [],
    notes: ['Ideal Ca:Mg ratio is approximately 2:1'],
  }));
}

// ─── Rule 6: B12 present → Folate (5-MTHF) 400 mcg ──────────────────────────

function applyB12FolateSynergy(recs: Recommendation[]): Recommendation[] {
  const b12 = findExistingRec(recs, 'vitamin-b12');
  if (!b12) return recs;

  const reason = 'B12 and folate work together in the methylation cycle';

  const existingFolate = findExistingRec(recs, 'folate-5mthf');
  if (existingFolate) {
    return addReason(recs, 'folate-5mthf', LAYER, reason);
  }

  return put(recs, makeRec({
    id: 'folate-5mthf',
    supplementName: 'Folate (5-MTHF)',
    form: '5-methyltetrahydrofolate',
    dose: 400,
    doseUnit: 'mcg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason(reason)],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 6,
    category: 'vitamin',
    separateFrom: [],
    notes: [],
  }));
}

// ─── Rule 7: Collagen + very-active/athlete → pre-exercise timing + Vit C ─────

function applyCollagenAthleteSynergy(
  recs: Recommendation[],
  quiz: QuizData,
): Recommendation[] {
  const isAthlete =
    quiz.activityLevel === 'very-active' || quiz.activityLevel === 'athlete';
  const collagen =
    findExistingRec(recs, 'collagen-peptides') ??
    findExistingRec(recs, 'collagen-type-ii');
  if (!collagen || !isAthlete) return recs;

  const collagenId = collagen.id;
  const synergyNote =
    'Collagen + Vitamin C taken before exercise increases tendon and ligament collagen synthesis (Baar et al.)';
  const timingNote = 'Take 30–60 minutes before exercise';

  // Shift collagen to pre-exercise slot (morning-empty)
  let r = modifyTiming(
    recs,
    collagenId,
    ['morning-empty'],
    LAYER,
    'Pre-exercise timing maximises collagen synthesis',
  );
  r = addNote(r, collagenId, synergyNote);
  r = addNote(r, collagenId, timingNote);

  const vitCReason =
    'Vitamin C is required for collagen cross-linking — take alongside collagen before exercise';

  const existingC = findExistingRec(r, 'vitamin-c');
  if (existingC) {
    r = addReason(r, 'vitamin-c', LAYER, vitCReason);
    r = ensureMinDose(r, 'vitamin-c', 500);
    if (!existingC.timing.includes('morning-empty')) {
      r = addNote(
        r,
        'vitamin-c',
        'Take your 500 mg Vitamin C dose at the same time as your collagen (30–60 min before exercise)',
      );
    }
    return r;
  }

  return put(r, makeRec({
    id: 'vitamin-c',
    supplementName: 'Vitamin C',
    form: 'ascorbic-acid',
    dose: 500,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-empty'],
    withFood: false,
    evidenceRating: 'Strong',
    reasons: [makeReason(vitCReason)],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 6,
    category: 'vitamin',
    separateFrom: [],
    notes: ['Take 30–60 minutes before exercise alongside collagen'],
  }));
}

// ─── Main entry point ─────────────────────────────────────────────────────────

/**
 * Applies all synergy-pair rules to the recommendation array.
 * Call after Layer 7 (goals) and before the safety filter.
 */
export function applySynergyPairs(
  recs: Recommendation[],
  quiz: QuizData,
): Recommendation[] {
  let r = recs;
  r = applyVitDK2Synergy(r);
  r = applyIronVitaminCSynergy(r);
  r = applyZincCopperSynergy(r);
  r = applyCurcuminAbsorptionNote(r);
  r = applyCalciumMagnesiumSynergy(r);
  r = applyB12FolateSynergy(r);
  r = applyCollagenAthleteSynergy(r, quiz);
  return r;
}
