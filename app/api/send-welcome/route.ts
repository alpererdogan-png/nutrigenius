import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildWelcomeHtml } from "@/lib/email-templates/welcome";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, supplements } = body as {
      email: string;
      supplements?: { name: string; doseDisplay?: string; whyRecommended?: string }[];
    };

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const top3 = (supplements ?? []).slice(0, 3);
    const html = buildWelcomeHtml(email, top3);

    const { data, error } = await resend.emails.send({
      from: "NutriGenius <noreply@clareohealth.co>",
      to: [email],
      subject: "Your personalized supplement plan is ready 🌿",
      html,
    });

    if (error) {
      console.error("[send-welcome] Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("[send-welcome] Unexpected error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
