// ─────────────────────────────────────────────────────────────────────────────
// NutriGenius — Layer 3: Lifestyle Modifications
//
// Adjusts the recommendation array based on lifestyle factors: stress, sleep,
// physical activity, sun exposure, alcohol, and smoking.
//
// Side-effect: mutates quiz.smokerFlag = true when smokingStatus is
// 'current' or 'former' so all downstream layers (4, 7, safety) can block
// beta-carotene without re-reading smokingStatus.
//
// CRITICAL: Call addOrModify/modifyDose/modifyForm/addReason — never push().
// ─────────────────────────────────────────────────────────────────────────────

import {
  Recommendation,
  QuizData,
  LayerName,
  LayerSource,
  RecommendationReason,
  CYCLE_DAILY,
  CYCLE_WEEKDAYS,
  CYCLE_6ON1OFF,
  COUNTRY_DATA,
} from '../types';

import {
  findExistingRec,
  modifyDose,
  modifyForm,
  addReason,
  addOrModify,
} from './layer1-demographic';

// ─── LAYER CONSTANT ───────────────────────────────────────────────────────────

const LAYER: LayerName = 'lifestyle';

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

/** Append an informational note without creating a formal source entry. */
function appendNote(
  recs: Recommendation[],
  supplementId: string,
  note: string,
): Recommendation[] {
  return recs.map(r => {
    if (r.id !== supplementId || r.notes.includes(note)) return r;
    return { ...r, notes: [...r.notes, note] };
  });
}

/** Add a timing slot if it is not already present; records source audit entry. */
function ensureTimingIncludes(
  recs: Recommendation[],
  supplementId: string,
  slot: Recommendation['timing'][number],
): Recommendation[] {
  const existing = findExistingRec(recs, supplementId);
  if (!existing || existing.timing.includes(slot)) return recs;

  const newTiming = [...existing.timing, slot] as Recommendation['timing'];
  const source = makeSource('modified-timing', {
    previousValue: existing.timing.join(', '),
    newValue: newTiming.join(', '),
  });
  return recs.map(r =>
    r.id !== supplementId ? r : { ...r, timing: newTiming, sources: [...r.sources, source] },
  );
}

/** Absolute latitude from quiz, falling back to COUNTRY_DATA. */
function getLatitude(quiz: QuizData): number {
  if (quiz.latitude !== undefined) return Math.abs(quiz.latitude);
  return Math.abs(COUNTRY_DATA[quiz.country]?.latitude ?? 0);
}

/**
 * True if any B-vitamin supplement that covers baseline B-complex needs
 * is already present in the protocol.
 */
function hasBVitaminCoverage(recs: Recommendation[]): boolean {
  return ['vitamin-b12', 'folate-5mthf', 'b-complex', 'thiamine-b1'].some(id =>
    findExistingRec(recs, id),
  );
}

// ─── SMOKING ──────────────────────────────────────────────────────────────────

function applySmokingModifications(
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] {
  const isCurrent = quiz.smokingStatus === 'current';
  const isFormer = quiz.smokingStatus === 'former';

  if (!isCurrent && !isFormer) return recs;

  // Set smokerFlag for downstream layers — conservative: flag all former smokers too
  // eslint-disable-next-line no-param-reassign
  quiz.smokerFlag = true;

  if (isFormer) {
    // Former smoker: modest vitamin C boost + awareness note
    const existingVC = findExistingRec(recs, 'vitamin-c');
    if (existingVC && existingVC.dose < 750) {
      recs = modifyDose(recs, 'vitamin-c', existingVC.dose + 250, LAYER,
        'Former smoker — antioxidant support continues to benefit as lung tissue repairs');
      recs = addReason(recs, 'vitamin-c', LAYER,
        'Former smoker — increased antioxidant demand during tissue repair phase');
    } else if (!existingVC) {
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
        reasons: [makeReason('Former smoker — antioxidant support during post-smoking repair phase')],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 5,
        category: 'vitamin',
        separateFrom: [],
        notes: ['Take with food to reduce GI discomfort'],
      }), LAYER);
    } else {
      recs = addReason(recs, 'vitamin-c', LAYER,
        'Former smoker — antioxidant support continues to be beneficial as lung tissue repairs');
    }

    recs = appendNote(recs, 'vitamin-c',
      'Former smoker — antioxidant support continues to be beneficial as lung tissue repairs over time');
    return recs;
  }

  // Current smoker
  const vcReason = 'Smokers deplete Vitamin C approximately 40% faster than non-smokers due to increased oxidative stress';
  const existingVC = findExistingRec(recs, 'vitamin-c');
  if (!existingVC) {
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
      reasons: [makeReason(vcReason)],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 7,
      category: 'vitamin',
      separateFrom: [],
      notes: ['Take with food to reduce GI discomfort'],
    }), LAYER);
  } else {
    const newDose = Math.min(existingVC.dose + 500, 1000);
    if (existingVC.dose < newDose) {
      recs = modifyDose(recs, 'vitamin-c', newDose, LAYER, vcReason);
    }
    recs = addReason(recs, 'vitamin-c', LAYER, vcReason);
  }

  // Omega-3: ensure adequate anti-inflammatory dose
  recs = addReason(recs, 'omega-3-fish-oil', LAYER,
    'Smoking-induced chronic inflammation — omega-3 provides anti-inflammatory support');

  // CoQ10: oxidative stress support
  const existingCoQ10 = findExistingRec(recs, 'coq10-ubiquinol');
  if (!existingCoQ10) {
    recs = addOrModify(recs, makeRec({
      id: 'coq10-ubiquinol',
      supplementName: 'CoQ10 (Ubiquinol)',
      form: 'ubiquinol',
      dose: 100,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Moderate',
      reasons: [makeReason(
        'Smoking causes significant mitochondrial oxidative stress — CoQ10 (ubiquinol) supports mitochondrial function and acts as a fat-soluble antioxidant',
      )],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 6,
      category: 'antioxidant',
      separateFrom: [],
      notes: ['Ubiquinol form has 3–8× better absorption than ubiquinone'],
    }), LAYER);
  } else {
    recs = addReason(recs, 'coq10-ubiquinol', LAYER,
      'Smoking causes significant oxidative stress — CoQ10 supports mitochondrial function');
  }

  // NAC: glutathione precursor for smokers
  const existingNAC = findExistingRec(recs, 'nac');
  const nacSmokingReason = 'Smoking depletes glutathione reserves — NAC replenishes the precursor cysteine';
  if (!existingNAC) {
    recs = addOrModify(recs, makeRec({
      id: 'nac',
      supplementName: 'NAC (N-Acetyl Cysteine)',
      form: 'n-acetyl-cysteine',
      dose: 600,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-empty'],
      withFood: false,
      evidenceRating: 'Moderate',
      reasons: [makeReason(nacSmokingReason)],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_WEEKDAYS,
      priority: 6,
      category: 'amino-acid',
      separateFrom: [],
      notes: ['Take 30 minutes before food for best absorption'],
    }), LAYER);
  } else {
    recs = addReason(recs, 'nac', LAYER, nacSmokingReason);
  }

  recs = appendNote(recs, 'vitamin-c',
    'Smoking cessation is the single most impactful health decision you can make. These supplements mitigate some damage but cannot eliminate the risks of continued smoking.');

  return recs;
}

