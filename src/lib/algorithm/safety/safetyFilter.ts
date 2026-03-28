// ─────────────────────────────────────────────────────────────────────────────
// NutriGenius — Safety Filter
//
// Final pass after all 7 layers. Checks:
//   1. Drug-supplement interactions (~95 interactions, severity-graded)
//   2. Supplement-supplement interactions (absorption, cumulative effects)
//   3. UL (Upper Tolerable Intake Level) checks across all nutrients
//   4. Special safety passes: smoker, pregnancy, chemotherapy, CKD, allergy
//
// Returns SafetyResult (defined in types.ts):
//   approvedRecommendations — supplements that passed all checks (warnings may have been added)
//   blockedRecommendations  — supplements removed (CRITICAL interactions, pregnancy block, smoker)
//   warnings                — non-blocking flags (MAJOR / MODERATE / BENEFICIAL)
//   supplementInteractions  — supplement–supplement issues (absorption, cumulative)
//   ulChecks                — nutrient totals compared against established ULs
// ─────────────────────────────────────────────────────────────────────────────

import {
  Recommendation,
  QuizData,
  CYCLE_DAILY,
  SafetyResult,
  BlockedSupplement,
  SafetyWarning,
  SupplementInteraction,
  ULCheck,
} from '../types';

// ─── MEDICATION KEYWORD CONSTANTS ─────────────────────────────────────────────

const SSRI_KW = ['ssri', 'sertraline', 'escitalopram', 'fluoxetine', 'paroxetine', 'citalopram', 'fluvoxamine', 'vortioxetine', 'zoloft', 'lexapro', 'prozac', 'paxil', 'celexa', 'trintellix'];
const SNRI_KW = ['snri', 'venlafaxine', 'duloxetine', 'desvenlafaxine', 'milnacipran', 'effexor', 'cymbalta', 'pristiq'];
const MAOI_KW = ['maoi', 'monoamine oxidase', 'phenelzine', 'tranylcypromine', 'selegiline', 'isocarboxazid', 'nardil', 'parnate', 'emsam'];
const WARFARIN_KW = ['warfarin', 'coumadin', 'jantoven'];
const DOAC_KW = ['apixaban', 'rivaroxaban', 'edoxaban', 'dabigatran', 'xarelto', 'eliquis', 'pradaxa', 'savaysa', 'doac', 'direct oral anticoagulant', 'direct-acting oral anticoagulant'];
const ALL_ANTICOAG_KW = [...WARFARIN_KW, ...DOAC_KW];
const STATIN_KW = ['statin', 'atorvastatin', 'rosuvastatin', 'simvastatin', 'pravastatin', 'lovastatin', 'fluvastatin', 'pitavastatin', 'lipitor', 'crestor', 'zocor', 'mevacor', 'pravachol'];
const METFORMIN_KW = ['metformin', 'glucophage', 'fortamet', 'glumetza', 'riomet'];
const SULFONYLUREA_KW = ['glipizide', 'glyburide', 'glimepiride', 'sulfonylurea', 'glucotrol', 'diabeta', 'micronase', 'amaryl'];
const INSULIN_KW = ['insulin', 'lantus', 'levemir', 'humalog', 'novolog', 'tresiba', 'toujeo', 'basaglar', 'humulin', 'novolin'];
const CYCLOSPORINE_KW = ['cyclosporine', 'ciclosporin', 'sandimmune', 'neoral', 'gengraf'];
const TACROLIMUS_KW = ['tacrolimus', 'prograf', 'advagraf', 'astagraf'];
const LEVOTHYROXINE_KW = ['levothyroxine', 'synthroid', 'tirosint', 'liothyronine', 'cytomel', 'thyroid hormone', 'levo-t', 'armour thyroid', 'nature-throid'];
const BENZO_KW = ['benzodiazepine', 'diazepam', 'lorazepam', 'alprazolam', 'clonazepam', 'temazepam', 'midazolam', 'oxazepam', 'triazolam', 'flurazepam', 'nitrazepam', 'valium', 'ativan', 'xanax', 'klonopin', 'restoril'];
const ACE_KW = ['ace inhibitor', 'lisinopril', 'enalapril', 'ramipril', 'perindopril', 'captopril', 'benazepril', 'quinapril', 'fosinopril', 'zestril', 'altace'];
const ARB_KW = ['arb', 'losartan', 'valsartan', 'irbesartan', 'candesartan', 'olmesartan', 'telmisartan', 'cozaar', 'diovan', 'avapro', 'atacand'];
const BETA_BLOCKER_KW = ['metoprolol', 'atenolol', 'propranolol', 'carvedilol', 'bisoprolol', 'nebivolol', 'nadolol', 'beta blocker', 'beta-blocker', 'lopressor', 'toprol', 'tenormin', 'inderal'];
const CCB_KW = ['amlodipine', 'diltiazem', 'verapamil', 'nifedipine', 'felodipine', 'calcium channel blocker', 'ccb', 'norvasc', 'cardizem', 'calan', 'isoptin'];
const DIURETIC_KW = ['furosemide', 'hydrochlorothiazide', 'hctz', 'spironolactone', 'torsemide', 'bumetanide', 'thiazide', 'loop diuretic', 'lasix', 'aldactone', 'zaroxolyn', 'edecrin'];
const PHENYTOIN_KW = ['phenytoin', 'dilantin', 'phenytek', 'fosphenytoin', 'cerebyx'];
const CARBAMAZEPINE_KW = ['carbamazepine', 'tegretol', 'carbatrol', 'epitol'];
const VALPROATE_KW = ['valproic acid', 'valproate', 'divalproex', 'depakote', 'depakene', 'valparin', 'epilim'];
const ANTICONVULSANT_KW = [...PHENYTOIN_KW, ...CARBAMAZEPINE_KW, ...VALPROATE_KW, 'phenobarbital', 'primidone', 'levetiracetam', 'lamotrigine', 'topiramate', 'oxcarbazepine', 'anticonvulsant', 'antiepileptic', 'aed'];
const TETRACYCLINE_KW = ['tetracycline', 'doxycycline', 'minocycline', 'vibramycin', 'monodox'];
const FLUOROQUINOLONE_KW = ['ciprofloxacin', 'levofloxacin', 'moxifloxacin', 'ofloxacin', 'cipro', 'levaquin', 'avelox', 'fluoroquinolone', 'quinolone'];
const LITHIUM_KW = ['lithium', 'lithobid', 'eskalith', 'lithonate'];
const OCP_KW = ['oral contraceptive', 'birth control pill', 'combined pill', 'ethinyl estradiol', 'norethindrone', 'levonorgestrel', 'yaz', 'yasmin', 'ortho', 'loestrin', 'microgestin', 'trinessa', 'sprintec', 'junel', 'lo loestrin'];
const ASPIRIN_KW = ['aspirin', 'asa', 'acetylsalicylic', 'bayer', 'ecotrin', 'bufferin'];
const CLOPIDOGREL_KW = ['clopidogrel', 'plavix', 'prasugrel', 'effient', 'ticagrelor', 'brilinta'];
const CHEMO_KW = ['chemotherapy', 'chemo', 'tamoxifen', 'cisplatin', 'carboplatin', 'cyclophosphamide', 'methotrexate', 'doxorubicin', 'paclitaxel', 'docetaxel', 'bevacizumab', 'trastuzumab', 'imatinib', 'erlotinib', 'fluorouracil', '5-fu', 'gemcitabine', 'oxaliplatin'];
const CORTICOSTEROID_KW = ['prednisone', 'prednisolone', 'dexamethasone', 'methylprednisolone', 'hydrocortisone', 'budesonide', 'corticosteroid', 'steroid', 'medrol', 'decadron'];
const TRIMETHOPRIM_KW = ['trimethoprim', 'sulfamethoxazole', 'cotrimoxazole', 'bactrim', 'septra', 'tmp-smx'];
const RIFAMPICIN_KW = ['rifampicin', 'rifampin', 'rifabutin', 'rifadin', 'rifater', 'rifamate'];
const THIAZIDE_KW = ['hydrochlorothiazide', 'hctz', 'chlorthalidone', 'indapamide', 'metolazone', 'thiazide'];

// ─── DRUG-SUPPLEMENT INTERACTION DATABASE (~95 entries) ───────────────────────

interface DrugInteractionRule {
  /** Medication keyword list — any keyword matching any medication → applies */
  medKeywords: string[];
  /** Human-readable medication label for warning messages */
  medLabel: string;
  /** Supplement IDs — any exact ID match → applies */
  suppIds: string[];
  /** critical → block/remove; major/moderate/informational → warning only */
  severity: 'critical' | 'major' | 'moderate' | 'informational';
  description: string;
  recommendation: string;
}

