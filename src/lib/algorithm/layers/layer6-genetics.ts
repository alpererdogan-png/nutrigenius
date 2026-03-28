// ─────────────────────────────────────────────────────────────────────────────
// NutriGenius — Layer 6: Genetic Variants
//
// Modifies supplement FORMS and DOSES based on genetic variants.
// Only runs if quiz.geneticVariants is present.
//
// Design rules:
//   • Uses swapSupplement() to change IDs (e.g. folic-acid → folate-5mthf).
//   • Uses modifyForm() when the ID is stable but the molecular form changes.
//   • Uses modifyDose() when reducing or enforcing a minimum dose.
//   • Never uses addOrModify() directly for dose REDUCTIONS — addOrModify uses
//     Math.max, so reductions require modifyDose() instead.
//   • Each handler is idempotent and safe to call when the relevant supplement
//     was not previously added.
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
  modifyDose,
  modifyForm,
  addReason,
  removeRec,
} from './layer1-demographic';

// ─── LAYER CONSTANT ───────────────────────────────────────────────────────────

const LAYER: LayerName = 'genetics';

// ─── LOCAL HELPERS ────────────────────────────────────────────────────────────

function makeReason(reason: string, detail?: string): RecommendationReason {
  return { layer: LAYER, reason, ...(detail ? { detail } : {}) };
}

function makeSource(action: LayerSource['action']): LayerSource {
  return { layer: LAYER, action };
}

function makeRec(
  partial: Omit<Recommendation, 'sources'> & { sources?: LayerSource[] },
): Recommendation {
  return { sources: [makeSource('added')], ...partial };
}

/** Alias: add-or-merge a supplement (higher dose wins via addOrModify). */
const put = (recs: Recommendation[], rec: Recommendation): Recommendation[] =>
  addOrModify(recs, rec, LAYER);

/** Append a note string without duplicating. */
function addNote(recs: Recommendation[], id: string, note: string): Recommendation[] {
  return recs.map(r =>
    r.id === id && !r.notes.includes(note) ? { ...r, notes: [...r.notes, note] } : r,
  );
}

/** Append a warning string without duplicating. */
function addWarning(recs: Recommendation[], id: string, warning: string): Recommendation[] {
  return recs.map(r =>
    r.id === id && !r.warnings.includes(warning)
      ? { ...r, warnings: [...r.warnings, warning] }
      : r,
  );
}

/** Lift priority (never decreases via Math.max). */
function liftPriority(recs: Recommendation[], id: string, priority: number): Recommendation[] {
  return recs.map(r => (r.id === id ? { ...r, priority: Math.max(r.priority, priority) } : r));
}

/**
 * Move a supplement from one ID to another (e.g. folic-acid → folate-5mthf).
 * Captures the existing rec's dose/priority/etc, removes the old ID, and
 * calls put() with the new ID so addOrModify can merge if the target already
 * exists.
 */
function swapSupplement(
  recs: Recommendation[],
  fromId: string,
  toId: string,
  newForm: string,
  newSupplementName: string,
  newDose: number,
  reason: string,
): Recommendation[] {
  const existing = findExistingRec(recs, fromId);
  if (!existing) return recs;
  const dose = Math.max(existing.dose, newDose);
  let r = removeRec(recs, fromId, LAYER, reason);
  return put(r, makeRec({
    id: toId,
    supplementName: newSupplementName,
    form: newForm,
    dose,
    doseUnit: existing.doseUnit,
    frequency: existing.frequency,
    timing: existing.timing,
    withFood: existing.withFood,
    evidenceRating: existing.evidenceRating,
    reasons: [...existing.reasons, makeReason(reason)],
    warnings: existing.warnings,
    contraindications: existing.contraindications,
    cyclingPattern: existing.cyclingPattern,
    priority: existing.priority,
    category: existing.category,
    separateFrom: existing.separateFrom,
    notes: existing.notes,
  }));
}

// ─── MTHFR C677T + A1298C ────────────────────────────────────────────────────

