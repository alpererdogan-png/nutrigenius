// ─────────────────────────────────────────────────────────────────────────────
// Protocol Notes — Tests
//
// Verifies that structured protocol-level notes (e.g. Athlete Electrolyte
// Guide) are generated for the correct user profiles and absent for others.
// ─────────────────────────────────────────────────────────────────────────────

import { generateProtocol } from './pipeline';
import type { QuizData, ProtocolNote } from './types';

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

function findNote(notes: ProtocolNote[], type: string): ProtocolNote | undefined {
  return notes.find(n => n.type === type);
}

// ─────────────────────────────────────────────────────────────────────────────
// ATHLETE ELECTROLYTE GUIDE
// ─────────────────────────────────────────────────────────────────────────────

describe('Athlete Electrolyte Guide — protocol note', () => {
  it('present for athlete activity level', () => {
    const quiz = baseQuiz({ activityLevel: 'athlete' });
    const { protocolNotes } = generateProtocol(quiz, 'premium');

    const guide = findNote(protocolNotes, 'athlete-electrolyte-guide');
    expect(guide).toBeDefined();
    expect(guide!.title).toBe('Athlete Electrolyte Guide');
  });

  it('present for very-active activity level', () => {
    const quiz = baseQuiz({ activityLevel: 'very-active' });
    const { protocolNotes } = generateProtocol(quiz, 'premium');

    const guide = findNote(protocolNotes, 'athlete-electrolyte-guide');
    expect(guide).toBeDefined();
  });

  it('absent for moderate activity level', () => {
    const quiz = baseQuiz({ activityLevel: 'moderate' });
    const { protocolNotes } = generateProtocol(quiz, 'premium');

    expect(findNote(protocolNotes, 'athlete-electrolyte-guide')).toBeUndefined();
  });

  it('absent for sedentary activity level', () => {
    const quiz = baseQuiz({ activityLevel: 'sedentary' });
    const { protocolNotes } = generateProtocol(quiz, 'premium');

    expect(findNote(protocolNotes, 'athlete-electrolyte-guide')).toBeUndefined();
  });

  it('absent for light activity level', () => {
    const quiz = baseQuiz({ activityLevel: 'light' });
    const { protocolNotes } = generateProtocol(quiz, 'premium');

    expect(findNote(protocolNotes, 'athlete-electrolyte-guide')).toBeUndefined();
  });

  it('content includes sodium guidance (500-1,000 mg per hour)', () => {
    const quiz = baseQuiz({ activityLevel: 'athlete' });
    const { protocolNotes } = generateProtocol(quiz, 'premium');

    const guide = findNote(protocolNotes, 'athlete-electrolyte-guide')!;
    expect(guide.content).toContain('Sodium');
    expect(guide.content).toContain('500');
    expect(guide.content).toContain('1,000 mg per hour');
  });

  it('content includes potassium guidance (200-400 mg per hour)', () => {
    const quiz = baseQuiz({ activityLevel: 'athlete' });
    const { protocolNotes } = generateProtocol(quiz, 'premium');

    const guide = findNote(protocolNotes, 'athlete-electrolyte-guide')!;
    expect(guide.content).toContain('Potassium');
    expect(guide.content).toContain('200–400 mg per hour');
  });

  it('content includes pre/during/post training timing', () => {
    const quiz = baseQuiz({ activityLevel: 'athlete' });
    const { protocolNotes } = generateProtocol(quiz, 'premium');

    const guide = findNote(protocolNotes, 'athlete-electrolyte-guide')!;
    expect(guide.content).toContain('Pre-training');
    expect(guide.content).toContain('During training');
    expect(guide.content).toContain('Post-training');
  });

  it('content mentions magnesium is already in protocol', () => {
    const quiz = baseQuiz({ activityLevel: 'athlete' });
    const { protocolNotes } = generateProtocol(quiz, 'premium');

    const guide = findNote(protocolNotes, 'athlete-electrolyte-guide')!;
    expect(guide.content).toContain('Magnesium: already in your supplement protocol');
  });

  it('content recommends electrolyte mix over individual supplements', () => {
    const quiz = baseQuiz({ activityLevel: 'athlete' });
    const { protocolNotes } = generateProtocol(quiz, 'premium');

    const guide = findNote(protocolNotes, 'athlete-electrolyte-guide')!;
    expect(guide.content).toContain('electrolyte mix');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MAGNESIUM NOTE REFERENCES PROTOCOL-LEVEL GUIDE
// ─────────────────────────────────────────────────────────────────────────────

describe('Magnesium supplement references protocol guide', () => {
  it('athlete magnesium note references Athlete Electrolyte Guide', () => {
    const quiz = baseQuiz({ activityLevel: 'athlete' });
    const { recommendations } = generateProtocol(quiz, 'premium');

    const mg = recommendations.find(r => r.id.startsWith('magnesium-'));
    expect(mg).toBeDefined();
    expect(mg!.notes.some(n => n.includes('Athlete Electrolyte Guide'))).toBe(true);
  });

  it('non-athlete magnesium has no electrolyte guide reference', () => {
    const quiz = baseQuiz({ activityLevel: 'moderate' });
    const { recommendations } = generateProtocol(quiz, 'premium');

    const mg = recommendations.find(r => r.id.startsWith('magnesium-'));
    expect(mg).toBeDefined();
    expect(mg!.notes.some(n => n.includes('Athlete Electrolyte Guide'))).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PROTOCOL NOTES ARRAY — structural checks
// ─────────────────────────────────────────────────────────────────────────────

describe('protocolNotes structure', () => {
  it('protocolNotes is always an array (even if empty)', () => {
    const quiz = baseQuiz({ activityLevel: 'sedentary' });
    const { protocolNotes } = generateProtocol(quiz, 'premium');

    expect(Array.isArray(protocolNotes)).toBe(true);
    expect(protocolNotes.length).toBe(0);
  });

  it('each note has type, title, and content fields', () => {
    const quiz = baseQuiz({ activityLevel: 'athlete' });
    const { protocolNotes } = generateProtocol(quiz, 'premium');

    for (const note of protocolNotes) {
      expect(typeof note.type).toBe('string');
      expect(typeof note.title).toBe('string');
      expect(typeof note.content).toBe('string');
      expect(note.type.length).toBeGreaterThan(0);
      expect(note.title.length).toBeGreaterThan(0);
      expect(note.content.length).toBeGreaterThan(0);
    }
  });
});
