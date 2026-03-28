// ─────────────────────────────────────────────────────────────────────────────
// NutriGenius — Weekly Schedule Generator
// Converts approved Recommendation[] into a Mon-Sun timed schedule.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Recommendation,
  WeeklySchedule,
  DaySchedule,
  TimeSlot,
  ScheduledSupplement,
  ScheduleSummary,
  CyclingPattern,
  QuizData,
  CYCLE_DAILY,
  CYCLE_WEEKDAYS,
  CYCLE_ALTERNATE_DAY,
  CYCLE_6ON1OFF,
} from '../types';

type TimingSlot = 'morning-empty' | 'morning-with-food' | 'midday' | 'evening' | 'bedtime';

// ── Constants ────────────────────────────────────────────────────────────────

const DAY_NAMES = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
] as const;

const SLOT_LABELS: Record<TimingSlot, string> = {
  'morning-empty':    'Morning (empty stomach)',
  'morning-with-food': 'With Breakfast',
  'midday':           'With Lunch',
  'evening':          'With Dinner',
  'bedtime':          'Before Bed',
};

const SLOT_ORDER: TimingSlot[] = [
  'morning-empty', 'morning-with-food', 'midday', 'evening', 'bedtime',
];

// ── Default cycling patterns ─────────────────────────────────────────────────

/** Mon–Fri cycling for probiotics (Sat + Sun off) */
const CYCLE_MON_FRI: CyclingPattern = {
  type: '5on2off',
  activeDays: [true, true, true, true, true, false, false],
  description: 'Mon–Fri',
};

// ── Cycling override rules ───────────────────────────────────────────────────

interface CyclingOverride {
  test: (id: string) => boolean;
  cycling: CyclingPattern;
  note: string;
}

/**
 * Applied when cyclingPattern.type === 'daily' and the supplement ID matches.
 * Order matters — first match wins.
 */
const CYCLING_OVERRIDES: CyclingOverride[] = [
  {
    test: id => /zinc/.test(id) && !/vitamin/.test(id),
    cycling: CYCLE_WEEKDAYS,
    note: 'Zinc: Mon–Fri only — weekend off allows copper rebalancing',
  },
  {
    test: id => /probiotic|lactobacillus|bifidobacterium/.test(id),
    cycling: CYCLE_MON_FRI,
    note: 'Probiotics: 5 days on, 2 days off (weekends off)',
  },
  {
    test: id => id === 'nac' || /n-acetyl-cysteine/.test(id),
    cycling: CYCLE_WEEKDAYS,
    note: 'NAC: weekday cycling for optimal glutathione support',
  },
  {
    test: id => /^iron|iron-bisglycinate|iron-glycinate|ferrous|ferric/.test(id),
    cycling: CYCLE_ALTERNATE_DAY,
    note: 'Iron: alternate days — improved absorption when hepcidin levels normalize between doses',
  },
  {
    test: id => /ashwagandha|withania/.test(id),
    cycling: CYCLE_6ON1OFF,
    note: 'Ashwagandha: Sunday rest day — traditional adaptogen cycling',
  },
  {
    test: id => /rhodiola/.test(id),
    cycling: CYCLE_6ON1OFF,
    note: 'Rhodiola: Sunday rest day — traditional adaptogen cycling',
  },
  {
    test: id => /lion.?s?.?mane|hericium/.test(id),
    cycling: CYCLE_6ON1OFF,
    note: "Lion's Mane: Sunday rest day — traditional adaptogen cycling",
  },
  {
    test: id => /bacopa/.test(id),
    cycling: CYCLE_6ON1OFF,
    note: 'Bacopa: Sunday rest day — traditional adaptogen cycling',
  },
];

// ── Supplement-type helpers ──────────────────────────────────────────────────

const isIron     = (id: string) => /^iron|ferrous|ferric/.test(id);
const isCalcium  = (id: string) => /calcium/.test(id);
const isZincSupp = (id: string) => /zinc/.test(id) && !/vitamin/.test(id);
const isBedtime  = (id: string) =>
  /magnesium.*(glycinate|threonate)|l.?theanine|melatonin|^glycine$|^gaba$|valerian|passionflower|lemon.?balm/.test(id);
const isFatSoluble = (id: string) =>
  /vitamin.?[adek]|coq10|lycopene|astaxanthin|ubiquinol/.test(id);

// ── Primary timing assignment ────────────────────────────────────────────────

/**
 * Determines which time slot a supplement should be assigned to.
 * This is the schedule generator's authoritative source — it may differ
 * from the rec.timing field set by individual layers.
 */
