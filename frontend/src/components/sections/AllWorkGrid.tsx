"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MediaImage } from "@/components/ui/MediaImage";
import type { ExploreCard } from "@/lib/types";

type Props = {
  projects: ExploreCard[];
  categories: { slug: string; name: string }[];
};

export function AllWorkGrid({ projects, categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    if (selectedCategory === "all") return projects;
    return projects.filter((p) => p.category_slug === selectedCategory);
  }, [projects, selectedCategory]);

  return (
    <div>
      {/* Category Filter Tabs */}
      <div className="mb-6 sm:mb-8 flex items-center gap-2 pb-3 overflow-x-auto scrollbar-none sm:flex-wrap border-b border-line/60">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === "all"
              ? "bg-brand text-white shadow-xs"
              : "bg-panel text-ink-soft hover:bg-line/40 hover:text-ink"
          }`}
        >
          All ({projects.length})
        </button>
        {categories.map((c) => {
          const count = projects.filter((p) => p.category_slug === c.slug).length;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => setSelectedCategory(c.slug)}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === c.slug
                  ? "bg-brand text-white shadow-xs"
                  : "bg-panel text-ink-soft hover:bg-line/40 hover:text-ink"
              }`}
            >
              {c.name} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Grid of Work Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted font-serif">
          No projects found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:gap-6 lg:grid-cols-3 md:gap-8">
          {filtered.map((p, i) => (
            <Link
              key={`${p.category_slug}-${p.slug}-${p.id || i}`}
              href={`/our-work/${p.category_slug}/${p.slug}`}
              className="group block transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative w-full aspect-square overflow-hidden rounded-media bg-panel shadow-sm transition-shadow duration-300 group-hover:shadow-xl">
                <MediaImage
                  src={p.cover_image}
                  alt={p.title}
                  sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 48vw"
                  preload={i < 4}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
                  <span className="rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-1 text-[10px] sm:text-xs font-medium text-white shadow-xs">
                    {p.category_name}
                  </span>
                </div>
              </div>
              <div className="mt-2.5 sm:mt-3 px-0.5">
                <h3 className="font-sans text-sm sm:text-base md:text-h4 font-medium text-ink transition-colors group-hover:text-brand line-clamp-1">
                  {p.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