function handleMTHFR(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const gv = quiz.geneticVariants;
  if (!gv) return recs;

  const c677t = gv.mthfrC677T ?? 'normal';
  const a1298c = gv.mthfrA1298C ?? 'normal';

  // Compound heterozygous (one copy of each) = treat as C677T homozygous
  const isCompoundHetero = c677t === 'heterozygous' && a1298c === 'heterozygous';

  let effective: 'normal' | 'heterozygous' | 'homozygous' = 'normal';
  if (isCompoundHetero || c677t === 'homozygous') {
    effective = 'homozygous';
  } else if (c677t === 'heterozygous' || a1298c === 'homozygous' || a1298c === 'heterozygous') {
    effective = 'heterozygous';
  }

  if (effective === 'normal') return recs;

  const reason = isCompoundHetero
    ? 'MTHFR compound heterozygous (C677T + A1298C) — significantly impaired folate metabolism, methylated forms essential'
    : effective === 'homozygous'
      ? 'MTHFR C677T homozygous — significantly impaired folate metabolism, methylated forms essential'
      : 'MTHFR C677T heterozygous — methylated forms recommended';

  const targetFolateDose = effective === 'homozygous' ? 1000 : 800;
  let r = recs;

  // Swap folic acid → methylfolate (5-MTHF)
  if (findExistingRec(r, 'folic-acid')) {
    r = swapSupplement(r, 'folic-acid', 'folate-5mthf',
      '5-methyltetrahydrofolate', 'Folate (5-MTHF)', targetFolateDose, reason);
  }

  // Ensure methylfolate is present at target dose
  const folate = findExistingRec(r, 'folate-5mthf');
  if (folate) {
    r = modifyForm(r, 'folate-5mthf', '5-methyltetrahydrofolate', LAYER, reason);
    if (folate.dose < targetFolateDose) {
      r = modifyDose(r, 'folate-5mthf', targetFolateDose, LAYER, reason);
    }
    r = addReason(r, 'folate-5mthf', LAYER, reason);
    r = liftPriority(r, 'folate-5mthf', effective === 'homozygous' ? 8 : 7);
  } else {
    r = put(r, makeRec({
      id: 'folate-5mthf', supplementName: 'Folate (5-MTHF)', form: '5-methyltetrahydrofolate',
      dose: targetFolateDose, doseUnit: 'mcg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason(reason)], warnings: [], contraindications: [],
      cyclingPattern: CYCLE_DAILY, priority: effective === 'homozygous' ? 8 : 7,
      category: 'vitamin', separateFrom: [], notes: [],
    }));
  }

  // Ensure B12 is methylcobalamin form
  const b12 = findExistingRec(r, 'vitamin-b12');
  if (b12) {
    r = modifyForm(r, 'vitamin-b12', 'methylcobalamin', LAYER, reason);
    if (effective === 'homozygous' && b12.dose < 1000) {
      r = modifyDose(r, 'vitamin-b12', 1000, LAYER, `${reason} — 1,000 mcg methylcobalamin as methylation co-factor`);
    }
    r = addReason(r, 'vitamin-b12', LAYER, reason);
  } else if (effective === 'homozygous') {
    r = put(r, makeRec({
      id: 'vitamin-b12', supplementName: 'Vitamin B12 (Methylcobalamin)', form: 'methylcobalamin',
      dose: 1000, doseUnit: 'mcg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason(`${reason} — methylcobalamin co-factor for homocysteine remethylation`)],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'vitamin', separateFrom: [], notes: [],
    }));
  }

  // Homozygous / compound: add TMG for additional methyl donor support
  if (effective === 'homozygous') {
    if (!findExistingRec(r, 'betaine-tmg')) {
      r = put(r, makeRec({
        id: 'betaine-tmg', supplementName: 'Betaine (TMG)', form: 'trimethylglycine',
        dose: 500, doseUnit: 'mg', frequency: 'daily',
        timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
        reasons: [makeReason(`${reason} — TMG provides alternative methyl donors to support impaired methylation cycle`)],
        warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
        category: 'compound', separateFrom: [], notes: [],
      }));
    } else {
      r = addReason(r, 'betaine-tmg', LAYER, `${reason} — TMG provides alternative methyl donors`);
    }
  }

  return r;
}

// ─── COMT VAL158MET ───────────────────────────────────────────────────────────

