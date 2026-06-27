import type { AnalyzeResponse } from "@/lib/types";

export function buildResultShareText(result: AnalyzeResponse) {
  const tips = result.improvements
    .slice(0, 3)
    .map((improvement) => improvement.fix.trim())
    .filter(Boolean);

  return [
    "I improved my drawing using DrawCoach:",
    "",
    ...tips.map((tip) => `- ${tip}`),
    "",
    "Try it here: drawcoach.vercel.app",
  ].join("\n");
}
