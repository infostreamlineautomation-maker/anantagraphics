import Image from "next/image";
import Link from "next/link";

import { EXPLORE_LINKS, LEGAL_LINKS } from "@/content/site";
import { getSettings } from "@/lib/api";
import { mediaUrl } from "@/lib/media";

import { NewsletterForm } from "./NewsletterForm";
import { SocialIcons } from "./SocialIcons";

/** Light-grey footer: logo, tagline + newsletter, Explore, Get in Touch; white legal bar below. */
export async function SiteFooter() {
  const { brand, contact, socials, footer } = await getSettings();

  return (
    <footer className="font-footer">
      <div className="bg-panel">
        <div className="container-site py-10 md:py-12">
          <Link href="/" aria-label={`${brand.name} home`} className="inline-block">
            <Image
              src={mediaUrl(brand.logo)}
              alt={brand.name}
              width={900}
              height={239}
              sizes="(min-width: 768px) 256px, 208px"
              className="h-auto w-52 md:w-64"
            />
          </Link>

          <div className="mt-7 grid gap-10 md:mt-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
            <div>
              <p className="max-w-xl font-tagline text-tagline font-bold text-ink">{footer.tagline}</p>
              <p className="mt-5 text-body-lg text-ink-soft md:mt-7">{footer.newsletter_text}</p>
              <NewsletterForm />
            </div>

            <div className="grid grid-cols-2 gap-8 sm:gap-14 lg:pt-1">
              <nav aria-label="Explore">
                <p className="text-title font-semibold text-ink">Explore</p>
                <ul className="mt-3 flex flex-col gap-2.5 md:mt-4 md:gap-3.5">
                  {EXPLORE_LINKS.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-body-lg text-ink-soft transition-colors hover:text-brand">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div>
                <p className="text-title font-semibold text-ink">Get in Touch</p>
                <address className="mt-3 flex max-w-64 flex-col gap-1.5 text-body-lg text-ink-soft not-italic md:mt-4">
                  <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="hover:text-brand">
                    {contact.phone}
                  </a>
                  <a href={`mailto:${contact.email}`} className="break-all hover:text-brand">
                    {contact.email}
                  </a>
                  <a href={contact.map_url} target="_blank" rel="noopener noreferrer" className="hover:text-brand">
                    {contact.address}
                  </a>
                </address>
                <div className="mt-3">
                  <SocialIcons socials={socials} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-site flex flex-col gap-3 py-5 text-small text-ink-soft md:flex-row md:items-center md:justify-between md:text-body">
        <p>{footer.copyright}</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {LEGAL_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:text-brand">
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/cookies#settings" className="hover:text-brand">
              Cookie Settings
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
