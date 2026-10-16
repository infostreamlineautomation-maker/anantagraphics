"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { PlusCircle } from "@/components/ui/Icons";
import type { Faq } from "@/lib/types";

/** Numbered FAQ list with smooth spring height animation and micro-interactions. */
export function FaqAccordion({ faqs, title = "FAQs" }: { faqs: Faq[]; title?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (faqs.length === 0) return null;

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="font-sans text-section font-medium text-brand">
        {title}
      </h2>
      <div className="mt-4 flex flex-col gap-3 md:mt-6 md:gap-4">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={faq.question}
              className={`overflow-hidden rounded-lg border transition-colors duration-200 bg-white ${
                isOpen ? "border-brand shadow-xs" : "border-ink-soft/60 hover:border-ink-soft"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${i}`}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-3 text-left font-sans text-body-lg text-ink md:px-5 md:py-4 select-none"
              >
                <span className="font-medium">
                  {i + 1}. {faq.question}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="shrink-0 text-ink-soft"
                >
                  <PlusCircle className="size-5" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-answer-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                      transition: {
                        height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.25, delay: 0.05 },
                      },
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                      transition: {
                        height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.15 },
                      },
                    }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 font-sans text-body text-muted md:px-5">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
