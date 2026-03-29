"use client";

import { CheckCircle2 } from "lucide-react";
import { QuizData } from "../page";
import { useLanguage } from "@/lib/language-context";

type Props = {
  data: QuizData;
  updateData: (fields: Partial<QuizData>) => void;
};

const ACTIVITY_LEVELS = [
  { value: "sedentary",         labelKey: "quiz.activitySedLabel",   descKey: "quiz.activitySedDesc" },
  { value: "lightly_active",    labelKey: "quiz.activityLightLabel",  descKey: "quiz.activityLightDesc" },
  { value: "moderately_active", labelKey: "quiz.activityModLabel",   descKey: "quiz.activityModDesc" },
  { value: "very_active",       labelKey: "quiz.activityVeryLabel",  descKey: "quiz.activityVeryDesc" },
  { value: "athlete",           labelKey: "quiz.activityAthLabel",   descKey: "quiz.activityAthDesc" },
];

const SLEEP_QUALITY = [
  { value: "poor",      key: "quiz.sleepPoor" },
  { value: "fair",      key: "quiz.sleepFair" },
  { value: "good",      key: "quiz.sleepGood" },
  { value: "excellent", key: "quiz.sleepExcellent" },
];

const STRESS_LEVELS = [
  { value: "low",       key: "quiz.stressLow" },
  { value: "moderate",  key: "quiz.stressModerate" },
  { value: "high",      key: "quiz.stressHigh" },
  { value: "very_high", key: "quiz.stressVeryHigh" },
];

const SUN_EXPOSURE = [
  { value: "minimal",  labelKey: "quiz.sunMinLabel", descKey: "quiz.sunMinDesc" },
  { value: "moderate", labelKey: "quiz.sunModLabel", descKey: "quiz.sunModDesc" },
  { value: "high",     labelKey: "quiz.sunHighLabel", descKey: "quiz.sunHighDesc" },
];

const ALCOHOL = [
  { value: "none",       key: "quiz.alcoholNone" },
  { value: "occasional", key: "quiz.alcoholOccasional" },
  { value: "moderate",   key: "quiz.alcoholModerate" },
  { value: "heavy",      key: "quiz.alcoholHeavy" },
];

const SMOKING = [
  { value: "never",   key: "quiz.smokingNever" },
  { value: "former",  key: "quiz.smokingFormer" },
  { value: "current", key: "quiz.smokingCurrent" },
];

const HEALTH_GOALS = [
  { value: "energy",              labelKey: "quiz.goalEnergy",    emoji: "⚡" },
  { value: "sleep",               labelKey: "quiz.goalSleep",     emoji: "🌙" },
  { value: "immunity",            labelKey: "quiz.goalImmunity",  emoji: "🛡️" },
  { value: "cognitive",           labelKey: "quiz.goalCognitive", emoji: "🧠" },
  { value: "joint-health",        labelKey: "quiz.goalJoint",     emoji: "🦴" },
  { value: "heart-health",        labelKey: "quiz.goalHeart",     emoji: "❤️" },
  { value: "gut-health",          labelKey: "quiz.goalGut",       emoji: "🌿" },
  { value: "skin-hair-nails",     labelKey: "quiz.goalSkin",      emoji: "✨" },
  { value: "weight-management",   labelKey: "quiz.goalWeight",    emoji: "⚖️" },
  { value: "stress-anxiety",      labelKey: "quiz.goalStress",    emoji: "🧘" },
  { value: "longevity",           labelKey: "quiz.goalLongevity", emoji: "🕰️" },
  { value: "athletic-performance",labelKey: "quiz.goalAthletic",  emoji: "🏋️" },
];

export function StepLifestyle({ data, updateData }: Props) {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Activity Level */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-1">
          {t("quiz.activityTitle")}
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
                    {t(level.labelKey)}
                  </span>
                  <span className="text-xs text-[#8896A8] ml-2">{t(level.descKey)}</span>
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
            {t("quiz.sleepQualTitle")}
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
                  {t(q.key)}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-2">
            {t("quiz.sleepHoursTitle")}
          </label>
          <input
            type="number"
            value={data.sleepHours}
            onChange={(e) => updateData({ sleepHours: e.target.value })}
            placeholder={t("quiz.sleepHoursPlaceholder")}
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
          {t("quiz.stressTitle")}
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
                {t(level.key)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sun Exposure */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-1">
          {t("quiz.sunTitle")}
        </label>
        <p className="text-xs text-[#8896A8] mb-2">{t("quiz.sunHint")}</p>
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
                {t(level.labelKey)}
              </span>
              <span className="text-[10px] sm:text-xs text-[#8896A8] leading-tight">{t(level.descKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Alcohol and Smoking */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-2">
            {t("quiz.alcoholTitle")}
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
                {t(level.key)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A2332] mb-2">
            {t("quiz.smokingTitle")}
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
                {t(status.key)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Health Goals */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-1">
          {t("quiz.goalsTitle")} <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-[#8896A8] mb-3">{t("quiz.goalsHint")}</p>
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
                <span className="flex-1">{t(goal.labelKey)}</span>
                {selected && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
        {data.healthGoals.length > 0 && (
          <p className="text-xs text-[#00685f] mt-2">
            {t("quiz.goalsSelected", { count: data.healthGoals.length.toString() })}
          </p>
        )}
      </div>
    </div>
  );
}
