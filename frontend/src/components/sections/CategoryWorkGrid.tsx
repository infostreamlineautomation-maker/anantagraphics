"use client";

import { useState } from "react";
import Link from "next/link";
import { MediaImage } from "@/components/ui/MediaImage";
import { ImageLightbox, type LightboxItem } from "@/components/ui/ImageLightbox";
import type { ProjectCard } from "@/lib/types";

type Props = {
  categoryName: string;
  categorySlug: string;
  projects: ProjectCard[];
};

export function CategoryWorkGrid({
  categoryName,
  categorySlug,
  projects,
}: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const lightboxItems: LightboxItem[] = projects.map((p) => ({
    src: p.cover_image,
    title: p.title,
    subtitle: p.short_description ?? undefined,
    alt: p.title,
  }));

  const openLightbox = (index: number) => {
    setActiveIdx(index);
    setLightboxOpen(true);
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="mx-auto mt-12 max-w-md text-center py-12">
        <p className="font-serif text-body-lg text-muted">
          New projects are being added to {categoryName} soon.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex items-center justify-center rounded-btn bg-brand px-6 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          Talk to us about your project
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-6 lg:grid-cols-3 md:mt-10 lg:gap-8">
        {projects.map((p, i) => (
          <div
            key={p.id || p.slug || i}
            className="group/item flex flex-col"
          >
            {/* Clickable work box that opens large lightbox */}
            <button
              type="button"
              onClick={() => openLightbox(i)}
              aria-label={`View ${p.title} image large`}
              className="group/box relative block w-full aspect-[6/7] overflow-hidden rounded-media bg-panel shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-zoom-in text-left focus:outline-none focus:ring-2 focus:ring-brand/50"
            >
              <MediaImage
                src={p.cover_image}
                alt={p.title}
                sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 48vw"
                preload={i === 0}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/box:scale-105"
              />

              {/* Subtle dark gradient overlay on hover for contrast */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/box:opacity-100"
              />

              {/* Zoom cue icon badge */}
              <div
                aria-hidden
                className="absolute top-2 right-2 sm:top-3 sm:right-3 rounded-full bg-black/60 text-white p-1.5 sm:p-2 shadow-md backdrop-blur-sm opacity-0 transition-opacity duration-200 group-hover/box:opacity-100 flex items-center justify-center"
              >
                <svg className="size-3.5 sm:size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </div>
            </button>

            {/* Work title below the image */}
            <div className="mt-2.5 sm:mt-3.5 px-0.5">
              <button
                type="button"
                onClick={() => openLightbox(i)}
                className="text-left font-sans text-sm sm:text-base md:text-h4 font-medium text-ink transition-colors hover:text-brand cursor-pointer line-clamp-2 leading-snug"
              >
                {p.title}
              </button>
              {p.short_description && (
                <p className="mt-1 font-serif text-xs sm:text-sm text-muted line-clamp-2 leading-relaxed">
                  {p.short_description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <ImageLightbox
        isOpen={lightboxOpen}
        items={lightboxItems}
        currentIndex={activeIdx}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(idx) => setActiveIdx(idx)}
      />
    </>
  );
}
