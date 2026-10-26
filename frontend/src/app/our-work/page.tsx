import type { Metadata } from "next";
import Link from "next/link";

import { WorkCard } from "@/components/sections/WorkCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPage, getWorkCategories } from "@/lib/api";
import { pad, section, str } from "@/lib/content";

export const metadata: Metadata = {
  alternates: { canonical: "/our-work" },
  title: "Our Work",
  description: "Printed materials, packaging, signage and branded products created by Ananta Graphics.",
};

// The five categories featured on the homepage (no extra categories shown in Our Work)
const HOMEPAGE_CATEGORY_SLUGS = [
  "printed-materials",
  "packaging",
  "signage",
  "corporate-gifting",
  "overseas-work",
];

export default async function OurWorkPage() {
  const [sections, categories] = await Promise.all([getPage("our-work"), getWorkCategories()]);
  const intro = section(sections, "intro");

  // Keep strictly the 5 categories matching the homepage in sequence
  const fiveCategories = HOMEPAGE_CATEGORY_SLUGS
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => !!c);

  return (
    <section className="container-site pt-4 pb-14 md:pb-20">
      <SectionHeading as="h1" eyebrow={str(intro, "eyebrow", "Our Works")} title={str(intro, "title", "Our Work")} lead={str(intro, "lead")} />

      {/* Quick link to view all work across all categories */}
      <div className="mt-6 md:mt-8 flex justify-end">
        <Link
          href="/our-work/all"
          className="group inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm uppercase tracking-wider text-muted hover:text-brand transition-colors font-semibold"
        >
          <span>View All Work</span>
          <span className="text-base transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <div className="w-full mt-4 md:mt-6 grid grid-cols-2 gap-x-3.5 gap-y-7 sm:gap-x-6 sm:gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
        {fiveCategories.map((c, i) => (
          <WorkCard
            key={c.id}
            number={pad(i + 1)}
            title={c.name}
            image={c.card_image}
            href={`/our-work/${c.slug}`}
            preload={i === 0}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
