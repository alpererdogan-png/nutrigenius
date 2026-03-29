-- Insert articles 4-6 into NutriGenius blog
-- Run this in the Supabase SQL Editor

INSERT INTO blog_posts (slug, title, excerpt, category, read_time, author_name, author_title, published_at, tags, content) VALUES
(
  'adhd-supplements-clinical-evidence',
  'ADHD and Nutrition: Which Supplements Have Clinical Support?',
  'Omega-3, iron, zinc, and magnesium have real clinical data behind them for ADHD. Here''s what the research says — and why testing nutrient levels matters more than guessing.',
  'research-update',
  '9 min read',
  'Dr. James Whitfield',
  'PharmD, Clinical Pharmacology',
  '2026-03-29 12:00:00+00',
  ARRAY['adhd','omega-3','dha','iron','zinc','magnesium','focus','attention'],
  $content$
## ADHD and Nutrition: Separating Evidence From Hype

Attention deficit hyperactivity disorder affects roughly 5–7% of children and 2–5% of adults worldwide. While behavioural therapy and medication (stimulants, non-stimulants) remain the cornerstones of treatment, nutritional factors play a larger role than most clinicians acknowledge.

This is not about replacing medication with supplements. It is about identifying and correcting nutrient deficiencies that may worsen symptoms — and recognising where the evidence genuinely supports adjunctive nutritional intervention.

**Critical principle:** Test nutrient levels before supplementing. Blind supplementation wastes money and delays appropriate treatment. Ask your doctor for serum ferritin, zinc, magnesium (RBC), and omega-3 index testing.

## Tier 1: Strong Evidence

### Omega-3 Fatty Acids (DHA Focus)

**Dose:** 1,000–2,000 mg combined EPA+DHA daily, with emphasis on DHA
**Evidence strength:** Strong

Omega-3 fatty acids — particularly DHA — have the strongest nutritional evidence in ADHD. A 2018 meta-analysis in *Neuropsychopharmacology* (16 RCTs, n=1,514) found a small but statistically significant improvement in attention, hyperactivity, and overall ADHD symptoms with omega-3 supplementation.

A 2017 *Journal of the American Academy of Child & Adolescent Psychiatry* meta-analysis confirmed: children with ADHD have significantly lower blood DHA levels than neurotypical controls. Supplementation with high-DHA formulations shows the most consistent benefits.

**Why DHA specifically?** DHA comprises 97% of omega-3 fats in the brain and is critical for neuronal membrane fluidity, dopamine signalling, and prefrontal cortex function — the exact systems impaired in ADHD. Standard fish oil is often EPA-dominant; look for DHA-concentrated products like Nordic Naturals DHA Xtra.

### Iron

**Dose:** Based on deficiency — do NOT supplement without testing
**Evidence strength:** Strong (for deficient individuals)

Iron is essential for dopamine synthesis. A landmark 2004 study in *Archives of Pediatrics & Adolescent Medicine* found that **84% of children with ADHD had ferritin levels below 30 ng/mL**, compared to 18% of controls. Low ferritin correlated with symptom severity.

A 2008 RCT in *Pediatric Neurology* (n=23) found 80 mg/day ferrous sulfate for 12 weeks significantly improved ADHD rating scale scores in iron-deficient children (ferritin <30 ng/mL).

**Warning:** Iron supplementation without confirmed deficiency can cause harm (GI side effects, oxidative stress, iron overload). Always test ferritin first. Target ferritin of 50–70 ng/mL for optimal dopamine synthesis.

## Tier 2: Moderate Evidence

### Zinc

**Dose:** 15–30 mg/day (elemental zinc)
**Evidence strength:** Moderate

Zinc is a cofactor in over 100 enzymes involved in neurotransmitter metabolism. A 2005 meta-analysis in *Journal of Child and Adolescent Psychopharmacology* found significantly lower zinc levels in ADHD children. A 2011 RCT in *Progress in Neuro-Psychopharmacology & Biological Psychiatry* (n=44) found 30 mg/day zinc as an adjunct to methylphenidate improved symptoms more than methylphenidate alone.

The benefit is most pronounced in zinc-deficient populations — common in children with restricted diets or those in regions with zinc-depleted soil. Use zinc picolinate or zinc bisglycinate for best absorption.

### Magnesium

**Dose:** 200–400 mg/day (glycinate or threonate)
**Evidence strength:** Moderate

Magnesium deficiency is found in 72% of children with ADHD according to a 2016 study in the *Egyptian Journal of Medical Human Genetics*. Magnesium regulates NMDA receptors and catecholamine release — both relevant to ADHD neurobiology.

A 2006 *Magnesium Research* study found 6 months of magnesium + B6 supplementation significantly reduced hyperactivity, aggressiveness, and inattention in ADHD children. Magnesium L-threonate is especially interesting as the only form shown to cross the blood-brain barrier effectively.

## Emerging Evidence

### Phosphatidylserine

**Dose:** 200 mg/day
**Evidence strength:** Preliminary

Phosphatidylserine (PS) is a phospholipid critical for cell membrane integrity and neurotransmitter release. A 2012 RCT in *Journal of Human Nutrition and Dietetics* (n=36) found 200 mg/day PS improved short-term auditory memory and inattention in ADHD children over 2 months. A 2014 RCT combined PS with omega-3 and found significant improvements in restless/impulsive behaviour.

Promising, but larger trials are needed before firm recommendations.

## What About Elimination Diets?

The Feingold diet (removing artificial colours and preservatives) and "few-foods" elimination diets have shown benefit in some studies. A 2011 *Lancet* RCT found that a restricted elimination diet improved ADHD symptoms in 64% of children. However, these diets are extremely restrictive and difficult to maintain.

The most pragmatic approach: eliminate artificial food colourings (which the EU already requires warning labels for) and assess response before attempting full elimination protocols.

## The Adjunctive Principle

Supplements for ADHD are **adjunctive** — they work alongside, not instead of, established treatments. The evidence supports:

1. **Test first:** Ferritin, zinc, RBC magnesium, omega-3 index
2. **Correct deficiencies:** Iron if ferritin <30, zinc if low, magnesium if deficient
3. **Add omega-3:** 1,000–2,000 mg EPA+DHA with DHA emphasis — even without confirmed deficiency
4. **Continue core treatment:** Behavioural strategies, medication if prescribed, structured routines

The most common mistake is supplementing blindly without testing, or abandoning proven treatments in favour of supplements alone. The evidence supports integration, not replacement.

## Ready for Your Personalized Protocol?

Every body is different. What works for one person may not work for another. Our free 5-minute assessment analyzes your health profile, medications, and goals to create an evidence-based supplement plan tailored specifically to you.

**[Take the free assessment →](/quiz)**
$content$
);

