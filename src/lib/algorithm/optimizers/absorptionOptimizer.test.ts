// ─────────────────────────────────────────────────────────────────────────────
// Gut Health Absorption Optimizer — Tests
//
// Verifies GI-condition detection, mineral form swaps, digestive enzyme
// addition, B12 sublingual switch, and fat-soluble vitamin notes.
// ─────────────────────────────────────────────────────────────────────────────

import { generateProtocol } from '../pipeline';
import {
  optimizeAbsorption,
  shouldOptimizeAbsorption,
  ABSORPTION_GLOBAL_NOTE,
} from './absorptionOptimizer';
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

function findRec(recs: Recommendation[], id: string): Recommendation | undefined {
  return recs.find(r => r.id === id);
}

function makeRec(overrides: Partial<Recommendation> & { id: string }): Recommendation {
  return {
    supplementName: overrides.id,
    form: 'default',
    dose: 100,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Strong',
    reasons: [{ layer: 'demographic', reason: 'Baseline' }],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 6,
    category: 'mineral',
    separateFrom: [],
    sources: [{ layer: 'demographic', action: 'added' }],
    notes: [],
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TRIGGER DETECTION
// ─────────────────────────────────────────────────────────────────────────────

describe('shouldOptimizeAbsorption — trigger detection', () => {
  it('returns false for healthy user', () => {
    expect(shouldOptimizeAbsorption(baseQuiz())).toBe(false);
  });

  it.each([
    ['ibs'],
    ['ibs-c'],
    ['ibs-d'],
    ['ibs-m'],
    ['sibo'],
    ['celiac'],
    ['celiac-disease'],
    ['coeliac'],
    ['crohns'],
    ["crohn's-disease"],
    ['ulcerative-colitis'],
    ['leaky-gut'],
    ['gerd'],
    ['acid-reflux'],
    ['bloating'],
    ['chronic-gastritis'],
    ['gastritis'],
  ])('triggers on condition: %s', (condition) => {
    const quiz = baseQuiz({ healthConditions: [condition] });
    expect(shouldOptimizeAbsorption(quiz)).toBe(true);
  });

  it('triggers on 3+ food allergies', () => {
    const quiz = baseQuiz({ allergies: ['dairy', 'gluten', 'soy'] });
    expect(shouldOptimizeAbsorption(quiz)).toBe(true);
  });

  it('does NOT trigger on 2 food allergies', () => {
    const quiz = baseQuiz({ allergies: ['dairy', 'gluten'] });
    expect(shouldOptimizeAbsorption(quiz)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ABSORPTION FLAG
// ─────────────────────────────────────────────────────────────────────────────

describe('optimizeAbsorption — absorptionFlag', () => {
  it('sets absorptionFlag on quiz when GI condition present', () => {
    const quiz = baseQuiz({ healthConditions: ['ibs'] });
    optimizeAbsorption(quiz, []);
    expect(quiz.absorptionFlag).toBe(true);
  });

  it('does NOT set absorptionFlag for healthy user', () => {
    const quiz = baseQuiz();
    optimizeAbsorption(quiz, []);
    expect(quiz.absorptionFlag).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MINERAL FORM SWAPS
// ─────────────────────────────────────────────────────────────────────────────

describe('optimizeAbsorption — mineral form swaps', () => {
  it('swaps magnesium oxide → glycinate', () => {
    const quiz = baseQuiz({ healthConditions: ['ibs'] });
    const recs = [makeRec({ id: 'magnesium-oxide', form: 'oxide', supplementName: 'Magnesium Oxide' })];
    const result = optimizeAbsorption(quiz, recs);

    expect(findRec(result, 'magnesium-oxide')).toBeUndefined();
    const mg = findRec(result, 'magnesium-glycinate');
    expect(mg).toBeDefined();
    expect(mg!.form).toBe('glycinate');
  });

  it('swaps iron sulfate → bisglycinate', () => {
    const quiz = baseQuiz({ healthConditions: ['celiac'] });
    const recs = [makeRec({ id: 'iron-sulfate', form: 'sulfate', supplementName: 'Iron Sulfate' })];
    const result = optimizeAbsorption(quiz, recs);

    expect(findRec(result, 'iron-sulfate')).toBeUndefined();
    const iron = findRec(result, 'iron-bisglycinate');
    expect(iron).toBeDefined();
    expect(iron!.form).toBe('bisglycinate');
  });

  it('swaps zinc gluconate → picolinate', () => {
    const quiz = baseQuiz({ healthConditions: ['crohns'] });
    const recs = [makeRec({ id: 'zinc-gluconate', form: 'gluconate', supplementName: 'Zinc Gluconate' })];
    const result = optimizeAbsorption(quiz, recs);

    expect(findRec(result, 'zinc-gluconate')).toBeUndefined();
    const zinc = findRec(result, 'zinc-picolinate');
    expect(zinc).toBeDefined();
    expect(zinc!.form).toBe('picolinate');
  });

  it('swaps calcium carbonate → citrate', () => {
    const quiz = baseQuiz({ healthConditions: ['gerd'] });
    const recs = [makeRec({ id: 'calcium-carbonate', form: 'carbonate', supplementName: 'Calcium Carbonate' })];
    const result = optimizeAbsorption(quiz, recs);

    expect(findRec(result, 'calcium-carbonate')).toBeUndefined();
    const ca = findRec(result, 'calcium-citrate');
    expect(ca).toBeDefined();
    expect(ca!.form).toBe('citrate');
  });

  it('swaps chromium chloride → picolinate', () => {
    const quiz = baseQuiz({ healthConditions: ['sibo'] });
    const recs = [makeRec({ id: 'chromium-chloride', form: 'chloride', supplementName: 'Chromium Chloride' })];
    const result = optimizeAbsorption(quiz, recs);

    expect(findRec(result, 'chromium-chloride')).toBeUndefined();
    const cr = findRec(result, 'chromium-picolinate');
    expect(cr).toBeDefined();
    expect(cr!.form).toBe('picolinate');
  });

  it('does NOT swap already-optimal forms', () => {
    const quiz = baseQuiz({ healthConditions: ['ibs'] });
    const recs = [
      makeRec({ id: 'iron-bisglycinate', form: 'bisglycinate', supplementName: 'Iron (Bisglycinate)' }),
      makeRec({ id: 'zinc-picolinate', form: 'picolinate', supplementName: 'Zinc Picolinate' }),
    ];
    const result = optimizeAbsorption(quiz, recs);

    expect(findRec(result, 'iron-bisglycinate')!.form).toBe('bisglycinate');
    expect(findRec(result, 'zinc-picolinate')!.form).toBe('picolinate');
  });

  it('preserves dose when swapping form', () => {
    const quiz = baseQuiz({ healthConditions: ['celiac'] });
    const recs = [makeRec({ id: 'magnesium-oxide', form: 'oxide', dose: 400 })];
    const result = optimizeAbsorption(quiz, recs);

    const mg = findRec(result, 'magnesium-glycinate');
    expect(mg).toBeDefined();
    expect(mg!.dose).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DIGESTIVE ENZYMES
// ─────────────────────────────────────────────────────────────────────────────

describe('optimizeAbsorption — digestive enzymes', () => {
  it('adds digestive enzyme complex for GI condition', () => {
    const quiz = baseQuiz({ healthConditions: ['crohns'] });
    const result = optimizeAbsorption(quiz, []);

    const enzyme = findRec(result, 'digestive-enzyme-complex');
    expect(enzyme).toBeDefined();
    expect(enzyme!.frequency).toBe('three-times-daily');
    expect(enzyme!.timing).toEqual(['morning-with-food', 'midday', 'evening']);
    expect(enzyme!.priority).toBe(7);
  });

  it('does NOT duplicate digestive enzymes if already present', () => {
    const quiz = baseQuiz({ healthConditions: ['sibo'] });
    const existing = [makeRec({
      id: 'digestive-enzyme-complex',
      form: 'broad-spectrum',
      category: 'enzyme',
    })];
    const result = optimizeAbsorption(quiz, existing);

    expect(result.filter(r => r.id === 'digestive-enzyme-complex')).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B12 SUBLINGUAL SWITCH
// ─────────────────────────────────────────────────────────────────────────────

describe('optimizeAbsorption — B12 sublingual', () => {
  it('switches B12 to sublingual form', () => {
    const quiz = baseQuiz({ healthConditions: ['celiac'] });
    const recs = [makeRec({
      id: 'vitamin-b12',
      form: 'methylcobalamin',
      supplementName: 'Vitamin B12 (Methylcobalamin)',
    })];
    const result = optimizeAbsorption(quiz, recs);

    const b12 = findRec(result, 'vitamin-b12');
    expect(b12).toBeDefined();
    expect(b12!.form).toBe('sublingual-methylcobalamin');
    expect(b12!.notes.some(n => n.includes('under tongue'))).toBe(true);
    expect(b12!.reasons.some(r => r.reason.includes('Sublingual B12'))).toBe(true);
  });

  it('does not error when B12 is not in protocol', () => {
    const quiz = baseQuiz({ healthConditions: ['ibs'] });
    const result = optimizeAbsorption(quiz, []);
    expect(findRec(result, 'vitamin-b12')).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FAT-SOLUBLE VITAMIN NOTES
// ─────────────────────────────────────────────────────────────────────────────

describe('optimizeAbsorption — fat-soluble vitamin notes', () => {
  it('adds absorption note to vitamin D', () => {
    const quiz = baseQuiz({ healthConditions: ['crohns'] });
    const recs = [makeRec({ id: 'vitamin-d3', form: 'cholecalciferol' })];
    const result = optimizeAbsorption(quiz, recs);

    const d3 = findRec(result, 'vitamin-d3');
    expect(d3!.notes.some(n => n.includes('fat-containing meal'))).toBe(true);
  });

  it('adds absorption note to vitamin K2', () => {
    const quiz = baseQuiz({ healthConditions: ['celiac'] });
    const recs = [makeRec({ id: 'vitamin-k2', form: 'menaquinone-7' })];
    const result = optimizeAbsorption(quiz, recs);

    const k2 = findRec(result, 'vitamin-k2');
    expect(k2!.notes.some(n => n.includes('fat-containing meal'))).toBe(true);
  });

  it('does NOT add notes to water-soluble vitamins', () => {
    const quiz = baseQuiz({ healthConditions: ['ibs'] });
    const recs = [makeRec({ id: 'vitamin-c', form: 'ascorbic-acid' })];
    const result = optimizeAbsorption(quiz, recs);

    const vc = findRec(result, 'vitamin-c');
    expect(vc!.notes.some(n => n.includes('fat-containing meal'))).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NO CHANGES FOR HEALTHY USER
// ─────────────────────────────────────────────────────────────────────────────

describe('optimizeAbsorption — no GI conditions', () => {
  it('returns recs unchanged for healthy user', () => {
    const quiz = baseQuiz();
    const recs = [
      makeRec({ id: 'magnesium-oxide', form: 'oxide' }),
      makeRec({ id: 'vitamin-b12', form: 'methylcobalamin' }),
      makeRec({ id: 'vitamin-d3', form: 'cholecalciferol' }),
    ];
    const result = optimizeAbsorption(quiz, recs);

    // Nothing should change
    expect(result).toEqual(recs);
    expect(quiz.absorptionFlag).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MULTIPLE ALLERGIES TRIGGER
// ─────────────────────────────────────────────────────────────────────────────

describe('optimizeAbsorption — food allergies trigger', () => {
  it('4 food allergies → triggers absorption optimization', () => {
    const quiz = baseQuiz({ allergies: ['dairy', 'gluten', 'soy', 'eggs'] });
    const recs = [
      makeRec({ id: 'vitamin-b12', form: 'methylcobalamin' }),
    ];
    const result = optimizeAbsorption(quiz, recs);

    expect(quiz.absorptionFlag).toBe(true);
    const b12 = findRec(result, 'vitamin-b12');
    expect(b12!.form).toBe('sublingual-methylcobalamin');
    // Digestive enzymes should be added
    expect(findRec(result, 'digestive-enzyme-complex')).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IMMUTABILITY
// ─────────────────────────────────────────────────────────────────────────────

describe('optimizeAbsorption — immutability', () => {
  it('does not mutate the input recs array', () => {
    const quiz = baseQuiz({ healthConditions: ['ibs'] });
    const recs = [makeRec({ id: 'vitamin-b12', form: 'methylcobalamin' })];
    const original = [...recs];
    optimizeAbsorption(quiz, recs);
    expect(recs).toEqual(original);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATION — full pipeline
// ─────────────────────────────────────────────────────────────────────────────

describe('Absorption optimizer — pipeline integration', () => {
  it('IBS patient → absorption flag set, minerals optimized', () => {
    const quiz = baseQuiz({ healthConditions: ['ibs'] });
    const { recommendations } = generateProtocol(quiz, 'premium');

    expect(quiz.absorptionFlag).toBe(true);
    // Digestive enzymes should be present
    expect(findRec(recommendations, 'digestive-enzyme-complex')).toBeDefined();
  });

  it('celiac patient → B12 switched to sublingual', () => {
    const quiz = baseQuiz({
      healthConditions: ['celiac'],
      dietaryPattern: 'omnivore',
      age: 55, // triggers B12 from demographic layer
    });
    const { recommendations } = generateProtocol(quiz, 'premium');

    const b12 = findRec(recommendations, 'vitamin-b12');
    if (b12) {
      expect(b12.form).toBe('sublingual-methylcobalamin');
    }
  });

  it('Crohn\'s patient → digestive enzymes added', () => {
    const quiz = baseQuiz({ healthConditions: ['crohns'] });
    const { recommendations } = generateProtocol(quiz, 'premium');

    const enzyme = findRec(recommendations, 'digestive-enzyme-complex');
    expect(enzyme).toBeDefined();
    expect(enzyme!.frequency).toBe('three-times-daily');
  });

  it('healthy user with no GI conditions → no absorption changes', () => {
    const quiz = baseQuiz();
    const { recommendations } = generateProtocol(quiz, 'premium');

    expect(quiz.absorptionFlag).toBeUndefined();
    // No digestive enzymes for healthy user
    expect(findRec(recommendations, 'digestive-enzyme-complex')).toBeUndefined();
  });

  it('user with 4 food allergies → triggers absorption optimization', () => {
    const quiz = baseQuiz({
      allergies: ['dairy', 'gluten', 'soy', 'eggs'],
    });
    const { recommendations } = generateProtocol(quiz, 'premium');

    expect(quiz.absorptionFlag).toBe(true);
    expect(findRec(recommendations, 'digestive-enzyme-complex')).toBeDefined();
  });

  it('vitamin D gets fat-absorption note for GI patients', () => {
    const quiz = baseQuiz({ healthConditions: ['celiac'] });
    const { recommendations } = generateProtocol(quiz, 'premium');

    const d3 = findRec(recommendations, 'vitamin-d3');
    expect(d3).toBeDefined();
    expect(d3!.notes.some(n => n.includes('fat-containing meal'))).toBe(true);
  });
});
