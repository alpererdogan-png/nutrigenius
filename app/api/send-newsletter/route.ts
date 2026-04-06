import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildNewsletterHtml } from "@/lib/email-templates/newsletter";

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple rate limiting: ms delay between sends to stay within Resend limits
const SEND_DELAY_MS = 200;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  // Require a secret token to prevent unauthorized sends
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.NEWSLETTER_SECRET;
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      featured_article_slug,
      quick_tip_text,
      product_name,
      product_url,
      featured_article_title,
      featured_article_excerpt,
    } = body as {
      featured_article_slug: string;
      featured_article_title: string;
      featured_article_excerpt: string;
      quick_tip_text: string;
      product_name: string;
      product_url: string;
    };

    if (
      !featured_article_slug ||
      !quick_tip_text ||
      !product_name ||
      !product_url ||
      !featured_article_title ||
      !featured_article_excerpt
    ) {
      return NextResponse.json(
        { error: "Missing required fields: featured_article_slug, featured_article_title, featured_article_excerpt, quick_tip_text, product_name, product_url" },
        { status: 400 }
      );
    }

    // Fetch subscribed newsletter users (service role bypasses RLS)
    const { data: subscribers, error: dbError } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("email")
      .eq("newsletter_opt_in", true)
      .or("subscribed.is.null,subscribed.eq.true");

    if (dbError) {
      console.error("[send-newsletter] Supabase error:", dbError);
      return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, sent: 0, failed: 0, message: "No subscribers found" });
    }

    let sent = 0;
    let failed = 0;
    const errors: { email: string; error: string }[] = [];

    for (const subscriber of subscribers) {
      try {
        const html = buildNewsletterHtml({
          featuredArticleTitle: featured_article_title,
          featuredArticleExcerpt: featured_article_excerpt,
          featuredArticleSlug: featured_article_slug,
          quickTipText: quick_tip_text,
          productName: product_name,
          productUrl: product_url,
          subscriberEmail: subscriber.email,
        });

        const { error } = await resend.emails.send({
          from: "NutriGenius <noreply@clareohealth.co>",
          to: [subscriber.email],
          subject: `Your Supplement Intelligence Update 🌿`,
          html,
        });

        if (error) {
          console.error(`[send-newsletter] Failed for ${subscriber.email}:`, error);
          errors.push({ email: subscriber.email, error: error.message });
          failed++;
        } else {
          sent++;
        }
      } catch (err) {
        console.error(`[send-newsletter] Unexpected error for ${subscriber.email}:`, err);
        errors.push({
          email: subscriber.email,
          error: err instanceof Error ? err.message : "Unknown error",
        });
        failed++;
      }

      // Rate-limit delay between sends
      await sleep(SEND_DELAY_MS);
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: subscribers.length,
      ...(errors.length > 0 && { errors }),
    });
  } catch (err) {
    console.error("[send-newsletter] Unexpected error:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
