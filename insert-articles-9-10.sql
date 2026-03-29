-- Insert articles 9-10: Sleep & Hashimoto's
-- Run this in the Supabase SQL Editor

INSERT INTO blog_posts (slug, title, excerpt, category, read_time, author_name, author_title, published_at, tags, content) VALUES
(
  'sleep-supplements-pharmacologist-guide',
  'Sleep Optimization: A Pharmacologist''s Guide to Sleep Supplements',
  'Melatonin at 0.5 mg works better than 10 mg. Glycine lowers core body temperature. Here''s what a pharmacologist actually recommends for sleep — and the drug interactions you need to know.',
  'deep-dive',
  '9 min read',
  'Dr. James Whitfield',
  'PharmD, Clinical Pharmacology',
  '2026-03-29 17:00:00+00',
  ARRAY['sleep','melatonin','magnesium','glycine','l-theanine','insomnia','valerian'],
  $content$
## A Pharmacologist's Honest Guide to Sleep Supplements

As a clinical pharmacologist, I spend my career evaluating what compounds actually do in the human body versus what the marketing claims. Sleep supplements are one of the most oversold, underdosed, and misunderstood categories on the market.

Here is what the pharmacology actually supports — in the order you should try them.

## Step Zero: Sleep Hygiene First

No supplement can override:

- **Blue light after 9pm** — suppresses endogenous melatonin by up to 50%
- **Caffeine after 2pm** — half-life is 5–6 hours; a 3pm coffee is still 50% active at 9pm
- **Irregular sleep schedule** — your circadian rhythm needs consistency more than any pill
- **Bedroom temperature above 20°C (68°F)** — core body temperature must drop to initiate sleep

Fix these before spending money on supplements. If you have done so and still struggle, proceed below.

## The Supplements, Ranked by Evidence

### 1. Magnesium Glycinate

**Dose:** 300–400 mg elemental magnesium, 30–60 min before bed
**Evidence strength:** Strong
**Onset:** 30–45 minutes

Magnesium glycinate is my first recommendation for a reason: it addresses the most common nutritional deficiency (affecting 60–70% of adults) with the best-tolerated form for sleep.

The glycine carrier is not incidental — glycine itself is an inhibitory neurotransmitter. A 2006 study in *Sleep and Biological Rhythms* found 3 g glycine before bed improved subjective sleep quality and reduced daytime sleepiness. In magnesium glycinate, you get both the magnesium (GABA receptor modulation, muscle relaxation) and the glycine (core temperature reduction, inhibitory neurotransmission).

A 2012 RCT in the *Journal of Research in Medical Sciences* confirmed magnesium supplementation significantly improved sleep quality (Pittsburgh Sleep Quality Index), sleep time, and melatonin levels in elderly subjects.

**Why not magnesium oxide?** At 4% bioavailability, you would need to take enormous doses — most of which will cause diarrhoea before reaching therapeutic blood levels. Glycinate absorbs at 60–80%.

### 2. Melatonin: The Dose Paradox

**Dose:** 0.3–1 mg, 30–60 min before bed
**Evidence strength:** Strong (at correct dose)
**Onset:** 20–40 minutes

Here is the most counterintuitive fact in sleep supplementation: **lower doses of melatonin work better than higher doses.**

A 2001 study by Zhdanova et al. in *Clinical Pharmacology & Therapeutics* found that 0.3 mg melatonin restored physiological nighttime melatonin levels and improved sleep, while 3 mg produced supraphysiological levels that disrupted sleep architecture and caused morning grogginess.

The problem: most commercial melatonin products contain 5–10 mg — roughly 10–30x the physiological dose. At these levels, melatonin receptors downregulate, rebound insomnia occurs on cessation, and next-day sedation impairs function. A 2005 meta-analysis in *Sleep Medicine Reviews* confirmed melatonin's benefit at physiological doses (0.1–0.5 mg) with diminishing returns above 1 mg.

**Practical advice:** Buy 1 mg tablets and break them in half. Or find the rare 0.3–0.5 mg products (Sundown Naturals makes a 300 mcg). More is genuinely worse here.

**Melatonin is most effective for:** circadian rhythm disorders (jet lag, shift work, delayed sleep phase), not primary insomnia. If your problem is falling asleep at a normal time, melatonin helps. If your problem is staying asleep or sleep quality, look elsewhere.

### 3. L-Theanine

**Dose:** 200–400 mg, 30–60 min before bed
**Evidence strength:** Moderate-to-strong
**Onset:** 30–60 minutes

L-theanine promotes alpha brain wave activity — the pattern associated with relaxed wakefulness, the transition state into sleep. A 2019 RCT in *Nutrients* found 200 mg L-theanine improved sleep quality scores and reduced sleep disturbance.

The advantage of L-theanine is that it calms without sedating. You will not feel drugged or groggy. It is particularly useful for people whose insomnia is driven by racing thoughts or an inability to "switch off." It also pairs well with magnesium — the two address different mechanisms (alpha waves vs. GABA/glycine pathways).

### 4. Glycine

**Dose:** 3 g, 30–60 min before bed
**Evidence strength:** Moderate
**Onset:** 30 minutes

Glycine's sleep mechanism is elegant: it lowers core body temperature by dilating peripheral blood vessels, mimicking the natural thermoregulatory process that initiates sleep. A 2007 study in *Sleep and Biological Rhythms* found 3 g glycine before bed improved subjective sleep quality, sleep efficiency, and next-day cognitive performance. A 2012 study in *Neuropsychopharmacology* confirmed the core temperature mechanism via polysomnography.

If you already take magnesium glycinate, you are getting some glycine — but typically 1–1.5 g, not the 3 g used in studies. Adding standalone glycine powder (BulkSupplements offers unflavoured) can bridge the gap. It tastes mildly sweet and dissolves easily in water.

### 5. Tart Cherry Extract

**Dose:** 480 mg anthocyanins/day or 30 mL concentrate twice daily
**Evidence strength:** Moderate
**Onset:** 1–2 weeks of consistent use

Tart cherries are one of the few natural food sources of melatonin. A 2012 RCT in the *European Journal of Nutrition* found tart cherry juice increased urinary melatonin metabolites and improved sleep duration by 84 minutes and sleep efficiency by 5.7%. A 2018 pilot study in the *American Journal of Therapeutics* confirmed improved sleep duration and quality in adults with insomnia.

Tart cherry also provides anti-inflammatory polyphenols, making it a dual-purpose supplement for people who train and also struggle with sleep.

### 6. Valerian + Passionflower

**Dose:** Valerian 300–600 mg + passionflower 250–500 mg, 30–60 min before bed
**Evidence strength:** Moderate (combined); individually weaker
**Onset:** 2–4 weeks of consistent use

Both valerian and passionflower modulate GABA-A receptors — the same target as benzodiazepines, but with far weaker and safer binding. A 2011 RCT in *Phytotherapy Research* found 500 mg passionflower extract improved sleep quality (Pittsburgh Sleep Quality Index) versus placebo. Valerian has mixed results in isolation but shows more consistent benefit when combined with passionflower or hops.

These herbs are most appropriate for mild sleep difficulty and work best with sustained use, not single doses.

## What About CBD?

An honest assessment: the evidence for CBD and sleep is **preliminary and conflicting.**

A 2019 case series in *The Permanente Journal* (n=72) found 66.7% of patients reported improved sleep scores in the first month — but scores fluctuated thereafter. A 2021 systematic review in *Sleep Medicine Reviews* concluded that existing evidence is "insufficient to support or refute the efficacy of CBD for sleep disorders."

The main issues:
- Dosing is unstandardised (studies range from 25 mg to 1,500 mg)
- Product quality varies enormously — a 2017 JAMA study found 69% of CBD products were mislabelled
- CBD may help sleep indirectly by reducing anxiety, rather than through direct sleep-promoting mechanisms
- It interacts with CYP3A4 and CYP2C19 enzymes, affecting metabolism of many medications

If you try CBD, use third-party tested products from reputable brands. But recognise that the evidence base is far weaker than for the supplements above.

## Drug Interactions: The Critical Safety Layer

Sleep supplements are not benign when combined with certain medications:

| Supplement | Interacts With | Risk |
|-----------|---------------|------|
| Melatonin | Fluvoxamine (SSRI) | Fluvoxamine inhibits CYP1A2, increasing melatonin levels 12-fold |
| Melatonin | Blood thinners | May increase bleeding risk |
| Valerian | Benzodiazepines, Z-drugs | Additive CNS depression — excessive sedation |
| Magnesium | Antibiotics (tetracyclines, fluoroquinolones) | Chelation reduces antibiotic absorption |
| L-Theanine | Blood pressure medications | Additive hypotensive effect |
| CBD | CYP3A4/2C19 substrates (statins, SSRIs, warfarin) | Altered drug metabolism |

**If you take any prescription medication, review your sleep supplement stack with a pharmacist.** This is not optional.

## The Sleep Stack: Order of Operations

1. **Fix sleep hygiene** (free, most effective)
2. **Magnesium glycinate** 300–400 mg — start here
3. **Add L-theanine** 200 mg if racing thoughts persist
4. **Add glycine** 3 g if you run warm or have difficulty initiating sleep
5. **Try low-dose melatonin** 0.3–0.5 mg only for circadian issues
6. **Consider valerian + passionflower** for mild, chronic sleep difficulty

Take all sleep supplements **30–60 minutes before your target bedtime.** Consistency matters more than any single dose.

## Ready for Your Personalized Protocol?

Every body is different. What works for one person may not work for another. Our free 5-minute assessment analyzes your health profile, medications, and goals to create an evidence-based supplement plan tailored specifically to you.

**[Take the free assessment →](/quiz)**
$content$
);

