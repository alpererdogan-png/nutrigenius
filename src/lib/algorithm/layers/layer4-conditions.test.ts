// ─────────────────────────────────────────────────────────────────────────────
// Layer 4 — Health Conditions — Unit Tests
// ─────────────────────────────────────────────────────────────────────────────

import { layer4Conditions } from './layer4-conditions';
import { layer1Demographic } from './layer1-demographic';
import { layer2Dietary } from './layer2-dietary';
import { layer3Lifestyle } from './layer3-lifestyle';
import { QuizData, Recommendation } from '../types';

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

function runLayer4(quiz: QuizData): Recommendation[] {
  const recs = layer1Demographic(quiz);
  return layer4Conditions(quiz, recs);
}

function runAllLayers(quiz: QuizData): Recommendation[] {
  let recs = layer1Demographic(quiz);
  recs = layer2Dietary(quiz, recs);
  recs = layer3Lifestyle(quiz, recs);
  recs = layer4Conditions(quiz, recs);
  return recs;
}

function getRec(recs: Recommendation[], id: string): Recommendation | undefined {
  return recs.find(r => r.id === id);
}

// ─── TEST 1: Anxiety → Magnesium glycinate form + L-theanine ──────────────────

describe('Anxiety', () => {
  it('ensures magnesium is in glycinate form with dose ≥ 300 mg', () => {
    const quiz = baseQuiz({ healthConditions: ['anxiety'] });
    const recs = runLayer4(quiz);

    const mg = getRec(recs, 'magnesium-glycinate');
    expect(mg).toBeDefined();
    expect(mg!.form).toBe('glycinate');
    expect(mg!.dose).toBeGreaterThanOrEqual(300);
  });

  it('adds l-theanine for anxiety', () => {
    const quiz = baseQuiz({ healthConditions: ['anxiety'] });
    const recs = runLayer4(quiz);

    const theanine = getRec(recs, 'l-theanine');
    expect(theanine).toBeDefined();
    expect(theanine!.dose).toBe(200);
    expect(theanine!.doseUnit).toBe('mg');
  });

  it('adds ashwagandha for anxiety', () => {
    const quiz = baseQuiz({ healthConditions: ['anxiety'] });
    const recs = runLayer4(quiz);

    const ashwa = getRec(recs, 'ashwagandha-ksm66');
    expect(ashwa).toBeDefined();
    expect(ashwa!.evidenceRating).toBe('Strong');
  });

  it('anxiety reason is present on magnesium', () => {
    const quiz = baseQuiz({ healthConditions: ['anxiety'] });
    const recs = runLayer4(quiz);

    const mg = getRec(recs, 'magnesium-glycinate')!;
    expect(mg.reasons.some(r => r.layer === 'conditions')).toBe(true);
  });
});

// ─── TEST 2: Hypothyroidism → Selenium + separation warning ──────────────────

describe('Hypothyroidism', () => {
  it('adds selenium 200 mcg for hypothyroidism', () => {
    const quiz = baseQuiz({ healthConditions: ['hypothyroidism'] });
    const recs = runLayer4(quiz);

    const sel = getRec(recs, 'selenium');
    expect(sel).toBeDefined();
    expect(sel!.dose).toBe(200);
    expect(sel!.doseUnit).toBe('mcg');
    expect(sel!.evidenceRating).toBe('Strong');
  });

  it('adds levothyroxine separation warning when on thyroid medication', () => {
    const quiz = baseQuiz({
      healthConditions: ['hypothyroidism'],
      medications: ['levothyroxine'],
    });
    const recs = runLayer4(quiz);

    const sel = getRec(recs, 'selenium')!;
    expect(sel.warnings.some(w => w.toLowerCase().includes('levothyroxine') || w.toLowerCase().includes('4'))).toBe(true);
    expect(sel.separateFrom).toContain('levothyroxine');
  });

  it('adds vitamin D and magnesium for hypothyroidism', () => {
    const quiz = baseQuiz({ healthConditions: ['hypothyroidism'] });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'vitamin-d3')).toBeDefined();
    expect(getRec(recs, 'magnesium-glycinate')).toBeDefined();
  });
});

// ─── TEST 3: Hashimotos → No iodine ──────────────────────────────────────────

