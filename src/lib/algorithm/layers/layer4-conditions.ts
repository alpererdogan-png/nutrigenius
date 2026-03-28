// ─────────────────────────────────────────────────────────────────────────────
// NutriGenius — Layer 4: Health Conditions
//
// Receives the accumulated recommendation array from Layers 1–3 and applies
// condition-specific supplement protocols. Uses addOrModify() exclusively —
// never push() — to prevent duplicate IDs.
//
// Safety rules enforced here (non-exhaustive — safety layer re-checks):
//   • No SAMe or 5-HTP for serotonergic medication users
//   • No SAMe for bipolar disorder
//   • No ginkgo for epilepsy
//   • No beta-carotene for current/former smokers (smokerFlag)
//   • No echinacea for autoimmune conditions
//   • No iron for thalassemia
//   • No red yeast rice with statins
//   • No potassium with ACE inhibitors/ARBs
//   • Berberine warning with blood-sugar medications
//   • CKD: caution flags on potassium, magnesium, vitamin C, creatine, zinc
// ─────────────────────────────────────────────────────────────────────────────

import {
  Recommendation,
  QuizData,
  LayerName,
  LayerSource,
  RecommendationReason,
  CYCLE_DAILY,
  CYCLE_WEEKDAYS,
  CYCLE_ALTERNATE_DAY,
  CYCLE_6ON1OFF,
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

const LAYER: LayerName = 'conditions';

// ─── MEDICATION DETECTION SETS ───────────────────────────────────────────────

const SEROTONERGIC = new Set([
  'ssri', 'snri', 'maoi', 'tca',
  'fluoxetine', 'sertraline', 'paroxetine', 'citalopram', 'escitalopram',
  'fluvoxamine', 'venlafaxine', 'duloxetine', 'desvenlafaxine', 'levomilnacipran',
  'bupropion', 'mirtazapine', 'trazodone', 'vilazodone', 'vortioxetine',
  'amitriptyline', 'nortriptyline', 'imipramine', 'clomipramine', 'doxepin',
  'phenelzine', 'tranylcypromine', 'selegiline', 'moclobemide',
]);

const STATINS = new Set([
  'statin', 'atorvastatin', 'rosuvastatin', 'simvastatin', 'pravastatin',
  'lovastatin', 'fluvastatin', 'pitavastatin', 'cerivastatin',
]);

const ACE_ARBS = new Set([
  'ace-inhibitor', 'arb', 'acei',
  'lisinopril', 'enalapril', 'ramipril', 'captopril', 'perindopril',
  'fosinopril', 'quinapril', 'benazepril', 'trandolapril', 'moexipril',
  'losartan', 'valsartan', 'candesartan', 'irbesartan', 'olmesartan',
  'telmisartan', 'azilsartan', 'eprosartan',
]);

const BLOOD_SUGAR_MEDS = new Set([
  'metformin', 'insulin', 'glipizide', 'glimepiride', 'glyburide', 'glibenclamide',
  'sitagliptin', 'saxagliptin', 'alogliptin', 'linagliptin',
  'empagliflozin', 'dapagliflozin', 'canagliflozin', 'ertugliflozin',
  'semaglutide', 'liraglutide', 'exenatide', 'dulaglutide',
  'pioglitazone', 'rosiglitazone',
  'sulfonylurea', 'sglt2', 'glp1', 'tzd', 'dpp4',
  'acarbose', 'miglitol',
]);

const ANTICOAGULANTS = new Set([
  'warfarin', 'coumadin', 'acenocoumarol', 'phenprocoumon',
  'heparin', 'enoxaparin', 'dalteparin',
  'dabigatran', 'rivaroxaban', 'apixaban', 'edoxaban', 'betrixaban',
]);

const ANTICONVULSANTS = new Set([
  'phenytoin', 'fosphenytoin', 'carbamazepine', 'oxcarbazepine',
  'valproate', 'valproic-acid', 'divalproex',
  'lamotrigine', 'levetiracetam', 'brivaracetam',
  'gabapentin', 'pregabalin',
  'topiramate', 'zonisamide', 'lacosamide',
  'phenobarbital', 'primidone',
  'anticonvulsant', 'antiepileptic',
]);

const IMMUNOSUPPRESSANTS = new Set([
  'methotrexate', 'azathioprine', 'cyclosporine', 'tacrolimus',
  'mycophenolate', 'mycophenolic-acid', 'sirolimus', 'everolimus',
  'leflunomide', 'hydroxychloroquine', 'sulfasalazine',
  'immunosuppressant',
]);

const THYROID_MEDS = new Set([
  'levothyroxine', 'synthroid', 'euthyrox', 'tirosint',
  'liothyronine', 'cytomel', 'armour-thyroid', 'np-thyroid',
  'methimazole', 'carbimazole', 'propylthiouracil', 'ptu',
  't4', 't3', 'thyroid-medication',
]);

const LITHIUM_MEDS = new Set([
  'lithium', 'lithium-carbonate', 'lithium-citrate', 'eskalith', 'lithobid',
]);

const PPI_MEDS = new Set([
  'omeprazole', 'esomeprazole', 'lansoprazole', 'pantoprazole', 'rabeprazole',
  'dexlansoprazole', 'prilosec', 'nexium', 'prevacid', 'protonix', 'aciphex',
  'dexilant', 'ppi', 'proton-pump-inhibitor',
]);

// ─── LOCAL HELPERS ────────────────────────────────────────────────────────────

function makeReason(reason: string, detail?: string): RecommendationReason {
  return { layer: LAYER, reason, ...(detail ? { detail } : {}) };
}

function makeSource(action: LayerSource['action'], extra?: Partial<LayerSource>): LayerSource {
  return { layer: LAYER, action, ...extra };
}

function makeRec(
  partial: Omit<Recommendation, 'sources'> & { sources?: LayerSource[] },
): Recommendation {
  return { sources: [makeSource('added')], ...partial };
}

/** Alias for addOrModify — keeps condition handlers concise. */
const put = (recs: Recommendation[], rec: Recommendation) =>
  addOrModify(recs, rec, LAYER);

function takesAnyMed(quiz: QuizData, medSet: Set<string>): boolean {
  return quiz.medications.some(m => medSet.has(m.toLowerCase()));
}

function takesMed(quiz: QuizData, ...ids: string[]): boolean {
  return ids.some(id => quiz.medications.some(m => m.toLowerCase() === id.toLowerCase()));
}

function hasCond(quiz: QuizData, ...ids: string[]): boolean {
  return ids.some(id =>
    quiz.healthConditions.some(c => c.toLowerCase() === id.toLowerCase()),
  );
}

function hasAllergy(quiz: QuizData, ...allergens: string[]): boolean {
  return allergens.some(a => quiz.allergies.some(al => al.toLowerCase() === a.toLowerCase()));
}

// ─── DOMAIN HELPERS ───────────────────────────────────────────────────────────

function ensureVitD(
  recs: Recommendation[],
  minDose: number,
  reason: string,
  priority = 7,
): Recommendation[] {
  const ex = findExistingRec(recs, 'vitamin-d3');
  if (ex) {
    let r = addReason(recs, 'vitamin-d3', LAYER, reason);
    if (ex.dose < minDose) r = modifyDose(r, 'vitamin-d3', minDose, LAYER, reason);
    return r;
  }
  return put(recs, makeRec({
    id: 'vitamin-d3', supplementName: 'Vitamin D3', form: 'cholecalciferol',
    dose: minDose, doseUnit: 'IU', frequency: 'daily',
    timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
    reasons: [makeReason(reason)], warnings: [], contraindications: [],
    cyclingPattern: CYCLE_DAILY, priority, category: 'vitamin',
    separateFrom: [], notes: ['Fat-soluble — take with largest meal'],
  }));
}

function ensureOmega3(
  recs: Recommendation[],
  minDose: number,
  reason: string,
  priority = 6,
): Recommendation[] {
  const id = findExistingRec(recs, 'dha-algae') ? 'dha-algae' : 'omega-3-fish-oil';
  const ex = findExistingRec(recs, id);
  if (ex) {
    let r = addReason(recs, id, LAYER, reason);
    if (ex.dose < minDose) r = modifyDose(r, id, minDose, LAYER, reason);
    return r;
  }
  return put(recs, makeRec({
    id: 'omega-3-fish-oil', supplementName: 'Omega-3 Fish Oil', form: 'fish-oil',
    dose: minDose, doseUnit: 'mg', frequency: 'daily',
    timing: ['midday'], withFood: true, evidenceRating: 'Strong',
    reasons: [makeReason(reason)], warnings: [], contraindications: [],
    cyclingPattern: CYCLE_DAILY, priority, category: 'omega-fatty-acid',
    separateFrom: [], notes: ['Take with food to minimise fishy aftertaste'],
  }));
}

function ensureMg(
  recs: Recommendation[],
  minDose: number,
  reason: string,
  priority = 6,
): Recommendation[] {
  const ex = findExistingRec(recs, 'magnesium-glycinate');
  if (ex) {
    let r = addReason(recs, 'magnesium-glycinate', LAYER, reason);
    if (ex.dose < minDose) r = modifyDose(r, 'magnesium-glycinate', minDose, LAYER, reason);
    return r;
  }
  return put(recs, makeRec({
    id: 'magnesium-glycinate', supplementName: 'Magnesium Glycinate', form: 'glycinate',
    dose: minDose, doseUnit: 'mg', frequency: 'daily',
    timing: ['bedtime'], withFood: false, evidenceRating: 'Strong',
    reasons: [makeReason(reason)], warnings: [], contraindications: [],
    cyclingPattern: CYCLE_DAILY, priority, category: 'mineral',
    separateFrom: [], notes: ['Glycinate form is highly bioavailable and gentle on the stomach'],
  }));
}

function ensureFolate(
  recs: Recommendation[],
  minDose: number,
  reason: string,
  priority = 7,
): Recommendation[] {
  const ex = findExistingRec(recs, 'folate-5mthf');
  if (ex) {
    let r = addReason(recs, 'folate-5mthf', LAYER, reason);
    if (ex.dose < minDose) r = modifyDose(r, 'folate-5mthf', minDose, LAYER, reason);
    return r;
  }
  return put(recs, makeRec({
    id: 'folate-5mthf', supplementName: 'Folate (5-MTHF)', form: '5-methyltetrahydrofolate',
    dose: minDose, doseUnit: 'mcg', frequency: 'daily',
    timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
    reasons: [makeReason(reason)], warnings: [], contraindications: [],
    cyclingPattern: CYCLE_DAILY, priority, category: 'vitamin',
    separateFrom: [], notes: ['Active methylfolate form — effective even with MTHFR variants'],
  }));
}

function ensureZinc(
  recs: Recommendation[],
  minDose: number,
  reason: string,
  priority = 7,
): Recommendation[] {
  const zincIds = ['zinc-picolinate', 'zinc-sulfate', 'zinc-bisglycinate', 'zinc-gluconate', 'zinc-carnosine'];
  const ex = zincIds.map(id => findExistingRec(recs, id)).find(Boolean);
  if (ex) {
    let r = addReason(recs, ex.id, LAYER, reason);
    if (ex.dose < minDose) r = modifyDose(r, ex.id, minDose, LAYER, reason);
    return r;
  }
  return put(recs, makeRec({
    id: 'zinc-picolinate', supplementName: 'Zinc Picolinate', form: 'picolinate',
    dose: minDose, doseUnit: 'mg', frequency: 'daily',
    timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
    reasons: [makeReason(reason)], warnings: [], contraindications: [],
    cyclingPattern: CYCLE_DAILY, priority, category: 'mineral',
    separateFrom: ['iron-bisglycinate'], notes: ['Picolinate form for bioavailability'],
  }));
}

// ─── POST-PROCESSING ──────────────────────────────────────────────────────────

/**
 * If total zinc across all supplements exceeds 25 mg/day, add copper 2 mg
 * to prevent copper deficiency (zinc blocks copper absorption).
 */
function postProcessCopper(recs: Recommendation[]): Recommendation[] {
  const totalZinc = recs
    .filter(r => r.doseUnit === 'mg' && r.id.startsWith('zinc'))
    .reduce((sum, r) => sum + r.dose, 0);

  if (totalZinc < 25) return recs;

  return put(recs, makeRec({
    id: 'copper-glycinate',
    supplementName: 'Copper (Glycinate)',
    form: 'glycinate',
    dose: 2,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason(
      `Total zinc dose ${totalZinc} mg/day — copper 2 mg added to prevent copper deficiency`,
      'Zinc >25 mg/day competitively inhibits copper absorption via intestinal metallothionein',
    )],
    warnings: ['Do not exceed 10 mg copper/day'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 8,
    category: 'mineral',
    separateFrom: ['zinc-picolinate'],
    notes: ['Take 2+ hours apart from zinc for best absorption'],
  }));
}

/**
 * If user takes warfarin, add a prominent warning to vitamin K2
 * (and any other vitamin K sources) about INR interference.
 */
function postProcessWarfarinK(recs: Recommendation[], quiz: QuizData): Recommendation[] {
  if (!takesAnyMed(quiz, ANTICOAGULANTS)) return recs;

  const kIds = ['vitamin-k2', 'vitamin-k2-mk7', 'vitamin-k2-mk4'];
  let r = recs;
  for (const id of kIds) {
    if (findExistingRec(r, id)) {
      r = r.map(rec => {
        if (rec.id !== id) return rec;
        const warning = 'WARFARIN INTERACTION: Vitamin K2 can alter INR significantly — consult your anticoagulation clinic before use; do not start without medical supervision';
        if (rec.warnings.includes(warning)) return rec;
        return { ...rec, warnings: [...rec.warnings, warning] };
      });
    }
  }

  // Also warn on existing omega-3 at high doses (>2g can increase bleeding risk)
  const o3 = findExistingRec(r, 'omega-3-fish-oil') ?? findExistingRec(r, 'dha-algae');
  if (o3 && o3.dose >= 2000) {
    const w = 'High-dose omega-3 (≥2,000 mg) may increase bleeding risk with warfarin — monitor INR';
    if (!o3.warnings.includes(w)) {
      r = r.map(rec =>
        rec.id === o3.id ? { ...rec, warnings: [...rec.warnings, w] } : rec,
      );
    }
  }

  return r;
}

// ─── CONDITION HANDLERS ───────────────────────────────────────────────────────

// ── Mental Health ──────────────────────────────────────────────────────────────

function handleAnxiety(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'anxiety', 'generalized-anxiety-disorder', 'gad', 'social-anxiety')) return recs;

  let r = recs;

  // Magnesium glycinate — ensure form and dose
  const mg = findExistingRec(r, 'magnesium-glycinate');
  if (mg) {
    if (mg.form !== 'glycinate') r = modifyForm(r, 'magnesium-glycinate', 'glycinate', LAYER, 'Anxiety — glycinate form preferred for anxiolytic and sleep-supporting properties');
    if (mg.dose < 300) r = modifyDose(r, 'magnesium-glycinate', 300, LAYER, 'Anxiety — 300 mg glycinate supports GABA tone and HPA-axis regulation');
    r = addReason(r, 'magnesium-glycinate', LAYER, 'Anxiety — magnesium deficiency is associated with elevated cortisol and anxiety symptoms');
  } else {
    r = ensureMg(r, 300, 'Anxiety — magnesium glycinate supports GABA tone and reduces cortisol', 7);
  }

  // L-theanine
  r = put(r, makeRec({
    id: 'l-theanine',
    supplementName: 'L-Theanine',
    form: 'l-theanine',
    dose: 200,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['bedtime'],
    withFood: false,
    evidenceRating: 'Moderate',
    reasons: [makeReason('Anxiety — L-theanine promotes alpha-wave activity and reduces anxious arousal without sedation')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 6,
    category: 'amino-acid',
    separateFrom: [],
    notes: ['Can also be taken as needed during acute stress'],
  }));

  // Ashwagandha (if not already added by Layer 3 stress)
  if (!findExistingRec(r, 'ashwagandha-ksm66')) {
    r = put(r, makeRec({
      id: 'ashwagandha-ksm66',
      supplementName: 'Ashwagandha (KSM-66)',
      form: 'ksm-66-extract',
      dose: 600,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [makeReason('Anxiety — KSM-66 ashwagandha 600 mg reduces cortisol and GAD symptoms in multiple RCTs')],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_6ON1OFF,
      priority: 7,
      category: 'adaptogen',
      separateFrom: [],
      notes: ['KSM-66 is the most clinically studied ashwagandha extract'],
    }));
  } else {
    r = addReason(r, 'ashwagandha-ksm66', LAYER, 'Anxiety — ashwagandha reduces cortisol and GAD symptom severity');
  }

  return r;
}

