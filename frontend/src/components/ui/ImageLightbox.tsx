"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { mediaUrl } from "@/lib/media";

export type LightboxItem = {
  src: string | null;
  title?: string;
  alt?: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
};

type Props = {
  isOpen: boolean;
  items: LightboxItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function ImageLightbox({
  isOpen,
  items,
  currentIndex,
  onClose,
  onNavigate,
}: Props) {
  const currentItem = items[currentIndex];

  const handlePrev = useCallback(() => {
    if (items.length <= 1) return;
    onNavigate((currentIndex - 1 + items.length) % items.length);
  }, [currentIndex, items.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (items.length <= 1) return;
    onNavigate((currentIndex + 1) % items.length);
  }, [currentIndex, items.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentItem) return null;

  const resolvedUrl = currentItem.src ? mediaUrl(currentItem.src) : "";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={currentItem.title || "Image view"}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
    >
      {/* Top bar: counter and close button */}
      <div
        className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-4 md:px-8 md:py-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-xs md:text-sm font-mono tracking-widest text-white/70 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
          {currentIndex + 1} / {items.length}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close image lightbox"
          className="group flex size-11 md:size-12 items-center justify-center rounded-full bg-white/10 text-white border border-white/20 transition-all duration-200 hover:bg-white hover:text-black hover:scale-105 active:scale-95 cursor-pointer"
        >
          <svg className="size-5 md:size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Prev button */}
      {items.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          aria-label="Previous image"
          className="absolute left-2 md:left-6 z-20 flex size-11 md:size-14 items-center justify-center rounded-full bg-black/50 text-white/90 border border-white/15 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-black hover:scale-105 active:scale-95 cursor-pointer"
        >
          <svg className="size-5 md:size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Main Image Container (clicks here do NOT close) */}
      <div
        className="relative z-10 flex flex-col items-center justify-center max-w-[94vw] max-h-[86vh] p-2"
        onClick={(e) => e.stopPropagation()}
      >
        {resolvedUrl && (
          <div className="relative max-w-[92vw] max-h-[76vh] flex items-center justify-center overflow-hidden rounded-xl shadow-2xl">
            <Image
              src={resolvedUrl}
              alt={currentItem.alt || currentItem.title || "Project preview"}
              width={1600}
              height={1200}
              quality={95}
              priority
              unoptimized={resolvedUrl.startsWith("/uploads/")}
              className="max-h-[76vh] max-w-[92vw] w-auto h-auto object-contain select-none"
            />
          </div>
        )}

        {/* Title / Caption below image */}
        {currentItem.title && (
          <div className="mt-4 text-center px-4 max-w-2xl">
            <h3 className="font-sans text-base md:text-xl font-medium text-white tracking-tight drop-shadow-sm">
              {currentItem.title}
            </h3>
            {currentItem.subtitle && (
              <p className="mt-1 font-serif text-xs md:text-sm text-white/70">
                {currentItem.subtitle}
              </p>
            )}
            {currentItem.actionHref && currentItem.actionLabel && (
              <a
                href={currentItem.actionHref}
                className="inline-flex items-center gap-1.5 mt-3 text-xs md:text-sm font-sans font-medium text-brand-soft hover:text-white underline underline-offset-4 transition-colors"
              >
                <span>{currentItem.actionLabel}</span>
                <span aria-hidden>→</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Next button */}
      {items.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          aria-label="Next image"
          className="absolute right-2 md:right-6 z-20 flex size-11 md:size-14 items-center justify-center rounded-full bg-black/50 text-white/90 border border-white/15 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-black hover:scale-105 active:scale-95 cursor-pointer"
        >
          <svg className="size-5 md:size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
