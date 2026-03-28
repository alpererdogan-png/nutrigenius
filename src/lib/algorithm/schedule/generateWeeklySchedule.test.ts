// ─────────────────────────────────────────────────────────────────────────────
// generateWeeklySchedule — Unit Tests
// ─────────────────────────────────────────────────────────────────────────────

import { generateWeeklySchedule } from './generateWeeklySchedule';
import {
  Recommendation,
  DaySchedule,
  CYCLE_DAILY,
  CYCLE_WEEKDAYS,
  CYCLE_ALTERNATE_DAY,
  CYCLE_6ON1OFF,
} from '../types';

// ── Test helpers ──────────────────────────────────────────────────────────────

function makeRec(id: string, overrides: Partial<Recommendation> = {}): Recommendation {
  const name = id
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return {
    id,
    supplementName: name,
    form: 'standard',
    dose: 100,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: [],
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

/** Returns all supplement IDs present on a given day */
function idsOnDay(day: DaySchedule): string[] {
  return day.timeSlots.flatMap(ts => ts.supplements.map(s => s.supplementName));
}

/** Checks if a specific supplement name appears on a day */
function hasOnDay(day: DaySchedule, name: string): boolean {
  return day.timeSlots.some(ts => ts.supplements.some(s => s.supplementName === name));
}

/** Returns the timing slot(s) that contain the given supplement name on a day */
function slotsForSupp(day: DaySchedule, name: string): string[] {
  return day.timeSlots
    .filter(ts => ts.supplements.some(s => s.supplementName === name))
    .map(ts => ts.timing);
}

// ── Protocol base (5 supplements — triggers cycling overrides) ────────────────
// Reused across multiple tests so cycling rules activate (>4 supplements).

const BASE_5 = () => [
  makeRec('vitamin-d3'),
  makeRec('magnesium-glycinate'),
  makeRec('omega-3'),
  makeRec('vitamin-c'),
  makeRec('vitamin-b-complex'),
];

// ─────────────────────────────────────────────────────────────────────────────
// Test 1: Zinc appears ONLY Mon–Fri
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 1 — Zinc cycling: Mon–Fri only', () => {
  const recs = [...BASE_5(), makeRec('zinc')];

  it('zinc is present on Monday through Friday', () => {
    const schedule = generateWeeklySchedule(recs);
    for (let i = 0; i <= 4; i++) {
      expect(hasOnDay(schedule.days[i], 'Zinc')).toBe(true);
    }
  });

  it('zinc is absent on Saturday and Sunday', () => {
    const schedule = generateWeeklySchedule(recs);
    expect(hasOnDay(schedule.days[5], 'Zinc')).toBe(false); // Saturday
    expect(hasOnDay(schedule.days[6], 'Zinc')).toBe(false); // Sunday
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 2: Iron appears only on alternate days (Mon, Wed, Fri, Sun)
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 2 — Iron cycling: alternate days', () => {
  const recs = [...BASE_5(), makeRec('iron-bisglycinate', { dose: 18, doseUnit: 'mg' })];

  it('iron appears on Mon, Wed, Fri, Sun', () => {
    const schedule = generateWeeklySchedule(recs);
    const ACTIVE = [0, 2, 4, 6]; // Mon=0, Wed=2, Fri=4, Sun=6
    for (const dayIdx of ACTIVE) {
      expect(hasOnDay(schedule.days[dayIdx], 'Iron Bisglycinate')).toBe(true);
    }
  });

  it('iron is absent on Tue, Thu, Sat', () => {
    const schedule = generateWeeklySchedule(recs);
    const INACTIVE = [1, 3, 5];
    for (const dayIdx of INACTIVE) {
      expect(hasOnDay(schedule.days[dayIdx], 'Iron Bisglycinate')).toBe(false);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 3: Ashwagandha absent on Sunday
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 3 — Ashwagandha cycling: off on Sunday', () => {
  const recs = [...BASE_5(), makeRec('ashwagandha')];

  it('ashwagandha is present Mon–Sat', () => {
    const schedule = generateWeeklySchedule(recs);
    for (let i = 0; i <= 5; i++) {
      expect(hasOnDay(schedule.days[i], 'Ashwagandha')).toBe(true);
    }
  });

  it('ashwagandha is absent on Sunday', () => {
    const schedule = generateWeeklySchedule(recs);
    expect(hasOnDay(schedule.days[6], 'Ashwagandha')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 4: Iron and calcium are NEVER in the same time slot
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 4 — Iron ≠ calcium timeslot', () => {
  const recs = [
    makeRec('iron-bisglycinate', { dose: 18, doseUnit: 'mg' }),
    makeRec('calcium', { dose: 400, doseUnit: 'mg' }),
    ...BASE_5(),
  ];

  it('iron and calcium never share a time slot on any day', () => {
    const schedule = generateWeeklySchedule(recs);

    for (const day of schedule.days) {
      for (const slot of day.timeSlots) {
        const suppNames = slot.supplements.map(s => s.supplementName);
        const hasIron = suppNames.some(n => n.toLowerCase().includes('iron'));
        const hasCa   = suppNames.some(n => n.toLowerCase().includes('calcium'));
        expect(hasIron && hasCa).toBe(false);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 5: Monday has a different supplement count than Sunday
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 5 — Monday ≠ Sunday supplement count', () => {
  // zinc (Mon–Fri) + ashwagandha (Mon–Sat) → Sunday is noticeably lighter
  const recs = [
    makeRec('zinc'),
    makeRec('ashwagandha'),
    makeRec('vitamin-d3'),
    makeRec('magnesium-glycinate'),
    makeRec('omega-3'),
  ];

  it('Monday has more supplements than Sunday', () => {
    const schedule = generateWeeklySchedule(recs);
    const monday = schedule.days[0];
    const sunday = schedule.days[6];
    expect(monday.totalSupplements).toBeGreaterThan(sunday.totalSupplements);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 6: Sunday is the lightest day (fewest supplements)
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 6 — Sunday is lightest day', () => {
  // zinc off Sat+Sun, ashwagandha off Sun → Sunday loses both
  const recs = [
    makeRec('zinc'),
    makeRec('ashwagandha'),
    makeRec('vitamin-d3'),
    makeRec('magnesium-glycinate'),
    makeRec('omega-3'),
  ];

  it('Sunday has the fewest supplements across the week', () => {
    const schedule = generateWeeklySchedule(recs);
    const sundayCount = schedule.days[6].totalSupplements;
    for (let i = 0; i < 6; i++) {
      expect(schedule.days[i].totalSupplements).toBeGreaterThanOrEqual(sundayCount);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 7: Separation rules — iron ≠ calcium AND iron ≠ zinc in same slot
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 7 — Separation rules: iron separate from calcium and zinc', () => {
  const recs = [
    makeRec('iron-bisglycinate', { dose: 18, doseUnit: 'mg' }),
    makeRec('calcium', { dose: 400, doseUnit: 'mg' }),
    makeRec('zinc'),
    ...BASE_5(),
  ];

  it('iron and calcium are never in the same time slot', () => {
    const schedule = generateWeeklySchedule(recs);
    for (const day of schedule.days) {
      for (const slot of day.timeSlots) {
        const names = slot.supplements.map(s => s.supplementName.toLowerCase());
        expect(names.some(n => n.includes('iron')) && names.some(n => n.includes('calcium'))).toBe(false);
      }
    }
  });

  it('iron and zinc are never in the same time slot', () => {
    const schedule = generateWeeklySchedule(recs);
    for (const day of schedule.days) {
      for (const slot of day.timeSlots) {
        const names = slot.supplements.map(s => s.supplementName.toLowerCase());
        expect(names.some(n => n.includes('iron')) && names.some(n => n.includes('zinc'))).toBe(false);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 8: Calcium split into 2 doses when >500 mg
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 8 — Calcium split at >500 mg', () => {
  const recs = [makeRec('calcium', { dose: 600, doseUnit: 'mg' }), ...BASE_5()];

  it('calcium appears in exactly 2 distinct time slots on Monday', () => {
    const schedule = generateWeeklySchedule(recs);
    const monday = schedule.days[0];
    const calcSlots = monday.timeSlots.filter(ts =>
      ts.supplements.some(s => s.supplementName.toLowerCase().includes('calcium')),
    );
    expect(calcSlots).toHaveLength(2);
  });

  it('each split calcium dose is half of total dose', () => {
    const schedule = generateWeeklySchedule(recs);
    const monday = schedule.days[0];
    const calciumSupps = monday.timeSlots
      .flatMap(ts => ts.supplements)
      .filter(s => s.supplementName.toLowerCase().includes('calcium'));
    for (const supp of calciumSupps) {
      expect(supp.dose).toBe(300);
    }
  });

  it('calcium ≤500 mg is NOT split', () => {
    const smallRecs = [makeRec('calcium', { dose: 400, doseUnit: 'mg' }), ...BASE_5()];
    const schedule = generateWeeklySchedule(smallRecs);
    const monday = schedule.days[0];
    const calcSlots = monday.timeSlots.filter(ts =>
      ts.supplements.some(s => s.supplementName.toLowerCase().includes('calcium')),
    );
    expect(calcSlots).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 9: All bedtime supplements are in the bedtime slot
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 9 — Bedtime supplements placed in bedtime slot', () => {
  const bedtimeIds = [
    'magnesium-glycinate',
    'magnesium-threonate',
    'l-theanine',
    'melatonin',
    'glycine',
    'gaba',
    'valerian-root',
    'passionflower',
    'lemon-balm',
  ];

  it.each(bedtimeIds)('%s is assigned to the bedtime slot', id => {
    const recs = [makeRec(id), ...BASE_5()];
    const schedule = generateWeeklySchedule(recs);
    const monday = schedule.days[0];
    const suppName = monday.timeSlots
      .flatMap(ts => ts.supplements)
      .find(s => s.supplementName.toLowerCase().replace(/\s/g, '-') === id);

    // Supplement should be in the bedtime slot
    const bedtimeSlot = monday.timeSlots.find(ts => ts.timing === 'bedtime');
    expect(bedtimeSlot).toBeDefined();
    const inBedtime = bedtimeSlot!.supplements.some(
      s => s.supplementName.toLowerCase().replace(/\s/g, '-') === id,
    );
    expect(inBedtime).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 10: No supplement appears in a slot that contradicts its timing preference
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 10 — Timing preference not contradicted', () => {
  it('probiotics are NOT in the evening or bedtime slot', () => {
    const recs = [makeRec('probiotic-blend'), ...BASE_5()];
    const schedule = generateWeeklySchedule(recs);
    const monday = schedule.days[0];

    for (const slot of monday.timeSlots) {
      if (slot.timing === 'evening' || slot.timing === 'bedtime') {
        const hasProbiotic = slot.supplements.some(s =>
          s.supplementName.toLowerCase().includes('probiotic'),
        );
        expect(hasProbiotic).toBe(false);
      }
    }
  });

  it('omega-3 is NOT in the morning-empty or bedtime slot', () => {
    const recs = [makeRec('omega-3'), ...BASE_5()];
    const schedule = generateWeeklySchedule(recs);
    const monday = schedule.days[0];

    for (const slot of monday.timeSlots) {
      if (slot.timing === 'morning-empty' || slot.timing === 'bedtime') {
        const hasOmega = slot.supplements.some(s =>
          s.supplementName.toLowerCase().includes('omega'),
        );
        expect(hasOmega).toBe(false);
      }
    }
  });

  it('magnesium-glycinate is NOT in a morning slot', () => {
    const recs = [makeRec('magnesium-glycinate'), ...BASE_5()];
    const schedule = generateWeeklySchedule(recs);
    const monday = schedule.days[0];

    for (const slot of monday.timeSlots) {
      if (slot.timing === 'morning-empty' || slot.timing === 'morning-with-food') {
        const hasMag = slot.supplements.some(s =>
          s.supplementName.toLowerCase().includes('magnesium'),
        );
        expect(hasMag).toBe(false);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 11: Summary accurately counts unique supplements
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 11 — Summary: totalUniqueSupplements', () => {
  it('counts exactly the number of distinct recs passed in', () => {
    const recs = [
      makeRec('vitamin-d3'),
      makeRec('magnesium-glycinate'),
      makeRec('omega-3'),
      makeRec('zinc'),
      makeRec('ashwagandha'),
    ];
    const schedule = generateWeeklySchedule(recs);
    expect(schedule.summary.totalUniqueSupplements).toBe(5);
  });

  it('dailyAverage is within expected range', () => {
    // zinc off Sat+Sun (−2 days), ashwagandha off Sun (−1 day)
    // Mon–Fri: 5, Sat: 4 (no zinc), Sun: 3 (no zinc, no ashwagandha)
    // Total = 5*5 + 4 + 3 = 32; average = 32/7 ≈ 4.6
    const recs = [
      makeRec('vitamin-d3'),
      makeRec('magnesium-glycinate'),
      makeRec('omega-3'),
      makeRec('zinc'),
      makeRec('ashwagandha'),
    ];
    const schedule = generateWeeklySchedule(recs);
    expect(schedule.summary.dailyAverage).toBeGreaterThan(0);
    expect(schedule.summary.dailyAverage).toBeLessThanOrEqual(5);
  });

  it('timeSlotsUsed only contains slots that were actually used', () => {
    // Only bedtime supplements → only "Before Bed" should appear
    const recs = [makeRec('magnesium-glycinate'), makeRec('l-theanine')];
    const schedule = generateWeeklySchedule(recs);
    expect(schedule.summary.timeSlotsUsed).toContain('Before Bed');
    expect(schedule.summary.timeSlotsUsed).not.toContain('With Lunch');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 12: Cycling notes are human-readable
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 12 — Cycling notes readability', () => {
  it('zinc note mentions Mon–Fri and copper', () => {
    const recs = [...BASE_5(), makeRec('zinc')];
    const schedule = generateWeeklySchedule(recs);
    const zincNote = schedule.summary.cyclingNotes.find(n => n.toLowerCase().includes('zinc'));
    expect(zincNote).toBeDefined();
    expect(zincNote).toMatch(/Mon/i);
    expect(zincNote).toMatch(/copper/i);
  });

  it('iron note mentions alternate days and hepcidin or absorption', () => {
    const recs = [...BASE_5(), makeRec('iron-bisglycinate', { dose: 18 })];
    const schedule = generateWeeklySchedule(recs);
    const ironNote = schedule.summary.cyclingNotes.find(n => n.toLowerCase().includes('iron'));
    expect(ironNote).toBeDefined();
    expect(ironNote).toMatch(/alternate/i);
  });

  it('ashwagandha note mentions Sunday rest day', () => {
    const recs = [...BASE_5(), makeRec('ashwagandha')];
    const schedule = generateWeeklySchedule(recs);
    const note = schedule.summary.cyclingNotes.find(n => n.toLowerCase().includes('ashwagandha'));
    expect(note).toBeDefined();
    expect(note).toMatch(/sunday/i);
  });

  it('all cycling notes are non-empty strings', () => {
    const recs = [...BASE_5(), makeRec('zinc'), makeRec('ashwagandha'), makeRec('iron-bisglycinate')];
    const schedule = generateWeeklySchedule(recs);
    for (const note of schedule.summary.cyclingNotes) {
      expect(typeof note).toBe('string');
      expect(note.length).toBeGreaterThan(10);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 13: Protocol with ≤4 daily supplements → no forced cycling + streamlined note
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 13 — Streamlined protocol (≤4 daily, no cycling overrides)', () => {
  const recs = [
    makeRec('vitamin-d3'),
    makeRec('magnesium-glycinate'),
    makeRec('omega-3'),
  ];

  it('every supplement appears on all 7 days', () => {
    const schedule = generateWeeklySchedule(recs);
    for (const day of schedule.days) {
      expect(day.totalSupplements).toBe(3);
    }
  });

  it('includes the streamlined note', () => {
    const schedule = generateWeeklySchedule(recs);
    expect(schedule.summary.cyclingNotes).toContain(
      'Your streamlined protocol is taken consistently every day',
    );
  });

  it('has no other cycling notes', () => {
    const schedule = generateWeeklySchedule(recs);
    expect(schedule.summary.cyclingNotes).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 14: Fat-soluble vitamins are in morning-with-food or midday
// ─────────────────────────────────────────────────────────────────────────────
describe('Test 14 — Fat-soluble vitamins in morning-with-food or midday', () => {
  const fatSolubles = ['vitamin-d3', 'vitamin-e', 'vitamin-k2', 'vitamin-a', 'coq10', 'lycopene'];

  it.each(fatSolubles)('%s is assigned to morning-with-food or midday', id => {
    const recs = [makeRec(id), ...BASE_5()];
    const schedule = generateWeeklySchedule(recs);
    const monday = schedule.days[0];

    const suppDisplayName = id
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const slot = monday.timeSlots.find(ts =>
      ts.supplements.some(s => s.supplementName === suppDisplayName),
    );

    expect(slot).toBeDefined();
    expect(['morning-with-food', 'midday']).toContain(slot!.timing);
  });

  it('fat-soluble vitamins are NOT placed in bedtime or morning-empty', () => {
    const recs = [
      makeRec('vitamin-d3'),
      makeRec('vitamin-e'),
      makeRec('vitamin-k2'),
      ...BASE_5(),
    ];
    const schedule = generateWeeklySchedule(recs);
    const monday = schedule.days[0];

    const fatSolubleNames = ['Vitamin D3', 'Vitamin E', 'Vitamin K2'];
    for (const slot of monday.timeSlots) {
      if (slot.timing === 'bedtime' || slot.timing === 'morning-empty') {
        for (const supp of slot.supplements) {
          expect(fatSolubleNames).not.toContain(supp.supplementName);
        }
      }
    }
  });
});
