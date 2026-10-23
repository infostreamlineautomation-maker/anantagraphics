import type { Metadata } from "next";

import { WorkCard } from "@/components/sections/WorkCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPage, getWorkCategories } from "@/lib/api";
import { pad, section, str } from "@/lib/content";

export const metadata: Metadata = {
  alternates: { canonical: "/our-work" },
  title: "Our Work",
  description: "Printed materials, packaging, signage and branded products created by Ananta Graphics.",
};

export default async function OurWorkPage() {
  const [sections, categories] = await Promise.all([getPage("our-work"), getWorkCategories()]);
  const intro = section(sections, "intro");

  return (
    <section className="container-site pt-4 pb-14 md:pb-20">
      <SectionHeading as="h1" eyebrow={str(intro, "eyebrow", "Our Works")} title={str(intro, "title", "Our Work")} lead={str(intro, "lead")} />
      <div className="w-full mt-6 grid grid-cols-2 gap-x-3.5 gap-y-7 sm:gap-x-6 sm:gap-y-10 sm:grid-cols-2 md:mt-12 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
        {categories.map((c, i) => (
          <WorkCard
            key={c.id}
            number={pad(i + 1)}
            title={c.name}
            text={c.short_description ?? undefined}
            image={c.card_image}
            href={`/our-work/${c.slug}`}
            preload={i === 0}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
