// ─────────────────────────────────────────────────────────────────────────────
// Monitoring Notes — Blood-work & lab tracking for supplements
//
// Some supplements require periodic lab monitoring to ensure safety and
// efficacy. This module provides a database of monitoring recommendations
// and a pipeline function that attaches them to relevant Recommendation
// objects based on supplement ID, dose, and health conditions.
// ─────────────────────────────────────────────────────────────────────────────

import type { Recommendation } from '../types';

// ── Public types ─────────────────────────────────────────────────────────────

export interface MonitoringNote {
  supplementId: string;
  /** Lab test name, e.g. "Serum 25-OH Vitamin D" */
  test: string;
  /** When/how often to retest, e.g. "Retest in 3 months" */
  frequency: string;
  /** Optimal target range (if applicable) */
  target?: string;
  /** Visual prominence on the results card */
  urgency: 'routine' | 'important' | 'essential';
}

// ── Monitoring rule definitions ──────────────────────────────────────────────
//
// Each rule is a function that receives a Recommendation and returns a
// MonitoringNote[] (empty array = no monitoring needed for this rule).
// This allows dose-aware and condition-aware gating.

interface MonitoringRule {
  /** Supplement IDs this rule applies to */
  ids: string[];
  /** Return monitoring notes if the rule fires; empty array otherwise */
  evaluate: (rec: Recommendation) => MonitoringNote[];
}

const MONITORING_RULES: MonitoringRule[] = [
  // ── Vitamin D3 at ≥ 4,000 IU ────────────────────────────────────────────
  {
    ids: ['vitamin-d3'],
    evaluate: (rec) => {
      if (rec.doseUnit === 'IU' && rec.dose >= 4000) {
        return [{
          supplementId: rec.id,
          test: 'Serum 25-OH Vitamin D',
          frequency: 'Retest in 3 months, then annually',
          target: 'Aim for 40-60 ng/mL. Do not exceed 80 ng/mL.',
          urgency: 'important',
        }];
      }
      return [];
    },
  },

  // ── Iron (any dose) ──────────────────────────────────────────────────────
  {
    ids: ['iron-bisglycinate'],
    evaluate: (rec) => [{
      supplementId: rec.id,
      test: 'Ferritin + Complete Blood Count (CBC)',
      frequency: 'Retest in 3 months',
      target: 'Ferritin target: 50-100 ng/mL. Stop supplementation when ferritin >50.',
      urgency: 'essential',
    }],
  },

  // ── Berberine ────────────────────────────────────────────────────────────
  {
    ids: ['berberine'],
    evaluate: (rec) => [{
      supplementId: rec.id,
      test: 'Fasting glucose and HbA1c',
      frequency: 'Every 3 months while taking berberine',
      target: 'Fasting glucose 70-100 mg/dL, HbA1c <5.7%',
      urgency: 'important',
    }],
  },

  // ── Zinc at ≥ 25 mg ─────────────────────────────────────────────────────
  {
    ids: ['zinc-picolinate', 'zinc-carnosine'],
    evaluate: (rec) => {
      if (rec.doseUnit === 'mg' && rec.dose >= 25) {
        return [{
          supplementId: rec.id,
          test: 'Serum copper and ceruloplasmin',
          frequency: 'After 3 months of high-dose zinc use',
          target: 'Ensure copper remains within normal range',
          urgency: 'routine',
        }];
      }
      return [];
    },
  },

  // ── Selenium (> 200 mcg) ────────────────────────────────────────────────
  {
    ids: ['selenium'],
    evaluate: (rec) => {
      if (rec.doseUnit === 'mcg' && rec.dose > 200) {
        return [{
          supplementId: rec.id,
          test: 'Serum selenium',
          frequency: 'After 6 months',
          target: '100-150 µg/L. Do not exceed 400 mcg/day total.',
          urgency: 'routine',
        }];
      }
      return [];
    },
  },

  // ── Vitamin B12 (repletion dose ≥ 1,000 mcg) ───────────────────────────
  {
    ids: ['vitamin-b12'],
    evaluate: (rec) => {
      if (rec.doseUnit === 'mcg' && rec.dose >= 1000) {
        return [{
          supplementId: rec.id,
          test: 'Serum B12, and MMA (methylmalonic acid) for functional status',
          frequency: 'Retest in 3 months',
          target: 'Serum B12 >400 pg/mL, MMA <0.4 µmol/L',
          urgency: 'important',
        }];
      }
      return [];
    },
  },

  // ── Thyroid-related (selenium & iodine when hypothyroid context) ─────────
  // The pipeline can't directly see quiz conditions here, so we gate on
  // reason text that mentions thyroid/hypothyroid. This is checked via the
  // recommendation's reasons array.
  {
    ids: ['selenium', 'iodine'],
    evaluate: (rec) => {
      const hasThyroidReason = rec.reasons.some(
        r => /thyroid|hypothyroid|hashimoto/i.test(r.reason + (r.detail ?? '')),
      );
      if (hasThyroidReason) {
        return [{
          supplementId: rec.id,
          test: 'TSH, Free T4, thyroid antibodies (TPO, TG)',
          frequency: 'Retest in 3 months',
          target: 'TSH 0.5-2.5 mIU/L (optimal functional range)',
          urgency: 'important',
        }];
      }
      return [];
    },
  },

  // ── High-dose Omega-3 (≥ 3,000 mg) on blood thinners ───────────────────
  // Gate on dose + warning text mentioning warfarin / anticoagulant.
  {
    ids: ['omega-3-fish-oil', 'dha-algae'],
    evaluate: (rec) => {
      if (rec.dose >= 3000 && rec.doseUnit === 'mg') {
        const mentionsAnticoag = rec.warnings.some(
          w => /warfarin|anticoagulant|blood.?thin/i.test(w),
        );
        if (mentionsAnticoag) {
          return [{
            supplementId: rec.id,
            test: 'INR (if on warfarin) or bleeding time assessment',
            frequency: '2-4 weeks after starting, then as directed',
            urgency: 'essential',
          }];
        }
      }
      return [];
    },
  },

  // ── Chromium (for prediabetes/diabetes) ─────────────────────────────────
  {
    ids: ['chromium-picolinate'],
    evaluate: (rec) => {
      const hasDiabetesReason = rec.reasons.some(
        r => /diabetes|blood.?sugar|prediabet|insulin/i.test(r.reason + (r.detail ?? '')),
      );
      if (hasDiabetesReason) {
        return [{
          supplementId: rec.id,
          test: 'HbA1c and fasting glucose',
          frequency: 'Every 3 months',
          target: 'Monitor for hypoglycemia if on diabetes medications',
          urgency: 'important',
        }];
      }
      return [];
    },
  },

  // ── Vitamin A (preformed retinol > 1,500 mcg) ──────────────────────────
  {
    ids: ['vitamin-a'],
    evaluate: (rec) => {
      if (rec.doseUnit === 'mcg' && rec.dose > 1500) {
        return [{
          supplementId: rec.id,
          test: 'Serum retinol',
          frequency: 'After 6 months if taking >1,500 mcg',
          target: '20-60 µg/dL. Liver toxicity risk above UL.',
          urgency: 'important',
        }];
      }
      return [];
    },
  },
];

