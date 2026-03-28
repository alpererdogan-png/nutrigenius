// ─────────────────────────────────────────────────────────────────────────────
// Layer 7 — Health Goals — Unit Tests
// ─────────────────────────────────────────────────────────────────────────────

import { layer7Goals, layer7GoalsFull } from './layer7-goals';
import { layer1Demographic, addOrModify } from './layer1-demographic';
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

/** Run layer7 with layer1 as baseline, merging seeds via addOrModify. */
function runLayer7(quiz: QuizData, seed: Recommendation[] = []): Recommendation[] {
  let recs = layer1Demographic(quiz);
  for (const rec of seed) {
    recs = addOrModify(recs, rec, 'conditions');
  }
  return layer7Goals(quiz, recs);
}

/** Same as runLayer7 but returns the full { approved, removedForCap } result. */
function runLayer7Full(quiz: QuizData, seed: Recommendation[] = []) {
  let recs = layer1Demographic(quiz);
  for (const rec of seed) {
    recs = addOrModify(recs, rec, 'conditions');
  }
  return layer7GoalsFull(quiz, recs);
}

function getRec(recs: Recommendation[], id: string): Recommendation | undefined {
  return recs.find(r => r.id === id);
}

function makeSeedRec(id: string, overrides: Partial<Recommendation> = {}): Recommendation {
  return {
    id,
    supplementName: id,
    form: 'standard',
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
    priority: 5,
    category: 'vitamin',
    separateFrom: [],
    notes: [],
    sources: [{ layer: 'conditions', action: 'added' }],
    ...overrides,
  } as Recommendation;
}

// ─── TEST 1: Energy goal adds CoQ10 if not present, SKIPS if already present ─

describe('Energy goal: CoQ10 added when absent, skipped when present', () => {
  it('adds coq10-ubiquinol when energy goal is set and CoQ10 is absent', () => {
    const quiz = baseQuiz({ healthGoals: ['energy'] });
    const recs = runLayer7(quiz);
    expect(getRec(recs, 'coq10-ubiquinol')).toBeDefined();
  });

  it('does not duplicate coq10-ubiquinol when already seeded in protocol', () => {
    const quiz = baseQuiz({ healthGoals: ['energy'] });
    const seed = [makeSeedRec('coq10-ubiquinol', { dose: 200, priority: 8 })];
    const recs = runLayer7(quiz, seed);
    expect(recs.filter(r => r.id === 'coq10-ubiquinol')).toHaveLength(1);
  });

  it('retains higher priority when existing CoQ10 has priority > goal-added priority', () => {
    const quiz = baseQuiz({ healthGoals: ['energy'] });
    const seed = [makeSeedRec('coq10-ubiquinol', { priority: 8 })];
    const recs = runLayer7(quiz, seed);
    const coq10 = getRec(recs, 'coq10-ubiquinol');
    // addOrModify takes Math.max — should not downgrade from 8 to 5
    expect(coq10?.priority).toBe(8);
  });
});

// ─── TEST 2: Protocol capped at 10 supplements ────────────────────────────────

describe('Hard cap: protocol limited to 10 supplements', () => {
  it('caps approved list at 10 when 12 unique supplements are provided with no goals', () => {
    const quiz = baseQuiz(); // no goals — layer7 adds nothing
    const seeds = Array.from({ length: 12 }, (_, i) =>
      makeSeedRec(`cap-supp-${i + 1}`, { priority: 12 - i }),
    );
    const { approved, removedForCap } = layer7GoalsFull(quiz, seeds);
    expect(approved).toHaveLength(10);
    expect(removedForCap).toHaveLength(2);
  });

  it('approved list contains the highest-priority supplements', () => {
    const quiz = baseQuiz();
    const seeds = Array.from({ length: 12 }, (_, i) =>
      makeSeedRec(`cap-supp-${i + 1}`, { priority: 12 - i }),
    );
    const { approved } = layer7GoalsFull(quiz, seeds);
    // cap-supp-1 (priority 12) and cap-supp-2 (priority 11) must survive
    expect(getRec(approved, 'cap-supp-1')).toBeDefined();
    expect(getRec(approved, 'cap-supp-2')).toBeDefined();
  });

  it('removedForCap contains the lowest-priority supplements', () => {
    const quiz = baseQuiz();
    const seeds = Array.from({ length: 12 }, (_, i) =>
      makeSeedRec(`cap-supp-${i + 1}`, { priority: 12 - i }),
    );
    const { approved, removedForCap } = layer7GoalsFull(quiz, seeds);
    // cap-supp-11 (priority 2) and cap-supp-12 (priority 1) must be removed
    expect(getRec(approved, 'cap-supp-11')).toBeUndefined();
    expect(getRec(approved, 'cap-supp-12')).toBeUndefined();
    expect(getRec(removedForCap, 'cap-supp-11')).toBeDefined();
    expect(getRec(removedForCap, 'cap-supp-12')).toBeDefined();
  });
});

