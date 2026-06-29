import type { Metadata } from "next";
import Link from "next/link";
import { BrandLink } from "@/components/brand-link";
import { absoluteUrl, OG_IMAGE_URL } from "@/lib/site";

const pageTitle = "Free Drawing Feedback Online - Drawing Critique Tool | DrawCoach";
const pageDescription =
  "Get free drawing feedback online with DrawCoach. Upload a sketch and receive simple critique notes for shading, composition, detail, and clarity.";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: absoluteUrl("/drawing-feedback"),
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: absoluteUrl("/drawing-feedback"),
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

export default function DrawingFeedbackPage() {
  return (
    <main className="min-h-screen px-5 py-6 text-[#161719] sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-3xl">
        <header className="flex items-center justify-between border-b border-[#dededb] pb-5">
          <BrandLink />
          <Link
            className="rounded-full border border-[#dededb] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#59606a] transition hover:border-[#1946d2] hover:text-[#1946d2]"
            href="/"
          >
            Try it
          </Link>
        </header>

        <section className="py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1946d2]">
            Free drawing feedback
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            Free drawing feedback to improve sketches online.
          </h1>
          <p className="mt-5 text-base leading-7 text-[#555c65]">
            DrawCoach is a free drawing critique tool for quick practice notes. Upload a sketch,
            choose a goal, and get beginner-friendly feedback on shading, composition, detail, and
            clutter without creating an account.
          </p>
          <Link
            className="mt-7 inline-flex rounded-md bg-[#1946d2] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-90 focus:outline-none focus:ring-4 focus:ring-[#1946d2]/20"
            href="/"
          >
            Upload a drawing
          </Link>
        </section>

        <section className="border-t border-[#e7e8e5] py-8">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <ol className="mt-5 space-y-4 text-sm leading-7 text-[#555c65]">
            <li>
              <strong className="text-[#161719]">1. Upload a sketch.</strong> DrawCoach resizes the
              image in your browser before analysis.
            </li>
            <li>
              <strong className="text-[#161719]">2. Choose a goal.</strong> Pick a focus such as
              realistic, simple, detailed, playful, less cluttered, more 3D, or better shading.
            </li>
            <li>
              <strong className="text-[#161719]">3. Read the critique.</strong> Get a short summary
              and specific next steps you can try in your next drawing pass.
            </li>
          </ol>
        </section>

        <section className="border-t border-[#e7e8e5] py-8">
          <h2 className="text-2xl font-semibold">Example critique</h2>
          <div className="mt-5 rounded-lg border border-[#dededb] bg-white p-5">
            <p className="text-sm font-semibold text-[#161719]">
              Summary: The sketch has a clear idea, but the form feels flat because the shadow side is not consistent.
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[#555c65]">
              <li>
                <strong className="text-[#161719]">What is happening:</strong> The darkest marks are
                spread across the drawing instead of grouped on one side.
              </li>
              <li>
                <strong className="text-[#161719]">Why it matters:</strong> Clear value groups make a
                sketch feel more three-dimensional.
              </li>
              <li>
                <strong className="text-[#161719]">Smallest easy fix:</strong> Pick one shadow side
                and darken only that side before adding more detail.
              </li>
            </ul>
          </div>
        </section>

        <section className="border-t border-[#e7e8e5] py-8">
          <h2 className="text-2xl font-semibold">A simple art improvement tool</h2>
          <p className="mt-4 text-sm leading-7 text-[#555c65]">
            DrawCoach is built for fast sketch practice rather than professional art instruction. It
            helps you notice one or two useful changes so you can keep drawing instead of getting
            stuck.
          </p>
        </section>

        <section className="border-t border-[#e7e8e5] py-8">
          <h2 className="text-2xl font-semibold">What kind of feedback does DrawCoach give?</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <article>
              <h3 className="text-base font-semibold">Shading and contrast</h3>
              <p className="mt-2 text-sm leading-7 text-[#555c65]">
                DrawCoach looks for drawings that are very dark, very bright, or low contrast. The
                critique then suggests a small value change, such as grouping shadows or adding one
                clearer highlight.
              </p>
            </article>
            <article>
              <h3 className="text-base font-semibold">Composition and clutter</h3>
              <p className="mt-2 text-sm leading-7 text-[#555c65]">
                The tool estimates whether the drawing feels too busy, too empty, or visually
                off-center. The feedback is meant to help you simplify the next pass without
                redrawing everything.
              </p>
            </article>
          </div>
        </section>

        <section className="border-t border-[#e7e8e5] py-8">
          <h2 className="text-2xl font-semibold">Who it is for</h2>
          <p className="mt-4 text-sm leading-7 text-[#555c65]">
            This page is for artists searching for free drawing feedback, beginner sketch critique,
            or a drawing critique tool that can quickly point out the next practical fix. DrawCoach
            works best for rough sketches, practice drawings, thumbnails, and early idea passes.
          </p>
        </section>
      </div>
    </main>
  );
}
