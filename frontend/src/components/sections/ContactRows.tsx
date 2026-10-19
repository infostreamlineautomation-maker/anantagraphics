import type { ComponentType, SVGProps } from "react";

import { MailIcon, MapPinIcon, PhoneIcon } from "@/components/ui/Icons";
import { formatPhone, phoneHref } from "@/lib/phone";
import type { Settings } from "@/lib/types";

type Row = { Icon: ComponentType<SVGProps<SVGSVGElement>>; label: string; text: string; href?: string; hint?: string };

/** Call / Email / Address rows built from the CMS contact settings. */
export function contactRows(contact: Settings["contact"]): Row[] {
  const rows: Row[] = [];
  if (contact.phone) rows.push({ Icon: PhoneIcon, label: "Call Us", text: formatPhone(contact.phone), href: phoneHref(contact.phone) });
  if (contact.email) rows.push({ Icon: MailIcon, label: "Email Us", text: contact.email, href: `mailto:${contact.email}` });
  if (contact.address) {
    rows.push({ Icon: MapPinIcon, label: "Office Address", text: contact.address, href: contact.map_url || undefined, hint: contact.map_url ? "Open in Google Maps ↗" : undefined });
  }
  return rows;
}

/** The bordered contact rows on the dark "Get In Touch" card (dark) and the contact page (light). */
export function ContactRows({ rows, tone }: { rows: Row[]; tone: "dark" | "light" }) {
  const dark = tone === "dark";
  return (
    <ul className="flex flex-col gap-3 md:gap-4">
      {rows.map(({ Icon, ...r }) => {
        const body = (
          <>
            <span
              aria-hidden
              className={`flex size-9 shrink-0 items-center justify-center rounded-full md:size-10 ${dark ? "bg-white/10 text-white" : "bg-brand-tint text-brand"}`}
            >
              <Icon className="size-[1.125rem]" />
            </span>
            <span className="min-w-0 font-alt leading-snug">
              <span className={`block text-small ${dark ? "text-white/75" : "text-muted"}`}>{r.label}</span>
              <span className={`block text-small font-medium break-words ${dark ? "text-white" : "text-ink"}`}>{r.text}</span>
              {r.hint && <span className={`mt-0.5 block text-xs underline ${dark ? "text-white/75" : "text-brand"}`}>{r.hint}</span>}
            </span>
          </>
        );
        const box = `flex items-center gap-3 rounded-lg border px-3 py-2.5 md:gap-4 md:px-4 ${
          dark ? "border-white/15 bg-white/5 hover:border-white/30" : "border-ink-soft/40 bg-white hover:border-brand"
        } transition-colors`;
        return (
          <li key={r.label}>
            {r.href ? (
              <a href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={box}>
                {body}
              </a>
            ) : (
              <div className={box}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
