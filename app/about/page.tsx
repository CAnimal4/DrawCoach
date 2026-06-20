import type { Metadata } from "next";
import Link from "next/link";
import { BrandLink } from "@/components/brand-link";
import { absoluteUrl, OG_IMAGE_URL, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";

const pageTitle = "About DrawCoach - How the Free Drawing Critique Tool Works";
const pageDescription =
  "DrawCoach is a free online drawing critique tool that analyzes simple image metrics and returns short, beginner-friendly improvement steps.";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: absoluteUrl("/about"),
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: absoluteUrl("/about"),
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "DrawCoach free online drawing critique tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [OG_IMAGE_URL],
  },
};

const faqs = [
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

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
      },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        description: pageDescription,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "Free online drawing critique",
          "Image upload with local resizing",
          "Goal-based drawing feedback",
          "Rules-first visual analysis",
          "No accounts or payments required",
        ],
      },
      {
        "@type": "FAQPage",
        name: SITE_TITLE,
        mainEntity: faqs.map((item) => ({
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

  return (
    <main className="min-h-screen px-5 py-6 text-[#161719] sm:px-8 lg:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto w-full max-w-3xl">
        <header className="flex items-center justify-between border-b border-[#dededb] pb-5">
          <BrandLink />
          <Link
            className="rounded-full border border-[#dededb] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#59606a] transition hover:border-[#1946d2] hover:text-[#1946d2]"
            href="/"
          >
            Open tool
          </Link>
        </header>

        <section className="py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1946d2]">
            About DrawCoach
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            Free online drawing critique with simple, specific next steps.
          </h1>
          <p className="mt-5 text-base leading-7 text-[#555c65]">
            DrawCoach is a browser-based MVP for people who want fast feedback on a sketch.
            It focuses on practical critique: what is happening in the drawing, why it matters,
            and the smallest easy fix to try next.
          </p>
        </section>

        <section className="space-y-8 pb-14">
          {faqs.map((item) => (
            <article className="border-t border-[#e7e8e5] pt-6" key={item.question}>
              <h2 className="text-xl font-semibold">{item.question}</h2>
              <p className="mt-3 text-sm leading-7 text-[#555c65]">{item.answer}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
