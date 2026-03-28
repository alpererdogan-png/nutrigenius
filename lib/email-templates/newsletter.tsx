export type NewsletterProps = {
  featuredArticleTitle: string;
  featuredArticleExcerpt: string;
  featuredArticleSlug: string;
  quickTipText: string;
  productName: string;
  productUrl: string;
  subscriberEmail: string;
};

export function buildNewsletterHtml(props: NewsletterProps): string {
  const {
    featuredArticleTitle,
    featuredArticleExcerpt,
    featuredArticleSlug,
    quickTipText,
    productName,
    productUrl,
    subscriberEmail,
  } = props;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nutrigenius.app";
  const articleUrl = `${siteUrl}/blog/${featuredArticleSlug}`;
  const unsubUrl = `${siteUrl}/unsubscribe?em=${encodeURIComponent(subscriberEmail)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Supplement Intelligence Update</title>
</head>
<body style="margin:0; padding:0; background:#F4F7FA; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table cellpadding="0" cellspacing="0" width="100%" style="background:#F4F7FA; padding:32px 16px;">
    <tr>
      <td align="center">

        <table cellpadding="0" cellspacing="0" width="600" style="max-width:600px; width:100%; background:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- ── HEADER ─────────────────────────────────────────────── -->
          <tr>
            <td style="background:linear-gradient(135deg,#00685f 0%,#005249 100%); padding:28px 40px; text-align:center;">
              <table cellpadding="0" cellspacing="0" align="center" style="margin-bottom:16px;">
                <tr>
                  <td style="
                    width:40px; height:40px; border-radius:10px;
                    background:rgba(255,255,255,0.2);
                    text-align:center; vertical-align:middle;
                    font-size:20px; line-height:40px;
                  ">🌿</td>
                  <td style="padding-left:10px;">
                    <span style="font-size:20px; font-weight:700; color:#FFFFFF; letter-spacing:-0.5px;">
                      Nutri<span style="color:#99F6E4;">Genius</span>
                    </span>
                  </td>
                </tr>
              </table>
              <p style="margin:0; font-size:13px; font-weight:600; color:#CCFBF1; text-transform:uppercase; letter-spacing:1.5px;">
                Supplement Intelligence Update
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 40px;">

              <!-- ── FEATURED ARTICLE ──────────────────────────────── -->
              <table cellpadding="0" cellspacing="0" width="100%"
                style="border:1px solid #E8ECF1; border-radius:12px; overflow:hidden; margin-bottom:28px;">
                <tr>
                  <td style="background:linear-gradient(135deg,#F0FDFA,#CCFBF1); padding:20px 24px; border-bottom:1px solid #E8ECF1;">
                    <p style="margin:0 0 4px; font-size:11px; font-weight:700; color:#00685f; text-transform:uppercase; letter-spacing:1px;">
                      Featured Article
                    </p>
                    <h2 style="margin:0 0 10px; font-size:20px; font-weight:700; color:#1A2332; line-height:1.3;">
                      ${featuredArticleTitle}
                    </h2>
                    <p style="margin:0 0 16px; font-size:14px; color:#5A6578; line-height:1.6;">
                      ${featuredArticleExcerpt}
                    </p>
                    <a href="${articleUrl}"
                      style="
                        display:inline-block;
                        background:#00685f; color:#FFFFFF;
                        font-size:13px; font-weight:700;
                        text-decoration:none; padding:10px 22px;
                        border-radius:8px;
                      ">
                      Read Article →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- ── QUICK TIP ──────────────────────────────────────── -->
              <table cellpadding="0" cellspacing="0" width="100%"
                style="background:#FFFBEB; border:1px solid #FCD34D; border-radius:12px; padding:20px 24px; margin-bottom:28px;">
                <tr>
                  <td>
                    <p style="margin:0 0 8px; font-size:11px; font-weight:700; color:#B45309; text-transform:uppercase; letter-spacing:1px;">
                      💡 Quick Tip
                    </p>
                    <p style="margin:0; font-size:14px; color:#92400E; line-height:1.6;">
                      ${quickTipText}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- ── PRODUCT SPOTLIGHT ──────────────────────────────── -->
              <table cellpadding="0" cellspacing="0" width="100%"
                style="border:1px solid #E8ECF1; border-radius:12px; overflow:hidden; margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px; font-size:11px; font-weight:700; color:#5A6578; text-transform:uppercase; letter-spacing:1px;">
                      ⭐ Product Spotlight
                    </p>
                    <h3 style="margin:8px 0 10px; font-size:17px; font-weight:700; color:#1A2332;">
                      ${productName}
                    </h3>
                    <p style="margin:0 0 16px; font-size:13px; color:#5A6578; line-height:1.5;">
                      This month's editor pick — rigorously reviewed for quality, purity, and bioavailability.
                    </p>
                    <a href="${productUrl}"
                      style="
                        display:inline-block;
                        background:#F8FAFC; border:1px solid #E8ECF1; color:#1A2332;
                        font-size:13px; font-weight:600;
                        text-decoration:none; padding:10px 22px;
                        border-radius:8px;
                      ">
                      View on iHerb →
                    </a>
                    <p style="margin:10px 0 0; font-size:11px; color:#B0B8C4;">
                      Affiliate disclosure: We may earn a small commission if you purchase through this link.
                      This doesn't affect the price you pay or our recommendations.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- ── PROTOCOL REMINDER ──────────────────────────────── -->
              <table cellpadding="0" cellspacing="0" width="100%"
                style="background:#F0FDFA; border:1px solid #99F6E4; border-radius:12px; padding:16px 24px; margin-bottom:28px;">
                <tr>
                  <td>
                    <p style="margin:0 0 6px; font-size:14px; font-weight:600; color:#005249;">
                      🔄 Haven't checked your plan recently?
                    </p>
                    <p style="margin:0 0 12px; font-size:13px; color:#00685f; line-height:1.5;">
                      Your body changes — so should your supplement protocol.
                      Update your assessment to get the most accurate recommendations.
                    </p>
                    <a href="${siteUrl}/quiz"
                      style="font-size:13px; font-weight:700; color:#00685f; text-decoration:none;">
                      Update Your Plan →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- ── LAB TESTING PROMPT ─────────────────────────────── -->
              <table cellpadding="0" cellspacing="0" width="100%"
                style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:12px; padding:16px 24px; margin-bottom:12px;">
                <tr>
                  <td>
                    <p style="margin:0 0 6px; font-size:14px; font-weight:600; color:#1D4ED8;">
                      🧪 Improve Your Recommendations with Lab Data
                    </p>
                    <p style="margin:0 0 12px; font-size:13px; color:#2563EB; line-height:1.5;">
                      A simple blood test (Vitamin D, B12, Iron, Omega-3 Index) can significantly
                      improve the accuracy of your personalized supplement protocol.
                    </p>
                    <a href="${siteUrl}/quiz"
                      style="font-size:13px; font-weight:700; color:#1D4ED8; text-decoration:none;">
                      Add Lab Results to Your Profile →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── FOOTER ─────────────────────────────────────────────── -->
          <tr>
            <td style="background:#F8FAFC; border-top:1px solid #E8ECF1; padding:24px 40px; text-align:center;">
              <p style="margin:0 0 12px;">
                <a href="${siteUrl}" style="color:#00685f; text-decoration:none; font-weight:600; font-size:14px;">NutriGenius</a>
                <span style="color:#CBD5E1; padding:0 8px;">·</span>
                <a href="${siteUrl}/blog" style="color:#5A6578; text-decoration:none; font-size:13px;">Blog</a>
                <span style="color:#CBD5E1; padding:0 8px;">·</span>
                <a href="${siteUrl}/quiz" style="color:#5A6578; text-decoration:none; font-size:13px;">Update Plan</a>
              </p>
              <p style="margin:0 0 6px; font-size:12px; color:#8896A8; line-height:1.5;">
                Affiliate disclosure: Some links in this email may earn us a small commission
                at no extra cost to you. We only recommend products we believe in.
              </p>
              <p style="margin:0 0 8px; font-size:12px; color:#8896A8;">
                ⚠️ Supplement information is for educational purposes only. Always consult your healthcare provider.
              </p>
              <p style="margin:0; font-size:12px;">
                <a href="${unsubUrl}" style="color:#B0B8C4; text-decoration:underline;">Unsubscribe</a>
                <span style="color:#CBD5E1; padding:0 6px;">·</span>
                <span style="color:#B0B8C4;">© ${new Date().getFullYear()} NutriGenius. All rights reserved.</span>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}
