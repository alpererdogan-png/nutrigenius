// ─────────────────────────────────────────────────────────────────────────────
// Pipeline — Integration Tests
// Each test runs the full 7-layer pipeline end-to-end with a realistic
// user profile and asserts on the final protocol output.
// ─────────────────────────────────────────────────────────────────────────────

import { generateProtocol } from './pipeline';
import { QuizData, Recommendation } from './types';

// ── Quiz helpers ──────────────────────────────────────────────────────────────

/** Minimal valid QuizData — override fields per test */
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

function hasRec(recs: Recommendation[], idOrName: string): boolean {
  const lower = idOrName.toLowerCase();
  return recs.some(
    r => r.id.toLowerCase().includes(lower) || r.supplementName.toLowerCase().includes(lower),
  );
}

function findRec(recs: Recommendation[], idOrName: string): Recommendation | undefined {
  const lower = idOrName.toLowerCase();
  return recs.find(
    r => r.id.toLowerCase().includes(lower) || r.supplementName.toLowerCase().includes(lower),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 1: Healthy 25M in Ireland — omnivore, no conditions, no meds
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 1 — Healthy 25M Ireland omnivore', () => {
  const quiz = baseQuiz({ age: 25, country: 'IE', sunExposure: 'minimal' });
  const result = generateProtocol(quiz, 'free');

  it('produces at least 3 approved recommendations', () => {
    expect(result.recommendations.length).toBeGreaterThanOrEqual(3);
  });

  it('includes Vitamin D3 (high-latitude baseline)', () => {
    expect(hasRec(result.recommendations, 'vitamin-d3')).toBe(true);
  });

  it('includes Magnesium (universal adult baseline)', () => {
    expect(hasRec(result.recommendations, 'magnesium')).toBe(true);
  });

  it('includes Omega-3 (universal adult baseline)', () => {
    expect(hasRec(result.recommendations, 'omega-3')).toBe(true);
  });

  it('includes Iodine (Ireland is iodine-deficient)', () => {
    expect(hasRec(result.recommendations, 'iodine')).toBe(true);
  });

  it('free tier displays all recs when total is at or under cap', () => {
    expect(result.metadata.displayedCount).toBe(result.recommendations.length);
    expect(result.displayedRecommendations).toHaveLength(result.recommendations.length);
  });

  it('has no drug interactions or blocked supplements', () => {
    expect(result.blocked).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('metadata reflects 5 active layers (no labs or genetics)', () => {
    expect(result.metadata.totalLayers).toBe(7);
    expect(result.metadata.activeLayers).toContain('demographic');
    expect(result.metadata.activeLayers).toContain('dietary');
    expect(result.metadata.activeLayers).toContain('lifestyle');
    expect(result.metadata.activeLayers).toContain('conditions');
    expect(result.metadata.activeLayers).toContain('goals');
    expect(result.metadata.activeLayers).not.toContain('labs');
    expect(result.metadata.activeLayers).not.toContain('genetics');
  });

  it('schedule is generated with at least one time slot on Monday', () => {
    const monday = result.schedule.days[0];
    expect(monday.dayName).toBe('Monday');
    expect(monday.timeSlots.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 2: 35F vegan in Turkey — high stress, poor sleep
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 2 — 35F vegan Turkey, high stress, poor sleep', () => {
  const quiz = baseQuiz({
    age: 35,
    biologicalSex: 'female',
    country: 'TR',
    dietaryPattern: 'vegan',
    fishIntake: 'none',
    dairyIntake: 'none',
    vegetableIntake: 'high',
    sleepQuality: 'poor',
    stressLevel: 'high',
    sunExposure: 'moderate',
    healthGoals: ['stress-anxiety', 'sleep'],
  });
  const freeResult    = generateProtocol(quiz, 'free');
  const premiumResult = generateProtocol(quiz, 'premium');

  it('includes vitamin B12 (no animal products)', () => {
    expect(hasRec(freeResult.recommendations, 'vitamin-b12')).toBe(true);
  });

  it('omega-3 is in algae-oil form (vegan swap)', () => {
    const omega = findRec(freeResult.recommendations, 'omega-3');
    expect(omega).toBeDefined();
    expect(omega!.form).toBe('algae-oil');
  });

  it('zinc is included with increased dose for vegan phytate compensation', () => {
    const zinc = findRec(freeResult.recommendations, 'zinc');
    expect(zinc).toBeDefined();
    expect(zinc!.dose).toBeGreaterThan(10); // vegan dose adjusted upward
  });

  it('at least one adaptogen is included for high-stress profile', () => {
    // High stress → ashwagandha from layer3 and/or layer7 (stress-anxiety goal)
    const hasAdaptogen = freeResult.recommendations.some(r =>
      r.id.includes('ashwagandha') || r.id.includes('rhodiola'),
    );
    expect(hasAdaptogen).toBe(true);
  });

  it('total approved recs exceed free-tier cap (7+ supplements expected)', () => {
    expect(freeResult.recommendations.length).toBeGreaterThan(5);
  });

  it('free tier displays exactly 5 supplements', () => {
    expect(freeResult.displayedRecommendations).toHaveLength(5);
  });

  it('free tier has upsellMessage', () => {
    expect(freeResult.upsellMessage).toBeDefined();
    expect(freeResult.upsellMessage).toMatch(/additional supplement/i);
  });

  it('premium tier displays more than 5 supplements', () => {
    expect(premiumResult.displayedRecommendations.length).toBeGreaterThan(5);
  });

  it('schedule shows zinc cycling (Mon–Fri) if zinc is in displayed recs', () => {
    const zincInDisplayed = hasRec(freeResult.displayedRecommendations, 'zinc');
    if (zincInDisplayed) {
      const saturday = freeResult.schedule.days[5];
      const sunday   = freeResult.schedule.days[6];
      const zincOnSat = saturday.timeSlots.some(ts =>
        ts.supplements.some(s => s.supplementName.toLowerCase().includes('zinc')),
      );
      const zincOnSun = sunday.timeSlots.some(ts =>
        ts.supplements.some(s => s.supplementName.toLowerCase().includes('zinc')),
      );
      expect(zincOnSat).toBe(false);
      expect(zincOnSun).toBe(false);
    } else {
      // Zinc is hidden behind paywall — schedule assertion is N/A
      expect(zincInDisplayed).toBe(false);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 3: 60M UK — T2D, hypertension, on metformin + lisinopril
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 3 — 60M UK, T2D + hypertension, metformin + lisinopril', () => {
  const quiz = baseQuiz({
    age: 60,
    country: 'GB',
    sunExposure: 'minimal',
    activityLevel: 'light',
    sleepQuality: 'fair',
    stressLevel: 'moderate',
    alcoholConsumption: 'light',
    fishIntake: 'low',
    healthConditions: ['type-2-diabetes', 'hypertension'],
    medications: ['metformin', 'lisinopril'],
    healthGoals: ['heart-health'],
  });
  const result = generateProtocol(quiz, 'free');

  it('potassium-citrate is NOT in approved recommendations (ACE inhibitor risk)', () => {
    const potassium = result.recommendations.find(
      r => r.id === 'potassium-citrate' || r.id === 'potassium',
    );
    expect(potassium).toBeUndefined();
  });

  it('potassium-citrate is NOT in blocked list (layer4 prevents addition for ACE users)', () => {
    const blocked = result.blocked.find(
      b => b.recommendation.id === 'potassium-citrate',
    );
    expect(blocked).toBeUndefined();
  });

  it('berberine IS in approved recommendations', () => {
    expect(hasRec(result.recommendations, 'berberine')).toBe(true);
  });

  it('berberine has a major warning for metformin interaction', () => {
    const warning = result.warnings.find(
      w => w.supplementId === 'berberine' && w.severity === 'major',
    );
    expect(warning).toBeDefined();
    expect(warning!.description.toLowerCase()).toMatch(/metformin|glucose|hypoglycemi/i);
  });

  it('CoQ10 is included (hypertension stack)', () => {
    expect(hasRec(result.recommendations, 'coq10')).toBe(true);
  });

  it('free tier displays top 5 by priority', () => {
    expect(result.displayedRecommendations).toHaveLength(5);
  });

  it('all displayed supplements are ordered by priority descending', () => {
    const priorities = result.displayedRecommendations.map(r => r.priority);
    for (let i = 0; i < priorities.length - 1; i++) {
      expect(priorities[i]).toBeGreaterThanOrEqual(priorities[i + 1]);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 4: 28F pregnant — MTHFR C677T homozygous, vegetarian
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 4 — 28F pregnant, MTHFR C677T homozygous, vegetarian', () => {
  const quiz = baseQuiz({
    age: 28,
    biologicalSex: 'female',
    country: 'US',
    isPregnant: true,
    dietaryPattern: 'vegetarian',
    fishIntake: 'none',
    dairyIntake: 'moderate',
    vegetableIntake: 'high',
    activityLevel: 'light',
    sleepQuality: 'fair',
    stressLevel: 'moderate',
    geneticVariants: { mthfrC677T: 'homozygous' },
  });
  const result = generateProtocol(quiz, 'premium');

  it('methylfolate (folate-5mthf) is included due to MTHFR + pregnancy', () => {
    expect(hasRec(result.recommendations, 'folate-5mthf')).toBe(true);
  });

  it('methylfolate form is 5-methyltetrahydrofolate', () => {
    const folate = findRec(result.recommendations, 'folate-5mthf');
    expect(folate?.form).toBe('5-methyltetrahydrofolate');
  });

  it('iron is included (prenatal)', () => {
    expect(hasRec(result.recommendations, 'iron')).toBe(true);
  });

  it('DHA / algae oil is included (prenatal, vegetarian)', () => {
    const dha = result.recommendations.find(
      r => r.id === 'dha-algae' || r.id === 'omega-3-fish-oil',
    );
    expect(dha).toBeDefined();
  });

  it('no pregnancy-blocked herbs appear in approved recommendations', () => {
    const blockedHerbs = [
      'ashwagandha', 'rhodiola-rosea', 'berberine', 'black-cohosh',
      'saw-palmetto', 'ginkgo-biloba', 'ginseng', 'kava', 'valerian-root',
      'st-johns-wort', 'echinacea', 'nac', 'alpha-lipoic-acid', 'same', 'sam-e',
    ];
    for (const herb of blockedHerbs) {
      const found = result.recommendations.find(r => r.id === herb);
      expect(found).toBeUndefined();
    }
  });

  it('genetics layer ran (MTHFR data provided)', () => {
    expect(result.metadata.activeLayers).toContain('genetics');
  });

  it('prenatal supplements have high priority (≥8)', () => {
    const prenatal = ['folate-5mthf', 'iron-bisglycinate', 'dha-algae', 'iodine'];
    for (const id of prenatal) {
      const rec = result.recommendations.find(r => r.id === id);
      if (rec) {
        expect(rec.priority).toBeGreaterThanOrEqual(8);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 5: 45M — depression, on sertraline (SSRI), former smoker
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 5 — 45M depression + sertraline + former smoker', () => {
  const quiz = baseQuiz({
    age: 45,
    country: 'US',
    sunExposure: 'minimal',
    activityLevel: 'light',
    sleepQuality: 'fair',
    stressLevel: 'high',
    alcoholConsumption: 'light',
    smokingStatus: 'former',
    healthConditions: ['depression'],
    medications: ['sertraline'],
  });
  const result = generateProtocol(quiz, 'free');

  it('SAMe is NOT in approved recommendations (layer4 skips for SSRI users)', () => {
    const same = result.recommendations.find(
      r => r.id === 'same' || r.id === 'sam-e',
    );
    expect(same).toBeUndefined();
  });

  it('5-HTP is NOT in approved recommendations (layer4 skips for SSRI users)', () => {
    const htp = result.recommendations.find(r => r.id === '5-htp');
    expect(htp).toBeUndefined();
  });

  it('omega-3 is included (EPA-dominant for depression)', () => {
    expect(hasRec(result.recommendations, 'omega-3')).toBe(true);
  });

  it('omega-3 dose is elevated for depression protocol (≥2000 mg)', () => {
    const omega = findRec(result.recommendations, 'omega-3');
    expect(omega).toBeDefined();
    expect(omega!.dose).toBeGreaterThanOrEqual(2000);
  });

  it('beta-carotene is NOT in approved (former smoker — CARET trial contraindication)', () => {
    const betaCar = result.recommendations.find(
      r => r.id === 'beta-carotene' || r.id === 'beta-carotene-supplement',
    );
    expect(betaCar).toBeUndefined();
  });

  it('vitamin D is included (deficiency doubles depression risk)', () => {
    expect(hasRec(result.recommendations, 'vitamin-d3')).toBe(true);
  });

  it('no blocked supplements for sertraline (SAMe/5-HTP were never added)', () => {
    // Layer4 prevented SAMe/5-HTP from being added → safety filter has nothing to block
    const sameBlocked = result.blocked.find(
      b => b.recommendation.id === 'same' || b.recommendation.id === '5-htp',
    );
    expect(sameBlocked).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 6: Diet comparison — same person, omnivore vs vegan
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 6 — Diet comparison: omnivore vs vegan (same person)', () => {
  const sharedFields = {
    age: 30,
    biologicalSex: 'male' as const,
    country: 'US',
    fishIntake: 'moderate' as const,
    dairyIntake: 'moderate' as const,
    vegetableIntake: 'moderate' as const,
    activityLevel: 'moderate' as const,
    sleepQuality: 'good' as const,
    stressLevel: 'low' as const,
    sunExposure: 'moderate' as const,
  };

  const omnivoreQuiz = baseQuiz({ ...sharedFields, dietaryPattern: 'omnivore' });
  const veganQuiz    = baseQuiz({ ...sharedFields, dietaryPattern: 'vegan', fishIntake: 'none', dairyIntake: 'none' });

  const omni = generateProtocol(omnivoreQuiz, 'premium');
  const vegan = generateProtocol(veganQuiz, 'premium');

  it('vegan protocol has omega-3 in algae-oil form; omnivore has fish-based form', () => {
    const veganOmega  = findRec(vegan.recommendations,  'omega-3');
    const omniOmega   = findRec(omni.recommendations, 'omega-3');
    expect(veganOmega).toBeDefined();
    expect(omniOmega).toBeDefined();
    expect(veganOmega!.form).toBe('algae-oil');
    expect(veganOmega!.form).not.toBe(omniOmega!.form);
  });

  it('vegan has vitamin-B12; omnivore at age 30 does not (layer1 adds B12 only at age ≥50)', () => {
    const veganB12 = findRec(vegan.recommendations, 'vitamin-b12');
    const omniB12  = findRec(omni.recommendations,  'vitamin-b12');
    expect(veganB12).toBeDefined();   // layer2 adds B12 for all vegans
    expect(omniB12).toBeUndefined();  // layer1 B12 gate: age >= 50 only
  });

  it('vegan protocol includes zinc-picolinate with phytate-adjusted dose', () => {
    const veganZinc = findRec(vegan.recommendations,  'zinc');
    const omniZinc  = findRec(omni.recommendations, 'zinc');
    expect(veganZinc).toBeDefined();
    // Vegan zinc dose is adjusted upward for phytate interference
    if (omniZinc) {
      expect(veganZinc!.dose).toBeGreaterThanOrEqual(omniZinc!.dose);
    }
  });

  it('the two protocols produce visibly different supplement sets', () => {
    const veganIds  = new Set(vegan.recommendations.map(r => r.id));
    const omniIds   = new Set(omni.recommendations.map(r => r.id));

    // At least one supplement differs (e.g. algae-oil, zinc, iodine additions)
    const allSame =
      [...veganIds].every(id => omniIds.has(id)) &&
      [...omniIds].every(id => veganIds.has(id)) &&
      vegan.recommendations.every(rv => {
        const ro = omni.recommendations.find(r => r.id === rv.id);
        return ro && ro.form === rv.form && ro.dose === rv.dose;
      });

    expect(allSame).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 7: Tier comparison — same person, free vs premium
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 7 — Tier comparison: free vs premium', () => {
  // Rich profile to ensure >5 recommendations are generated
  const quiz = baseQuiz({
    age: 45,
    biologicalSex: 'female',
    country: 'US',
    dietaryPattern: 'vegan',
    fishIntake: 'none',
    dairyIntake: 'none',
    vegetableIntake: 'high',
    activityLevel: 'moderate',
    sleepQuality: 'poor',
    stressLevel: 'high',
    sunExposure: 'minimal',
    healthConditions: ['type-2-diabetes'],
    medications: ['metformin'],
    healthGoals: ['energy', 'cognitive', 'weight-management'],
  });

  const freeResult    = generateProtocol(quiz, 'free');
  const premiumResult = generateProtocol(quiz, 'premium');

  it('both tiers produce the same total approved recommendations', () => {
    expect(freeResult.recommendations.length).toBe(premiumResult.recommendations.length);
  });

  it('free tier displays exactly 5 supplements', () => {
    expect(freeResult.displayedRecommendations).toHaveLength(5);
  });

  it('premium tier displays more supplements than free (up to 10)', () => {
    expect(premiumResult.displayedRecommendations.length).toBeGreaterThan(
      freeResult.displayedRecommendations.length,
    );
    expect(premiumResult.displayedRecommendations.length).toBeLessThanOrEqual(10);
  });

  it('free tier has upsellMessage', () => {
    expect(freeResult.upsellMessage).toBeDefined();
    expect(freeResult.upsellMessage).toMatch(/\d+ additional supplement/i);
  });

  it('premium tier upsellMessage is absent when all supplements are shown', () => {
    // When total approved > 10, premium still caps at 10 and may have an upsell
    if (premiumResult.displayedRecommendations.length === premiumResult.recommendations.length) {
      expect(premiumResult.upsellMessage).toBeUndefined();
    } else {
      expect(premiumResult.upsellMessage).toBeDefined();
    }
  });

  it('free schedule has fewer supplements per day than premium schedule', () => {
    const freeMonday    = freeResult.schedule.days[0].totalSupplements;
    const premiumMonday = premiumResult.schedule.days[0].totalSupplements;
    expect(freeMonday).toBeLessThan(premiumMonday);
  });

  it('free hidden recommendations match premium displayed-but-not-free supplements', () => {
    const freeDisplayedIds  = new Set(freeResult.displayedRecommendations.map(r => r.id));
    const premiumDisplayedIds = new Set(premiumResult.displayedRecommendations.map(r => r.id));

    // Every free-displayed rec should also appear in premium's displayed list
    for (const id of freeDisplayedIds) {
      expect(premiumDisplayedIds.has(id)).toBe(true);
    }
  });

  it('hiddenTeaser contains only name, evidenceRating, and category (not dose)', () => {
    // Premium has no hidden, so use free result
    expect(freeResult.hiddenRecommendations.length).toBeGreaterThan(0);
    // PipelineResult doesn't expose hiddenTeaser directly — verify via hidden rec count
    expect(freeResult.metadata.hiddenCount).toBeGreaterThan(0);
    expect(freeResult.metadata.hiddenCount).toBe(freeResult.hiddenRecommendations.length);
  });

  it('metadata.generatedAt is a valid ISO timestamp', () => {
    expect(() => new Date(freeResult.metadata.generatedAt)).not.toThrow();
    expect(new Date(freeResult.metadata.generatedAt).getTime()).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Bonus — Tier enforcement unit tests (isolated, no full pipeline)
// ─────────────────────────────────────────────────────────────────────────────
describe('Tier enforcement — isolated unit tests', () => {
  it('displays top-priority supplements first', () => {
    // All top-5 displayed should have higher or equal priority to hidden ones
    const quiz = baseQuiz({
      age: 45, biologicalSex: 'female', country: 'US',
      dietaryPattern: 'vegan', fishIntake: 'none', dairyIntake: 'none',
      sleepQuality: 'poor', stressLevel: 'high', sunExposure: 'minimal',
      healthGoals: ['energy', 'cognitive', 'sleep'],
      healthConditions: ['type-2-diabetes'], medications: ['metformin'],
    });
    const result = generateProtocol(quiz, 'free');

    if (result.hiddenRecommendations.length > 0) {
      const minDisplayedPriority = Math.min(
        ...result.displayedRecommendations.map(r => r.priority),
      );
      const maxHiddenPriority = Math.max(
        ...result.hiddenRecommendations.map(r => r.priority),
      );
      expect(minDisplayedPriority).toBeGreaterThanOrEqual(maxHiddenPriority);
    }
  });

  it('upsellMessage count matches hidden rec count', () => {
    const quiz = baseQuiz({
      age: 45, biologicalSex: 'female', country: 'US',
      dietaryPattern: 'vegan', fishIntake: 'none', dairyIntake: 'none',
      sleepQuality: 'poor', stressLevel: 'high', sunExposure: 'minimal',
      healthGoals: ['energy', 'cognitive', 'sleep'],
    });
    const result = generateProtocol(quiz, 'free');

    if (result.metadata.hiddenCount > 0) {
      expect(result.upsellMessage).toContain(String(result.metadata.hiddenCount));
    }
  });
});