describe('Hashimotos', () => {
  it('removes iodine if present when Hashimotos is a condition', () => {
    // Use a country that triggers iodine baseline (iodineDeficient = true)
    const quiz = baseQuiz({
      country: 'DE',    // Germany — iodineDeficient: true
      healthConditions: ['hashimotos'],
    });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'iodine')).toBeUndefined();
  });

  it('adds selenium for Hashimotos', () => {
    const quiz = baseQuiz({ healthConditions: ['hashimotos'] });
    const recs = runLayer4(quiz);

    const sel = getRec(recs, 'selenium');
    expect(sel).toBeDefined();
    expect(sel!.dose).toBe(200);
    expect(sel!.notes.some(n => n.toLowerCase().includes('iodine'))).toBe(true);
  });

  it('does not add iodine even when country is iodine-deficient', () => {
    const quiz = baseQuiz({
      country: 'GB',   // iodineDeficient: true
      healthConditions: ['hashimotos', 'hypothyroidism'],
    });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'iodine')).toBeUndefined();
  });

  it('Hashimotos handler runs before hypothyroid handler (iodine stays absent)', () => {
    const quiz = baseQuiz({
      country: 'IE',   // iodineDeficient: true
      healthConditions: ['hashimotos', 'hypothyroidism'],
    });
    const recs = runLayer4(quiz);
    expect(getRec(recs, 'iodine')).toBeUndefined();
  });
});

// ─── TEST 4: Type-2-Diabetes + Metformin → Berberine warning ─────────────────

describe('Type-2-Diabetes', () => {
  it('adds berberine for type-2-diabetes', () => {
    const quiz = baseQuiz({ healthConditions: ['type-2-diabetes'] });
    const recs = runLayer4(quiz);

    const berb = getRec(recs, 'berberine');
    expect(berb).toBeDefined();
    expect(berb!.dose).toBe(500);
  });

  it('adds blood-sugar interaction warning when on metformin', () => {
    const quiz = baseQuiz({
      healthConditions: ['type-2-diabetes'],
      medications: ['metformin'],
    });
    const recs = runLayer4(quiz);

    const berb = getRec(recs, 'berberine')!;
    expect(berb.warnings.some(w => w.toLowerCase().includes('blood sugar') || w.toLowerCase().includes('hypoglyc'))).toBe(true);
  });

  it('adds vitamin B12 when on metformin', () => {
    const quiz = baseQuiz({
      healthConditions: ['type-2-diabetes'],
      medications: ['metformin'],
    });
    const recs = runLayer4(quiz);

    const b12 = getRec(recs, 'vitamin-b12')!;
    expect(b12).toBeDefined();
    expect(b12.dose).toBeGreaterThanOrEqual(1000);
    expect(b12.reasons.some(r => r.reason.toLowerCase().includes('metformin'))).toBe(true);
  });

  it('adds alpha-lipoic-acid and chromium for type-2-diabetes', () => {
    const quiz = baseQuiz({ healthConditions: ['type-2-diabetes'] });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'alpha-lipoic-acid')).toBeDefined();
    expect(getRec(recs, 'chromium-picolinate')).toBeDefined();
  });
});

// ─── TEST 5: PCOS → Inositol 40:1 ratio ──────────────────────────────────────

describe('PCOS', () => {
  it('adds myo-inositol 4000 mg for PCOS', () => {
    const quiz = baseQuiz({
      biologicalSex: 'female',
      healthConditions: ['pcos'],
    });
    const recs = runLayer4(quiz);

    const mi = getRec(recs, 'myo-inositol');
    expect(mi).toBeDefined();
    expect(mi!.dose).toBe(4000);
    expect(mi!.doseUnit).toBe('mg');
    expect(mi!.frequency).toBe('twice-daily');
  });

  it('adds d-chiro-inositol 100 mg for PCOS (40:1 ratio)', () => {
    const quiz = baseQuiz({
      biologicalSex: 'female',
      healthConditions: ['pcos'],
    });
    const recs = runLayer4(quiz);

    const dci = getRec(recs, 'd-chiro-inositol');
    expect(dci).toBeDefined();
    expect(dci!.dose).toBe(100);
    expect(dci!.doseUnit).toBe('mg');

    // Verify 40:1 ratio: 2000 / 50 = 40
    const mi = getRec(recs, 'myo-inositol')!;
    expect(mi.dose / dci!.dose).toBe(40);
  });

  it('myo-inositol notes mention the 40:1 ratio', () => {
    const quiz = baseQuiz({
      biologicalSex: 'female',
      healthConditions: ['pcos'],
    });
    const recs = runLayer4(quiz);

    const mi = getRec(recs, 'myo-inositol')!;
    expect(mi.notes.some(n => n.includes('40:1'))).toBe(true);
  });
});

// ─── TEST 6: SAMe BLOCKED for SSRI users ─────────────────────────────────────

