import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Link,
  StyleSheet,
} from "@react-pdf/renderer";
import type { RecommendationResult, SupplementRecommendation } from "@/app/api/recommend/route";

// ─── Palette ──────────────────────────────────────────────────────────────────

const TEAL       = "#0D9488";
const TEAL_DARK  = "#0F766E";
const TEAL_LIGHT = "#CCFBF1";
const TEAL_BG    = "#F0FDFA";
const DARK       = "#1A2332";
const MID        = "#5A6578";
const LIGHT      = "#8896A8";
const MUTED      = "#B0BAC9";
const BORDER     = "#E8ECF1";
const BG         = "#F8FAFC";
const ALT_ROW    = "#F3F8F8";  // alternating row tint
const WHITE      = "#FFFFFF";

const EVIDENCE_COLORS: Record<string, { fg: string; bg: string; border: string }> = {
  Strong:      { fg: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
  Moderate:    { fg: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
  Emerging:    { fg: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  Traditional: { fg: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" },
};

// ─── Style sheet ──────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // ── Pages ──────────────────────────────────────────────────────────────────
  pageLandscape: {
    backgroundColor: WHITE,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 20,
    fontFamily: "Helvetica",
    size: "A4",
  },
  pagePortrait: {
    backgroundColor: WHITE,
    paddingHorizontal: 36,
    paddingTop: 20,
    paddingBottom: 28,
    fontFamily: "Helvetica",
  },

  // ── Page header (all pages) ─────────────────────────────────────────────────
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 8,
    marginBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: TEAL,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 5 },
  headerDot: { width: 8, height: 8, backgroundColor: TEAL, borderRadius: 4 },
  headerBrand: { fontSize: 12, color: DARK, fontFamily: "Helvetica-Bold", letterSpacing: 0.3 },
  headerBrandAccent: { fontSize: 12, color: TEAL, fontFamily: "Helvetica-Bold" },
  headerRight: { alignItems: "flex-end" },
  headerPreparedFor: { fontSize: 7.5, color: MID },
  headerDate: { fontSize: 7, color: LIGHT, marginTop: 1 },

  // ── Page title row ─────────────────────────────────────────────────────────
  pageTitleRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 10 },
  pageTitle: { fontSize: 14, color: DARK, fontFamily: "Helvetica-Bold" },
  pageTitleSub: { fontSize: 8, color: LIGHT },

  // ── Schedule table (landscape) ─────────────────────────────────────────────
  schedTable: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    overflow: "hidden",
    flex: 1,
  },
  schedHeaderRow: {
    flexDirection: "row",
    backgroundColor: TEAL,
  },
  schedDayHeaderCell: {
    width: 72,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: TEAL_DARK,
    justifyContent: "center",
  },
  schedSlotHeaderCell: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: TEAL_DARK,
    alignItems: "center",
    justifyContent: "center",
  },
  schedHeaderText: { fontSize: 8.5, color: WHITE, fontFamily: "Helvetica-Bold", letterSpacing: 0.4 },
  schedHeaderSubText: { fontSize: 6.5, color: TEAL_LIGHT, marginTop: 1 },

  schedRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    minHeight: 58,
  },
  schedRowAlt: { backgroundColor: ALT_ROW },
  schedRowWhite: { backgroundColor: WHITE },

  schedDayCell: {
    width: 72,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: BORDER,
    justifyContent: "center",
  },
  schedDayText: { fontSize: 8, color: DARK, fontFamily: "Helvetica-Bold" },

  schedSlotCell: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: BORDER,
    gap: 3,
  },
  schedSuppChip: {
    backgroundColor: TEAL_BG,
    borderWidth: 1,
    borderColor: TEAL_LIGHT,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2.5,
    marginBottom: 2,
  },
  schedSuppName: { fontSize: 7, color: DARK, fontFamily: "Helvetica-Bold", lineHeight: 1.2 },
  schedSuppNote: { fontSize: 6, color: MID, lineHeight: 1.3, marginTop: 1 },
  schedEmpty: { fontSize: 7, color: MUTED },

  // ── Supplement detail (portrait) ────────────────────────────────────────────
  suppCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    marginBottom: 10,
    overflow: "hidden",
  },
  suppCardHeader: {
    backgroundColor: BG,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    gap: 8,
  },
  suppCardHeaderLeft: { flex: 1 },
  suppName: { fontSize: 11, color: DARK, fontFamily: "Helvetica-Bold", lineHeight: 1.3 },
  suppForm: { fontSize: 8, color: MID, marginTop: 1 },
  suppCardBody: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },

  suppMeta: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginBottom: 2 },
  chip: {
    backgroundColor: TEAL_BG,
    borderWidth: 1,
    borderColor: TEAL_LIGHT,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  chipGray: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  chipText: { fontSize: 7.5, color: TEAL_DARK },
  chipTextGray: { fontSize: 7.5, color: MID },

  evidenceBadge: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 3.5,
  },
  evidenceDot: { width: 4.5, height: 4.5, borderRadius: 3 },
  evidenceText: { fontSize: 7.5, fontFamily: "Helvetica-Bold" },

  whyBox: {
    backgroundColor: BG,
    borderRadius: 5,
    padding: 7,
    borderLeftWidth: 2,
    borderLeftColor: TEAL,
  },
  whyLabel: { fontSize: 7, color: TEAL, fontFamily: "Helvetica-Bold", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.4 },
  whyText: { fontSize: 8, color: MID, lineHeight: 1.55 },

  warnRow: {
    flexDirection: "row",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 4,
    padding: 6,
    gap: 5,
    alignItems: "flex-start",
  },
  warnTriangle: { fontSize: 8, color: "#B45309", lineHeight: 1.2 },
  warnText: { fontSize: 7.5, color: "#92400E", flex: 1, lineHeight: 1.45 },

  foodRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  foodChip: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  foodChipText: { fontSize: 7, color: "#15803D" },

  iherbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    marginTop: 2,
  },
  iherbLabel: { fontSize: 7.5, color: LIGHT },
  iherbLink: { fontSize: 7.5, color: TEAL },

  // ── Disclaimer page ─────────────────────────────────────────────────────────
  disclaimerBox: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },
  disclaimerTitle: { fontSize: 10, color: "#92400E", fontFamily: "Helvetica-Bold", marginBottom: 5 },
  disclaimerText: { fontSize: 8.5, color: "#A16207", lineHeight: 1.65 },

  infoBox: {
    backgroundColor: BG,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 2.5,
    borderLeftColor: TEAL,
  },
  infoLabel: { fontSize: 8, color: TEAL, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 },
  infoText: { fontSize: 8.5, color: MID, lineHeight: 1.65 },

  divider: { height: 1, backgroundColor: BORDER, marginVertical: 10 },

  // ── Page footer ─────────────────────────────────────────────────────────────
  pageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  footerText: { fontSize: 7, color: MUTED },
  footerBrand: { fontSize: 7, color: TEAL },

  // ── Blocked ─────────────────────────────────────────────────────────────────
  blockedRow: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 5,
    padding: 8,
    marginBottom: 5,
    gap: 6,
  },
  blockedName: { fontSize: 8.5, color: "#991B1B", fontFamily: "Helvetica-Bold" },
  blockedReason: { fontSize: 7.5, color: "#B91C1C", marginTop: 2, lineHeight: 1.4 },

  // ── Brand footer (last page) ─────────────────────────────────────────────────
  brandCenter: { alignItems: "center", paddingTop: 20, paddingBottom: 10 },
  brandCenterRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 },
  brandCenterDot: { width: 7, height: 7, backgroundColor: TEAL, borderRadius: 4 },
  brandCenterName: { fontSize: 13, color: TEAL, fontFamily: "Helvetica-Bold", letterSpacing: 0.5 },
  brandCenterSub: { fontSize: 8, color: LIGHT, textAlign: "center", lineHeight: 1.6 },
});

