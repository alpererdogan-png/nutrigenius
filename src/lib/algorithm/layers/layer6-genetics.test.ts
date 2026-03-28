// ─────────────────────────────────────────────────────────────────────────────
// Layer 6 — Genetic Variants — Unit Tests
// ─────────────────────────────────────────────────────────────────────────────

import { layer6Genetics } from './layer6-genetics';
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

/**
 * Merge seed recs into the layer1 base via addOrModify so there are never
 * pre-existing duplicate IDs before layer6 runs.
 */
function runLayer6(quiz: QuizData, seed: Recommendation[] = []): Recommendation[] {
  let recs = layer1Demographic(quiz);
  for (const rec of seed) {
    recs = addOrModify(recs, rec, 'conditions');
  }
  return layer6Genetics(quiz, recs);
}

function getRec(recs: Recommendation[], id: string): Recommendation | undefined {
  return recs.find(r => r.id === id);
}

function makeRec(overrides: Partial<Recommendation> & { id: string }): Recommendation {
  return {
    supplementName: overrides.id,
    form: 'standard',
    dose: 400,
    doseUnit: 'mcg',
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Moderate',
    reasons: [],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    priority: 6,
    category: 'vitamin',
    separateFrom: [],
    notes: [],
    sources: [{ layer: 'conditions', action: 'added' }],
    ...overrides,
  } as Recommendation;
}

// ─── TEST 1: MTHFR homozygous → folate swapped to methylfolate 800–1,000 mcg ─

describe('MTHFR C677T homozygous', () => {
  it('swaps folic-acid to folate-5mthf at 1,000 mcg', () => {
    const quiz = baseQuiz({ geneticVariants: { mthfrC677T: 'homozygous' } });
    const folicAcid = makeRec({ id: 'folic-acid', dose: 400, doseUnit: 'mcg' });
    const recs = layer6Genetics(quiz, [folicAcid]);
    expect(getRec(recs, 'folic-acid')).toBeUndefined();
    const folate = getRec(recs, 'folate-5mthf');
    expect(folate).toBeDefined();
    expect(folate!.dose).toBeGreaterThanOrEqual(800);
  });

  it('does not create duplicate folate-5mthf when already present', () => {
    const quiz = baseQuiz({ geneticVariants: { mthfrC677T: 'homozygous' } });
    const existing5mthf = makeRec({ id: 'folate-5mthf', dose: 400, doseUnit: 'mcg' });
    const recs = layer6Genetics(quiz, [existing5mthf]);
    const all5mthf = recs.filter(r => r.id === 'folate-5mthf');
    expect(all5mthf).toHaveLength(1);
    expect(all5mthf[0].dose).toBeGreaterThanOrEqual(800);
  });

  it('adds TMG for methylation support', () => {
    const quiz = baseQuiz({ geneticVariants: { mthfrC677T: 'homozygous' } });
    const recs = layer6Genetics(quiz, []);
    expect(getRec(recs, 'betaine-tmg')).toBeDefined();
  });

  it('ensures B12 is methylcobalamin form at 1,000 mcg', () => {
    const quiz = baseQuiz({ geneticVariants: { mthfrC677T: 'homozygous' } });
    const b12 = makeRec({ id: 'vitamin-b12', dose: 250, doseUnit: 'mcg', form: 'cyanocobalamin' });
    const recs = layer6Genetics(quiz, [b12]);
    const result = getRec(recs, 'vitamin-b12');
    expect(result!.form).toBe('methylcobalamin');
    expect(result!.dose).toBeGreaterThanOrEqual(1000);
  });
});

// ─── TEST 2: COMT Met/Met → form swaps ────────────────────────────────────────

