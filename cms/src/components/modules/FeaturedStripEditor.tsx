"use client";

import { useState } from "react";
import { ImageField } from "@/components/media/ImageField";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { move } from "@/components/ui/SortableList";
import { useToast } from "@/components/ui/Toast";
import { adminFetch } from "@/lib/api";
import { errorMessage } from "@/lib/hooks";
import type { JsonObject, JsonValue } from "@/lib/types";

type FeaturedItem = {
  media_type?: "instagram" | "video" | "image";
  instagram_url?: string;
  media?: string;
  video_url?: string;
  image?: string;
  poster?: string;
  caption?: string;
  image_alt?: string;
  href?: string;
  [key: string]: JsonValue | undefined;
};

type Props = {
  value: JsonObject;
  onChange: (value: JsonObject) => void;
};

function detectType(item: FeaturedItem): "instagram" | "video" | "image" {
  if (item.media_type) return item.media_type;
  if (item.instagram_url || item.href?.includes("instagram.com")) return "instagram";
  const url = (item.video_url || item.media || item.video || "") as string;
  if (/\.(mp4|webm|mov|ogv)$/i.test(url.split("?")[0])) return "video";
  return "image";
}

function filterOutInsta(val: unknown): string | null {
  if (typeof val !== "string" || !val) return null;
  if (val.includes("instagram.com") || val.includes("instagr.am")) return null;
  return val;
}

