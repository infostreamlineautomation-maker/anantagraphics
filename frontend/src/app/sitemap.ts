import type { MetadataRoute } from "next";

import { getWorkCategories, getWorkCategory } from "@/lib/api";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getWorkCategories();
  const details = await Promise.all(categories.map((c) => getWorkCategory(c.slug)));

  const pages = ["", "/our-work", "/about", "/contact", "/privacy", "/cookies"].map((path) => ({ url: `${SITE}${path}` }));
  const work = details.flatMap((c) =>
    c ? [{ url: `${SITE}/our-work/${c.slug}` }, ...c.projects.map((p) => ({ url: `${SITE}/our-work/${c.slug}/${p.slug}` }))] : [],
  );
  return [...pages, ...work];
}