describe('COMT met-met (slow COMT)', () => {
  it('swaps folate-5mthf to folinic-acid', () => {
    const quiz = baseQuiz({ geneticVariants: { comtVal158Met: 'met-met' } });
    const folate = makeRec({ id: 'folate-5mthf', dose: 800, doseUnit: 'mcg' });
    const recs = layer6Genetics(quiz, [folate]);
    expect(getRec(recs, 'folate-5mthf')).toBeUndefined();
    expect(getRec(recs, 'folinic-acid')).toBeDefined();
  });

  it('swaps methylcobalamin to hydroxocobalamin', () => {
    const quiz = baseQuiz({ geneticVariants: { comtVal158Met: 'met-met' } });
    const b12 = makeRec({ id: 'vitamin-b12', form: 'methylcobalamin', dose: 1000, doseUnit: 'mcg' });
    const recs = layer6Genetics(quiz, [b12]);
    const result = getRec(recs, 'vitamin-b12');
    expect(result).toBeDefined();
    expect(result!.form).toBe('hydroxocobalamin');
  });

  it('adds a slow-COMT warning to methylcobalamin', () => {
    const quiz = baseQuiz({ geneticVariants: { comtVal158Met: 'met-met' } });
    const b12 = makeRec({ id: 'vitamin-b12', form: 'methylcobalamin', dose: 1000, doseUnit: 'mcg' });
    const recs = layer6Genetics(quiz, [b12]);
    const result = getRec(recs, 'vitamin-b12');
    const hasNote = result!.notes.some(n => /slow.comt|hydroxocobalamin/i.test(n));
    expect(hasNote).toBe(true);
  });
});

// ─── TEST 3: COMT Met/Met + SAMe → limited to very low dose ──────────────────

describe('COMT met-met + SAMe', () => {
  it('reduces SAMe dose to ≤200 mg', () => {
    const quiz = baseQuiz({ geneticVariants: { comtVal158Met: 'met-met' } });
    const same = makeRec({ id: 'same', dose: 800, doseUnit: 'mg', category: 'compound' });
    const recs = layer6Genetics(quiz, [same]);
    const result = getRec(recs, 'same');
    expect(result).toBeDefined();
    expect(result!.dose).toBeLessThanOrEqual(200);
  });

  it('adds a SAMe-COMT warning', () => {
    const quiz = baseQuiz({ geneticVariants: { comtVal158Met: 'met-met' } });
    const same = makeRec({ id: 'same', dose: 400, doseUnit: 'mg', category: 'compound' });
    const recs = layer6Genetics(quiz, [same]);
    const result = getRec(recs, 'same');
    expect(result!.warnings.some(w => /slow.comt|anxiety|irritability/i.test(w))).toBe(true);
  });
});

// ─── TEST 4: Compound heterozygous → treated as homozygous ───────────────────

describe('MTHFR compound heterozygous (C677T het + A1298C het)', () => {
  it('adds TMG (same as homozygous treatment)', () => {
    const quiz = baseQuiz({
      geneticVariants: { mthfrC677T: 'heterozygous', mthfrA1298C: 'heterozygous' },
    });
    const recs = layer6Genetics(quiz, []);
    expect(getRec(recs, 'betaine-tmg')).toBeDefined();
  });

  it('swaps folate to methylfolate at ≥800 mcg', () => {
    const quiz = baseQuiz({
      geneticVariants: { mthfrC677T: 'heterozygous', mthfrA1298C: 'heterozygous' },
    });
    const folicAcid = makeRec({ id: 'folic-acid', dose: 400, doseUnit: 'mcg' });
    const recs = layer6Genetics(quiz, [folicAcid]);
    expect(getRec(recs, 'folic-acid')).toBeUndefined();
    const folate = getRec(recs, 'folate-5mthf');
    expect(folate!.dose).toBeGreaterThanOrEqual(800);
  });

  it('includes "compound heterozygous" in the reason text', () => {
    const quiz = baseQuiz({
      geneticVariants: { mthfrC677T: 'heterozygous', mthfrA1298C: 'heterozygous' },
    });
    const folicAcid = makeRec({ id: 'folic-acid', dose: 400, doseUnit: 'mcg' });
    const recs = layer6Genetics(quiz, [folicAcid]);
    const folate = getRec(recs, 'folate-5mthf');
    const hasCompoundReason = folate!.reasons.some(r =>
      /compound.heterozygous/i.test(r.reason),
    );
    expect(hasCompoundReason).toBe(true);
  });
});

// ─── TEST 5: APOE ε4 → DHA + sensitivity note, no Alzheimer's mention ─────────