// ─── TEST 3: Smoker + any goal = no beta-carotene ────────────────────────────

describe('Smoker safety: beta-carotene blocked regardless of goal', () => {
  it('removes beta-carotene seeded before layer7 when smokerFlag is true', () => {
    const quiz = baseQuiz({
      smokingStatus: 'current',
      smokerFlag: true,
      healthGoals: ['energy'],
    });
    const seed = [makeSeedRec('beta-carotene', { priority: 9 })];
    const recs = runLayer7(quiz, seed);
    expect(getRec(recs, 'beta-carotene')).toBeUndefined();
  });

  it('does not block supplements for non-smoker with same goal', () => {
    // Baseline — verify energy goal still runs and adds CoQ10 (safety: not over-blocking)
    const quiz = baseQuiz({ smokingStatus: 'never', healthGoals: ['energy'] });
    const recs = runLayer7(quiz);
    expect(getRec(recs, 'coq10-ubiquinol')).toBeDefined();
  });
});

// ─── TEST 4: Multiple goals don't create duplicate supplements ─────────────────

describe('Multiple goals: no duplicate supplement IDs', () => {
  it('coq10-ubiquinol appears exactly once when both energy and heart-health goals are set', () => {
    const quiz = baseQuiz({ healthGoals: ['energy', 'heart-health'] });
    const recs = runLayer7(quiz);
    expect(recs.filter(r => r.id === 'coq10-ubiquinol')).toHaveLength(1);
  });

  it('magnesium-glycinate appears exactly once when both stress-anxiety and sleep goals are set', () => {
    const quiz = baseQuiz({ healthGoals: ['stress-anxiety', 'sleep'] });
    // Use direct call with empty recs to avoid layer1 interference on the count
    const recs = layer7Goals(quiz, []);
    expect(recs.filter(r => r.id === 'magnesium-glycinate')).toHaveLength(1);
  });

  it('l-theanine appears exactly once when both stress-anxiety and sleep goals are set', () => {
    const quiz = baseQuiz({ healthGoals: ['stress-anxiety', 'sleep'] });
    const recs = layer7Goals(quiz, []);
    expect(recs.filter(r => r.id === 'l-theanine')).toHaveLength(1);
  });
});

// ─── TEST 5: Autoimmune patient + immunity goal = no elderberry, no beta-glucan

describe('Autoimmune safety: immune stimulants blocked for immunity goal', () => {
  it('does not add elderberry for a patient with lupus', () => {
    const quiz = baseQuiz({
      healthConditions: ['lupus'],
      healthGoals: ['immunity'],
    });
    const recs = layer7Goals(quiz, []);
    expect(getRec(recs, 'elderberry')).toBeUndefined();
  });

  it('does not add beta-glucan for a patient with rheumatoid condition', () => {
    const quiz = baseQuiz({
      healthConditions: ['rheumatoid'],
      healthGoals: ['immunity'],
    });
    const recs = layer7Goals(quiz, []);
    expect(getRec(recs, 'beta-glucan')).toBeUndefined();
  });

  it('still adds non-immunostimulant supplements (vitamin-c, zinc) for autoimmune + immunity', () => {
    const quiz = baseQuiz({
      healthConditions: ['lupus'],
      healthGoals: ['immunity'],
    });
    const recs = layer7Goals(quiz, []);
    expect(getRec(recs, 'vitamin-c')).toBeDefined();
    expect(getRec(recs, 'zinc-picolinate')).toBeDefined();
  });
});

// ─── TEST 6: Benzodiazepine user + sleep goal = sedation warning ──────────────

describe('Benzodiazepine interaction: sedation warnings applied for sleep goal', () => {
  it('valerian-root carries benzo sedation warning when patient takes diazepam', () => {
    const quiz = baseQuiz({
      medications: ['diazepam'],
      healthGoals: ['sleep'],
    });
    // Direct call with empty baseline for clean supplement count
    const recs = layer7Goals(quiz, []);
    const valerian = getRec(recs, 'valerian-root');
    expect(valerian).toBeDefined();
    expect(
      valerian?.warnings.some(w => w.toLowerCase().includes('benzodiazepine')),
    ).toBe(true);
  });

  it('valerian-root has NO benzo warning when patient does not take benzos', () => {
    const quiz = baseQuiz({ healthGoals: ['sleep'] });
    const recs = layer7Goals(quiz, []);
    const valerian = getRec(recs, 'valerian-root');
    expect(valerian).toBeDefined();
    expect(
      valerian?.warnings.some(w => w.toLowerCase().includes('benzodiazepine')),
    ).toBe(false);
  });

  it('gaba carries benzo sedation warning for stress-anxiety goal with lorazepam', () => {
    const quiz = baseQuiz({
      medications: ['lorazepam'],
      healthGoals: ['stress-anxiety'],
    });
    const recs = layer7Goals(quiz, []);
    const gaba = getRec(recs, 'gaba');
    expect(gaba).toBeDefined();
    expect(
      gaba?.warnings.some(w => w.toLowerCase().includes('benzodiazepine')),
    ).toBe(true);
  });
});

