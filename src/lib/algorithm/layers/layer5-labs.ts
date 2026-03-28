// ─────────────────────────────────────────────────────────────────────────────
// NutriGenius — Layer 5: Lab Values
//
// Precision-doses based on actual lab results. This is the ONLY layer that
// can REMOVE a previously added supplement.
//
// Design rules:
//   • Only runs if quiz.labValues is present and has at least one entry.
//   • Each biomarker handler is idempotent: safe to run even if the relevant
//     supplement was not added by earlier layers.
//   • setDose() overrides the dose unconditionally (unlike modifyDose which
//     comes from layer1 and records an audit trail entry — we use modifyDose
//     for that purpose here, since it sets directly without a max guard).
//   • addNote() / addWarning() append without duplicating.
//   • setPriority() lifts/lowers priority based on lab severity.
//   • Stale dates (>12 months) trigger a "consider retesting" note on the
//     affected supplement(s) for that biomarker.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Recommendation,
  QuizData,
  LayerName,
  LayerSource,
  RecommendationReason,
  CYCLE_DAILY,
  CYCLE_ALTERNATE_DAY,
} from '../types';

import {
  findExistingRec,
  addOrModify,
  modifyDose,
  modifyForm,
  addReason,
  removeRec,
} from './layer1-demographic';

// ─── LAYER CONSTANT ───────────────────────────────────────────────────────────

const LAYER: LayerName = 'labs';

// ─── LOCAL HELPERS ────────────────────────────────────────────────────────────

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

/** Alias: add a supplement (or merge with existing via addOrModify). */
const put = (recs: Recommendation[], rec: Recommendation) =>
  addOrModify(recs, rec, LAYER);

/** Append a note string without duplicating. */
function addNote(
  recs: Recommendation[],
  id: string,
  note: string,
): Recommendation[] {
  return recs.map(r =>
    r.id === id && !r.notes.includes(note)
      ? { ...r, notes: [...r.notes, note] }
      : r,
  );
}

/** Append a warning string without duplicating. */
function addWarning(
  recs: Recommendation[],
  id: string,
  warning: string,
): Recommendation[] {
  return recs.map(r =>
    r.id === id && !r.warnings.includes(warning)
      ? { ...r, warnings: [...r.warnings, warning] }
      : r,
  );
}

/** Lift or set priority, using Math.max so it never decreases. */
function liftPriority(
  recs: Recommendation[],
  id: string,
  priority: number,
): Recommendation[] {
  return recs.map(r =>
    r.id === id ? { ...r, priority: Math.max(r.priority, priority) } : r,
  );
}

/** Force-set priority (can decrease). */
function setPriority(
  recs: Recommendation[],
  id: string,
  priority: number,
): Recommendation[] {
  return recs.map(r => (r.id === id ? { ...r, priority } : r));
}

/**
 * Returns true if the lab date is more than 12 months before today.
 * Returns false if dateStr is undefined (no date provided).
 */
function isStale(dateStr?: string): boolean {
  if (!dateStr) return false;
  const labDate = new Date(dateStr);
  if (isNaN(labDate.getTime())) return false;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  return labDate < cutoff;
}

const STALE_NOTE =
  'These lab results are over a year old — consider retesting for optimal dosing';

// ─── VITAMIN D ────────────────────────────────────────────────────────────────

function handleVitaminD(
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] {
  const lab = quiz.labValues?.vitaminD;
  if (!lab) return recs;

  const { value, date } = lab;
  const SUPP_ID = 'vitamin-d3';
  let r = recs;

  // ── Stale date note ──────────────────────────────────────────────────────
  if (isStale(date)) {
    if (findExistingRec(r, SUPP_ID)) r = addNote(r, SUPP_ID, STALE_NOTE);
  }

  // ── < 10 ng/mL — severely deficient ─────────────────────────────────────
  if (value < 10) {
    const dose = 10000;
    if (findExistingRec(r, SUPP_ID)) {
      r = modifyDose(r, SUPP_ID, dose, LAYER, `Lab Vitamin D ${value} ng/mL — severely deficient; high-dose repletion required`);
      r = liftPriority(r, SUPP_ID, 10);
      r = addWarning(r, SUPP_ID, 'Severe Vitamin D deficiency detected. Consider physician supervision for high-dose repletion.');
      r = addNote(r, SUPP_ID, 'Retest in 8–12 weeks. Target 50–80 ng/mL.');
    } else {
      r = put(r, makeRec({
        id: SUPP_ID, supplementName: 'Vitamin D3', form: 'cholecalciferol',
        dose, doseUnit: 'IU', frequency: 'daily',
        timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
        reasons: [makeReason(`Lab Vitamin D ${value} ng/mL — severe deficiency; 10,000 IU repletion required for 8–12 weeks`)],
        warnings: ['Severe Vitamin D deficiency detected. Consider physician supervision for high-dose repletion.'],
        contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 10,
        category: 'vitamin', separateFrom: [], notes: ['Retest in 8–12 weeks. Target 50–80 ng/mL.'],
      }));
    }
    return r;
  }

  // ── 10–20 ng/mL — deficient ──────────────────────────────────────────────
  if (value < 20) {
    const dose = 5000;
    if (findExistingRec(r, SUPP_ID)) {
      r = modifyDose(r, SUPP_ID, dose, LAYER, `Lab Vitamin D ${value} ng/mL — deficient; 5,000 IU repletion`);
      r = liftPriority(r, SUPP_ID, 9);
      r = addNote(r, SUPP_ID, 'Retest in 3 months. Target 50–80 ng/mL.');
    } else {
      r = put(r, makeRec({
        id: SUPP_ID, supplementName: 'Vitamin D3', form: 'cholecalciferol',
        dose, doseUnit: 'IU', frequency: 'daily',
        timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
        reasons: [makeReason(`Lab Vitamin D ${value} ng/mL — deficient; 5,000 IU for 8–12 weeks then retest`)],
        warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 9,
        category: 'vitamin', separateFrom: [], notes: ['Retest in 3 months. Target 50–80 ng/mL.'],
      }));
    }
    return r;
  }

  // ── 20–30 ng/mL — insufficient ──────────────────────────────────────────
  if (value < 30) {
    const dose = 3000;
    if (findExistingRec(r, SUPP_ID)) {
      r = modifyDose(r, SUPP_ID, dose, LAYER, `Lab Vitamin D ${value} ng/mL — insufficient; 3,000 IU to restore adequacy`);
      r = liftPriority(r, SUPP_ID, 8);
    } else {
      r = put(r, makeRec({
        id: SUPP_ID, supplementName: 'Vitamin D3', form: 'cholecalciferol',
        dose, doseUnit: 'IU', frequency: 'daily',
        timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
        reasons: [makeReason(`Lab Vitamin D ${value} ng/mL — insufficient; 3,000 IU to restore adequacy`)],
        warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
        category: 'vitamin', separateFrom: [], notes: [],
      }));
    }
    return r;
  }

  // ── 30–50 ng/mL — adequate ──────────────────────────────────────────────
  if (value < 50) {
    const dose = 2000;
    if (findExistingRec(r, SUPP_ID)) {
      r = modifyDose(r, SUPP_ID, dose, LAYER, `Lab Vitamin D ${value} ng/mL — adequate; 2,000 IU maintenance`);
    }
    // No addition if not already present — level is adequate
    return r;
  }

  // ── 50–80 ng/mL — optimal ───────────────────────────────────────────────
  if (value < 80) {
    const dose = 1000;
    if (findExistingRec(r, SUPP_ID)) {
      r = modifyDose(r, SUPP_ID, dose, LAYER, `Lab Vitamin D ${value} ng/mL — optimal; reduce to 1,000 IU maintenance`);
      r = addNote(r, SUPP_ID, 'Your Vitamin D level is optimal. 1,000 IU maintains this range.');
    }
    return r;
  }

  // ── 80–150 ng/mL — high ─────────────────────────────────────────────────
  if (value <= 150) {
    if (findExistingRec(r, SUPP_ID)) {
      r = modifyDose(r, SUPP_ID, 1000, LAYER, `Lab Vitamin D ${value} ng/mL — high; reduce to 1,000 IU and retest`);
      r = addWarning(r, SUPP_ID, `Vitamin D level is high (${value} ng/mL). Reduce supplementation and retest in 3 months.`);
    }
    return r;
  }

  // ── >150 ng/mL — potentially toxic ─────────────────────────────────────
  if (findExistingRec(r, SUPP_ID)) {
    r = removeRec(
      r, SUPP_ID, LAYER,
      `Lab Vitamin D ${value} ng/mL — potentially toxic level; stop supplementation and consult physician immediately`,
    );
  }
  return r;
}

