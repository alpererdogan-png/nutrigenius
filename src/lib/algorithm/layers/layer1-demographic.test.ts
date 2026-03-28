// ─────────────────────────────────────────────────────────────────────────────
// Layer 1 — Demographic Baseline Unit Tests
//
// Run:  npx jest src/lib/algorithm/layers/layer1-demographic.test.ts
//
// Setup (if Jest is not installed):
//   npm install --save-dev jest ts-jest @types/jest
//   npx ts-jest config:init
// ─────────────────────────────────────────────────────────────────────────────

import { layer1Demographic, addOrModify } from './layer1-demographic';
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

// ─── HELPER ───────────────────────────────────────────────────────────────────

const getById = (recs: Recommendation[], id: string) =>
  recs.find(r => r.id === id);

const ids = (recs: Recommendation[]) => recs.map(r => r.id);

// ─── TEST SUITE ───────────────────────────────────────────────────────────────

describe('layer1Demographic — no duplicate supplement IDs', () => {
  const profiles: Array<[string, Partial<QuizData>]> = [
    ['25yo male Ireland', { age: 25, biologicalSex: 'male', country: 'IE' }],
    ['55yo female UK', { age: 55, biologicalSex: 'female', country: 'GB' }],
    ['pregnant woman', { age: 28, biologicalSex: 'female', country: 'US', isPregnant: true }],
    ['65yo male Australia', { age: 65, biologicalSex: 'male', country: 'AU' }],
    ['breastfeeding Ireland', { age: 30, biologicalSex: 'female', country: 'IE', isBreastfeeding: true }],
    ['40yo male Saudi Arabia', { age: 40, biologicalSex: 'male', country: 'SA' }],
  ];

  test.each(profiles)('%s — no duplicate IDs', (_label, overrides) => {
    const recs = layer1Demographic(baseQuiz(overrides));
    const allIds = ids(recs);
    const unique = new Set(allIds);
    expect(allIds.length).toBe(unique.size);
  });
});

// ─── SCENARIO 1: 25-year-old male in Ireland ─────────────────────────────────

describe('25yo male, Ireland (IE, lat 53°N, iodineDeficient)', () => {
  const quiz = baseQuiz({ age: 25, biologicalSex: 'male', country: 'IE' });
  const recs = layer1Demographic(quiz);

  test('has at least 3 recommendations', () => {
    expect(recs.length).toBeGreaterThanOrEqual(3);
  });

  test('Vitamin D3 at 4,000 IU (lat ≥51°, no age boost needed)', () => {
    const d = getById(recs, 'vitamin-d3');
    expect(d).toBeDefined();
    expect(d!.dose).toBe(4000);
    expect(d!.doseUnit).toBe('IU');
    expect(d!.form).toBe('cholecalciferol');
  });

  test('Magnesium glycinate is included', () => {
    const mg = getById(recs, 'magnesium-glycinate');
    expect(mg).toBeDefined();
    expect(mg!.doseUnit).toBe('mg');
  });

  test('Omega-3 is included', () => {
    const o3 = getById(recs, 'omega-3-fish-oil');
    expect(o3).toBeDefined();
    expect(o3!.dose).toBe(1000);
  });

  test('Iodine 150 mcg included (IE is iodineDeficient)', () => {
    const iod = getById(recs, 'iodine');
    expect(iod).toBeDefined();
    expect(iod!.dose).toBe(150);
    expect(iod!.doseUnit).toBe('mcg');
  });

  test('No B12, folate, calcium (age <50, male, not pregnant)', () => {
    expect(getById(recs, 'vitamin-b12')).toBeUndefined();
    expect(getById(recs, 'folate-5mthf')).toBeUndefined();
    expect(getById(recs, 'calcium-citrate')).toBeUndefined();
  });

  test('No zinc/lycopene (age <40)', () => {
    expect(getById(recs, 'zinc-picolinate')).toBeUndefined();
    expect(getById(recs, 'lycopene')).toBeUndefined();
  });

  test('All recs have demographic in sources', () => {
    recs.forEach(r => {
      const hasDemographic = r.sources.some(s => s.layer === 'demographic');
      expect(hasDemographic).toBe(true);
    });
  });
});

// ─── SCENARIO 2: 55-year-old postmenopausal woman ────────────────────────────