function handleCOMT(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const comt = quiz.geneticVariants?.comtVal158Met;
  if (!comt) return recs;

  let r = recs;

  if (comt === 'val-val') {
    // Fast COMT — methyl donors well tolerated
    const note = 'Fast COMT — methyl donors are well tolerated';
    if (findExistingRec(r, 'folate-5mthf')) r = addNote(r, 'folate-5mthf', note);
    if (findExistingRec(r, 'vitamin-b12'))  r = addNote(r, 'vitamin-b12',  note);
    return r;
  }

  if (comt === 'val-met') {
    // Intermediate — standard methylfolate generally fine, monitor high doses
    const note = 'Intermediate COMT — monitor for anxiety or irritability with high-dose methyl donors';
    if (findExistingRec(r, 'folate-5mthf')) r = addNote(r, 'folate-5mthf', note);
    if (findExistingRec(r, 'vitamin-b12'))  r = addNote(r, 'vitamin-b12',  note);
    return r;
  }

  // ── met-met (slow COMT) ───────────────────────────────────────────────────
  const reason = 'Slow COMT — high-dose methyl donors can cause anxiety, irritability, and insomnia. Non-methyl forms selected.';

  // Swap methylfolate → folinic acid
  if (findExistingRec(r, 'folate-5mthf')) {
    const folate = findExistingRec(r, 'folate-5mthf')!;
    r = swapSupplement(r, 'folate-5mthf', 'folinic-acid',
      'folinic-acid', 'Folinic Acid (Calcium Folinate)', Math.min(folate.dose, 800), reason);
  }

  // Swap methylcobalamin → hydroxocobalamin
  if (findExistingRec(r, 'vitamin-b12')) {
    r = modifyForm(r, 'vitamin-b12', 'hydroxocobalamin', LAYER, reason);
    r = addReason(r, 'vitamin-b12', LAYER, reason);
    r = addNote(r, 'vitamin-b12', 'Slow COMT — hydroxocobalamin preferred over methylcobalamin to avoid methyl donor excess');
    // Reduce high doses
    const b12 = findExistingRec(r, 'vitamin-b12')!;
    if (b12.dose > 1000) {
      r = modifyDose(r, 'vitamin-b12', 1000, LAYER, 'Slow COMT — limit B12 dose to avoid excess methyl donor load');
    }
  }

  // Limit or flag SAMe
  const same = findExistingRec(r, 'same');
  if (same) {
    if (same.dose > 200) {
      r = modifyDose(r, 'same', 100, LAYER, 'Slow COMT — SAMe significantly restricted; excess methylation can worsen anxiety and mood instability');
    }
    r = addWarning(r, 'same',
      'Slow COMT detected — SAMe may worsen anxiety, irritability, and insomnia. Maximum 100–200 mg. Use with caution or avoid entirely.');
    r = addReason(r, 'same', LAYER, reason);
  }

  // Add warning to any remaining methyl donor supplements
  const methylDonorIds = ['betaine-tmg', 'choline-bitartrate'];
  for (const id of methylDonorIds) {
    if (findExistingRec(r, id)) {
      r = addWarning(r, id,
        'Slow COMT — methyl donors may accumulate. Monitor for anxiety or mood changes; reduce dose if needed.');
    }
  }

  return r;
}

// ─── VDR (VITAMIN D RECEPTOR) ─────────────────────────────────────────────────

function handleVDR(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const vdr = quiz.geneticVariants?.vdr;
  if (!vdr) return recs;

  const hasVariant = vdr.taqI || vdr.bsmI || vdr.fokI;
  if (!hasVariant) return recs;

  const reason = 'VDR genetic variant — reduced receptor sensitivity; higher Vitamin D doses needed for the same biological effect';
  let r = recs;

  // Increase vitamin D dose by 1,000–2,000 IU
  const vitD = findExistingRec(r, 'vitamin-d3');
  if (vitD) {
    const boost = Math.min(vitD.dose + 1500, 4000); // add ~1,500 IU, cap at 4,000
    r = modifyDose(r, 'vitamin-d3', boost, LAYER, reason);
    r = addReason(r, 'vitamin-d3', LAYER, reason);
  } else {
    r = put(r, makeRec({
      id: 'vitamin-d3', supplementName: 'Vitamin D3', form: 'cholecalciferol',
      dose: 3000, doseUnit: 'IU', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason(`${reason} — 3,000 IU baseline to compensate for reduced receptor sensitivity`)],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'vitamin', separateFrom: [], notes: [],
    }));
  }

  // Ensure Vitamin K2 MK-7 200 mcg (directs calcium to bone, not arteries)
  if (!findExistingRec(r, 'vitamin-k2-mk7')) {
    r = put(r, makeRec({
      id: 'vitamin-k2-mk7', supplementName: 'Vitamin K2 (MK-7)', form: 'menaquinone-7',
      dose: 200, doseUnit: 'mcg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('VDR variant — K2 MK-7 directs calcium to bone when Vitamin D dose is increased')],
      warnings: ['Consult doctor if taking warfarin or anticoagulants — Vitamin K may affect clotting'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'vitamin', separateFrom: [], notes: [],
    }));
  } else {
    r = addReason(r, 'vitamin-k2-mk7', LAYER, 'VDR variant — K2 MK-7 pairs with increased Vitamin D dose to direct calcium appropriately');
  }

  return r;
}

