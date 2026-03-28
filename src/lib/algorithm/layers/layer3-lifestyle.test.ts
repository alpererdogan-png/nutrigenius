// ─────────────────────────────────────────────────────────────────────────────
// Layer 3 — Lifestyle Unit Tests
//
// Run:  npx jest src/lib/algorithm/layers/layer3-lifestyle.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import { layer1Demographic } from './layer1-demographic';
import { layer2Dietary } from './layer2-dietary';
import { layer3Lifestyle } from './layer3-lifestyle';
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
  alcoholConsumption: 'none',
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

/** Run all three layers and return [quiz, recs]. quiz may be mutated by L3. */
function run(overrides: Partial<QuizData>): [QuizData, Recommendation[]] {
  const quiz = baseQuiz(overrides);
  const l1 = layer1Demographic(quiz);
  const l2 = layer2Dietary(quiz, l1);
  const l3 = layer3Lifestyle(quiz, l2);
  return [quiz, l3];
}

// ─── TEST 13 (prerequisite): No duplicate IDs across all profiles ─────────────

describe('No duplicate supplement IDs after Layer 3', () => {
  const profiles: Array<[string, Partial<QuizData>]> = [
    ['high stress 30yo male', { stressLevel: 'high' }],
    ['very-high stress + anxiety goal', { stressLevel: 'very-high', healthGoals: ['stress-anxiety'] }],
    ['poor sleep 30yo', { sleepQuality: 'poor' }],
    ['poor sleep + cognitive goal', { sleepQuality: 'poor', healthGoals: ['cognitive'] }],
    ['athlete male 30yo', { activityLevel: 'athlete', healthGoals: ['athletic-performance'] }],
    ['sedentary', { activityLevel: 'sedentary' }],
    ['minimal sun IE lat 53', { country: 'IE', sunExposure: 'minimal' }],
    ['high sun', { sunExposure: 'high' }],
    ['heavy alcohol', { alcoholConsumption: 'heavy' }],
    ['moderate alcohol', { alcoholConsumption: 'moderate' }],
    ['current smoker', { smokingStatus: 'current' }],
    ['former smoker', { smokingStatus: 'former' }],
    ['high stress + poor sleep', { stressLevel: 'high', sleepQuality: 'poor' }],
    ['athlete + poor sleep', { activityLevel: 'athlete', sleepQuality: 'poor' }],
    ['heavy alcohol + current smoker', { alcoholConsumption: 'heavy', smokingStatus: 'current' }],
    ['sedentary + high stress', { activityLevel: 'sedentary', stressLevel: 'high' }],
    ['vegan high stress athlete', { dietaryPattern: 'vegan', stressLevel: 'high', activityLevel: 'athlete' }],
  ];

  test.each(profiles)('%s — no duplicate IDs', (_label, overrides) => {
    const [, recs] = run(overrides);
    const allIds = ids(recs);
    const unique = new Set(allIds);
    expect(allIds.length).toBe(unique.size);
  });
});

// ─── TEST 1: High-stress user ─────────────────────────────────────────────────

describe('High-stress user — ashwagandha added, magnesium increased (not duplicated)', () => {
  // 30yo male US: L1 magnesium = 200 mg; L3 stress → 400 mg
  const [, recs] = run({ stressLevel: 'high' });

  test('exactly one magnesium-glycinate entry', () => {
    expect(recs.filter(r => r.id === 'magnesium-glycinate').length).toBe(1);
  });

  test('magnesium dose ≥ 400 mg after high-stress boost', () => {
    expect(getById(recs, 'magnesium-glycinate')!.dose).toBeGreaterThanOrEqual(400);
  });

  test('magnesium sources include modified-dose from lifestyle layer', () => {
    const mg = getById(recs, 'magnesium-glycinate')!;
    expect(mg.sources.some(s => s.layer === 'lifestyle' && s.action === 'modified-dose')).toBe(true);
  });

  test('magnesium reason references stress', () => {
    const mg = getById(recs, 'magnesium-glycinate')!;
    expect(mg.reasons.some(r => r.layer === 'lifestyle' && r.reason.toLowerCase().includes('stress'))).toBe(true);
  });

  test('ashwagandha-ksm66 is in protocol', () => {
    expect(getById(recs, 'ashwagandha-ksm66')).toBeDefined();
  });

  test('ashwagandha dose is 600 mg', () => {
    expect(getById(recs, 'ashwagandha-ksm66')!.dose).toBe(600);
  });

  test('ashwagandha cycling is 6on1off', () => {
    expect(getById(recs, 'ashwagandha-ksm66')!.cyclingPattern.type).toBe('6on1off');
  });

  test('ashwagandha added from lifestyle layer', () => {
    const ash = getById(recs, 'ashwagandha-ksm66')!;
    expect(ash.sources.some(s => s.layer === 'lifestyle' && s.action === 'added')).toBe(true);
  });
});

