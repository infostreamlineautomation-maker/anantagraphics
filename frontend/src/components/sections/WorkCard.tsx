"use client";

import Link from "next/link";
import { MediaImage } from "@/components/ui/MediaImage";

type Props = {
  number?: string;            // "01"
  title: string;              // "Printed Materials"
  text?: string;
  image?: string | null;
  secondary_image?: string | null;
  href: string;
  cta?: string;               // "View Work" / "View Project"
  showCta?: boolean;          // Default false (removed per client request)
  variant?: "category" | "project";
  preload?: boolean;          // first card on the page: it's the largest thing above the fold on phones
  index?: number;
  craft_tags?: string[];
  color_palette?: string[];
};

/**
 * Card on Our Work ("01 — Printed Materials", centred title).
 * Clean, instant, static presentation without 3D flip or slow animations.
 * Clicking on the category image or title navigates straight to that category's work page.
 */
export function WorkCard({
  number,
  title,
  text,
  image,
  href,
  cta = "View Work",
  showCta = false,
  variant = "category",
  preload,
}: Props) {
  const isCategory = variant === "category";
  const label = number ? (isCategory ? `${number} — ${title}` : `${number}. ${title}`) : title;

  return (
    <article className="group/card flex flex-col">
      {/* Image container: clicking navigates directly to the particular work page */}
      <div className="relative block aspect-[6/7] w-full overflow-hidden rounded-media bg-panel shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
        <Link
          href={href}
          aria-label={label}
          className="relative block w-full h-full cursor-pointer"
        >
          <MediaImage
            src={image}
            alt={title}
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 48vw"
            preload={preload}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
          />
        </Link>
      </div>

      {/* Title: clicking navigates directly to the particular work page */}
      <h2 className={`mt-2.5 font-sans text-sm sm:text-base md:text-h4 md:mt-4 font-medium leading-snug ${isCategory ? "text-center" : "px-0.5"}`}>
        <Link href={href} className="transition-colors duration-200 hover:text-brand line-clamp-2">
          {label}
        </Link>
      </h2>

      {/* Description text if present */}
      {text && (
        <p className="mx-auto mt-1 max-w-sm text-center font-serif text-xs sm:text-sm md:text-body-lg text-muted line-clamp-2 leading-relaxed">
          {text}
        </p>
      )}

      {/* Optional CTA button (hidden by default) */}
      {showCta && (
        <div className="mx-auto mt-3 md:mt-4">
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-btn bg-brand px-5 py-2 font-sans text-sm font-medium text-white transition-colors hover:bg-brand-dark"
          >
            {cta}
          </Link>
        </div>
      )}
    </article>
  );
}