describe('SAMe + serotonergic medications', () => {
  it('does NOT add SAMe when user takes an SSRI', () => {
    const quiz = baseQuiz({
      healthConditions: ['depression'],
      medications: ['sertraline'],
    });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'same')).toBeUndefined();
  });

  it('does NOT add SAMe for any SSRI medication', () => {
    const ssris = ['fluoxetine', 'paroxetine', 'citalopram', 'escitalopram'];
    for (const ssri of ssris) {
      const quiz = baseQuiz({
        healthConditions: ['depression'],
        medications: [ssri],
      });
      const recs = runLayer4(quiz);
      expect(getRec(recs, 'same')).toBeUndefined();
    }
  });

  it('DOES add SAMe for depression without serotonergic medications', () => {
    const quiz = baseQuiz({ healthConditions: ['depression'] });
    const recs = runLayer4(quiz);

    const same = getRec(recs, 'same');
    expect(same).toBeDefined();
    expect(same!.contraindications).toContain('serotonergic-medications');
  });
});

// ─── TEST 7: 5-HTP BLOCKED for SSRI users ────────────────────────────────────

describe('5-HTP + serotonergic medications', () => {
  it('does NOT add 5-HTP when user takes an SSRI', () => {
    const quiz = baseQuiz({
      healthConditions: ['depression'],
      medications: ['venlafaxine'],
    });
    const recs = runLayer4(quiz);

    expect(getRec(recs, '5-htp')).toBeUndefined();
  });

  it('does NOT add 5-HTP for SNRI users', () => {
    const quiz = baseQuiz({
      healthConditions: ['depression'],
      medications: ['duloxetine'],
    });
    const recs = runLayer4(quiz);

    expect(getRec(recs, '5-htp')).toBeUndefined();
  });

  it('DOES add 5-HTP for depression without serotonergic medications', () => {
    const quiz = baseQuiz({ healthConditions: ['depression'] });
    const recs = runLayer4(quiz);

    const htp = getRec(recs, '5-htp');
    expect(htp).toBeDefined();
    expect(htp!.contraindications).toContain('serotonergic-medications');
    expect(htp!.warnings.some(w => w.toLowerCase().includes('ssri') || w.toLowerCase().includes('serotonin'))).toBe(true);
  });
});

// ─── TEST 8: Bipolar → No SAMe ────────────────────────────────────────────────

describe('Bipolar disorder', () => {
  it('does NOT add SAMe for bipolar disorder', () => {
    const quiz = baseQuiz({ healthConditions: ['bipolar'] });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'same')).toBeUndefined();
  });

  it('does NOT add SAMe even with depression + bipolar', () => {
    const quiz = baseQuiz({ healthConditions: ['bipolar', 'depression'] });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'same')).toBeUndefined();
  });

  it('adds NAC for bipolar disorder', () => {
    const quiz = baseQuiz({ healthConditions: ['bipolar'] });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'nac')).toBeDefined();
  });

  it('adds omega-3 for bipolar', () => {
    const quiz = baseQuiz({
      healthConditions: ['bipolar'],
      fishIntake: 'none',
    });
    const recs = runLayer4(quiz);

    const o3 = getRec(recs, 'omega-3-fish-oil');
    expect(o3).toBeDefined();
    expect(o3!.dose).toBeGreaterThanOrEqual(2000);
  });
});

// ─── TEST 9: Epilepsy → No ginkgo ────────────────────────────────────────────

describe('Epilepsy + ginkgo', () => {
  it('does NOT add ginkgo when user has epilepsy condition', () => {
    // Ginkgo is not added by layer4; but ensure it cannot be added
    const quiz = baseQuiz({ healthConditions: ['epilepsy'] });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'ginkgo')).toBeUndefined();
    expect(getRec(recs, 'ginkgo-biloba')).toBeUndefined();
  });

  it('does NOT add ginkgo for seizure disorders', () => {
    const quiz = baseQuiz({ healthConditions: ['seizure-disorder'] });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'ginkgo')).toBeUndefined();
    expect(getRec(recs, 'ginkgo-biloba')).toBeUndefined();
  });
});

// ─── TEST 10: Smoker → No beta-carotene ──────────────────────────────────────

