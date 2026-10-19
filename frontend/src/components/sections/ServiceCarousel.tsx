"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";

import { CircleArrowLink } from "@/components/ui/Button";
import { ArrowUpRight } from "@/components/ui/Icons";
import { MediaImage } from "@/components/ui/MediaImage";
import { Magnetic } from "@/components/ui/Motion";

export type ServiceItem = {
  title: string;
  description: string;
  image?: string | null;
  href: string;
};

/**
 * "Services We Provide" carousel matching Figma specifications:
 * - Active expanded card has the exact Figma proportion (not overstretched),
 *   with solid red background and a white framed product mockup image on the right.
 * - Inactive cards have generous, un-congested widths (~22-24rem) with full cover mockups
 *   and white arrow circle buttons.
 * - Entire carousel track scrolls smoothly with arrows or swipe, peeking off the edge.
 */
export function ServiceCarousel({ items, ctaLabel = "Our Services" }: { items: ServiceItem[]; ctaLabel?: string }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // Arrows step to the previous / next service and open it, so they work the same on phones and desktop
  const go = (index: number) => {
    const i = Math.max(0, Math.min(items.length - 1, index));
    setActive(i);
    // Wait for the card to widen, then bring it into view
    window.setTimeout(() => {
      const card = trackRef.current?.querySelectorAll("li")[i];
      card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    }, 60);
  };
  const scroll = (direction: "left" | "right") => go(active + (direction === "left" ? -1 : 1));

  return (
    <div className="relative w-full">
      {/* Carousel Navigation Arrows with Magnetic hover */}
      <div className={`mb-3 items-center justify-end gap-2 pr-2 ${items.length > 1 ? "flex" : "hidden"}`}>
        <Magnetic strength={0.3}>
          <motion.button
            type="button"
            onClick={() => scroll("left")}
            disabled={active === 0}
            aria-label="Previous service"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="disabled:opacity-35 flex size-9 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-panel hover:text-brand shadow-xs"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        </Magnetic>
        <Magnetic strength={0.3}>
          <motion.button
            type="button"
            onClick={() => scroll("right")}
            disabled={active === items.length - 1}
            aria-label="Next service"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="disabled:opacity-35 flex size-9 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-panel hover:text-brand shadow-xs"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </Magnetic>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={trackRef}
        className="-mx-4 snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 pb-4 pt-1 [scrollbar-width:none] md:mx-0 md:scroll-px-0 md:px-0"
      >
        <ul className="flex h-[23rem] md:h-[25rem] lg:h-[26.5rem] w-max gap-4 md:gap-5 lg:gap-6 items-stretch">
          {items.map((item, i) => {
            const open = i === active;
            return (
              <li
                key={item.title}
                onPointerEnter={(e) => {
                  // Expand on hover with a mouse only; on touch screens a tap opens the card (below)
                  if (e.pointerType === "mouse") setActive(i);
                }}
                className={`relative shrink-0 snap-start overflow-hidden rounded-[24px] md:rounded-[30px] transition-[width,background-color] duration-500 ease-out shadow-sm ${
                  open
                    ? "w-[min(88vw,42rem)] md:w-[41rem] lg:w-[44rem] bg-brand-bright shadow-lg"
                    : "w-[min(68vw,20rem)] md:w-[21.5rem] lg:w-[23rem] bg-panel hover:shadow-md"
                }`}
              >
                {open ? (
                  <div className="grid h-full grid-cols-1 gap-4 p-5 md:p-7 lg:p-8 text-white sm:grid-cols-[1fr_1.05fr]">
                    {/* Left: Text & Button */}
                    <div className="flex flex-col justify-between py-1">
                      <div>
                        <h3 className="font-sans text-2xl md:text-3xl lg:text-[2rem] font-bold text-white tracking-tight leading-snug">
                          {item.title}
                        </h3>
                        <p className="mt-3 md:mt-4 max-w-[270px] md:max-w-xs font-sans text-sm md:text-base text-white/95 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <CircleArrowLink href={item.href} className="mt-6 self-start">
                        {ctaLabel}
                      </CircleArrowLink>
                    </div>

                    {/* Right: White Framed Mockup Card (as in Figma) */}
                    <div className="relative hidden h-full w-full overflow-hidden rounded-[20px] md:rounded-[24px] bg-white p-2 sm:block shadow-sm">
                      <div className="relative h-full w-full overflow-hidden rounded-[16px] md:rounded-[20px] bg-panel">
                        <MediaImage
                          src={item.image}
                          alt={item.title}
                          sizes="(min-width: 1024px) 450px, 40vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Show ${item.title}`}
                    className="group absolute inset-0 block text-left"
                  >
                    <MediaImage
                      src={item.image}
                      alt=""
                      sizes="(min-width: 1024px) 420px, 320px"
                      className="transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/35 to-transparent"
                    />
                    <span className="absolute bottom-4 left-4 right-4 flex items-center gap-3 md:bottom-6 md:left-6 md:gap-3.5">
                      <span className="flex size-10 md:size-11 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-lg transition-transform duration-300 group-hover:scale-110">
                        <ArrowUpRight className="size-4.5 transition-transform duration-300 group-hover:rotate-45" />
                      </span>
                      <span className="font-display text-base md:text-lg lg:text-xl font-bold text-white drop-shadow-sm whitespace-nowrap">
                        {item.title}
                      </span>
                    </span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
