import type { Metadata } from "next";
import Link from "next/link";
import { BrandLink } from "@/components/brand-link";
import { absoluteUrl, OG_IMAGE_URL } from "@/lib/site";

const pageTitle = "How to Improve Drawings - Shading, Proportion, and Composition";
const pageDescription =
  "Learn how to improve drawings by fixing flat shading, bad proportions, and messy composition, then use DrawCoach for free online sketch feedback.";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: absoluteUrl("/how-to-improve-drawings"),
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: absoluteUrl("/how-to-improve-drawings"),
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "DrawCoach free online drawing feedback tool",
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

const problems = [
  {
    title: "Flat shading",
    body:
      "Flat shading usually happens when light and shadow are scattered evenly. Choose one light direction, group the shadow side, and keep the lit side cleaner.",
  },
  {
    title: "Bad proportions",
    body:
      "Proportion problems often come from drawing details too early. Compare the biggest shapes first, then place smaller features after the main widths and heights feel right.",
  },
  {
    title: "Messy composition",
    body:
      "A messy composition usually has too many areas asking for attention. Pick one focal point, soften less important edges, and remove a few marks around the background.",
  },
] as const;

export default function HowToImproveDrawingsPage() {
  return (
    <main className="min-h-screen px-5 py-6 text-[#161719] sm:px-8 lg:px-12">
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

        <Link className="mt-6 inline-flex text-sm font-semibold text-[#1946d2] hover:underline" href="/">
          Back to DrawCoach
        </Link>

        <section className="py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1946d2]">
            How to improve drawings
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            Improve drawings by fixing the problems viewers notice first.
          </h1>
          <p className="mt-5 text-base leading-7 text-[#555c65]">
            Most sketches improve fastest when you focus on a small number of fundamentals:
            shading, proportion, composition, and detail control. DrawCoach gives quick online
            feedback notes so you can decide what to fix next.
          </p>
        </section>

        <section className="space-y-8 pb-10">
          {problems.map((problem) => (
            <article className="border-t border-[#e7e8e5] pt-6" key={problem.title}>
              <h2 className="text-2xl font-semibold">{problem.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#555c65]">{problem.body}</p>
            </article>
          ))}
        </section>

        <section className="border-t border-[#e7e8e5] py-8">
          <h2 className="text-2xl font-semibold">Use feedback to choose one next step</h2>
          <p className="mt-4 text-sm leading-7 text-[#555c65]">
            Useful feedback does not need to list every flaw. The best next step is usually one
            small fix: darken one shadow group, adjust one proportion, simplify one busy area, or
            clarify one focal point.
          </p>
          <div className="mt-5 rounded-lg border border-[#dededb] bg-white p-5">
            <h3 className="text-base font-semibold">How DrawCoach can help</h3>
            <p className="mt-2 text-sm leading-7 text-[#555c65]">
              DrawCoach turns a sketch into a short list of beginner-friendly improvements. Instead
              of asking you to solve every art problem at once, it gives a summary, a few specific
              fixes, and one next step to focus on.
            </p>
          </div>
          <Link
            className="mt-7 inline-flex rounded-md bg-[#1946d2] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-90 focus:outline-none focus:ring-4 focus:ring-[#1946d2]/20"
            href="/"
          >
            Get free drawing feedback
          </Link>
        </section>

        <section className="border-t border-[#e7e8e5] py-8">
          <h2 className="text-2xl font-semibold">A quick improvement checklist</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-[#555c65]">
            <li>
              <strong className="text-[#161719]">Squint at the drawing.</strong> If everything has
              the same value, choose one area to darken.
            </li>
            <li>
              <strong className="text-[#161719]">Compare the largest shapes.</strong> Fix the big
              width and height relationships before polishing details.
            </li>
            <li>
              <strong className="text-[#161719]">Pick one focal point.</strong> Let the most
              important area have the sharpest contrast and cleanest edges.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