// ─── APOE GENOTYPE ────────────────────────────────────────────────────────────

function handleAPOE(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const apoe = quiz.geneticVariants?.apoe;
  if (!apoe || apoe === 'e2-e2' || apoe === 'e2-e3' || apoe === 'e3-e3') return recs;

  const isE4E4 = apoe === 'e4-e4';
  const reason = 'Your APOE variant is associated with brain health considerations. These supplements support cognitive function and neuroprotection.';
  let r = recs;

  // Emphasize omega-3 DHA ≥1,000 mg for brain health
  const algaeId = findExistingRec(r, 'dha-algae') ? 'dha-algae' : 'omega-3-fish-oil';
  const omega3 = findExistingRec(r, algaeId);
  if (omega3) {
    if (omega3.dose < 1000) {
      r = modifyDose(r, algaeId, 1000, LAYER, `${reason} — DHA ≥1,000 mg supports brain membrane structure`);
    }
    r = addReason(r, algaeId, LAYER, `${reason} — DHA prioritised for brain health`);
    r = liftPriority(r, algaeId, isE4E4 ? 9 : 8);
  } else {
    r = put(r, makeRec({
      id: 'dha-algae', supplementName: 'Algae-Based DHA', form: 'algae-dha',
      dose: 1000, doseUnit: 'mg', frequency: 'daily',
      timing: ['midday'], withFood: true, evidenceRating: 'Emerging',
      reasons: [makeReason(`${reason} — DHA is the primary structural fatty acid in brain membranes`)],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY,
      priority: isE4E4 ? 9 : 8,
      category: 'omega-fatty-acid', separateFrom: [],
      notes: ['APOE variant — DHA specifically supports brain health and cognitive function'],
    }));
  }

  // Curcumin 500 mg for neuroprotection
  if (!findExistingRec(r, 'curcumin')) {
    r = put(r, makeRec({
      id: 'curcumin', supplementName: 'Curcumin (High-Absorption)', form: 'phospholipid-complex',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['midday'], withFood: true, evidenceRating: 'Emerging',
      reasons: [makeReason(`${reason} — curcumin crosses the blood-brain barrier and supports neuroinflammation balance`)],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY,
      priority: isE4E4 ? 8 : 7,
      category: 'herbal', separateFrom: [],
      notes: [reason],
    }));
  } else {
    r = addReason(r, 'curcumin', LAYER, `${reason} — curcumin neuroprotection`);
    r = liftPriority(r, 'curcumin', isE4E4 ? 8 : 7);
  }

  // Phosphatidylserine 300 mg
  if (!findExistingRec(r, 'phosphatidylserine')) {
    r = put(r, makeRec({
      id: 'phosphatidylserine', supplementName: 'Phosphatidylserine', form: 'soy-derived',
      dose: 300, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Emerging',
      reasons: [makeReason(`${reason} — phosphatidylserine supports neuronal membrane integrity and cognitive function`)],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY,
      priority: isE4E4 ? 8 : 7,
      category: 'compound', separateFrom: [],
      notes: [reason],
    }));
  }

  // ε4/ε4 additional supplements
  if (isE4E4) {
    // Vitamin E (mixed tocopherols) 400 IU
    if (!findExistingRec(r, 'vitamin-e-mixed-tocopherols')) {
      r = put(r, makeRec({
        id: 'vitamin-e-mixed-tocopherols', supplementName: 'Vitamin E (Mixed Tocopherols)', form: 'mixed-tocopherols',
        dose: 400, doseUnit: 'IU', frequency: 'daily',
        timing: ['morning-with-food'], withFood: true, evidenceRating: 'Emerging',
        reasons: [makeReason(`${reason} — mixed tocopherols provide neuroprotective antioxidant support`)],
        warnings: ['Use mixed tocopherols (not synthetic dl-alpha-tocopherol alone)'],
        contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
        category: 'vitamin', separateFrom: [], notes: [reason],
      }));
    }

    // Lion's Mane 1,000 mg
    if (!findExistingRec(r, 'lions-mane')) {
      r = put(r, makeRec({
        id: 'lions-mane', supplementName: "Lion's Mane Mushroom", form: 'dual-extract',
        dose: 1000, doseUnit: 'mg', frequency: 'daily',
        timing: ['morning-with-food'], withFood: true, evidenceRating: 'Emerging',
        reasons: [makeReason(`${reason} — Lion's Mane stimulates nerve growth factor (NGF) synthesis`)],
        warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
        category: 'herbal', separateFrom: [],
        notes: [reason, 'Consider regular cognitive health monitoring with your doctor'],
      }));
    } else {
      r = addNote(r, 'lions-mane', 'Consider regular cognitive health monitoring with your doctor');
    }

    // Ensure DHA priority is highest
    r = liftPriority(r, algaeId, 9);
    r = liftPriority(r, 'dha-algae', 9);
  }

  return r;
}