const DRUG_INTERACTIONS: DrugInteractionRule[] = [
  // ── ANTICOAGULANTS ──────────────────────────────────────────────────────────
  {
    medKeywords: ALL_ANTICOAG_KW, medLabel: 'Anticoagulants (warfarin/DOACs)',
    suppIds: ['st-johns-wort'],
    severity: 'critical',
    description: "St John's Wort is a potent CYP3A4/P-gp inducer that dramatically reduces anticoagulant drug levels, creating a high risk of treatment failure and thromboembolism.",
    recommendation: "Remove St John's Wort immediately. Inform prescriber.",
  },
  {
    medKeywords: WARFARIN_KW, medLabel: 'Warfarin',
    suppIds: ['vitamin-k2-mk7', 'vitamin-k1', 'vitamin-k'],
    severity: 'critical',
    description: "Vitamin K directly antagonises warfarin's mechanism of action by restoring clotting factor synthesis. Even small consistent doses can unpredictably affect INR.",
    recommendation: 'Remove Vitamin K supplementation. If Vitamin K intake changes, INR must be monitored closely.',
  },
  {
    medKeywords: ALL_ANTICOAG_KW, medLabel: 'Anticoagulants',
    suppIds: ['omega-3-fish-oil', 'dha-algae'],
    severity: 'major',
    description: 'Omega-3 fatty acids (EPA/DHA) at doses >3g/day inhibit platelet aggregation and may increase bleeding risk combined with anticoagulants.',
    recommendation: 'Monitor for unusual bleeding. Consider limiting omega-3 to ≤2g/day while anticoagulated.',
  },
  {
    medKeywords: ALL_ANTICOAG_KW, medLabel: 'Anticoagulants',
    suppIds: ['vitamin-e-mixed-tocopherols', 'vitamin-e'],
    severity: 'major',
    description: 'Vitamin E at doses >400 IU inhibits platelet aggregation and vitamin K-dependent clotting factors, increasing bleeding risk.',
    recommendation: 'Limit Vitamin E to ≤200 IU/day if anticoagulation is required.',
  },
  {
    medKeywords: ALL_ANTICOAG_KW, medLabel: 'Anticoagulants',
    suppIds: ['ginkgo-biloba'],
    severity: 'major',
    description: 'Ginkgo biloba inhibits platelet-activating factor (PAF) and has significant antiplatelet effects, substantially increasing bleeding risk with anticoagulants.',
    recommendation: 'Avoid ginkgo with anticoagulants unless under close medical supervision.',
  },
  {
    medKeywords: ALL_ANTICOAG_KW, medLabel: 'Anticoagulants',
    suppIds: ['garlic-extract'],
    severity: 'major',
    description: 'High-dose garlic allicin compounds have documented antiplatelet properties that potentiate anticoagulant effects.',
    recommendation: 'Monitor for unusual bruising or bleeding. Supplemental doses require caution.',
  },
  {
    medKeywords: ALL_ANTICOAG_KW, medLabel: 'Anticoagulants',
    suppIds: ['curcumin'],
    severity: 'major',
    description: 'Curcumin inhibits thromboxane B2 synthesis and platelet aggregation, and may inhibit CYP2C9 affecting warfarin metabolism.',
    recommendation: 'Use with caution. Monitor INR regularly if on warfarin.',
  },
  {
    medKeywords: WARFARIN_KW, medLabel: 'Warfarin',
    suppIds: ['coq10-ubiquinol'],
    severity: 'moderate',
    description: "CoQ10 has structural similarity to Vitamin K2 and may modestly reduce warfarin's anticoagulant efficacy in some patients.",
    recommendation: 'Monitor INR regularly if adding or removing CoQ10. Effect is modest but individual response varies.',
  },
  {
    medKeywords: ALL_ANTICOAG_KW, medLabel: 'Anticoagulants',
    suppIds: ['ginger-extract'],
    severity: 'major',
    description: 'High-dose ginger inhibits thromboxane synthesis and platelet aggregation, potentiating anticoagulant effects.',
    recommendation: 'Avoid high-dose ginger supplements with anticoagulants.',
  },
  {
    medKeywords: ALL_ANTICOAG_KW, medLabel: 'Anticoagulants',
    suppIds: ['bromelain'],
    severity: 'major',
    description: 'Bromelain has fibrinolytic and antiplatelet properties, significantly increasing bleeding risk with anticoagulants.',
    recommendation: 'Avoid bromelain supplementation when on anticoagulant therapy.',
  },
  {
    medKeywords: ALL_ANTICOAG_KW, medLabel: 'Anticoagulants',
    suppIds: ['nattokinase'],
    severity: 'major',
    description: 'Nattokinase is a potent fibrinolytic enzyme — combined with anticoagulants, bleeding risk is very high.',
    recommendation: 'Avoid nattokinase with anticoagulant therapy.',
  },

  // ── SSRI / SNRI ─────────────────────────────────────────────────────────────
  {
    medKeywords: [...SSRI_KW, ...SNRI_KW], medLabel: 'SSRIs/SNRIs',
    suppIds: ['same', 'sam-e', 's-adenosyl-methionine'],
    severity: 'critical',
    description: 'SAMe has significant serotonergic activity. Combined with SSRIs/SNRIs, it can cause serotonin syndrome — a potentially life-threatening condition characterised by agitation, hyperthermia, and neuromuscular instability.',
    recommendation: 'Remove SAMe immediately. Do not combine with serotonergic medications without specialist oversight.',
  },
  {
    medKeywords: [...SSRI_KW, ...SNRI_KW], medLabel: 'SSRIs/SNRIs',
    suppIds: ['5-htp'],
    severity: 'critical',
    description: '5-HTP is a direct serotonin precursor. Combined with SSRIs/SNRIs (which block serotonin reuptake), it can precipitate serotonin syndrome.',
    recommendation: 'Remove 5-HTP immediately. This combination should never be used without specialist oversight.',
  },
  {
    medKeywords: [...SSRI_KW, ...SNRI_KW], medLabel: 'SSRIs/SNRIs',
    suppIds: ['st-johns-wort'],
    severity: 'critical',
    description: "St John's Wort both inhibits serotonin reuptake and induces drug-metabolising enzymes. Combined with SSRIs/SNRIs it causes serotonin syndrome and reduces drug efficacy.",
    recommendation: "Remove St John's Wort. This combination is contraindicated.",
  },
  {
    medKeywords: [...SSRI_KW, ...SNRI_KW], medLabel: 'SSRIs/SNRIs',
    suppIds: ['l-tryptophan'],
    severity: 'major',
    description: 'L-Tryptophan is the dietary precursor to serotonin. Combined with serotonin reuptake inhibitors, serotonin syndrome risk is elevated.',
    recommendation: 'Avoid L-Tryptophan supplementation while on SSRIs/SNRIs.',
  },
  {
    medKeywords: [...SSRI_KW, ...SNRI_KW], medLabel: 'SSRIs/SNRIs',
    suppIds: ['rhodiola-rosea'],
    severity: 'moderate',
    description: 'Rhodiola rosea has mild monoamine-modulating activity and may affect serotonin pathways — theoretical interaction with serotonergic medications.',
    recommendation: 'Use with caution. Monitor for any mood or anxiety changes.',
  },

  // ── MAOIs ────────────────────────────────────────────────────────────────────
  {
    medKeywords: MAOI_KW, medLabel: 'MAOIs',
    suppIds: ['same', 'sam-e', 's-adenosyl-methionine'],
    severity: 'critical',
    description: 'SAMe combined with MAOIs carries an extreme risk of serotonin syndrome. This combination is absolutely contraindicated.',
    recommendation: 'Remove SAMe immediately. Never combine with MAOIs.',
  },
  {
    medKeywords: MAOI_KW, medLabel: 'MAOIs',
    suppIds: ['5-htp'],
    severity: 'critical',
    description: '5-HTP with MAOIs can cause severe, potentially fatal serotonin syndrome. MAOIs prevent serotonin breakdown while 5-HTP increases its synthesis.',
    recommendation: 'Remove 5-HTP immediately. Absolutely contraindicated with MAOIs.',
  },
  {
    medKeywords: MAOI_KW, medLabel: 'MAOIs',
    suppIds: ['st-johns-wort'],
    severity: 'critical',
    description: "St John's Wort with MAOIs creates extreme serotonin toxicity risk. Both increase serotonergic activity through different mechanisms.",
    recommendation: "Remove St John's Wort. Absolutely contraindicated with MAOIs.",
  },
  {
    medKeywords: MAOI_KW, medLabel: 'MAOIs',
    suppIds: ['l-tryptophan'],
    severity: 'critical',
    description: 'L-Tryptophan with MAOIs is extremely dangerous — MAOIs prevent serotonin breakdown while tryptophan increases synthesis, precipitating severe serotonin syndrome.',
    recommendation: 'Remove L-Tryptophan. Absolutely contraindicated with MAOIs.',
  },

  // ── STATINS ──────────────────────────────────────────────────────────────────
  {
    medKeywords: STATIN_KW, medLabel: 'Statins',
    suppIds: ['red-yeast-rice'],
    severity: 'critical',
    description: 'Red Yeast Rice contains monacolin K — pharmacologically identical to lovastatin. Taking it alongside a statin is equivalent to double-dosing, dramatically increasing myopathy and rhabdomyolysis risk.',
    recommendation: 'Remove Red Yeast Rice. This is equivalent to statin double-dosing — potentially causing severe muscle damage.',
  },
  {
    medKeywords: STATIN_KW, medLabel: 'Statins',
    suppIds: ['coq10-ubiquinol'],
    severity: 'informational',
    description: 'Statins inhibit the mevalonate pathway, reducing endogenous CoQ10 synthesis. CoQ10 supplementation may help offset statin-induced fatigue and myopathy.',
    recommendation: 'CoQ10 supplementation is commonly recommended for statin users. Continue or consider adding it.',
  },
  {
    medKeywords: STATIN_KW, medLabel: 'Statins',
    suppIds: ['niacin', 'vitamin-b3'],
    severity: 'major',
    description: 'High-dose niacin (>1g/day) combined with statins increases myopathy and rhabdomyolysis risk. Flush-free nicotinamide at standard doses is safer.',
    recommendation: 'Avoid high-dose niacin (>500mg/day) with statins. Use under specialist supervision with CK monitoring if required.',
  },
  {
    medKeywords: STATIN_KW, medLabel: 'Statins',
    suppIds: ['berberine'],
    severity: 'moderate',
    description: 'Berberine has LDL-lowering effects through PCSK9 inhibition. Additive lipid lowering with statins is generally beneficial but may need dose adjustment.',
    recommendation: 'Monitor lipid panel if adding berberine to statin therapy. Dose reduction of either may be warranted.',
  },
  {
    medKeywords: STATIN_KW, medLabel: 'Statins',
    suppIds: ['vitamin-d3', 'vitamin-d2'],
    severity: 'informational',
    description: "Statins may reduce 25-hydroxylase activity, contributing to lower Vitamin D levels. Supplementation is commonly beneficial.",
    recommendation: 'Continue Vitamin D supplementation. Consider monitoring serum 25-OH D levels annually.',
  },

  // ── LEVOTHYROXINE / THYROID ──────────────────────────────────────────────────
  {
    medKeywords: LEVOTHYROXINE_KW, medLabel: 'Levothyroxine/thyroid medication',
    suppIds: ['calcium-carbonate', 'calcium-citrate', 'calcium-hydroxyapatite'],
    severity: 'moderate',
    description: 'Calcium significantly reduces levothyroxine absorption by forming insoluble complexes. Even small amounts can impair thyroid medication efficacy.',
    recommendation: 'Separate calcium from levothyroxine by at least 4 hours. Take thyroid medication first thing in the morning before food.',
  },
  {
    medKeywords: LEVOTHYROXINE_KW, medLabel: 'Levothyroxine/thyroid medication',
    suppIds: ['iron-bisglycinate', 'iron-supplement', 'iron-fumarate', 'iron-gluconate'],
    severity: 'moderate',
    description: 'Iron chelates with levothyroxine, reducing its absorption by up to 40%.',
    recommendation: 'Separate iron from levothyroxine by at least 4 hours.',
  },
  {
    medKeywords: LEVOTHYROXINE_KW, medLabel: 'Levothyroxine/thyroid medication',
    suppIds: ['magnesium-glycinate', 'magnesium-citrate', 'magnesium-malate', 'magnesium-l-threonate'],
    severity: 'moderate',
    description: 'Magnesium may reduce levothyroxine absorption if taken simultaneously.',
    recommendation: 'Separate magnesium from levothyroxine by at least 2 hours.',
  },
  {
    medKeywords: LEVOTHYROXINE_KW, medLabel: 'Levothyroxine/thyroid medication',
    suppIds: ['zinc-picolinate', 'zinc-bisglycinate', 'zinc-carnosine', 'zinc-gluconate'],
    severity: 'moderate',
    description: 'Zinc can reduce levothyroxine absorption when taken simultaneously.',
    recommendation: 'Separate zinc from levothyroxine by at least 2 hours.',
  },
  {
    medKeywords: LEVOTHYROXINE_KW, medLabel: 'Levothyroxine/thyroid medication',
    suppIds: ['selenium-selenomethionine', 'selenium'],
    severity: 'moderate',
    description: 'Selenium supports thyroid hormone conversion (T4→T3). Supplementation may affect hormone balance and medication requirements.',
    recommendation: 'Monitor thyroid function tests if starting selenium alongside thyroid medication.',
  },
  {
    medKeywords: LEVOTHYROXINE_KW, medLabel: 'Levothyroxine/thyroid medication',
    suppIds: ['iodine', 'potassium-iodide'],
    severity: 'moderate',
    description: 'Iodine directly affects thyroid hormone synthesis. Supplemental iodine can worsen autoimmune thyroid conditions and complicate medication management.',
    recommendation: 'Avoid supplemental iodine unless specifically prescribed by an endocrinologist.',
  },
  {
    medKeywords: LEVOTHYROXINE_KW, medLabel: 'Levothyroxine/thyroid medication',
    suppIds: ['ashwagandha'],
    severity: 'moderate',
    description: 'Ashwagandha has been shown to increase T3 and T4 levels. This could amplify thyroid medication effects, potentially leading to thyrotoxicity.',
    recommendation: 'Monitor thyroid function if adding ashwagandha to thyroid medication regimen.',
  },
  {
    medKeywords: LEVOTHYROXINE_KW, medLabel: 'Levothyroxine/thyroid medication',
    suppIds: ['biotin'],
    severity: 'moderate',
    description: 'High-dose biotin (≥5mg) interferes with thyroid immunoassays, causing falsely abnormal TSH, T3, and T4 results. This complicates medication adjustment.',
    recommendation: 'Discontinue biotin 48 hours before thyroid blood tests.',
  },

  // ── METFORMIN / DIABETES ─────────────────────────────────────────────────────
  {
    medKeywords: METFORMIN_KW, medLabel: 'Metformin',
    suppIds: ['vitamin-b12', 'methylcobalamin', 'hydroxocobalamin', 'b-complex'],
    severity: 'informational',
    description: 'Metformin impairs ileal Vitamin B12 absorption through calcium-dependent mechanisms, causing B12 deficiency in up to 30% of long-term users.',
    recommendation: 'Continue B12 supplementation — this is a clinically important interaction. Methylcobalamin or sublingual forms offer better absorption.',
  },
  {
    medKeywords: METFORMIN_KW, medLabel: 'Metformin',
    suppIds: ['berberine'],
    severity: 'major',
    description: 'Both metformin and berberine lower blood glucose through AMPK activation. The additive effect may cause significant hypoglycemia.',
    recommendation: 'Monitor blood glucose closely. Discuss dose adjustment with prescriber before combining.',
  },
  {
    medKeywords: METFORMIN_KW, medLabel: 'Metformin',
    suppIds: ['alpha-lipoic-acid'],
    severity: 'moderate',
    description: 'Alpha-lipoic acid improves insulin sensitivity and has additive glucose-lowering effects with metformin.',
    recommendation: 'Monitor blood glucose. May require adjustment of metformin dose. Can be beneficial under supervision.',
  },

  // ── SULFONYLUREAS ─────────────────────────────────────────────────────────────
  {
    medKeywords: SULFONYLUREA_KW, medLabel: 'Sulfonylureas',
    suppIds: ['berberine'],
    severity: 'major',
    description: 'Berberine has strong glucose-lowering effects. Combined with sulfonylureas (which also lower glucose via insulin release), hypoglycemia risk is significant.',
    recommendation: 'Monitor blood glucose closely. Consider reducing sulfonylurea dose. Discuss with prescriber.',
  },
  {
    medKeywords: SULFONYLUREA_KW, medLabel: 'Sulfonylureas',
    suppIds: ['alpha-lipoic-acid'],
    severity: 'moderate',
    description: 'Alpha-lipoic acid has insulin-sensitising properties that may augment sulfonylurea-induced hypoglycemia.',
    recommendation: 'Monitor blood glucose regularly.',
  },

  // ── INSULIN ───────────────────────────────────────────────────────────────────
  {
    medKeywords: INSULIN_KW, medLabel: 'Insulin',
    suppIds: ['berberine'],
    severity: 'major',
    description: 'Berberine significantly lowers blood glucose through AMPK. Combined with insulin, there is a clinically significant hypoglycemia risk.',
    recommendation: 'Monitor blood glucose closely. Insulin dose may need reduction. Discuss with prescriber.',
  },
  {
    medKeywords: INSULIN_KW, medLabel: 'Insulin',
    suppIds: ['alpha-lipoic-acid'],
    severity: 'moderate',
    description: 'Alpha-lipoic acid improves peripheral glucose uptake and may potentiate insulin\'s glucose-lowering effect.',
    recommendation: 'Monitor blood glucose and adjust insulin dose as needed.',
  },
  {
    medKeywords: INSULIN_KW, medLabel: 'Insulin',
    suppIds: ['chromium-picolinate'],
    severity: 'moderate',
    description: 'Chromium potentiates insulin receptor signalling and may reduce insulin requirements.',
    recommendation: 'Monitor blood glucose if adding chromium to insulin therapy. Dose adjustment may be needed.',
  },

  // ── BENZODIAZEPINES ───────────────────────────────────────────────────────────
  {
    medKeywords: BENZO_KW, medLabel: 'Benzodiazepines',
    suppIds: ['valerian-root'],
    severity: 'major',
    description: 'Valerian has GABA-A receptor activity similar to benzodiazepines. Additive CNS depression may cause excessive sedation, respiratory depression, and impaired cognition.',
    recommendation: 'Use with extreme caution. If used, start at very low doses. Avoid driving or operating machinery.',
  },
  {
    medKeywords: BENZO_KW, medLabel: 'Benzodiazepines',
    suppIds: ['gaba'],
    severity: 'major',
    description: 'GABA supplementation may augment benzodiazepine CNS depressant effects through GABA-A receptor potentiation.',
    recommendation: 'Use with caution. Monitor for excessive sedation.',
  },
  {
    medKeywords: BENZO_KW, medLabel: 'Benzodiazepines',
    suppIds: ['melatonin'],
    severity: 'major',
    description: 'Melatonin has sedative properties and benzodiazepines reduce melatonin clearance. Additive sedation may impair next-day functioning.',
    recommendation: 'Start melatonin at the lowest dose (0.5–1mg). Monitor for next-day drowsiness.',
  },
  {
    medKeywords: BENZO_KW, medLabel: 'Benzodiazepines',
    suppIds: ['passionflower'],
    severity: 'major',
    description: 'Passionflower chrysin binds GABA-A receptors with mild benzodiazepine-like activity. Additive CNS depression is a concern.',
    recommendation: 'Use with caution. Monitor for excessive sedation.',
  },
  {
    medKeywords: BENZO_KW, medLabel: 'Benzodiazepines',
    suppIds: ['kava'],
    severity: 'major',
    description: 'Kava kavalactones enhance GABA-A receptor activity, producing significant additive CNS depression with benzodiazepines. Serious adverse effects reported.',
    recommendation: 'Avoid kava when taking benzodiazepines.',
  },
  {
    medKeywords: BENZO_KW, medLabel: 'Benzodiazepines',
    suppIds: ['lemon-balm'],
    severity: 'moderate',
    description: 'Lemon balm inhibits GABA transaminase, increasing GABA availability. Mild additive sedation possible.',
    recommendation: 'Generally acceptable at standard doses. Monitor for unusual drowsiness.',
  },
  {
    medKeywords: BENZO_KW, medLabel: 'Benzodiazepines',
    suppIds: ['ashwagandha'],
    severity: 'moderate',
    description: 'Ashwagandha withanolides have mild GABAergic and anxiolytic effects. Theoretical additive sedation with benzodiazepines.',
    recommendation: 'Generally safe at standard doses. Monitor for excessive sedation.',
  },

  // ── IMMUNOSUPPRESSANTS ────────────────────────────────────────────────────────
  {
    medKeywords: [...CYCLOSPORINE_KW, ...TACROLIMUS_KW], medLabel: 'Calcineurin inhibitors (cyclosporine/tacrolimus)',
    suppIds: ['st-johns-wort'],
    severity: 'critical',
    description: "St John's Wort dramatically reduces cyclosporine and tacrolimus blood levels through CYP3A4/P-gp induction, risking acute organ rejection.",
    recommendation: "Remove St John's Wort immediately. Contact transplant team urgently.",
  },
  {
    medKeywords: CYCLOSPORINE_KW, medLabel: 'Cyclosporine',
    suppIds: ['echinacea'],
    severity: 'major',
    description: 'Echinacea has immune-stimulating properties that may directly counteract cyclosporine\'s immunosuppressant action.',
    recommendation: 'Avoid echinacea in patients on cyclosporine or other immunosuppressants.',
  },

  // ── ANTICONVULSANTS ────────────────────────────────────────────────────────────
  {
    medKeywords: VALPROATE_KW, medLabel: 'Valproic acid/Valproate',
    suppIds: ['l-carnitine', 'acetyl-l-carnitine'],
    severity: 'informational',
    description: 'Valproate impairs carnitine synthesis and increases urinary carnitine excretion, commonly causing deficiency. L-Carnitine supplementation is often clinically recommended.',
    recommendation: 'L-Carnitine supplementation is clinically appropriate for valproate users. Continue or consider adding.',
  },
  {
    medKeywords: VALPROATE_KW, medLabel: 'Valproic acid/Valproate',
    suppIds: ['biotin'],
    severity: 'informational',
    description: 'Long-term valproate use may reduce biotin levels through enzyme induction.',
    recommendation: 'Biotin supplementation at standard doses is appropriate for valproate users.',
  },
  {
    medKeywords: VALPROATE_KW, medLabel: 'Valproic acid/Valproate',
    suppIds: ['folic-acid', 'folate-5mthf', 'folinic-acid'],
    severity: 'informational',
    description: 'Valproate depletes folate, contributing to elevated homocysteine. Folate supplementation is important, especially in women of childbearing age.',
    recommendation: 'Continue folate supplementation. Important for pregnancy planning while on valproate.',
  },
  {
    medKeywords: ANTICONVULSANT_KW, medLabel: 'Anticonvulsants',
    suppIds: ['vitamin-d3', 'vitamin-d2'],
    severity: 'informational',
    description: 'Anticonvulsants (especially phenytoin, carbamazepine, phenobarbital) induce CYP450 enzymes that accelerate Vitamin D metabolism, commonly causing deficiency.',
    recommendation: 'Vitamin D supplementation is clinically recommended. Monitor serum 25-OH D levels.',
  },
  {
    medKeywords: [...PHENYTOIN_KW, 'phenobarbital', 'primidone'], medLabel: 'Phenytoin/Phenobarbital',
    suppIds: ['folic-acid', 'folate-5mthf', 'folinic-acid'],
    severity: 'moderate',
    description: 'High-dose folate supplementation may reduce phenytoin serum levels by increasing its metabolism, potentially reducing seizure control.',
    recommendation: 'Limit folate to ≤800 mcg/day. Monitor anticonvulsant levels if folate supplementation is changed.',
  },
  {
    medKeywords: CARBAMAZEPINE_KW, medLabel: 'Carbamazepine',
    suppIds: ['st-johns-wort'],
    severity: 'critical',
    description: "St John's Wort induces CYP3A4, reducing carbamazepine plasma levels, potentially precipitating breakthrough seizures.",
    recommendation: "Remove St John's Wort immediately. Seizure risk is significant.",
  },
  {
    medKeywords: ANTICONVULSANT_KW, medLabel: 'Anticonvulsants',
    suppIds: ['calcium-carbonate', 'calcium-citrate'],
    severity: 'moderate',
    description: 'Anticonvulsants reduce calcium absorption through vitamin D effects. Calcium supplementation supports bone health in this population.',
    recommendation: 'Calcium supplementation is generally appropriate. Separate from phenytoin by at least 2 hours.',
  },

  // ── ANTIBIOTICS ───────────────────────────────────────────────────────────────
  {
    medKeywords: TETRACYCLINE_KW, medLabel: 'Tetracycline antibiotics',
    suppIds: ['calcium-carbonate', 'calcium-citrate'],
    severity: 'moderate',
    description: 'Calcium forms insoluble chelates with tetracycline antibiotics, reducing antibiotic bioavailability by up to 60%.',
    recommendation: 'Separate calcium from tetracyclines by at least 2–3 hours. Take antibiotic first.',
  },
  {
    medKeywords: TETRACYCLINE_KW, medLabel: 'Tetracycline antibiotics',
    suppIds: ['iron-bisglycinate', 'iron-supplement', 'iron-fumarate', 'iron-gluconate'],
    severity: 'moderate',
    description: 'Iron forms chelates with tetracyclines, reducing both iron and antibiotic absorption.',
    recommendation: 'Separate iron from tetracyclines by at least 2–3 hours.',
  },
  {
    medKeywords: TETRACYCLINE_KW, medLabel: 'Tetracycline antibiotics',
    suppIds: ['magnesium-glycinate', 'magnesium-citrate', 'magnesium-malate', 'magnesium-l-threonate'],
    severity: 'moderate',
    description: 'Magnesium chelates with tetracyclines, impairing antibiotic absorption.',
    recommendation: 'Separate magnesium from tetracyclines by at least 2–3 hours.',
  },
  {
    medKeywords: TETRACYCLINE_KW, medLabel: 'Tetracycline antibiotics',
    suppIds: ['zinc-picolinate', 'zinc-bisglycinate', 'zinc-carnosine', 'zinc-gluconate'],
    severity: 'moderate',
    description: 'Zinc chelates with tetracycline antibiotics, reducing absorption of both.',
    recommendation: 'Separate zinc from tetracyclines by at least 2–3 hours.',
  },
  {
    medKeywords: FLUOROQUINOLONE_KW, medLabel: 'Fluoroquinolone antibiotics',
    suppIds: ['calcium-carbonate', 'calcium-citrate'],
    severity: 'moderate',
    description: 'Calcium forms chelates with fluoroquinolones, reducing antibiotic bioavailability by 30–50%.',
    recommendation: 'Separate calcium from fluoroquinolones by at least 2 hours. Take antibiotic first.',
  },
  {
    medKeywords: FLUOROQUINOLONE_KW, medLabel: 'Fluoroquinolone antibiotics',
    suppIds: ['iron-bisglycinate', 'iron-supplement', 'iron-fumarate', 'iron-gluconate'],
    severity: 'moderate',
    description: 'Iron significantly reduces fluoroquinolone absorption through chelation.',
    recommendation: 'Separate iron from fluoroquinolones by at least 2 hours.',
  },
  {
    medKeywords: FLUOROQUINOLONE_KW, medLabel: 'Fluoroquinolone antibiotics',
    suppIds: ['magnesium-glycinate', 'magnesium-citrate', 'magnesium-malate', 'magnesium-l-threonate'],
    severity: 'moderate',
    description: 'Magnesium chelates with fluoroquinolones, reducing antibiotic bioavailability.',
    recommendation: 'Separate magnesium from fluoroquinolones by at least 2 hours.',
  },
  {
    medKeywords: FLUOROQUINOLONE_KW, medLabel: 'Fluoroquinolone antibiotics',
    suppIds: ['zinc-picolinate', 'zinc-bisglycinate', 'zinc-carnosine', 'zinc-gluconate'],
    severity: 'moderate',
    description: 'Zinc chelates with fluoroquinolones, impairing antibiotic absorption.',
    recommendation: 'Separate zinc from fluoroquinolones by at least 2 hours.',
  },

  // ── ACE INHIBITORS / ARBs ──────────────────────────────────────────────────────
  {
    medKeywords: [...ACE_KW, ...ARB_KW], medLabel: 'ACE inhibitors/ARBs',
    suppIds: ['potassium-citrate', 'potassium-chloride', 'potassium'],
    severity: 'major',
    description: 'ACE inhibitors and ARBs reduce urinary potassium excretion. Additional potassium supplementation can cause dangerous hyperkalemia — cardiac arrhythmias and arrest.',
    recommendation: 'Avoid potassium supplementation unless specifically prescribed. Monitor serum potassium closely.',
  },
  {
    medKeywords: ACE_KW, medLabel: 'ACE inhibitors',
    suppIds: ['coq10-ubiquinol'],
    severity: 'informational',
    description: 'ACE inhibitors may reduce CoQ10 synthesis. CoQ10 supplementation can provide synergistic cardioprotective benefits in hypertensive patients.',
    recommendation: 'CoQ10 supplementation is generally beneficial alongside ACE inhibitor therapy.',
  },

  // ── BETA-BLOCKERS ─────────────────────────────────────────────────────────────
  {
    medKeywords: BETA_BLOCKER_KW, medLabel: 'Beta-blockers',
    suppIds: ['coq10-ubiquinol'],
    severity: 'informational',
    description: 'Beta-blockers may reduce CoQ10 levels. Supplementation supports mitochondrial energy metabolism in cardiac tissue.',
    recommendation: 'CoQ10 supplementation is appropriate and potentially beneficial for patients on beta-blockers.',
  },

  // ── CALCIUM CHANNEL BLOCKERS ─────────────────────────────────────────────────
  {
    medKeywords: CCB_KW, medLabel: 'Calcium channel blockers',
    suppIds: ['magnesium-glycinate', 'magnesium-citrate', 'magnesium-malate', 'magnesium-l-threonate'],
    severity: 'moderate',
    description: 'Magnesium has natural calcium channel-blocking properties. Additive hypotensive effect possible.',
    recommendation: 'Monitor blood pressure. Generally safe at standard supplement doses — be aware of additive hypotension.',
  },

  // ── DIURETICS ─────────────────────────────────────────────────────────────────
  {
    medKeywords: DIURETIC_KW, medLabel: 'Loop/thiazide diuretics',
    suppIds: ['potassium-citrate', 'potassium-chloride', 'potassium'],
    severity: 'informational',
    description: 'Loop and thiazide diuretics cause urinary potassium loss, commonly leading to hypokalemia. Potassium supplementation is often clinically appropriate.',
    recommendation: 'Potassium supplementation is commonly recommended. Monitor serum potassium levels regularly.',
  },
  {
    medKeywords: DIURETIC_KW, medLabel: 'Diuretics',
    suppIds: ['magnesium-glycinate', 'magnesium-citrate', 'magnesium-malate', 'magnesium-l-threonate'],
    severity: 'informational',
    description: 'Loop diuretics (e.g., furosemide) cause significant urinary magnesium loss. Supplementation is clinically appropriate.',
    recommendation: 'Magnesium supplementation is beneficial for diuretic users. Continue.',
  },
  {
    medKeywords: DIURETIC_KW, medLabel: 'Diuretics',
    suppIds: ['zinc-picolinate', 'zinc-bisglycinate', 'zinc-carnosine', 'zinc-gluconate'],
    severity: 'informational',
    description: 'Thiazide and loop diuretics can increase urinary zinc excretion. Zinc supplementation may be warranted.',
    recommendation: 'Zinc supplementation is appropriate for long-term diuretic users. Continue.',
  },
  {
    medKeywords: DIURETIC_KW, medLabel: 'Loop diuretics',
    suppIds: ['vitamin-b1', 'b-complex'],
    severity: 'informational',
    description: 'High-dose loop diuretics (especially furosemide) can deplete thiamine (B1), contributing to cardiovascular complications.',
    recommendation: 'B1 or B-Complex supplementation is recommended for patients on loop diuretics.',
  },

  // ── ORAL CONTRACEPTIVES ──────────────────────────────────────────────────────
  {
    medKeywords: OCP_KW, medLabel: 'Oral contraceptives',
    suppIds: ['st-johns-wort'],
    severity: 'critical',
    description: "St John's Wort induces CYP3A4 and P-glycoprotein, significantly reducing plasma levels of ethinyl estradiol and progestins, leading to contraceptive failure.",
    recommendation: "Remove St John's Wort. Use reliable backup contraception if recently taken. Inform prescriber.",
  },
  {
    medKeywords: OCP_KW, medLabel: 'Oral contraceptives',
    suppIds: ['vitamin-b6', 'b-complex'],
    severity: 'informational',
    description: 'Oral contraceptives can deplete Vitamin B6 (pyridoxine), contributing to mood changes and PMS-like symptoms.',
    recommendation: 'B6 supplementation at 10–25mg/day is commonly recommended for OCP users.',
  },
  {
    medKeywords: OCP_KW, medLabel: 'Oral contraceptives',
    suppIds: ['vitamin-b12', 'b-complex'],
    severity: 'informational',
    description: 'Oestrogen-containing contraceptives may reduce serum B12 levels through altered transport protein dynamics.',
    recommendation: 'B12 supplementation is appropriate for OCP users, especially with limited dietary intake.',
  },
  {
    medKeywords: OCP_KW, medLabel: 'Oral contraceptives',
    suppIds: ['folic-acid', 'folate-5mthf', 'folinic-acid', 'b-complex'],
    severity: 'informational',
    description: 'Oestrogens impair folate metabolism. Women on OCPs planning pregnancy should ensure adequate folate status.',
    recommendation: 'Folate supplementation is especially important when planning to stop contraception. Continue folate.',
  },
  {
    medKeywords: OCP_KW, medLabel: 'Oral contraceptives',
    suppIds: ['zinc-picolinate', 'zinc-bisglycinate', 'zinc-carnosine', 'zinc-gluconate'],
    severity: 'informational',
    description: 'Oestrogen-containing OCPs reduce serum zinc levels by altering zinc-binding proteins.',
    recommendation: 'Zinc supplementation is appropriate for OCP users.',
  },
  {
    medKeywords: OCP_KW, medLabel: 'Oral contraceptives',
    suppIds: ['magnesium-glycinate', 'magnesium-citrate', 'magnesium-malate', 'magnesium-l-threonate'],
    severity: 'informational',
    description: 'Oestrogen in contraceptives may reduce serum magnesium levels.',
    recommendation: 'Magnesium supplementation is appropriate for OCP users.',
  },

  // ── LITHIUM ───────────────────────────────────────────────────────────────────
  {
    medKeywords: LITHIUM_KW, medLabel: 'Lithium',
    suppIds: ['iodine', 'potassium-iodide'],
    severity: 'major',
    description: 'Lithium and iodine both affect thyroid function. Their combination can exacerbate lithium-induced hypothyroidism and goitre.',
    recommendation: 'Avoid supplemental iodine. Monitor thyroid function regularly.',
  },
  {
    medKeywords: LITHIUM_KW, medLabel: 'Lithium',
    suppIds: ['green-tea-extract'],
    severity: 'moderate',
    description: 'Caffeine from green tea extract affects renal handling of lithium — caffeine changes alter lithium plasma levels.',
    recommendation: 'Maintain consistent caffeine intake. Abrupt changes in green tea extract should be avoided.',
  },
  {
    medKeywords: LITHIUM_KW, medLabel: 'Lithium',
    suppIds: ['creatine-monohydrate'],
    severity: 'moderate',
    description: 'Creatine affects renal handling of organic ions and may alter lithium clearance, potentially changing plasma levels.',
    recommendation: 'Monitor lithium levels if starting creatine supplementation. Inform psychiatrist.',
  },

  // ── ASPIRIN / ANTIPLATELETS ────────────────────────────────────────────────────
  {
    medKeywords: ASPIRIN_KW, medLabel: 'Aspirin',
    suppIds: ['omega-3-fish-oil', 'dha-algae'],
    severity: 'moderate',
    description: 'Omega-3 fatty acids have antiplatelet properties similar to low-dose aspirin. The combination may be mildly synergistic and is often used clinically, but increases bleeding risk at high omega-3 doses.',
    recommendation: 'Generally acceptable. Monitor for unusual bruising. Limit omega-3 to ≤3g/day.',
  },
  {
    medKeywords: ASPIRIN_KW, medLabel: 'Aspirin',
    suppIds: ['vitamin-e-mixed-tocopherols', 'vitamin-e'],
    severity: 'moderate',
    description: 'Vitamin E at doses >400 IU has antiplatelet activity that may add to aspirin\'s antiplatelet effect.',
    recommendation: 'Limit Vitamin E to ≤200 IU/day when on aspirin therapy.',
  },
  {
    medKeywords: ASPIRIN_KW, medLabel: 'Aspirin',
    suppIds: ['ginkgo-biloba'],
    severity: 'major',
    description: 'Ginkgo biloba has significant antiplatelet effects that synergise with aspirin, increasing bleeding risk — particularly intracranial haemorrhage.',
    recommendation: 'Avoid ginkgo with aspirin unless under specialist guidance.',
  },
  {
    medKeywords: CLOPIDOGREL_KW, medLabel: 'Clopidogrel/Antiplatelet agents',
    suppIds: ['ginkgo-biloba'],
    severity: 'major',
    description: 'Ginkgo biloba significantly enhances antiplatelet action. Major bleeding risk, including intracranial haemorrhage, has been reported.',
    recommendation: 'Avoid ginkgo with clopidogrel or similar antiplatelets.',
  },
  {
    medKeywords: CLOPIDOGREL_KW, medLabel: 'Clopidogrel/Antiplatelet agents',
    suppIds: ['omega-3-fish-oil', 'dha-algae'],
    severity: 'moderate',
    description: 'Omega-3 fatty acids have antiplatelet effects that may add to clopidogrel\'s antiplatelet action.',
    recommendation: 'Monitor for unusual bleeding. Limit omega-3 to ≤2g/day.',
  },

  // ── ANTIDEPRESSANTS / PSYCHIATRIC (GENERAL) ────────────────────────────────────
  {
    medKeywords: [...SSRI_KW, ...SNRI_KW, ...MAOI_KW], medLabel: 'Antidepressants',
    suppIds: ['melatonin'],
    severity: 'moderate',
    description: 'SSRIs and SNRIs inhibit CYP1A2, which metabolises melatonin. Plasma melatonin levels can increase significantly, causing excessive sedation.',
    recommendation: 'Start melatonin at the lowest possible dose (0.5mg). Avoid doses >3mg.',
  },

  // ── ANTIHYPERTENSIVES (GENERAL) ────────────────────────────────────────────────
  {
    medKeywords: [...ACE_KW, ...ARB_KW, ...BETA_BLOCKER_KW, ...CCB_KW, ...DIURETIC_KW],
    medLabel: 'Antihypertensive medications',
    suppIds: ['coq10-ubiquinol'],
    severity: 'informational',
    description: 'CoQ10 has mild antihypertensive effects and may provide additive blood pressure lowering alongside antihypertensives. Generally beneficial.',
    recommendation: 'CoQ10 is often recommended alongside antihypertensive therapy. Monitor blood pressure.',
  },

  // ── CORTICOSTEROIDS ────────────────────────────────────────────────────────────
  {
    medKeywords: CORTICOSTEROID_KW, medLabel: 'Corticosteroids',
    suppIds: ['calcium-carbonate', 'calcium-citrate', 'calcium-hydroxyapatite'],
    severity: 'informational',
    description: 'Corticosteroids reduce calcium absorption and increase urinary calcium excretion, causing bone loss. Calcium supplementation is standard of care.',
    recommendation: 'Calcium supplementation is clinically recommended for corticosteroid users. Continue.',
  },
  {
    medKeywords: CORTICOSTEROID_KW, medLabel: 'Corticosteroids',
    suppIds: ['vitamin-d3', 'vitamin-d2'],
    severity: 'informational',
    description: 'Corticosteroids impair Vitamin D activation and calcium absorption. Vitamin D supplementation helps maintain bone mineral density.',
    recommendation: 'Vitamin D supplementation at 1,000–2,000 IU/day is clinically recommended for corticosteroid users.',
  },

  // ── ANTIBIOTICS (TRIMETHOPRIM/SULFONAMIDES) ────────────────────────────────────
  {
    medKeywords: TRIMETHOPRIM_KW, medLabel: 'Trimethoprim/Sulfonamides',
    suppIds: ['folic-acid', 'folate-5mthf', 'folinic-acid'],
    severity: 'moderate',
    description: 'Trimethoprim inhibits dihydrofolate reductase, impairing folate metabolism. Folate supplementation is important during and after treatment.',
    recommendation: 'Continue folate supplementation. Folinic acid (not folic acid) is preferred as it bypasses the enzyme block.',
  },

  // ── RIFAMPICIN ─────────────────────────────────────────────────────────────────
  {
    medKeywords: RIFAMPICIN_KW, medLabel: 'Rifampicin/Rifabutin',
    suppIds: ['vitamin-d3', 'vitamin-d2'],
    severity: 'moderate',
    description: 'Rifampicin is a potent CYP inducer that accelerates Vitamin D metabolism, commonly causing deficiency.',
    recommendation: 'Monitor Vitamin D levels. Higher doses (2,000–4,000 IU/day) may be needed during rifampicin therapy.',
  },

  // ── THIAZIDES + CALCIUM (BENEFICIAL INTERACTION) ──────────────────────────────
  {
    medKeywords: THIAZIDE_KW, medLabel: 'Thiazide diuretics',
    suppIds: ['calcium-carbonate', 'calcium-citrate'],
    severity: 'informational',
    description: 'Thiazide diuretics increase calcium reabsorption in the kidney, reducing urinary calcium loss. Combined with calcium supplements, monitor for hypercalcaemia if doses are high.',
    recommendation: 'Generally safe. Monitor serum calcium if taking high-dose calcium supplements long-term.',
  },
];

