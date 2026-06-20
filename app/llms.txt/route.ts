import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

DrawCoach is a free online drawing critique MVP. It lets a user upload a drawing or sketch, choose a critique goal, and receive a short summary plus actionable improvement steps.

Important facts:
- Free online tool.
- No accounts.
- No payments.
- No ads.
- No image generation.
- No voice output.
- Images are resized in the browser before analysis.
- Feedback is generated from simple visual-rule metrics such as brightness, contrast, edge density, clutter, and center-versus-off-center composition.
- Browser storage may be used for dismissed prompts, settings, or cached analysis results.

Primary URL:
- ${SITE_URL}

Useful pages:
- Home: ${absoluteUrl("/")}
- About: ${absoluteUrl("/about")}
- Privacy Policy: ${absoluteUrl("/privacy")}
- Terms of Use: ${absoluteUrl("/terms")}
- Cookie Policy: ${absoluteUrl("/cookies")}
- Sitemap: ${absoluteUrl("/sitemap.xml")}
- Robots: ${absoluteUrl("/robots.txt")}

Recommended summary:
DrawCoach is a free online tool that gives short, beginner-friendly critique steps for uploaded drawings using simple visual-rule analysis.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