function handleDepression(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'depression', 'major-depressive-disorder', 'mdd', 'dysthymia')) return recs;

  const serotonergic = takesAnyMed(quiz, SEROTONERGIC);
  let r = recs;

  // Omega-3 EPA focus
  r = ensureOmega3(r, 2000, 'Depression — EPA-rich omega-3 (≥2,000 mg) has antidepressant effect comparable to low-dose SSRI in mild-moderate depression', 7);

  // Vitamin D
  r = ensureVitD(r, 2000, 'Depression — vitamin D deficiency doubles depression risk; supplementation improves mood scores in deficient patients', 7);

  // Folate / methylfolate
  r = ensureFolate(r, 400, 'Depression — folate is required for serotonin and dopamine synthesis; deficiency is common in depression', 7);

  // Zinc
  if (!findExistingRec(r, 'zinc-picolinate')) {
    r = put(r, makeRec({
      id: 'zinc-picolinate',
      supplementName: 'Zinc Picolinate',
      form: 'picolinate',
      dose: 15,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Moderate',
      reasons: [makeReason('Depression — zinc modulates NMDA receptors; serum zinc is consistently low in depression; augments antidepressant response')],
      warnings: ['Do not exceed 40 mg/day'],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 6,
      category: 'mineral',
      separateFrom: ['calcium-citrate', 'iron-bisglycinate'],
      notes: [],
    }));
  } else {
    r = addReason(r, 'zinc-picolinate', LAYER, 'Depression — zinc augments antidepressant response and modulates NMDA receptors');
  }

  // SAMe — BLOCKED for serotonergic medication users and bipolar
  if (!serotonergic && !hasCond(quiz, 'bipolar', 'bipolar-disorder', 'bipolar-i', 'bipolar-ii')) {
    r = put(r, makeRec({
      id: 'same',
      supplementName: 'SAMe (S-Adenosyl Methionine)',
      form: 'same-tosylate',
      dose: 400,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-empty'],
      withFood: false,
      evidenceRating: 'Strong',
      reasons: [makeReason('Depression — SAMe is a methyl donor that supports serotonin, dopamine, and norepinephrine synthesis; meta-analyses support efficacy')],
      warnings: ['Do not combine with serotonergic medications — risk of serotonin syndrome'],
      contraindications: ['serotonergic-medications', 'bipolar-disorder'],
      cyclingPattern: CYCLE_DAILY,
      priority: 7,
      category: 'compound',
      separateFrom: [],
      notes: ['Start at 200 mg/day and titrate up after 1 week'],
    }));
  }

  // 5-HTP — BLOCKED for serotonergic medication users
  if (!serotonergic) {
    r = put(r, makeRec({
      id: '5-htp',
      supplementName: '5-HTP',
      form: '5-hydroxytryptophan',
      dose: 100,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['bedtime'],
      withFood: false,
      evidenceRating: 'Moderate',
      reasons: [makeReason('Depression — 5-HTP is the direct precursor to serotonin; improves mood in mild-moderate depression')],
      warnings: [
        'Do not combine with SSRIs, SNRIs, MAOIs, or other serotonergic agents — serotonin syndrome risk',
        'Start at 50 mg and titrate; discontinue if agitation occurs',
      ],
      contraindications: ['serotonergic-medications'],
      cyclingPattern: CYCLE_DAILY,
      priority: 6,
      category: 'amino-acid',
      separateFrom: [],
      notes: ['Take on an empty stomach for best CNS uptake'],
    }));
  }

  return r;
}

function handleBipolar(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'bipolar', 'bipolar-disorder', 'bipolar-i', 'bipolar-ii')) return recs;

  let r = recs;

  // Omega-3 — well-evidenced mood-stabilising adjunct
  r = ensureOmega3(r, 2000, 'Bipolar disorder — omega-3 (EPA+DHA) reduces depressive episode frequency; used as adjunctive therapy', 7);

  // Magnesium
  r = ensureMg(r, 400, 'Bipolar disorder — magnesium co-factor for NMDA modulation; depletion exacerbates mood cycling', 7);

  // Vitamin D
  r = ensureVitD(r, 2000, 'Bipolar disorder — vitamin D deficiency associated with worse mood outcomes', 6);

  // NAC — for depressive phase (1,200 mg twice daily = 2,400 mg/day)
  if (!findExistingRec(r, 'nac')) {
    r = put(r, makeRec({
      id: 'nac',
      supplementName: 'N-Acetyl Cysteine (NAC)',
      form: 'n-acetyl-cysteine',
      dose: 1200,
      doseUnit: 'mg',
      frequency: 'twice-daily',
      timing: ['morning-with-food', 'evening'],
      withFood: true,
      evidenceRating: 'Moderate',
      reasons: [makeReason('Bipolar disorder — NAC 2,400 mg/day reduces depressive symptoms via glutathione replenishment and glutamate modulation')],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_WEEKDAYS,
      priority: 6,
      category: 'amino-acid',
      separateFrom: [],
      notes: ['Evidence strongest for bipolar depression phase'],
    }));
  } else {
    r = addReason(r, 'nac', LAYER, 'Bipolar disorder — NAC reduces depressive episode severity');
  }

  // Note: SAMe is NOT added here — contraindicated (can trigger mania)
  return r;
}

function handleADHD(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'adhd', 'attention-deficit-hyperactivity-disorder', 'add')) return recs;

  let r = recs;

  r = ensureOmega3(r, 2000, 'ADHD — omega-3 supplementation (particularly EPA) reduces ADHD symptom scores; modest but consistent evidence', 7);
  r = ensureMg(r, 300, 'ADHD — magnesium deficiency is prevalent in ADHD; supplementation reduces hyperactivity', 6);

  if (!findExistingRec(r, 'zinc-picolinate')) {
    r = put(r, makeRec({
      id: 'zinc-picolinate',
      supplementName: 'Zinc Picolinate',
      form: 'picolinate',
      dose: 15,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Moderate',
      reasons: [makeReason('ADHD — zinc modulates dopamine transporter activity; deficiency worsens ADHD symptoms and reduces stimulant response')],
      warnings: ['Do not exceed 40 mg/day'],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 6,
      category: 'mineral',
      separateFrom: ['calcium-citrate', 'iron-bisglycinate'],
      notes: [],
    }));
  } else {
    r = addReason(r, 'zinc-picolinate', LAYER, 'ADHD — zinc modulates dopamine transporter activity');
  }

  // Iron — important cofactor for dopamine synthesis
  if (!findExistingRec(r, 'iron-bisglycinate')) {
    r = put(r, makeRec({
      id: 'iron-bisglycinate',
      supplementName: 'Iron (Bisglycinate)',
      form: 'bisglycinate',
      dose: 18,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-empty'],
      withFood: false,
      evidenceRating: 'Moderate',
      reasons: [makeReason('ADHD — iron is a cofactor for dopamine synthesis; low ferritin strongly correlates with ADHD severity')],
      warnings: ['Test ferritin before supplementing — excess iron is harmful; target ferritin >30 ng/mL'],
      contraindications: ['thalassemia', 'haemochromatosis'],
      cyclingPattern: CYCLE_ALTERNATE_DAY,
      priority: 6,
      category: 'mineral',
      separateFrom: ['calcium-citrate', 'zinc-picolinate'],
      notes: ['Bisglycinate form causes less GI distress than ferrous sulphate'],
    }));
  } else {
    r = addReason(r, 'iron-bisglycinate', LAYER, 'ADHD — iron is a cofactor for dopamine synthesis; low ferritin worsens ADHD severity');
  }

  return r;
}

// ── Endocrine ──────────────────────────────────────────────────────────────────

function handleHypothyroidism(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'hypothyroidism', 'subclinical-hypothyroidism', 'underactive-thyroid')) return recs;

  const isHashimotos = hasCond(quiz, 'hashimotos', 'hashimoto', 'hashimoto-thyroiditis', 'autoimmune-thyroiditis');
  let r = recs;

  // Selenium 200 mcg — essential for T4→T3 conversion
  r = put(r, makeRec({
    id: 'selenium',
    supplementName: 'Selenium',
    form: 'selenomethionine',
    dose: 200,
    doseUnit: 'mcg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason(
      'Hypothyroidism — selenium is a cofactor for deiodinase enzymes (T4→T3 conversion) and thyroid peroxidase protection',
      'Selenomethionine form has highest bioavailability',
    )],
    warnings: [
      'Do not exceed 400 mcg/day — selenium toxicity is possible',
      takesAnyMed(quiz, THYROID_MEDS)
        ? 'Separate levothyroxine by 4+ hours — selenium can impair T4 absorption'
        : '',
    ].filter(Boolean),
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 8,
    category: 'mineral',
    separateFrom: takesAnyMed(quiz, THYROID_MEDS) ? ['levothyroxine'] : [],
    notes: [
      takesAnyMed(quiz, THYROID_MEDS)
        ? 'Separate from levothyroxine (Synthroid) by at least 4 hours'
        : 'If on thyroid medication, separate by 4+ hours',
    ],
  }));

  // Vitamin D
  r = ensureVitD(r, 2000, 'Hypothyroidism — vitamin D receptor signalling affects thyroid hormone sensitivity; deficiency common in hypothyroid patients', 7);

  // Magnesium
  r = ensureMg(r, 300, 'Hypothyroidism — magnesium required for TSH synthesis and thyroid hormone production', 6);

  // Zinc — required for thyroid hormone synthesis
  if (!findExistingRec(r, 'zinc-picolinate')) {
    r = put(r, makeRec({
      id: 'zinc-picolinate',
      supplementName: 'Zinc Picolinate',
      form: 'picolinate',
      dose: 15,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Moderate',
      reasons: [makeReason('Hypothyroidism — zinc is required for thyroid hormone synthesis and T3 receptor binding')],
      warnings: ['Do not exceed 40 mg/day'],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 6,
      category: 'mineral',
      separateFrom: ['calcium-citrate', 'iron-bisglycinate'],
      notes: [],
    }));
  } else {
    r = addReason(r, 'zinc-picolinate', LAYER, 'Hypothyroidism — zinc required for thyroid hormone synthesis and T3 receptor binding');
  }

  // Iodine — ONLY if NOT Hashimotos (excess iodine triggers Hashimotos flares)
  if (!isHashimotos) {
    const iodineEx = findExistingRec(r, 'iodine');
    if (iodineEx) {
      r = addReason(r, 'iodine', LAYER, 'Hypothyroidism — adequate iodine is required for thyroid hormone synthesis');
    }
    // Do not add if not already present — iodine supplementation in hypothyroidism requires medical supervision
  }

  return r;
}

function handleHashimotos(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'hashimotos', 'hashimoto', 'hashimoto-thyroiditis', 'autoimmune-thyroiditis')) return recs;

  let r = recs;

  // Remove iodine if present — high iodine triggers TPO antibody production in Hashimotos
  if (findExistingRec(r, 'iodine')) {
    r = removeRec(r, 'iodine', LAYER, 'Hashimotos thyroiditis — excess iodine increases TPO antibody production and worsens autoimmune inflammation');
  }

  // Selenium 200 mcg — reduces TPO antibodies
  r = put(r, makeRec({
    id: 'selenium',
    supplementName: 'Selenium',
    form: 'selenomethionine',
    dose: 200,
    doseUnit: 'mcg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason(
      'Hashimotos thyroiditis — selenium reduces TPO antibody levels and protects thyroid from oxidative damage in multiple RCTs',
    )],
    warnings: [
      'Do not exceed 400 mcg/day',
      takesAnyMed(quiz, THYROID_MEDS)
        ? 'Separate from levothyroxine by 4+ hours'
        : '',
    ].filter(Boolean),
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 8,
    category: 'mineral',
    separateFrom: takesAnyMed(quiz, THYROID_MEDS) ? ['levothyroxine'] : [],
    notes: ['Avoid separate iodine supplementation — can exacerbate Hashimotos flares'],
  }));

  // Vitamin D — strongly associated with Hashimotos severity
  r = ensureVitD(r, 3000, 'Hashimotos — vitamin D deficiency correlates with TPO antibody levels; supplementation reduces disease activity', 8);

  // Omega-3 — anti-inflammatory
  r = ensureOmega3(r, 2000, 'Hashimotos — omega-3 reduces thyroidal inflammation and autoimmune activity', 7);

  // Magnesium
  r = ensureMg(r, 300, 'Hashimotos — magnesium supports thyroid hormone production and reduces inflammatory signalling', 6);

  return r;
}

function handleDiabetesType2(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'type-2-diabetes', 'type2-diabetes', 't2d', 'diabetes', 'diabetes-mellitus')) return recs;

  const onBloodSugarMeds = takesAnyMed(quiz, BLOOD_SUGAR_MEDS);
  let r = recs;

  // Berberine — blood-sugar-lowering, WARNING if on blood sugar meds
  r = put(r, makeRec({
    id: 'berberine',
    supplementName: 'Berberine',
    form: 'berberine-hcl',
    dose: 500,
    doseUnit: 'mg',
    frequency: 'three-times-daily',
    timing: ['morning-with-food', 'midday', 'evening'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason(
      'Type 2 diabetes — berberine activates AMPK, improves insulin sensitivity, and reduces HbA1c comparably to metformin in RCTs',
    )],
    warnings: onBloodSugarMeds
      ? [
          'BLOOD SUGAR INTERACTION: Berberine has additive hypoglycaemic effects with metformin and insulin — risk of hypoglycaemia; monitor blood glucose closely and consult your physician before adding',
        ]
      : ['Monitor blood glucose when starting — berberine can lower levels significantly'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 8,
    category: 'herbal',
    separateFrom: [],
    notes: ['Take immediately before meals; GI side effects (nausea, cramping) are common — start at 500 mg once daily and titrate'],
  }));

  // Alpha-lipoic acid
  r = put(r, makeRec({
    id: 'alpha-lipoic-acid',
    supplementName: 'Alpha-Lipoic Acid',
    form: 'r-ala',
    dose: 300,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-empty'],
    withFood: false,
    evidenceRating: 'Strong',
    reasons: [makeReason('Type 2 diabetes — R-ALA improves insulin sensitivity and reduces oxidative stress; reduces diabetic peripheral neuropathy symptoms')],
    warnings: onBloodSugarMeds
      ? ['May lower blood glucose — monitor when combining with diabetes medications']
      : [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 7,
    category: 'antioxidant',
    separateFrom: [],
    notes: ['R-ALA (not racemic) has superior bioavailability; take 30 minutes before eating'],
  }));

  // Chromium picolinate
  r = put(r, makeRec({
    id: 'chromium-picolinate',
    supplementName: 'Chromium Picolinate',
    form: 'picolinate',
    dose: 200,
    doseUnit: 'mcg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Moderate',
    reasons: [makeReason('Type 2 diabetes — chromium enhances insulin receptor sensitivity and glucose uptake; reduces fasting glucose and HbA1c')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 6,
    category: 'mineral',
    separateFrom: [],
    notes: [],
  }));

  // Magnesium — diabetics are frequently deficient
  r = ensureMg(r, 400, 'Type 2 diabetes — magnesium deficiency is prevalent in T2D; repletion improves insulin sensitivity and glycaemic control', 7);

  // Vitamin D
  r = ensureVitD(r, 2000, 'Type 2 diabetes — vitamin D deficiency is associated with insulin resistance and worse glycaemic control', 7);

  // B12 — metformin depletes B12
  if (takesMed(quiz, 'metformin')) {
    r = put(r, makeRec({
      id: 'vitamin-b12',
      supplementName: 'Vitamin B12',
      form: 'methylcobalamin',
      dose: 1000,
      doseUnit: 'mcg',
      frequency: 'daily',
      timing: ['morning-empty'],
      withFood: false,
      evidenceRating: 'Strong',
      reasons: [makeReason('Metformin use — metformin reduces intestinal B12 absorption by ~30%; 1,000 mcg/day repletion is recommended')],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 8,
      category: 'vitamin',
      separateFrom: [],
      notes: ['Methylcobalamin preferred; monitor B12 levels annually on metformin'],
    }));
  }

  return r;
}

function handlePCOS(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'pcos', 'polycystic-ovary-syndrome', 'polycystic-ovarian-syndrome')) return recs;

  let r = recs;

  // Myo-inositol + D-chiro-inositol at 40:1 ratio
  r = put(r, makeRec({
    id: 'myo-inositol',
    supplementName: 'Myo-Inositol',
    form: 'myo-inositol',
    dose: 4000,
    doseUnit: 'mg',
    frequency: 'twice-daily',
    timing: ['morning-with-food', 'evening'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason(
      'PCOS — myo-inositol at 40:1 ratio with D-chiro-inositol restores ovarian insulin sensitivity, reduces androgens, and improves menstrual regularity',
      'Myo-inositol 4,000 mg + D-chiro-inositol 100 mg (40:1) twice daily mirrors the physiological ovarian ratio',
    )],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 8,
    category: 'compound',
    separateFrom: [],
    notes: ['Take with D-chiro-inositol 100 mg to maintain the physiological 40:1 ovarian ratio'],
  }));

  r = put(r, makeRec({
    id: 'd-chiro-inositol',
    supplementName: 'D-Chiro-Inositol',
    form: 'd-chiro-inositol',
    dose: 100,
    doseUnit: 'mg',
    frequency: 'twice-daily',
    timing: ['morning-with-food', 'evening'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason('PCOS — D-chiro-inositol 100 mg paired with myo-inositol 4,000 mg (40:1) optimises ovarian insulin signalling')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 8,
    category: 'compound',
    separateFrom: [],
    notes: ['Take with myo-inositol 4,000 mg; the 40:1 ratio is critical — excess D-chiro-inositol worsens oocyte quality'],
  }));

  // Vitamin D
  r = ensureVitD(r, 2000, 'PCOS — vitamin D deficiency is highly prevalent in PCOS; supplementation improves insulin resistance and menstrual regularity', 7);

  // Magnesium
  r = ensureMg(r, 300, 'PCOS — magnesium improves insulin sensitivity and reduces PCOS-associated inflammation', 6);

  // NAC — reduces androgens and improves insulin resistance
  if (!findExistingRec(r, 'nac')) {
    r = put(r, makeRec({
      id: 'nac',
      supplementName: 'N-Acetyl Cysteine (NAC)',
      form: 'n-acetyl-cysteine',
      dose: 600,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Moderate',
      reasons: [makeReason('PCOS — NAC reduces androgen levels, improves insulin sensitivity, and restores menstrual regularity comparably to metformin')],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_WEEKDAYS,
      priority: 6,
      category: 'amino-acid',
      separateFrom: [],
      notes: [],
    }));
  } else {
    r = addReason(r, 'nac', LAYER, 'PCOS — NAC reduces androgens and improves insulin sensitivity');
  }

  return r;
}

// ── Cardiovascular ────────────────────────────────────────────────────────────

function handleHypertension(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'hypertension', 'high-blood-pressure')) return recs;

  const onACEARB = takesAnyMed(quiz, ACE_ARBS);
  let r = recs;

  r = ensureMg(r, 400, 'Hypertension — magnesium acts as a natural calcium channel blocker; meta-analyses confirm 3–5 mmHg SBP reduction', 8);
  r = ensureOmega3(r, 2000, 'Hypertension — omega-3 (EPA+DHA ≥2 g/day) reduces SBP by 4 mmHg and DBP by 3 mmHg', 7);

  // CoQ10
  if (!findExistingRec(r, 'coq10-ubiquinol')) {
    r = put(r, makeRec({
      id: 'coq10-ubiquinol',
      supplementName: 'CoQ10 (Ubiquinol)',
      form: 'ubiquinol',
      dose: 100,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Moderate',
      reasons: [makeReason('Hypertension — CoQ10 deficiency associated with hypertension; supplementation reduces SBP ~11 mmHg in meta-analyses')],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 6,
      category: 'antioxidant',
      separateFrom: [],
      notes: ['Ubiquinol (reduced form) has superior absorption'],
    }));
  } else {
    r = addReason(r, 'coq10-ubiquinol', LAYER, 'Hypertension — CoQ10 deficiency contributes to elevated blood pressure');
  }

  // Potassium — BLOCKED if on ACE inhibitors/ARBs (hyperkalaemia risk)
  if (!onACEARB) {
    r = put(r, makeRec({
      id: 'potassium-citrate',
      supplementName: 'Potassium Citrate',
      form: 'citrate',
      dose: 300,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [makeReason('Hypertension — potassium supplementation reduces SBP by 3–5 mmHg; counteracts sodium-driven vasoconstriction')],
      warnings: ['Potassium supplements require medical supervision — do not self-supplement above 300 mg/day without guidance'],
      contraindications: ['ace-inhibitor', 'arb', 'ckd'],
      cyclingPattern: CYCLE_DAILY,
      priority: 7,
      category: 'mineral',
      separateFrom: [],
      notes: ['Dietary potassium (from vegetables/fruit) is preferred where possible'],
    }));
  }

  return r;
}