// ─── STRESS ───────────────────────────────────────────────────────────────────

function applyStressModifications(
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] {
  const isHighStress =
    quiz.stressLevel === 'high' || quiz.stressLevel === 'very-high';
  const isVeryHighStress = quiz.stressLevel === 'very-high';
  const isModerateStress = quiz.stressLevel === 'moderate';

  if (!isHighStress && !isModerateStress) return recs;

  if (isModerateStress) {
    // Moderate: annotate magnesium, boost dose only if below 300 mg
    const mg = findExistingRec(recs, 'magnesium-glycinate');
    if (mg && mg.dose < 300) {
      recs = modifyDose(recs, 'magnesium-glycinate', 300, LAYER,
        'Moderate stress — magnesium supports nervous system and HPA-axis function');
    }
    recs = addReason(recs, 'magnesium-glycinate', LAYER,
      'Moderate stress — magnesium supports nervous system function and cortisol regulation');
    return recs;
  }

  // High / very-high stress ─────────────────────────────────────────────────

  // Magnesium: increase by 100–200 mg, minimum 400 mg
  const existingMg = findExistingRec(recs, 'magnesium-glycinate');
  if (existingMg) {
    const newDose = Math.max(existingMg.dose + 100, 400);
    if (newDose > existingMg.dose) {
      recs = modifyDose(recs, 'magnesium-glycinate', newDose, LAYER,
        'High stress increases urinary magnesium excretion — dose raised to compensate');
    }
    recs = addReason(recs, 'magnesium-glycinate', LAYER,
      'High stress increases magnesium excretion via cortisol-driven urinary loss');
  }

  // Ashwagandha (KSM-66)
  if (!findExistingRec(recs, 'ashwagandha-ksm66')) {
    recs = addOrModify(recs, makeRec({
      id: 'ashwagandha-ksm66',
      supplementName: 'Ashwagandha (KSM-66)',
      form: 'ksm-66-root-extract',
      dose: 600,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Moderate',
      reasons: [makeReason(
        'Adaptogenic support for elevated stress — multiple RCTs show 27–30% cortisol reduction with KSM-66 extract',
        'KSM-66 is the most clinically studied ashwagandha extract (5% withanolides). Effects build over 4–8 weeks.',
      )],
      warnings: ['Avoid in pregnancy — may stimulate uterine contractions'],
      contraindications: [],
      cyclingPattern: CYCLE_6ON1OFF,
      priority: 6,
      category: 'adaptogen',
      separateFrom: [],
      notes: ['KSM-66 standardised extract — take in the morning; effects build over 4–8 weeks'],
    }), LAYER);
  } else {
    recs = addReason(recs, 'ashwagandha-ksm66', LAYER,
      'High stress — adaptogenic cortisol regulation support');
  }

  // L-Theanine
  if (!findExistingRec(recs, 'l-theanine')) {
    recs = addOrModify(recs, makeRec({
      id: 'l-theanine',
      supplementName: 'L-Theanine',
      form: 'l-theanine',
      dose: 200,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['bedtime'],
      withFood: false,
      evidenceRating: 'Moderate',
      reasons: [makeReason(
        'High stress — promotes alpha brain-wave activity for calm focus without sedation; supports evening wind-down',
      )],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 5,
      category: 'amino-acid',
      separateFrom: [],
      notes: ['Naturally found in green tea — promotes relaxed alertness'],
    }), LAYER);
  } else {
    recs = addReason(recs, 'l-theanine', LAYER,
      'High stress — supports alpha-wave activity and GABA-mediated calm');
  }

  // B-Complex: if no B vitamin coverage
  if (!hasBVitaminCoverage(recs)) {
    recs = addOrModify(recs, makeRec({
      id: 'b-complex',
      supplementName: 'B-Complex',
      form: 'methylated-b-complex',
      dose: 1,
      doseUnit: 'serving',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Moderate',
      reasons: [makeReason(
        'High stress depletes B vitamins through increased adrenal metabolic demand',
      )],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 5,
      category: 'vitamin',
      separateFrom: [],
      notes: ['Methylated forms (methylfolate, methylcobalamin) are preferred for superior absorption'],
    }), LAYER);
  } else {
    // At least one B vitamin present — add stress reason to the most likely present one
    if (findExistingRec(recs, 'vitamin-b12')) {
      recs = addReason(recs, 'vitamin-b12', LAYER,
        'High stress increases B vitamin turnover through elevated adrenal demand');
    }
  }

  // Very-high stress extras ──────────────────────────────────────────────────
  if (isVeryHighStress) {
    if (!findExistingRec(recs, 'rhodiola-rosea')) {
      recs = addOrModify(recs, makeRec({
        id: 'rhodiola-rosea',
        supplementName: 'Rhodiola Rosea',
        form: 'rhodiola-rosea-root-extract',
        dose: 400,
        doseUnit: 'mg',
        frequency: 'daily',
        timing: ['morning-with-food'],
        withFood: true,
        evidenceRating: 'Moderate',
        reasons: [makeReason(
          'Dual adaptogen approach for very-high stress — rhodiola targets mental fatigue and stress resilience via AMPK activation',
        )],
        warnings: ['Mildly stimulating — do NOT take at bedtime'],
        contraindications: [],
        cyclingPattern: CYCLE_6ON1OFF,
        priority: 5,
        category: 'adaptogen',
        separateFrom: [],
        notes: ['Take in the morning — can disrupt sleep if taken in the afternoon or evening'],
      }), LAYER);
    }

    // Holy Basil / Tulsi: for very-high stress + anxiety
    const hasAnxiety = quiz.healthConditions?.includes('anxiety') ||
      quiz.healthGoals?.includes('stress-anxiety');
    if (hasAnxiety && !findExistingRec(recs, 'holy-basil')) {
      recs = addOrModify(recs, makeRec({
        id: 'holy-basil',
        supplementName: 'Holy Basil (Tulsi)',
        form: 'tulsi-leaf-extract',
        dose: 500,
        doseUnit: 'mg',
        frequency: 'daily',
        timing: ['morning-with-food'],
        withFood: true,
        evidenceRating: 'Emerging',
        reasons: [makeReason(
          'Very high stress with anxiety — holy basil (tulsi) modulates cortisol and supports GABAergic pathways',
        )],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 4,
        category: 'adaptogen',
        separateFrom: [],
        notes: ['Also known as Tulsi — an Ayurvedic adaptogen with emerging clinical evidence'],
      }), LAYER);
    }
  }

  return recs;
}