// ─── FUT2 (SECRETOR STATUS) ───────────────────────────────────────────────────

function handleFUT2(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const fut2 = quiz.geneticVariants?.fut2;
  if (!fut2 || fut2 === 'secretor') return recs;

  const reason = 'FUT2 non-secretor — reduced B12 absorption through the gut. Sublingual delivery bypasses this limitation.';
  let r = recs;

  const b12 = findExistingRec(r, 'vitamin-b12');
  if (b12) {
    r = modifyForm(r, 'vitamin-b12', 'sublingual-methylcobalamin', LAYER, reason);
    if (b12.dose < 1000) {
      r = modifyDose(r, 'vitamin-b12', 1000, LAYER, `${reason} — higher dose compensates for reduced intrinsic factor absorption`);
    }
    r = addReason(r, 'vitamin-b12', LAYER, reason);
    r = addNote(r, 'vitamin-b12', 'FUT2 non-secretor — use sublingual form, allow to dissolve under the tongue for direct absorption');
  } else {
    r = put(r, makeRec({
      id: 'vitamin-b12', supplementName: 'Vitamin B12 (Sublingual Methylcobalamin)', form: 'sublingual-methylcobalamin',
      dose: 1000, doseUnit: 'mcg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: false, evidenceRating: 'Strong',
      reasons: [makeReason(reason)],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'vitamin', separateFrom: [],
      notes: ['FUT2 non-secretor — use sublingual form, allow to dissolve under the tongue for direct absorption'],
    }));
  }

  return r;
}

// ─── CYP1A2 (CAFFEINE METABOLISM) ────────────────────────────────────────────

function handleCYP1A2(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const cyp1a2 = quiz.geneticVariants?.cyp1a2;
  if (!cyp1a2) return recs;

  let r = recs;

  if (cyp1a2 === 'fast') {
    const note = 'Fast caffeine metabolizer — caffeine clears quickly; caffeine-containing supplements are well tolerated';
    if (findExistingRec(r, 'green-tea-extract')) r = addNote(r, 'green-tea-extract', note);
    if (findExistingRec(r, 'egcg'))              r = addNote(r, 'egcg',              note);
    return r;
  }

  // Slow CYP1A2 — caffeine accumulates
  const caffeineWarning = 'Slow caffeine metabolizer — this supplement contains caffeine. Take before noon to avoid disrupting sleep.';
  const morningNote = 'Slow caffeine metabolizer — take stimulating supplements (B vitamins, CoQ10, rhodiola) in the morning only. Avoid caffeine-containing supplements after noon.';

  const caffeineIds = ['green-tea-extract', 'egcg', 'guarana'];
  for (const id of caffeineIds) {
    if (findExistingRec(r, id)) {
      r = addWarning(r, id, caffeineWarning);
      r = addNote(r, id, 'Slow CYP1A2 — consider switching to a decaffeinated/standardised-extract form to avoid caffeine accumulation');
    }
  }

  // Add morning-timing note to stimulating supplements
  const stimulatingIds = ['coq10-ubiquinol', 'rhodiola-rosea', 'vitamin-b12'];
  for (const id of stimulatingIds) {
    if (findExistingRec(r, id)) {
      r = addNote(r, id, morningNote);
    }
  }

  return r;
}

// ─── CBS (CYSTATHIONINE BETA-SYNTHASE) ────────────────────────────────────────

function handleCBS(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const cbs = quiz.geneticVariants?.cbs;
  if (!cbs || cbs === 'normal') return recs;

  const note = 'CBS upregulation detected — monitor for sensitivity to sulfur supplements. Start at lower doses.';
  let r = recs;

  // Reduce NAC from 1,200 mg to 600 mg (one dose instead of two)
  const nac = findExistingRec(r, 'nac');
  if (nac && nac.dose > 600) {
    r = modifyDose(r, 'nac', 600, LAYER,
      'CBS upregulation — reduce NAC to avoid excess sulfur metabolite accumulation');
    r = addNote(r, 'nac', note);
  } else if (nac) {
    r = addNote(r, 'nac', note);
  }

  // Add note to other sulfur-containing supplements
  const sulfurIds = ['msm', 'taurine', 'ala', 'glutathione-liposomal', 'alpha-lipoic-acid'];
  for (const id of sulfurIds) {
    if (findExistingRec(r, id)) {
      r = addNote(r, id, note);
      r = addWarning(r, id,
        'CBS upregulation — this supplement is sulfur-containing. Start at half the standard dose and titrate up slowly.');
    }
  }

  return r;
}