function handleHighCholesterol(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'hyperlipidemia', 'high-cholesterol', 'hypercholesterolaemia', 'dyslipidemia', 'dyslipidaemia')) return recs;

  const onStatins = takesAnyMed(quiz, STATINS);
  let r = recs;

  r = ensureOmega3(r, 2000, 'High cholesterol — omega-3 (≥2 g EPA+DHA) reduces triglycerides by 15–30% and has modest LDL-lowering effect', 7);

  // Red yeast rice — BLOCKED if on statins (contains natural lovastatin; doubles statin dose unpredictably)
  if (!onStatins) {
    r = put(r, makeRec({
      id: 'red-yeast-rice',
      supplementName: 'Red Yeast Rice',
      form: 'standardised-extract',
      dose: 600,
      doseUnit: 'mg',
      frequency: 'twice-daily',
      timing: ['morning-with-food', 'evening'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [makeReason('High cholesterol — red yeast rice contains natural monacolins (lovastatin) that inhibit HMG-CoA reductase; reduces LDL by 15–25%')],
      warnings: [
        'Contains natural lovastatin — do NOT combine with prescription statin medications',
        'Discontinue and consult physician if muscle pain or weakness occurs (myopathy risk)',
      ],
      contraindications: ['statin-medications', 'liver-disease', 'pregnancy'],
      cyclingPattern: CYCLE_DAILY,
      priority: 7,
      category: 'herbal',
      separateFrom: [],
      notes: ['Requires CoQ10 co-supplementation (100 mg) as monacolins deplete CoQ10'],
    }));

    // Add CoQ10 if red yeast rice is added
    if (!findExistingRec(r, 'coq10-ubiquinol')) {
      r = put(r, makeRec({
        id: 'coq10-ubiquinol',
        supplementName: 'CoQ10 (Ubiquinol)',
        form: 'ubiquinol',
        dose: 100,
        doseUnit: 'mg',
        frequency: 'daily',
        timing: ['morning-with-food'],
        withFood: true,
        evidenceRating: 'Strong',
        reasons: [makeReason('Red yeast rice use — monacolins inhibit the same pathway as statins, depleting CoQ10; supplementation prevents myopathy')],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 7,
        category: 'antioxidant',
        separateFrom: [],
        notes: [],
      }));
    } else {
      r = addReason(r, 'coq10-ubiquinol', LAYER, 'Red yeast rice use — monacolin-induced CoQ10 depletion prevention');
    }
  } else {
    // On statins — CoQ10 200 mg (statins deplete it)
    if (!findExistingRec(r, 'coq10-ubiquinol')) {
      r = put(r, makeRec({
        id: 'coq10-ubiquinol',
        supplementName: 'CoQ10 (Ubiquinol)',
        form: 'ubiquinol',
        dose: 200,
        doseUnit: 'mg',
        frequency: 'daily',
        timing: ['morning-with-food'],
        withFood: true,
        evidenceRating: 'Strong',
        reasons: [makeReason('Statin therapy — statins inhibit the mevalonate pathway, depleting endogenous CoQ10; 200 mg reduces myopathy risk and fatigue')],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 8,
        category: 'antioxidant',
        separateFrom: [],
        notes: ['Ubiquinol (reduced form) has superior absorption'],
      }));
    } else {
      r = addReason(r, 'coq10-ubiquinol', LAYER, 'Statin therapy — statins deplete CoQ10; supplementation reduces myopathy risk');
    }
  }

  return r;
}

// ── GI Conditions ─────────────────────────────────────────────────────────────

function handleIBS(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'ibs', 'irritable-bowel-syndrome', 'ibs-c', 'ibs-d', 'ibs-m')) return recs;

  let r = recs;

  r = put(r, makeRec({
    id: 'probiotic-blend',
    supplementName: 'Probiotic Blend',
    form: 'multi-strain',
    dose: 25,
    doseUnit: 'CFU',
    frequency: 'daily',
    timing: ['morning-empty'],
    withFood: false,
    evidenceRating: 'Strong',
    reasons: [makeReason('IBS — probiotics reduce pain, bloating, and stool irregularity in IBS; Lactobacillus and Bifidobacterium strains have strongest evidence')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 7,
    category: 'probiotic',
    separateFrom: [],
    notes: ['Look for strains: L. plantarum 299v, B. infantis 35624, or L. rhamnosus GG', 'Billion CFU unit'],
  }));

  r = put(r, makeRec({
    id: 'peppermint-oil',
    supplementName: 'Peppermint Oil (Enteric-Coated)',
    form: 'enteric-coated',
    dose: 180,
    doseUnit: 'mg',
    frequency: 'three-times-daily',
    timing: ['morning-empty', 'midday', 'evening'],
    withFood: false,
    evidenceRating: 'Strong',
    reasons: [makeReason('IBS — enteric-coated peppermint oil reduces abdominal pain and cramping in IBS via L-menthol smooth muscle relaxation')],
    warnings: ['Do not crush or chew — enteric coating is essential to prevent heartburn'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 7,
    category: 'herbal',
    separateFrom: [],
    notes: ['Enteric coating required for delivery to the colon; take 30–60 min before meals'],
  }));

  r = ensureMg(r, 300, 'IBS — magnesium has gentle osmotic laxative effect beneficial for IBS-C; glycinate form is gentler than oxide', 6);

  return r;
}

function handleCeliac(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'celiac', 'celiac-disease', 'coeliac', 'coeliac-disease')) return recs;

  let r = recs;

  r = ensureVitD(r, 2000, 'Coeliac disease — villous atrophy severely impairs vitamin D absorption; repletion is essential', 8);
  r = ensureMg(r, 300, 'Coeliac disease — magnesium malabsorption is nearly universal in active coeliac disease', 7);
  r = ensureFolate(r, 800, 'Coeliac disease — folate malabsorption due to duodenal villous atrophy; higher repletion dose required', 8);

  if (!findExistingRec(r, 'vitamin-b12')) {
    r = put(r, makeRec({
      id: 'vitamin-b12',
      supplementName: 'Vitamin B12',
      form: 'methylcobalamin',
      dose: 1000,
      doseUnit: 'mcg',
      frequency: 'daily',
      timing: ['morning-empty'],
      withFood: false,
      evidenceRating: 'Strong',
      reasons: [makeReason('Coeliac disease — terminal ileum damage impairs intrinsic-factor-dependent B12 absorption')],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 8,
      category: 'vitamin',
      separateFrom: [],
      notes: ['Sublingual methylcobalamin bypasses GI absorption — preferred in coeliac disease'],
    }));
  } else {
    r = addReason(r, 'vitamin-b12', LAYER, 'Coeliac disease — impaired B12 absorption due to terminal ileum involvement');
  }

  if (!findExistingRec(r, 'zinc-picolinate')) {
    r = put(r, makeRec({
      id: 'zinc-picolinate',
      supplementName: 'Zinc Picolinate',
      form: 'picolinate',
      dose: 15,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [makeReason('Coeliac disease — zinc is malabsorbed in coeliac disease; deficiency impairs immune function, wound healing, and enterocyte repair')],
      warnings: ['Do not exceed 40 mg/day'],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 7,
      category: 'mineral',
      separateFrom: ['calcium-citrate', 'iron-bisglycinate'],
      notes: [],
    }));
  } else {
    r = addReason(r, 'zinc-picolinate', LAYER, 'Coeliac disease — zinc malabsorption due to enterocyte damage');
  }

  return r;
}

// ── Musculoskeletal ────────────────────────────────────────────────────────────

function handleOsteoporosis(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'osteoporosis', 'osteopenia', 'low-bone-density')) return recs;

  let r = recs;

  // Ensure calcium
  const calEx = findExistingRec(r, 'calcium-citrate');
  if (calEx) {
    if (calEx.dose < 600) r = modifyDose(r, 'calcium-citrate', 600, LAYER, 'Osteoporosis — 600 mg calcium/day supports bone mineralisation');
    r = addReason(r, 'calcium-citrate', LAYER, 'Osteoporosis — calcium is the primary mineral constituent of bone; adequate intake is required for density maintenance');
  } else {
    r = put(r, makeRec({
      id: 'calcium-citrate',
      supplementName: 'Calcium Citrate',
      form: 'citrate',
      dose: 600,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['evening'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [makeReason('Osteoporosis — 600 mg calcium/day supports bone mineralisation and reduces fracture risk')],
      warnings: ['Separate by ≥2 hours from iron or zinc supplements'],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 8,
      category: 'mineral',
      separateFrom: ['iron-bisglycinate', 'zinc-picolinate'],
      notes: ['Citrate form absorbs without stomach acid — preferred over carbonate'],
    }));
  }

  r = ensureVitD(r, 3000, 'Osteoporosis — vitamin D is required for intestinal calcium absorption and bone remodelling; 3,000 IU targets 25-OH-D ≥40 ng/mL', 8);
  r = ensureMg(r, 300, 'Osteoporosis — magnesium is required for bone collagen synthesis and vitamin D activation; bone is the primary magnesium reservoir', 7);

  // Vitamin K2 MK-7
  r = put(r, makeRec({
    id: 'vitamin-k2',
    supplementName: 'Vitamin K2 (MK-7)',
    form: 'menaquinone-7',
    dose: 180,
    doseUnit: 'mcg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Moderate',
    reasons: [makeReason(
      'Osteoporosis — vitamin K2 (MK-7) activates osteocalcin and matrix Gla protein, directing calcium to bone and away from arteries',
    )],
    warnings: takesAnyMed(quiz, ANTICOAGULANTS)
      ? ['WARFARIN INTERACTION: Vitamin K2 will alter INR — do not start without anticoagulation clinic guidance']
      : [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 7,
    category: 'vitamin',
    separateFrom: [],
    notes: ['MK-7 form has the longest half-life (72 h) — once-daily dosing is sufficient', 'Fat-soluble — take with food'],
  }));

  return r;
}

function handleRheumatoidArthritis(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'rheumatoid-arthritis', 'ra', 'inflammatory-arthritis')) return recs;

  const onMethotrexate = takesMed(quiz, 'methotrexate');
  let r = recs;

  r = ensureOmega3(r, 2000, 'Rheumatoid arthritis — omega-3 EPA/DHA reduces joint inflammation, morning stiffness, and tender joint count; reduces NSAID requirement', 8);
  r = ensureVitD(r, 2000, 'Rheumatoid arthritis — vitamin D deficiency is highly prevalent in RA and associated with disease activity', 7);

  // Folate — REQUIRED if on methotrexate (prevents MTX toxicity)
  if (onMethotrexate) {
    const foEx = findExistingRec(r, 'folate-5mthf');
    if (foEx) {
      if (foEx.dose < 5000) r = modifyDose(r, 'folate-5mthf', 5000, LAYER, 'Methotrexate use — 5 mg/day folate prevents MTX-related mucositis, hepatotoxicity, and cytopenias');
      r = addReason(r, 'folate-5mthf', LAYER, 'Methotrexate use — folate supplementation is standard of care to prevent MTX toxicity');
      // Bump priority to 9 — MTX-related folate depletion is a high-priority safety concern
      r = r.map(rec => rec.id === 'folate-5mthf' ? { ...rec, priority: Math.max(rec.priority, 9) } : rec);
      // Add separation warning
      r = r.map(rec =>
        rec.id === 'folate-5mthf' && !rec.warnings.some(w => w.includes('methotrexate'))
          ? { ...rec, warnings: [...rec.warnings, 'Do not take on the same day as methotrexate — separate by 24 hours'] }
          : rec,
      );
    } else {
      r = put(r, makeRec({
        id: 'folate-5mthf',
        supplementName: 'Folate (5-MTHF)',
        form: '5-methyltetrahydrofolate',
        dose: 5000,
        doseUnit: 'mcg',
        frequency: 'daily',
        timing: ['morning-with-food'],
        withFood: true,
        evidenceRating: 'Strong',
        reasons: [makeReason('Methotrexate use — 5 mg/day folate is standard of care to prevent MTX-related toxicity (mucositis, cytopenias, hepatotoxicity)')],
        warnings: ['Do not take on the same day as methotrexate — separate by 24 hours'],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 9,
        category: 'vitamin',
        separateFrom: [],
        notes: ['Take on 6 days/week; skip on methotrexate day as directed by your rheumatologist'],
      }));
    }
  }

  // Turmeric/Curcumin — 1,000 mg/day for arthritis
  r = put(r, makeRec({
    id: 'curcumin',
    supplementName: 'Curcumin (with Piperine)',
    form: 'bcm-95',
    dose: 1000,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['midday'],
    withFood: true,
    evidenceRating: 'Moderate',
    reasons: [makeReason('Rheumatoid arthritis — curcumin 1,000 mg/day inhibits NF-κB and COX-2; reduces joint pain and swelling comparably to NSAIDs in RCTs')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 6,
    category: 'herbal',
    separateFrom: [],
    notes: ['BCM-95 or phytosomes form has 7× better bioavailability than plain curcumin'],
  }));

  return r;
}

function handleOsteoarthritis(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'osteoarthritis', 'oa', 'knee-osteoarthritis', 'hip-osteoarthritis', 'joint-degeneration')) return recs;

  let r = recs;

  r = ensureOmega3(r, 2000, 'Osteoarthritis — omega-3 reduces synovial inflammation and slows cartilage degradation', 7);

  r = put(r, makeRec({
    id: 'glucosamine-sulphate',
    supplementName: 'Glucosamine Sulphate',
    form: 'glucosamine-sulphate-2kcl',
    dose: 1500,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Moderate',
    reasons: [makeReason('Osteoarthritis — glucosamine sulphate (crystalline 2KCl form) reduces joint pain and slows joint space narrowing over 3+ years')],
    warnings: ['Some evidence of mild blood glucose elevation — monitor if diabetic'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 7,
    category: 'compound',
    separateFrom: [],
    notes: ['Use glucosamine sulphate (not HCl); crystalline form (2KCl) has strongest evidence', 'Allow 6–8 weeks for onset of benefit'],
  }));

  r = put(r, makeRec({
    id: 'chondroitin-sulphate',
    supplementName: 'Chondroitin Sulphate',
    form: 'chondroitin-sulphate',
    dose: 1200,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Moderate',
    reasons: [makeReason('Osteoarthritis — chondroitin sulphate inhibits cartilage-degrading enzymes and reduces joint pain; synergistic with glucosamine')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 6,
    category: 'compound',
    separateFrom: [],
    notes: ['Allow 6–8 weeks for onset; works best in combination with glucosamine sulphate'],
  }));

  return r;
}

// ── Women's Health ────────────────────────────────────────────────────────────

function handlePMSPMDD(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'pms', 'pmdd', 'premenstrual-syndrome', 'premenstrual-dysphoric-disorder')) return recs;
  if (quiz.biologicalSex !== 'female') return recs;

  let r = recs;

  r = ensureMg(r, 300, 'PMS/PMDD — magnesium reduces bloating, mood swings, and breast tenderness in the luteal phase', 7);

  r = put(r, makeRec({
    id: 'vitamin-b6',
    supplementName: 'Vitamin B6 (P-5-P)',
    form: 'pyridoxal-5-phosphate',
    dose: 50,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason('PMS/PMDD — vitamin B6 (50 mg/day) reduces PMS mood symptoms, irritability, and depression in multiple RCTs; supports serotonin synthesis')],
    warnings: ['Do not exceed 100 mg/day long-term — peripheral neuropathy risk above 200 mg/day'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 7,
    category: 'vitamin',
    separateFrom: [],
    notes: ['P-5-P (active form) preferred over pyridoxine HCl'],
  }));

  // Chasteberry / Vitex
  r = put(r, makeRec({
    id: 'vitex-chasteberry',
    supplementName: 'Vitex (Chasteberry)',
    form: 'agnucaston-extract',
    dose: 20,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Moderate',
    reasons: [makeReason('PMS/PMDD — vitex reduces prolactin secretion and alleviates PMS breast tenderness, irritability, and mood symptoms')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 6,
    category: 'herbal',
    separateFrom: [],
    notes: ['Allow 2–3 menstrual cycles for full effect; do not use during pregnancy'],
  }));

  return r;
}

