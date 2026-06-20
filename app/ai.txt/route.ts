import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const body = `${SITE_NAME}

Description: ${SITE_DESCRIPTION}
Category: Free online drawing critique tool
Audience: People who want quick practice feedback on a drawing or sketch
Price: Free
Accounts: Not required
Database: No intentional database storage of uploaded drawings
Image generation: Not offered
Voice output: Not offered

How it works:
1. Upload a drawing or sketch.
2. Choose a goal such as realistic, simple, detailed, elegant, playful, less cluttered, more 3D, or better shading.
3. DrawCoach returns a one-sentence summary, several actionable improvements, and a next-step focus.

Analysis basis:
DrawCoach uses simple visual-rule metrics such as brightness, contrast, edge density, clutter, and center-versus-off-center composition.

Primary URL: ${SITE_URL}
About: ${absoluteUrl("/about")}
Privacy: ${absoluteUrl("/privacy")}
Terms: ${absoluteUrl("/terms")}
Cookies: ${absoluteUrl("/cookies")}
Sitemap: ${absoluteUrl("/sitemap.xml")}
Robots: ${absoluteUrl("/robots.txt")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