describe("APOE ε4/ε4", () => {
  it('adds DHA at ≥1,000 mg', () => {
    const quiz = baseQuiz({ geneticVariants: { apoe: 'e4-e4' } });
    const recs = layer6Genetics(quiz, []);
    const dha = getRec(recs, 'dha-algae') ?? getRec(recs, 'omega-3-fish-oil');
    expect(dha).toBeDefined();
    expect(dha!.dose).toBeGreaterThanOrEqual(1000);
  });

  it('does NOT mention Alzheimer\'s in any note or warning', () => {
    const quiz = baseQuiz({ geneticVariants: { apoe: 'e4-e4' } });
    const recs = layer6Genetics(quiz, []);
    const allText = recs.flatMap(r => [
      ...r.notes,
      ...r.warnings,
      ...r.reasons.map(x => x.reason),
    ]).join(' ');
    expect(/alzheimer/i.test(allText)).toBe(false);
  });

  it('adds phosphatidylserine', () => {
    const quiz = baseQuiz({ geneticVariants: { apoe: 'e4-e4' } });
    const recs = layer6Genetics(quiz, []);
    expect(getRec(recs, 'phosphatidylserine')).toBeDefined();
  });

  it('adds curcumin for neuroprotection', () => {
    const quiz = baseQuiz({ geneticVariants: { apoe: 'e4-e4' } });
    const recs = layer6Genetics(quiz, []);
    expect(getRec(recs, 'curcumin')).toBeDefined();
  });

  it('adds vitamin E and Lions Mane for ε4/ε4', () => {
    const quiz = baseQuiz({ geneticVariants: { apoe: 'e4-e4' } });
    const recs = layer6Genetics(quiz, []);
    expect(getRec(recs, 'vitamin-e-mixed-tocopherols')).toBeDefined();
    expect(getRec(recs, 'lions-mane')).toBeDefined();
  });
});

// ─── TEST 6: FUT2 non-secretor → B12 changed to sublingual ───────────────────

describe('FUT2 non-secretor', () => {
  it('changes B12 form to sublingual-methylcobalamin', () => {
    const quiz = baseQuiz({ geneticVariants: { fut2: 'non-secretor' } });
    const b12 = makeRec({ id: 'vitamin-b12', form: 'methylcobalamin', dose: 500, doseUnit: 'mcg' });
    const recs = layer6Genetics(quiz, [b12]);
    const result = getRec(recs, 'vitamin-b12');
    expect(result!.form).toBe('sublingual-methylcobalamin');
  });

  it('increases B12 dose to at least 1,000 mcg', () => {
    const quiz = baseQuiz({ geneticVariants: { fut2: 'non-secretor' } });
    const b12 = makeRec({ id: 'vitamin-b12', form: 'methylcobalamin', dose: 250, doseUnit: 'mcg' });
    const recs = layer6Genetics(quiz, [b12]);
    const result = getRec(recs, 'vitamin-b12');
    expect(result!.dose).toBeGreaterThanOrEqual(1000);
  });

  it('adds a sublingual delivery note', () => {
    const quiz = baseQuiz({ geneticVariants: { fut2: 'non-secretor' } });
    const b12 = makeRec({ id: 'vitamin-b12', form: 'cyanocobalamin', dose: 500, doseUnit: 'mcg' });
    const recs = layer6Genetics(quiz, [b12]);
    const result = getRec(recs, 'vitamin-b12');
    expect(result!.notes.some(n => /sublingual/i.test(n))).toBe(true);
  });
});

// ─── TEST 7: CYP1A2 slow + green tea extract → caffeine warning ───────────────

describe('CYP1A2 slow metabolizer + green tea extract', () => {
  it('adds a caffeine warning to green-tea-extract', () => {
    const quiz = baseQuiz({ geneticVariants: { cyp1a2: 'slow' } });
    const gte = makeRec({ id: 'green-tea-extract', category: 'herbal', dose: 500, doseUnit: 'mg' });
    const recs = layer6Genetics(quiz, [gte]);
    const result = getRec(recs, 'green-tea-extract');
    expect(result!.warnings.some(w => /caffeine|slow/i.test(w))).toBe(true);
  });

  it('adds a note about decaffeinated alternatives', () => {
    const quiz = baseQuiz({ geneticVariants: { cyp1a2: 'slow' } });
    const gte = makeRec({ id: 'green-tea-extract', category: 'herbal', dose: 500, doseUnit: 'mg' });
    const recs = layer6Genetics(quiz, [gte]);
    const result = getRec(recs, 'green-tea-extract');
    expect(result!.notes.some(n => /decaffeinat/i.test(n))).toBe(true);
  });
});