describe('Very-high stress — rhodiola also added', () => {
  const [, recs] = run({ stressLevel: 'very-high' });

  test('rhodiola-rosea is in protocol', () => {
    expect(getById(recs, 'rhodiola-rosea')).toBeDefined();
  });

  test('rhodiola cycling is 6on1off', () => {
    expect(getById(recs, 'rhodiola-rosea')!.cyclingPattern.type).toBe('6on1off');
  });

  test('rhodiola timing does NOT include bedtime (stimulating)', () => {
    const timings = getById(recs, 'rhodiola-rosea')!.timing;
    expect(timings).not.toContain('bedtime');
  });
});

describe('High-stress user — B-Complex added when no B vitamins present', () => {
  // 30yo male: no B12 (age < 50), no folate (male), no B-complex → L3 adds it
  const [, recs] = run({ stressLevel: 'high' });

  test('b-complex is added', () => {
    expect(getById(recs, 'b-complex')).toBeDefined();
  });
});

describe('High-stress user age 55 — B-Complex NOT added (B12 already from L1)', () => {
  const [, recs] = run({ age: 55, stressLevel: 'high' });

  test('b-complex is absent (vitamin-b12 already covers B vitamin need)', () => {
    expect(getById(recs, 'b-complex')).toBeUndefined();
  });
});

describe('Moderate stress — magnesium NOT boosted above current (if already 300+)', () => {
  // 30yo male: L1 gives 200 mg → L3 moderate stress bumps to 300 mg, not 400
  const [, recs] = run({ stressLevel: 'moderate' });

  test('magnesium dose does not exceed 300 mg for moderate stress', () => {
    expect(getById(recs, 'magnesium-glycinate')!.dose).toBeLessThanOrEqual(300);
  });

  test('ashwagandha NOT added for moderate stress alone', () => {
    expect(getById(recs, 'ashwagandha-ksm66')).toBeUndefined();
  });
});

// ─── TEST 2: Poor-sleep magnesium form ───────────────────────────────────────

describe('Poor-sleep user — magnesium stays glycinate, bedtime timing ensured', () => {
  const [, recs] = run({ sleepQuality: 'poor' });

  test('exactly one magnesium-glycinate entry', () => {
    expect(recs.filter(r => r.id === 'magnesium-glycinate').length).toBe(1);
  });

  test('magnesium form is glycinate', () => {
    expect(getById(recs, 'magnesium-glycinate')!.form).toBe('glycinate');
  });

  test('magnesium timing includes bedtime', () => {
    expect(getById(recs, 'magnesium-glycinate')!.timing).toContain('bedtime');
  });
});

describe('Fair sleep — glycinate ensured, melatonin NOT added', () => {
  const [, recs] = run({ sleepQuality: 'fair' });

  test('magnesium form is glycinate', () => {
    expect(getById(recs, 'magnesium-glycinate')!.form).toBe('glycinate');
  });

  test('melatonin NOT added for fair sleep', () => {
    expect(getById(recs, 'melatonin')).toBeUndefined();
  });

  test('magnesium notes include sleep-schedule advice', () => {
    const mg = getById(recs, 'magnesium-glycinate')!;
    const note = mg.notes.find(n => n.toLowerCase().includes('sleep'));
    expect(note).toBeDefined();
  });
});

