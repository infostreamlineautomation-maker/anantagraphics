"use client";

import { motion, type HTMLMotionProps, type Variants } from "motion/react";
import React, { useRef, useState } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

export interface FadeInProps extends HTMLMotionProps<"div"> {
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FadeIn({
  direction = "up",
  delay = 0,
  duration = 0.7,
  distance = 32,
  once = true,
  className = "",
  children,
  ...props
}: FadeInProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: distance, x: 0 };
      case "down":
        return { y: -distance, x: 0 };
      case "left":
        return { x: distance, y: 0 };
      case "right":
        return { x: -distance, y: 0 };
      case "none":
      default:
        return { x: 0, y: 0 };
    }
  };

  const initialPos = getInitialPosition();

  return (
    <motion.div
      initial={{ opacity: 0, ...initialPos }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-40px" }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1] as const, // Smooth luxury ease-out
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (staggerChildren = 0.12) => ({
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren: 0.05,
    },
  }),
};

export function StaggerContainer({
  children,
  stagger = 0.12,
  className = "",
  once = true,
}: {
  children: React.ReactNode;
  stagger?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-40px" }}
      custom={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function StaggerItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Magnetic button wrapper: draws the element slightly toward the cursor on hover
 * for a tactile, high-end agency micro-interaction.
 */
export function Magnetic({
  children,
  strength = 0.25,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Mouse only: on touch screens a tap would leave the element pulled off-centre (no "leave" follows)
  const handleMouseMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ref.current || e.pointerType !== "mouse") return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    setPosition({
      x: (clientX - centerX) * strength,
      y: (clientY - centerY) * strength,
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMouseMove}
      onPointerLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 180, damping: 15, mass: 0.1 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}
