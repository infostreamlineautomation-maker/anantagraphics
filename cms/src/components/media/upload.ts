import { adminFetch } from "@/lib/api";
import type { Media } from "@/lib/types";

// Matches backend/app/services/media.py (content-checked server-side; SVG is not accepted)
export const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm,video/quicktime,video/ogg";
export const MAX_MB = 100;

/** Upload one image or video to the media library (AVIF images are converted to WebP by the server). */
export async function uploadImage(file: File, altText = ""): Promise<Media> {
  const isAllowedExt = /\.(jpe?g|png|webp|avif|gif|mp4|webm|mov|ogv)$/i.test(file.name);
  if (!ACCEPT.split(",").includes(file.type) && !isAllowedExt) {
    throw new Error(`${file.name}: use a JPG, PNG, WebP, AVIF, GIF image or MP4, WebM, MOV video`);
  }
  if (file.size > MAX_MB * 1024 * 1024) throw new Error(`${file.name}: larger than ${MAX_MB} MB`);
  const body = new FormData();
  body.append("file", file);
  body.append("alt_text", altText);
  return adminFetch<Media>("/media", { method: "POST", body });
}