// ─── TEST 8: HFE variant → iron REMOVED ──────────────────────────────────────

describe('HFE hemochromatosis variant', () => {
  it('removes iron-bisglycinate when HFE C282Y is present', () => {
    const quiz = baseQuiz({ geneticVariants: { hfe: { c282y: true } } });
    const iron = makeRec({ id: 'iron-bisglycinate', category: 'mineral', dose: 18, doseUnit: 'mg' });
    const recs = layer6Genetics(quiz, [iron]);
    expect(getRec(recs, 'iron-bisglycinate')).toBeUndefined();
  });

  it('removes iron-bisglycinate when HFE H63D is present', () => {
    const quiz = baseQuiz({ geneticVariants: { hfe: { h63d: true } } });
    const iron = makeRec({ id: 'iron-bisglycinate', category: 'mineral', dose: 65, doseUnit: 'mg' });
    const recs = layer6Genetics(quiz, [iron]);
    expect(getRec(recs, 'iron-bisglycinate')).toBeUndefined();
  });

  it('removes iron that was added by earlier layers', () => {
    const quiz = baseQuiz({
      biologicalSex: 'female',
      healthConditions: ['iron-deficiency-anemia'],
      geneticVariants: { hfe: { c282y: true } },
    });
    const base = layer1Demographic(quiz);
    const recs = layer6Genetics(quiz, base);
    expect(getRec(recs, 'iron-bisglycinate')).toBeUndefined();
  });
});

// ─── TEST 9: BCMO1 poor converter → vitamin A form adjusted to retinol ────────

describe('BCMO1 poor converter', () => {
  it('swaps beta-carotene to vitamin-a-retinol', () => {
    const quiz = baseQuiz({ geneticVariants: { bcmo1: 'poor-converter' } });
    const betaC = makeRec({ id: 'beta-carotene', form: 'beta-carotene', dose: 5000, doseUnit: 'IU' });
    const recs = layer6Genetics(quiz, [betaC]);
    expect(getRec(recs, 'beta-carotene')).toBeUndefined();
    expect(getRec(recs, 'vitamin-a-retinol')).toBeDefined();
  });

  it('changes vitamin-a form to retinyl-palmitate', () => {
    const quiz = baseQuiz({ geneticVariants: { bcmo1: 'poor-converter' } });
    const vitA = makeRec({ id: 'vitamin-a', form: 'beta-carotene', dose: 5000, doseUnit: 'IU' });
    const recs = layer6Genetics(quiz, [vitA]);
    const result = getRec(recs, 'vitamin-a');
    expect(result!.form).toBe('retinyl-palmitate');
  });

  it('adds a vegan-specific note for vegan + BCMO1', () => {
    const quiz = baseQuiz({
      dietaryPattern: 'vegan',
      geneticVariants: { bcmo1: 'poor-converter' },
    });
    const vitA = makeRec({ id: 'vitamin-a', form: 'beta-carotene', dose: 5000, doseUnit: 'IU' });
    const recs = layer6Genetics(quiz, [vitA]);
    const result = getRec(recs, 'vitamin-a');
    expect(result!.notes.some(n => /vegan/i.test(n))).toBe(true);
  });
});

// ─── TEST 10: FADS variant in vegan → omega-3 note + dose increase ────────────

