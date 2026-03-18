"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Leaf, CheckCircle2, Loader2, AlertTriangle, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

type PageState = "loading" | "unsubscribed" | "resubscribed" | "error" | "missing";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const em = searchParams.get("em");

  const [state, setState] = useState<PageState>(em ? "loading" : "missing");
  const [email, setEmail] = useState(em ?? "");

  useEffect(() => {
    if (!em) return;
    setEmail(em);
    handleUnsubscribe(em);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [em]);

  async function handleUnsubscribe(targetEmail: string) {
    setState("loading");
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ subscribed: false, unsubscribed_at: new Date().toISOString() })
        .eq("email", targetEmail);

      if (error) throw error;
      setState("unsubscribed");
    } catch (err) {
      console.error("[unsubscribe]", err);
      setState("error");
    }
  }

  async function handleResubscribe() {
    setState("loading");
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ subscribed: true, unsubscribed_at: null })
        .eq("email", email);

      if (error) throw error;
      setState("resubscribed");
    } catch (err) {
      console.error("[resubscribe]", err);
      setState("error");
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E8ECF1]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center shadow-sm">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-semibold tracking-tight text-[#1A2332] font-heading">
              Nutri<span className="text-[#0D9488]">Genius</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">

          {/* Loading */}
          {state === "loading" && (
            <div>
              <Loader2 className="w-10 h-10 text-[#0D9488] animate-spin mx-auto mb-4" />
              <p className="text-[#5A6578] text-sm">Updating your preferences…</p>
            </div>
          )}

          {/* Unsubscribed */}
          {state === "unsubscribed" && (
            <div className="bg-white border border-[#E8ECF1] rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-[#F0FDFA] rounded-2xl flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-7 h-7 text-[#0D9488]" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-[#1A2332] mb-2">
                You've been unsubscribed
              </h1>
              <p className="text-[#5A6578] text-sm leading-relaxed mb-2">
                You've been removed from NutriGenius email updates.
              </p>
              {email && (
                <p className="text-[#8896A8] text-xs mb-6">
                  Email: <span className="font-medium text-[#5A6578]">{email}</span>
                </p>
              )}
              <p className="text-sm text-[#5A6578] mb-6">
                Changed your mind? You can re-subscribe below to continue receiving
                personalized supplement insights and health tips.
              </p>
              <button
                onClick={handleResubscribe}
                className="w-full flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-md hover:shadow-teal-500/20 mb-4"
              >
                <Mail className="w-4 h-4" />
                Re-subscribe to Updates
              </button>
              <Link
                href="/"
                className="block text-sm text-[#8896A8] hover:text-[#5A6578] transition-colors"
              >
                Return to NutriGenius →
              </Link>
            </div>
          )}

          {/* Re-subscribed */}
          {state === "resubscribed" && (
            <div className="bg-white border border-[#E8ECF1] rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-[#F0FDFA] rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Mail className="w-7 h-7 text-[#0D9488]" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-[#1A2332] mb-2">
                Welcome back!
              </h1>
              <p className="text-[#5A6578] text-sm leading-relaxed mb-6">
                You've been re-subscribed to NutriGenius updates.
                You'll continue receiving personalized supplement insights and health tips.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 hover:shadow-md hover:shadow-teal-500/20"
              >
                Go to NutriGenius
              </Link>
            </div>
          )}

          {/* Error */}
          {state === "error" && (
            <div className="bg-white border border-[#E8ECF1] rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-7 h-7 text-amber-500" />
              </div>
              <h1 className="font-heading text-xl font-bold text-[#1A2332] mb-2">
                Something went wrong
              </h1>
              <p className="text-[#5A6578] text-sm leading-relaxed mb-6">
                We couldn't update your preferences. Please try again or contact us.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200"
              >
                Return Home
              </Link>
            </div>
          )}

          {/* Missing email */}
          {state === "missing" && (
            <div className="bg-white border border-[#E8ECF1] rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-[#F0FDFA] rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Mail className="w-7 h-7 text-[#0D9488]" />
              </div>
              <h1 className="font-heading text-xl font-bold text-[#1A2332] mb-2">
                Invalid unsubscribe link
              </h1>
              <p className="text-[#5A6578] text-sm leading-relaxed mb-6">
                This link appears to be invalid or expired. Please use the unsubscribe
                link from one of your NutriGenius emails.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200"
              >
                Return Home
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
