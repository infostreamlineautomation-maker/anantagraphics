import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WorkCard } from "@/components/sections/WorkCard";
import { FadeIn } from "@/components/ui/Motion";
import { ButtonLink } from "@/components/ui/Button";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getWorkCategory } from "@/lib/api";
import { pad } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { categoryParams, PLACEHOLDER } from "@/lib/params";

export const generateStaticParams = categoryParams;

// Blocking (no Suspense): the server waits for the lookup, so unknown slugs get a real 404 status,
// not a streamed "soft 404". Known categories are still prerendered as static pages.
export const instant = false;

export async function generateMetadata({ params }: PageProps<"/our-work/[category]">): Promise<Metadata> {
  const slug = (await params).category;
  if (slug === PLACEHOLDER) return { title: "Our Work" };
  const c = await getWorkCategory(slug);
  if (!c) return {};
  const image = c.og_image || c.card_image;
  return {
    title: c.meta_title || c.heading || c.name,
    description: c.meta_description || c.intro || c.short_description || undefined,
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
      <SectionHeading as="h1" eyebrow="Our Works" title={c.heading || c.name} lead={c.intro ?? undefined} />
      {c.projects.length > 0 ? (
        <div className="w-full mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 md:mt-12 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
          {c.projects.map((p, i) => (
            <WorkCard
              key={p.id}
              variant="project"
              number={pad(i + 1)}
              title={p.title}
              text={p.short_description ?? undefined}
              image={p.cover_image}
              href={`/our-work/${c.slug}/${p.slug}`}
              cta="View Project"
              preload={i === 0}
              index={i}
              secondary_image={p.secondary_image}
              craft_tags={p.craft_tags}
              color_palette={p.color_palette}
            />
          ))}
        </div>
      ) : (
        <FadeIn direction="up">
          <div className="mx-auto mt-10 max-w-md text-center">
            <p className="font-serif text-body-lg text-muted">New projects are being added here soon.</p>
            <ButtonLink href="/contact" className="mt-5">
              Talk to us about yours
            </ButtonLink>
          </div>
        </FadeIn>
      )}
    </section>
  );
}