// ─── SLEEP ────────────────────────────────────────────────────────────────────

function applySleepModifications(
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] {
  const isPoorSleep = quiz.sleepQuality === 'poor';
  const isFairSleep = quiz.sleepQuality === 'fair';

  if (!isPoorSleep && !isFairSleep) return recs;

  // Both poor and fair: ensure glycinate form and bedtime timing
  const mgGlyReason =
    'Magnesium glycinate is specifically chosen for sleep — crosses the blood-brain barrier to calm the nervous system';
  const existingMg = findExistingRec(recs, 'magnesium-glycinate');
  if (existingMg) {
    if (existingMg.form !== 'glycinate') {
      recs = modifyForm(recs, 'magnesium-glycinate', 'glycinate', LAYER, mgGlyReason);
      recs = addReason(recs, 'magnesium-glycinate', LAYER, mgGlyReason);
    }
    recs = ensureTimingIncludes(recs, 'magnesium-glycinate', 'bedtime');
  }

  if (isFairSleep) {
    recs = appendNote(recs, 'magnesium-glycinate',
      'Sleep optimisation: a consistent sleep schedule and a dark, cool room are more effective than any supplement');
    return recs;
  }

  // Poor sleep only ──────────────────────────────────────────────────────────

  // L-Theanine
  if (!findExistingRec(recs, 'l-theanine')) {
    recs = addOrModify(recs, makeRec({
      id: 'l-theanine',
      supplementName: 'L-Theanine',
      form: 'l-theanine',
      dose: 200,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['bedtime'],
      withFood: false,
      evidenceRating: 'Moderate',
      reasons: [makeReason(
        'Poor sleep — promotes GABA-mediated relaxation and reduces time to sleep onset',
      )],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 5,
      category: 'amino-acid',
      separateFrom: [],
      notes: ['Take 30–60 minutes before bed'],
    }), LAYER);
  } else {
    recs = addReason(recs, 'l-theanine', LAYER,
      'Poor sleep — L-theanine also supports sleep onset through GABA modulation');
  }

  // Melatonin: low dose (0.5–1 mg) only for poor (not fair)
  if (!findExistingRec(recs, 'melatonin')) {
    recs = addOrModify(recs, makeRec({
      id: 'melatonin',
      supplementName: 'Melatonin',
      form: 'melatonin',
      dose: 0.5,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['bedtime'],
      withFood: false,
      evidenceRating: 'Moderate',
      reasons: [makeReason(
        'Poor sleep — low-dose melatonin (0.5 mg) signals circadian phase without suppressing endogenous production',
      )],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 5,
      category: 'compound',
      separateFrom: [],
      notes: [
        'Low dose (0.5–1 mg) is more effective than high doses for sleep onset — higher doses cause morning grogginess',
        'Take 30 minutes before intended sleep time',
        'Common 5–10 mg doses found in stores are pharmacological, not physiological',
      ],
    }), LAYER);
  }

  // Glycine 3 g
  if (!findExistingRec(recs, 'glycine')) {
    recs = addOrModify(recs, makeRec({
      id: 'glycine',
      supplementName: 'Glycine',
      form: 'glycine',
      dose: 3,
      doseUnit: 'g',
      frequency: 'daily',
      timing: ['bedtime'],
      withFood: false,
      evidenceRating: 'Moderate',
      reasons: [makeReason(
        'Poor sleep — glycine lowers core body temperature by ~0.5°C, which is the primary trigger for sleep onset',
      )],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 4,
      category: 'amino-acid',
      separateFrom: [],
      notes: ['Dissolves in water — pleasant sweet taste; take 30–60 minutes before bed'],
    }), LAYER);
  }

  // Tart Cherry: only if melatonin is not already in protocol
  if (!findExistingRec(recs, 'tart-cherry-extract') &&
      !findExistingRec(recs, 'melatonin')) {
    recs = addOrModify(recs, makeRec({
      id: 'tart-cherry-extract',
      supplementName: 'Tart Cherry Extract',
      form: 'montmorency-cherry-extract',
      dose: 500,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['bedtime'],
      withFood: false,
      evidenceRating: 'Moderate',
      reasons: [makeReason(
        'Poor sleep — Montmorency tart cherry is a natural source of melatonin and tryptophan; RCTs show improved sleep efficiency',
      )],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 3,
      category: 'herbal',
      separateFrom: [],
      notes: ['Natural melatonin source — do not combine with supplemental melatonin'],
    }), LAYER);
  }

  // Magnesium L-Threonate: for poor sleep + cognitive concerns
  const hasCognitiveConcern =
    quiz.healthGoals?.includes('cognitive') ||
    quiz.healthConditions?.includes('brain-fog');
  if (hasCognitiveConcern && !findExistingRec(recs, 'mag-l-threonate')) {
    recs = addOrModify(recs, makeRec({
      id: 'mag-l-threonate',
      supplementName: 'Magnesium L-Threonate',
      form: 'l-threonate',
      dose: 1500,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['bedtime'],
      withFood: false,
      evidenceRating: 'Emerging',
      reasons: [makeReason(
        'Poor sleep + cognitive concerns — L-threonate is the only magnesium form shown to cross the blood-brain barrier and increase brain magnesium levels',
        'Complements glycinate (body/sleep) — serves a distinct neurological role',
      )],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 4,
      category: 'mineral',
      separateFrom: [],
      notes: [
        'L-Threonate specifically increases brain magnesium — different purpose from glycinate',
        'Provides ~144 mg elemental magnesium per 1,500 mg dose',
      ],
    }), LAYER);
  }

  return recs;
}

// ─── ACTIVITY ─────────────────────────────────────────────────────────────────