// ─── UL (UPPER TOLERABLE INTAKE) DATABASE ─────────────────────────────────────

interface NutrientUL {
  ulUnit: string;
  ul: number;
  /** Supplement IDs that contribute to this nutrient */
  suppIds: string[];
  /** Additional context note if exceeded */
  note?: string;
}

const NUTRIENT_ULS: Record<string, NutrientUL> = {
  'Vitamin A': {
    ulUnit: 'IU', ul: 10000,
    suppIds: ['vitamin-a', 'retinol', 'cod-liver-oil', 'beta-carotene'],
  },
  'Vitamin C': {
    ulUnit: 'mg', ul: 2000,
    suppIds: ['vitamin-c'],
  },
  'Vitamin D': {
    ulUnit: 'IU', ul: 4000,
    suppIds: ['vitamin-d3', 'vitamin-d2', 'vitamin-d'],
    note: 'Clinical supervision may justify doses up to 10,000 IU/day with monitoring.',
  },
  'Vitamin E': {
    ulUnit: 'IU', ul: 1500,
    suppIds: ['vitamin-e', 'vitamin-e-mixed-tocopherols'],
  },
  'Calcium': {
    ulUnit: 'mg', ul: 2500,
    suppIds: ['calcium-carbonate', 'calcium-citrate', 'calcium-hydroxyapatite', 'calcium-gluconate'],
  },
  'Iron': {
    ulUnit: 'mg', ul: 45,
    suppIds: ['iron-bisglycinate', 'iron-supplement', 'iron-fumarate', 'iron-gluconate'],
  },
  'Zinc': {
    ulUnit: 'mg', ul: 40,
    suppIds: ['zinc-picolinate', 'zinc-bisglycinate', 'zinc-carnosine', 'zinc-gluconate'],
  },
  'Selenium': {
    ulUnit: 'mcg', ul: 400,
    suppIds: ['selenium-selenomethionine', 'selenium-yeast', 'selenium'],
  },
  'Folate': {
    ulUnit: 'mcg', ul: 1000,
    suppIds: ['folic-acid', 'folate-5mthf', 'folinic-acid'],
  },
  'Magnesium (from supplements)': {
    ulUnit: 'mg', ul: 350,
    suppIds: ['magnesium-glycinate', 'magnesium-citrate', 'magnesium-malate', 'magnesium-l-threonate'],
    note: 'Therapeutic protocol dosing — this protocol uses doses above the supplement UL. Monitor for GI side effects (loose stools, diarrhoea). Food-derived magnesium has no established UL.',
  },
  'Niacin': {
    ulUnit: 'mg', ul: 35,
    suppIds: ['niacin', 'vitamin-b3', 'nicotinic-acid'],
  },
  'Vitamin B6': {
    ulUnit: 'mg', ul: 100,
    suppIds: ['vitamin-b6', 'pyridoxine'],
  },
};