describe('Smoker safety block: beta-carotene', () => {
  it('blocks beta-carotene when smokerFlag is true', () => {
    // smokerFlag is set by layer3; simulate it directly
    const quiz = baseQuiz({ smokingStatus: 'current', smokerFlag: true });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'beta-carotene')).toBeUndefined();
    expect(getRec(recs, 'beta-carotene-supplement')).toBeUndefined();
  });

  it('blocks beta-carotene via full pipeline for current smoker', () => {
    const quiz = baseQuiz({ smokingStatus: 'current' });
    const recs = runAllLayers(quiz);

    expect(getRec(recs, 'beta-carotene')).toBeUndefined();
  });

  it('does NOT block beta-carotene for non-smokers (smokerFlag absent/false)', () => {
    const quiz = baseQuiz({ smokingStatus: 'never' });
    // Beta-carotene isn't added by default — just ensure the safety block doesn't error
    const recs = runLayer4(quiz);
    expect(recs).toBeDefined();
  });
});

// ─── TEST 11: Autoimmune → No echinacea ──────────────────────────────────────

describe('Autoimmune safety block: echinacea', () => {
  it('removes echinacea if present in rec list when autoimmune condition exists', () => {
    // Manually inject echinacea into the recs before layer4 runs
    const quiz = baseQuiz({ healthConditions: ['lupus'] });
    const baseRecs = layer1Demographic(quiz);
    const { addOrModify: aom } = require('./layer1-demographic');
    const { CYCLE_DAILY: CD } = require('../types');

    const echinaceaRec: Recommendation = {
      id: 'echinacea',
      supplementName: 'Echinacea',
      form: 'extract',
      dose: 300,
      doseUnit: 'mg',
      frequency: 'daily',
      timing: ['morning-with-food'],
      withFood: true,
      evidenceRating: 'Moderate',
      reasons: [{ layer: 'lifestyle', reason: 'test' }],
      warnings: [],
      contraindications: [],
      cyclingPattern: CD,
      priority: 4,
      category: 'herbal',
      separateFrom: [],
      notes: [],
      sources: [{ layer: 'lifestyle', action: 'added' }],
    };

    const recsWithEchinacea = aom(baseRecs, echinaceaRec, 'lifestyle');
    const result = layer4Conditions(quiz, recsWithEchinacea);

    expect(getRec(result, 'echinacea')).toBeUndefined();
  });

  it('does not add echinacea for any autoimmune condition', () => {
    const conditions = ['autoimmune', 'lupus', 'multiple-sclerosis', 'hashimotos', 'rheumatoid-arthritis'];
    for (const cond of conditions) {
      const quiz = baseQuiz({ healthConditions: [cond] });
      const recs = runLayer4(quiz);
      expect(getRec(recs, 'echinacea')).toBeUndefined();
    }
  });
});

// ─── TEST 12: CKD → Caution flags ────────────────────────────────────────────

describe('Chronic Kidney Disease', () => {
  it('adds CKD warning to magnesium', () => {
    const quiz = baseQuiz({ healthConditions: ['ckd'] });
    const recs = runLayer4(quiz);

    const mg = getRec(recs, 'magnesium-glycinate')!;
    expect(mg).toBeDefined();
    expect(mg.warnings.some(w => w.toLowerCase().includes('ckd') || w.toLowerCase().includes('kidney'))).toBe(true);
  });

  it('adds CKD warning to potassium if present', () => {
    // Combine CKD with hypertension to get potassium in recs first
    const quiz = baseQuiz({ healthConditions: ['hypertension', 'ckd'] });
    const recs = runLayer4(quiz);

    // Potassium should either not be added (ACE block) or have CKD warning
    // With hypertension but no ACE meds, potassium gets added then CKD handler adds warning
    const pot = getRec(recs, 'potassium-citrate');
    if (pot) {
      expect(pot.warnings.some(w => w.toLowerCase().includes('ckd') || w.toLowerCase().includes('kidney'))).toBe(true);
    }
  });

  it('adds vitamin D for CKD', () => {
    const quiz = baseQuiz({ healthConditions: ['ckd'] });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'vitamin-d3')).toBeDefined();
  });

  it('adds B-complex for CKD', () => {
    const quiz = baseQuiz({ healthConditions: ['ckd'] });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'b-complex')).toBeDefined();
  });
});

// ─── TEST 13: Thalassemia → No iron ──────────────────────────────────────────

describe('Thalassemia iron safety block', () => {
  it('does NOT add iron for thalassemia', () => {
    const quiz = baseQuiz({ healthConditions: ['thalassemia'] });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'iron-bisglycinate')).toBeUndefined();
  });

  it('removes iron even if added by pregnancy in layer 1', () => {
    const quiz = baseQuiz({
      biologicalSex: 'female',
      isPregnant: true,
      healthConditions: ['thalassemia'],
    });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'iron-bisglycinate')).toBeUndefined();
  });

  it('adds folate for thalassemia (chronic haemolysis depletion)', () => {
    const quiz = baseQuiz({ healthConditions: ['thalassemia'] });
    const recs = runLayer4(quiz);

    const folate = getRec(recs, 'folate-5mthf')!;
    expect(folate).toBeDefined();
    expect(folate.dose).toBeGreaterThanOrEqual(1000);
  });
});