function assignPrimaryTiming(rec: Recommendation): TimingSlot {
  const id = rec.id.toLowerCase();

  // ── Bedtime ──────────────────────────────────────────────────────────────
  if (isBedtime(id)) return 'bedtime';

  // ── Morning empty stomach ─────────────────────────────────────────────────
  if (/probiotic|lactobacillus|bifidobacterium/.test(id)) return 'morning-empty';

  // ── Midday (with fat-containing meal) ─────────────────────────────────────
  if (/omega.?3|fish.?oil|algae.?oil|dha|epa(?!.*vitamin)|curcumin|turmeric|alpha.?lipoic/.test(id)) {
    return 'midday';
  }

  // ── Evening with dinner ───────────────────────────────────────────────────
  if (isCalcium(id)) return 'evening';
  if (isZincSupp(id)) return 'evening';
  if (/evening.?primrose/.test(id)) return 'evening';

  // ── Morning with food (fat-solubles, B vitamins, energizing) ─────────────
  // Covers: vitamin A/D/E/K2, CoQ10, B-complex, B12, ashwagandha,
  //         rhodiola, iron, creatine, lycopene, berberine (1st dose)
  if (
    isFatSoluble(id) ||
    /vitamin.?b|b.complex|b12|riboflavin|niacin|thiamine|pyridoxine/.test(id) ||
    /ashwagandha|rhodiola|lion.?s?.?mane|bacopa/.test(id) ||
    /creatine|berberine|iron|ferrous|ferric/.test(id)
  ) {
    return 'morning-with-food';
  }

  // ── Fall back to the layer-assigned timing ────────────────────────────────
  if (rec.timing.length > 0) return rec.timing[0] as TimingSlot;

  return 'morning-with-food';
}

// ── Multi-dose slot expansion ─────────────────────────────────────────────────

/**
 * Returns the list of time slots for one supplement occurrence on a given day.
 * Respects frequency (daily / twice-daily / three-times-daily).
 */
function getInitialSlots(rec: Recommendation): TimingSlot[] {
  const primary = assignPrimaryTiming(rec);

  if (rec.frequency === 'daily') return [primary];

  if (rec.frequency === 'twice-daily') {
    // Use layer-assigned second timing if distinct, otherwise default split
    const second = rec.timing[1] as TimingSlot | undefined;
    if (second && second !== primary && SLOT_ORDER.includes(second)) {
      return [primary, second];
    }
    const fallback: TimingSlot =
      primary === 'evening' || primary === 'bedtime' ? 'morning-with-food' : 'evening';
    return [primary, fallback];
  }

  if (rec.frequency === 'three-times-daily') {
    return ['morning-with-food', 'midday', 'evening'];
  }

  return [primary];
}

// ── Separation rules ──────────────────────────────────────────────────────────

/**
 * Mutates slotMap to enforce:
 * - Iron never in the same slot as calcium
 * - Iron never in the same slot as zinc
 */
function applySeparationRules(
  recs: Recommendation[],
  slotMap: Map<string, TimingSlot[]>,
): void {
  const ironRec = recs.find(r => isIron(r.id));
  if (!ironRec) return;

  const ironPrimary = slotMap.get(ironRec.id)?.[0] ?? 'morning-with-food';

  const resolveConflict = (conflictSlot: TimingSlot): TimingSlot =>
    ironPrimary === 'morning-with-food' ? 'evening' : 'morning-with-food';

  for (const rec of recs) {
    if (rec.id === ironRec.id) continue;

    if (isCalcium(rec.id) || isZincSupp(rec.id)) {
      const slots = slotMap.get(rec.id) ?? [];
      if (slots.includes(ironPrimary)) {
        slotMap.set(
          rec.id,
          slots.map(s => (s === ironPrimary ? resolveConflict(s) : s)),
        );
      }
    }
  }
}

// ── Calcium split (>500 mg) ───────────────────────────────────────────────────

/**
 * If total calcium dose exceeds 500 mg, splits into two time slots
 * (absorption is capped at ~500 mg per dose).
 * Avoids iron's slot when choosing the second slot.
 */
function applyCalciumSplit(
  recs: Recommendation[],
  slotMap: Map<string, TimingSlot[]>,
  ironSlot: TimingSlot | null,
): void {
  const calcRec = recs.find(r => isCalcium(r.id));
  if (!calcRec || calcRec.dose <= 500) return;

  const current = slotMap.get(calcRec.id) ?? ['evening'];
  if (current.length >= 2) return; // already split

  const primary = current[0];
  const candidates: TimingSlot[] = SLOT_ORDER.filter(
    s => s !== primary && s !== 'bedtime' && s !== ironSlot,
  );
  const second: TimingSlot = candidates[0] ?? 'midday';
  const ordered = [primary, second].sort(
    (a, b) => SLOT_ORDER.indexOf(a) - SLOT_ORDER.indexOf(b),
  );
  slotMap.set(calcRec.id, ordered);
}