function handleMenopause(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'menopause', 'perimenopause', 'climacteric')) return recs;
  if (quiz.biologicalSex !== 'female') return recs;

  let r = recs;

  r = ensureVitD(r, 2000, 'Menopause — oestrogen loss accelerates bone loss and increases cardiovascular risk; vitamin D is foundational', 7);
  r = ensureMg(r, 300, 'Menopause — magnesium supports bone density, reduces hot flush severity, and improves sleep quality', 7);

  r = put(r, makeRec({
    id: 'black-cohosh',
    supplementName: 'Black Cohosh (Cimicifuga)',
    form: 'remifemin-extract',
    dose: 40,
    doseUnit: 'mg',
    frequency: 'twice-daily',
    timing: ['morning-with-food', 'evening'],
    withFood: true,
    evidenceRating: 'Moderate',
    reasons: [makeReason('Menopause — black cohosh (Remifemin 40 mg twice daily) reduces hot flush frequency and severity in multiple RCTs')],
    warnings: ['Discontinue if liver function tests become abnormal (rare hepatotoxicity reported)', 'Not recommended with oestrogen-sensitive cancers without medical guidance'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 6,
    category: 'herbal',
    separateFrom: [],
    notes: ['Use standardised Cimicifuga racemosa extract; allow 4–8 weeks for onset'],
  }));

  return r;
}

// ── Skin Conditions ────────────────────────────────────────────────────────────

function handleHairLoss(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'hair-loss', 'alopecia', 'androgenetic-alopecia', 'female-pattern-hair-loss', 'telogen-effluvium')) return recs;

  const hasThalassemia = hasCond(quiz, 'thalassemia', 'thalassaemia', 'beta-thalassemia', 'alpha-thalassemia');
  let r = recs;

  // Iron — important for hair cycle, BLOCKED for thalassemia
  if (!hasThalassemia) {
    if (!findExistingRec(r, 'iron-bisglycinate')) {
      r = put(r, makeRec({
        id: 'iron-bisglycinate',
        supplementName: 'Iron (Bisglycinate)',
        form: 'bisglycinate',
        dose: 18,
        doseUnit: 'mg',
        frequency: 'daily',
        timing: ['morning-empty'],
        withFood: false,
        evidenceRating: 'Strong',
        reasons: [makeReason('Hair loss — low ferritin (<30 ng/mL) is a primary modifiable cause of telogen effluvium; iron is required for follicle proliferation')],
        warnings: ['Test ferritin before supplementing — target ferritin ≥70 ng/mL for hair growth; excess iron is harmful'],
        contraindications: ['thalassemia', 'haemochromatosis'],
        cyclingPattern: CYCLE_ALTERNATE_DAY,
        priority: 8,
        category: 'mineral',
        separateFrom: ['calcium-citrate', 'zinc-picolinate'],
        notes: ['Take with vitamin C to enhance absorption; bisglycinate form minimises GI side effects'],
      }));
    } else {
      r = addReason(r, 'iron-bisglycinate', LAYER, 'Hair loss — ferritin repletion is essential for hair follicle proliferation and cycle normalisation');
    }
  }

  // Biotin
  r = put(r, makeRec({
    id: 'biotin',
    supplementName: 'Biotin',
    form: 'd-biotin',
    dose: 5000,
    doseUnit: 'mcg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Emerging',
    reasons: [makeReason('Hair loss — biotin is required for keratin synthesis; deficiency causes hair thinning; evidence strongest for biotin-deficient individuals')],
    warnings: ['Biotin supplements interfere with many lab tests (thyroid, troponin) — inform your doctor and pause 48h before blood tests'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 5,
    category: 'vitamin',
    separateFrom: [],
    notes: ['Discontinue 48 hours before any lab tests — biotin causes false lab results'],
  }));

  // Collagen peptides
  r = put(r, makeRec({
    id: 'collagen-peptides',
    supplementName: 'Collagen Peptides',
    form: 'hydrolysed-type-i-iii',
    dose: 10000,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-empty'],
    withFood: false,
    evidenceRating: 'Emerging',
    reasons: [makeReason('Hair loss — collagen peptides provide glycine and proline for keratin synthesis; small RCTs show improved hair thickness')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 4,
    category: 'protein',
    separateFrom: [],
    notes: ['10 g/day in warm liquid; works synergistically with vitamin C'],
  }));

  return r;
}

function handleAcne(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'acne', 'acne-vulgaris', 'cystic-acne')) return recs;

  let r = recs;

  // Zinc — as well-evidenced as some topical antibiotics
  if (!findExistingRec(r, 'zinc-picolinate')) {
    r = put(r, makeRec({
      id: 'zinc-picolinate',
      supplementName: 'Zinc Picolinate',
      form: 'picolinate',
      dose: 30,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [makeReason('Acne — zinc picolinate reduces P. acnes proliferation, sebum production, and inflammatory lesion count; efficacy comparable to low-dose doxycycline')],
      warnings: ['Do not exceed 40 mg/day; take with food to prevent nausea'],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 7,
      category: 'mineral',
      separateFrom: ['calcium-citrate', 'iron-bisglycinate'],
      notes: ['At 30 mg/day, copper 2 mg co-supplementation is recommended (see copper entry)'],
    }));
  } else {
    r = addReason(r, 'zinc-picolinate', LAYER, 'Acne — zinc reduces P. acnes proliferation and sebum production');
  }

  r = ensureOmega3(r, 2000, 'Acne — omega-3 reduces leukotriene B4 and sebum inflammation; decreases inflammatory lesion count', 6);

  r = put(r, makeRec({
    id: 'probiotic-blend',
    supplementName: 'Probiotic Blend',
    form: 'multi-strain',
    dose: 10,
    doseUnit: 'CFU',
    frequency: 'daily',
    timing: ['morning-empty'],
    withFood: false,
    evidenceRating: 'Emerging',
    reasons: [makeReason('Acne — gut dysbiosis and gut-skin axis dysfunction contribute to acne; probiotics reduce systemic inflammation and lesion count')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 5,
    category: 'probiotic',
    separateFrom: [],
    notes: ['Billion CFU unit'],
  }));

  return r;
}

// ── Immune / Autoimmune ────────────────────────────────────────────────────────

function handleAutoimmune(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const autoimmuneConds = [
    'autoimmune', 'lupus', 'sle', 'systemic-lupus-erythematosus',
    'multiple-sclerosis', 'ms', 'sjogrens', 'sjogren-syndrome',
    'ankylosing-spondylitis', 'psoriatic-arthritis',
  ];
  if (!hasCond(quiz, ...autoimmuneConds)) return recs;

  let r = recs;

  // Vitamin D — high dose for immunomodulation
  r = ensureVitD(r, 4000, 'Autoimmune condition — vitamin D has profound immunomodulatory effects; deficiency is a consistent risk factor for autoimmune disease activity', 8);
  r = ensureOmega3(r, 2000, 'Autoimmune condition — omega-3 reduces pro-inflammatory cytokines (TNF-α, IL-6) and disease activity markers', 8);

  // Echinacea should NOT be added here — immune stimulation can worsen autoimmune conditions
  // (Echinacea is not added by previous layers, but this is defensive)

  r = ensureMg(r, 300, 'Autoimmune condition — magnesium modulates NF-κB inflammatory signalling', 6);

  return r;
}

function handleChronicFatigue(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'chronic-fatigue-syndrome', 'cfs', 'me-cfs', 'myalgic-encephalomyelitis', 'me')) return recs;

  let r = recs;

  // CoQ10
  if (!findExistingRec(r, 'coq10-ubiquinol')) {
    r = put(r, makeRec({
      id: 'coq10-ubiquinol',
      supplementName: 'CoQ10 (Ubiquinol)',
      form: 'ubiquinol',
      dose: 200,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Moderate',
      reasons: [makeReason('CFS/ME — mitochondrial dysfunction is central to CFS pathophysiology; CoQ10 200 mg reduces fatigue and cognitive symptoms')],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 7,
      category: 'antioxidant',
      separateFrom: [],
      notes: [],
    }));
  } else {
    r = addReason(r, 'coq10-ubiquinol', LAYER, 'CFS/ME — CoQ10 supports mitochondrial function impaired in CFS');
  }

  r = ensureVitD(r, 2000, 'CFS/ME — vitamin D deficiency is prevalent and associated with worse fatigue outcomes', 7);
  r = ensureMg(r, 300, 'CFS/ME — magnesium malate supports ATP synthesis and reduces muscle pain in CFS', 7);

  r = put(r, makeRec({
    id: 'l-carnitine',
    supplementName: 'L-Carnitine',
    form: 'l-carnitine-tartrate',
    dose: 2000,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Emerging',
    reasons: [makeReason('CFS/ME — L-carnitine facilitates mitochondrial fatty acid oxidation; small RCTs show reduced fatigue and improved cognitive function')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 6,
    category: 'amino-acid',
    separateFrom: [],
    notes: ['L-carnitine tartrate has best absorption; acetyl-L-carnitine preferred for cognitive symptoms'],
  }));

  return r;
}

// ── Respiratory ────────────────────────────────────────────────────────────────

function handleAsthma(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'asthma', 'allergic-asthma', 'exercise-induced-asthma')) return recs;

  let r = recs;

  r = ensureMg(r, 400, 'Asthma — magnesium relaxes bronchial smooth muscle; IV magnesium is used in acute asthma; oral 400 mg reduces attack frequency', 8);
  r = ensureOmega3(r, 2000, 'Asthma — omega-3 reduces leukotriene production and bronchial hyperresponsiveness', 7);
  r = ensureVitD(r, 2000, 'Asthma — vitamin D deficiency associated with increased asthma attacks and steroid resistance; supplementation reduces exacerbation frequency', 7);

  r = put(r, makeRec({
    id: 'quercetin',
    supplementName: 'Quercetin',
    form: 'quercetin-phytosome',
    dose: 500,
    doseUnit: 'mg',
    frequency: 'twice-daily',
    timing: ['morning-with-food', 'evening'],
    withFood: true,
    evidenceRating: 'Emerging',
    reasons: [makeReason('Asthma — quercetin inhibits mast cell degranulation, histamine release, and leukotriene synthesis; reduces bronchial hyperresponsiveness')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 5,
    category: 'antioxidant',
    separateFrom: [],
    notes: ['Phytosome or quercetin + bromelain form has superior bioavailability'],
  }));

  return r;
}

// ── Eye Conditions ────────────────────────────────────────────────────────────

function handleAMD(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'amd', 'age-related-macular-degeneration', 'macular-degeneration', 'dry-amd', 'wet-amd')) return recs;

  const smoker = quiz.smokerFlag === true;
  let r = recs;

  // AREDS2 formula components
  r = put(r, makeRec({
    id: 'lutein',
    supplementName: 'Lutein',
    form: 'floraGLO-lutein',
    dose: 10,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason('AMD — AREDS2 trial: lutein 10 mg + zeaxanthin 2 mg reduces risk of advanced AMD progression by 26% in at-risk patients')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 8,
    category: 'antioxidant',
    separateFrom: [],
    notes: ['AREDS2 formula; fat-soluble — take with largest meal'],
  }));

  r = put(r, makeRec({
    id: 'zeaxanthin',
    supplementName: 'Zeaxanthin',
    form: 'zeaxanthin',
    dose: 2,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason('AMD — AREDS2: zeaxanthin 2 mg combined with lutein 10 mg reduces advanced AMD progression by 26%')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 8,
    category: 'antioxidant',
    separateFrom: [],
    notes: ['Part of AREDS2 formula; take with lutein and fat-containing meal'],
  }));

  // Vitamin C 500 mg
  r = put(r, makeRec({
    id: 'vitamin-c',
    supplementName: 'Vitamin C',
    form: 'ascorbic-acid',
    dose: 500,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason('AMD — AREDS2 formula: vitamin C 500 mg protects macular photoreceptors from oxidative damage')],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 8,
    category: 'vitamin',
    separateFrom: [],
    notes: ['Part of AREDS2 formula'],
  }));

  // Vitamin E 400 IU — but NOT beta-carotene for smokers
  r = put(r, makeRec({
    id: 'vitamin-e',
    supplementName: 'Vitamin E',
    form: 'mixed-tocopherols',
    dose: 400,
    doseUnit: 'IU',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason('AMD — AREDS2 formula: vitamin E 400 IU reduces oxidative damage to macular photoreceptors')],
    warnings: ['High-dose vitamin E (>400 IU) may increase bleeding risk with anticoagulants'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 8,
    category: 'vitamin',
    separateFrom: [],
    notes: ['Part of AREDS2 formula; use mixed tocopherols (not d-alpha-tocopherol alone)'],
  }));

  // Zinc 25 mg (post-processing will add copper 2 mg)
  const zincEx = findExistingRec(r, 'zinc-picolinate');
  if (zincEx) {
    if (zincEx.dose < 25) r = modifyDose(r, 'zinc-picolinate', 25, LAYER, 'AMD — AREDS2 formula: zinc 25 mg supports macular enzyme systems and visual cycle proteins');
    r = addReason(r, 'zinc-picolinate', LAYER, 'AMD — AREDS2 formula: zinc 25 mg reduces risk of advanced AMD progression');
  } else {
    r = put(r, makeRec({
      id: 'zinc-picolinate',
      supplementName: 'Zinc Picolinate',
      form: 'picolinate',
      dose: 25,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [makeReason('AMD — AREDS2 formula: zinc 25 mg supports macular photoreceptor function and reduces advanced AMD risk by 25%')],
      warnings: ['Do not exceed 40 mg/day; copper 2 mg must be co-supplemented at this dose'],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 8,
      category: 'mineral',
      separateFrom: ['calcium-citrate', 'iron-bisglycinate'],
      notes: ['Part of AREDS2 formula; copper 2 mg is automatically added to prevent deficiency at this zinc dose'],
    }));
  }

  // Beta-carotene — ONLY if non-smoker (CARET trial: beta-carotene increases lung cancer risk in smokers)
  if (!smoker) {
    // Note: AREDS2 replaced beta-carotene with lutein/zeaxanthin; we follow AREDS2 — do not add beta-carotene
  }

  return r;
}

// ── Kidney ────────────────────────────────────────────────────────────────────

function handleCKD(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'ckd', 'chronic-kidney-disease', 'chronic-renal-failure', 'renal-impairment')) return recs;

  let r = recs;

  const ckdCaution = 'CHRONIC KIDNEY DISEASE: This supplement requires dose adjustment or physician approval in CKD — risk of accumulation and toxicity';

  // Add caution to potassium (hyperkalaemia risk)
  if (findExistingRec(r, 'potassium-citrate')) {
    r = r.map(rec =>
      rec.id === 'potassium-citrate'
        ? { ...rec, warnings: [...rec.warnings, 'CKD CAUTION: Potassium supplements are contraindicated in CKD stages 3b+ — hyperkalaemia risk; medical supervision required'] }
        : rec,
    );
  }

  // Add caution to magnesium
  if (findExistingRec(r, 'magnesium-glycinate')) {
    r = r.map(rec =>
      rec.id === 'magnesium-glycinate'
        ? { ...rec, warnings: [...rec.warnings, 'CKD CAUTION: Magnesium clearance is reduced in CKD; limit to 200 mg/day in CKD stages 3b–5 and monitor serum levels'] }
        : rec,
    );
  }

  // Add caution to high-dose vitamin C (oxalate risk)
  if (findExistingRec(r, 'vitamin-c')) {
    r = r.map(rec =>
      rec.id === 'vitamin-c'
        ? { ...rec, warnings: [...rec.warnings, 'CKD CAUTION: Vitamin C >200 mg/day generates oxalate; increases calcium oxalate stone risk in CKD; limit to 60–100 mg/day'] }
        : rec,
    );
  }

  // Add caution to creatine (raises serum creatinine — obscures kidney function markers)
  if (findExistingRec(r, 'creatine-monohydrate')) {
    r = r.map(rec =>
      rec.id === 'creatine-monohydrate'
        ? { ...rec, warnings: [...rec.warnings, 'CKD CAUTION: Creatine supplementation raises serum creatinine, making kidney function assessment unreliable; avoid in CKD'] }
        : rec,
    );
  }

  // Add caution to high-dose zinc
  if (findExistingRec(r, 'zinc-picolinate')) {
    r = r.map(rec =>
      rec.id === 'zinc-picolinate' && rec.dose > 15
        ? { ...rec, warnings: [...rec.warnings, 'CKD CAUTION: High-dose zinc (>15 mg/day) requires caution in CKD — accumulation risk; consult nephrologist'] }
        : rec,
    );
  }

  // Vitamin D — often deficient in CKD (impaired 1-alpha-hydroxylation)
  r = ensureVitD(r, 1000, 'CKD — impaired renal 1-alpha-hydroxylase reduces active vitamin D synthesis; supplementation of D3 precursor supports residual conversion', 7);

  // B-complex — water-soluble vitamins are dialysed out; repletion needed (especially in dialysis patients)
  r = put(r, makeRec({
    id: 'b-complex',
    supplementName: 'B-Complex (Renal Formula)',
    form: 'b-complex',
    dose: 1,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason('CKD — dialysis removes water-soluble B vitamins; renal formula B-complex replaces B1, B6, B12, and folate without loading potassium')],
    warnings: ['Use renal-specific B-complex without excessive vitamin A or C — avoid standard high-potency formulas'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 7,
    category: 'vitamin',
    separateFrom: [],
    notes: ['Choose a "renal formula" B-complex low in vitamin A and C'],
  }));

  return r;
}

// ── Liver ──────────────────────────────────────────────────────────────────────