function applyActivityModifications(
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] {
  const isAthlete =
    quiz.activityLevel === 'very-active' || quiz.activityLevel === 'athlete';
  const isSedentary = quiz.activityLevel === 'sedentary';

  if (!isAthlete && !isSedentary) {
    if (quiz.activityLevel === 'moderate') {
      recs = appendNote(recs, 'vitamin-d3',
        'Moderate activity is excellent — consider gradually increasing intensity for additional cardiovascular and metabolic benefits');
    }
    return recs;
  }

  if (isSedentary) {
    // CoQ10 for cellular energy
    if (!findExistingRec(recs, 'coq10-ubiquinol')) {
      recs = addOrModify(recs, makeRec({
        id: 'coq10-ubiquinol',
        supplementName: 'CoQ10 (Ubiquinol)',
        form: 'ubiquinol',
        dose: 100,
        doseUnit: 'mg',
        frequency: 'daily',
        timing: ['morning-with-food'],
        withFood: true,
        evidenceRating: 'Moderate',
        reasons: [makeReason(
          'Sedentary lifestyle — CoQ10 supports cellular energy production and mitochondrial function',
        )],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 5,
        category: 'antioxidant',
        separateFrom: [],
        notes: ['Ubiquinol form has 3–8× better absorption than ubiquinone'],
      }), LAYER);
    } else {
      recs = addReason(recs, 'coq10-ubiquinol', LAYER,
        'Sedentary lifestyle — CoQ10 supports cellular energy production');
    }

    recs = appendNote(recs, 'vitamin-d3',
      'Regular physical activity (even 30 minutes of brisk walking/day) is the single most impactful health intervention — no supplement can replace exercise');
    return recs;
  }

  // Very-active / Athlete ────────────────────────────────────────────────────

  // Magnesium: 400–500 mg minimum
  const existingMg = findExistingRec(recs, 'magnesium-glycinate');
  if (existingMg) {
    const newDose = Math.max(existingMg.dose, 400);
    if (newDose > existingMg.dose) {
      recs = modifyDose(recs, 'magnesium-glycinate', newDose, LAYER,
        'High physical activity increases magnesium loss through sweat and muscle metabolism');
    }
    recs = addReason(recs, 'magnesium-glycinate', LAYER,
      'High physical activity — magnesium is lost through perspiration and needed for muscle contraction and recovery');
  }

  // CoQ10 (ubiquinol 200 mg)
  const existingCoQ10 = findExistingRec(recs, 'coq10-ubiquinol');
  if (!existingCoQ10) {
    recs = addOrModify(recs, makeRec({
      id: 'coq10-ubiquinol',
      supplementName: 'CoQ10 (Ubiquinol)',
      form: 'ubiquinol',
      dose: 200,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Moderate',
      reasons: [makeReason(
        'High physical activity — CoQ10 supports mitochondrial ATP production and reduces exercise-induced oxidative damage',
      )],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 6,
      category: 'antioxidant',
      separateFrom: [],
      notes: ['Ubiquinol form has 3–8× better absorption than ubiquinone'],
    }), LAYER);
  } else {
    const newCoQ10Dose = Math.max(existingCoQ10.dose, 200);
    if (newCoQ10Dose > existingCoQ10.dose) {
      recs = modifyDose(recs, 'coq10-ubiquinol', newCoQ10Dose, LAYER,
        'Athlete — 200 mg CoQ10 for enhanced mitochondrial support during training');
    }
    recs = addReason(recs, 'coq10-ubiquinol', LAYER,
      'High physical activity — supports mitochondrial energy production and exercise recovery');
  }

  // Creatine Monohydrate
  if (!findExistingRec(recs, 'creatine-monohydrate')) {
    recs = addOrModify(recs, makeRec({
      id: 'creatine-monohydrate',
      supplementName: 'Creatine Monohydrate',
      form: 'creatine-monohydrate',
      dose: 5,
      doseUnit: 'g',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [makeReason(
        'High physical activity — creatine has the strongest evidence base of any sports supplement for strength, power output, and recovery',
        'Also emerging evidence for cognitive benefits and healthy aging',
      )],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 7,
      category: 'amino-acid',
      separateFrom: [],
      notes: [
        '5 g/day maintenance dose — no loading phase needed',
        'Monohydrate is the most studied and cost-effective form',
        'Mix with water or protein shake; takes 4 weeks to saturate muscle stores',
      ],
    }), LAYER);
  }

  // Omega-3: ensure 2,000 mg for anti-inflammatory recovery
  const existingOmega3 = findExistingRec(recs, 'omega-3-fish-oil');
  if (existingOmega3 && existingOmega3.dose < 2000) {
    recs = modifyDose(recs, 'omega-3-fish-oil', 2000, LAYER,
      'High-intensity exercise — 2,000 mg EPA+DHA manages exercise-induced inflammation and supports recovery');
    recs = addReason(recs, 'omega-3-fish-oil', LAYER,
      'Athlete — higher omega-3 dose for exercise-induced inflammation management');
  }

  // Taurine: cardiovascular and exercise performance
  const existingTaurine = findExistingRec(recs, 'taurine');
  if (!existingTaurine) {
    recs = addOrModify(recs, makeRec({
      id: 'taurine',
      supplementName: 'Taurine',
      form: 'taurine',
      dose: 1500,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Moderate',
      reasons: [makeReason(
        'High physical activity — taurine supports cardiovascular function, reduces exercise-induced oxidative damage, and aids thermoregulation',
      )],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 4,
      category: 'amino-acid',
      separateFrom: [],
      notes: [],
    }), LAYER);
  } else {
    const newTaurineDose = Math.max(existingTaurine.dose, 1500);
    if (newTaurineDose > existingTaurine.dose) {
      recs = modifyDose(recs, 'taurine', newTaurineDose, LAYER,
        'Athlete — higher taurine dose for exercise performance and cardiovascular support');
    }
    recs = addReason(recs, 'taurine', LAYER,
      'High physical activity — taurine supports cardiovascular function and reduces exercise oxidative damage');
  }

  // Electrolyte note
  recs = appendNote(recs, 'magnesium-glycinate',
    'Athletes: ensure adequate sodium (2–3 g/day), potassium (3–4 g/day from diet + supplement), and magnesium daily — especially during intense training blocks');

  // Beta-Alanine: only if athletic-performance goal selected
  const hasAthleteGoal = quiz.healthGoals?.includes('athletic-performance');
  if (hasAthleteGoal && !findExistingRec(recs, 'beta-alanine')) {
    recs = addOrModify(recs, makeRec({
      id: 'beta-alanine',
      supplementName: 'Beta-Alanine',
      form: 'beta-alanine',
      dose: 3200,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [makeReason(
        'Athletic performance goal — beta-alanine buffers muscle acid during high-intensity exercise, extending endurance capacity',
      )],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 5,
      category: 'amino-acid',
      separateFrom: [],
      notes: [
        'May cause harmless tingling (paresthesia) — take in divided doses to minimise',
        'Sustained-release form reduces paresthesia significantly',
        'Benefits build over 4–6 weeks of consistent use',
      ],
    }), LAYER);
  }

  // L-Citrulline: only if athletic-performance goal selected
  if (hasAthleteGoal && !findExistingRec(recs, 'l-citrulline')) {
    recs = addOrModify(recs, makeRec({
      id: 'l-citrulline',
      supplementName: 'L-Citrulline',
      form: 'l-citrulline',
      dose: 6000,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-empty'],
      withFood: false,
      evidenceRating: 'Moderate',
      reasons: [makeReason(
        'Athletic performance — L-citrulline increases nitric oxide production, improving blood flow and reducing fatigue',
      )],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 4,
      category: 'amino-acid',
      separateFrom: [],
      notes: ['Take 30–60 minutes before training for peak NO production'],
    }), LAYER);
  }

  // ── Training Phase Modifiers ────────────────────────────────────────────────
  recs = applyTrainingPhase(quiz, recs);

  return recs;
}

