import Link from "next/link";
import { BrandLink } from "@/components/brand-link";
import type { Policy } from "@/lib/legal";

export function PolicyPage({ policy }: { policy: Policy }) {
  return (
    <main className="min-h-screen px-5 py-6 text-[#161719] sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-3xl">
        <header className="flex items-center justify-between border-b border-[#dededb] pb-5">
          <BrandLink />
          <Link
            className="rounded-full border border-[#dededb] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#59606a] transition hover:border-[#1946d2] hover:text-[#1946d2]"
            href="/"
          >
            Back
          </Link>
        </header>

        <section className="py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1946d2]">
            Updated {policy.updated}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            {policy.title}
          </h1>
          <p className="mt-5 text-base leading-7 text-[#555c65]">{policy.summary}</p>

          <div className="mt-10 space-y-8">
            {policy.sections.map((section) => (
              <section className="border-t border-[#e7e8e5] pt-6" key={section.heading}>
                <h2 className="text-lg font-semibold">{section.heading}</h2>
                <p className="mt-3 text-sm leading-7 text-[#555c65]">{section.body}</p>
              </section>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
