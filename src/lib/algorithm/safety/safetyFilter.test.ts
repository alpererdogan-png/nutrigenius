// ─────────────────────────────────────────────────────────────────────────────
// Safety Filter — Unit Tests
// ─────────────────────────────────────────────────────────────────────────────

import { runSafetyFilter } from './safetyFilter';
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

function makeRec(id: string, overrides: Partial<Recommendation> = {}): Recommendation {
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

function getApproved(recs: ReturnType<typeof runSafetyFilter>, id: string) {
  return recs.approvedRecommendations.find(r => r.id === id);
}

function getBlocked(recs: ReturnType<typeof runSafetyFilter>, id: string) {
  return recs.blockedRecommendations.find(b => b.recommendation.id === id);
}

function getWarnings(recs: ReturnType<typeof runSafetyFilter>, id: string) {
  return recs.warnings.filter(w => w.supplementId === id);
}

// ─── TEST 1: SSRIs + SAMe → SAMe BLOCKED ─────────────────────────────────────

describe('Drug interaction: SSRIs + SAMe (serotonin syndrome)', () => {
  it('blocks SAMe when patient is on sertraline', () => {
    const quiz = baseQuiz({ medications: ['sertraline'] });
    const recs = [makeRec('same', { supplementName: 'SAMe', dose: 400, doseUnit: 'mg' })];
    const result = runSafetyFilter(quiz, recs);
    expect(getApproved(result, 'same')).toBeUndefined();
    expect(getBlocked(result, 'same')).toBeDefined();
  });

  it('blocked SAMe has critical severity', () => {
    const quiz = baseQuiz({ medications: ['fluoxetine'] });
    const recs = [makeRec('same')];
    const result = runSafetyFilter(quiz, recs);
    expect(getBlocked(result, 'same')?.severity).toBe('critical');
  });

  it('does not block SAMe for patients not on SSRIs', () => {
    const quiz = baseQuiz({ medications: ['atorvastatin'] });
    const recs = [makeRec('same')];
    const result = runSafetyFilter(quiz, recs);
    expect(getApproved(result, 'same')).toBeDefined();
    expect(getBlocked(result, 'same')).toBeUndefined();
  });
});

// ─── TEST 2: SSRIs + 5-HTP → 5-HTP BLOCKED ──────────────────────────────────

describe('Drug interaction: SSRIs + 5-HTP (serotonin syndrome)', () => {
  it('blocks 5-HTP when patient is on escitalopram', () => {
    const quiz = baseQuiz({ medications: ['escitalopram'] });
    const recs = [makeRec('5-htp', { supplementName: '5-HTP', dose: 100, doseUnit: 'mg' })];
    const result = runSafetyFilter(quiz, recs);
    expect(getApproved(result, '5-htp')).toBeUndefined();
    expect(getBlocked(result, '5-htp')).toBeDefined();
    expect(getBlocked(result, '5-htp')?.severity).toBe('critical');
  });

  it('blocked reason mentions serotonin syndrome', () => {
    const quiz = baseQuiz({ medications: ['sertraline'] });
    const recs = [makeRec('5-htp')];
    const result = runSafetyFilter(quiz, recs);
    expect(getBlocked(result, '5-htp')?.reason.toLowerCase()).toContain('serotonin');
  });
});

// ─── TEST 3: Warfarin + fish oil → MAJOR warning (not blocked) ───────────────

describe('Drug interaction: Warfarin + omega-3 fish oil (MAJOR warning)', () => {
  it('keeps fish oil in approved list — not blocked', () => {
    const quiz = baseQuiz({ medications: ['warfarin'] });
    const recs = [makeRec('omega-3-fish-oil', { supplementName: 'Omega-3 Fish Oil', dose: 2000, doseUnit: 'mg' })];
    const result = runSafetyFilter(quiz, recs);
    expect(getApproved(result, 'omega-3-fish-oil')).toBeDefined();
    expect(getBlocked(result, 'omega-3-fish-oil')).toBeUndefined();
  });

  it('emits a MAJOR severity warning for fish oil with warfarin', () => {
    const quiz = baseQuiz({ medications: ['warfarin'] });
    const recs = [makeRec('omega-3-fish-oil')];
    const result = runSafetyFilter(quiz, recs);
    const w = getWarnings(result, 'omega-3-fish-oil');
    expect(w.some(x => x.severity === 'major')).toBe(true);
  });

  it('warning mentions bleeding or antiplatelet', () => {
    const quiz = baseQuiz({ medications: ['warfarin'] });
    const recs = [makeRec('omega-3-fish-oil')];
    const result = runSafetyFilter(quiz, recs);
    const w = getWarnings(result, 'omega-3-fish-oil');
    const desc = w.map(x => x.description.toLowerCase()).join(' ');
    expect(desc).toMatch(/bleeding|antiplatelet|platelet|anticoagulant/);
  });
});

// ─── TEST 4: Warfarin + vitamin K → CRITICAL, blocked ────────────────────────

describe('Drug interaction: Warfarin + Vitamin K (CRITICAL block)', () => {
  it('blocks vitamin-k2-mk7 when patient is on warfarin', () => {
    const quiz = baseQuiz({ medications: ['warfarin'] });
    const recs = [makeRec('vitamin-k2-mk7', { supplementName: 'Vitamin K2 MK-7', dose: 200, doseUnit: 'mcg' })];
    const result = runSafetyFilter(quiz, recs);
    expect(getApproved(result, 'vitamin-k2-mk7')).toBeUndefined();
    expect(getBlocked(result, 'vitamin-k2-mk7')).toBeDefined();
    expect(getBlocked(result, 'vitamin-k2-mk7')?.severity).toBe('critical');
  });

  it('warfarin + vitamin K block reason mentions anticoagulant antagonism', () => {
    const quiz = baseQuiz({ medications: ['warfarin'] });
    const recs = [makeRec('vitamin-k2-mk7')];
    const result = runSafetyFilter(quiz, recs);
    const reason = getBlocked(result, 'vitamin-k2-mk7')?.reason.toLowerCase() ?? '';
    expect(reason).toMatch(/warfarin|antagonis|clotting|inr|vitamin k/);
  });
});

// ─── TEST 5: Metformin + berberine → hypoglycemia warning ────────────────────

describe('Drug interaction: Metformin + berberine (hypoglycemia warning)', () => {
  it('keeps berberine in approved list (not blocked)', () => {
    const quiz = baseQuiz({ medications: ['metformin'] });
    const recs = [makeRec('berberine', { supplementName: 'Berberine', dose: 1000, doseUnit: 'mg' })];
    const result = runSafetyFilter(quiz, recs);
    expect(getApproved(result, 'berberine')).toBeDefined();
    expect(getBlocked(result, 'berberine')).toBeUndefined();
  });

  it('emits a MAJOR warning for berberine with metformin', () => {
    const quiz = baseQuiz({ medications: ['metformin'] });
    const recs = [makeRec('berberine')];
    const result = runSafetyFilter(quiz, recs);
    const w = getWarnings(result, 'berberine');
    expect(w.some(x => x.severity === 'major')).toBe(true);
  });

  it('warning mentions hypoglycemia', () => {
    const quiz = baseQuiz({ medications: ['metformin'] });
    const recs = [makeRec('berberine')];
    const result = runSafetyFilter(quiz, recs);
    const allText = getWarnings(result, 'berberine').map(w => w.description.toLowerCase()).join(' ');
    expect(allText).toContain('hypoglycemia');
  });
});

// ─── TEST 6: Iron + calcium → absorption separation note ─────────────────────

describe('Supplement–supplement: Iron + calcium absorption competition', () => {
  it('produces an absorption-competition supplementInteraction entry', () => {
    const quiz = baseQuiz();
    const recs = [
      makeRec('iron-bisglycinate', { supplementName: 'Iron Bisglycinate', dose: 18, doseUnit: 'mg' }),
      makeRec('calcium-carbonate', { supplementName: 'Calcium Carbonate', dose: 500, doseUnit: 'mg' }),
    ];
    const result = runSafetyFilter(quiz, recs);
    const interaction = result.supplementInteractions.find(
      i => i.type === 'absorption-competition' &&
           (i.supplement1Id === 'iron-bisglycinate' || i.supplement2Id === 'iron-bisglycinate'),
    );
    expect(interaction).toBeDefined();
    expect(interaction?.description.toLowerCase()).toMatch(/iron|calcium|absorpt/);
  });

  it('both iron and calcium remain in approved list', () => {
    const quiz = baseQuiz();
    const recs = [
      makeRec('iron-bisglycinate', { dose: 18, doseUnit: 'mg' }),
      makeRec('calcium-carbonate', { dose: 500, doseUnit: 'mg' }),
    ];
    const result = runSafetyFilter(quiz, recs);
    expect(getApproved(result, 'iron-bisglycinate')).toBeDefined();
    expect(getApproved(result, 'calcium-carbonate')).toBeDefined();
  });
});

// ─── TEST 7: 4 blood-thinning supplements → cumulative bleeding flag ──────────

describe('Supplement–supplement: Cumulative blood-thinning risk', () => {
  it('flags cumulative bleeding risk when 4 blood-thinning supplements are present', () => {
    const quiz = baseQuiz();
    const recs = [
      makeRec('omega-3-fish-oil', { dose: 2000, doseUnit: 'mg' }),
      makeRec('vitamin-e-mixed-tocopherols', { dose: 200, doseUnit: 'IU' }),
      makeRec('garlic-extract', { dose: 600, doseUnit: 'mg' }),
      makeRec('curcumin', { dose: 500, doseUnit: 'mg' }),
    ];
    const result = runSafetyFilter(quiz, recs);
    const cumulativeInteraction = result.supplementInteractions.find(
      i => i.type === 'cumulative-effect',
    );
    expect(cumulativeInteraction).toBeDefined();
    expect(cumulativeInteraction?.description.toLowerCase()).toMatch(/bleed|antiplatelet|blood.thin/);
  });

  it('does NOT flag cumulative risk when fewer than 3 blood-thinning supplements are present', () => {
    const quiz = baseQuiz();
    const recs = [
      makeRec('omega-3-fish-oil', { dose: 2000, doseUnit: 'mg' }),
      makeRec('curcumin', { dose: 500, doseUnit: 'mg' }),
    ];
    const result = runSafetyFilter(quiz, recs);
    const cumulativeBlood = result.supplementInteractions.find(
      i => i.type === 'cumulative-effect' && i.description.toLowerCase().includes('bleed'),
    );
    expect(cumulativeBlood).toBeUndefined();
  });
});

// ─── TEST 8: Zinc at 30mg → copper 2mg added ─────────────────────────────────

describe('Supplement–supplement: Zinc >25mg depletes copper → copper added', () => {
  it('adds copper-bisglycinate to approved when zinc dose is 30mg', () => {
    const quiz = baseQuiz();
    const recs = [makeRec('zinc-picolinate', { supplementName: 'Zinc Picolinate', dose: 30, doseUnit: 'mg' })];
    const result = runSafetyFilter(quiz, recs);
    const copper = getApproved(result, 'copper-bisglycinate');
    expect(copper).toBeDefined();
    expect(copper?.dose).toBe(2);
    expect(copper?.doseUnit).toBe('mg');
  });

  it('does NOT add copper when zinc dose is ≤25mg', () => {
    const quiz = baseQuiz();
    const recs = [makeRec('zinc-picolinate', { dose: 15, doseUnit: 'mg' })];
    const result = runSafetyFilter(quiz, recs);
    expect(getApproved(result, 'copper-bisglycinate')).toBeUndefined();
  });

  it('does NOT add copper if copper is already in the protocol', () => {
    const quiz = baseQuiz();
    const recs = [
      makeRec('zinc-picolinate', { dose: 30, doseUnit: 'mg' }),
      makeRec('copper-bisglycinate', { dose: 2, doseUnit: 'mg' }),
    ];
    const result = runSafetyFilter(quiz, recs);
    expect(result.approvedRecommendations.filter(r => r.id === 'copper-bisglycinate')).toHaveLength(1);
  });
});

// ─── TEST 9: Vitamin D from sources exceeding 4,000 IU → flag ────────────────

describe('UL check: Vitamin D exceeding 4,000 IU', () => {
  it('flags Vitamin D UL when single source dose is 5,000 IU', () => {
    const quiz = baseQuiz();
    const recs = [makeRec('vitamin-d3', { supplementName: 'Vitamin D3', dose: 5000, doseUnit: 'IU' })];
    const result = runSafetyFilter(quiz, recs);
    const ulCheck = result.ulChecks.find(u => u.nutrient === 'Vitamin D');
    expect(ulCheck).toBeDefined();
    expect(ulCheck?.exceedsUL).toBe(true);
    expect(ulCheck?.totalDose).toBe(5000);
    expect(ulCheck?.upperLimit).toBe(4000);
  });

  it('flags Vitamin D when two sources sum above 4,000 IU', () => {
    const quiz = baseQuiz();
    const recs = [
      makeRec('vitamin-d3', { dose: 2500, doseUnit: 'IU' }),
      makeRec('vitamin-d2', { dose: 2000, doseUnit: 'IU' }),
    ];
    const result = runSafetyFilter(quiz, recs);
    const ulCheck = result.ulChecks.find(u => u.nutrient === 'Vitamin D');
    expect(ulCheck?.exceedsUL).toBe(true);
    expect(ulCheck?.totalDose).toBe(4500);
    expect(ulCheck?.sources).toContain('vitamin-d3');
    expect(ulCheck?.sources).toContain('vitamin-d2');
  });

  it('does NOT flag Vitamin D when dose is within UL', () => {
    const quiz = baseQuiz();
    const recs = [makeRec('vitamin-d3', { dose: 2000, doseUnit: 'IU' })];
    const result = runSafetyFilter(quiz, recs);
    const ulCheck = result.ulChecks.find(u => u.nutrient === 'Vitamin D' && u.exceedsUL);
    expect(ulCheck).toBeUndefined();
  });
});

// ─── TEST 10: Calcium exceeding 2,500mg → flag ────────────────────────────────

describe('UL check: Calcium exceeding 2,500mg', () => {
  it('flags Calcium UL when dose is 3,000mg', () => {
    const quiz = baseQuiz();
    const recs = [makeRec('calcium-carbonate', { supplementName: 'Calcium Carbonate', dose: 3000, doseUnit: 'mg' })];
    const result = runSafetyFilter(quiz, recs);
    const ulCheck = result.ulChecks.find(u => u.nutrient === 'Calcium');
    expect(ulCheck).toBeDefined();
    expect(ulCheck?.exceedsUL).toBe(true);
    expect(ulCheck?.totalDose).toBe(3000);
  });

  it('applies lower UL of 2,000mg for patients aged 51+', () => {
    const quiz = baseQuiz({ age: 55 });
    const recs = [makeRec('calcium-carbonate', { dose: 2200, doseUnit: 'mg' })];
    const result = runSafetyFilter(quiz, recs);
    const ulCheck = result.ulChecks.find(u => u.nutrient === 'Calcium');
    expect(ulCheck?.exceedsUL).toBe(true); // 2200 > 2000 (age 55 UL)
    expect(ulCheck?.upperLimit).toBe(2000);
  });
});

// ─── TEST 11: Smoker with beta-carotene → removed ────────────────────────────

describe('Special safety: Smoker — beta-carotene blocked', () => {
  it('removes beta-carotene for current smoker (smokerFlag true)', () => {
    const quiz = baseQuiz({ smokingStatus: 'current', smokerFlag: true });
    const recs = [makeRec('beta-carotene', { supplementName: 'Beta-Carotene', dose: 25000, doseUnit: 'IU' })];
    const result = runSafetyFilter(quiz, recs);
    expect(getApproved(result, 'beta-carotene')).toBeUndefined();
    expect(getBlocked(result, 'beta-carotene')).toBeDefined();
    expect(getBlocked(result, 'beta-carotene')?.severity).toBe('critical');
  });

  it('block reason mentions lung cancer risk from CARET/ATBC trials', () => {
    const quiz = baseQuiz({ smokingStatus: 'current', smokerFlag: true });
    const recs = [makeRec('beta-carotene')];
    const result = runSafetyFilter(quiz, recs);
    const reason = getBlocked(result, 'beta-carotene')?.reason.toLowerCase() ?? '';
    expect(reason).toMatch(/cancer|caret|atbc|smoking|smoker/i);
  });

  it('does NOT block beta-carotene for never-smoker', () => {
    const quiz = baseQuiz({ smokingStatus: 'never' });
    const recs = [makeRec('beta-carotene')];
    const result = runSafetyFilter(quiz, recs);
    expect(getApproved(result, 'beta-carotene')).toBeDefined();
  });
});

// ─── TEST 12: Pregnant user → unsafe herbs blocked, safe supplements preserved

describe('Special safety: Pregnancy — herb block, prenatal safe list preserved', () => {
  it('blocks ashwagandha for pregnant user', () => {
    const quiz = baseQuiz({ isPregnant: true });
    const recs = [
      makeRec('ashwagandha', { supplementName: 'Ashwagandha' }),
      makeRec('dha-algae', { supplementName: 'Algae DHA', dose: 500, doseUnit: 'mg' }),
    ];
    const result = runSafetyFilter(quiz, recs);
    expect(getApproved(result, 'ashwagandha')).toBeUndefined();
    expect(getBlocked(result, 'ashwagandha')).toBeDefined();
    expect(getBlocked(result, 'ashwagandha')?.severity).toBe('critical');
  });

  it('blocks rhodiola-rosea for pregnant user', () => {
    const quiz = baseQuiz({ isPregnant: true });
    const recs = [makeRec('rhodiola-rosea')];
    const result = runSafetyFilter(quiz, recs);
    expect(getApproved(result, 'rhodiola-rosea')).toBeUndefined();
    expect(getBlocked(result, 'rhodiola-rosea')).toBeDefined();
  });

  it('preserves DHA (dha-algae) for pregnant user — pregnancy-safe', () => {
    const quiz = baseQuiz({ isPregnant: true });
    const recs = [
      makeRec('ashwagandha'),
      makeRec('dha-algae', { supplementName: 'Algae DHA', dose: 500, doseUnit: 'mg' }),
      makeRec('folic-acid', { supplementName: 'Folic Acid', dose: 800, doseUnit: 'mcg' }),
    ];
    const result = runSafetyFilter(quiz, recs);
    expect(getApproved(result, 'dha-algae')).toBeDefined();
    expect(getApproved(result, 'folic-acid')).toBeDefined();
  });

  it('does not block safe prenatal supplements', () => {
    const quiz = baseQuiz({ isPregnant: true });
    const recs = [
      makeRec('iron-bisglycinate', { dose: 27, doseUnit: 'mg' }),
      makeRec('vitamin-d3', { dose: 2000, doseUnit: 'IU' }),
      makeRec('probiotics'),
    ];
    const result = runSafetyFilter(quiz, recs);
    expect(getApproved(result, 'iron-bisglycinate')).toBeDefined();
    expect(getApproved(result, 'vitamin-d3')).toBeDefined();
    expect(getApproved(result, 'probiotics')).toBeDefined();
  });
});

// ─── TEST 13: Statin user → CoQ10 marked as beneficial interaction ────────────

describe('Drug interaction: Statin + CoQ10 → BENEFICIAL (informational)', () => {
  it('emits an informational warning for CoQ10 with atorvastatin', () => {
    const quiz = baseQuiz({ medications: ['atorvastatin'] });
    const recs = [makeRec('coq10-ubiquinol', { supplementName: 'CoQ10', dose: 100, doseUnit: 'mg' })];
    const result = runSafetyFilter(quiz, recs);
    const w = getWarnings(result, 'coq10-ubiquinol');
    expect(w.some(x => x.severity === 'informational')).toBe(true);
  });

  it('CoQ10 remains in approved list — not blocked by statin', () => {
    const quiz = baseQuiz({ medications: ['rosuvastatin'] });
    const recs = [makeRec('coq10-ubiquinol', { dose: 100, doseUnit: 'mg' })];
    const result = runSafetyFilter(quiz, recs);
    expect(getApproved(result, 'coq10-ubiquinol')).toBeDefined();
    expect(getBlocked(result, 'coq10-ubiquinol')).toBeUndefined();
  });

  it('informational note mentions statin-induced CoQ10 depletion', () => {
    const quiz = baseQuiz({ medications: ['simvastatin'] });
    const recs = [makeRec('coq10-ubiquinol')];
    const result = runSafetyFilter(quiz, recs);
    const w = getWarnings(result, 'coq10-ubiquinol');
    const text = w.map(x => x.description.toLowerCase()).join(' ');
    expect(text).toMatch(/deplet|statin|coq10|myopat/);
  });
});

// ─── TEST 14: Chemotherapy + antioxidants → consultation flag ────────────────

describe('Special safety: Chemotherapy + antioxidants → oncologist consultation', () => {
  it('flags vitamin-c for chemotherapy patient', () => {
    const quiz = baseQuiz({ medications: ['cisplatin'] });
    const recs = [makeRec('vitamin-c', { supplementName: 'Vitamin C', dose: 500, doseUnit: 'mg' })];
    const result = runSafetyFilter(quiz, recs);
    const w = getWarnings(result, 'vitamin-c');
    expect(w.length).toBeGreaterThan(0);
    expect(w.some(x => x.medication?.toLowerCase().includes('chemo'))).toBe(true);
  });

  it('warning mentions oncologist consultation', () => {
    const quiz = baseQuiz({ medications: ['paclitaxel'] });
    const recs = [makeRec('nac', { supplementName: 'NAC', dose: 600, doseUnit: 'mg' })];
    const result = runSafetyFilter(quiz, recs);
    const w = getWarnings(result, 'nac');
    const text = w.map(x => x.recommendation.toLowerCase()).join(' ');
    expect(text).toContain('oncologist');
  });

  it('vitamin-c remains in approved list — not outright blocked', () => {
    const quiz = baseQuiz({ medications: ['chemotherapy'] });
    const recs = [makeRec('vitamin-c', { dose: 500, doseUnit: 'mg' })];
    const result = runSafetyFilter(quiz, recs);
    expect(getApproved(result, 'vitamin-c')).toBeDefined();
  });
});

// ─── TEST 15: CKD + potassium → warning flag ─────────────────────────────────

describe('Special safety: CKD + potassium → warning', () => {
  it('flags potassium for patient with CKD', () => {
    const quiz = baseQuiz({ healthConditions: ['ckd'] });
    const recs = [makeRec('potassium-citrate', { supplementName: 'Potassium Citrate', dose: 1000, doseUnit: 'mg' })];
    const result = runSafetyFilter(quiz, recs);
    const w = getWarnings(result, 'potassium-citrate');
    expect(w.length).toBeGreaterThan(0);
    expect(w.some(x => x.severity === 'major')).toBe(true);
  });

  it('warning for potassium in CKD mentions hyperkalemia or renal', () => {
    const quiz = baseQuiz({ healthConditions: ['chronic kidney disease'] });
    const recs = [makeRec('potassium-citrate', { dose: 1000, doseUnit: 'mg' })];
    const result = runSafetyFilter(quiz, recs);
    const w = getWarnings(result, 'potassium-citrate');
    const text = w.map(x => x.description.toLowerCase()).join(' ');
    expect(text).toMatch(/hyperkal|renal|kidney|ckd/);
  });

  it('potassium remains in approved list — warning only, not blocked', () => {
    const quiz = baseQuiz({ healthConditions: ['ckd'] });
    const recs = [makeRec('potassium-citrate', { dose: 1000, doseUnit: 'mg' })];
    const result = runSafetyFilter(quiz, recs);
    expect(getApproved(result, 'potassium-citrate')).toBeDefined();
  });
});

// ─── TEST 16: Shellfish allergy + vegan glucosamine → no block ───────────────

describe('Allergy check: Shellfish allergy + vegan glucosamine form', () => {
  it('does NOT block glucosamine when form is vegan-glucosamine', () => {
    const quiz = baseQuiz({ allergies: ['shellfish'] });
    const recs = [makeRec('glucosamine-chondroitin', {
      supplementName: 'Glucosamine (Vegan)',
      form: 'vegan-glucosamine',
      dose: 1500,
      doseUnit: 'mg',
    })];
    const result = runSafetyFilter(quiz, recs);
    expect(getApproved(result, 'glucosamine-chondroitin')).toBeDefined();
    expect(getBlocked(result, 'glucosamine-chondroitin')).toBeUndefined();
  });

  it('WARNS when glucosamine form is glucosamine-sulfate (shellfish-derived) for allergic patient', () => {
    const quiz = baseQuiz({ allergies: ['shellfish'] });
    const recs = [makeRec('glucosamine-chondroitin', {
      form: 'glucosamine-sulfate',
      dose: 1500,
      doseUnit: 'mg',
    })];
    const result = runSafetyFilter(quiz, recs);
    const w = getWarnings(result, 'glucosamine-chondroitin');
    expect(w.length).toBeGreaterThan(0);
    expect(w.some(x => x.severity === 'major')).toBe(true);
  });

  it('no allergy warning for non-allergic patient with standard glucosamine', () => {
    const quiz = baseQuiz({ allergies: [] });
    const recs = [makeRec('glucosamine-chondroitin', { form: 'glucosamine-sulfate', dose: 1500, doseUnit: 'mg' })];
    const result = runSafetyFilter(quiz, recs);
    const w = getWarnings(result, 'glucosamine-chondroitin');
    expect(w.every(x => !x.description.toLowerCase().includes('shellfish'))).toBe(true);
  });
});
