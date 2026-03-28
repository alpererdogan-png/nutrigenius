// ─────────────────────────────────────────────────────────────────────────────
// Gut Health Absorption Optimizer
//
// Runs after Layer 3 (lifestyle), before Layer 4 (conditions).
// Detects digestive conditions that impair absorption, then:
//   1. Sets absorptionFlag on the quiz context
//   2. Swaps minerals to highest-bioavailability forms
//   3. Adds digestive enzyme complex
//   4. Switches B12 to sublingual
//   5. Adds fat-soluble vitamin absorption notes
// ─────────────────────────────────────────────────────────────────────────────

import type {
  QuizData,
  Recommendation,
  LayerName,
  RecommendationReason,
  LayerSource,
} from '../types';

import { CYCLE_DAILY } from '../types';

import {
  findExistingRec,
  addOrModify,
  modifyForm,
  addReason,
} from '../layers/layer1-demographic';

import { appendNote } from '../layers/layer2-dietary';

const LAYER: LayerName = 'optimization';

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeReason(reason: string): RecommendationReason {
  return { layer: LAYER, reason };
}

function makeSource(
  action: LayerSource['action'],
  extra?: Partial<LayerSource>,
): LayerSource {
  return { layer: LAYER, action, ...extra };
}

// ── GI trigger conditions ───────────────────────────────────────────────────

const GI_CONDITIONS: string[] = [
  'ibs', 'irritable-bowel-syndrome', 'ibs-c', 'ibs-d', 'ibs-m',
  'sibo', 'small-intestinal-bacterial-overgrowth',
  'celiac', 'celiac-disease', 'coeliac', 'coeliac-disease',
  'crohns', 'crohn-disease', "crohn's-disease", "crohn's",
  'ulcerative-colitis', 'uc', 'colitis',
  'leaky-gut', 'intestinal-permeability', 'gut-dysbiosis',
  'gerd', 'acid-reflux', 'heartburn', 'reflux', 'gord',
  'bloating', 'chronic-bloating',
  'chronic-gastritis', 'gastritis',
];

function hasGICondition(quiz: QuizData): boolean {
  const conds = quiz.healthConditions.map(c => c.toLowerCase());
  return GI_CONDITIONS.some(gi => conds.includes(gi));
}

function hasMultipleAllergies(quiz: QuizData): boolean {
  return quiz.allergies.length >= 3;
}

/** Returns true if any GI trigger is present. */
export function shouldOptimizeAbsorption(quiz: QuizData): boolean {
  return hasGICondition(quiz) || hasMultipleAllergies(quiz);
}

// ── Mineral form swap rules ─────────────────────────────────────────────────

interface FormSwapRule {
  /** Supplement IDs that might need swapping. */
  ids: string[];
  /** Forms considered low-bioavailability. */
  badForms: string[];
  /** Target high-bioavailability form. */
  targetForm: string;
  /** Target supplement name after swap. */
  targetName: string;
  /** Target supplement ID after swap. */
  targetId: string;
  /** Reason for the swap. */
  reason: string;
}

const FORM_SWAP_RULES: FormSwapRule[] = [
  {
    ids: ['magnesium-oxide'],
    badForms: ['oxide'],
    targetForm: 'glycinate',
    targetName: 'Magnesium Glycinate',
    targetId: 'magnesium-glycinate',
    reason: 'Absorption optimization — magnesium glycinate has ~80% bioavailability vs ~4% for oxide',
  },
  {
    ids: ['iron-sulfate', 'iron-ferrous-sulfate', 'iron-bisglycinate'],
    badForms: ['sulfate', 'ferrous-sulfate'],
    targetForm: 'bisglycinate',
    targetName: 'Iron (Bisglycinate)',
    targetId: 'iron-bisglycinate',
    reason: 'Absorption optimization — iron bisglycinate is chelated for superior absorption with fewer GI side effects',
  },
  {
    ids: ['zinc-oxide', 'zinc-gluconate', 'zinc-picolinate', 'zinc-bisglycinate'],
    badForms: ['oxide', 'gluconate'],
    targetForm: 'picolinate',
    targetName: 'Zinc Picolinate',
    targetId: 'zinc-picolinate',
    reason: 'Absorption optimization — zinc picolinate offers highest bioavailability for impaired GI tracts',
  },
  {
    ids: ['calcium-carbonate', 'calcium-citrate'],
    badForms: ['carbonate'],
    targetForm: 'citrate',
    targetName: 'Calcium Citrate',
    targetId: 'calcium-citrate',
    reason: 'Absorption optimization — calcium citrate absorbs without stomach acid, critical for GI conditions',
  },
  {
    ids: ['chromium-chloride', 'chromium-picolinate'],
    badForms: ['chloride'],
    targetForm: 'picolinate',
    targetName: 'Chromium Picolinate',
    targetId: 'chromium-picolinate',
    reason: 'Absorption optimization — chromium picolinate has 10× greater bioavailability than chloride',
  },
];