// ─── VITAMIN B12 ──────────────────────────────────────────────────────────────

function handleVitaminB12(
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] {
  const lab = quiz.labValues?.vitaminB12;
  if (!lab) return recs;

  const { value, date } = lab;
  const SUPP_ID = 'vitamin-b12';
  const isVegan = quiz.dietaryPattern === 'vegan';
  let r = recs;

  if (isStale(date) && findExistingRec(r, SUPP_ID)) {
    r = addNote(r, SUPP_ID, STALE_NOTE);
  }

  // ── <200 pg/mL — deficient ───────────────────────────────────────────────
  if (value < 200) {
    const dose = 2000;
    if (findExistingRec(r, SUPP_ID)) {
      r = modifyDose(r, SUPP_ID, dose, LAYER, `Lab B12 ${value} pg/mL — deficient; 2,000 mcg methylcobalamin repletion`);
      r = modifyForm(r, SUPP_ID, 'methylcobalamin', LAYER, 'B12 deficiency — methylcobalamin preferred for repletion');
      r = liftPriority(r, SUPP_ID, 9);
      r = addNote(r, SUPP_ID, 'Retest in 3 months. If no improvement, sublingual or injection may be needed.');
    } else {
      r = put(r, makeRec({
        id: SUPP_ID, supplementName: 'Vitamin B12 (Methylcobalamin)', form: 'methylcobalamin',
        dose, doseUnit: 'mcg', frequency: 'daily',
        timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
        reasons: [makeReason(`Lab B12 ${value} pg/mL — deficient; 2,000 mcg methylcobalamin for repletion`)],
        warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 9,
        category: 'vitamin', separateFrom: [],
        notes: ['Retest in 3 months. If no improvement, sublingual or injection may be needed.'],
      }));
    }
    return r;
  }

  // ── 200–400 pg/mL — low-normal ──────────────────────────────────────────
  if (value < 400) {
    const dose = 1000;
    if (findExistingRec(r, SUPP_ID)) {
      r = modifyDose(r, SUPP_ID, dose, LAYER, `Lab B12 ${value} pg/mL — low-normal; 1,000 mcg maintenance`);
      r = modifyForm(r, SUPP_ID, 'methylcobalamin', LAYER, 'B12 low-normal — methylcobalamin preferred');
      r = liftPriority(r, SUPP_ID, 8);
    } else {
      r = put(r, makeRec({
        id: SUPP_ID, supplementName: 'Vitamin B12 (Methylcobalamin)', form: 'methylcobalamin',
        dose, doseUnit: 'mcg', frequency: 'daily',
        timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
        reasons: [makeReason(`Lab B12 ${value} pg/mL — low-normal range; 1,000 mcg to optimise status`)],
        warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
        category: 'vitamin', separateFrom: [], notes: [],
      }));
    }
    return r;
  }

  // ── 400–800 pg/mL — adequate ────────────────────────────────────────────
  if (value < 800) {
    if (findExistingRec(r, SUPP_ID)) {
      r = modifyDose(r, SUPP_ID, 250, LAYER, `Lab B12 ${value} pg/mL — adequate; reduce to 250 mcg maintenance`);
    }
    return r;
  }

  // ── >800 pg/mL — sufficient ─────────────────────────────────────────────
  if (findExistingRec(r, SUPP_ID)) {
    if (isVegan) {
      // Vegans must maintain B12 regardless of serum level — dietary source absent
      r = addNote(r, SUPP_ID, `B12 level is adequate (${value} pg/mL). Vegans should continue baseline supplementation as dietary source is absent.`);
    } else {
      r = removeRec(
        r, SUPP_ID, LAYER,
        `Lab B12 ${value} pg/mL — level is adequate; supplementation not required`,
      );
    }
  }
  return r;
}

// ─── FERRITIN ─────────────────────────────────────────────────────────────────