// ── Food-interaction note rules ──────────────────────────────────────────────

const isProbiotic = (id: string) => /probiotic|lactobacillus|bifidobacterium/.test(id);
const isNac = (id: string) => id === 'nac' || /n-acetyl-cysteine/.test(id);
const isFiber = (id: string) => /psyllium|fiber/.test(id);
const isGreenTea = (id: string) => /green.?tea|egcg/.test(id);
const isCurcumin = (id: string) => /curcumin|turmeric/.test(id);

/**
 * Build food-supplement interaction notes for a supplement in a given slot.
 * These are actionable per-slot tips displayed as helper text.
 */
function buildFoodNotes(
  rec: Recommendation,
  slot: TimingSlot,
  quiz?: QuizData,
): string[] {
  const foodNotes: string[] = [];

  // Iron — tannin / calcium interaction
  if (isIron(rec.id)) {
    foodNotes.push(
      'Avoid coffee, tea, and dairy within 1 hour of taking iron — tannins and calcium block iron absorption',
    );
  }

  // Probiotics — empty stomach
  if (isProbiotic(rec.id) && slot === 'morning-empty') {
    foodNotes.push('Take on an empty stomach, 30 minutes before eating');
  }

  // NAC — empty stomach
  if (isNac(rec.id) && slot === 'morning-empty') {
    foodNotes.push('Best absorbed on an empty stomach');
  }

  // Fat-soluble vitamins (A, D, E, K2, CoQ10, Astaxanthin, Lycopene)
  if (isFatSoluble(rec.id)) {
    foodNotes.push(
      'Take with a meal containing fat (eggs, avocado, nuts, olive oil) for proper absorption',
    );
  }

  // Fiber / Psyllium
  if (isFiber(rec.id)) {
    foodNotes.push(
      'Take with a large glass of water. Separate from other supplements and medications by 2 hours — fiber can bind and reduce their absorption',
    );
  }

  // Thyroid medication — check if user is on levothyroxine
  if (
    quiz?.medications?.some(m =>
      /levothyroxine|synthroid|thyroxine|eltroxin/.test(m.toLowerCase()),
    ) &&
    (isIron(rec.id) || isCalcium(rec.id) || /magnesium/.test(rec.id))
  ) {
    foodNotes.push(
      'Take thyroid medication first thing in the morning on empty stomach. Wait 4 hours before taking calcium, iron, or magnesium supplements',
    );
  }

  // Green Tea Extract / EGCG
  if (isGreenTea(rec.id)) {
    foodNotes.push(
      'Take between meals — EGCG can inhibit iron absorption if taken with food',
    );
  }

  // Curcumin (non-liposomal/phytosome)
  if (isCurcumin(rec.id) && !/liposomal|phytosome|novaSOL|meriva/.test(rec.form.toLowerCase())) {
    foodNotes.push(
      'Take with a fat-containing meal and black pepper for absorption',
    );
  }

  return foodNotes;
}

// ── ScheduledSupplement builder ───────────────────────────────────────────────