// ─── TEST 3: Poor-sleep melatonin at LOW dose ────────────────────────────────

describe('Poor-sleep user — melatonin at low dose (0.5–1 mg)', () => {
  const [, recs] = run({ sleepQuality: 'poor' });

  test('melatonin is in protocol', () => {
    expect(getById(recs, 'melatonin')).toBeDefined();
  });

  test('melatonin dose is ≤ 1 mg (NOT the common 5–10 mg)', () => {
    expect(getById(recs, 'melatonin')!.dose).toBeLessThanOrEqual(1);
  });

  test('melatonin dose is > 0', () => {
    expect(getById(recs, 'melatonin')!.dose).toBeGreaterThan(0);
  });

  test('melatonin timing includes bedtime', () => {
    expect(getById(recs, 'melatonin')!.timing).toContain('bedtime');
  });

  test('melatonin notes warn about high-dose grogginess', () => {
    const m = getById(recs, 'melatonin')!;
    const note = m.notes.find(n => n.toLowerCase().includes('grog') || n.toLowerCase().includes('high dose'));
    expect(note).toBeDefined();
  });
});

describe('Poor-sleep user — glycine added at 3 g', () => {
  const [, recs] = run({ sleepQuality: 'poor' });

  test('glycine is in protocol', () => {
    expect(getById(recs, 'glycine')).toBeDefined();
  });

  test('glycine dose is 3 g', () => {
    expect(getById(recs, 'glycine')!.dose).toBe(3);
  });

  test('glycine doseUnit is g', () => {
    expect(getById(recs, 'glycine')!.doseUnit).toBe('g');
  });
});

// ─── TEST 4: Athlete ──────────────────────────────────────────────────────────

describe('Athlete — creatine, CoQ10, higher magnesium, higher omega-3', () => {
  const [, recs] = run({ activityLevel: 'athlete' });

  test('creatine-monohydrate is in protocol', () => {
    expect(getById(recs, 'creatine-monohydrate')).toBeDefined();
  });

  test('creatine dose is 5 g', () => {
    expect(getById(recs, 'creatine-monohydrate')!.dose).toBe(5);
  });

  test('creatine evidence is Strong', () => {
    expect(getById(recs, 'creatine-monohydrate')!.evidenceRating).toBe('Strong');
  });

  test('exactly one magnesium-glycinate entry at ≥ 400 mg', () => {
    expect(recs.filter(r => r.id === 'magnesium-glycinate').length).toBe(1);
    expect(getById(recs, 'magnesium-glycinate')!.dose).toBeGreaterThanOrEqual(400);
  });

  test('coq10-ubiquinol is in protocol at ≥ 200 mg', () => {
    const coq = getById(recs, 'coq10-ubiquinol');
    expect(coq).toBeDefined();
    expect(coq!.dose).toBeGreaterThanOrEqual(200);
  });

  test('omega-3 dose increased to 2,000 mg', () => {
    expect(getById(recs, 'omega-3-fish-oil')!.dose).toBe(2000);
  });

  test('omega-3 modified-dose source from lifestyle layer', () => {
    const omega3 = getById(recs, 'omega-3-fish-oil')!;
    expect(omega3.sources.some(s => s.layer === 'lifestyle' && s.action === 'modified-dose')).toBe(true);
  });

  test('exactly one omega-3 entry', () => {
    expect(recs.filter(r => r.id === 'omega-3-fish-oil').length).toBe(1);
  });
});

describe('Athlete with athletic-performance goal — beta-alanine and l-citrulline added', () => {
  const [, recs] = run({ activityLevel: 'athlete', healthGoals: ['athletic-performance'] });

  test('beta-alanine is in protocol', () => {
    expect(getById(recs, 'beta-alanine')).toBeDefined();
  });

  test('beta-alanine dose is 3,200 mg', () => {
    expect(getById(recs, 'beta-alanine')!.dose).toBe(3200);
  });

  test('l-citrulline is in protocol', () => {
    expect(getById(recs, 'l-citrulline')).toBeDefined();
  });
});

