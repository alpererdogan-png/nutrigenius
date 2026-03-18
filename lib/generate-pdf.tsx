import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { RecommendationResult } from "@/app/api/recommend/route";

// ─── Palette ──────────────────────────────────────────────────────────────────

const TEAL       = "#0D9488";
const TEAL_TEXT  = "#0F766E";
const TEAL_LIGHT = "#E6F7F6";
const DARK       = "#1A2332";
const MID        = "#5A6578";
const LIGHT      = "#8896A8";
const BORDER     = "#D1E8E6";
const ALT_ROW    = "#F3F9F9";
const WHITE      = "#FFFFFF";

// ─── Layout constants ─────────────────────────────────────────────────────────
// A4 landscape usable area: ~786 × ~483pt (after 28pt padding on all sides)
// Left slot column: 68pt  →  7 day columns share remaining 718pt (~102.6pt each)

const SLOT_COL_W = 68;
const DAY_COL_W  = (786 - SLOT_COL_W) / 7; // ≈ 102.6

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    size: "A4",
    backgroundColor: WHITE,
    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 18,
    fontFamily: "Helvetica",
    flexDirection: "column",
  },

  // ── Top header bar ──────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: TEAL,
  },
  headerLeft: { gap: 2 },
  headerPrepared: { fontSize: 8, color: MID },
  headerPreparedValue: { fontSize: 8, color: DARK, fontFamily: "Helvetica-Bold" },
  headerDate: { fontSize: 7.5, color: LIGHT, marginTop: 1 },

  headerRight: { alignItems: "flex-end", gap: 2 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  brandDot: { width: 9, height: 9, backgroundColor: TEAL, borderRadius: 5 },
  brandText: { fontSize: 14, color: DARK, fontFamily: "Helvetica-Bold" },
  brandAccent: { fontSize: 14, color: TEAL, fontFamily: "Helvetica-Bold" },
  brandTagline: { fontSize: 7, color: LIGHT, textAlign: "right" },

  // ── Page title ──────────────────────────────────────────────────────────────
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 8,
  },
  title: { fontSize: 12, color: DARK, fontFamily: "Helvetica-Bold" },
  titleSub: { fontSize: 8, color: LIGHT },

  // ── Grid container (takes all remaining space) ──────────────────────────────
  grid: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    overflow: "hidden",
  },

  // ── Header row (day names) ──────────────────────────────────────────────────
  gridHeaderRow: {
    flexDirection: "row",
    backgroundColor: TEAL,
  },
  // Slot label corner cell (top-left)
  slotCornerCell: {
    width: SLOT_COL_W,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: "#0B8075",
    justifyContent: "center",
  },
  slotCornerText: { fontSize: 8, color: "rgba(255,255,255,0.7)", fontFamily: "Helvetica-Bold" },

  dayHeaderCell: {
    width: DAY_COL_W,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: "#0B8075",
    alignItems: "center",
    justifyContent: "center",
  },
  dayHeaderText: { fontSize: 9, color: WHITE, fontFamily: "Helvetica-Bold", letterSpacing: 0.3 },

  // ── Data rows ───────────────────────────────────────────────────────────────
  dataRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flex: 1,          // rows share remaining height equally
  },
  dataRowAlt: { backgroundColor: ALT_ROW },
  dataRowWhite: { backgroundColor: WHITE },

  // Left time-slot label cell (teal)
  slotLabelCell: {
    width: SLOT_COL_W,
    backgroundColor: TEAL,
    borderRightWidth: 1,
    borderRightColor: "#0B8075",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  slotLabelText: { fontSize: 9, color: WHITE, fontFamily: "Helvetica-Bold", letterSpacing: 0.2 },
  slotLabelSub: { fontSize: 6.5, color: "rgba(255,255,255,0.7)", marginTop: 2, textAlign: "center" },

  // Individual day cell inside a row
  dayCell: {
    width: DAY_COL_W,
    borderRightWidth: 1,
    borderRightColor: BORDER,
    paddingVertical: 7,
    paddingHorizontal: 7,
    justifyContent: "flex-start",
    gap: 3,
  },

  // A supplement entry within a cell
  suppEntry: { marginBottom: 3 },
  suppName: { fontSize: 8.5, color: DARK, fontFamily: "Helvetica-Bold", lineHeight: 1.25 },
  suppNote: { fontSize: 7, color: MID, lineHeight: 1.3, marginTop: 1 },

  // Bullet dot
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: TEAL,
    marginTop: 3.5,
    marginRight: 4,
    flexShrink: 0,
  },
  suppRow: { flexDirection: "row", alignItems: "flex-start" },
  suppContent: { flex: 1 },

  // Empty cell placeholder
  emptyCell: { fontSize: 8, color: "#D1D9E0" },

  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  footerText: { fontSize: 6.5, color: LIGHT, textAlign: "center", lineHeight: 1.5 },
});

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
] as const;

