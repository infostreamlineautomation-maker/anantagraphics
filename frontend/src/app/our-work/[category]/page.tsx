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
      {/* Header layout: Back arrow on the left side, Heading big and centered */}
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

        <div className="md:absolute md:right-0 md:top-2.5 md:z-10 hidden sm:block">
          <Link
            href="/our-work/all"
            className="group inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm uppercase tracking-wider text-muted hover:text-brand transition-colors font-medium"
          >
            <span>All projects</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
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