describe('Athlete without athletic-performance goal — beta-alanine NOT added', () => {
  const [, recs] = run({ activityLevel: 'athlete', healthGoals: [] });

  test('beta-alanine absent when goal not selected', () => {
    expect(getById(recs, 'beta-alanine')).toBeUndefined();
  });
});

// ─── TEST 5: Heavy alcohol ────────────────────────────────────────────────────

describe('Heavy drinker — thiamine at priority 9, NAC, milk thistle', () => {
  const [, recs] = run({ alcoholConsumption: 'heavy' });

  test('thiamine-b1 is in protocol', () => {
    expect(getById(recs, 'thiamine-b1')).toBeDefined();
  });

  test('thiamine priority is 9 (critical)', () => {
    expect(getById(recs, 'thiamine-b1')!.priority).toBe(9);
  });

  test('thiamine dose is 100 mg', () => {
    expect(getById(recs, 'thiamine-b1')!.dose).toBe(100);
  });

  test('thiamine warnings mention Wernicke\'s encephalopathy', () => {
    const t = getById(recs, 'thiamine-b1')!;
    expect(t.warnings.some(w => w.toLowerCase().includes('wernicke'))).toBe(true);
  });

  test('nac is in protocol', () => {
    expect(getById(recs, 'nac')).toBeDefined();
  });

  test('nac dose is 1,200 mg for heavy alcohol', () => {
    expect(getById(recs, 'nac')!.dose).toBe(1200);
  });

  test('nac cycling is weekdays', () => {
    expect(getById(recs, 'nac')!.cyclingPattern.type).toBe('weekdays-only');
  });

  test('milk-thistle is in protocol', () => {
    expect(getById(recs, 'milk-thistle')).toBeDefined();
  });

  test('milk-thistle dose is 300 mg for heavy alcohol', () => {
    expect(getById(recs, 'milk-thistle')!.dose).toBe(300);
  });
});

// ─── TEST 6: Current smoker ───────────────────────────────────────────────────

describe('Current smoker — vitamin C boost + smokerFlag set to true', () => {
  const [quiz, recs] = run({ smokingStatus: 'current' });

  test('vitamin-c is in protocol', () => {
    expect(getById(recs, 'vitamin-c')).toBeDefined();
  });

  test('vitamin-c dose is ≥ 500 mg', () => {
    expect(getById(recs, 'vitamin-c')!.dose).toBeGreaterThanOrEqual(500);
  });

  test('smokerFlag is set to true on quiz object', () => {
    expect(quiz.smokerFlag).toBe(true);
  });

  test('vitamin-c reason references smoker depletion', () => {
    const vc = getById(recs, 'vitamin-c')!;
    expect(vc.reasons.some(r =>
      r.layer === 'lifestyle' && r.reason.toLowerCase().includes('smok'),
    )).toBe(true);
  });

  test('nac is added for glutathione support', () => {
    expect(getById(recs, 'nac')).toBeDefined();
  });

  test('coq10-ubiquinol is added for oxidative stress', () => {
    expect(getById(recs, 'coq10-ubiquinol')).toBeDefined();
  });
});

describe('Smoker who also has low vegetable intake (vitamin C from L2 boosted by L3)', () => {
  const [, recs] = run({ smokingStatus: 'current', vegetableIntake: 'low' });

  test('exactly one vitamin-c entry', () => {
    expect(recs.filter(r => r.id === 'vitamin-c').length).toBe(1);
  });

  test('vitamin-c dose is 1,000 mg (500 from L2 + 500 from L3)', () => {
    expect(getById(recs, 'vitamin-c')!.dose).toBe(1000);
  });
});

// ─── TEST 7: Current smoker + beta-carotene (smokerFlag blocks it downstream) ─

describe('Current smoker — smokerFlag prevents beta-carotene downstream', () => {
  const [quiz] = run({ smokingStatus: 'current' });

  test('smokerFlag is true so downstream layers can block beta-carotene', () => {
    expect(quiz.smokerFlag).toBe(true);
  });
});