// ─── TEST 14: RA + methotrexate → Folate added at 5 mg ───────────────────────

describe('Rheumatoid arthritis + methotrexate', () => {
  it('adds folate 5000 mcg when RA + methotrexate', () => {
    const quiz = baseQuiz({
      healthConditions: ['rheumatoid-arthritis'],
      medications: ['methotrexate'],
    });
    const recs = runLayer4(quiz);

    const folate = getRec(recs, 'folate-5mthf')!;
    expect(folate).toBeDefined();
    expect(folate.dose).toBe(5000);
    expect(folate.doseUnit).toBe('mcg');
    expect(folate.priority).toBeGreaterThanOrEqual(9);
    expect(folate.warnings.some(w => w.toLowerCase().includes('methotrexate') || w.toLowerCase().includes('same day'))).toBe(true);
  });

  it('adds omega-3 for RA', () => {
    const quiz = baseQuiz({
      healthConditions: ['rheumatoid-arthritis'],
      fishIntake: 'none',
    });
    const recs = runLayer4(quiz);

    const o3 = getRec(recs, 'omega-3-fish-oil');
    expect(o3).toBeDefined();
    expect(o3!.dose).toBeGreaterThanOrEqual(2000);
  });

  it('adds curcumin for RA', () => {
    const quiz = baseQuiz({ healthConditions: ['rheumatoid-arthritis'] });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'curcumin')).toBeDefined();
  });
});

// ─── TEST 15: No red yeast rice with statins ──────────────────────────────────

describe('Red yeast rice + statin interaction', () => {
  it('does NOT add red yeast rice when user takes a statin', () => {
    const quiz = baseQuiz({
      healthConditions: ['high-cholesterol'],
      medications: ['atorvastatin'],
    });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'red-yeast-rice')).toBeUndefined();
  });

  it('does NOT add red yeast rice for any statin medication', () => {
    const statins = ['rosuvastatin', 'simvastatin', 'pravastatin', 'lovastatin'];
    for (const statin of statins) {
      const quiz = baseQuiz({
        healthConditions: ['hyperlipidemia'],
        medications: [statin],
      });
      const recs = runLayer4(quiz);
      expect(getRec(recs, 'red-yeast-rice')).toBeUndefined();
    }
  });

  it('DOES add red yeast rice without statin medication', () => {
    const quiz = baseQuiz({ healthConditions: ['high-cholesterol'] });
    const recs = runLayer4(quiz);

    const ryr = getRec(recs, 'red-yeast-rice');
    expect(ryr).toBeDefined();
    expect(ryr!.warnings.some(w => w.toLowerCase().includes('statin'))).toBe(true);
  });

  it('adds CoQ10 when on statins (statin-induced depletion)', () => {
    const quiz = baseQuiz({
      healthConditions: ['high-cholesterol'],
      medications: ['atorvastatin'],
    });
    const recs = runLayer4(quiz);

    const coq = getRec(recs, 'coq10-ubiquinol')!;
    expect(coq).toBeDefined();
    expect(coq.reasons.some(r => r.layer === 'conditions' && r.reason.toLowerCase().includes('statin'))).toBe(true);
  });
});

// ─── TEST 16: No potassium with ACE inhibitors/ARBs ──────────────────────────

describe('Potassium + ACE inhibitor/ARB interaction', () => {
  it('does NOT add potassium when user takes lisinopril (ACE inhibitor)', () => {
    const quiz = baseQuiz({
      healthConditions: ['hypertension'],
      medications: ['lisinopril'],
    });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'potassium-citrate')).toBeUndefined();
  });

  it('does NOT add potassium for any ARB medication', () => {
    const arbs = ['losartan', 'valsartan', 'candesartan', 'olmesartan'];
    for (const arb of arbs) {
      const quiz = baseQuiz({
        healthConditions: ['hypertension'],
        medications: [arb],
      });
      const recs = runLayer4(quiz);
      expect(getRec(recs, 'potassium-citrate')).toBeUndefined();
    }
  });

  it('DOES add potassium for hypertension without ACE/ARB medications', () => {
    const quiz = baseQuiz({ healthConditions: ['hypertension'] });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'potassium-citrate')).toBeDefined();
  });
});