function handleFerritin(
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] {
  const lab = quiz.labValues?.ferritin;
  if (!lab) return recs;

  const { value, date } = lab;
  const IRON_ID = 'iron-bisglycinate';
  const VITC_ID = 'vitamin-c';
  let r = recs;

  if (isStale(date) && findExistingRec(r, IRON_ID)) {
    r = addNote(r, IRON_ID, STALE_NOTE);
  }

  // ── <15 ng/mL — iron-depleted ───────────────────────────────────────────
  if (value < 15) {
    if (!findExistingRec(r, IRON_ID)) {
      r = put(r, makeRec({
        id: IRON_ID, supplementName: 'Iron (Bisglycinate)', form: 'bisglycinate',
        dose: 65, doseUnit: 'mg', frequency: 'daily',
        timing: ['morning-empty'], withFood: false, evidenceRating: 'Strong',
        reasons: [makeReason(`Lab ferritin ${value} ng/mL — iron-depleted; 65 mg elemental iron every other day`)],
        warnings: [
          'Iron-depleted. Consult doctor about iron deficiency anemia.',
          'Do not supplement iron if thalassemia or hemochromatosis present.',
        ],
        contraindications: ['thalassemia', 'hemochromatosis'],
        cyclingPattern: CYCLE_ALTERNATE_DAY, priority: 9,
        category: 'mineral', separateFrom: ['zinc-picolinate', 'calcium-citrate'],
        notes: ['Take with vitamin C for absorption. Alternate-day dosing improves absorption via hepcidin cycling.'],
      }));
    } else {
      r = modifyDose(r, IRON_ID, 65, LAYER, `Lab ferritin ${value} ng/mL — iron-depleted; increase to 65 mg elemental iron`);
      r = liftPriority(r, IRON_ID, 9);
      r = addWarning(r, IRON_ID, 'Iron-depleted. Consult doctor about iron deficiency anemia.');
    }
    // Ensure vitamin C for absorption
    if (!findExistingRec(r, VITC_ID)) {
      r = put(r, makeRec({
        id: VITC_ID, supplementName: 'Vitamin C', form: 'ascorbic-acid',
        dose: 200, doseUnit: 'mg', frequency: 'daily',
        timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
        reasons: [makeReason(`Ferritin ${value} ng/mL — vitamin C co-administered with iron to enhance absorption`)],
        warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
        category: 'vitamin', separateFrom: [], notes: ['Take simultaneously with iron supplement'],
      }));
    } else {
      r = addReason(r, VITC_ID, LAYER, 'Take simultaneously with iron supplement to enhance non-haem iron absorption');
    }
    return r;
  }

  // ── 15–30 ng/mL — low ───────────────────────────────────────────────────
  if (value < 30) {
    if (!findExistingRec(r, IRON_ID)) {
      r = put(r, makeRec({
        id: IRON_ID, supplementName: 'Iron (Bisglycinate)', form: 'bisglycinate',
        dose: 18, doseUnit: 'mg', frequency: 'daily',
        timing: ['morning-empty'], withFood: false, evidenceRating: 'Strong',
        reasons: [makeReason(`Lab ferritin ${value} ng/mL — low iron stores; 18 mg/day supplementation recommended`)],
        warnings: ['Low iron stores — supplementation recommended. Do not use if thalassemia or hemochromatosis present.'],
        contraindications: ['thalassemia', 'hemochromatosis'],
        cyclingPattern: CYCLE_DAILY, priority: 8,
        category: 'mineral', separateFrom: ['zinc-picolinate', 'calcium-citrate'],
        notes: ['Take with vitamin C for absorption'],
      }));
    } else {
      r = liftPriority(r, IRON_ID, 8);
      r = addNote(r, IRON_ID, `Low ferritin (${value} ng/mL) — continue supplementation and retest in 3 months`);
    }
    if (!findExistingRec(r, VITC_ID)) {
      r = put(r, makeRec({
        id: VITC_ID, supplementName: 'Vitamin C', form: 'ascorbic-acid',
        dose: 200, doseUnit: 'mg', frequency: 'daily',
        timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
        reasons: [makeReason('Low ferritin — vitamin C co-administered with iron to enhance absorption')],
        warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 6,
        category: 'vitamin', separateFrom: [], notes: ['Take simultaneously with iron supplement'],
      }));
    }
    return r;
  }

  // ── 30–100 ng/mL — normal ───────────────────────────────────────────────
  if (value <= 100) {
    if (findExistingRec(r, IRON_ID)) {
      // Only remove if not condition-specific (heavy bleeding, RLS, etc.)
      const conditionIron = [
        'heavy-menstrual-bleeding', 'menorrhagia', 'heavy-periods',
        'rls', 'restless-legs', 'uterine-fibroids', 'anemia', 'anaemia',
        'iron-deficiency-anemia', 'iron-deficiency',
      ].some(c => quiz.healthConditions.map(x => x.toLowerCase()).includes(c));

      if (!conditionIron) {
        r = removeRec(
          r, IRON_ID, LAYER,
          `Lab ferritin ${value} ng/mL — iron stores are adequate; supplementation not required`,
        );
      } else {
        r = addNote(r, IRON_ID, `Ferritin ${value} ng/mL — iron stores are adequate, but maintained due to condition-specific need`);
      }
    }
    return r;
  }

  // ── >100 ng/mL — elevated ───────────────────────────────────────────────
  if (value <= 300) {
    if (findExistingRec(r, IRON_ID)) {
      r = removeRec(
        r, IRON_ID, LAYER,
        `Lab ferritin ${value} ng/mL — elevated; iron supplementation contraindicated`,
      );
    }
    return r;
  }

  // ── >300 ng/mL — very high / hemochromatosis risk ────────────────────────
  if (findExistingRec(r, IRON_ID)) {
    r = removeRec(
      r, IRON_ID, LAYER,
      `Lab ferritin ${value} ng/mL — very high; possible hemochromatosis or inflammation. Do NOT supplement iron.`,
    );
  }
  return r;
}

// ─── TSH ──────────────────────────────────────────────────────────────────────

function handleTSH(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const lab = quiz.labValues?.tsh;
  if (!lab) return recs;

  const { value, date } = lab;
  const SEL_ID = 'selenium';
  const IODINE_IDS = ['iodine', 'potassium-iodide', 'iodine-supplement', 'kelp'];
  let r = recs;

  if (isStale(date)) {
    if (findExistingRec(r, SEL_ID)) r = addNote(r, SEL_ID, STALE_NOTE);
  }

  // ── <0.4 mIU/L — suppressed / hyperthyroid ──────────────────────────────
  if (value < 0.4) {
    for (const id of IODINE_IDS) {
      if (findExistingRec(r, id)) {
        r = removeRec(
          r, id, LAYER,
          `Lab TSH ${value} mIU/L — low TSH may indicate hyperthyroidism; iodine supplementation contraindicated`,
        );
      }
    }
    // Add warning note to existing thyroid-related supplements
    if (findExistingRec(r, SEL_ID)) {
      r = addWarning(
        r, SEL_ID,
        `Low TSH (${value} mIU/L) may indicate hyperthyroidism. Consult endocrinologist before continuing thyroid supplements.`,
      );
    }
    return r;
  }

  // ── 0.4–4.0 mIU/L — normal ──────────────────────────────────────────────
  if (value <= 4.0) {
    return r; // No adjustments needed
  }

  // ── 4.0–10 mIU/L — subclinical hypothyroid ──────────────────────────────
  if (value <= 10) {
    if (!findExistingRec(r, SEL_ID)) {
      r = put(r, makeRec({
        id: SEL_ID, supplementName: 'Selenium (L-Selenomethionine)', form: 'l-selenomethionine',
        dose: 200, doseUnit: 'mcg', frequency: 'daily',
        timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
        reasons: [makeReason(`Lab TSH ${value} mIU/L — subclinical hypothyroidism; selenium supports deiodinase activity and reduces thyroid antibodies`)],
        warnings: [
          `Elevated TSH (${value} mIU/L) suggests subclinical hypothyroidism. Discuss with doctor.`,
          'Do not exceed 400 mcg/day — selenosis risk.',
        ],
        contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
        category: 'mineral', separateFrom: [], notes: [],
      }));
    } else {
      r = liftPriority(r, SEL_ID, 8);
      r = addWarning(
        r, SEL_ID,
        `Elevated TSH (${value} mIU/L) suggests subclinical hypothyroidism. Discuss with doctor.`,
      );
    }
    // Ensure vitamin D (thyroid autoimmunity connection)
    const vitD = findExistingRec(r, 'vitamin-d3');
    if (vitD && vitD.dose < 2000) {
      r = modifyDose(r, 'vitamin-d3', 2000, LAYER, `TSH ${value} mIU/L — adequate vitamin D important for thyroid immune regulation`);
    }
    return r;
  }

  // ── >10 mIU/L — overt hypothyroid ──────────────────────────────────────
  if (!findExistingRec(r, SEL_ID)) {
    r = put(r, makeRec({
      id: SEL_ID, supplementName: 'Selenium (L-Selenomethionine)', form: 'l-selenomethionine',
      dose: 200, doseUnit: 'mcg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason(`Lab TSH ${value} mIU/L — significantly elevated TSH; selenium supports thyroid function`)],
      warnings: [
        `Significantly elevated TSH (${value} mIU/L) — likely requires thyroid hormone treatment. See endocrinologist.`,
        'Do not exceed 400 mcg/day — selenosis risk.',
      ],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 9,
      category: 'mineral', separateFrom: [], notes: [],
    }));
  } else {
    r = liftPriority(r, SEL_ID, 9);
    r = addWarning(
      r, SEL_ID,
      `Significantly elevated TSH (${value} mIU/L) — likely requires thyroid hormone treatment. See endocrinologist.`,
    );
  }
  return r;
}

