// ─────────────────────────────────────────────────────────────────────────────
// Magnesium Form Optimizer
//
// Runs after all 7 layers (post-Layer 7, pre-synergy). Inspects the user's
// conditions, activity level, goals, and sleep quality to select the optimal
// magnesium *form*. Priority-ordered — first match wins.
//
// NEVER uses oxide form (≈4% bioavailability).
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
  addReason,
} from '../layers/layer1-demographic';

import { appendNote } from '../layers/layer2-dietary';

const LAYER: LayerName = 'optimization';

// ── All magnesium IDs the pipeline may produce ──────────────────────────────

const ALL_MG_IDS = [
  'magnesium-glycinate',
  'magnesium-citrate',
  'magnesium-malate',
  'magnesium-taurate',
  'magnesium-l-threonate',
] as const;

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

function hasCond(quiz: QuizData, ...ids: string[]): boolean {
  const conds = quiz.healthConditions.map(c => c.toLowerCase());
  return ids.some(id => conds.includes(id));
}

function hasGoal(quiz: QuizData, ...ids: string[]): boolean {
  const goals = quiz.healthGoals.map(g => g.toLowerCase());
  return ids.some(id => goals.includes(id));
}

/** Find whichever magnesium rec currently exists (any form, including oxide). */
function findMgRec(recs: Recommendation[]): Recommendation | undefined {
  for (const id of ALL_MG_IDS) {
    const found = findExistingRec(recs, id);
    if (found) return found;
  }
  // Also catch oxide or any other magnesium ID not in the list
  return recs.find(r => r.id.startsWith('magnesium-'));
}

// ── Form selection result ───────────────────────────────────────────────────

interface FormSelection {
  id: string;
  supplementName: string;
  form: string;
  reason: string;
  note: string;
  /** If true, also add threonate as a separate entry. */
  addThreonate?: boolean;
}

// ── Priority-ordered form selection ─────────────────────────────────────────

function selectForm(quiz: QuizData): FormSelection | null {
  // 1. Constipation / IBS-C → CITRATE
  if (hasCond(quiz, 'constipation', 'chronic-constipation', 'ibs-c')) {
    return {
      id: 'magnesium-citrate',
      supplementName: 'Magnesium Citrate',
      form: 'citrate',
      reason:
        'Magnesium citrate selected — mild osmotic effect helps bowel regularity',
      note: 'Citrate form chosen for its gentle osmotic laxative effect',
    };
  }

  // 2. Migraine → CITRATE (well-studied for migraine)
  if (hasCond(quiz, 'migraines', 'migraine', 'chronic-migraine')) {
    return {
      id: 'magnesium-citrate',
      supplementName: 'Magnesium Citrate',
      form: 'citrate',
      reason:
        'Magnesium citrate/glycinate for migraine prevention — 400mg shown to reduce frequency by ~40%',
      note: 'Citrate form selected for migraine prevention — both citrate and glycinate are well-studied',
    };
  }

  // 3. Very active / athlete → MALATE
  if (
    quiz.activityLevel === 'very-active' ||
    quiz.activityLevel === 'athlete'
  ) {
    return {
      id: 'magnesium-malate',
      supplementName: 'Magnesium Malate',
      form: 'malate',
      reason:
        'Magnesium malate selected — malic acid supports ATP production and reduces exercise-induced muscle soreness',
      note: 'Malate form chosen — malic acid participates in the Krebs cycle supporting energy production',
    };
  }

  // 4. Hypertension / heart-health goal → TAURATE
  if (
    hasCond(quiz, 'hypertension', 'high-blood-pressure') ||
    hasGoal(quiz, 'heart-health', 'cardiovascular', 'heart')
  ) {
    return {
      id: 'magnesium-taurate',
      supplementName: 'Magnesium Taurate',
      form: 'taurate',
      reason:
        'Magnesium taurate selected — taurine component provides additional cardiovascular and blood pressure support',
      note: 'Taurate form chosen — taurine has independent cardiovascular benefits',
    };
  }

  // 5. Cognitive goals / brain fog → keep glycinate + ADD threonate
  if (
    hasGoal(quiz, 'cognitive', 'cognitive-performance', 'cognition', 'brain-health') ||
    hasCond(quiz, 'brain-fog', 'cognitive-decline', 'memory-issues', 'cognitive-impairment', 'mild-cognitive-impairment', 'mci')
  ) {
    return {
      id: 'magnesium-glycinate',
      supplementName: 'Magnesium Glycinate',
      form: 'glycinate',
      reason:
        'Magnesium glycinate — best overall bioavailability and tolerability',
      note: 'Glycinate maintained for systemic magnesium; L-threonate added separately for brain penetration',
      addThreonate: true,
    };
  }

  // 6. Fibromyalgia → MALATE
  if (hasCond(quiz, 'fibromyalgia', 'fibro')) {
    return {
      id: 'magnesium-malate',
      supplementName: 'Magnesium Malate',
      form: 'malate',
      reason:
        'Magnesium malate for fibromyalgia — malic acid supports energy production in muscle tissue',
      note: 'Malate form chosen for fibromyalgia — supports ATP production in fatigued muscles',
    };
  }

  // 7. Poor / fair sleep → GLYCINATE (explicit selection)
  if (quiz.sleepQuality === 'poor' || quiz.sleepQuality === 'fair') {
    return {
      id: 'magnesium-glycinate',
      supplementName: 'Magnesium Glycinate',
      form: 'glycinate',
      reason:
        'Magnesium glycinate selected — glycine provides calming GABA-ergic activity that supports sleep',
      note: 'Glycinate form chosen — glycine has independent sleep-promoting effects',
    };
  }

  // 8. Default → GLYCINATE
  return {
    id: 'magnesium-glycinate',
    supplementName: 'Magnesium Glycinate',
    form: 'glycinate',
    reason:
      'Magnesium glycinate — best overall bioavailability and tolerability',
    note: 'Glycinate form — highest bioavailability and fewest GI side effects',
  };
}