export function FeaturedStripEditor({ value, onChange }: Props) {
  const toast = useToast();
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const rawItems = Array.isArray(value.items) ? (value.items as FeaturedItem[]) : [];

  const updateItem = (index: number, patch: Partial<FeaturedItem>) => {
    const next = rawItems.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange({ ...value, items: next as unknown as JsonValue[] });
  };

  const handleDownloadReel = async (index: number) => {
    const item = rawItems[index];
    const url = (item?.instagram_url as string) || (item?.href?.includes("instagram.com") ? (item.href as string) : "");
    if (!url) {
      toast.error("Please enter an Instagram post or reel link first");
      return;
    }
    setDownloadingIndex(index);
    try {
      const res = await adminFetch<{ video_url?: string; poster_url?: string; caption?: string }>("/media/instagram-fetch", {
        method: "POST",
        body: JSON.stringify({ url }),
      });
      updateItem(index, {
        media: res.video_url || "",
        video_url: res.video_url || "",
        poster: res.poster_url || "",
        image: res.poster_url || "",
        caption: item.caption || res.caption || "",
      });
      toast.success("Reel video downloaded and ready to autoplay!");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setDownloadingIndex(null);
    }
  };

  const addItem = () => {
    const newItem: FeaturedItem = {
      media_type: "instagram",
      instagram_url: "",
      media: "",
      caption: "",
      href: "",
      image_alt: "",
    };
    onChange({ ...value, items: [...rawItems, newItem] as unknown as JsonValue[] });
  };

  const removeItem = (index: number) => {
    const next = rawItems.filter((_, i) => i !== index);
    onChange({ ...value, items: next as unknown as JsonValue[] });
  };

  const moveItem = (from: number, to: number) => {
    const next = move(rawItems, from, to);
    onChange({ ...value, items: next as unknown as JsonValue[] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div>
          <h4 className="text-sm font-semibold text-ink">Featured Work & Social Feed Strip</h4>
          <p className="text-xs text-muted">
            Display Instagram reels/posts, videos from your media library or external URLs, and photos.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={addItem}>
          + Add New Card
        </Button>
      </div>

      <ol className="space-y-5">
        {rawItems.map((item, i) => {
          const type = detectType(item);

          return (
            <li key={i} className="rounded-card border border-line bg-cream/60 p-4 md:p-5">
              {/* Header with Type Badge, Reordering and Remove */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-6 items-center justify-center rounded-full bg-line text-xs font-bold text-ink">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {item.caption || item.image_alt || (type === "instagram" ? "Instagram Reel / Post" : type === "video" ? "Video Post" : "Photo Card")}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${
                      type === "instagram"
                        ? "bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white"
                        : type === "video"
                        ? "bg-slate-800 text-white"
                        : "bg-stone-200 text-stone-800"
                    }`}
                  >
                    {type === "instagram" ? "Instagram" : type === "video" ? "Video" : "Photo"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => moveItem(i, i - 1)}
                    className="px-2 py-1 rounded bg-surface border border-line disabled:opacity-30 hover:bg-stone-50"
                  >
                    ▲ Up
                  </button>
                  <button
                    type="button"
                    disabled={i === rawItems.length - 1}
                    onClick={() => moveItem(i, i + 1)}
                    className="px-2 py-1 rounded bg-surface border border-line disabled:opacity-30 hover:bg-stone-50"
                  >
                    ▼ Down
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="ml-2 text-brand font-medium hover:underline text-xs"
                  >
                    Remove Card
                  </button>
                </div>
              </div>

              {/* Type Selection Tabs */}
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xs font-medium text-muted mr-1">Source Type:</span>
                {(["instagram", "video", "image"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateItem(i, { media_type: t })}
                    className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                      type === t
                        ? "bg-brand text-white border-brand shadow-xs"
                        : "bg-surface text-ink border-line hover:border-brand"
                    }`}
                  >
                    {t === "instagram" ? "📱 Instagram Post / Reel" : t === "video" ? "🎬 Video (File or URL)" : "📸 Photo"}
                  </button>
                ))}
              </div>

              {/* Dynamic Form Fields based on Type */}
              <div className="space-y-4">
                {type === "instagram" && (
                  <>
                    <Field
                      label="Instagram Post / Reel URL"
                      hint="Paste any Instagram link. Click '⚡ Download Video' to automatically download and cache the MP4 video for edge-to-edge autoplay!"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          type="url"
                          placeholder="https://www.instagram.com/reel/..."
                          value={(item.instagram_url as string) || (item.href?.includes("instagram.com") ? (item.href as string) : "")}
                          onChange={(e) => updateItem(i, { instagram_url: e.target.value, href: item.href || e.target.value })}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownloadReel(i)}
                          disabled={downloadingIndex === i}
                          className="shrink-0 whitespace-nowrap font-medium"
                        >
                          {downloadingIndex === i ? "⏳ Downloading…" : "⚡ Download Video"}
                        </Button>
                      </div>
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <ImageField
                        label="Reel Video or Preview Photo (from Library or Upload)"
                        value={filterOutInsta(item.media) || filterOutInsta(item.image) || filterOutInsta(item.video_url)}
                        onChange={(url) => updateItem(i, { media: url ?? "", image: url ?? "" })}
                        hint="Upload the MP4 video or thumbnail preview for super fast native playback"
                        aspect="aspect-[661/962]"
                      />

                      <div className="space-y-3">
                        <Field label="Or External Video / Media URL">
                          <Input
                            type="url"
                            placeholder="https://.../video.mp4"
                            value={(item.video_url as string) || ""}
                            onChange={(e) => updateItem(i, { video_url: e.target.value })}
                          />
                        </Field>

                        <Field label="Caption / Overlay Text">
                          <Input
                            placeholder="e.g. Custom packaging drop on @anantagraphics"
                            value={(item.caption as string) || (item.image_alt as string) || ""}
                            onChange={(e) => updateItem(i, { caption: e.target.value, image_alt: e.target.value })}
                          />
                        </Field>

                        <Field label="Click-through Link" hint="Defaults to the Instagram post if left blank">
                          <Input
                            placeholder="https://www.instagram.com/..."
                            value={(item.href as string) || ""}
                            onChange={(e) => updateItem(i, { href: e.target.value })}
                          />
                        </Field>
                      </div>
                    </div>
                  </>
                )}

                {type === "video" && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <ImageField
                        label="Video File (from Media Library or Upload)"
                        value={filterOutInsta(item.media || item.video_url)}
                        onChange={(url) => updateItem(i, { media: url ?? "", video_url: url ?? "" })}
                        hint="Supports MP4, WebM, MOV"
                        aspect="aspect-[661/962]"
                      />

                      <div className="space-y-3">
                        <Field label="Or External Video URL">
                          <Input
                            type="url"
                            placeholder="https://.../video.mp4"
                            value={(item.video_url as string) || ""}
                            onChange={(e) => updateItem(i, { video_url: e.target.value })}
                          />
                        </Field>

                        <ImageField
                          label="Cover Poster Image (Optional)"
                          value={filterOutInsta(item.poster || item.image)}
                          onChange={(url) => updateItem(i, { poster: url ?? "" })}
                        />

                        <Field label="Caption / Description">
                          <Input
                            placeholder="e.g. Behind the scenes printing packaging"
                            value={(item.caption as string) || (item.image_alt as string) || ""}
                            onChange={(e) => updateItem(i, { caption: e.target.value, image_alt: e.target.value })}
                          />
                        </Field>

                        <Field label="Click-through Link">
                          <Input
                            placeholder="/our-work/packaging or https://..."
                            value={(item.href as string) || ""}
                            onChange={(e) => updateItem(i, { href: e.target.value })}
                          />
                        </Field>
                      </div>
                    </div>
                  </>
                )}

                {type === "image" && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <ImageField
                        label="Photo (from Media Library or Upload)"
                        value={filterOutInsta(item.image || item.media)}
                        onChange={(url) => updateItem(i, { image: url ?? "", media: url ?? "" })}
                        aspect="aspect-[661/962]"
                      />

                      <div className="space-y-3">
                        <Field label="Or External Image URL">
                          <Input
                            type="url"
                            placeholder="https://.../photo.jpg"
                            value={(item.media && !item.media.startsWith("/") ? item.media : "") as string}
                            onChange={(e) => updateItem(i, { image: e.target.value, media: e.target.value })}
                          />
                        </Field>

                        <Field label="Alt Text / Caption">
                          <Input
                            placeholder="e.g. Mirél dessert gift box"
                            value={(item.image_alt as string) || (item.caption as string) || ""}
                            onChange={(e) => updateItem(i, { image_alt: e.target.value, caption: e.target.value })}
                          />
                        </Field>

                        <Field label="Click-through Link">
                          <Input
                            placeholder="/our-work/packaging"
                            value={(item.href as string) || ""}
                            onChange={(e) => updateItem(i, { href: e.target.value })}
                          />
                        </Field>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