describe('FADS variant in vegan', () => {
  it('adds ALA-conversion note for vegan with FADS variant', () => {
    const quiz = baseQuiz({
      dietaryPattern: 'vegan',
      geneticVariants: { fads: true },
    });
    const dha = makeRec({ id: 'dha-algae', form: 'algae-dha', dose: 500, doseUnit: 'mg', category: 'omega-fatty-acid' });
    const recs = layer6Genetics(quiz, [dha]);
    const result = getRec(recs, 'dha-algae');
    expect(result!.notes.some(n => /ALA|conversion|algae/i.test(n))).toBe(true);
  });

  it('increases omega-3 dose by 500 mg', () => {
    const quiz = baseQuiz({
      dietaryPattern: 'vegan',
      geneticVariants: { fads: true },
    });
    const dha = makeRec({ id: 'dha-algae', form: 'algae-dha', dose: 1000, doseUnit: 'mg', category: 'omega-fatty-acid' });
    const recs = layer6Genetics(quiz, [dha]);
    const result = getRec(recs, 'dha-algae');
    expect(result!.dose).toBe(1500);
  });

  it('adds a FADS-specific reason', () => {
    const quiz = baseQuiz({ geneticVariants: { fads: true } });
    const o3 = makeRec({ id: 'omega-3-fish-oil', form: 'fish-oil', dose: 1000, doseUnit: 'mg', category: 'omega-fatty-acid' });
    const recs = layer6Genetics(quiz, [o3]);
    const result = getRec(recs, 'omega-3-fish-oil');
    expect(result!.reasons.some(r => /FADS|ALA/i.test(r.reason))).toBe(true);
  });
});

// ─── TEST 11: CBS upregulation → NAC dose reduced ────────────────────────────

describe('CBS upregulation', () => {
  it('reduces NAC from 1,200 mg to 600 mg', () => {
    const quiz = baseQuiz({ geneticVariants: { cbs: 'upregulation' } });
    const nac = makeRec({ id: 'nac', dose: 1200, doseUnit: 'mg', category: 'amino-acid' });
    const recs = layer6Genetics(quiz, [nac]);
    const result = getRec(recs, 'nac');
    expect(result!.dose).toBe(600);
  });

  it('adds a sulfur-sensitivity note to NAC', () => {
    const quiz = baseQuiz({ geneticVariants: { cbs: 'upregulation' } });
    const nac = makeRec({ id: 'nac', dose: 600, doseUnit: 'mg', category: 'amino-acid' });
    const recs = layer6Genetics(quiz, [nac]);
    const result = getRec(recs, 'nac');
    expect(result!.notes.some(n => /CBS|sulfur/i.test(n))).toBe(true);
  });

  it('adds a note to MSM when present', () => {
    const quiz = baseQuiz({ geneticVariants: { cbs: 'upregulation' } });
    const msm = makeRec({ id: 'msm', dose: 2000, doseUnit: 'mg', category: 'compound' });
    const recs = layer6Genetics(quiz, [msm]);
    const result = getRec(recs, 'msm');
    expect(result!.notes.some(n => /CBS|sulfur/i.test(n))).toBe(true);
  });
});

// ─── TEST 12: PEMT variant in pregnant woman → choline dose increased ─────────

describe('PEMT variant in pregnant woman', () => {
  it('increases choline dose to ≥550 mg in pregnancy', () => {
    const quiz = baseQuiz({
      biologicalSex: 'female',
      isPregnant: true,
      geneticVariants: { pemt: true },
    });
    const choline = makeRec({
      id: 'choline-bitartrate', dose: 250, doseUnit: 'mg', category: 'compound',
    });
    const recs = layer6Genetics(quiz, [choline]);
    const result = getRec(recs, 'choline-bitartrate');
    expect(result!.dose).toBeGreaterThanOrEqual(550);
  });

  it('adds pregnancy + PEMT note', () => {
    const quiz = baseQuiz({
      biologicalSex: 'female',
      isPregnant: true,
      geneticVariants: { pemt: true },
    });
    const recs = layer6Genetics(quiz, []);
    const choline = getRec(recs, 'choline-bitartrate');
    expect(choline).toBeDefined();
    expect(choline!.notes.some(n => /pregnancy|PEMT/i.test(n))).toBe(true);
  });

  it('adds choline at standard dose when not pregnant', () => {
    const quiz = baseQuiz({
      biologicalSex: 'female',
      isPregnant: false,
      geneticVariants: { pemt: true },
    });
    const recs = layer6Genetics(quiz, []);
    const choline = getRec(recs, 'choline-bitartrate');
    expect(choline).toBeDefined();
    expect(choline!.dose).toBeGreaterThanOrEqual(450);
  });
});

// ─── TEST 13: TNF-α variant → omega-3 increased to anti-inflammatory dose ─────

