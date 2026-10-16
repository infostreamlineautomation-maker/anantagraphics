"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  eyebrow?: ReactNode;  // DM Mono label: "WHAT WE CREATE", "Our Works"
  title: ReactNode;     // Domine bold, brand red
  lead?: ReactNode;     // Fenix serif line under the title
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
};

const MotionH1 = motion.h1;
const MotionH2 = motion.h2;

/** "WHAT WE CREATE / Visual ideas, made to leave a mark. / From identity and print…" */
export function SectionHeading({ eyebrow, title, lead, align = "center", as: Tag = "h2", className = "" }: Props) {
  const centered = align === "center";
  const titleProps = {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.7, delay: eyebrow ? 0.08 : 0, ease: [0.16, 1, 0.3, 1] as const },
    className: `font-display text-section font-bold text-brand ${eyebrow ? "mt-1.5" : ""}`,
  };

  return (
    <div className={`${centered ? "mx-auto max-w-5xl text-center" : ""} ${className}`}>
      {eyebrow && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] as const }}
          className="font-mono text-eyebrow tracking-[0.06em] text-ink-soft"
        >
          {eyebrow}
        </motion.p>
      )}
      {Tag === "h1" ? <MotionH1 {...titleProps}>{title}</MotionH1> : <MotionH2 {...titleProps}>{title}</MotionH2>}
      {lead && (
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] as const }}
          className={`mt-2 font-serif text-lead text-ink-soft md:mt-3 ${centered ? "mx-auto max-w-4xl" : ""}`}
        >
          {lead}
        </motion.p>
      )}
    </div>
  );
}
