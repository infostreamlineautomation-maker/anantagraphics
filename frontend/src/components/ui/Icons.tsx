import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** ↗ used on "View Work", "View Project", service cards. */
export function ArrowUpRight(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

/** ⊕ on FAQ rows. */
export function PlusCircle(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} strokeWidth={1.5} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/* Outline social glyphs for the dark "Get In Touch" card ("Connect with us"). */
export function LinkedInOutline(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} strokeWidth={1.5} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
    </svg>
  );
}

export function FacebookOutline(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} strokeWidth={1.5} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M15 8h-1.5A2.5 2.5 0 0 0 11 10.5V21M9 13h5" />
    </svg>
  );
}

export function InstagramOutline(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} strokeWidth={1.75} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5v.01" />
    </svg>
  );
}

export function YouTubeOutline(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} strokeWidth={1.5} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="m10 9 5 3-5 3z" />
    </svg>
  );
}
