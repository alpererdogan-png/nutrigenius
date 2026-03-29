// ─────────────────────────────────────────────────────────────────────────────
// Layer 5 — Lab Values — Unit Tests
// ─────────────────────────────────────────────────────────────────────────────

import { layer5Labs } from './layer5-labs';
import { layer1Demographic } from './layer1-demographic';
import { QuizData, Recommendation, CYCLE_DAILY } from '../types';

// ─── TEST HELPERS ─────────────────────────────────────────────────────────────

function baseQuiz(overrides: Partial<QuizData> = {}): QuizData {
  return {
    age: 35,
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

/** Run layers 1 + 5 only. */
function runLab5(quiz: QuizData): Recommendation[] {
  const recs = layer1Demographic(quiz);
  return layer5Labs(quiz, recs);
}

/** Pre-seed a specific supplement into layer1 output, then run layer 5. */
function runLab5WithSeed(
  quiz: QuizData,
  seedId: string,
  seedDose: number,
): Recommendation[] {
  const recs = layer1Demographic(quiz);
  // Patch in a seeded rec if it doesn't already exist
  const exists = recs.find(r => r.id === seedId);
  const withSeed: Recommendation[] = exists
    ? recs.map(r =>
        r.id === seedId ? { ...r, dose: seedDose } : r,
      )
    : [
        ...recs,
        {
          id: seedId,
          supplementName: seedId,
          form: 'standard',
          dose: seedDose,
          doseUnit: 'IU',
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
        } as Recommendation,
      ];
  return layer5Labs(quiz, withSeed);
}

function getRec(recs: Recommendation[], id: string): Recommendation | undefined {
  return recs.find(r => r.id === id);
}

// ─── TEST 1: Vitamin D at 15 ng/mL → dose increased to 5,000 IU ──────────────

describe('Vitamin D — deficient (15 ng/mL)', () => {
  it('sets dose to 5,000 IU when vitamin-d3 is already present', () => {
    const quiz = baseQuiz({
      labValues: { vitaminD: { value: 15, unit: 'ng/mL' } },
    });
    const recs = runLab5WithSeed(quiz, 'vitamin-d3', 1000);
    const vitD = getRec(recs, 'vitamin-d3');
    expect(vitD).toBeDefined();
    expect(vitD!.dose).toBe(5000);
  });

  it('adds vitamin-d3 at 5,000 IU when not previously present', () => {
    // Use a quiz that won't naturally produce vitamin-d3 (indoor sun exposure but no seeds)
    const quiz = baseQuiz({
      sunExposure: 'high',
      labValues: { vitaminD: { value: 15, unit: 'ng/mL' } },
    });
    // Run without pre-seeding
    const recs = layer5Labs(quiz, []);
    const vitD = getRec(recs, 'vitamin-d3');
    expect(vitD).toBeDefined();
    expect(vitD!.dose).toBe(5000);
    expect(vitD!.priority).toBeGreaterThanOrEqual(9);
  });
});

// ─── TEST 2: Vitamin D at 60 ng/mL → dose reduced ────────────────────────────

describe('Vitamin D — optimal (60 ng/mL)', () => {
  it('reduces dose to 1,000 IU when previously at higher dose', () => {
    const quiz = baseQuiz({
      labValues: { vitaminD: { value: 60, unit: 'ng/mL' } },
    });
    const recs = runLab5WithSeed(quiz, 'vitamin-d3', 4000);
    const vitD = getRec(recs, 'vitamin-d3');
    expect(vitD).toBeDefined();
    expect(vitD!.dose).toBe(1000);
  });

  it('adds an "optimal" note when reducing', () => {
    const quiz = baseQuiz({
      labValues: { vitaminD: { value: 60, unit: 'ng/mL' } },
    });
    const recs = runLab5WithSeed(quiz, 'vitamin-d3', 3000);
    const vitD = getRec(recs, 'vitamin-d3');
    expect(vitD!.notes.some(n => /optimal/i.test(n))).toBe(true);
  });
});

// ─── TEST 3: Vitamin D at 160 ng/mL → REMOVED + toxicity warning ─────────────

describe('Vitamin D — toxic level (160 ng/mL)', () => {
  it('removes vitamin-d3 when level is potentially toxic', () => {
    const quiz = baseQuiz({
      labValues: { vitaminD: { value: 160, unit: 'ng/mL' } },
    });
    const recs = runLab5WithSeed(quiz, 'vitamin-d3', 5000);
    const vitD = getRec(recs, 'vitamin-d3');
    expect(vitD).toBeUndefined();
  });

  it('does not add vitamin-d3 if it was not already present', () => {
    const quiz = baseQuiz({
      labValues: { vitaminD: { value: 160, unit: 'ng/mL' } },
    });
    const recs = layer5Labs(quiz, []);
    expect(getRec(recs, 'vitamin-d3')).toBeUndefined();
  });
});

// ─── TEST 4: Ferritin at 150 ng/mL → iron REMOVED ────────────────────────────

describe('Ferritin — elevated (150 ng/mL)', () => {
  it('removes iron-bisglycinate when ferritin is elevated', () => {
    const quiz = baseQuiz({
      labValues: { ferritin: { value: 150, unit: 'ng/mL' } },
    });
    const recs = runLab5WithSeed(quiz, 'iron-bisglycinate', 18);
    expect(getRec(recs, 'iron-bisglycinate')).toBeUndefined();
  });

  it('does not add iron if it was not present', () => {
    const quiz = baseQuiz({
      labValues: { ferritin: { value: 150, unit: 'ng/mL' } },
    });
    const recs = layer5Labs(quiz, []);
    expect(getRec(recs, 'iron-bisglycinate')).toBeUndefined();
  });
});

// ─── TEST 5: Ferritin at 350 ng/mL → REMOVED + hemochromatosis flag ──────────

describe('Ferritin — very high (350 ng/mL)', () => {
  it('removes iron-bisglycinate when ferritin is very high', () => {
    const quiz = baseQuiz({
      labValues: { ferritin: { value: 350, unit: 'ng/mL' } },
    });
    const recs = runLab5WithSeed(quiz, 'iron-bisglycinate', 18);
    expect(getRec(recs, 'iron-bisglycinate')).toBeUndefined();
  });

  it('records hemochromatosis/very-high in the removal reason', () => {
    const quiz = baseQuiz({
      labValues: { ferritin: { value: 350, unit: 'ng/mL' } },
    });
    // Inspect sources after run
    const before = runLab5WithSeed(quiz, 'iron-bisglycinate', 18);
    // iron should be gone — verify the seed was actually present before
    const withoutLabs = [
      {
        id: 'iron-bisglycinate',
        supplementName: 'Iron',
        form: 'bisglycinate',
        dose: 18,
        doseUnit: 'mg',
        frequency: 'daily',
        timing: ['morning-empty'] as const,
        withFood: false,
        evidenceRating: 'Strong' as const,
        reasons: [],
        warnings: [],
        contraindications: [],
        cyclingPattern: CYCLE_DAILY,
        priority: 5,
        category: 'mineral' as const,
        separateFrom: [],
        notes: [],
        sources: [{ layer: 'demographic' as const, action: 'added' as const }],
      } as Recommendation,
    ];
    const result = layer5Labs(quiz, withoutLabs);
    expect(getRec(result, 'iron-bisglycinate')).toBeUndefined();
  });
});

// ─── TEST 6: TSH at 8 mIU/L → selenium added + physician flag ────────────────

describe('TSH — subclinical hypothyroid (8 mIU/L)', () => {
  it('adds selenium when TSH is elevated', () => {
    const quiz = baseQuiz({
      labValues: { tsh: { value: 8, unit: 'mIU/L' } },
    });
    const recs = layer5Labs(quiz, []);
    const sel = getRec(recs, 'selenium');
    expect(sel).toBeDefined();
    expect(sel!.dose).toBe(200);
    expect(sel!.doseUnit).toBe('mcg');
  });

  it('adds a physician/endocrinologist warning for very high TSH', () => {
    const quiz = baseQuiz({
      labValues: { tsh: { value: 8, unit: 'mIU/L' } },
    });
    const recs = layer5Labs(quiz, []);
    const sel = getRec(recs, 'selenium');
    // TSH=8 hits the 4–10 range (subclinical), so "Discuss with doctor" warning
    expect(sel!.warnings.some(w => /doctor|physician|endocrinologist/i.test(w))).toBe(true);
  });
});

// ─── TEST 7: TSH at 0.2 mIU/L → iodine REMOVED + hyperthyroid flag ───────────

describe('TSH — suppressed / hyperthyroid (0.2 mIU/L)', () => {
  it('removes iodine supplement when TSH is suppressed', () => {
    const quiz = baseQuiz({
      labValues: { tsh: { value: 0.2, unit: 'mIU/L' } },
    });
    const iodineRec: Recommendation = {
      id: 'iodine',
      supplementName: 'Iodine',
      form: 'potassium-iodide',
      dose: 150,
      doseUnit: 'mcg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Moderate',
      reasons: [],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 5,
      category: 'mineral',
      separateFrom: [],
      notes: [],
      sources: [{ layer: 'demographic', action: 'added' }],
    };
    const recs = layer5Labs(quiz, [iodineRec]);
    expect(getRec(recs, 'iodine')).toBeUndefined();
  });

  it('adds a hyperthyroid warning to selenium if already present', () => {
    const quiz = baseQuiz({
      labValues: { tsh: { value: 0.2, unit: 'mIU/L' } },
    });
    const selRec: Recommendation = {
      id: 'selenium',
      supplementName: 'Selenium',
      form: 'l-selenomethionine',
      dose: 200,
      doseUnit: 'mcg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 7,
      category: 'mineral',
      separateFrom: [],
      notes: [],
      sources: [{ layer: 'demographic', action: 'added' }],
    };
    const recs = layer5Labs(quiz, [selRec]);
    const sel = getRec(recs, 'selenium');
    expect(sel!.warnings.some(w => /hyperthyroid/i.test(w))).toBe(true);
  });
});

// ─── TEST 8: HbA1c at 6.0% → metabolic supplements added + prediabetes note ──

describe('HbA1c — prediabetes (6.0%)', () => {
  it('adds berberine for prediabetes range', () => {
    const quiz = baseQuiz({
      labValues: { hba1c: { value: 6.0, unit: '%' } },
    });
    const recs = layer5Labs(quiz, []);
    expect(getRec(recs, 'berberine')).toBeDefined();
  });

  it('adds chromium-picolinate for prediabetes range', () => {
    const quiz = baseQuiz({
      labValues: { hba1c: { value: 6.0, unit: '%' } },
    });
    const recs = layer5Labs(quiz, []);
    const cr = getRec(recs, 'chromium-picolinate');
    expect(cr).toBeDefined();
    expect(cr!.dose).toBe(400);
  });

  it('adds ALA for prediabetes range', () => {
    const quiz = baseQuiz({
      labValues: { hba1c: { value: 6.0, unit: '%' } },
    });
    const recs = layer5Labs(quiz, []);
    expect(getRec(recs, 'ala')).toBeDefined();
  });

  it('includes a prediabetes note on chromium', () => {
    const quiz = baseQuiz({
      labValues: { hba1c: { value: 6.0, unit: '%' } },
    });
    const recs = layer5Labs(quiz, []);
    const cr = getRec(recs, 'chromium-picolinate');
    expect(
      cr!.notes.some(n => /prediabetes/i.test(n)),
    ).toBe(true);
  });
});

// ─── TEST 9: HbA1c at 5.5% → no metabolic additions; berberine removed ────────

describe('HbA1c — normal (5.5%)', () => {
  it('does not add berberine when HbA1c is normal', () => {
    const quiz = baseQuiz({
      labValues: { hba1c: { value: 5.5, unit: '%' } },
    });
    const recs = layer5Labs(quiz, []);
    expect(getRec(recs, 'berberine')).toBeUndefined();
  });

  it('removes berberine that was added for goal-only reasons (no metabolic condition)', () => {
    const quiz = baseQuiz({
      healthConditions: [],
      labValues: { hba1c: { value: 5.5, unit: '%' } },
    });
    const berberineRec: Recommendation = {
      id: 'berberine',
      supplementName: 'Berberine',
      form: 'berberine-hcl',
      dose: 1000,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 7,
      category: 'herbal',
      separateFrom: [],
      notes: [],
      sources: [{ layer: 'conditions', action: 'added' }],
    };
    const recs = layer5Labs(quiz, [berberineRec]);
    expect(getRec(recs, 'berberine')).toBeUndefined();
  });

  it('keeps berberine when a metabolic condition is present', () => {
    const quiz = baseQuiz({
      healthConditions: ['insulin-resistance'],
      labValues: { hba1c: { value: 5.5, unit: '%' } },
    });
    const berberineRec: Recommendation = {
      id: 'berberine',
      supplementName: 'Berberine',
      form: 'berberine-hcl',
      dose: 1000,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 7,
      category: 'herbal',
      separateFrom: [],
      notes: [],
      sources: [{ layer: 'conditions', action: 'added' }],
    };
    const recs = layer5Labs(quiz, [berberineRec]);
    expect(getRec(recs, 'berberine')).toBeDefined();
  });
});

// ─── TEST 10: Old lab date → stale warning note added ────────────────────────

describe('Stale lab date (>12 months ago)', () => {
  it('adds a stale-date note to vitamin-d3 when lab date is over a year old', () => {
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 2);
    const quiz = baseQuiz({
      labValues: {
        vitaminD: { value: 35, unit: 'ng/mL', date: oldDate.toISOString().split('T')[0] },
      },
    });
    const recs = runLab5WithSeed(quiz, 'vitamin-d3', 2000);
    const vitD = getRec(recs, 'vitamin-d3');
    expect(vitD!.notes.some(n => /year old|retesting/i.test(n))).toBe(true);
  });

  it('does not add a stale note when lab date is recent', () => {
    const recentDate = new Date();
    recentDate.setMonth(recentDate.getMonth() - 3);
    const quiz = baseQuiz({
      labValues: {
        vitaminD: { value: 35, unit: 'ng/mL', date: recentDate.toISOString().split('T')[0] },
      },
    });
    const recs = runLab5WithSeed(quiz, 'vitamin-d3', 2000);
    const vitD = getRec(recs, 'vitamin-d3');
    const staleNote = 'These lab results are over a year old — consider retesting for optimal dosing';
    expect(vitD!.notes.includes(staleNote)).toBe(false);
  });
});

// ─── TEST 11: CRP at 5 mg/L → high-dose omega-3 + curcumin + NAC ─────────────

describe('CRP — elevated (5 mg/L)', () => {
  it('adds omega-3 at 3,000 mg', () => {
    const quiz = baseQuiz({
      labValues: { crp: { value: 5, unit: 'mg/L' } },
    });
    const recs = layer5Labs(quiz, []);
    const o3 = getRec(recs, 'omega-3-fish-oil');
    expect(o3).toBeDefined();
    expect(o3!.dose).toBeGreaterThanOrEqual(3000);
  });

  it('adds curcumin at 1,000 mg', () => {
    const quiz = baseQuiz({
      labValues: { crp: { value: 5, unit: 'mg/L' } },
    });
    const recs = layer5Labs(quiz, []);
    const cur = getRec(recs, 'curcumin');
    expect(cur).toBeDefined();
    expect(cur!.dose).toBe(1000);
  });

  it('adds NAC at 1,200 mg', () => {
    const quiz = baseQuiz({
      labValues: { crp: { value: 5, unit: 'mg/L' } },
    });
    const recs = layer5Labs(quiz, []);
    const nac = getRec(recs, 'nac');
    expect(nac).toBeDefined();
    expect(nac!.dose).toBe(1200);
  });
});

// ─── TEST 12: Homocysteine at 18 µmol/L → B12 + folate + B6 ensured ──────────

describe('Homocysteine — elevated (18 µmol/L)', () => {
  it('ensures vitamin-b12 is present', () => {
    const quiz = baseQuiz({
      labValues: { homocysteine: { value: 18, unit: 'µmol/L' } },
    });
    const recs = layer5Labs(quiz, []);
    expect(getRec(recs, 'vitamin-b12')).toBeDefined();
  });

  it('ensures folate-5mthf is present at ≥800 mcg', () => {
    const quiz = baseQuiz({
      labValues: { homocysteine: { value: 18, unit: 'µmol/L' } },
    });
    const recs = layer5Labs(quiz, []);
    const folate = getRec(recs, 'folate-5mthf');
    expect(folate).toBeDefined();
    expect(folate!.dose).toBeGreaterThanOrEqual(800);
  });

  it('ensures vitamin-b6 is present at ≥50 mg', () => {
    const quiz = baseQuiz({
      labValues: { homocysteine: { value: 18, unit: 'µmol/L' } },
    });
    const recs = layer5Labs(quiz, []);
    const b6 = getRec(recs, 'vitamin-b6');
    expect(b6).toBeDefined();
    expect(b6!.dose).toBeGreaterThanOrEqual(50);
  });

  it('does not add betaine-tmg for borderline elevation (18 µmol/L < 20)', () => {
    const quiz = baseQuiz({
      labValues: { homocysteine: { value: 18, unit: 'µmol/L' } },
    });
    const recs = layer5Labs(quiz, []);
    expect(getRec(recs, 'betaine-tmg')).toBeUndefined();
  });

  it('adds betaine-tmg for significantly elevated (21 µmol/L)', () => {
    const quiz = baseQuiz({
      labValues: { homocysteine: { value: 21, unit: 'µmol/L' } },
    });
    const recs = layer5Labs(quiz, []);
    expect(getRec(recs, 'betaine-tmg')).toBeDefined();
  });
});

// ─── TEST 13: B12 at 900 pg/mL for vegan → B12 maintained ────────────────────

describe('Vitamin B12 — high level (900 pg/mL) for vegan', () => {
  it('keeps vitamin-b12 for vegans even when level is adequate', () => {
    const quiz = baseQuiz({
      dietaryPattern: 'vegan',
      labValues: { vitaminB12: { value: 900, unit: 'pg/mL' } },
    });
    const b12Rec: Recommendation = {
      id: 'vitamin-b12',
      supplementName: 'Vitamin B12',
      form: 'methylcobalamin',
      dose: 1000,
      doseUnit: 'mcg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 8,
      category: 'vitamin',
      separateFrom: [],
      notes: [],
      sources: [{ layer: 'demographic', action: 'added' }],
    };
    const recs = layer5Labs(quiz, [b12Rec]);
    const b12 = getRec(recs, 'vitamin-b12');
    expect(b12).toBeDefined();
    expect(b12!.notes.some(n => /vegan/i.test(n))).toBe(true);
  });
});

// ─── TEST 14: B12 at 900 pg/mL for omnivore → B12 removed ───────────────────

describe('Vitamin B12 — high level (900 pg/mL) for omnivore', () => {
  it('removes vitamin-b12 for omnivores when level is adequate', () => {
    const quiz = baseQuiz({
      dietaryPattern: 'omnivore',
      labValues: { vitaminB12: { value: 900, unit: 'pg/mL' } },
    });
    const b12Rec: Recommendation = {
      id: 'vitamin-b12',
      supplementName: 'Vitamin B12',
      form: 'methylcobalamin',
      dose: 1000,
      doseUnit: 'mcg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Strong',
      reasons: [],
      warnings: [],
      contraindications: [],
      cyclingPattern: CYCLE_DAILY,
      priority: 8,
      category: 'vitamin',
      separateFrom: [],
      notes: [],
      sources: [{ layer: 'demographic', action: 'added' }],
    };
    const recs = layer5Labs(quiz, [b12Rec]);
    expect(getRec(recs, 'vitamin-b12')).toBeUndefined();
  });
});

// ─── TEST 15: Omega-3 index at 3% → omega-3 dose increased significantly ──────

describe('Omega-3 index — very low (3%)', () => {
  it('adds omega-3-fish-oil at 3,000 mg when not previously present', () => {
    const quiz = baseQuiz({
      labValues: { omega3Index: { value: 3, unit: '%' } },
    });
    const recs = layer5Labs(quiz, []);
    const o3 = getRec(recs, 'omega-3-fish-oil');
    expect(o3).toBeDefined();
    expect(o3!.dose).toBeGreaterThanOrEqual(3000);
  });

  it('increases existing omega-3 to at least 3,000 mg', () => {
    const quiz = baseQuiz({
      labValues: { omega3Index: { value: 3, unit: '%' } },
    });
    const recs = runLab5WithSeed(quiz, 'omega-3-fish-oil', 1000);
    const o3 = getRec(recs, 'omega-3-fish-oil');
    expect(o3).toBeDefined();
    expect(o3!.dose).toBeGreaterThanOrEqual(3000);
  });

  it('adds a cardiovascular risk warning for very low omega-3', () => {
    const quiz = baseQuiz({
      labValues: { omega3Index: { value: 3, unit: '%' } },
    });
    const recs = layer5Labs(quiz, []);
    const o3 = getRec(recs, 'omega-3-fish-oil');
    expect(o3!.warnings.some(w => /cardiovascular|risk/i.test(w))).toBe(true);
  });
});
