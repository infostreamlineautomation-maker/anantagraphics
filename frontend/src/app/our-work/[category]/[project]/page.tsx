import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/Motion";
import { MediaImage } from "@/components/ui/MediaImage";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPage, getProject } from "@/lib/api";
import { section, str } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { PLACEHOLDER, projectParams } from "@/lib/params";

export const generateStaticParams = projectParams;

// Blocking (no Suspense) so unknown projects get a real 404 and moved ones a real 308 redirect.
export const instant = false;

type Props = PageProps<"/our-work/[category]/[project]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { project: slug } = await params;
  if (slug === PLACEHOLDER) return { title: "Our Work" };
  const p = await getProject(slug);
  if (!p) return {};
  const image = p.og_image || p.cover_image;
  return {
    title: p.meta_title || p.title,
    description: p.meta_description || p.description || p.short_description || undefined,
    alternates: { canonical: `/our-work/${p.category.slug}/${p.slug}` },
    openGraph: image ? { images: [mediaUrl(image)] } : undefined,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { category, project: slug } = await params;
  if (slug === PLACEHOLDER) return <PageSkeleton />;
  const [p, sections] = await Promise.all([getProject(slug), getPage("our-work")]);
  if (!p) notFound();
  // Projects can move between categories in the CMS; keep old links working
  if (p.category.slug !== category) permanentRedirect(`/our-work/${p.category.slug}/${p.slug}`);

  const header = section(sections, "project_header");
  const facts = [
    ["Client", p.client],
    ["Project", p.project_type],
    ["Services", p.services.join(" · ")],
  ].filter(([, v]) => v);

  return (
    <article className="container-site pt-4 pb-14 md:pb-20">
      <SectionHeading
        eyebrow={str(header, "eyebrow", "Our Work")}
        title={str(header, "title", "Selected projects, created with purpose.")}
        lead={str(header, "lead")}
      />

      <div className="w-full mt-8 grid items-center gap-6 md:mt-12 md:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)] md:gap-12">
        <FadeIn direction="right">
          <div className="relative aspect-[519/448] overflow-hidden rounded-media bg-panel shadow-sm hover:shadow-lg transition-shadow duration-500">
            <MediaImage src={p.intro_image || p.cover_image} alt={p.title} sizes="(min-width: 768px) 38vw, 92vw" preload />
          </div>
        </FadeIn>
        <FadeIn direction="left" delay={0.1}>
          <div>
            <h1 className="font-sans text-section font-medium text-ink">{p.title}</h1>
            {(p.description || p.short_description) && (
              <p className="mt-3 max-w-3xl font-sans text-body-lg text-ink-soft">{p.description || p.short_description}</p>
            )}
            {facts.length > 0 && (
              <dl className="mt-5 space-y-2 font-sans text-lead">
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt className="inline font-semibold">{label}: </dt>
                    <dd className="inline">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </FadeIn>
      </div>

      {p.gallery.length > 0 && (
        <div className="w-full mt-10 flex flex-col gap-6 md:mt-14 md:gap-8">
          {p.gallery.map((img, i) => (
            <FadeIn key={`${img}-${i}`} direction="up" distance={30} delay={Math.min(i * 0.08, 0.3)}>
              <div className="group relative aspect-[1656/871] overflow-hidden rounded-media bg-panel shadow-sm hover:shadow-xl transition-shadow duration-500">
                <MediaImage
                  src={img}
                  alt={`${p.title} — image ${i + 1}`}
                  sizes="(min-width: 1440px) 1600px, 94vw"
                  className="transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>
            </FadeIn>
          ))}
        </div>
      )}

      {p.explore.length > 0 && (
        <section className="w-full mt-14 md:mt-20" aria-labelledby="explore-heading">
          <FadeIn direction="up">
            <h2 id="explore-heading" className="font-sans text-h3 font-medium text-ink">
              {str(header, "explore_title", "Explore more projects")}
            </h2>
          </FadeIn>
          <StaggerContainer stagger={0.1} className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mt-8 md:gap-8">
            {p.explore.map((e) => (
              <StaggerItem key={e.id}>
                <Link href={`/our-work/${e.category_slug}/${e.slug}`} className="group block transition-transform duration-300 hover:-translate-y-1.5">
                  <div className="relative aspect-[526/463] overflow-hidden rounded-media bg-panel shadow-xs transition-shadow duration-300 group-hover:shadow-lg">
                    <MediaImage
                      src={e.cover_image}
                      alt=""
                      sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 92vw"
                      className="transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <p className="mt-2 font-sans text-title text-ink group-hover:text-brand transition-colors duration-200">{e.title}</p>
                  <p className="font-sans text-small text-muted">{e.category_name}</p>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}
    </article>
  );
}
