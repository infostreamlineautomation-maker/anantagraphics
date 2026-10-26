"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import type { StatsSettings } from "@/lib/types";

type Props = {
  stats?: StatsSettings | null;
  className?: string;
};

/**
 * Animated numerical counter that runs when the element scrolls into view.
 * Handles patterns like "10M+", "500+", "25+", "$5M", etc.
 */
function AnimatedCounter({ rawValue }: { rawValue: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });

  // Parse out prefix, numeric value, and suffix
  const match = rawValue.match(/^([^0-9.]*)([0-9.,]+)(.*)$/);
  const prefix = match ? match[1] : "";
  const numericStr = match ? match[2].replace(/,/g, "") : "";
  const targetNumber = numericStr ? parseFloat(numericStr) : 0;
  const suffix = match ? match[3] : "";
  const isFloat = numericStr.includes(".");

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!inView || targetNumber <= 0) return;

    let startTime: number | null = null;
    const duration = 1600; // ms

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo curve
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = targetNumber * ease;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(targetNumber);
      }
    };

    const animFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrame);
  }, [inView, targetNumber]);

  if (!match) {
    return <span ref={ref}>{rawValue}</span>;
  }

  const formattedNum = isFloat
    ? displayValue.toFixed(1)
    : Math.floor(displayValue).toLocaleString();

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {formattedNum}
      {suffix}
    </span>
  );
}

/**
 * Floating Impact Counters Stripe matching the capsule aesthetic:
 * - Floats overlapping the bottom boundary of the hero slideshow
 * - Solid theme red (bg-brand) matching the header nav capsule pill
 * - Smooth animated counters for Total, Cities, Projects, Clients
 * - Horizontal single-row pill layout with clean vertical dividers on all screens
 */
export function StatsStripe({ stats, className = "" }: Props) {
  let itemsToRender: { id: string; value: string; label: string }[] = [];

  if (Array.isArray(stats?.items) && stats.items.length > 0) {
    itemsToRender = stats.items
      .filter((item) => item.enabled !== false && (item.value?.trim() || item.label?.trim()))
      .map((item, idx) => ({
        id: item.id || `stat_${idx}`,
        value: item.value || "",
        label: item.label || "",
      }));
  } else {
    // Legacy fallback from flat fields
    const raw = [
      { id: "total", value: stats?.total_value || "10M+", label: stats?.total_label || "Total Pieces Crafted" },
      { id: "cities", value: stats?.cities_value || "25+", label: stats?.cities_label || "Cities Covered" },
      { id: "projects", value: stats?.projects_value || "500+", label: stats?.projects_label || "Projects Completed" },
      { id: "clients", value: stats?.clients_value || "150+", label: stats?.clients_label || "Happy Clients" },
    ];
    itemsToRender = raw.filter((r) => r.value.trim() !== "");
  }

  if (itemsToRender.length === 0) {
    return null;
  }

  const count = itemsToRender.length;

  // Size matched to header: max-w-sm / max-w-md on mobile, max-w-2xl / max-w-[820px] on desktop
  const maxWidthClass =
    count === 1
      ? "max-w-xs md:max-w-sm"
      : count === 2
      ? "max-w-xs sm:max-w-sm md:max-w-lg"
      : count === 3
      ? "max-w-md sm:max-w-lg md:max-w-2xl"
      : "max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-[820px]";

  const gridClass =
    count === 1
      ? "grid-cols-1"
      : count === 2
      ? "grid-cols-2 divide-x divide-white/20"
      : count === 3
      ? "grid-cols-3 divide-x divide-white/20"
      : count === 4
      ? "grid-cols-4 divide-x divide-white/20"
      : "grid-flow-col auto-cols-fr divide-x divide-white/20";

  return (
    <div className={`relative z-20 -mt-6 sm:-mt-7 md:-mt-8 px-3 sm:px-4 ${className}`}>
      <div className={`mx-auto ${maxWidthClass}`}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-xl md:rounded-2xl bg-brand px-2 py-2 sm:px-6 sm:py-3 md:py-3.5 md:px-7 shadow-[0_8px_24px_rgb(0_0_0/0.16)] border border-white/15 text-white"
        >
          {/* Subtle top sheen highlight */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />

          {/* Symmetrical Geometrical Counter Columns in a single horizontal row */}
          <div className={`grid ${gridClass}`}>
            {itemsToRender.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center justify-center text-center px-1 sm:px-3 md:px-4"
              >
                <div className="font-sans text-lg sm:text-2xl md:text-[1.6rem] font-bold tracking-tight text-white drop-shadow-xs leading-tight">
                  <AnimatedCounter rawValue={item.value} />
                </div>
                <div className="mt-0.5 sm:mt-1 font-sans text-[10px] sm:text-[11px] md:text-xs font-medium text-white/90 tracking-tight sm:tracking-normal leading-tight text-center">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
