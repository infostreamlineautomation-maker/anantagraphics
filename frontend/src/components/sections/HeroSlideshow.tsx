"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { MediaImage } from "@/components/ui/MediaImage";
import { Magnetic } from "@/components/ui/Motion";
import { mediaUrl } from "@/lib/media";

export type HeroSlide = {
  media: string;
  caption?: string;
  alt?: string;
};

export type HeroSlideshowProps = {
  slides?: HeroSlide[];
  fallbackImage?: string | null;
  fallbackAlt?: string;
  fallbackCaption?: string;
  autoPlayInterval?: number;
};

const isVideo = (url?: string | null): boolean =>
  !!url && /\.(mp4|webm|ogv|mov)(\?.*)?$/i.test(url.split("?")[0]);

/**
 * Full-bleed Hero Slideshow supporting Photos and Videos:
 * - Dynamic subtle Ken-Burns zoom on active photos
 * - AnimatePresence smooth captions
 * - Magnetic interactive controls and sliding active pill indicator
 */
export function HeroSlideshow({
  slides: rawSlides = [],
  fallbackImage,
  fallbackAlt = "Hero visual",
  fallbackCaption = "",
  autoPlayInterval = 6000,
}: HeroSlideshowProps) {
  const slides: HeroSlide[] =
    rawSlides.length > 0
      ? rawSlides.filter((s) => s && !!s.media)
      : fallbackImage
        ? [{ media: fallbackImage, caption: fallbackCaption, alt: fallbackAlt }]
        : [];

  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const total = slides.length;
  const hasMultiple = total > 1;

  useEffect(() => {
    if (!hasMultiple || isPaused) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [hasMultiple, isPaused, total, autoPlayInterval]);

  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === active) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [active]);

  const prev = () => setActive((curr) => (curr - 1 + total) % total);
  const next = () => setActive((curr) => (curr + 1) % total);

  if (slides.length === 0) {
    return (
      <section className="under-header relative aspect-[1728/1117] max-h-[min(88svh,42rem)] min-h-[22rem] w-full overflow-hidden bg-panel md:min-h-[28rem]" />
    );
  }

  const currentSlide = slides[active] ?? slides[0];

  return (
    <section
      className="under-header group relative aspect-[1728/1117] max-h-[min(88svh,42rem)] min-h-[22rem] w-full overflow-hidden bg-panel md:min-h-[28rem]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Hero Slideshow"
    >
      {/* Slides Container */}
      {slides.map((slide, idx) => {
        const itemIsVideo = isVideo(slide.media);
        const isActive = idx === active;

        return (
          <motion.div
            key={`${slide.media}-${idx}`}
            initial={false}
            animate={{
              opacity: isActive ? 1 : 0,
              scale: isActive && !itemIsVideo ? [1, 1.04] : 1,
            }}
            transition={{
              opacity: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: autoPlayInterval / 1000, ease: "linear" },
            }}
            className={`absolute inset-0 size-full ${
              isActive ? "z-10 pointer-events-auto" : "z-0 pointer-events-none"
            }`}
            aria-hidden={!isActive}
          >
            {itemIsVideo ? (
              <video
                ref={(el) => {
                  videoRefs.current[idx] = el;
                }}
                src={mediaUrl(slide.media)}
                autoPlay
                muted
                loop
                playsInline
                className="size-full object-cover object-[50%_88%]"
              />
            ) : (
              <MediaImage
                src={slide.media}
                alt={slide.alt || fallbackAlt}
                sizes="100vw"
                preload={idx === 0}
                className="object-[50%_88%]"
              />
            )}
          </motion.div>
        );
      })}

      {/* Slide Caption - Bottom Right with AnimatePresence */}
      <div className="absolute right-[6%] bottom-[6%] z-20 max-w-[65%] text-right font-caption text-h4 text-ink md:right-[12%] md:bottom-[7%] pointer-events-none">
        <AnimatePresence mode="wait">
          {currentSlide.caption && (
            <motion.p
              key={currentSlide.caption}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="drop-shadow-xs"
            >
              {currentSlide.caption}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Controls (Dots & Arrows) when multiple slides exist */}
      {hasMultiple && (
        <>
          {/* Bottom-left Pill / Dot Indicators */}
          <div className="absolute left-[6%] bottom-[6%] z-20 flex items-center gap-2 md:left-[12%] md:bottom-[7%]">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="relative h-2.5 flex items-center justify-center p-0.5"
              >
                <span
                  className={`block h-2 rounded-full transition-all duration-400 ${
                    i === active ? "w-8 bg-brand shadow-sm" : "w-2.5 bg-ink/35 hover:bg-ink/65"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Floating Subtle Side Navigation Arrows */}
          <div className="absolute left-4 top-1/2 z-20 -translate-y-1/2">
            <Magnetic strength={0.25}>
              <motion.button
                type="button"
                onClick={prev}
                aria-label="Previous slide"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="flex size-11 items-center justify-center rounded-full bg-surface/85 text-ink backdrop-blur-md opacity-0 transition-opacity duration-300 hover:bg-surface hover:text-brand group-hover:opacity-100 focus:opacity-100 shadow-md"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
            </Magnetic>
          </div>

          <div className="absolute right-4 top-1/2 z-20 -translate-y-1/2">
            <Magnetic strength={0.25}>
              <motion.button
                type="button"
                onClick={next}
                aria-label="Next slide"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="flex size-11 items-center justify-center rounded-full bg-surface/85 text-ink backdrop-blur-md opacity-0 transition-opacity duration-300 hover:bg-surface hover:text-brand group-hover:opacity-100 focus:opacity-100 shadow-md"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </Magnetic>
          </div>
        </>
      )}
    </section>
  );
}
