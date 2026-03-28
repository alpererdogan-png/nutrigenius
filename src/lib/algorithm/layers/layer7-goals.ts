// ─────────────────────────────────────────────────────────────────────────────
// NutriGenius — Layer 7: Health Goals
//
// The final "polish" layer. Adds goal-specific supplements NOT already in the
// protocol, then applies a hard cap of 10 supplements sorted by priority.
//
// Rules:
//   • Only add supplements NOT already present (use put() which calls addOrModify,
//     and guard with !findExistingRec before each add).
//   • Minimum Moderate evidence required; Longevity allows Emerging if labeled.
//   • Check smokerFlag — NEVER add beta-carotene.
//   • Check allergyFlags / quiz.allergies — respect all allergies.
//   • Check medications for sedation / interaction warnings.
//   • Hard cap: 10 supplements maximum.
//     - Sort by priority desc, then by layer (earlier = higher score),
//       then by evidenceRating.
//     - Removed items stored in removedForCap for premium upsell display.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Recommendation,
  QuizData,
  LayerName,
  LayerSource,
  RecommendationReason,
  CYCLE_DAILY,
  CYCLE_6ON1OFF,
} from '../types';

import {
  findExistingRec,
  addOrModify,
  modifyDose,
  addReason,
} from './layer1-demographic';

// ─── LAYER CONSTANT ───────────────────────────────────────────────────────────

const LAYER: LayerName = 'goals';
const MAX_SUPPLEMENTS = 10;

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

const put = (recs: Recommendation[], rec: Recommendation): Recommendation[] =>
  addOrModify(recs, rec, LAYER);

function addNote(recs: Recommendation[], id: string, note: string): Recommendation[] {
  return recs.map(r =>
    r.id === id && !r.notes.includes(note) ? { ...r, notes: [...r.notes, note] } : r,
  );
}

function addWarning(recs: Recommendation[], id: string, warning: string): Recommendation[] {
  return recs.map(r =>
    r.id === id && !r.warnings.includes(warning)
      ? { ...r, warnings: [...r.warnings, warning] }
      : r,
  );
}

// ─── QUERY HELPERS ────────────────────────────────────────────────────────────

function hasGoal(quiz: QuizData, ...ids: string[]): boolean {
  const goals = quiz.healthGoals.map(g => g.toLowerCase());
  return ids.some(id => goals.includes(id));
}

function hasCond(quiz: QuizData, ...ids: string[]): boolean {
  const conds = quiz.healthConditions.map(c => c.toLowerCase());
  return ids.some(id => conds.some(c => c.includes(id)));
}

function hasAllergy(quiz: QuizData, ...allergens: string[]): boolean {
  const allergies = quiz.allergies.map(a => a.toLowerCase());
  return allergens.some(a => allergies.includes(a));
}

const BENZO_MEDS = new Set([
  'benzodiazepine', 'diazepam', 'lorazepam', 'alprazolam', 'clonazepam',
  'temazepam', 'oxazepam', 'chlordiazepoxide', 'midazolam', 'triazolam',
  'nitrazepam', 'flurazepam', 'clorazepate',
]);

function takesBenzo(quiz: QuizData): boolean {
  return quiz.medications.some(m =>
    [...BENZO_MEDS].some(b => m.toLowerCase().includes(b)),
  );
}

const AUTOIMMUNE_CONDS = [
  'autoimmune', 'lupus', 'rheumatoid', 'multiple-sclerosis', 'ms',
  'hashimotos', 'graves', 'psoriasis', 'sjogrens', 'ankylosing',
  'crohns', 'ulcerative-colitis', 'celiac', 'myasthenia', 'vitiligo',
  'type-1-diabetes', 'addisons', 'alopecia-areata',
];

function isAutoimmune(quiz: QuizData): boolean {
  return hasCond(quiz, ...AUTOIMMUNE_CONDS);
}

/** Returns the preferred omega-3 supplement ID given current recs + allergies. */
function getOmega3Id(recs: Recommendation[], quiz: QuizData): string {
  if (findExistingRec(recs, 'dha-algae')) return 'dha-algae';
  if (findExistingRec(recs, 'omega-3-fish-oil')) return 'omega-3-fish-oil';
  return hasAllergy(quiz, 'fish', 'shellfish') ? 'dha-algae' : 'omega-3-fish-oil';
}

/** True if the recs already contain at least one notable B-vitamin. */
function hasBVitamins(recs: Recommendation[]): boolean {
  return ['vitamin-b12', 'vitamin-b6', 'folate-5mthf', 'folic-acid',
    'b-complex', 'vitamin-b1', 'vitamin-b3', 'vitamin-b5'].some(id =>
    findExistingRec(recs, id),
  );
}

/** True if any magnesium supplement is in the protocol. */
function hasMagnesium(recs: Recommendation[]): boolean {
  return ['magnesium-glycinate', 'magnesium-citrate', 'magnesium-malate',
    'magnesium-l-threonate'].some(id => findExistingRec(recs, id));
}

/** True if any zinc supplement is in the protocol. */
function hasZinc(recs: Recommendation[]): boolean {
  return ['zinc-picolinate', 'zinc-bisglycinate', 'zinc-carnosine',
    'zinc-gluconate'].some(id => findExistingRec(recs, id));
}

// ─── GOAL: ENERGY ─────────────────────────────────────────────────────────────