// ─── PREGNANCY HERB BLOCK LIST ────────────────────────────────────────────────

/** Herbs and high-risk supplements to remove if isPregnant is true. */
const PREGNANCY_BLOCKED_IDS = new Set([
  'ashwagandha', 'rhodiola-rosea', 'berberine', 'black-cohosh', 'saw-palmetto',
  'ginkgo-biloba', 'ginseng', 'kava', 'valerian-root', 'st-johns-wort', 'echinacea',
  'dong-quai', 'blue-cohosh', 'pennyroyal', 'tansy', 'yarrow', 'wormwood',
  'licorice-root', 'fenugreek', 'turmeric-high-dose', 'cayenne-high-dose',
  'green-tea-extract', 'nac', 'alpha-lipoic-acid', 'same', 'sam-e',
]);

/** Safe supplementation during pregnancy — these IDs must never be blocked. */
const PREGNANCY_SAFE_IDS = new Set([
  'folic-acid', 'folate-5mthf', 'folinic-acid',
  'iron-bisglycinate', 'iron-supplement',
  'dha-algae', 'omega-3-fish-oil',
  'choline', 'choline-bitartrate',
  'iodine', 'potassium-iodide',
  'magnesium-glycinate', 'magnesium-citrate',
  'vitamin-d3', 'vitamin-d2',
  'calcium-carbonate', 'calcium-citrate',
  'vitamin-c',
  'vitamin-b12', 'b-complex', 'methylcobalamin', 'hydroxocobalamin',
  'probiotics',
  'zinc-picolinate', 'zinc-bisglycinate',
  'vitamin-b6',
]);