INSERT INTO blog_posts (slug, title, excerpt, category, read_time, author_name, author_title, published_at, tags, content) VALUES
(
  'hashimotos-thyroiditis-supplements',
  'Hashimoto''s Thyroiditis: The Supplement Protocol Your Endocrinologist Should Know',
  'Selenium 200 mcg reduces TPO antibodies. High-dose iodine makes Hashimoto''s worse. Here''s the evidence-based supplement protocol — and the common mistakes that harm patients.',
  'condition-guide',
  '10 min read',
  'Dr. Sarah Chen',
  'PhD Nutritional Biochemistry, Stanford',
  '2026-03-29 18:00:00+00',
  ARRAY['hashimotos','thyroid','selenium','vitamin d','autoimmune','tpo','hypothyroidism'],
  $content$
## Hashimoto's Supplements: What the Evidence Supports

Hashimoto's thyroiditis is the most common autoimmune disease worldwide, affecting roughly 5% of the population. It is characterised by TPO (thyroid peroxidase) antibodies attacking thyroid tissue, leading to gradual hypothyroidism. Most patients are treated with levothyroxine — but medication addresses the hormone deficit, not the underlying autoimmune process.

Several supplements have evidence for modulating the autoimmune component, supporting thyroid function, and correcting deficiencies that are common in Hashimoto's. But this is also a condition where well-intentioned supplementation can do real harm.

## Tier 1: Strong Evidence

### Selenium

**Dose:** 200 mcg/day
**Evidence strength:** The strongest supplement evidence in Hashimoto's

Selenium is a cofactor for glutathione peroxidase and thioredoxin reductase — enzymes that protect the thyroid from oxidative damage. The thyroid contains more selenium per gram of tissue than any other organ.

A 2002 landmark RCT in the *Journal of Clinical Endocrinology & Metabolism* (n=70) found 200 mcg sodium selenite daily for 3 months reduced TPO antibodies by **36%** compared to a slight increase in the placebo group. A 2010 systematic review and meta-analysis confirmed: selenium supplementation significantly reduces TPO antibody titres in Hashimoto's patients.

**Form matters.** Selenomethionine (organic, bound to the amino acid methionine) is better absorbed and retained than selenite (inorganic). A 2009 study in *Biological Trace Element Research* found selenomethionine raised blood selenium levels more effectively. Pure Encapsulations Selenium (Selenomethionine) 200 mcg is a reliable pharmaceutical-grade option.

**Safety note:** The upper tolerable limit for selenium is 400 mcg/day. Chronic intake above this causes selenosis (garlic breath, hair loss, nail brittleness, neuropathy). Do not exceed 200 mcg from supplements — you get additional selenium from Brazil nuts (1 nut ≈ 70–90 mcg), fish, and meat.

### Vitamin D

**Dose:** 2,000–5,000 IU/day (adjust based on blood levels)
**Evidence strength:** Strong

Vitamin D deficiency is near-universal in Hashimoto's patients. A 2015 meta-analysis in *Thyroid* found that Hashimoto's patients had significantly lower vitamin D levels than healthy controls, and that deficiency correlated with higher TPO antibody titres.

Vitamin D modulates the immune system by promoting regulatory T cells (which suppress autoimmunity) and reducing pro-inflammatory cytokines. A 2019 RCT in the *Indian Journal of Endocrinology and Metabolism* found 60,000 IU vitamin D monthly (equivalent to ~2,000 IU/day) for 8 weeks significantly reduced TPO antibodies in deficient Hashimoto's patients.

Target blood levels: 40–60 ng/mL. Most Hashimoto's patients require 3,000–5,000 IU/day to reach this range. Always take D3 with fat for absorption, and pair with vitamin K2 (100–200 mcg MK-7) to direct calcium appropriately.

## Tier 2: Moderate Evidence

### Zinc

**Dose:** 20–30 mg/day (elemental zinc)
**Evidence strength:** Moderate

Zinc is required for thyroid hormone synthesis (T4 → T3 conversion) and immune regulation. A 2015 study in *Biological Trace Element Research* found that zinc supplementation (30 mg/day for 12 weeks) improved thyroid hormone levels (free T3) and reduced TSH in Hashimoto's patients.

Zinc deficiency is common in hypothyroidism because thyroid hormones are required for zinc absorption — another vicious cycle. If you have Hashimoto's with persistent fatigue despite adequate levothyroxine dosing, zinc status is worth investigating.

Use zinc picolinate or bisglycinate for best absorption. Take with food to avoid nausea, and separate from thyroid medication by 4 hours.

### Iron

**Dose:** Based on deficiency — do NOT supplement without testing
**Evidence strength:** Moderate (for deficient individuals)

Iron deficiency and hypothyroidism frequently coexist. Low thyroid hormone reduces gastric acid production, which impairs iron absorption. Low iron impairs thyroid peroxidase activity, which impairs thyroid hormone production. A 2019 study in the *European Thyroid Journal* found that correcting iron deficiency improved TSH levels independent of levothyroxine dose adjustment.

**Test ferritin** — target 50–70 ng/mL. Supplement only if deficient. Iron must be taken at least **4 hours apart from levothyroxine** to avoid absorption interference.

## The Iodine Controversy

This is the single most misunderstood topic in thyroid health, and getting it wrong actively harms patients.

### The Paradox

Iodine is essential for thyroid hormone synthesis. Iodine deficiency causes goitre and hypothyroidism. Therefore, iodine supplementation should help thyroid disease — right?

**Wrong, in the case of Hashimoto's.**

In autoimmune thyroiditis, excess iodine increases thyroid peroxidase activity, which generates more hydrogen peroxide in the thyroid gland. In a gland already under autoimmune attack, this accelerates tissue destruction. A 2006 study in *Thyroid* demonstrated that even moderate iodine supplementation (250 mcg/day) increased TPO antibodies in susceptible individuals.

The epidemiological data is clear: countries that introduced iodine fortification programs saw increases in Hashimoto's incidence. A 2014 review in *Best Practice & Research Clinical Endocrinology* confirmed that excessive iodine intake is a trigger for autoimmune thyroiditis in genetically susceptible individuals.

### What This Means Practically

- **If you have Hashimoto's, do NOT take iodine supplements, kelp, or seaweed extract**
- Dietary iodine from iodized salt and normal food is fine — you do not need to eliminate it
- The danger is supplemental iodine in concentrated form (150–1,000+ mcg from pills)
- This is one of the most common mistakes patients make after reading "thyroid support" supplement labels — most contain iodine

## The Gluten Connection

The molecular mimicry theory proposes that gliadin (a protein in gluten) structurally resembles thyroid tissue. When the immune system attacks gliadin, it may cross-react with thyroid peroxidase. A 2018 study in *Endocrine Connections* found that a gluten-free diet for 6 months reduced TPO antibodies by 44% in Hashimoto's patients — even those without coeliac disease.

This is not universally accepted, and the evidence comes from relatively small studies. However, given gluten elimination is safe and costless, a 3-month trial is reasonable for Hashimoto's patients with persistently elevated antibodies despite optimal medication and supplementation.

## Levothyroxine Timing: The 4-Hour Rule

This is a medication management issue, not a supplement topic — but it is critical because supplements directly affect it.

Levothyroxine absorption is reduced by:

- **Calcium** — reduces absorption by up to 60%
- **Iron** — reduces absorption by up to 75%
- **Magnesium** — reduces absorption by up to 40%
- **Coffee** — reduces absorption by up to 36%

**The protocol:** Take levothyroxine first thing in the morning on an empty stomach with water only. Wait at least 30–60 minutes before food or coffee. Take calcium, iron, and magnesium supplements at least **4 hours later** — ideally with lunch or dinner.

This is non-negotiable. Patients who take their thyroid medication with breakfast and supplements often have unexplained TSH fluctuations despite consistent dosing.

## Monitoring: TPO Antibodies, Not Just TSH

Most endocrinologists monitor only TSH and free T4. This tells you whether your levothyroxine dose is correct — not whether the autoimmune process is active or improving.

**Request TPO antibody testing** every 6–12 months. Declining antibodies indicate the autoimmune process is quieting. Rising antibodies suggest ongoing thyroid destruction despite adequate hormone replacement.

Supplements like selenium and vitamin D can measurably reduce antibody titres — but you need the data to know if your protocol is working.

## The Hashimoto's Supplement Protocol

**Core stack (evidence-based):**
- **Selenium** 200 mcg selenomethionine daily
- **Vitamin D3** 3,000–5,000 IU daily (with K2 100 mcg)
- **Zinc** 20–30 mg daily (4 hours from levothyroxine)

**If deficient (test first):**
- **Iron** — target ferritin 50–70 ng/mL (4 hours from levothyroxine)

**Avoid:**
- Iodine supplements, kelp, seaweed extract
- Any "thyroid support" blend containing iodine

**Consider:**
- 3-month gluten elimination trial if antibodies remain elevated

**Monitor:**
- TSH + free T4 every 3–6 months
- TPO antibodies every 6–12 months
- Vitamin D levels annually
- Ferritin annually

## Ready for Your Personalized Protocol?

Every body is different. What works for one person may not work for another. Our free 5-minute assessment analyzes your health profile, medications, and goals to create an evidence-based supplement plan tailored specifically to you.

**[Take the free assessment →](/quiz)**
$content$
);