function handleEnergy(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  let r = recs;

  if (!findExistingRec(r, 'coq10-ubiquinol')) {
    r = put(r, makeRec({
      id: 'coq10-ubiquinol', supplementName: 'CoQ10 (Ubiquinol)', form: 'ubiquinol',
      dose: 100, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Energy goal — CoQ10 ubiquinol is the active form supporting mitochondrial ATP synthesis')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'antioxidant', separateFrom: [], notes: [],
    }));
  }

  if (!hasBVitamins(r)) {
    r = put(r, makeRec({
      id: 'b-complex', supplementName: 'B-Complex', form: 'methylated-b-complex',
      dose: 1, doseUnit: 'capsule', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Energy goal — B vitamins are essential co-factors in cellular energy metabolism (Krebs cycle, ETC)')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'vitamin', separateFrom: [], notes: ['Take in the morning — B vitamins can be stimulating'],
    }));
  }

  if (!findExistingRec(r, 'rhodiola-rosea')) {
    r = put(r, makeRec({
      id: 'rhodiola-rosea', supplementName: 'Rhodiola Rosea', form: 'standardised-extract',
      dose: 300, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Energy goal — Rhodiola is an adaptogen that reduces fatigue and improves mental performance under stress')],
      warnings: ['May interact with antidepressants (MAOIs). Avoid evening use — can be stimulating.'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'adaptogen', separateFrom: [],
      notes: ['Take in the morning. Cycle 5 weeks on, 1 week off for best results.'],
    }));
  }

  if (!findExistingRec(r, 'acetyl-l-carnitine')) {
    r = put(r, makeRec({
      id: 'acetyl-l-carnitine', supplementName: 'Acetyl-L-Carnitine (ALCAR)', form: 'acetyl-l-carnitine',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Energy goal — ALCAR transports fatty acids into mitochondria for ATP production and supports mental energy')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'amino-acid', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'cordyceps')) {
    r = put(r, makeRec({
      id: 'cordyceps', supplementName: 'Cordyceps Mushroom', form: 'cs-4-extract',
      dose: 1000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Emerging',
      reasons: [makeReason('Energy goal — Cordyceps may improve oxygen utilisation and reduce fatigue (early clinical data)')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 3,
      category: 'herbal', separateFrom: [],
      notes: ['Emerging evidence — promising early human data but long-term studies are limited'],
    }));
  }

  return r;
}

// ─── GOAL: COGNITIVE PERFORMANCE ─────────────────────────────────────────────

function handleCognitive(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  let r = recs;

  // Ensure DHA 500mg+ (cognitive goal explicitly allows modifying dose)
  const omega3Id = getOmega3Id(r, quiz);
  const omega3 = findExistingRec(r, omega3Id);
  if (omega3) {
    if (omega3.dose < 500) {
      r = modifyDose(r, omega3Id, 500, LAYER, 'Cognitive goal — DHA 500mg+ for brain membrane structure and cognitive function');
    }
    r = addReason(r, omega3Id, LAYER, 'Cognitive goal — DHA is the primary structural fatty acid in the brain');
  } else {
    r = put(r, makeRec({
      id: omega3Id,
      supplementName: omega3Id === 'dha-algae' ? 'Algae-Based DHA' : 'Omega-3 Fish Oil',
      form: omega3Id === 'dha-algae' ? 'algae-dha' : 'fish-oil',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['midday'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Cognitive goal — DHA is the primary structural fatty acid in brain membranes')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 6,
      category: 'omega-fatty-acid', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'lions-mane')) {
    r = put(r, makeRec({
      id: 'lions-mane', supplementName: "Lion's Mane Mushroom", form: 'dual-extract',
      dose: 1000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Emerging',
      reasons: [makeReason('Cognitive goal — Lion\'s Mane stimulates NGF synthesis supporting neuroplasticity and memory')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'herbal', separateFrom: [],
      notes: ['Emerging evidence — consistent use over 8–16 weeks may be needed to observe benefits'],
    }));
  }

  if (!findExistingRec(r, 'phosphatidylserine')) {
    r = put(r, makeRec({
      id: 'phosphatidylserine', supplementName: 'Phosphatidylserine', form: 'soy-derived',
      dose: 200, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Cognitive goal — phosphatidylserine maintains neuronal membrane integrity and supports memory')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'compound', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'creatine-monohydrate')) {
    r = put(r, makeRec({
      id: 'creatine-monohydrate', supplementName: 'Creatine Monohydrate', form: 'creatine-monohydrate',
      dose: 5000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Emerging',
      reasons: [makeReason('Cognitive goal — creatine replenishes brain PCr stores and has emerging evidence for cognitive function (strong evidence for physical performance)')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'compound', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'bacopa-monnieri')) {
    r = put(r, makeRec({
      id: 'bacopa-monnieri', supplementName: 'Bacopa Monnieri', form: 'bacosides-extract',
      dose: 300, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Cognitive goal — Bacopa bacosides support synaptic transmission and reduce cognitive decline')],
      warnings: ['May cause GI upset. Take with food.'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'herbal', separateFrom: [],
      notes: ['Bacopa requires 8–12 weeks of consistent use to see cognitive benefits'],
    }));
  }

  if (!findExistingRec(r, 'alpha-gpc')) {
    r = put(r, makeRec({
      id: 'alpha-gpc', supplementName: 'Alpha-GPC', form: 'alpha-glycerophosphocholine',
      dose: 300, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Cognitive goal — Alpha-GPC is a choline precursor supporting acetylcholine synthesis and memory')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'compound', separateFrom: [], notes: [],
    }));
  }

  return r;
}

// ─── GOAL: IMMUNITY ───────────────────────────────────────────────────────────

function handleImmunity(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const autoimmune = isAutoimmune(quiz);
  let r = recs;

  if (!findExistingRec(r, 'vitamin-c')) {
    r = put(r, makeRec({
      id: 'vitamin-c', supplementName: 'Vitamin C', form: 'ascorbic-acid',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Immunity goal — Vitamin C supports neutrophil function, T-cell proliferation, and antioxidant defence')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'vitamin', separateFrom: [], notes: [],
    }));
  }

  if (!hasZinc(r)) {
    r = put(r, makeRec({
      id: 'zinc-picolinate', supplementName: 'Zinc Picolinate', form: 'picolinate',
      dose: 15, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Immunity goal — zinc is essential for T-cell development, NK cell activity, and antiviral defence')],
      warnings: ['High doses (>40mg/day) can deplete copper. Take a copper supplement if using >25mg zinc long-term.'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 6,
      category: 'mineral', separateFrom: ['iron-bisglycinate'], notes: [],
    }));
  }

  // Elderberry — skip if autoimmune (can stimulate immune activity)
  if (!autoimmune && !findExistingRec(r, 'elderberry')) {
    r = put(r, makeRec({
      id: 'elderberry', supplementName: 'Elderberry Extract', form: 'elderberry-extract',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Immunity goal — elderberry flavonoids inhibit viral replication and reduce cold/flu duration')],
      warnings: ['Do not use if autoimmune condition is present — elderberry may stimulate immune activity.'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'herbal', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'probiotics')) {
    r = put(r, makeRec({
      id: 'probiotics', supplementName: 'Probiotics (Immune Strains)', form: 'multi-strain',
      dose: 20, doseUnit: 'CFU', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Immunity goal — Lactobacillus and Bifidobacterium strains support gut-associated immunity (GALT) and IgA production')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'probiotic', separateFrom: ['antibiotics'],
      notes: ['Look for strains: L. acidophilus, L. rhamnosus GG, B. longum, B. lactis Bl-04'],
    }));
  }

  if (!findExistingRec(r, 'quercetin')) {
    r = put(r, makeRec({
      id: 'quercetin', supplementName: 'Quercetin', form: 'quercetin-phytosome',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Immunity goal — quercetin is a zinc ionophore and antiviral flavonoid that modulates NF-κB signalling')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'herbal', separateFrom: [], notes: [],
    }));
  }

  // Beta-Glucans — skip if autoimmune (immune stimulant)
  if (!autoimmune && !findExistingRec(r, 'beta-glucan')) {
    r = put(r, makeRec({
      id: 'beta-glucan', supplementName: 'Beta-Glucans (1,3/1,6)', form: 'oat-derived',
      dose: 250, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Immunity goal — beta-glucans prime macrophages and NK cells through Dectin-1 receptor activation')],
      warnings: ['Avoid in autoimmune conditions — may stimulate immune activity.'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 3,
      category: 'compound', separateFrom: [], notes: [],
    }));
  }

  return r;
}

// ─── GOAL: HEART HEALTH ───────────────────────────────────────────────────────

function handleHeartHealth(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  let r = recs;

  const omega3Id = getOmega3Id(r, quiz);
  const omega3 = findExistingRec(r, omega3Id);
  if (omega3) {
    if (omega3.dose < 2000) {
      r = modifyDose(r, omega3Id, 2000, LAYER, 'Heart health goal — 2,000mg EPA+DHA reaches cardioprotective threshold');
    }
    r = addReason(r, omega3Id, LAYER, 'Heart health goal — EPA+DHA reduce triglycerides, blood pressure, and platelet aggregation');
  } else {
    r = put(r, makeRec({
      id: omega3Id,
      supplementName: omega3Id === 'dha-algae' ? 'Algae-Based DHA/EPA' : 'Omega-3 Fish Oil',
      form: omega3Id === 'dha-algae' ? 'algae-dha' : 'fish-oil',
      dose: 2000, doseUnit: 'mg', frequency: 'daily',
      timing: ['midday'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Heart health goal — omega-3 EPA+DHA 2,000mg reduces cardiovascular risk markers')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'omega-fatty-acid', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'coq10-ubiquinol')) {
    r = put(r, makeRec({
      id: 'coq10-ubiquinol', supplementName: 'CoQ10 (Ubiquinol)', form: 'ubiquinol',
      dose: 200, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Heart health goal — CoQ10 supports myocardial energy metabolism and reduces oxidative stress in heart tissue')],
      warnings: ['If taking statins, CoQ10 is especially important as statins deplete endogenous CoQ10.'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'antioxidant', separateFrom: [], notes: [],
    }));
  }

  if (!hasMagnesium(r)) {
    r = put(r, makeRec({
      id: 'magnesium-glycinate', supplementName: 'Magnesium Glycinate', form: 'glycinate',
      dose: 300, doseUnit: 'mg', frequency: 'daily',
      timing: ['bedtime'], withFood: false, evidenceRating: 'Strong',
      reasons: [makeReason('Heart health goal — magnesium regulates cardiac rhythm, vascular tone, and blood pressure')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'mineral', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'vitamin-k2-mk7')) {
    r = put(r, makeRec({
      id: 'vitamin-k2-mk7', supplementName: 'Vitamin K2 (MK-7)', form: 'menaquinone-7',
      dose: 100, doseUnit: 'mcg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Heart health goal — K2 MK-7 activates matrix Gla-protein to prevent vascular calcification')],
      warnings: ['Consult doctor if taking warfarin or other anticoagulants — Vitamin K affects clotting.'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'vitamin', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'garlic-extract')) {
    r = put(r, makeRec({
      id: 'garlic-extract', supplementName: 'Aged Garlic Extract', form: 'aged-garlic',
      dose: 600, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Heart health goal — allicin compounds reduce LDL, blood pressure, and platelet aggregation')],
      warnings: ['May potentiate blood-thinning medications.'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'herbal', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'taurine')) {
    r = put(r, makeRec({
      id: 'taurine', supplementName: 'Taurine', form: 'taurine',
      dose: 1000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Heart health goal — taurine regulates intracellular calcium, supports cardiac contractility, and reduces blood pressure')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'amino-acid', separateFrom: [], notes: [],
    }));
  }

  return r;
}

// ─── GOAL: GUT HEALTH ─────────────────────────────────────────────────────────

function handleGutHealth(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  let r = recs;

  if (!findExistingRec(r, 'probiotics')) {
    r = put(r, makeRec({
      id: 'probiotics', supplementName: 'Probiotics (Multi-Strain)', form: 'multi-strain',
      dose: 30, doseUnit: 'CFU', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Gut health goal — multi-strain probiotics restore microbiome diversity and support intestinal barrier integrity')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 6,
      category: 'probiotic', separateFrom: ['antibiotics'],
      notes: ['Diversity matters — look for 8+ strains including Lactobacillus and Bifidobacterium species'],
    }));
  }

  if (!findExistingRec(r, 'l-glutamine')) {
    r = put(r, makeRec({
      id: 'l-glutamine', supplementName: 'L-Glutamine', form: 'l-glutamine',
      dose: 5000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Gut health goal — L-Glutamine is the primary fuel for enterocytes and supports intestinal barrier repair')],
      warnings: ['Use with caution in cancer patients — may fuel tumour glutamine pathways.'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'amino-acid', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'zinc-carnosine')) {
    r = put(r, makeRec({
      id: 'zinc-carnosine', supplementName: 'Zinc Carnosine', form: 'zinc-carnosine',
      dose: 75, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Gut health goal — zinc carnosine chelate supports gastric mucosal integrity and gut lining repair')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'mineral', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'digestive-enzymes')) {
    r = put(r, makeRec({
      id: 'digestive-enzymes', supplementName: 'Digestive Enzymes (Broad Spectrum)', form: 'multi-enzyme',
      dose: 1, doseUnit: 'capsule', frequency: 'three-times-daily',
      timing: ['morning-with-food', 'midday', 'evening'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Gut health goal — broad-spectrum digestive enzymes improve macronutrient breakdown and reduce bloating')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'enzyme', separateFrom: [],
      notes: ['Take at the start of each main meal for best results'],
    }));
  }

  if (!findExistingRec(r, 'psyllium-husk')) {
    r = put(r, makeRec({
      id: 'psyllium-husk', supplementName: 'Psyllium Husk Fibre', form: 'whole-husk',
      dose: 5000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Gut health goal — psyllium is a soluble prebiotic fibre that feeds beneficial bacteria and promotes bowel regularity')],
      warnings: ['Drink 200–300ml of water with each serving. Inadequate fluid can cause choking or constipation.'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'fiber', separateFrom: ['medications'],
      notes: ['Take at least 2 hours away from medications — may reduce absorption'],
    }));
  }

  return r;
}

// ─── GOAL: SKIN / HAIR / NAILS ────────────────────────────────────────────────

function handleSkinHairNails(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  let r = recs;

  if (!findExistingRec(r, 'biotin')) {
    r = put(r, makeRec({
      id: 'biotin', supplementName: 'Biotin', form: 'biotin',
      dose: 2500, doseUnit: 'mcg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Skin/hair/nails goal — biotin is a key co-factor for keratin synthesis')],
      warnings: ['High-dose biotin can interfere with thyroid, troponin, and other immunoassay lab tests — produce falsely high or low results.'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'vitamin', separateFrom: [],
      notes: ['Discontinue biotin 48 hours before blood tests', 'May worsen acne in some individuals — monitor and reduce if needed'],
    }));
  }

  if (!findExistingRec(r, 'collagen-peptides')) {
    r = put(r, makeRec({
      id: 'collagen-peptides', supplementName: 'Collagen Peptides', form: 'hydrolysed-type-i-iii',
      dose: 10000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Skin/hair/nails goal — collagen peptides stimulate endogenous collagen synthesis and improve skin elasticity')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'protein', separateFrom: [],
      notes: ['Take with Vitamin C to optimise collagen synthesis'],
    }));
  }

  if (!findExistingRec(r, 'vitamin-c')) {
    r = put(r, makeRec({
      id: 'vitamin-c', supplementName: 'Vitamin C', form: 'ascorbic-acid',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Skin/hair/nails goal — Vitamin C is an essential co-factor for collagen prolyl hydroxylase; required for collagen triple-helix stability')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 6,
      category: 'vitamin', separateFrom: [], notes: [],
    }));
  }

  if (!hasZinc(r)) {
    r = put(r, makeRec({
      id: 'zinc-picolinate', supplementName: 'Zinc Picolinate', form: 'picolinate',
      dose: 15, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Skin/hair/nails goal — zinc supports keratin and collagen synthesis, wound healing, and sebum regulation')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'mineral', separateFrom: ['iron-bisglycinate'], notes: [],
    }));
  }

  if (!findExistingRec(r, 'vitamin-e-mixed-tocopherols')) {
    r = put(r, makeRec({
      id: 'vitamin-e-mixed-tocopherols', supplementName: 'Vitamin E (Mixed Tocopherols)', form: 'mixed-tocopherols',
      dose: 200, doseUnit: 'IU', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Skin/hair/nails goal — Vitamin E protects cell membranes from lipid peroxidation and supports skin barrier function')],
      warnings: ['Use mixed tocopherols form for broadest protection'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 3,
      category: 'vitamin', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'hyaluronic-acid')) {
    r = put(r, makeRec({
      id: 'hyaluronic-acid', supplementName: 'Hyaluronic Acid', form: 'high-low-molecular-weight',
      dose: 120, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Emerging',
      reasons: [makeReason('Skin/hair/nails goal — oral HA increases skin hydration and reduces wrinkle depth (emerging clinical evidence)')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 3,
      category: 'compound', separateFrom: [],
      notes: ['Emerging evidence — look for blends of high + low molecular weight HA for skin and gut distribution'],
    }));
  }

  if (!findExistingRec(r, 'astaxanthin')) {
    r = put(r, makeRec({
      id: 'astaxanthin', supplementName: 'Astaxanthin', form: 'natural-astaxanthin',
      dose: 4, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Skin/hair/nails goal — astaxanthin is a powerful carotenoid antioxidant that reduces UV-induced skin aging')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 3,
      category: 'antioxidant', separateFrom: [],
      notes: ['Derived from Haematococcus microalgae — safe for all dietary patterns including vegan'],
    }));
  }

  return r;
}

// ─── GOAL: JOINT HEALTH ───────────────────────────────────────────────────────

function handleJointHealth(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const shellfish = hasAllergy(quiz, 'shellfish');
  let r = recs;

  if (!findExistingRec(r, 'glucosamine-chondroitin')) {
    r = put(r, makeRec({
      id: 'glucosamine-chondroitin',
      supplementName: shellfish ? 'Glucosamine + Chondroitin (Vegan)' : 'Glucosamine + Chondroitin',
      form: shellfish ? 'vegan-glucosamine' : 'glucosamine-sulfate',
      dose: 1500, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Joint health goal — glucosamine and chondroitin support cartilage synthesis and joint lubrication')],
      warnings: shellfish
        ? []
        : ['Standard glucosamine is derived from shellfish. If shellfish allergic, use corn-derived vegan form.'],
      contraindications: shellfish ? [] : ['shellfish-allergy'],
      cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'compound', separateFrom: [],
      notes: shellfish ? ['Vegan/corn-derived glucosamine used due to shellfish allergy'] : [],
    }));
  }

  if (!findExistingRec(r, 'collagen-type-ii')) {
    r = put(r, makeRec({
      id: 'collagen-type-ii', supplementName: 'Collagen Type II (Native)', form: 'native-type-ii',
      dose: 10000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Joint health goal — Type II collagen provides structural support for cartilage and triggers oral tolerance reducing joint inflammation')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'protein', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'curcumin')) {
    r = put(r, makeRec({
      id: 'curcumin', supplementName: 'Curcumin (High-Absorption)', form: 'phospholipid-complex',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['midday'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Joint health goal — curcumin inhibits COX-2 and NF-κB, reducing joint inflammation comparably to NSAIDs in some studies')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'herbal', separateFrom: [], notes: ['Use a high-absorption form (phytosome, BCM-95, or with piperine)'],
    }));
  }

  const omega3Id = getOmega3Id(r, quiz);
  if (!findExistingRec(r, omega3Id) && !findExistingRec(r, 'dha-algae') && !findExistingRec(r, 'omega-3-fish-oil')) {
    r = put(r, makeRec({
      id: omega3Id,
      supplementName: omega3Id === 'dha-algae' ? 'Algae-Based DHA/EPA' : 'Omega-3 Fish Oil',
      form: omega3Id === 'dha-algae' ? 'algae-dha' : 'fish-oil',
      dose: 2000, doseUnit: 'mg', frequency: 'daily',
      timing: ['midday'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Joint health goal — EPA+DHA reduce synovial inflammation and prostaglandin E2 production')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 6,
      category: 'omega-fatty-acid', separateFrom: [], notes: [],
    }));
  } else {
    const existingId = findExistingRec(r, 'dha-algae') ? 'dha-algae' : (findExistingRec(r, 'omega-3-fish-oil') ? 'omega-3-fish-oil' : null);
    if (existingId) {
      r = addReason(r, existingId, LAYER, 'Joint health goal — omega-3 EPA+DHA reduce synovial inflammation');
    }
  }

  if (!findExistingRec(r, 'msm')) {
    r = put(r, makeRec({
      id: 'msm', supplementName: 'MSM (Methylsulfonylmethane)', form: 'msm',
      dose: 2000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Joint health goal — MSM provides organic sulfur for collagen and glycosaminoglycan synthesis; reduces joint pain and inflammation')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'compound', separateFrom: [], notes: [],
    }));
  }

  return r;
}

// ─── GOAL: LONGEVITY / ANTI-AGING ─────────────────────────────────────────────

function handleLongevity(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  let r = recs;

  if (!findExistingRec(r, 'nmn')) {
    r = put(r, makeRec({
      id: 'nmn', supplementName: 'NMN (Nicotinamide Mononucleotide)', form: 'nmn',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Emerging',
      reasons: [makeReason('Longevity goal — NMN is an NAD+ precursor; NAD+ declines with age and supports mitochondrial function and DNA repair')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'compound', separateFrom: [],
      notes: ['NAD+ precursor — exciting preclinical and early clinical data but long-term human studies are ongoing'],
    }));
  }

  if (!findExistingRec(r, 'resveratrol')) {
    r = put(r, makeRec({
      id: 'resveratrol', supplementName: 'Resveratrol', form: 'trans-resveratrol',
      dose: 250, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Emerging',
      reasons: [makeReason('Longevity goal — resveratrol activates SIRT1 and AMP-kinase pathways associated with caloric restriction mimicry')],
      warnings: ['May interact with blood-thinning medications.'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 3,
      category: 'herbal', separateFrom: [],
      notes: ['Emerging evidence — strong preclinical data; clinical evidence in humans is still limited'],
    }));
  }

  if (!findExistingRec(r, 'coq10-ubiquinol')) {
    r = put(r, makeRec({
      id: 'coq10-ubiquinol', supplementName: 'CoQ10 (Ubiquinol)', form: 'ubiquinol',
      dose: 100, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Longevity goal — CoQ10 declines with age and supports mitochondrial electron transport and antioxidant defence')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'antioxidant', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'curcumin')) {
    r = put(r, makeRec({
      id: 'curcumin', supplementName: 'Curcumin (High-Absorption)', form: 'phospholipid-complex',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['midday'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Longevity goal — curcumin NF-κB inhibition reduces inflammaging (chronic low-grade inflammation driving age-related disease)')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'herbal', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'sulforaphane')) {
    r = put(r, makeRec({
      id: 'sulforaphane', supplementName: 'Sulforaphane (from Broccoli Sprout)', form: 'glucoraphanin-myrosinase',
      dose: 30, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Emerging',
      reasons: [makeReason('Longevity goal — sulforaphane activates Nrf2, upregulating antioxidant and detoxification genes')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 3,
      category: 'herbal', separateFrom: [],
      notes: [
        'Emerging evidence — strong Nrf2 activation data but long-term human longevity trials are not yet available',
        'Consider wheat germ as a dietary source of spermidine for autophagy support (spermidine is not yet a common supplement)',
      ],
    }));
  }

  return r;
}

// ─── GOAL: WEIGHT MANAGEMENT ──────────────────────────────────────────────────

function handleWeightManagement(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  let r = recs;

  if (!findExistingRec(r, 'chromium-picolinate')) {
    r = put(r, makeRec({
      id: 'chromium-picolinate', supplementName: 'Chromium Picolinate', form: 'picolinate',
      dose: 400, doseUnit: 'mcg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Weight management goal — chromium potentiates insulin receptor signalling and reduces carbohydrate cravings')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'mineral', separateFrom: [], notes: ['No supplement replaces a caloric deficit and regular exercise for sustainable weight management'],
    }));
  }

  if (!findExistingRec(r, 'green-tea-extract')) {
    const slowCYP1A2 = quiz.geneticVariants?.cyp1a2 === 'slow';
    r = put(r, makeRec({
      id: 'green-tea-extract', supplementName: 'Green Tea Extract (EGCG)', form: 'egcg-standardised',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Weight management goal — EGCG and caffeine synergistically increase thermogenesis and fat oxidation')],
      warnings: slowCYP1A2
        ? ['Slow CYP1A2 metabolizer detected — this supplement contains caffeine. Take before noon to avoid disrupting sleep.']
        : [],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'herbal', separateFrom: [],
      notes: slowCYP1A2
        ? ['Slow CYP1A2 — consider a decaffeinated EGCG extract to avoid caffeine accumulation', 'No supplement replaces a caloric deficit and regular exercise for sustainable weight management']
        : ['No supplement replaces a caloric deficit and regular exercise for sustainable weight management'],
    }));
  } else if (quiz.geneticVariants?.cyp1a2 === 'slow') {
    // Already in protocol — add caffeine warning if slow CYP1A2
    r = addWarning(r, 'green-tea-extract',
      'Slow CYP1A2 metabolizer — this supplement contains caffeine. Take before noon to avoid disrupting sleep.');
    r = addNote(r, 'green-tea-extract',
      'Slow CYP1A2 — consider a decaffeinated EGCG extract to avoid caffeine accumulation');
  }

  if (!findExistingRec(r, 'psyllium-husk')) {
    r = put(r, makeRec({
      id: 'psyllium-husk', supplementName: 'Psyllium Husk Fibre', form: 'whole-husk',
      dose: 10000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Weight management goal — psyllium fibre increases satiety, slows gastric emptying, and reduces post-meal glucose spike')],
      warnings: ['Drink 200–300ml water with each serving.'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'fiber', separateFrom: ['medications'],
      notes: ['Take at least 2 hours away from medications', 'No supplement replaces a caloric deficit and regular exercise for sustainable weight management'],
    }));
  }

  if (!findExistingRec(r, 'berberine')) {
    r = put(r, makeRec({
      id: 'berberine', supplementName: 'Berberine', form: 'berberine-hcl',
      dose: 1000, doseUnit: 'mg', frequency: 'twice-daily',
      timing: ['morning-with-food', 'evening'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Weight management goal — berberine activates AMPK, improving insulin sensitivity and reducing adipogenesis')],
      warnings: ['May potentiate blood-glucose-lowering medications. Monitor blood glucose.'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 6,
      category: 'herbal', separateFrom: [], notes: [],
    }));
  }

  return r;
}

// ─── GOAL: STRESS / ANXIETY ───────────────────────────────────────────────────

function handleStressAnxiety(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const benzos = takesBenzo(quiz);
  let r = recs;

  if (!findExistingRec(r, 'ashwagandha')) {
    r = put(r, makeRec({
      id: 'ashwagandha', supplementName: 'Ashwagandha (KSM-66)', form: 'ksm-66-extract',
      dose: 600, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Stress/anxiety goal — Ashwagandha KSM-66 reduces cortisol and perceived stress in RCTs')],
      warnings: ['Avoid in pregnancy. May interact with thyroid medications.'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 6,
      category: 'adaptogen', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'l-theanine')) {
    r = put(r, makeRec({
      id: 'l-theanine', supplementName: 'L-Theanine', form: 'l-theanine',
      dose: 200, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Moderate',
      reasons: [makeReason('Stress/anxiety goal — L-theanine promotes alpha brainwave activity producing calm alertness without sedation')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'amino-acid', separateFrom: [], notes: [],
    }));
  }

  if (!hasMagnesium(r)) {
    r = put(r, makeRec({
      id: 'magnesium-glycinate', supplementName: 'Magnesium Glycinate', form: 'glycinate',
      dose: 300, doseUnit: 'mg', frequency: 'daily',
      timing: ['bedtime'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Stress/anxiety goal — magnesium glycinate supports GABA-A receptor function and HPA axis regulation')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 6,
      category: 'mineral', separateFrom: [], notes: [],
    }));
  }

  // GABA — add sedation warning if benzos
  if (!findExistingRec(r, 'gaba')) {
    r = put(r, makeRec({
      id: 'gaba', supplementName: 'GABA (Gamma-Aminobutyric Acid)', form: 'pharmagaba',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['bedtime'], withFood: false, evidenceRating: 'Emerging',
      reasons: [makeReason('Stress/anxiety goal — GABA (PharmaGABA form) may cross the blood-brain barrier and promote relaxation')],
      warnings: benzos
        ? ['CAUTION: You are taking benzodiazepines. GABA may have additive sedative effects — use with caution and inform your doctor.']
        : [],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 3,
      category: 'amino-acid', separateFrom: [], notes: [],
    }));
  } else if (benzos) {
    r = addWarning(r, 'gaba',
      'CAUTION: You are taking benzodiazepines. GABA may have additive sedative effects — use with caution and inform your doctor.');
  }

  if (!findExistingRec(r, 'rhodiola-rosea')) {
    r = put(r, makeRec({
      id: 'rhodiola-rosea', supplementName: 'Rhodiola Rosea', form: 'standardised-extract',
      dose: 300, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Stress/anxiety goal — Rhodiola adaptogen reduces fatigue and burnout; modulates the HPA stress axis')],
      warnings: ['Avoid evening use — can be mildly stimulating'],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'adaptogen', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'holy-basil')) {
    r = put(r, makeRec({
      id: 'holy-basil', supplementName: 'Holy Basil (Tulsi)', form: 'standardised-extract',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Emerging',
      reasons: [makeReason('Stress/anxiety goal — Holy Basil is an adaptogenic herb that reduces cortisol and anxiety symptoms')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 3,
      category: 'adaptogen', separateFrom: [],
      notes: ['Emerging evidence — promising early human data'],
    }));
  }

  if (!findExistingRec(r, 'lemon-balm')) {
    r = put(r, makeRec({
      id: 'lemon-balm', supplementName: 'Lemon Balm (Melissa officinalis)', form: 'standardised-extract',
      dose: 600, doseUnit: 'mg', frequency: 'daily',
      timing: ['evening'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Stress/anxiety goal — Lemon Balm inhibits GABA transaminase, increasing calming GABA levels')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 3,
      category: 'herbal', separateFrom: [], notes: [],
    }));
  }

  return r;
}

// ─── GOAL: ATHLETIC PERFORMANCE ───────────────────────────────────────────────

function handleAthleticPerformance(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  let r = recs;

  if (!findExistingRec(r, 'creatine-monohydrate')) {
    r = put(r, makeRec({
      id: 'creatine-monohydrate', supplementName: 'Creatine Monohydrate', form: 'creatine-monohydrate',
      dose: 5000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Athletic performance goal — creatine is the most evidence-backed ergogenic supplement, increasing maximal power output and reducing recovery time')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'compound', separateFrom: [],
      notes: ['No loading phase required — 5g/day achieves saturation over 3–4 weeks with fewer side effects'],
    }));
  }

  if (!findExistingRec(r, 'beta-alanine')) {
    r = put(r, makeRec({
      id: 'beta-alanine', supplementName: 'Beta-Alanine', form: 'beta-alanine',
      dose: 3200, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-with-food'], withFood: true, evidenceRating: 'Strong',
      reasons: [makeReason('Athletic performance goal — beta-alanine increases muscle carnosine, buffering H⁺ ions and extending high-intensity endurance')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'amino-acid', separateFrom: [],
      notes: ['Tingling (paraesthesia) is normal and harmless — split into smaller doses if uncomfortable'],
    }));
  }

  // Ensure magnesium for electrolyte balance
  if (!hasMagnesium(r)) {
    r = put(r, makeRec({
      id: 'magnesium-glycinate', supplementName: 'Magnesium Glycinate', form: 'glycinate',
      dose: 300, doseUnit: 'mg', frequency: 'daily',
      timing: ['bedtime'], withFood: false, evidenceRating: 'Strong',
      reasons: [makeReason('Athletic performance goal — magnesium is lost in sweat and critical for muscle contraction, energy production, and recovery')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 6,
      category: 'mineral', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'tart-cherry-extract')) {
    r = put(r, makeRec({
      id: 'tart-cherry-extract', supplementName: 'Tart Cherry Extract', form: 'montmorency-extract',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['evening'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Athletic performance goal — tart cherry anthocyanins reduce exercise-induced muscle damage, DOMS, and inflammation')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'herbal', separateFrom: [],
      notes: [
        'For recovery: take before bed on training days',
        'Beetroot juice (500ml or 6.4mmol nitrate) 2–3 hours before training can improve endurance performance (dietary, not supplement)',
      ],
    }));
  }

  if (!findExistingRec(r, 'l-citrulline')) {
    r = put(r, makeRec({
      id: 'l-citrulline', supplementName: 'L-Citrulline', form: 'l-citrulline',
      dose: 6000, doseUnit: 'mg', frequency: 'daily',
      timing: ['morning-empty'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Athletic performance goal — L-Citrulline increases arginine and nitric oxide, improving blood flow, muscle pumps, and endurance')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'amino-acid', separateFrom: [],
      notes: ['Take 45–60 minutes before training for best effect'],
    }));
  }

  return r;
}

// ─── GOAL: SLEEP ──────────────────────────────────────────────────────────────

function handleSleep(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  const benzos = takesBenzo(quiz);
  let r = recs;

  if (!hasMagnesium(r)) {
    r = put(r, makeRec({
      id: 'magnesium-glycinate', supplementName: 'Magnesium Glycinate', form: 'glycinate',
      dose: 300, doseUnit: 'mg', frequency: 'daily',
      timing: ['bedtime'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Sleep goal — magnesium glycinate supports GABA receptor activity and reduces sleep onset latency')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 7,
      category: 'mineral', separateFrom: [], notes: [],
    }));
  } else {
    // Ensure bedtime timing for existing magnesium
    r = addReason(r, 'magnesium-glycinate', LAYER, 'Sleep goal — magnesium at bedtime supports GABA-mediated relaxation');
  }

  if (!findExistingRec(r, 'l-theanine')) {
    r = put(r, makeRec({
      id: 'l-theanine', supplementName: 'L-Theanine', form: 'l-theanine',
      dose: 200, doseUnit: 'mg', frequency: 'daily',
      timing: ['bedtime'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Sleep goal — L-theanine increases alpha brainwaves and reduces sleep onset without morning grogginess')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 5,
      category: 'amino-acid', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'glycine')) {
    r = put(r, makeRec({
      id: 'glycine', supplementName: 'Glycine', form: 'glycine',
      dose: 3000, doseUnit: 'mg', frequency: 'daily',
      timing: ['bedtime'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Sleep goal — glycine lowers core body temperature and improves subjective sleep quality and morning alertness')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'amino-acid', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'tart-cherry-extract')) {
    r = put(r, makeRec({
      id: 'tart-cherry-extract', supplementName: 'Tart Cherry Extract', form: 'montmorency-extract',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['evening'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Sleep goal — tart cherry is a natural source of melatonin and serotonin precursors that support circadian rhythm')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 3,
      category: 'herbal', separateFrom: [], notes: [],
    }));
  }

  // Valerian Root — add sedation warning if benzos
  if (!findExistingRec(r, 'valerian-root')) {
    r = put(r, makeRec({
      id: 'valerian-root', supplementName: 'Valerian Root', form: 'standardised-extract',
      dose: 450, doseUnit: 'mg', frequency: 'daily',
      timing: ['bedtime'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Sleep goal — valerian valerenic acid modulates GABA-A receptors to promote sleep onset and quality')],
      warnings: benzos
        ? ['CAUTION: You are taking benzodiazepines. Valerian may have additive sedative effects — use with caution and inform your doctor.']
        : [],
      contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 3,
      category: 'herbal', separateFrom: [], notes: ['Allow 2–4 weeks of consistent use for optimal effect'],
    }));
  } else if (benzos) {
    r = addWarning(r, 'valerian-root',
      'CAUTION: You are taking benzodiazepines. Valerian may have additive sedative effects — use with caution and inform your doctor.');
  }

  if (!findExistingRec(r, 'lemon-balm')) {
    r = put(r, makeRec({
      id: 'lemon-balm', supplementName: 'Lemon Balm (Melissa officinalis)', form: 'standardised-extract',
      dose: 300, doseUnit: 'mg', frequency: 'daily',
      timing: ['bedtime'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Sleep goal — Lemon Balm increases GABA by inhibiting GABA transaminase, reducing sleep onset time')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 3,
      category: 'herbal', separateFrom: [], notes: [],
    }));
  }

  if (!findExistingRec(r, 'passionflower')) {
    r = put(r, makeRec({
      id: 'passionflower', supplementName: 'Passionflower', form: 'standardised-extract',
      dose: 500, doseUnit: 'mg', frequency: 'daily',
      timing: ['bedtime'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Sleep goal — Passionflower chrysin and other flavonoids bind GABA-A receptors, reducing anxiety and improving sleep quality')],
      warnings: [], contraindications: [], cyclingPattern: CYCLE_DAILY, priority: 4,
      category: 'herbal', separateFrom: [], notes: [],
    }));
  }

  // Ashwagandha Sensoril — sleep-specific form (GABAergic; triethylene glycol)
  // Only add if no KSM-66 already present from stress layers
  if (!findExistingRec(r, 'ashwagandha-ksm66') && !findExistingRec(r, 'ashwagandha')) {
    r = put(r, makeRec({
      id: 'ashwagandha', supplementName: 'Ashwagandha (Sensoril)', form: 'sensoril-extract',
      dose: 300, doseUnit: 'mg', frequency: 'daily',
      timing: ['bedtime'], withFood: false, evidenceRating: 'Moderate',
      reasons: [makeReason('Sleep goal — Sensoril ashwagandha 300 mg improves sleep quality via GABAergic activity; triethylene glycol promotes non-REM sleep')],
      warnings: ['Avoid in pregnancy. May interact with thyroid medications.'],
      contraindications: [], cyclingPattern: CYCLE_6ON1OFF, priority: 4,
      category: 'adaptogen', separateFrom: [],
      notes: ['Sensoril extract is preferred over KSM-66 for sleep due to higher withanolide glycoside content'],
    }));
  }

  return r;
}

// ─── SAFETY POST-PROCESSING ───────────────────────────────────────────────────

function blockBetaCarotene(recs: Recommendation[]): Recommendation[] {
  const betaIds = ['beta-carotene', 'beta-carotene-supplement'];
  let r = recs;
  for (const id of betaIds) {
    if (findExistingRec(r, id)) {
      r = r.filter(rec => rec.id !== id);
    }
  }
  return r;
}

// ─── CAP LOGIC ────────────────────────────────────────────────────────────────

const LAYER_ORDER: Record<LayerName, number> = {
  demographic: 6, dietary: 5, lifestyle: 4,
  conditions: 3, labs: 2, genetics: 1, goals: 0, synergy: -1, optimization: -1, safety: -2,
};

const EVIDENCE_ORDER: Record<string, number> = {
  Strong: 3, Moderate: 2, Emerging: 1, Traditional: 0,
};

function sortByPriorityThenLayer(recs: Recommendation[]): Recommendation[] {
  return [...recs].sort((a, b) => {
    // 1. Higher priority first
    if (b.priority !== a.priority) return b.priority - a.priority;
    // 2. Earlier layer first (higher LAYER_ORDER value wins)
    const aL = LAYER_ORDER[a.sources[0]?.layer ?? 'goals'] ?? 0;
    const bL = LAYER_ORDER[b.sources[0]?.layer ?? 'goals'] ?? 0;
    if (bL !== aL) return bL - aL;
    // 3. Higher evidence rating first
    const aE = EVIDENCE_ORDER[a.evidenceRating] ?? 0;
    const bE = EVIDENCE_ORDER[b.evidenceRating] ?? 0;
    return bE - aE;
  });
}

// ─── RESULT TYPE ──────────────────────────────────────────────────────────────

export interface Layer7FullResult {
  /** Hard-capped at 10 supplements, sorted by priority. Ready for display. */
  approved: Recommendation[];
  /**
   * Supplements that were sorted off the bottom after the hard cap.
   * Stored for potential premium upsell display: "Unlock X more supplements".
   */
  removedForCap: Recommendation[];
}

// ─── MAIN EXPORTS ─────────────────────────────────────────────────────────────

export function layer7GoalsFull(quiz: QuizData, recs: Recommendation[]): Layer7FullResult {
  let r = recs;

  if (hasGoal(quiz, 'energy'))
    r = handleEnergy(quiz, r);
  if (hasGoal(quiz, 'cognitive', 'cognitive-performance', 'cognition'))
    r = handleCognitive(quiz, r);
  if (hasGoal(quiz, 'immunity', 'immune'))
    r = handleImmunity(quiz, r);
  if (hasGoal(quiz, 'heart-health', 'cardiovascular', 'heart'))
    r = handleHeartHealth(quiz, r);
  if (hasGoal(quiz, 'gut-health', 'digestion', 'gut'))
    r = handleGutHealth(quiz, r);
  if (hasGoal(quiz, 'skin-hair-nails', 'skin', 'beauty', 'hair', 'nails'))
    r = handleSkinHairNails(quiz, r);
  if (hasGoal(quiz, 'joint-health', 'joints', 'mobility'))
    r = handleJointHealth(quiz, r);
  if (hasGoal(quiz, 'longevity', 'anti-aging', 'longevity-anti-aging'))
    r = handleLongevity(quiz, r);
  if (hasGoal(quiz, 'weight-management', 'weight', 'fat-loss'))
    r = handleWeightManagement(quiz, r);
  if (hasGoal(quiz, 'stress-anxiety', 'stress', 'anxiety', 'mental-health'))
    r = handleStressAnxiety(quiz, r);
  if (hasGoal(quiz, 'athletic-performance', 'performance', 'fitness', 'sports'))
    r = handleAthleticPerformance(quiz, r);
  if (hasGoal(quiz, 'sleep'))
    r = handleSleep(quiz, r);

  // Safety: ensure beta-carotene never slips through for smokers
  if (quiz.smokerFlag === true) {
    r = blockBetaCarotene(r);
  }

  const sorted = sortByPriorityThenLayer(r);
  return {
    approved: sorted.slice(0, MAX_SUPPLEMENTS),
    removedForCap: sorted.slice(MAX_SUPPLEMENTS),
  };
}

export function layer7Goals(quiz: QuizData, recs: Recommendation[]): Recommendation[] {
  return layer7GoalsFull(quiz, recs).approved;
}
