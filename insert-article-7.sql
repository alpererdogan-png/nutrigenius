-- Insert article 7: Athlete Recovery
-- Run this in the Supabase SQL Editor

INSERT INTO blog_posts (slug, title, excerpt, category, read_time, author_name, author_title, published_at, tags, content) VALUES
(
  'athlete-recovery-supplements',
  'Athlete Recovery: The Evidence-Based Supplement Protocol',
  'Creatine, omega-3, tart cherry, collagen + vitamin C — here''s what sports science actually supports for recovery, and what''s just marketing noise.',
  'evidence-review',
  '9 min read',
  'Dr. Amara Osei',
  'PhD Molecular Nutrition, UCL',
  '2026-03-29 15:00:00+00',
  ARRAY['creatine','recovery','athlete','omega-3','collagen','sports nutrition','endurance'],
  $content$
## Recovery Supplements: What the Sports Science Actually Shows

Training breaks muscle down. Recovery builds it back stronger. The supplement industry has capitalised on this simple truth with hundreds of products — most of which have no meaningful evidence behind them.

But a handful of supplements do have robust clinical trial data supporting their role in athletic recovery. Here is the protocol, ranked by evidence strength.

## Tier 1: The Non-Negotiables

### Creatine Monohydrate

**Dose:** 5 g/day, every day
**Evidence strength:** Strongest of any sports supplement

Creatine monohydrate is the single most studied supplement in sports science — over 500 peer-reviewed papers and counting. A 2017 position stand from the *International Society of Sports Nutrition* (ISSN) concluded it is the most effective ergogenic nutritional supplement available for increasing high-intensity exercise capacity and lean body mass.

What most people get wrong:

- **No loading phase needed.** The old "20 g/day for 5 days" protocol saturates stores faster but causes GI distress. 5 g/day reaches full saturation in 3–4 weeks with no side effects.
- **No cycling needed.** There is no evidence of downregulation with continuous use. Take it daily, year-round.
- **Monohydrate is the gold standard.** Creatine HCl, buffered creatine, creatine ethyl ester — none have outperformed plain monohydrate in head-to-head trials. Thorne Creatine is NSF Certified for Sport if third-party testing matters to you.
- **It works for endurance athletes too.** While most associated with strength sports, creatine improves repeated sprint performance, glycogen resynthesis, and thermoregulation.

### Omega-3 at Anti-Inflammatory Doses

**Dose:** 2,000–3,000 mg combined EPA+DHA daily
**Evidence strength:** Strong

Training-induced inflammation is necessary for adaptation, but excessive or prolonged inflammation impairs recovery. Omega-3 fatty acids at therapeutic doses modulate the inflammatory response without blunting adaptation.

A 2020 meta-analysis in the *British Journal of Sports Medicine* (18 RCTs) found omega-3 supplementation significantly reduced delayed-onset muscle soreness (DOMS) and markers of muscle damage (creatine kinase) after eccentric exercise. A 2021 study in *Medicine & Science in Sports & Exercise* found 3 g/day EPA+DHA improved force recovery after muscle-damaging exercise by 24% compared to placebo.

**Timing note:** Take omega-3 with any fat-containing meal. It does not need to be timed around training.

## Tier 2: Strong Supporting Evidence

### Tart Cherry Extract

**Dose:** 480 mg anthocyanins/day (typically 2 × 240 mg capsules or 30 mL concentrate twice daily)
**Evidence strength:** Strong

Montmorency tart cherry is the most studied polyphenol for exercise recovery. A 2010 RCT in the *Scandinavian Journal of Medicine & Science in Sports* found tart cherry juice consumed for 5 days before and 2 days after marathon running significantly reduced inflammation (IL-6) and accelerated strength recovery. A 2021 systematic review pooling 14 studies confirmed a 13–25% reduction in DOMS severity.

The active compounds are anthocyanins and other polyphenols with potent anti-inflammatory and antioxidant properties. Sports Research Tart Cherry Extract provides a standardised dose in capsule form.

### Collagen + Vitamin C

**Dose:** 15 g collagen peptides + 50 mg vitamin C, 30–60 minutes pre-exercise
**Evidence strength:** Moderate-to-strong

This is the most exciting recent development in sports nutrition. Research from Keith Baar's lab at UC Davis showed that collagen peptides consumed with vitamin C before exercise increase collagen synthesis in tendons and ligaments by 2x compared to placebo (*American Journal of Clinical Nutrition*, 2017).

The protocol is specific:
- **15 g hydrolysed collagen peptides** (not gelatin — peptides absorb faster)
- **50 mg vitamin C** (cofactor for collagen synthesis)
- **Taken 30–60 minutes before** exercise or physiotherapy
- **Targets connective tissue**, not muscle — this is for tendons, ligaments, and joint health

This is particularly valuable for athletes returning from tendon injuries (Achilles, patellar, rotator cuff) or those in high-impact sports with repetitive connective tissue stress.

### Magnesium Malate

**Dose:** 300–400 mg elemental magnesium daily
**Evidence strength:** Moderate

Magnesium is lost in sweat (approximately 3–5 mg per litre) and utilised in over 300 enzymatic reactions including ATP production, muscle contraction, and protein synthesis. A 2017 study in *Nutrients* found athletes have higher magnesium requirements and are frequently deficient.

Magnesium malate specifically pairs magnesium with malic acid — a Krebs cycle intermediate involved in aerobic energy production. This makes it theoretically superior for athletic performance compared to other forms, though head-to-head comparisons are limited.

**Take it at night.** Magnesium supports sleep quality, and sleep is when the bulk of muscular repair occurs.

## Tier 3: Conditional Evidence

### Beta-Alanine

**Dose:** 3.2–6.4 g/day (split into multiple doses)
**Evidence strength:** Moderate (for endurance, not strength)

Beta-alanine increases intramuscular carnosine, which buffers hydrogen ions during high-intensity exercise. A 2012 meta-analysis in *Amino Acids* found significant performance improvements in exercises lasting 1–4 minutes (think: 400–800 m running, rowing intervals, cycling sprints).

**The paresthesia warning:** Beta-alanine causes harmless but alarming tingling (paresthesia) in the face, neck, and hands. This peaks 15–20 minutes after ingestion and resolves within an hour. Split dosing (800 mg × 4–8 times daily) or sustained-release formulations minimise this effect.

It does not improve single-effort strength or very short sprints (<60 seconds). It is most beneficial for repeated high-intensity efforts with incomplete recovery.

### What About BCAAs?

Branched-chain amino acids (leucine, isoleucine, valine) were the darling of sports supplementation for years. The evidence now strongly suggests they are **unnecessary if total daily protein intake is adequate** (1.6–2.2 g/kg body weight for athletes).

A 2017 systematic review in the *Journal of the International Society of Sports Nutrition* concluded: "The claim that BCAAs uniquely stimulate muscle protein synthesis or produce an anabolic response is unwarranted." Complete protein sources (whey, casein, egg, or plant blends) contain BCAAs plus all other essential amino acids. Isolated BCAAs are an incomplete stimulus.

Save your money. Eat enough protein.

## The Electrolyte Layer

For training sessions exceeding 60 minutes, electrolyte replacement becomes performance-critical:

- **Sodium:** 500–1,000 mg per hour of intense exercise (higher in heat)
- **Potassium:** 150–300 mg per hour
- **Magnesium:** Covered by daily supplementation

Sweat sodium concentration varies 4-fold between individuals. If you see white salt residue on your skin or clothing after training, you are a heavy sodium sweater and should err toward the higher end.

## Sleep: The #1 Recovery Tool

No supplement can compensate for poor sleep. Growth hormone release, muscle protein synthesis, and neural recovery all peak during deep sleep. A 2021 study in *Sleep* found that athletes sleeping <7 hours had a 1.7x higher injury rate than those sleeping >8 hours.

Supplements support recovery. Sleep *is* recovery. Prioritise 7–9 hours before optimising your supplement stack.

## The Recovery Protocol Summary

**Daily, year-round:**
- Creatine monohydrate: 5 g
- Omega-3: 2,000–3,000 mg EPA+DHA
- Magnesium malate: 300–400 mg (evening)

**Training days:**
- Collagen + vitamin C: 15 g + 50 mg, 30–60 min pre-exercise
- Tart cherry extract: 240 mg anthocyanins, morning and evening

**If doing high-intensity intervals:**
- Beta-alanine: 3.2–6.4 g/day (split doses)

**During sessions >60 min:**
- Electrolytes: sodium + potassium based on sweat rate

**Always:**
- Sleep 7–9 hours
- Protein 1.6–2.2 g/kg/day from whole food sources

## Ready for Your Personalized Protocol?

Every body is different. What works for one person may not work for another. Our free 5-minute assessment analyzes your health profile, medications, and goals to create an evidence-based supplement plan tailored specifically to you.

**[Take the free assessment →](/quiz)**
$content$
);
