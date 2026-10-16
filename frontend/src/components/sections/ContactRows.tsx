import type { Settings } from "@/lib/types";

type Row = { icon: string; label: string; text: string; href?: string };

/** Call / Email / Address rows built from the CMS contact settings. */
export function contactRows(contact: Settings["contact"]): Row[] {
  return [
    { icon: "📞", label: "Call Us", text: contact.phone, href: `tel:${contact.phone.replace(/[^\d+]/g, "")}` },
    { icon: "✉️", label: "Email Us", text: contact.email, href: `mailto:${contact.email}` },
    { icon: "📍", label: "Office Address", text: contact.address, href: contact.map_url },
  ];
}

/** The bordered contact rows on the dark "Get In Touch" card (dark) and the contact page (light). */
export function ContactRows({ rows, tone }: { rows: Row[]; tone: "dark" | "light" }) {
  const dark = tone === "dark";
  return (
    <ul className="flex flex-col gap-3 md:gap-4">
      {rows.map((r) => {
        const body = (
          <>
            <span
              aria-hidden
              className={`flex size-9 shrink-0 items-center justify-center rounded-md text-base md:size-10 ${dark ? "bg-white/8" : ""}`}
            >
              {r.icon}
            </span>
            <span className="min-w-0 font-alt leading-snug">
              <span className={`block text-small ${dark ? "text-white" : "text-ink"}`}>{r.label}</span>
              <span className={`block text-small font-medium break-words ${dark ? "text-white" : "text-ink"}`}>{r.text}</span>
            </span>
          </>
        );
        const box = `flex items-center gap-3 rounded-lg border px-3 py-2 md:gap-4 md:px-4 ${
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