// ─── Data ─────────────────────────────────────────────────────────────────────

const DAYS   = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOTS  = ["Morning", "Midday", "Evening"] as const;

const SLOT_SUBTITLES: Record<string, string> = {
  Morning: "Wake – 12pm",
  Midday:  "12pm – 6pm",
  Evening: "6pm – Bedtime",
};

// Split supplements into portrait-page chunks (3 per page)
function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function PageHeader({ recipient, date }: { recipient: string; date: string }) {
  return (
    <View style={s.pageHeader}>
      <View style={s.headerLeft}>
        <View style={s.headerDot} />
        <Text style={s.headerBrand}>
          Nutri<Text style={s.headerBrandAccent}>Genius</Text>
        </Text>
      </View>
      <View style={s.headerRight}>
        {recipient ? <Text style={s.headerPreparedFor}>Prepared for: {recipient}</Text> : null}
        <Text style={s.headerDate}>Generated {date}</Text>
      </View>
    </View>
  );
}

function PageFooter({ label }: { label: string }) {
  return (
    <View style={s.pageFooter}>
      <Text style={s.footerText}>NutriGenius · Personalized Supplement Plan</Text>
      <Text style={s.footerBrand}>{label}</Text>
    </View>
  );
}

function EvidenceBadge({ rating }: { rating: string }) {
  const c = EVIDENCE_COLORS[rating] ?? EVIDENCE_COLORS.Traditional;
  return (
    <View style={[s.evidenceBadge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <View style={[s.evidenceDot, { backgroundColor: c.fg }]} />
      <Text style={[s.evidenceText, { color: c.fg }]}>{rating}</Text>
    </View>
  );
}

// ─── Page 1: Weekly Schedule (Landscape) ─────────────────────────────────────

function SchedulePage({
  schedule,
  supplements,
  recipient,
  date,
}: {
  schedule: RecommendationResult["schedule"];
  supplements: SupplementRecommendation[];
  recipient: string;
  date: string;
}) {
  return (
    <Page size="A4" orientation="landscape" style={s.pageLandscape}>
      <PageHeader recipient={recipient} date={date} />

      <View style={s.pageTitleRow}>
        <Text style={s.pageTitle}>Weekly Supplement Schedule</Text>
        <Text style={s.pageTitleSub}>
          {supplements.length} supplement{supplements.length !== 1 ? "s" : ""} · personalised protocol
        </Text>
      </View>

      {/* Table — flex:1 so it fills remaining height */}
      <View style={s.schedTable}>
        {/* Header row */}
        <View style={s.schedHeaderRow}>
          <View style={s.schedDayHeaderCell}>
            <Text style={s.schedHeaderText}>Day</Text>
          </View>
          {SLOTS.map((slot, si) => (
            <View
              key={slot}
              style={[
                s.schedSlotHeaderCell,
                si === SLOTS.length - 1 ? { borderRightWidth: 0 } : {},
              ]}
            >
              <Text style={s.schedHeaderText}>{slot}</Text>
              <Text style={s.schedHeaderSubText}>{SLOT_SUBTITLES[slot]}</Text>
            </View>
          ))}
        </View>

        {/* Data rows */}
        {DAYS.map((day, di) => {
          const isAlt = di % 2 === 1;
          return (
            <View
              key={day}
              style={[
                s.schedRow,
                isAlt ? s.schedRowAlt : s.schedRowWhite,
                di === DAYS.length - 1 ? { borderBottomWidth: 0 } : {},
              ]}
            >
              {/* Day label */}
              <View style={s.schedDayCell}>
                <Text style={s.schedDayText}>{day.slice(0, 3).toUpperCase()}</Text>
                <Text style={{ fontSize: 6, color: LIGHT, marginTop: 1 }}>{day}</Text>
              </View>

              {/* Time slot cells */}
              {SLOTS.map((slot, si) => {
                const items = schedule[day]?.[slot] ?? [];
                return (
                  <View
                    key={slot}
                    style={[
                      s.schedSlotCell,
                      si === SLOTS.length - 1 ? { borderRightWidth: 0 } : {},
                    ]}
                  >
                    {items.length === 0 ? (
                      <Text style={s.schedEmpty}>—</Text>
                    ) : (
                      items.map((item) => (
                        <View key={item.supplementId} style={s.schedSuppChip}>
                          <Text style={s.schedSuppName}>{item.name}</Text>
                          {item.note ? <Text style={s.schedSuppNote}>{item.note}</Text> : null}
                        </View>
                      ))
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>

      <PageFooter label="Weekly Schedule · Page 1" />
    </Page>
  );
}

// ─── Supplement detail section ────────────────────────────────────────────────

function SupplementDetail({ supp }: { supp: SupplementRecommendation }) {
  return (
    <View style={s.suppCard}>
      {/* Card header */}
      <View style={s.suppCardHeader}>
        <View style={s.suppCardHeaderLeft}>
          <Text style={s.suppName}>{supp.name}</Text>
          <Text style={s.suppForm}>{supp.form}</Text>
        </View>
        <EvidenceBadge rating={supp.evidenceRating} />
      </View>

      {/* Card body */}
      <View style={s.suppCardBody}>
        {/* Dose + timing chips */}
        <View style={s.suppMeta}>
          <View style={s.chip}>
            <Text style={s.chipText}>{supp.doseDisplay}</Text>
          </View>
          <View style={s.chipGray}>
            <Text style={s.chipTextGray}>{supp.timing}</Text>
          </View>
          {supp.category ? (
            <View style={s.chipGray}>
              <Text style={s.chipTextGray}>{supp.category}</Text>
            </View>
          ) : null}
        </View>

        {/* Warnings */}
        {supp.warnings.map((w, i) => (
          <View key={i} style={s.warnRow}>
            <Text style={s.warnTriangle}>⚠</Text>
            <Text style={s.warnText}>{w}</Text>
          </View>
        ))}

        {/* Why recommended */}
        <View style={s.whyBox}>
          <Text style={s.whyLabel}>Why recommended</Text>
          <Text style={s.whyText}>{supp.whyRecommended}</Text>
        </View>

        {/* Food sources */}
        {supp.foodSources.length > 0 && (
          <View>
            <Text style={[s.whyLabel, { marginBottom: 4 }]}>Natural food sources</Text>
            <View style={s.foodRow}>
              {supp.foodSources.map((f) => (
                <View key={f} style={s.foodChip}>
                  <Text style={s.foodChipText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* iHerb link */}
        <View style={s.iherbRow}>
          <Text style={s.iherbLabel}>Where to buy:</Text>
          <Link src="https://www.iherb.com/?rcode=NUTRIGENIUS" style={s.iherbLink}>
            iHerb.com — search "{supp.name}"
          </Link>
        </View>
      </View>
    </View>
  );
}

// ─── Supplement detail pages (portrait) ──────────────────────────────────────

function SupplementPages({
  supplements,
  recipient,
  date,
  startPage,
}: {
  supplements: SupplementRecommendation[];
  recipient: string;
  date: string;
  startPage: number;
}) {
  const pages = chunk(supplements, 3);
  return (
    <>
      {pages.map((pageSupps, pi) => (
        <Page key={pi} size="A4" style={s.pagePortrait}>
          <PageHeader recipient={recipient} date={date} />

          <View style={[s.pageTitleRow, { marginBottom: 8 }]}>
            <Text style={s.pageTitle}>Supplement Protocol</Text>
            <Text style={s.pageTitleSub}>
              {pi === 0
                ? `${supplements.length} supplement${supplements.length !== 1 ? "s" : ""} tailored to your health profile`
                : `Continued — ${pi * 3 + 1}–${Math.min((pi + 1) * 3, supplements.length)} of ${supplements.length}`}
            </Text>
          </View>

          {pageSupps.map((supp) => (
            <SupplementDetail key={supp.id} supp={supp} />
          ))}

          <PageFooter label={`Supplement Details · Page ${startPage + pi}`} />
        </Page>
      ))}
    </>
  );
}

// ─── Disclaimer + branding page ───────────────────────────────────────────────

function DisclaimerPage({
  blockedSupplements,
  recipient,
  date,
  pageNum,
}: {
  blockedSupplements: RecommendationResult["blockedSupplements"];
  recipient: string;
  date: string;
  pageNum: number;
}) {
  return (
    <Page size="A4" style={s.pagePortrait}>
      <PageHeader recipient={recipient} date={date} />

      <View style={[s.pageTitleRow, { marginBottom: 12 }]}>
        <Text style={s.pageTitle}>Important Information</Text>
      </View>

      <View style={s.disclaimerBox}>
        <Text style={s.disclaimerTitle}>⚕  Medical Disclaimer</Text>
        <Text style={s.disclaimerText}>
          This supplement plan is generated for informational and educational purposes only. It is NOT medical
          advice, and should NOT replace consultation with a qualified healthcare provider, physician, pharmacist,
          or registered dietitian. Before starting any new supplement regimen — particularly if you have existing
          health conditions, are pregnant or breastfeeding, or are taking prescription medications — please consult
          your doctor.{"\n\n"}
          Individual responses to supplements vary. NutriGenius is not liable for any adverse effects or outcomes
          resulting from use of this plan.
        </Text>
      </View>

      <View style={s.infoBox}>
        <Text style={s.infoLabel}>Affiliate Disclosure</Text>
        <Text style={s.infoText}>
          This plan contains links to iHerb.com. NutriGenius may earn a small commission when you purchase through
          these links at no additional cost to you. This does not influence our supplement recommendations — all
          suggestions are based solely on evidence and your health profile.
        </Text>
      </View>

      <View style={s.infoBox}>
        <Text style={s.infoLabel}>Reassessment Recommendation</Text>
        <Text style={s.infoText}>
          Supplement needs change as your health evolves. Retake your NutriGenius assessment in 3 months to update
          your protocol. If you have lab results retested after supplementation, entering the new values will
          generate a refined plan.
        </Text>
      </View>

      {blockedSupplements.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={[s.infoLabel, { color: "#991B1B", marginBottom: 6, fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.4 }]}>
            Safety-Filtered Supplements
          </Text>
          <Text style={[s.infoText, { marginBottom: 6 }]}>
            The following supplements were excluded from your protocol due to safety concerns:
          </Text>
          {blockedSupplements.map((b, i) => (
            <View key={i} style={s.blockedRow}>
              <View>
                <Text style={s.blockedName}>{b.name}</Text>
                <Text style={s.blockedReason}>{b.reason}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={s.divider} />

      <View style={s.brandCenter}>
        <View style={s.brandCenterRow}>
          <View style={s.brandCenterDot} />
          <Text style={s.brandCenterName}>NutriGenius</Text>
        </View>
        <Text style={s.brandCenterSub}>nutrigenius-iota.vercel.app</Text>
        <Text style={[s.brandCenterSub, { marginTop: 3 }]}>
          Clinician-Designed · Evidence-Based · Safety-Checked
        </Text>
        <Text style={[s.brandCenterSub, { marginTop: 8, color: MUTED }]}>
          Plan generated {date} · Valid for 90 days
        </Text>
      </View>

      <PageFooter label={`Page ${pageNum}`} />
    </Page>
  );
}

// ─── Main Document ────────────────────────────────────────────────────────────

interface PdfProps {
  result: RecommendationResult;
  userEmail: string | null;
  userName?: string | null;
}

export function NutriGeniusPDF({ result, userEmail, userName }: PdfProps) {
  const { supplements, schedule, blockedSupplements } = result;
  const today = formatDate(new Date());
  const recipient = userName ?? userEmail ?? "";

  const suppPageCount = Math.ceil(supplements.length / 3);
  // Page numbers: 1 = schedule, 2..N = supplements, N+1 = disclaimer
  const disclaimerPage = 1 + suppPageCount + 1;

  return (
    <Document
      title="NutriGenius Personalized Supplement Plan"
      author="NutriGenius"
      subject="Personalized Supplement Protocol"
    >
      {/* Page 1 — Landscape weekly schedule */}
      <SchedulePage
        schedule={schedule}
        supplements={supplements}
        recipient={recipient}
        date={today}
      />

      {/* Pages 2+ — Supplement details */}
      {supplements.length > 0 && (
        <SupplementPages
          supplements={supplements}
          recipient={recipient}
          date={today}
          startPage={2}
        />
      )}

      {/* Last page — Disclaimers */}
      <DisclaimerPage
        blockedSupplements={blockedSupplements}
        recipient={recipient}
        date={today}
        pageNum={disclaimerPage}
      />
    </Document>
  );
}
