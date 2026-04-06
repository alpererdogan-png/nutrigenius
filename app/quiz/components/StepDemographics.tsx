"use client";

import { QuizData } from "../page";

type Props = {
  data: QuizData;
  updateData: (fields: Partial<QuizData>) => void;
};

const DIETARY_PATTERN_VALUES = [
  "omnivore",
  "vegetarian",
  "vegan",
  "pescatarian",
  "keto",
  "mediterranean",
  "paleo",
  "other",
];

const ALLERGY_VALUES = [
  { value: "gluten", label: "Gluten" },
  { value: "dairy", label: "Dairy" },
  { value: "soy", label: "Soy" },
  { value: "shellfish", label: "Shellfish" },
  { value: "tree nuts", label: "Tree Nuts" },
  { value: "peanuts", label: "Peanuts" },
  { value: "eggs", label: "Eggs" },
  { value: "fish", label: "Fish" },
  { value: "other", label: "Other" },
];

const COUNTRIES = [
  "Ireland", "United Kingdom", "United States", "Canada", "Australia",
  "Germany", "France", "Spain", "Italy", "Netherlands", "Belgium",
  "Sweden", "Denmark", "Norway", "Finland", "Austria", "Switzerland",
  "Poland", "Portugal", "Greece", "Czech Republic", "Romania", "Hungary",
  "Croatia", "Bulgaria", "Turkey", "UAE", "Saudi Arabia", "India", "Other",
];

const DIET_LABELS: Record<string, string> = {
  omnivore: "Omnivore",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  pescatarian: "Pescatarian",
  keto: "Keto",
  mediterranean: "Mediterranean",
  paleo: "Paleo",
  other: "Other",
};

export function StepDemographics({ data, updateData }: Props) {

  const bmi =
    data.heightCm && data.weightKg
      ? (
          Number(data.weightKg) / Math.pow(Number(data.heightCm) / 100, 2)
        ).toFixed(1)
      : null;

  const getBmiCategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { label: "Underweight", color: "text-blue-600" };
    if (bmiValue < 25) return { label: "Normal", color: "text-green-600" };
    if (bmiValue < 30) return { label: "Overweight", color: "text-amber-600" };
    return { label: "Obese", color: "text-red-600" };
  };

  return (
    <div className="space-y-6">
      {/* Age and Sex */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-1.5">
            {"Age"} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={data.age}
            onChange={(e) => updateData({ age: e.target.value })}
            placeholder="e.g. 35"
            min="1"
            max="120"
            className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[#1A2332] placeholder:text-[#B0B8C4] focus:outline-none focus:ring-2 focus:ring-[#00685f]/30 focus:border-[#00685f] bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-1.5">
            {"Biological Sex"} <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ].map((sex) => (
              <button
                key={sex.value}
                onClick={() => updateData({ biologicalSex: sex.value })}
                className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                  data.biologicalSex === sex.value
                    ? "bg-[#F0FDFA] border-[#00685f] text-[#00685f]"
                    : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
                }`}
              >
                {sex.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Height and Weight with BMI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-1.5">
            {"Height (cm)"}
          </label>
          <input
            type="number"
            value={data.heightCm}
            onChange={(e) => updateData({ heightCm: e.target.value })}
            placeholder="e.g. 175"
            className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[#1A2332] placeholder:text-[#B0B8C4] focus:outline-none focus:ring-2 focus:ring-[#00685f]/30 focus:border-[#00685f] bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-1.5">
            {"Weight (kg)"}
          </label>
          <input
            type="number"
            value={data.weightKg}
            onChange={(e) => updateData({ weightKg: e.target.value })}
            placeholder="e.g. 72"
            className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[#1A2332] placeholder:text-[#B0B8C4] focus:outline-none focus:ring-2 focus:ring-[#00685f]/30 focus:border-[#00685f] bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-1.5">
            {"BMI"}
          </label>
          <div className="px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-[#f9f9ff]">
            {bmi ? (
              <span className="text-sm">
                <span className="font-semibold text-[#1A2332]">{bmi}</span>{" "}
                <span className={`text-xs font-medium ${getBmiCategory(Number(bmi)).color}`}>
                  ({getBmiCategory(Number(bmi)).label})
                </span>
              </span>
            ) : (
              <span className="text-sm text-[#B0B8C4]">{"Auto-calculated"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-1.5">
          {"Country of Residence"}
        </label>
        <select
          value={data.country}
          onChange={(e) => updateData({ country: e.target.value })}
          className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#00685f]/30 focus:border-[#00685f] bg-white"
        >
          <option value="">{"Select country..."}</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Pregnancy / Breastfeeding */}
      {data.biologicalSex === "female" && (
        <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-4">
          <p className="text-sm font-medium text-[#9A3412] mb-3">
            {"Pregnancy & Breastfeeding Status"}
          </p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.pregnant}
                onChange={(e) => updateData({ pregnant: e.target.checked })}
                className="w-4 h-4 rounded border-[#E2E8F0] text-[#00685f] focus:ring-[#00685f]"
              />
              <span className="text-sm text-[#1A2332]">{"Currently pregnant"}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.breastfeeding}
                onChange={(e) => updateData({ breastfeeding: e.target.checked })}
                className="w-4 h-4 rounded border-[#E2E8F0] text-[#00685f] focus:ring-[#00685f]"
              />
              <span className="text-sm text-[#1A2332]">{"Currently breastfeeding"}</span>
            </label>
          </div>
        </div>
      )}

      {/* Dietary Pattern */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-2">
          {"Dietary Pattern"}
        </label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_PATTERN_VALUES.map((value) => (
            <button
              key={value}
              onClick={() => updateData({ dietaryPattern: value })}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                data.dietaryPattern === value
                  ? "bg-[#F0FDFA] border-[#00685f] text-[#00685f]"
                  : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
              }`}
            >
              {DIET_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-2">
          {"Allergies & Intolerances"}
        </label>
        <p className="text-xs text-[#8896A8] mb-2">{"Select all that apply"}</p>
        <div className="flex flex-wrap gap-2">
          {ALLERGY_VALUES.map((allergy) => (
            <button
              key={allergy.value}
              onClick={() => {
                const current = data.allergies;
                const updated = current.includes(allergy.value)
                  ? current.filter((a) => a !== allergy.value)
                  : [...current, allergy.value];
                updateData({ allergies: updated });
              }}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                data.allergies.includes(allergy.value)
                  ? "bg-red-50 border-red-300 text-red-700"
                  : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
              }`}
            >
              {allergy.label}
            </button>
          ))}
        </div>
      </div>

      {/* Halal Preference */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.halalPreference}
            onChange={(e) => updateData({ halalPreference: e.target.checked })}
            className="w-4 h-4 rounded border-[#E2E8F0] text-[#00685f] focus:ring-[#00685f]"
          />
          <div>
            <span className="text-sm font-medium text-[#1A2332]">{"Halal preference"}</span>
            <p className="text-xs text-[#8896A8]">{"Only show Halal-certified or generally Halal supplement recommendations"}</p>
          </div>
        </label>
      </div>
    </div>
  );
}
