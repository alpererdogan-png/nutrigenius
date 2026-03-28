// ─────────────────────────────────────────────────────────────────────────────
// Synergy Pairs — Unit Tests
// ─────────────────────────────────────────────────────────────────────────────

import { applySynergyPairs } from './synergyPairs';
import { addOrModify } from '../layers/layer1-demographic';
import { QuizData, Recommendation, CYCLE_DAILY } from '../types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

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

function makeRec(overrides: Partial<Recommendation> & { id: string }): Recommendation {
  return {
    supplementName: overrides.id,
    form: 'standard',
    dose: 500,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Moderate',
    reasons: [],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 5,
    category: 'vitamin',
    separateFrom: [],
    notes: [],
    sources: [{ layer: 'demographic', action: 'added' }],
    ...overrides,
  } as Recommendation;
}

function getRec(recs: Recommendation[], id: string): Recommendation | undefined {
  return recs.find(r => r.id === id);
}

/**
 * Build a minimal recs array with the given seeds, then run applySynergyPairs.
 * Uses addOrModify to prevent pre-existing duplicates.
 */
function run(seeds: Recommendation[], quizOverrides: Partial<QuizData> = {}): Recommendation[] {
  let recs: Recommendation[] = [];
  for (const s of seeds) recs = addOrModify(recs, s, 'goals');
  return applySynergyPairs(recs, baseQuiz(quizOverrides));
}

// ─── Rule 1: Vitamin D ≥ 2,000 IU → K2 auto-added ───────────────────────────

describe('Rule 1 — Vitamin D → Vitamin K2', () => {
  it('adds vitamin-k2-mk7 at 100 mcg when vitamin-d3 is 3,000 IU', () => {
    const recs = run([
      makeRec({ id: 'vitamin-d3', dose: 3000, doseUnit: 'IU' }),
    ]);
    const k2 = getRec(recs, 'vitamin-k2-mk7');
    expect(k2).toBeDefined();
    expect(k2!.dose).toBe(100);
    expect(k2!.doseUnit).toBe('mcg');
  });

  it('uses 200 mcg when vitamin-d3 is ≥ 4,000 IU', () => {
    const recs = run([
      makeRec({ id: 'vitamin-d3', dose: 4000, doseUnit: 'IU' }),
    ]);
    expect(getRec(recs, 'vitamin-k2-mk7')!.dose).toBe(200);
  });

  it('does NOT add K2 when vitamin-d3 is below 2,000 IU', () => {
    const recs = run([
      makeRec({ id: 'vitamin-d3', dose: 1000, doseUnit: 'IU' }),
    ]);
    expect(getRec(recs, 'vitamin-k2-mk7')).toBeUndefined();
  });

  it('does not create a duplicate K2 — raises dose if existing is lower', () => {
    const recs = run([
      makeRec({ id: 'vitamin-d3', dose: 4000, doseUnit: 'IU' }),
      makeRec({ id: 'vitamin-k2-mk7', dose: 50, doseUnit: 'mcg' }),
    ]);
    const k2s = recs.filter(r => r.id === 'vitamin-k2-mk7');
    expect(k2s).toHaveLength(1);
    expect(k2s[0].dose).toBeGreaterThanOrEqual(200);
  });

  it('does not lower an existing K2 dose that already meets the target', () => {
    const recs = run([
      makeRec({ id: 'vitamin-d3', dose: 2000, doseUnit: 'IU' }),
      makeRec({ id: 'vitamin-k2-mk7', dose: 180, doseUnit: 'mcg' }),
    ]);
    expect(getRec(recs, 'vitamin-k2-mk7')!.dose).toBe(180);
  });
});

// ─── Rule 2: Iron → Vitamin C at same timing ─────────────────────────────────