// ─── BLOOD-THINNING SUPPLEMENTS ───────────────────────────────────────────────

const BLOOD_THINNING_IDS = new Set([
  'omega-3-fish-oil', 'dha-algae', 'vitamin-e-mixed-tocopherols', 'vitamin-e',
  'ginkgo-biloba', 'garlic-extract', 'curcumin', 'ginger-extract',
  'bromelain', 'nattokinase',
]);

// ─── SEDATING SUPPLEMENTS ─────────────────────────────────────────────────────

const SEDATING_IDS = new Set([
  'magnesium-glycinate', 'magnesium-citrate', 'magnesium-malate', 'magnesium-l-threonate',
  'l-theanine', 'melatonin', 'valerian-root', 'gaba', 'passionflower',
  'lemon-balm', 'kava', 'holy-basil',
]);

// ─── ANTIOXIDANT SUPPLEMENTS (chemo caution) ──────────────────────────────────

const ANTIOXIDANT_IDS = new Set([
  'vitamin-c', 'vitamin-e', 'vitamin-e-mixed-tocopherols',
  'nac', 'glutathione', 'glutathione-liposomal',
  'coq10-ubiquinol', 'alpha-lipoic-acid', 'astaxanthin',
]);

// ─── CKD FLAGGED SUPPLEMENTS ──────────────────────────────────────────────────

