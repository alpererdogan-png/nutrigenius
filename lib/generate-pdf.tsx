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

// ─── Styles ───────────────────────────────────────────────────────────────────

const TEAL  = "#0D9488";
const DARK  = "#1A2332";
const MID   = "#5A6578";
const LIGHT = "#8896A8";
const MUTED = "#B0BAC9";
const BORDER = "#E8ECF1";
const BG    = "#F8FAFC";
const WHITE = "#FFFFFF";

const EVIDENCE_COLORS: Record<string, string> = {
  Strong:      "#16A34A",
  Moderate:    "#2563EB",
  Emerging:    "#D97706",
  Traditional: "#6B7280",
};

const s = StyleSheet.create({
  // Pages
  page: { backgroundColor: WHITE, paddingHorizontal: 40, paddingVertical: 40, fontFamily: "Helvetica" },
  coverPage: { backgroundColor: WHITE, paddingHorizontal: 0, paddingVertical: 0, fontFamily: "Helvetica" },

  // Cover
  coverTop: { backgroundColor: TEAL, paddingHorizontal: 50, paddingTop: 70, paddingBottom: 50 },
  coverLogoRow: { flexDirection: "row", alignItems: "center", marginBottom: 60 },
  coverLogoDot: { width: 10, height: 10, backgroundColor: WHITE, borderRadius: 5, marginRight: 8 },
  coverLogoText: { fontSize: 14, color: WHITE, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  coverTitle: { fontSize: 28, color: WHITE, fontFamily: "Helvetica-Bold", lineHeight: 1.25, marginBottom: 10 },
  coverSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 6 },
  coverTagline: { fontSize: 9, color: "rgba(255,255,255,0.6)", letterSpacing: 0.5 },
  coverBottom: { paddingHorizontal: 50, paddingTop: 36 },
  coverMeta: { fontSize: 10, color: MID, marginBottom: 5 },
  coverMetaValue: { fontSize: 10, color: DARK, fontFamily: "Helvetica-Bold" },
  coverDivider: { height: 1, backgroundColor: BORDER, marginVertical: 20 },
  coverPill: {
    backgroundColor: "#F0FDFA", borderWidth: 1, borderColor: "#99F6E4",
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
    alignSelf: "flex-start",
  },
  coverPillText: { fontSize: 9, color: TEAL, fontFamily: "Helvetica-Bold" },

  // Section headings
  pageTitle: { fontSize: 18, color: DARK, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  pageSubtitle: { fontSize: 10, color: MID, marginBottom: 20 },
  sectionHeading: { fontSize: 12, color: DARK, fontFamily: "Helvetica-Bold", marginBottom: 10, marginTop: 18 },

  // Summary cards
  summaryGrid: { flexDirection: "row", gap: 10, marginBottom: 20 },
  summaryCard: {
    flex: 1, backgroundColor: BG, borderRadius: 8, borderWidth: 1, borderColor: BORDER,
    padding: 14, alignItems: "center",
  },
  summaryNum: { fontSize: 26, color: TEAL, fontFamily: "Helvetica-Bold" },
  summaryLabel: { fontSize: 8, color: MID, marginTop: 3, textAlign: "center" },

  // Focus area pills
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 },
  pill: {
    backgroundColor: "#F0FDFA", borderWidth: 1, borderColor: "#99F6E4",
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3,
  },
  pillText: { fontSize: 8, color: TEAL },

  // Supplement card
  suppCard: {
    backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER,
    borderRadius: 10, padding: 16, marginBottom: 14,
  },
  suppHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  suppName: { fontSize: 13, color: DARK, fontFamily: "Helvetica-Bold", flex: 1 },
  suppForm: { fontSize: 9, color: MID, marginTop: 2 },
  evidenceBadge: {
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 4,
  },
  evidenceDot: { width: 5, height: 5, borderRadius: 3 },
  evidenceText: { fontSize: 8, fontFamily: "Helvetica-Bold" },

  // Dose/timing chips
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  chip: {
    backgroundColor: "#F0FDFA", borderWidth: 1, borderColor: "#99F6E4",
    borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3,
  },
  chipGray: {
    backgroundColor: BG, borderWidth: 1, borderColor: BORDER,
    borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3,
  },
  chipText: { fontSize: 8, color: "#0F766E" },
  chipTextGray: { fontSize: 8, color: MID },

  // Why recommended
  whyBox: {
    backgroundColor: BG, borderRadius: 8, padding: 10, marginBottom: 8,
  },
  whyLabel: { fontSize: 8, color: TEAL, fontFamily: "Helvetica-Bold", marginBottom: 4, textTransform: "uppercase" },
  whyText: { fontSize: 9, color: MID, lineHeight: 1.5 },

  // Warning box
  warnBox: {
    backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FCD34D",
    borderRadius: 6, padding: 8, marginBottom: 6, flexDirection: "row", gap: 6,
  },
  warnText: { fontSize: 8, color: "#92400E", flex: 1, lineHeight: 1.4 },

  // Food sources
  foodRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 8 },
  foodChip: {
    backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#BBF7D0",
    borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2,
  },
  foodChipText: { fontSize: 7, color: "#15803D" },

  // iHerb link
  linkRow: {
    marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: BORDER,
    flexDirection: "row", alignItems: "center", gap: 6,
  },
  linkLabel: { fontSize: 8, color: LIGHT },
  linkText: { fontSize: 8, color: TEAL },

  // Schedule
  scheduleTable: { borderWidth: 1, borderColor: BORDER, borderRadius: 8, overflow: "hidden" },
  scheduleHeaderRow: { flexDirection: "row", backgroundColor: BG, borderBottomWidth: 1, borderBottomColor: BORDER },
  scheduleHeaderCell: { flex: 1, padding: 6, alignItems: "center" },
  scheduleHeaderText: { fontSize: 7, color: DARK, fontFamily: "Helvetica-Bold" },
  scheduleRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  scheduleSlotCell: { width: 55, padding: 6, borderRightWidth: 1, borderRightColor: BORDER },
  scheduleCell: { flex: 1, padding: 6, borderRightWidth: 1, borderRightColor: BORDER, minHeight: 30 },
  scheduleSlotLabel: { fontSize: 7, fontFamily: "Helvetica-Bold" },
  scheduleSuppName: { fontSize: 6.5, color: DARK, marginBottom: 1 },
  scheduleDose: { fontSize: 6, color: LIGHT },

  // Blocked supplements
  blockedRow: {
    flexDirection: "row", backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FCA5A5",
    borderRadius: 6, padding: 8, marginBottom: 6, gap: 6,
  },
  blockedName: { fontSize: 9, color: "#991B1B", fontFamily: "Helvetica-Bold" },
  blockedReason: { fontSize: 8, color: "#B91C1C", marginTop: 2 },

  // Divider
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 12 },

  // Disclaimer page
  disclaimerBox: {
    backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FCD34D",
    borderRadius: 10, padding: 16, marginBottom: 20,
  },
  disclaimerTitle: { fontSize: 11, color: "#92400E", fontFamily: "Helvetica-Bold", marginBottom: 6 },
  disclaimerText: { fontSize: 9, color: "#A16207", lineHeight: 1.6 },

  // Footer
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 16, borderTopWidth: 1, borderTopColor: BORDER },
  footerText: { fontSize: 8, color: MUTED },
  footerBrand: { fontSize: 8, color: TEAL, fontFamily: "Helvetica-Bold" },

  // Generic text
  bodyText: { fontSize: 9, color: MID, lineHeight: 1.5 },
  labelText: { fontSize: 8, color: LIGHT, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// Split supplements into pages: 2 per page so they don't crowd
function chunkSupplements(arr: SupplementRecommendation[], size = 2): SupplementRecommendation[][] {
  const chunks: SupplementRecommendation[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_FULL  = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOTS      = ["Morning", "Midday", "Evening"] as const;

const SLOT_COLORS: Record<string, string> = { Morning: "#D97706", Midday: "#2563EB", Evening: "#4F46E5" };

// ─── Sub-components ───────────────────────────────────────────────────────────

function EvidenceBadge({ rating }: { rating: string }) {
  const color = EVIDENCE_COLORS[rating] ?? EVIDENCE_COLORS.Traditional;
  const bgMap: Record<string, string> = {
    Strong: "#F0FDF4", Moderate: "#EFF6FF", Emerging: "#FFFBEB", Traditional: "#F9FAFB",
  };
  const borderMap: Record<string, string> = {
    Strong: "#BBF7D0", Moderate: "#BFDBFE", Emerging: "#FDE68A", Traditional: "#E5E7EB",
  };
  return (
    <View style={[s.evidenceBadge, { backgroundColor: bgMap[rating] ?? bgMap.Traditional, borderColor: borderMap[rating] ?? borderMap.Traditional }]}>
      <View style={[s.evidenceDot, { backgroundColor: color }]} />
      <Text style={[s.evidenceText, { color }]}>{rating} Evidence</Text>
    </View>
  );
}

function SupplementSection({ supp }: { supp: SupplementRecommendation }) {
  return (
    <View style={s.suppCard}>
      <View style={s.suppHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.suppName}>{supp.name}</Text>
          <Text style={s.suppForm}>{supp.form}</Text>
        </View>
        <EvidenceBadge rating={supp.evidenceRating} />
      </View>

      <View style={s.chipRow}>
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

      {supp.warnings.length > 0 && supp.warnings.map((w, i) => (
        <View key={i} style={s.warnBox}>
          <Text style={{ fontSize: 9, color: "#B45309" }}>⚠</Text>
          <Text style={s.warnText}>{w}</Text>
        </View>
      ))}

      <View style={s.whyBox}>
        <Text style={s.whyLabel}>Why recommended</Text>
        <Text style={s.whyText}>{supp.whyRecommended}</Text>
      </View>

      {supp.foodSources.length > 0 && (
        <View>
          <Text style={s.labelText}>Natural food sources</Text>
          <View style={s.foodRow}>
            {supp.foodSources.map((f) => (
              <View key={f} style={s.foodChip}>
                <Text style={s.foodChipText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={s.linkRow}>
        <Text style={s.linkLabel}>Where to buy:</Text>
        <Link src="https://www.iherb.com/?rcode=NUTRIGENIUS" style={s.linkText}>
          iHerb.com — search for {supp.name}
        </Link>
      </View>
    </View>
  );
}

// ─── Page Footer ──────────────────────────────────────────────────────────────

function PageFooter({ page, date }: { page: string; date: string }) {
  return (
    <View style={s.footer}>
      <Text style={s.footerText}>Generated {date}</Text>
      <Text style={s.footerBrand}>NutriGenius</Text>
      <Text style={s.footerText}>{page}</Text>
    </View>
  );
}

// ─── PDF Document ─────────────────────────────────────────────────────────────

interface PdfProps {
  result: RecommendationResult;
  userEmail: string | null;
  userName?: string | null;
}

export function NutriGeniusPDF({ result, userEmail, userName }: PdfProps) {
  const { supplements, schedule, focusAreas, blockedSupplements } = result;
  const today = formatDate(new Date());
  const suppChunks = chunkSupplements(supplements, 2);
  const recipient = userName ?? userEmail ?? "Your Supplement Plan";

  return (
    <Document
      title="NutriGenius Personalized Supplement Plan"
      author="NutriGenius"
      subject="Personalized Supplement Protocol"
    >

      {/* ── Page 1: Cover ── */}
      <Page size="A4" style={s.coverPage}>
        <View style={s.coverTop}>
          {/* Logo */}
          <View style={s.coverLogoRow}>
            <View style={s.coverLogoDot} />
            <Text style={s.coverLogoText}>NUTRIGENIUS</Text>
          </View>

          <Text style={s.coverTitle}>Your Personalized{"\n"}Supplement Plan</Text>
          <Text style={s.coverSubtitle}>Clinician-Designed · Evidence-Based · Safety-Checked</Text>
        </View>

        <View style={s.coverBottom}>
          {userEmail || userName ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={s.coverMeta}>Prepared for:</Text>
              <Text style={s.coverMetaValue}>{recipient}</Text>
            </View>
          ) : null}

          <Text style={s.coverMeta}>Date generated:</Text>
          <Text style={[s.coverMetaValue, { marginBottom: 20 }]}>{today}</Text>

          <View style={s.coverDivider} />

          <View style={s.summaryGrid}>
            <View style={s.summaryCard}>
              <Text style={s.summaryNum}>{supplements.length}</Text>
              <Text style={s.summaryLabel}>Supplements recommended</Text>
            </View>
            <View style={s.summaryCard}>
              <Text style={s.summaryNum}>
                {supplements.filter((s) => s.evidenceRating === "Strong" || s.evidenceRating === "Moderate").length}
              </Text>
              <Text style={s.summaryLabel}>Strong or Moderate evidence</Text>
            </View>
            <View style={s.summaryCard}>
              <Text style={s.summaryNum}>{blockedSupplements.length}</Text>
              <Text style={s.summaryLabel}>Safety-filtered out</Text>
            </View>
          </View>

          {focusAreas.length > 0 && (
            <View>
              <Text style={s.labelText}>Health goals addressed</Text>
              <View style={s.pillRow}>
                {focusAreas.map((area) => (
                  <View key={area} style={s.pill}>
                    <Text style={s.pillText}>{area}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={s.coverDivider} />

          <View style={s.coverPill}>
            <Text style={s.coverPillText}>nutrigenius-iota.vercel.app</Text>
          </View>
        </View>
      </Page>

      {/* ── Supplement Pages ── */}
      {suppChunks.map((chunk, ci) => (
        <Page key={ci} size="A4" style={s.page}>
          <Text style={s.pageTitle}>Your Supplement Protocol</Text>
          <Text style={s.pageSubtitle}>
            {ci === 0
              ? `${supplements.length} supplement${supplements.length !== 1 ? "s" : ""} selected based on your health profile`
              : `Continued — supplements ${ci * 2 + 1}–${Math.min((ci + 1) * 2, supplements.length)}`}
          </Text>

          {chunk.map((supp) => (
            <SupplementSection key={supp.id} supp={supp} />
          ))}

          <PageFooter page={`Page ${ci + 2}`} date={today} />
        </Page>
      ))}

      {/* ── Weekly Schedule Page ── */}
      {supplements.length > 0 && (
        <Page size="A4" style={{ ...s.page, paddingTop: 32 }}>
          <Text style={s.pageTitle}>Weekly Schedule</Text>
          <Text style={s.pageSubtitle}>Your supplement timing plan for each day of the week</Text>

          {/* Slot legend */}
          <View style={[s.chipRow, { marginBottom: 14 }]}>
            {SLOTS.map((slot) => (
              <View key={slot} style={[s.chip, { backgroundColor: "#F8FAFC", borderColor: BORDER }]}>
                <Text style={[s.chipText, { color: SLOT_COLORS[slot] }]}>● {slot}</Text>
              </View>
            ))}
          </View>

          {/* Table */}
          <View style={s.scheduleTable}>
            {/* Header */}
            <View style={s.scheduleHeaderRow}>
              <View style={[s.scheduleSlotCell, { borderRightWidth: 1, borderRightColor: BORDER }]}>
                <Text style={s.scheduleHeaderText}>Time</Text>
              </View>
              {DAYS_SHORT.map((d) => (
                <View key={d} style={s.scheduleHeaderCell}>
                  <Text style={s.scheduleHeaderText}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Rows */}
            {SLOTS.map((slot, si) => (
              <View key={slot} style={[s.scheduleRow, si === SLOTS.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                <View style={s.scheduleSlotCell}>
                  <Text style={[s.scheduleSlotLabel, { color: SLOT_COLORS[slot] }]}>{slot}</Text>
                </View>
                {DAYS_FULL.map((day, di) => {
                  const items = schedule[day]?.[slot] ?? [];
                  return (
                    <View key={day} style={[s.scheduleCell, di === 6 ? { borderRightWidth: 0 } : {}]}>
                      {items.length === 0
                        ? <Text style={{ fontSize: 7, color: "#CBD5E1" }}>—</Text>
                        : items.map((item) => (
                          <View key={item.supplementId}>
                            <Text style={s.scheduleSuppName}>{item.name}</Text>
                            <Text style={s.scheduleDose}>{item.dose}</Text>
                          </View>
                        ))
                      }
                    </View>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Timing notes */}
          <View style={{ marginTop: 16 }}>
            <Text style={s.labelText}>Timing notes</Text>
            {supplements.filter((sp) => sp.timing).map((sp) => (
              <View key={sp.id} style={{ flexDirection: "row", gap: 6, marginBottom: 4 }}>
                <Text style={{ fontSize: 8, color: TEAL, fontFamily: "Helvetica-Bold", width: 100 }}>{sp.name}:</Text>
                <Text style={{ fontSize: 8, color: MID, flex: 1 }}>{sp.timing}</Text>
              </View>
            ))}
          </View>

          {/* Blocked */}
          {blockedSupplements.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={s.sectionHeading}>Safety-Filtered Supplements</Text>
              <Text style={[s.bodyText, { marginBottom: 8 }]}>
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

          <PageFooter page={`Page ${suppChunks.length + 2}`} date={today} />
        </Page>
      )}

      {/* ── Final Page: Disclaimers ── */}
      <Page size="A4" style={s.page}>
        <Text style={s.pageTitle}>Important Information</Text>
        <View style={s.divider} />

        <View style={s.disclaimerBox}>
          <Text style={s.disclaimerTitle}>Medical Disclaimer</Text>
          <Text style={s.disclaimerText}>
            This supplement plan is generated for informational and educational purposes only. It is NOT medical advice,
            and should NOT replace consultation with a qualified healthcare provider, physician, pharmacist, or registered
            dietitian. Before starting any new supplement regimen, particularly if you have existing health conditions,
            are pregnant or breastfeeding, or are taking prescription medications, please consult your doctor.
            {"\n\n"}
            Supplement recommendations are based on general evidence and the information you provided. Individual
            responses to supplements vary. The evidence summaries reflect current research but nutrition science evolves —
            what is considered best practice today may change.
            {"\n\n"}
            NutriGenius is not liable for any adverse effects or outcomes resulting from use of this plan.
          </Text>
        </View>

        <View style={[s.whyBox, { marginBottom: 16 }]}>
          <Text style={s.whyLabel}>Affiliate Disclosure</Text>
          <Text style={s.whyText}>
            This plan contains links to iHerb.com. NutriGenius may earn a small commission when you purchase through
            these links, at no additional cost to you. This does not influence our supplement recommendations —
            all suggestions are based solely on evidence and your health profile.
          </Text>
        </View>

        <View style={[s.whyBox, { marginBottom: 16 }]}>
          <Text style={s.whyLabel}>Reassessment Recommendation</Text>
          <Text style={s.whyText}>
            Supplement needs change as your health evolves. We recommend retaking your NutriGenius assessment in
            3 months to update your protocol based on your progress. If you have lab results retested after
            supplementation, enter the new values for a refined plan.
          </Text>
        </View>

        <View style={s.divider} />

        <View style={{ alignItems: "center", paddingVertical: 20 }}>
          <View style={[s.coverLogoRow, { justifyContent: "center", marginBottom: 6 }]}>
            <View style={[s.coverLogoDot, { backgroundColor: TEAL }]} />
            <Text style={[s.coverLogoText, { color: TEAL }]}>NUTRIGENIUS</Text>
          </View>
          <Text style={[s.bodyText, { textAlign: "center" }]}>nutrigenius-iota.vercel.app</Text>
          <Text style={[s.bodyText, { textAlign: "center", marginTop: 4 }]}>
            Clinician-Designed · Evidence-Based · Safety-Checked
          </Text>
          <Text style={[s.bodyText, { textAlign: "center", marginTop: 12, color: MUTED }]}>
            Generated {today} · Plan valid for 90 days
          </Text>
        </View>

        <PageFooter page={`Page ${suppChunks.length + (supplements.length > 0 ? 3 : 2)}`} date={today} />
      </Page>

    </Document>
  );
}