function applyFormSwaps(recs: Recommendation[]): Recommendation[] {
  let r = recs;

  for (const rule of FORM_SWAP_RULES) {
    for (const id of rule.ids) {
      const rec = findExistingRec(r, id);
      if (!rec || !rule.badForms.includes(rec.form)) continue;

      // Remove old entry, create new one with correct ID/form
      r = r.filter(x => x.id !== id);
      const swapped: Recommendation = {
        ...rec,
        id: rule.targetId,
        supplementName: rule.targetName,
        form: rule.targetForm,
        reasons: [...rec.reasons, makeReason(rule.reason)],
        sources: [
          ...rec.sources,
          makeSource('modified-form', {
            previousValue: rec.form,
            newValue: rule.targetForm,
          }),
        ],
      };
      r = addOrModify(r, swapped, LAYER);
    }
  }

  return r;
}

// ── Digestive enzyme addition ───────────────────────────────────────────────

function ensureDigestiveEnzymes(recs: Recommendation[]): Recommendation[] {
  if (findExistingRec(recs, 'digestive-enzyme-complex')) return recs;

  const rec: Recommendation = {
    id: 'digestive-enzyme-complex',
    supplementName: 'Digestive Enzyme Complex',
    form: 'broad-spectrum',
    dose: 1,
    doseUnit: 'capsule',
    frequency: 'three-times-daily',
    timing: ['morning-with-food', 'midday', 'evening'],
    withFood: true,
    evidenceRating: 'Emerging',
    reasons: [
      makeReason(
        'Digestive conditions detected — enzymes support nutrient breakdown and absorption',
      ),
    ],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 7,
    category: 'enzyme',
    separateFrom: [],
    sources: [makeSource('added')],
    notes: [
      'Broad-spectrum: amylase, protease, lipase, lactase; take with each meal',
    ],
  };

  return addOrModify(recs, rec, LAYER);
}

// ── B12 sublingual switch ───────────────────────────────────────────────────

function switchB12ToSublingual(recs: Recommendation[]): Recommendation[] {
  const b12 = findExistingRec(recs, 'vitamin-b12');
  if (!b12) return recs;

  // Already sublingual — just add the reason
  if (b12.form === 'sublingual-methylcobalamin') {
    return addReason(
      recs,
      'vitamin-b12',
      LAYER,
      'Sublingual B12 bypasses digestive absorption issues',
    );
  }

  let r = modifyForm(
    recs,
    'vitamin-b12',
    'sublingual-methylcobalamin',
    LAYER,
    'Sublingual B12 bypasses digestive absorption issues',
  );
  r = addReason(
    r,
    'vitamin-b12',
    LAYER,
    'Sublingual B12 bypasses digestive absorption issues',
  );
  r = appendNote(
    r,
    'vitamin-b12',
    'Place under tongue and let dissolve — do not swallow whole',
  );

  return r;
}

// ── Fat-soluble vitamin notes ───────────────────────────────────────────────

const FAT_SOLUBLE_IDS = [
  'vitamin-d3',
  'vitamin-e',
  'vitamin-e-mixed-tocopherols',
  'vitamin-k2',
  'vitamin-k2-mk7',
  'vitamin-k2-mk4',
  'vitamin-a',
  'vitamin-a-retinol',
  'beta-carotene',
];

const FAT_SOLUBLE_NOTE =
  'Take with your largest fat-containing meal for best absorption';

function addFatSolubleNotes(recs: Recommendation[]): Recommendation[] {
  let r = recs;
  for (const id of FAT_SOLUBLE_IDS) {
    if (findExistingRec(r, id)) {
      r = appendNote(r, id, FAT_SOLUBLE_NOTE);
    }
  }
  return r;
}

// ── Global absorption note ──────────────────────────────────────────────────

export const ABSORPTION_GLOBAL_NOTE =
  'Your digestive health may affect how well you absorb supplements. ' +
  "We've selected the most bioavailable forms for each nutrient. " +
  'Consider liquid or sublingual forms where available for even better absorption.';

// ── Main optimizer ──────────────────────────────────────────────────────────

/**
 * Assesses gut health and optimises supplement forms for absorption.
 * Runs after Layer 3 (lifestyle), before Layer 4 (conditions).
 *
 * Mutates `quiz.absorptionFlag` (following the smokerFlag pattern)
 * so downstream layers can check it.
 */
export function optimizeAbsorption(
  quiz: QuizData,
  recs: Recommendation[],
): Recommendation[] {
  if (!shouldOptimizeAbsorption(quiz)) return recs;

  // 1. Set the flag on the quiz context (same pattern as smokerFlag)
  quiz.absorptionFlag = true;

  let r = recs;

  // 2. Swap mineral forms to highest-bioavailability versions
  r = applyFormSwaps(r);

  // 3. Add digestive enzyme complex
  r = ensureDigestiveEnzymes(r);

  // 4. Switch B12 to sublingual
  r = switchB12ToSublingual(r);

  // 5. Add fat-soluble vitamin absorption notes
  r = addFatSolubleNotes(r);

  return r;
}
