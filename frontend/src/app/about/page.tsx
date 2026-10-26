import type { Metadata } from "next";

import { ClientLogos } from "@/components/sections/ClientLogos";
import { CtaCard } from "@/components/sections/CtaCard";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { GetInTouchCard } from "@/components/sections/GetInTouchCard";
import { ButtonLink } from "@/components/ui/Button";
import { Chip, FeatureCard, InfoCard, StatCard } from "@/components/ui/Cards";
import { MediaImage } from "@/components/ui/MediaImage";
import { FadeIn, Magnetic, StaggerContainer, StaggerItem } from "@/components/ui/Motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getClients, getFaqs, getPage, getSettings } from "@/lib/api";
import { items, obj, safeHref, section, str, strList } from "@/lib/content";

export const instant = false;

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About Us",
  description:
    "Ananta Graphics is a creative design and production company for design, printing, packaging, signage and corporate gifting.",
};

export default async function AboutPage() {
  const [sections, clients, faqs, { contact, socials }] = await Promise.all([
    getPage("about"),
    getClients(),
    getFaqs(),
    getSettings(),
  ]);
  const hero = section(sections, "hero");
  const visionMission = items(section(sections, "vision_mission"));
  const clientsIntro = section(sections, "clients");
  const story = section(sections, "story");
  const features = items(section(sections, "features"));
  const cta = section(sections, "contact_cta");
  const getInTouch = obj(cta, "get_in_touch");
  const idea = obj(cta, "cta");

  return (
    <>
      {/* Hero: text + stats beside a tall image */}
      <section className="container-site grid items-center gap-8 pt-2 pb-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:gap-12 md:pb-12">
        <FadeIn direction="right">
          <div>
            <h1 className="font-display text-hero font-bold text-ink">{str(hero, "title")}</h1>
            {str(hero, "text") && <p className="mt-4 max-w-2xl font-sans text-body-lg text-muted">{str(hero, "text")}</p>}
            {str(hero, "cta_label") && (
              <div className="mt-6 md:mt-8">
                <Magnetic strength={0.25}>
                  <ButtonLink href={safeHref(str(hero, "cta_href", "/contact"))} size="lg" className="min-w-52 shadow-xs hover:shadow-md">
                    {str(hero, "cta_label")}
                  </ButtonLink>
                </Magnetic>
              </div>
            )}
            <StaggerContainer stagger={0.08} className="mt-6 grid grid-cols-3 gap-2.5 md:mt-8 md:gap-4">
              {items(hero, "stats").map((s) => (
                <StaggerItem key={str(s, "value")}>
                  <StatCard value={str(s, "value")} label={str(s, "label")} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </FadeIn>
        <FadeIn direction="left" delay={0.1}>
          <div className="group relative aspect-[719/864] overflow-hidden rounded-media bg-panel shadow-sm hover:shadow-lg transition-shadow duration-500 md:aspect-square">
            <MediaImage
              src={str(hero, "image")}
              alt={str(hero, "image_alt")}
              sizes="(min-width: 768px) 45vw, 92vw"
              preload
              className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>
        </FadeIn>
      </section>

      {visionMission.length > 0 && (
        <section className="container-site">
          <StaggerContainer stagger={0.12} className="grid gap-4 md:grid-cols-2 md:gap-6">
            {visionMission.map((v) => (
              <StaggerItem key={str(v, "title")}>
                <InfoCard eyebrow={str(v, "eyebrow")} title={str(v, "title")}>
                  {strList(v, "paragraphs").map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </InfoCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}

      {clients.length > 0 && (
        <section className="section-y">
          <div className="container-site">
            <SectionHeading title={str(clientsIntro, "title", "Our Clients")} />
          </div>
          <div className="mt-8 md:mt-10">
            <ClientLogos clients={clients} variant="marquee" />
          </div>
        </section>
      )}

      {/* Built around creativity */}
      <section className="container-site grid items-center gap-8 pb-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-12 md:pb-12">
        <FadeIn direction="right">
          <div className="group relative aspect-[719/864] overflow-hidden rounded-media bg-panel shadow-sm hover:shadow-lg transition-shadow duration-500 md:aspect-square">
            <MediaImage
              src={str(story, "image")}
              alt={str(story, "image_alt")}
              sizes="(min-width: 768px) 40vw, 92vw"
              className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>
        </FadeIn>
        <FadeIn direction="left" delay={0.1}>
          <div>
            <h2 className="font-display text-section font-bold text-ink">{str(story, "title")}</h2>
            <div className="mt-4 space-y-4 font-sans text-body-lg text-muted">
              {strList(story, "paragraphs").map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            {strList(story, "chips").length > 0 && (
              <StaggerContainer stagger={0.04} className="mt-6 flex flex-wrap gap-2.5 md:gap-3">
                {strList(story, "chips").map((c) => (
                  <StaggerItem key={c}>
                    <Chip>{c}</Chip>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </FadeIn>
      </section>

      {features.length > 0 && (
        <section className="container-site pb-12 md:pb-14">
          <StaggerContainer stagger={0.09} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <StaggerItem key={str(f, "title")}>
                <FeatureCard title={str(f, "title")} text={str(f, "text")} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}

      {/* Get in touch · FAQs · Have an idea in mind? */}
      <FadeIn direction="up">
        <section className="container-site grid gap-6 pb-12 lg:grid-cols-2 lg:gap-8 md:pb-16">
          <GetInTouchCard
            contact={contact}
            socials={socials}
            title={str(getInTouch, "title") || undefined}
            text={str(getInTouch, "text") || undefined}
          />
          <div className="flex flex-col gap-8">
            <FaqAccordion faqs={faqs} />
            <CtaCard
              title={str(idea, "title") || undefined}
              text={str(idea, "text") || undefined}
              cta={str(idea, "cta_label") || undefined}
              href={str(idea, "cta_href") ? safeHref(str(idea, "cta_href")) : undefined}
            />
          </div>
        </section>
      </FadeIn>
    </>
  );
}