// ── Pipeline function ────────────────────────────────────────────────────────

/**
 * Evaluates all monitoring rules against each recommendation and attaches
 * matching MonitoringNote arrays. Called once by the pipeline after
 * applyTimeToEffect and before the safety filter.
 */
export function applyMonitoringNotes(recs: Recommendation[]): Recommendation[] {
  return recs.map(rec => {
    const notes: MonitoringNote[] = [];
    for (const rule of MONITORING_RULES) {
      if (rule.ids.includes(rec.id)) {
        notes.push(...rule.evaluate(rec));
      }
    }
    return notes.length > 0
      ? { ...rec, monitoringNotes: notes }
      : rec;
  });
}

// ── Utilities for the results page ───────────────────────────────────────────

/** Group monitoring notes by timeframe for the global summary card */
export function groupMonitoringByTimeframe(
  notes: MonitoringNote[],
): { timeframe: string; items: MonitoringNote[] }[] {
  const buckets = new Map<string, MonitoringNote[]>();

  for (const note of notes) {
    const tf = extractTimeframe(note.frequency);
    const list = buckets.get(tf) ?? [];
    list.push(note);
    buckets.set(tf, list);
  }

  // Sort: shorter timeframes first
  const ORDER = ['2-4 weeks', 'At 3 months', 'At 6 months', 'Ongoing'];
  return ORDER
    .filter(tf => buckets.has(tf))
    .map(tf => ({ timeframe: tf, items: buckets.get(tf)! }));
}

function extractTimeframe(frequency: string): string {
  if (/2-4 weeks/i.test(frequency)) return '2-4 weeks';
  // "Every X" and "while taking" patterns are ongoing, check before fixed timeframes
  if (/every|while|ongoing/i.test(frequency)) return 'Ongoing';
  if (/then as directed/i.test(frequency)) return 'Ongoing';
  if (/3 months/i.test(frequency)) return 'At 3 months';
  if (/6 months/i.test(frequency)) return 'At 6 months';
  return 'At 3 months'; // sensible default
}