describe('Former smoker — smokerFlag conservatively set to true', () => {
  const [quiz] = run({ smokingStatus: 'former' });

  test('smokerFlag is set to true for former smoker (conservative)', () => {
    expect(quiz.smokerFlag).toBe(true);
  });
});

// ─── TEST 8: High stress + poor sleep = L-Theanine added ONCE ────────────────

describe('High stress + poor sleep — L-Theanine added exactly once', () => {
  // Stress logic adds L-theanine; sleep logic finds it and addReasons only
  const [, recs] = run({ stressLevel: 'high', sleepQuality: 'poor' });

  test('exactly one l-theanine entry', () => {
    expect(recs.filter(r => r.id === 'l-theanine').length).toBe(1);
  });

  test('l-theanine has reasons from both stress and sleep contexts', () => {
    const lt = getById(recs, 'l-theanine')!;
    const reasons = lt.reasons.filter(r => r.layer === 'lifestyle');
    // Stress adds it (added-source), sleep adds a reason
    expect(reasons.length).toBeGreaterThanOrEqual(2);
  });

  test('ashwagandha is present (morning)', () => {
    const ash = getById(recs, 'ashwagandha-ksm66')!;
    expect(ash).toBeDefined();
    expect(ash.timing).toContain('morning-with-food');
  });

  test('l-theanine is at bedtime', () => {
    expect(getById(recs, 'l-theanine')!.timing).toContain('bedtime');
  });

  test('combination note added to l-theanine', () => {
    const lt = getById(recs, 'l-theanine')!;
    const note = lt.notes.find(n => n.toLowerCase().includes('ashwagandha') ||
      n.toLowerCase().includes('morning') || n.toLowerCase().includes('wind-down'));
    expect(note).toBeDefined();
  });

  test('passionflower added for high-stress + poor-sleep combination', () => {
    expect(getById(recs, 'passionflower')).toBeDefined();
  });
});

// ─── TEST 9: Athlete + poor sleep = ONE magnesium at high dose, glycinate ─────

describe('Athlete + poor sleep — single magnesium entry, high dose, glycinate form', () => {
  const [, recs] = run({ activityLevel: 'athlete', sleepQuality: 'poor' });

  test('exactly one magnesium-glycinate entry', () => {
    expect(recs.filter(r => r.id === 'magnesium-glycinate').length).toBe(1);
  });

  test('magnesium dose ≥ 400 mg (athlete + sleep combined need)', () => {
    expect(getById(recs, 'magnesium-glycinate')!.dose).toBeGreaterThanOrEqual(400);
  });

  test('magnesium form is glycinate', () => {
    expect(getById(recs, 'magnesium-glycinate')!.form).toBe('glycinate');
  });

  test('magnesium timing includes bedtime', () => {
    expect(getById(recs, 'magnesium-glycinate')!.timing).toContain('bedtime');
  });

  test('combination note about double-duty glycinate present', () => {
    const mg = getById(recs, 'magnesium-glycinate')!;
    const note = mg.notes.find(n =>
      n.toLowerCase().includes('sleep') && n.toLowerCase().includes('exercise'),
    );
    expect(note).toBeDefined();
  });
});

// ─── TEST 10: Heavy alcohol + smoker = ONE NAC at 1,200 mg, both reasons ──────

describe('Heavy alcohol + current smoker — single NAC entry at 1,200 mg with both reasons', () => {
  // Smoking runs first: adds NAC at 600 mg
  // Alcohol runs after: finds NAC, increases to 1,200 mg and adds reason
  const [, recs] = run({ alcoholConsumption: 'heavy', smokingStatus: 'current' });

  test('exactly one nac entry', () => {
    expect(recs.filter(r => r.id === 'nac').length).toBe(1);
  });

  test('nac dose is 1,200 mg (higher dose from alcohol takes precedence)', () => {
    expect(getById(recs, 'nac')!.dose).toBe(1200);
  });

  test('nac has a lifestyle reason mentioning smoking/glutathione', () => {
    const nac = getById(recs, 'nac')!;
    expect(nac.reasons.some(r =>
      r.layer === 'lifestyle' && (r.reason.toLowerCase().includes('smok') || r.reason.toLowerCase().includes('glutathione')),
    )).toBe(true);
  });

  test('nac has a lifestyle reason mentioning alcohol/liver', () => {
    const nac = getById(recs, 'nac')!;
    expect(nac.reasons.some(r =>
      r.layer === 'lifestyle' && (r.reason.toLowerCase().includes('alcohol') || r.reason.toLowerCase().includes('liver')),
    )).toBe(true);
  });
});

