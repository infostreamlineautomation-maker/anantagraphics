"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, useInView } from "motion/react";

/** About hero stats: "360 / Brand, print and digital thinking". High-performance DOM rolling counter. */
export function StatCard({ value, label }: { value: string; label: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-30px" });

  useEffect(() => {
    if (!isInView || !numberRef.current) return;
    const match = value.match(/^([^0-9]*)(\d+)(.*)$/);
    if (!match) return;

    const prefix = match[1];
    const target = parseInt(match[2], 10);
    const suffix = match[3];

    // Set initial 0 before rolling up
    numberRef.current.textContent = `${prefix}0${suffix}`;

    const controls = animate(0, target, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        if (numberRef.current) {
          numberRef.current.textContent = `${prefix}${Math.round(latest)}${suffix}`;
        }
      },
    });

    return () => controls.stop();
  }, [isInView, value]);

  return (
    <div
      ref={containerRef}
      className="group rounded-lg border border-line bg-white px-4 py-3 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md md:px-5 md:py-4"
    >
      <p className="font-sans text-h4 font-bold text-ink transition-colors duration-200 group-hover:text-brand">
        <span ref={numberRef}>{value}</span>
      </p>
      <p className="mt-1 font-sans text-small text-muted">{label}</p>
    </div>
  );
}

function getFeatureIcon(title: string): ReactNode {
  const l = title.toLowerCase();
  if (l.includes("print")) {
    return (
      <svg className="size-5 md:size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9V2h12v7" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <path d="M6 14h12v8H6z" />
      </svg>
    );
  }
  if (l.includes("brand") || l.includes("design") || l.includes("creat")) {
    return (
      <svg className="size-5 md:size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19 7-7 3 3-7 7-3-3z" />
        <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="m2 2 7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    );
  }
  if (l.includes("format") || l.includes("sign") || l.includes("large")) {
    return (
      <svg className="size-5 md:size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h6v6" />
        <path d="M9 21H3v-6" />
        <path d="M21 3l-7 7" />
        <path d="M3 21l7-7" />
      </svg>
    );
  }
  if (l.includes("packag") || l.includes("box") || l.includes("care")) {
    return (
      <svg className="size-5 md:size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    );
  }
  return (
    <svg className="size-5 md:size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

/** Feature card: "Premium Print", "Creative Branding"… with brand theme icon box and micro-interaction hover lift. */
export function FeatureCard({ title, text, icon }: { title: string; text: string; icon?: ReactNode }) {
  const renderedIcon = icon ?? getFeatureIcon(title);
  return (
    <div className="group h-full rounded-xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-lg md:p-7">
      <span
        aria-hidden
        className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand via-brand-strong to-[#7a0e12] text-white shadow-sm shadow-brand/25 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-brand/35 md:size-12"
      >
        {renderedIcon}
      </span>
      <h3 className="mt-4 font-sans text-title font-bold text-ink transition-colors duration-200 group-hover:text-brand md:mt-5">
        {title}
      </h3>
      <p className="mt-2 font-sans text-body text-muted leading-relaxed">{text}</p>
    </div>
  );
}

/** Vision / Mission: brand theme icon box, red eyebrow, title, body copy. */
export function InfoCard({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  const isVision = title.toLowerCase().includes("vision") || eyebrow.toLowerCase().includes("vision");
  return (
    <div className="group h-full rounded-xl border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg md:p-8">
      <span
        aria-hidden
        className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand via-brand-strong to-[#7a0e12] text-white shadow-sm shadow-brand/25 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-brand/35 md:size-12"
      >
        {isVision ? (
          <svg className="size-5 md:size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg className="size-5 md:size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        )}
      </span>
      <p className="mt-4 font-sans text-body-lg font-bold uppercase tracking-wider text-brand">{eyebrow}</p>
      {/* h2: Vision / Mission follow the About hero's h1 */}
      <h2 className="font-sans text-h4 font-bold text-ink transition-colors duration-200 group-hover:text-brand">{title}</h2>
      <div className="mt-2.5 space-y-3 font-sans text-body text-ink-soft/90 leading-relaxed">{children}</div>
    </div>
  );
}

/** Capability chips: "Brand Strategy", "AI Production"… with interactive hover spring. */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-line bg-white px-3 py-2 font-sans text-body text-ink shadow-[0_1px_2px_rgb(0_0_0/0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:text-brand hover:shadow-sm cursor-default md:px-4">
      {children}
    </span>
  );
}
