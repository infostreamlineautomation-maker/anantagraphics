"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";

import { MediaImage } from "@/components/ui/MediaImage";
import { mediaUrl } from "@/lib/media";
import { safeHref, str } from "@/lib/content";

type FeaturedItem = Record<string, unknown>;

function isVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  const clean = url.split("?")[0].toLowerCase();
  return clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov") || clean.endsWith(".ogv");
}

function getInstagramShortcode(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:p|reel|reels|tv)\/([^/?#&]+)/i);
  return match ? match[1] : null;
}

/**
 * Single card in the Featured / Instagram Social strip:
 * Supports:
 * - Instagram Reels & Posts (with Instagram badge overlay & direct link or embed)
 * - Library & External Videos (autoplay, loop, sound toggle)
 * - Photos from library or external source
 */
function FeaturedCard({ item, index }: { item: FeaturedItem; index: number }) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const instagramUrl = str(item, "instagram_url") || (str(item, "href")?.includes("instagram.com") ? str(item, "href") : "");
  const isInstagram = Boolean(instagramUrl || str(item, "media_type") === "instagram");
  const shortcode = getInstagramShortcode(instagramUrl);

  const rawVideo = str(item, "video_url") || str(item, "video");
  const rawMedia = str(item, "media") || str(item, "image");
  const isVideo = str(item, "media_type") === "video" || isVideoUrl(rawVideo) || isVideoUrl(rawMedia);

  const isInsta = (u?: string | null) => !!u && (u.includes("instagram.com") || u.includes("instagr.am"));
  const cleanVideo = rawVideo && !isInsta(rawVideo) ? rawVideo : null;
  const cleanMedia = rawMedia && !isInsta(rawMedia) ? rawMedia : null;
  const videoSource = isVideo ? (cleanVideo || cleanMedia) : null;
  const rawImg = !isVideo ? (cleanMedia || str(item, "image")) : str(item, "poster");
  const imageSource = rawImg && !isInsta(rawImg) ? rawImg : null;
  const altText = str(item, "caption") || str(item, "image_alt") || (isInstagram ? "Ananta Graphics Instagram post" : `Featured work drop ${index + 1}`);

  // If it's an Instagram post and href is empty, default to the Instagram link
  const targetHref = str(item, "href") || instagramUrl || "/our-work";
  const isExternal = targetHref.startsWith("http://") || targetHref.startsWith("https://");

  const toggleSound = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const content = (
    <div className="relative w-full h-full overflow-hidden bg-panel">
      {/* Video element */}
      {videoSource ? (
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            src={mediaUrl(videoSource)}
            poster={imageSource ? mediaUrl(imageSource) : undefined}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
            className="absolute bottom-3 right-3 z-30 flex size-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all duration-200 hover:bg-black/90 hover:scale-110 active:scale-95"
          >
            {isMuted ? (
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        </div>
      ) : imageSource ? (
        /* Image element */
        <MediaImage
          src={imageSource}
          alt={altText}
          sizes="(min-width: 1024px) 460px, (min-width: 768px) 380px, 75vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : isInstagram && shortcode ? (
        /* Clean Instagram Embed — cropped to hide "View profile" and fit the exact card size */
        <div className="relative size-full overflow-hidden bg-stone-950 flex items-center justify-center">
          <iframe
            src={`https://www.instagram.com/p/${shortcode}/embed/`}
            className="absolute -top-[58px] left-1/2 -translate-x-1/2 w-[calc(100%+36px)] min-w-[340px] h-[calc(100%+145px)] border-0 pointer-events-none select-none"
            allowTransparency
            scrolling="no"
            title={altText}
          />
        </div>
      ) : (
        <div className="size-full bg-stone-900 flex items-center justify-center text-white/50 text-xs">
          No preview
        </div>
      )}

      {/* Instagram Badge Overlay */}
      {isInstagram && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#f09433]/90 via-[#dc2743]/90 to-[#bc1888]/90 px-3 py-1.5 text-[0.75rem] font-semibold text-white shadow-lg backdrop-blur-md border border-white/20">
          <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          <span className="tracking-wide">Reel</span>
        </div>
      )}

      {/* Caption overlay on hover if present */}
      {str(item, "caption") && (
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="font-sans text-sm font-medium line-clamp-2">
            {str(item, "caption")}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <motion.li
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.25, ease: "easeOut" } }}
      className="group relative w-[76vw] sm:w-[44vw] md:w-full shrink-0 md:shrink aspect-[661/962] overflow-hidden rounded-[20px] md:rounded-[26px] bg-panel shadow-sm transition-shadow duration-500 hover:shadow-2xl"
    >
      {isExternal ? (
        <a
          href={targetHref}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full w-full"
          aria-label={altText}
        >
          {content}
        </a>
      ) : (
        <Link
          href={safeHref(targetHref, "/our-work")}
          className="block h-full w-full"
          aria-label={altText}
        >
          {content}
        </Link>
      )}
    </motion.li>
  );
}

/**
 * Featured Work Strip directly below "Our Clients":
 * Supports Instagram video posts/reels, library & external videos, and photos.
 */
export function FeaturedStrip({ images }: { images: FeaturedItem[] }) {
  if (!images || images.length === 0) return null;

  return (
    <section className="container-site pb-12 md:pb-20" aria-label="Featured work and social feed">
      <div className="-mx-4 overflow-x-auto px-4 pb-4 pt-1 [scrollbar-width:none] scroll-smooth md:mx-0 md:px-0 md:overflow-visible">
        <ul className="flex gap-4 sm:gap-5 md:grid md:grid-cols-3 md:gap-6 lg:gap-8 w-max md:w-full items-center">
          {images.map((item, i) => (
            <FeaturedCard
              key={`${str(item, "image") || str(item, "video_url") || str(item, "instagram_url")}-${i}`}
              item={item}
              index={i}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
