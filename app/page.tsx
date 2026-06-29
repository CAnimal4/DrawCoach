import type { Metadata } from "next";
import { DrawCoachApp } from "@/components/drawcoach-app";
import { absoluteUrl, OG_IMAGE_URL, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";
import { drawCoachJsonLd } from "@/lib/structured-data";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
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
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_URL],
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(drawCoachJsonLd()) }}
      />
      <DrawCoachApp />
    </>
  );
}