// ─── TEST 7: CYP1A2 slow + weight management = caffeine warning ───────────────

describe('CYP1A2 slow metaboliser: caffeine warning on green-tea-extract', () => {
  it('adds caffeine/CYP1A2 warning to green-tea-extract for slow metaboliser', () => {
    const quiz = baseQuiz({
      geneticVariants: { cyp1a2: 'slow' },
      healthGoals: ['weight-management'],
    });
    const recs = layer7Goals(quiz, []);
    const gte = getRec(recs, 'green-tea-extract');
    expect(gte).toBeDefined();
    expect(
      gte?.warnings.some(
        w => w.toLowerCase().includes('cyp1a2') || w.toLowerCase().includes('caffeine'),
      ),
    ).toBe(true);
  });

  it('does not add caffeine warning for fast CYP1A2 metaboliser', () => {
    const quiz = baseQuiz({
      geneticVariants: { cyp1a2: 'fast' },
      healthGoals: ['weight-management'],
    });
    const recs = layer7Goals(quiz, []);
    const gte = getRec(recs, 'green-tea-extract');
    expect(gte).toBeDefined();
    expect(
      gte?.warnings.some(w => w.toLowerCase().includes('cyp1a2')),
    ).toBe(false);
  });

  it('adds CYP1A2 note to green-tea-extract for slow metaboliser', () => {
    const quiz = baseQuiz({
      geneticVariants: { cyp1a2: 'slow' },
      healthGoals: ['weight-management'],
    });
    const recs = layer7Goals(quiz, []);
    const gte = getRec(recs, 'green-tea-extract');
    expect(
      gte?.notes.some(n => n.toLowerCase().includes('cyp1a2')),
    ).toBe(true);
  });
});

// ─── TEST 8: Shellfish allergy + joint health = vegan glucosamine ─────────────

describe('Shellfish allergy: vegan glucosamine form for joint health', () => {
  it('uses vegan-glucosamine form when patient has shellfish allergy', () => {
    const quiz = baseQuiz({
      allergies: ['shellfish'],
      healthGoals: ['joint-health'],
    });
    const recs = layer7Goals(quiz, []);
    const glucosamine = getRec(recs, 'glucosamine-chondroitin');
    expect(glucosamine).toBeDefined();
    expect(glucosamine?.form).toBe('vegan-glucosamine');
  });

  it('uses glucosamine-sulfate form when no shellfish allergy', () => {
    const quiz = baseQuiz({ healthGoals: ['joint-health'] });
    const recs = layer7Goals(quiz, []);
    const glucosamine = getRec(recs, 'glucosamine-chondroitin');
    expect(glucosamine).toBeDefined();
    expect(glucosamine?.form).toBe('glucosamine-sulfate');
  });

  it('shellfish-allergy glucosamine supplement name includes "Vegan"', () => {
    const quiz = baseQuiz({
      allergies: ['shellfish'],
      healthGoals: ['joint-health'],
    });
    const recs = layer7Goals(quiz, []);
    const glucosamine = getRec(recs, 'glucosamine-chondroitin');
    expect(glucosamine?.supplementName).toContain('Vegan');
  });
});

// ─── TEST 9: Longevity supplements have Emerging evidence clearly labeled ──────

