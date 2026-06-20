import type { Metadata } from "next";
import { absoluteUrl, OG_IMAGE_URL } from "@/lib/site";
import { policies } from "@/lib/legal";
import { PolicyPage } from "../policy-page";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Privacy Policy - DrawCoach",
  description:
    "How DrawCoach handles uploaded drawings, browser storage, local resizing, cached results, and the no-account MVP privacy model.",
  alternates: {
    canonical: absoluteUrl("/privacy"),
  },
  openGraph: {
    title: "Privacy Policy - DrawCoach",
    description:
      "How DrawCoach handles uploaded drawings, browser storage, local resizing, cached results, and the no-account MVP privacy model.",
    url: absoluteUrl("/privacy"),
    images: [OG_IMAGE_URL],
  },
};

export default function PrivacyPage() {
  return <PolicyPage policy={policies.privacy} />;
}
