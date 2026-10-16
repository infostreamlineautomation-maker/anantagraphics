import { getWorkCategories, getWorkCategory } from "./api";

/** Placeholder param so `next build` succeeds when the API has no data (Cache Components needs ≥ 1). */
export const PLACEHOLDER = "__placeholder__";

export async function categoryParams(): Promise<{ category: string }[]> {
  const categories = await getWorkCategories();
  return categories.length > 0 ? categories.map((c) => ({ category: c.slug })) : [{ category: PLACEHOLDER }];
}

export async function projectParams(): Promise<{ category: string; project: string }[]> {
  const categories = await getWorkCategories();
  const details = await Promise.all(categories.map((c) => getWorkCategory(c.slug)));
  const params = details.flatMap((c) => (c ? c.projects.map((p) => ({ category: c.slug, project: p.slug })) : []));
  return params.length > 0 ? params : [{ category: PLACEHOLDER, project: PLACEHOLDER }];
}
