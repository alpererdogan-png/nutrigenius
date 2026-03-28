// ─────────────────────────────────────────────────────────────────────────────
// NutriGenius — Tier Enforcement
// Splits the safety-filtered recommendation list into displayed vs. hidden
// supplements based on the user's subscription tier.
// ─────────────────────────────────────────────────────────────────────────────

import {
  SafetyResult,
  Recommendation,
  PlanTier,
  SupplementCategory,
  TIER_CONFIG,
  LayerName,
} from '../types';

// ── Public types ──────────────────────────────────────────────────────────────

/**
 * Minimal supplement representation shown in the locked/teaser row for free
 * users. Dose, form, timing, reasons, and warnings are intentionally stripped.
 */
export interface HiddenTeaser {
  supplementName: string;
  evidenceRating: Recommendation['evidenceRating'];
  category: SupplementCategory;
}

export interface TieredResult {
  displayedRecommendations: Recommendation[];
  /** Full Recommendation objects — present so the schedule can use them. */
  hiddenRecommendations: Recommendation[];
  /** Stripped-down teasers for the locked UI row. */
  hiddenTeaser: HiddenTeaser[];
  upsellMessage?: string;
}

// ── Sorting constants ─────────────────────────────────────────────────────────

/**
 * Earlier layer → higher display priority in a priority tie.
 * Layer 1 (demographic essentials) always beats Layer 7 (nice-to-haves).
 */
const LAYER_ORDER: LayerName[] = [
  'demographic', 'dietary', 'lifestyle', 'conditions', 'labs', 'genetics', 'goals', 'safety',
];

const EVIDENCE_RANK: Record<Recommendation['evidenceRating'], number> = {
  Strong:      4,
  Moderate:    3,
  Emerging:    2,
  Traditional: 1,
};

// ── Sort comparator ───────────────────────────────────────────────────────────

function sortKey(rec: Recommendation): [number, number, number] {
  const priority = rec.priority;

  const originLayer = rec.sources[0]?.layer ?? 'goals';
  const layerIdx = LAYER_ORDER.indexOf(originLayer as LayerName);
  const layerRank = layerIdx === -1 ? LAYER_ORDER.length : layerIdx;

  const evidenceRank = EVIDENCE_RANK[rec.evidenceRating] ?? 0;

  return [priority, layerRank, evidenceRank];
}

/** Descending sort: highest priority → earliest layer → strongest evidence. */
function compareRecs(a: Recommendation, b: Recommendation): number {
  const [aPri, aLayer, aEvidence] = sortKey(a);
  const [bPri, bLayer, bEvidence] = sortKey(b);

  if (bPri !== aPri)         return bPri - aPri;
  if (aLayer !== bLayer)     return aLayer - bLayer;   // lower index = earlier layer = better
  return bEvidence - aEvidence;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Applies the tier cap and splits recommendations into displayed vs. hidden.
 *
 * Sorting: priority ↓ → originating layer ↑ → evidence strength ↓
 */
export function enforceTier(safetyResult: SafetyResult, tier: PlanTier): TieredResult {
  const config  = TIER_CONFIG[tier];
  const sorted  = [...safetyResult.approvedRecommendations].sort(compareRecs);

  const displayed = sorted.slice(0, config.maxSupplements);
  const hidden    = sorted.slice(config.maxSupplements);

  const hiddenTeaser: HiddenTeaser[] = hidden.map(rec => ({
    supplementName: rec.supplementName,
    evidenceRating: rec.evidenceRating,
    category:       rec.category,
  }));

  const upsellMessage =
    hidden.length > 0
      ? `${hidden.length} additional supplement${hidden.length > 1 ? 's' : ''} identified for your profile`
      : undefined;

  return { displayedRecommendations: displayed, hiddenRecommendations: hidden, hiddenTeaser, upsellMessage };
}
