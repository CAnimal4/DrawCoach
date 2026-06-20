const FEEDBACK_RECIPIENT = "clarkbythebay@gmail.com";
const FEEDBACK_SUBJECT = "DrawCoach feedback";

type FeedbackDraftInput = {
  feedback: string;
  replyEmail?: string;
  pageUrl?: string;
  userAgent?: string;
  viewport?: string;
  timestamp?: string;
};

function sanitizeField(value: string | undefined, maxLength: number) {
  return (value ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
    .replace(/\b(api[_-]?key|token|secret|password)\s*[:=]\s*[^\s]+/gi, "$1=[redacted]")
    .replace(/AIza[0-9A-Za-z_-]{20,}/g, "[redacted-key]")
    .trim()
    .slice(0, maxLength);
}

export function buildFeedbackMailto(input: FeedbackDraftInput) {
  const feedback = sanitizeField(input.feedback, 1_000);
  const replyEmail = sanitizeField(input.replyEmail, 120).replace(/[\r\n]/g, " ");
  const body = [
    "DrawCoach feedback",
    "",
    `App: DrawCoach`,
    `Build: Web MVP`,
    `Page: ${sanitizeField(input.pageUrl, 160) || "Unknown"}`,
    `Time: ${sanitizeField(input.timestamp, 80) || "Unknown"}`,
    `Viewport: ${sanitizeField(input.viewport, 40) || "Unknown"}`,
    `Browser: ${sanitizeField(input.userAgent, 180) || "Unknown"}`,
    "",
    "Feedback:",
    feedback,
    "",
    "Reply email:",
    replyEmail || "Not provided",
    "",
    "This email draft was opened locally. The sender still needs to send it from their mail app.",
  ].join("\n");

  return `mailto:${FEEDBACK_RECIPIENT}?subject=${encodeURIComponent(
    FEEDBACK_SUBJECT,
  )}&body=${encodeURIComponent(body)}`;
}
