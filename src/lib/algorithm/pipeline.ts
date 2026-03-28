// ─────────────────────────────────────────────────────────────────────────────
// NutriGenius — 7-Layer Pipeline Orchestrator
//
// Runs all layers in order, applies the safety filter, enforces the tier cap,
// and produces a weekly schedule. This is the single entry point for the
// recommendation engine.
// ─────────────────────────────────────────────────────────────────────────────

import { layer1Demographic } from './layers/layer1-demographic';
import { layer2Dietary }     from './layers/layer2-dietary';
import { layer3Lifestyle }   from './layers/layer3-lifestyle';
import { layer4Conditions }  from './layers/layer4-conditions';
import { layer5Labs }        from './layers/layer5-labs';
import { layer6Genetics }    from './layers/layer6-genetics';
import { layer7Goals }       from './layers/layer7-goals';
import { applySynergyPairs } from './synergy/synergyPairs';
import { runSafetyFilter }   from './safety/safetyFilter';
import { generateWeeklySchedule } from './schedule/generateWeeklySchedule';
import { enforceTier }       from './tier/tierEnforcement';
import { optimizeAbsorption }     from './optimizers/absorptionOptimizer';
import { optimizeMagnesiumForm } from './optimizers/magnesiumOptimizer';
import { applyTimeToEffect } from './data/timeToEffect';
import { applyMonitoringNotes } from './data/monitoringNotes';

import {
  QuizData,
  PlanTier,
  LayerName,
  Recommendation,
  BlockedSupplement,
  SafetyWarning,
  SupplementInteraction,
  ULCheck,
  WeeklySchedule,
} from './types';

// ── Result types ──────────────────────────────────────────────────────────────

export interface PipelineMetadata {
  /** Always 7 — the total number of layers in the pipeline. */
  totalLayers: 7;
  /** Which layers actually ran (Layer 5 and 6 are conditional). */
  activeLayers: LayerName[];
  /** Count of approved recommendations after the safety filter. */
  totalRecommendations: number;
  /** Count shown to the user (tier-capped). */
  displayedCount: number;
  /** Count hidden behind the paywall. */
  hiddenCount: number;
  /** ISO 8601 timestamp. */
  generatedAt: string;
}

export interface PipelineResult {
  /** All approved recommendations (full list, pre-tier cap). */
  recommendations: Recommendation[];
  /** Shown to the user — capped at TIER_CONFIG[tier].maxSupplements. */
  displayedRecommendations: Recommendation[];
  /** Hidden behind the paywall (full objects for schedule and upsell logic). */
  hiddenRecommendations: Recommendation[];
  blocked: BlockedSupplement[];
  warnings: SafetyWarning[];
  interactions: SupplementInteraction[];
  ulChecks: ULCheck[];
  schedule: WeeklySchedule;
  tier: PlanTier;
  upsellMessage?: string;
  metadata: PipelineMetadata;
}

// ── Pipeline ──────────────────────────────────────────────────────────────────

/**
 * Generates a complete, personalised supplement protocol for a user.
 *
 * Layer execution order:
 *   1. Demographic — universal baseline (always runs)
 *   2. Dietary     — vegan/vegetarian gaps, allergies (always runs)
 *   3. Lifestyle   — stress, sleep, activity, smoking (always runs)
 *   4. Conditions  — health-condition specific stacks (always runs)
 *   5. Labs        — lab-value adjustments (runs only when labValues provided)
 *   6. Genetics    — variant-specific personalisation (runs only when geneticVariants provided)
 *   7. Goals       — goal optimisation + hard cap at 10 (always runs)
 *   Safety filter  — drug interactions, UL checks, special blocks
 *   Tier           — cap displayed count, produce upsell teaser
 *   Schedule       — 7-day Mon–Sun schedule (displayed recs only)
 *
 * @param quizData  Completed user quiz data.
 * @param tier      'free' (default, 5 supplements shown) or 'premium' (10 shown).
 */
export function generateProtocol(
  quizData: QuizData,
  tier: PlanTier = 'free',
): PipelineResult {
  const activeLayers: LayerName[] = [];

  // ── Layer 1: Demographic baseline ─────────────────────────────────────────
  let recs = layer1Demographic(quizData);
  activeLayers.push('demographic');

  // ── Layer 2: Dietary gap analysis ─────────────────────────────────────────
  recs = layer2Dietary(quizData, recs);
  activeLayers.push('dietary');

  // ── Layer 3: Lifestyle modifiers ──────────────────────────────────────────
  recs = layer3Lifestyle(quizData, recs);
  activeLayers.push('lifestyle');

  // ── Absorption optimisation (gut-health form selection) ───────────────────
  recs = optimizeAbsorption(quizData, recs);

  // ── Layer 4: Condition-specific stacks ────────────────────────────────────
  recs = layer4Conditions(quizData, recs);
  activeLayers.push('conditions');

  // ── Layer 5: Lab-informed adjustments (optional) ─────────────────────────
  const hasLabs =
    quizData.labValues != null && Object.keys(quizData.labValues).length > 0;
  if (hasLabs) {
    recs = layer5Labs(quizData, recs);
    activeLayers.push('labs');
  }

  // ── Layer 6: Genetic personalisation (optional) ───────────────────────────
  const hasGenetics =
    quizData.geneticVariants != null && Object.keys(quizData.geneticVariants).length > 0;
  if (hasGenetics) {
    recs = layer6Genetics(quizData, recs);
    activeLayers.push('genetics');
  }

  // ── Layer 7: Goal optimisation + hard cap at 10 ───────────────────────────
  recs = layer7Goals(quizData, recs);
  activeLayers.push('goals');

  // ── Magnesium form optimisation ────────────────────────────────────────────
  recs = optimizeMagnesiumForm(quizData, recs);

  // ── Synergy enforcement ───────────────────────────────────────────────────
  recs = applySynergyPairs(recs, quizData);

  // ── Time-to-effect metadata ───────────────────────────────────────────────
  recs = applyTimeToEffect(recs);

  // ── Monitoring notes (lab-tracking recommendations) ───────────────────────
  recs = applyMonitoringNotes(recs);

  // ── Safety filter ─────────────────────────────────────────────────────────
  const safetyResult = runSafetyFilter(quizData, recs);

  // ── Tier enforcement ──────────────────────────────────────────────────────
  const tieredResult = enforceTier(safetyResult, tier);

  // ── Weekly schedule (displayed recommendations only) ─────────────────────
  const schedule = generateWeeklySchedule(
    tieredResult.displayedRecommendations,
    quizData,
  );

  return {
    recommendations:         safetyResult.approvedRecommendations,
    displayedRecommendations: tieredResult.displayedRecommendations,
    hiddenRecommendations:    tieredResult.hiddenRecommendations,
    blocked:                  safetyResult.blockedRecommendations,
    warnings:                 safetyResult.warnings,
    interactions:             safetyResult.supplementInteractions,
    ulChecks:                 safetyResult.ulChecks,
    schedule,
    tier,
    upsellMessage: tieredResult.upsellMessage,
    metadata: {
      totalLayers:          7,
      activeLayers,
      totalRecommendations: safetyResult.approvedRecommendations.length,
      displayedCount:       tieredResult.displayedRecommendations.length,
      hiddenCount:          tieredResult.hiddenRecommendations.length,
      generatedAt:          new Date().toISOString(),
    },
  };
}
