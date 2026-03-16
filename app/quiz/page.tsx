"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Shield, CheckCircle2 } from "lucide-react";
import { StepDemographics } from "./components/StepDemographics";
import { StepHealthConditions } from "./components/StepHealthConditions";
import { StepLifestyle } from "./components/StepLifestyle";
import { StepLabResults } from "./components/StepLabResults";
import { StepGenetics } from "./components/StepGenetics";

export type QuizData = {
  // Section 1 — Demographics
  age: string;
  biologicalSex: string;
  heightCm: string;
  weightKg: string;
  country: string;
  preferredLanguage: string;
  pregnant: boolean;
  breastfeeding: boolean;
  dietaryPattern: string;
  allergies: string[];
  halalPreference: boolean;

  // Section 2 — Health Conditions & Medications
  healthConditions: string[];
  currentMedications: string[];
  currentSupplements: string[];
  familyHistory: string[];

  // Section 3 — Lifestyle & Goals
  activityLevel: string;
  sleepQuality: string;
  sleepHours: string;
  stressLevel: string;
  sunExposure: string;
  alcoholConsumption: string;
  smokingStatus: string;
  healthGoals: string[];

  // Section 4 — Lab Results
  labResults: {
    biomarker: string;
    value: string;
    unit: string;
    testDate: string;
  }[];

  // Section 5 — Genetics
  hasGeneticData: boolean;
  geneticVariants: {
    gene: string;
    variant: string;
    status: string;
  }[];
};

const INITIAL_DATA: QuizData = {
  age: "",
  biologicalSex: "",
  heightCm: "",
  weightKg: "",
  country: "",
  preferredLanguage: "en",
  pregnant: false,
  breastfeeding: false,
  dietaryPattern: "",
  allergies: [],
  halalPreference: false,

  healthConditions: [],
  currentMedications: [],
  currentSupplements: [],
  familyHistory: [],

  activityLevel: "",
  sleepQuality: "",
  sleepHours: "",
  stressLevel: "",
  sunExposure: "",
  alcoholConsumption: "",
  smokingStatus: "",
  healthGoals: [],

  labResults: [],

  hasGeneticData: false,
  geneticVariants: [],
};

const STEPS = [
  { number: 1, title: "Demographics", subtitle: "Basic information" },
  { number: 2, title: "Health", subtitle: "Conditions & medications" },
  { number: 3, title: "Lifestyle", subtitle: "Habits & goals" },
  { number: 4, title: "Lab Results", subtitle: "Optional but helpful" },
  { number: 5, title: "Genetics", subtitle: "Optional" },
];

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [quizData, setQuizData] = useState<QuizData>(INITIAL_DATA);

  const updateData = (fields: Partial<QuizData>) => {
    setQuizData((prev) => ({ ...prev, ...fields }));
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    console.log("Quiz submitted:", quizData);
    // We will connect this to the recommendation algorithm later
    alert("Quiz complete! Recommendation engine coming in Week 5.");
  };

  const progress = (currentStep / 5) * 100;

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8ECF1] sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#0D9488]" />
              <span className="text-sm font-medium text-[#1A2332]">
                NutriGenius Health Assessment
              </span>
            </div>
            <span className="text-sm text-[#5A6578]">
              Step {currentStep} of 5
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#E8ECF1] rounded-full h-2">
            <div
              className="bg-[#0D9488] h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex justify-between mt-3">
            {STEPS.map((step) => (
              <button
                key={step.number}
                onClick={() => {
                  if (step.number < currentStep) setCurrentStep(step.number);
                }}
                className={`flex flex-col items-center ${
                  step.number < currentStep
                    ? "cursor-pointer"
                    : "cursor-default"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    step.number < currentStep
                      ? "bg-[#0D9488] text-white"
                      : step.number === currentStep
                      ? "bg-[#0D9488] text-white ring-4 ring-[#0D9488]/20"
                      : "bg-[#E8ECF1] text-[#8896A8]"
                  }`}
                >
                  {step.number < currentStep ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 hidden sm:block ${
                    step.number === currentStep
                      ? "text-[#0D9488] font-medium"
                      : "text-[#8896A8]"
                  }`}
                >
                  {step.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A2332] mb-2">
            {STEPS[currentStep - 1].title}
          </h1>
          <p className="text-[#5A6578]">
            {currentStep === 1 &&
              "Let's start with some basic information to personalize your recommendations."}
            {currentStep === 2 &&
              "Tell us about your health conditions and any medications you're taking. This is critical for safety screening."}
            {currentStep === 3 &&
              "Your lifestyle habits help us fine-tune supplement choices and timing."}
            {currentStep === 4 &&
              "Lab results allow us to identify actual deficiencies and calibrate doses. Skip this if you don't have recent results."}
            {currentStep === 5 &&
              "Genetic data helps us select the optimal supplement forms for your biology."}
          </p>
        </div>

        {/* Step components */}
        {currentStep === 1 && (
          <StepDemographics data={quizData} updateData={updateData} />
        )}
        {currentStep === 2 && (
          <StepHealthConditions data={quizData} updateData={updateData} />
        )}
        {currentStep === 3 && (
          <StepLifestyle data={quizData} updateData={updateData} />
        )}
        {currentStep === 4 && (
          <StepLabResults data={quizData} updateData={updateData} />
        )}
        {currentStep === 5 && (
          <StepGenetics data={quizData} updateData={updateData} />
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-10 pt-6 border-t border-[#E8ECF1]">
          {currentStep > 1 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 text-[#5A6578] hover:text-[#1A2332] font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium px-8 py-3 rounded-xl transition-colors"
            >
              Get My Recommendations
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-[#8896A8] text-center mt-8 leading-relaxed">
          Your data is processed securely and never shared with third parties.
          NutriGenius is not a substitute for professional medical advice.
        </p>
      </div>
    </div>
  );
}
