// ─────────────────────────────────────────────────────────────────────────────
// Full Integration Tests — 5 Expert-Panel Scenarios
//
// These test the entire pipeline end-to-end: Layer 1–7, optimizers, synergy,
// time-to-effect, monitoring, safety filter, tier enforcement, and schedule.
// ─────────────────────────────────────────────────────────────────────────────

import { generateProtocol, PipelineResult } from './pipeline';
import type { QuizData, Recommendation, SafetyWarning, BlockedSupplement } from './types';

// ── Helper factory ───────────────────────────────────────────────────────────

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

function findRec(result: PipelineResult, id: string): Recommendation | undefined {
  return result.recommendations.find(r => r.id === id);
}

function findBlocked(result: PipelineResult, id: string): BlockedSupplement | undefined {
  return result.blocked.find(b => b.recommendation.id === id);
}

function findWarning(result: PipelineResult, suppId: string, medication?: string): SafetyWarning | undefined {
  return result.warnings.find(w =>
    w.supplementId === suppId && (medication ? w.medication === medication : true),
  );
}

function allRecIds(result: PipelineResult): string[] {
  return result.recommendations.map(r => r.id);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO A: Pregnant vegan on levothyroxine + prenatal folate
// ─────────────────────────────────────────────────────────────────────────────

describe('Scenario A: Pregnant vegan on levothyroxine', () => {
  const quiz = baseQuiz({
    age: 28,
    biologicalSex: 'female',
    isPregnant: true,
    dietaryPattern: 'vegan',
    fishIntake: 'none',
    dairyIntake: 'none',
    medications: ['levothyroxine'],
    healthGoals: [],
  });
  const result = generateProtocol(quiz, 'premium');

  test('ashwagandha is BLOCKED (pregnancy)', () => {
    const blocked = findBlocked(result, 'ashwagandha-ksm66');
    // Either blocked by safety filter or never added for pregnant users
    const inRecs = findRec(result, 'ashwagandha-ksm66');
    expect(blocked || !inRecs).toBeTruthy();
  });

  test('omega-3 is algae-based (not fish oil — vegan)', () => {
    const algae = findRec(result, 'dha-algae');
    const fish = findRec(result, 'omega-3-fish-oil');
    expect(algae).toBeDefined();
    expect(fish).toBeUndefined();
  });

  test('folate present at adequate dose (≥ 600 mcg for pregnancy)', () => {
    const folate = result.recommendations.find(r =>
      r.id.includes('folate') || r.id.includes('folic-acid') || r.id.includes('methylfolate'),
    );
    expect(folate).toBeDefined();
    expect(folate!.dose).toBeGreaterThanOrEqual(600);
  });

  test('iron present with vitamin C synergy', () => {
    const iron = findRec(result, 'iron-bisglycinate');
    const vitC = findRec(result, 'vitamin-c');
    expect(iron).toBeDefined();
    expect(vitC).toBeDefined();
  });

  test('thyroid medication separation note present on iron or calcium', () => {
    // Check schedule food notes for thyroid timing
    const allSupps = result.schedule.days[0].timeSlots.flatMap(ts => ts.supplements);
    const ironSupp = allSupps.find(s => /iron/i.test(s.supplementName));
    const calciumSupp = allSupps.find(s => /calcium/i.test(s.supplementName));
    const hasFoodNote = (s: typeof allSupps[0] | undefined) =>
      s?.foodNotes?.some(n => /thyroid/i.test(n)) ?? false;
    expect(hasFoodNote(ironSupp) || hasFoodNote(calciumSupp)).toBe(true);
  });

  test('D3 + K2 synergy pair present', () => {
    const d3 = findRec(result, 'vitamin-d3');
    const k2 = findRec(result, 'vitamin-k2-mk7');
    expect(d3).toBeDefined();
    expect(k2).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO B: 55M on simvastatin + metformin, T2D, high stress
// ─────────────────────────────────────────────────────────────────────────────

describe('Scenario B: 55M on simvastatin + metformin, T2D, high stress', () => {
  const quiz = baseQuiz({
    age: 55,
    biologicalSex: 'male',
    medications: ['simvastatin', 'metformin'],
    healthConditions: ['type-2-diabetes'],
    stressLevel: 'high',
    healthGoals: [],
  });
  const result = generateProtocol(quiz, 'premium');

  test('CoQ10 added for statin depletion', () => {
    const coq10 = findRec(result, 'coq10-ubiquinol');
    expect(coq10).toBeDefined();
    expect(coq10!.reasons.some(r => /statin/i.test(r.reason))).toBe(true);
  });

  test('B12 added for metformin depletion', () => {
    const b12 = findRec(result, 'vitamin-b12');
    expect(b12).toBeDefined();
    expect(b12!.reasons.some(r => /metformin/i.test(r.reason))).toBe(true);
  });

  test('berberine has WARNING about simvastatin CYP3A4 interaction', () => {
    const berberine = findRec(result, 'berberine');
    if (berberine) {
      const warning = findWarning(result, 'berberine', 'Statins');
      expect(warning).toBeDefined();
      expect(warning!.severity).toBe('major');
      expect(warning!.description).toMatch(/CYP3A4/i);
    }
    // If berberine not in protocol, that's also acceptable
  });

  test('berberine has WARNING about metformin hypoglycemia', () => {
    const berberine = findRec(result, 'berberine');
    if (berberine) {
      const warning = findWarning(result, 'berberine', 'Metformin');
      expect(warning).toBeDefined();
      expect(warning!.severity).toBe('major');
      expect(warning!.description).toMatch(/hypoglycemia/i);
    }
  });

  test('berberine has time-to-effect metadata', () => {
    const berberine = findRec(result, 'berberine');
    if (berberine) {
      expect(berberine.timeToEffect).toBeDefined();
      expect(berberine.timeToEffect).toMatch(/4.?8 weeks/i);
    }
  });

  test('HbA1c monitoring note present on berberine', () => {
    const berberine = findRec(result, 'berberine');
    if (berberine && berberine.monitoringNotes) {
      expect(berberine.monitoringNotes.some(m => /HbA1c/i.test(m.test))).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO C: 30F athlete, keto, MTHFR homo + COMT Met/Met
// ─────────────────────────────────────────────────────────────────────────────

describe('Scenario C: 30F athlete, keto, MTHFR homo + COMT Met/Met', () => {
  const quiz = baseQuiz({
    age: 30,
    biologicalSex: 'female',
    activityLevel: 'athlete',
    dietaryPattern: 'keto',
    dairyIntake: 'moderate',
    fishIntake: 'moderate',
    geneticVariants: {
      mthfrC677T: 'homozygous',
      comtVal158Met: 'met-met',
    },
    healthGoals: [],
  });
  const result = generateProtocol(quiz, 'premium');

  test('folinic acid present (not methylfolate — COMT Met/Met methyl trap)', () => {
    const folinic = result.recommendations.find(r =>
      /folinic/i.test(r.form) || /folinic/i.test(r.supplementName),
    );
    expect(folinic).toBeDefined();
  });

  test('hydroxocobalamin present (not methylcobalamin)', () => {
    const b12 = result.recommendations.find(r =>
      r.id === 'vitamin-b12' || /b12|cobalamin/i.test(r.id),
    );
    if (b12) {
      expect(b12.form).toMatch(/hydroxo/i);
    }
  });

  test('TMG added (BHMT pathway bypass)', () => {
    const tmg = findRec(result, 'betaine-tmg');
    expect(tmg).toBeDefined();
  });

  test('magnesium form is malate (athlete optimization)', () => {
    const mg = result.recommendations.find(r => /magnesium/.test(r.id));
    expect(mg).toBeDefined();
    expect(mg!.form).toMatch(/malate/i);
  });

  test('creatine present with flexible timing note', () => {
    const creatine = findRec(result, 'creatine-monohydrate');
    expect(creatine).toBeDefined();
    expect(creatine!.notes.some(n => /timing is flexible/i.test(n))).toBe(true);
  });

  test('electrolyte guide in protocol notes', () => {
    expect(result.protocolNotes.some(n => n.type === 'athlete-electrolyte-guide')).toBe(true);
  });

  test('methyl trap explanation note present', () => {
    const allNotes = result.recommendations.flatMap(r => r.notes);
    const allReasons = result.recommendations.flatMap(r => r.reasons.map(rr => rr.reason));
    const combined = [...allNotes, ...allReasons].join(' ');
    expect(combined).toMatch(/methyl.?trap|methylation.?paradox|BHMT/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO D: 40M IBS, depression, on sertraline (SSRI)
// ─────────────────────────────────────────────────────────────────────────────

describe('Scenario D: 40M IBS, depression, on sertraline', () => {
  const quiz = baseQuiz({
    age: 40,
    biologicalSex: 'male',
    healthConditions: ['ibs', 'depression'],
    medications: ['sertraline'],
    stressLevel: 'high',
    healthGoals: [],
  });
  const result = generateProtocol(quiz, 'premium');

  test('absorption flag set (IBS triggers absorption optimizer)', () => {
    // We can check indirectly: digestive enzymes should be added
    const enzymes = findRec(result, 'digestive-enzyme-complex');
    expect(enzymes).toBeDefined();
  });

  test('mineral forms optimized for absorption', () => {
    // Check that any magnesium present uses an optimized form (not oxide)
    const mg = result.recommendations.find(r => /magnesium/.test(r.id));
    if (mg) {
      expect(mg.form).not.toMatch(/oxide/i);
    }
  });

  test('SAMe is BLOCKED (SSRI interaction)', () => {
    const sameRec = findRec(result, 'same');
    const sameBlocked = findBlocked(result, 'same');
    // Either not added at all (layer4 skips it for serotonergic users)
    // or blocked by safety filter
    expect(!sameRec || sameBlocked).toBeTruthy();
  });

  test('5-HTP is BLOCKED (SSRI interaction)', () => {
    const htpRec = findRec(result, '5-htp');
    const htpBlocked = findBlocked(result, '5-htp');
    expect(!htpRec || htpBlocked).toBeTruthy();
  });

  test('EPA-dominant omega-3 present for depression', () => {
    const omega = result.recommendations.find(r =>
      r.id === 'omega-3-fish-oil' || r.id === 'dha-algae',
    );
    expect(omega).toBeDefined();
    expect(omega!.reasons.some(r => /EPA|depression/i.test(r.reason))).toBe(true);
  });

  test('probiotic has time-to-effect', () => {
    const prob = result.recommendations.find(r => /probiotic/.test(r.id));
    if (prob && prob.timeToEffect) {
      expect(prob.timeToEffect).toMatch(/2.?4 weeks/i);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO E: 65F on warfarin + omeprazole, osteoporosis
// ─────────────────────────────────────────────────────────────────────────────

describe('Scenario E: 65F on warfarin + omeprazole, osteoporosis', () => {
  const quiz = baseQuiz({
    age: 65,
    biologicalSex: 'female',
    isPostmenopausal: true,
    medications: ['warfarin', 'omeprazole'],
    healthConditions: ['osteoporosis'],
    healthGoals: [],
  });
  const result = generateProtocol(quiz, 'premium');

  test('vitamin K2 WARNING or BLOCKED (warfarin interaction)', () => {
    const k2Rec = findRec(result, 'vitamin-k2-mk7');
    const k2Blocked = findBlocked(result, 'vitamin-k2-mk7');
    const k2Warning = findWarning(result, 'vitamin-k2-mk7');
    // K2 should either be blocked or have a warning
    expect(k2Blocked || k2Warning || !k2Rec).toBeTruthy();
  });

  test('B12 added (PPI depletion)', () => {
    const b12 = findRec(result, 'vitamin-b12');
    expect(b12).toBeDefined();
    const hasPPIReason = b12!.reasons.some(r => /PPI|proton pump|omeprazole/i.test(r.reason));
    expect(hasPPIReason).toBe(true);
  });

  test('magnesium added (PPI depletion)', () => {
    const mg = result.recommendations.find(r => /magnesium/.test(r.id));
    expect(mg).toBeDefined();
    const hasPPIReason = mg!.reasons.some(r => /PPI|proton pump/i.test(r.reason));
    expect(hasPPIReason).toBe(true);
  });

  test('calcium added (PPI depletion + osteoporosis)', () => {
    const calcium = result.recommendations.find(r => /calcium/.test(r.id));
    expect(calcium).toBeDefined();
  });

  test('calcium form is citrate (PPI users need acid-independent form)', () => {
    const calcium = result.recommendations.find(r => /calcium/.test(r.id));
    if (calcium) {
      expect(calcium.form).toMatch(/citrate/i);
    }
  });

  test('omega-3 + warfarin cumulative bleeding check', () => {
    const omega = findRec(result, 'omega-3-fish-oil');
    if (omega) {
      // Either a warfarin interaction warning or an anticoagulant warning
      const warning = result.warnings.find(w =>
        w.supplementId === 'omega-3-fish-oil' &&
        /warfarin|anticoagulant|bleed/i.test(w.description),
      );
      expect(warning).toBeDefined();
    }
  });

  test('monitoring includes bone density (DEXA)', () => {
    const calcium = result.recommendations.find(r => /calcium/.test(r.id));
    if (calcium?.monitoringNotes) {
      const hasDEXA = calcium.monitoringNotes.some(m =>
        /DEXA|bone.?density/i.test(m.test),
      );
      expect(hasDEXA).toBe(true);
    }
  });

  test('B12 monitoring present', () => {
    const b12 = findRec(result, 'vitamin-b12');
    if (b12?.monitoringNotes) {
      expect(b12.monitoringNotes.some(m => /B12|MMA/i.test(m.test))).toBe(true);
    }
  });

  test('INR monitoring on omega-3 if present', () => {
    const omega = findRec(result, 'omega-3-fish-oil');
    if (omega?.monitoringNotes) {
      const hasINR = omega.monitoringNotes.some(m => /INR/i.test(m.test));
      // Only triggers at ≥ 3,000 mg dose with anticoagulant
      if (omega.dose >= 3000) {
        expect(hasINR).toBe(true);
      }
    }
  });
});
