"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";

import { ButtonLink } from "@/components/ui/Button";
import { MediaImage } from "@/components/ui/MediaImage";
import { Magnetic } from "@/components/ui/Motion";

type Props = {
  number?: string;            // "01"
  title: string;              // "Printed Materials"
  text?: string;
  image?: string | null;
  secondary_image?: string | null;
  href: string;
  cta?: string;               // "View Work" / "View Project"
  variant?: "category" | "project";
  preload?: boolean;          // first card on the page: it's the largest thing above the fold on phones
  index?: number;
  craft_tags?: string[];
  color_palette?: string[];
};

const DEFAULT_SECONDARY_IMAGES: Record<string, string> = {
  // Categories
  "printed-materials": "/uploads/figma/services/designing-printing.jpg",
  "packaging": "/uploads/figma/projects/custom-retail-packaging.jpg",
  "signage": "/uploads/figma/showcase/brand-identity-card2.jpg",
  "tags-labels": "/uploads/figma/about/hero-bazaar-tags.jpg",
  "pouches": "/uploads/figma/projects/food-beverage-packaging.jpg",
  "corporate-gifting": "/uploads/figma/services/gift-box.jpg",

  // Projects
  "nura-candle-boxes": "/uploads/figma/projects/custom-printed-boxes.jpg",
  "premium-product-packaging": "/uploads/figma/projects/custom-retail-packaging.jpg",
  "custom-retail-packaging": "/uploads/figma/projects/premium-product-packaging.jpg",
  "food-beverage-packaging": "/uploads/figma/projects/ecommerce-packaging.jpg",
  "corporate-gift-packaging": "/uploads/figma/services/gift-box.jpg",
  "ecommerce-product-packaging": "/uploads/figma/projects/custom-printed-boxes.jpg",
  "custom-printed-boxes": "/uploads/figma/projects/explore-nura-boxes.jpg",
  "paper-cup-packaging": "/uploads/figma/projects/paper-cup-intro.jpg",
  "bazaar-gift-packaging": "/uploads/figma/about/hero-bazaar-tags.jpg",
  "glow-serum-box": "/uploads/figma/projects/food-beverage-packaging.jpg",
};

function getSecondaryImage(
  explicitSecondary?: string | null,
  href = "",
  title = "",
  primaryImage?: string | null,
): string {
  if (explicitSecondary) return explicitSecondary;

  const segments = href.split("/").filter(Boolean);
  const slug = segments[segments.length - 1]?.toLowerCase() || "";

  if (slug && DEFAULT_SECONDARY_IMAGES[slug]) {
    return DEFAULT_SECONDARY_IMAGES[slug];
  }

  const l = title.toLowerCase();
  if (l.includes("packag") || l.includes("box") || l.includes("cup")) return "/uploads/figma/projects/custom-retail-packaging.jpg";
  if (l.includes("print") || l.includes("card") || l.includes("folio")) return "/uploads/figma/services/designing-printing.jpg";
  if (l.includes("sign") || l.includes("display")) return "/uploads/figma/showcase/brand-identity-card2.jpg";
  if (l.includes("tag") || l.includes("label")) return "/uploads/figma/about/hero-bazaar-tags.jpg";
  if (l.includes("pouch")) return "/uploads/figma/projects/food-beverage-packaging.jpg";
  if (l.includes("gift")) return "/uploads/figma/services/gift-box.jpg";

  return primaryImage || "/uploads/figma/work-categories/packaging.jpg";
}

/**
 * Card on Our Work ("01 — Printed Materials", centred title) and the category page
 * ("01. Premium Product Packaging", left title).
 * Features a seamless interactive 3D card flip on hover revealing an alternate photo of that work.
 */
