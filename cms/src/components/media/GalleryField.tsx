"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { move } from "@/components/ui/SortableList";
import { useToast } from "@/components/ui/Toast";
import { errorMessage } from "@/lib/hooks";
import { mediaUrl } from "@/lib/media";

import { MediaPicker } from "./MediaPicker";
import { uploadImage } from "./upload";

const isVideo = (url?: string | null) =>
  !!url && /\.(mp4|webm|ogv|mov)$/i.test(url.split("?")[0]);

/** Ordered list of images (project gallery). Drop one or more files onto it to upload and add them. */
export function GalleryField({ label, value, onChange, hint }: { label: string; value: string[]; onChange: (v: string[]) => void; hint?: string }) {
  const [open, setOpen] = useState(false);
  const [over, setOver] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const toast = useToast();

  async function upload(files: FileList) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setProgress({ done: 0, total: list.length });
    const added: string[] = [];
    for (const [i, file] of list.entries()) {
      try {
        // Show each image as soon as it's uploaded
        added.push((await uploadImage(file)).url);
        onChange([...value, ...added]);
      } catch (e) {
        toast.error(errorMessage(e));
      }
      setProgress({ done: i + 1, total: list.length });
    }
    setProgress(null);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        void upload(e.dataTransfer.files);
      }}
      className={`rounded-card transition-colors ${over ? "bg-brand-tint ring-2 ring-brand" : ""}`}
    >
      <div className="mb-1.5 flex items-center justify-between gap-4">
        <p className="text-sm font-medium">{label}</p>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)} disabled={!!progress}>
          Add image
        </Button>
      </div>
      {hint && <p className="mb-2 text-xs text-muted">{hint}</p>}
      {progress && (
        <p className="mb-2 text-sm text-brand" role="status">
          Uploading {progress.done} / {progress.total}…
        </p>
      )}
      {value.length === 0 ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-card border-2 border-dashed border-line px-4 py-8 text-center text-sm text-muted hover:border-brand"
        >
          Drop images here, or click to choose from the media library
        </button>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((url, i) => {
            const itemIsVideo = isVideo(url);
            return (
              <li key={`${url}-${i}`} className="overflow-hidden rounded-card border border-line bg-white shadow-sm">
                <div className="relative aspect-[4/3] bg-stone-900 overflow-hidden flex items-center justify-center">
                  {itemIsVideo ? (
                    <>
                      <video src={mediaUrl(url)} className="size-full object-cover pointer-events-none" muted playsInline />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white uppercase">Video</span>
                      </div>
                    </>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(url)} alt="" className="size-full object-cover" />
                  )}
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 text-xs bg-white">
                  <span className="text-muted">#{i + 1}</span>
                  <div className="flex gap-1">
                    <button type="button" aria-label="Move left" disabled={i === 0} onClick={() => onChange(move(value, i, i - 1))} className="px-1 disabled:opacity-30">
                      ←
                    </button>
                    <button
                      type="button"
                      aria-label="Move right"
                      disabled={i === value.length - 1}
                      onClick={() => onChange(move(value, i, i + 1))}
                      className="px-1 disabled:opacity-30"
                    >
                      →
                    </button>
                    <button type="button" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))} className="px-1 text-brand">
                      ✕
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <MediaPicker open={open} onClose={() => setOpen(false)} onPick={(url) => onChange([...value, url])} />
    </div>
  );
}
