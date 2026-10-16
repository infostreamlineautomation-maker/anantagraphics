"use cache";

// Server-side data access for the public API. Every function is cached and tagged; after CMS edits
// the admin API calls /api/revalidate with the same tags (backend/app/routers/admin). When the API is
// unreachable the site falls back to the defaults below, cached only briefly.
import { cacheLife, cacheTag } from "next/cache";

import type {
  Client,
  Faq,
  PageKey,
  ProjectDetail,
  Sections,
  Service,
  Settings,
  WorkCategoryCard,
  WorkCategoryDetail,
} from "./types";

const API = (process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

const DEFAULT_SETTINGS: Settings = {
  brand: {
    name: "Ananta Graphics",
    logo: "/logo.png",
    logo_badge: "/logo-badge.png",
    tagline: "Ideas with passion and purpose",
  },
  contact: {
    phone: "773-365-1240",
    email: "office@anantagraphics.com",
    address: "LG-04, Hiral Arcade, Opp. New Court, Athwalines, Surat 395 007, Gujarat, India",
    map_url: "https://www.google.com/maps/search/?api=1&query=Hiral+Arcade+Athwalines+Surat",
  },
  socials: {},
  footer: {
    tagline: "Let’s build brand, print and digital experiences that feel premium everywhere.",
    newsletter_text: "First access to launches, campaigns, and studio drops.",
    copyright: "© 2026 Ananta Graphics. All Rights Reserved.",
  },
  seo: {
    default_title: "Ananta Graphics | Design, Print & Packaging",
    default_description:
      "Ananta Graphics helps businesses bring brand ideas to life through design, printing, packaging, signage and corporate gifting.",
  },
};

type Result<T> = { ok: true; data: T } | { ok: false; status: number };

async function get<T>(path: string): Promise<Result<T>> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      if (res.status !== 404) console.warn(`[API] ${path} returned ${res.status}`);
      return { ok: false, status: res.status };
    }
    return { ok: true, data: (await res.json()) as T };
  } catch (err) {
    console.warn(`[API] Could not fetch ${path} from ${API} (${err}).`);
    return { ok: false, status: 0 };
  }
}

/**
 * Cache a successful answer (or a real 404) for hours; an API outage only for minutes, so the site
 * recovers on its own. ("seconds" would make every page dynamic.)
 */
function life(r: Result<unknown>) {
  if (r.ok || r.status === 404) cacheLife("hours");
  else cacheLife("minutes");
}

export async function getSettings(): Promise<Settings> {
  cacheTag("settings");
  const r = await get<Partial<Settings>>("/settings");
  life(r);
  if (!r.ok) return DEFAULT_SETTINGS;
  // Merge per group so a half-filled CMS settings record never blanks the header/footer
  const d = r.data;
  return {
    brand: { ...DEFAULT_SETTINGS.brand, ...d.brand },
    contact: { ...DEFAULT_SETTINGS.contact, ...d.contact },
    socials: d.socials ?? DEFAULT_SETTINGS.socials,
    footer: { ...DEFAULT_SETTINGS.footer, ...d.footer },
    seo: { ...DEFAULT_SETTINGS.seo, ...d.seo },
  };
}

export async function getPage(page: PageKey): Promise<Sections> {
  cacheTag(`page:${page}`);
  const r = await get<{ sections: Sections }>(`/pages/${page}`);
  life(r);
  return r.ok ? r.data.sections : {};
}

export async function getWorkCategories(): Promise<WorkCategoryCard[]> {
  cacheTag("work");
  const r = await get<WorkCategoryCard[]>("/work-categories");
  life(r);
  return r.ok ? r.data : [];
}

export async function getWorkCategory(slug: string): Promise<WorkCategoryDetail | null> {
  cacheTag("work", `work-category:${slug}`);
  const r = await get<WorkCategoryDetail>(`/work-categories/${encodeURIComponent(slug)}`);
  life(r);
  return r.ok ? r.data : null;
}

export async function getProject(slug: string): Promise<ProjectDetail | null> {
  cacheTag("projects", `project:${slug}`);
  const r = await get<ProjectDetail>(`/projects/${encodeURIComponent(slug)}`);
  life(r);
  return r.ok ? r.data : null;
}

export async function getServices(): Promise<Service[]> {
  cacheTag("services");
  const r = await get<Service[]>("/services");
  life(r);
  return r.ok ? r.data : [];
}

export async function getClients(): Promise<Client[]> {
  cacheTag("clients");
  const r = await get<Client[]>("/clients");
  life(r);
  return r.ok ? r.data : [];
}

export async function getFaqs(): Promise<Faq[]> {
  cacheTag("faqs");
  const r = await get<Faq[]>("/faqs");
  life(r);
  return r.ok ? r.data : [];
}
