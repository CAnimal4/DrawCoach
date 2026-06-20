import type { Metadata } from "next";
import { absoluteUrl, OG_IMAGE_URL } from "@/lib/site";
import { policies } from "@/lib/legal";
import { PolicyPage } from "../policy-page";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Terms of Use - DrawCoach",
  description:
    "Terms for using DrawCoach, a free online drawing critique MVP with educational feedback and possible future product changes.",
  alternates: {
    canonical: absoluteUrl("/terms"),
  },
  openGraph: {
    title: "Terms of Use - DrawCoach",
    description:
      "Terms for using DrawCoach, a free online drawing critique MVP with educational feedback and possible future product changes.",
    url: absoluteUrl("/terms"),
    images: [OG_IMAGE_URL],
  },
};

export default function TermsPage() {
  return <PolicyPage policy={policies.terms} />;
}
