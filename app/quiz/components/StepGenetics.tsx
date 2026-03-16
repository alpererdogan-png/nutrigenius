"use client";

import { useState } from "react";
import { Dna, ExternalLink, Plus, X } from "lucide-react";
import { QuizData } from "../page";

type Props = {
  data: QuizData;
  updateData: (fields: Partial<QuizData>) => void;
};

const GENETIC_VARIANTS = [
  {
    gene: "MTHFR",
    variant: "C677T",
    description: "Affects folate metabolism — determines if you need methylfolate vs folic acid",
    options: ["Normal (Wild Type)", "Heterozygous (One Copy)", "Homozygous (Two Copies)"],
  },
  {
    gene: "MTHFR",
    variant: "A1298C",
    description: "Second MTHFR variant — compound heterozygosity with C677T can further impact folate metabolism",
    options: ["Normal (Wild Type)", "Heterozygous (One Copy)", "Homozygous (Two Copies)"],
  },
  {
    gene: "VDR",
    variant: "Bsm/Taq",
    description: "Vitamin D receptor variants — affects how your body responds to Vitamin D",
    options: ["Normal", "Variant Present"],
  },
  {
    gene: "COMT",
    variant: "Val158Met",
    description: "Affects dopamine/stress metabolism — determines methylation support needs",
    options: ["Val/Val (Fast)", "Val/Met (Intermediate)", "Met/Met (Slow)"],
  },
  {
    gene: "APOE",
    variant: "Genotype",
    description: "Affects cardiovascular risk and omega-3 needs",
    options: ["ε2/ε2", "ε2/ε3", "ε3/ε3 (Most Common)", "ε3/ε4", "ε4/ε4"],
  },
  {
    gene: "FUT2",
    variant: "Secretor Status",
    description: "Affects Vitamin B12 absorption — non-secretors may need higher doses",
    options: ["Secretor", "Non-Secretor"],
  },
  {
    gene: "CYP1A2",
    variant: "Caffeine Metabolism",
    description: "Determines if you metabolize caffeine quickly or slowly — affects supplement timing",
    options: ["Fast Metabolizer", "Slow Metabolizer"],
  },
];

export function StepGenetics({ data, updateData }: Props) {
  const [showEntry, setShowEntry] = useState(data.hasGeneticData);

  const handleToggle = (hasData: boolean) => {
    updateData({ hasGeneticData: hasData });
    setShowEntry(hasData);
  };

  const updateVariant = (gene: string, variant: string, status: string) => {
    const existing = data.geneticVariants.filter(
      (v) => !(v.gene === gene && v.variant === variant)
    );
    if (status) {
      updateData({
        geneticVariants: [...existing, { gene, variant, status }],
      });
    } else {
      updateData({ geneticVariants: existing });
    }
  };

  const getVariantStatus = (gene: string, variant: string) => {
    return data.geneticVariants.find(
      (v) => v.gene === gene && v.variant === variant
    )?.status || "";
  };

  return (
    <div className="space-y-6">
      {/* Question: Do you have genetic data? */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-3">
          Do you have genetic testing results?
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => handleToggle(true)}
            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
              showEntry
                ? "bg-[#F0FDFA] border-[#0D9488] text-[#0D9488]"
                : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
            }`}
          >
            Yes, I have results
          </button>
          <button
            onClick={() => handleToggle(false)}
            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
              !showEntry
                ? "bg-[#F0FDFA] border-[#0D9488] text-[#0D9488]"
                : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
            }`}
          >
            No, I don&apos;t
          </button>
        </div>
      </div>

      {showEntry ? (
        /* Genetic variant entry */
        <div className="space-y-4">
          <p className="text-xs text-[#8896A8]">
            Enter your results for any variants you have data on. Leave blank
            if you don&apos;t have a specific result.
          </p>
          {GENETIC_VARIANTS.map((gv) => (
            <div
              key={`${gv.gene}-${gv.variant}`}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium text-[#1A2332]">
                    {gv.gene}{" "}
                    <span className="text-[#8896A8] font-normal">
                      — {gv.variant}
                    </span>
                  </h3>
                  <p className="text-xs text-[#8896A8] mt-0.5">
                    {gv.description}
                  </p>
                </div>
                <Dna className="w-4 h-4 text-[#CBD5E1] flex-shrink-0" />
              </div>
              <select
                value={getVariantStatus(gv.gene, gv.variant)}
                onChange={(e) =>
                  updateVariant(gv.gene, gv.variant, e.target.value)
                }
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] bg-white"
              >
                <option value="">Not tested / Unknown</option>
                {gv.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ) : (
        /* Affiliate CTA for genetic testing */
        <div className="bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] border border-[#DDD6FE] rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center flex-shrink-0">
              <Dna className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1A2332] mb-2">
                Genetic data can significantly improve your recommendations
              </h3>
              <p className="text-sm text-[#5A6578] leading-relaxed mb-4">
                Understanding your genetic variants helps us select the exact
                right supplement forms for your biology — especially for folate
                metabolism (MTHFR), vitamin D absorption (VDR), and
                cardiovascular health (APOE). A simple at-home test can provide
                these insights.
              </p>
              <div className="space-y-2">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Explore Genetic Testing Options
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-xs text-[#8896A8]">
                  Partner labs offer affordable testing starting from €99
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data entered summary */}
      {data.geneticVariants.length > 0 && (
        <div className="bg-[#F0FDFA] border border-[#99F6E4] rounded-xl p-4">
          <p className="text-sm font-medium text-[#0F766E] mb-2">
            Genetic data entered ({data.geneticVariants.length} variant
            {data.geneticVariants.length > 1 ? "s" : ""})
          </p>
          <div className="flex flex-wrap gap-2">
            {data.geneticVariants.map((v) => (
              <span
                key={`${v.gene}-${v.variant}`}
                className="inline-flex items-center gap-1 bg-white border border-[#99F6E4] text-[#0D9488] text-xs px-2.5 py-1 rounded-full"
              >
                {v.gene} {v.variant}: {v.status}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
