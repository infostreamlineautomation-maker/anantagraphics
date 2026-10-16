import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { ArrowUpRight } from "./Icons";

type Variant = "brand" | "light" | "dark";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  brand: "bg-brand text-white hover:bg-brand-strong",          // "View Work", "Send Message", "Join"
  light: "bg-white text-ink hover:bg-panel",                   // on red cards: "Request Quote", "Our Services"
  dark: "bg-ink-soft text-white hover:bg-ink",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-5 text-xs md:h-9 md:px-7 md:text-sm",            // Figma 15: card buttons
  md: "h-10 px-6 text-sm md:h-11 md:px-8 md:text-[0.9375rem]", // Figma 22–25: form buttons
  lg: "h-11 px-7 text-[0.9375rem] md:h-12 md:px-9 md:text-base", // Figma 30: "Let's Work Together"
};

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-pill font-sans transition-colors duration-200 disabled:opacity-60";

export function buttonClasses(variant: Variant = "brand", size: Size = "md", className = "") {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`;
}

type Common = { variant?: Variant; size?: Size; arrow?: boolean };

type ButtonLinkProps = ComponentProps<typeof Link> & Common;

/** Pill link button. `arrow` adds the design's ↗ ("View Work ↗"). */
export function ButtonLink({ variant = "brand", size = "md", arrow = false, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {children}
      {arrow && <ArrowUpRight className="size-3.5" />}
    </Link>
  );
}

type ButtonProps = ComponentProps<"button"> & Common;

export function Button({ variant = "brand", size = "md", arrow = false, className, type = "button", children, ...props }: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...props}>
      {children}
      {arrow && <ArrowUpRight className="size-3.5" />}
    </button>
  );
}

/** White pill with a black circled arrow ("Our Services ⭧" on the red service card). */
export function CircleArrowLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 rounded-pill bg-white py-1.5 pr-1.5 pl-5 font-sans text-sm text-ink transition-colors hover:bg-panel md:text-base ${className}`}
    >
      {children}
      <span className="flex size-8 items-center justify-center rounded-full bg-ink text-white transition-transform group-hover:rotate-45 md:size-9">
        <ArrowUpRight className="size-4" />
      </span>
    </Link>
  );
}
