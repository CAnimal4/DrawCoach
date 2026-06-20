import type { Metadata } from "next";
import Link from "next/link";
import { BrandLink } from "@/components/brand-link";
import { absoluteUrl, OG_IMAGE_URL } from "@/lib/site";
import { drawCoachJsonLd, FAQ_ITEMS } from "@/lib/structured-data";

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

export default function AboutPage() {
  return (
    <main className="min-h-screen px-5 py-6 text-[#161719] sm:px-8 lg:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(drawCoachJsonLd()) }}
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
          {FAQ_ITEMS.map((item) => (
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
