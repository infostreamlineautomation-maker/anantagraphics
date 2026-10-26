import type { Metadata } from "next";
import Link from "next/link";

import { AllWorkGrid } from "@/components/sections/AllWorkGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAllProjects, getWorkCategories } from "@/lib/api";

export const instant = false;

export const metadata: Metadata = {
  title: "All Work | Ananta Graphics",
  description: "Browse all portfolio projects across printing, packaging, signage, corporate gifting and overseas work.",
  alternates: { canonical: "/our-work/all" },
};

const HOMEPAGE_CATEGORY_SLUGS = [
  "printed-materials",
  "packaging",
  "signage",
  "corporate-gifting",
  "overseas-work",
];

export default async function AllWorkPage() {
  const [allProjects, categories] = await Promise.all([
    getAllProjects(),
    getWorkCategories(),
  ]);

  const activeCategories = HOMEPAGE_CATEGORY_SLUGS.map((slug) => {
    const found = categories.find((c) => c.slug === slug);
    return {
      slug,
      name: found ? found.name : slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    };
  });

  return (
    <section className="container-site pt-4 pb-14 md:pb-20">
      {/* Header layout: Back arrow on the left side */}
      <div className="relative mb-6 md:mb-10">
        <div className="md:absolute md:left-0 md:top-2.5 md:z-10 mb-3 md:mb-0">
          <Link
            href="/our-work"
            className="group inline-flex items-center gap-2 font-mono text-xs sm:text-sm uppercase tracking-wider text-muted hover:text-brand transition-colors font-medium"
          >
            <span className="text-base sm:text-lg transition-transform duration-200 group-hover:-translate-x-1">←</span>
            <span>Categories</span>
          </Link>
        </div>

        <SectionHeading
          as="h1"
          eyebrow="Our Portfolio"
          title="All Projects"
          lead="Explore our complete collection of design, printing, packaging, signage and corporate gifting work."
          align="center"
          titleClassName="!text-hero md:!text-[2.6rem] lg:!text-[2.85rem] tracking-tight"
        />
      </div>

      {/* Grid of all work with category filtering */}
      <AllWorkGrid
        projects={allProjects}
        categories={activeCategories}
      />
    </section>
  );
}
