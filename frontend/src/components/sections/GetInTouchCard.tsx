import { FacebookOutline, InstagramOutline, LinkedInOutline, YouTubeOutline } from "@/components/ui/Icons";
import type { Settings, SocialKey } from "@/lib/types";

import { ContactRows, contactRows } from "./ContactRows";

const SOCIAL_ICONS: { key: SocialKey; label: string; Icon: typeof LinkedInOutline }[] = [
  { key: "linkedin", label: "LinkedIn", Icon: LinkedInOutline },
  { key: "facebook", label: "Facebook", Icon: FacebookOutline },
  { key: "instagram", label: "Instagram", Icon: InstagramOutline },
  { key: "youtube", label: "YouTube", Icon: YouTubeOutline },
];

type Props = Pick<Settings, "contact" | "socials"> & {
  title?: string;
  text?: string;
};

/** Clean white card: "Get In Touch", contact rows, "Connect with us" + outline social icons. */
export function GetInTouchCard({
  contact,
  socials,
  title = "Get In Touch",
  text = "Tell us about your design, printing or packaging requirement. We’ll respond within 24 hours.",
}: Props) {
  const links = SOCIAL_ICONS.filter((s) => socials[s.key]);
  return (
    <section className="rounded-media bg-white p-6 text-ink md:p-10 border border-line shadow-sm hover:shadow-lg transition-shadow duration-300">
      <h2 className="font-sans text-h3 font-medium text-brand max-md:text-2xl">{title}</h2>
      <p className="mt-2 max-w-md font-alt text-small text-ink-soft">{text}</p>
      <div className="mt-6 md:mt-8">
        <ContactRows rows={contactRows(contact)} tone="light" />
      </div>
      {links.length > 0 && (
        <div className="mt-6 border-t border-line pt-4 md:mt-8">
          <p className="font-alt text-small text-muted">Connect with us</p>
          <ul className="mt-3 flex gap-4">
            {links.map(({ key, label, Icon }) => (
              <li key={key}>
                <a
                  href={socials[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="block text-ink transition-all duration-200 hover:-translate-y-1 hover:text-brand hover:scale-110 active:scale-95"
                >
                  <Icon className="size-8" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
