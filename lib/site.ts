export const SITE_NAME = "DrawCoach";
export const SITE_URL = "https://drawcoach.vercel.app";
export const FALLBACK_SITE_URL = "https://canimal4.github.io/DrawCoach/";
export const OG_IMAGE_PATH = "/og-image.svg";

export const SITE_TITLE = "DrawCoach - Free Online Drawing Critique Tool";
export const SITE_DESCRIPTION =
  "DrawCoach is a free online tool that reviews an uploaded drawing with simple visual rules and returns short, beginner-friendly improvement steps.";

export const SITE_KEYWORDS = [
  "DrawCoach",
  "drawing critique",
  "free drawing feedback",
  "online drawing tool",
  "sketch feedback",
  "art critique",
  "drawing improvement",
  "beginner drawing help",
];

export const ROUTES = [
  {
    path: "/",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    priority: 1,
  },
  {
    path: "/about",
    title: "About DrawCoach - How the Free Drawing Critique Tool Works",
    description:
      "Learn what DrawCoach is, how it analyzes drawings, what it does with uploads, and what kinds of feedback the free online tool provides.",
    priority: 0.9,
  },
  {
    path: "/privacy",
    title: "Privacy Policy - DrawCoach",
    description:
      "Read how DrawCoach handles uploaded drawings, local browser storage, analysis data, and the no-account MVP privacy model.",
    priority: 0.5,
  },
  {
    path: "/terms",
    title: "Terms of Use - DrawCoach",
    description:
      "Read DrawCoach terms for using the free online drawing critique MVP, including educational-use limits and future product changes.",
    priority: 0.5,
  },
  {
    path: "/cookies",
    title: "Cookie Policy - DrawCoach",
    description:
      "Read DrawCoach cookie and browser storage details, including localStorage for settings, dismissal state, and cached analysis.",
    priority: 0.4,
  },
] as const;

export function absoluteUrl(path = "/") {
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  const hasFileExtension = /\.[a-z0-9]+$/i.test(withLeadingSlash);
  const normalizedPath =
    withLeadingSlash === "/" || hasFileExtension || withLeadingSlash.endsWith("/")
      ? withLeadingSlash
      : `${withLeadingSlash}/`;

  return new URL(normalizedPath, SITE_URL).toString();
}

export const OG_IMAGE_URL = absoluteUrl(OG_IMAGE_PATH);