// ─── BCMO1 (BETA-CAROTENE CONVERSION) ────────────────────────────────────────

function handleBCMO1(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const bcmo1 = quiz.geneticVariants?.bcmo1;
  if (!bcmo1 || bcmo1 === 'normal') return recs;

  const reason = 'BCMO1 variant — reduced ability to convert beta-carotene to active Vitamin A. Preformed retinol is more effective.';
  const veganNote = 'BCMO1 poor converter + vegan diet — getting adequate Vitamin A from plant sources is difficult. Consider algae-based retinol or regular monitoring of Vitamin A status.';
  let r = recs;

  // Beta-carotene supplement → swap to retinol
  const betaCarotene = findExistingRec(r, 'beta-carotene');
  if (betaCarotene) {
    r = swapSupplement(r, 'beta-carotene', 'vitamin-a-retinol',
      'retinyl-palmitate', 'Vitamin A (Retinol)', betaCarotene.dose, reason);
    r = addNote(r, 'vitamin-a-retinol', reason);
  }

  // Generic vitamin A supplement — switch to retinol form
  const vitA = findExistingRec(r, 'vitamin-a');
  if (vitA) {
    r = modifyForm(r, 'vitamin-a', 'retinyl-palmitate', LAYER, reason);
    r = addReason(r, 'vitamin-a', LAYER, reason);
    r = addNote(r, 'vitamin-a', reason);
  }

  // Add note to multivitamins (if present) about beta-carotene content
  if (findExistingRec(r, 'multivitamin')) {
    r = addNote(r, 'multivitamin',
      `${reason} When choosing a multivitamin, select one using preformed retinol (Vitamin A) rather than beta-carotene.`);
  }

  // Vegan-specific warning
  if (quiz.dietaryPattern === 'vegan') {
    // Add note to any relevant supplement or create informational note
    for (const id of ['vitamin-a-retinol', 'vitamin-a', 'multivitamin', 'folate-5mthf']) {
      if (findExistingRec(r, id)) {
        r = addNote(r, id, veganNote);
        break; // Add to first found supplement only
      }
    }
  }

  return r;
}

// ─── FADS1/FADS2 (FATTY ACID DESATURASE) ──────────────────────────────────────

function handleFADS(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const fads = quiz.geneticVariants?.fads;
  if (!fads) return recs;

  const reason = 'FADS1/FADS2 variant — reduced conversion of plant omega-3 (ALA) to EPA/DHA. Direct supplementation is especially important.';
  const veganNote = 'Your genetic profile shows reduced conversion of plant omega-3 (ALA) to EPA/DHA. Direct supplementation with algae-based EPA/DHA is especially important.';
  let r = recs;

  const omega3Id = findExistingRec(r, 'dha-algae') ? 'dha-algae' : 'omega-3-fish-oil';
  const omega3 = findExistingRec(r, omega3Id);
  const boost = 500;

  if (omega3) {
    const newDose = omega3.dose + boost;
    r = modifyDose(r, omega3Id, newDose, LAYER,
      `${reason} — increasing EPA/DHA by ${boost} mg to compensate for impaired ALA conversion`);
    r = addReason(r, omega3Id, LAYER, reason);
    if (quiz.dietaryPattern === 'vegan') {
      r = addNote(r, omega3Id, veganNote);
    }
  } else {
    r = put(r, makeRec({
      id: quiz.dietaryPattern === 'vegan' ? 'dha-algae' : 'omega-3-fish-oil',
      supplementName: quiz.dietaryPattern === 'vegan' ? 'Algae-Based DHA/EPA' : 'Omega-3 Fish Oil',
      form: quiz.dietaryPattern === 'vegan' ? 'algae-dha' : 'fish-oil',
      dose: 1500, doseUnit: 'mg', frequency: 'daily',
      timing: ['midday'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason(reason)],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'omega-fatty-acid', separateFrom: [],
      notes: [quiz.dietaryPattern === 'vegan' ? veganNote : reason],
    }));
  }

  return r;
}

// ─── HFE (HEMOCHROMATOSIS GENE) ───────────────────────────────────────────────