function handleNAFLD(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'nafld', 'nash', 'non-alcoholic-fatty-liver', 'non-alcoholic-steatohepatitis', 'fatty-liver')) return recs;

  let r = recs;

  r = put(r, makeRec({
    id: 'vitamin-e-tocotrienol',
    supplementName: 'Vitamin E',
    form: 'tocopherol-alpha',
    dose: 800,
    doseUnit: 'IU',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason('NAFLD/NASH — vitamin E 800 IU/day is recommended by AASLD guidelines for non-diabetic NASH; reduces hepatic inflammation and fibrosis')],
    warnings: [
      'High-dose vitamin E (800 IU/day) may increase all-cause mortality risk at very high doses — use under medical supervision',
      'Not recommended in diabetic patients with NASH (different risk-benefit profile)',
    ],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 8,
    category: 'vitamin',
    separateFrom: [],
    notes: ['AASLD-guideline supported; review annually with LFTs'],
  }));

  r = ensureOmega3(r, 2000, 'NAFLD — omega-3 (EPA+DHA ≥2 g/day) reduces hepatic triglyceride content and liver stiffness in NAFLD', 8);

  // Milk thistle
  if (!findExistingRec(r, 'milk-thistle')) {
    r = put(r, makeRec({
      id: 'milk-thistle',
      supplementName: 'Milk Thistle (Silymarin)',
      form: 'silymarin-extract',
      dose: 420,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Moderate',
      reasons: [makeReason('NAFLD — silymarin is an antioxidant and anti-inflammatory that reduces hepatic oxidative stress, ALT levels, and liver fat in NAFLD')],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 6,
      category: 'herbal',
      separateFrom: [],
      notes: ['70–80% silymarin standardised extract; 420 mg total silymarin = three 140 mg doses or one concentrated 420 mg tablet'],
    }));
  } else {
    r = addReason(r, 'milk-thistle', LAYER, 'NAFLD — silymarin reduces hepatic oxidative stress and ALT levels');
  }

  return r;
}

// ── Neurological ───────────────────────────────────────────────────────────────

function handleMigraines(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'migraines', 'migraine', 'chronic-migraine', 'vestibular-migraine')) return recs;

  let r = recs;

  // Magnesium — high-dose, specifically for migraine prevention
  const mg = findExistingRec(r, 'magnesium-glycinate');
  if (mg) {
    if (mg.dose < 400) r = modifyDose(r, 'magnesium-glycinate', 400, LAYER, 'Migraines — 400 mg/day magnesium reduces migraine frequency by 40% in RCTs (AAN guideline Level B)');
    r = addReason(r, 'magnesium-glycinate', LAYER, 'Migraines — magnesium deficiency is prevalent in migraineurs; supplementation reduces attack frequency and duration');
  } else {
    r = ensureMg(r, 400, 'Migraines — 400 mg/day magnesium reduces migraine frequency by 40% in RCTs; AAN-guideline supported', 8);
  }

  // Riboflavin B2
  r = put(r, makeRec({
    id: 'riboflavin-b2',
    supplementName: 'Riboflavin (Vitamin B2)',
    form: 'riboflavin',
    dose: 400,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [makeReason('Migraines — riboflavin 400 mg/day reduces migraine frequency by 50% in RCTs; supports mitochondrial energy metabolism impaired in migraineurs')],
    warnings: ['Causes harmless yellow discolouration of urine'],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 8,
    category: 'vitamin',
    separateFrom: [],
    notes: ['AAN Level B recommendation; allow 3 months for full preventive effect'],
  }));

  // CoQ10
  if (!findExistingRec(r, 'coq10-ubiquinol')) {
    r = put(r, makeRec({
      id: 'coq10-ubiquinol',
      supplementName: 'CoQ10 (Ubiquinol)',
      form: 'ubiquinol',
      dose: 300,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [makeReason('Migraines — CoQ10 300 mg/day reduces migraine frequency by 47% in a placebo-controlled trial; mitochondrial energy support')],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 7,
      category: 'antioxidant',
      separateFrom: [],
      notes: ['AAN Level B recommendation'],
    }));
  } else {
    if (findExistingRec(r, 'coq10-ubiquinol')!.dose < 300) {
      r = modifyDose(r, 'coq10-ubiquinol', 300, LAYER, 'Migraines — 300 mg CoQ10 reduces migraine frequency by 47%');
    }
    r = addReason(r, 'coq10-ubiquinol', LAYER, 'Migraines — CoQ10 supports mitochondrial function and reduces attack frequency');
  }

  return r;
}

// ── Thalassemia (iron safety block) ───────────────────────────────────────────

function handleThalassemia(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'thalassemia', 'thalassaemia', 'beta-thalassemia', 'alpha-thalassemia', 'thalassemia-trait')) return recs;

  let r = recs;

  // Remove iron — critical safety block
  if (findExistingRec(r, 'iron-bisglycinate')) {
    r = removeRec(r, 'iron-bisglycinate', LAYER, 'Thalassemia — iron supplementation is CONTRAINDICATED: thalassemia causes haemolytic anaemia with iron loading, not deficiency; supplemental iron worsens end-organ damage');
  }

  // Folate — frequently deficient due to haemolysis
  r = ensureFolate(r, 1000, 'Thalassemia — chronic haemolysis depletes folate; 1,000 mcg/day repletion is standard of care', 8);

  // Vitamin D — frequently deficient
  r = ensureVitD(r, 2000, 'Thalassemia — vitamin D deficiency is highly prevalent; osteoporosis risk elevated due to bone marrow expansion', 7);

  return r;
}

// ── Beta-carotene safety block for smokers ────────────────────────────────────

function blockBetaCaroteneForSmokers(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (quiz.smokerFlag !== true) return recs;

  // Remove beta-carotene if it was added by any previous layer
  const betaCaroteneIds = ['beta-carotene', 'beta-carotene-supplement'];
  let r = recs;
  for (const id of betaCaroteneIds) {
    if (findExistingRec(r, id)) {
      r = removeRec(r, id, LAYER, 'Current/former smoker — beta-carotene supplementation increases lung cancer risk in smokers (CARET and ATBC trials); CONTRAINDICATED');
    }
  }

  return r;
}

// ── Echinacea safety block for autoimmune ────────────────────────────────────

function blockEchinaceaForAutoimmune(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const autoimmuneConds = [
    'autoimmune', 'lupus', 'sle', 'multiple-sclerosis', 'ms',
    'rheumatoid-arthritis', 'ra', 'hashimotos', 'hashimoto',
    'hashimoto-thyroiditis', 'sjogrens', 'psoriasis',
    'ankylosing-spondylitis', 'crohns', 'ulcerative-colitis',
  ];
  if (!hasCond(quiz, ...autoimmuneConds)) return recs;

  const echinaceaIds = ['echinacea', 'echinacea-purpurea', 'echinacea-supplement'];
  let r = recs;
  for (const id of echinaceaIds) {
    if (findExistingRec(r, id)) {
      r = removeRec(r, id, LAYER, 'Autoimmune condition — echinacea stimulates immune activity and can exacerbate autoimmune disease; CONTRAINDICATED');
    }
  }

  return r;
}


// ── OCD ──────────────────────────────────────────────────────────────────────

function handleOCD(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'ocd', 'obsessive-compulsive-disorder', 'obsessive-compulsive')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'nac')) {
    r = put(r, makeRec({
      id: 'nac', supplementName: 'N-Acetyl Cysteine (NAC)', form: 'nac',
      dose: 2400, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food', 'evening'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('OCD — glutamate modulation; RCTs show significant OCD symptom reduction at 2,400 mg/day')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'amino-acid', separateFrom: [], notes: ['Divide into 2 doses: 1,200 mg twice daily'],
    }));
  } else {
    r = addReason(r, 'nac', LAYER, 'OCD — glutamate modulation; RCTs show OCD symptom reduction at 2,400 mg/day');
  }

  if (!takesAnyMed(quiz, SEROTONERGIC) && !findExistingRec(r, 'inositol')) {
    r = put(r, makeRec({
      id: 'inositol', supplementName: 'Inositol', form: 'myo-inositol',
      dose: 18000, doseUnit: 'mg', frequency: 'three-times-daily',
      timing: ['morning-with-food', 'midday', 'evening'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('OCD — serotonin receptor sensitisation; 18 g/day shown effective in OCD RCT')],
      warnings: ['GI side effects possible at high doses'], contraindications: [],
      cyclingPattern: CYCLE_DAILY, priority: 7, category: 'compound',
      separateFrom: [], notes: ['Divide across 3 doses with meals'],
    }));
  }

  r = ensureMg(r, 300, 'OCD — magnesium supports GABAergic tone and reduces anxiety co-morbidity');
  return r;
}

// ── Cognitive Decline / Brain Fog ────────────────────────────────────────────

function handleCognitiveBrainFog(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'brain-fog', 'cognitive-decline', 'memory-issues', 'cognitive-impairment', 'mild-cognitive-impairment', 'mci')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'lions-mane')) {
    r = put(r, makeRec({
      id: 'lions-mane', supplementName: "Lion's Mane Mushroom", form: 'extract',
      dose: 1000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason("Cognitive decline — NGF stimulation; RCT showed cognitive improvement in MCI (Mori 2009)")],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'herbal', separateFrom: [], notes: ['500–1,000 mg standardised extract'],
    }));
  }

  if (!findExistingRec(r, 'phosphatidylserine')) {
    r = put(r, makeRec({
      id: 'phosphatidylserine', supplementName: 'Phosphatidylserine', form: 'soy-derived',
      dose: 300, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Cognitive decline — cell membrane integrity; FDA qualified health claim for cognitive function')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'compound', separateFrom: [], notes: ['Soy-derived or sunflower-derived; 100 mg three times daily'],
    }));
  }

  if (!findExistingRec(r, 'bacopa-monnieri')) {
    r = put(r, makeRec({
      id: 'bacopa-monnieri', supplementName: 'Bacopa Monnieri', form: 'extract',
      dose: 300, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Cognitive decline — adaptogen with meta-analytic evidence for memory and processing speed')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'herbal', separateFrom: [], notes: ['Standardised to 55% bacosides; full effect in 8–12 weeks'],
    }));
  }

  r = ensureOmega3(r, 2000, 'Cognitive decline — DHA essential for neuronal membrane fluidity and synaptic function');
  r = ensureVitD(r, 2000, 'Cognitive decline — vitamin D deficiency associated with 2× risk of dementia');
  return r;
}

// ── Peripheral Neuropathy ────────────────────────────────────────────────────

function handleNeuropathy(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'neuropathy', 'peripheral-neuropathy', 'diabetic-neuropathy')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'ala')) {
    r = put(r, makeRec({
      id: 'ala', supplementName: 'Alpha-Lipoic Acid (ALA)', form: 'r-ala',
      dose: 600, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Strong',
      reasons: [makeReason('Peripheral neuropathy — IV and oral ALA RCTs show significant symptom reduction; R-ALA preferred')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 9,
      category: 'antioxidant', separateFrom: [], notes: ['300–600 mg; R-ALA form preferred for bioavailability; take before meals'],
    }));
  }

  const existingB12 = findExistingRec(r, 'vitamin-b12');
  if (existingB12) {
    r = modifyForm(r, 'vitamin-b12', 'methylcobalamin', LAYER, 'Peripheral neuropathy — methylcobalamin preferred for nerve repair over cyanocobalamin');
    if (existingB12.dose < 1000) {
      r = modifyDose(r, 'vitamin-b12', 1000, LAYER, 'Peripheral neuropathy — 1,000 mcg methylcobalamin for neurological support');
    }
  } else {
    r = put(r, makeRec({
      id: 'vitamin-b12', supplementName: 'Vitamin B12 (Methylcobalamin)', form: 'methylcobalamin',
      dose: 1000, doseUnit: 'mcg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Peripheral neuropathy — methylcobalamin critical for myelin synthesis and nerve repair')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'vitamin', separateFrom: [], notes: ['Sublingual preferred for absorption'],
    }));
  }

  if (!findExistingRec(r, 'benfotiamine')) {
    r = put(r, makeRec({
      id: 'benfotiamine', supplementName: 'Benfotiamine', form: 'fat-soluble-b1',
      dose: 300, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Peripheral neuropathy — fat-soluble B1 analogue; RCTs show diabetic neuropathy improvement')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'vitamin', separateFrom: [], notes: ['150–300 mg/day'],
    }));
  }

  return r;
}

// ── Alzheimer's Disease / Dementia ───────────────────────────────────────────

function handleAlzheimers(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'alzheimers', 'alzheimer', 'alzheimer-disease', 'dementia')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'lions-mane')) {
    r = put(r, makeRec({
      id: 'lions-mane', supplementName: "Lion's Mane Mushroom", form: 'extract',
      dose: 1000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason("Alzheimer's — NGF stimulation; RCT evidence for cognitive improvement in MCI")],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 9,
      category: 'herbal', separateFrom: [], notes: ['500–1,000 mg standardised extract'],
    }));
  }

  if (!findExistingRec(r, 'phosphatidylserine')) {
    r = put(r, makeRec({
      id: 'phosphatidylserine', supplementName: 'Phosphatidylserine', form: 'soy-derived',
      dose: 300, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason("Alzheimer's — FDA qualified health claim; delays cognitive decline in early dementia")],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'compound', separateFrom: [], notes: ['100 mg three times daily'],
    }));
  }

  if (!findExistingRec(r, 'curcumin')) {
    r = put(r, makeRec({
      id: 'curcumin', supplementName: 'Curcumin (High-Absorption)', form: 'phospholipid-complex',
      dose: 1000, doseUnit: 'mg', frequency: 'daily',
      timing: ['midday'], withFood: true, evidenceRating: 'Emerging',
      reasons: [makeReason("Alzheimer's — amyloid aggregation inhibition and neuroinflammation reduction")],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'herbal', separateFrom: [], notes: ['Use Meriva or piperine-enhanced form for bioavailability'],
    }));
  }

  r = ensureOmega3(r, 2000, "Alzheimer's — DHA critical for brain structure; EPA reduces neuroinflammation");
  r = ensureVitD(r, 2000, "Alzheimer's — vitamin D receptor in hippocampus; deficiency associated with dementia risk");
  return r;
}

// ── Epilepsy ─────────────────────────────────────────────────────────────────

function handleEpilepsy(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'epilepsy', 'seizures', 'seizure-disorder')) return recs;
  let r = recs;

  for (const id of ['ginkgo', 'ginkgo-biloba']) {
    if (findExistingRec(r, id)) {
      r = removeRec(r, id, LAYER, 'Epilepsy — ginkgo biloba lowers seizure threshold; CONTRAINDICATED with seizure disorder');
    }
  }

  r = ensureMg(r, 400, 'Epilepsy — membrane stabilisation; magnesium deficiency lowers seizure threshold');
  r = ensureVitD(r, 2000, 'Epilepsy — seizure frequency inversely correlated with vitamin D levels');

  if (!findExistingRec(r, 'vitamin-b6')) {
    r = put(r, makeRec({
      id: 'vitamin-b6', supplementName: 'Vitamin B6 (Pyridoxine)', form: 'pyridoxine',
      dose: 25, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Epilepsy — GABAergic support; deficiency linked to increased seizure frequency')],
      warnings: ['Do not exceed 100 mg/day — high-dose B6 causes sensory neuropathy'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'vitamin', separateFrom: [], notes: ['25–50 mg/day'],
    }));
  }

  return r;
}

// ── Tinnitus ──────────────────────────────────────────────────────────────────

function handleTinnitus(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'tinnitus', 'ringing-in-ears')) return recs;
  if (hasCond(quiz, 'epilepsy', 'seizures', 'seizure-disorder')) return recs; // ginkgo contraindicated

  let r = recs;

  if (!findExistingRec(r, 'ginkgo-biloba')) {
    r = put(r, makeRec({
      id: 'ginkgo-biloba', supplementName: 'Ginkgo Biloba', form: 'egb-761-extract',
      dose: 240, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food', 'evening'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Tinnitus — cochlear microcirculation improvement; meta-analysis shows modest benefit')],
      warnings: ['Mild anticoagulant effect — caution with blood thinners'],
      contraindications: ['epilepsy', 'seizure-disorder'], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'herbal', separateFrom: [], notes: ['120 mg twice daily standardised EGb 761 extract'],
    }));
  }

  if (!findExistingRec(r, 'zinc-picolinate') && !findExistingRec(r, 'zinc-sulfate')) {
    r = put(r, makeRec({
      id: 'zinc-picolinate', supplementName: 'Zinc Picolinate', form: 'picolinate',
      dose: 25, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Tinnitus — inner ear zinc deficiency associated with tinnitus; supplementation shows improvement')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 6,
      category: 'mineral', separateFrom: ['iron-bisglycinate'], notes: ['Picolinate or gluconate preferred'],
    }));
  }

  r = ensureMg(r, 300, 'Tinnitus — NMDA receptor modulation; cochlear protection in noise-induced tinnitus');
  return r;
}

// ── Insulin Resistance / Metabolic Syndrome ───────────────────────────────────

function handleInsResistance(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'insulin-resistance', 'prediabetes', 'pre-diabetes', 'metabolic-syndrome')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'berberine')) {
    r = put(r, makeRec({
      id: 'berberine', supplementName: 'Berberine', form: 'berberine-hcl',
      dose: 500, doseUnit: 'mg', frequency: 'twice-daily',
      timing: ['morning-with-food', 'evening'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Insulin resistance — AMPK activation; 500 mg twice daily (1,000 mg/day) shows glucose-lowering comparable to metformin')],
      warnings: ['May potentiate blood-sugar-lowering medications — monitor blood glucose'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'herbal', separateFrom: [], notes: ['500 mg twice daily with meals'],
    }));
  }

  if (!findExistingRec(r, 'chromium-picolinate')) {
    r = put(r, makeRec({
      id: 'chromium-picolinate', supplementName: 'Chromium Picolinate', form: 'picolinate',
      dose: 400, doseUnit: 'mcg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Insulin resistance — potentiates insulin signalling; improves glucose tolerance in meta-analysis')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'mineral', separateFrom: [], notes: ['200–400 mcg/day'],
    }));
  }

  if (!findExistingRec(r, 'ala')) {
    r = put(r, makeRec({
      id: 'ala', supplementName: 'Alpha-Lipoic Acid (ALA)', form: 'r-ala',
      dose: 600, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Insulin resistance — GLUT4 translocation and insulin sensitisation; RCT evidence')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'antioxidant', separateFrom: [], notes: ['300–600 mg before meals'],
    }));
  }

  r = ensureMg(r, 400, 'Insulin resistance — magnesium essential cofactor for insulin receptor signalling; deficiency worsens insulin resistance');
  return r;
}

