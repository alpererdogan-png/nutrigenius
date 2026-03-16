"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  CheckCircle2,
  Loader2,
  Mail,
  Download,
  Calendar,
  FileText,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
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
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [quizData, setQuizData] = useState<QuizData>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Email capture state
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [optPdf, setOptPdf] = useState(true);
  const [optCalendar, setOptCalendar] = useState(true);
  const [optNewsletter, setOptNewsletter] = useState(true);

  const updateData = (fields: Partial<QuizData>) => {
    setQuizData((prev) => ({ ...prev, ...fields }));
  };

  const nextStep = () => {
    if (currentStep <= 5) setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEmailSubmit = async () => {
    if (!email || !email.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError(null);
    setLoading(true);
    setSubmitError(null);

    try {
      // Call recommendation API
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizData),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      const recommendations = await res.json();

      // Save email + quiz data to Supabase (best-effort — don't block on failure)
      try {
        const supabase = createClient();
        await supabase.from("newsletter_subscribers").upsert({
          email,
          newsletter_opt_in: optNewsletter,
          pdf_opt_in: optPdf,
          calendar_opt_in: optCalendar,
          created_at: new Date().toISOString(),
        });
      } catch {
        // Non-blocking — proceed even if Supabase save fails
      }

      // Store results and email for results page
      sessionStorage.setItem("nutrigenius_recommendations", JSON.stringify(recommendations));
      sessionStorage.setItem("nutrigenius_email", email);
      router.push("/results");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  const progress = (Math.min(currentStep, 5) / 5) * 100;

  // ── Email Capture Screen (step 6) ──
  if (currentStep === 6) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-[#E8ECF1]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(5)}
              className="flex items-center gap-2 text-[#5A6578] hover:text-[#1A2332] text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#0D9488]" />
              <span className="text-sm font-medium text-[#1A2332]">NutriGenius</span>
            </div>
            <div className="w-20" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg">
            {/* Ready card */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0D9488] to-[#0F766E] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1A2332] mb-2">
                Your Plan is Ready!
              </h1>
              <p className="text-[#5A6578]">
                Your personalized supplement protocol is ready! Enter your email to receive it:
              </p>
            </div>

            <div className="bg-white border border-[#E8ECF1] rounded-2xl p-6 sm:p-8 shadow-sm">
              {/* What you'll get */}
              <div className="space-y-3 mb-6">
                {[
                  { icon: <FileText className="w-4 h-4" />, label: "Your complete supplement plan as a downloadable PDF", state: optPdf, setter: setOptPdf },
                  { icon: <Calendar className="w-4 h-4" />, label: "3-month calendar reminders for your supplement schedule", state: optCalendar, setter: setOptCalendar },
                  { icon: <Mail className="w-4 h-4" />, label: "Biweekly health insights and supplement updates", state: optNewsletter, setter: setOptNewsletter },
                ].map((item) => (
                  <label key={item.label} className="flex items-start gap-3 cursor-pointer group">
                    <div className="flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={item.state}
                        onChange={(e) => item.setter(e.target.checked)}
                        className="w-4 h-4 rounded border-[#E2E8F0] text-[#0D9488] focus:ring-[#0D9488]"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#3D4B5F] group-hover:text-[#1A2332] transition-colors">
                      <span className="text-[#0D9488]">{item.icon}</span>
                      {item.label}
                    </div>
                  </label>
                ))}
              </div>

              {/* Email input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1A2332] mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-[#8896A8]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[#1A2332] placeholder:text-[#B0B8C4] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] bg-white"
                    onKeyDown={(e) => { if (e.key === "Enter") handleEmailSubmit(); }}
                  />
                </div>
                {emailError && (
                  <p className="text-xs text-red-600 mt-1">{emailError}</p>
                )}
              </div>

              <button
                onClick={handleEmailSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-[#0D9488]/60 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 hover:shadow-md hover:shadow-teal-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating your plan...
                  </>
                ) : (
                  <>
                    Get My Free Plan
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {submitError && (
                <p className="text-sm text-red-600 text-center mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {submitError}
                </p>
              )}

              <p className="text-xs text-[#8896A8] text-center mt-4 leading-relaxed">
                By entering your email, you agree to receive your plan and occasional health updates.
                Unsubscribe anytime.
              </p>
              <p className="text-xs text-[#8896A8] text-center mt-1">
                Your health data is processed securely under GDPR Article 9.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal quiz steps 1–5 ──
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
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1A2332] mb-2">
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

          <button
            onClick={nextStep}
            className="flex items-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-md hover:shadow-teal-500/20"
          >
            {currentStep === 5 ? (
              <>
                See My Results
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
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
