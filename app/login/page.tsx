"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import {
  Shield,
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [healthDataConsent, setHealthDataConsent] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (isSignUp) {
      if (!gdprConsent || !healthDataConsent) {
        setMessage({
          type: "error",
          text: "You must agree to the data processing terms to create an account.",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            gdpr_consent: true,
            health_data_consent: true,
            newsletter_opt_in: newsletterOptIn,
            consent_timestamp: new Date().toISOString(),
          },
        },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: "Check your email for a confirmation link. It may take a minute to arrive.",
        });
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        window.location.href = "/quiz";
      }
    }

    setLoading(false);
  };return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
      <div className="p-4 sm:p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#1A2332]">
            Nutri<span className="text-[#0D9488]">Genius</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A2332] mb-2">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-[#5A6578]">
              {isSignUp
                ? "Save your results and get personalized recommendations"
                : "Sign in to access your supplement protocol"}
            </p>
          </div>

          <div className="bg-white border border-[#E8ECF1] rounded-2xl p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1A2332] mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-[#8896A8]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-[#E2E8F0] rounded-lg text-[#1A2332] placeholder:text-[#B0B8C4] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A2332] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-[#8896A8]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSignUp ? "Create a password (min 6 chars)" : "Your password"}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 border border-[#E2E8F0] rounded-lg text-[#1A2332] placeholder:text-[#B0B8C4] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#8896A8] hover:text-[#5A6578]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-3 border-t border-[#E8ECF1] pt-5">
                  <p className="text-xs font-medium text-[#1A2332] uppercase tracking-wider">
                    Data Processing Consent
                  </p>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gdprConsent}
                      onChange={(e) => setGdprConsent(e.target.checked)}
                      className="w-4 h-4 rounded border-[#E2E8F0] text-[#0D9488] focus:ring-[#0D9488] mt-0.5"
                    />
                    <span className="text-sm text-[#3D4B5F] leading-relaxed">
                      I agree to the{" "}
                      <Link href="/privacy" className="text-[#0D9488] underline">Privacy Policy</Link>{" "}
                      and{" "}
                      <Link href="/terms" className="text-[#0D9488] underline">Terms of Service</Link>.{" "}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={healthDataConsent}
                      onChange={(e) => setHealthDataConsent(e.target.checked)}
                      className="w-4 h-4 rounded border-[#E2E8F0] text-[#0D9488] focus:ring-[#0D9488] mt-0.5"
                    />
                    <span className="text-sm text-[#3D4B5F] leading-relaxed">
                      I consent to the processing of my health data (conditions, medications, lab results, genetic data) for the purpose of generating personalized supplement recommendations. This data is classified as special category data under GDPR Article 9.{" "}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newsletterOptIn}
                      onChange={(e) => setNewsletterOptIn(e.target.checked)}
                      className="w-4 h-4 rounded border-[#E2E8F0] text-[#0D9488] focus:ring-[#0D9488] mt-0.5"
                    />
                    <span className="text-sm text-[#5A6578] leading-relaxed">
                      Send me biweekly health insights and supplement updates (optional — you can unsubscribe anytime)
                    </span>
                  </label>
                </div>
              )}{message && (
                <div
                  className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                    message.type === "success"
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-[#0D9488]/50 text-white font-medium py-3 rounded-xl transition-colors"
              >
                {loading ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-6 pt-5 border-t border-[#E8ECF1]">
              <p className="text-sm text-[#5A6578]">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setMessage(null);
                  }}
                  className="text-[#0D9488] font-medium hover:underline"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-[#8896A8]">
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              GDPR compliant
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              Encrypted
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              No data sold
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}