describe('Rule 2 — Iron → Vitamin C', () => {
  it('adds vitamin-c at the same timing as iron when absent', () => {
    const recs = run([
      makeRec({ id: 'iron-bisglycinate', dose: 18, doseUnit: 'mg', timing: ['morning-empty'] }),
    ]);
    const vitC = getRec(recs, 'vitamin-c');
    expect(vitC).toBeDefined();
    expect(vitC!.dose).toBeGreaterThanOrEqual(200);
    expect(vitC!.timing).toContain('morning-empty');
  });

  it('does not create a duplicate vitamin-c when already present', () => {
    const recs = run([
      makeRec({ id: 'iron-bisglycinate', dose: 18, doseUnit: 'mg', timing: ['morning-empty'] }),
      makeRec({ id: 'vitamin-c', dose: 500, doseUnit: 'mg', timing: ['morning-empty'] }),
    ]);
    expect(recs.filter(r => r.id === 'vitamin-c')).toHaveLength(1);
  });

  it('adds a co-administration note when vitamin-c timing differs from iron', () => {
    const recs = run([
      makeRec({ id: 'iron-bisglycinate', dose: 18, doseUnit: 'mg', timing: ['morning-empty'] }),
      makeRec({ id: 'vitamin-c', dose: 1000, doseUnit: 'mg', timing: ['midday'] }),
    ]);
    const vitC = getRec(recs, 'vitamin-c');
    expect(vitC!.notes.some(n => n.toLowerCase().includes('iron'))).toBe(true);
  });

  it('does nothing when iron is absent', () => {
    const recs = run([]);
    expect(getRec(recs, 'vitamin-c')).toBeUndefined();
  });
});

// ─── Rule 3: Zinc ≥ 25 mg → Copper auto-added ────────────────────────────────

describe('Rule 3 — Zinc → Copper', () => {
  it('adds copper-glycinate at 2 mg when zinc is 30 mg', () => {
    const recs = run([
      makeRec({ id: 'zinc-picolinate', dose: 30, doseUnit: 'mg' }),
    ]);
    const copper = getRec(recs, 'copper-glycinate');
    expect(copper).toBeDefined();
    expect(copper!.dose).toBe(2);
    expect(copper!.doseUnit).toBe('mg');
  });

  it('adds copper at 3 mg when zinc is ≥ 40 mg', () => {
    const recs = run([
      makeRec({ id: 'zinc-picolinate', dose: 40, doseUnit: 'mg' }),
    ]);
    expect(getRec(recs, 'copper-glycinate')!.dose).toBe(3);
  });

  it('does NOT add copper when zinc is below 25 mg', () => {
    const recs = run([
      makeRec({ id: 'zinc-picolinate', dose: 15, doseUnit: 'mg' }),
    ]);
    expect(getRec(recs, 'copper-glycinate')).toBeUndefined();
  });

  it('does not create duplicate copper — raises dose if below minimum', () => {
    const recs = run([
      makeRec({ id: 'zinc-picolinate', dose: 40, doseUnit: 'mg' }),
      makeRec({ id: 'copper-glycinate', dose: 1, doseUnit: 'mg' }),
    ]);
    const coppers = recs.filter(r => r.id === 'copper-glycinate');
    expect(coppers).toHaveLength(1);
    expect(coppers[0].dose).toBeGreaterThanOrEqual(3);
  });

  it('places copper at a different timing slot than zinc', () => {
    const recs = run([
      makeRec({ id: 'zinc-picolinate', dose: 30, doseUnit: 'mg', timing: ['morning-with-food'] }),
    ]);
    const copper = getRec(recs, 'copper-glycinate');
    const zinc = getRec(recs, 'zinc-picolinate');
    expect(copper!.timing).not.toEqual(zinc!.timing);
  });
});

// ─── Rule 4: Curcumin → absorption note ──────────────────────────────────────