function handleHFE(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const hfe = quiz.geneticVariants?.hfe;
  if (!hfe) return recs;

  const hasVariant = hfe.c282y || hfe.h63d;
  if (!hasVariant) return recs;

  const variantName = hfe.c282y ? 'C282Y' : 'H63D';
  const reason = `HFE ${variantName} variant detected — increased iron absorption risk. Do NOT supplement iron without hematologist guidance. Consider regular ferritin monitoring.`;
  let r = recs;

  const ironIds = ['iron-bisglycinate', 'iron-sulfate', 'iron-gluconate', 'iron-fumerate'];
  for (const id of ironIds) {
    if (findExistingRec(r, id)) {
      r = removeRec(r, id, LAYER, reason);
    }
  }

  return r;
}

// ─── SOD2 (SUPEROXIDE DISMUTASE) ──────────────────────────────────────────────

function handleSOD2(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const sod2 = quiz.geneticVariants?.sod2;
  if (!sod2 || sod2 === 'val-val') return recs;

  const reason = 'SOD2 Val/Ala variant — mitochondrial superoxide dismutase may be less efficient; additional antioxidant support may be beneficial';
  let r = recs;

  // CoQ10 Ubiquinol
  if (!findExistingRec(r, 'coq10-ubiquinol')) {
    r = put(r, makeRec({
      id: 'coq10-ubiquinol', supplementName: 'CoQ10 (Ubiquinol)', form: 'ubiquinol',
      dose: 200, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason(`${reason} — CoQ10 supports mitochondrial electron transport and reduces oxidative stress`)],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 6,
      category: 'antioxidant', separateFrom: [], notes: [],
    }));
  } else {
    r = addReason(r, 'coq10-ubiquinol', LAYER, reason);
  }

  // NAC or Glutathione (antioxidant replenishment)
  if (!findExistingRec(r, 'nac') && !findExistingRec(r, 'glutathione-liposomal')) {
    r = put(r, makeRec({
      id: 'nac', supplementName: 'N-Acetyl Cysteine (NAC)', form: 'nac',
      dose: 600, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason(`${reason} — NAC replenishes glutathione, a primary cellular antioxidant`)],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 6,
      category: 'amino-acid', separateFrom: [], notes: [],
    }));
  } else {
    if (findExistingRec(r, 'nac'))
      r = addReason(r, 'nac', LAYER, reason);
    if (findExistingRec(r, 'glutathione-liposomal'))
      r = addReason(r, 'glutathione-liposomal', LAYER, reason);
  }

  // Vitamin C
  if (!findExistingRec(r, 'vitamin-c')) {
    r = put(r, makeRec({
      id: 'vitamin-c', supplementName: 'Vitamin C', form: 'ascorbic-acid',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason(`${reason} — Vitamin C is a key water-soluble antioxidant and recycler of Vitamin E`)],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 6,
      category: 'vitamin', separateFrom: [], notes: [],
    }));
  } else {
    r = addReason(r, 'vitamin-c', LAYER, reason);
  }

  // Vitamin E
  if (!findExistingRec(r, 'vitamin-e-mixed-tocopherols')) {
    r = put(r, makeRec({
      id: 'vitamin-e-mixed-tocopherols', supplementName: 'Vitamin E (Mixed Tocopherols)', form: 'mixed-tocopherols',
      dose: 200, doseUnit: 'IU', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason(`${reason} — Vitamin E (mixed tocopherols) provides fat-soluble membrane antioxidant protection`)],
      warnings: ['Use mixed tocopherols form, not synthetic dl-alpha-tocopherol alone'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'vitamin', separateFrom: [], notes: [],
    }));
  } else {
    r = addReason(r, 'vitamin-e-mixed-tocopherols', LAYER, reason);
  }

  return r;
}

// ─── PEMT (PHOSPHATIDYLETHANOLAMINE N-METHYLTRANSFERASE) ─────────────────────

