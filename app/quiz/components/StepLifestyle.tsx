"use client";

import { CheckCircle2 } from "lucide-react";
import { QuizData } from "../page";

type Props = {
  data: QuizData;
  updateData: (fields: Partial<QuizData>) => void;
};

const ACTIVITY_LEVELS = [
  { value: "sedentary",         label: "Sedentary",         desc: "Little or no exercise" },
  { value: "lightly_active",    label: "Lightly Active",    desc: "Light exercise 1-3 days/week" },
  { value: "moderately_active", label: "Moderately Active", desc: "Moderate exercise 3-5 days/week" },
  { value: "very_active",       label: "Very Active",       desc: "Hard exercise 6-7 days/week" },
  { value: "athlete",           label: "Athlete",           desc: "Intense training, physical job" },
];

const SLEEP_QUALITY = [
  { value: "poor",      label: "Poor" },
  { value: "fair",      label: "Fair" },
  { value: "good",      label: "Good" },
  { value: "excellent", label: "Excellent" },
];

const STRESS_LEVELS = [
  { value: "low",       label: "Low" },
  { value: "moderate",  label: "Moderate" },
  { value: "high",      label: "High" },
  { value: "very_high", label: "Very High" },
];

const SUN_EXPOSURE = [
  { value: "minimal",  label: "Minimal", desc: "Mostly indoors" },
  { value: "moderate", label: "Moderate", desc: "Some outdoor time" },
  { value: "high",     label: "High",     desc: "Regularly outdoors" },
];

const ALCOHOL = [
  { value: "none",       label: "None" },
  { value: "occasional", label: "Occasional" },
  { value: "moderate",   label: "Moderate" },
  { value: "heavy",      label: "Heavy" },
];

const SMOKING = [
  { value: "never",   label: "Never" },
  { value: "former",  label: "Former" },
  { value: "current", label: "Current" },
];

const HEALTH_GOALS = [
  { value: "energy",              label: "Energy",              emoji: "⚡" },
  { value: "sleep",               label: "Sleep",               emoji: "🌙" },
  { value: "immunity",            label: "Immunity",            emoji: "🛡️" },
  { value: "cognitive",           label: "Cognitive Performance", emoji: "🧠" },
  { value: "joint-health",        label: "Joint Health",        emoji: "🦴" },
  { value: "heart-health",        label: "Heart Health",        emoji: "❤️" },
  { value: "gut-health",          label: "Gut Health",          emoji: "🌿" },
  { value: "skin-hair-nails",     label: "Skin, Hair & Nails", emoji: "✨" },
  { value: "weight-management",   label: "Weight Management",   emoji: "⚖️" },
  { value: "stress-anxiety",      label: "Stress & Anxiety",    emoji: "🧘" },
  { value: "longevity",           label: "Longevity & Anti-Aging", emoji: "🕰️" },
  { value: "athletic-performance",label: "Athletic Performance",  emoji: "🏋️" },
];