// ─── TRAINING PHASE ──────────────────────────────────────────────────────────

function applyTrainingPhase(
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] {
  const phase = quiz.trainingPhase;
  if (!phase) return recs;

  // ── BUILDING ──────────────────────────────────────────────────────────────
  if (phase === 'building') {
    // Ensure creatine at 5g (should already be present from athlete block)
    if (!findExistingRec(recs, 'creatine-monohydrate')) {
      recs = addOrModify(recs, makeRec({
        id: 'creatine-monohydrate',
        supplementName: 'Creatine Monohydrate',
        form: 'creatine-monohydrate',
        dose: 5,
        doseUnit: 'g',
        frequency: 'daily',
        timing: ['morning-with-food'],
        withFood: true,
        evidenceRating: 'Strong',
        reasons: [makeReason(
          'Building phase — creatine saturates muscle phosphocreatine stores for maximal strength and hypertrophy gains',
        )],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 7,
        category: 'amino-acid',
        separateFrom: [],
        notes: ['5 g/day maintenance dose — no loading phase needed'],
      }), LAYER);
    } else {
      recs = addReason(recs, 'creatine-monohydrate', LAYER,
        'Building phase — creatine supports strength and hypertrophy gains');
    }

    // HMB for newer trainees
    if (!findExistingRec(recs, 'hmb')) {
      recs = addOrModify(recs, makeRec({
        id: 'hmb',
        supplementName: 'HMB (β-Hydroxy β-Methylbutyrate)',
        form: 'hmb-free-acid',
        dose: 3,
        doseUnit: 'g',
        frequency: 'daily',
        timing: ['morning-with-food'],
        withFood: true,
        evidenceRating: 'Moderate',
        reasons: [makeReason(
          'Building phase — HMB reduces muscle protein breakdown and accelerates recovery, most effective for newer trainees',
        )],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 5,
        category: 'amino-acid',
        separateFrom: [],
        notes: [
          'Most beneficial for those new to resistance training or returning after a break',
          'Ensure 1.6–2.2 g protein per kg bodyweight from diet for optimal muscle growth',
        ],
      }), LAYER);
    }

    recs = appendNote(recs, 'creatine-monohydrate',
      'Building phase: ensure 1.6–2.2 g protein per kg bodyweight from diet for optimal muscle growth');

    return recs;
  }

  // ── CUTTING ───────────────────────────────────────────────────────────────
  if (phase === 'cutting') {
    // Magnesium: increase by 100mg for electrolyte depletion in deficit
    const mg = findExistingRec(recs, 'magnesium-glycinate');
    if (mg) {
      const cuttingDose = mg.dose + 100;
      recs = modifyDose(recs, 'magnesium-glycinate', cuttingDose, LAYER,
        'Cutting phase — additional magnesium to offset electrolyte depletion during caloric deficit');
    }

    // HMB 3g — strong evidence for muscle preservation in deficit
    if (!findExistingRec(recs, 'hmb')) {
      recs = addOrModify(recs, makeRec({
        id: 'hmb',
        supplementName: 'HMB (β-Hydroxy β-Methylbutyrate)',
        form: 'hmb-free-acid',
        dose: 3,
        doseUnit: 'g',
        frequency: 'daily',
        timing: ['morning-with-food'],
        withFood: true,
        evidenceRating: 'Strong',
        reasons: [makeReason(
          'Cutting phase — HMB prevents muscle loss during caloric deficit; strongest evidence in energy-restricted contexts',
        )],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 7,
        category: 'amino-acid',
        separateFrom: [],
        notes: [
          'Critical during caloric deficit — reduces muscle protein breakdown by up to 20%',
          'Maintain protein intake at 2.0–2.4 g/kg during caloric deficit to preserve muscle mass',
        ],
      }), LAYER);
    }

    // Chromium for blood sugar stability during deficit
    if (!findExistingRec(recs, 'chromium-picolinate')) {
      recs = addOrModify(recs, makeRec({
        id: 'chromium-picolinate',
        supplementName: 'Chromium Picolinate',
        form: 'picolinate',
        dose: 200,
        doseUnit: 'mcg',
        frequency: 'daily',
        timing: ['morning-with-food'],
        withFood: true,
        evidenceRating: 'Moderate',
        reasons: [makeReason(
          'Cutting phase — chromium supports blood sugar stability and reduces cravings during caloric deficit',
        )],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 4,
        category: 'mineral',
        separateFrom: [],
        notes: ['Supports insulin sensitivity during energy restriction'],
      }), LAYER);
    }

    // Omega-3: ensure anti-inflammatory dose (deficit increases inflammation)
    const omega3Id = findExistingRec(recs, 'dha-algae') ? 'dha-algae' : 'omega-3-fish-oil';
    const omega3 = findExistingRec(recs, omega3Id);
    if (omega3 && omega3.dose < 2000) {
      recs = modifyDose(recs, omega3Id, 2000, LAYER,
        'Cutting phase — caloric deficit increases systemic inflammation; higher omega-3 dose is anti-inflammatory');
    }

    recs = appendNote(recs, 'creatine-monohydrate',
      'Cutting phase: maintain creatine — it preserves muscle and strength during a deficit with no fat gain');

    return recs;
  }

  // ── COMPETITION ───────────────────────────────────────────────────────────
  if (phase === 'competition') {
    recs = appendNote(recs, 'creatine-monohydrate',
      'Competition: be aware of ~1–2 kg water retention from creatine — consider timing relative to weigh-in if applicable');

    // Caffeine timing note (add to any existing supplement or creatine as carrier)
    const caffNote =
      'Competition: 200–400 mg caffeine 30–60 min before competition for ergogenic benefit (3–6 mg/kg bodyweight)';
    if (findExistingRec(recs, 'creatine-monohydrate')) {
      recs = appendNote(recs, 'creatine-monohydrate', caffNote);
    }

    // Beetroot / nitrate note
    const beetrootNote =
      'Competition: 500 ml beetroot juice (or 6.4 mmol nitrate supplement) 2–3 hours before endurance events for nitric oxide boost';
    if (findExistingRec(recs, 'l-citrulline')) {
      recs = appendNote(recs, 'l-citrulline', beetrootNote);
    } else if (findExistingRec(recs, 'creatine-monohydrate')) {
      recs = appendNote(recs, 'creatine-monohydrate', beetrootNote);
    }

    // Sodium / water note
    const sodiumNote =
      'Competition: sodium and water manipulation is highly individual — consult a sports dietitian for peaking protocols';
    if (findExistingRec(recs, 'magnesium-glycinate')) {
      recs = appendNote(recs, 'magnesium-glycinate', sodiumNote);
    }

    return recs;
  }

  // ── RECOVERY ──────────────────────────────────────────────────────────────
  if (phase === 'recovery') {
    // Omega-3: increase to 2,000mg+ for anti-inflammatory recovery
    const omega3Id = findExistingRec(recs, 'dha-algae') ? 'dha-algae' : 'omega-3-fish-oil';
    const omega3 = findExistingRec(recs, omega3Id);
    if (omega3 && omega3.dose < 2000) {
      recs = modifyDose(recs, omega3Id, 2000, LAYER,
        'Recovery phase — increased omega-3 for anti-inflammatory support during recovery');
    }
    if (omega3) {
      recs = addReason(recs, omega3Id, LAYER,
        'Recovery phase — omega-3 reduces delayed-onset muscle soreness and supports tissue repair');
    }

    // Tart Cherry Extract for DOMS reduction
    if (!findExistingRec(recs, 'tart-cherry-extract')) {
      recs = addOrModify(recs, makeRec({
        id: 'tart-cherry-extract',
        supplementName: 'Tart Cherry Extract',
        form: 'montmorency-cherry-extract',
        dose: 500,
        doseUnit: 'mg',
        frequency: 'daily',
        timing: ['evening'],
        withFood: false,
        evidenceRating: 'Moderate',
        reasons: [makeReason(
          'Recovery phase — tart cherry anthocyanins reduce DOMS and markers of exercise-induced muscle damage',
        )],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 5,
        category: 'herbal',
        separateFrom: [],
        notes: ['Reduces delayed-onset muscle soreness (DOMS) by ~13% in meta-analyses'],
      }), LAYER);
    } else {
      recs = addReason(recs, 'tart-cherry-extract', LAYER,
        'Recovery phase — anthocyanins reduce exercise-induced muscle damage and DOMS');
    }

    // Collagen peptides for tendon/joint repair
    if (!findExistingRec(recs, 'collagen-peptides')) {
      recs = addOrModify(recs, makeRec({
        id: 'collagen-peptides',
        supplementName: 'Collagen Peptides',
        form: 'hydrolysed-type-i-iii',
        dose: 15,
        doseUnit: 'g',
        frequency: 'daily',
        timing: ['morning-with-food'],
        withFood: true,
        evidenceRating: 'Moderate',
        reasons: [makeReason(
          'Recovery phase — collagen peptides support tendon, ligament, and joint repair; take with 50 mg vitamin C',
        )],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 5,
        category: 'protein',
        separateFrom: [],
        notes: [
          'Take with 50 mg vitamin C to enhance collagen synthesis',
          'Hydrolysed type I & III collagen targets tendons, ligaments, and joints',
        ],
      }), LAYER);
    }

    // CoQ10: ensure present for recovery support
    if (!findExistingRec(recs, 'coq10-ubiquinol')) {
      recs = addOrModify(recs, makeRec({
        id: 'coq10-ubiquinol',
        supplementName: 'CoQ10 (Ubiquinol)',
        form: 'ubiquinol',
        dose: 200,
        doseUnit: 'mg',
        frequency: 'daily',
        timing: ['morning-with-food'],
        withFood: true,
        evidenceRating: 'Moderate',
        reasons: [makeReason(
          'Recovery phase — CoQ10 supports mitochondrial recovery and reduces exercise-induced oxidative stress',
        )],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 6,
        category: 'antioxidant',
        separateFrom: [],
        notes: ['Ubiquinol form has 3–8× better absorption than ubiquinone'],
      }), LAYER);
    } else {
      recs = addReason(recs, 'coq10-ubiquinol', LAYER,
        'Recovery phase — CoQ10 supports mitochondrial repair and reduces oxidative stress');
    }

    recs = appendNote(recs, 'creatine-monohydrate',
      'Recovery phase: maintain creatine — it supports muscle repair even during reduced training');
    recs = appendNote(recs, 'magnesium-glycinate',
      'Recovery phase — focus on sleep, nutrition, and gentle movement. Reduce training intensity to allow adaptation.');

    return recs;
  }

  // MAINTENANCE — no additional phase-specific modifications
  return recs;
}

