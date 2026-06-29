import type { Metadata } from "next";
import Link from "next/link";
import { BrandLink } from "@/components/brand-link";
import { absoluteUrl, OG_IMAGE_URL } from "@/lib/site";

const pageTitle = "Why Does My Drawing Look Flat? Simple Fixes for Sketches";
const pageDescription =
  "Learn why drawings look flat, how shading and line weight create depth, and how DrawCoach can suggest the next small fix for your sketch.";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: absoluteUrl("/why-does-my-drawing-look-flat"),
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: absoluteUrl("/why-does-my-drawing-look-flat"),
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

const flatReasons = [
  {
    title: "The light source is unclear",
    body:
      "A drawing often looks flat when highlights and shadows appear on every side. Choose one light direction, keep the light side simpler, and group the shadow side together.",
  },
  {
    title: "The values are too similar",
    body:
      "If the darkest dark and lightest light are close together, forms can look like outlines instead of solid objects. Add contrast only where you want depth or focus.",
  },
  {
    title: "The line weight is even everywhere",
    body:
      "Same-width lines can make every edge feel equally important. Use slightly heavier lines on closer or shadowed edges and lighter lines on distant or lit edges.",
  },
  {
    title: "The overlap is missing",
    body:
      "Objects feel more three-dimensional when one shape clearly sits in front of another. Add small overlaps before adding more texture or detail.",
  },
] as const;

export default function WhyDrawingLooksFlatPage() {
  return (
    <main className="min-h-screen px-5 py-6 text-[#161719] sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-3xl">
        <header className="flex items-center justify-between border-b border-[#dededb] pb-5">
          <BrandLink />
          <Link
            className="rounded-full border border-[#dededb] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#59606a] transition hover:border-[#1946d2] hover:text-[#1946d2]"
            href="/"
          >
            Try DrawCoach
          </Link>
        </header>

        <Link className="mt-6 inline-flex text-sm font-semibold text-[#1946d2] hover:underline" href="/">
          Back to DrawCoach
        </Link>

        <section className="py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1946d2]">
            Drawing depth and shading
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            Why does my drawing look flat?
          </h1>
          <p className="mt-5 text-base leading-7 text-[#555c65]">
            A drawing usually looks flat when the viewer cannot tell what is closer, what is farther
            away, or where the light is coming from. The fix is often small: clearer shadows, better
            value grouping, stronger overlap, or more intentional line weight.
          </p>
          <Link
            className="mt-7 inline-flex rounded-md bg-[#1946d2] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-90 focus:outline-none focus:ring-4 focus:ring-[#1946d2]/20"
            href="/?goal=more-3D"
          >
            Get feedback on a flat drawing
          </Link>
        </section>

        <section className="space-y-8 pb-10">
          {flatReasons.map((reason) => (
            <article className="border-t border-[#e7e8e5] pt-6" key={reason.title}>
              <h2 className="text-2xl font-semibold">{reason.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#555c65]">{reason.body}</p>
            </article>
          ))}
        </section>

        <section className="border-t border-[#e7e8e5] py-8">
          <h2 className="text-2xl font-semibold">How DrawCoach can help with flat drawings</h2>
          <p className="mt-4 text-sm leading-7 text-[#555c65]">
            DrawCoach gives quick drawing feedback based on simple visual checks like brightness,
            contrast, edge density, clutter, and composition. If a sketch looks flat, it can suggest
            a focused next step such as darkening one shadow group, simplifying noisy marks, or
            making the focal point easier to read.
          </p>
        </section>

        <section className="border-t border-[#e7e8e5] py-8">
          <h2 className="text-2xl font-semibold">Small fixes to try before redrawing</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-[#555c65]">
            <li>
              <strong className="text-[#161719]">Pick one shadow side.</strong> Darken only that
              side first so the form has a clear turn.
            </li>
            <li>
              <strong className="text-[#161719]">Add one overlap.</strong> Let one shape cover part
              of another shape to create depth.
            </li>
            <li>
              <strong className="text-[#161719]">Vary one edge.</strong> Make the closest edge a
              little darker or thicker than the far edge.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
