import type { Metadata } from "next";

import { ClientLogos } from "@/components/sections/ClientLogos";
import { FeaturedStrip } from "@/components/sections/FeaturedStrip";
import { HeroSlideshow } from "@/components/sections/HeroSlideshow";
import { ServiceCarousel } from "@/components/sections/ServiceCarousel";
import { ShowcaseBlock } from "@/components/sections/ShowcaseBlock";
import { BusinessJsonLd } from "@/components/seo/BusinessJsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getClients, getPage, getServices, getSettings } from "@/lib/api";
import { items, safeHref, section, str, strList } from "@/lib/content";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [sections, services, clients, settings] = await Promise.all([getPage("home"), getServices(), getClients(), getSettings()]);
  const hero = section(sections, "hero");
  const intro = section(sections, "intro");
  const showcase = items(section(sections, "showcase"));
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

      {services.length > 0 && (
        <section id="services" className="container-site section-y scroll-mt-8">
          <SectionHeading eyebrow={str(servicesIntro, "eyebrow")} title={str(servicesIntro, "title")} />
          <div className="mt-8 md:mt-10">
            <ServiceCarousel
              ctaLabel={str(servicesIntro, "cta_label", "Our Services")}
              items={services.map((s) => ({
                title: s.title,
                description: s.description ?? "",
                image: s.image,
                href: safeHref(s.link ?? "/our-work", "/our-work"),
              }))}
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