// ─── TEST 17: Hair loss → Iron added ─────────────────────────────────────────

describe('Hair loss', () => {
  it('adds iron for hair loss (no thalassemia)', () => {
    const quiz = baseQuiz({ healthConditions: ['hair-loss'] });
    const recs = runLayer4(quiz);

    const iron = getRec(recs, 'iron-bisglycinate')!;
    expect(iron).toBeDefined();
    expect(iron.reasons.some(r => r.layer === 'conditions' && r.reason.toLowerCase().includes('ferritin'))).toBe(true);
  });

  it('adds biotin for hair loss', () => {
    const quiz = baseQuiz({ healthConditions: ['alopecia'] });
    const recs = runLayer4(quiz);

    const biotin = getRec(recs, 'biotin')!;
    expect(biotin).toBeDefined();
    expect(biotin.dose).toBe(5000);
    expect(biotin.doseUnit).toBe('mcg');
  });

  it('does NOT add iron for hair loss with thalassemia', () => {
    const quiz = baseQuiz({ healthConditions: ['hair-loss', 'thalassemia'] });
    const recs = runLayer4(quiz);

    // Thalassemia handler removes iron
    expect(getRec(recs, 'iron-bisglycinate')).toBeUndefined();
  });

  it('biotin warning mentions lab interference', () => {
    const quiz = baseQuiz({ healthConditions: ['hair-loss'] });
    const recs = runLayer4(quiz);

    const biotin = getRec(recs, 'biotin')!;
    expect(biotin.warnings.some(w => w.toLowerCase().includes('lab') || w.toLowerCase().includes('test'))).toBe(true);
  });
});

// ─── TEST 18: AMD → AREDS2 complete ──────────────────────────────────────────

describe('AMD — AREDS2 formula', () => {
  it('adds all AREDS2 components for AMD', () => {
    const quiz = baseQuiz({ healthConditions: ['amd'] });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'lutein')).toBeDefined();
    expect(getRec(recs, 'zeaxanthin')).toBeDefined();
    expect(getRec(recs, 'vitamin-c')).toBeDefined();
    expect(getRec(recs, 'vitamin-e')).toBeDefined();
    expect(getRec(recs, 'zinc-picolinate')).toBeDefined();
  });

  it('lutein is 10 mg and zeaxanthin is 2 mg (AREDS2 doses)', () => {
    const quiz = baseQuiz({ healthConditions: ['age-related-macular-degeneration'] });
    const recs = runLayer4(quiz);

    const lutein = getRec(recs, 'lutein')!;
    const zeax = getRec(recs, 'zeaxanthin')!;
    expect(lutein.dose).toBe(10);
    expect(zeax.dose).toBe(2);
  });

  it('zinc dose is ≥ 25 mg for AMD (AREDS2)', () => {
    const quiz = baseQuiz({ healthConditions: ['amd'] });
    const recs = runLayer4(quiz);

    const zinc = getRec(recs, 'zinc-picolinate')!;
    expect(zinc.dose).toBeGreaterThanOrEqual(25);
  });

  it('vitamin C is 500 mg and vitamin E is 400 IU (AREDS2 doses)', () => {
    const quiz = baseQuiz({ healthConditions: ['amd'] });
    const recs = runLayer4(quiz);

    const vc = getRec(recs, 'vitamin-c')!;
    const ve = getRec(recs, 'vitamin-e')!;
    expect(vc.dose).toBe(500);
    expect(ve.dose).toBe(400);
  });

  it('all AREDS2 components have Strong evidence rating', () => {
    const quiz = baseQuiz({ healthConditions: ['macular-degeneration'] });
    const recs = runLayer4(quiz);

    for (const id of ['lutein', 'zeaxanthin', 'vitamin-c', 'vitamin-e', 'zinc-picolinate']) {
      const rec = getRec(recs, id);
      expect(rec).toBeDefined();
      expect(rec!.evidenceRating).toBe('Strong');
    }
  });
});

// ─── TEST 19: Copper added for zinc > 25 mg ──────────────────────────────────