export function StepLifestyle({ data, updateData }: Props) {

  return (
    <div className="space-y-8">
      {/* Activity Level */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-1">
          {"Physical Activity Level"}
        </label>
        <p className="text-xs italic text-[#8896A8] mb-2">
          <span className="font-medium text-[#5A6578]">Clinical note:</span> Exercise intensity affects nutrient depletion and recovery needs.
        </p>
        <div className="space-y-2">
          {ACTIVITY_LEVELS.map((level) => {
            const selected = data.activityLevel === level.value;
            return (
              <button
                key={level.value}
                onClick={() => updateData({ activityLevel: level.value })}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                  selected
                    ? "bg-[#F0FDFA] border-[#00685f]"
                    : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                }`}
              >
                {selected && <CheckCircle2 className="w-4 h-4 text-[#00685f] flex-shrink-0" />}
                <div>
                  <span
                    className={`text-sm font-medium ${
                      selected ? "text-[#00685f]" : "text-[#1A2332]"
                    }`}
                  >
                    {level.label}
                  </span>
                  <span className="text-xs text-[#8896A8] ml-2">{level.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sleep */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-1">
            {"Sleep Quality"}
          </label>
          <p className="text-xs italic text-[#8896A8] mb-2">
            <span className="font-medium text-[#5A6578]">Clinical note:</span> Sleep patterns influence which supplements and timing work best for you.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SLEEP_QUALITY.map((q) => {
              const selected = data.sleepQuality === q.value;
              return (
                <button
                  key={q.value}
                  onClick={() => updateData({ sleepQuality: q.value })}
                  className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                    selected
                      ? "bg-[#F0FDFA] border-[#00685f] text-[#00685f]"
                      : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
                  }`}
                >
                  {selected && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                  {q.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-2">
            {"Average Hours of Sleep"}
          </label>
          <input
            type="number"
            value={data.sleepHours}
            onChange={(e) => updateData({ sleepHours: e.target.value })}
            placeholder={"e.g. 7"}
            min="1"
            max="16"
            step="0.5"
            className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[#1A2332] placeholder:text-[#B0B8C4] focus:outline-none focus:ring-2 focus:ring-[#00685f]/30 focus:border-[#00685f] bg-white"
          />
        </div>
      </div>

      {/* Stress Level */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-1">
          {"Stress Level"}
        </label>
        <p className="text-xs italic text-[#8896A8] mb-2">
          <span className="font-medium text-[#5A6578]">Clinical note:</span> Stress levels influence which supplements and timing work best for you.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STRESS_LEVELS.map((level) => {
            const selected = data.stressLevel === level.value;
            return (
              <button
                key={level.value}
                onClick={() => updateData({ stressLevel: level.value })}
                className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  selected
                    ? "bg-[#F0FDFA] border-[#00685f] text-[#00685f]"
                    : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
                }`}
              >
                {selected && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                {level.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sun Exposure */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-1">
          {"Sun Exposure"}
        </label>
        <p className="text-xs text-[#8896A8] mb-2">{"Affects Vitamin D recommendations"}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SUN_EXPOSURE.map((level) => (
            <button
              key={level.value}
              onClick={() => updateData({ sunExposure: level.value })}
              className={`py-3 rounded-xl border text-center transition-colors ${
                data.sunExposure === level.value
                  ? "bg-[#F0FDFA] border-[#00685f]"
                  : "border-[#E2E8F0] hover:border-[#CBD5E1]"
              }`}
            >
              <span
                className={`text-xs sm:text-sm font-medium block ${
                  data.sunExposure === level.value ? "text-[#00685f]" : "text-[#1A2332]"
                }`}
              >
                {level.label}
              </span>
              <span className="text-[10px] sm:text-xs text-[#8896A8] leading-tight">{level.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Alcohol and Smoking */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-2">
            {"Alcohol Consumption"}
          </label>
          <div className="flex flex-wrap gap-2">
            {ALCOHOL.map((level) => (
              <button
                key={level.value}
                onClick={() => updateData({ alcoholConsumption: level.value })}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  data.alcoholConsumption === level.value
                    ? "bg-[#F0FDFA] border-[#00685f] text-[#00685f]"
                    : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-2">
            {"Smoking Status"}
          </label>
          <div className="flex gap-2">
            {SMOKING.map((status) => (
              <button
                key={status.value}
                onClick={() => updateData({ smokingStatus: status.value })}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  data.smokingStatus === status.value
                    ? "bg-[#F0FDFA] border-[#00685f] text-[#00685f]"
                    : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Health Goals */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-1">
          {"Primary Health Goals"} <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-[#8896A8] mb-3">{"Select up to 5 goals that matter most to you"}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {HEALTH_GOALS.map((goal) => {
            const selected = data.healthGoals.includes(goal.value);
            return (
              <button
                key={goal.value}
                onClick={() => {
                  const current = data.healthGoals;
                  if (current.includes(goal.value)) {
                    updateData({ healthGoals: current.filter((g) => g !== goal.value) });
                  } else if (current.length < 5) {
                    updateData({ healthGoals: [...current, goal.value] });
                  }
                }}
                className={`flex items-center gap-2 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200 text-left cursor-pointer ${
                  selected
                    ? "bg-[#F0FDFA] border-[#00685f] text-[#00685f]"
                    : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
                } ${
                  data.healthGoals.length >= 5 && !selected
                    ? "opacity-40 cursor-not-allowed"
                    : ""
                }`}
              >
                <span className="text-base flex-shrink-0">{goal.emoji}</span>
                <span className="flex-1">{goal.label}</span>
                {selected && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
        {data.healthGoals.length > 0 && (
          <p className="text-xs text-[#00685f] mt-2">
            {`${data.healthGoals.length}/5 goals selected`}
          </p>
        )}
      </div>
    </div>
  );
}