INSERT INTO blog_posts (slug, title, excerpt, category, read_time, author_name, author_title, published_at, tags, content) VALUES
(
  'vegan-supplement-checklist',
  'The Complete Vegan Supplement Checklist: What You''re Probably Missing',
  'B12 is just the beginning. From algae-based omega-3 to the BCMO1 gene variant that affects vitamin A conversion, here''s the full vegan supplement picture.',
  'deep-dive',
  '10 min read',
  'Dr. Sarah Chen',
  'PhD Nutritional Biochemistry, Stanford',
  '2026-03-29 13:00:00+00',
  ARRAY['vegan','b12','omega-3','iron','zinc','vitamin d','calcium','plant-based','nutrition'],
  $content$
## The Nutrients a Vegan Diet Can — and Cannot — Provide

A well-planned vegan diet can be extraordinarily healthy. It is associated with lower rates of heart disease, type 2 diabetes, and certain cancers. But "well-planned" is the operative phrase. Several essential nutrients are either absent from plant foods, present in poorly absorbed forms, or require intake levels that are difficult to achieve without supplementation.

The claim that "you can get everything you need from a whole-food vegan diet" is not just inaccurate — for B12 specifically, it is **dangerous misinformation** that has caused documented cases of irreversible neurological damage.

Here is the complete evidence-based checklist.

## Non-Negotiable: Supplement These

### 1. Vitamin B12

**Dose:** 2,500 mcg cyanocobalamin weekly, or 250 mcg daily
**Priority:** Critical — no exceptions

There is no reliable plant source of B12. Nutritional yeast and fermented foods contain analogues that may actually interfere with true B12 absorption. B12 deficiency causes megaloblastic anaemia and, if prolonged, irreversible peripheral neuropathy and cognitive decline.

A 2013 study in the *European Journal of Clinical Nutrition* found that **52% of vegans were B12 deficient** (serum B12 <200 pg/mL) compared to 7% of omnivores. Subclinical deficiency (200–300 pg/mL) was present in an additional 20%.

Use methylcobalamin or cyanocobalamin — both are effective. Cyanocobalamin is better studied and more stable. Jarrow Formulas Methylcobalamin 5000 mcg is a popular high-quality option for vegans.

### 2. Omega-3 (DHA + EPA)

**Dose:** 250–500 mg combined DHA+EPA daily from algae oil
**Priority:** Critical

The body can convert alpha-linolenic acid (ALA) from flaxseed, chia, and walnuts into DHA and EPA. The problem: **conversion efficiency is below 5% for DHA and 8% for EPA** according to a 2006 review in the *American Journal of Clinical Nutrition*. Some individuals with certain FADS gene variants convert at virtually zero.

DHA is essential for brain function, retinal health, and inflammation regulation. Do not rely on flax or chia — use algae-based DHA+EPA supplements. These provide the same omega-3s as fish oil (fish get their DHA from algae in the first place). Nordic Naturals Algae Omega is one of the few third-party tested algae options.

### 3. Vitamin D3

**Dose:** 2,000–4,000 IU daily (adjust based on blood levels)
**Priority:** High

Vitamin D deficiency is common across all diets, but vegans are at higher risk because most D3 supplements are derived from lanolin (sheep wool). **Lichen-sourced vegan D3** is now widely available and equally effective. Vitamin D2 (ergocalciferol) is vegan but raises blood levels 87% less effectively than D3.

Target blood levels: 40–60 ng/mL. Test annually, especially if you live above 35°N latitude.

## Likely Needed: Assess and Supplement

### 4. Iron

**Dose:** 18–36 mg/day for pre-menopausal women; men and post-menopausal women may not need supplementation
**Priority:** High for women; assess for men

Plant-based (non-heme) iron absorbs at 2–20% compared to 15–35% for heme iron from animal sources. Phytates in grains and legumes further reduce absorption. The Institute of Medicine recommends vegans consume **1.8x the RDA** for iron.

Practical tips:
- **Take iron with vitamin C** — 75 mg vitamin C can increase non-heme iron absorption by 3–4x
- **Avoid iron with coffee, tea, or calcium** — these block absorption
- **Cook in cast iron** — especially with acidic foods like tomato sauce
- **Test ferritin** regularly — target 50–70 ng/mL

### 5. Zinc

**Dose:** 12–15 mg/day (50% above standard RDA)
**Priority:** High

Phytates in legumes, grains, and nuts bind zinc and reduce absorption by up to 50%. The World Health Organization recommends vegans consume 50% more zinc than omnivores. A 2013 meta-analysis in the *Journal of the Science of Food and Agriculture* confirmed significantly lower zinc status in vegetarians and vegans.

Soaking, sprouting, and fermenting grains and legumes reduces phytate content. Supplemental zinc picolinate or zinc bisglycinate provides superior absorption.

### 6. Iodine

**Dose:** 150 mcg/day
**Priority:** High if not using iodized salt

Iodine is essential for thyroid function. Dairy products and fish are the primary dietary sources in most Western diets. Vegans who avoid iodized salt and sea vegetables are at significant risk of deficiency. A 2011 study in the *British Journal of Nutrition* found vegans had the lowest urinary iodine concentrations of any dietary group.

Use iodized salt or supplement with 150 mcg potassium iodide. **Avoid kelp supplements** — iodine content varies wildly and can cause thyroid dysfunction from excess.

### 7. Calcium

**Dose:** 500–600 mg/day supplemental (if dietary intake is below 1,000 mg)
**Priority:** Moderate to high

Fortified plant milks, tofu made with calcium sulfate, and leafy greens (kale, bok choy — not spinach, whose oxalates block absorption) can provide adequate calcium. But many vegans fall short. A 2009 EPIC-Oxford study found vegans had a **30% higher fracture rate** than omnivores, largely attributable to lower calcium intake.

If your diet consistently includes fortified foods, you may not need a supplement. If not, add 500–600 mg calcium citrate daily — preferably split into two doses for better absorption.

## Often Overlooked

### 8. Choline

**Dose:** 400–550 mg/day from diet + supplement
**Priority:** Moderate

Choline is essential for liver function, brain development, and methylation. Eggs and liver are the richest dietary sources — both absent from vegan diets. A 2019 analysis in *BMJ Nutrition, Prevention & Health* warned that plant-based diets may be insufficient in choline.

Soy, quinoa, broccoli, and shiitake mushrooms provide some choline, but most vegans fall well below the adequate intake. Consider a choline bitartrate or citicoline supplement if your diet is low in soy.

### 9. The BCMO1 Gene Variant and Vitamin A

Most people assume beta-carotene from carrots and sweet potatoes converts to vitamin A (retinol) efficiently. For many, it does — but **approximately 45% of the population carries a BCMO1 gene variant** that reduces conversion efficiency by 32–69% (2009 study in *The FASEB Journal*).

For these individuals, even high beta-carotene intake may not provide adequate preformed vitamin A. Signs of poor conversion include dry skin, poor night vision, and frequent infections despite a carotene-rich diet. Genetic testing can identify this variant. If affected, consider a retinol-equivalent supplement from provitamin A carotenoids or discuss with your doctor.

## The Vegan Supplement Stack

**Daily essentials:**
- **B12:** 250 mcg cyanocobalamin or methylcobalamin
- **Algae omega-3:** 250–500 mg DHA+EPA
- **Vitamin D3:** 2,000 IU (lichen-sourced)
- **Iodine:** 150 mcg (if not using iodized salt)

**Assess and add if needed:**
- **Iron:** Test ferritin; supplement if below 50 ng/mL
- **Zinc:** 12–15 mg if diet is high in grains/legumes
- **Calcium:** 500–600 mg if not consuming fortified foods
- **Choline:** 300–400 mg if soy intake is low

A well-supplemented vegan diet is nutritionally complete. An unsupplemented one carries real risks. The evidence is clear — plan accordingly.

## Ready for Your Personalized Protocol?

Every body is different. What works for one person may not work for another. Our free 5-minute assessment analyzes your health profile, medications, and goals to create an evidence-based supplement plan tailored specifically to you.

**[Take the free assessment →](/quiz)**
$content$
);

