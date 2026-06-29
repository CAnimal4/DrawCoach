import type { AnalyzeResponse } from "@/lib/types";

export const RESULT_SHARE_URL = "drawcoach.vercel.app";

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
      `Try it here: ${RESULT_SHARE_URL}`,
    ].join("\n");
}
