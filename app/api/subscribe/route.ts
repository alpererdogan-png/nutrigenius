import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * POST /api/subscribe
 *
 * Server-side newsletter signup. Uses the Supabase service role key so
 * RLS does not block the upsert (the anon role has INSERT-only on
 * `newsletter_subscribers` — upserts that hit the conflict/UPDATE path
 * from the client would 403).
 *
 * Body: { email: string, newsletter_opt_in?: boolean,
 *         pdf_opt_in?: boolean, calendar_opt_in?: boolean }
 *
 * Uses `ignoreDuplicates: true` so a repeat subscribe is a silent no-op
 * rather than overwriting existing preferences. Explicit preference
 * changes belong in a dedicated /api/preferences route, not here.
 */
export async function POST(req: NextRequest) {
  let payload: {
    email?: unknown;
    newsletter_opt_in?: unknown;
    pdf_opt_in?: unknown;
    calendar_opt_in?: unknown;
  };

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawEmail = payload.email;
  if (typeof rawEmail !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const email = rawEmail.trim().toLowerCase();
  // Pragmatic email sanity check — mirrors the existing client-side
  // validation. Real verification happens via the welcome email.
  if (!email || !email.includes("@") || email.length > 254) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const newsletter_opt_in =
    typeof payload.newsletter_opt_in === "boolean" ? payload.newsletter_opt_in : true;
  const pdf_opt_in =
    typeof payload.pdf_opt_in === "boolean" ? payload.pdf_opt_in : false;
  const calendar_opt_in =
    typeof payload.calendar_opt_in === "boolean" ? payload.calendar_opt_in : false;

  try {
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert(
        {
          email,
          newsletter_opt_in,
          pdf_opt_in,
          calendar_opt_in,
          created_at: new Date().toISOString(),
        },
        { onConflict: "email", ignoreDuplicates: true }
      );

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/subscribe]", err);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