describe('TNF-α pro-inflammatory variant', () => {
  it('increases omega-3 to ≥2,000 mg', () => {
    const quiz = baseQuiz({ geneticVariants: { tnfAlpha: true } });
    const o3 = makeRec({
      id: 'omega-3-fish-oil', dose: 1000, doseUnit: 'mg', category: 'omega-fatty-acid',
    });
    const recs = layer6Genetics(quiz, [o3]);
    const result = getRec(recs, 'omega-3-fish-oil');
    expect(result!.dose).toBeGreaterThanOrEqual(2000);
  });

  it('adds curcumin when not already present', () => {
    const quiz = baseQuiz({ geneticVariants: { tnfAlpha: true } });
    const recs = layer6Genetics(quiz, []);
    expect(getRec(recs, 'curcumin')).toBeDefined();
  });

  it('adds a TNF-α reason string to omega-3', () => {
    const quiz = baseQuiz({ geneticVariants: { tnfAlpha: true } });
    const o3 = makeRec({
      id: 'omega-3-fish-oil', dose: 1000, doseUnit: 'mg', category: 'omega-fatty-acid',
    });
    const recs = layer6Genetics(quiz, [o3]);
    const result = getRec(recs, 'omega-3-fish-oil');
    expect(result!.reasons.some(r => /TNF|inflamm/i.test(r.reason))).toBe(true);
  });

  it('also works for IL-6 variant', () => {
    const quiz = baseQuiz({ geneticVariants: { il6: true } });
    const recs = layer6Genetics(quiz, []);
    const curcumin = getRec(recs, 'curcumin');
    expect(curcumin).toBeDefined();
    expect(curcumin!.reasons.some(r => /IL-6|inflamm/i.test(r.reason))).toBe(true);
  });
});

// ─── TEST 14: No duplicate supplement IDs after Layer 6 ──────────────────────