// ─── SUN EXPOSURE ─────────────────────────────────────────────────────────────

function applySunExposureModifications(
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] {
  const lat = getLatitude(quiz);

  if (quiz.sunExposure === 'minimal' && lat > 40) {
    // High risk of deficiency: increase Vitamin D to age-tiered maximum
    let targetDose: number;
    if (quiz.age >= 70) {
      targetDose = 5000;
    } else if (quiz.age >= 50) {
      targetDose = 4000;
    } else {
      targetDose = 3000;
    }

    const existingD = findExistingRec(recs, 'vitamin-d3');
    if (existingD && existingD.dose < targetDose) {
      recs = modifyDose(recs, 'vitamin-d3', targetDose, LAYER,
        `Minimal sun exposure at ${lat.toFixed(0)}°N latitude — high risk of Vitamin D insufficiency year-round`);
      recs = addReason(recs, 'vitamin-d3', LAYER,
        'Minimal sun exposure combined with northern latitude — significantly elevated risk of Vitamin D deficiency');
    }

    recs = appendNote(recs, 'vitamin-d3',
      '15–20 minutes of midday sun on arms and face (without sunscreen) 2–3×/week can meaningfully boost Vitamin D when UV index is >3');
  }

  if (quiz.sunExposure === 'high') {
    recs = appendNote(recs, 'vitamin-d3',
      'Your sun exposure may provide adequate Vitamin D — consider testing 25(OH)D levels to optimise your supplement dose');

    // Astaxanthin: internal UV protection
    if (!findExistingRec(recs, 'astaxanthin')) {
      recs = addOrModify(recs, makeRec({
        id: 'astaxanthin',
        supplementName: 'Astaxanthin',
        form: 'astaxanthin',
        dose: 6,
        doseUnit: 'mg',
        frequency: 'daily',
        timing: ['morning-with-food'],
        withFood: true,
        evidenceRating: 'Moderate',
        reasons: [makeReason(
          'High sun exposure — astaxanthin provides internal UV-damage protection and reduces photooxidative stress markers',
        )],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 3,
        category: 'antioxidant',
        separateFrom: [],
        notes: [
          'Fat-soluble carotenoid — take with a meal containing healthy fats',
          'Build-up takes 4–6 weeks; does NOT replace sunscreen for prevention',
        ],
      }), LAYER);
    }

    // Ensure Vitamin C is present (collagen synthesis + antioxidant)
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
          'High sun exposure — Vitamin C is essential for collagen synthesis and quenching UV-induced free radicals',
        )],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 5,
        category: 'vitamin',
        separateFrom: [],
        notes: ['Take with food to reduce GI discomfort'],
      }), LAYER);
    } else {
      recs = addReason(recs, 'vitamin-c', LAYER,
        'High sun exposure — Vitamin C supports collagen synthesis and UV-induced oxidative stress protection');
    }
  }

  return recs;
}

