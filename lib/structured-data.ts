import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";

export const FAQ_ITEMS = [
  {
    question: "What is DrawCoach?",
    answer:
      "DrawCoach is a free online tool for getting short, structured feedback on a drawing or sketch. It is designed for quick practice notes, not professional art instruction.",
  },
  {
    question: "How does DrawCoach work?",
    answer:
      "You upload an image, choose a goal such as realistic, simple, detailed, elegant, playful, less cluttered, more 3D, or better shading, and DrawCoach returns a one-sentence summary plus several small improvement steps.",
  },
  {
    question: "What does DrawCoach analyze?",
    answer:
      "DrawCoach uses simple visual-rule metrics such as brightness, contrast, edge density, clutter, and center-versus-off-center composition. The feedback is based on those metrics and the selected drawing goal.",
  },
  {
    question: "Is DrawCoach free?",
    answer:
      "Yes. DrawCoach is currently a free online MVP with no accounts, no payments, no ads, no image generation, and no voice output.",
  },
  {
    question: "Does DrawCoach store uploaded drawings?",
    answer:
      "DrawCoach resizes images in the browser before analysis and does not intentionally keep a database of uploaded drawings. Browser storage may be used for settings, dismissed prompts, or cached results.",
  },
] as const;

export function drawCoachJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: "en-US",
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: absoluteUrl("/drawcoach-logo.png"),
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#app`,
        name: SITE_NAME,
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
        browserRequirements: "Requires a modern browser with image upload and canvas support.",
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "Free online drawing feedback",
          "Image upload with local resizing",
          "Goal-based drawing feedback",
          "Rules-first visual analysis",
          "Beginner-friendly improvement steps",
          "No accounts or payments required",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/about/#faq`,
        name: SITE_TITLE,
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}