function handlePEMT(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const pemt = quiz.geneticVariants?.pemt;
  if (!pemt) return recs;

  const reason = 'PEMT variant — increased dietary choline requirement';
  const isPregnant = quiz.isPregnant;
  const targetDose = isPregnant ? 550 : 500;
  const pregnantDose = 750; // midpoint of 550–930 mg pregnancy range
  let r = recs;

  const choline = findExistingRec(r, 'choline-bitartrate');
  if (choline) {
    const minDose = isPregnant ? pregnantDose : targetDose;
    if (choline.dose < minDose) {
      r = modifyDose(r, 'choline-bitartrate', minDose, LAYER,
        `${reason} — ${isPregnant ? 'pregnancy + PEMT variant: increase choline to 550–930 mg range' : '450–550 mg choline to meet elevated requirement'}`);
    }
    r = addReason(r, 'choline-bitartrate', LAYER, reason);
    if (isPregnant) {
      r = addNote(r, 'choline-bitartrate',
        'PEMT variant + pregnancy — choline demand is significantly elevated. Target 550–930 mg/day from food + supplements combined.');
    }
  } else {
    r = put(r, makeRec({
      id: 'choline-bitartrate', supplementName: 'Choline Bitartrate', form: 'bitartrate',
      dose: isPregnant ? pregnantDose : targetDose, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason(reason)],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY,
      priority: isPregnant ? 9 : 7,
      category: 'compound', separateFrom: [],
      notes: isPregnant
        ? ['PEMT variant + pregnancy — choline demand is significantly elevated. Target 550–930 mg/day from food + supplements combined.']
        : ['PEMT variant — eggs, liver, and soy are the richest food sources of choline'],
    }));
  }

  return r;
}

// ─── TNF-α / IL-6 (PRO-INFLAMMATORY VARIANTS) ────────────────────────────────

function handleInflammation(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const gv = quiz.geneticVariants;
  if (!gv) return recs;

  const hasInflammVariant = gv.tnfAlpha || gv.il6;
  if (!hasInflammVariant) return recs;

  const variantLabel = [
    gv.tnfAlpha ? 'TNF-α' : null,
    gv.il6 ? 'IL-6' : null,
  ].filter(Boolean).join(' + ');

  const reason = `Genetic predisposition to heightened inflammatory response (${variantLabel}) — anti-inflammatory support prioritised`;
  let r = recs;

  // Ensure omega-3 at anti-inflammatory dose (≥2,000 mg)
  const omega3Id = findExistingRec(r, 'dha-algae') ? 'dha-algae' : 'omega-3-fish-oil';
  const omega3 = findExistingRec(r, omega3Id);
  if (omega3) {
    if (omega3.dose < 2000) {
      r = modifyDose(r, omega3Id, 2000, LAYER,
        `${reason} — 2,000 mg EPA+DHA reaches the anti-inflammatory threshold`);
    }
    r = addReason(r, omega3Id, LAYER, reason);
  } else {
    r = put(r, makeRec({
      id: 'omega-3-fish-oil', supplementName: 'Omega-3 Fish Oil', form: 'fish-oil',
      dose: 2000, doseUnit: 'mg', frequency: 'daily',
      timing: ['midday'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason(`${reason} — EPA+DHA 2,000 mg reduces inflammatory prostaglandins and cytokine signalling`)],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'omega-fatty-acid', separateFrom: [], notes: [],
    }));
  }

  // Ensure curcumin is present for any inflammatory condition
  if (!findExistingRec(r, 'curcumin')) {
    r = put(r, makeRec({
      id: 'curcumin', supplementName: 'Curcumin (High-Absorption)', form: 'phospholipid-complex',
      dose: 1000, doseUnit: 'mg', frequency: 'daily',
      timing: ['midday'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason(`${reason} — curcumin inhibits NF-κB and reduces pro-inflammatory cytokine expression`)],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'herbal', separateFrom: [], notes: [],
    }));
  } else {
    r = addReason(r, 'curcumin', LAYER, reason);
    r = liftPriority(r, 'curcumin', 7);
  }

  return r;
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function layer6Genetics(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!quiz.geneticVariants) return recs;

  let r = recs;

  // ── Methylation / Folate ────────────────────────────────────────────────────
  r = handleMTHFR(quiz, r);
  r = handleCOMT(quiz, r);

  // ── Micronutrient Receptors / Absorption ────────────────────────────────────
  r = handleVDR(quiz, r);
  r = handleFUT2(quiz, r);
  r = handleBCMO1(quiz, r);

  // ── Lipid / Fatty Acid ──────────────────────────────────────────────────────
  r = handleFADS(quiz, r);
  r = handleAPOE(quiz, r);

  // ── Metabolic / Safety ──────────────────────────────────────────────────────
  r = handleHFE(quiz, r);
  r = handleCBS(quiz, r);
  r = handleCYP1A2(quiz, r);

  // ── Antioxidant / Structural ────────────────────────────────────────────────
  r = handleSOD2(quiz, r);
  r = handlePEMT(quiz, r);

  // ── Inflammation ────────────────────────────────────────────────────────────
  r = handleInflammation(quiz, r);

  return r;
}