describe('55yo postmenopausal female, UK (lat 54°N, iodineDeficient)', () => {
  const quiz = baseQuiz({
    age: 55,
    biologicalSex: 'female',
    country: 'GB',
    isPostmenopausal: true,
  });
  const recs = layer1Demographic(quiz);

  test('Vitamin B12 methylcobalamin 500 mcg (age 50–64)', () => {
    const b12 = getById(recs, 'vitamin-b12');
    expect(b12).toBeDefined();
    expect(b12!.dose).toBe(500);
    expect(b12!.form).toBe('methylcobalamin');
  });

  test('Calcium citrate 600 mg (postmenopausal)', () => {
    const ca = getById(recs, 'calcium-citrate');
    expect(ca).toBeDefined();
    expect(ca!.dose).toBe(600);
    expect(ca!.separateFrom).toContain('iron-bisglycinate');
    expect(ca!.separateFrom).toContain('zinc-picolinate');
  });

  test('Vitamin D3 ≥3,500 IU (lat 54° + age 50+ boost)', () => {
    const d = getById(recs, 'vitamin-d3');
    expect(d).toBeDefined();
    // lat 54° → 4000 base; age 50-59 adds 500 but capped at 4000
    expect(d!.dose).toBe(4000);
  });

  test('Folate NOT included (age >50)', () => {
    // Baseline folate only for women 18-50; B12 and folate at >50 is handled by labs/genetics layers
    expect(getById(recs, 'folate-5mthf')).toBeUndefined();
  });

  test('Iodine 150 mcg (GB is iodineDeficient, not pregnant)', () => {
    const iod = getById(recs, 'iodine');
    expect(iod).toBeDefined();
    expect(iod!.dose).toBe(150);
  });
});

// ─── SCENARIO 3: Pregnant woman ──────────────────────────────────────────────

