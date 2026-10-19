import Image from "next/image";
import Link from "next/link";

import { MailIcon, MapPinIcon, PhoneIcon } from "@/components/ui/Icons";
import { EXPLORE_LINKS, LEGAL_LINKS } from "@/content/site";
import { getSettings } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import { formatPhone, phoneHref } from "@/lib/phone";

import { NewsletterForm } from "./NewsletterForm";
import { SocialIcons } from "./SocialIcons";

const CONTACT_LINK = "flex items-start gap-2.5 transition-colors hover:text-brand";
const CONTACT_ICON = "mt-[0.2em] size-[1.1em] shrink-0 text-brand";

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
                <address className="mt-3 flex max-w-72 flex-col gap-2.5 text-body-lg text-ink-soft not-italic md:mt-4">
                  {contact.phone && (
                    <a href={phoneHref(contact.phone)} className={CONTACT_LINK}>
                      <PhoneIcon className={CONTACT_ICON} />
                      <span>{formatPhone(contact.phone)}</span>
                    </a>
                  )}
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className={CONTACT_LINK}>
                      <MailIcon className={CONTACT_ICON} />
                      <span className="break-all">{contact.email}</span>
                    </a>
                  )}
                  {contact.address &&
                    (contact.map_url ? (
                      <a href={contact.map_url} target="_blank" rel="noopener noreferrer" className={CONTACT_LINK} title="Open in Google Maps">
                        <MapPinIcon className={CONTACT_ICON} />
                        <span>{contact.address}</span>
                      </a>
                    ) : (
                      <span className={CONTACT_LINK}>
                        <MapPinIcon className={CONTACT_ICON} />
                        <span>{contact.address}</span>
                      </span>
                    ))}
                </address>
                <div className="mt-4">
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
        </ul>
      </div>
    </footer>
  );
}
