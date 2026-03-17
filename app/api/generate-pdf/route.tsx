import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { NutriGeniusPDF } from "@/lib/generate-pdf";
import type { RecommendationResult } from "@/app/api/recommend/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequestBody {
  result: RecommendationResult;
  userEmail?: string | null;
  userName?: string | null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const { result, userEmail, userName } = body;

    if (!result || !result.supplements) {
      return new Response(JSON.stringify({ error: "Invalid result data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const buffer = await renderToBuffer(
      <NutriGeniusPDF result={result} userEmail={userEmail ?? null} userName={userName ?? null} />
    );

    const date = new Date().toISOString().slice(0, 10);
    const filename = `NutriGenius-Plan-${date}.pdf`;

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.byteLength.toString(),
      },
    });
  } catch (err) {
    console.error("[generate-pdf] Error:", err);
    return new Response(JSON.stringify({ error: "Failed to generate PDF" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
