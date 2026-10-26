"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { motion } from "motion/react";

import { CloseIcon, MailIcon, MenuIcon, PhoneIcon } from "@/components/ui/Icons";
import { Magnetic } from "@/components/ui/Motion";
import { isActivePath, NAV_LEFT, NAV_LINKS, NAV_RIGHT, type NavLink } from "@/content/site";
import { mediaUrl } from "@/lib/media";
import { formatPhone, phoneHref } from "@/lib/phone";
import type { Settings } from "@/lib/types";

import { SocialIcons } from "./SocialIcons";

type Props = Pick<Settings, "brand" | "contact" | "socials">;

export function HeaderNav({ brand, contact, socials }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock page scroll and listen for Esc while the drawer is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const badge = (
    <Magnetic strength={0.3}>
      <Link href="/" aria-label={`${brand.name} home`} className="relative z-10 block shrink-0 transition-transform hover:scale-[1.05]">
        <Image
          src={mediaUrl(brand.logo_badge)}
          alt={brand.name}
          width={216}
          height={216}
          sizes="(min-width: 1024px) 88px, (min-width: 768px) 78px, 60px"
          preload
          className="size-15 drop-shadow-md md:size-[4.75rem] lg:size-[5.25rem]"
        />
      </Link>
    </Magnetic>
  );

  return (
    <>
      <div className="container-site flex h-full items-center justify-center pt-2 md:pt-3">
        {/* Desktop / tablet: links | badge | links on one red pill */}
        <nav aria-label="Main" className="pointer-events-auto relative hidden items-center md:flex">
          <div aria-hidden className="absolute inset-x-0 top-1/2 h-12 -translate-y-1/2 rounded-pill bg-brand shadow-[0_8px_24px_rgb(0_0_0/0.16)] md:h-13 lg:h-15" />
          <NavGroup links={NAV_LEFT} pathname={pathname} className="pr-6 pl-9 lg:pr-8 lg:pl-12" />
          {badge}
          <NavGroup links={NAV_RIGHT} pathname={pathname} className="pr-9 pl-6 lg:pr-12 lg:pl-8" />
        </nav>

        {/* Phones: menu button | badge | spacer (keeps badge centered in pill) */}
        <div className="pointer-events-auto relative flex w-full max-w-sm items-center justify-between md:hidden">
          <div aria-hidden className="absolute inset-x-0 top-1/2 h-12 -translate-y-1/2 rounded-pill bg-brand shadow-[0_8px_24px_rgb(0_0_0/0.16)]" />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="relative ml-2 flex size-11 items-center justify-center rounded-full text-white active:bg-white/10"
          >
            <MenuIcon className="size-6" />
          </button>
          {badge}
          <span aria-hidden className="relative mr-2 size-11 pointer-events-none" />
        </div>
      </div>

      {/* Mobile drawer portaled to body to guarantee it sits above all page stacking contexts */}
      {mounted &&
        createPortal(
          <div className="pointer-events-auto md:hidden">
            <div
              aria-hidden
              onClick={() => setOpen(false)}
              className={`fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
            />
            <nav
              aria-label="Mobile"
              inert={!open}
              className={`fixed inset-y-0 left-0 z-[90] flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-brand p-5 text-white shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
            >
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <Link href="/" onClick={() => setOpen(false)} aria-label={`${brand.name} home`} className="inline-block">
                  <Image
                    src={mediaUrl(brand.logo)}
                    alt={brand.name}
                    width={900}
                    height={239}
                    sizes="180px"
                    className="h-8 md:h-9 w-auto max-w-[170px] object-contain brightness-0 invert"
                  />
                </Link>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="flex size-10 items-center justify-center rounded-full hover:bg-white/10">
                  <CloseIcon className="size-6" />
                </button>
              </div>
              <ul className="mt-5 flex flex-col gap-1.5">
                {NAV_LINKS.map((l) => {
                  const active = isActivePath(pathname, l.href);
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`block rounded-xl px-4 py-2.5 font-sans text-base font-medium transition-colors ${active ? "bg-white text-brand" : "hover:bg-white/10"}`}
                      >
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-auto space-y-2.5 border-t border-white/15 pt-5 font-sans text-sm text-white/90">
                <SocialIcons socials={socials} size="sm" />
                {contact.phone && (
                  <a href={phoneHref(contact.phone)} className="flex items-center gap-2.5 pt-1 hover:text-white">
                    <PhoneIcon className="size-4 shrink-0" />
                    {formatPhone(contact.phone)}
                  </a>
                )}
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-2.5 break-all hover:text-white">
                    <MailIcon className="size-4 shrink-0" />
                    {contact.email}
                  </a>
                )}
              </div>
            </nav>
          </div>,
          document.body
        )}
    </>
  );
}

function NavGroup({ links, pathname, className }: { links: NavLink[]; pathname: string; className: string }) {
  return (
    <ul className={`relative flex items-center gap-6 lg:gap-8 ${className}`}>
      {links.map((l) => {
        const active = isActivePath(pathname, l.href);
        return (
          <li key={l.href} className="relative py-2.5">
            <Link
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`relative z-10 font-sans text-[0.9375rem] lg:text-base font-medium whitespace-nowrap text-white transition-opacity duration-200 hover:opacity-85`}
            >
              {l.label}
              {active && (
                <motion.span
                  layoutId="activeNavUnderline"
                  className="absolute -bottom-1.5 left-0 right-0 h-[2.5px] bg-white rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
