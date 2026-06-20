import type { Metadata } from "next";
import { absoluteUrl, OG_IMAGE_URL } from "@/lib/site";
import { policies } from "@/lib/legal";
import { PolicyPage } from "../policy-page";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Cookie Policy - DrawCoach",
  description:
    "DrawCoach cookie and browser storage details, including no ad cookies and localStorage for settings, dismissed prompts, and cached analysis.",
  alternates: {
    canonical: absoluteUrl("/cookies"),
  },
  openGraph: {
    title: "Cookie Policy - DrawCoach",
    description:
      "DrawCoach cookie and browser storage details, including no ad cookies and localStorage for settings, dismissed prompts, and cached analysis.",
    url: absoluteUrl("/cookies"),
    images: [OG_IMAGE_URL],
  },
};

export default function CookiesPage() {
  return <PolicyPage policy={policies.cookies} />;
}