describe('Rule 4 — Curcumin absorption note', () => {
  it('adds piperine note for standard curcumin form', () => {
    const recs = run([
      makeRec({ id: 'curcumin', form: 'standard-extract' }),
    ]);
    const c = getRec(recs, 'curcumin');
    expect(c!.notes.some(n => n.toLowerCase().includes('piperine'))).toBe(true);
  });

  it('adds enhanced-absorption note for phytosome form', () => {
    const recs = run([
      makeRec({ id: 'curcumin', form: 'phytosome' }),
    ]);
    const c = getRec(recs, 'curcumin');
    expect(c!.notes.some(n => n.toLowerCase().includes('enhanced absorption'))).toBe(true);
    expect(c!.notes.some(n => n.toLowerCase().includes('piperine'))).toBe(false);
  });

  it('adds enhanced-absorption note for phospholipid-complex form', () => {
    const recs = run([
      makeRec({ id: 'curcumin', form: 'phospholipid-complex' }),
    ]);
    const c = getRec(recs, 'curcumin');
    expect(c!.notes.some(n => n.toLowerCase().includes('enhanced absorption'))).toBe(true);
  });

  it('adds the note only once (no duplicate notes on re-run)', () => {
    let recs = run([makeRec({ id: 'curcumin', form: 'standard-extract' })]);
    recs = applySynergyPairs(recs, baseQuiz());
    const c = getRec(recs, 'curcumin')!;
    const piperinNotes = c.notes.filter(n => n.toLowerCase().includes('piperine'));
    expect(piperinNotes).toHaveLength(1);
  });
});

// ─── Rule 5: Calcium → Magnesium auto-added ───────────────────────────────────

describe('Rule 5 — Calcium → Magnesium', () => {
  it('adds magnesium-glycinate at ~½ calcium dose when absent', () => {
    const recs = run([
      makeRec({ id: 'calcium-citrate', dose: 1000, doseUnit: 'mg' }),
    ]);
    const mg = getRec(recs, 'magnesium-glycinate');
    expect(mg).toBeDefined();
    expect(mg!.dose).toBeGreaterThanOrEqual(400);
    expect(mg!.dose).toBeLessThanOrEqual(600);
  });

  it('does not create duplicate magnesium when already present', () => {
    const recs = run([
      makeRec({ id: 'calcium-citrate', dose: 1000, doseUnit: 'mg' }),
      makeRec({ id: 'magnesium-glycinate', dose: 300, doseUnit: 'mg' }),
    ]);
    expect(recs.filter(r => r.id === 'magnesium-glycinate')).toHaveLength(1);
  });

  it('adds a synergy reason to existing magnesium', () => {
    const recs = run([
      makeRec({ id: 'calcium-citrate', dose: 1000, doseUnit: 'mg' }),
      makeRec({ id: 'magnesium-glycinate', dose: 300, doseUnit: 'mg' }),
    ]);
    const mg = getRec(recs, 'magnesium-glycinate')!;
    expect(mg.reasons.some(r => r.reason.toLowerCase().includes('calcium'))).toBe(true);
  });

  it('does nothing when calcium is absent', () => {
    const recs = run([]);
    expect(getRec(recs, 'magnesium-glycinate')).toBeUndefined();
  });
});

// ─── Rule 6: B12 → Folate auto-added ─────────────────────────────────────────

describe('Rule 6 — B12 → Folate', () => {
  it('adds folate-5mthf at 400 mcg when B12 is present and folate absent', () => {
    const recs = run([
      makeRec({ id: 'vitamin-b12', dose: 500, doseUnit: 'mcg' }),
    ]);
    const folate = getRec(recs, 'folate-5mthf');
    expect(folate).toBeDefined();
    expect(folate!.dose).toBe(400);
    expect(folate!.doseUnit).toBe('mcg');
  });

  it('does not create duplicate folate when already present', () => {
    const recs = run([
      makeRec({ id: 'vitamin-b12', dose: 500, doseUnit: 'mcg' }),
      makeRec({ id: 'folate-5mthf', dose: 800, doseUnit: 'mcg' }),
    ]);
    expect(recs.filter(r => r.id === 'folate-5mthf')).toHaveLength(1);
  });

  it('adds a synergy reason to existing folate', () => {
    const recs = run([
      makeRec({ id: 'vitamin-b12', dose: 500, doseUnit: 'mcg' }),
      makeRec({ id: 'folate-5mthf', dose: 800, doseUnit: 'mcg' }),
    ]);
    const folate = getRec(recs, 'folate-5mthf')!;
    expect(folate.reasons.some(r => r.reason.toLowerCase().includes('methylation'))).toBe(true);
  });

  it('does nothing when B12 is absent', () => {
    const recs = run([]);
    expect(getRec(recs, 'folate-5mthf')).toBeUndefined();
  });
});

// ─── Rule 7: Collagen + athlete → pre-exercise timing + Vitamin C ────────────