// ── Hyperthyroidism / Graves' Disease ────────────────────────────────────────

function handleHyperthyroidism(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'hyperthyroidism', 'graves-disease', 'graves', 'overactive-thyroid')) return recs;
  let r = recs;

  for (const id of ['iodine', 'potassium-iodide', 'iodine-supplement', 'kelp']) {
    if (findExistingRec(r, id)) {
      r = removeRec(r, id, LAYER, 'Hyperthyroidism — iodine stimulates thyroid hormone production; CONTRAINDICATED');
    }
  }

  if (!findExistingRec(r, 'selenium')) {
    r = put(r, makeRec({
      id: 'selenium', supplementName: 'Selenium (L-Selenomethionine)', form: 'l-selenomethionine',
      dose: 200, doseUnit: 'mcg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Hyperthyroidism / Graves — selenoprotein P and glutathione peroxidase support thyroid autoimmunity management')],
      warnings: ['Do not exceed 400 mcg/day — selenium toxicity (selenosis) possible'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'mineral', separateFrom: [], notes: ['L-selenomethionine preferred form'],
    }));
  }

  r = ensureMg(r, 400, 'Hyperthyroidism — magnesium depletion common; supports nervous system and muscle function');
  r = ensureVitD(r, 2000, 'Hyperthyroidism / autoimmune thyroid — vitamin D modulates immune response');
  return r;
}

// ── Adrenal Fatigue / HPA Axis Dysregulation ─────────────────────────────────

function handleAdrenalFatigue(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'adrenal-fatigue', 'adrenal-insufficiency', 'hpa-axis', 'burnout')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'ashwagandha-ksm66')) {
    r = put(r, makeRec({
      id: 'ashwagandha-ksm66', supplementName: 'Ashwagandha (KSM-66)', form: 'ksm-66-extract',
      dose: 600, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Adrenal fatigue — KSM-66 RCT shows cortisol reduction 27.9%; HPA axis normalisation')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_6ON1OFF, priority: 8,
      category: 'adaptogen', separateFrom: [], notes: ['300 mg twice daily with food'],
    }));
  } else {
    r = addReason(r, 'ashwagandha-ksm66', LAYER, 'Adrenal fatigue — HPA axis normalisation via cortisol reduction');
  }

  if (!findExistingRec(r, 'vitamin-c')) {
    r = put(r, makeRec({
      id: 'vitamin-c', supplementName: 'Vitamin C', form: 'ascorbic-acid',
      dose: 1000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Adrenal fatigue — adrenal cortex contains highest vitamin C concentration; cofactor for cortisol synthesis')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'vitamin', separateFrom: [], notes: ['500–2,000 mg/day'],
    }));
  } else {
    r = addReason(r, 'vitamin-c', LAYER, 'Adrenal fatigue — adrenal cortex cofactor for cortisol synthesis');
  }

  if (!findExistingRec(r, 'pantothenic-acid')) {
    r = put(r, makeRec({
      id: 'pantothenic-acid', supplementName: 'Pantothenic Acid (B5)', form: 'calcium-pantothenate',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Traditional',
      reasons: [makeReason('Adrenal fatigue — CoA precursor essential for adrenal steroidogenesis')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'vitamin', separateFrom: [], notes: ['500 mg/day'],
    }));
  }

  r = ensureMg(r, 400, 'Adrenal fatigue — magnesium depleted by chronic stress; cofactor for stress hormone metabolism');
  return r;
}

// ── Elevated CRP / Systemic Inflammation ─────────────────────────────────────

function handleHighCRP(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'high-crp', 'elevated-crp', 'chronic-inflammation', 'systemic-inflammation', 'high-inflammation')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'curcumin')) {
    r = put(r, makeRec({
      id: 'curcumin', supplementName: 'Curcumin (High-Absorption)', form: 'phospholipid-complex',
      dose: 1000, doseUnit: 'mg', frequency: 'daily',
      timing: ['midday'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Elevated CRP — NF-κB inhibition; meta-analysis shows significant CRP reduction')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'herbal', separateFrom: [], notes: ['Phospholipid complex (Meriva) or piperine-enhanced for bioavailability'],
    }));
  } else {
    r = addReason(r, 'curcumin', LAYER, 'Elevated CRP — NF-κB inhibition and systemic inflammation reduction');
  }

  r = ensureOmega3(r, 2000, 'Elevated CRP — EPA and DHA reduce prostaglandin E2 and leukotriene production; lower hs-CRP in RCTs');
  r = ensureMg(r, 400, 'Elevated CRP — magnesium deficiency independently associated with elevated CRP');
  r = ensureVitD(r, 2000, 'Elevated CRP — vitamin D deficiency associated with elevated inflammatory markers');
  return r;
}

// ── High Homocysteine ────────────────────────────────────────────────────────

function handleHighHomocysteine(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'high-homocysteine', 'elevated-homocysteine', 'homocystinuria', 'hyperhomocysteinemia')) return recs;
  let r = recs;

  r = ensureFolate(r, 800, 'High homocysteine — folate is the primary methyl donor for homocysteine remethylation', 9);

  const b12ex = findExistingRec(r, 'vitamin-b12');
  if (b12ex) {
    r = modifyForm(r, 'vitamin-b12', 'methylcobalamin', LAYER, 'High homocysteine — methylcobalamin preferred co-factor for homocysteine remethylation');
    if (b12ex.dose < 1000) r = modifyDose(r, 'vitamin-b12', 1000, LAYER, 'High homocysteine — 1,000 mcg for remethylation pathway support');
  } else {
    r = put(r, makeRec({
      id: 'vitamin-b12', supplementName: 'Vitamin B12 (Methylcobalamin)', form: 'methylcobalamin',
      dose: 1000, doseUnit: 'mcg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('High homocysteine — homocysteine remethylation co-factor; deficiency is leading cause of elevated homocysteine')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 9,
      category: 'vitamin', separateFrom: [], notes: ['Sublingual methylcobalamin for absorption'],
    }));
  }

  if (!findExistingRec(r, 'vitamin-b6')) {
    r = put(r, makeRec({
      id: 'vitamin-b6', supplementName: 'Vitamin B6 (P5P)', form: 'pyridoxal-5-phosphate',
      dose: 50, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('High homocysteine — transsulfuration pathway co-factor; converts homocysteine to cysteine')],
      warnings: ['Do not exceed 200 mg/day — peripheral neuropathy risk'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'vitamin', separateFrom: [], notes: ['Pyridoxal-5-phosphate (P5P) active form preferred'],
    }));
  }

  if (!findExistingRec(r, 'betaine-tmg')) {
    r = put(r, makeRec({
      id: 'betaine-tmg', supplementName: 'Betaine (TMG)', form: 'trimethylglycine',
      dose: 1500, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason("High homocysteine — alternative methyl donor; reduces levels independent of folate status")],
      warnings: ['Avoid in renal disease'], contraindications: [],
      cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'compound', separateFrom: [], notes: ['1,500–3,000 mg/day'],
    }));
  }

  return r;
}

// ── Crohn's Disease ──────────────────────────────────────────────────────────

function handleCrohns(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'crohns', 'crohn-disease', "crohn's-disease", "crohn's")) return recs;
  let r = recs;

  r = ensureVitD(r, 4000, "Crohn's — vitamin D deficiency near-universal in IBD; immune modulation and mucosal healing", 9);

  if (!findExistingRec(r, 'zinc-carnosine')) {
    r = put(r, makeRec({
      id: 'zinc-carnosine', supplementName: 'Zinc Carnosine', form: 'zinc-l-carnosine',
      dose: 75, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason("Crohn's — mucosal healing and gut barrier integrity; RCT evidence in IBD")],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'compound', separateFrom: [], notes: ['PepZin GI (zinc-L-carnosine) preferred form'],
    }));
  }

  if (!findExistingRec(r, 'curcumin')) {
    r = put(r, makeRec({
      id: 'curcumin', supplementName: 'Curcumin (High-Absorption)', form: 'phospholipid-complex',
      dose: 2000, doseUnit: 'mg', frequency: 'daily',
      timing: ['midday'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason("Crohn's — NF-κB inhibition; RCT evidence for remission maintenance in IBD")],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'herbal', separateFrom: [], notes: ['BCM-95 or phospholipid complex form'],
    }));
  }

  r = ensureOmega3(r, 2000, "Crohn's — EPA/DHA anti-inflammatory; reduces relapse rate in maintenance phase");
  return r;
}

// ── Ulcerative Colitis ────────────────────────────────────────────────────────

function handleUlcerativeColitis(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'ulcerative-colitis', 'uc', 'colitis')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'curcumin')) {
    r = put(r, makeRec({
      id: 'curcumin', supplementName: 'Curcumin (High-Absorption)', form: 'phospholipid-complex',
      dose: 2000, doseUnit: 'mg', frequency: 'daily',
      timing: ['midday'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Ulcerative colitis — RCT: curcumin + mesalamine achieves higher remission rates than mesalamine alone')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 9,
      category: 'herbal', separateFrom: [], notes: ['BCM-95 form; use alongside prescribed medications'],
    }));
  }

  if (!findExistingRec(r, 'probiotic-vsl3')) {
    r = put(r, makeRec({
      id: 'probiotic-vsl3', supplementName: 'Probiotic (VSL#3 / High-potency multi-strain)', form: 'multi-strain',
      dose: 450, doseUnit: 'billion CFU', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Ulcerative colitis — VSL#3 RCT: 77% remission induction vs 0% placebo in mild–moderate UC')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 9,
      category: 'probiotic', separateFrom: [], notes: ['VSL#3 is the evidence-based brand; maintain during remission'],
    }));
  }

  r = ensureVitD(r, 4000, 'Ulcerative colitis — vitamin D deficiency common; immune modulation reduces flare risk');
  r = ensureOmega3(r, 2000, 'Ulcerative colitis — EPA/DHA anti-inflammatory; supports mucosal healing');
  return r;
}

// ── GERD / Acid Reflux ────────────────────────────────────────────────────────

function handleGERD(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'gerd', 'acid-reflux', 'heartburn', 'reflux', 'gord')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'deglycyrrhizinated-licorice')) {
    r = put(r, makeRec({
      id: 'deglycyrrhizinated-licorice', supplementName: 'Deglycyrrhizinated Licorice (DGL)', form: 'dgl-extract',
      dose: 760, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('GERD — mucus secretion stimulation and mucosal cytoprotection; comparable to antacids in RCTs')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'herbal', separateFrom: [], notes: ['DGL (deglycyrrhizinated) does not raise blood pressure; chewable preferred; take before meals'],
    }));
  }

  if (!findExistingRec(r, 'zinc-carnosine')) {
    r = put(r, makeRec({
      id: 'zinc-carnosine', supplementName: 'Zinc Carnosine', form: 'zinc-l-carnosine',
      dose: 75, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('GERD — gastric mucosal protection and H. pylori inhibition')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'compound', separateFrom: [], notes: ['Take with or after meals'],
    }));
  }

  return r;
}

// ── Leaky Gut / Intestinal Permeability ──────────────────────────────────────

function handleLeakyGut(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'leaky-gut', 'intestinal-permeability', 'gut-dysbiosis', 'dysbiosis')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'l-glutamine')) {
    r = put(r, makeRec({
      id: 'l-glutamine', supplementName: 'L-Glutamine', form: 'free-form',
      dose: 5000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Leaky gut — primary fuel for enterocytes; maintains tight junction integrity')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'amino-acid', separateFrom: [], notes: ['5–10 g/day on empty stomach; powder form'],
    }));
  }

  if (!findExistingRec(r, 'zinc-carnosine')) {
    r = put(r, makeRec({
      id: 'zinc-carnosine', supplementName: 'Zinc Carnosine', form: 'zinc-l-carnosine',
      dose: 75, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Leaky gut — tight junction protein upregulation and gut mucosal repair')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'compound', separateFrom: [], notes: ['PepZin GI preferred form'],
    }));
  }

  if (!findExistingRec(r, 'probiotic-broad')) {
    r = put(r, makeRec({
      id: 'probiotic-broad', supplementName: 'Multi-Strain Probiotic', form: 'multi-strain',
      dose: 50, doseUnit: 'billion CFU', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Leaky gut — microbiome restoration reduces endotoxin translocation and systemic inflammation')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'probiotic', separateFrom: [], notes: ['Broad multi-strain; refrigerated preferred'],
    }));
  }

  r = ensureVitD(r, 2000, 'Leaky gut — vitamin D receptor in gut epithelium; essential for tight junction protein expression');
  return r;
}

// ── SIBO ─────────────────────────────────────────────────────────────────────

function handleSIBO(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'sibo', 'small-intestinal-bacterial-overgrowth')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'berberine')) {
    r = put(r, makeRec({
      id: 'berberine', supplementName: 'Berberine', form: 'berberine-hcl',
      dose: 500, doseUnit: 'mg', frequency: 'three-times-daily',
      timing: ['morning-with-food', 'midday', 'evening'], withFood: true, evidenceRating: 'Emerging',
      reasons: [makeReason('SIBO — antimicrobial berberine 500 mg three times daily; comparable to rifaximin in small study')],
      warnings: ['May lower blood sugar — caution with diabetes medications'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'herbal', separateFrom: [], notes: ['500 mg three times daily with meals'],
    }));
  }

  if (!findExistingRec(r, 'digestive-enzyme-complex')) {
    r = put(r, makeRec({
      id: 'digestive-enzyme-complex', supplementName: 'Digestive Enzyme Complex', form: 'broad-spectrum',
      dose: 1, doseUnit: 'capsule', frequency: 'three-times-daily',
      timing: ['morning-with-food', 'midday', 'evening'], withFood: true, evidenceRating: 'Emerging',
      reasons: [makeReason('SIBO — improves macronutrient breakdown, reducing fermentable substrate for bacteria')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'enzyme', separateFrom: [], notes: ['Broad-spectrum: amylase, protease, lipase, lactase; with each meal'],
    }));
  }

  if (!findExistingRec(r, 'ginger-root')) {
    r = put(r, makeRec({
      id: 'ginger-root', supplementName: 'Ginger Root Extract', form: 'standardised-extract',
      dose: 1000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Emerging',
      reasons: [makeReason('SIBO — prokinetic action via motilin receptor stimulation; supports migrating motor complex')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 6,
      category: 'herbal', separateFrom: [], notes: ['Take before meals; 500 mg twice daily'],
    }));
  }

  return r;
}

// ── Chronic Constipation ──────────────────────────────────────────────────────

function handleConstipation(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'constipation', 'chronic-constipation')) return recs;
  let r = recs;

  const mgEx = findExistingRec(r, 'magnesium-glycinate');
  if (!mgEx) {
    r = put(r, makeRec({
      id: 'magnesium-glycinate', supplementName: 'Magnesium Citrate', form: 'citrate',
      dose: 400, doseUnit: 'mg', frequency: 'daily',
      timing: ['bedtime'], withFood: false, evidenceRating: 'Strong',
      reasons: [makeReason('Constipation — osmotic laxative effect; draws water into colon; well-tolerated at 300–400 mg')],
      warnings: ['Avoid if kidney disease present'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'mineral', separateFrom: [], notes: ['Take at bedtime; adjust dose to achieve comfortable stools'],
    }));
  } else {
    r = addReason(r, 'magnesium-glycinate', LAYER, 'Constipation — magnesium draws water into colon; osmotic laxative effect');
  }

  if (!findExistingRec(r, 'psyllium-husk')) {
    r = put(r, makeRec({
      id: 'psyllium-husk', supplementName: 'Psyllium Husk', form: 'powder',
      dose: 10, doseUnit: 'g', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Constipation — soluble fibre; Grade A evidence for constipation relief; also lowers LDL')],
      warnings: ['Take with at least 250 ml water to prevent choking/obstruction'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'fiber', separateFrom: [], notes: ['5–10 g/day in divided doses; build up gradually'],
    }));
  }

  return r;
}

// ── Fibromyalgia ──────────────────────────────────────────────────────────────

function handleFibromyalgia(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'fibromyalgia', 'fibro')) return recs;
  let r = recs;

  r = ensureMg(r, 400, 'Fibromyalgia — magnesium deficiency common; supports mitochondrial function and pain signalling');
  r = ensureVitD(r, 4000, 'Fibromyalgia — vitamin D deficiency prevalent; supplementation reduces pain scores in RCT');

  if (!findExistingRec(r, 'coq10')) {
    r = put(r, makeRec({
      id: 'coq10', supplementName: 'CoQ10 (Ubiquinol)', form: 'ubiquinol',
      dose: 300, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Fibromyalgia — mitochondrial dysfunction central to pathology; CoQ10 RCT shows pain and fatigue reduction')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'antioxidant', separateFrom: [], notes: ['Ubiquinol form for better bioavailability'],
    }));
  }

  if (!takesAnyMed(quiz, SEROTONERGIC) && !findExistingRec(r, '5-htp')) {
    r = put(r, makeRec({
      id: '5-htp', supplementName: '5-HTP', form: '5-hydroxytryptophan',
      dose: 100, doseUnit: 'mg', frequency: 'daily',
      timing: ['bedtime'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Fibromyalgia — serotonin precursor; RCT shows symptom improvement including pain and sleep')],
      warnings: ['Do not combine with antidepressants, MAOIs, or triptans without medical supervision'],
      contraindications: ['serotonergic-medications'], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'amino-acid', separateFrom: [], notes: ['Start at 50 mg; titrate after 1 week'],
    }));
  }

  return r;
}

// ── Gout ─────────────────────────────────────────────────────────────────────

function handleGout(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'gout', 'hyperuricemia', 'high-uric-acid')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'vitamin-c')) {
    r = put(r, makeRec({
      id: 'vitamin-c', supplementName: 'Vitamin C', form: 'ascorbic-acid',
      dose: 1000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Gout — uricosuric effect; meta-analysis shows 0.35 mg/dL uric acid reduction per 500 mg vitamin C')],
      warnings: ['Avoid megadoses >2 g in kidney disease'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'vitamin', separateFrom: [], notes: ['500–1,500 mg/day'],
    }));
  } else {
    r = addReason(r, 'vitamin-c', LAYER, 'Gout — uricosuric effect reduces serum uric acid');
  }

  if (!findExistingRec(r, 'tart-cherry-extract')) {
    r = put(r, makeRec({
      id: 'tart-cherry-extract', supplementName: 'Tart Cherry Extract', form: 'montmorency-extract',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Gout — anthocyanins inhibit xanthine oxidase; reduces gout flare frequency')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'herbal', separateFrom: [], notes: ['Montmorency tart cherry; or 240 ml juice daily'],
    }));
  }

  r = ensureMg(r, 400, 'Gout — magnesium inhibits urate crystal nucleation and deposition in joints');
  return r;
}

