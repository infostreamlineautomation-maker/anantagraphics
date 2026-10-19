import { getSettings } from "@/lib/api";

import { HeaderNav } from "./HeaderNav";

/**
 * Red pill nav with the round logo badge in the middle (Figma 101:5). It floats over the page and stays
 * pinned to the top while scrolling (the band around the pill is transparent): hero sections slide
 * underneath it with the `under-header` utility.
 */
export async function SiteHeader() {
  const { brand, contact, socials } = await getSettings();
  return (
    // Clicks pass through the transparent band; the pill, badge and menu opt back in (HeaderNav)
    <header className="pointer-events-none sticky top-0 z-30 h-(--header-h)">
      <HeaderNav brand={brand} contact={contact} socials={socials} />
    </header>
  );
}
