"use client";

import { useState } from "react";
import { Plus, X, FlaskConical, AlertCircle } from "lucide-react";
import { QuizData } from "../page";
import { useLanguage } from "@/lib/language-context";

type Props = {
  data: QuizData;
  updateData: (fields: Partial<QuizData>) => void;
};

const BIOMARKERS = [
  { name: "Vitamin D (25-OH)", units: ["ng/mL", "nmol/L"], rangeLow: 30, rangeHigh: 80, defaultUnit: "ng/mL" },
  { name: "Vitamin B12", units: ["pg/mL", "pmol/L"], rangeLow: 300, rangeHigh: 900, defaultUnit: "pg/mL" },
  { name: "Ferritin", units: ["ng/mL"], rangeLow: 30, rangeHigh: 300, defaultUnit: "ng/mL" },
  { name: "Folate", units: ["ng/mL"], rangeLow: 3, rangeHigh: 20, defaultUnit: "ng/mL" },
  { name: "Iron", units: ["mcg/dL"], rangeLow: 60, rangeHigh: 170, defaultUnit: "mcg/dL" },
  { name: "TIBC", units: ["mcg/dL"], rangeLow: 250, rangeHigh: 370, defaultUnit: "mcg/dL" },
  { name: "TSH", units: ["mIU/L"], rangeLow: 0.4, rangeHigh: 4.0, defaultUnit: "mIU/L" },
  { name: "HbA1c", units: ["%"], rangeLow: 4.0, rangeHigh: 5.6, defaultUnit: "%" },
  { name: "Magnesium", units: ["mg/dL"], rangeLow: 1.7, rangeHigh: 2.2, defaultUnit: "mg/dL" },
  { name: "Zinc", units: ["mcg/dL"], rangeLow: 70, rangeHigh: 120, defaultUnit: "mcg/dL" },
  { name: "Omega-3 Index", units: ["%"], rangeLow: 8, rangeHigh: 12, defaultUnit: "%" },
  { name: "Homocysteine", units: ["µmol/L"], rangeLow: 5, rangeHigh: 12, defaultUnit: "µmol/L" },
  { name: "CRP", units: ["mg/L"], rangeLow: 0, rangeHigh: 3, defaultUnit: "mg/L" },
];

export function StepLabResults({ data, updateData }: Props) {
  const { t } = useLanguage();
  const [selectedBiomarker, setSelectedBiomarker] = useState("");

  const addLabResult = () => {
    const biomarker = BIOMARKERS.find((b) => b.name === selectedBiomarker);
    if (!biomarker) return;

    const newResult = {
      biomarker: biomarker.name,
      value: "",
      unit: biomarker.defaultUnit,
      testDate: "",
    };

    updateData({ labResults: [...data.labResults, newResult] });
    setSelectedBiomarker("");
  };

  const updateLabResult = (index: number, field: string, value: string) => {
    const updated = [...data.labResults];
    updated[index] = { ...updated[index], [field]: value };
    updateData({ labResults: updated });
  };

  const removeLabResult = (index: number) => {
    const updated = data.labResults.filter((_, i) => i !== index);
    updateData({ labResults: updated });
  };

  const getStatus = (biomarkerName: string, value: string) => {
    if (!value) return null;
    const ref = BIOMARKERS.find((b) => b.name === biomarkerName);
    if (!ref) return null;
    const num = Number(value);
    if (isNaN(num)) return null;
    if (num < ref.rangeLow) return { label: t("quiz.labsLow"), color: "text-red-600 bg-red-50 border-red-200" };
    if (num > ref.rangeHigh) return { label: t("quiz.labsHigh"), color: "text-amber-700 bg-amber-50 border-amber-200" };
    return { label: t("quiz.labsNormal"), color: "text-green-700 bg-green-50 border-green-200" };
  };

  const availableBiomarkers = BIOMARKERS.filter(
    (b) => !data.labResults.some((r) => r.biomarker === b.name)
  );

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="bg-[#F0FDFA] border border-[#99F6E4] rounded-xl p-4 flex gap-3">
        <FlaskConical className="w-5 h-5 text-[#0D9488] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-[#0F766E]">
            {t("quiz.labsWhyTitle")}
          </p>
          <p className="text-xs text-[#0D9488] mt-1">
            {t("quiz.labsWhyDesc")}
          </p>
        </div>
      </div>

      {/* Add biomarker selector */}
      {availableBiomarkers.length > 0 && (
        <div className="flex gap-2">
          <select
            value={selectedBiomarker}
            onChange={(e) => setSelectedBiomarker(e.target.value)}
            className="flex-1 px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[#1A2332] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] bg-white"
          >
            <option value="">{t("quiz.labsSelect")}</option>
            {availableBiomarkers.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
          <button
            onClick={addLabResult}
            disabled={!selectedBiomarker}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-[#E2E8F0] disabled:text-[#8896A8] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("quiz.labsAdd")}
          </button>
        </div>
      )}

      {/* Lab result entries */}
      {data.labResults.length > 0 ? (
        <div className="space-y-3">
          {data.labResults.map((result, index) => {
            const ref = BIOMARKERS.find((b) => b.name === result.biomarker);
            const status = getStatus(result.biomarker, result.value);

            return (
              <div key={index} className="bg-white border border-[#E2E8F0] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-[#1A2332]">{result.biomarker}</h3>
                  <button
                    onClick={() => removeLabResult(index)}
                    className="text-[#8896A8] hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 [&>*]:min-w-0">
                  <div>
                    <label className="block text-xs text-[#8896A8] mb-1">{t("quiz.labsValue")}</label>
                    <input
                      type="number"
                      value={result.value}
                      onChange={(e) => updateLabResult(index, "value", e.target.value)}
                      placeholder={t("quiz.labsEnterValue")}
                      step="0.1"
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#1A2332] placeholder:text-[#B0B8C4] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#8896A8] mb-1">{t("quiz.labsUnit")}</label>
                    <select
                      value={result.unit}
                      onChange={(e) => updateLabResult(index, "unit", e.target.value)}
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488]"
                    >
                      {ref?.units.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-[#8896A8] mb-1">{t("quiz.labsDate")}</label>
                    <input
                      type="date"
                      value={result.testDate}
                      onChange={(e) => updateLabResult(index, "testDate", e.target.value)}
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#8896A8] mb-1">{t("quiz.labsStatus")}</label>
                    <div className="py-2">
                      {status ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                          {status.label}
                        </span>
                      ) : (
                        <span className="text-xs text-[#B0B8C4]">{t("quiz.labsEnterValue")}</span>
                      )}
                    </div>
                  </div>
                </div>

                {ref && (
                  <p className="text-xs text-[#8896A8] mt-2">
                    {t("quiz.labsRefRange")} {ref.rangeLow} – {ref.rangeHigh} {ref.defaultUnit}
                  </p>
                )}

                {result.testDate && (
                  (() => {
                    const monthsAgo = Math.floor(
                      (Date.now() - new Date(result.testDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
                    );
                    if (monthsAgo > 12) {
                      return (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {t("quiz.labsOldResult")}
                        </div>
                      );
                    }
                    return null;
                  })()
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-[#E2E8F0] rounded-xl">
          <FlaskConical className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
          <p className="text-sm text-[#8896A8]">{t("quiz.labsNoResults")}</p>
          <p className="text-xs text-[#B0B8C4] mt-1">{t("quiz.labsNoResultsHint")}</p>
        </div>
      )}

      <p className="text-xs text-[#8896A8] text-center">
        {t("quiz.labsSkipNote")}
      </p>
    </div>
  );
}
