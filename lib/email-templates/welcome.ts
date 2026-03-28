export type WelcomeSupplementSummary = {
  name: string;
  doseDisplay?: string;
  whyRecommended?: string;
};

export function buildWelcomeHtml(
  email: string,
  supplements: WelcomeSupplementSummary[]
): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nutrigenius.app";
  const unsubUrl = `${siteUrl}/unsubscribe?em=${encodeURIComponent(email)}`;

  const supplementRows = supplements
    .slice(0, 3)
    .map(
      (s, i) => `
    <tr>
      <td style="padding:12px 0; border-bottom:1px solid #E8ECF1;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="32" valign="top" style="padding-right:12px;">
              <div style="
                width:28px; height:28px; border-radius:50%;
                background:linear-gradient(135deg,#00685f,#005249);
                display:flex; align-items:center; justify-content:center;
                font-size:13px; font-weight:700; color:#fff;
                line-height:28px; text-align:center;
              ">${i + 1}</div>
            </td>
            <td valign="top">
              <p style="margin:0 0 2px; font-size:15px; font-weight:600; color:#1A2332;">${s.name}</p>
              ${s.doseDisplay ? `<p style="margin:0; font-size:12px; color:#00685f;">${s.doseDisplay}</p>` : ""}
              ${s.whyRecommended ? `<p style="margin:4px 0 0; font-size:13px; color:#5A6578; line-height:1.5;">${s.whyRecommended}</p>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your NutriGenius Plan Is Ready</title>
</head>
<body style="margin:0; padding:0; background:#F4F7FA; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <!-- Outer wrapper -->
  <table cellpadding="0" cellspacing="0" width="100%" style="background:#F4F7FA; padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- Email card -->
        <table cellpadding="0" cellspacing="0" width="600" style="max-width:600px; width:100%; background:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header gradient -->
          <tr>
            <td style="background:linear-gradient(135deg,#00685f 0%,#005249 100%); padding:32px 40px; text-align:center;">
              <!-- Logo -->
              <table cellpadding="0" cellspacing="0" align="center" style="margin-bottom:20px;">
                <tr>
                  <td style="
                    width:44px; height:44px; border-radius:12px;
                    background:rgba(255,255,255,0.2);
                    text-align:center; vertical-align:middle;
                    font-size:22px; line-height:44px;
                  ">🌿</td>
                  <td style="padding-left:10px;">
                    <span style="font-size:22px; font-weight:700; color:#FFFFFF; letter-spacing:-0.5px;">
                      Nutri<span style="color:#99F6E4;">Genius</span>
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="margin:0 0 8px; font-size:26px; font-weight:700; color:#FFFFFF; line-height:1.3;">
                Your Personalized Plan Is Ready!
              </h1>
              <p style="margin:0; font-size:15px; color:#CCFBF1; line-height:1.5;">
                Welcome to NutriGenius — science-backed supplement recommendations, personalized for you.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">

              <!-- Intro -->
              <p style="margin:0 0 24px; font-size:15px; color:#5A6578; line-height:1.6;">
                Hi there! We've analyzed your health profile and built a supplement protocol
                designed specifically for your body, goals, and lifestyle.
                Here's a preview of what we found for you:
              </p>

              <!-- Top supplements heading -->
              <h2 style="margin:0 0 16px; font-size:17px; font-weight:700; color:#1A2332;">
                Your Top Recommended Supplements
              </h2>

              <!-- Supplements list -->
              ${
                supplements.length > 0
                  ? `<table cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid #E8ECF1;">
                  <tbody>${supplementRows}</tbody>
                </table>`
                  : `<p style="font-size:14px; color:#8896A8; font-style:italic;">
                  View your full recommendations on the results page.
                </p>`
              }

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin:28px 0;">
                <tr>
                  <td align="center">
                    <a href="${siteUrl}/results"
                      style="
                        display:inline-block;
                        background:linear-gradient(135deg,#00685f,#005249);
                        color:#FFFFFF; font-size:15px; font-weight:700;
                        text-decoration:none; padding:14px 36px;
                        border-radius:12px; letter-spacing:0.2px;
                        box-shadow:0 4px 14px rgba(13,148,136,0.35);
                      ">
                      View Your Full Plan →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Schedule prompt -->
              <table cellpadding="0" cellspacing="0" width="100%"
                style="background:#F0FDFA; border:1px solid #99F6E4; border-radius:12px; padding:16px 20px; margin-bottom:24px;">
                <tr>
                  <td style="width:36px; vertical-align:top; padding-right:12px; font-size:20px; line-height:1;">📅</td>
                  <td>
                    <p style="margin:0 0 4px; font-size:14px; font-weight:600; color:#005249;">
                      Download Your Weekly Schedule
                    </p>
                    <p style="margin:0; font-size:13px; color:#00685f;">
                      Get a printable PDF with your full supplement protocol and timing guide.
                      Click "Download PDF" on your results page.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Teaser -->
              <table cellpadding="0" cellspacing="0" width="100%"
                style="background:#F8FAFC; border:1px solid #E8ECF1; border-radius:12px; padding:16px 20px; margin-bottom:24px;">
                <tr>
                  <td style="width:36px; vertical-align:top; padding-right:12px; font-size:20px; line-height:1;">🔬</td>
                  <td>
                    <p style="margin:0 0 4px; font-size:14px; font-weight:600; color:#1A2332;">
                      Coming in 2 Weeks: Your First Health Insight Update
                    </p>
                    <p style="margin:0; font-size:13px; color:#5A6578;">
                      We'll send you the latest research on your recommended supplements,
                      plus tips to maximize your results. Stay tuned!
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Disclaimer -->
              <p style="margin:0; font-size:12px; color:#8896A8; line-height:1.6; padding:16px 0; border-top:1px solid #E8ECF1;">
                ⚠️ <strong>Medical Disclaimer:</strong> NutriGenius recommendations are for informational
                purposes only and do not constitute medical advice. Always consult a qualified healthcare
                provider before starting any supplement regimen.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC; border-top:1px solid #E8ECF1; padding:24px 40px; text-align:center;">
              <p style="margin:0 0 12px;">
                <a href="${siteUrl}" style="color:#00685f; text-decoration:none; font-weight:600; font-size:14px;">NutriGenius</a>
                <span style="color:#CBD5E1; padding:0 8px;">·</span>
                <a href="${siteUrl}/blog" style="color:#5A6578; text-decoration:none; font-size:13px;">Blog</a>
                <span style="color:#CBD5E1; padding:0 8px;">·</span>
                <a href="${siteUrl}/quiz" style="color:#5A6578; text-decoration:none; font-size:13px;">Retake Quiz</a>
              </p>
              <p style="margin:0 0 8px; font-size:12px; color:#8896A8;">
                You're receiving this because you requested a personalized supplement plan.
              </p>
              <p style="margin:0; font-size:12px;">
                <a href="${unsubUrl}" style="color:#B0B8C4; text-decoration:underline;">Unsubscribe</a>
                <span style="color:#CBD5E1; padding:0 6px;">·</span>
                <span style="color:#B0B8C4;">© ${new Date().getFullYear()} NutriGenius</span>
              </p>
            </td>
          </tr>

        </table>
        <!-- /Email card -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}
