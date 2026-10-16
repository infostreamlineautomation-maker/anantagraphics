const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

/**
 * Resolve a stored media path to a URL. CMS uploads ("/uploads/...") live on the API host;
 * other root paths are the website's own public/ files; absolute URLs pass through.
 */
export function mediaUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return p.startsWith("/uploads/") ? `${API_URL}${p}` : p;
}