// ─── HbA1c ────────────────────────────────────────────────────────────────────

function handleHbA1c(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const lab = quiz.labValues?.hba1c;
  if (!lab) return recs;

  const { value, date } = lab;
  let r = recs;

  if (isStale(date)) {
    // Add stale note to berberine or chromium if present
    for (const id of ['berberine', 'chromium-picolinate', 'ala']) {
      if (findExistingRec(r, id)) r = addNote(r, id, STALE_NOTE);
    }
  }

  // ── <5.7% — normal ──────────────────────────────────────────────────────
  if (value < 5.7) {
    // Remove berberine / chromium if they were added solely for metabolic
    // reasons (goal-based) and there is no condition that warrants them
    const metabolicConditions = [
      'insulin-resistance', 'prediabetes', 'pre-diabetes',
      'metabolic-syndrome', 'type-2-diabetes', 'diabetes',
    ];
    const hasMetabolicCondition = metabolicConditions.some(c =>
      quiz.healthConditions.map(x => x.toLowerCase()).includes(c),
    );

    if (!hasMetabolicCondition) {
      for (const id of ['berberine', 'chromium-picolinate']) {
        if (findExistingRec(r, id)) {
          r = removeRec(
            r, id, LAYER,
            `Lab HbA1c ${value}% — normal glycaemic control; metabolic supplement not required`,
          );
        }
      }
    }
    return r;
  }

  // ── 5.7–6.4% — prediabetes ──────────────────────────────────────────────
  if (value < 6.5) {
    if (!findExistingRec(r, 'chromium-picolinate')) {
      r = put(r, makeRec({
        id: 'chromium-picolinate', supplementName: 'Chromium Picolinate', form: 'picolinate',
        dose: 400, doseUnit: 'mcg', frequency: 'daily',
        timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
        reasons: [makeReason(`Lab HbA1c ${value}% — prediabetes range; chromium potentiates insulin signalling`)],
        warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
        category: 'mineral', separateFrom: [],
        notes: [
          `Your HbA1c is in the prediabetes range (${value}%). Lifestyle modifications (diet + exercise) are the most effective intervention.`,
        ],
      }));
    } else {
      r = addNote(
        r, 'chromium-picolinate',
        `Your HbA1c is in the prediabetes range (${value}%). Lifestyle modifications (diet + exercise) are the most effective intervention.`,
      );
    }

    if (!findExistingRec(r, 'ala')) {
      r = put(r, makeRec({
        id: 'ala', supplementName: 'Alpha-Lipoic Acid (ALA)', form: 'r-ala',
        dose: 300, doseUnit: 'mg', frequency: 'daily',
        timing: ['morning-empty'], withFood: false, evidenceRating: 'Moderate',
        reasons: [makeReason(`Lab HbA1c ${value}% — prediabetes; ALA improves insulin sensitivity via GLUT4 translocation`)],
        warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
        category: 'antioxidant', separateFrom: [], notes: [],
      }));
    }

    if (!findExistingRec(r, 'berberine')) {
      r = put(r, makeRec({
        id: 'berberine', supplementName: 'Berberine', form: 'berberine-hcl',
        dose: 500, doseUnit: 'mg', frequency: 'twice-daily',
        timing: ['morning-with-food', 'evening'], withFood: true, evidenceRating: 'Strong',
        reasons: [makeReason(`Lab HbA1c ${value}% — prediabetes; berberine 500 mg twice daily (1,000 mg/day) — AMPK activation comparable to metformin`)],
        warnings: ['May potentiate blood-sugar-lowering medications — monitor blood glucose'],
        contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
        category: 'herbal', separateFrom: [], notes: ['500 mg twice daily with meals'],
      }));
    }
    return r;
  }

  // ── ≥6.5% — diabetes range ──────────────────────────────────────────────
  if (!findExistingRec(r, 'berberine')) {
    r = put(r, makeRec({
      id: 'berberine', supplementName: 'Berberine', form: 'berberine-hcl',
      dose: 500, doseUnit: 'mg', frequency: 'three-times-daily',
      timing: ['morning-with-food', 'midday', 'evening'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason(`Lab HbA1c ${value}% — diabetes range; berberine 500 mg three times daily (1,500 mg/day) as adjunctive glucose management`)],
      warnings: [
        `HbA1c ${value}% indicates diabetes. This requires physician management. Supplements are adjunctive only.`,
        'May potentiate blood-sugar-lowering medications — monitor blood glucose closely.',
      ],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 9,
      category: 'herbal', separateFrom: [],
      notes: ['500 mg three times daily with meals', `HbA1c ${value}% indicates diabetes. This requires physician management. Supplements are adjunctive only.`],
    }));
  } else {
    r = liftPriority(r, 'berberine', 9);
    r = addWarning(
      r, 'berberine',
      `HbA1c ${value}% indicates diabetes. This requires physician management. Supplements are adjunctive only.`,
    );
  }

  if (!findExistingRec(r, 'chromium-picolinate')) {
    r = put(r, makeRec({
      id: 'chromium-picolinate', supplementName: 'Chromium Picolinate', form: 'picolinate',
      dose: 400, doseUnit: 'mcg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason(`Lab HbA1c ${value}% — diabetes range; chromium potentiates insulin receptor signalling`)],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'mineral', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'ala')) {
    r = put(r, makeRec({
      id: 'ala', supplementName: 'Alpha-Lipoic Acid (ALA)', form: 'r-ala',
      dose: 600, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Strong',
      reasons: [makeReason(`Lab HbA1c ${value}% — diabetes range; ALA improves insulin sensitivity and reduces diabetic neuropathy risk`)],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'antioxidant', separateFrom: [], notes: [],
    }));
  }

  return r;
}

// ─── MAGNESIUM ────────────────────────────────────────────────────────────────

function handleMagnesium(
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] {
  const lab = quiz.labValues?.magnesium;
  if (!lab) return recs;

  const { value, date } = lab;
  const MG_IDS = ['magnesium-glycinate', 'magnesium-citrate', 'magnesium-malate'];
  const mgRec = MG_IDS.map(id => findExistingRec(recs, id)).find(Boolean);
  let r = recs;

  if (isStale(date) && mgRec) r = addNote(r, mgRec.id, STALE_NOTE);

  // Add universal note about serum vs RBC magnesium regardless of level
  const RBC_NOTE = 'Serum magnesium reflects only 1% of total body magnesium. RBC magnesium is a more accurate test.';
  if (mgRec) r = addNote(r, mgRec.id, RBC_NOTE);

  // ── <1.7 mg/dL — low ────────────────────────────────────────────────────
  if (value < 1.7) {
    if (mgRec) {
      r = modifyDose(
        r, mgRec.id, Math.max(mgRec.dose, 400), LAYER,
        `Lab Mg ${value} mg/dL — low serum magnesium; increase to 400 mg/day`,
      );
      r = liftPriority(r, mgRec.id, 8);
      r = addWarning(r, mgRec.id, `Low serum magnesium (${value} mg/dL) detected. Note: serum levels underestimate intracellular depletion.`);
    } else {
      r = put(r, makeRec({
        id: 'magnesium-glycinate', supplementName: 'Magnesium Glycinate', form: 'glycinate',
        dose: 400, doseUnit: 'mg', frequency: 'daily',
        timing: ['bedtime'], withFood: false, evidenceRating: 'Strong',
        reasons: [makeReason(`Lab Mg ${value} mg/dL — low serum magnesium; 400 mg/day to restore status`)],
        warnings: [`Low serum magnesium (${value} mg/dL). Note: serum levels underestimate intracellular depletion.`],
        contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
        category: 'mineral', separateFrom: [], notes: [RBC_NOTE],
      }));
    }
    return r;
  }

  // ── 1.7–2.2 mg/dL — normal ──────────────────────────────────────────────
  if (value <= 2.5) {
    if (mgRec) r = addNote(r, mgRec.id, RBC_NOTE);
    return r;
  }

  // ── >2.5 mg/dL — high ───────────────────────────────────────────────────
  if (mgRec) {
    r = addWarning(
      r, mgRec.id,
      `Serum magnesium is elevated (${value} mg/dL). Consider reducing or stopping magnesium supplementation.`,
    );
    r = addNote(r, mgRec.id, RBC_NOTE);
  }
  return r;
}

// ─── CRP ──────────────────────────────────────────────────────────────────────

function handleCRP(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const lab = quiz.labValues?.crp;
  if (!lab) return recs;

  const { value, date } = lab;
  let r = recs;

  if (isStale(date)) {
    for (const id of ['omega-3-fish-oil', 'dha-algae', 'curcumin', 'nac']) {
      if (findExistingRec(r, id)) r = addNote(r, id, STALE_NOTE);
    }
  }

  // ── <1 mg/L — low risk ──────────────────────────────────────────────────
  if (value < 1) {
    return r; // No inflammation-specific additions
  }

  // ── 1–3 mg/L — moderate risk ────────────────────────────────────────────
  if (value < 3) {
    // Ensure omega-3 at ≥2,000 mg
    const omega3Id = findExistingRec(r, 'dha-algae') ? 'dha-algae' : 'omega-3-fish-oil';
    const omega3Rec = findExistingRec(r, omega3Id);
    if (omega3Rec) {
      if (omega3Rec.dose < 2000) {
        r = modifyDose(r, omega3Id, 2000, LAYER, `Lab CRP ${value} mg/L — moderate inflammation; increase omega-3 to 2,000 mg EPA+DHA`);
      }
    } else {
      r = put(r, makeRec({
        id: 'omega-3-fish-oil', supplementName: 'Omega-3 Fish Oil', form: 'fish-oil',
        dose: 2000, doseUnit: 'mg', frequency: 'daily',
        timing: ['midday'], withFood: true, evidenceRating: 'Strong',
        reasons: [makeReason(`Lab CRP ${value} mg/L — moderate inflammation; EPA+DHA 2,000 mg reduces inflammatory prostaglandins`)],
        warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
        category: 'omega-fatty-acid', separateFrom: [], notes: [],
      }));
    }

    if (!findExistingRec(r, 'curcumin')) {
      r = put(r, makeRec({
        id: 'curcumin', supplementName: 'Curcumin (High-Absorption)', form: 'phospholipid-complex',
        dose: 1000, doseUnit: 'mg', frequency: 'daily',
        timing: ['midday'], withFood: true, evidenceRating: 'Strong',
        reasons: [makeReason(`Lab CRP ${value} mg/L — moderate inflammation; curcumin NF-κB inhibition reduces CRP`)],
        warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
        category: 'herbal', separateFrom: [], notes: [],
      }));
    }
    return r;
  }

  // ── >3 mg/L — elevated ─────────────────────────────────────────────────
  const omega3Id = findExistingRec(r, 'dha-algae') ? 'dha-algae' : 'omega-3-fish-oil';
  const omega3Rec = findExistingRec(r, omega3Id);
  const targetDose = value > 10 ? 4000 : 3000;

  if (omega3Rec) {
    if (omega3Rec.dose < targetDose) {
      r = modifyDose(r, omega3Id, targetDose, LAYER, `Lab CRP ${value} mg/L — elevated inflammation; increase omega-3 to ${targetDose} mg EPA+DHA`);
    }
  } else {
    r = put(r, makeRec({
      id: 'omega-3-fish-oil', supplementName: 'Omega-3 Fish Oil', form: 'fish-oil',
      dose: targetDose, doseUnit: 'mg', frequency: 'daily',
      timing: ['midday'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason(`Lab CRP ${value} mg/L — elevated inflammation; high-dose EPA+DHA anti-inflammatory`)],
      warnings: value > 10
        ? [`Very high CRP (${value} mg/L) — likely indicates active infection or acute inflammation. See doctor promptly.`]
        : [`Elevated CRP (${value} mg/L) — discuss with doctor to identify and address the underlying cause.`],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'omega-fatty-acid', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'curcumin')) {
    r = put(r, makeRec({
      id: 'curcumin', supplementName: 'Curcumin (High-Absorption)', form: 'phospholipid-complex',
      dose: 1000, doseUnit: 'mg', frequency: 'daily',
      timing: ['midday'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason(`Lab CRP ${value} mg/L — elevated inflammation; curcumin NF-κB inhibition reduces hs-CRP significantly`)],
      warnings: [`Elevated CRP (${value} mg/L) — discuss with doctor to identify and address the underlying cause.`],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'herbal', separateFrom: [], notes: [],
    }));
  } else {
    r = addWarning(
      r, 'curcumin',
      `Elevated CRP (${value} mg/L) indicates systemic inflammation. Discuss with doctor to identify and address the underlying cause.`,
    );
  }

  if (!findExistingRec(r, 'nac')) {
    r = put(r, makeRec({
      id: 'nac', supplementName: 'N-Acetyl Cysteine (NAC)', form: 'nac',
      dose: 1200, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food', 'evening'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason(`Lab CRP ${value} mg/L — elevated inflammation; NAC replenishes glutathione, reducing oxidative stress and CRP`)],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'amino-acid', separateFrom: [], notes: ['600 mg twice daily'],
    }));
  }

  if (value > 10) {
    // Add urgent flag
    r = addWarning(
      r, omega3Id,
      `Very high CRP (${value} mg/L) — likely indicates active infection or acute inflammation. See doctor promptly.`,
    );
  }

  return r;
}

// ─── HOMOCYSTEINE ─────────────────────────────────────────────────────────────

function handleHomocysteine(
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] {
  const lab = quiz.labValues?.homocysteine;
  if (!lab) return recs;

  const { value, date } = lab;
  let r = recs;

  if (isStale(date)) {
    for (const id of ['folate-5mthf', 'vitamin-b12', 'vitamin-b6', 'betaine-tmg']) {
      if (findExistingRec(r, id)) r = addNote(r, id, STALE_NOTE);
    }
  }

  // ── <10 µmol/L — normal ─────────────────────────────────────────────────
  if (value < 10) {
    return r;
  }

  // ── 10–15 µmol/L — borderline ───────────────────────────────────────────
  if (value < 15) {
    // Ensure B12, folate, B6 are present
    const b12 = findExistingRec(r, 'vitamin-b12');
    if (b12) {
      r = addReason(r, 'vitamin-b12', LAYER, `Homocysteine ${value} µmol/L — borderline elevated; B12 supports homocysteine remethylation`);
    } else {
      r = put(r, makeRec({
        id: 'vitamin-b12', supplementName: 'Vitamin B12 (Methylcobalamin)', form: 'methylcobalamin',
        dose: 1000, doseUnit: 'mcg', frequency: 'daily',
        timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
        reasons: [makeReason(`Homocysteine ${value} µmol/L — borderline elevated; B12 co-factor for homocysteine remethylation`)],
        warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
        category: 'vitamin', separateFrom: [], notes: [],
      }));
    }

    const folate = findExistingRec(r, 'folate-5mthf');
    if (folate) {
      r = addReason(r, 'folate-5mthf', LAYER, `Homocysteine ${value} µmol/L — borderline elevated; methylfolate is primary methyl donor for remethylation`);
    } else {
      r = put(r, makeRec({
        id: 'folate-5mthf', supplementName: 'Folate (5-MTHF)', form: '5-methyltetrahydrofolate',
        dose: 800, doseUnit: 'mcg', frequency: 'daily',
        timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
        reasons: [makeReason(`Homocysteine ${value} µmol/L — borderline elevated; methylfolate as primary methyl donor for homocysteine remethylation`)],
        warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
        category: 'vitamin', separateFrom: [], notes: [],
      }));
    }

    const b6 = findExistingRec(r, 'vitamin-b6');
    if (b6) {
      r = addReason(r, 'vitamin-b6', LAYER, `Homocysteine ${value} µmol/L — borderline elevated; B6 transsulfuration pathway co-factor`);
    } else {
      r = put(r, makeRec({
        id: 'vitamin-b6', supplementName: 'Vitamin B6 (P5P)', form: 'pyridoxal-5-phosphate',
        dose: 50, doseUnit: 'mg', frequency: 'daily',
        timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
        reasons: [makeReason(`Homocysteine ${value} µmol/L — borderline elevated; B6 transsulfuration pathway co-factor`)],
        warnings: ['Do not exceed 200 mg/day — peripheral neuropathy risk'],
        contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
        category: 'vitamin', separateFrom: [], notes: [],
      }));
    }
    return r;
  }

  // ── >15 µmol/L — elevated ───────────────────────────────────────────────
  // Ensure B12 at 1,000 mcg
  const b12 = findExistingRec(r, 'vitamin-b12');
  if (b12) {
    if (b12.dose < 1000) {
      r = modifyDose(r, 'vitamin-b12', 1000, LAYER, `Homocysteine ${value} µmol/L — elevated; 1,000 mcg B12 to support remethylation`);
    }
    r = modifyForm(r, 'vitamin-b12', 'methylcobalamin', LAYER, 'Elevated homocysteine — methylcobalamin preferred form');
    r = liftPriority(r, 'vitamin-b12', 8);
  } else {
    r = put(r, makeRec({
      id: 'vitamin-b12', supplementName: 'Vitamin B12 (Methylcobalamin)', form: 'methylcobalamin',
      dose: 1000, doseUnit: 'mcg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason(`Homocysteine ${value} µmol/L — elevated; 1,000 mcg methylcobalamin for remethylation pathway`)],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'vitamin', separateFrom: [], notes: [],
    }));
  }

  // Ensure methylfolate at 800 mcg
  const folate = findExistingRec(r, 'folate-5mthf');
  if (folate) {
    if (folate.dose < 800) {
      r = modifyDose(r, 'folate-5mthf', 800, LAYER, `Homocysteine ${value} µmol/L — elevated; 800 mcg methylfolate for remethylation`);
    }
    r = liftPriority(r, 'folate-5mthf', 8);
  } else {
    r = put(r, makeRec({
      id: 'folate-5mthf', supplementName: 'Folate (5-MTHF)', form: '5-methyltetrahydrofolate',
      dose: 800, doseUnit: 'mcg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason(`Homocysteine ${value} µmol/L — elevated; 800 mcg methylfolate as primary methyl donor`)],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'vitamin', separateFrom: [], notes: [],
    }));
  }

  // Ensure B6 (P5P) at 50 mg
  const b6 = findExistingRec(r, 'vitamin-b6');
  if (b6) {
    if (b6.dose < 50) {
      r = modifyDose(r, 'vitamin-b6', 50, LAYER, `Homocysteine ${value} µmol/L — elevated; 50 mg P5P for transsulfuration pathway`);
    }
  } else {
    r = put(r, makeRec({
      id: 'vitamin-b6', supplementName: 'Vitamin B6 (P5P)', form: 'pyridoxal-5-phosphate',
      dose: 50, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason(`Homocysteine ${value} µmol/L — elevated; B6 P5P for transsulfuration pathway`)],
      warnings: ['Do not exceed 200 mg/day — peripheral neuropathy risk'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'vitamin', separateFrom: [], notes: [],
    }));
  }

  // ── >20 µmol/L — significantly elevated ─────────────────────────────────
  if (value > 20) {
    if (!findExistingRec(r, 'betaine-tmg')) {
      r = put(r, makeRec({
        id: 'betaine-tmg', supplementName: 'Betaine (TMG)', form: 'trimethylglycine',
        dose: 500, doseUnit: 'mg', frequency: 'daily',
        timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
        reasons: [makeReason(`Homocysteine ${value} µmol/L — significantly elevated; TMG alternative methyl donor independent of folate pathway`)],
        warnings: [
          `Significantly elevated homocysteine (${value} µmol/L) — cardiovascular risk factor. Discuss with doctor.`,
          'Avoid in renal disease.',
        ],
        contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
        category: 'compound', separateFrom: [],
        notes: [`Significantly elevated homocysteine. Cardiovascular risk factor. Discuss with doctor.`],
      }));
    } else {
      r = addWarning(
        r, 'betaine-tmg',
        `Significantly elevated homocysteine (${value} µmol/L) — cardiovascular risk factor. Discuss with doctor.`,
      );
    }
  }

  return r;
}

// ─── OMEGA-3 INDEX ────────────────────────────────────────────────────────────

function handleOmega3Index(
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] {
  const lab = quiz.labValues?.omega3Index;
  if (!lab) return recs;

  const { value, date } = lab;
  const omega3Id = findExistingRec(recs, 'dha-algae') ? 'dha-algae' : 'omega-3-fish-oil';
  let r = recs;

  if (isStale(date) && findExistingRec(r, omega3Id)) {
    r = addNote(r, omega3Id, STALE_NOTE);
  }

  // ── <4% — very low ──────────────────────────────────────────────────────
  if (value < 4) {
    const targetDose = 3000;
    if (findExistingRec(r, omega3Id)) {
      if ((findExistingRec(r, omega3Id)?.dose ?? 0) < targetDose) {
        r = modifyDose(r, omega3Id, targetDose, LAYER, `Omega-3 index ${value}% — very low; increase to 3,000 mg EPA+DHA`);
      }
      r = liftPriority(r, omega3Id, 8);
      r = addWarning(r, omega3Id, `Very low omega-3 index (${value}%) — associated with increased cardiovascular and inflammatory risk.`);
      r = addNote(r, omega3Id, 'Very low omega-3 levels — associated with increased cardiovascular risk');
    } else {
      r = put(r, makeRec({
        id: 'omega-3-fish-oil', supplementName: 'Omega-3 Fish Oil', form: 'fish-oil',
        dose: targetDose, doseUnit: 'mg', frequency: 'daily',
        timing: ['midday'], withFood: true, evidenceRating: 'Strong',
        reasons: [makeReason(`Omega-3 index ${value}% — very low; 3,000 mg EPA+DHA to restore adequacy`)],
        warnings: [`Very low omega-3 index (${value}%) — associated with increased cardiovascular risk.`],
        contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
        category: 'omega-fatty-acid', separateFrom: [],
        notes: ['Very low omega-3 levels — associated with increased cardiovascular risk'],
      }));
    }
    return r;
  }

  // ── 4–8% — low-moderate ─────────────────────────────────────────────────
  if (value < 8) {
    const omega3Rec = findExistingRec(r, omega3Id);
    if (omega3Rec) {
      if (omega3Rec.dose < 1000) {
        r = modifyDose(r, omega3Id, 1000, LAYER, `Omega-3 index ${value}% — low-moderate; ensure ≥1,000 mg EPA+DHA`);
      }
    } else {
      r = put(r, makeRec({
        id: 'omega-3-fish-oil', supplementName: 'Omega-3 Fish Oil', form: 'fish-oil',
        dose: 1000, doseUnit: 'mg', frequency: 'daily',
        timing: ['midday'], withFood: true, evidenceRating: 'Strong',
        reasons: [makeReason(`Omega-3 index ${value}% — low-moderate; 1,000 mg EPA+DHA to approach optimal range`)],
        warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 6,
        category: 'omega-fatty-acid', separateFrom: [], notes: [],
      }));
    }
    return r;
  }

  // ── 8–12% — optimal ─────────────────────────────────────────────────────
  if (value < 12) {
    if (findExistingRec(r, omega3Id)) {
      r = addNote(r, omega3Id, `Excellent omega-3 status (index ${value}%). Maintain current intake.`);
    }
    return r;
  }

  // ── >12% — may be excessive ─────────────────────────────────────────────
  const omega3Rec = findExistingRec(r, omega3Id);
  if (omega3Rec) {
    r = addNote(
      r, omega3Id,
      `Omega-3 index is ${value}% — above optimal range. Consider reducing supplemental dose. Food sources are sufficient.`,
    );
  }
  return r;
}

// ─── ZINC ─────────────────────────────────────────────────────────────────────

function handleZinc(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const lab = quiz.labValues?.zinc;
  if (!lab) return recs;

  const { value, date } = lab;
  const ZINC_IDS = ['zinc-picolinate', 'zinc-sulfate', 'zinc-bisglycinate', 'zinc-gluconate', 'zinc-carnosine'];
  const zincRec = ZINC_IDS.map(id => findExistingRec(recs, id)).find(Boolean);
  let r = recs;

  if (isStale(date) && zincRec) r = addNote(r, zincRec.id, STALE_NOTE);

  // ── <60 µg/dL — low ─────────────────────────────────────────────────────
  if (value < 60) {
    if (zincRec) {
      if (zincRec.dose < 30) {
        r = modifyDose(r, zincRec.id, 30, LAYER, `Lab zinc ${value} µg/dL — low; increase to 30 mg/day`);
      }
      r = liftPriority(r, zincRec.id, 8);
    } else {
      r = put(r, makeRec({
        id: 'zinc-picolinate', supplementName: 'Zinc Picolinate', form: 'picolinate',
        dose: 30, doseUnit: 'mg', frequency: 'daily',
        timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
        reasons: [makeReason(`Lab zinc ${value} µg/dL — low serum zinc; 30 mg/day for repletion`)],
        warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
        category: 'mineral', separateFrom: ['iron-bisglycinate'], notes: [],
      }));
    }
    // Auto-add copper to prevent deficiency from zinc supplementation
    if (!findExistingRec(r, 'copper-glycinate')) {
      r = put(r, makeRec({
        id: 'copper-glycinate', supplementName: 'Copper (Glycinate)', form: 'glycinate',
        dose: 2, doseUnit: 'mg', frequency: 'daily',
        timing: ['midday'], withFood: true, evidenceRating: 'Strong',
        reasons: [makeReason(`Lab zinc ${value} µg/dL — zinc supplementation at 30 mg requires copper 2 mg to prevent copper deficiency`)],
        warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
        category: 'mineral', separateFrom: ['zinc-picolinate'], notes: ['Separate from zinc by 2+ hours'],
      }));
    }
    return r;
  }

  // ── 60–120 µg/dL — normal ────────────────────────────────────────────────
  if (value <= 120) {
    return r; // Maintain current
  }

  // ── >120 µg/dL — high ───────────────────────────────────────────────────
  if (zincRec) {
    r = addWarning(
      r, zincRec.id,
      `Serum zinc is elevated (${value} µg/dL). Consider reducing or stopping zinc supplementation.`,
    );
  }
  return r;
}

// ─── FOLATE ───────────────────────────────────────────────────────────────────

function handleFolate(
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] {
  const lab = quiz.labValues?.folate;
  if (!lab) return recs;

  const { value, date } = lab;
  const FOLATE_ID = 'folate-5mthf';
  let r = recs;

  if (isStale(date) && findExistingRec(r, FOLATE_ID)) {
    r = addNote(r, FOLATE_ID, STALE_NOTE);
  }

  // ── <3 ng/mL — deficient ────────────────────────────────────────────────
  if (value < 3) {
    if (findExistingRec(r, FOLATE_ID)) {
      r = modifyDose(r, FOLATE_ID, Math.max(findExistingRec(r, FOLATE_ID)!.dose, 1000), LAYER, `Lab folate ${value} ng/mL — deficient; 1,000 mcg methylfolate for repletion`);
      r = liftPriority(r, FOLATE_ID, 9);
    } else {
      r = put(r, makeRec({
        id: FOLATE_ID, supplementName: 'Folate (5-MTHF)', form: '5-methyltetrahydrofolate',
        dose: 1000, doseUnit: 'mcg', frequency: 'daily',
        timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
        reasons: [makeReason(`Lab folate ${value} ng/mL — deficient; 1,000 mcg methylfolate for repletion`)],
        warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 9,
        category: 'vitamin', separateFrom: [],
        notes: ['Active methylfolate form — effective even with MTHFR variants'],
      }));
    }
    return r;
  }

  // ── 3–20 ng/mL — normal ─────────────────────────────────────────────────
  if (value <= 20) {
    return r; // Maintain
  }

  // ── >20 ng/mL — potentially high ───────────────────────────────────────
  if (findExistingRec(r, FOLATE_ID)) {
    r = addNote(
      r, FOLATE_ID,
      `Serum folate is high (${value} ng/mL). If supplementing high-dose folate, consider reducing to 400 mcg maintenance.`,
    );
  }
  return r;
}

// ─── IRON + TIBC ──────────────────────────────────────────────────────────────

function handleIronTIBC(
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] {
  const ironLab = quiz.labValues?.iron;
  const tibcLab = quiz.labValues?.tibc;
  if (!ironLab) return recs;

  const { value: ironVal, date } = ironLab;
  const tibcVal = tibcLab?.value;
  const IRON_ID = 'iron-bisglycinate';
  let r = recs;

  if (isStale(date) && findExistingRec(r, IRON_ID)) {
    r = addNote(r, IRON_ID, STALE_NOTE);
  }

  const isIronDeficient = ironVal < 60;
  const isIronOverloaded = ironVal > 150;
  const isHighTIBC = tibcVal !== undefined && tibcVal > 400;
  const isLowTIBC = tibcVal !== undefined && tibcVal < 250;

  // ── Low iron + High TIBC = iron deficiency ──────────────────────────────
  if (isIronDeficient && isHighTIBC) {
    if (!findExistingRec(r, IRON_ID)) {
      r = put(r, makeRec({
        id: IRON_ID, supplementName: 'Iron (Bisglycinate)', form: 'bisglycinate',
        dose: 25, doseUnit: 'mg', frequency: 'daily',
        timing: ['morning-empty'], withFood: false, evidenceRating: 'Strong',
        reasons: [makeReason(`Lab iron ${ironVal} µg/dL + TIBC ${tibcVal} µg/dL — iron deficiency pattern; bisglycinate for repletion`)],
        warnings: ['Do not use if thalassemia or hemochromatosis present.'],
        contraindications: ['thalassemia', 'hemochromatosis'],
        cyclingPattern: CYCLE_DAILY, priority: 9,
        category: 'mineral', separateFrom: ['zinc-picolinate', 'calcium-citrate'],
        notes: ['Take with vitamin C for absorption'],
      }));
    } else {
      r = liftPriority(r, IRON_ID, 9);
      r = addNote(r, IRON_ID, `Low iron (${ironVal} µg/dL) + high TIBC (${tibcVal} µg/dL) — confirms iron deficiency pattern`);
    }
    return r;
  }

  // ── High iron + Low TIBC = iron overload ────────────────────────────────
  if (isIronOverloaded && isLowTIBC) {
    if (findExistingRec(r, IRON_ID)) {
      r = removeRec(
        r, IRON_ID, LAYER,
        `Lab iron ${ironVal} µg/dL + TIBC ${tibcVal} µg/dL — iron overload pattern; iron supplementation contraindicated`,
      );
    }
    return r;
  }

  // ── High iron alone — flag ───────────────────────────────────────────────
  if (isIronOverloaded && findExistingRec(r, IRON_ID)) {
    r = removeRec(
      r, IRON_ID, LAYER,
      `Lab serum iron ${ironVal} µg/dL — elevated; iron supplementation contraindicated`,
    );
  }

  return r;
}

// ─── MAIN DISPATCH TABLE ──────────────────────────────────────────────────────

/**
 * Layer 5 — Lab Values.
 *
 * Precision-adjusts supplement doses and protocols based on actual biomarker
 * values. Only runs if quiz.labValues is present. Can increase, decrease, or
 * remove supplements established by Layers 1–4.
 *
 * Biomarkers handled (in order):
 *   Vitamin D, Vitamin B12, Ferritin, TSH, HbA1c, Magnesium, CRP,
 *   Homocysteine, Omega-3 Index, Zinc, Folate, Iron+TIBC
 */
export const layer5Labs = (
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] => {
  if (!quiz.labValues) return recs;

  let r = recs;

  r = handleVitaminD(quiz, r);
  r = handleVitaminB12(quiz, r);
  r = handleFerritin(quiz, r);
  r = handleTSH(quiz, r);
  r = handleHbA1c(quiz, r);
  r = handleMagnesium(quiz, r);
  r = handleCRP(quiz, r);
  r = handleHomocysteine(quiz, r);
  r = handleOmega3Index(quiz, r);
  r = handleZinc(quiz, r);
  r = handleFolate(quiz, r);
  r = handleIronTIBC(quiz, r);

  return r;
};