// ─── ALCOHOL ──────────────────────────────────────────────────────────────────

function applyAlcoholModifications(
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] {
  if (quiz.alcoholConsumption === 'none' || quiz.alcoholConsumption === 'light') {
    return recs;
  }

  if (quiz.alcoholConsumption === 'moderate') {
    // Moderate: B vitamins + mild liver support
    if (!hasBVitaminCoverage(recs)) {
      recs = addOrModify(recs, makeRec({
        id: 'b-complex',
        supplementName: 'B-Complex',
        form: 'methylated-b-complex',
        dose: 1,
        doseUnit: 'serving',
        frequency: 'daily',
        timing: ['morning-with-food'],
        withFood: true,
        evidenceRating: 'Moderate',
        reasons: [makeReason(
          'Moderate alcohol consumption increases B-vitamin turnover and impairs folate recycling',
        )],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 4,
        category: 'vitamin',
        separateFrom: [],
        notes: ['Methylated forms preferred for superior bioavailability'],
      }), LAYER);
    } else {
      recs = addReason(recs, 'vitamin-b12', LAYER,
        'Moderate alcohol — increases B vitamin turnover');
    }

    // Mild magnesium boost
    const existingMg = findExistingRec(recs, 'magnesium-glycinate');
    if (existingMg && existingMg.dose < 350) {
      recs = modifyDose(recs, 'magnesium-glycinate',
        Math.min(existingMg.dose + 50, 350), LAYER,
        'Moderate alcohol use — slight magnesium depletion consideration');
    }

    // Milk thistle (low dose)
    if (!findExistingRec(recs, 'milk-thistle')) {
      recs = addOrModify(recs, makeRec({
        id: 'milk-thistle',
        supplementName: 'Milk Thistle (Silymarin)',
        form: 'silymarin-extract',
        dose: 150,
        doseUnit: 'mg',
        frequency: 'daily',
        timing: ['morning-with-food'],
        withFood: true,
        evidenceRating: 'Moderate',
        reasons: [makeReason(
          'Moderate alcohol consumption — low-dose milk thistle provides mild hepatoprotective support',
        )],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 3,
        category: 'herbal',
        separateFrom: [],
        notes: ['Silymarin extract standardised to 70–80% silymarin content'],
      }), LAYER);
    }

    return recs;
  }

  // Heavy alcohol ─────────────────────────────────────────────────────────────

  // Thiamine (B1): CRITICAL — prevents Wernicke's encephalopathy
  if (!findExistingRec(recs, 'thiamine-b1')) {
    recs = addOrModify(recs, makeRec({
      id: 'thiamine-b1',
      supplementName: 'Thiamine (Vitamin B1)',
      form: 'thiamine-hcl',
      dose: 100,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [makeReason(
        'Heavy alcohol consumption depletes thiamine — prolonged deficiency causes Wernicke\'s encephalopathy, a potentially irreversible neurological emergency',
        'Standard B-complex doses (1–2 mg) are inadequate for alcohol-related depletion; 100 mg therapeutic dose is indicated',
      )],
      warnings: ['CRITICAL: if experiencing confusion, eye movement problems, or unsteady gait, seek emergency medical care immediately (Wernicke\'s signs)'],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 9,
      category: 'vitamin',
      separateFrom: [],
      notes: ['Therapeutic dose — standard B-complex is insufficient for alcohol-related thiamine depletion'],
    }), LAYER);
  }

  // Folate: ensure adequate (400–800 mcg)
  const existingFolate = findExistingRec(recs, 'folate-5mthf');
  if (existingFolate) {
    if (existingFolate.dose < 400) {
      recs = modifyDose(recs, 'folate-5mthf', 400, LAYER,
        'Heavy alcohol impairs folate absorption and increases excretion');
    }
    recs = addReason(recs, 'folate-5mthf', LAYER,
      'Heavy alcohol impairs folate absorption and significantly increases urinary folate excretion');
  } else {
    recs = addOrModify(recs, makeRec({
      id: 'folate-5mthf',
      supplementName: 'Folate (5-MTHF)',
      form: '5-methyltetrahydrofolate',
      dose: 400,
      doseUnit: 'mcg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [makeReason(
        'Heavy alcohol impairs folate absorption and increases excretion — 5-MTHF is the bioactive form',
      )],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 7,
      category: 'vitamin',
      separateFrom: [],
      notes: ['Active methylfolate form — effective regardless of MTHFR status'],
    }), LAYER);
  }

  // Magnesium: increase by 100 mg
  const existingMgHeavy = findExistingRec(recs, 'magnesium-glycinate');
  if (existingMgHeavy) {
    recs = modifyDose(recs, 'magnesium-glycinate',
      existingMgHeavy.dose + 100, LAYER,
      'Heavy alcohol causes significant renal magnesium wasting');
    recs = addReason(recs, 'magnesium-glycinate', LAYER,
      'Heavy alcohol consumption causes significant magnesium depletion through increased renal excretion');
  }

  // Zinc: ensure 15–25 mg
  const existingZinc = findExistingRec(recs, 'zinc-picolinate');
  if (existingZinc) {
    if (existingZinc.dose < 15) {
      recs = modifyDose(recs, 'zinc-picolinate', 15, LAYER,
        'Heavy alcohol impairs zinc absorption and increases excretion');
    }
    recs = addReason(recs, 'zinc-picolinate', LAYER,
      'Heavy alcohol impairs zinc absorption');
  } else {
    recs = addOrModify(recs, makeRec({
      id: 'zinc-picolinate',
      supplementName: 'Zinc Picolinate',
      form: 'picolinate',
      dose: 15,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Moderate',
      reasons: [makeReason('Heavy alcohol impairs zinc absorption')],
      warnings: ['Do not exceed 40 mg/day'],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 5,
      category: 'mineral',
      separateFrom: ['calcium-citrate', 'iron-bisglycinate'],
      notes: ['Picolinate: best absorbed zinc chelate'],
    }), LAYER);
  }

  // NAC 1,200 mg: liver glutathione support
  const alcoholNACReason =
    'Heavy alcohol depletes glutathione — NAC replenishes the precursor cysteine, supporting liver detoxification pathways';
  const existingNAC = findExistingRec(recs, 'nac');
  if (!existingNAC) {
    recs = addOrModify(recs, makeRec({
      id: 'nac',
      supplementName: 'NAC (N-Acetyl Cysteine)',
      form: 'n-acetyl-cysteine',
      dose: 1200,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-empty'],
      withFood: false,
      evidenceRating: 'Moderate',
      reasons: [makeReason(alcoholNACReason)],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_WEEKDAYS,
      priority: 6,
      category: 'amino-acid',
      separateFrom: [],
      notes: ['Take 30 minutes before food — NAC is better absorbed on an empty stomach'],
    }), LAYER);
  } else {
    if (existingNAC.dose < 1200) {
      recs = modifyDose(recs, 'nac', 1200, LAYER, alcoholNACReason);
    }
    recs = addReason(recs, 'nac', LAYER, alcoholNACReason);
  }

  // Milk Thistle 300 mg
  if (!findExistingRec(recs, 'milk-thistle')) {
    recs = addOrModify(recs, makeRec({
      id: 'milk-thistle',
      supplementName: 'Milk Thistle (Silymarin)',
      form: 'silymarin-extract',
      dose: 300,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Moderate',
      reasons: [makeReason(
        'Heavy alcohol — milk thistle (silymarin) supports liver cell regeneration and inhibits hepatic inflammation',
      )],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 5,
      category: 'herbal',
      separateFrom: [],
      notes: ['Silymarin standardised extract — take with food for best absorption'],
    }), LAYER);
  } else {
    const mtExisting = findExistingRec(recs, 'milk-thistle')!;
    if (mtExisting.dose < 300) {
      recs = modifyDose(recs, 'milk-thistle', 300, LAYER,
        'Heavy alcohol — higher silymarin dose for hepatoprotective support');
    }
    recs = addReason(recs, 'milk-thistle', LAYER,
      'Heavy alcohol — milk thistle supports liver cell regeneration');
  }

  recs = appendNote(recs, 'thiamine-b1',
    'Reducing alcohol consumption is the most effective intervention for liver health. These supplements support but do not replace moderation.');

  return recs;
}