const CKD_FLAGGED_IDS = new Set([
  'potassium-citrate', 'potassium-chloride', 'potassium',
  'phosphorus', 'phosphate',
]);
const CKD_HIGH_DOSE_VITAMIN_A_THRESHOLD = 5000; // IU
const CKD_HIGH_DOSE_VITAMIN_C_THRESHOLD = 1000; // mg

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function hasMed(medications: string[], keywords: string[]): boolean {
  const lower = medications.map(m => m.toLowerCase());
  return keywords.some(kw => lower.some(m => m.includes(kw)));
}

function hasCondition(healthConditions: string[], keywords: string[]): boolean {
  const lower = healthConditions.map(c => c.toLowerCase());
  return keywords.some(kw => lower.some(c => c.includes(kw)));
}

function findRec(recs: Recommendation[], id: string): Recommendation | undefined {
  return recs.find(r => r.id === id);
}

function hasRec(recs: Recommendation[], ...ids: string[]): boolean {
  return ids.some(id => recs.some(r => r.id === id));
}

function makeSafetyRec(
  id: string,
  supplementName: string,
  dose: number,
  doseUnit: string,
  category: Recommendation['category'],
  reason: string,
): Recommendation {
  return {
    id,
    supplementName,
    form: id,
    dose,
    doseUnit,
    frequency: 'daily',
    timing: ['morning-with-food'],
    withFood: true,
    evidenceRating: 'Moderate',
    reasons: [{ layer: 'safety', reason }],
    warnings: [],
    contraindications: [],
    cyclingPattern: CYCLE_DAILY,
    sources: [{ layer: 'safety', action: 'added' }],
    priority: 6,
    category,
    separateFrom: [],
    notes: [],
  };
}

