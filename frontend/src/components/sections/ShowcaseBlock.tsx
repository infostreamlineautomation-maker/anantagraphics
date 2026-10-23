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
    heroImage: "/uploads/figma/showcase/print-editorial-hero.jpg",
    gallery: [
      { image: "/uploads/figma/showcase/print-editorial-card1.jpg", alt: "Men's Folio editorial photos" },
      { image: "/uploads/figma/showcase/print-editorial-card2.jpg", alt: "Editorial layout design" },
      { image: "/uploads/figma/work-categories/printed-materials.jpg", alt: "Fine luxury foiled brochures" },
      { image: "/uploads/figma/services/designing-printing.jpg", alt: "Editorial booklets & catalogs" },
    ],
    bgColor: "#742423",
  },
  "02": {
    heroImage: "/uploads/figma/projects/custom-printed-boxes.jpg",
    gallery: [
      { image: "/uploads/figma/work-categories/packaging.jpg", alt: "Luxury rigid packaging boxes" },
      { image: "/uploads/figma/projects/custom-retail-packaging.jpg", alt: "Custom retail identity packaging" },
      { image: "/uploads/figma/projects/ecommerce-packaging.jpg", alt: "E-commerce custom mailer boxes" },
      { image: "/uploads/figma/work-categories/pouches.jpg", alt: "Custom flexible stand-up pouches" },
    ],
    bgColor: "#45231a",
  },
  "03": {
    heroImage: "/uploads/figma/work-categories/signage.jpg",
    gallery: [
      { image: "/uploads/figma/home/hero-shopfront.jpg", alt: "Retail shopfront window graphics and 3D signage" },
      { image: "/uploads/figma/showcase/brand-identity-card2.jpg", alt: "LUXE storefront retail signage" },
      { image: "/uploads/figma/showcase/events-experiences-card2.jpg", alt: "Wayfinding and directional exhibition signs" },
      { image: "/uploads/figma/work-categories/signage.jpg", alt: "Illuminated architectural signage" },
    ],
    bgColor: "#1f2937",
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
  "05": {
    heroImage: "/uploads/figma/showcase/brand-identity-hero.jpg",
    gallery: [
      { image: "/uploads/figma/showcase/brand-identity-card1.jpg", alt: "International knitwear brand label" },
      { image: "/uploads/figma/showcase/events-experiences-card1.jpg", alt: "Charlotte Jackson international luxury stationery" },
      { image: "/uploads/figma/projects/paper-cup-gallery-1.jpg", alt: "Global carry packaging and custom drinkware" },
      { image: "/uploads/figma/about/hero-bazaar-tags.jpg", alt: "Bazaar experiential passes and tags" },
    ],
    bgColor: "#1d3557",
  },
};

/**
 * Showcase block strictly replicating the Figma design:
 * - Pristine notched top-left title tab ("01 — Printing & Designing") with inverted curves
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
        {/* Notched title tab with larger normal global font */}
        <h3 className="showcase-tab absolute top-0 left-0 z-20 flex h-13 sm:h-14 md:h-16 lg:h-[4.5rem] xl:h-[4.85rem] max-w-[92%] items-center bg-surface pl-4 pr-6 sm:pl-6 sm:pr-8 md:pl-8 md:pr-11 lg:pl-10 lg:pr-14 font-sans text-lg sm:text-xl md:text-2xl lg:text-[1.75rem] xl:text-[1.95rem] leading-none whitespace-nowrap text-ink shadow-sm">
          <span className="font-semibold text-brand">{number}</span>
          <span className="mx-2.5 sm:mx-3 text-ink/30 font-normal">—</span>
          <span className="font-normal text-ink tracking-tight">{title}</span>
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
