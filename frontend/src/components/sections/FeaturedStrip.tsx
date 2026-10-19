"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { MediaImage } from "@/components/ui/MediaImage";
import { safeHref, str } from "@/lib/content";

type FeaturedItem = Record<string, unknown>;

/**
 * Featured Work Strip directly below "Our Clients":
 * - Displays each featured work card exactly once (no duplicates/repetition)
 * - Complete, un-cut uniform cards (aspect ratio 661/962)
 * - Justified alignment spanning the container width on tablet & desktop, horizontally swipeable on mobile
 * - Subtle hover animations with micro-interaction image zoom and spring lift
 */
export function FeaturedStrip({ images }: { images: FeaturedItem[] }) {
  if (!images || images.length === 0) return null;

  return (
    <section className="container-site pb-12 md:pb-20" aria-label="Featured work">
      {/* Scrollable on mobile, justified across container on tablet & desktop */}
      <div className="-mx-4 overflow-x-auto px-4 pb-4 pt-1 [scrollbar-width:none] scroll-smooth md:mx-0 md:px-0 md:overflow-visible">
        <ul className="flex gap-4 sm:gap-5 md:grid md:grid-cols-3 md:gap-6 lg:gap-8 w-max md:w-full items-center">
          {images.map((img, i) => (
            <motion.li
              key={`${str(img, "image")}-${i}`}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.25, ease: "easeOut" } }}
              className="group relative w-[76vw] sm:w-[44vw] md:w-full shrink-0 md:shrink aspect-[661/962] overflow-hidden rounded-[20px] md:rounded-[26px] bg-panel shadow-sm transition-shadow duration-500 hover:shadow-2xl"
            >
              <Link
                href={safeHref(str(img, "href", "/our-work"), "/our-work")}
                className="block h-full w-full"
                aria-label={str(img, "image_alt", `Featured work drop ${i + 1}`)}
              >
                <MediaImage
                  src={str(img, "image")}
                  alt={str(img, "image_alt")}
                  sizes="(min-width: 1024px) 460px, (min-width: 768px) 380px, 75vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
