"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { MediaImage } from "@/components/ui/MediaImage";
import { safeHref, str } from "@/lib/content";

type FeaturedItem = Record<string, unknown>;

/**
 * Featured Work Strip directly below "Our Clients":
 * - Displays each featured work card exactly once (no repetition)
 * - Complete, un-cut uniform cards (full aspect ratio 661/962)
 * - Horizontally scrollable and swipable across desktop and mobile
 * - Subtle hover animations with micro-interaction image zoom and spring lift
 */
export function FeaturedStrip({ images }: { images: FeaturedItem[] }) {
  if (!images || images.length === 0) return null;

  return (
    <section className="container-site pb-12 md:pb-20" aria-label="Featured work">
      {/* Scrollable Track - No repeating items */}
      <div className="-mx-4 overflow-x-auto px-4 pb-4 pt-1 [scrollbar-width:none] scroll-smooth md:mx-0 md:px-0">
        <ul className="flex gap-4 md:gap-5 lg:gap-6 py-1 w-max">
          {images.map((img, i) => (
            <motion.li
              key={`${str(img, "image")}-${i}`}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
              className="group relative h-[21rem] sm:h-[25rem] md:h-[27rem] lg:h-[29rem] aspect-[661/962] shrink-0 overflow-hidden rounded-[20px] md:rounded-[26px] bg-panel shadow-sm transition-shadow duration-500 hover:shadow-2xl"
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