function addWarningToRec(
  recs: Recommendation[],
  id: string,
  warning: string,
): Recommendation[] {
  return recs.map(r =>
    r.id === id && !r.warnings.includes(warning)
      ? { ...r, warnings: [...r.warnings, warning] }
      : r,
  );
}

// ─── 1. DRUG-SUPPLEMENT INTERACTION CHECK ─────────────────────────────────────

function checkDrugInteractions(
  quiz: QuizData,
  recs: Recommendation[],
): { approved: Recommendation[]; blocked: BlockedSupplement[]; warnings: SafetyWarning[] } {
  const meds = quiz.medications;
  const blocked: BlockedSupplement[] = [];
  const warnings: SafetyWarning[] = [];

  for (const rule of DRUG_INTERACTIONS) {
    if (!hasMed(meds, rule.medKeywords)) continue;

    for (const rec of recs) {
      if (!rule.suppIds.includes(rec.id)) continue;

      if (rule.severity === 'critical') {
        // Only block once per supplement
        if (!blocked.some(b => b.recommendation.id === rec.id)) {
          blocked.push({
            recommendation: rec,
            reason: rule.description,
            severity: 'critical',
            interactingMedication: rule.medLabel,
          });
        }
      } else {
        const severity = rule.severity as SafetyWarning['severity'];
        // Deduplicate: same supplement + same medication label
        if (!warnings.some(w => w.supplementId === rec.id && w.medication === rule.medLabel)) {
          warnings.push({
            supplementId: rec.id,
            medication: rule.medLabel,
            severity,
            description: rule.description,
            recommendation: rule.recommendation,
          });
        }
      }
    }
  }

  const blockedIds = new Set(blocked.map(b => b.recommendation.id));
  const approved = recs.filter(r => !blockedIds.has(r.id));

  return { approved, blocked, warnings };
}

// ─── 2. SUPPLEMENT-SUPPLEMENT INTERACTION CHECK ────────────────────────────────

function checkSuppSupplementInteractions(
  recs: Recommendation[],
): {
  approved: Recommendation[];
  supplementInteractions: SupplementInteraction[];
  warnings: SafetyWarning[];
} {
  let approved = [...recs];
  const supplementInteractions: SupplementInteraction[] = [];
  const warnings: SafetyWarning[] = [];

  const IRON_IDS = ['iron-bisglycinate', 'iron-supplement', 'iron-fumarate', 'iron-gluconate'];
  const CALCIUM_IDS = ['calcium-carbonate', 'calcium-citrate', 'calcium-hydroxyapatite', 'calcium-gluconate'];
  const ZINC_IDS = ['zinc-picolinate', 'zinc-bisglycinate', 'zinc-carnosine', 'zinc-gluconate'];

  // 2a. Iron + Calcium → absorption separation
  const ironRec = approved.find(r => IRON_IDS.includes(r.id));
  const calciumRec = approved.find(r => CALCIUM_IDS.includes(r.id));
  if (ironRec && calciumRec) {
    supplementInteractions.push({
      supplement1Id: ironRec.id,
      supplement2Id: calciumRec.id,
      type: 'absorption-competition',
      description: 'Iron and calcium compete for absorption. Simultaneous intake significantly reduces iron bioavailability.',
      resolution: 'Separate iron and calcium by at least 2 hours. Take iron in the morning (empty stomach) and calcium later in the day.',
    });
    // Add timing note to iron rec
    approved = addWarningToRec(approved, ironRec.id, 'Take at least 2 hours away from calcium supplements to prevent absorption competition.');
  }

  // 2b. Iron + Zinc → absorption separation
  const zincRec = approved.find(r => ZINC_IDS.includes(r.id));
  if (ironRec && zincRec) {
    supplementInteractions.push({
      supplement1Id: ironRec.id,
      supplement2Id: zincRec.id,
      type: 'absorption-competition',
      description: 'High-dose iron and zinc compete for intestinal absorption via shared divalent metal transporter.',
      resolution: 'Separate iron and zinc by at least 2 hours.',
    });
  }

  // 2c. Zinc >25mg → add copper 2mg (if not present)
  const zincHigh = approved.find(r => ZINC_IDS.includes(r.id) && r.doseUnit === 'mg' && r.dose > 25);
  if (zincHigh && !hasRec(approved, 'copper-bisglycinate', 'copper-gluconate', 'copper')) {
    const copperRec = makeSafetyRec(
      'copper-bisglycinate',
      'Copper (Bisglycinate)',
      2, 'mg', 'mineral',
      'Zinc >25mg depletes copper — copper 2mg added to maintain copper-zinc balance.',
    );
    approved = [...approved, copperRec];
    supplementInteractions.push({
      supplement1Id: zincHigh.id,
      supplement2Id: 'copper-bisglycinate',
      type: 'cumulative-effect',
      description: `Zinc at ${zincHigh.dose}mg/day can deplete copper over time. Copper 2mg has been added to maintain mineral balance.`,
      resolution: 'Take copper alongside zinc. Consider a zinc-copper formula if taking zinc long-term.',
    });
  }

  // 2d. 3+ blood-thinning supplements → cumulative bleeding risk
  const bloodThinners = approved.filter(r => BLOOD_THINNING_IDS.has(r.id));
  if (bloodThinners.length >= 3) {
    supplementInteractions.push({
      supplement1Id: bloodThinners[0].id,
      supplement2Id: bloodThinners.slice(1).map(r => r.id).join(', '),
      type: 'cumulative-effect',
      description: `${bloodThinners.length} supplements with antiplatelet/blood-thinning properties detected (${bloodThinners.map(r => r.supplementName).join(', ')}). Cumulative bleeding risk is elevated, especially if on anticoagulant medication.`,
      resolution: 'Review protocol with a clinician if any anticoagulant is prescribed. Monitor for unusual bruising or bleeding.',
    });
    for (const rec of bloodThinners) {
      warnings.push({
        supplementId: rec.id,
        severity: 'major',
        medication: 'cumulative-effect',
        description: 'Cumulative antiplatelet effect: 3+ blood-thinning supplements detected in this protocol. Increased bleeding risk.',
        recommendation: 'Consult a clinician, especially if on prescription anticoagulants or planning surgery.',
      });
    }
  }

  // 2e. 4+ sedating supplements → excessive sedation risk
  const sedatives = approved.filter(r => SEDATING_IDS.has(r.id));
  if (sedatives.length >= 4) {
    supplementInteractions.push({
      supplement1Id: sedatives[0].id,
      supplement2Id: sedatives.slice(1).map(r => r.id).join(', '),
      type: 'cumulative-effect',
      description: `${sedatives.length} sedating supplements detected (${sedatives.map(r => r.supplementName).join(', ')}). Excessive sedation risk.`,
      resolution: 'Reduce to 2–3 sleep/relaxation supplements. Avoid combining all bedtime sedatives simultaneously.',
    });
  }

  // 2f. Berberine + Metformin (handled by drug-supplement check, but also a supp-supp note)
  // Note: covered in drug interactions above.

  return { approved, supplementInteractions, warnings };
}

// ─── 3. UL CHECKS ─────────────────────────────────────────────────────────────

