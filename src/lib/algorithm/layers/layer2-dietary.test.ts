// ─────────────────────────────────────────────────────────────────────────────
// Layer 2 — Dietary Analysis Unit Tests
//
// Run:  npx jest src/lib/algorithm/layers/layer2-dietary.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { layer1Demographic } from './layer1-demographic';
import { layer2Dietary } from './layer2-dietary';
import { QuizData, Recommendation } from '../types';

// ─── SHARED QUIZ FACTORY ──────────────────────────────────────────────────────

const baseQuiz = (overrides: Partial<QuizData>): QuizData => ({
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
  alcoholConsumption: 'light',
  smokingStatus: 'never',
  healthConditions: [],
  familyHistory: [],
  medications: [],
  healthGoals: [],
  ...overrides,
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const getById = (recs: Recommendation[], id: string) => recs.find(r => r.id === id);
const ids = (recs: Recommendation[]) => recs.map(r => r.id);

/** Run both layers and return the final recs. */
const run = (overrides: Partial<QuizData>): Recommendation[] => {
  const quiz = baseQuiz(overrides);
  const l1 = layer1Demographic(quiz);
  return layer2Dietary(quiz, l1);
};

// ─── TEST 1: No duplicate IDs across all representative profiles ───────────────

describe('No duplicate supplement IDs after Layer 2', () => {
  const profiles: Array<[string, Partial<QuizData>]> = [
    ['30yo male vegan US', { dietaryPattern: 'vegan' }],
    ['30yo female vegan IE', { biologicalSex: 'female', country: 'IE', dietaryPattern: 'vegan' }],
    ['45yo male vegan UK', { age: 45, biologicalSex: 'male', country: 'GB', dietaryPattern: 'vegan' }],
    ['55yo female omnivore', { age: 55, biologicalSex: 'female', dietaryPattern: 'omnivore' }],
    ['30yo male keto', { dietaryPattern: 'keto', vegetableIntake: 'low' }],
    ['30yo male pescatarian high fish', { dietaryPattern: 'pescatarian', fishIntake: 'high' }],
    ['30yo male vegetarian no fish low dairy', { dietaryPattern: 'vegetarian', fishIntake: 'none', dairyIntake: 'low' }],
    ['28yo female pregnant vegan', { biologicalSex: 'female', isPregnant: true, dietaryPattern: 'vegan' }],
    ['35yo male mediterranean high fish', { dietaryPattern: 'mediterranean', fishIntake: 'high' }],
    ['30yo male omnivore fish allergy', { allergies: ['fish'] }],
    ['30yo male omnivore low dairy low veg', { dairyIntake: 'low', vegetableIntake: 'low' }],
    ['30yo male paleo', { dietaryPattern: 'paleo' }],
    ['50yo female vegetarian', { age: 50, biologicalSex: 'female', dietaryPattern: 'vegetarian' }],
  ];

  test.each(profiles)('%s — no duplicate IDs', (_label, overrides) => {
    const recs = run(overrides);
    const allIds = ids(recs);
    const unique = new Set(allIds);
    expect(allIds.length).toBe(unique.size);
  });
});

// ─── TEST 1: Vegan gets B12 added even if under 50 ────────────────────────────

describe('Vegan user — B12 added for young user (age < 50)', () => {
  const recs = run({ age: 30, dietaryPattern: 'vegan' });

  test('vitamin-b12 is present in output', () => {
    expect(getById(recs, 'vitamin-b12')).toBeDefined();
  });

  test('B12 dose is 1,000 mcg', () => {
    expect(getById(recs, 'vitamin-b12')!.dose).toBe(1000);
  });

  test('B12 form is methylcobalamin', () => {
    expect(getById(recs, 'vitamin-b12')!.form).toBe('methylcobalamin');
  });

  test('B12 reason references vegan diet', () => {
    const b12 = getById(recs, 'vitamin-b12')!;
    const hasVeganReason = b12.reasons.some(r =>
      r.layer === 'dietary' && r.reason.toLowerCase().includes('vegan'),
    );
    expect(hasVeganReason).toBe(true);
  });

  test('B12 source records layer as dietary with action added', () => {
    const b12 = getById(recs, 'vitamin-b12')!;
    const dietarySource = b12.sources.find(s => s.layer === 'dietary');
    expect(dietarySource).toBeDefined();
    expect(dietarySource!.action).toBe('added');
  });

  test('L1 would NOT have added B12 for a 30yo (baseline check)', () => {
    const quiz = baseQuiz({ age: 30 });
    const l1Only = layer1Demographic(quiz);
    expect(getById(l1Only, 'vitamin-b12')).toBeUndefined();
  });
});

describe('Vegan user aged 50+ — B12 dose boosted to 1,000 mcg', () => {
  // L1 adds 500 mcg for age 50–64
  const recs = run({ age: 55, dietaryPattern: 'vegan' });

  test('vitamin-b12 dose is 1,000 mcg (not 500 from L1)', () => {
    expect(getById(recs, 'vitamin-b12')!.dose).toBe(1000);
  });

  test('B12 sources include modified-dose from dietary layer', () => {
    const b12 = getById(recs, 'vitamin-b12')!;
    const modSource = b12.sources.find(
      s => s.layer === 'dietary' && s.action === 'modified-dose',
    );
    expect(modSource).toBeDefined();
  });
});

// ─── TEST 2: Vegan omega-3 swapped to algae (no duplicate) ───────────────────

describe('Vegan user — omega-3 swapped to algae form (no duplication)', () => {
  const recs = run({ age: 30, dietaryPattern: 'vegan' });

  test('omega-3-fish-oil entry is still in protocol (not removed)', () => {
    expect(getById(recs, 'omega-3-fish-oil')).toBeDefined();
  });

  test('exactly one omega-3-fish-oil entry', () => {
    const count = recs.filter(r => r.id === 'omega-3-fish-oil').length;
    expect(count).toBe(1);
  });

  test('omega-3 form is algae-oil', () => {
    expect(getById(recs, 'omega-3-fish-oil')!.form).toBe('algae-oil');
  });

  test('omega-3 supplementName updated to algae variant', () => {
    expect(getById(recs, 'omega-3-fish-oil')!.supplementName).toContain('Algae');
  });

  test('omega-3 dose adjusted to 500 mg DHA', () => {
    expect(getById(recs, 'omega-3-fish-oil')!.dose).toBe(500);
  });

  test('omega-3 sources include modified-form from dietary layer', () => {
    const omega3 = getById(recs, 'omega-3-fish-oil')!;
    const modSource = omega3.sources.find(
      s => s.layer === 'dietary' && s.action === 'modified-form',
    );
    expect(modSource).toBeDefined();
    expect(modSource!.previousValue).toBe('fish-oil');
    expect(modSource!.newValue).toBe('algae-oil');
  });

  test('omega-3 reason references vegan/algae', () => {
    const omega3 = getById(recs, 'omega-3-fish-oil')!;
    const hasAlgaeReason = omega3.reasons.some(r =>
      r.layer === 'dietary' && (r.reason.toLowerCase().includes('algae') || r.reason.toLowerCase().includes('vegan')),
    );
    expect(hasAlgaeReason).toBe(true);
  });
});

describe('Pregnant vegan — both dha-algae (prenatal) and omega-3-fish-oil (baseline) present; baseline swapped to algae', () => {
  // L1 always seeds omega-3-fish-oil for all adults AND adds dha-algae for pregnancy.
  // L2 sees omega-3-fish-oil still present and swaps it to algae form.
  const recs = run({ age: 28, biologicalSex: 'female', isPregnant: true, dietaryPattern: 'vegan' });

  test('dha-algae is present from L1 prenatal stack', () => {
    expect(getById(recs, 'dha-algae')).toBeDefined();
  });

  test('omega-3-fish-oil is present (seeded by L1 baseline) and swapped to algae form', () => {
    const omega3 = getById(recs, 'omega-3-fish-oil');
    expect(omega3).toBeDefined();
    expect(omega3!.form).toBe('algae-oil');
  });

  test('omega-3-fish-oil has dietary modified-form source entry', () => {
    const omega3 = getById(recs, 'omega-3-fish-oil')!;
    expect(omega3.sources.some(s => s.layer === 'dietary' && s.action === 'modified-form')).toBe(true);
  });
});

// ─── TEST 3: Vegan Vitamin D dose increased (not duplicated) ──────────────────

describe('Vegan user — Vitamin D3 dose increased, not duplicated', () => {
  // 30yo male US: L1 dose = 2000 IU (lat 38 → ≥35 bracket)
  const quiz = baseQuiz({ age: 30, country: 'US', dietaryPattern: 'vegan' });
  const l1 = layer1Demographic(quiz);
  const recs = layer2Dietary(quiz, l1);

  test('exactly one vitamin-d3 entry', () => {
    expect(recs.filter(r => r.id === 'vitamin-d3').length).toBe(1);
  });

  test('vitamin-d3 dose is L1 dose + 1,000 IU', () => {
    const l1Dose = getById(l1, 'vitamin-d3')!.dose;
    const l2Dose = getById(recs, 'vitamin-d3')!.dose;
    expect(l2Dose).toBe(Math.min(l1Dose + 1000, 5000));
  });

  test('vitamin-d3 sources include modified-dose from dietary layer', () => {
    const d3 = getById(recs, 'vitamin-d3')!;
    const modSource = d3.sources.find(
      s => s.layer === 'dietary' && s.action === 'modified-dose',
    );
    expect(modSource).toBeDefined();
  });

  test('vitamin-d3 notes include lichen/vegan sourcing advice', () => {
    const d3 = getById(recs, 'vitamin-d3')!;
    const veganNote = d3.notes.find(n => n.toLowerCase().includes('lichen') || n.toLowerCase().includes('vegan'));
    expect(veganNote).toBeDefined();
  });

  test('dose does not exceed 5,000 IU even for high-latitude vegan', () => {
    const highLatRecs = run({ age: 30, country: 'IE', dietaryPattern: 'vegan' });
    expect(getById(highLatRecs, 'vitamin-d3')!.dose).toBeLessThanOrEqual(5000);
  });
});

// ─── TEST 4: Keto magnesium dose increased (not duplicated) ──────────────────

describe('Keto user — magnesium dose increased to ≥400 mg, not duplicated', () => {
  // 30yo male: L1 sets magnesium to 200 mg
  const quiz = baseQuiz({ age: 30, dietaryPattern: 'keto' });
  const l1 = layer1Demographic(quiz);
  const recs = layer2Dietary(quiz, l1);

  test('exactly one magnesium-glycinate entry', () => {
    expect(recs.filter(r => r.id === 'magnesium-glycinate').length).toBe(1);
  });

  test('magnesium dose is at least 400 mg', () => {
    expect(getById(recs, 'magnesium-glycinate')!.dose).toBeGreaterThanOrEqual(400);
  });

  test('magnesium sources include modified-dose from dietary layer', () => {
    const mg = getById(recs, 'magnesium-glycinate')!;
    const modSource = mg.sources.find(
      s => s.layer === 'dietary' && s.action === 'modified-dose',
    );
    expect(modSource).toBeDefined();
    expect(modSource!.previousValue).toBe('200 mg');
    expect(modSource!.newValue).toBe('400 mg');
  });

  test('magnesium reason references ketogenic diet', () => {
    const mg = getById(recs, 'magnesium-glycinate')!;
    const ketoReason = mg.reasons.find(r =>
      r.layer === 'dietary' && r.reason.toLowerCase().includes('ketogenic'),
    );
    expect(ketoReason).toBeDefined();
  });
});

describe('Keto user where magnesium is already ≥400 mg — no downgrade', () => {
  // 60yo male: L1 sets magnesium to 300 mg — still below 400
  const recs60 = run({ age: 60, dietaryPattern: 'keto' });
  test('60yo keto: magnesium dose ≥ 400 mg', () => {
    expect(getById(recs60, 'magnesium-glycinate')!.dose).toBeGreaterThanOrEqual(400);
  });
});

// ─── TEST 5: Keto user gets potassium added ───────────────────────────────────

describe('Keto user — potassium citrate added', () => {
  const recs = run({ dietaryPattern: 'keto' });

  test('potassium-citrate is in protocol', () => {
    expect(getById(recs, 'potassium-citrate')).toBeDefined();
  });

  test('potassium form is citrate', () => {
    expect(getById(recs, 'potassium-citrate')!.form).toBe('citrate');
  });

  test('potassium dose is in 200–400 mg range', () => {
    const dose = getById(recs, 'potassium-citrate')!.dose;
    expect(dose).toBeGreaterThanOrEqual(200);
    expect(dose).toBeLessThanOrEqual(400);
  });

  test('potassium notes include sodium electrolyte guidance', () => {
    const k = getById(recs, 'potassium-citrate')!;
    const sodiumNote = k.notes.find(n => n.toLowerCase().includes('sodium'));
    expect(sodiumNote).toBeDefined();
  });

  test('potassium source is dietary layer added', () => {
    const k = getById(recs, 'potassium-citrate')!;
    expect(k.sources.some(s => s.layer === 'dietary' && s.action === 'added')).toBe(true);
  });
});

describe('Keto with low vegetable intake — psyllium husk added', () => {
  const recs = run({ dietaryPattern: 'keto', vegetableIntake: 'low' });

  test('psyllium-husk is added', () => {
    expect(getById(recs, 'psyllium-husk')).toBeDefined();
  });

  test('psyllium-husk timing is evening', () => {
    expect(getById(recs, 'psyllium-husk')!.timing).toContain('evening');
  });
});

describe('Keto with moderate vegetable intake — psyllium husk NOT added', () => {
  const recs = run({ dietaryPattern: 'keto', vegetableIntake: 'moderate' });

  test('psyllium-husk is absent', () => {
    expect(getById(recs, 'psyllium-husk')).toBeUndefined();
  });
});

// ─── TEST 6: Fish-allergic omnivore gets algae omega-3 ───────────────────────

describe('Fish-allergic omnivore — omega-3 swapped to algae regardless of diet', () => {
  const recs = run({ dietaryPattern: 'omnivore', fishIntake: 'high', allergies: ['fish'] });

  test('omega-3 form is algae-oil', () => {
    expect(getById(recs, 'omega-3-fish-oil')!.form).toBe('algae-oil');
  });

  test('exactly one omega-3 entry', () => {
    expect(recs.filter(r => r.id === 'omega-3-fish-oil').length).toBe(1);
  });

  test('allergyFlag is attached with allergen fish', () => {
    const omega3 = getById(recs, 'omega-3-fish-oil')!;
    const flag = omega3.allergyFlags?.find(f => f.allergen === 'fish');
    expect(flag).toBeDefined();
    expect(flag!.action).toBe('swap-form');
  });

  test('modified-form source records the swap', () => {
    const omega3 = getById(recs, 'omega-3-fish-oil')!;
    expect(omega3.sources.some(s => s.layer === 'dietary' && s.action === 'modified-form')).toBe(true);
  });
});

describe('Fish-allergic vegan — swap called twice; no double-swap duplication', () => {
  // Vegan logic runs first (already swaps to algae), then allergy logic sees algae-oil
  const recs = run({ dietaryPattern: 'vegan', allergies: ['fish'] });

  test('exactly one omega-3-fish-oil entry', () => {
    expect(recs.filter(r => r.id === 'omega-3-fish-oil').length).toBe(1);
  });

  test('omega-3 form remains algae-oil', () => {
    expect(getById(recs, 'omega-3-fish-oil')!.form).toBe('algae-oil');
  });

  test('allergyFlag is present', () => {
    const omega3 = getById(recs, 'omega-3-fish-oil');
    expect(omega3?.allergyFlags?.some(f => f.allergen === 'fish')).toBe(true);
  });
});

// ─── TEST 7: Pescatarian with high fish intake — omega-3 reduced ──────────────

describe('Pescatarian with high fish intake — omega-3 dose reduced', () => {
  const quiz = baseQuiz({ dietaryPattern: 'pescatarian', fishIntake: 'high' });
  const l1 = layer1Demographic(quiz);
  const recs = layer2Dietary(quiz, l1);

  test('omega-3 dose is ≤500 mg (reduced from L1 1,000 mg)', () => {
    expect(getById(recs, 'omega-3-fish-oil')!.dose).toBeLessThanOrEqual(500);
  });

  test('omega-3 notes include advice to reduce if eating fatty fish', () => {
    const omega3 = getById(recs, 'omega-3-fish-oil')!;
    const note = omega3.notes.find(n => n.toLowerCase().includes('fatty fish'));
    expect(note).toBeDefined();
  });

  test('omega-3 reason references pescatarian / dietary fish', () => {
    const omega3 = getById(recs, 'omega-3-fish-oil')!;
    const reason = omega3.reasons.find(r =>
      r.layer === 'dietary' && r.reason.toLowerCase().includes('pescatarian'),
    );
    expect(reason).toBeDefined();
  });

  test('modified-dose source logged', () => {
    const omega3 = getById(recs, 'omega-3-fish-oil')!;
    expect(omega3.sources.some(s => s.layer === 'dietary' && s.action === 'modified-dose')).toBe(true);
  });
});

describe('Pescatarian with low fish intake — omega-3 stays at full dose', () => {
  const quiz = baseQuiz({ dietaryPattern: 'pescatarian', fishIntake: 'low' });
  const l1 = layer1Demographic(quiz);
  const recs = layer2Dietary(quiz, l1);

  test('omega-3 dose unchanged from L1 (1,000 mg)', () => {
    const l1Dose = getById(l1, 'omega-3-fish-oil')!.dose;
    expect(getById(recs, 'omega-3-fish-oil')!.dose).toBe(l1Dose);
  });
});

// ─── TEST 8: Omnivore with low vegetable intake gets Vitamin C ────────────────

describe('Omnivore with low vegetable intake — Vitamin C added', () => {
  const recs = run({ dietaryPattern: 'omnivore', vegetableIntake: 'low' });

  test('vitamin-c is added', () => {
    expect(getById(recs, 'vitamin-c')).toBeDefined();
  });

  test('vitamin-c dose is 500 mg', () => {
    expect(getById(recs, 'vitamin-c')!.dose).toBe(500);
  });

  test('vitamin-c source is dietary layer added', () => {
    const vc = getById(recs, 'vitamin-c')!;
    expect(vc.sources.some(s => s.layer === 'dietary' && s.action === 'added')).toBe(true);
  });
});

describe('Omnivore with moderate vegetable intake — Vitamin C NOT added', () => {
  const recs = run({ dietaryPattern: 'omnivore', vegetableIntake: 'moderate' });

  test('vitamin-c is absent', () => {
    expect(getById(recs, 'vitamin-c')).toBeUndefined();
  });
});

// ─── TEST 9: Mediterranean gets fewer additions than omnivore ─────────────────

describe('Mediterranean diet — fewer supplement additions than omnivore for same gaps', () => {
  const gappyProfile: Partial<QuizData> = {
    age: 30,
    biologicalSex: 'male',
    dairyIntake: 'low',
    vegetableIntake: 'low',
    fishIntake: 'moderate',
  };

  const omnivoreRecs = run({ ...gappyProfile, dietaryPattern: 'omnivore' });
  const medRecs = run({ ...gappyProfile, dietaryPattern: 'mediterranean' });

  test('mediterranean has fewer total supplements than omnivore for same profile', () => {
    // Omnivore adds calcium (low dairy) + vitamin-c (low veg); mediterranean adds neither
    expect(medRecs.length).toBeLessThan(omnivoreRecs.length);
  });

  test('omnivore adds calcium-citrate (low dairy)', () => {
    expect(getById(omnivoreRecs, 'calcium-citrate')).toBeDefined();
  });

  test('omnivore adds vitamin-c (low veg)', () => {
    expect(getById(omnivoreRecs, 'vitamin-c')).toBeDefined();
  });

  test('mediterranean does NOT add calcium-citrate for 30yo male', () => {
    expect(getById(medRecs, 'calcium-citrate')).toBeUndefined();
  });

  test('mediterranean does NOT add vitamin-c', () => {
    expect(getById(medRecs, 'vitamin-c')).toBeUndefined();
  });

  test('mediterranean adds positive note to vitamin-d3', () => {
    const d3 = getById(medRecs, 'vitamin-d3')!;
    const note = d3.notes.find(n => n.toLowerCase().includes('mediterranean'));
    expect(note).toBeDefined();
  });
});

// ─── TEST 10: Allergy flags properly set ──────────────────────────────────────

describe('Allergy flags — shellfish', () => {
  const recs = run({ allergies: ['shellfish'] });

  test('note about vegan glucosamine added to protocol', () => {
    const d3 = getById(recs, 'vitamin-d3')!;
    const note = d3.notes.find(n => n.toLowerCase().includes('glucosamine'));
    expect(note).toBeDefined();
  });
});

describe('Allergy flags — dairy', () => {
  const recs = run({ biologicalSex: 'female', age: 55, allergies: ['dairy'] });

  test('calcium-citrate allergyFlag set for dairy allergen', () => {
    const calcium = getById(recs, 'calcium-citrate');
    if (calcium) {
      const flag = calcium.allergyFlags?.find(f => f.allergen === 'dairy');
      expect(flag).toBeDefined();
      expect(flag!.action).toBe('avoid-ingredient');
    } else {
      // Female 55yo always gets calcium from L1 — if absent something is wrong
      expect(calcium).toBeDefined();
    }
  });
});

describe('Allergy flags — soy', () => {
  const recs = run({ allergies: ['soy'] });

  test('allergyFlag for soy attached to vitamin-d3', () => {
    const d3 = getById(recs, 'vitamin-d3')!;
    const flag = d3.allergyFlags?.find(f => f.allergen === 'soy');
    expect(flag).toBeDefined();
    expect(flag!.action).toBe('avoid-ingredient');
  });
});

describe('Allergy flags — gluten', () => {
  const recs = run({ allergies: ['gluten'] });

  test('gluten note added to vitamin-d3', () => {
    const d3 = getById(recs, 'vitamin-d3')!;
    const note = d3.notes.find(n => n.toLowerCase().includes('gluten'));
    expect(note).toBeDefined();
  });
});

describe('Allergy flags — nuts', () => {
  const recs = run({ allergies: ['nuts'] });

  test('nut allergy note added to vitamin-d3', () => {
    const d3 = getById(recs, 'vitamin-d3')!;
    const note = d3.notes.find(n => n.toLowerCase().includes('nut'));
    expect(note).toBeDefined();
  });
});

// ─── TEST 12: Vegan iron has alternate-day cycling pattern ────────────────────

describe('Vegan user — iron has alternate-day cycling pattern', () => {
  const recs = run({ dietaryPattern: 'vegan' });

  test('iron-bisglycinate is in protocol', () => {
    expect(getById(recs, 'iron-bisglycinate')).toBeDefined();
  });

  test('iron cyclingPattern type is alternate-day', () => {
    expect(getById(recs, 'iron-bisglycinate')!.cyclingPattern.type).toBe('alternate-day');
  });

  test('iron activeDays matches Mon-Wed-Fri-Sun pattern', () => {
    const days = getById(recs, 'iron-bisglycinate')!.cyclingPattern.activeDays;
    expect(days).toEqual([true, false, true, false, true, false, true]);
  });

  test('iron notes include advice to take with Vitamin C', () => {
    const iron = getById(recs, 'iron-bisglycinate')!;
    const vcNote = iron.notes.find(n => n.toLowerCase().includes('vitamin c'));
    expect(vcNote).toBeDefined();
  });

  test('iron has conditional ferritin warning', () => {
    const iron = getById(recs, 'iron-bisglycinate')!;
    const ferritinWarning = iron.warnings.find(w => w.toLowerCase().includes('ferritin'));
    expect(ferritinWarning).toBeDefined();
  });

  test('iron separateFrom includes calcium and zinc', () => {
    const iron = getById(recs, 'iron-bisglycinate')!;
    expect(iron.separateFrom).toContain('calcium-citrate');
    expect(iron.separateFrom).toContain('zinc-picolinate');
  });
});

describe('Pregnant vegan — iron already in protocol from L1 prenatal; no new entry, just reason added', () => {
  const quiz = baseQuiz({ biologicalSex: 'female', isPregnant: true, dietaryPattern: 'vegan' });
  const l1 = layer1Demographic(quiz);
  const recs = layer2Dietary(quiz, l1);

  test('exactly one iron-bisglycinate entry', () => {
    expect(recs.filter(r => r.id === 'iron-bisglycinate').length).toBe(1);
  });

  test('iron-bisglycinate has dietary reason added', () => {
    const iron = getById(recs, 'iron-bisglycinate')!;
    const dietaryReason = iron.reasons.find(r => r.layer === 'dietary');
    expect(dietaryReason).toBeDefined();
  });

  test('iron retains pregnancy-critical priority 10 from L1', () => {
    // addReason does not override priority; L1 prenatal sets it to 10
    expect(getById(recs, 'iron-bisglycinate')!.priority).toBe(10);
  });
});

// ─── TEST 13: Layer sources audit trail ───────────────────────────────────────

describe('Layer sources audit trail — modified-dose', () => {
  test('keto: magnesium sources show modified-dose from dietary layer', () => {
    const recs = run({ dietaryPattern: 'keto' });
    const mg = getById(recs, 'magnesium-glycinate')!;
    const modSource = mg.sources.find(
      s => s.layer === 'dietary' && s.action === 'modified-dose',
    );
    expect(modSource).toBeDefined();
    expect(modSource!.previousValue).toContain('mg');
    expect(modSource!.newValue).toContain('mg');
  });

  test('vegan B12 boost: sources show modified-dose from dietary layer', () => {
    // 55yo vegan: L1 adds 500 mcg, L2 boosts to 1,000 mcg
    const recs = run({ age: 55, dietaryPattern: 'vegan' });
    const b12 = getById(recs, 'vitamin-b12')!;
    const modSource = b12.sources.find(
      s => s.layer === 'dietary' && s.action === 'modified-dose',
    );
    expect(modSource).toBeDefined();
    expect(modSource!.newValue).toBe('1000 mcg');
  });
});

describe('Layer sources audit trail — modified-form', () => {
  test('vegan omega-3: sources show modified-form from dietary layer', () => {
    const recs = run({ dietaryPattern: 'vegan' });
    const omega3 = getById(recs, 'omega-3-fish-oil')!;
    const formSource = omega3.sources.find(
      s => s.layer === 'dietary' && s.action === 'modified-form',
    );
    expect(formSource).toBeDefined();
    expect(formSource!.previousValue).toBe('fish-oil');
    expect(formSource!.newValue).toBe('algae-oil');
  });

  test('fish-allergic omnivore: sources show modified-form from dietary layer', () => {
    const recs = run({ allergies: ['fish'] });
    const omega3 = getById(recs, 'omega-3-fish-oil')!;
    expect(omega3.sources.some(s => s.layer === 'dietary' && s.action === 'modified-form')).toBe(true);
  });
});

describe('Layer sources audit trail — added-reason', () => {
  test('pescatarian high fish: omega-3 sources show added-reason from dietary layer', () => {
    const recs = run({ dietaryPattern: 'pescatarian', fishIntake: 'high' });
    const omega3 = getById(recs, 'omega-3-fish-oil')!;
    expect(omega3.sources.some(s => s.layer === 'dietary' && s.action === 'added-reason')).toBe(true);
  });
});

// ─── ADDITIONAL SCENARIOS ─────────────────────────────────────────────────────

describe('Vegan — Vitamin K2 added', () => {
  const recs = run({ dietaryPattern: 'vegan' });

  test('vitamin-k2-mk7 is in protocol', () => {
    expect(getById(recs, 'vitamin-k2-mk7')).toBeDefined();
  });

  test('K2 form is menaquinone-7', () => {
    expect(getById(recs, 'vitamin-k2-mk7')!.form).toBe('menaquinone-7');
  });

  test('K2 dose is 100 mcg', () => {
    expect(getById(recs, 'vitamin-k2-mk7')!.dose).toBe(100);
  });
});

describe('Vegan — zinc added or increased', () => {
  test('zinc-picolinate present for vegan user (female, not added by L1)', () => {
    const recs = run({ biologicalSex: 'female', dietaryPattern: 'vegan' });
    expect(getById(recs, 'zinc-picolinate')).toBeDefined();
  });

  test('zinc-picolinate dose is 22 mg for vegan female (no prior zinc from L1)', () => {
    const recs = run({ biologicalSex: 'female', dietaryPattern: 'vegan' });
    expect(getById(recs, 'zinc-picolinate')!.dose).toBe(22);
  });

  test('vegan male 40+ zinc: dose increased 50% from L1 15mg to 22mg', () => {
    const recs = run({ age: 40, biologicalSex: 'male', dietaryPattern: 'vegan' });
    const zinc = getById(recs, 'zinc-picolinate')!;
    expect(zinc.dose).toBe(Math.min(Math.round(15 * 1.5), 25)); // 22
  });
});

describe('Vegan — iodine added', () => {
  // 30yo US male — L1 does not add iodine (US is not iodineDeficient)
  const recs = run({ country: 'US', dietaryPattern: 'vegan' });

  test('iodine is in protocol (added by L2 for vegan regardless of country)', () => {
    expect(getById(recs, 'iodine')).toBeDefined();
  });

  test('iodine dose is 150 mcg', () => {
    expect(getById(recs, 'iodine')!.dose).toBe(150);
  });

  test('iodine from country that already has it: reason added, not duplicated', () => {
    // IE is iodineDeficient → L1 adds iodine; L2 should addReason, not duplicate
    const recs_ie = run({ country: 'IE', dietaryPattern: 'vegan' });
    expect(recs_ie.filter(r => r.id === 'iodine').length).toBe(1);
    const iodine = getById(recs_ie, 'iodine')!;
    expect(iodine.reasons.some(r => r.layer === 'dietary')).toBe(true);
  });
});

describe('Omnivore with low dairy — calcium added', () => {
  const recs = run({ dairyIntake: 'none', vegetableIntake: 'moderate' });

  test('calcium-citrate added for omnivore with no dairy', () => {
    expect(getById(recs, 'calcium-citrate')).toBeDefined();
  });

  test('vitamin-d3 note references low dairy', () => {
    const d3 = getById(recs, 'vitamin-d3')!;
    const note = d3.notes.find(n => n.toLowerCase().includes('dairy'));
    expect(note).toBeDefined();
  });
});

describe('Vegetarian with no fish and low dairy — omega-3 swapped to algae', () => {
  const recs = run({ dietaryPattern: 'vegetarian', fishIntake: 'none', dairyIntake: 'low' });

  test('omega-3 form is algae-oil', () => {
    expect(getById(recs, 'omega-3-fish-oil')!.form).toBe('algae-oil');
  });

  test('exactly one omega-3 entry', () => {
    expect(recs.filter(r => r.id === 'omega-3-fish-oil').length).toBe(1);
  });
});

describe('Vegetarian with moderate dairy and moderate fish — omega-3 NOT swapped', () => {
  const recs = run({ dietaryPattern: 'vegetarian', fishIntake: 'moderate', dairyIntake: 'moderate' });

  test('omega-3 form remains fish-oil', () => {
    expect(getById(recs, 'omega-3-fish-oil')!.form).toBe('fish-oil');
  });
});

describe('Paleo diet — calcium added, B-vitamin note present', () => {
  const recs = run({ dietaryPattern: 'paleo' });

  test('calcium-citrate added for 30yo male paleo (no calcium from L1)', () => {
    expect(getById(recs, 'calcium-citrate')).toBeDefined();
  });

  test('magnesium notes include B-vitamin guidance', () => {
    const mg = getById(recs, 'magnesium-glycinate')!;
    const note = mg.notes.find(n => n.toLowerCase().includes('b-vitamin') || n.toLowerCase().includes('b vitamin'));
    expect(note).toBeDefined();
  });
});

describe('Keto — taurine added', () => {
  const recs = run({ dietaryPattern: 'keto' });

  test('taurine is in protocol', () => {
    expect(getById(recs, 'taurine')).toBeDefined();
  });

  test('taurine dose is 500–1,000 mg', () => {
    const dose = getById(recs, 'taurine')!.dose;
    expect(dose).toBeGreaterThanOrEqual(500);
    expect(dose).toBeLessThanOrEqual(1000);
  });

  test('taurine evidence rating is Emerging', () => {
    expect(getById(recs, 'taurine')!.evidenceRating).toBe('Emerging');
  });
});
