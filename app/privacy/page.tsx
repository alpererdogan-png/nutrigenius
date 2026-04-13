import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/src/components/ui/Logo";

export const metadata: Metadata = {
  title: "Privacy Policy | NutriGenius",
  description:
    "NutriGenius Privacy Policy — how we collect, use, and protect your personal and health data under GDPR.",
  alternates: {
    canonical: "https://www.nutrigenius.co/privacy",
  },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "18 March 2026";

const TOC = [
  { id: "controller", label: "1. Data Controller" },
  { id: "data-collected", label: "2. Data We Collect" },
  { id: "legal-basis", label: "3. Legal Basis for Processing" },
  { id: "how-we-use", label: "4. How We Use Your Data" },
  { id: "storage-security", label: "5. Data Storage & Security" },
  { id: "your-rights", label: "6. Your Rights (GDPR)" },
  { id: "third-parties", label: "7. Third-Party Services" },
  { id: "cookies", label: "8. Cookies" },
  { id: "retention", label: "9. Data Retention" },
  { id: "childrens-privacy", label: "10. Children's Privacy" },
  { id: "changes", label: "11. Changes to This Policy" },
  { id: "contact", label: "12. Contact" },
];

export default function PrivacyPage() {
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
        {/* Title block */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A2332] mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-[#8896A8]">Last updated: {LAST_UPDATED}</p>
          <p className="mt-4 text-[#5A6578] leading-relaxed">
            This Privacy Policy explains how NutriGenius collects, uses, stores, and protects
            your personal data when you use our website and services. NutriGenius is operated
            as an Irish sole trader and is committed to full compliance with the General Data
            Protection Regulation (EU) 2016/679 (GDPR).
          </p>
        </div>

        {/* Table of Contents */}
        <nav className="bg-white border border-[#E8ECF1] rounded-2xl p-6 mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#8896A8] mb-3">
            Contents
          </p>
          <ol className="space-y-1.5">
            {TOC.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-sm text-[#00685f] hover:text-[#005249] hover:underline transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Content */}
        <div className="prose-legal">

          <section id="controller" className="mb-10">
            <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-3">
              1. Data Controller
            </h2>
            <p className="text-[#5A6578] leading-relaxed">
              The data controller responsible for your personal data is:
            </p>
            <div className="mt-3 bg-white border border-[#E8ECF1] rounded-xl p-4 text-sm text-[#5A6578] space-y-1">
              <p><strong className="text-[#1A2332]">NutriGenius</strong></p>
              <p>Operated as an Irish sole trader</p>
              <p>Cork, Ireland</p>
              <p>
                Email:{" "}
                <a href="mailto:privacy@nutrigenius.co" className="text-[#00685f] hover:underline">
                  privacy@nutrigenius.co
                </a>
              </p>
            </div>
          </section>

          <section id="data-collected" className="mb-10">
            <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-3">
              2. Data We Collect
            </h2>
            <p className="text-[#5A6578] leading-relaxed mb-4">
              We collect the following categories of data when you use NutriGenius:
            </p>

            <h3 className="font-semibold text-[#1A2332] mb-2">
              2.1 Health &amp; Special Category Data (Article 9 GDPR)
            </h3>
            <p className="text-[#5A6578] leading-relaxed mb-3">
              When you complete the health assessment quiz, you may voluntarily provide:
            </p>
            <ul className="list-disc list-inside text-[#5A6578] space-y-1 mb-4 ml-2">
              <li>Current health conditions and medical history</li>
              <li>Prescription medications and supplements</li>
              <li>Allergies and dietary restrictions</li>
              <li>Laboratory test results (blood markers, biomarkers)</li>
              <li>Genetic data (optional — MTHFR, COMT, VDR variants)</li>
              <li>Pregnancy and breastfeeding status</li>
              <li>Physical characteristics (age, sex, height, weight)</li>
              <li>Lifestyle data (activity level, sleep, stress, alcohol, smoking)</li>
            </ul>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-4">
              <strong>Note:</strong> Health data, genetic data, and information about medication
              constitute special category data under Article 9 GDPR and are subject to enhanced
              protection. We only process this data with your explicit consent.
            </div>

            <h3 className="font-semibold text-[#1A2332] mb-2">2.2 Contact Data</h3>
            <ul className="list-disc list-inside text-[#5A6578] space-y-1 mb-4 ml-2">
              <li>Email address (when provided voluntarily for plan delivery or newsletter)</li>
            </ul>

            <h3 className="font-semibold text-[#1A2332] mb-2">2.3 Technical &amp; Usage Data</h3>
            <ul className="list-disc list-inside text-[#5A6578] space-y-1 ml-2">
              <li>Browser language and locale preference</li>
              <li>Cookie consent preferences</li>
              <li>Anonymous site analytics (page views, session duration)</li>
              <li>Affiliate link click data (for commission tracking)</li>
            </ul>
          </section>

          <section id="legal-basis" className="mb-10">
            <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-3">
              3. Legal Basis for Processing
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border border-[#E8ECF1]">
                    <th className="text-left px-4 py-2.5 font-semibold text-[#1A2332] border-r border-[#E8ECF1]">
                      Data Type
                    </th>
                    <th className="text-left px-4 py-2.5 font-semibold text-[#1A2332]">
                      Legal Basis
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[#5A6578]">
                  {[
                    ["Health &amp; genetic data", "Explicit consent — Article 6(1)(a) and Article 9(2)(a) GDPR"],
                    ["Email — newsletter", "Consent — Article 6(1)(a) GDPR"],
                    ["Email — transactional (plan delivery)", "Legitimate interests — Article 6(1)(f) GDPR"],
                    ["Analytics cookies", "Consent — Article 6(1)(a) GDPR"],
                    ["Strictly necessary cookies", "Legitimate interests — Article 6(1)(f) GDPR"],
                    ["Affiliate click tracking", "Legitimate interests — Article 6(1)(f) GDPR"],
                  ].map(([type, basis], i) => (
                    <tr key={i} className="border border-[#E8ECF1]">
                      <td
                        className="px-4 py-2.5 border-r border-[#E8ECF1] font-medium"
                        dangerouslySetInnerHTML={{ __html: type }}
                      />
                      <td className="px-4 py-2.5">{basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="how-we-use" className="mb-10">
            <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-3">
              4. How We Use Your Data
            </h2>
            <ul className="list-disc list-inside text-[#5A6578] space-y-2 ml-2">
              <li>
                <strong className="text-[#1A2332]">Personalised recommendations:</strong> Your
                health data is processed by our algorithm to generate a personalised supplement
                protocol, including drug interaction safety checks.
              </li>
              <li>
                <strong className="text-[#1A2332]">Plan delivery:</strong> If you provide your
                email, we send your supplement plan and optionally a PDF summary.
              </li>
              <li>
                <strong className="text-[#1A2332]">Newsletter:</strong> If you opt in, we send
                biweekly health insights and supplement updates. You may unsubscribe at any time.
              </li>
              <li>
                <strong className="text-[#1A2332]">Service improvement:</strong> Anonymous
                analytics data helps us understand how the site is used and improve the user
                experience.
              </li>
              <li>
                <strong className="text-[#1A2332]">Advertising:</strong> With your consent, we
                may display relevant advertisements via Google AdSense.
              </li>
              <li>
                <strong className="text-[#1A2332]">Affiliate commissions:</strong> Clicks on
                product links may be tracked for affiliate commission purposes. This does not
                share your health data with affiliate partners.
              </li>
            </ul>
          </section>

          <section id="storage-security" className="mb-10">
            <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-3">
              5. Data Storage &amp; Security
            </h2>
            <ul className="list-disc list-inside text-[#5A6578] space-y-2 ml-2">
              <li>
                Your data is stored in <strong className="text-[#1A2332]">Supabase</strong>, a
                database platform hosted in the EU, with encryption at rest and in transit (TLS).
              </li>
              <li>
                We implement appropriate technical and organisational security measures to protect
                your data against unauthorised access, loss, or disclosure.
              </li>
              <li>
                <strong className="text-[#1A2332]">We do not sell your personal data</strong> to
                any third party.
              </li>
              <li>
                Health data entered into the quiz is not linked to your email address unless you
                voluntarily provide it. Quiz sessions can be completed anonymously.
              </li>
            </ul>
          </section>

          <section id="your-rights" className="mb-10">
            <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-3">
              6. Your Rights (GDPR)
            </h2>
            <p className="text-[#5A6578] leading-relaxed mb-4">
              Under GDPR, you have the following rights regarding your personal data:
            </p>
            <div className="space-y-3">
              {[
                ["Right of Access (Art. 15)", "You may request a copy of all personal data we hold about you."],
                ["Right to Rectification (Art. 16)", "You may request correction of inaccurate or incomplete data."],
                ["Right to Erasure (Art. 17)", "You may request deletion of your personal data (\"right to be forgotten\"). We will comply unless we have an overriding legal obligation to retain the data."],
                ["Right to Restrict Processing (Art. 18)", "You may request that we limit how we use your data while a dispute is resolved."],
                ["Right to Data Portability (Art. 20)", "You may request your data in a structured, machine-readable format."],
                ["Right to Object (Art. 21)", "You may object to processing based on legitimate interests, including for direct marketing."],
                ["Right to Withdraw Consent (Art. 7)", "Where processing is based on consent, you may withdraw it at any time without affecting the lawfulness of prior processing."],
                ["Right to Lodge a Complaint", "You have the right to lodge a complaint with the Irish Data Protection Commission (DPC) at www.dataprotection.ie."],
              ].map(([right, desc]) => (
                <div key={right as string} className="bg-white border border-[#E8ECF1] rounded-xl p-4">
                  <p className="text-sm font-semibold text-[#1A2332] mb-1">{right}</p>
                  <p className="text-sm text-[#5A6578]">{desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-[#5A6578]">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:privacy@nutrigenius.co" className="text-[#00685f] hover:underline">
                privacy@nutrigenius.co
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section id="third-parties" className="mb-10">
            <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-3">
              7. Third-Party Services
            </h2>
            <p className="text-[#5A6578] leading-relaxed mb-4">
              We use the following third-party services, each with their own privacy policies:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border border-[#E8ECF1]">
                    <th className="text-left px-4 py-2.5 font-semibold text-[#1A2332] border-r border-[#E8ECF1]">Service</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-[#1A2332] border-r border-[#E8ECF1]">Purpose</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-[#1A2332]">Location</th>
                  </tr>
                </thead>
                <tbody className="text-[#5A6578]">
                  {[
                    ["Supabase", "Database hosting, authentication", "EU"],
                    ["Vercel", "Website hosting and CDN", "Global (EU edge nodes available)"],
                    ["Resend", "Transactional email delivery", "US (Standard Contractual Clauses apply)"],
                    ["Google AdSense", "Display advertising (future)", "US (Standard Contractual Clauses apply)"],
                    ["Amazon Associates", "Product affiliate links", "US (click tracking only)"],
                    ["Anthropic Claude API", "AI-powered supplement explanations", "US (no health data retained by Anthropic)"],
                  ].map(([service, purpose, location]) => (
                    <tr key={service as string} className="border border-[#E8ECF1]">
                      <td className="px-4 py-2.5 border-r border-[#E8ECF1] font-medium">{service}</td>
                      <td className="px-4 py-2.5 border-r border-[#E8ECF1]">{purpose}</td>
                      <td className="px-4 py-2.5">{location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="cookies" className="mb-10">
            <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-3">
              8. Cookies
            </h2>
            <p className="text-[#5A6578] leading-relaxed mb-4">
              We use cookies and similar technologies. You can manage your preferences via the
              cookie consent banner that appears on your first visit, or at any time via the
              "Cookie Settings" link in the footer.
            </p>
            <div className="space-y-3">
              {[
                ["Necessary", "Session management, language preference. Always active."],
                ["Analytics", "Anonymous traffic analysis to understand site usage. Requires consent."],
                ["Advertising", "Google AdSense and affiliate tracking. Requires consent."],
                ["Functional", "Saved preferences and quiz progress. Requires consent."],
              ].map(([name, desc]) => (
                <div key={name as string} className="flex gap-3 bg-white border border-[#E8ECF1] rounded-xl p-4">
                  <div className="flex-shrink-0 w-20 text-sm font-semibold text-[#1A2332]">{name}</div>
                  <p className="text-sm text-[#5A6578]">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="retention" className="mb-10">
            <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-3">
              9. Data Retention
            </h2>
            <ul className="list-disc list-inside text-[#5A6578] space-y-2 ml-2">
              <li>
                <strong className="text-[#1A2332]">Health assessment data:</strong> Retained until
                you request deletion. You may email{" "}
                <a href="mailto:privacy@nutrigenius.co" className="text-[#00685f] hover:underline">
                  privacy@nutrigenius.co
                </a>{" "}
                to request erasure.
              </li>
              <li>
                <strong className="text-[#1A2332]">Email and newsletter data:</strong> Retained
                until you unsubscribe or request deletion.
              </li>
              <li>
                <strong className="text-[#1A2332]">Analytics data:</strong> Anonymised after
                24 months.
              </li>
              <li>
                <strong className="text-[#1A2332]">Cookie consent records:</strong> Stored locally
                in your browser. Cleared when you clear browser data.
              </li>
            </ul>
          </section>

          <section id="childrens-privacy" className="mb-10">
            <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-3">
              10. Children&apos;s Privacy
            </h2>
            <p className="text-[#5A6578] leading-relaxed">
              NutriGenius is not intended for use by individuals under the age of 16. We do not
              knowingly collect personal data from children. If you believe a child has provided
              us with personal data, please contact us at{" "}
              <a href="mailto:privacy@nutrigenius.co" className="text-[#00685f] hover:underline">
                privacy@nutrigenius.co
              </a>{" "}
              and we will promptly delete it.
            </p>
          </section>

          <section id="changes" className="mb-10">
            <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-3">
              11. Changes to This Policy
            </h2>
            <p className="text-[#5A6578] leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our
              practices, technology, or legal requirements. We will update the "Last updated" date
              at the top of this page. We encourage you to review this policy periodically.
              Significant changes will be communicated via a notice on the website or by email
              where appropriate.
            </p>
          </section>

          <section id="contact" className="mb-10">
            <h2 className="font-heading text-xl font-bold text-[#1A2332] mb-3">
              12. Contact
            </h2>
            <p className="text-[#5A6578] leading-relaxed mb-3">
              For any privacy-related questions, requests to exercise your rights, or complaints,
              please contact us:
            </p>
            <div className="bg-white border border-[#E8ECF1] rounded-xl p-4 text-sm text-[#5A6578] space-y-1">
              <p><strong className="text-[#1A2332]">NutriGenius — Privacy</strong></p>
              <p>
                Email:{" "}
                <a href="mailto:privacy@nutrigenius.co" className="text-[#00685f] hover:underline">
                  privacy@nutrigenius.co
                </a>
              </p>
            </div>
            <p className="mt-4 text-sm text-[#5A6578]">
              If you are unhappy with our response, you may lodge a complaint with the{" "}
              <strong className="text-[#1A2332]">Irish Data Protection Commission (DPC)</strong>:{" "}
              <span className="text-[#00685f]">www.dataprotection.ie</span>
            </p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="border-t border-[#E8ECF1] pt-8 mt-8 flex flex-wrap gap-4 text-sm text-[#8896A8]">
          <Link href="/terms" className="hover:text-[#00685f] transition-colors">Terms of Service</Link>
          <Link href="/disclaimer" className="hover:text-[#00685f] transition-colors">Medical Disclaimer</Link>
          <Link href="/disclosure" className="hover:text-[#00685f] transition-colors">Affiliate Disclosure</Link>
          <Link href="/" className="hover:text-[#00685f] transition-colors ml-auto">← Back to NutriGenius</Link>
        </div>
      </main>
    </div>
  );
}