INSERT INTO blog_posts (slug, title, excerpt, category, read_time, author_name, author_title, published_at, tags, content) VALUES
(
  'keto-electrolyte-guide',
  'Keto Electrolytes: Why You Feel Terrible and How to Fix It',
  'The "keto flu" isn''t carb withdrawal — it''s an electrolyte crash. Here''s exactly how much sodium, potassium, and magnesium you need and why "just add salt" isn''t enough.',
  'deep-dive',
  '5 min read',
  'Dr. Amara Osei',
  'PhD Molecular Nutrition, UCL',
  '2026-03-29 14:00:00+00',
  ARRAY['keto','electrolytes','sodium','potassium','magnesium','keto flu','ketogenic'],
  $content$
## The Keto Flu Is an Electrolyte Problem

You start keto. Three days in: headaches, brain fog, muscle cramps, fatigue. You assume it is carb withdrawal. It is not.

When you cut carbohydrates below ~50 g/day, insulin drops sharply. Low insulin signals your kidneys to excrete sodium — fast. Sodium pulls water and other electrolytes (potassium, magnesium) with it. Within 48–72 hours, you are depleted across the board.

The "keto flu" is **electrolyte deficiency**. Fix the electrolytes, fix the symptoms.

## The Three You Need

### Sodium: 3–5 g/day

This is the big one. Standard dietary advice says limit sodium. On keto, the opposite is true. Your kidneys are dumping sodium at an accelerated rate, and ketogenic diets are naturally low in processed foods (the main sodium source in Western diets).

**Signs of sodium deficiency:** headache, dizziness on standing, fatigue, brain fog, nausea.

**How to get it:**
- Add 1–2 tsp salt to food daily
- Drink bone broth (1 cup = ~1 g sodium)
- Use an electrolyte mix like LMNT (formulated for low-carb diets)

"Just add salt" is a start, but it only covers sodium. You need all three.

### Potassium: 3,500–4,700 mg/day

Potassium works in tandem with sodium for nerve and muscle function. Keto-friendly potassium sources include avocado (1,000 mg per avocado), spinach, salmon, and mushrooms. Most people still fall 200–400 mg short.

**Signs of potassium deficiency:** muscle cramps (especially legs), heart palpitations, weakness, constipation.

**Supplementation note:** Potassium supplements are capped at 99 mg per capsule due to cardiac safety regulations. Use potassium citrate powder (measured carefully) or focus on dietary sources. Do not mega-dose potassium — excess is dangerous.

### Magnesium: 300–400 mg/day

Ketosis increases renal magnesium excretion. A 2006 study in *Magnesium Research* documented significant magnesium depletion within the first week of carbohydrate restriction. Since 60–70% of people are already marginally magnesium-deficient on standard diets, keto accelerates the problem.

**Signs of magnesium deficiency:** muscle twitches, cramps, insomnia, anxiety, constipation.

**Best forms:** Magnesium glycinate (no laxative effect, calming) or magnesium malate (better for energy). Avoid magnesium oxide — 4% absorption is useless.

## Beyond the Big Three

### Taurine: 1–2 g/day

Often overlooked on keto. Taurine supports bile acid conjugation — critical on a high-fat diet. Your gallbladder is working overtime to emulsify fats. Taurine supplementation supports this process and may reduce the GI distress some people experience in early keto adaptation. A 2010 study in *Amino Acids* demonstrated taurine's role in bile salt synthesis and fat digestion.

### Fiber: Psyllium Husk

Constipation is the most common GI complaint on keto, driven by reduced fiber intake and electrolyte shifts. Psyllium husk (5–10 g/day in water) provides soluble fiber without significant carbohydrate impact (~2 g net carbs per tablespoon). It also feeds beneficial gut bacteria that can otherwise decline on very low-carb diets.

## Signs You Are Depleted

| Symptom | Likely Deficiency |
|---------|------------------|
| Headache, dizziness | Sodium |
| Leg cramps | Potassium or magnesium |
| Heart palpitations | Potassium |
| Insomnia, anxiety | Magnesium |
| Brain fog | Sodium |
| Constipation | Magnesium + fiber |
| Muscle twitching | Magnesium |

## Long-Term Keto: Monitor

If you stay keto beyond 3–6 months, request annual bloodwork including:

- **Comprehensive metabolic panel** (sodium, potassium, magnesium, calcium)
- **Lipid panel** — some people see LDL spikes on keto that warrant monitoring
- **Thyroid function** — very low-carb diets can reduce T3 conversion in some individuals
- **Kidney function** — relevant if protein intake is also high

## The Quick-Fix Protocol

Already in keto flu? Here is the immediate fix:

1. **Drink 1 cup bone broth** with an extra pinch of salt (immediate sodium boost)
2. **Take 400 mg magnesium glycinate** (calms cramps and anxiety within 30–60 minutes)
3. **Eat half an avocado** with salt (potassium + sodium + healthy fats)
4. **Sip an electrolyte drink** throughout the day (LMNT, Ultima, or DIY with salt + potassium citrate + magnesium powder)

Most people feel significantly better within 24 hours of correcting electrolytes. If symptoms persist beyond 5–7 days despite adequate electrolyte intake, reconsider whether the diet is appropriate for your physiology.

## Ready for Your Personalized Protocol?

Every body is different. What works for one person may not work for another. Our free 5-minute assessment analyzes your health profile, medications, and goals to create an evidence-based supplement plan tailored specifically to you.

**[Take the free assessment →](/quiz)**
$content$
);
