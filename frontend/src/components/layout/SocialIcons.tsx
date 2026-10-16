import Image from "next/image";

import type { Settings, SocialKey } from "@/lib/types";

// Colour icons from the Figma footer (frontend/public/icons)
const ICONS: { key: SocialKey; label: string; src: string }[] = [
  { key: "instagram", label: "Instagram", src: "/icons/instagram.png" },
  { key: "facebook", label: "Facebook", src: "/icons/facebook.png" },
  { key: "linkedin", label: "LinkedIn", src: "/icons/linkedin.png" },
];

/** Instagram / Facebook / LinkedIn colour tiles; only networks with a URL in settings are shown. */
export function SocialIcons({ socials, size = "md" }: { socials: Settings["socials"]; size?: "sm" | "md" }) {
  const items = ICONS.filter((i) => socials[i.key]);
  if (items.length === 0) return null;
  const box = size === "sm" ? "size-7" : "size-8 md:size-9";
  return (
    <ul className="flex items-center gap-2">
      {items.map((i) => (
        <li key={i.key}>
          <a
            href={socials[i.key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={i.label}
            className="block transition-transform duration-300 hover:-translate-y-1 hover:scale-110 active:scale-95"
          >
            <Image src={i.src} alt="" width={72} height={72} className={box} />
          </a>
        </li>
      ))}
    </ul>
  );
}