// ─── TEST 11: Sedentary user ──────────────────────────────────────────────────

describe('Sedentary user — CoQ10 added, health note about exercise', () => {
  const [, recs] = run({ activityLevel: 'sedentary' });

  test('coq10-ubiquinol is in protocol', () => {
    expect(getById(recs, 'coq10-ubiquinol')).toBeDefined();
  });

  test('coq10 dose is 100 mg for sedentary user', () => {
    expect(getById(recs, 'coq10-ubiquinol')!.dose).toBe(100);
  });

  test('exercise health note is added to vitamin-d3', () => {
    const d3 = getById(recs, 'vitamin-d3')!;
    const note = d3.notes.find(n =>
      n.toLowerCase().includes('exercise') || n.toLowerCase().includes('walking'),
    );
    expect(note).toBeDefined();
  });

  test('creatine NOT added for sedentary user', () => {
    expect(getById(recs, 'creatine-monohydrate')).toBeUndefined();
  });
});

describe('Sedentary + high stress — both CoQ10 and ashwagandha present', () => {
  const [, recs] = run({ activityLevel: 'sedentary', stressLevel: 'high' });

  test('coq10-ubiquinol is present', () => {
    expect(getById(recs, 'coq10-ubiquinol')).toBeDefined();
  });

  test('ashwagandha-ksm66 is present', () => {
    expect(getById(recs, 'ashwagandha-ksm66')).toBeDefined();
  });
});

// ─── TEST 12: Cycling patterns ────────────────────────────────────────────────

describe('Cycling pattern assignments', () => {
  test('ashwagandha: 6on1off cycling', () => {
    const [, recs] = run({ stressLevel: 'high' });
    expect(getById(recs, 'ashwagandha-ksm66')!.cyclingPattern.type).toBe('6on1off');
  });

  test('rhodiola: 6on1off cycling', () => {
    const [, recs] = run({ stressLevel: 'very-high' });
    expect(getById(recs, 'rhodiola-rosea')!.cyclingPattern.type).toBe('6on1off');
  });

  test('nac (heavy alcohol): weekdays-only cycling', () => {
    const [, recs] = run({ alcoholConsumption: 'heavy' });
    expect(getById(recs, 'nac')!.cyclingPattern.type).toBe('weekdays-only');
  });

  test('nac (smoker): weekdays-only cycling', () => {
    const [, recs] = run({ smokingStatus: 'current' });
    expect(getById(recs, 'nac')!.cyclingPattern.type).toBe('weekdays-only');
  });

  test('melatonin: daily cycling', () => {
    const [, recs] = run({ sleepQuality: 'poor' });
    expect(getById(recs, 'melatonin')!.cyclingPattern.type).toBe('daily');
  });

  test('ashwagandha activeDays: Mon–Sat (Sun off)', () => {
    const [, recs] = run({ stressLevel: 'high' });
    const days = getById(recs, 'ashwagandha-ksm66')!.cyclingPattern.activeDays;
    expect(days[5]).toBe(true);  // Sat on
    expect(days[6]).toBe(false); // Sun off
  });
});

// ─── ADDITIONAL SCENARIO TESTS ────────────────────────────────────────────────

