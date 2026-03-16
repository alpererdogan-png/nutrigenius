"use client";

import { QuizData } from "../page";

type Props = {
  data: QuizData;
  updateData: (fields: Partial<QuizData>) => void;
};

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
  { value: "lightly_active", label: "Lightly Active", desc: "Light exercise 1-3 days/week" },
  { value: "moderately_active", label: "Moderately Active", desc: "Moderate exercise 3-5 days/week" },
  { value: "very_active", label: "Very Active", desc: "Hard exercise 6-7 days/week" },
  { value: "athlete", label: "Athlete", desc: "Intense training, physical job" },
];

const SLEEP_QUALITY = ["Poor", "Fair", "Good", "Excellent"];
const STRESS_LEVELS = ["Low", "Moderate", "High", "Very High"];
const SUN_EXPOSURE = [
  { value: "minimal", label: "Minimal", desc: "Mostly indoors" },
  { value: "moderate", label: "Moderate", desc: "Some outdoor time" },
  { value: "high", label: "High", desc: "Regularly outdoors" },
];
const ALCOHOL = ["None", "Occasional", "Moderate", "Heavy"];
const SMOKING = ["Never", "Former", "Current"];

const HEALTH_GOALS = [
  { value: "energy", label: "Energy", emoji: "⚡" },
  { value: "sleep", label: "Sleep", emoji: "🌙" },
  { value: "immunity", label: "Immunity", emoji: "🛡️" },
  { value: "cognitive", label: "Cognitive Performance", emoji: "🧠" },
  { value: "joint-health", label: "Joint Health", emoji: "🦴" },
  { value: "heart-health", label: "Heart Health", emoji: "❤️" },
  { value: "gut-health", label: "Gut Health", emoji: "🌿" },
  { value: "skin-hair-nails", label: "Skin, Hair & Nails", emoji: "✨" },
  { value: "weight-management", label: "Weight Management", emoji: "⚖️" },
  { value: "stress-anxiety", label: "Stress & Anxiety", emoji: "🧘" },
  { value: "longevity", label: "Longevity & Anti-Aging", emoji: "🕰️" },
  { value: "athletic-performance", label: "Athletic Performance", emoji: "🏋️" },
];

export function StepLifestyle({ data, updateData }: Props) {
  return (
    <div className="space-y-8">
      {/* Activity Level */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-2">
          Physical Activity Level
        </label>
        <div className="space-y-2">
          {ACTIVITY_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => updateData({ activityLevel: level.value })}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                data.activityLevel === level.value
                  ? "bg-[#F0FDFA] border-[#0D9488]"
                  : "border-[#E2E8F0] hover:border-[#CBD5E1]"
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  data.activityLevel === level.value
                    ? "text-[#0D9488]"
                    : "text-[#1A2332]"
                }`}
              >
                {level.label}
              </span>
              <span className="text-xs text-[#8896A8] ml-2">
                {level.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sleep */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-2">
            Sleep Quality
          </label>
          <div className="flex gap-2">
            {SLEEP_QUALITY.map((q) => (
              <button
                key={q}
                onClick={() =>
                  updateData({ sleepQuality: q.toLowerCase() })
                }
                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  data.sleepQuality === q.toLowerCase()
                    ? "bg-[#F0FDFA] border-[#0D9488] text-[#0D9488]"
                    : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-2">
            Average Hours of Sleep
          </label>
          <input
            type="number"
            value={data.sleepHours}
            onChange={(e) => updateData({ sleepHours: e.target.value })}
            placeholder="e.g. 7"
            min="1"
            max="16"
            step="0.5"
            className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[#1A2332] placeholder:text-[#B0B8C4] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] bg-white"
          />
        </div>
      </div>

      {/* Stress Level */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-2">
          Stress Level
        </label>
        <div className="flex gap-2">
          {STRESS_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() =>
                updateData({
                  stressLevel: level.toLowerCase().replace(" ", "_"),
                })
              }
              className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                data.stressLevel === level.toLowerCase().replace(" ", "_")
                  ? "bg-[#F0FDFA] border-[#0D9488] text-[#0D9488]"
                  : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Sun Exposure */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-1">
          Sun Exposure
        </label>
        <p className="text-xs text-[#8896A8] mb-2">
          Affects Vitamin D recommendations
        </p>
        <div className="flex gap-2">
          {SUN_EXPOSURE.map((level) => (
            <button
              key={level.value}
              onClick={() => updateData({ sunExposure: level.value })}
              className={`flex-1 py-3 rounded-xl border text-center transition-colors ${
                data.sunExposure === level.value
                  ? "bg-[#F0FDFA] border-[#0D9488]"
                  : "border-[#E2E8F0] hover:border-[#CBD5E1]"
              }`}
            >
              <span
                className={`text-sm font-medium block ${
                  data.sunExposure === level.value
                    ? "text-[#0D9488]"
                    : "text-[#1A2332]"
                }`}
              >
                {level.label}
              </span>
              <span className="text-xs text-[#8896A8]">{level.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Alcohol and Smoking */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-2">
            Alcohol Consumption
          </label>
          <div className="flex flex-wrap gap-2">
            {ALCOHOL.map((level) => (
              <button
                key={level}
                onClick={() =>
                  updateData({
                    alcoholConsumption: level.toLowerCase(),
                  })
                }
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  data.alcoholConsumption === level.toLowerCase()
                    ? "bg-[#F0FDFA] border-[#0D9488] text-[#0D9488]"
                    : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-2">
            Smoking Status
          </label>
          <div className="flex gap-2">
            {SMOKING.map((status) => (
              <button
                key={status}
                onClick={() =>
                  updateData({ smokingStatus: status.toLowerCase() })
                }
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  data.smokingStatus === status.toLowerCase()
                    ? "bg-[#F0FDFA] border-[#0D9488] text-[#0D9488]"
                    : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Health Goals */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-1">
          Primary Health Goals <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-[#8896A8] mb-3">
          Select up to 5 goals that matter most to you
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {HEALTH_GOALS.map((goal) => (
            <button
              key={goal.value}
              onClick={() => {
                const current = data.healthGoals;
                if (current.includes(goal.value)) {
                  updateData({
                    healthGoals: current.filter((g) => g !== goal.value),
                  });
                } else if (current.length < 5) {
                  updateData({
                    healthGoals: [...current, goal.value],
                  });
                }
              }}
              className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition-colors text-left ${
                data.healthGoals.includes(goal.value)
                  ? "bg-[#F0FDFA] border-[#0D9488] text-[#0D9488]"
                  : "border-[#E2E8F0] text-[#5A6578] hover:border-[#CBD5E1]"
              } ${
                data.healthGoals.length >= 5 &&
                !data.healthGoals.includes(goal.value)
                  ? "opacity-40 cursor-not-allowed"
                  : ""
              }`}
            >
              <span className="text-base">{goal.emoji}</span>
              {goal.label}
            </button>
          ))}
        </div>
        {data.healthGoals.length > 0 && (
          <p className="text-xs text-[#0D9488] mt-2">
            {data.healthGoals.length}/5 goals selected
          </p>
        )}
      </div>
    </div>
  );
}