function checkULs(quiz: QuizData, recs: Recommendation[]): {
  approved: Recommendation[];
  ulChecks: ULCheck[];
  warnings: SafetyWarning[];
} {
  const approved = [...recs];
  const ulChecks: ULCheck[] = [];
  const warnings: SafetyWarning[] = [];

  // Adjust calcium UL for age 51+
  const calciumUL = quiz.age >= 51 ? 2000 : 2500;

  for (const [nutrient, info] of Object.entries(NUTRIENT_ULS)) {
    const adjustedUL = nutrient === 'Calcium' ? calciumUL : info.ul;
    const sources: string[] = [];
    let total = 0;

    for (const rec of recs) {
      if (info.suppIds.includes(rec.id) && rec.doseUnit === info.ulUnit) {
        sources.push(rec.id);
        total += rec.dose;
      }
    }

    if (sources.length === 0) continue;

    const exceedsUL = total > adjustedUL;

    if (exceedsUL || (total > adjustedUL * 0.8 && sources.length > 1)) {
      ulChecks.push({
        nutrient,
        totalDose: total,
        unit: info.ulUnit,
        upperLimit: adjustedUL,
        exceedsUL,
        sources,
      });

      if (exceedsUL) {
        const note = info.note ? ` ${info.note}` : '';
        for (const id of sources) {
          const msg = `${nutrient} total across this protocol (${total} ${info.ulUnit}) exceeds the established UL (${adjustedUL} ${info.ulUnit}).${note}`;
          warnings.push({
            supplementId: id,
            medication: 'none',
            severity: 'moderate',
            description: msg,
            recommendation: `Review total ${nutrient} intake. Consider reducing dose or seeking medical supervision for this therapeutic level.`,
          });
        }
      }
    }
  }

  return { approved, ulChecks, warnings };
}

// ─── 4. SPECIAL SAFETY CHECKS ─────────────────────────────────────────────────

function checkSpecialSafety(
  quiz: QuizData,
  recs: Recommendation[],
): { approved: Recommendation[]; blocked: BlockedSupplement[]; warnings: SafetyWarning[] } {
  let approved = [...recs];
  const blocked: BlockedSupplement[] = [];
  const warnings: SafetyWarning[] = [];

  // 4a. Smoker — final beta-carotene block
  if (quiz.smokerFlag === true || quiz.smokingStatus === 'current' || quiz.smokingStatus === 'former') {
    const betaIds = ['beta-carotene', 'beta-carotene-supplement'];
    for (const id of betaIds) {
      const rec = findRec(approved, id);
      if (rec) {
        blocked.push({
          recommendation: rec,
          reason: 'Beta-carotene supplementation in current or former smokers is contraindicated — large randomised trials (CARET, ATBC) showed increased lung cancer risk.',
          severity: 'critical',
          interactingMedication: 'smoking status',
        });
      }
    }
    approved = approved.filter(r => !betaIds.includes(r.id));
  }

  // 4b. Pregnancy — block unsafe herbs, protect safe supplements
  if (quiz.isPregnant) {
    for (const rec of [...approved]) {
      if (PREGNANCY_SAFE_IDS.has(rec.id)) continue; // always safe — skip
      if (PREGNANCY_BLOCKED_IDS.has(rec.id)) {
        blocked.push({
          recommendation: rec,
          reason: 'This supplement is not recommended during pregnancy. Safety data in pregnancy is insufficient or it has known risks to fetal development.',
          severity: 'critical',
          interactingMedication: 'pregnancy',
        });
      }
    }
    const blockedIds = new Set(blocked.map(b => b.recommendation.id));
    approved = approved.filter(r => !blockedIds.has(r.id));
  }

  // 4c. Chemotherapy — flag all antioxidants
  if (hasMed(quiz.medications, CHEMO_KW)) {
    for (const rec of approved) {
      if (ANTIOXIDANT_IDS.has(rec.id)) {
        if (!warnings.some(w => w.supplementId === rec.id && w.medication === 'Chemotherapy')) {
          warnings.push({
            supplementId: rec.id,
            medication: 'Chemotherapy',
            severity: 'moderate',
            description: 'Antioxidant supplementation during chemotherapy is controversial. Some evidence suggests antioxidants may reduce chemotherapy efficacy by protecting cancer cells from oxidative damage.',
            recommendation: 'Consult your oncologist before taking any antioxidant supplements during active chemotherapy.',
          });
        }
      }
    }
  }

  // 4d. Blood thinner check — extra flagging for warfarin/DOAC users
  if (hasMed(quiz.medications, ALL_ANTICOAG_KW)) {
    for (const rec of approved) {
      if (BLOOD_THINNING_IDS.has(rec.id)) {
        const existing = warnings.some(w => w.supplementId === rec.id);
        if (!existing) {
          warnings.push({
            supplementId: rec.id,
            medication: 'Anticoagulant therapy',
            severity: 'major',
            description: `${rec.supplementName} has antiplatelet or blood-thinning properties. Combined with anticoagulant medication, bleeding risk is elevated.`,
            recommendation: 'Discuss with prescriber. Consider INR monitoring if on warfarin. Avoid combining more than 2–3 blood-thinning supplements.',
          });
        }
      }
    }
  }

  // 4e. CKD — flag high-risk supplements
  const ckdKeywords = ['ckd', 'chronic kidney disease', 'kidney disease', 'renal failure', 'renal impairment', 'end-stage renal', 'esrd', 'nephropathy'];
  if (hasCondition(quiz.healthConditions, ckdKeywords)) {
    for (const rec of approved) {
      if (CKD_FLAGGED_IDS.has(rec.id)) {
        warnings.push({
          supplementId: rec.id,
          medication: 'CKD',
          severity: 'major',
          description: `${rec.supplementName} may accumulate to dangerous levels in chronic kidney disease. Impaired renal clearance increases the risk of hyperkalaemia and other complications.`,
          recommendation: 'Consult a nephrologist before using this supplement. Potassium and phosphorus supplements generally require medical supervision in CKD.',
        });
      }
      if (rec.id.startsWith('vitamin-a') || rec.id === 'retinol') {
        if (rec.doseUnit === 'IU' && rec.dose > CKD_HIGH_DOSE_VITAMIN_A_THRESHOLD) {
          warnings.push({
            supplementId: rec.id,
            medication: 'CKD',
            severity: 'moderate',
            description: 'High-dose Vitamin A accumulates in CKD due to impaired renal metabolism of retinol-binding proteins.',
            recommendation: 'Limit Vitamin A to <5,000 IU/day in CKD. Monitor with nephrologist.',
          });
        }
      }
      if (rec.id === 'vitamin-c' && rec.doseUnit === 'mg' && rec.dose > CKD_HIGH_DOSE_VITAMIN_C_THRESHOLD) {
        warnings.push({
          supplementId: rec.id,
          medication: 'CKD',
          severity: 'moderate',
          description: 'High-dose Vitamin C is metabolised to oxalate, which can accumulate and form kidney stones in CKD.',
          recommendation: 'Limit Vitamin C to ≤500mg/day in CKD. Avoid doses >1,000mg.',
        });
      }
    }
  }

  // 4f. Final allergy check — shellfish-derived supplements
  if (quiz.allergies.map(a => a.toLowerCase()).includes('shellfish')) {
    for (const rec of approved) {
      if (rec.id === 'glucosamine-chondroitin' && rec.form === 'glucosamine-sulfate') {
        warnings.push({
          supplementId: rec.id,
          medication: 'shellfish-allergy',
          severity: 'major',
          description: 'Standard glucosamine sulfate is derived from shellfish. This patient has a reported shellfish allergy.',
          recommendation: 'Switch to corn-derived vegan glucosamine. Verify the supplement label confirms no shellfish source.',
        });
      }
      // Fish-derived collagen for fish-allergic users
      if (quiz.allergies.map(a => a.toLowerCase()).includes('fish')) {
        if ((rec.id === 'collagen-peptides' && rec.form !== 'plant-collagen') ||
            rec.id === 'omega-3-fish-oil') {
          warnings.push({
            supplementId: rec.id,
            medication: 'fish-allergy',
            severity: 'major',
            description: `${rec.supplementName} is derived from fish. This patient has a reported fish allergy.`,
            recommendation: 'Switch to a non-fish alternative. For omega-3, use algae-based DHA. For collagen, use plant-based alternatives or marine collagen from a non-fish source.',
          });
        }
      }
    }
  }

  return { approved, blocked, warnings };
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

/**
 * Run all safety checks against the finalised supplement protocol.
 *
 * @param quiz    Full user quiz data (including medications, allergies, health conditions)
 * @param recs    Output of layer 7 — the finalised, capped recommendation list
 * @returns       SafetyResult with approved recs, blocked recs, warnings, supplement interactions, and UL checks
 */
export function runSafetyFilter(quiz: QuizData, recs: Recommendation[]): SafetyResult {
  // Step 1: Drug-supplement interactions
  const drugResult = checkDrugInteractions(quiz, recs);

  // Step 2: Supplement-supplement interactions (on post-drug-check recs)
  const suppResult = checkSuppSupplementInteractions(drugResult.approved);

  // Step 3: UL checks (on post-supp-check recs)
  const ulResult = checkULs(quiz, suppResult.approved);

  // Step 4: Special safety checks (smoker, pregnancy, chemo, CKD, allergy)
  const specialResult = checkSpecialSafety(quiz, ulResult.approved);

  // Merge all blocked recommendations (drug interactions + special checks)
  const allBlocked: BlockedSupplement[] = [
    ...drugResult.blocked,
    ...specialResult.blocked,
  ];

  // Merge all warnings
  const allWarnings: SafetyWarning[] = [
    ...drugResult.warnings,
    ...suppResult.warnings,
    ...ulResult.warnings,
    ...specialResult.warnings,
  ];

  return {
    approvedRecommendations: specialResult.approved,
    blockedRecommendations: allBlocked,
    warnings: allWarnings,
    supplementInteractions: suppResult.supplementInteractions,
    ulChecks: ulResult.ulChecks,
  };
}