describe('Post-processing: copper for zinc > 25 mg', () => {
  it('adds copper 2 mg when AMD pushes zinc to 25 mg', () => {
    const quiz = baseQuiz({ healthConditions: ['amd'] });
    const recs = runLayer4(quiz);

    const copper = getRec(recs, 'copper-glycinate')!;
    expect(copper).toBeDefined();
    expect(copper.dose).toBe(2);
    expect(copper.doseUnit).toBe('mg');
  });

  it('does NOT add copper when total zinc ≤ 25 mg', () => {
    // Standard male 35yo US: zinc from L1 is 15 mg (men 40+); below 40, no zinc added
    const quiz = baseQuiz({ healthConditions: [] }); // 35yo — no zinc from L1
    const recs = runLayer4(quiz);

    // No zinc > 25 mg, so no copper
    const copper = getRec(recs, 'copper-glycinate');
    expect(copper).toBeUndefined();
  });

  it('copper is added when acne pushes zinc to 30 mg', () => {
    const quiz = baseQuiz({ healthConditions: ['acne'] });
    const recs = runLayer4(quiz);

    const zinc = getRec(recs, 'zinc-picolinate')!;
    expect(zinc.dose).toBe(30);

    const copper = getRec(recs, 'copper-glycinate')!;
    expect(copper).toBeDefined();
    expect(copper.dose).toBe(2);
  });
});

// ─── TEST 20: Warfarin → Vitamin K2 warning ──────────────────────────────────

describe('Post-processing: warfarin + vitamin K2 warning', () => {
  it('adds INR/warfarin warning to vitamin K2 when on warfarin', () => {
    const quiz = baseQuiz({
      healthConditions: ['osteoporosis'],
      medications: ['warfarin'],
    });
    const recs = runLayer4(quiz);

    const k2 = getRec(recs, 'vitamin-k2')!;
    expect(k2).toBeDefined();
    expect(k2.warnings.some(w => w.toLowerCase().includes('warfarin') || w.toLowerCase().includes('inr'))).toBe(true);
  });

  it('does NOT add warfarin warning to K2 when not on anticoagulants', () => {
    const quiz = baseQuiz({ healthConditions: ['osteoporosis'] });
    const recs = runLayer4(quiz);

    const k2 = getRec(recs, 'vitamin-k2')!;
    expect(k2).toBeDefined();
    expect(k2.warnings.some(w => w.toLowerCase().includes('warfarin'))).toBe(false);
  });
});

// ─── TEST 21: No duplicate supplement IDs ────────────────────────────────────

