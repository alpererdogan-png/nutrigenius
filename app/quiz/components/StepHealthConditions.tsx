"use client";

import { useState } from "react";
import { Search, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { QuizData } from "../page";

type Props = {
  data: QuizData;
  updateData: (fields: Partial<QuizData>) => void;
};

const CONDITION_CATEGORIES: Record<string, string[]> = {
  Cardiovascular: ["Hypertension", "High Cholesterol", "Heart Failure", "Atrial Fibrillation", "Coronary Artery Disease"],
  Metabolic: ["Type 2 Diabetes", "Type 1 Diabetes", "Vitamin D Deficiency", "Iron Deficiency Anemia", "Vitamin B12 Deficiency", "Metabolic Syndrome", "Gout"],
  Neurological: ["Migraine", "Neuropathy", "Epilepsy", "Multiple Sclerosis"],
  Musculoskeletal: ["Osteoporosis", "Osteoarthritis", "Fibromyalgia", "Back Pain"],
  Digestive: ["IBS", "GERD", "Crohn's Disease", "Ulcerative Colitis", "Celiac Disease", "SIBO"],
  Respiratory: ["Asthma", "COPD", "Seasonal Allergies"],
  Autoimmune: ["Rheumatoid Arthritis", "Hashimoto Thyroiditis", "Lupus", "Psoriasis"],
  "Mental Health": ["Generalized Anxiety", "Depression", "ADHD", "Bipolar Disorder", "OCD"],
  Hormonal: ["Hypothyroidism", "Hyperthyroidism", "PCOS", "Low Testosterone", "Menopause"],
  Skin: ["Acne", "Eczema", "Rosacea", "Hair Loss"],
  Other: ["Chronic Fatigue", "Insomnia", "Obesity"],
};

const CATEGORY_KEY_MAP: Record<string, string> = {
  Cardiovascular: "quiz.catCardiovascular",
  Metabolic: "quiz.catMetabolic",
  Neurological: "quiz.catNeurological",
  Musculoskeletal: "quiz.catMusculoskeletal",
  Digestive: "quiz.catDigestive",
  Respiratory: "quiz.catRespiratory",
  Autoimmune: "quiz.catAutoimmune",
  "Mental Health": "quiz.catMentalHealth",
  Hormonal: "quiz.catHormonal",
  Skin: "quiz.catSkin",
  Other: "quiz.catOther",
};

const COMMON_MEDICATIONS = [
  "Levothyroxine", "Metformin", "Lisinopril", "Atorvastatin", "Omeprazole",
  "Amlodipine", "Metoprolol", "Losartan", "Sertraline", "Escitalopram",
  "Fluoxetine", "Venlafaxine", "Duloxetine", "Gabapentin", "Pregabalin",
  "Warfarin", "Apixaban", "Rivaroxaban", "Clopidogrel", "Aspirin",
  "Lansoprazole", "Pantoprazole", "Rosuvastatin", "Simvastatin",
  "Ramipril", "Bisoprolol", "Candesartan", "Hydrochlorothiazide",
  "Insulin", "Glimepiride", "Sitagliptin", "Empagliflozin",
  "Prednisone", "Tacrolimus", "Methotrexate", "Hydroxychloroquine",
  "Montelukast", "Salbutamol", "Budesonide", "Thyroxine",
  "Oral Contraceptive Pill", "HRT (Hormone Replacement Therapy)",
];

const FAMILY_HISTORY_OPTIONS = [
  "Heart Disease",
  "Type 2 Diabetes",
  "Cancer",
  "Osteoporosis",
  "Autoimmune Disease",
  "Alzheimer's / Dementia",
  "Mental Health Conditions",
];

export function StepHealthConditions({ data, updateData }: Props) {
  const [medSearch, setMedSearch] = useState("");
  const [suppSearch, setSuppSearch] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const filteredMeds = COMMON_MEDICATIONS.filter(
    (med) =>
      med.toLowerCase().includes(medSearch.toLowerCase()) &&
      !data.currentMedications.includes(med)
  );

  const addMedication = (med: string) => {
    updateData({ currentMedications: [...data.currentMedications, med] });
    setMedSearch("");
  };

  const removeMedication = (med: string) => {
    updateData({
      currentMedications: data.currentMedications.filter((m) => m !== med),
    });
  };

  const addSupplement = (supp: string) => {
    if (supp.trim() && !data.currentSupplements.includes(supp.trim())) {
      updateData({
        currentSupplements: [...data.currentSupplements, supp.trim()],
      });
    }
    setSuppSearch("");
  };

  const removeSupplement = (supp: string) => {
    updateData({
      currentSupplements: data.currentSupplements.filter((s) => s !== supp),
    });
  };

  const toggleCondition = (condition: string) => {
    const current = data.healthConditions;
    const updated = current.includes(condition)
      ? current.filter((c) => c !== condition)
      : [...current, condition];
    updateData({ healthConditions: updated });
  };

  return (
    <div className="space-y-8">
      {/* Safety notice */}
      <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-xl p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-[#B45309] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-[#92400E]">
            {"Why we ask about medications"}
          </p>
          <p className="text-xs text-[#A16207] mt-1">
            {"Certain supplements can interact with medications — sometimes dangerously. We screen every recommendation against your medication list to keep you safe."}
          </p>
        </div>
      </div>

      {/* Health Conditions */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-1">
          {"Current Health Conditions"}
        </label>
        <p className="text-xs text-[#8896A8] mb-1">
          {"Select all that apply. Click a category to expand."}
        </p>
        <p className="text-xs italic text-[#8896A8] mb-3">
          <span className="font-medium text-[#5A6578]">Clinical note:</span> Your conditions help us match evidence-rated supplements to your specific needs.
        </p>

        {data.healthConditions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {data.healthConditions.map((cond) => (
              <span
                key={cond}
                className="inline-flex items-center gap-1.5 bg-[#F0FDFA] border border-[#99F6E4] text-[#00685f] text-sm px-3 py-1 rounded-full"
              >
                {cond}
                <button onClick={() => toggleCondition(cond)} className="hover:text-[#005249]">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {Object.entries(CONDITION_CATEGORIES).map(([category, conditions]) => (
            <div key={category} className="border border-[#E2E8F0] rounded-xl overflow-hidden">
              <button
                onClick={() =>
                  setExpandedCategory(expandedCategory === category ? null : category)
                }
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#1A2332] hover:bg-[#f9f9ff] transition-colors"
              >
                <span>
                  {category}
                  {data.healthConditions.some((c) => conditions.includes(c)) && (
                    <span className="ml-2 text-xs text-[#00685f] font-normal">
                      (
                      {data.healthConditions.filter((c) => conditions.includes(c)).length}{" "}
                      {"selected"})
                    </span>
                  )}
                </span>
                <span className="text-[#8896A8]">
                  {expandedCategory === category ? "−" : "+"}
                </span>
              </button>
              {expandedCategory === category && (
                <div className="px-4 pb-3 flex flex-wrap gap-2">
                  {conditions.map((cond) => {
                    const selected = data.healthConditions.includes(cond);
                    return (
                      <button
                        key={cond}
                        onClick={() => toggleCondition(cond)}
                        className={`inline-flex items-center gap-1.5 py-2 px-4 rounded-lg border text-sm transition-all duration-200 cursor-pointer ${
                          selected
                            ? "bg-[#F0FDFA] border-[#00685f] text-[#00685f]"
                            : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
                        }`}
                      >
                        {selected && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                        {cond}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Medications */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-1">
          {"Current Prescription Medications"}
        </label>
        <p className="text-xs text-[#8896A8] mb-1">{"Start typing to search common medications"}</p>
        <p className="text-xs italic text-[#8896A8] mb-2">
          <span className="font-medium text-[#5A6578]">Clinical note:</span> This helps us screen for potentially dangerous supplement-drug interactions.
        </p>

        {data.currentMedications.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {data.currentMedications.map((med) => (
              <span
                key={med}
                className="inline-flex items-center gap-1.5 bg-[#FEF3C7] border border-[#FCD34D] text-[#92400E] text-sm px-3 py-1 rounded-full"
              >
                {med}
                <button onClick={() => removeMedication(med)} className="hover:text-[#B45309]">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[#8896A8]" />
          <input
            type="text"
            value={medSearch}
            onChange={(e) => setMedSearch(e.target.value)}
            placeholder="Search medications (e.g. Metformin, Levothyroxine...)"
            className="w-full pl-10 pr-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[#1A2332] placeholder:text-[#B0B8C4] focus:outline-none focus:ring-2 focus:ring-[#00685f]/30 focus:border-[#00685f] bg-white"
          />
          {medSearch && filteredMeds.length > 0 && (
            <div className="absolute z-10 top-full mt-1 w-full bg-white border border-[#E2E8F0] rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredMeds.slice(0, 8).map((med) => (
                <button
                  key={med}
                  onClick={() => addMedication(med)}
                  className="w-full text-left px-4 py-2 text-sm text-[#1A2332] hover:bg-[#F0FDFA] transition-colors"
                >
                  {med}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Current Supplements */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-1">
          {"Supplements You're Currently Taking"}
        </label>
        <p className="text-xs text-[#8896A8] mb-2">{"Type a supplement name and press Enter"}</p>

        {data.currentSupplements.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {data.currentSupplements.map((supp) => (
              <span
                key={supp}
                className="inline-flex items-center gap-1.5 bg-[#F0FDFA] border border-[#99F6E4] text-[#00685f] text-sm px-3 py-1 rounded-full"
              >
                {supp}
                <button onClick={() => removeSupplement(supp)} className="hover:text-[#005249]">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        <input
          type="text"
          value={suppSearch}
          onChange={(e) => setSuppSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addSupplement(suppSearch);
          }}
          placeholder="e.g. Vitamin D, Fish Oil, Magnesium..."
          className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[#1A2332] placeholder:text-[#B0B8C4] focus:outline-none focus:ring-2 focus:ring-[#00685f]/30 focus:border-[#00685f] bg-white"
        />
      </div>

      {/* Family History */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-1">
          {"Family Health History"}{" "}
          <span className="text-[#8896A8] font-normal">{"(optional)"}</span>
        </label>
        <p className="text-xs text-[#8896A8] mb-2">{"Conditions in immediate family (parents, siblings)"}</p>
        <div className="flex flex-wrap gap-2">
          {FAMILY_HISTORY_OPTIONS.map((condition) => {
            const selected = data.familyHistory.includes(condition);
            return (
              <button
                key={condition}
                onClick={() => {
                  const current = data.familyHistory;
                  const updated = current.includes(condition)
                    ? current.filter((c) => c !== condition)
                    : [...current, condition];
                  updateData({ familyHistory: updated });
                }}
                className={`inline-flex items-center gap-1.5 py-2 px-4 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer ${
                  selected
                    ? "bg-[#F0FDFA] border-[#00685f] text-[#00685f]"
                    : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
                }`}
              >
                {selected && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                {condition}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
