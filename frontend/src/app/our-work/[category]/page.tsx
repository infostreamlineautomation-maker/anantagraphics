import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryWorkGrid } from "@/components/sections/CategoryWorkGrid";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getWorkCategory } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import { categoryParams, PLACEHOLDER } from "@/lib/params";

export const generateStaticParams = categoryParams;

export const instant = false;

export async function generateMetadata({ params }: PageProps<"/our-work/[category]">): Promise<Metadata> {
  const slug = (await params).category;
  if (slug === PLACEHOLDER) return { title: "Our Work" };
  const c = await getWorkCategory(slug);
  if (!c) return {};
  const image = c.og_image || c.card_image;
  return {
    title: `${c.name} | Our Work`,
    description: `Browse ${c.name} projects created by Ananta Graphics.`,
    alternates: { canonical: `/our-work/${c.slug}` },
    openGraph: image ? { images: [mediaUrl(image)] } : undefined,
  };
}

export default async function WorkCategoryPage({ params }: PageProps<"/our-work/[category]">) {
  const slug = (await params).category;
  if (slug === PLACEHOLDER) return <PageSkeleton />;
  const c = await getWorkCategory(slug);
  if (!c) notFound();

  return (
    <section className="container-site pt-4 pb-14 md:pb-20">
      {/* Header layout: Back arrow on the left side, All projects on the right side */}
      <div className="relative mb-6 md:mb-10">
        <div className="flex items-center justify-between gap-3 mb-4 md:mb-0 md:absolute md:inset-x-0 md:top-2 md:z-10 md:pointer-events-none">
          <div className="md:pointer-events-auto">
            <Link
              href="/our-work"
              className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/90 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-sans font-medium text-ink shadow-2xs backdrop-blur-xs transition-all duration-200 hover:border-brand hover:bg-brand hover:text-white active:scale-95"
            >
              <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
              <span>Categories</span>
            </Link>
          </div>

          <div className="md:pointer-events-auto">
            <Link
              href="/our-work/all"
              className="group inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand/5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-sans font-semibold text-brand shadow-2xs transition-all duration-200 hover:border-brand hover:bg-brand hover:text-white active:scale-95"
            >
              <span>All projects</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        <SectionHeading
          as="h1"
          title={c.heading || c.name}
          lead={c.intro || c.short_description || undefined}
          align="center"
          titleClassName="!text-hero md:!text-[2.6rem] lg:!text-[2.85rem] tracking-tight"
        />
      </div>

      {/* Grid of all work in this category with full-screen Lightbox on click */}
      <CategoryWorkGrid
        categoryName={c.name}
        categorySlug={c.slug}
        projects={c.projects}
      />
    </section>
  );
}