// ── Heavy Menstrual Bleeding ──────────────────────────────────────────────────

function handleHeavyMenstrualBleeding(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'heavy-menstrual-bleeding', 'menorrhagia', 'heavy-periods', 'heavy-period')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'iron-bisglycinate')) {
    r = put(r, makeRec({
      id: 'iron-bisglycinate', supplementName: 'Iron (Bisglycinate)', form: 'bisglycinate',
      dose: 25, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Strong',
      reasons: [makeReason('Heavy menstrual bleeding — compensates for menstrual blood iron losses; bisglycinate well-tolerated')],
      warnings: ['Do not use if thalassemia or hemochromatosis present'],
      contraindications: ['thalassemia', 'hemochromatosis'], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'mineral', separateFrom: ['zinc-picolinate', 'calcium-citrate'], notes: ['Take with vitamin C for absorption; avoid with tea/coffee'],
    }));
  }

  r = ensureMg(r, 400, 'Heavy menstrual bleeding — magnesium reduces prostaglandin-driven uterine cramping and blood loss');
  return r;
}

// ── Female Fertility ──────────────────────────────────────────────────────────

function handleFemaleFertility(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'female-fertility', 'fertility', 'trying-to-conceive', 'ttc', 'infertility')) return recs;
  let r = recs;

  r = ensureFolate(r, 800, 'Female fertility — methylfolate essential for oocyte quality and early embryo development', 9);
  r = ensureVitD(r, 2000, 'Female fertility — vitamin D deficiency associated with reduced implantation rates and IVF outcomes');
  r = ensureMg(r, 300, 'Female fertility — magnesium supports progesterone production and early embryonic development');

  if (!findExistingRec(r, 'coq10')) {
    r = put(r, makeRec({
      id: 'coq10', supplementName: 'CoQ10 (Ubiquinol)', form: 'ubiquinol',
      dose: 400, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Female fertility — mitochondrial energy in oocytes; RCT shows improved egg quality and IVF outcomes')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 9,
      category: 'antioxidant', separateFrom: [], notes: ['200–600 mg/day; ubiquinol form preferred'],
    }));
  }

  if (!findExistingRec(r, 'nac')) {
    r = put(r, makeRec({
      id: 'nac', supplementName: 'N-Acetyl Cysteine (NAC)', form: 'nac',
      dose: 600, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Female fertility — antioxidant glutathione precursor; improves ovulation rates and egg quality')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'amino-acid', separateFrom: [], notes: ['600 mg/day'],
    }));
  }

  r = ensureOmega3(r, 2000, 'Female fertility — DHA incorporation into oocyte membranes critical for fertilisation and embryo quality');
  return r;
}

// ── Uterine Fibroids ──────────────────────────────────────────────────────────

function handleUterineFibroids(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'uterine-fibroids', 'fibroids', 'uterine-leiomyoma')) return recs;
  let r = recs;

  r = ensureVitD(r, 4000, 'Uterine fibroids — vitamin D receptor deficiency promotes fibroid growth; supplementation reduces volume in RCT');

  if (!findExistingRec(r, 'green-tea-egcg')) {
    r = put(r, makeRec({
      id: 'green-tea-egcg', supplementName: 'Green Tea Extract (EGCG)', form: 'egcg-extract',
      dose: 800, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Uterine fibroids — RCT: EGCG 800 mg/day for 4 months reduced fibroid volume by 32.6%')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'herbal', separateFrom: [], notes: ['Standardised to ≥45% EGCG; avoid on empty stomach'],
    }));
  }

  if (!findExistingRec(r, 'iron-bisglycinate')) {
    r = put(r, makeRec({
      id: 'iron-bisglycinate', supplementName: 'Iron (Bisglycinate)', form: 'bisglycinate',
      dose: 25, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Strong',
      reasons: [makeReason('Uterine fibroids — compensates for blood loss from fibroid-related heavy bleeding')],
      warnings: ['Do not use if thalassemia present'],
      contraindications: ['thalassemia'], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'mineral', separateFrom: ['zinc-picolinate', 'calcium-citrate'], notes: ['Take with vitamin C; avoid with tea/coffee'],
    }));
  }

  return r;
}

// ── BPH (Benign Prostatic Hyperplasia) ───────────────────────────────────────

function handleBPH(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'bph', 'benign-prostatic-hyperplasia', 'enlarged-prostate', 'prostate-enlargement')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'saw-palmetto')) {
    r = put(r, makeRec({
      id: 'saw-palmetto', supplementName: 'Saw Palmetto', form: 'liposterolic-extract',
      dose: 320, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('BPH — 5-alpha reductase inhibition; Cochrane review shows modest improvement in LUTS')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'herbal', separateFrom: [], notes: ['Fat-soluble liposterolic extract; 160 mg twice daily'],
    }));
  }

  if (!findExistingRec(r, 'beta-sitosterol')) {
    r = put(r, makeRec({
      id: 'beta-sitosterol', supplementName: 'Beta-Sitosterol', form: 'plant-sterol',
      dose: 60, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('BPH — meta-analysis shows significant improvement in urine flow and residual volume vs placebo')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'compound', separateFrom: [], notes: ['20 mg three times daily'],
    }));
  }

  r = ensureZinc(r, 25, 'BPH — prostate zinc concentration highest in body; deficiency associated with BPH progression');
  return r;
}

// ── Low Testosterone ──────────────────────────────────────────────────────────

function handleLowTestosterone(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'low-testosterone', 'hypogonadism', 'low-t', 'testosterone-deficiency')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'ashwagandha-ksm66')) {
    r = put(r, makeRec({
      id: 'ashwagandha-ksm66', supplementName: 'Ashwagandha (KSM-66)', form: 'ksm-66-extract',
      dose: 600, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Low testosterone — RCT: KSM-66 increases testosterone 17% vs placebo while reducing cortisol')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_6ON1OFF, priority: 8,
      category: 'adaptogen', separateFrom: [], notes: ['300 mg twice daily'],
    }));
  } else {
    r = addReason(r, 'ashwagandha-ksm66', LAYER, 'Low testosterone — KSM-66 increases testosterone via cortisol/stress pathway');
  }

  r = ensureZinc(r, 30, 'Low testosterone — essential cofactor for testosterone synthesis; deficiency directly reduces testosterone', 8);
  r = ensureVitD(r, 3000, 'Low testosterone — vitamin D receptor in Leydig cells; supplementation increases testosterone in deficient men');
  r = ensureMg(r, 400, 'Low testosterone — magnesium reduces SHBG binding, increasing free testosterone');
  return r;
}

// ── Male Fertility ────────────────────────────────────────────────────────────

function handleMaleFertility(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'male-fertility', 'low-sperm', 'sperm-quality', 'sperm-motility', 'male-infertility')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'coq10')) {
    r = put(r, makeRec({
      id: 'coq10', supplementName: 'CoQ10 (Ubiquinol)', form: 'ubiquinol',
      dose: 400, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Male fertility — meta-analysis: CoQ10 improves sperm concentration, motility, and morphology')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 9,
      category: 'antioxidant', separateFrom: [], notes: ['200–400 mg/day; ubiquinol preferred'],
    }));
  }

  r = ensureZinc(r, 30, 'Male fertility — essential for spermatogenesis and testosterone synthesis; deficiency impairs sperm parameters', 8);

  if (!findExistingRec(r, 'selenium')) {
    r = put(r, makeRec({
      id: 'selenium', supplementName: 'Selenium (L-Selenomethionine)', form: 'l-selenomethionine',
      dose: 200, doseUnit: 'mcg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Male fertility — selenoprotein critical for sperm tail formation and motility; deficiency causes subfertility')],
      warnings: ['Do not exceed 400 mcg/day'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'mineral', separateFrom: [], notes: ['L-selenomethionine preferred'],
    }));
  }

  if (!findExistingRec(r, 'l-carnitine')) {
    r = put(r, makeRec({
      id: 'l-carnitine', supplementName: 'L-Carnitine', form: 'l-carnitine-fumarate',
      dose: 2000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Male fertility — sperm mitochondrial energy transport; meta-analysis shows improved motility')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'amino-acid', separateFrom: [], notes: ['1–3 g/day; acetyl-L-carnitine or L-carnitine fumarate'],
    }));
  }

  r = ensureFolate(r, 800, 'Male fertility — folate essential for DNA methylation in spermatogenesis');
  r = ensureOmega3(r, 2000, 'Male fertility — DHA incorporated into sperm membranes; critical for sperm motility and fertilisation');
  return r;
}

// ── Erectile Dysfunction ──────────────────────────────────────────────────────

function handleErectileDysfunction(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'erectile-dysfunction', 'ed', 'impotence')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'l-citrulline')) {
    r = put(r, makeRec({
      id: 'l-citrulline', supplementName: 'L-Citrulline', form: 'l-citrulline',
      dose: 3000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Erectile dysfunction — nitric oxide precursor via arginine; RCT shows improved erection hardness score')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'amino-acid', separateFrom: [], notes: ['1.5–3 g/day; watermelon extract equivalent'],
    }));
  }

  if (!findExistingRec(r, 'pine-bark-extract')) {
    r = put(r, makeRec({
      id: 'pine-bark-extract', supplementName: 'Pine Bark Extract (Pycnogenol)', form: 'pycnogenol',
      dose: 120, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Erectile dysfunction — eNOS stimulation; combined with L-citrulline shows additive benefit')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'antioxidant', separateFrom: [], notes: ['40–120 mg/day; Pycnogenol brand has most evidence'],
    }));
  }

  if (!findExistingRec(r, 'panax-ginseng')) {
    r = put(r, makeRec({
      id: 'panax-ginseng', supplementName: 'Panax Ginseng (Korean Red)', form: 'standardised-extract',
      dose: 900, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Erectile dysfunction — ginsenosides stimulate NO production; systematic review confirms ED benefit')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_6ON1OFF, priority: 7,
      category: 'adaptogen', separateFrom: [], notes: ['600–1,000 mg standardised extract; avoid >12 weeks continuously'],
    }));
  }

  r = ensureVitD(r, 2000, 'Erectile dysfunction — vitamin D deficiency associated with endothelial dysfunction and reduced NO production');
  r = ensureZinc(r, 30, 'Erectile dysfunction — zinc essential for testosterone synthesis and NO signalling');
  return r;
}

// ── Eczema / Atopic Dermatitis ────────────────────────────────────────────────

function handleEczema(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'eczema', 'atopic-dermatitis', 'atopic-eczema')) return recs;
  let r = recs;

  r = ensureOmega3(r, 2000, 'Eczema — EPA/DHA reduce skin inflammation and improve barrier function');
  r = ensureVitD(r, 2000, 'Eczema — vitamin D deficiency linked to impaired skin barrier and increased IgE; supplementation reduces SCORAD');

  if (!findExistingRec(r, 'evening-primrose-oil')) {
    r = put(r, makeRec({
      id: 'evening-primrose-oil', supplementName: 'Evening Primrose Oil', form: 'gla-rich-oil',
      dose: 3000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Eczema — GLA reduces skin inflammation and transepidermal water loss')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'omega-fatty-acid', separateFrom: [], notes: ['500 mg GLA equivalent daily; takes 3–6 months for full effect'],
    }));
  }

  if (!findExistingRec(r, 'probiotic-broad')) {
    r = put(r, makeRec({
      id: 'probiotic-broad', supplementName: 'Multi-Strain Probiotic', form: 'lactobacillus-predominant',
      dose: 10, doseUnit: 'billion CFU', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Eczema — gut-skin axis; Lactobacillus rhamnosus GG reduces eczema severity score (SCORAD)')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'probiotic', separateFrom: [], notes: ['Lactobacillus-predominant strains preferred for atopic conditions'],
    }));
  }

  return r;
}

// ── Psoriasis ────────────────────────────────────────────────────────────────

function handlePsoriasis(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'psoriasis', 'psoriatic-arthritis')) return recs;
  let r = recs;

  r = ensureOmega3(r, 3000, 'Psoriasis — EPA/DHA reduce leukotriene B4 production; meta-analysis shows PASI score improvement');
  r = ensureVitD(r, 4000, 'Psoriasis — vitamin D analogues are FDA-approved topical treatment; systemic D3 reduces PASI in deficient patients');

  if (!findExistingRec(r, 'curcumin')) {
    r = put(r, makeRec({
      id: 'curcumin', supplementName: 'Curcumin (High-Absorption)', form: 'bcm-95',
      dose: 2000, doseUnit: 'mg', frequency: 'daily',
      timing: ['midday'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Psoriasis — NF-κB and TNF-α inhibition; RCT shows reduction in PASI score')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'herbal', separateFrom: [], notes: ['BCM-95 or phospholipid complex for bioavailability'],
    }));
  }

  return r;
}

// ── Frequent Infections / Immune Support ──────────────────────────────────────

function handleFrequentInfections(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'frequent-infections', 'low-immunity', 'weakened-immune-system', 'recurrent-infections', 'immune-deficiency')) return recs;
  let r = recs;

  r = ensureVitD(r, 2000, 'Frequent infections — vitamin D activates innate immune defences; deficiency doubles respiratory infection risk');

  if (!findExistingRec(r, 'vitamin-c')) {
    r = put(r, makeRec({
      id: 'vitamin-c', supplementName: 'Vitamin C', form: 'ascorbic-acid',
      dose: 1000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Frequent infections — meta-analysis: vitamin C reduces cold duration 14%; supports neutrophil function')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'vitamin', separateFrom: [], notes: ['500–1,000 mg/day; increase to 2 g at onset of illness'],
    }));
  } else {
    r = addReason(r, 'vitamin-c', LAYER, 'Frequent infections — supports neutrophil function and reduces upper respiratory infection duration');
  }

  r = ensureZinc(r, 25, 'Frequent infections — Cochrane review: zinc reduces cold duration by 33%; essential for lymphocyte function');

  if (!findExistingRec(r, 'elderberry-extract') && !hasCond(quiz, 'autoimmune', 'lupus', 'sle', 'rheumatoid-arthritis', 'ra', 'hashimotos')) {
    r = put(r, makeRec({
      id: 'elderberry-extract', supplementName: 'Elderberry Extract', form: 'sambucus-nigra-extract',
      dose: 600, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Frequent infections — meta-analysis: elderberry reduces cold duration by 2 days and severity significantly')],
      warnings: ['Autoimmune disease caution — immune stimulant'],
      contraindications: ['autoimmune'], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'herbal', separateFrom: [], notes: ['Sambucus nigra standardised extract'],
    }));
  }

  return r;
}

// ── Long COVID / Post-viral Fatigue ──────────────────────────────────────────

function handleLongCOVID(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'long-covid', 'post-covid', 'post-viral-fatigue', 'long-haul-covid', 'post-viral-syndrome')) return recs;
  let r = recs;

  r = ensureVitD(r, 4000, 'Long COVID — vitamin D deficiency associated with severe COVID outcomes and prolonged symptoms');
  r = ensureOmega3(r, 2000, 'Long COVID — EPA/DHA reduce neuroinflammation and cytokine storm aftermath');

  if (!findExistingRec(r, 'nac')) {
    r = put(r, makeRec({
      id: 'nac', supplementName: 'N-Acetyl Cysteine (NAC)', form: 'nac',
      dose: 1200, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food', 'evening'], withFood: true, evidenceRating: 'Emerging',
      reasons: [makeReason('Long COVID — glutathione precursor; 1,200 mg/day reduces oxidative stress; emerging evidence for post-COVID recovery')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 9,
      category: 'amino-acid', separateFrom: [], notes: ['600 mg twice daily'],
    }));
  }

  if (!findExistingRec(r, 'coq10')) {
    r = put(r, makeRec({
      id: 'coq10', supplementName: 'CoQ10 (Ubiquinol)', form: 'ubiquinol',
      dose: 400, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Emerging',
      reasons: [makeReason('Long COVID — mitochondrial dysfunction hypothesis; CoQ10 deficiency documented in long COVID')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'antioxidant', separateFrom: [], notes: ['Ubiquinol form; 200–400 mg/day'],
    }));
  }

  if (!findExistingRec(r, 'nattokinase')) {
    r = put(r, makeRec({
      id: 'nattokinase', supplementName: 'Nattokinase', form: 'nattokinase-enzyme',
      dose: 2000, doseUnit: 'FU', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Emerging',
      reasons: [makeReason('Long COVID — fibrinolytic enzyme; microclot dissolution hypothesis; case series evidence')],
      warnings: ['Anticoagulant effect — do not use with blood thinners without medical supervision'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'enzyme', separateFrom: [], notes: ['100 mg / 2,000 FU; take on empty stomach'],
    }));
  }

  return r;
}

// ── Restless Legs Syndrome ────────────────────────────────────────────────────

function handleRLS(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'rls', 'restless-legs', 'restless-leg-syndrome', 'restless-legs-syndrome')) return recs;
  let r = recs;

  r = ensureMg(r, 400, 'RLS — magnesium modulates NMDA receptors and reduces dopaminergic neurotransmission dysregulation in RLS');
  r = ensureVitD(r, 2000, 'RLS — vitamin D deficiency linked to increased RLS severity; supplementation reduces symptoms');

  if (!findExistingRec(r, 'iron-bisglycinate')) {
    r = put(r, makeRec({
      id: 'iron-bisglycinate', supplementName: 'Iron (Bisglycinate)', form: 'bisglycinate',
      dose: 25, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Strong',
      reasons: [makeReason('RLS — iron deficiency (ferritin <75 mcg/L) is leading treatable cause; iron repletion resolves symptoms in many cases')],
      warnings: ['Test ferritin first; avoid if thalassemia or hemochromatosis'],
      contraindications: ['thalassemia', 'hemochromatosis'], cyclingPattern: CYCLE_DAILY, priority: 9,
      category: 'mineral', separateFrom: ['zinc-picolinate', 'calcium-citrate'], notes: ['Bisglycinate well tolerated; take with vitamin C'],
    }));
  }

  r = ensureFolate(r, 800, 'RLS — folate deficiency associated with RLS; 5-MTHF preferred for MTHFR variants');
  return r;
}

