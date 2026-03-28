// ─────────────────────────────────────────────────────────────────────────────
// Time-to-Effect Lookup
//
// Maps supplement IDs → human-readable estimates of how long until the user
// should expect noticeable effects. Used by the pipeline to populate
// Recommendation.timeToEffect before the response is sent.
// ─────────────────────────────────────────────────────────────────────────────

import type { Recommendation } from '../types';

/**
 * Clinically-informed time-to-effect estimates keyed by supplement ID.
 *
 * Sources: examine.com, PubMed systematic reviews, and product monographs.
 * These are approximate ranges — individual responses vary.
 */
export const TIME_TO_EFFECT: Record<string, string> = {
  // ── Vitamins ────────────────────────────────────────────────────────────────
  'vitamin-d3':          '8-12 weeks to reach steady-state serum levels',
  'vitamin-b12':         '2-4 weeks for energy improvement; 3-6 months for deficiency repletion',
  'vitamin-c':           '1-2 weeks for tissue saturation',
  'vitamin-a':           '2-4 weeks',
  'vitamin-e':           '4-8 weeks',
  'vitamin-e-mixed-tocopherols': '4-8 weeks',
  'vitamin-e-tocotrienol': '4-8 weeks',
  'vitamin-k2':          '4-8 weeks for calcium metabolism effects',
  'vitamin-k2-mk7':      '4-8 weeks for calcium metabolism effects',
  'vitamin-b6':          '2-4 weeks',
  'b-complex':           '2-4 weeks for energy and mood support',
  'riboflavin-b2':       '2-4 weeks; up to 3 months for migraine frequency reduction',
  'thiamine-b1':         '2-4 weeks',
  'biotin':              '3-6 months for hair/nail growth',
  'folate-5mthf':        '4-8 weeks for homocysteine reduction',
  'folic-acid':          '4-8 weeks for homocysteine reduction',
  'pantothenic-acid':    '2-4 weeks',
  'beta-carotene':       '4-8 weeks for antioxidant effects',

  // ── Minerals ────────────────────────────────────────────────────────────────
  'magnesium-glycinate': '1-2 weeks for sleep improvement; 4-6 weeks for anxiety/mood',
  'mag-l-threonate':     '2-4 weeks for cognitive effects',
  'iron-bisglycinate':   '3-6 months to normalize ferritin stores',
  'zinc-picolinate':     '2-4 weeks',
  'zinc-carnosine':      '4-8 weeks for gut lining repair',
  'calcium-citrate':     '3+ months for bone density effects',
  'selenium':            '2-4 weeks',
  'iodine':              '4-8 weeks for thyroid effects',
  'chromium-picolinate':  '4-8 weeks for blood sugar effects',
  'potassium-citrate':   '1-2 weeks for electrolyte balance',
  'copper-glycinate':    '2-4 weeks',
  'choline':             '2-4 weeks',
  'choline-bitartrate':  '2-4 weeks',

  // ── Omega Fatty Acids ──────────────────────────────────────────────────────
  'omega-3-fish-oil':    '6-12 weeks for anti-inflammatory effects; 2-4 weeks for triglyceride reduction',
  'dha-algae':           '6-12 weeks for anti-inflammatory effects',
  'evening-primrose-oil': '8-12 weeks for hormonal/skin effects',

  // ── Adaptogens & Herbals ───────────────────────────────────────────────────
  'ashwagandha':         '4-8 weeks for cortisol reduction and stress relief',
  'ashwagandha-ksm66':   '4-8 weeks for full cortisol-lowering effect',
  'rhodiola-rosea':      '1-2 weeks for acute stress; 4-8 weeks for sustained effects',
  'bacopa-monnieri':     '8-12 weeks for cognitive benefits — do not expect quick results',
  'lions-mane':          '4-8 weeks for cognitive effects',
  'holy-basil':          '4-6 weeks',
  'ginkgo-biloba':       '4-8 weeks for cognitive effects',
  'panax-ginseng':       '2-4 weeks for energy; 4-8 weeks for cognitive effects',
  'cordyceps':           '2-4 weeks for energy and exercise performance',
  'maca':                '6-8 weeks for hormonal/libido effects',
  'saw-palmetto':        '4-8 weeks for prostate symptom improvement',
  'black-cohosh':        '4-8 weeks for menopause symptom relief',
  'milk-thistle':        '4-8 weeks for liver enzyme improvement',
  'valerian-root':       '2-4 weeks for sleep improvement',
  'elderberry':          'Within 48 hours for cold/flu symptom onset',
  'elderberry-extract':  'Within 48 hours for cold/flu symptom onset',
  'echinacea':           'Within 48 hours when taken at symptom onset',
  'vitex-chasteberry':   '3-6 months for hormonal cycle regulation',
  'lemon-balm':          '1-2 weeks for calming/sleep effects',
  'passionflower':       '1-2 weeks for anxiety/sleep improvement',

  // ── Amino Acids & Proteins ─────────────────────────────────────────────────
  'l-theanine':          '30-60 minutes for acute calming effect',
  'nac':                 '2-4 weeks for glutathione repletion',
  'creatine-monohydrate': '2-4 weeks to saturate muscle stores at 5 g/day',
  'l-citrulline':        '1-2 weeks for blood flow effects',
  'beta-alanine':        '2-4 weeks to build carnosine stores',
  'glycine':             'Same evening for sleep improvement',
  'collagen-peptides':   '8-12 weeks for skin/joint benefits',
  'collagen-type-ii':    '8-12 weeks for joint benefits',
  'l-glutamine':         '2-4 weeks for gut lining repair',
  'same':                '2-4 weeks for mood effects',
  'acetyl-l-carnitine':  '4-8 weeks for energy/cognitive effects',
  'l-carnitine':         '4-8 weeks for energy/fat metabolism',
  'taurine':             '1-2 weeks',
  '5-htp':               '2-4 weeks for mood/sleep effects',
  'gaba':                '30-60 minutes for acute calming effect',
  'alpha-gpc':           '1-2 weeks for cognitive effects',
  'betaine-tmg':         '4-8 weeks for homocysteine reduction',

  // ── Probiotics & Gut ───────────────────────────────────────────────────────
  'probiotic-blend':     '2-4 weeks for gut colonization and symptom improvement',
  'probiotic-broad':     '2-4 weeks for gut colonization and symptom improvement',
  'probiotic-vsl3':      '2-4 weeks for gut colonization and symptom improvement',
  'probiotics':          '2-4 weeks for gut colonization and symptom improvement',
  'digestive-enzymes':   'Immediate — take with meals',
  'digestive-enzyme-complex': 'Immediate — take with meals',
  'psyllium-husk':       '1-3 days for bowel regularity',
  'peppermint-oil':      'Within 1-2 hours for digestive relief',

  // ── Antioxidants & Compounds ───────────────────────────────────────────────
  'coq10':               '4-8 weeks for energy and cardiac benefits',
  'coq10-ubiquinol':     '4-8 weeks for energy and cardiac benefits',
  'alpha-lipoic-acid':   '3-4 weeks for blood sugar effects; 4-8 weeks for neuropathy',
  'ala':                 '3-4 weeks for blood sugar effects; 4-8 weeks for neuropathy',
  'resveratrol':         '4-8 weeks (long-term benefits still being studied)',
  'nmn':                 '2-4 weeks for subjective energy; long-term effects under study',
  'quercetin':           '2-4 weeks for anti-inflammatory/antihistamine effects',
  'astaxanthin':         '4-8 weeks for skin/UV protection',
  'glutathione':         '2-4 weeks',
  'phosphatidylserine':  '4-8 weeks for cognitive effects',
  'green-tea-egcg':      '4-8 weeks for metabolic effects',
  'green-tea-extract':   '4-8 weeks for metabolic effects',
  'sulforaphane':        '2-4 weeks for antioxidant/detox effects',
  'pine-bark-extract':   '4-8 weeks for circulatory and skin effects',
  'lycopene':            '4-8 weeks for antioxidant effects',
  'lutein':              '8-12 weeks for eye health effects',
  'zeaxanthin':          '8-12 weeks for eye health effects',

  // ── Condition-Specific ─────────────────────────────────────────────────────
  'inositol':            '3-6 months for PCOS hormonal effects',
  'myo-inositol':        '3-6 months for PCOS hormonal effects',
  'd-chiro-inositol':    '3-6 months for PCOS hormonal effects',
  'glucosamine-sulphate': '4-8 weeks for joint pain improvement',
  'glucosamine-chondroitin': '4-8 weeks for joint pain improvement',
  'chondroitin-sulphate': '4-8 weeks for joint benefits',
  'melatonin':           'Same evening — take 30 min before bed',
  'd-mannose':           '1-2 days for UTI symptom prevention',
  'berberine':           '4-8 weeks for blood sugar and lipid effects',
  'curcumin':            '4-8 weeks for anti-inflammatory effects',
  'red-yeast-rice':      '4-8 weeks for cholesterol reduction',
  'nattokinase':         '4-8 weeks for circulatory effects',
  'beta-glucan':         '2-4 weeks for immune modulation',
  'beta-sitosterol':     '4-8 weeks for prostate/cholesterol effects',
  'msm':                 '2-4 weeks for joint/inflammation effects',
  'bromelain':           '1-2 weeks for inflammation/digestion',
  'benfotiamine':        '4-8 weeks for neuropathy effects',
  'cranberry-extract':   '1-2 weeks for urinary tract support',
  'garlic-extract':      '4-8 weeks for cardiovascular effects',
  'ginger-root':         '1-2 weeks for digestive/anti-nausea effects',
  'hyaluronic-acid':     '8-12 weeks for skin/joint hydration',
  'tart-cherry-extract': '1-2 weeks for sleep; 4-8 weeks for joint inflammation',
  'deglycyrrhizinated-licorice': '2-4 weeks for gut/reflux relief',
};

/**
 * Stamps `timeToEffect` onto every recommendation in the array.
 * Called once by the pipeline after all layers have run.
 */
export function applyTimeToEffect(recs: Recommendation[]): Recommendation[] {
  return recs.map(rec => ({
    ...rec,
    timeToEffect: TIME_TO_EFFECT[rec.id] ?? rec.timeToEffect,
  }));
}
