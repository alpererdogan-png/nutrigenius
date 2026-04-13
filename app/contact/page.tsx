import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare, Newspaper, Handshake } from "lucide-react";
import { Logo } from "@/src/components/ui/Logo";

export const metadata: Metadata = {
  title: "Contact — NutriGenius",
  description:
    "Get in touch with the NutriGenius team at Clareo Health. General enquiries, press, and partnership requests.",
  alternates: {
    canonical: "https://www.nutrigenius.co/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      {/* Header */}
      <header className="bg-white shadow-sm shadow-black/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity duration-200">
            <Logo size="sm" variant="light" />
          </Link>
          <Link
            href="/"
            className="text-sm text-[#5A6578] hover:text-[#00685f] transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A2332] mb-3">
          Contact Us
        </h1>
        <p className="text-[#5A6578] text-lg leading-relaxed mb-10 max-w-xl">
          NutriGenius is built by Clareo Health. We&apos;d love to hear from you.
        </p>

        {/* Email card */}
        <div className="bg-white rounded-2xl ring-1 ring-black/[0.04] p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#e6f4f3] flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#00685f]" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-[#1A2332]">Email</h2>
              <a
                href="mailto:hello@clareohealth.co"
                className="text-[#00685f] font-semibold hover:underline"
              >
                hello@clareohealth.co
              </a>
            </div>
          </div>
          <p className="text-sm text-[#5A6578] leading-relaxed">
            For all enquiries including general questions, feedback, and support requests.
            We aim to respond within 48 hours.
          </p>
        </div>

        {/* Enquiry types */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-2xl ring-1 ring-black/[0.04] p-5 text-center">
            <MessageSquare className="w-6 h-6 text-[#00685f] mx-auto mb-3" />
            <h3 className="font-heading text-sm font-bold text-[#1A2332] mb-1">General</h3>
            <p className="text-xs text-[#5A6578]">Questions, feedback, feature requests</p>
          </div>
          <div className="bg-white rounded-2xl ring-1 ring-black/[0.04] p-5 text-center">
            <Newspaper className="w-6 h-6 text-[#00685f] mx-auto mb-3" />
            <h3 className="font-heading text-sm font-bold text-[#1A2332] mb-1">Press</h3>
            <p className="text-xs text-[#5A6578]">Media enquiries and interview requests</p>
          </div>
          <div className="bg-white rounded-2xl ring-1 ring-black/[0.04] p-5 text-center">
            <Handshake className="w-6 h-6 text-[#00685f] mx-auto mb-3" />
            <h3 className="font-heading text-sm font-bold text-[#1A2332] mb-1">Partnerships</h3>
            <p className="text-xs text-[#5A6578]">Collaboration and integration proposals</p>
          </div>
        </div>

        {/* Footer nav */}
        <div className="border-t border-[#E8ECF1] pt-8 mt-10 flex flex-wrap gap-4 text-sm text-[#8896A8]">
          <Link href="/about" className="hover:text-[#00685f] transition-colors">About</Link>
          <Link href="/privacy" className="hover:text-[#00685f] transition-colors">Privacy Policy</Link>
          <Link href="/disclaimer" className="hover:text-[#00685f] transition-colors">Medical Disclaimer</Link>
          <Link href="/disclosure" className="hover:text-[#00685f] transition-colors">Affiliate Disclosure</Link>
          <Link href="/" className="hover:text-[#00685f] transition-colors ml-auto">← Back to NutriGenius</Link>
        </div>
      </main>
    </div>
  );
}
