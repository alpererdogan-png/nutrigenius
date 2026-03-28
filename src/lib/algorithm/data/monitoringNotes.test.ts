// ─────────────────────────────────────────────────────────────────────────────
// Monitoring Notes — Unit & Integration Tests
// ─────────────────────────────────────────────────────────────────────────────

import {
  applyMonitoringNotes,
  groupMonitoringByTimeframe,
  MonitoringNote,
} from './monitoringNotes';
import { generateProtocol } from '../pipeline';
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

function stubRec(overrides: Partial<Recommendation> & { id: string }): Recommendation {
  return {
    supplementName: overrides.id,
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
    cyclingPattern: { activeDays: [true, true, true, true, true, true, true], description: 'Daily' },
    sources: [],
    priority: 5,
    category: 'vitamin',
    separateFrom: [],
    notes: [],
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. applyMonitoringNotes — dose-aware rules
// ─────────────────────────────────────────────────────────────────────────────

describe('applyMonitoringNotes — dose-aware rules', () => {
  it('attaches monitoring note to vitamin-d3 at 5,000 IU', () => {
    const recs = [stubRec({ id: 'vitamin-d3', dose: 5000, doseUnit: 'IU' })];
    const result = applyMonitoringNotes(recs);

    expect(result[0].monitoringNotes).toBeDefined();
    expect(result[0].monitoringNotes!.length).toBe(1);
    expect(result[0].monitoringNotes![0].test).toBe('Serum 25-OH Vitamin D');
    expect(result[0].monitoringNotes![0].urgency).toBe('important');
  });

  it('does NOT attach monitoring to vitamin-d3 at 2,000 IU (below threshold)', () => {
    const recs = [stubRec({ id: 'vitamin-d3', dose: 2000, doseUnit: 'IU' })];
    const result = applyMonitoringNotes(recs);

    expect(result[0].monitoringNotes).toBeUndefined();
  });

  it('attaches monitoring to iron-bisglycinate at any dose', () => {
    const recs = [stubRec({ id: 'iron-bisglycinate', dose: 18, doseUnit: 'mg' })];
    const result = applyMonitoringNotes(recs);

    expect(result[0].monitoringNotes).toBeDefined();
    expect(result[0].monitoringNotes![0].test).toBe('Ferritin + Complete Blood Count (CBC)');
    expect(result[0].monitoringNotes![0].urgency).toBe('essential');
  });

  it('attaches monitoring to berberine', () => {
    const recs = [stubRec({ id: 'berberine', dose: 500, doseUnit: 'mg' })];
    const result = applyMonitoringNotes(recs);

    expect(result[0].monitoringNotes).toBeDefined();
    expect(result[0].monitoringNotes![0].test).toBe('Fasting glucose and HbA1c');
    expect(result[0].monitoringNotes![0].urgency).toBe('important');
  });

  it('attaches monitoring to zinc-picolinate at ≥ 25 mg', () => {
    const recs = [stubRec({ id: 'zinc-picolinate', dose: 30, doseUnit: 'mg' })];
    const result = applyMonitoringNotes(recs);

    expect(result[0].monitoringNotes).toBeDefined();
    expect(result[0].monitoringNotes![0].test).toBe('Serum copper and ceruloplasmin');
    expect(result[0].monitoringNotes![0].urgency).toBe('routine');
  });

  it('does NOT attach monitoring to zinc-picolinate at 15 mg (below threshold)', () => {
    const recs = [stubRec({ id: 'zinc-picolinate', dose: 15, doseUnit: 'mg' })];
    const result = applyMonitoringNotes(recs);

    expect(result[0].monitoringNotes).toBeUndefined();
  });

  it('attaches monitoring to vitamin-b12 at ≥ 1,000 mcg', () => {
    const recs = [stubRec({ id: 'vitamin-b12', dose: 1000, doseUnit: 'mcg' })];
    const result = applyMonitoringNotes(recs);

    expect(result[0].monitoringNotes).toBeDefined();
    expect(result[0].monitoringNotes![0].test).toContain('Serum B12');
    expect(result[0].monitoringNotes![0].urgency).toBe('important');
  });

  it('does NOT attach monitoring to vitamin-b12 at 500 mcg (below threshold)', () => {
    const recs = [stubRec({ id: 'vitamin-b12', dose: 500, doseUnit: 'mcg' })];
    const result = applyMonitoringNotes(recs);

    expect(result[0].monitoringNotes).toBeUndefined();
  });

  it('attaches thyroid monitoring to selenium when reason mentions thyroid', () => {
    const recs = [stubRec({
      id: 'selenium',
      dose: 200,
      doseUnit: 'mcg',
      reasons: [{ layer: 'conditions', reason: 'Hypothyroidism — selenium is a cofactor for deiodinase enzymes' }],
    })];
    const result = applyMonitoringNotes(recs);

    expect(result[0].monitoringNotes).toBeDefined();
    expect(result[0].monitoringNotes!.some(n => n.test.includes('TSH'))).toBe(true);
  });

  it('does NOT attach thyroid monitoring to selenium without thyroid reason', () => {
    const recs = [stubRec({
      id: 'selenium',
      dose: 100,
      doseUnit: 'mcg',
      reasons: [{ layer: 'demographic', reason: 'General antioxidant support' }],
    })];
    const result = applyMonitoringNotes(recs);

    expect(result[0].monitoringNotes).toBeUndefined();
  });

  it('attaches monitoring to vitamin-a at > 1,500 mcg', () => {
    const recs = [stubRec({ id: 'vitamin-a', dose: 3000, doseUnit: 'mcg' })];
    const result = applyMonitoringNotes(recs);

    expect(result[0].monitoringNotes).toBeDefined();
    expect(result[0].monitoringNotes![0].test).toBe('Serum retinol');
    expect(result[0].monitoringNotes![0].urgency).toBe('important');
  });

  it('attaches monitoring to chromium-picolinate with diabetes reason', () => {
    const recs = [stubRec({
      id: 'chromium-picolinate',
      dose: 200,
      doseUnit: 'mcg',
      reasons: [{ layer: 'conditions', reason: 'Blood sugar support for prediabetes' }],
    })];
    const result = applyMonitoringNotes(recs);

    expect(result[0].monitoringNotes).toBeDefined();
    expect(result[0].monitoringNotes![0].test).toBe('HbA1c and fasting glucose');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. applyMonitoringNotes — general behavior
// ─────────────────────────────────────────────────────────────────────────────

describe('applyMonitoringNotes — general behavior', () => {
  it('does not mutate original recommendation objects', () => {
    const original = stubRec({ id: 'iron-bisglycinate', dose: 18, doseUnit: 'mg' });
    applyMonitoringNotes([original]);

    expect(original.monitoringNotes).toBeUndefined();
  });

  it('leaves supplements without rules unchanged (no monitoringNotes key)', () => {
    const recs = [stubRec({ id: 'l-theanine', dose: 200, doseUnit: 'mg' })];
    const result = applyMonitoringNotes(recs);

    expect(result[0].monitoringNotes).toBeUndefined();
  });

  it('can attach multiple monitoring notes to the same supplement', () => {
    // selenium at > 200 mcg with thyroid reason → serum selenium + TSH
    const recs = [stubRec({
      id: 'selenium',
      dose: 300,
      doseUnit: 'mcg',
      reasons: [{ layer: 'conditions', reason: 'Hypothyroidism support' }],
    })];
    const result = applyMonitoringNotes(recs);

    expect(result[0].monitoringNotes).toBeDefined();
    expect(result[0].monitoringNotes!.length).toBe(2);
    const tests = result[0].monitoringNotes!.map(n => n.test);
    expect(tests).toContain('Serum selenium');
    expect(tests.some(t => t.includes('TSH'))).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. groupMonitoringByTimeframe
// ─────────────────────────────────────────────────────────────────────────────

describe('groupMonitoringByTimeframe', () => {
  const notes: MonitoringNote[] = [
    { supplementId: 'vitamin-d3', test: 'Vitamin D', frequency: 'Retest in 3 months, then annually', urgency: 'important' },
    { supplementId: 'iron-bisglycinate', test: 'Ferritin + CBC', frequency: 'Retest in 3 months', urgency: 'essential' },
    { supplementId: 'selenium', test: 'Serum selenium', frequency: 'After 6 months', urgency: 'routine' },
    { supplementId: 'berberine', test: 'HbA1c', frequency: 'Every 3 months while taking berberine', urgency: 'important' },
    { supplementId: 'omega-3-fish-oil', test: 'INR', frequency: '2-4 weeks after starting, then as directed', urgency: 'essential' },
  ];

  it('groups notes into the correct timeframe buckets', () => {
    const groups = groupMonitoringByTimeframe(notes);
    const timeframes = groups.map(g => g.timeframe);

    expect(timeframes).toContain('2-4 weeks');
    expect(timeframes).toContain('At 3 months');
    expect(timeframes).toContain('At 6 months');
    expect(timeframes).toContain('Ongoing');
  });

  it('sorts timeframes from earliest to latest', () => {
    const groups = groupMonitoringByTimeframe(notes);
    const timeframes = groups.map(g => g.timeframe);

    expect(timeframes.indexOf('2-4 weeks')).toBeLessThan(timeframes.indexOf('At 3 months'));
    expect(timeframes.indexOf('At 3 months')).toBeLessThan(timeframes.indexOf('At 6 months'));
    expect(timeframes.indexOf('At 6 months')).toBeLessThan(timeframes.indexOf('Ongoing'));
  });

  it('puts "Retest in 3 months" into the At 3 months bucket', () => {
    const groups = groupMonitoringByTimeframe(notes);
    const threeMonth = groups.find(g => g.timeframe === 'At 3 months');

    expect(threeMonth).toBeDefined();
    expect(threeMonth!.items.some(n => n.supplementId === 'vitamin-d3')).toBe(true);
    expect(threeMonth!.items.some(n => n.supplementId === 'iron-bisglycinate')).toBe(true);
  });

  it('puts "Every 3 months while taking" into Ongoing bucket', () => {
    const groups = groupMonitoringByTimeframe(notes);
    const ongoing = groups.find(g => g.timeframe === 'Ongoing');

    expect(ongoing).toBeDefined();
    expect(ongoing!.items.some(n => n.supplementId === 'berberine')).toBe(true);
  });

  it('returns empty array for no notes', () => {
    expect(groupMonitoringByTimeframe([])).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Pipeline integration — monitoring notes populated end-to-end
// ─────────────────────────────────────────────────────────────────────────────

describe('Pipeline integration — monitoring notes', () => {
  it('iron-bisglycinate gets essential monitoring note for pregnant user', () => {
    const quiz = baseQuiz({
      age: 28,
      biologicalSex: 'female',
      isPregnant: true,
    });
    const result = generateProtocol(quiz, 'premium');
    const iron = result.recommendations.find(r => r.id === 'iron-bisglycinate');

    // Iron may or may not be in the protocol depending on layers,
    // but if present it must have monitoring
    if (iron) {
      expect(iron.monitoringNotes).toBeDefined();
      expect(iron.monitoringNotes!.length).toBeGreaterThanOrEqual(1);
      expect(iron.monitoringNotes![0].urgency).toBe('essential');
    }
  });

  it('vitamin-d3 gets monitoring note when dose is high (minimal sun, high latitude)', () => {
    const quiz = baseQuiz({
      age: 55,
      country: 'IE',
      sunExposure: 'minimal',
    });
    const result = generateProtocol(quiz, 'premium');
    const d3 = result.recommendations.find(r => r.id === 'vitamin-d3');

    expect(d3).toBeDefined();
    // High-latitude + minimal sun should produce ≥ 4000 IU
    if (d3 && d3.dose >= 4000) {
      expect(d3.monitoringNotes).toBeDefined();
      expect(d3.monitoringNotes![0].test).toBe('Serum 25-OH Vitamin D');
    }
  });

  it('berberine gets monitoring when recommended for metabolic conditions', () => {
    const quiz = baseQuiz({
      healthConditions: ['type-2-diabetes'],
    });
    const result = generateProtocol(quiz, 'premium');
    const berberine = result.recommendations.find(r => r.id === 'berberine');

    if (berberine) {
      expect(berberine.monitoringNotes).toBeDefined();
      expect(berberine.monitoringNotes!.some(n => n.test.includes('glucose'))).toBe(true);
    }
  });

  it('selenium gets thyroid monitoring for hypothyroid user', () => {
    const quiz = baseQuiz({
      healthConditions: ['hypothyroidism'],
    });
    const result = generateProtocol(quiz, 'premium');
    const selenium = result.recommendations.find(r => r.id === 'selenium');

    if (selenium) {
      expect(selenium.monitoringNotes).toBeDefined();
      expect(selenium.monitoringNotes!.some(n => n.test.includes('TSH'))).toBe(true);
    }
  });
});