// ─── COMBINATION LOGIC ────────────────────────────────────────────────────────

function applyCombinationLogic(
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] {
  const isHighStress =
    quiz.stressLevel === 'high' || quiz.stressLevel === 'very-high';
  const isPoorSleep = quiz.sleepQuality === 'poor';
  const isAthlete =
    quiz.activityLevel === 'very-active' || quiz.activityLevel === 'athlete';

  // HIGH STRESS + POOR SLEEP: both ashwagandha (morning) and L-theanine (bedtime)
  if (isHighStress && isPoorSleep) {
    const hasAshwagandha = !!findExistingRec(recs, 'ashwagandha-ksm66');
    const hasTheanine = !!findExistingRec(recs, 'l-theanine');
    if (hasAshwagandha && hasTheanine) {
      recs = appendNote(recs, 'l-theanine',
        'Combined protocol: Ashwagandha in the morning addresses the daytime stress response; L-Theanine at bedtime supports evening wind-down and sleep onset');
    }
    if (isPoorSleep && !findExistingRec(recs, 'passionflower')) {
      recs = addOrModify(recs, makeRec({
        id: 'passionflower',
        supplementName: 'Passionflower',
        form: 'passionflower-extract',
        dose: 500,
        doseUnit: 'mg',
        frequency: 'daily',
        timing: ['bedtime'],
        withFood: false,
        evidenceRating: 'Moderate',
        reasons: [makeReason(
          'High stress + poor sleep — passionflower increases GABA levels; RCTs show improved sleep quality scores',
        )],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 4,
        category: 'herbal',
        separateFrom: [],
        notes: ['Take 30–60 minutes before bed'],
      }), LAYER);
    }
  }

  // ATHLETE + POOR SLEEP: single magnesium entry with high dose AND glycinate form
  if (isAthlete && isPoorSleep) {
    const mg = findExistingRec(recs, 'magnesium-glycinate');
    if (mg) {
      // Ensure dose is at least 400 mg (athlete need) with glycinate form (sleep need)
      if (mg.dose < 400) {
        recs = modifyDose(recs, 'magnesium-glycinate', 400, LAYER,
          'Athlete + poor sleep — 400 mg glycinate covers both sweat loss and sleep-quality needs');
      }
      if (mg.form !== 'glycinate') {
        recs = modifyForm(recs, 'magnesium-glycinate', 'glycinate', LAYER,
          'Glycinate form for athlete with poor sleep — calming properties for sleep onset');
      }
      recs = appendNote(recs, 'magnesium-glycinate',
        'Glycinate form serves double duty: replenishes exercise-related losses AND promotes deep sleep through GABA modulation');
    }
  }

  return recs;
}

// ─── LAYER 3 ENTRY POINT ──────────────────────────────────────────────────────

/**
 * Layer 3 — Lifestyle Modifications.
 *
 * Processes quiz lifestyle factors in this order:
 *   1. Smoking    — sets quiz.smokerFlag; Vitamin C boost, CoQ10, NAC
 *   2. Stress     — magnesium boost, ashwagandha, L-theanine, B-complex
 *   3. Sleep      — glycinate form, melatonin, glycine, L-theanine
 *   4. Activity   — creatine, higher omega-3, CoQ10, taurine, beta-alanine
 *   5. Sun        — Vitamin D dose tier, astaxanthin, Vitamin C
 *   6. Alcohol    — thiamine, folate, NAC 1,200 mg, milk thistle
 *   7. Combination — interaction notes + passionflower
 *
 * SIDE-EFFECT: mutates quiz.smokerFlag = true for current OR former smokers.
 * All downstream layers should check quiz.smokerFlag to block beta-carotene.
 */
export const layer3Lifestyle = (
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] => {
  recs = applySmokingModifications(quiz, recs);
  recs = applyStressModifications(quiz, recs);
  recs = applySleepModifications(quiz, recs);
  recs = applyActivityModifications(quiz, recs);
  recs = applySunExposureModifications(quiz, recs);
  recs = applyAlcoholModifications(quiz, recs);
  recs = applyCombinationLogic(quiz, recs);
  return recs;
};
