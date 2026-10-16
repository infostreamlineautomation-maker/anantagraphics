import { getSettings } from "@/lib/api";

import { HeaderNav } from "./HeaderNav";

/**
 * Red pill nav with the round logo badge in the middle (Figma 101:5). It floats over the page:
 * hero sections slide underneath it with the `under-header` utility.
 */
export async function SiteHeader() {
  const { brand, contact, socials } = await getSettings();
  return (
    <header className="relative z-30 h-(--header-h)">
      <HeaderNav brand={brand} contact={contact} socials={socials} />
    </header>
  );
}