function toScheduledSupplement(
  rec: Recommendation,
  slot: TimingSlot,
  isSplit: boolean,
  quiz?: QuizData,
): ScheduledSupplement {
  const notes: string[] = [...rec.notes];

  if (isIron(rec.id)) {
    notes.push('Separate from calcium and zinc by 2+ hours');
    if (slot === 'morning-with-food' || slot === 'morning-empty') {
      notes.push('Take with Vitamin C to enhance absorption');
    }
  }

  if (isSplit) {
    notes.push('Dose split — absorption is limited to ~500 mg per dose');
  }

  const foodNotes = buildFoodNotes(rec, slot, quiz);

  return {
    supplementName: rec.supplementName,
    form: rec.form,
    dose: isSplit ? Math.round(rec.dose / 2) : rec.dose,
    doseUnit: rec.doseUnit,
    withFood: rec.withFood,
    notes,
    foodNotes: foodNotes.length > 0 ? foodNotes : undefined,
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Converts an approved Recommendation[] (output of runSafetyFilter) into
 * a Mon–Sun weekly schedule where days differ by cycling pattern.
 *
 * @param recs   Approved supplements from the safety filter.
 * @param quiz   Optional quiz data — used for thyroid-medication schedule notes.
 */
export function generateWeeklySchedule(
  recs: Recommendation[],
  quiz?: QuizData,
): WeeklySchedule {
  if (recs.length === 0) return buildEmptySchedule();

  // ── Step 1: Apply cycling overrides ────────────────────────────────────────
  const cyclingNotes: string[] = [];
  const effectiveCycling = new Map<string, CyclingPattern>();
  let anyCyclingOverrideApplied = false;

  for (const rec of recs) {
    let cycling = rec.cyclingPattern;
    if (cycling.type === 'daily') {
      for (const override of CYCLING_OVERRIDES) {
        if (override.test(rec.id)) {
          cycling = override.cycling;
          anyCyclingOverrideApplied = true;
          if (!cyclingNotes.includes(override.note)) {
            cyclingNotes.push(override.note);
          }
          break;
        }
      }
    }
    effectiveCycling.set(rec.id, cycling);
  }

  // Streamlined note: ≤4 supplements with no specific cycling requirements
  if (!anyCyclingOverrideApplied && recs.length <= 4) {
    cyclingNotes.push('Your streamlined protocol is taken consistently every day');
  }

  // ── Step 2: Initial slot assignment ────────────────────────────────────────
  const slotMap = new Map<string, TimingSlot[]>();
  for (const rec of recs) {
    slotMap.set(rec.id, getInitialSlots(rec));
  }

  // ── Step 3: Separation rules ────────────────────────────────────────────────
  applySeparationRules(recs, slotMap);

  // ── Step 4: Calcium split ───────────────────────────────────────────────────
  const ironRec = recs.find(r => isIron(r.id));
  const ironSlot: TimingSlot | null = ironRec
    ? (slotMap.get(ironRec.id)?.[0] ?? null)
    : null;
  applyCalciumSplit(recs, slotMap, ironSlot);

  // Track which recs have split calcium (for dose display)
  const calciumIsSplit = (() => {
    const calcRec = recs.find(r => isCalcium(r.id));
    return calcRec ? (slotMap.get(calcRec.id)?.length ?? 0) > 1 : false;
  })();

  // ── Step 5: Optional thyroid-medication note ────────────────────────────────
  if (quiz?.medications.some(m => /levothyroxine|synthroid|thyroxine|eltroxin/.test(m.toLowerCase()))) {
    cyclingNotes.push(
      'Thyroid medication: Take first thing in the morning on an empty stomach, ' +
      'then wait 4 hours before taking calcium, iron, or magnesium',
    );
  }

  // ── Step 6: Build 7-day schedule ────────────────────────────────────────────
  const days: DaySchedule[] = [];

  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    // Filter supplements active on this day
    const dayRecs = recs.filter(rec => effectiveCycling.get(rec.id)!.activeDays[dayIdx]);

    // Populate slot → supplements map for this day
    const daySlotMap = new Map<TimingSlot, ScheduledSupplement[]>();

    for (const rec of dayRecs) {
      const slots = slotMap.get(rec.id) ?? ['morning-with-food'];
      const isSplit = isCalcium(rec.id) && calciumIsSplit;

      for (const slot of slots) {
        if (!daySlotMap.has(slot)) daySlotMap.set(slot, []);
        daySlotMap.get(slot)!.push(toScheduledSupplement(rec, slot, isSplit, quiz));
      }
    }

    // Build ordered time slot list (only non-empty slots)
    const timeSlots: TimeSlot[] = SLOT_ORDER.filter(
      slot => (daySlotMap.get(slot)?.length ?? 0) > 0,
    ).map(slot => ({
      timing: slot,
      displayLabel: SLOT_LABELS[slot],
      supplements: daySlotMap.get(slot)!,
    }));

    days.push({
      dayName: DAY_NAMES[dayIdx],
      dayIndex: dayIdx,
      timeSlots,
      totalSupplements: dayRecs.length,
    });
  }

  // ── Step 7: Summary ─────────────────────────────────────────────────────────
  const dailyCounts = days.map(d => d.totalSupplements);
  const rawAverage = dailyCounts.reduce((a, b) => a + b, 0) / 7;

  const usedSlotSet = new Set<string>();
  for (const day of days) {
    for (const slot of day.timeSlots) {
      usedSlotSet.add(slot.displayLabel);
    }
  }

  const summary: ScheduleSummary = {
    totalUniqueSupplements: recs.length,
    dailyAverage: Math.round(rawAverage * 10) / 10,
    timeSlotsUsed: SLOT_ORDER.map(s => SLOT_LABELS[s]).filter(label => usedSlotSet.has(label)),
    cyclingNotes,
  };

  return { days, summary };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildEmptySchedule(): WeeklySchedule {
  return {
    days: DAY_NAMES.map((dayName, dayIndex) => ({
      dayName,
      dayIndex,
      timeSlots: [],
      totalSupplements: 0,
    })),
    summary: {
      totalUniqueSupplements: 0,
      dailyAverage: 0,
      timeSlotsUsed: [],
      cyclingNotes: [],
    },
  };
}

// Re-export the type alias so callers can import it from this module
export type { TimingSlot };
