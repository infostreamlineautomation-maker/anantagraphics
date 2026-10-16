import { mediaUrl } from "@/lib/media";
import type { Settings } from "@/lib/types";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** schema.org LocalBusiness for search results (name, logo, address, phone, social profiles). */
export function BusinessJsonLd({ settings }: { settings: Settings }) {
  const { brand, contact, socials, seo } = settings;
  const abs = (path: string) => {
    const url = mediaUrl(path);
    return url.startsWith("http") ? url : `${SITE}${url}`;
  };
  // Only real profile links (not a bare https://instagram.com/ placeholder)
  const isProfile = (u: string) => {
    try {
      return new URL(u).pathname.length > 1;
    } catch {
      return false;
    }
  };
  const sameAs = Object.values(socials).filter((u): u is string => !!u && isProfile(u));

  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE}/#business`,
    name: brand.name,
    slogan: brand.tagline,
    description: seo.default_description,
    url: `${SITE}/`,
    logo: abs(brand.logo),
    image: abs(seo.og_image || brand.logo),
    telephone: contact.phone,
    email: contact.email,
    address: { "@type": "PostalAddress", streetAddress: contact.address, addressLocality: "Surat", addressRegion: "Gujarat", addressCountry: "IN" },
    hasMap: contact.map_url,
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <script
      type="application/ld+json"
      // JSON in a <script>: escape "<" so CMS text can never close the tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
