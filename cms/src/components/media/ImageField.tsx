"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { errorMessage } from "@/lib/hooks";
import { mediaUrl } from "@/lib/media";

import { MediaPicker } from "./MediaPicker";
import { uploadImage } from "./upload";

const isVideo = (url?: string | null) =>
  !!url && /\.(mp4|webm|ogv|mov)$/i.test(url.split("?")[0]);

const isInstagram = (url?: string | null) =>
  !!url && (url.includes("instagram.com") || url.includes("instagr.am"));

/**
 * Single image from the media library (stores the /uploads/... path). Drop a file onto the box to upload
 * it straight away (with an instant preview), or click the box / "Choose image" to pick from the library.
 */
export function ImageField({
  label,
  value,
  onChange,
  hint,
  aspect = "aspect-[4/3]",
}: {
  label: string;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  hint?: string;
  aspect?: string;
}) {
  const [open, setOpen] = useState(false);
  const [over, setOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null); // local file shown while it uploads
  const toast = useToast();
  const itemIsVideo = isVideo(value);
  const itemIsInstagram = isInstagram(value);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  async function upload(file: File | undefined) {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    try {
      const media = await uploadImage(file);
      onChange(media.url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setPreview(null);
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            void upload(e.dataTransfer.files[0]);
          }}
          aria-label={value ? `Change ${label}` : `Choose ${label}`}
          className={`relative w-40 shrink-0 overflow-hidden rounded-card border-2 bg-cream transition-colors ${aspect} ${
            over ? "border-brand bg-brand-tint" : value ? "border-line" : "border-dashed border-line hover:border-brand"
          }`}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not optimisable
            <img src={preview} alt="" className="size-full object-cover opacity-60" />
          ) : value ? (
            itemIsVideo ? (
              <div className="relative flex size-full items-center justify-center bg-stone-900">
                <video src={mediaUrl(value)} className="pointer-events-none size-full object-cover" muted playsInline />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white uppercase">Video</span>
                </div>
              </div>
            ) : itemIsInstagram ? (
              <div className="relative flex size-full flex-col items-center justify-center bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-2 text-white">
                <span className="text-xl">📷</span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-center line-clamp-1">Instagram</span>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- handles local uploads and any external URL without host restriction
              <img src={mediaUrl(value)} alt="" className="size-full object-cover" />
            )
          ) : (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 text-center text-xs text-muted">
              <span className="text-lg" aria-hidden>
                ⬆
              </span>
              Drop an image here or click to choose
            </span>
          )}
          {preview && (
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-ink">Uploading…</span>
          )}
        </button>
        <div className="flex flex-col gap-2">
          <Button size="sm" variant="secondary" onClick={() => setOpen(true)} disabled={!!preview}>
            {value ? "Change" : "Choose image"}
          </Button>
          {value && (
            <Button size="sm" variant="ghost" onClick={() => onChange(null)} disabled={!!preview}>
              Remove
            </Button>
          )}
          {hint && <p className="max-w-[220px] text-xs text-muted">{hint}</p>}
        </div>
      </div>
      <MediaPicker open={open} onClose={() => setOpen(false)} onPick={(url) => onChange(url)} />
    </div>
  );
}
