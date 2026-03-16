"use client";

import { QuizData } from "../page";

type Props = {
  data: QuizData;
  updateData: (fields: Partial<QuizData>) => void;
};

const DIETARY_PATTERNS = [
  "Omnivore",
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Keto",
  "Mediterranean",
  "Paleo",
  "Other",
];

const ALLERGIES = [
  "Gluten",
  "Dairy",
  "Soy",
  "Shellfish",
  "Tree Nuts",
  "Peanuts",
  "Eggs",
  "Fish",
  "Other",
];

const COUNTRIES = [
  "Ireland",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Belgium",
  "Sweden",
  "Denmark",
  "Norway",
  "Finland",
  "Austria",
  "Switzerland",
  "Poland",
  "Portugal",
  "Greece",
  "Czech Republic",
  "Romania",
  "Hungary",
  "Croatia",
  "Bulgaria",
  "Turkey",
  "UAE",
  "Saudi Arabia",
  "India",
  "Other",
];

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
            Age <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={data.age}
            onChange={(e) => updateData({ age: e.target.value })}
            placeholder="e.g. 35"
            min="1"
            max="120"
            className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[#1A2332] placeholder:text-[#B0B8C4] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-1.5">
            Biological Sex <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {["Male", "Female"].map((sex) => (
              <button
                key={sex}
                onClick={() =>
                  updateData({ biologicalSex: sex.toLowerCase() })
                }
                className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                  data.biologicalSex === sex.toLowerCase()
                    ? "bg-[#F0FDFA] border-[#0D9488] text-[#0D9488]"
                    : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
                }`}
              >
                {sex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Height and Weight with BMI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-1.5">
            Height (cm)
          </label>
          <input
            type="number"
            value={data.heightCm}
            onChange={(e) => updateData({ heightCm: e.target.value })}
            placeholder="e.g. 175"
            className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[#1A2332] placeholder:text-[#B0B8C4] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-1.5">
            Weight (kg)
          </label>
          <input
            type="number"
            value={data.weightKg}
            onChange={(e) => updateData({ weightKg: e.target.value })}
            placeholder="e.g. 72"
            className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[#1A2332] placeholder:text-[#B0B8C4] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-1.5">
            BMI
          </label>
          <div className="px-3 py-2.5 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]">
            {bmi ? (
              <span className="text-sm">
                <span className="font-semibold text-[#1A2332]">{bmi}</span>{" "}
                <span
                  className={`text-xs font-medium ${
                    getBmiCategory(Number(bmi)).color
                  }`}
                >
                  ({getBmiCategory(Number(bmi)).label})
                </span>
              </span>
            ) : (
              <span className="text-sm text-[#B0B8C4]">Auto-calculated</span>
            )}
          </div>
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-1.5">
          Country of Residence
        </label>
        <select
          value={data.country}
          onChange={(e) => updateData({ country: e.target.value })}
          className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] bg-white"
        >
          <option value="">Select country...</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Pregnancy / Breastfeeding — only show for females */}
      {data.biologicalSex === "female" && (
        <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-4">
          <p className="text-sm font-medium text-[#9A3412] mb-3">
            Pregnancy & Breastfeeding Status
          </p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.pregnant}
                onChange={(e) => updateData({ pregnant: e.target.checked })}
                className="w-4 h-4 rounded border-[#E2E8F0] text-[#0D9488] focus:ring-[#0D9488]"
              />
              <span className="text-sm text-[#1A2332]">
                Currently pregnant
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.breastfeeding}
                onChange={(e) =>
                  updateData({ breastfeeding: e.target.checked })
                }
                className="w-4 h-4 rounded border-[#E2E8F0] text-[#0D9488] focus:ring-[#0D9488]"
              />
              <span className="text-sm text-[#1A2332]">
                Currently breastfeeding
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Dietary Pattern */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-2">
          Dietary Pattern
        </label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_PATTERNS.map((diet) => (
            <button
              key={diet}
              onClick={() =>
                updateData({ dietaryPattern: diet.toLowerCase() })
              }
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                data.dietaryPattern === diet.toLowerCase()
                  ? "bg-[#F0FDFA] border-[#0D9488] text-[#0D9488]"
                  : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
              }`}
            >
              {diet}
            </button>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-2">
          Allergies & Intolerances
        </label>
        <p className="text-xs text-[#8896A8] mb-2">
          Select all that apply
        </p>
        <div className="flex flex-wrap gap-2">
          {ALLERGIES.map((allergy) => (
            <button
              key={allergy}
              onClick={() => {
                const current = data.allergies;
                const lower = allergy.toLowerCase();
                const updated = current.includes(lower)
                  ? current.filter((a) => a !== lower)
                  : [...current, lower];
                updateData({ allergies: updated });
              }}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                data.allergies.includes(allergy.toLowerCase())
                  ? "bg-red-50 border-red-300 text-red-700"
                  : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
              }`}
            >
              {allergy}
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
            onChange={(e) =>
              updateData({ halalPreference: e.target.checked })
            }
            className="w-4 h-4 rounded border-[#E2E8F0] text-[#0D9488] focus:ring-[#0D9488]"
          />
          <div>
            <span className="text-sm font-medium text-[#1A2332]">
              Halal preference
            </span>
            <p className="text-xs text-[#8896A8]">
              Only show Halal-certified or generally Halal supplement
              recommendations
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
