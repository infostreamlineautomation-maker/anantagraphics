import type { Metadata } from "next";

import { ClientLogos } from "@/components/sections/ClientLogos";
import { FeaturedStrip } from "@/components/sections/FeaturedStrip";
import { HeroSlideshow } from "@/components/sections/HeroSlideshow";
import { ServiceCarousel } from "@/components/sections/ServiceCarousel";
import { ShowcaseBlock } from "@/components/sections/ShowcaseBlock";
import { StatsStripe } from "@/components/sections/StatsStripe";
import { BusinessJsonLd } from "@/components/seo/BusinessJsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getClients, getFeaturedProjects, getPage, getSettings } from "@/lib/api";
import { items, safeHref, section, str, strList } from "@/lib/content";

export const instant = false;

export const metadata: Metadata = { alternates: { canonical: "/" } };

const DEFAULT_SHOWCASE = [
  { number: "01", title: "Printing & Designing", href: "/our-work/printed-materials", image_alt: "Fine printing, catalog, brochure and stationery designing" },
  { number: "02", title: "Packaging Solutions", href: "/our-work/packaging", image_alt: "Custom printed boxes and branded product packaging" },
  { number: "03", title: "Signages Solutions", href: "/our-work/signage", image_alt: "Architectural, retail and outdoor signage solutions" },
  { number: "04", title: "Corporate Gifting", href: "/our-work/corporate-gifting", image_alt: "Brandwater luxury corporate gifting kit" },
  { number: "05", title: "Overseas Work", href: "/our-work/overseas-work", image_alt: "International brand printing and export packaging solutions" },
];

export default async function HomePage() {
  const [sections, featuredProjects, clients, settings] = await Promise.all([getPage("home"), getFeaturedProjects(), getClients(), getSettings()]);
  const hero = section(sections, "hero");
  const statsSection = sections["stats"] as Record<string, unknown> | undefined;
  const rawStatsItems = statsSection ? items(statsSection, "items") : [];
  const stats = statsSection
    ? {
        items:
          rawStatsItems.length > 0
            ? rawStatsItems.map((r) => ({
                id: str(r, "id"),
                value: str(r, "value"),
                label: str(r, "label"),
                enabled: r.enabled !== false,
              }))
            : undefined,
        total_value: str(statsSection, "total_value") || settings.stats?.total_value,
        total_label: str(statsSection, "total_label") || settings.stats?.total_label,
        cities_value: str(statsSection, "cities_value") || settings.stats?.cities_value,
        cities_label: str(statsSection, "cities_label") || settings.stats?.cities_label,
        projects_value: str(statsSection, "projects_value") || settings.stats?.projects_value,
        projects_label: str(statsSection, "projects_label") || settings.stats?.projects_label,
        clients_value: str(statsSection, "clients_value") || settings.stats?.clients_value,
        clients_label: str(statsSection, "clients_label") || settings.stats?.clients_label,
      }
    : null;
  const intro = section(sections, "intro");
  const rawShowcase = items(section(sections, "showcase"));
  const showcase = rawShowcase.length > 0 ? rawShowcase : DEFAULT_SHOWCASE;
  const servicesIntro = section(sections, "services");
  const clientsIntro = section(sections, "clients");
  const featured = items(section(sections, "featured"));

  return (
    <>
      <BusinessJsonLd settings={settings} />
      {/* Full-bleed hero slideshow supporting photos and videos */}
      <HeroSlideshow
        fallbackImage={str(hero, "image")}
        fallbackAlt={str(hero, "image_alt")}
        fallbackCaption={str(hero, "caption")}
        slides={items(hero, "slides").map((s) => ({
          media: str(s, "media") || str(s, "image") || str(s, "url"),
          caption: str(s, "caption"),
          alt: str(s, "alt") || str(s, "image_alt"),
        }))}
      />

      {stats && <StatsStripe stats={stats} />}

      <section className="container-site section-y">
        <SectionHeading eyebrow={str(intro, "eyebrow")} title={str(intro, "title")} lead={str(intro, "lead")} />
        {/* Showcase blocks covering all horizontal space with controlled height */}
        <div className="w-full mt-8 flex flex-col gap-8 md:mt-12 md:gap-12">
          {showcase.map((s, i) => (
            <ShowcaseBlock
              key={`${str(s, "number")}-${i}`}
              number={str(s, "number")}
              title={str(s, "title")}
              image={str(s, "image")}
              alt={str(s, "image_alt")}
              href={str(s, "href") ? safeHref(str(s, "href")) : undefined}
              gallery={strList(s, "gallery").length > 0 ? strList(s, "gallery") : undefined}
              bgColor={str(s, "bg_color") || undefined}
            />
          ))}
        </div>
      </section>

      {featuredProjects.length > 0 && (
        <section id="services" className="container-site section-y scroll-mt-8">
          <SectionHeading eyebrow={str(servicesIntro, "eyebrow")} title={str(servicesIntro, "title")} />
          <div className="mt-8 md:mt-10">
            <ServiceCarousel
              ctaLabel={str(servicesIntro, "cta_label", "Our Services")}
              items={featuredProjects.map((p) => {
                const serviceLabel =
                  p.category_slug === "printed-materials"
                    ? "Designing & Printing"
                    : p.category_slug === "signage"
                    ? "Signages Solutions"
                    : p.category_slug === "packaging"
                    ? "Packaging Solutions"
                    : p.category_name;

                return {
                  title: serviceLabel,
                  clientName: p.client || p.title,
                  description: p.description || p.short_description || "",
                  image: p.cover_image || p.intro_image,
                  href: `/our-work/${p.category_slug}/${p.slug}`,
                };
              })}
            />
          </div>
        </section>
      )}

      {clients.length > 0 && (
        <section className="section-y">
          <div className="container-site">
            <SectionHeading title={str(clientsIntro, "title", "Our Clients")} />
          </div>
          <div className="mt-8 md:mt-10">
            <ClientLogos clients={clients} />
          </div>
        </section>
      )}

      {featured.length > 0 && <FeaturedStrip images={featured} />}
    </>
  );
}
