/**
 * Typed readers for page-section JSON. The CMS can leave fields empty or remove items, so every
 * reader returns safe defaults instead of trusting the shape.
 */
import type { Sections } from "./types";

type Obj = Record<string, unknown>;

export function section(sections: Sections, key: string): Obj {
  const s = sections[key];
  return s && typeof s === "object" ? s : {};
}

export function str(o: Obj, key: string, fallback = ""): string {
  const v = o[key];
  return typeof v === "string" ? v : fallback;
}

export function strList(o: Obj, key: string): string[] {
  const v = o[key];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : [];
}

export function items(o: Obj, key = "items"): Obj[] {
  const v = o[key];
  return Array.isArray(v) ? v.filter((x): x is Obj => !!x && typeof x === "object") : [];
}

export function obj(o: Obj, key: string): Obj {
  const v = o[key];
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {};
}

/** Two-digit card numbers: 01, 02, … */
export const pad = (n: number) => String(n).padStart(2, "0");

/** Only same-site paths or https links from CMS content are used as hrefs. */
export function safeHref(href: string, fallback = "/"): string {
  return (href.startsWith("/") && !href.startsWith("//")) || href.startsWith("https://") ? href : fallback;
}
