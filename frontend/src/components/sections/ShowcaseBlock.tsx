"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

import { MediaImage } from "@/components/ui/MediaImage";
import { mediaUrl } from "@/lib/media";

export type ShowcaseGalleryItem = {
  image: string;
  alt: string;
};

export type ShowcaseBlockProps = {
  number: string;
  title: string;
  image?: string | null;
  alt: string;
  href?: string;
  preload?: boolean;
  gallery?: string[];
  bgColor?: string;
};

type CategoryConfig = {
  heroImage: string;
  gallery: ShowcaseGalleryItem[];
  bgColor: string;
};

const SHOWCASE_DEFAULTS: Record<string, CategoryConfig> = {
  "01": {
    heroImage: "/uploads/figma/showcase/brand-identity-hero.jpg",
    gallery: [
      { image: "/uploads/figma/showcase/brand-identity-card1.jpg", alt: "LUXE knitwear brand label" },
      { image: "/uploads/figma/showcase/brand-identity-card2.jpg", alt: "LUXE retail storefront signage" },
      { image: "/uploads/figma/work-categories/tags-labels.jpg", alt: "Brand identity tags & labels" },
      { image: "/uploads/figma/projects/custom-retail-packaging.jpg", alt: "Custom retail identity packaging" },
    ],
    bgColor: "#45231a",
  },
  "02": {
    heroImage: "/uploads/figma/showcase/print-editorial-hero.jpg",
    gallery: [
      { image: "/uploads/figma/showcase/print-editorial-card1.jpg", alt: "Men's Folio editorial photos" },
      { image: "/uploads/figma/showcase/print-editorial-card2.jpg", alt: "Men's Folio layout design" },
      { image: "/uploads/figma/work-categories/printed-materials.jpg", alt: "Fine luxury foiled brochures" },
      { image: "/uploads/figma/services/designing-printing.jpg", alt: "Editorial booklets & catalogs" },
    ],
    bgColor: "#742423",
  },
  "03": {
    heroImage: "/uploads/figma/showcase/events-experiences-hero.jpg",
    gallery: [
      { image: "/uploads/figma/showcase/events-experiences-card1.jpg", alt: "Charlotte Jackson luxury stationery" },
      { image: "/uploads/figma/showcase/events-experiences-card2.jpg", alt: "Exhibition collateral and invites" },
      { image: "/uploads/figma/work-categories/signage.jpg", alt: "Event wayfinding & signage" },
      { image: "/uploads/figma/about/hero-bazaar-tags.jpg", alt: "Bazaar experiential passes" },
    ],
    bgColor: "#c8302b",
  },
  "04": {
    heroImage: "/uploads/figma/showcase/corporate-gifting-hero.jpg",
    gallery: [
      { image: "/uploads/figma/showcase/corporate-gifting-card1.jpg", alt: "Brandwater luxury gift set with flask & mug" },
      { image: "/uploads/figma/showcase/corporate-gifting-card2.jpg", alt: "Custom branded drinkware & stationery" },
      { image: "/uploads/figma/work-categories/corporate-gifting.jpg", alt: "Luxury rigid gift box with satin ribbon" },
      { image: "/uploads/figma/projects/corporate-gift-packaging.jpg", alt: "Corporate celebration kit" },
    ],
    bgColor: "#1e1a17",
  },
};

/**
 * Showcase block strictly replicating the Figma design:
 * - Pristine notched top-left title tab ("01 — Brand Identity") with inverted curves
 * - Clean left hero visual with zero text/button overlays
 * - Right column: clean stacked mockup cards with rounded corners on matching solid background
 * - Seamless, elegant vertical reel animation showing multiple mockups in motion, pausing on hover
 */
export function ShowcaseBlock({
  number,
  title,
  image,
  alt,
  href = "/our-work",
  preload,
  gallery: customGallery,
  bgColor: customBgColor,
}: ShowcaseBlockProps) {
  const config = SHOWCASE_DEFAULTS[number];
  const heroSrc = image || config?.heroImage;
  const galleryItems =
    customGallery && customGallery.length > 0
      ? customGallery.map((img, i) => ({ image: img, alt: `${title} mockup ${i + 1}` }))
      : config?.gallery || [];
  const bgColor = customBgColor || config?.bgColor || "#1e1e1e";

  // Duplicate items for infinite seamless vertical glide
  const loopItems = [...galleryItems, ...galleryItems];

  const body = (
    <div className="@container w-full">
      <motion.article
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -6, transition: { duration: 0.35, ease: "easeOut" } }}
        className="group relative w-full aspect-[16/10] md:aspect-[2.35/1] max-h-[580px] lg:max-h-[620px] xl:max-h-[640px] overflow-hidden rounded-[18px] md:rounded-[24px] bg-panel shadow-sm transition-shadow duration-500 hover:shadow-2xl"
        style={{ backgroundColor: bgColor }}
      >
        {/* Notched title tab with refined, un-zoomed font size and tailored proportions */}
        <h3 className="showcase-tab absolute top-0 left-0 z-20 flex h-9 sm:h-10 md:h-[2.65rem] max-w-[85%] items-center bg-surface pr-5 pl-3.5 sm:pr-6 sm:pl-4 md:pr-7 md:pl-5 font-showcase text-[0.875rem] sm:text-[0.9375rem] md:text-[1.0625rem] leading-none whitespace-nowrap text-ink shadow-xs">
          <span className="font-medium">{number}</span>
          <span className="mx-2 text-faint font-normal">—</span>
          <span>{title}</span>
        </h3>

        {/* 2-Column Layout matching Figma proportions: 58% Left Hero, 42% Right Cards */}
        <div className="grid h-full w-full grid-cols-[1fr_0.725fr]">
          {/* Left Hero Visual */}
          <div className="relative h-full w-full overflow-hidden">
            <MediaImage
              src={heroSrc}
              alt={alt}
              sizes="(min-width: 1440px) 960px, (min-width: 768px) 60vw, 100vw"
              preload={preload}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
          </div>

          {/* Right Column: Clean aesthetic animated mockup cards */}
          <div
            className="showcase-reel relative h-full w-full overflow-hidden p-3 sm:p-4 md:p-[1.4cqw]"
            style={{ backgroundColor: bgColor }}
          >
            {galleryItems.length > 0 ? (
              <div
                className="showcase-reel-up flex flex-col gap-2.5 sm:gap-3 md:gap-[1.2cqw] will-change-transform"
                style={{ "--reel-duration": "32s" } as React.CSSProperties}
              >
                {loopItems.map((item, idx) => (
                  <div
                    key={`${item.image}-${idx}`}
                    className="relative aspect-[645/455] w-full shrink-0 overflow-hidden rounded-[10px] md:rounded-[14px] bg-panel shadow-sm transition-transform duration-500 group-hover:scale-[1.01]"
                  >
                    <Image
                      src={mediaUrl(item.image)}
                      alt={item.alt}
                      fill
                      sizes="(min-width: 1024px) 500px, 350px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <MediaImage src={image} alt={alt} sizes="40vw" className="object-cover" />
            )}
          </div>
        </div>
      </motion.article>
    </div>
  );

  return href ? (
    <Link href={href} className="block transition-opacity hover:opacity-98" aria-label={`${number} — ${title}`}>
      {body}
    </Link>
  ) : (
    body
  );
}
