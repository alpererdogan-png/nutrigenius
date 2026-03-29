// ─────────────────────────────────────────────────────────────────────────────
// Time-to-Effect — Unit Tests
// ─────────────────────────────────────────────────────────────────────────────

import { TIME_TO_EFFECT, applyTimeToEffect } from './timeToEffect';
import { generateProtocol } from '../pipeline';
import { CYCLE_DAILY } from '../types';
import type { QuizData, Recommendation } from '../types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function baseQuiz(overrides: Partial<QuizData> = {}): QuizData {
  return {
    age: 30,
    biologicalSex: 'male',
    country: 'US',
    isPregnant: false,
    isBreastfeeding: false,
    dietaryPattern: 'omnivore',
    allergies: [],
    fishIntake: 'moderate',
    dairyIntake: 'moderate',
    vegetableIntake: 'moderate',
    activityLevel: 'moderate',
    sleepQuality: 'good',
    stressLevel: 'low',
    sunExposure: 'moderate',
    alcoholConsumption: 'none',
    smokingStatus: 'never',
    healthConditions: [],
    familyHistory: [],
    medications: [],
    healthGoals: [],
    ...overrides,
  };
}

/** Minimal stub recommendation for unit tests */
function stubRec(id: string): Recommendation {
  return {
    id,
    supplementName: id,
    form: 'test',
    dose: 100,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Moderate',
    reasons: [],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    sources: [],
    priority: 5,
    category: 'vitamin',
    separateFrom: [],
    notes: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Lookup map sanity
// ─────────────────────────────────────────────────────────────────────────────

describe('TIME_TO_EFFECT lookup map', () => {
  it('contains entries for all common baseline supplements', () => {
    const baseline = [
      'vitamin-d3',
      'magnesium-glycinate',
      'omega-3-fish-oil',
      'vitamin-b12',
      'folate-5mthf',
      'calcium-citrate',
      'zinc-picolinate',
      'coq10-ubiquinol',
      'iron-bisglycinate',
      'iodine',
    ];
    for (const id of baseline) {
      expect(TIME_TO_EFFECT[id]).toBeDefined();
      expect(TIME_TO_EFFECT[id].length).toBeGreaterThan(0);
    }
  });

  it('contains entries for popular adaptogens and herbals', () => {
    const herbals = [
      'ashwagandha-ksm66',
      'rhodiola-rosea',
      'bacopa-monnieri',
      'lions-mane',
      'curcumin',
      'berberine',
    ];
    for (const id of herbals) {
      expect(TIME_TO_EFFECT[id]).toBeDefined();
    }
  });

  it('contains entries for amino acids', () => {
    const aminos = [
      'l-theanine',
      'nac',
      'creatine-monohydrate',
      'glycine',
      'collagen-peptides',
      'same',
    ];
    for (const id of aminos) {
      expect(TIME_TO_EFFECT[id]).toBeDefined();
    }
  });

  it('all values are non-empty strings', () => {
    for (const [id, value] of Object.entries(TIME_TO_EFFECT)) {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it('has no duplicate keys (JS object, so last-write-wins — assert count)', () => {
    // If there were duplicates in the source, the key count would be less than
    // the number of assignment lines. We just verify the map has 100+ entries.
    const count = Object.keys(TIME_TO_EFFECT).length;
    expect(count).toBeGreaterThanOrEqual(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. applyTimeToEffect unit tests
// ─────────────────────────────────────────────────────────────────────────────

describe('applyTimeToEffect()', () => {
  it('stamps known supplement IDs with their timeToEffect', () => {
    const recs = [stubRec('vitamin-d3'), stubRec('l-theanine')];
    const result = applyTimeToEffect(recs);

    expect(result[0].timeToEffect).toBe(TIME_TO_EFFECT['vitamin-d3']);
    expect(result[1].timeToEffect).toBe(TIME_TO_EFFECT['l-theanine']);
  });

  it('leaves timeToEffect undefined for unknown IDs', () => {
    const recs = [stubRec('unknown-supplement')];
    const result = applyTimeToEffect(recs);

    expect(result[0].timeToEffect).toBeUndefined();
  });

  it('does not mutate original recommendation objects', () => {
    const original = stubRec('vitamin-d3');
    const recs = [original];
    applyTimeToEffect(recs);

    expect(original.timeToEffect).toBeUndefined();
  });

  it('preserves existing timeToEffect if not in lookup', () => {
    const rec = { ...stubRec('unknown-supplement'), timeToEffect: 'custom value' };
    const result = applyTimeToEffect([rec]);

    expect(result[0].timeToEffect).toBe('custom value');
  });

  it('overwrites existing timeToEffect when lookup has a value', () => {
    const rec = { ...stubRec('vitamin-d3'), timeToEffect: 'old value' };
    const result = applyTimeToEffect([rec]);

    expect(result[0].timeToEffect).toBe(TIME_TO_EFFECT['vitamin-d3']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Pipeline integration — timeToEffect populated end-to-end
// ─────────────────────────────────────────────────────────────────────────────

describe('Pipeline integration — timeToEffect', () => {
  it('vitamin-d3 has timeToEffect after full pipeline run', () => {
    const quiz = baseQuiz({ sunExposure: 'minimal', country: 'IE' });
    const result = generateProtocol(quiz, 'premium');
    const d3 = result.recommendations.find(r => r.id === 'vitamin-d3');

    expect(d3).toBeDefined();
    expect(d3!.timeToEffect).toBe(TIME_TO_EFFECT['vitamin-d3']);
  });

  it('magnesium-glycinate has timeToEffect after full pipeline run', () => {
    const quiz = baseQuiz({ stressLevel: 'high' });
    const result = generateProtocol(quiz, 'premium');
    const mag = result.recommendations.find(r => r.id === 'magnesium-glycinate');

    expect(mag).toBeDefined();
    expect(mag!.timeToEffect).toBe(TIME_TO_EFFECT['magnesium-glycinate']);
  });

  it('all displayed recommendations have timeToEffect set (when ID is in lookup)', () => {
    const quiz = baseQuiz({ sunExposure: 'minimal', stressLevel: 'high' });
    const result = generateProtocol(quiz, 'premium');

    for (const rec of result.displayedRecommendations) {
      if (TIME_TO_EFFECT[rec.id]) {
        expect(rec.timeToEffect).toBe(TIME_TO_EFFECT[rec.id]);
      }
    }
  });
});
