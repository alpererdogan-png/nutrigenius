"use client";

import { useState } from "react";
import { Dna, ExternalLink } from "lucide-react";
import { QuizData } from "../page";
import { useLanguage } from "@/lib/language-context";

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
  const { t } = useLanguage();
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
      updateData({ geneticVariants: [...existing, { gene, variant, status }] });
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
      {/* Question */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-1">
          {t("quiz.genQuestion")}
        </label>
        <p className="text-xs italic text-[#8896A8] mb-3">
          <span className="font-medium text-[#5A6578]">Clinical note:</span> Genetic variants affect how your body processes specific supplement forms.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleToggle(true)}
            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
              showEntry
                ? "bg-[#F0FDFA] border-[#00685f] text-[#00685f]"
                : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
            }`}
          >
            {t("quiz.genYes")}
          </button>
          <button
            onClick={() => handleToggle(false)}
            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
              !showEntry
                ? "bg-[#F0FDFA] border-[#00685f] text-[#00685f]"
                : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
            }`}
          >
            {t("quiz.genNo")}
          </button>
        </div>
      </div>

      {showEntry ? (
        <div className="space-y-4">
          <p className="text-xs text-[#8896A8]">{t("quiz.genEntryHint")}</p>
          {GENETIC_VARIANTS.map((gv) => (
            <div
              key={`${gv.gene}-${gv.variant}`}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium text-[#1A2332]">
                    {gv.gene}{" "}
                    <span className="text-[#8896A8] font-normal">— {gv.variant}</span>
                  </h3>
                  <p className="text-xs text-[#8896A8] mt-0.5">{gv.description}</p>
                </div>
                <Dna className="w-4 h-4 text-[#CBD5E1] flex-shrink-0" />
              </div>
              <select
                value={getVariantStatus(gv.gene, gv.variant)}
                onChange={(e) => updateVariant(gv.gene, gv.variant, e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#00685f]/30 focus:border-[#00685f] bg-white"
              >
                <option value="">{t("quiz.genNotTested")}</option>
                {gv.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] border border-[#DDD6FE] rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center flex-shrink-0">
              <Dna className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1A2332] mb-2">
                {t("quiz.genCtaTitle")}
              </h3>
              <p className="text-sm text-[#5A6578] leading-relaxed mb-4">
                {t("quiz.genCtaDesc")}
              </p>
              <div className="space-y-2">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                  {t("quiz.genCtaButton")}
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-xs text-[#8896A8]">{t("quiz.genCtaPrice")}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data entered summary */}
      {data.geneticVariants.length > 0 && (
        <div className="bg-[#F0FDFA] border border-[#99F6E4] rounded-xl p-4">
          <p className="text-sm font-medium text-[#005249] mb-2">
            {t("quiz.genSummaryTitle")} ({data.geneticVariants.length}{" "}
            {data.geneticVariants.length > 1 ? t("quiz.genVariants") : t("quiz.genVariant")})
          </p>
          <div className="flex flex-wrap gap-2">
            {data.geneticVariants.map((v) => (
              <span
                key={`${v.gene}-${v.variant}`}
                className="inline-flex items-center gap-1 bg-white border border-[#99F6E4] text-[#00685f] text-xs px-2.5 py-1 rounded-full"
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