describe('28yo pregnant female, US (lat 38°)', () => {
  const quiz = baseQuiz({
    age: 28,
    biologicalSex: 'female',
    country: 'US',
    isPregnant: true,
  });
  const recs = layer1Demographic(quiz);

  test('Folate 5-MTHF at 800 mcg (prenatal dose, not 400 mcg)', () => {
    const folate = getById(recs, 'folate-5mthf');
    expect(folate).toBeDefined();
    expect(folate!.dose).toBe(800);
    expect(folate!.priority).toBe(10);
  });

  test('Iron bisglycinate 27 mg', () => {
    const iron = getById(recs, 'iron-bisglycinate');
    expect(iron).toBeDefined();
    expect(iron!.dose).toBe(27);
    expect(iron!.priority).toBe(10);
  });

  test('DHA algae 200 mg', () => {
    const dha = getById(recs, 'dha-algae');
    expect(dha).toBeDefined();
    expect(dha!.dose).toBe(200);
  });

  test('Choline 450 mg', () => {
    const choline = getById(recs, 'choline');
    expect(choline).toBeDefined();
    expect(choline!.dose).toBe(450);
  });

  test('Iodine 220 mcg (prenatal dose — US is not iodineDeficient but pregnancy adds it)', () => {
    const iod = getById(recs, 'iodine');
    expect(iod).toBeDefined();
    expect(iod!.dose).toBe(220);
    expect(iod!.priority).toBe(10);
  });

  test('Vitamin D3 boosted to 4,000 IU', () => {
    const d = getById(recs, 'vitamin-d3');
    expect(d).toBeDefined();
    expect(d!.dose).toBe(4000);
  });

  test('No duplicate supplement IDs in full prenatal stack', () => {
    const allIds = ids(recs);
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  test('All prenatal supplements have priority 10', () => {
    const prenatalIds = ['folate-5mthf', 'iron-bisglycinate', 'dha-algae', 'choline', 'iodine'];
    prenatalIds.forEach(id => {
      const rec = getById(recs, id);
      expect(rec).toBeDefined();
      expect(rec!.priority).toBe(10);
    });
  });
});

// ─── SCENARIO 4: 65-year-old man ─────────────────────────────────────────────

describe('65yo male, Germany (DE, lat 51°N, iodineDeficient)', () => {
  const quiz = baseQuiz({ age: 65, biologicalSex: 'male', country: 'DE' });
  const recs = layer1Demographic(quiz);

  test('CoQ10 ubiquinol 100 mg (age 60–69)', () => {
    const coq10 = getById(recs, 'coq10-ubiquinol');
    expect(coq10).toBeDefined();
    expect(coq10!.dose).toBe(100);
    expect(coq10!.form).toBe('ubiquinol');
  });

  test('Vitamin B12 1,000 mcg (age ≥65)', () => {
    const b12 = getById(recs, 'vitamin-b12');
    expect(b12).toBeDefined();
    expect(b12!.dose).toBe(1000);
  });

  test('Magnesium 300 mg (age ≥60)', () => {
    const mg = getById(recs, 'magnesium-glycinate');
    expect(mg).toBeDefined();
    expect(mg!.dose).toBe(300);
  });

  test('Zinc + Lycopene present (male 40+)', () => {
    expect(getById(recs, 'zinc-picolinate')).toBeDefined();
    expect(getById(recs, 'lycopene')).toBeDefined();
  });

  test('Iodine 150 mcg (DE is iodineDeficient)', () => {
    const iod = getById(recs, 'iodine');
    expect(iod).toBeDefined();
    expect(iod!.dose).toBe(150);
  });
});

// ─── SCENARIO 5: Latitude dose gradient (Ireland vs Brazil) ──────────────────

describe('Vitamin D3 latitude dose tiers', () => {
  test('Ireland (lat 53°N) → 4,000 IU base; age 25 → still 4,000 IU', () => {
    const recs = layer1Demographic(baseQuiz({ age: 25, country: 'IE' }));
    expect(getById(recs, 'vitamin-d3')!.dose).toBe(4000);
  });

  test('Germany (lat 51°N) → 4,000 IU base', () => {
    const recs = layer1Demographic(baseQuiz({ age: 25, country: 'DE' }));
    expect(getById(recs, 'vitamin-d3')!.dose).toBe(4000);
  });

  test('France (lat 46°N) → 3,000 IU base', () => {
    const recs = layer1Demographic(baseQuiz({ age: 25, country: 'FR' }));
    expect(getById(recs, 'vitamin-d3')!.dose).toBe(3000);
  });

  test('Spain (lat 40°N) → 3,000 IU base', () => {
    const recs = layer1Demographic(baseQuiz({ age: 25, country: 'ES' }));
    expect(getById(recs, 'vitamin-d3')!.dose).toBe(3000);
  });

  test('Brazil (lat -10°S) → 1,000 IU base', () => {
    const recs = layer1Demographic(baseQuiz({ age: 25, country: 'BR' }));
    expect(getById(recs, 'vitamin-d3')!.dose).toBe(1000);
  });

  test('India (lat 20°N) → 1,000 IU base', () => {
    const recs = layer1Demographic(baseQuiz({ age: 25, country: 'IN' }));
    expect(getById(recs, 'vitamin-d3')!.dose).toBe(1000);
  });

  test('Gulf paradox — Saudi Arabia (lat 24°N) → 2,000 IU (indoor culture)', () => {
    const recs = layer1Demographic(baseQuiz({ age: 25, country: 'SA' }));
    expect(getById(recs, 'vitamin-d3')!.dose).toBe(2000);
  });

  test('Gulf paradox — UAE (lat 24°N) → 2,000 IU', () => {
    const recs = layer1Demographic(baseQuiz({ age: 25, country: 'AE' }));
    expect(getById(recs, 'vitamin-d3')!.dose).toBe(2000);
  });

  test('Age 60+ adds 1,000 IU bonus; Brazil 60yo → 2,000 IU (1000 + 1000)', () => {
    const recs = layer1Demographic(baseQuiz({ age: 60, country: 'BR' }));
    expect(getById(recs, 'vitamin-d3')!.dose).toBe(2000);
  });

  test('Age cap: Ireland 60yo → 4,000 IU (capped, cannot exceed)', () => {
    const recs = layer1Demographic(baseQuiz({ age: 60, country: 'IE' }));
    expect(getById(recs, 'vitamin-d3')!.dose).toBe(4000);
  });
});

// ─── SCENARIO 6: addOrModify duplicate prevention ────────────────────────────

describe('addOrModify — no duplicate IDs', () => {
  const makeMinRec = (id: string, dose: number, priority: number): Recommendation => ({
    id,
    supplementName: id,
    form: 'test',
    dose,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Moderate',
    reasons: [{ layer: 'demographic', reason: 'test' }],
    warnings: [],
    contraindications: [],
    cyclingPattern: { type: 'daily', activeDays: [true, true, true, true, true, true, true], description: 'Daily' },
    priority,
    category: 'vitamin',
    separateFrom: [],
    notes: [],
    sources: [{ layer: 'demographic', action: 'added' }],
  });

  test('adding the same ID twice keeps only one entry', () => {
    const r1 = makeMinRec('vitamin-d3', 1000, 5);
    const r2 = makeMinRec('vitamin-d3', 2000, 7);
    let recs: Recommendation[] = [];
    recs = addOrModify(recs, r1, 'demographic');
    recs = addOrModify(recs, r2, 'demographic');
    expect(recs.length).toBe(1);
    expect(recs[0].id).toBe('vitamin-d3');
  });

  test('higher dose wins on merge', () => {
    const r1 = makeMinRec('vitamin-d3', 1000, 5);
    const r2 = makeMinRec('vitamin-d3', 3000, 5);
    let recs: Recommendation[] = [];
    recs = addOrModify(recs, r1, 'demographic');
    recs = addOrModify(recs, r2, 'demographic');
    expect(recs[0].dose).toBe(3000);
  });

  test('higher priority wins on merge', () => {
    const r1 = makeMinRec('folate-5mthf', 400, 6);
    const r2 = makeMinRec('folate-5mthf', 800, 10);
    let recs: Recommendation[] = [];
    recs = addOrModify(recs, r1, 'demographic');
    recs = addOrModify(recs, r2, 'demographic');
    expect(recs[0].priority).toBe(10);
    expect(recs[0].dose).toBe(800);
  });

  test('different IDs coexist', () => {
    const r1 = makeMinRec('vitamin-d3', 2000, 7);
    const r2 = makeMinRec('magnesium-glycinate', 200, 6);
    let recs: Recommendation[] = [];
    recs = addOrModify(recs, r1, 'demographic');
    recs = addOrModify(recs, r2, 'demographic');
    expect(recs.length).toBe(2);
  });
});

// ─── SCENARIO 7: Breastfeeding stack ─────────────────────────────────────────

describe('30yo breastfeeding female, Ireland (IE)', () => {
  const quiz = baseQuiz({
    age: 30,
    biologicalSex: 'female',
    country: 'IE',
    isBreastfeeding: true,
  });
  const recs = layer1Demographic(quiz);

  test('DHA algae included', () => {
    expect(getById(recs, 'dha-algae')).toBeDefined();
  });

  test('Iodine 290 mcg (breastfeeding dose wins over iodine-deficient 150 mcg)', () => {
    const iod = getById(recs, 'iodine');
    expect(iod).toBeDefined();
    // 290 > 150, so addOrModify should keep 290 mcg
    expect(iod!.dose).toBe(290);
  });

  test('Vitamin D3 at 4,000 IU', () => {
    const d = getById(recs, 'vitamin-d3');
    expect(d!.dose).toBe(4000);
  });

  test('No duplicate IDs', () => {
    const allIds = ids(recs);
    expect(new Set(allIds).size).toBe(allIds.length);
  });
});

// ─── SCENARIO 8: Women folate eligibility boundaries ─────────────────────────

describe('Folate 5-MTHF eligibility (women 18–50, non-pregnant)', () => {
  test('17yo female — no folate (under 18)', () => {
    const recs = layer1Demographic(baseQuiz({ age: 17, biologicalSex: 'female' }));
    expect(getById(recs, 'folate-5mthf')).toBeUndefined();
  });

  test('18yo female — folate 400 mcg', () => {
    const recs = layer1Demographic(baseQuiz({ age: 18, biologicalSex: 'female' }));
    const f = getById(recs, 'folate-5mthf');
    expect(f).toBeDefined();
    expect(f!.dose).toBe(400);
  });

  test('50yo female — folate 400 mcg', () => {
    const recs = layer1Demographic(baseQuiz({ age: 50, biologicalSex: 'female' }));
    const f = getById(recs, 'folate-5mthf');
    expect(f).toBeDefined();
    expect(f!.dose).toBe(400);
  });

  test('51yo female — no baseline folate (>50)', () => {
    const recs = layer1Demographic(baseQuiz({ age: 51, biologicalSex: 'female' }));
    expect(getById(recs, 'folate-5mthf')).toBeUndefined();
  });

  test('35yo male — no folate', () => {
    const recs = layer1Demographic(baseQuiz({ age: 35, biologicalSex: 'male' }));
    expect(getById(recs, 'folate-5mthf')).toBeUndefined();
  });
});

// ─── SCENARIO 9: CoQ10 dose tiers ────────────────────────────────────────────

describe('CoQ10 dose tiers', () => {
  test('59yo — no CoQ10', () => {
    const recs = layer1Demographic(baseQuiz({ age: 59 }));
    expect(getById(recs, 'coq10-ubiquinol')).toBeUndefined();
  });

  test('60yo → 100 mg', () => {
    const recs = layer1Demographic(baseQuiz({ age: 60 }));
    expect(getById(recs, 'coq10-ubiquinol')!.dose).toBe(100);
  });

  test('70yo → 200 mg', () => {
    const recs = layer1Demographic(baseQuiz({ age: 70 }));
    expect(getById(recs, 'coq10-ubiquinol')!.dose).toBe(200);
  });
});