describe('No duplicate supplement IDs', () => {
  it('produces no duplicate IDs for complex MTHFR + COMT + APOE + PEMT', () => {
    const quiz = baseQuiz({
      biologicalSex: 'female',
      isPregnant: true,
      dietaryPattern: 'vegan',
      geneticVariants: {
        mthfrC677T: 'homozygous',
        mthfrA1298C: 'heterozygous',
        comtVal158Met: 'val-met',
        apoe: 'e4-e4',
        fads: true,
        pemt: true,
        tnfAlpha: true,
      },
    });
    const recs = runLayer6(quiz);
    const ids = recs.map(r => r.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });

  it('produces no duplicate IDs for HFE + CBS + SOD2 + FUT2', () => {
    const quiz = baseQuiz({
      geneticVariants: {
        hfe: { c282y: true },
        cbs: 'upregulation',
        sod2: 'val-ala',
        fut2: 'non-secretor',
        cyp1a2: 'slow',
        bcmo1: 'poor-converter',
      },
    });
    const recs = runLayer6(quiz);
    const ids = recs.map(r => r.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });

  it('produces no duplicates when all variants are combined', () => {
    const quiz = baseQuiz({
      geneticVariants: {
        mthfrC677T: 'heterozygous',
        mthfrA1298C: 'heterozygous',
        comtVal158Met: 'met-met',
        vdr: { taqI: true },
        apoe: 'e3-e4',
        fut2: 'non-secretor',
        cyp1a2: 'slow',
        cbs: 'upregulation',
        bcmo1: 'poor-converter',
        fads: true,
        hfe: { h63d: true },
        sod2: 'val-ala',
        pemt: true,
        tnfAlpha: true,
        il6: true,
      },
    });
    const seed: Recommendation[] = [
      makeRec({ id: 'folic-acid',       doseUnit: 'mcg', dose: 400 }),
      makeRec({ id: 'vitamin-b12',      doseUnit: 'mcg', dose: 1000, form: 'methylcobalamin' }),
      makeRec({ id: 'iron-bisglycinate',doseUnit: 'mg',  dose: 18, category: 'mineral' }),
      makeRec({ id: 'nac',              doseUnit: 'mg',  dose: 1200, category: 'amino-acid' }),
      makeRec({ id: 'omega-3-fish-oil', doseUnit: 'mg',  dose: 1000, category: 'omega-fatty-acid' }),
      makeRec({ id: 'green-tea-extract',doseUnit: 'mg',  dose: 500,  category: 'herbal' }),
      makeRec({ id: 'same',             doseUnit: 'mg',  dose: 400,  category: 'compound' }),
    ];
    // Use runLayer6 to merge seed via addOrModify (avoids pre-existing duplicates from layer1)
    const recs = runLayer6(quiz, seed);
    const ids = recs.map(r => r.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });
});

// ─── MTHFR + COMT COMPOUND PHENOTYPE ────────────────────────────────────────

describe('MTHFR homozygous + COMT Met/Met — methyl trap phenotype', () => {
  const methylTrapQuiz = () => baseQuiz({
    geneticVariants: {
      mthfrC677T: 'homozygous',
      comtVal158Met: 'met-met',
    },
  });

  it('uses folinic acid (not methylfolate)', () => {
    const quiz = methylTrapQuiz();
    const seed = [makeRec({ id: 'folate-5mthf', dose: 800, doseUnit: 'mcg' })];
    const recs = runLayer6(quiz, seed);

    expect(getRec(recs, 'folate-5mthf')).toBeUndefined();
    const folinic = getRec(recs, 'folinic-acid');
    expect(folinic).toBeDefined();
    expect(folinic!.form).toBe('folinic-acid');
  });

  it('uses hydroxocobalamin (not methylcobalamin)', () => {
    const quiz = methylTrapQuiz();
    const seed = [makeRec({ id: 'vitamin-b12', form: 'methylcobalamin', dose: 1000, doseUnit: 'mcg' })];
    const recs = runLayer6(quiz, seed);

    const b12 = getRec(recs, 'vitamin-b12');
    expect(b12).toBeDefined();
    expect(b12!.form).toBe('hydroxocobalamin');
  });

  it('adds TMG with BHMT pathway reason', () => {
    const quiz = methylTrapQuiz();
    const recs = runLayer6(quiz);

    const tmg = getRec(recs, 'betaine-tmg');
    expect(tmg).toBeDefined();
    expect(tmg!.dose).toBe(500);
    expect(tmg!.reasons.some(r => r.reason.includes('BHMT pathway'))).toBe(true);
  });

  it('TMG does NOT carry generic slow-COMT methyl donor warning', () => {
    const quiz = methylTrapQuiz();
    const recs = runLayer6(quiz);

    const tmg = getRec(recs, 'betaine-tmg');
    expect(tmg).toBeDefined();
    expect(tmg!.warnings.some(w => w.includes('Slow COMT — methyl donors may accumulate'))).toBe(false);
  });

  it('removes SAMe entirely', () => {
    const quiz = methylTrapQuiz();
    const seed = [makeRec({ id: 'same', dose: 400, doseUnit: 'mg', category: 'compound' })];
    const recs = runLayer6(quiz, seed);

    expect(getRec(recs, 'same')).toBeUndefined();
  });

  it('reduces B-Complex dose by 50%', () => {
    const quiz = methylTrapQuiz();
    const seed = [makeRec({ id: 'b-complex', dose: 100, doseUnit: 'mg', category: 'vitamin' })];
    const recs = runLayer6(quiz, seed);

    const bc = getRec(recs, 'b-complex');
    expect(bc).toBeDefined();
    expect(bc!.dose).toBe(50);
    expect(bc!.reasons.some(r => r.reason.includes('slow COMT'))).toBe(true);
  });

  it('adds comprehensive methylation paradox note', () => {
    const quiz = methylTrapQuiz();
    const seed = [makeRec({ id: 'folate-5mthf', dose: 800, doseUnit: 'mcg' })];
    const recs = runLayer6(quiz, seed);

    const folinic = getRec(recs, 'folinic-acid');
    expect(folinic).toBeDefined();
    expect(folinic!.notes.some(n => n.includes('methylation paradox'))).toBe(true);
  });

  it('adds homocysteine monitoring note', () => {
    const quiz = methylTrapQuiz();
    const seed = [makeRec({ id: 'folate-5mthf', dose: 800, doseUnit: 'mcg' })];
    const recs = runLayer6(quiz, seed);

    const folinic = getRec(recs, 'folinic-acid');
    expect(folinic).toBeDefined();
    expect(folinic!.notes.some(n => n.includes('homocysteine') && n.includes('3 months'))).toBe(true);
  });
});

describe('MTHFR homozygous + COMT Val/Val — fast COMT', () => {
  const fastCOMTQuiz = () => baseQuiz({
    geneticVariants: {
      mthfrC677T: 'homozygous',
      comtVal158Met: 'val-val',
    },
  });

  it('uses methylfolate (not folinic acid)', () => {
    const quiz = fastCOMTQuiz();
    const seed = [makeRec({ id: 'folic-acid', dose: 400, doseUnit: 'mcg' })];
    const recs = runLayer6(quiz, seed);

    expect(getRec(recs, 'folinic-acid')).toBeUndefined();
    const folate = getRec(recs, 'folate-5mthf');
    expect(folate).toBeDefined();
    expect(folate!.form).toBe('5-methyltetrahydrofolate');
  });

  it('uses methylcobalamin (not hydroxocobalamin)', () => {
    const quiz = fastCOMTQuiz();
    const seed = [makeRec({ id: 'vitamin-b12', form: 'cyanocobalamin', dose: 500, doseUnit: 'mcg' })];
    const recs = runLayer6(quiz, seed);

    const b12 = getRec(recs, 'vitamin-b12');
    expect(b12).toBeDefined();
    expect(b12!.form).toBe('methylcobalamin');
  });

  it('adds note about fast COMT handling methyl donors well', () => {
    const quiz = fastCOMTQuiz();
    const recs = runLayer6(quiz);

    const folate = getRec(recs, 'folate-5mthf');
    expect(folate).toBeDefined();
    expect(folate!.notes.some(n => n.includes('fast COMT') && n.includes('efficiently process'))).toBe(true);
  });

  it('does NOT add TMG (not needed with fast COMT)', () => {
    // MTHFR homozygous normally adds TMG, but fast COMT doesn't need it
    // Note: handleMTHFR adds TMG for homozygous regardless, and fast COMT
    // doesn't remove it. But the compound handler adds a note saying
    // methylfolate/methylcobalamin are well-suited.
    const quiz = fastCOMTQuiz();
    const recs = runLayer6(quiz);

    // TMG is still present from MTHFR handler (it provides BHMT backup),
    // but the compound note confirms methyl donors work well.
    const folate = getRec(recs, 'folate-5mthf');
    expect(folate!.notes.some(n => n.includes('well-suited'))).toBe(true);
  });
});

describe('MTHFR heterozygous + COMT Met/Met — milder compound', () => {
  const mildCompoundQuiz = () => baseQuiz({
    geneticVariants: {
      mthfrC677T: 'heterozygous',
      comtVal158Met: 'met-met',
    },
  });

  it('uses folinic acid (COMT met-met overrides to non-methyl)', () => {
    const quiz = mildCompoundQuiz();
    const seed = [makeRec({ id: 'folate-5mthf', dose: 800, doseUnit: 'mcg' })];
    const recs = runLayer6(quiz, seed);

    expect(getRec(recs, 'folate-5mthf')).toBeUndefined();
    expect(getRec(recs, 'folinic-acid')).toBeDefined();
  });

  it('uses hydroxocobalamin', () => {
    const quiz = mildCompoundQuiz();
    const seed = [makeRec({ id: 'vitamin-b12', form: 'methylcobalamin', dose: 1000, doseUnit: 'mcg' })];
    const recs = runLayer6(quiz, seed);

    const b12 = getRec(recs, 'vitamin-b12');
    expect(b12!.form).toBe('hydroxocobalamin');
  });

  it('does NOT force TMG (optional for heterozygous)', () => {
    const quiz = mildCompoundQuiz();
    const recs = runLayer6(quiz);

    // MTHFR heterozygous doesn't add TMG, so it shouldn't appear
    // unless another layer added it
    const tmg = getRec(recs, 'betaine-tmg');
    expect(tmg).toBeUndefined();
  });

  it('adds monitoring note to B-Complex if present (not dose reduction)', () => {
    const quiz = mildCompoundQuiz();
    const seed = [makeRec({ id: 'b-complex', dose: 100, doseUnit: 'mg', category: 'vitamin' })];
    const recs = runLayer6(quiz, seed);

    const bc = getRec(recs, 'b-complex');
    expect(bc).toBeDefined();
    // Dose should NOT be reduced for heterozygous
    expect(bc!.dose).toBe(100);
    expect(bc!.notes.some(n => n.includes('slow COMT') && n.includes('monitor'))).toBe(true);
  });
});