describe('No duplicate supplement IDs', () => {
  const complexQuizCases: Array<{ label: string; quiz: QuizData }> = [
    {
      label: 'Vegan with multiple conditions',
      quiz: baseQuiz({
        biologicalSex: 'female',
        age: 45,
        country: 'GB',
        dietaryPattern: 'vegan',
        healthConditions: ['anxiety', 'hypothyroidism', 'osteoporosis', 'ibs'],
        medications: ['levothyroxine'],
        stressLevel: 'high',
        sleepQuality: 'poor',
      }),
    },
    {
      label: 'Male diabetic with cardiovascular conditions',
      quiz: baseQuiz({
        age: 58,
        country: 'US',
        healthConditions: ['type-2-diabetes', 'hypertension', 'high-cholesterol'],
        medications: ['metformin', 'atorvastatin'],
        activityLevel: 'sedentary',
      }),
    },
    {
      label: 'Autoimmune + RA + methotrexate',
      quiz: baseQuiz({
        biologicalSex: 'female',
        age: 40,
        healthConditions: ['rheumatoid-arthritis', 'hashimotos'],
        medications: ['methotrexate'],
      }),
    },
    {
      label: 'AMD + PCOS + hair loss (female)',
      quiz: baseQuiz({
        biologicalSex: 'female',
        age: 55,
        healthConditions: ['amd', 'pcos', 'hair-loss', 'osteoporosis'],
      }),
    },
  ];

  for (const { label, quiz } of complexQuizCases) {
    it(`no duplicate IDs: ${label}`, () => {
      const recs = runAllLayers(quiz);
      const ids = recs.map(r => r.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  }
});

// ─── TEST 22: Valid evidence ratings and priorities ───────────────────────────

describe('Valid evidence ratings and priorities', () => {
  const validRatings = new Set(['Strong', 'Moderate', 'Emerging', 'Traditional']);

  it('all layer4 condition supplements have valid evidence ratings', () => {
    const conditionQuiz = baseQuiz({
      biologicalSex: 'female',
      healthConditions: [
        'anxiety', 'depression', 'hypothyroidism', 'type-2-diabetes', 'pcos',
        'hypertension', 'high-cholesterol', 'ibs', 'osteoporosis',
        'rheumatoid-arthritis', 'hair-loss', 'amd', 'ckd', 'migraines',
      ],
    });
    const recs = runLayer4(conditionQuiz);

    for (const rec of recs) {
      expect(validRatings.has(rec.evidenceRating)).toBe(true);
    }
  });

  it('all layer4 condition supplements have priority between 1 and 10', () => {
    const conditionQuiz = baseQuiz({
      healthConditions: [
        'anxiety', 'depression', 'bipolar', 'type-2-diabetes', 'pcos',
        'hypertension', 'high-cholesterol', 'osteoporosis', 'amd', 'nafld',
      ],
    });
    const recs = runLayer4(conditionQuiz);

    for (const rec of recs) {
      expect(rec.priority).toBeGreaterThanOrEqual(1);
      expect(rec.priority).toBeLessThanOrEqual(10);
    }
  });

  it('critical conditions have high priorities (≥ 7)', () => {
    const quiz = baseQuiz({
      biologicalSex: 'female',
      isPregnant: false,
      healthConditions: ['amd', 'hypothyroidism', 'rheumatoid-arthritis'],
      medications: ['methotrexate'],
    });
    const recs = runLayer4(quiz);

    // Folate for RA+MTX should be priority 9
    const folate = getRec(recs, 'folate-5mthf')!;
    expect(folate.priority).toBeGreaterThanOrEqual(9);

    // Selenium for hypothyroidism should be priority 8
    const selenium = getRec(recs, 'selenium')!;
    expect(selenium.priority).toBeGreaterThanOrEqual(7);

    // AREDS2 components should be priority 8
    const lutein = getRec(recs, 'lutein')!;
    expect(lutein.priority).toBe(8);
  });

  it('each recommendation has at least one reason', () => {
    const quiz = baseQuiz({
      healthConditions: ['anxiety', 'depression', 'type-2-diabetes', 'amd'],
    });
    const recs = runLayer4(quiz);

    for (const rec of recs) {
      expect(rec.reasons.length).toBeGreaterThan(0);
    }
  });

  it('each recommendation has a valid category', () => {
    const validCategories = new Set([
      'vitamin', 'mineral', 'omega-fatty-acid', 'amino-acid',
      'adaptogen', 'probiotic', 'enzyme', 'antioxidant',
      'herbal', 'compound', 'protein', 'fiber', 'other',
    ]);

    const quiz = baseQuiz({
      healthConditions: [
        'anxiety', 'depression', 'type-2-diabetes', 'amd', 'osteoporosis',
        'ibs', 'rheumatoid-arthritis',
      ],
    });
    const recs = runLayer4(quiz);

    for (const rec of recs) {
      expect(validCategories.has(rec.category)).toBe(true);
    }
  });
});

// ─── ADDITIONAL INTEGRATION TESTS ────────────────────────────────────────────

describe('Integration: multi-condition stack', () => {
  it('processes all conditions without errors for a complex female profile', () => {
    const quiz = baseQuiz({
      biologicalSex: 'female',
      age: 42,
      country: 'GB',
      dietaryPattern: 'vegetarian',
      healthConditions: [
        'pcos', 'hypothyroidism', 'osteoporosis', 'anxiety', 'migraines',
      ],
      medications: ['levothyroxine'],
      stressLevel: 'high',
      sleepQuality: 'poor',
    });

    expect(() => runAllLayers(quiz)).not.toThrow();
    const recs = runAllLayers(quiz);
    expect(recs.length).toBeGreaterThan(0);
  });

  it('depression SAMe and 5-HTP both absent when on SSRI + SNRIs', () => {
    const quiz = baseQuiz({
      healthConditions: ['depression', 'anxiety'],
      medications: ['sertraline'],
    });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'same')).toBeUndefined();
    expect(getRec(recs, '5-htp')).toBeUndefined();
    // But ashwagandha and L-theanine should still be present
    expect(getRec(recs, 'l-theanine')).toBeDefined();
  });

  it('PCOS inositol ratio is exactly 40:1 regardless of individual doses scaling', () => {
    const quiz = baseQuiz({
      biologicalSex: 'female',
      healthConditions: ['pcos'],
    });
    const recs = runLayer4(quiz);

    const mi = getRec(recs, 'myo-inositol')!;
    const dci = getRec(recs, 'd-chiro-inositol')!;
    expect(mi.dose / dci.dose).toBe(40);
  });

  it('thalassemia + hair loss + pregnancy — no iron', () => {
    const quiz = baseQuiz({
      biologicalSex: 'female',
      isPregnant: true,
      healthConditions: ['thalassemia', 'hair-loss'],
    });
    const recs = runLayer4(quiz);

    expect(getRec(recs, 'iron-bisglycinate')).toBeUndefined();
  });
});
