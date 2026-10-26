import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { MediaImage } from "@/components/ui/MediaImage";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getClients, getPage, getProject } from "@/lib/api";
import { section, str } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { PLACEHOLDER, projectParams } from "@/lib/params";

export const generateStaticParams = projectParams;

export const instant = false;

type Props = PageProps<"/our-work/[category]/[project]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { project: slug } = await params;
  if (slug === PLACEHOLDER) return { title: "Our Work" };
  const p = await getProject(slug);
  if (!p) return {};
  const image = p.og_image || p.intro_image || p.cover_image;
  return {
    title: `${p.meta_title || p.title} | Ananta Graphics`,
    description: p.meta_description || p.description || p.short_description || undefined,
    alternates: { canonical: `/our-work/${p.category.slug}/${p.slug}` },
    openGraph: image ? { images: [mediaUrl(image)] } : undefined,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { category, project: slug } = await params;
  if (slug === PLACEHOLDER) return <PageSkeleton />;

  const [p, clients, pageSections] = await Promise.all([
    getProject(slug),
    getClients(),
    getPage("our-work"),
  ]);
  if (!p) notFound();

  // Projects can move between categories in the CMS; keep old links working
  if (p.category.slug !== category) {
    permanentRedirect(`/our-work/${p.category.slug}/${p.slug}`);
  }

  const projectHeader = section(pageSections, "project_header");

  // Find client company logo if available in clients list
  const clientObj = clients.find((c) => {
    if (!p.client) return false;
    const clientNameLower = p.client.toLowerCase().trim();
    const cNameLower = c.name.toLowerCase().trim();
    return (
      clientNameLower.includes(cNameLower) ||
      cNameLower.includes(clientNameLower) ||
      clientNameLower.split(" ")[0] === cNameLower.split(" ")[0]
    );
  });

  // Left card image fallback if no client logo is available
  const introImage = p.intro_image || p.cover_image;

  // Banner image is the primary project showcase image
  const bannerImage = clientObj?.logo
    ? p.cover_image || (p.gallery && p.gallery[0]) || introImage
    : (p.gallery && p.gallery.find((img) => img !== introImage)) ||
      (p.gallery && p.gallery[0]) ||
      p.cover_image ||
      introImage;

  // Extra gallery images excluding the main banner (and intro image if displayed)
  const extraGallery = (p.gallery || []).filter(
    (img) =>
      img !== bannerImage && (clientObj?.logo ? true : img !== introImage)
  );

  const servicesText =
    p.services && p.services.length > 0
      ? p.services.join(" · ")
      : p.project_type || p.category.name;

  return (
    <article className="container-site pt-3 pb-14 md:pb-20">
      {/* Top Navigation / Breadcrumbs */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3">
        <Link
          href={`/our-work/${p.category.slug}`}
          className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/90 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-sans font-medium text-ink shadow-2xs backdrop-blur-xs transition-all duration-200 hover:border-brand hover:bg-brand hover:text-white active:scale-95"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
          <span className="truncate max-w-[150px] sm:max-w-none">{p.category.name}</span>
        </Link>
        <Link
          href="/our-work/all"
          className="group inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand/5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-sans font-semibold text-brand shadow-2xs transition-all duration-200 hover:border-brand hover:bg-brand hover:text-white active:scale-95"
        >
          <span>All projects</span>
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </div>

      {/* Top Header Block matching design: Our Work / Selected projects, created with purpose. */}
      <div className="mb-8 md:mb-12">
        <SectionHeading
          as="h1"
          eyebrow={str(projectHeader, "eyebrow", "Our Work")}
          title={str(projectHeader, "title", "Selected projects, created with purpose.")}
          lead={str(
            projectHeader,
            "lead",
            "Explore a selection of projects where design, print and brand communication come together to create meaningful visual experiences."
          )}
          align="center"
          titleClassName="!text-hero md:!text-[2.6rem] lg:!text-[2.85rem] tracking-tight"
        />
      </div>

      {/* Project Intro Row (2 Columns): Left Client Logo / Image, Right Project Details */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1.6fr)] lg:grid-cols-[400px_1fr] gap-6 md:gap-10 lg:gap-14 items-center max-w-5xl">
        {/* Left: Client Logo Card (fallback to intro image if client has no logo) */}
        {clientObj?.logo ? (
          <div className="relative w-full aspect-[4/3] sm:aspect-[1.15/1] rounded-[20px] md:rounded-[26px] bg-white shadow-sm border border-line/60 flex items-center justify-center p-8 sm:p-12 transition-transform duration-300 hover:shadow-md">
            <Image
              src={mediaUrl(clientObj.logo)}
              alt={p.client || clientObj.name}
              width={340}
              height={220}
              priority
              className="max-h-36 sm:max-h-44 md:max-h-48 max-w-[85%] w-auto h-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
        ) : introImage ? (
          <div className="relative w-full aspect-[4/3] sm:aspect-[1.15/1] overflow-hidden rounded-[20px] md:rounded-[26px] bg-panel shadow-sm border border-line/40">
            <MediaImage
              src={introImage}
              alt={p.title}
              sizes="(min-width: 1024px) 420px, (min-width: 768px) 45vw, 92vw"
              preload
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}

        {/* Right: Title, Description, and Key Metadata List */}
        <div>
          <h2 className="font-sans text-2xl sm:text-3xl md:text-[2.35rem] lg:text-[2.65rem] font-bold text-ink tracking-tight leading-tight">
            {p.title}
          </h2>

          {(p.description || p.short_description) && (
            <p className="mt-3 md:mt-3.5 font-sans text-sm sm:text-base text-ink-soft leading-relaxed max-w-xl">
              {p.description || p.short_description}
            </p>
          )}

          <div className="mt-5 sm:mt-6 space-y-2.5 text-sm sm:text-base font-sans">
            {p.client && (
              <div>
                <span className="font-bold text-ink">Client:</span>{" "}
                <span className="text-ink font-medium">{p.client}</span>
              </div>
            )}

            {(p.project_type || p.category.name) && (
              <div>
                <span className="font-bold text-ink">Project:</span>{" "}
                <span className="text-ink">{p.project_type || p.category.name}</span>
              </div>
            )}

            {servicesText && (
              <div>
                <span className="font-bold text-ink">Services:</span>{" "}
                <span className="text-ink">{servicesText}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prominent Full-Width Banner Image */}
      {bannerImage && (
        <div className="relative mt-8 md:mt-12 w-full aspect-[16/9] md:aspect-[2.1/1] overflow-hidden rounded-[20px] md:rounded-[32px] bg-panel shadow-md border border-line/40">
          <MediaImage
            src={bannerImage}
            alt={`${p.title} banner`}
            sizes="(min-width: 1440px) 1600px, 96vw"
            preload
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.01]"
          />
        </div>
      )}

      {/* Additional Gallery Items if any */}
      {extraGallery.length > 0 && (
        <div className="mt-8 md:mt-12 flex flex-col gap-6 md:gap-8">
          {extraGallery.map((img, i) => (
            <div
              key={`${img}-${i}`}
              className="relative aspect-[16/9] md:aspect-[2.1/1] overflow-hidden rounded-[18px] md:rounded-[26px] bg-panel shadow-sm border border-line/30"
            >
              <MediaImage
                src={img}
                alt={`${p.title} — preview ${i + 1}`}
                sizes="(min-width: 1440px) 1600px, 94vw"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
