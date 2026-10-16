/** Static navigation. Brand, contact details and socials come from the CMS (lib/api.ts). */

export type NavLink = { label: string; href: string };

// Header pill: two links either side of the logo badge
export const NAV_LEFT: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
];
export const NAV_RIGHT: NavLink[] = [
  { label: "Our work", href: "/our-work" },
  { label: "Contact Us", href: "/contact" },
];
export const NAV_LINKS: NavLink[] = [...NAV_LEFT, ...NAV_RIGHT];

export const EXPLORE_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Work", href: "/our-work" },
  { label: "Contact Us", href: "/contact" },
];

export const LEGAL_LINKS: NavLink[] = [
  { label: "Sitemap", href: "/sitemap.xml" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookie Policy", href: "/cookies" },
];

export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
