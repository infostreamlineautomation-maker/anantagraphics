import type { Metadata } from "next";
import { Suspense } from "react";

import { ContactForm, ContactFormFromUrl } from "@/components/forms/ContactForm";
import { SocialIcons } from "@/components/layout/SocialIcons";
import { ContactRows, contactRows } from "@/components/sections/ContactRows";
import { MediaImage } from "@/components/ui/MediaImage";
import { FadeIn } from "@/components/ui/Motion";
import { getPage, getServices, getSettings } from "@/lib/api";
import { section, str } from "@/lib/content";

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "Contact Us",
  description: "Tell us about your design, printing, packaging, signage or corporate gifting project.",
};

// Exact Google Maps place embed for Ananta Graphics with business rating & card pinned
const DEFAULT_ANANTA_EMBED_URL =
  "https://maps.google.com/maps?q=Ananta+Graphics%2C+LG-04%2C+Hiral+Arcade%2C+opp.+New+Court+Building%2C+Meghdoot+Society%2C+Athwalines%2C+Athwa%2C+Surat%2C+Gujarat+395007&t=&z=17&ie=UTF8&iwloc=&output=embed";

function resolveMapEmbedUrl(raw?: string | null): string {
  if (!raw) return DEFAULT_ANANTA_EMBED_URL;
  const trimmed = raw.trim();
  // Support pasting full <iframe src="..." /> snippet from Google Maps
  const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const url = iframeMatch ? iframeMatch[1] : trimmed;
  // If the saved setting is the old generic query without Ananta Graphics, use the exact pinned URL
  if (url.includes("q=Hiral+Arcade") && !url.includes("Ananta")) {
    return DEFAULT_ANANTA_EMBED_URL;
  }
  return url;
}

export default async function ContactPage() {
  const [sections, services, { contact, socials }] = await Promise.all([getPage("contact"), getServices(), getSettings()]);
  const hero = section(sections, "hero");
  const form = section(sections, "form");
  const formProps = { services: services.map(({ id, title }) => ({ id, title })), submitLabel: str(form, "submit_label", "Send Message") };

  const mapEmbedUrl = resolveMapEmbedUrl((contact as { map_embed_url?: string }).map_embed_url);

  return (
    <>
      <section className="under-header relative h-[clamp(14rem,24vw,20rem)] overflow-hidden bg-panel">
        <MediaImage src={str(hero, "image")} alt={str(hero, "image_alt")} sizes="100vw" preload />
      </section>

      <div className="container-site relative -mt-12 md:-mt-20">
        <FadeIn direction="up">
          <div className="grid gap-6 bg-brand p-5 md:p-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-8 lg:p-12 rounded-[20px] md:rounded-[28px] shadow-2xl overflow-hidden">
            <FadeIn direction="right" delay={0.1}>
              <div className="text-white">
                <h1 className="font-sans text-h3 font-bold">{str(hero, "title", "Let’s talk about your next project.")}</h1>
                {str(hero, "text") && <p className="mt-3 max-w-md font-sans text-small text-white/90">{str(hero, "text")}</p>}
                <div className="mt-6 rounded-media bg-white p-5 text-ink shadow-sm md:p-7">
                  <ContactRows rows={contactRows(contact)} tone="light" />
                  <div className="mt-5 border-t border-line pt-4">
                    <p className="font-alt text-small text-muted">Connect with us</p>
                    <div className="mt-3">
                      <SocialIcons socials={socials} />
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="left" delay={0.15}>
              <section id="contact-form" className="scroll-mt-8 rounded-media bg-white p-5 shadow-sm md:p-8" aria-labelledby="contact-form-heading">
                <p className="font-mono text-eyebrow text-ink-soft">{str(form, "eyebrow", "Contact Form")}</p>
                <h2 id="contact-form-heading" className="mt-1 font-sans text-h3 font-medium text-ink">
                  {str(form, "title", "Tell us about your project.")}
                </h2>
                <div className="mt-5 md:mt-6">
                  <Suspense fallback={<ContactForm {...formProps} />}>
                    <ContactFormFromUrl {...formProps} />
                  </Suspense>
                </div>
              </section>
            </FadeIn>
          </div>
        </FadeIn>
      </div>

      {/* Embedded Google Map with pinned studio location */}
      <section className="container-site pt-8 md:pt-12 pb-16 md:pb-24" aria-label="Our Location">
        <FadeIn direction="up" delay={0.1}>
          <div className="relative h-[380px] sm:h-[460px] md:h-[520px] w-full overflow-hidden rounded-[20px] md:rounded-[28px] border border-line bg-panel shadow-sm">
            <iframe
              title="Ananta Graphics Office Location"
              src={mapEmbedUrl}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </FadeIn>
      </section>
    </>
  );
}