// ── Kidney Stones ─────────────────────────────────────────────────────────────

function handleKidneyStones(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'kidney-stones', 'nephrolithiasis', 'calcium-oxalate-stones', 'renal-calculi')) return recs;
  let r = recs;

  const mgEx = findExistingRec(r, 'magnesium-glycinate');
  if (!mgEx) {
    r = put(r, makeRec({
      id: 'magnesium-glycinate', supplementName: 'Magnesium Citrate', form: 'citrate',
      dose: 400, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Kidney stones — binds oxalate in gut reducing absorption; inhibits calcium oxalate crystal formation in urine')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'mineral', separateFrom: [], notes: ['Citrate form specifically reduces stone recurrence'],
    }));
  } else {
    r = addReason(r, 'magnesium-glycinate', LAYER, 'Kidney stones — magnesium citrate inhibits oxalate crystal formation');
  }

  if (!findExistingRec(r, 'vitamin-b6')) {
    r = put(r, makeRec({
      id: 'vitamin-b6', supplementName: 'Vitamin B6 (P5P)', form: 'pyridoxal-5-phosphate',
      dose: 25, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Kidney stones — reduces urinary oxalate excretion by diverting glyoxylate metabolism; RCT evidence')],
      warnings: ['Do not exceed 100 mg/day'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'vitamin', separateFrom: [], notes: ['P5P active form'],
    }));
  }

  const vitC = findExistingRec(r, 'vitamin-c');
  if (vitC && vitC.dose > 1000) {
    r = r.map(rec => rec.id === 'vitamin-c' ? {
      ...rec,
      warnings: [...(rec.warnings ?? []), 'Kidney stones: vitamin C >1,000 mg/day increases urinary oxalate — limit to 500 mg/day'],
    } : rec);
  }

  return r;
}

// ── Urinary Tract Infections (Recurrent) ─────────────────────────────────────

function handleUTI(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'uti', 'urinary-tract-infection', 'recurrent-uti', 'cystitis', 'recurrent-cystitis')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'cranberry-extract')) {
    r = put(r, makeRec({
      id: 'cranberry-extract', supplementName: 'Cranberry Extract (PAC)', form: 'pac-standardised',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Recurrent UTI — proanthocyanidins (PAC type-A) prevent E. coli adhesion; meta-analysis confirms UTI recurrence reduction')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'herbal', separateFrom: [], notes: ['Standardised to 36 mg PAC; not juice (insufficient concentration)'],
    }));
  }

  if (!findExistingRec(r, 'd-mannose')) {
    r = put(r, makeRec({
      id: 'd-mannose', supplementName: 'D-Mannose', form: 'd-mannose-powder',
      dose: 2000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Recurrent UTI — competitive inhibitor of E. coli adhesion; RCT comparable to nitrofurantoin for UTI prevention')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'compound', separateFrom: [], notes: ['1–2 g twice daily; may use prophylactically'],
    }));
  }

  if (!findExistingRec(r, 'vitamin-c')) {
    r = put(r, makeRec({
      id: 'vitamin-c', supplementName: 'Vitamin C', form: 'ascorbic-acid',
      dose: 1000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Recurrent UTI — urinary acidification inhibits bacterial growth')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 6,
      category: 'vitamin', separateFrom: [], notes: ['500–2,000 mg/day'],
    }));
  } else {
    r = addReason(r, 'vitamin-c', LAYER, 'Recurrent UTI — urinary acidification inhibits bacterial growth');
  }

  return r;
}

// ── Iron Deficiency Anemia ────────────────────────────────────────────────────

function handleIronDeficiencyAnemia(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'iron-deficiency-anemia', 'iron-deficiency', 'iron-deficiency-anaemia', 'anemia', 'anaemia')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'iron-bisglycinate')) {
    r = put(r, makeRec({
      id: 'iron-bisglycinate', supplementName: 'Iron (Bisglycinate)', form: 'bisglycinate',
      dose: 25, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Strong',
      reasons: [makeReason('Iron deficiency anemia — bisglycinate has high bioavailability and low GI side effects')],
      warnings: ['Do not use if thalassemia or hemochromatosis present; test ferritin before supplementing'],
      contraindications: ['thalassemia', 'hemochromatosis'], cyclingPattern: CYCLE_DAILY, priority: 9,
      category: 'mineral', separateFrom: ['zinc-picolinate', 'calcium-citrate'], notes: ['Take with vitamin C; separate from tea, coffee, calcium by 2 hours'],
    }));
  }

  if (!findExistingRec(r, 'vitamin-c')) {
    r = put(r, makeRec({
      id: 'vitamin-c', supplementName: 'Vitamin C', form: 'ascorbic-acid',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Iron deficiency anemia — reduces Fe3+ to Fe2+; increases non-haem iron absorption 2-4-fold')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'vitamin', separateFrom: [], notes: ['Take simultaneously with iron supplement'],
    }));
  } else {
    r = addReason(r, 'vitamin-c', LAYER, 'Iron deficiency anemia — take with iron supplement to enhance non-haem iron absorption');
  }

  return r;
}

// ── Vitamin B12 Deficiency Anemia ─────────────────────────────────────────────

function handleB12Anemia(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'b12-deficiency', 'b12-anemia', 'pernicious-anemia', 'megaloblastic-anemia', 'cobalamin-deficiency', 'b12-anaemia', 'pernicious-anaemia')) return recs;
  let r = recs;

  const b12ex = findExistingRec(r, 'vitamin-b12');
  if (b12ex) {
    r = modifyDose(r, 'vitamin-b12', Math.max(b12ex.dose, 2000), LAYER, 'B12 deficiency — 2,000 mcg for deficiency repletion; high-dose oral as effective as IM injections');
    r = modifyForm(r, 'vitamin-b12', 'methylcobalamin', LAYER, 'B12 deficiency — methylcobalamin preferred form');
    r = r.map(rec => rec.id === 'vitamin-b12' ? { ...rec, priority: Math.max(rec.priority, 10) } : rec);
  } else {
    r = put(r, makeRec({
      id: 'vitamin-b12', supplementName: 'Vitamin B12 (Methylcobalamin)', form: 'methylcobalamin',
      dose: 2000, doseUnit: 'mcg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('B12 deficiency / pernicious anemia — high-dose oral B12 (2,000 mcg) as effective as IM injections for repletion')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 10,
      category: 'vitamin', separateFrom: [], notes: ['Sublingual methylcobalamin; 2,000 mcg for repletion, 1,000 mcg maintenance'],
    }));
  }

  r = ensureFolate(r, 400, 'B12 deficiency — folate co-factor for DNA synthesis; supplement alongside B12 to unmask mixed deficiency');
  return r;
}

// ── Wound Healing ────────────────────────────────────────────────────────────

function handleWoundHealing(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!hasCond(quiz, 'wound-healing', 'slow-wound-healing', 'post-surgery', 'post-surgical', 'surgical-recovery')) return recs;
  let r = recs;

  if (!findExistingRec(r, 'vitamin-c')) {
    r = put(r, makeRec({
      id: 'vitamin-c', supplementName: 'Vitamin C', form: 'ascorbic-acid',
      dose: 1000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Wound healing — rate-limiting co-factor for collagen synthesis; deficiency dramatically impairs healing')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 8,
      category: 'vitamin', separateFrom: [], notes: ['500–2,000 mg/day during recovery'],
    }));
  } else {
    r = addReason(r, 'vitamin-c', LAYER, 'Wound healing — collagen synthesis co-factor; essential for fibroblast function and tissue repair');
  }

  r = ensureZinc(r, 30, 'Wound healing — metalloenzyme co-factor for collagenase, fibroblast proliferation, and immune defence at wound site', 8);

  if (!findExistingRec(r, 'bromelain')) {
    r = put(r, makeRec({
      id: 'bromelain', supplementName: 'Bromelain', form: 'pineapple-proteolytic-enzyme',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Wound healing — proteolytic enzyme; reduces post-surgical oedema and bruising')],
      warnings: ['Antiplatelet effect — caution pre/post surgery with blood thinners'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'enzyme', separateFrom: [], notes: ['Between meals on empty stomach'],
    }));
  }

  r = ensureVitD(r, 2000, 'Wound healing — vitamin D modulates macrophage function and inflammatory phase of wound healing');
  return r;
}


// ─── PPI DEPLETION ───────────────────────────────────────────────────────────

/**
 * PPI medications (omeprazole, etc.) reduce stomach acid, impairing absorption
 * of B12, magnesium, and calcium over long-term use.
 */
function handlePPIDepletion(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!takesAnyMed(quiz, PPI_MEDS)) return recs;

  let r = recs;

  // B12 — PPI reduces gastric acid needed for B12 liberation from food
  if (!findExistingRec(r, 'vitamin-b12')) {
    r = put(r, makeRec({
      id: 'vitamin-b12',
      supplementName: 'Vitamin B12',
      form: 'methylcobalamin',
      dose: 1000,
      doseUnit: 'mcg',
      frequency: 'daily',
      timing: ['morning-empty'],
      withFood: false,
      evidenceRating: 'Strong',
      reasons: [makeReason('PPI use — proton pump inhibitors reduce gastric acid, impairing B12 liberation from food; sublingual or high-dose oral repletion recommended')],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 8,
      category: 'vitamin',
      separateFrom: [],
      notes: ['Sublingual form bypasses acid-dependent absorption'],
    }));
  } else {
    r = addReason(r, 'vitamin-b12', LAYER, 'PPI use — long-term PPI therapy impairs B12 absorption');
  }

  // Magnesium — PPI reduces active magnesium transport in the gut
  r = ensureMg(r, 400, 'PPI use — proton pump inhibitors impair intestinal magnesium absorption; hypomagnesemia reported in 10–15% of long-term users', 7);

  // Calcium — PPI reduces calcium absorption (acid-dependent solubility)
  if (!findExistingRec(r, 'calcium-citrate')) {
    r = put(r, makeRec({
      id: 'calcium-citrate',
      supplementName: 'Calcium Citrate',
      form: 'citrate',
      dose: 600,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['evening'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [makeReason('PPI use — reduced stomach acid impairs calcium carbonate absorption; citrate form is acid-independent and preferred for PPI users')],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 7,
      category: 'mineral',
      separateFrom: ['iron-bisglycinate'],
      notes: ['Calcium citrate preferred over carbonate — does not require stomach acid for absorption'],
    }));
  } else {
    r = addReason(r, 'calcium-citrate', LAYER, 'PPI use — long-term PPI therapy reduces calcium absorption');
  }

  return r;
}

// ─── STATIN DEPLETION (medication-based, condition-independent) ──────────────

/**
 * Statin medications deplete CoQ10 regardless of diagnosis. This ensures
 * CoQ10 is added even if the user doesn't report high cholesterol.
 */
function handleStatinDepletion(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  if (!takesAnyMed(quiz, STATINS)) return recs;

  let r = recs;
  if (!findExistingRec(r, 'coq10-ubiquinol')) {
    r = put(r, makeRec({
      id: 'coq10-ubiquinol',
      supplementName: 'CoQ10 (Ubiquinol)',
      form: 'ubiquinol',
      dose: 200,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [makeReason('Statin therapy — statins inhibit the mevalonate pathway, depleting endogenous CoQ10; 200 mg reduces myopathy risk and fatigue')],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 8,
      category: 'antioxidant',
      separateFrom: [],
      notes: ['Ubiquinol (reduced form) has superior absorption'],
    }));
  } else {
    r = addReason(r, 'coq10-ubiquinol', LAYER, 'Statin therapy — statins deplete CoQ10; supplementation reduces myopathy risk');
  }
  return r;
}

// ─── MAIN DISPATCH TABLE ──────────────────────────────────────────────────────

/**
 * Layer 4 — Health Conditions.
 *
 * Applies condition-specific supplement protocols in a defined order.
 * Safety blocks run last to ensure any supplements added by condition handlers
 * are correctly filtered.
 *
 * Post-processing:
 *   - postProcessCopper: adds copper 2 mg if total zinc > 25 mg
 *   - postProcessWarfarinK: adds warfarin warning to vitamin K supplements
 */
export const layer4Conditions = (quiz: QuizData, recs: Recommendation[]): Recommendation[] => {
  let r = recs;

  // ── Mental Health ────────────────────────────────────────────────────────────
  r = handleAnxiety(quiz, r);
  r = handleDepression(quiz, r);
  r = handleBipolar(quiz, r);
  r = handleADHD(quiz, r);
  r = handleOCD(quiz, r);
  r = handleCognitiveBrainFog(quiz, r);
  r = handleNeuropathy(quiz, r);
  r = handleAlzheimers(quiz, r);
  r = handleEpilepsy(quiz, r);
  r = handleTinnitus(quiz, r);

  // ── Endocrine ────────────────────────────────────────────────────────────────
  r = handleHashimotos(quiz, r);         // Hashimotos before general hypothyroid (removes iodine)
  r = handleHypothyroidism(quiz, r);
  r = handleHyperthyroidism(quiz, r);    // Hyperthyroidism removes iodine
  r = handleDiabetesType2(quiz, r);
  r = handlePCOS(quiz, r);
  r = handleInsResistance(quiz, r);
  r = handleAdrenalFatigue(quiz, r);

  // ── Cardiovascular ───────────────────────────────────────────────────────────
  r = handleHypertension(quiz, r);
  r = handleHighCholesterol(quiz, r);
  r = handleHighCRP(quiz, r);
  r = handleHighHomocysteine(quiz, r);

  // ── GI ───────────────────────────────────────────────────────────────────────
  r = handleIBS(quiz, r);
  r = handleCeliac(quiz, r);
  r = handleCrohns(quiz, r);
  r = handleUlcerativeColitis(quiz, r);
  r = handleGERD(quiz, r);
  r = handleLeakyGut(quiz, r);
  r = handleSIBO(quiz, r);
  r = handleConstipation(quiz, r);

  // ── Musculoskeletal ──────────────────────────────────────────────────────────
  r = handleOsteoporosis(quiz, r);
  r = handleRheumatoidArthritis(quiz, r);
  r = handleOsteoarthritis(quiz, r);
  r = handleFibromyalgia(quiz, r);
  r = handleGout(quiz, r);

  // ── Women's Health ───────────────────────────────────────────────────────────
  r = handlePMSPMDD(quiz, r);
  r = handleMenopause(quiz, r);
  r = handleHeavyMenstrualBleeding(quiz, r);
  r = handleFemaleFertility(quiz, r);
  r = handleUterineFibroids(quiz, r);

  // ── Men's Health ─────────────────────────────────────────────────────────────
  r = handleBPH(quiz, r);
  r = handleLowTestosterone(quiz, r);
  r = handleMaleFertility(quiz, r);
  r = handleErectileDysfunction(quiz, r);

  // ── Skin ─────────────────────────────────────────────────────────────────────
  r = handleHairLoss(quiz, r);
  r = handleAcne(quiz, r);
  r = handleEczema(quiz, r);
  r = handlePsoriasis(quiz, r);

  // ── Immune / Autoimmune ──────────────────────────────────────────────────────
  r = handleAutoimmune(quiz, r);
  r = handleChronicFatigue(quiz, r);
  r = handleFrequentInfections(quiz, r);
  r = handleLongCOVID(quiz, r);

  // ── Respiratory ─────────────────────────────────────────────────────────────
  r = handleAsthma(quiz, r);

  // ── Eye ──────────────────────────────────────────────────────────────────────
  r = handleAMD(quiz, r);

  // ── Sleep ────────────────────────────────────────────────────────────────────
  r = handleRLS(quiz, r);

  // ── Kidney / Urinary ─────────────────────────────────────────────────────────
  r = handleCKD(quiz, r);
  r = handleKidneyStones(quiz, r);
  r = handleUTI(quiz, r);

  // ── Liver ────────────────────────────────────────────────────────────────────
  r = handleNAFLD(quiz, r);

  // ── Neurological ─────────────────────────────────────────────────────────────
  r = handleMigraines(quiz, r);

  // ── Blood / Anemia ───────────────────────────────────────────────────────────
  r = handleIronDeficiencyAnemia(quiz, r);
  r = handleB12Anemia(quiz, r);

  // ── Recovery ─────────────────────────────────────────────────────────────────
  r = handleWoundHealing(quiz, r);

  // ── Safety blocks ────────────────────────────────────────────────────────────
  r = handleThalassemia(quiz, r);        // Must run before post-processing (removes iron)
  r = blockBetaCaroteneForSmokers(quiz, r);
  r = blockEchinaceaForAutoimmune(quiz, r);

  // ── Medication depletion (condition-independent) ────────────────────────────
  r = handleStatinDepletion(quiz, r);
  r = handlePPIDepletion(quiz, r);

  // ── Post-processing ──────────────────────────────────────────────────────────
  r = postProcessCopper(r);
  r = postProcessWarfarinK(r, quiz);

  return r;
};