// ── Threonate helper ────────────────────────────────────────────────────────

function addThreonate(recs: Recommendation[]): Recommendation[] {
  // Don't add if already present
  if (findExistingRec(recs, 'magnesium-l-threonate')) return recs;

  const rec: Recommendation = {
    id: 'magnesium-l-threonate',
    supplementName: 'Magnesium L-Threonate',
    form: 'l-threonate',
    dose: 1500,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['bedtime'],
    withFood: false,
    evidenceRating: 'Moderate',
    reasons: [
      makeReason(
        'Magnesium L-threonate is the only form proven to increase brain magnesium levels',
      ),
    ],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 6,
    category: 'mineral',
    separateFrom: [],
    sources: [makeSource('added')],
    notes: [
      'L-threonate crosses the blood–brain barrier; other magnesium forms do not meaningfully raise brain Mg²⁺',
    ],
  };

  return addOrModify(recs, rec, LAYER);
}

// ── Main optimizer ──────────────────────────────────────────────────────────

/**
 * Selects the optimal magnesium form based on the user's primary indication.
 * Runs after all 7 layers but before synergy pairs.
 *
 * Priority-ordered: first match wins. Also swaps out oxide if it somehow
 * slipped through from any layer.
 */
export function optimizeMagnesiumForm(
  quizData: QuizData,
  recs: Recommendation[],
): Recommendation[] {
  const existingMg = findMgRec(recs);
  if (!existingMg) return recs;

  const selection = selectForm(quizData);
  if (!selection) return recs;

  let r = recs;

  // If the existing form is oxide OR different from what we selected,
  // we need to swap it.
  const currentId = existingMg.id;
  const targetId = selection.id;

  if (currentId !== targetId) {
    // Remove the old magnesium entry and add a new one with the correct form
    r = r.filter(rec => rec.id !== currentId);

    const newRec: Recommendation = {
      ...existingMg,
      id: targetId,
      supplementName: selection.supplementName,
      form: selection.form,
      reasons: [
        ...existingMg.reasons,
        makeReason(selection.reason),
      ],
      sources: [
        ...existingMg.sources,
        makeSource('modified-form', {
          previousValue: existingMg.form,
          newValue: selection.form,
        }),
      ],
      notes: [
        ...existingMg.notes.filter(
          n => !n.toLowerCase().includes('glycinate form'),
        ),
        selection.note,
      ],
    };

    r = addOrModify(r, newRec, LAYER);
  } else {
    // Same form — just add the optimization reason and note
    r = addReason(r, currentId, LAYER, selection.reason);
    r = appendNote(r, currentId, selection.note);
  }

  // Always swap out oxide if it somehow exists
  const oxideIdx = r.findIndex(
    rec => rec.id.includes('magnesium') && rec.form === 'oxide',
  );
  if (oxideIdx !== -1) {
    const oxideRec = r[oxideIdx];
    r = r.filter((_, i) => i !== oxideIdx);
    const replaced: Recommendation = {
      ...oxideRec,
      id: 'magnesium-glycinate',
      supplementName: 'Magnesium Glycinate',
      form: 'glycinate',
      reasons: [
        ...oxideRec.reasons,
        makeReason(
          'Oxide form replaced with glycinate — oxide has only ~4% bioavailability',
        ),
      ],
      sources: [
        ...oxideRec.sources,
        makeSource('modified-form', {
          previousValue: 'oxide',
          newValue: 'glycinate',
        }),
      ],
      notes: [
        ...oxideRec.notes,
        'Upgraded from oxide to glycinate for superior absorption',
      ],
    };
    r = addOrModify(r, replaced, LAYER);
  }

  // Add threonate if the cognitive pathway selected it
  if (selection.addThreonate) {
    r = addThreonate(r);
  }

  return r;
}
