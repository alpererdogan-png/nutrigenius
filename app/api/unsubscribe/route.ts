import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ subscribed: false, unsubscribed_at: new Date().toISOString() })
      .eq("email", email.toLowerCase().trim());

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/unsubscribe]", err);
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ subscribed: true, unsubscribed_at: null })
      .eq("email", email.toLowerCase().trim());

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/resubscribe]", err);
    return NextResponse.json({ error: "Failed to resubscribe" }, { status: 500 });
  }
}