const SLOTS: { key: "Morning" | "Midday" | "Evening"; sub: string }[] = [
  { key: "Morning", sub: "Wake – 12pm"   },
  { key: "Midday",  sub: "12pm – 6pm"    },
  { key: "Evening", sub: "6pm – Bedtime" },
];

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// ─── PDF Document ─────────────────────────────────────────────────────────────

interface PdfProps {
  result: RecommendationResult;
  userEmail: string | null;
  userName?: string | null;
}

export function NutriGeniusPDF({ result, userEmail, userName }: PdfProps) {
  const { supplements, schedule } = result;
  const today = formatDate(new Date());
  const recipient = userName ?? userEmail ?? "";

  return (
    <Document
      title="NutriGenius Weekly Supplement Schedule"
      author="NutriGenius"
      subject="Weekly Supplement Chart"
    >
      <Page size="A4" orientation="landscape" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            {recipient ? (
              <>
                <Text style={s.headerPrepared}>Prepared for:</Text>
                <Text style={s.headerPreparedValue}>{recipient}</Text>
              </>
            ) : null}
            <Text style={s.headerDate}>Generated: {today}</Text>
          </View>

          <View style={s.headerRight}>
            <View style={s.brandRow}>
              <View style={s.brandDot} />
              <Text style={s.brandText}>
                Nutri<Text style={s.brandAccent}>Genius</Text>
              </Text>
            </View>
            <Text style={s.brandTagline}>
              {supplements.length} supplement{supplements.length !== 1 ? "s" : ""} · personalised protocol
            </Text>
          </View>
        </View>

        {/* ── Title ── */}
        <View style={s.titleRow}>
          <Text style={s.title}>Weekly Supplement Schedule</Text>
          <Text style={s.titleSub}>Print and keep on your fridge or medicine cabinet</Text>
        </View>

        {/* ── Grid ── */}
        <View style={s.grid}>

          {/* Day header row */}
          <View style={s.gridHeaderRow}>
            <View style={s.slotCornerCell}>
              <Text style={s.slotCornerText}>TIME</Text>
            </View>
            {DAYS.map((day, di) => (
              <View
                key={day}
                style={[
                  s.dayHeaderCell,
                  di === DAYS.length - 1 ? { borderRightWidth: 0 } : {},
                ]}
              >
                <Text style={s.dayHeaderText}>{day.slice(0, 3).toUpperCase()}</Text>
              </View>
            ))}
          </View>

          {/* Data rows — Morning / Midday / Evening */}
          {SLOTS.map(({ key: slot, sub }, si) => {
            const isAlt = si % 2 === 1;
            return (
              <View
                key={slot}
                style={[
                  s.dataRow,
                  isAlt ? s.dataRowAlt : s.dataRowWhite,
                  si === SLOTS.length - 1 ? { borderBottomWidth: 0 } : {},
                ]}
              >
                {/* Time-slot label (teal) */}
                <View style={s.slotLabelCell}>
                  <Text style={s.slotLabelText}>{slot.toUpperCase()}</Text>
                  <Text style={s.slotLabelSub}>{sub}</Text>
                </View>

                {/* One cell per day */}
                {DAYS.map((day, di) => {
                  const items = schedule[day]?.[slot] ?? [];
                  return (
                    <View
                      key={day}
                      style={[
                        s.dayCell,
                        di === DAYS.length - 1 ? { borderRightWidth: 0 } : {},
                      ]}
                    >
                      {items.length === 0 ? (
                        <Text style={s.emptyCell}>—</Text>
                      ) : (
                        items.map((item) => (
                          <View key={item.supplementId} style={s.suppRow}>
                            <View style={s.bulletDot} />
                            <View style={s.suppContent}>
                              <Text style={s.suppName}>{item.name}</Text>
                              {item.note ? (
                                <Text style={s.suppNote}>{item.note}</Text>
                              ) : null}
                            </View>
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

        {/* ── Footer ── */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            This is not medical advice. Consult your healthcare provider before starting any supplement regimen.  |  NutriGenius — nutrigenius.co
          </Text>
        </View>

      </Page>
    </Document>
  );
}
