// ─────────────────────────────────────────────────────────────────────────────
// Magnesium Form Optimizer — Tests
//
// Verifies priority-ordered form selection, threonate addition for cognitive
// goals, and oxide-to-glycinate swap.
// ─────────────────────────────────────────────────────────────────────────────

import { generateProtocol } from '../pipeline';
import { optimizeMagnesiumForm } from './magnesiumOptimizer';
import type { QuizData, Recommendation } from '../types';
import { CYCLE_DAILY } from '../types';

// ── Test helpers ────────────────────────────────────────────────────────────

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

function findMg(recs: Recommendation[], formId: string): Recommendation | undefined {
  return recs.find(r => r.id === formId);
}

function findAnyMg(recs: Recommendation[]): Recommendation | undefined {
  return recs.find(r => r.id.startsWith('magnesium-'));
}

function makeMgRec(overrides: Partial<Recommendation> = {}): Recommendation {
  return {
    id: 'magnesium-glycinate',
    supplementName: 'Magnesium Glycinate',
    form: 'glycinate',
    dose: 300,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['bedtime'],
    withFood: false,
    evidenceRating: 'Strong',
    reasons: [{ layer: 'demographic', reason: 'Baseline magnesium' }],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 6,
    category: 'mineral',
    separateFrom: [],
    sources: [{ layer: 'demographic', action: 'added' }],
    notes: ['Glycinate form is highly bioavailable and gentle on the stomach'],
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIT TESTS — optimizeMagnesiumForm() in isolation
// ─────────────────────────────────────────────────────────────────────────────

describe('optimizeMagnesiumForm — unit', () => {
  it('returns recs unchanged when no magnesium is present', () => {
    const quiz = baseQuiz();
    const recs: Recommendation[] = [];
    const result = optimizeMagnesiumForm(quiz, recs);
    expect(result).toEqual([]);
  });

  it('constipation → citrate form', () => {
    const quiz = baseQuiz({ healthConditions: ['constipation'] });
    const recs = [makeMgRec()];
    const result = optimizeMagnesiumForm(quiz, recs);

    const mg = findMg(result, 'magnesium-citrate');
    expect(mg).toBeDefined();
    expect(mg!.form).toBe('citrate');
    expect(mg!.dose).toBe(300);
    // Old glycinate should be gone
    expect(findMg(result, 'magnesium-glycinate')).toBeUndefined();
  });

  it('IBS-C → citrate form', () => {
    const quiz = baseQuiz({ healthConditions: ['ibs-c'] });
    const recs = [makeMgRec()];
    const result = optimizeMagnesiumForm(quiz, recs);

    const mg = findMg(result, 'magnesium-citrate');
    expect(mg).toBeDefined();
    expect(mg!.form).toBe('citrate');
  });

  it('migraine → citrate form', () => {
    const quiz = baseQuiz({ healthConditions: ['migraines'] });
    const recs = [makeMgRec()];
    const result = optimizeMagnesiumForm(quiz, recs);

    const mg = findMg(result, 'magnesium-citrate');
    expect(mg).toBeDefined();
    expect(mg!.form).toBe('citrate');
  });

  it('athlete → malate form', () => {
    const quiz = baseQuiz({ activityLevel: 'athlete' });
    const recs = [makeMgRec()];
    const result = optimizeMagnesiumForm(quiz, recs);

    const mg = findMg(result, 'magnesium-malate');
    expect(mg).toBeDefined();
    expect(mg!.form).toBe('malate');
    expect(findMg(result, 'magnesium-glycinate')).toBeUndefined();
  });

  it('very-active → malate form', () => {
    const quiz = baseQuiz({ activityLevel: 'very-active' });
    const recs = [makeMgRec()];
    const result = optimizeMagnesiumForm(quiz, recs);

    const mg = findMg(result, 'magnesium-malate');
    expect(mg).toBeDefined();
    expect(mg!.form).toBe('malate');
  });

  it('hypertension → taurate form', () => {
    const quiz = baseQuiz({ healthConditions: ['hypertension'] });
    const recs = [makeMgRec()];
    const result = optimizeMagnesiumForm(quiz, recs);

    const mg = findMg(result, 'magnesium-taurate');
    expect(mg).toBeDefined();
    expect(mg!.form).toBe('taurate');
    expect(findMg(result, 'magnesium-glycinate')).toBeUndefined();
  });

  it('heart-health goal → taurate form', () => {
    const quiz = baseQuiz({ healthGoals: ['heart-health'] });
    const recs = [makeMgRec()];
    const result = optimizeMagnesiumForm(quiz, recs);

    const mg = findMg(result, 'magnesium-taurate');
    expect(mg).toBeDefined();
    expect(mg!.form).toBe('taurate');
  });

  it('cognitive goal → glycinate stays + threonate ADDED', () => {
    const quiz = baseQuiz({ healthGoals: ['cognitive'] });
    const recs = [makeMgRec()];
    const result = optimizeMagnesiumForm(quiz, recs);

    // Glycinate should stay
    const glycinate = findMg(result, 'magnesium-glycinate');
    expect(glycinate).toBeDefined();
    expect(glycinate!.form).toBe('glycinate');

    // Threonate should be added
    const threonate = findMg(result, 'magnesium-l-threonate');
    expect(threonate).toBeDefined();
    expect(threonate!.dose).toBe(1500);
    expect(threonate!.form).toBe('l-threonate');
    expect(threonate!.timing).toContain('bedtime');
  });

  it('brain-fog condition → glycinate + threonate', () => {
    const quiz = baseQuiz({ healthConditions: ['brain-fog'] });
    const recs = [makeMgRec()];
    const result = optimizeMagnesiumForm(quiz, recs);

    expect(findMg(result, 'magnesium-glycinate')).toBeDefined();
    expect(findMg(result, 'magnesium-l-threonate')).toBeDefined();
  });

  it('fibromyalgia → malate form', () => {
    const quiz = baseQuiz({ healthConditions: ['fibromyalgia'] });
    const recs = [makeMgRec()];
    const result = optimizeMagnesiumForm(quiz, recs);

    const mg = findMg(result, 'magnesium-malate');
    expect(mg).toBeDefined();
    expect(mg!.form).toBe('malate');
  });

  it('poor sleep → glycinate form (explicit selection)', () => {
    const quiz = baseQuiz({ sleepQuality: 'poor' });
    const recs = [makeMgRec()];
    const result = optimizeMagnesiumForm(quiz, recs);

    const mg = findMg(result, 'magnesium-glycinate');
    expect(mg).toBeDefined();
    expect(mg!.form).toBe('glycinate');
    expect(mg!.notes.some(n => n.includes('glycine'))).toBe(true);
  });

  it('default healthy user → glycinate', () => {
    const quiz = baseQuiz();
    const recs = [makeMgRec()];
    const result = optimizeMagnesiumForm(quiz, recs);

    const mg = findMg(result, 'magnesium-glycinate');
    expect(mg).toBeDefined();
    expect(mg!.form).toBe('glycinate');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PRIORITY TESTS — higher priority condition wins
// ─────────────────────────────────────────────────────────────────────────────

describe('optimizeMagnesiumForm — priority ordering', () => {
  it('poor sleep + athlete → malate wins (athlete is higher priority)', () => {
    const quiz = baseQuiz({
      activityLevel: 'athlete',
      sleepQuality: 'poor',
    });
    const recs = [makeMgRec()];
    const result = optimizeMagnesiumForm(quiz, recs);

    const mg = findMg(result, 'magnesium-malate');
    expect(mg).toBeDefined();
    expect(mg!.form).toBe('malate');
    expect(findMg(result, 'magnesium-glycinate')).toBeUndefined();
  });

  it('constipation + migraine → citrate wins (constipation is higher priority)', () => {
    const quiz = baseQuiz({
      healthConditions: ['constipation', 'migraines'],
    });
    const recs = [makeMgRec()];
    const result = optimizeMagnesiumForm(quiz, recs);

    const mg = findMg(result, 'magnesium-citrate');
    expect(mg).toBeDefined();
    // Verify it's the constipation reason, not migraine
    expect(mg!.reasons.some(r => r.reason.includes('bowel regularity'))).toBe(true);
  });

  it('hypertension + cognitive goal → taurate wins (higher priority than cognitive)', () => {
    const quiz = baseQuiz({
      healthConditions: ['hypertension'],
      healthGoals: ['cognitive'],
    });
    const recs = [makeMgRec()];
    const result = optimizeMagnesiumForm(quiz, recs);

    const mg = findMg(result, 'magnesium-taurate');
    expect(mg).toBeDefined();
    // Threonate should NOT be added because taurate path won
    expect(findMg(result, 'magnesium-l-threonate')).toBeUndefined();
  });

  it('athlete + hypertension → malate wins (athlete is priority 3, hypertension is 4)', () => {
    const quiz = baseQuiz({
      activityLevel: 'athlete',
      healthConditions: ['hypertension'],
    });
    const recs = [makeMgRec()];
    const result = optimizeMagnesiumForm(quiz, recs);

    const mg = findMg(result, 'magnesium-malate');
    expect(mg).toBeDefined();
    expect(mg!.form).toBe('malate');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OXIDE SWAP
// ─────────────────────────────────────────────────────────────────────────────

describe('optimizeMagnesiumForm — oxide swap', () => {
  it('any oxide form → swapped to glycinate', () => {
    const quiz = baseQuiz();
    const oxideRec = makeMgRec({
      id: 'magnesium-oxide',
      supplementName: 'Magnesium Oxide',
      form: 'oxide',
    });
    const recs = [oxideRec];
    const result = optimizeMagnesiumForm(quiz, recs);

    // Oxide should be gone
    expect(result.find(r => r.form === 'oxide')).toBeUndefined();
    // Glycinate should be present
    const mg = findMg(result, 'magnesium-glycinate');
    expect(mg).toBeDefined();
    expect(mg!.form).toBe('glycinate');
    expect(mg!.reasons.some(r => r.reason.includes('glycinate'))).toBe(true);
  });

  it('oxide + constipation → swapped to citrate (not glycinate)', () => {
    const quiz = baseQuiz({ healthConditions: ['constipation'] });
    const oxideRec = makeMgRec({
      id: 'magnesium-oxide',
      supplementName: 'Magnesium Oxide',
      form: 'oxide',
    });
    const recs = [oxideRec];
    const result = optimizeMagnesiumForm(quiz, recs);

    // The form selection runs first (citrate for constipation),
    // then oxide swap catches any remaining oxide entries
    expect(result.find(r => r.form === 'oxide')).toBeUndefined();
    // Should have citrate from the form selection
    const mg = findMg(result, 'magnesium-citrate');
    expect(mg).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IMMUTABILITY
// ─────────────────────────────────────────────────────────────────────────────

describe('optimizeMagnesiumForm — immutability', () => {
  it('does not mutate the input array', () => {
    const quiz = baseQuiz({ healthConditions: ['hypertension'] });
    const recs = [makeMgRec()];
    const original = [...recs];
    optimizeMagnesiumForm(quiz, recs);
    expect(recs).toEqual(original);
  });

  it('preserves dose and other properties when swapping form', () => {
    const quiz = baseQuiz({ activityLevel: 'athlete' });
    const recs = [makeMgRec({ dose: 400, priority: 8 })];
    const result = optimizeMagnesiumForm(quiz, recs);

    const mg = findMg(result, 'magnesium-malate');
    expect(mg).toBeDefined();
    expect(mg!.dose).toBe(400);
    expect(mg!.priority).toBe(8);
    expect(mg!.timing).toEqual(['bedtime']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATION — full pipeline
// ─────────────────────────────────────────────────────────────────────────────

describe('Magnesium form optimizer — pipeline integration', () => {
  it('constipation patient gets citrate through full pipeline', () => {
    const quiz = baseQuiz({ healthConditions: ['constipation'] });
    const { recommendations } = generateProtocol(quiz, 'premium');

    const citrate = findMg(recommendations, 'magnesium-citrate');
    expect(citrate).toBeDefined();
    expect(citrate!.form).toBe('citrate');
    // No glycinate should remain
    expect(findMg(recommendations, 'magnesium-glycinate')).toBeUndefined();
  });

  it('athlete gets malate through full pipeline', () => {
    const quiz = baseQuiz({ activityLevel: 'athlete' });
    const { recommendations } = generateProtocol(quiz, 'premium');

    const malate = findMg(recommendations, 'magnesium-malate');
    expect(malate).toBeDefined();
    expect(malate!.form).toBe('malate');
  });

  it('hypertension patient gets taurate through full pipeline', () => {
    const quiz = baseQuiz({ healthConditions: ['hypertension'] });
    const { recommendations } = generateProtocol(quiz, 'premium');

    const taurate = findMg(recommendations, 'magnesium-taurate');
    expect(taurate).toBeDefined();
    expect(taurate!.form).toBe('taurate');
  });

  it('cognitive goal produces glycinate + threonate through full pipeline', () => {
    const quiz = baseQuiz({ healthGoals: ['cognitive'] });
    const { recommendations } = generateProtocol(quiz, 'premium');

    const glycinate = findMg(recommendations, 'magnesium-glycinate');
    expect(glycinate).toBeDefined();

    const threonate = findMg(recommendations, 'magnesium-l-threonate');
    expect(threonate).toBeDefined();
    expect(threonate!.dose).toBe(1500);
  });

  it('default healthy user keeps glycinate through full pipeline', () => {
    const quiz = baseQuiz();
    const { recommendations } = generateProtocol(quiz, 'premium');

    const mg = findAnyMg(recommendations);
    expect(mg).toBeDefined();
    expect(mg!.id).toBe('magnesium-glycinate');
    expect(mg!.form).toBe('glycinate');
  });
});