describe('Rule 7 — Collagen + athlete synergy', () => {
  it('shifts collagen-peptides to morning-empty for athletes', () => {
    const recs = run(
      [makeRec({ id: 'collagen-peptides', dose: 10000, doseUnit: 'mg', timing: ['midday'] })],
      { activityLevel: 'athlete' },
    );
    const collagen = getRec(recs, 'collagen-peptides');
    expect(collagen!.timing).toContain('morning-empty');
  });

  it('adds the Baar et al. note to collagen', () => {
    const recs = run(
      [makeRec({ id: 'collagen-peptides', dose: 10000, doseUnit: 'mg' })],
      { activityLevel: 'athlete' },
    );
    const collagen = getRec(recs, 'collagen-peptides')!;
    expect(collagen.notes.some(n => n.toLowerCase().includes('baar'))).toBe(true);
  });

  it('adds vitamin-c at 500 mg pre-exercise when absent', () => {
    const recs = run(
      [makeRec({ id: 'collagen-peptides', dose: 10000, doseUnit: 'mg' })],
      { activityLevel: 'very-active' },
    );
    const vitC = getRec(recs, 'vitamin-c');
    expect(vitC).toBeDefined();
    expect(vitC!.dose).toBeGreaterThanOrEqual(500);
    expect(vitC!.timing).toContain('morning-empty');
  });

  it('raises existing vitamin-c to 500 mg if below that', () => {
    const recs = run(
      [
        makeRec({ id: 'collagen-peptides', dose: 10000, doseUnit: 'mg' }),
        makeRec({ id: 'vitamin-c', dose: 200, doseUnit: 'mg', timing: ['morning-empty'] }),
      ],
      { activityLevel: 'athlete' },
    );
    expect(getRec(recs, 'vitamin-c')!.dose).toBeGreaterThanOrEqual(500);
  });

  it('does not create duplicate vitamin-c', () => {
    const recs = run(
      [
        makeRec({ id: 'collagen-peptides', dose: 10000, doseUnit: 'mg' }),
        makeRec({ id: 'vitamin-c', dose: 1000, doseUnit: 'mg', timing: ['morning-empty'] }),
      ],
      { activityLevel: 'athlete' },
    );
    expect(recs.filter(r => r.id === 'vitamin-c')).toHaveLength(1);
  });

  it('does not modify collagen when user is not athletic', () => {
    const recs = run(
      [makeRec({ id: 'collagen-peptides', dose: 10000, doseUnit: 'mg', timing: ['midday'] })],
      { activityLevel: 'sedentary' },
    );
    expect(getRec(recs, 'collagen-peptides')!.timing).toContain('midday');
  });

  it('applies to collagen-type-ii as well', () => {
    const recs = run(
      [makeRec({ id: 'collagen-type-ii', dose: 40, doseUnit: 'mg', timing: ['midday'] })],
      { activityLevel: 'athlete' },
    );
    expect(getRec(recs, 'collagen-type-ii')!.timing).toContain('morning-empty');
  });
});

// ─── No-duplicate guarantee (cross-rule) ─────────────────────────────────────

describe('No-duplicate guarantee', () => {
  it('applies all rules without creating any duplicate supplement IDs', () => {
    const seeds = [
      makeRec({ id: 'vitamin-d3', dose: 4000, doseUnit: 'IU' }),
      makeRec({ id: 'iron-bisglycinate', dose: 18, doseUnit: 'mg', timing: ['morning-empty'] }),
      makeRec({ id: 'zinc-picolinate', dose: 30, doseUnit: 'mg', timing: ['evening'] }),
      makeRec({ id: 'curcumin', form: 'standard-extract', dose: 500, doseUnit: 'mg' }),
      makeRec({ id: 'calcium-citrate', dose: 1000, doseUnit: 'mg' }),
      makeRec({ id: 'vitamin-b12', dose: 500, doseUnit: 'mcg' }),
      makeRec({ id: 'collagen-peptides', dose: 10000, doseUnit: 'mg', timing: ['midday'] }),
    ];
    const recs = run(seeds, { activityLevel: 'athlete' });
    const ids = recs.map(r => r.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids).toHaveLength(uniqueIds.length);
  });
});
