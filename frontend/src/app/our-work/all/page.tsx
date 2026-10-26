import type { Metadata } from "next";
import Link from "next/link";

import { AllWorkGrid } from "@/components/sections/AllWorkGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAllProjects, getPage, getWorkCategories } from "@/lib/api";
import { section, str } from "@/lib/content";

export const instant = false;

export const metadata: Metadata = {
  title: "All Work | Ananta Graphics",
  description: "Browse all portfolio projects across printing, packaging, signage, corporate gifting and overseas work.",
  alternates: { canonical: "/our-work/all" },
};

export default async function AllWorkPage() {
  const [sections, allProjects, categories] = await Promise.all([
    getPage("our-work"),
    getAllProjects(),
    getWorkCategories(),
  ]);

  const allHeader = section(sections, "all_projects_header") || section(sections, "intro");

  const activeCategories = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
  }));

  return (
    <section className="container-site pt-4 pb-14 md:pb-20">
      {/* Header layout: Back arrow on the left side */}
      <div className="relative mb-6 md:mb-10">
        <div className="flex items-center justify-between gap-3 mb-4 md:mb-0 md:absolute md:left-0 md:top-2 md:z-10">
          <Link
            href="/our-work"
            className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/90 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-sans font-medium text-ink shadow-2xs backdrop-blur-xs transition-all duration-200 hover:border-brand hover:bg-brand hover:text-white active:scale-95"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
            <span>Categories</span>
          </Link>
        </div>

        <SectionHeading
          as="h1"
          eyebrow={str(allHeader, "eyebrow", "Our Portfolio")}
          title={str(allHeader, "title", "All Projects")}
          lead={str(
            allHeader,
            "lead",
            "Explore our complete collection of design, printing, packaging, signage and corporate gifting work."
          )}
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