export function WorkCard({
  number,
  title,
  text,
  image,
  secondary_image,
  href,
  cta = "View Work",
  variant = "category",
  preload,
  index = 0,
}: Props) {
  const isCategory = variant === "category";
  const label = number ? (isCategory ? `${number} — ${title}` : `${number}. ${title}`) : title;
  const [isFlipped, setIsFlipped] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 160, y: 180 });

  const backImage = getSecondaryImage(secondary_image, href, title, image);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, delay: (index % 3) * 0.09, ease: [0.16, 1, 0.3, 1] as const }}
      className="group/card flex flex-col"
    >
      {/* 3D Flip Card Container */}
      <div
        className="relative block aspect-[6/7] [perspective:1200px]"
        // Flip on mouse hover only: on phones a tap should simply open the work, not flip the card
        onPointerEnter={(e) => e.pointerType === "mouse" && setIsFlipped(true)}
        onPointerLeave={() => setIsFlipped(false)}
        onMouseMove={handleMouseMove}
      >
        <Link
          href={href}
          aria-label={label}
          tabIndex={-1}
          className="relative block w-full h-full rounded-media shadow-md transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
        >
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative w-full h-full"
          >
            {/* FRONT FACE (Primary visual artwork mockup photo) */}
            <div
              style={{ backfaceVisibility: "hidden" }}
              className="absolute inset-0 rounded-media overflow-hidden bg-panel"
            >
              <MediaImage
                src={image}
                alt={title}
                sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 92vw"
                preload={preload}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
              />
              {/* Interactive prompt badge on front */}
              <div
                aria-hidden
                className="absolute top-3 right-3 rounded-full bg-black/60 hover:bg-black/85 text-white px-2.5 py-1 text-[0.6875rem] font-mono tracking-wider shadow-lg backdrop-blur-md opacity-0 transition-all duration-300 group-hover/card:opacity-100 flex items-center gap-1.5 border border-white/20 transform translate-y-1 group-hover/card:translate-y-0"
              >
                <span className="text-xs animate-spin-slow">↻</span>
                <span className="font-semibold">VIEW 2</span>
              </div>
            </div>

            {/* BACK FACE: Another photo of that work */}
            <div
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
              className="absolute inset-0 rounded-media overflow-hidden bg-panel shadow-2xl flex flex-col justify-between border-2 border-brand/40"
            >
              {/* Full-bleed Alternate Image */}
              <MediaImage
                src={backImage}
                alt={`${title} alternate view`}
                sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 92vw"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
              />

              {/* Dynamic specular foil sheen reflection that follows cursor */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-200"
                style={{
                  background: `radial-gradient(circle 240px at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.28), transparent 70%)`,
                  mixBlendMode: "overlay",
                }}
              />

              {/* Atmospheric subtle dark gradients for readable badges and CTA */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/15 to-black/60"
              />

              {/* Decorative print registration corner marks */}
              <div className="absolute top-2.5 left-2.5 size-2 border-t-2 border-l-2 border-white/50 z-20 pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 size-2 border-t-2 border-r-2 border-white/50 z-20 pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 size-2 border-b-2 border-l-2 border-white/50 z-20 pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 size-2 border-b-2 border-r-2 border-white/50 z-20 pointer-events-none" />

              {/* Title only: the single "View Work" button sits under the card */}
              <div className="relative z-20 mt-auto p-5 md:p-6">
                <p className="font-display text-h4 font-bold text-white tracking-tight leading-snug drop-shadow-md truncate">
                  {title}
                </p>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* h2: these cards sit directly under the page's h1 */}
      <h2 className={`mt-3 font-sans text-h4 md:mt-4 ${isCategory ? "text-center" : "px-0.5"}`}>
        <Link href={href} className="transition-colors duration-200 hover:text-brand">
          {label}
        </Link>
      </h2>
      {text && <p className="mx-auto mt-1.5 max-w-sm text-center font-serif text-body-lg text-muted">{text}</p>}
      <div className="mx-auto mt-3 md:mt-4">
        <Magnetic strength={0.25}>
          <ButtonLink href={href} size="sm" arrow className="min-w-36 md:min-w-44 shadow-xs hover:shadow-md">
            {cta}
          </ButtonLink>
        </Magnetic>
      </div>
    </motion.article>
  );
}
