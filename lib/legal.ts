export type Policy = {
  title: string;
  updated: string;
  summary: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
};

export const policies = {
  privacy: {
    title: "Privacy Policy",
    updated: "June 20, 2026",
    summary:
      "DrawCoach is a lightweight drawing feedback tool with no accounts and no intentional storage of uploaded drawings.",
    sections: [
      {
        heading: "What DrawCoach collects",
        body: "DrawCoach lets you upload an image so your browser can resize it and calculate simple visual metrics. The app sends those metrics and your selected goal to its analysis route, not an account profile.",
      },
      {
        heading: "Uploaded drawings",
        body: "Uploaded drawings are resized locally in your browser before analysis. DrawCoach does not intentionally keep a database of uploaded drawings or use them for image generation.",
      },
      {
        heading: "Browser storage",
        body: "DrawCoach may use local browser storage for small product settings, cached analysis results, and whether you dismissed the sharing promo.",
      },
      {
        heading: "No accounts",
        body: "DrawCoach does not require accounts, payments, ads, or voice features. If the app changes later, this policy may be updated.",
      },
    ],
  },
  terms: {
    title: "Terms of Use",
    updated: "June 20, 2026",
    summary:
      "DrawCoach is provided as a simple educational feedback tool for quick, beginner-friendly drawing feedback.",
    sections: [
      {
        heading: "Use of the app",
        body: "Use DrawCoach for lawful, personal, educational, or creative work. Do not upload content you do not have permission to use or content that is intended to harm others.",
      },
      {
        heading: "Feedback limits",
        body: "DrawCoach feedback is generated from simple visual rules and should not be treated as professional art instruction, legal advice, or a guarantee of artistic quality.",
      },
      {
        heading: "Availability",
        body: "DrawCoach is an MVP and may be unavailable, contain mistakes, or change without notice. The app is provided as-is.",
      },
      {
        heading: "Future changes",
        body: "DrawCoach may receive changes or updates that make the app more limited, add new limits, or introduce a subscription in the future.",
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    updated: "June 20, 2026",
    summary:
      "DrawCoach does not use advertising or tracking cookies, but it may use local browser storage for core app preferences.",
    sections: [
      {
        heading: "Cookies",
        body: "DrawCoach does not intentionally set advertising cookies, third-party tracking cookies, or analytics cookies.",
      },
      {
        heading: "Local storage",
        body: "The app may use localStorage or similar browser storage to remember dismissed prompts, settings, and cached analysis results.",
      },
      {
        heading: "Control",
        body: "You can clear this storage through your browser settings. Clearing it may reset dismissed banners or cached results.",
      },
    ],
  },
} satisfies Record<string, Policy>;