describe('Longevity goal: Emerging evidence clearly labeled', () => {
  it('NMN has evidenceRating Emerging', () => {
    const quiz = baseQuiz({ healthGoals: ['longevity'] });
    const recs = layer7Goals(quiz, []);
    const nmn = getRec(recs, 'nmn');
    expect(nmn).toBeDefined();
    expect(nmn?.evidenceRating).toBe('Emerging');
  });

  it('resveratrol has evidenceRating Emerging', () => {
    const quiz = baseQuiz({ healthGoals: ['longevity'] });
    const recs = layer7Goals(quiz, []);
    const resveratrol = getRec(recs, 'resveratrol');
    expect(resveratrol).toBeDefined();
    expect(resveratrol?.evidenceRating).toBe('Emerging');
  });

  it('sulforaphane has evidenceRating Emerging', () => {
    const quiz = baseQuiz({ healthGoals: ['longevity'] });
    const recs = layer7Goals(quiz, []);
    const sulforaphane = getRec(recs, 'sulforaphane');
    expect(sulforaphane).toBeDefined();
    expect(sulforaphane?.evidenceRating).toBe('Emerging');
  });

  it('NMN notes reference its preclinical/early evidence status', () => {
    const quiz = baseQuiz({ healthGoals: ['longevity'] });
    const recs = layer7Goals(quiz, []);
    const nmn = getRec(recs, 'nmn');
    // Note should mention NAD+ precursor or long-term study status
    expect(
      nmn?.notes.some(
        n => n.toLowerCase().includes('nad+') || n.toLowerCase().includes('preclinical'),
      ),
    ).toBe(true);
  });

  it('coq10-ubiquinol added by longevity has Moderate evidence (not Emerging)', () => {
    const quiz = baseQuiz({ healthGoals: ['longevity'] });
    const recs = layer7Goals(quiz, []);
    const coq10 = getRec(recs, 'coq10-ubiquinol');
    expect(coq10?.evidenceRating).toBe('Moderate');
  });
});

// ─── TEST 10: Goal-added supplements have lower priority than condition-added ──

describe('Priority ordering: condition supplements outrank goal supplements', () => {
  it('condition supplement at priority 8 appears before energy goal supplement at priority 5', () => {
    const quiz = baseQuiz({ healthGoals: ['energy'] });
    const condSeed = makeSeedRec('cond-test-supp', { priority: 8 });
    // Pass directly so there is no layer1 ambiguity
    const { approved } = layer7GoalsFull(quiz, [condSeed]);
    const condIdx = approved.findIndex(r => r.id === 'cond-test-supp');
    const coq10Idx = approved.findIndex(r => r.id === 'coq10-ubiquinol');
    expect(condIdx).toBeGreaterThanOrEqual(0);
    expect(coq10Idx).toBeGreaterThanOrEqual(0);
    // Priority 8 > Priority 5 → condition supplement must rank higher (smaller index)
    expect(condIdx).toBeLessThan(coq10Idx);
  });
});

// ─── TEST 11: Tie-breaking works correctly (earlier layer wins) ────────────────

describe('Tie-breaking: earlier-layer supplement beats goals-layer supplement at same priority', () => {
  it('conditions-sourced supplement (LAYER_ORDER 3) beats goals-sourced supplement (LAYER_ORDER 0) at equal priority 5', () => {
    const quiz = baseQuiz({ healthGoals: ['energy'] });
    // condSeed: from 'conditions' layer, priority 5 (same as coq10-ubiquinol added by energy goal)
    const condSeed = makeSeedRec('conditions-p5-supp', { priority: 5 });
    // Pass directly — condSeed is the only input, energy goal adds coq10 at priority 5
    const { approved } = layer7GoalsFull(quiz, [condSeed]);
    const condIdx = approved.findIndex(r => r.id === 'conditions-p5-supp');
    const goalIdx = approved.findIndex(r => r.id === 'coq10-ubiquinol');
    expect(condIdx).toBeGreaterThanOrEqual(0);
    expect(goalIdx).toBeGreaterThanOrEqual(0);
    // Both priority 5; conditions LAYER_ORDER (3) > goals LAYER_ORDER (0) → conditions first
    expect(condIdx).toBeLessThan(goalIdx);
  });
});

// ─── TEST 12: Removed supplements stored for upsell display ──────────────────

describe('Upsell: removed supplements stored in removedForCap', () => {
  it('stores exactly the overflow supplements in removedForCap when cap is exceeded by 1', () => {
    const quiz = baseQuiz(); // no goals
    const seeds = Array.from({ length: 11 }, (_, i) =>
      makeSeedRec(`upsell-supp-${i + 1}`, { priority: 11 - i }),
    );
    const { approved, removedForCap } = layer7GoalsFull(quiz, seeds);
    expect(approved).toHaveLength(10);
    expect(removedForCap).toHaveLength(1);
    // The one removed supplement must be the lowest-priority item
    expect(removedForCap[0].id).toBe('upsell-supp-11'); // priority 1
  });

  it('removedForCap supplements all have lower priority than the lowest approved supplement', () => {
    const quiz = baseQuiz();
    const seeds = Array.from({ length: 13 }, (_, i) =>
      makeSeedRec(`upsell-p${13 - i}`, { priority: 13 - i }),
    );
    const { approved, removedForCap } = layer7GoalsFull(quiz, seeds);
    const minApprovedPriority = Math.min(...approved.map(r => r.priority));
    const maxRemovedPriority = Math.max(...removedForCap.map(r => r.priority));
    expect(maxRemovedPriority).toBeLessThanOrEqual(minApprovedPriority);
  });
});
