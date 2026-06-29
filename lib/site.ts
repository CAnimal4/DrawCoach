export const SITE_NAME = "DrawCoach";
export const SITE_URL = "https://drawcoach.vercel.app";
export const FALLBACK_SITE_URL = "https://canimal4.github.io/DrawCoach/";
export const OG_IMAGE_PATH = "/og-image.svg";
export const PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const DRAWCOACH_LOGO_PATH = `${PUBLIC_BASE_PATH}/drawcoach-logo.png`;

export const SITE_TITLE = "Free Drawing Feedback Tool | Improve Your Sketches Instantly";
export const SITE_DESCRIPTION =
  "Upload a drawing and get instant feedback on shading, composition, and detail to improve your art skills.";

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
    path: "/drawing-feedback",
    title: "Free Drawing Feedback Online - DrawCoach",
    description:
      "Use DrawCoach as a free drawing feedback and drawing critique tool to improve sketches online with clear, beginner-friendly next steps.",
    priority: 0.85,
  },
  {
    path: "/how-to-improve-drawings",
    title: "How to Improve Drawings - Shading, Proportion, and Composition",
    description:
      "Learn simple ways to improve drawings by fixing flat shading, bad proportions, and messy composition, then try DrawCoach for instant practice feedback.",
    priority: 0.8,
  },
  {
    path: "/why-does-my-drawing-look-flat",
    title: "Why Does My Drawing Look Flat? Simple Fixes for Sketches",
    description:
      "Learn why drawings look flat, how shading and line weight create depth, and how DrawCoach can suggest the next small fix for your sketch.",
    priority: 0.75,
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
