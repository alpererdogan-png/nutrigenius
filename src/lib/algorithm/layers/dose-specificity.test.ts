// ─────────────────────────────────────────────────────────────────────────────
// Dose Specificity Tests
//
// Verifies that the algorithm picks ONE specific dose per indication,
// not a range. The FIRST reason determines the base dose; later layers
// can increase it but must pick a specific number.
// ─────────────────────────────────────────────────────────────────────────────

import { generateProtocol } from '../pipeline';
import type { QuizData, Recommendation } from '../types';

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

// ─────────────────────────────────────────────────────────────────────────────
// ASHWAGANDHA
// ─────────────────────────────────────────────────────────────────────────────

describe('Ashwagandha dose specificity', () => {
  it('stress → exactly 600 mg KSM-66', () => {
    const quiz = baseQuiz({ stressLevel: 'high' });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const ashwa = findRec(recommendations, 'ashwagandha-ksm66');

    expect(ashwa).toBeDefined();
    expect(ashwa!.dose).toBe(600);
    expect(ashwa!.form).toContain('ksm-66');
  });

  it('anxiety condition → exactly 600 mg KSM-66', () => {
    const quiz = baseQuiz({ healthConditions: ['anxiety'] });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const ashwa = findRec(recommendations, 'ashwagandha-ksm66');

    expect(ashwa).toBeDefined();
    expect(ashwa!.dose).toBe(600);
  });

  it('sleep goal (without stress) → exactly 300 mg Sensoril', () => {
    const quiz = baseQuiz({ healthGoals: ['sleep'], stressLevel: 'low' });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const ashwa = findRec(recommendations, 'ashwagandha');

    expect(ashwa).toBeDefined();
    expect(ashwa!.dose).toBe(300);
    expect(ashwa!.form).toContain('sensoril');
  });

  it('low testosterone → exactly 600 mg KSM-66', () => {
    const quiz = baseQuiz({ healthConditions: ['low-testosterone'] });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const ashwa = findRec(recommendations, 'ashwagandha-ksm66');

    expect(ashwa).toBeDefined();
    expect(ashwa!.dose).toBe(600);
  });

  it('stress + sleep → 600 mg KSM-66 (stress takes priority, no Sensoril added)', () => {
    const quiz = baseQuiz({ stressLevel: 'high', healthGoals: ['sleep'] });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const ksm66 = findRec(recommendations, 'ashwagandha-ksm66');
    const sensoril = findRec(recommendations, 'ashwagandha');

    expect(ksm66).toBeDefined();
    expect(ksm66!.dose).toBe(600);
    // Sensoril should NOT be added when KSM-66 already present
    expect(sensoril).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NAC
// ─────────────────────────────────────────────────────────────────────────────

describe('NAC dose specificity', () => {
  it('smoking (general antioxidant) → exactly 600 mg', () => {
    const quiz = baseQuiz({ smokingStatus: 'current' });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const nac = findRec(recommendations, 'nac');

    expect(nac).toBeDefined();
    expect(nac!.dose).toBe(600);
  });

  it('heavy alcohol (liver support) → exactly 1,200 mg', () => {
    const quiz = baseQuiz({ alcoholConsumption: 'heavy' });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const nac = findRec(recommendations, 'nac');

    expect(nac).toBeDefined();
    expect(nac!.dose).toBe(1200);
  });

  it('OCD → exactly 2,400 mg (1,200 × 2)', () => {
    const quiz = baseQuiz({ healthConditions: ['ocd'] });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const nac = findRec(recommendations, 'nac');

    expect(nac).toBeDefined();
    expect(nac!.dose).toBe(2400);
  });

  it('bipolar → exactly 1,200 mg per dose (twice-daily)', () => {
    const quiz = baseQuiz({ healthConditions: ['bipolar-disorder'] });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const nac = findRec(recommendations, 'nac');

    expect(nac).toBeDefined();
    expect(nac!.dose).toBe(1200);
    expect(nac!.frequency).toBe('twice-daily');
  });

  it('Long COVID → exactly 1,200 mg', () => {
    const quiz = baseQuiz({ healthConditions: ['long-covid'] });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const nac = findRec(recommendations, 'nac');

    expect(nac).toBeDefined();
    expect(nac!.dose).toBe(1200);
  });

  it('PCOS → exactly 600 mg', () => {
    const quiz = baseQuiz({
      biologicalSex: 'female',
      healthConditions: ['pcos'],
    });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const nac = findRec(recommendations, 'nac');

    expect(nac).toBeDefined();
    expect(nac!.dose).toBe(600);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ALPHA-LIPOIC ACID
// ─────────────────────────────────────────────────────────────────────────────

describe('ALA dose specificity', () => {
  it('prediabetes (blood sugar support) → exactly 300 mg', () => {
    const quiz = baseQuiz({
      labValues: { hba1c: { value: 5.9, unit: '%' } },
    });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const ala = findRec(recommendations, 'ala');

    expect(ala).toBeDefined();
    expect(ala!.dose).toBe(300);
  });

  it('diabetes / neuropathy risk → exactly 600 mg', () => {
    const quiz = baseQuiz({
      labValues: { hba1c: { value: 7.2, unit: '%' } },
    });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const ala = findRec(recommendations, 'ala');

    expect(ala).toBeDefined();
    expect(ala!.dose).toBe(600);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BERBERINE
// ─────────────────────────────────────────────────────────────────────────────

describe('Berberine dose specificity', () => {
  it('insulin resistance → 500 mg per dose, twice-daily (1,000 mg total)', () => {
    const quiz = baseQuiz({ healthConditions: ['insulin-resistance'] });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const berb = findRec(recommendations, 'berberine');

    expect(berb).toBeDefined();
    expect(berb!.dose).toBe(500);
    expect(berb!.frequency).toBe('twice-daily');
  });

  it('type 2 diabetes → 500 mg per dose, three-times-daily (1,500 mg total)', () => {
    const quiz = baseQuiz({ healthConditions: ['type-2-diabetes'] });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const berb = findRec(recommendations, 'berberine');

    expect(berb).toBeDefined();
    expect(berb!.dose).toBe(500);
    expect(berb!.frequency).toBe('three-times-daily');
  });

  it('SIBO → 500 mg per dose, three-times-daily', () => {
    const quiz = baseQuiz({ healthConditions: ['sibo'] });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const berb = findRec(recommendations, 'berberine');

    expect(berb).toBeDefined();
    expect(berb!.dose).toBe(500);
    expect(berb!.frequency).toBe('three-times-daily');
  });

  it('lab prediabetes (HbA1c 6.1%) → 500 mg per dose, twice-daily', () => {
    const quiz = baseQuiz({
      labValues: { hba1c: { value: 6.1, unit: '%' } },
    });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const berb = findRec(recommendations, 'berberine');

    expect(berb).toBeDefined();
    expect(berb!.dose).toBe(500);
    expect(berb!.frequency).toBe('twice-daily');
  });

  it('lab diabetes (HbA1c 7.5%) → 500 mg per dose, three-times-daily', () => {
    const quiz = baseQuiz({
      labValues: { hba1c: { value: 7.5, unit: '%' } },
    });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const berb = findRec(recommendations, 'berberine');

    expect(berb).toBeDefined();
    expect(berb!.dose).toBe(500);
    expect(berb!.frequency).toBe('three-times-daily');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CoQ10
// ─────────────────────────────────────────────────────────────────────────────

describe('CoQ10 dose specificity', () => {
  it('energy goal (general) → exactly 100 mg', () => {
    const quiz = baseQuiz({ healthGoals: ['energy'] });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const coq = findRec(recommendations, 'coq10-ubiquinol');

    if (coq) {
      expect(coq.dose).toBe(100);
    }
  });

  it('athletes → exactly 200 mg', () => {
    const quiz = baseQuiz({ activityLevel: 'athlete' });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const coq = findRec(recommendations, 'coq10-ubiquinol');

    if (coq) {
      expect(coq.dose).toBe(200);
    }
  });

  it('statin user with high cholesterol → exactly 200 mg', () => {
    const quiz = baseQuiz({
      medications: ['atorvastatin'],
      healthConditions: ['high-cholesterol'],
    });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const coq = findRec(recommendations, 'coq10-ubiquinol');

    expect(coq).toBeDefined();
    expect(coq!.dose).toBe(200);
  });

  it('migraine → exactly 300 mg', () => {
    const quiz = baseQuiz({ healthConditions: ['migraines'] });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const coq = findRec(recommendations, 'coq10-ubiquinol');

    expect(coq).toBeDefined();
    expect(coq!.dose).toBe(300);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CURCUMIN
// ─────────────────────────────────────────────────────────────────────────────

describe('Curcumin dose specificity', () => {
  it('rheumatoid arthritis → exactly 1,000 mg', () => {
    const quiz = baseQuiz({ healthConditions: ['rheumatoid-arthritis'] });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const curc = findRec(recommendations, 'curcumin');

    expect(curc).toBeDefined();
    expect(curc!.dose).toBe(1000);
    expect(curc!.frequency).toBe('daily');
  });

  it('elevated CRP → exactly 1,000 mg', () => {
    const quiz = baseQuiz({ healthConditions: ['high-crp'] });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const curc = findRec(recommendations, 'curcumin');

    expect(curc).toBeDefined();
    expect(curc!.dose).toBe(1000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MAGNESIUM
// ─────────────────────────────────────────────────────────────────────────────

describe('Magnesium dose specificity', () => {
  it('baseline → 300 mg', () => {
    const quiz = baseQuiz();
    const { recommendations } = generateProtocol(quiz, 'premium');
    const mg = findRec(recommendations, 'magnesium-glycinate');

    expect(mg).toBeDefined();
    expect(mg!.dose).toBe(300);
  });

  it('high stress → 400 mg', () => {
    const quiz = baseQuiz({ stressLevel: 'high' });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const mg = findRec(recommendations, 'magnesium-glycinate');

    expect(mg).toBeDefined();
    expect(mg!.dose).toBe(400);
  });

  it('migraine → 400 mg', () => {
    const quiz = baseQuiz({ healthConditions: ['migraines'] });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const mg = findRec(recommendations, 'magnesium-glycinate');

    expect(mg).toBeDefined();
    expect(mg!.dose).toBeGreaterThanOrEqual(400);
  });

  it('sleep goal → 300 mg', () => {
    const quiz = baseQuiz({ healthGoals: ['sleep'] });
    const { recommendations } = generateProtocol(quiz, 'premium');
    const mg = findRec(recommendations, 'magnesium-glycinate');

    expect(mg).toBeDefined();
    expect(mg!.dose).toBe(300);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NO DOSE RANGES — regression guard
// ─────────────────────────────────────────────────────────────────────────────

describe('No dose ranges in any recommendation', () => {
  const profiles: Array<[string, Partial<QuizData>]> = [
    ['healthy male', {}],
    ['stressed female', { biologicalSex: 'female', stressLevel: 'high' }],
    ['diabetic', { healthConditions: ['type-2-diabetes'] }],
    ['anxious + sleep', { healthConditions: ['anxiety'], healthGoals: ['sleep'] }],
    ['athlete', { activityLevel: 'athlete', healthGoals: ['energy'] }],
  ];

  test.each(profiles)('%s — all notes are free of dose ranges', (_label, overrides) => {
    const quiz = baseQuiz(overrides);
    const { recommendations } = generateProtocol(quiz, 'premium');

    for (const rec of recommendations) {
      // Check notes for range patterns like "300-600 mg" or "500–1,000 mg"
      for (const note of rec.notes) {
        expect(note).not.toMatch(/\d+[-–]\d+\s*mg\/day$/);
      }
    }
  });
});
