import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ClientLogos } from "@/components/sections/ClientLogos";
import { ContactRows, contactRows } from "@/components/sections/ContactRows";
import { CtaCard } from "@/components/sections/CtaCard";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { GetInTouchCard } from "@/components/sections/GetInTouchCard";
import { ServiceCarousel } from "@/components/sections/ServiceCarousel";
import { ShowcaseBlock } from "@/components/sections/ShowcaseBlock";
import { WorkCard } from "@/components/sections/WorkCard";
import { Button, ButtonLink, CircleArrowLink } from "@/components/ui/Button";
import { Chip, FeatureCard, InfoCard, StatCard } from "@/components/ui/Cards";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSettings } from "@/lib/api";

// Internal preview of the design system (phase 2). Images are filled in from the CMS later,
// so media slots show neutral placeholders here.
export const instant = false;
export const metadata: Metadata = { title: "Styleguide", robots: { index: false } };

const COLORS = [
  ["brand", "bg-brand"], ["brand-bright", "bg-brand-bright"], ["accent", "bg-accent"], ["cta", "bg-cta"],
  ["ink-soft", "bg-ink-soft"], ["night-soft", "bg-night-soft"], ["muted", "bg-muted"], ["faint", "bg-faint"],
  ["line", "bg-line"], ["panel", "bg-panel"], ["slate", "bg-slate"],
] as const;

const SERVICES = [
  { title: "Designing & Printing", description: "Creative graphic design and high-quality printing for branding, marketing and promotional materials.", href: "/our-work" },
  { title: "Packaging Solutions", description: "Custom packaging designed to protect, present and promote your products.", href: "/our-work" },
  { title: "Signage", description: "Branded signage that makes your business easy to find and remember.", href: "/our-work" },
  { title: "Corporate Gifting", description: "Branded gift sets your clients will keep.", href: "/our-work" },
];

const FAQS = [
  { question: "Can I customize products?", answer: "Yes — every piece is designed around your brand, size and finish requirements." },
  { question: "What is MOQ?", answer: "Minimum order quantities depend on the product; we’ll confirm them with your quote." },
  { question: "Do you provide samples?", answer: "Yes, we can produce samples or digital proofs before the full run." },
];

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-10">
      <p className="mb-6 font-mono text-small tracking-widest text-muted uppercase">{title}</p>
      {children}
    </section>
  );
}

export default async function StyleguidePage() {
  const { contact, socials, brand } = await getSettings();
  const clients = Array.from({ length: 10 }, (_, i) => ({ name: `Client ${i + 1}`, logo: brand.logo }));

  return (
    <div className="container-site pb-16">
      <Block title="Colours">
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {COLORS.map(([name, cls]) => (
            <li key={name}>
              <span className={`block h-14 rounded-lg border border-line ${cls}`} />
              <span className="mt-1 block font-mono text-small">{name}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Typography">
        <div className="space-y-4">
          <p className="font-display text-hero font-bold">Visual ideas, made to leave a mark.</p>
          <SectionHeading
            eyebrow="WHAT WE CREATE"
            title="Visual ideas, made to leave a mark."
            lead="From identity and print to campaigns, events and experiences, we create visual work that feels considered, distinctive and built for real-world impact."
          />
          <p className="font-showcase text-h3">01 <span className="text-faint">—</span> Brand Identity</p>
          <p className="font-tagline text-tagline font-bold">Let’s build brand, print and digital experiences.</p>
          <p className="font-sans text-h4">01 — Printed Materials</p>
          <p className="font-serif text-body-lg text-muted">Professional print products created for everyday business and marketing needs.</p>
          <p className="font-caption text-h4">Ideas Turned Into Visuals.</p>
        </div>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink href="/our-work" size="sm" arrow>View Work</ButtonLink>
          <ButtonLink href="/about" size="lg">Let’s Work Together</ButtonLink>
          <Button>Send Message</Button>
          <div className="rounded-lg bg-brand-bright p-4">
            <CircleArrowLink href="/our-work">Our Services</CircleArrowLink>
          </div>
          <div className="rounded-lg bg-cta p-4">
            <ButtonLink href="/contact" variant="light" size="lg">Request Quote</ButtonLink>
          </div>
        </div>
      </Block>

      <Block title="Showcase block">
        <ShowcaseBlock number="01" title="Printing & Designing" image="/uploads/figma/showcase/print-editorial-hero.jpg" alt="Printing & Designing" />
      </Block>

      <Block title="Service carousel">
        <ServiceCarousel items={SERVICES} />
      </Block>

      <Block title="Work / project cards">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <WorkCard number="01" title="Printed Materials" text="Professional print products created for everyday business and marketing needs." href="/our-work" />
          <WorkCard number="02" title="Packaging" text="Custom packaging solutions designed to protect, present and promote your products." href="/our-work" />
          <WorkCard variant="project" number="01" title="Premium Product Packaging" text="Custom packaging design with branded graphics and print-ready artwork." href="/our-work" cta="View Project" />
        </div>
      </Block>

      <Block title="Client logos">
        <ClientLogos clients={clients} />
        <div className="mt-10">
          <ClientLogos clients={clients.slice(0, 8)} variant="grid" />
        </div>
      </Block>

      <Block title="Cards">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard value="360" label="Brand, print and digital thinking" />
          <StatCard value="Fast" label="Production-ready execution" />
          <StatCard value="Premium" label="Brand, print and digital thinking" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <InfoCard eyebrow="See beyond the brief" title="Our Vision">
            <p>To become a global leader in sustainable packaging solutions through innovation, quality, and customer-focused manufacturing.</p>
          </InfoCard>
          <InfoCard eyebrow="Deliver with precision" title="Our Mission">
            <p>To deliver high-quality packaging materials and custom manufacturing solutions that help businesses grow.</p>
          </InfoCard>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard title="Premium Print" text="Luxury business cards, brochures and marketing collaterals finished with crisp detail." />
          <FeatureCard title="Creative Branding" text="Packaging, mockups and campaign visuals designed to feel polished, modern and memorable." />
          <FeatureCard title="Large Format" text="Signage, retail panels and exhibition graphics produced to stand out at every scale." />
          <FeatureCard title="Packaging Care" text="Premium materials, consistent color output and dependable delivery for every production run." />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {["Brand Strategy", "AI Production", "Web Experiences", "Print Solutions"].map((c) => <Chip key={c}>{c}</Chip>)}
        </div>
      </Block>

      <Block title="Get in touch · FAQs · CTA">
        <div className="grid gap-6 lg:grid-cols-2">
          <GetInTouchCard contact={contact} socials={{ ...socials, youtube: "https://youtube.com" }} />
          <div className="flex flex-col gap-8">
            <FaqAccordion faqs={FAQS} />
            <CtaCard />
          </div>
        </div>
        <div className="mt-8 max-w-md rounded-media bg-white p-6 shadow-sm">
          <ContactRows rows={contactRows(contact)} tone="light" />
        </div>
      </Block>
    </div>
  );
}