describe('Sun exposure: minimal at high latitude (>40°) — Vitamin D boosted', () => {
  // L1 caps Vitamin D at 4,000 IU. L3's age-70+ target is 5,000 IU.
  // IT (lat 43 > 40): L1 = 4,000 IU for age 75 → L3 boosts to 5,000 IU.
  const [, recsElderly] = run({ country: 'IT', age: 75, sunExposure: 'minimal' });
  const [, recsUS] = run({ country: 'US', sunExposure: 'minimal', age: 30 });

  test('IT age 75 (lat 43°, minimal sun): Vitamin D boosted to 5,000 IU by L3', () => {
    expect(getById(recsElderly, 'vitamin-d3')!.dose).toBe(5000);
  });

  test('IT age 75: vitamin-d3 sources include modified-dose from lifestyle layer', () => {
    const d3 = getById(recsElderly, 'vitamin-d3')!;
    expect(d3.sources.some(s => s.layer === 'lifestyle' && s.action === 'modified-dose')).toBe(true);
  });

  test('US (lat 38°, not > 40): Vitamin D NOT boosted by sun-exposure logic', () => {
    const d3US = getById(recsUS, 'vitamin-d3')!;
    const lifestyleModSource = d3US.sources.find(s => s.layer === 'lifestyle' && s.action === 'modified-dose');
    expect(lifestyleModSource).toBeUndefined();
  });
});

describe('Sun exposure: high — astaxanthin added, vitamin-d3 note added', () => {
  const [, recs] = run({ sunExposure: 'high' });

  test('astaxanthin is in protocol', () => {
    expect(getById(recs, 'astaxanthin')).toBeDefined();
  });

  test('astaxanthin dose is 4–8 mg', () => {
    const dose = getById(recs, 'astaxanthin')!.dose;
    expect(dose).toBeGreaterThanOrEqual(4);
    expect(dose).toBeLessThanOrEqual(8);
  });

  test('vitamin-d3 note recommends testing levels', () => {
    const d3 = getById(recs, 'vitamin-d3')!;
    const note = d3.notes.find(n => n.toLowerCase().includes('test'));
    expect(note).toBeDefined();
  });
});

describe('Poor sleep + cognitive goal — Magnesium L-Threonate added (separate from glycinate)', () => {
  const [, recs] = run({ sleepQuality: 'poor', healthGoals: ['cognitive'] });

  test('mag-l-threonate is in protocol', () => {
    expect(getById(recs, 'mag-l-threonate')).toBeDefined();
  });

  test('both magnesium-glycinate and mag-l-threonate present (different IDs)', () => {
    expect(getById(recs, 'magnesium-glycinate')).toBeDefined();
    expect(getById(recs, 'mag-l-threonate')).toBeDefined();
  });

  test('exactly one of each magnesium entry', () => {
    expect(recs.filter(r => r.id === 'magnesium-glycinate').length).toBe(1);
    expect(recs.filter(r => r.id === 'mag-l-threonate').length).toBe(1);
  });
});

describe('Heavy alcohol — magnesium dose increases by 100 mg from previous value', () => {
  const quiz = baseQuiz({ alcoholConsumption: 'heavy' });
  const l1 = layer1Demographic(quiz);
  const l2 = layer2Dietary(quiz, l1);
  const preMg = l2.find(r => r.id === 'magnesium-glycinate')!.dose;
  const l3 = layer3Lifestyle(quiz, l2);
  const postMg = l3.find(r => r.id === 'magnesium-glycinate')!.dose;

  test('magnesium increased by 100 mg for heavy alcohol', () => {
    expect(postMg).toBe(preMg + 100);
  });
});

describe('Athlete who is age 60+ — CoQ10 from L1 (100 mg) is boosted to 200 mg', () => {
  const [, recs] = run({ age: 65, activityLevel: 'athlete' });

  test('coq10-ubiquinol dose is 200 mg (athlete boost)', () => {
    expect(getById(recs, 'coq10-ubiquinol')!.dose).toBe(200);
  });

  test('exactly one coq10-ubiquinol entry', () => {
    expect(recs.filter(r => r.id === 'coq10-ubiquinol').length).toBe(1);
  });
});

describe('Tart cherry: NOT added when melatonin is already present', () => {
  const [, recs] = run({ sleepQuality: 'poor' });

  test('melatonin is present', () => {
    expect(getById(recs, 'melatonin')).toBeDefined();
  });

  test('tart-cherry-extract is absent (melatonin already in protocol)', () => {
    expect(getById(recs, 'tart-cherry-extract')).toBeUndefined();
  });
});
